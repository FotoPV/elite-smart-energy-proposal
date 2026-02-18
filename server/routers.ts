import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { storagePut, storageGet } from "./storage";
import { extractElectricityBillData, validateElectricityBillData } from "./billExtraction";
import { generateFullCalculations, calculateInverterSize, averageBills } from "./calculations";
import { generateSlides, generateSlideHTML, type ProposalData, type SlideContent } from './slideGenerator';
import { narrativeExecutiveSummary, narrativeBillAnalysis, narrativeUsageAnalysis, narrativeYearlyProjection, narrativeStrategicAssessment, narrativeBatteryOption, narrativeVPPRecommendation, narrativeInvestmentAnalysis, narrativeEnvironmentalImpact, narrativeFinalRecommendation, narrativeRoadmap } from './slideNarrative';
import { generatePptx } from "./pptxGenerator";
import { generatePdf as generateNativePdf } from "./pdfGenerator";
import { nanoid } from "nanoid";
import { initProgress, updateSlideProgress, setGenerationStatus, getProgress, clearProgress } from "./generationProgress";
import { eq } from "drizzle-orm";
import sharp from "sharp";
import { customerDocuments as docsTable } from "../drizzle/schema";
import { applyFallbackCostEstimates, calculateCableRunCostItem } from './switchboardAnalysis';

/**
 * Helper: Fetch all electricity bills for a customer and return an averaged Bill.
 * Falls back to the single primary bill if only one exists.
 */
async function getAveragedElectricityBill(customerId: number, primaryBillId: number) {
  const allBills = await db.getBillsByCustomerId(customerId);
  const elecBills = allBills.filter(b => b.billType === 'electricity');
  if (elecBills.length === 0) {
    // Fallback: just get the primary
    const primary = await db.getBillById(primaryBillId);
    if (!primary) throw new TRPCError({ code: 'NOT_FOUND', message: 'Electricity bill not found' });
    return primary;
  }
  // Ensure the primary bill is first in the array
  const primaryFirst = elecBills.sort((a, b) => {
    if (a.id === primaryBillId) return -1;
    if (b.id === primaryBillId) return 1;
    return 0;
  });
  return averageBills(primaryFirst);
}

// ============================================
// ADMIN PROCEDURE
// ============================================

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

// ============================================
// BATCH PROGRESS STORE
// ============================================

interface BatchProgress {
  total: number;
  completed: number;
  failed: number;
  current: { id: number; title: string } | null;
  results: Array<{ id: number; title: string; status: string; slideCount?: number }>;
  status: 'running' | 'complete' | 'error';
}

const batchProgressStore = new Map<string, BatchProgress>();

// ============================================
// APP ROUTER
// ============================================

export const appRouter = router({
  system: systemRouter,
  
  // ============================================
  // AUTH ROUTES
  // ============================================
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),



  // ============================================
  // IMAGE PROXY (bypasses CORS for PDF rendering)
  // ============================================
  imageProxy: router({
    toBase64: protectedProcedure
      .input(z.object({ url: z.string().url() }))
      .mutation(async ({ input }) => {
        try {
          const response = await fetch(input.url);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const buffer = await response.arrayBuffer();
          const contentType = response.headers.get('content-type') || 'image/jpeg';
          const base64 = Buffer.from(buffer).toString('base64');
          return { dataUri: `data:${contentType};base64,${base64}` };
        } catch (e: any) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: `Failed to proxy image: ${e.message}` });
        }
      }),
  }),

  // ============================================
  // CUSTOMER ROUTES
  // ============================================
  customers: router({
    list: protectedProcedure
      .input(z.object({ search: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return db.searchCustomers(ctx.user.id, input?.search);
      }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const customer = await db.getCustomerById(input.id);
        if (!customer) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Customer not found' });
        }
        return customer;
      }),
    
    create: protectedProcedure
      .input(z.object({
        fullName: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().min(1),
        state: z.string().min(2).max(3),
        hasPool: z.boolean().optional(),
        poolVolume: z.number().optional(),
        hasEV: z.boolean().optional(),
        evInterest: z.enum(['none', 'interested', 'owns']).optional(),
        existingSolar: z.enum(['none', 'under_5_years', 'over_5_years']).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createCustomer({
          ...input,
          userId: ctx.user.id,
        });
        return { id };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        fullName: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().min(1).optional(),
        state: z.string().min(2).max(3).optional(),
        hasPool: z.boolean().optional(),
        poolVolume: z.number().optional(),
        hasEV: z.boolean().optional(),
        evInterest: z.enum(['none', 'interested', 'owns']).optional(),
        existingSolar: z.enum(['none', 'under_5_years', 'over_5_years']).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateCustomer(id, {
          ...data,
        });
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteCustomer(input.id);
        return { success: true };
      }),
  }),

  // ============================================
  // BILL ROUTES
  // ============================================
  bills: router({
    listByCustomer: protectedProcedure
      .input(z.object({ customerId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getBillsByCustomerId(input.customerId);
      }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const bill = await db.getBillById(input.id);
        if (!bill) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Bill not found' });
        }
        return bill;
      }),
    
    upload: protectedProcedure
      .input(z.object({
        customerId: z.number(),
        billType: z.enum(['electricity']),
        fileData: z.string(), // Base64 encoded
        fileName: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Upload file to S3
        const fileBuffer = Buffer.from(input.fileData, 'base64');
        const fileKey = `bills/${input.customerId}/${nanoid()}-${input.fileName}`;
        const { url: fileUrl } = await storagePut(fileKey, fileBuffer, 'application/pdf');
        
        // Create bill record
        const billId = await db.createBill({
          customerId: input.customerId,
          billType: input.billType,
          fileUrl,
          fileKey,
          fileName: input.fileName,
        });
        
        return { id: billId, fileUrl };
      }),
    
    extract: protectedProcedure
      .input(z.object({ billId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const bill = await db.getBillById(input.billId);
        if (!bill || !bill.fileUrl) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Bill not found or no file uploaded' });
        }
        
        try {
          if (bill.billType === 'electricity') {
            const data = await extractElectricityBillData(bill.fileUrl);
            const validation = validateElectricityBillData(data);
            
            await db.updateBill(input.billId, {
              retailer: data.retailer,
              billingPeriodStart: data.billingPeriodStart ? new Date(data.billingPeriodStart) : undefined,
              billingPeriodEnd: data.billingPeriodEnd ? new Date(data.billingPeriodEnd) : undefined,
              billingDays: data.billingDays,
              totalAmount: data.totalAmount?.toString(),
              dailySupplyCharge: data.dailySupplyCharge?.toString(),
              totalUsageKwh: data.totalUsageKwh?.toString(),
              peakUsageKwh: data.peakUsageKwh?.toString(),
              offPeakUsageKwh: data.offPeakUsageKwh?.toString(),
              shoulderUsageKwh: data.shoulderUsageKwh?.toString(),
              solarExportsKwh: data.solarExportsKwh?.toString(),
              peakRateCents: data.peakRateCents?.toString(),
              offPeakRateCents: data.offPeakRateCents?.toString(),
              shoulderRateCents: data.shoulderRateCents?.toString(),
              feedInTariffCents: data.feedInTariffCents?.toString(),
              rawExtractedData: data.rawData,
              extractionConfidence: data.extractionConfidence?.toString(),
            });
            
            return { success: true, data, validation };
          } else {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Gas bills are not supported' });
          }
        } catch (error) {
          throw new TRPCError({ 
            code: 'INTERNAL_SERVER_ERROR', 
            message: `Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
          });
        }
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        retailer: z.string().optional(),
        billingDays: z.number().optional(),
        totalAmount: z.number().optional(),
        dailySupplyCharge: z.number().optional(),
        totalUsageKwh: z.number().optional(),
        peakUsageKwh: z.number().optional(),
        offPeakUsageKwh: z.number().optional(),
        shoulderUsageKwh: z.number().optional(),
        solarExportsKwh: z.number().optional(),
        peakRateCents: z.number().optional(),
        offPeakRateCents: z.number().optional(),
        shoulderRateCents: z.number().optional(),
        feedInTariffCents: z.number().optional(),
        gasUsageMj: z.number().optional(),
        gasRateCentsMj: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        const updateData: Record<string, unknown> = {};
        
        for (const [key, value] of Object.entries(data)) {
          if (value !== undefined) {
            updateData[key] = typeof value === 'number' ? value.toString() : value;
          }
        }
        
        await db.updateBill(id, updateData as any);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteBill(input.id);
        return { success: true };
      }),
  }),

  // ============================================
  // PROPOSAL ROUTES
  // ============================================
  proposals: router({
    list: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        search: z.string().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return db.searchProposals(ctx.user.id, input);
      }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const proposal = await db.getProposalById(input.id);
        if (!proposal) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Proposal not found' });
        }
        return proposal;
      }),
    
    getByCustomer: protectedProcedure
      .input(z.object({ customerId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getProposalsByCustomerId(input.customerId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        customerId: z.number(),
        title: z.string().optional(),
        electricityBillId: z.number().optional(),
        proposalNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const customer = await db.getCustomerById(input.customerId);
        if (!customer) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Customer not found' });
        }
        
        const id = await db.createProposal({
          customerId: input.customerId,
          userId: ctx.user.id,
          title: input.title || `Proposal for ${customer.fullName}`,
          electricityBillId: input.electricityBillId,
          proposalNotes: input.proposalNotes || null,
          status: 'draft',
        });
        
        // Auto-calculate only (NO old template slides) — LLM progressive generation happens on ProposalDetail
        if (input.electricityBillId) {
          try {
            const electricityBill = await getAveragedElectricityBill(input.customerId, input.electricityBillId);
            if (electricityBill) {
              const vppProviders = await db.getVppProvidersByState(customer.state);
              const rebates = await db.getRebatesByState(customer.state);
              const calculations = generateFullCalculations(customer, electricityBill, null, vppProviders, rebates);
              
              await db.updateProposal(id, {
                calculations,
                status: 'draft', // stays draft — no slides yet, LLM generation triggered on detail page
              });
            }
          } catch (e) {
            console.error('Auto-calculate failed:', e);
          }
        }
        
        return { id };
      }),
    
    calculate: protectedProcedure
      .input(z.object({ proposalId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const proposal = await db.getProposalById(input.proposalId);
        if (!proposal) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Proposal not found' });
        }
        
        const customer = await db.getCustomerById(proposal.customerId);
        if (!customer) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Customer not found' });
        }
        
        if (!proposal.electricityBillId) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Electricity bill required for calculations' });
        }
        
        const electricityBill = await getAveragedElectricityBill(proposal.customerId, proposal.electricityBillId);
        
        // Get VPP providers and rebates
        const vppProviders = await db.getVppProvidersByState(customer.state);
        const rebates = await db.getRebatesByState(customer.state);
        
        // Update status to calculating
        await db.updateProposal(input.proposalId, { status: 'calculating' });
        
        try {
          const calculations = generateFullCalculations(
            customer,
            electricityBill,
            null,
            vppProviders,
            rebates
          );
          
          await db.updateProposal(input.proposalId, {
            calculations,
            status: 'draft',
          });
          
          return { success: true, calculations };
        } catch (error) {
          await db.updateProposal(input.proposalId, { status: 'draft' });
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          });
        }
      }),
    
    // OLD generate mutation removed — use generateProgressive for LLM-powered slide generation
    generate: protectedProcedure
      .input(z.object({ proposalId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Use generateProgressive for LLM-powered slide generation with live preview' });
      }),
    
    // Progressive generation with real-time progress tracking
    generateProgressive: protectedProcedure
      .input(z.object({ proposalId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        let proposal = await db.getProposalById(input.proposalId);
        if (!proposal) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Proposal not found' });
        }
        
        const customer = await db.getCustomerById(proposal.customerId);
        if (!customer) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Customer not found' });
        }
        
        // Auto-calculate if calculations are missing
        if (!proposal.calculations) {
          if (!proposal.electricityBillId) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Electricity bill required for calculations' });
          }
          const electricityBill = await getAveragedElectricityBill(proposal.customerId, proposal.electricityBillId);
          const vppProviders = await db.getVppProvidersByState(customer.state);
          const rebates = await db.getRebatesByState(customer.state);
          const calculations = generateFullCalculations(customer, electricityBill, null, vppProviders, rebates);
          await db.updateProposal(input.proposalId, { calculations, status: 'draft' });
          proposal = await db.getProposalById(input.proposalId);
          if (!proposal) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to reload proposal after calculation' });
          }
        }
        
        const calc = proposal.calculations as ProposalCalculations;
        
        // Fetch customer site photos for slide incorporation
        const customerDocs = await db.getDocumentsByCustomerId(proposal.customerId);
        
        // Auto-analyze switchboard photos that haven't been analyzed yet
        const unanalyzedSwitchboardPhotos = customerDocs.filter(
          d => d.documentType === 'switchboard_photo' && !d.extractedData && d.fileUrl
        );
        if (unanalyzedSwitchboardPhotos.length > 0) {
          console.log(`[generateProgressive] Auto-analyzing ${unanalyzedSwitchboardPhotos.length} switchboard photo(s) for proposal ${input.proposalId}`);
          const { analyzeSwitchboardPhoto, generateSwitchboardReport } = await import('./switchboardAnalysis');
          for (const doc of unanalyzedSwitchboardPhotos) {
            try {
              const analysis = await analyzeSwitchboardPhoto(doc.fileUrl);
              const report = generateSwitchboardReport(analysis);
              await db.updateCustomerDocument(doc.id, {
                extractedData: JSON.stringify(analysis),
                description: report,
              });
              // Update the in-memory doc so sitePhotos picks it up below
              (doc as any).extractedData = analysis;
              console.log(`[generateProgressive] Switchboard analysis complete for doc ${doc.id} (${doc.fileName}), confidence: ${analysis.confidence}%`);
            } catch (err: any) {
              console.error(`[generateProgressive] Failed to auto-analyze switchboard photo ${doc.id}:`, err.message);
            }
          }
        }
        
        const sitePhotos = customerDocs
          .filter(d => ['switchboard_photo', 'meter_photo', 'roof_photo', 'property_photo', 'cable_run_photo'].includes(d.documentType))
          .map((d, idx) => {
            // Use simple labels for captions — NOT the full analysis text
            const typeLabels: Record<string, string> = {
              switchboard_photo: 'Switchboard Photo',
              meter_photo: 'Meter Photo',
              roof_photo: 'Roof Photo',
              property_photo: 'Property Photo',
              cable_run_photo: 'Cable Run Photo',
            };
            const baseLabel = typeLabels[d.documentType] || 'Site Photo';
            return {
              url: d.fileUrl,
              caption: baseLabel,
              analysis: d.extractedData ? (typeof d.extractedData === 'string' ? JSON.parse(d.extractedData) : d.extractedData) : null,
              documentType: d.documentType,
            };
          });
        
        // Aggregate switchboard analysis from all analysed switchboard photos
        // Filter out low-confidence analyses (e.g. meter photos tagged as switchboard) — require >= 50% confidence
        const switchboardAnalyses = sitePhotos
          .filter(p => p.documentType === 'switchboard_photo' && p.analysis && (p.analysis.confidence || 0) >= 50)
          .map(p => p.analysis);
        const switchboardAnalysis: ProposalData['switchboardAnalysis'] = switchboardAnalyses.length > 0 ? {
          boardCondition: switchboardAnalyses[0].boardCondition || 'unknown',
          mainSwitchRating: switchboardAnalyses.find(a => a.mainSwitchRating)?.mainSwitchRating || null,
          mainSwitchType: switchboardAnalyses.find(a => a.mainSwitchType)?.mainSwitchType || null,
          totalCircuits: switchboardAnalyses.find(a => a.totalCircuits)?.totalCircuits || null,
          usedCircuits: switchboardAnalyses.find(a => a.usedCircuits)?.usedCircuits || null,
          availableCircuits: switchboardAnalyses.find(a => a.availableCircuits)?.availableCircuits || null,
          hasRcd: switchboardAnalyses.some(a => a.hasRcd),
          rcdCount: switchboardAnalyses.find(a => a.rcdCount)?.rcdCount || null,
          hasSpaceForSolar: switchboardAnalyses.some(a => a.hasSpaceForSolar),
          hasSpaceForBattery: switchboardAnalyses.some(a => a.hasSpaceForBattery),
          upgradeRequired: switchboardAnalyses.some(a => a.upgradeRequired),
          upgradeReason: switchboardAnalyses.find(a => a.upgradeReason)?.upgradeReason || null,
          warnings: switchboardAnalyses.flatMap(a => a.warnings || []),
          confidence: Math.round(switchboardAnalyses.reduce((sum, a) => sum + (a.confidence || 0), 0) / switchboardAnalyses.length),
          // Enhanced installer-level fields
          circuitBreakers: switchboardAnalyses.flatMap(a => a.circuitBreakers || []),
          phaseConfiguration: switchboardAnalyses.find(a => a.phaseConfiguration && a.phaseConfiguration !== 'unknown')?.phaseConfiguration || 'unknown',
          phaseConfirmationSource: switchboardAnalyses.find(a => a.phaseConfirmationSource)?.phaseConfirmationSource || null,
          meterType: switchboardAnalyses.find(a => a.meterType)?.meterType || null,
          meterIsBidirectional: switchboardAnalyses.find(a => a.meterIsBidirectional !== null && a.meterIsBidirectional !== undefined)?.meterIsBidirectional ?? null,
          meterSwapRequired: switchboardAnalyses.some(a => a.meterSwapRequired),
          meterNotes: switchboardAnalyses.find(a => a.meterNotes)?.meterNotes || null,
          upgradeScope: applyFallbackCostEstimates(switchboardAnalyses.flatMap(a => a.upgradeScope || [])),
          proposedSolarBreakerPosition: switchboardAnalyses.find(a => a.proposedSolarBreakerPosition)?.proposedSolarBreakerPosition || null,
          proposedSolarBreakerRating: switchboardAnalyses.find(a => a.proposedSolarBreakerRating)?.proposedSolarBreakerRating || null,
          proposedBatteryBreakerPosition: switchboardAnalyses.find(a => a.proposedBatteryBreakerPosition)?.proposedBatteryBreakerPosition || null,
          proposedBatteryBreakerRating: switchboardAnalyses.find(a => a.proposedBatteryBreakerRating)?.proposedBatteryBreakerRating || null,
          proposedDcIsolatorLocation: switchboardAnalyses.find(a => a.proposedDcIsolatorLocation)?.proposedDcIsolatorLocation || null,
          proposedAcIsolatorLocation: switchboardAnalyses.find(a => a.proposedAcIsolatorLocation)?.proposedAcIsolatorLocation || null,
          cableAssessment: switchboardAnalyses.find(a => a.cableAssessment)?.cableAssessment || null,
          existingCableSizeAdequate: switchboardAnalyses.find(a => a.existingCableSizeAdequate !== null && a.existingCableSizeAdequate !== undefined)?.existingCableSizeAdequate ?? null,
        } : undefined;
        
        // === Meter Photo Auto-Analysis ===
        let meterAnalysis: ProposalData['meterAnalysis'] = undefined;
        const meterPhotoDocs = customerDocs.filter(d => d.documentType === 'meter_photo');
        for (const md of meterPhotoDocs) {
          if (!md.extractedData && md.fileUrl) {
            try {
              console.log(`[MeterAnalysis] Auto-analyzing meter photo (doc ${md.id})...`);
              const { analyzeMeterPhoto } = await import('./meterAnalysis');
              const meterResult = await analyzeMeterPhoto(md.fileUrl);
              console.log(`[MeterAnalysis] Analysis complete — confidence: ${meterResult.confidence}%, type: ${meterResult.meterType}, swap required: ${meterResult.meterSwapRequired}`);
              await db.updateCustomerDocument(md.id, { extractedData: meterResult });
              md.extractedData = meterResult as any;
            } catch (err) {
              console.error(`[MeterAnalysis] Failed to analyze meter photo (doc ${md.id}):`, err);
            }
          }
        }
        for (const md of meterPhotoDocs) {
          if (md.extractedData) {
            const parsed = typeof md.extractedData === 'string' ? JSON.parse(md.extractedData) : md.extractedData;
            if (parsed.confidence >= 30 && (!meterAnalysis || parsed.confidence > meterAnalysis.confidence)) {
              meterAnalysis = parsed;
            }
          }
        }

        // === Cable Run Photo Auto-Analysis ===
        const cableRunDocs = customerDocs.filter(d => d.documentType === 'cable_run_photo');
        let cableRunAnalysis: ProposalData['cableRunAnalysis'] = undefined;
        for (const crd of cableRunDocs) {
          if (!crd.extractedData && crd.fileUrl) {
            try {
              console.log(`[Cable Run] Auto-analyzing cable run photo (doc ${crd.id})...`);
              const { analyzeCableRunPhoto } = await import('./cableRunAnalysis');
              const crAnalysis = await analyzeCableRunPhoto(crd.fileUrl);
              console.log(`[Cable Run] Analysis complete — distance: ${crAnalysis.cableRunDistanceMetres}m, confidence: ${crAnalysis.confidence}%`);
              await db.updateCustomerDocument(crd.id, { extractedData: JSON.stringify(crAnalysis) });
              if (crAnalysis.confidence >= 40 && crAnalysis.cableRunDistanceMetres) {
                cableRunAnalysis = { ...crAnalysis, photoUrl: crd.fileUrl };
              }
            } catch (e) { console.error('[Cable Run] Analysis failed:', e); }
          } else if (crd.extractedData) {
            const parsed = typeof crd.extractedData === 'string' ? JSON.parse(crd.extractedData) : crd.extractedData;
            if (parsed.confidence >= 40 && parsed.cableRunDistanceMetres) {
              cableRunAnalysis = { ...parsed, photoUrl: crd.fileUrl };
            }
          }
        }

        // === Inject Cable Run Cost into Upgrade Scope ===
        if (switchboardAnalysis && cableRunAnalysis?.cableRunDistanceMetres) {
          const cableRunCostItem = calculateCableRunCostItem(
            cableRunAnalysis.cableRunDistanceMetres,
            switchboardAnalysis.phaseConfiguration || 'single'
          );
          if (cableRunCostItem) {
            switchboardAnalysis.upgradeScope = [...(switchboardAnalysis.upgradeScope || []), cableRunCostItem];
          }
        }

        // === Cable Sizing Calculation (AS/NZS 3008.1.1) ===
        let cableSizing: ProposalData['cableSizing'] = undefined;
        const phaseConfig = switchboardAnalysis?.phaseConfiguration || 'single';
        if (cableRunAnalysis?.cableRunDistanceMetres) {
          const { calculateCableSizing } = await import('./cableRunAnalysis');
          const sp = customerDocs.find(d => d.documentType === 'solar_proposal_pdf' && d.extractedData);
          const spData = sp?.extractedData ? (typeof sp.extractedData === 'string' ? JSON.parse(sp.extractedData) : sp.extractedData) : null;
          const invKw = spData?.inverterSizeW ? spData.inverterSizeW / 1000 : (calc.recommendedSolarKw || 10);
          cableSizing = calculateCableSizing(invKw, phaseConfig, cableRunAnalysis.cableRunDistanceMetres, calc.recommendedBatteryKwh);
        }

        // === Roof Photo Auto-Analysis ===
        let roofAnalysis: ProposalData['roofAnalysis'] = undefined;
        const roofPhotoDocs = customerDocs.filter(d => d.documentType === 'roof_photo');
        for (const rd of roofPhotoDocs) {
          if (!rd.extractedData && rd.fileUrl) {
            try {
              console.log(`[RoofAnalysis] Auto-analyzing roof photo (doc ${rd.id})...`);
              const { analyzeRoofPhoto } = await import('./roofAnalysis');
              const roofResult = await analyzeRoofPhoto(rd.fileUrl, customer.state);
              console.log(`[RoofAnalysis] Analysis complete — confidence: ${roofResult.confidence}%, orientation: ${roofResult.primaryOrientation}`);
              await db.updateCustomerDocument(rd.id, { extractedData: roofResult });
              rd.extractedData = roofResult as any;
            } catch (err) {
              console.error(`[RoofAnalysis] Failed to analyze roof photo (doc ${rd.id}):`, err);
            }
          }
        }
        for (const rd of roofPhotoDocs) {
          if (rd.extractedData) {
            const parsed = typeof rd.extractedData === 'string' ? JSON.parse(rd.extractedData) : rd.extractedData;
            if (parsed.confidence >= 30 && parsed.primaryOrientation && (!roofAnalysis || parsed.confidence > (roofAnalysis as any).confidence)) {
              roofAnalysis = parsed;
            }
          }
        }

        // Check for uploaded solar proposal specs to override calculated system values
        const solarProposalDoc = customerDocs.find(d => d.documentType === 'solar_proposal_pdf' && d.extractedData);
        const solarProposalSpecs = solarProposalDoc?.extractedData 
          ? (typeof solarProposalDoc.extractedData === 'string' ? JSON.parse(solarProposalDoc.extractedData) : solarProposalDoc.extractedData)
          : undefined;
        
        const proposalData = buildProposalData(customer, calc, false, {
          proposalNotes: (proposal as any).proposalNotes || undefined,
          regeneratePrompt: (proposal as any).lastRegeneratePrompt || undefined,
          sitePhotos: sitePhotos.length > 0 ? sitePhotos : undefined,
          switchboardAnalysis,
          meterAnalysis,
          cableRunAnalysis,
          cableSizing,
          solarProposalSpecs,
          costOverrides: (proposal as any).costOverrides || undefined,
          roofAnalysis,
        });

        // --- Generate slides progressively
        const allSlides = generateSlides(proposalData); // Only active/included slides
        
        // Initialize progress tracking with ALL active slides
        const slideInfo = allSlides.map(s => ({ type: s.type, title: s.title }));
        initProgress(input.proposalId, slideInfo);
        
        // Build slidesData directly from allSlides (no more old generateSlidesData)
        const slidesData: Array<{ type: string; title: string; html: string; s3Key?: string; isIncluded: boolean }> = 
          allSlides.map(s => ({ type: s.type, title: s.title, html: '', isIncluded: true }));
        
        // Process each slide — LLM-powered narrative enrichment + S3 upload
        for (let i = 0; i < allSlides.length; i++) {
          updateSlideProgress(input.proposalId, i, { status: 'generating' });
          
          let slideHtml = '';
          try {
            const enrichedSlide = await enrichSlideWithNarrative(allSlides[i], proposalData);
            slideHtml = generateSlideHTML(enrichedSlide);
            updateSlideProgress(input.proposalId, i, {
              status: 'complete',
              html: slideHtml,
            });
          } catch (err: any) {
            try {
              slideHtml = generateSlideHTML(allSlides[i]);
              updateSlideProgress(input.proposalId, i, {
                status: 'complete',
                html: slideHtml,
              });
            } catch (err2: any) {
              const placeholderHtml = `<div style="width:1920px;height:1080px;background:#000;display:flex;align-items:center;justify-content:center;font-family:sans-serif;color:#808285;"><div style="text-align:center;"><p style="font-size:32px;color:#fff;margin-bottom:16px;">${allSlides[i].title || 'Slide'}</p><p style="font-size:18px;">Content generation in progress</p></div></div>`;
              slideHtml = placeholderHtml;
              updateSlideProgress(input.proposalId, i, {
                status: 'complete',
                html: placeholderHtml,
              });
              console.error(`[generateSlideHTML] Error generating ${allSlides[i].type}, using placeholder:`, err2.message);
            }
          }
          
          // Upload slide HTML to S3 (non-blocking per slide — we continue even if one fails)
          try {
            const s3Key = `slides/${input.proposalId}/slide-${i}-${Date.now()}.html`;
            await storagePut(s3Key, slideHtml, 'text/html');
            slidesData[i].s3Key = s3Key;
            slidesData[i].html = ''; // Don't store HTML in DB — it's in S3 now
            console.log(`[generateProgressive] Slide ${i} uploaded to S3: ${s3Key}`);
          } catch (s3Err: any) {
            console.error(`[generateProgressive] S3 upload failed for slide ${i}:`, s3Err.message);
            // Keep HTML in slidesData as fallback if S3 fails
            slidesData[i].html = slideHtml;
          }
          
          // Paced generation — 2s delay between slides to reduce server load
          // and provide a smoother, more deliberate progress experience
          if (i < allSlides.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
        
        // Save to DB — slidesData now contains only metadata + s3Keys (no huge HTML)
        const includedCount = slidesData.filter(s => s.s3Key || s.html).length;
        try {
          const jsonSize = JSON.stringify(slidesData).length;
          console.log(`[generateProgressive] Saving ${includedCount} slides for proposal ${input.proposalId}, JSON size: ${(jsonSize / 1024).toFixed(1)} KB (HTML in S3)`);
          
          await db.updateProposal(input.proposalId, {
            slidesData,
            slideCount: includedCount,
            status: 'generated',
          });
          console.log(`[generateProgressive] DB save successful for proposal ${input.proposalId}, status set to 'generated'`);
        } catch (dbErr: any) {
          console.error(`[generateProgressive] DB save FAILED for proposal ${input.proposalId}:`, dbErr.message);
          try {
            await db.updateProposal(input.proposalId, { status: 'generated', slideCount: includedCount });
            console.log(`[generateProgressive] Fallback status-only save successful for proposal ${input.proposalId}`);
          } catch (dbErr2: any) {
            console.error(`[generateProgressive] Fallback status save also FAILED:`, dbErr2.message);
          }
        }
        
        // Always mark as complete — individual slide errors are handled with placeholders
        setGenerationStatus(input.proposalId, 'complete');
        
        return { success: true, slideCount: includedCount };
      }),
    
    // Query generation progress for live preview
    generationProgress: protectedProcedure
      .input(z.object({ proposalId: z.number() }))
      .query(async ({ ctx, input }) => {
        const progress = getProgress(input.proposalId);
        if (!progress) {
          return { status: 'idle' as const, totalSlides: 0, completedSlides: 0, currentSlideIndex: 0, slides: [] };
        }
        return progress;
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        status: z.enum(['draft', 'calculating', 'generated', 'exported', 'archived']).optional(),
        electricityBillId: z.number().optional(),
        proposalNotes: z.string().optional(),
        costOverrides: z.record(z.string(), z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateProposal(id, data);
        return { success: true };
      }),
    
    saveCostOverrides: protectedProcedure
      .input(z.object({
        id: z.number(),
        costOverrides: z.record(z.string(), z.string()),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateProposal(input.id, { costOverrides: input.costOverrides } as any);
        return { success: true };
      }),
    
    getCostOverrides: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const proposal = await db.getProposalById(input.id);
        if (!proposal) throw new TRPCError({ code: 'NOT_FOUND', message: 'Proposal not found' });
        return { costOverrides: (proposal as any).costOverrides || {} };
      }),
    
    getScopeItems: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const proposal = await db.getProposalById(input.id);
        if (!proposal) throw new TRPCError({ code: 'NOT_FOUND', message: 'Proposal not found' });
        const calc = proposal.calculations as ProposalCalculations;
        if (!calc || !proposal.customerId) return { scopeItems: [] };
        try {
          const scopeCustomer = await db.getCustomerById(proposal.customerId);
          const siteData = await aggregateSiteData(proposal.customerId, calc, scopeCustomer?.state);
          const upgradeScope = siteData.switchboardAnalysis?.upgradeScope || [];
          return { scopeItems: upgradeScope.map((item: any) => ({ item: item.item, detail: item.detail, priority: item.priority, estimatedCost: item.estimatedCost || null })) };
        } catch (e) {
          return { scopeItems: [] };
        }
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Soft delete - move to bin instead of permanent delete
        await db.softDeleteProposal(input.id);
        return { success: true };
      }),
    
    // Bin endpoints
    getBinItems: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getDeletedProposals(ctx.user.id);
      }),
    
    restore: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.restoreProposal(input.id);
        return { success: true };
      }),
    
    permanentDelete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.permanentlyDeleteProposal(input.id);
        return { success: true };
      }),
    
    emptyBin: protectedProcedure
      .mutation(async ({ ctx }) => {
        const deleted = await db.getDeletedProposals(ctx.user.id);
        for (const item of deleted) {
          await db.permanentlyDeleteProposal(item.id);
        }
        return { success: true, count: deleted.length };
      }),
    
    regenerate: protectedProcedure
      .input(z.object({
        proposalId: z.number(),
        regeneratePrompt: z.string().optional(), // One-off instructions for this regeneration
      }))
      .mutation(async ({ ctx, input }) => {
        const proposal = await db.getProposalById(input.proposalId);
        if (!proposal) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Proposal not found' });
        }
        // Reset to draft with empty slides — this triggers auto-generation on page load
        // Store the one-off prompt so the generation pipeline can use it
        // Also clear calculations so they get recalculated with latest logic
        await db.updateProposal(input.proposalId, {
          status: 'draft',
          slidesData: null,
          slideCount: 0,
          calculations: null,
          lastRegeneratePrompt: input.regeneratePrompt || null,
        });
        return { success: true };
      }),

    getSlideHtml: protectedProcedure
      .input(z.object({
        proposalId: z.number(),
        slideIndex: z.number().optional(),
        embedImages: z.boolean().optional(), // Pre-fetch external images and embed as base64 data URIs
      }))
      .query(async ({ ctx, input }) => {
        const proposal = await db.getProposalById(input.proposalId);
        if (!proposal) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Proposal not found' });
        }
        
        // Return stored LLM-generated HTML from slidesData in DB
        const slidesData = (proposal.slidesData || []) as import('../drizzle/schema').SlideData[];
        // Only return slides that are included AND have HTML or S3 key
        const includedSlides = slidesData.filter(s => s.isIncluded && (s.html || s.s3Key));
        
        if (includedSlides.length === 0) {
          return { slides: [], totalSlides: 0 };
        }
        
        // Fetch HTML from S3 for slides that have s3Key (parallel fetch)
        const resolvedSlides = await Promise.all(
          includedSlides.map(async (s, idx) => {
            let html = s.html || '';
            if (s.s3Key && !html) {
              try {
                const { url } = await storageGet(s.s3Key);
                const response = await fetch(url);
                if (response.ok) {
                  html = await response.text();
                } else {
                  console.error(`[getSlideHtml] S3 fetch failed for slide ${idx} (${s.s3Key}): ${response.status}`);
                }
              } catch (err: any) {
                console.error(`[getSlideHtml] S3 fetch error for slide ${idx} (${s.s3Key}):`, err.message);
              }
            }
            return { id: idx + 1, type: s.type, title: s.title, html };
          })
        );
        
        // Server-side image embedding: pre-fetch ALL external image URLs and convert to base64 data URIs.
        // This is the definitive fix for missing photos in PDF export — eliminates ALL CORS issues
        // because the server can fetch from any CDN without browser restrictions.
        if (input.embedImages) {
          console.log(`[getSlideHtml] Embedding images for ${resolvedSlides.length} slides...`);
          
          // Collect all unique external image URLs across all slides
          const allImageUrls = new Set<string>();
          const imgSrcRegex = /src="(https?:\/\/[^"]+)"/g;
          for (const slide of resolvedSlides) {
            let match;
            const regex = new RegExp(imgSrcRegex.source, imgSrcRegex.flags);
            while ((match = regex.exec(slide.html)) !== null) {
              const url = match[1];
              // Skip font files and non-image resources
              if (url.match(/\.(ttf|otf|woff2?|eot|css|js)$/i)) continue;
              allImageUrls.add(url);
            }
          }
          
          if (allImageUrls.size > 0) {
            console.log(`[getSlideHtml] Pre-fetching ${allImageUrls.size} external images...`);
            const urlToDataUri = new Map<string, string>();
            
            // Fetch all images in parallel with timeout
            await Promise.allSettled(
              Array.from(allImageUrls).map(async (url) => {
                try {
                  const controller = new AbortController();
                  const timeout = setTimeout(() => controller.abort(), 20000); // 20s per image
                  const resp = await fetch(url, { signal: controller.signal });
                  clearTimeout(timeout);
                  if (!resp.ok) {
                    console.warn(`[getSlideHtml] Image fetch failed: ${url} (${resp.status})`);
                    return;
                  }
                  const contentType = resp.headers.get('content-type') || 'image/jpeg';
                  const buffer = Buffer.from(await resp.arrayBuffer());
                  urlToDataUri.set(url, `data:${contentType};base64,${buffer.toString('base64')}`);
                } catch (err: any) {
                  console.warn(`[getSlideHtml] Image fetch error: ${url} — ${err.message}`);
                }
              })
            );
            
            console.log(`[getSlideHtml] Embedded ${urlToDataUri.size}/${allImageUrls.size} images as base64`);
            
            // Replace URLs in all slide HTML
            for (const slide of resolvedSlides) {
              urlToDataUri.forEach((dataUri, url) => {
                slide.html = slide.html.split(`src="${url}"`).join(`src="${dataUri}"`);
              });
            }
          }
        }
        
        if (input.slideIndex !== undefined) {
          const slide = resolvedSlides[input.slideIndex];
          if (!slide || !slide.html) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Slide not found' });
          }
          return {
            html: slide.html,
            slide,
            totalSlides: resolvedSlides.length,
          };
        }
        
        return {
          slides: resolvedSlides,
          totalSlides: resolvedSlides.length,
        };
      }),
    
    export: protectedProcedure
      .input(z.object({
        proposalId: z.number(),
        format: z.enum(['html', 'json']),
      }))
      .mutation(async ({ ctx, input }) => {
        const proposal = await db.getProposalById(input.proposalId);
        if (!proposal) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Proposal not found' });
        }
        
        const customer = await db.getCustomerById(proposal.customerId);
        if (!customer) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Customer not found' });
        }
        
        const slidesData = proposal.slidesData as SlideData[];
        if (!slidesData || slidesData.length === 0) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Proposal has no slides generated' });
        }
        
        if (input.format === 'json') {
          return {
            success: true,
            data: {
              customer: {
                name: customer.fullName,
                address: customer.address,
                state: customer.state,
              },
              slides: slidesData,
              calculations: proposal.calculations,
            },
          };
        }
        
        // Generate HTML for export
        const { generateFullPresentationHtml } = await import('./proposalExport');
        const html = generateFullPresentationHtml(slidesData, {
          format: 'pdf',
          includeConditionalSlides: false,
          customerName: customer.fullName,
          customerAddress: customer.address || '',
        });
        
        // Store HTML and return URL
        const fileName = `proposal-${proposal.id}-${Date.now()}.html`;
        const { url } = await storagePut(`exports/${fileName}`, html, 'text/html');
        
        // Update proposal status
        await db.updateProposal(input.proposalId, { status: 'exported' });
        
        return {
          success: true,
          fileUrl: url,
          fileName,
        };
      }),
    
    exportPdf: protectedProcedure
      .input(z.object({
        proposalId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        let proposal = await db.getProposalById(input.proposalId);
        if (!proposal) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Proposal not found' });
        }
        
        const customer = await db.getCustomerById(proposal.customerId);
        if (!customer) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Customer not found' });
        }
        
        // Auto-calculate if calculations are missing
        if (!proposal.calculations) {
          if (!proposal.electricityBillId) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Electricity bill required for calculations' });
          }
          const electricityBill = await getAveragedElectricityBill(proposal.customerId, proposal.electricityBillId);
          const vppProviders = await db.getVppProvidersByState(customer.state);
          const rebates = await db.getRebatesByState(customer.state);
          const calculations = generateFullCalculations(customer, electricityBill, null, vppProviders, rebates);
          await db.updateProposal(input.proposalId, { calculations, status: 'draft' });
          proposal = await db.getProposalById(input.proposalId);
          if (!proposal) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to reload proposal after calculation' });
          }
        }
        
        const calc = proposal.calculations as ProposalCalculations;
        // Aggregate all site data (photos, switchboard, cable run, solar specs)
        const siteData = await aggregateSiteData(proposal.customerId, calc, customer.state);
        const proposalData = buildProposalData(customer, calc, false, {
          sitePhotos: siteData.sitePhotos,
          switchboardAnalysis: siteData.switchboardAnalysis,
          meterAnalysis: siteData.meterAnalysis,
          cableRunAnalysis: siteData.cableRunAnalysis,
          cableSizing: siteData.cableSizing,
          solarProposalSpecs: siteData.solarProposalSpecs,
          costOverrides: (proposal as any).costOverrides || undefined,
          roofAnalysis: siteData.roofAnalysis,
        });
        
        const slides = generateSlides(proposalData);
        
        // Generate PDF using Puppeteer
        const { generateProposalPdf } = await import('./pdfExport');
        const pdfBuffer = await generateProposalPdf(
          slides.map(s => ({
            title: s.title,
            subtitle: s.subtitle,
            content: generateSlideHTML(s),
            type: s.type,
          })),
          customer.fullName,
          proposal.title || 'Electrification Proposal'
        );
        
        // Upload PDF to S3
        const fileName = `proposal-${proposal.id}-${customer.fullName.replace(/\s+/g, '_')}-${Date.now()}.pdf`;
        const { url } = await storagePut(`exports/${fileName}`, pdfBuffer, 'application/pdf');
        
        // Update proposal status
        await db.updateProposal(input.proposalId, { status: 'exported' });
        
        return {
          success: true,
          fileUrl: url,
          fileName,
        };
      }),

    // Export as native PowerPoint (.pptx) with embedded brand fonts
    exportPptx: protectedProcedure
      .input(z.object({
        proposalId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        let proposal = await db.getProposalById(input.proposalId);
        if (!proposal) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Proposal not found' });
        }
        
        const customer = await db.getCustomerById(proposal.customerId);
        if (!customer) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Customer not found' });
        }
        
        // Auto-calculate if calculations are missing
        if (!proposal.calculations) {
          if (!proposal.electricityBillId) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Electricity bill required for calculations' });
          }
          const electricityBill = await getAveragedElectricityBill(proposal.customerId, proposal.electricityBillId);
          const vppProviders = await db.getVppProvidersByState(customer.state);
          const rebates = await db.getRebatesByState(customer.state);
          const calculations = generateFullCalculations(customer, electricityBill, null, vppProviders, rebates);
          await db.updateProposal(input.proposalId, { calculations, status: 'draft' });
          proposal = await db.getProposalById(input.proposalId);
          if (!proposal) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to reload proposal after calculation' });
          }
        }
        
        const calc = proposal.calculations as ProposalCalculations;
        // Aggregate all site data (photos, switchboard, cable run, solar specs)
        const pptxSiteData = await aggregateSiteData(proposal.customerId, calc, customer.state);
        const proposalData = buildProposalData(customer, calc, false, {
          sitePhotos: pptxSiteData.sitePhotos,
          switchboardAnalysis: pptxSiteData.switchboardAnalysis,
          meterAnalysis: pptxSiteData.meterAnalysis,
          cableRunAnalysis: pptxSiteData.cableRunAnalysis,
          cableSizing: pptxSiteData.cableSizing,
          solarProposalSpecs: pptxSiteData.solarProposalSpecs,
          costOverrides: (proposal as any).costOverrides || undefined,
          roofAnalysis: pptxSiteData.roofAnalysis,
        });
        
        // Generate PPTX with embedded brand fonts
        const pptxBuffer = await generatePptx(proposalData);
        
        // Upload to S3
        const fileName = `proposal-${proposal.id}-${customer.fullName.replace(/\s+/g, '_')}-${Date.now()}.pptx`;
        const { url } = await storagePut(`exports/${fileName}`, pptxBuffer, 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
        
        await db.updateProposal(input.proposalId, { status: 'exported' });
        
        return {
          success: true,
          fileUrl: url,
          fileName,
        };
      }),

    // Export as native PDF with embedded brand fonts (no HTML/Puppeteer)
    exportNativePdf: protectedProcedure
      .input(z.object({
        proposalId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        let proposal = await db.getProposalById(input.proposalId);
        if (!proposal) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Proposal not found' });
        }
        
        const customer = await db.getCustomerById(proposal.customerId);
        if (!customer) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Customer not found' });
        }
        
        // Auto-calculate if calculations are missing
        if (!proposal.calculations) {
          if (!proposal.electricityBillId) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Electricity bill required for calculations' });
          }
          const electricityBill = await getAveragedElectricityBill(proposal.customerId, proposal.electricityBillId);
          const vppProviders = await db.getVppProvidersByState(customer.state);
          const rebates = await db.getRebatesByState(customer.state);
          const calculations = generateFullCalculations(customer, electricityBill, null, vppProviders, rebates);
          await db.updateProposal(input.proposalId, { calculations, status: 'draft' });
          proposal = await db.getProposalById(input.proposalId);
          if (!proposal) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to reload proposal after calculation' });
          }
        }
        
        const calc = proposal.calculations as ProposalCalculations;
        // Aggregate all site data (photos, switchboard, cable run, solar specs)
        const nativePdfSiteData = await aggregateSiteData(proposal.customerId, calc, customer.state);
        const proposalData = buildProposalData(customer, calc, false, {
          sitePhotos: nativePdfSiteData.sitePhotos,
          switchboardAnalysis: nativePdfSiteData.switchboardAnalysis,
          meterAnalysis: nativePdfSiteData.meterAnalysis,
          cableRunAnalysis: nativePdfSiteData.cableRunAnalysis,
          cableSizing: nativePdfSiteData.cableSizing,
          solarProposalSpecs: nativePdfSiteData.solarProposalSpecs,
          costOverrides: (proposal as any).costOverrides || undefined,
          roofAnalysis: nativePdfSiteData.roofAnalysis,
        });
        
        // Generate native PDF with embedded brand fonts
        const pdfBuffer = await generateNativePdf(proposalData);
        
        // Upload to S3
        const fileName = `proposal-${proposal.id}-${customer.fullName.replace(/\s+/g, '_')}-${Date.now()}.pdf`;
        const { url } = await storagePut(`exports/${fileName}`, pdfBuffer, 'application/pdf');
        
        await db.updateProposal(input.proposalId, { status: 'exported' });
        
        return {
          success: true,
          fileUrl: url,
          fileName,
        };
      }),

    generateSlideContent: protectedProcedure
      .input(z.object({
        proposalId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        let proposal = await db.getProposalById(input.proposalId);
        if (!proposal) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Proposal not found' });
        }
        
        const customer = await db.getCustomerById(proposal.customerId);
        if (!customer) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Customer not found' });
        }
        
        // Auto-calculate if calculations are missing
        if (!proposal.calculations) {
          if (!proposal.electricityBillId) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Electricity bill required for calculations' });
          }
          const electricityBill = await getAveragedElectricityBill(proposal.customerId, proposal.electricityBillId);
          const vppProviders = await db.getVppProvidersByState(customer.state);
          const rebates = await db.getRebatesByState(customer.state);
          const calculations = generateFullCalculations(customer, electricityBill, null, vppProviders, rebates);
          await db.updateProposal(input.proposalId, { calculations, status: 'draft' });
          proposal = await db.getProposalById(input.proposalId);
          if (!proposal) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to reload proposal after calculation' });
          }
        }
        
        const calc = proposal.calculations as ProposalCalculations;
        const { generateSlideContentMarkdown } = await import('./slideContentGenerator');
        const markdown = generateSlideContentMarkdown({
          customer,
          calculations: calc,
          proposalTitle: proposal.title || undefined,
        });
        
        // Upload markdown to S3 for easy access
        const fileName = `slide-content-${proposal.id}-${customer.fullName.replace(/\s+/g, '_')}-${Date.now()}.md`;
        const { url } = await storagePut(`slide-content/${fileName}`, Buffer.from(markdown, 'utf-8'), 'text/markdown');
        
        return {
          success: true,
          markdown,
          fileUrl: url,
          fileName,
          slideCount: (markdown.match(/^# Slide \d+:/gm) || []).length,
        };
      }),

  }),

  // ============================================
  // VPP PROVIDER ROUTES
  // ============================================
  vppProviders: router({
    list: protectedProcedure.query(async () => {
      return db.getAllVppProviders();
    }),
    
    listByState: protectedProcedure
      .input(z.object({ state: z.string() }))
      .query(async ({ input }) => {
        return db.getVppProvidersByState(input.state);
      }),
  }),

  // ============================================
  // REBATES ROUTES
  // ============================================
  rebates: router({
    listByState: protectedProcedure
      .input(z.object({ state: z.string() }))
      .query(async ({ input }) => {
        return db.getRebatesByState(input.state);
      }),
  }),

  // ============================================
  // CUSTOMER DOCUMENTS ROUTES
  // ============================================
  documents: router({
    list: protectedProcedure
      .input(z.object({ customerId: z.number() }))
      .query(async ({ input }) => {
        return db.getDocumentsByCustomerId(input.customerId);
      }),
    
    listByType: protectedProcedure
      .input(z.object({
        customerId: z.number(),
        documentType: z.enum([
          'switchboard_photo',
          'meter_photo',
          'roof_photo',
          'property_photo',
          'cable_run_photo',
          'solar_proposal_pdf',
          'other'
        ]),
      }))
      .query(async ({ input }) => {
        return db.getDocumentsByType(input.customerId, input.documentType);
      }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getDocumentById(input.id);
      }),
    
    upload: protectedProcedure
      .input(z.object({
        customerId: z.number(),
        documentType: z.enum([
          'switchboard_photo',
          'meter_photo',
          'roof_photo',
          'property_photo',
          'cable_run_photo',
          'solar_proposal_pdf',
          'other'
        ]),
        fileData: z.string(), // Base64 encoded file data
        fileName: z.string(),
        mimeType: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Decode base64
        let buffer = Buffer.from(input.fileData, 'base64');
        let mimeType = input.mimeType;
        let fileName = input.fileName;
        
        // Compress photos to max 1200px wide, JPEG quality 80 for faster slide rendering
        const isPhoto = ['switchboard_photo', 'meter_photo', 'roof_photo', 'property_photo', 'cable_run_photo'].includes(input.documentType);
        if (isPhoto && (input.mimeType.startsWith('image/jpeg') || input.mimeType.startsWith('image/png') || input.mimeType.startsWith('image/webp'))) {
          try {
            buffer = await sharp(buffer)
              .rotate() // Auto-rotate based on EXIF orientation data
              .resize(1600, 1200, { fit: 'inside', withoutEnlargement: true })
              .jpeg({ quality: 82 })
              .toBuffer() as Buffer<ArrayBuffer>;
            mimeType = 'image/jpeg';
            // Update filename extension to .jpg
            fileName = fileName.replace(/\.(png|webp|heic|heif)$/i, '.jpg');
            console.log(`[document.upload] Compressed photo from ${Buffer.from(input.fileData, 'base64').length} to ${buffer.length} bytes`);
          } catch (compressErr: any) {
            console.error('[document.upload] Photo compression failed, using original:', compressErr.message);
          }
        }
        
        const fileKey = `documents/${input.customerId}/${nanoid()}-${fileName}`;
        
        const { url } = await storagePut(fileKey, buffer, mimeType);
        
        // Create document record
        const docId = await db.createCustomerDocument({
          customerId: input.customerId,
          userId: ctx.user.id,
          documentType: input.documentType,
          fileUrl: url,
          fileKey: fileKey,
          fileName: fileName,
          fileSize: buffer.length,
          mimeType: mimeType,
          description: input.description,
        });
        
        return {
          success: true,
          documentId: docId,
          fileUrl: url,
        };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        description: z.string().optional(),
        extractedData: z.any().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateCustomerDocument(id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCustomerDocument(input.id);
        return { success: true };
      }),
    
    updateDocumentType: protectedProcedure
      .input(z.object({
        documentId: z.number(),
        documentType: z.enum([
          'switchboard_photo',
          'meter_photo',
          'roof_photo',
          'property_photo',
          'cable_run_photo',
          'solar_proposal_pdf',
          'other'
        ]),
      }))
      .mutation(async ({ input }) => {
        const doc = await db.getDocumentById(input.documentId);
        if (!doc) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Document not found' });
        }
        
        // If changing FROM switchboard_photo to something else, clear the switchboard analysis data
        const shouldClearAnalysis = doc.documentType === 'switchboard_photo' && input.documentType !== 'switchboard_photo';
        
        await db.updateCustomerDocument(input.documentId, {
          documentType: input.documentType,
          ...(shouldClearAnalysis ? { extractedData: null, description: null } : {}),
        });
        
        console.log(`[updateDocumentType] Document ${input.documentId} changed from ${doc.documentType} to ${input.documentType}${shouldClearAnalysis ? ' (analysis cleared)' : ''}`);
        
        return {
          success: true,
          previousType: doc.documentType,
          newType: input.documentType,
        };
      }),

    analyzeSwitchboard: protectedProcedure
      .input(z.object({ documentId: z.number() }))
      .mutation(async ({ input }) => {
        const doc = await db.getDocumentById(input.documentId);
        if (!doc) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Document not found' });
        }
        
        if (doc.documentType !== 'switchboard_photo') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Document is not a switchboard photo' });
        }
        
        // Analyze the switchboard photo using LLM vision
        const { analyzeSwitchboardPhoto, generateSwitchboardReport } = await import('./switchboardAnalysis');
        const analysis = await analyzeSwitchboardPhoto(doc.fileUrl);
        const report = generateSwitchboardReport(analysis);
        
        // Store the analysis in the document
        await db.updateCustomerDocument(input.documentId, {
          extractedData: JSON.stringify(analysis),
          description: report,
        });
        
        return {
          success: true,
          analysis,
          report,
        };
      }),

    analyzeSolarProposal: protectedProcedure
      .input(z.object({ documentId: z.number() }))
      .mutation(async ({ input }) => {
        const doc = await db.getDocumentById(input.documentId);
        if (!doc) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Document not found' });
        }
        
        if (doc.documentType !== 'solar_proposal_pdf') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Document is not a solar proposal' });
        }
        
        // Extract system specs from the solar proposal using LLM vision
        const { extractSolarProposalSpecs, generateSpecsSummary } = await import('./solarProposalExtraction');
        const specs = await extractSolarProposalSpecs(doc.fileUrl, doc.mimeType || undefined);
        const summary = generateSpecsSummary(specs);
        
        // Store the extracted specs in the document
        await db.updateCustomerDocument(input.documentId, {
          extractedData: JSON.stringify(specs),
          description: summary,
        });
        
        return {
          success: true,
          specs,
          summary,
        };
      }),

    getSolarProposalSpecs: protectedProcedure
      .input(z.object({ customerId: z.number() }))
      .query(async ({ input }) => {
        const docs = await db.getDocumentsByCustomerId(input.customerId);
        const proposalDoc = docs.find(d => d.documentType === 'solar_proposal_pdf' && d.extractedData);
        
        if (!proposalDoc || !proposalDoc.extractedData) {
          return { hasSpecs: false, specs: null, documentId: null };
        }
        
        const specs = typeof proposalDoc.extractedData === 'string' 
          ? JSON.parse(proposalDoc.extractedData) 
          : proposalDoc.extractedData;
        
        return {
          hasSpecs: true,
          specs,
          documentId: proposalDoc.id,
        };
      }),
  }),





  // ============================================
  // ADMIN ROUTES
  // ============================================
  admin: router({
    seedVppProviders: adminProcedure.mutation(async () => {
      // Seed the 13 VPP providers
      const providers = [
        { name: 'ENGIE', programName: 'VPP Advantage', availableStates: ['VIC', 'NSW', 'SA', 'QLD'], hasGasBundle: true, dailyCredit: 0.50, eventPayment: 10, estimatedEventsPerYear: 12, bundleDiscount: 100 },
        { name: 'Origin', programName: 'Loop VPP', availableStates: ['VIC', 'NSW', 'SA', 'QLD', 'ACT'], hasGasBundle: true, dailyCredit: 0.40, eventPayment: 8, estimatedEventsPerYear: 15, bundleDiscount: 80 },
        { name: 'AGL', programName: 'Night Saver', availableStates: ['VIC', 'NSW', 'SA', 'QLD'], hasGasBundle: true, dailyCredit: 0.45, eventPayment: 12, estimatedEventsPerYear: 10, bundleDiscount: 120 },
        { name: 'Amber Electric', programName: 'SmartShift', availableStates: ['VIC', 'NSW', 'SA', 'QLD', 'ACT'], hasGasBundle: false, dailyCredit: 0.60, eventPayment: 15, estimatedEventsPerYear: 8, bundleDiscount: 0 },
        { name: 'Simply Energy', programName: 'VPP Access', availableStates: ['VIC', 'SA'], hasGasBundle: true, dailyCredit: 0.35, eventPayment: 8, estimatedEventsPerYear: 12, bundleDiscount: 90 },
        { name: 'Energy Locals', programName: 'Community VPP', availableStates: ['VIC', 'NSW', 'SA', 'QLD'], hasGasBundle: false, dailyCredit: 0.55, eventPayment: 10, estimatedEventsPerYear: 10, bundleDiscount: 0 },
        { name: 'Powershop', programName: 'Powerbank', availableStates: ['VIC', 'NSW', 'SA', 'QLD'], hasGasBundle: false, dailyCredit: 0.45, eventPayment: 9, estimatedEventsPerYear: 12, bundleDiscount: 0 },
        { name: 'Red Energy', programName: 'VPP Program', availableStates: ['VIC', 'NSW', 'SA', 'QLD'], hasGasBundle: true, dailyCredit: 0.40, eventPayment: 10, estimatedEventsPerYear: 10, bundleDiscount: 75 },
        { name: 'Momentum Energy', programName: 'Battery Saver', availableStates: ['VIC', 'SA'], hasGasBundle: true, dailyCredit: 0.38, eventPayment: 8, estimatedEventsPerYear: 12, bundleDiscount: 60 },
        { name: 'Lumo Energy', programName: 'VPP Rewards', availableStates: ['VIC', 'NSW', 'SA', 'QLD'], hasGasBundle: true, dailyCredit: 0.42, eventPayment: 9, estimatedEventsPerYear: 11, bundleDiscount: 70 },
        { name: 'Alinta Energy', programName: 'Home Battery', availableStates: ['VIC', 'NSW', 'SA', 'QLD', 'WA'], hasGasBundle: true, dailyCredit: 0.48, eventPayment: 11, estimatedEventsPerYear: 10, bundleDiscount: 85 },
        { name: 'GloBird Energy', programName: 'Battery Boost', availableStates: ['VIC', 'NSW', 'SA', 'QLD'], hasGasBundle: false, dailyCredit: 0.58, eventPayment: 14, estimatedEventsPerYear: 8, bundleDiscount: 0 },
      ];
      
      for (const provider of providers) {
        await db.upsertVppProvider({
          ...provider,
          dailyCredit: provider.dailyCredit.toString(),
          eventPayment: provider.eventPayment.toString(),
          bundleDiscount: provider.bundleDiscount.toString(),
        });
      }
      
      return { success: true, count: providers.length };
    }),
    
    seedRebates: adminProcedure.mutation(async () => {
      // Seed state rebates
      const rebates = [
        // Victoria
        { state: 'VIC', rebateType: 'solar' as const, name: 'Solar Homes Program', amount: 1400, isPercentage: false },
        { state: 'VIC', rebateType: 'battery' as const, name: 'Solar Battery Rebate', amount: 2950, isPercentage: false },
        { state: 'VIC', rebateType: 'heat_pump_hw' as const, name: 'Hot Water Rebate', amount: 1000, isPercentage: false },
        { state: 'VIC', rebateType: 'heat_pump_ac' as const, name: 'VEU Certificates', amount: 1200, isPercentage: false },
        // NSW
        { state: 'NSW', rebateType: 'battery' as const, name: 'Empowering Homes', amount: 2400, isPercentage: false },
        { state: 'NSW', rebateType: 'heat_pump_hw' as const, name: 'Energy Savings Scheme', amount: 800, isPercentage: false },
        // SA
        { state: 'SA', rebateType: 'battery' as const, name: 'Home Battery Scheme', amount: 2000, isPercentage: false },
        { state: 'SA', rebateType: 'heat_pump_hw' as const, name: 'REPS Hot Water', amount: 700, isPercentage: false },
        // QLD
        { state: 'QLD', rebateType: 'battery' as const, name: 'Battery Booster', amount: 3000, isPercentage: false },
        { state: 'QLD', rebateType: 'heat_pump_hw' as const, name: 'Climate Smart Homes', amount: 1000, isPercentage: false },
      ];
      
      for (const rebate of rebates) {
        await db.upsertStateRebate({
          ...rebate,
          amount: rebate.amount.toString(),
          isActive: true,
        });
      }
      
      return { success: true, count: rebates.length };
    }),

    // Re-compress all existing photos with EXIF rotation correction
    recompressPhotos: adminProcedure.mutation(async () => {
      const allCustomers = await db.searchCustomers(0); // Get all customers (userId 0 won't match but we need a different approach)
      
      // Get all photo documents directly from DB
      const dbConn = await db.getDb();
      if (!dbConn) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const allDocs = await dbConn.select().from(docsTable);
      const photoDocs = allDocs.filter(d => 
        ['switchboard_photo', 'meter_photo', 'roof_photo', 'property_photo', 'cable_run_photo'].includes(d.documentType)
      );
      
      let processed = 0;
      let failed = 0;
      const results: Array<{ id: number; fileName: string; status: string; oldSize?: number; newSize?: number }> = [];
      
      for (const doc of photoDocs) {
        try {
          // Download original from S3
          const response = await fetch(doc.fileUrl);
          if (!response.ok) {
            results.push({ id: doc.id, fileName: doc.fileName, status: `fetch failed: ${response.status}` });
            failed++;
            continue;
          }
          const originalBuffer = Buffer.from(await response.arrayBuffer());
          const oldSize = originalBuffer.length;
          
          // Re-process with EXIF rotation + compression
          const newBuffer = await sharp(originalBuffer)
            .rotate() // Auto-rotate based on EXIF orientation
            .resize(1600, 1200, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 82 })
            .toBuffer();
          
          // Re-upload to same key (overwrite)
          const fileKey = doc.fileKey;
          const { url: newUrl } = await storagePut(fileKey, newBuffer, 'image/jpeg');
          
          // Update DB record with new URL and size
          await dbConn.update(docsTable).set({
            fileUrl: newUrl,
            fileSize: newBuffer.length,
            mimeType: 'image/jpeg',
          }).where(eq(docsTable.id, doc.id));
          
          results.push({ id: doc.id, fileName: doc.fileName, status: 'success', oldSize, newSize: newBuffer.length });
          processed++;
        } catch (err: any) {
          results.push({ id: doc.id, fileName: doc.fileName, status: `error: ${err.message}` });
          failed++;
        }
      }
      
      return { success: true, total: photoDocs.length, processed, failed, results };
    }),

    // Regenerate ALL proposals — resets all non-deleted proposals to draft and triggers sequential regeneration
    regenerateAll: adminProcedure.mutation(async ({ ctx }) => {
      const allProposals = await db.searchProposals(ctx.user.id);
      const eligibleProposals = allProposals.filter(p => p.electricityBillId);
      
      // Reset all eligible proposals to draft (clear calculations + slides)
      let resetCount = 0;
      for (const proposal of eligibleProposals) {
        try {
          await db.updateProposal(proposal.id, {
            status: 'draft',
            slidesData: null,
            slideCount: 0,
            calculations: null,
          });
          resetCount++;
        } catch (err: any) {
          console.error(`[regenerateAll] Failed to reset proposal ${proposal.id}:`, err.message);
        }
      }
      
      return { 
        success: true, 
        totalProposals: allProposals.length,
        eligibleProposals: eligibleProposals.length,
        resetCount,
        message: `${resetCount} proposals reset to draft. Open each proposal to trigger regeneration, or use the batch generate endpoint.`
      };
    }),

    // Batch generate: sequentially regenerate all draft proposals with electricity bills
    batchGenerate: adminProcedure.mutation(async ({ ctx }) => {
      const allProposals = await db.searchProposals(ctx.user.id);
      const draftProposals = allProposals.filter(p => p.status === 'draft' && p.electricityBillId);
      
      let completed = 0;
      let failed = 0;
      const results: Array<{ id: number; title: string; status: string; slideCount?: number }> = [];
      
      // Store batch progress in memory for polling
      const batchId = `batch-${Date.now()}`;
      batchProgressStore.set(batchId, {
        total: draftProposals.length,
        completed: 0,
        failed: 0,
        current: null,
        results: [],
        status: 'running',
      });
      
      // Run generation in background (don't await — return immediately with batchId)
      (async () => {
        for (const proposal of draftProposals) {
          let batchProg = batchProgressStore.get(batchId);
          if (batchProg) batchProg.current = { id: proposal.id, title: proposal.title || 'Untitled' };
          
          try {
            const customer = await db.getCustomerById(proposal.customerId);
            if (!customer) {
              results.push({ id: proposal.id, title: proposal.title || 'Untitled', status: 'error: customer not found' });
              failed++;
              if (batchProg) { batchProg.failed = failed; batchProg.results = [...results]; }
              continue;
            }
            
            // Calculate
            const electricityBill = await getAveragedElectricityBill(proposal.customerId, proposal.electricityBillId!);
            const vppProviders = await db.getVppProvidersByState(customer.state);
            const rebates = await db.getRebatesByState(customer.state);
            const calculations = generateFullCalculations(customer, electricityBill, null, vppProviders, rebates);
            await db.updateProposal(proposal.id, { calculations, status: 'draft' });
            
            // Fetch site photos
            const customerDocs = await db.getDocumentsByCustomerId(proposal.customerId);
            
            // Auto-analyze switchboard photos that haven't been analyzed yet
            const unanalyzedSwbPhotos = customerDocs.filter(
              d => d.documentType === 'switchboard_photo' && !d.extractedData && d.fileUrl
            );
            if (unanalyzedSwbPhotos.length > 0) {
              console.log(`[batchGenerate] Auto-analyzing ${unanalyzedSwbPhotos.length} switchboard photo(s) for proposal ${proposal.id}`);
              const { analyzeSwitchboardPhoto: analyzeSwb, generateSwitchboardReport: genSwbReport } = await import('./switchboardAnalysis');
              for (const doc of unanalyzedSwbPhotos) {
                try {
                  const analysis = await analyzeSwb(doc.fileUrl);
                  const report = genSwbReport(analysis);
                  await db.updateCustomerDocument(doc.id, {
                    extractedData: JSON.stringify(analysis),
                    description: report,
                  });
                  (doc as any).extractedData = analysis;
                  console.log(`[batchGenerate] Switchboard analysis complete for doc ${doc.id}, confidence: ${analysis.confidence}%`);
                } catch (err: any) {
                  console.error(`[batchGenerate] Failed to auto-analyze switchboard photo ${doc.id}:`, err.message);
                }
              }
            }
            
            const sitePhotos = customerDocs
              .filter(d => ['switchboard_photo', 'meter_photo', 'roof_photo', 'property_photo', 'cable_run_photo'].includes(d.documentType))
              .map(d => {
                const typeLabels: Record<string, string> = {
                  switchboard_photo: 'Switchboard Photo',
                  meter_photo: 'Meter Photo',
                  roof_photo: 'Roof Photo',
                  property_photo: 'Property Photo',
                  cable_run_photo: 'Cable Run Photo',
                };
                return {
                  url: d.fileUrl,
                  caption: typeLabels[d.documentType] || 'Site Photo',
                  analysis: d.extractedData ? (typeof d.extractedData === 'string' ? JSON.parse(d.extractedData) : d.extractedData) : null,
                  documentType: d.documentType,
                };
              });
            
            // Aggregate switchboard analysis
            // Filter out low-confidence analyses (e.g. meter photos tagged as switchboard) — require >= 50% confidence
            const switchboardAnalyses = sitePhotos
              .filter(p => p.documentType === 'switchboard_photo' && p.analysis && ((p.analysis as any).confidence || 0) >= 50)
              .map(p => p.analysis);
            const switchboardAnalysis: ProposalData['switchboardAnalysis'] = switchboardAnalyses.length > 0 ? {
              boardCondition: switchboardAnalyses[0].boardCondition || 'unknown',
              mainSwitchRating: switchboardAnalyses.find((a: any) => a.mainSwitchRating)?.mainSwitchRating || null,
              mainSwitchType: switchboardAnalyses.find((a: any) => a.mainSwitchType)?.mainSwitchType || null,
              totalCircuits: switchboardAnalyses.find((a: any) => a.totalCircuits)?.totalCircuits || null,
              usedCircuits: switchboardAnalyses.find((a: any) => a.usedCircuits)?.usedCircuits || null,
              availableCircuits: switchboardAnalyses.find((a: any) => a.availableCircuits)?.availableCircuits || null,
              hasRcd: switchboardAnalyses.some((a: any) => a.hasRcd),
              rcdCount: switchboardAnalyses.find((a: any) => a.rcdCount)?.rcdCount || null,
              hasSpaceForSolar: switchboardAnalyses.some((a: any) => a.hasSpaceForSolar),
              hasSpaceForBattery: switchboardAnalyses.some((a: any) => a.hasSpaceForBattery),
              upgradeRequired: switchboardAnalyses.some((a: any) => a.upgradeRequired),
              upgradeReason: switchboardAnalyses.find((a: any) => a.upgradeReason)?.upgradeReason || null,
              warnings: switchboardAnalyses.flatMap((a: any) => a.warnings || []),
              confidence: Math.round(switchboardAnalyses.reduce((sum: number, a: any) => sum + (a.confidence || 0), 0) / switchboardAnalyses.length),
              // Enhanced installer-level fields
              circuitBreakers: switchboardAnalyses.flatMap((a: any) => a.circuitBreakers || []),
              phaseConfiguration: switchboardAnalyses.find((a: any) => a.phaseConfiguration && a.phaseConfiguration !== 'unknown')?.phaseConfiguration || 'unknown',
              phaseConfirmationSource: switchboardAnalyses.find((a: any) => a.phaseConfirmationSource)?.phaseConfirmationSource || null,
              meterType: switchboardAnalyses.find((a: any) => a.meterType)?.meterType || null,
              meterIsBidirectional: switchboardAnalyses.find((a: any) => a.meterIsBidirectional !== null && a.meterIsBidirectional !== undefined)?.meterIsBidirectional ?? null,
              meterSwapRequired: switchboardAnalyses.some((a: any) => a.meterSwapRequired),
              meterNotes: switchboardAnalyses.find((a: any) => a.meterNotes)?.meterNotes || null,
              upgradeScope: applyFallbackCostEstimates(switchboardAnalyses.flatMap((a: any) => a.upgradeScope || [])),
              proposedSolarBreakerPosition: switchboardAnalyses.find((a: any) => a.proposedSolarBreakerPosition)?.proposedSolarBreakerPosition || null,
              proposedSolarBreakerRating: switchboardAnalyses.find((a: any) => a.proposedSolarBreakerRating)?.proposedSolarBreakerRating || null,
              proposedBatteryBreakerPosition: switchboardAnalyses.find((a: any) => a.proposedBatteryBreakerPosition)?.proposedBatteryBreakerPosition || null,
              proposedBatteryBreakerRating: switchboardAnalyses.find((a: any) => a.proposedBatteryBreakerRating)?.proposedBatteryBreakerRating || null,
              proposedDcIsolatorLocation: switchboardAnalyses.find((a: any) => a.proposedDcIsolatorLocation)?.proposedDcIsolatorLocation || null,
              proposedAcIsolatorLocation: switchboardAnalyses.find((a: any) => a.proposedAcIsolatorLocation)?.proposedAcIsolatorLocation || null,
              cableAssessment: switchboardAnalyses.find((a: any) => a.cableAssessment)?.cableAssessment || null,
              existingCableSizeAdequate: switchboardAnalyses.find((a: any) => a.existingCableSizeAdequate !== null && a.existingCableSizeAdequate !== undefined)?.existingCableSizeAdequate ?? null,
            } : undefined;
            
            // === Meter Photo Analysis ===
            let batchMeterAnalysis: ProposalData['meterAnalysis'] = undefined;
            const batchMeterDocs = customerDocs.filter(d => d.documentType === 'meter_photo');
            for (const md of batchMeterDocs) {
              if (!md.extractedData && md.fileUrl) {
                try {
                  console.log(`[MeterAnalysis] Batch auto-analyzing meter photo (doc ${md.id})...`);
                  const { analyzeMeterPhoto } = await import('./meterAnalysis');
                  const meterResult = await analyzeMeterPhoto(md.fileUrl);
                  console.log(`[MeterAnalysis] Batch analysis complete — confidence: ${meterResult.confidence}%`);
                  await db.updateCustomerDocument(md.id, { extractedData: meterResult });
                  md.extractedData = meterResult as any;
                } catch (err) {
                  console.error(`[MeterAnalysis] Batch analysis failed (doc ${md.id}):`, err);
                }
              }
            }
            for (const md of batchMeterDocs) {
              if (md.extractedData) {
                const parsed = typeof md.extractedData === 'string' ? JSON.parse(md.extractedData) : md.extractedData;
                if (parsed.confidence >= 30 && (!batchMeterAnalysis || parsed.confidence > batchMeterAnalysis.confidence)) {
                  batchMeterAnalysis = parsed;
                }
              }
            }

            // === Cable Run Photo Analysis ===
            const batchCableRunDocs = customerDocs.filter(d => d.documentType === 'cable_run_photo');
            let batchCableRunAnalysis: ProposalData['cableRunAnalysis'] = undefined;
            for (const crd of batchCableRunDocs) {
              if (!crd.extractedData && crd.fileUrl) {
                try {
                  const { analyzeCableRunPhoto } = await import('./cableRunAnalysis');
                  const crAnalysis = await analyzeCableRunPhoto(crd.fileUrl);
                  await db.updateCustomerDocument(crd.id, { extractedData: JSON.stringify(crAnalysis) });
                  if (crAnalysis.confidence >= 40 && crAnalysis.cableRunDistanceMetres) {
                    batchCableRunAnalysis = { ...crAnalysis, photoUrl: crd.fileUrl };
                  }
                } catch (e) { console.error('[Cable Run] Batch analysis failed:', e); }
              } else if (crd.extractedData) {
                const parsed = typeof crd.extractedData === 'string' ? JSON.parse(crd.extractedData) : crd.extractedData;
                if (parsed.confidence >= 40 && parsed.cableRunDistanceMetres) {
                  batchCableRunAnalysis = { ...parsed, photoUrl: crd.fileUrl };
                }
              }
            }

            // === Inject Cable Run Cost into Upgrade Scope ===
            if (switchboardAnalysis && batchCableRunAnalysis?.cableRunDistanceMetres) {
              const cableRunCostItem = calculateCableRunCostItem(
                batchCableRunAnalysis.cableRunDistanceMetres,
                switchboardAnalysis.phaseConfiguration || 'single'
              );
              if (cableRunCostItem) {
                switchboardAnalysis.upgradeScope = [...(switchboardAnalysis.upgradeScope || []), cableRunCostItem];
              }
            }

            // === Cable Sizing Calculation ===
            let batchCableSizing: ProposalData['cableSizing'] = undefined;
            const batchPhaseConfig = switchboardAnalysis?.phaseConfiguration || 'single';
            if (batchCableRunAnalysis?.cableRunDistanceMetres) {
              const { calculateCableSizing } = await import('./cableRunAnalysis');
              const calc2 = calculations as ProposalCalculations;
              const invKw2 = calc2.recommendedSolarKw || 10;
              batchCableSizing = calculateCableSizing(invKw2, batchPhaseConfig, batchCableRunAnalysis.cableRunDistanceMetres, calc2.recommendedBatteryKwh);
            }

            // === Roof Photo Auto-Analysis ===
            let batchRoofAnalysis: ProposalData['roofAnalysis'] = undefined;
            const batchRoofDocs = customerDocs.filter(d => d.documentType === 'roof_photo');
            for (const rd of batchRoofDocs) {
              if (!rd.extractedData && rd.fileUrl) {
                try {
                  console.log(`[RoofAnalysis] Batch auto-analyzing roof photo (doc ${rd.id})...`);
                  const { analyzeRoofPhoto } = await import('./roofAnalysis');
                  const roofResult = await analyzeRoofPhoto(rd.fileUrl, customer.state);
                  console.log(`[RoofAnalysis] Batch analysis complete — confidence: ${roofResult.confidence}%`);
                  await db.updateCustomerDocument(rd.id, { extractedData: roofResult });
                  rd.extractedData = roofResult as any;
                } catch (err) {
                  console.error(`[RoofAnalysis] Batch analysis failed (doc ${rd.id}):`, err);
                }
              }
            }
            for (const rd of batchRoofDocs) {
              if (rd.extractedData) {
                const parsed = typeof rd.extractedData === 'string' ? JSON.parse(rd.extractedData) : rd.extractedData;
                if (parsed.confidence >= 30 && parsed.primaryOrientation && (!batchRoofAnalysis || parsed.confidence > (batchRoofAnalysis as any).confidence)) {
                  batchRoofAnalysis = parsed;
                }
              }
            }

            // Check for uploaded solar proposal specs
            const solarProposalDoc2 = customerDocs.find(d => d.documentType === 'solar_proposal_pdf' && d.extractedData);
            const solarProposalSpecs2 = solarProposalDoc2?.extractedData 
              ? (typeof solarProposalDoc2.extractedData === 'string' ? JSON.parse(solarProposalDoc2.extractedData) : solarProposalDoc2.extractedData)
              : undefined;
            
            const calc = calculations as ProposalCalculations;
            const proposalData = buildProposalData(customer, calc, false, {
              proposalNotes: (proposal as any).proposalNotes || undefined,
              sitePhotos: sitePhotos.length > 0 ? sitePhotos : undefined,
              switchboardAnalysis,
              meterAnalysis: batchMeterAnalysis,
              cableRunAnalysis: batchCableRunAnalysis,
              cableSizing: batchCableSizing,
              solarProposalSpecs: solarProposalSpecs2,
              costOverrides: (proposal as any).costOverrides || undefined,
              roofAnalysis: batchRoofAnalysis,
            });
            const allSlides = generateSlides(proposalData);
            
            // Initialize progress tracking
            const slideInfo = allSlides.map(s => ({ type: s.type, title: s.title }));
            initProgress(proposal.id, slideInfo);
            
            const slidesData: Array<{ type: string; title: string; html: string; s3Key?: string; isIncluded: boolean }> = 
              allSlides.map(s => ({ type: s.type, title: s.title, html: '', isIncluded: true }));
            
            // Generate each slide
            for (let i = 0; i < allSlides.length; i++) {
              updateSlideProgress(proposal.id, i, { status: 'generating' });
              
              let slideHtml = '';
              try {
                const enrichedSlide = await enrichSlideWithNarrative(allSlides[i], proposalData);
                slideHtml = generateSlideHTML(enrichedSlide);
                updateSlideProgress(proposal.id, i, { status: 'complete', html: slideHtml });
              } catch (err: any) {
                try {
                  slideHtml = generateSlideHTML(allSlides[i]);
                  updateSlideProgress(proposal.id, i, { status: 'complete', html: slideHtml });
                } catch (err2: any) {
                  slideHtml = `<div style="width:1920px;height:1080px;background:#000;display:flex;align-items:center;justify-content:center;"><p style="color:#808285;">Slide generation error</p></div>`;
                  updateSlideProgress(proposal.id, i, { status: 'complete', html: slideHtml });
                }
              }
              
              // Upload to S3
              try {
                const s3Key = `slides/${proposal.id}/slide-${i}-${Date.now()}.html`;
                await storagePut(s3Key, slideHtml, 'text/html');
                slidesData[i].s3Key = s3Key;
                slidesData[i].html = '';
              } catch (s3Err: any) {
                slidesData[i].html = slideHtml;
              }
              
              // 2s delay between slides
              if (i < allSlides.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
              }
            }
            
            // Save to DB
            const includedCount = slidesData.filter(s => s.s3Key || s.html).length;
            await db.updateProposal(proposal.id, {
              slidesData,
              slideCount: includedCount,
              status: 'generated',
            });
            setGenerationStatus(proposal.id, 'complete');
            
            results.push({ id: proposal.id, title: proposal.title || 'Untitled', status: 'success', slideCount: includedCount });
            completed++;
            console.log(`[batchGenerate] Completed proposal ${proposal.id} (${completed}/${draftProposals.length})`);
          } catch (err: any) {
            results.push({ id: proposal.id, title: proposal.title || 'Untitled', status: `error: ${err.message}` });
            failed++;
            console.error(`[batchGenerate] Failed proposal ${proposal.id}:`, err.message);
          }
          
          batchProg = batchProgressStore.get(batchId);
          if (batchProg) {
            batchProg.completed = completed;
            batchProg.failed = failed;
            batchProg.results = [...results];
          }
        }
        
        const finalProg = batchProgressStore.get(batchId);
        if (finalProg) {
          finalProg.status = 'complete';
          finalProg.current = null;
        }
        console.log(`[batchGenerate] Batch complete: ${completed} succeeded, ${failed} failed out of ${draftProposals.length}`);
      })();
      
      return { 
        success: true, 
        batchId,
        totalDraft: draftProposals.length,
        message: `Batch generation started for ${draftProposals.length} proposals. Poll batchProgress for updates.`
      };
    }),

    // Poll batch generation progress
    batchProgress: adminProcedure
      .input(z.object({ batchId: z.string() }))
      .query(async ({ input }) => {
        const progress = batchProgressStore.get(input.batchId);
        if (!progress) {
          return { status: 'not_found' as const, total: 0, completed: 0, failed: 0, current: null, results: [] };
        }
        return progress;
      }),
  }),
});

export type AppRouter = typeof appRouter;

// ============================================
// HELPER FUNCTIONS
// ============================================

import { ProposalCalculations, SlideData } from "../drizzle/schema";

/**
 * Enrich a slide with LLM-generated narrative content.
 * Maps slide types to their narrative generators and injects
 * the generated content into the slide's content object.
 */
async function enrichSlideWithNarrative(slide: SlideContent, data: ProposalData): Promise<SlideContent> {
  const enriched = { ...slide, content: { ...slide.content } };
  
  try {
    switch (slide.type) {
      case 'executive_summary': {
        const narrative = await narrativeExecutiveSummary(data);
        enriched.content.narrativeOverview = narrative.overview;
        enriched.content.strategicRecommendation = narrative.financialCard;
        break;
      }
      case 'bill_analysis': {
        const narrative = await narrativeBillAnalysis(data);
        enriched.content.narrative = narrative;
        break;
      }
      case 'bill_breakdown': {
        const narrative = await narrativeBillAnalysis(data);
        enriched.content.narrative = narrative;
        break;
      }
      case 'seasonal_usage': {
        const narrative = await narrativeUsageAnalysis(data);
        enriched.content.narrative = narrative;
        break;
      }
      case 'annual_consumption': {
        const narrative = await narrativeUsageAnalysis(data);
        enriched.content.narrative = narrative;
        break;
      }
      case 'projected_annual_cost': {
        const narrative = await narrativeYearlyProjection(data);
        enriched.content.narrative = narrative;
        break;
      }
      case 'battery_benefits': {
        // No LLM narrative needed — content is data-driven
        break;
      }
      case 'battery_considerations': {
        // No LLM narrative needed — content is data-driven
        break;
      }
      case 'battery_storage': {
        const narrative = await narrativeBatteryOption(data, 1);
        enriched.content.narrativeWhy = narrative.whyRecommend;
        break;
      }
      case 'solar_pv': {
        const narrative = await narrativeStrategicAssessment(data);
        enriched.content.narrative = narrative;
        break;
      }
      case 'financial_impact': {
        const narrative = await narrativeInvestmentAnalysis(data);
        enriched.content.narrative = narrative;
        break;
      }
      case 'environmental_impact': {
        const narrative = await narrativeEnvironmentalImpact(data);
        enriched.content.narrative = narrative;
        break;
      }
      case 'strategic_pathway': {
        const narrative = await narrativeRoadmap(data);
        enriched.content.narrative = narrative;
        break;
      }
      case 'vpp_recommendation': {
        const narrative = await narrativeVPPRecommendation(data);
        enriched.content.narrative = narrative;
        break;
      }
      case 'financial_impact_analysis': {
        const narrative = await narrativeInvestmentAnalysis(data);
        enriched.content.narrative = narrative;
        break;
      }
      // Slides without narrative (cover, contact, battery_benefits, battery_considerations)
      // just pass through without LLM enrichment
      default:
        break;
    }
  } catch (err: any) {
    console.error(`[enrichSlide] Failed to enrich ${slide.type}:`, err.message);
    // Return original slide on error — fallback to data-only rendering
  }
  
  return enriched;
}

/**
 * Reusable helper to aggregate site photos, switchboard analysis, cable run analysis,
 * and cable sizing from customer documents. Used by generateProgressive, batchGenerate,
 * and all export paths (PDF, PPTX, native PDF).
 */
async function aggregateSiteData(customerId: number, calc: ProposalCalculations, customerState?: string) {
  const customerDocs = await db.getDocumentsByCustomerId(customerId);
  
  // Build site photos array
  const sitePhotos = customerDocs
    .filter(d => ['switchboard_photo', 'meter_photo', 'roof_photo', 'property_photo', 'cable_run_photo'].includes(d.documentType))
    .map(d => {
      const typeLabels: Record<string, string> = {
        switchboard_photo: 'Switchboard Photo',
        meter_photo: 'Meter Photo',
        roof_photo: 'Roof Photo',
        property_photo: 'Property Photo',
        cable_run_photo: 'Cable Run Photo',
      };
      return {
        url: d.fileUrl,
        caption: typeLabels[d.documentType] || 'Site Photo',
        analysis: d.extractedData ? (typeof d.extractedData === 'string' ? JSON.parse(d.extractedData) : d.extractedData) : null,
        documentType: d.documentType,
      };
    });
  
  // Aggregate switchboard analysis (confidence >= 50%)
  const switchboardAnalyses = sitePhotos
    .filter(p => p.documentType === 'switchboard_photo' && p.analysis && ((p.analysis as any).confidence || 0) >= 50)
    .map(p => p.analysis);
  const switchboardAnalysis: ProposalData['switchboardAnalysis'] = switchboardAnalyses.length > 0 ? {
    boardCondition: switchboardAnalyses[0].boardCondition || 'unknown',
    mainSwitchRating: switchboardAnalyses.find((a: any) => a.mainSwitchRating)?.mainSwitchRating || null,
    mainSwitchType: switchboardAnalyses.find((a: any) => a.mainSwitchType)?.mainSwitchType || null,
    totalCircuits: switchboardAnalyses.find((a: any) => a.totalCircuits)?.totalCircuits || null,
    usedCircuits: switchboardAnalyses.find((a: any) => a.usedCircuits)?.usedCircuits || null,
    availableCircuits: switchboardAnalyses.find((a: any) => a.availableCircuits)?.availableCircuits || null,
    hasRcd: switchboardAnalyses.some((a: any) => a.hasRcd),
    rcdCount: switchboardAnalyses.find((a: any) => a.rcdCount)?.rcdCount || null,
    hasSpaceForSolar: switchboardAnalyses.some((a: any) => a.hasSpaceForSolar),
    hasSpaceForBattery: switchboardAnalyses.some((a: any) => a.hasSpaceForBattery),
    upgradeRequired: switchboardAnalyses.some((a: any) => a.upgradeRequired),
    upgradeReason: switchboardAnalyses.find((a: any) => a.upgradeReason)?.upgradeReason || null,
    warnings: switchboardAnalyses.flatMap((a: any) => a.warnings || []),
    confidence: Math.round(switchboardAnalyses.reduce((sum: number, a: any) => sum + (a.confidence || 0), 0) / switchboardAnalyses.length),
    circuitBreakers: switchboardAnalyses.flatMap((a: any) => a.circuitBreakers || []),
    phaseConfiguration: switchboardAnalyses.find((a: any) => a.phaseConfiguration && a.phaseConfiguration !== 'unknown')?.phaseConfiguration || 'unknown',
    phaseConfirmationSource: switchboardAnalyses.find((a: any) => a.phaseConfirmationSource)?.phaseConfirmationSource || null,
    meterType: switchboardAnalyses.find((a: any) => a.meterType)?.meterType || null,
    meterIsBidirectional: switchboardAnalyses.find((a: any) => a.meterIsBidirectional !== null && a.meterIsBidirectional !== undefined)?.meterIsBidirectional ?? null,
    meterSwapRequired: switchboardAnalyses.some((a: any) => a.meterSwapRequired),
    meterNotes: switchboardAnalyses.find((a: any) => a.meterNotes)?.meterNotes || null,
    upgradeScope: applyFallbackCostEstimates(switchboardAnalyses.flatMap((a: any) => a.upgradeScope || [])),
    proposedSolarBreakerPosition: switchboardAnalyses.find((a: any) => a.proposedSolarBreakerPosition)?.proposedSolarBreakerPosition || null,
    proposedSolarBreakerRating: switchboardAnalyses.find((a: any) => a.proposedSolarBreakerRating)?.proposedSolarBreakerRating || null,
    proposedBatteryBreakerPosition: switchboardAnalyses.find((a: any) => a.proposedBatteryBreakerPosition)?.proposedBatteryBreakerPosition || null,
    proposedBatteryBreakerRating: switchboardAnalyses.find((a: any) => a.proposedBatteryBreakerRating)?.proposedBatteryBreakerRating || null,
    proposedDcIsolatorLocation: switchboardAnalyses.find((a: any) => a.proposedDcIsolatorLocation)?.proposedDcIsolatorLocation || null,
    proposedAcIsolatorLocation: switchboardAnalyses.find((a: any) => a.proposedAcIsolatorLocation)?.proposedAcIsolatorLocation || null,
    cableAssessment: switchboardAnalyses.find((a: any) => a.cableAssessment)?.cableAssessment || null,
    existingCableSizeAdequate: switchboardAnalyses.find((a: any) => a.existingCableSizeAdequate !== null && a.existingCableSizeAdequate !== undefined)?.existingCableSizeAdequate ?? null,
  } : undefined;
  
  // Meter analysis — auto-analyze unanalyzed meter photos, aggregate results
  let meterAnalysis: ProposalData['meterAnalysis'] = undefined;
  const meterDocs = customerDocs.filter(d => d.documentType === 'meter_photo');
  for (const md of meterDocs) {
    if (!md.extractedData && md.fileUrl) {
      try {
        console.log(`[MeterAnalysis] Auto-analyzing meter photo (doc ${md.id})...`);
        const { analyzeMeterPhoto } = await import('./meterAnalysis');
        const meterResult = await analyzeMeterPhoto(md.fileUrl);
        console.log(`[MeterAnalysis] Analysis complete — confidence: ${meterResult.confidence}%, type: ${meterResult.meterType}, swap required: ${meterResult.meterSwapRequired}`);
        await db.updateCustomerDocument(md.id, { extractedData: meterResult });
        md.extractedData = meterResult as any;
      } catch (err) {
        console.error(`[MeterAnalysis] Failed to analyze meter photo (doc ${md.id}):`, err);
      }
    }
  }
  // Pick the highest-confidence meter analysis
  for (const md of meterDocs) {
    if (md.extractedData) {
      const parsed = typeof md.extractedData === 'string' ? JSON.parse(md.extractedData) : md.extractedData;
      if (parsed.confidence >= 30 && (!meterAnalysis || parsed.confidence > meterAnalysis.confidence)) {
        meterAnalysis = parsed;
      }
    }
  }

  // Cable run analysis (use existing extracted data)
  let cableRunAnalysis: ProposalData['cableRunAnalysis'] = undefined;
  const cableRunDocs = customerDocs.filter(d => d.documentType === 'cable_run_photo');
  for (const crd of cableRunDocs) {
    if (crd.extractedData) {
      const parsed = typeof crd.extractedData === 'string' ? JSON.parse(crd.extractedData) : crd.extractedData;
      if (parsed.confidence >= 40 && parsed.cableRunDistanceMetres) {
        cableRunAnalysis = { ...parsed, photoUrl: crd.fileUrl };
      }
    }
  }
  
  // === Inject Cable Run Cost into Upgrade Scope ===
  if (switchboardAnalysis && cableRunAnalysis?.cableRunDistanceMetres) {
    const cableRunCostItem = calculateCableRunCostItem(
      cableRunAnalysis.cableRunDistanceMetres,
      switchboardAnalysis.phaseConfiguration || 'single'
    );
    if (cableRunCostItem) {
      switchboardAnalysis.upgradeScope = [...(switchboardAnalysis.upgradeScope || []), cableRunCostItem];
    }
  }

  // Cable sizing calculation
  let cableSizing: ProposalData['cableSizing'] = undefined;
  const phaseConfig = switchboardAnalysis?.phaseConfiguration || 'single';
  if (cableRunAnalysis?.cableRunDistanceMetres) {
    const { calculateCableSizing } = await import('./cableRunAnalysis');
    const spDoc = customerDocs.find(d => d.documentType === 'solar_proposal_pdf' && d.extractedData);
    const spData = spDoc?.extractedData ? (typeof spDoc.extractedData === 'string' ? JSON.parse(spDoc.extractedData) : spDoc.extractedData) : null;
    const invKw = spData?.inverterSizeW ? spData.inverterSizeW / 1000 : (calc.recommendedSolarKw || 10);
    cableSizing = calculateCableSizing(invKw, phaseConfig, cableRunAnalysis.cableRunDistanceMetres, calc.recommendedBatteryKwh);
  }
  
  // Roof photo analysis — auto-analyze unanalyzed roof photos
  let roofAnalysis: ProposalData['roofAnalysis'] = undefined;
  const roofDocs = customerDocs.filter(d => d.documentType === 'roof_photo');
  for (const rd of roofDocs) {
    if (!rd.extractedData && rd.fileUrl) {
      try {
        console.log(`[RoofAnalysis] Auto-analyzing roof photo (doc ${rd.id})...`);
        const { analyzeRoofPhoto } = await import('./roofAnalysis');
        const roofResult = await analyzeRoofPhoto(rd.fileUrl, customerState);
        console.log(`[RoofAnalysis] Analysis complete — confidence: ${roofResult.confidence}%, orientation: ${roofResult.primaryOrientation}, shading: ${roofResult.shadingLevel}`);
        await db.updateCustomerDocument(rd.id, { extractedData: roofResult });
        rd.extractedData = roofResult as any;
      } catch (err) {
        console.error(`[RoofAnalysis] Failed to analyze roof photo (doc ${rd.id}):`, err);
      }
    }
  }
  // Pick the highest-confidence roof analysis
  for (const rd of roofDocs) {
    if (rd.extractedData) {
      const parsed = typeof rd.extractedData === 'string' ? JSON.parse(rd.extractedData) : rd.extractedData;
      if (parsed.confidence >= 30 && parsed.primaryOrientation && (!roofAnalysis || parsed.confidence > (roofAnalysis as any).confidence)) {
        roofAnalysis = parsed;
      }
    }
  }

  // Solar proposal specs
  const solarProposalDoc = customerDocs.find(d => d.documentType === 'solar_proposal_pdf' && d.extractedData);
  const solarProposalSpecs = solarProposalDoc?.extractedData 
    ? (typeof solarProposalDoc.extractedData === 'string' ? JSON.parse(solarProposalDoc.extractedData) : solarProposalDoc.extractedData)
    : undefined;
  
  return {
    sitePhotos: sitePhotos.length > 0 ? sitePhotos : undefined,
    switchboardAnalysis,
    meterAnalysis,
    cableRunAnalysis,
    cableSizing,
    solarProposalSpecs,
    roofAnalysis,
  };
}

function buildProposalData(
  customer: Customer,
  calc: ProposalCalculations,
  _hasGas: boolean,
  options?: {
    proposalNotes?: string;
    regeneratePrompt?: string;
    sitePhotos?: Array<{ url: string; caption: string }>;
    switchboardAnalysis?: ProposalData['switchboardAnalysis'];
    cableRunAnalysis?: ProposalData['cableRunAnalysis'];
    cableSizing?: ProposalData['cableSizing'];
    meterAnalysis?: ProposalData['meterAnalysis'];
    solarProposalSpecs?: any; // Extracted specs from uploaded solar proposal
    costOverrides?: Record<string, string>; // Installer cost overrides keyed by scope item name
    roofAnalysis?: ProposalData['roofAnalysis']; // Roof photo analysis data
  }
): ProposalData {
  const hasGas = false; // Gas features removed
  // Use the top-ranked VPP provider from the comparison, falling back to the selectedVppProvider field
  const topVpp = calc.vppProviderComparison?.[0];
  const vppName = topVpp?.provider || (typeof calc.selectedVppProvider === 'object' ? (calc.selectedVppProvider as any)?.name : calc.selectedVppProvider) || 'Origin';
  const vppProgram = topVpp?.programName || (typeof calc.selectedVppProvider === 'object' ? (calc.selectedVppProvider as any)?.programName : '') || 'Loop VPP';
  
  // Solar Proposal Override: If a solar proposal has been uploaded and analysed,
  // use the exact specs from the proposal instead of calculated recommendations
  const sp = options?.solarProposalSpecs;
  const solarKw = sp?.solarSystemSizeKw || calc.recommendedSolarKw || 10;
  const panelCount = sp?.solarPanelCount || calc.solarPanelCount || 20;
  const panelWattage = sp?.solarPanelWattage || calc.solarPanelWattage || 440;
  const panelBrand = sp?.solarPanelBrand 
    ? `${sp.solarPanelBrand}${sp.solarPanelModel ? ` ${sp.solarPanelModel}` : ''}`
    : (calc.solarPanelBrand || 'Trina Solar Vertex S+');
  const batteryKwh = sp?.batterySizeKwh 
    ? (sp.batterySizeKwh * (sp.batteryCount || 1))  // Multiply per-unit kWh by count
    : (calc.recommendedBatteryKwh || 15);
  const batteryBrand = sp?.batteryBrand 
    ? `${sp.batteryBrand}${sp.batteryModel ? ` ${sp.batteryModel}` : ''}`
    : 'Sigenergy SigenStor';
  const inverterKw = sp?.inverterSizeW 
    ? sp.inverterSizeW / 1000 
    : calculateInverterSize(solarKw).inverterKw;
  const inverterBrand = sp?.inverterBrand 
    ? `${sp.inverterBrand}${sp.inverterModel ? ` ${sp.inverterModel}` : ''}`
    : 'Sigenergy';
  
  return {
    customerName: customer.fullName,
    address: customer.address || '',
    state: customer.state,
    retailer: calc.billRetailer || 'Current Retailer',
    dailyUsageKwh: calc.dailyAverageKwh || 0,
    annualUsageKwh: calc.yearlyUsageKwh || 0,
    supplyChargeCentsPerDay: (calc.billDailySupplyCharge || 1.20) * 100,
    usageRateCentsPerKwh: calc.billPeakRateCents || 30,
    feedInTariffCentsPerKwh: calc.billFeedInTariffCents || 5,
    controlledLoadRateCentsPerKwh: calc.billOffPeakRateCents,
    annualCost: calc.projectedAnnualCost || 0,
    billPeriodStart: calc.billPeriodStart,
    billPeriodEnd: calc.billPeriodEnd,
    billDays: calc.billDays,
    billTotalAmount: calc.billTotalAmount,
    billTotalUsageKwh: calc.billTotalUsageKwh,
    billPeakUsageKwh: calc.billPeakUsageKwh,
    billOffPeakUsageKwh: calc.billOffPeakUsageKwh,
    billShoulderUsageKwh: calc.billShoulderUsageKwh,
    billSolarExportsKwh: calc.billSolarExportsKwh,
    billPeakRateCents: calc.billPeakRateCents,
    billOffPeakRateCents: calc.billOffPeakRateCents,
    billShoulderRateCents: calc.billShoulderRateCents,
    dailyAverageCost: calc.dailyAverageCost,
    annualSupplyCharge: calc.annualSupplyCharge,
    annualUsageCharge: calc.annualUsageCharge,
    annualSolarCredit: calc.annualSolarCredit,
    monthlyUsageKwh: calc.monthlyUsageKwh,
    hasGas,
    gasAnnualMJ: calc.gasBillUsageMj ? (calc.gasBillUsageMj / (calc.gasBillDays || 90)) * 365 : undefined,
    gasAnnualCost: calc.gasAnnualCost,
    gasDailySupplyCharge: calc.gasBillDailySupplyCharge,
    gasUsageRate: calc.gasBillRateCentsMj,
    gasCO2Emissions: calc.gasCo2Emissions,
    gasBillRetailer: calc.gasBillRetailer,
    gasBillPeriodStart: calc.gasBillPeriodStart,
    gasBillPeriodEnd: calc.gasBillPeriodEnd,
    gasBillDays: calc.gasBillDays,
    gasBillTotalAmount: calc.gasBillTotalAmount,
    gasBillUsageMj: calc.gasBillUsageMj,
    gasBillRateCentsMj: calc.gasBillRateCentsMj,
    gasDailyGasCost: calc.gasDailyGasCost,
    gasAnnualSupplyCharge: calc.gasAnnualSupplyCharge,
    gasKwhEquivalent: calc.gasKwhEquivalent,
    gasAppliances: customer.gasAppliances as any,
    solarSizeKw: solarKw,
    panelCount,
    panelWattage,
    panelBrand,
    batterySizeKwh: batteryKwh,
    batteryBrand,
    inverterSizeKw: inverterKw,
    inverterBrand,
    estimatedAnnualProductionKwh: sp?.estimatedAnnualProductionKwh || undefined,
    systemCost: calc.totalInvestment || 25000,
    rebateAmount: calc.totalRebates || 3000,
    netInvestment: calc.netInvestment || 22000,
    annualSavings: calc.totalAnnualSavings || 3000,
    paybackYears: calc.paybackYears || 7,
    tenYearSavings: calc.tenYearSavings || (calc.totalAnnualSavings || 3000) * 10,
    twentyFiveYearSavings: calc.twentyFiveYearSavings,
    vppProvider: vppName,
    vppProgram,
    vppAnnualValue: calc.vppAnnualValue || 300,
    hasGasBundle: true,
    vppDailyCreditAnnual: calc.vppDailyCreditAnnual,
    vppEventPaymentsAnnual: calc.vppEventPaymentsAnnual,
    vppBundleDiscount: calc.vppBundleDiscount,
    vppProviderComparison: calc.vppProviderComparison,
    existingSolar: (customer.existingSolar as 'none' | 'under_5_years' | 'over_5_years') || 'none',
    hasEV: customer.hasEV ?? false,
    evAnnualKm: calc.evKmPerYear || 10000,
    evAnnualSavings: calc.evAnnualSavings,
    evPetrolCost: calc.evPetrolCost,
    evGridChargeCost: calc.evGridChargeCost,
    evSolarChargeCost: calc.evSolarChargeCost,
    evConsumptionPer100km: calc.evConsumptionPer100km,
    evPetrolPricePerLitre: calc.evPetrolPricePerLitre,
    hasPool: customer.hasPool ?? false,
    hasPoolPump: customer.hasPool ?? false,
    hasAppliances: !!(customer.hasPool || customer.hasEV || (customer as any).hasAppliances),
    poolPumpSavings: calc.poolHeatPumpSavings,
    poolRecommendedKw: calc.poolRecommendedKw,
    poolAnnualOperatingCost: calc.poolAnnualOperatingCost,
    hasHeatPump: false,
    heatPumpSavings: calc.hotWaterSavings,
    hotWaterCurrentGasCost: calc.hotWaterCurrentGasCost,
    hotWaterHeatPumpCost: calc.hotWaterHeatPumpCost,
    hotWaterDailySupplySaved: calc.hotWaterDailySupplySaved,
    heatingCoolingSavings: calc.heatingCoolingSavings,
    heatingCurrentGasCost: calc.heatingCurrentGasCost,
    heatingRcAcCost: calc.heatingRcAcCost,
    inductionSavings: calc.cookingSavings,
    cookingCurrentGasCost: calc.cookingCurrentGasCost,
    cookingInductionCost: calc.cookingInductionCost,
    investmentSolar: calc.investmentSolar,
    investmentBattery: calc.investmentBattery,
    investmentHeatPumpHw: calc.investmentHeatPumpHw,
    investmentRcAc: calc.investmentRcAc,
    investmentInduction: calc.investmentInduction,
    investmentEvCharger: calc.investmentEvCharger,
    investmentPoolHeatPump: calc.investmentPoolHeatPump,
    solarRebateAmount: calc.solarRebateAmount,
    batteryRebateAmount: calc.batteryRebateAmount,
    heatPumpHwRebateAmount: calc.heatPumpHwRebateAmount,
    heatPumpAcRebateAmount: calc.heatPumpAcRebateAmount,
    electrificationTotalCost: calc.totalInvestment,
    electrificationTotalRebates: calc.totalRebates,
    electrificationNetCost: calc.netInvestment,
    co2ReductionTonnes: calc.co2ReductionTonnes || 5,
    co2CurrentTonnes: calc.co2CurrentTonnes,
    co2ProjectedTonnes: calc.co2ProjectedTonnes,
    co2ReductionPercent: calc.co2ReductionPercent,
    proposalNotes: options?.proposalNotes,
    regeneratePrompt: options?.regeneratePrompt,
    sitePhotos: options?.sitePhotos,
    switchboardAnalysis: options?.switchboardAnalysis && options.costOverrides
      ? {
          ...options.switchboardAnalysis,
          upgradeScope: (options.switchboardAnalysis.upgradeScope || []).map(item => {
            const key = item.item.toLowerCase().replace(/[^a-z0-9]+/g, '_');
            const override = options!.costOverrides![key];
            return override ? { ...item, estimatedCost: override } : item;
          }),
        }
      : options?.switchboardAnalysis,
    cableRunAnalysis: options?.cableRunAnalysis,
    cableSizing: options?.cableSizing,
    meterAnalysis: options?.meterAnalysis,
    roofAnalysis: options?.roofAnalysis,
  };
}

// Type alias for Customer
import type { Customer } from "../drizzle/schema";
