import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { storagePut } from "./storage";
import { extractElectricityBillData, validateElectricityBillData } from "./billExtraction";
import { generateFullCalculations } from "./calculations";
import { generateSlides, generateSlideHTML, type ProposalData, type SlideContent } from './slideGenerator';
import { narrativeExecutiveSummary, narrativeBillAnalysis, narrativeUsageAnalysis, narrativeYearlyProjection, narrativeStrategicAssessment, narrativeBatteryOption, narrativeVPPRecommendation, narrativeInvestmentAnalysis, narrativeEnvironmentalImpact, narrativeFinalRecommendation, narrativeRoadmap } from './slideNarrative';
import { generatePptx } from "./pptxGenerator";
import { generatePdf as generateNativePdf } from "./pdfGenerator";
import { nanoid } from "nanoid";
import { initProgress, updateSlideProgress, setGenerationStatus, getProgress, clearProgress } from "./generationProgress";


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
        hasExistingSolar: z.boolean().optional(),
        existingSolarSize: z.number().optional(),
        existingSolarAge: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createCustomer({
          ...input,
          userId: ctx.user.id,
          existingSolarSize: input.existingSolarSize?.toString(),
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
        hasExistingSolar: z.boolean().optional(),
        existingSolarSize: z.number().optional(),
        existingSolarAge: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateCustomer(id, {
          ...data,
          existingSolarSize: data.existingSolarSize?.toString(),
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
          status: 'draft',
        });
        
        // Auto-calculate only (NO old template slides) — LLM progressive generation happens on ProposalDetail
        if (input.electricityBillId) {
          try {
            const electricityBill = await db.getBillById(input.electricityBillId);
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
        
        const electricityBill = await db.getBillById(proposal.electricityBillId);
        if (!electricityBill) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Electricity bill not found' });
        }
        
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
          const electricityBill = await db.getBillById(proposal.electricityBillId);
          if (!electricityBill) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Electricity bill not found' });
          }
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
        const proposalData = buildProposalData(customer, calc, false);
        const allSlides = generateSlides(proposalData); // Only active/included slides
        
        // Initialize progress tracking with ALL active slides
        const slideInfo = allSlides.map(s => ({ type: s.type, title: s.title }));
        initProgress(input.proposalId, slideInfo);
        
        // Build slidesData directly from allSlides (no more old generateSlidesData)
        const slidesData: Array<{ type: string; title: string; html: string; isIncluded: boolean }> = 
          allSlides.map(s => ({ type: s.type, title: s.title, html: '', isIncluded: true }));
        
        // Process each slide — LLM-powered narrative enrichment
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
              // Generate a minimal placeholder slide so we don't leave a blank gap
              const placeholderHtml = `<div style="width:1920px;height:1080px;background:#000;display:flex;align-items:center;justify-content:center;font-family:sans-serif;color:#808285;"><div style="text-align:center;"><p style="font-size:32px;color:#fff;margin-bottom:16px;">${allSlides[i].title || 'Slide'}</p><p style="font-size:18px;">Content generation in progress</p></div></div>`;
              slideHtml = placeholderHtml;
              updateSlideProgress(input.proposalId, i, {
                status: 'complete',
                html: placeholderHtml,
              });
              console.error(`[generateSlideHTML] Error generating ${allSlides[i].type}, using placeholder:`, err2.message);
            }
          }
          
          // Store HTML directly in slidesData
          slidesData[i].html = slideHtml;
        }
        
        // Save to DB — always mark as generated since all slides have been attempted
        const includedCount = slidesData.filter(s => s.html).length;
        await db.updateProposal(input.proposalId, {
          slidesData,
          slideCount: includedCount,
          status: 'generated',
        });
        
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
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateProposal(id, data);
        return { success: true };
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
    
    getSlideHtml: protectedProcedure
      .input(z.object({
        proposalId: z.number(),
        slideIndex: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const proposal = await db.getProposalById(input.proposalId);
        if (!proposal) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Proposal not found' });
        }
        
        // Return stored LLM-generated HTML from slidesData in DB
        const slidesData = (proposal.slidesData || []) as import('../drizzle/schema').SlideData[];
        // Only return slides that are included AND have generated HTML
        const includedSlides = slidesData.filter(s => s.isIncluded && s.html);
        
        if (includedSlides.length === 0 || !includedSlides.some(s => s.html)) {
          // No LLM-generated slides yet — need to run progressive generation first
          return { slides: [], totalSlides: 0 };
        }
        
        if (input.slideIndex !== undefined) {
          const slide = includedSlides[input.slideIndex];
          if (!slide || !slide.html) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Slide not found' });
          }
          return {
            html: slide.html,
            slide,
            totalSlides: includedSlides.length,
          };
        }
        
        // Return all stored LLM-generated slide HTML
        return {
          slides: includedSlides.map((s, idx) => ({
            id: idx + 1,
            type: s.type,
            title: s.title,
            html: s.html || '',
          })),
          totalSlides: includedSlides.length,
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
          const electricityBill = await db.getBillById(proposal.electricityBillId);
          if (!electricityBill) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Electricity bill not found' });
          }
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
        const proposalData = buildProposalData(customer, calc, false);
        
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
          const electricityBill = await db.getBillById(proposal.electricityBillId);
          if (!electricityBill) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Electricity bill not found' });
          }
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
        const proposalData = buildProposalData(customer, calc, false);
        
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
          const electricityBill = await db.getBillById(proposal.electricityBillId);
          if (!electricityBill) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Electricity bill not found' });
          }
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
        const proposalData = buildProposalData(customer, calc, false);
        
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
          const electricityBill = await db.getBillById(proposal.electricityBillId);
          if (!electricityBill) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Electricity bill not found' });
          }
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
          'solar_proposal_pdf',
          'other'
        ]),
        fileData: z.string(), // Base64 encoded file data
        fileName: z.string(),
        mimeType: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Decode base64 and upload to S3
        const buffer = Buffer.from(input.fileData, 'base64');
        const fileKey = `documents/${input.customerId}/${nanoid()}-${input.fileName}`;
        
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        
        // Create document record
        const docId = await db.createCustomerDocument({
          customerId: input.customerId,
          userId: ctx.user.id,
          documentType: input.documentType,
          fileUrl: url,
          fileKey: fileKey,
          fileName: input.fileName,
          fileSize: buffer.length,
          mimeType: input.mimeType,
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
        { name: 'Tango Energy', programName: 'VPP Connect', availableStates: ['VIC'], hasGasBundle: true, dailyCredit: 0.52, eventPayment: 12, estimatedEventsPerYear: 10, bundleDiscount: 95 },
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
      case 'annual_energy_projection': {
        const narrative = await narrativeYearlyProjection(data);
        enriched.content.narrative = narrative;
        break;
      }
      case 'usage_benchmarking': {
        const narrative = await narrativeUsageAnalysis(data);
        enriched.content.narrative = narrative;
        break;
      }
      case 'solar_recommendation': {
        const narrative = await narrativeStrategicAssessment(data);
        enriched.content.narrative = narrative;
        break;
      }
      case 'battery_recommendation': {
        const narrative = await narrativeBatteryOption(data, 1);
        enriched.content.narrativeWhy = narrative.whyRecommend;
        break;
      }
      case 'why_battery': {
        const narrative = await narrativeBatteryOption(data, 1);
        enriched.content.narrative = narrative.whyRecommend;
        break;
      }
      case 'battery_considerations': {
        const narrative = await narrativeBatteryOption(data, 2);
        enriched.content.narrative = narrative.whyRecommend;
        break;
      }
      case 'vpp_recommendation': {
        const narrative = await narrativeVPPRecommendation(data);
        enriched.content.narrative = narrative;
        break;
      }
      case 'ev_analysis': {
        const narrative = await narrativeEnvironmentalImpact(data);
        enriched.content.narrative = narrative;
        break;
      }
      case 'ev_vs_petrol': {
        const narrative = await narrativeEnvironmentalImpact(data);
        enriched.content.narrative = narrative;
        break;
      }
      case 'financial_investment': {
        const narrative = await narrativeInvestmentAnalysis(data);
        enriched.content.narrative = narrative;
        break;
      }
      case 'return_on_investment': {
        const narrative = await narrativeInvestmentAnalysis(data);
        enriched.content.narrative = narrative;
        break;
      }
      case 'roadmap': {
        const narrative = await narrativeRoadmap(data);
        enriched.content.narrative = narrative;
        break;
      }
      case 'energy_optimisation': {
        const narrative = await narrativeStrategicAssessment(data);
        enriched.content.narrative = narrative;
        break;
      }
      case 'required_electrical_works': {
        const narrative = await narrativeStrategicAssessment(data);
        enriched.content.narrative = narrative;
        break;
      }
      case 'system_integration': {
        const narrative = await narrativeEnvironmentalImpact(data);
        enriched.content.narrative = narrative;
        break;
      }
      case 'conclusion': {
        const narrative = await narrativeFinalRecommendation(data);
        enriched.content.narrativeSummary = narrative.financial;
        enriched.content.narrativeFinancial = narrative.strategic;
        enriched.content.recommendation = narrative.urgency;
        break;
      }
      // Slides without narrative (cover, contact, vpp_comparison)
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

function buildProposalData(customer: Customer, calc: ProposalCalculations, _hasGas: boolean): ProposalData {
  const hasGas = false; // Gas features removed
  const vppName = typeof calc.selectedVppProvider === 'object' ? (calc.selectedVppProvider as any)?.name || 'ENGIE' : calc.selectedVppProvider || 'ENGIE';
  const vppProgram = typeof calc.selectedVppProvider === 'object' ? (calc.selectedVppProvider as any)?.programName || 'VPP Advantage' : 'VPP Advantage';
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
    solarSizeKw: calc.recommendedSolarKw || 10,
    panelCount: calc.solarPanelCount || 20,
    panelWattage: 500,
    panelBrand: 'AIKO Neostar',
    batterySizeKwh: calc.recommendedBatteryKwh || 15,
    batteryBrand: 'Sigenergy SigenStor',
    inverterSizeKw: 8,
    inverterBrand: 'Sigenergy',
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
  };
}

// Type alias for Customer
import type { Customer } from "../drizzle/schema";
