import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { storagePut } from "./storage";
import { extractElectricityBillData, extractGasBillData, validateElectricityBillData, validateGasBillData } from "./billExtraction";
import { generateFullCalculations } from "./calculations";
import { generateSlides, generateSlideHTML, ProposalData } from "./slideGenerator";
import { generatePptx } from "./pptxGenerator";
import { generatePdf as generateNativePdf } from "./pdfGenerator";
import { nanoid } from "nanoid";


// ============================================
// ADMIN PROCEDURE
// ============================================

const adminProcedure = publicProcedure.use(({ ctx, next }) => {
  if (false) {
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
    me: publicProcedure.query(() => ({ id: 1, name: 'Public User', email: 'public@elitesmartenergy.com.au', role: 'admin' as const, openId: 'public', loginMethod: 'public', createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() })),
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
    list: publicProcedure
      .input(z.object({ search: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return db.searchCustomers(1, input?.search);
      }),
    
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const customer = await db.getCustomerById(input.id);
        if (!customer) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Customer not found' });
        }
        return customer;
      }),
    
    create: publicProcedure
      .input(z.object({
        fullName: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().min(1),
        state: z.string().min(2).max(3),
        hasSolarNew: z.boolean().optional(),
        hasSolarOld: z.boolean().optional(),
        gasAppliances: z.array(z.string()).optional(),
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
          userId: 1,
          existingSolarSize: input.existingSolarSize?.toString(),
        });
        return { id };
      }),
    
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        fullName: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().min(1).optional(),
        state: z.string().min(2).max(3).optional(),
        hasSolarNew: z.boolean().optional(),
        hasSolarOld: z.boolean().optional(),
        gasAppliances: z.array(z.string()).optional(),
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
    
    delete: publicProcedure
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
    listByCustomer: publicProcedure
      .input(z.object({ customerId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getBillsByCustomerId(input.customerId);
      }),
    
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const bill = await db.getBillById(input.id);
        if (!bill) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Bill not found' });
        }
        return bill;
      }),
    
    upload: publicProcedure
      .input(z.object({
        customerId: z.number(),
        billType: z.enum(['electricity', 'gas']),
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
    
    extract: publicProcedure
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
            const data = await extractGasBillData(bill.fileUrl);
            const validation = validateGasBillData(data);
            
            await db.updateBill(input.billId, {
              retailer: data.retailer,
              billingPeriodStart: data.billingPeriodStart ? new Date(data.billingPeriodStart) : undefined,
              billingPeriodEnd: data.billingPeriodEnd ? new Date(data.billingPeriodEnd) : undefined,
              billingDays: data.billingDays,
              totalAmount: data.totalAmount?.toString(),
              dailySupplyCharge: data.dailySupplyCharge?.toString(),
              gasUsageMj: data.gasUsageMj?.toString(),
              gasRateCentsMj: data.gasRateCentsMj?.toString(),
              rawExtractedData: data.rawData,
              extractionConfidence: data.extractionConfidence?.toString(),
            });
            
            return { success: true, data, validation };
          }
        } catch (error) {
          throw new TRPCError({ 
            code: 'INTERNAL_SERVER_ERROR', 
            message: `Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
          });
        }
      }),
    
    update: publicProcedure
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
    
    delete: publicProcedure
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
    list: publicProcedure
      .input(z.object({
        status: z.string().optional(),
        search: z.string().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return db.searchProposals(1, input);
      }),
    
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const proposal = await db.getProposalById(input.id);
        if (!proposal) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Proposal not found' });
        }
        return proposal;
      }),
    
    getByCustomer: publicProcedure
      .input(z.object({ customerId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getProposalsByCustomerId(input.customerId);
      }),
    
    create: publicProcedure
      .input(z.object({
        customerId: z.number(),
        title: z.string().optional(),
        electricityBillId: z.number().optional(),
        gasBillId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const customer = await db.getCustomerById(input.customerId);
        if (!customer) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Customer not found' });
        }
        
        const id = await db.createProposal({
          customerId: input.customerId,
          userId: 1,
          title: input.title || `Proposal for ${customer.fullName}`,
          electricityBillId: input.electricityBillId,
          gasBillId: input.gasBillId,
          status: 'draft',
        });
        
        // Auto-generate: if electricity bill is provided, auto-calculate and generate slides
        if (input.electricityBillId) {
          try {
            const electricityBill = await db.getBillById(input.electricityBillId);
            if (electricityBill) {
              let gasBill = null;
              if (input.gasBillId) {
                gasBill = await db.getBillById(input.gasBillId);
              }
              const vppProviders = await db.getVppProvidersByState(customer.state);
              const rebates = await db.getRebatesByState(customer.state);
              const calculations = generateFullCalculations(customer, electricityBill, gasBill ?? null, vppProviders, rebates);
              
              const proposalData = buildProposalData(customer, calculations, !!input.gasBillId);
              const slides = generateSlides(proposalData);
              const slideData = slides.map((s, i) => ({
                slideNumber: i + 1,
                slideType: s.type,
                title: s.title,
                isConditional: false,
                isIncluded: true,
                content: s as unknown as Record<string, unknown>,
              }));
              
              await db.updateProposal(id, {
                calculations,
                slidesData: slideData,
                slideCount: slideData.length,
                status: 'generated',
              });
            }
          } catch (e) {
            // Auto-generate is best-effort; don't fail the create
            console.error('Auto-generate failed:', e);
          }
        }
        
        return { id };
      }),
    
    calculate: publicProcedure
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
        
        let gasBill = null;
        if (proposal.gasBillId) {
          gasBill = await db.getBillById(proposal.gasBillId);
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
            gasBill ?? null,
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
    
    generate: publicProcedure
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
          let gasBill = null;
          if (proposal.gasBillId) {
            gasBill = await db.getBillById(proposal.gasBillId);
          }
          const vppProviders = await db.getVppProvidersByState(customer.state);
          const rebates = await db.getRebatesByState(customer.state);
          const calculations = generateFullCalculations(customer, electricityBill, gasBill ?? null, vppProviders, rebates);
          await db.updateProposal(input.proposalId, { calculations, status: 'draft' });
          proposal = await db.getProposalById(input.proposalId);
          if (!proposal) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to reload proposal after calculation' });
          }
        }
        
        // Generate slides data structure (calculations guaranteed to exist after auto-calculate above)
        const slidesData = generateSlidesData(customer, proposal.calculations!, proposal.gasBillId !== null);
        
        await db.updateProposal(input.proposalId, {
          slidesData,
          slideCount: slidesData.filter(s => s.isIncluded).length,
          status: 'generated',
        });
        
        return { success: true, slideCount: slidesData.filter(s => s.isIncluded).length };
      }),
    
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        status: z.enum(['draft', 'calculating', 'generated', 'exported', 'archived']).optional(),
        electricityBillId: z.number().optional(),
        gasBillId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateProposal(id, data);
        return { success: true };
      }),
    
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Soft delete - move to bin instead of permanent delete
        await db.softDeleteProposal(input.id);
        return { success: true };
      }),
    
    // Bin endpoints
    getBinItems: publicProcedure
      .query(async ({ ctx }) => {
        return db.getDeletedProposals(1);
      }),
    
    restore: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.restoreProposal(input.id);
        return { success: true };
      }),
    
    permanentDelete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.permanentlyDeleteProposal(input.id);
        return { success: true };
      }),
    
    emptyBin: publicProcedure
      .mutation(async ({ ctx }) => {
        const deleted = await db.getDeletedProposals(1);
        for (const item of deleted) {
          await db.permanentlyDeleteProposal(item.id);
        }
        return { success: true, count: deleted.length };
      }),
    
    getSlideHtml: publicProcedure
      .input(z.object({
        proposalId: z.number(),
        slideIndex: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
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
          let gasBill = null;
          if (proposal.gasBillId) {
            gasBill = await db.getBillById(proposal.gasBillId);
          }
          const vppProviders = await db.getVppProvidersByState(customer.state);
          const rebates = await db.getRebatesByState(customer.state);
          const calculations = generateFullCalculations(customer, electricityBill, gasBill ?? null, vppProviders, rebates);
          await db.updateProposal(input.proposalId, { calculations, status: 'draft' });
          proposal = await db.getProposalById(input.proposalId);
          if (!proposal) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to reload proposal after calculation' });
          }
        }
        
        const calc = proposal.calculations as ProposalCalculations;
        const proposalData = buildProposalData(customer, calc, !!proposal.gasBillId);
        
        const slides = generateSlides(proposalData);
        
        if (input.slideIndex !== undefined) {
          const slide = slides[input.slideIndex];
          if (!slide) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Slide not found' });
          }
          return {
            html: generateSlideHTML(slide),
            slide,
            totalSlides: slides.length,
          };
        }
        
        // Return all slides HTML
        return {
          slides: slides.map(s => ({
            ...s,
            html: generateSlideHTML(s),
          })),
          totalSlides: slides.length,
        };
      }),
    
    export: publicProcedure
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
    
    exportPdf: publicProcedure
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
          let gasBill = null;
          if (proposal.gasBillId) {
            gasBill = await db.getBillById(proposal.gasBillId);
          }
          const vppProviders = await db.getVppProvidersByState(customer.state);
          const rebates = await db.getRebatesByState(customer.state);
          const calculations = generateFullCalculations(customer, electricityBill, gasBill ?? null, vppProviders, rebates);
          await db.updateProposal(input.proposalId, { calculations, status: 'draft' });
          proposal = await db.getProposalById(input.proposalId);
          if (!proposal) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to reload proposal after calculation' });
          }
        }
        
        const calc = proposal.calculations as ProposalCalculations;
        const proposalData = buildProposalData(customer, calc, !!proposal.gasBillId);
        
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
    exportPptx: publicProcedure
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
          let gasBill = null;
          if (proposal.gasBillId) {
            gasBill = await db.getBillById(proposal.gasBillId);
          }
          const vppProviders = await db.getVppProvidersByState(customer.state);
          const rebates = await db.getRebatesByState(customer.state);
          const calculations = generateFullCalculations(customer, electricityBill, gasBill ?? null, vppProviders, rebates);
          await db.updateProposal(input.proposalId, { calculations, status: 'draft' });
          proposal = await db.getProposalById(input.proposalId);
          if (!proposal) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to reload proposal after calculation' });
          }
        }
        
        const calc = proposal.calculations as ProposalCalculations;
        const proposalData = buildProposalData(customer, calc, !!proposal.gasBillId);
        
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
    exportNativePdf: publicProcedure
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
          let gasBill = null;
          if (proposal.gasBillId) {
            gasBill = await db.getBillById(proposal.gasBillId);
          }
          const vppProviders = await db.getVppProvidersByState(customer.state);
          const rebates = await db.getRebatesByState(customer.state);
          const calculations = generateFullCalculations(customer, electricityBill, gasBill ?? null, vppProviders, rebates);
          await db.updateProposal(input.proposalId, { calculations, status: 'draft' });
          proposal = await db.getProposalById(input.proposalId);
          if (!proposal) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to reload proposal after calculation' });
          }
        }
        
        const calc = proposal.calculations as ProposalCalculations;
        const proposalData = buildProposalData(customer, calc, !!proposal.gasBillId);
        
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

    generateSlideContent: publicProcedure
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
          let gasBill = null;
          if (proposal.gasBillId) {
            gasBill = await db.getBillById(proposal.gasBillId);
          }
          const vppProviders = await db.getVppProvidersByState(customer.state);
          const rebates = await db.getRebatesByState(customer.state);
          const calculations = generateFullCalculations(customer, electricityBill, gasBill ?? null, vppProviders, rebates);
          await db.updateProposal(input.proposalId, { calculations, status: 'draft' });
          proposal = await db.getProposalById(input.proposalId);
          if (!proposal) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to reload proposal after calculation' });
          }
        }
        
        const calc = proposal.calculations as ProposalCalculations;
        
        // Fetch switchboard analysis data if available
        let switchboardAnalysis = null;
        try {
          const switchboardDocs = await db.getDocumentsByType(customer.id, 'switchboard_photo');
          if (switchboardDocs.length > 0 && switchboardDocs[0].extractedData) {
            switchboardAnalysis = switchboardDocs[0].extractedData as any;
          }
        } catch (e) {
          console.warn('Could not fetch switchboard analysis:', e);
        }
        
        const { generateSlideContentMarkdown } = await import('./slideContentGenerator');
        const markdown = generateSlideContentMarkdown({
          customer,
          calculations: calc,
          proposalTitle: proposal.title || undefined,
          switchboardAnalysis,
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

    // ============================================
    // BULK CREATE — up to 10 bills at once
    // Each bill: upload → extract customer info → create customer → create bill → generate proposal
    // ============================================
    bulkCreate: publicProcedure
      .input(z.object({
        bills: z.array(z.object({
          fileData: z.string(),   // base64
          fileName: z.string(),
        })).min(1).max(10),
      }))
      .mutation(async ({ input }) => {
        const results: Array<{
          fileName: string;
          status: 'success' | 'error';
          proposalId?: number;
          customerName?: string;
          error?: string;
        }> = [];

        for (const bill of input.bills) {
          try {
            // 1. Upload bill to S3
            const fileBuffer = Buffer.from(bill.fileData, 'base64');
            const fileKey = `bills/bulk/${nanoid()}-${bill.fileName}`;
            const { url: fileUrl } = await storagePut(fileKey, fileBuffer, 'application/pdf');

            // 2. Extract bill data (customer name, address, state, usage, costs)
            const extracted = await extractElectricityBillData(fileUrl);

            // 3. Derive customer fields from extracted data
            const fullName = extracted.customerName || bill.fileName.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
            const address = extracted.serviceAddress || 'Unknown Address';
            const rawState = extracted.state || '';
            const stateMap: Record<string, string> = {
              'victoria': 'VIC', 'new south wales': 'NSW', 'queensland': 'QLD',
              'south australia': 'SA', 'western australia': 'WA', 'tasmania': 'TAS',
              'northern territory': 'NT', 'australian capital territory': 'ACT',
            };
            const state = rawState.length <= 3 ? rawState.toUpperCase() || 'VIC'
              : stateMap[rawState.toLowerCase()] || 'VIC';

            // 4. Create customer
            const customerId = await db.createCustomer({
              fullName,
              address,
              state,
              userId: 1,
            });

            // 5. Create bill record
            const billId = await db.createBill({
              customerId,
              billType: 'electricity',
              fileUrl,
              fileKey,
              fileName: bill.fileName,
            });

            // 6. Save extracted bill data
            await db.updateBill(billId, {
              retailer: extracted.retailer,
              billingPeriodStart: extracted.billingPeriodStart ? new Date(extracted.billingPeriodStart) : undefined,
              billingPeriodEnd: extracted.billingPeriodEnd ? new Date(extracted.billingPeriodEnd) : undefined,
              billingDays: extracted.billingDays,
              totalAmount: extracted.totalAmount?.toString(),
              dailySupplyCharge: extracted.dailySupplyCharge?.toString(),
              totalUsageKwh: extracted.totalUsageKwh?.toString(),
              peakUsageKwh: extracted.peakUsageKwh?.toString(),
              offPeakUsageKwh: extracted.offPeakUsageKwh?.toString(),
              shoulderUsageKwh: extracted.shoulderUsageKwh?.toString(),
              solarExportsKwh: extracted.solarExportsKwh?.toString(),
              peakRateCents: extracted.peakRateCents?.toString(),
              offPeakRateCents: extracted.offPeakRateCents?.toString(),
              shoulderRateCents: extracted.shoulderRateCents?.toString(),
              feedInTariffCents: extracted.feedInTariffCents?.toString(),
              rawExtractedData: extracted.rawData,
              extractionConfidence: extracted.extractionConfidence?.toString(),
            });

            // 7. Create proposal and auto-generate slides
            const customer = await db.getCustomerById(customerId);
            const billRecord = await db.getBillById(billId);
            const vppProviders = await db.getVppProvidersByState(state);
            const rebates = await db.getRebatesByState(state);

            const proposalId = await db.createProposal({
              customerId,
              userId: 1,
              title: `Proposal for ${fullName}`,
              electricityBillId: billId,
              status: 'draft',
            });

            // Auto-generate calculations + slides (best-effort)
            try {
              if (customer && billRecord) {
                const calculations = generateFullCalculations(customer, billRecord, null, vppProviders, rebates);
                const proposalData = buildProposalData(customer, calculations, false, false, false);
                const slides = generateSlides(proposalData);
                const slideData = slides.map((s, i) => ({
                  slideNumber: i + 1,
                  slideType: s.type,
                  title: s.title,
                  isConditional: false,
                  isIncluded: true,
                  content: s as unknown as Record<string, unknown>,
                }));
                await db.updateProposal(proposalId, {
                  calculations,
                  slidesData: slideData,
                  slideCount: slideData.length,
                  status: 'generated',
                });
              }
            } catch (genErr) {
              console.error('Bulk slide gen failed:', genErr);
            }

            results.push({ fileName: bill.fileName, status: 'success', proposalId, customerName: fullName });
          } catch (err) {
            results.push({
              fileName: bill.fileName,
              status: 'error',
              error: err instanceof Error ? err.message : 'Unknown error',
            });
          }
        }

        return { results };
      }),

  }),

  // ============================================
  // VPP PROVIDER ROUTES
  // ============================================
  vppProviders: router({
    list: publicProcedure.query(async () => {
      return db.getAllVppProviders();
    }),
    
    listByState: publicProcedure
      .input(z.object({ state: z.string() }))
      .query(async ({ input }) => {
        return db.getVppProvidersByState(input.state);
      }),
  }),

  // ============================================
  // REBATES ROUTES
  // ============================================
  rebates: router({
    listByState: publicProcedure
      .input(z.object({ state: z.string() }))
      .query(async ({ input }) => {
        return db.getRebatesByState(input.state);
      }),
  }),

  // ============================================
  // CUSTOMER DOCUMENTS ROUTES
  // ============================================
  documents: router({
    list: publicProcedure
      .input(z.object({ customerId: z.number() }))
      .query(async ({ input }) => {
        return db.getDocumentsByCustomerId(input.customerId);
      }),
    
    listByType: publicProcedure
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
    
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getDocumentById(input.id);
      }),
    
    upload: publicProcedure
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
          userId: 1,
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
    
    update: publicProcedure
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
    
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCustomerDocument(input.id);
        return { success: true };
      }),
    
    analyzeSwitchboard: publicProcedure
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

function buildProposalData(customer: Customer, calc: ProposalCalculations, hasGas: boolean, hasSolarNew: boolean, hasSolarOld: boolean): ProposalData {
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
    hasSolarNew,
    hasSolarOld,
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
    hasPoolPump: customer.hasPool ?? false,
    poolPumpSavings: calc.poolHeatPumpSavings,
    poolRecommendedKw: calc.poolRecommendedKw,
    poolAnnualOperatingCost: calc.poolAnnualOperatingCost,
    hasHeatPump: hasGas,
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

function generateSlidesData(
  customer: Customer,
  calculations: ProposalCalculations,
  hasGasBill: boolean
): SlideData[] {
  const c = calculations; // shorthand
  const slides: SlideData[] = [
    // Slide 1: Cover Page
    {
      slideNumber: 1, slideType: 'cover', title: 'Cover Page',
      isConditional: false, isIncluded: true,
      content: {
        customerName: customer.fullName,
        customerAddress: customer.address,
        date: new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' }),
      },
    },
    // Slide 2: Executive Summary
    {
      slideNumber: 2, slideType: 'executive_summary', title: 'Executive Summary',
      isConditional: false, isIncluded: true,
      content: {
        currentAnnualCost: c.projectedAnnualCost,
        gasAnnualCost: c.gasAnnualCost,
        totalAnnualSavings: c.totalAnnualSavings,
        paybackYears: c.paybackYears,
        netInvestment: c.netInvestment,
        totalInvestment: c.totalInvestment,
        totalRebates: c.totalRebates,
        co2ReductionTonnes: c.co2ReductionTonnes,
        twentyFiveYearSavings: c.twentyFiveYearSavings,
        hasGas: hasGasBill,
      hasSolarNew: customer.hasSolarNew ?? false,
      hasSolarOld: customer.hasSolarOld ?? false,
      },
    },
    // Slide 3: Current Bill Analysis
    {
      slideNumber: 3, slideType: 'bill_analysis', title: 'Current Bill Analysis',
      isConditional: false, isIncluded: true,
      content: {
        retailer: c.billRetailer,
        periodStart: c.billPeriodStart,
        periodEnd: c.billPeriodEnd,
        billingDays: c.billDays,
        totalAmount: c.billTotalAmount,
        dailySupplyCharge: c.billDailySupplyCharge,
        totalUsageKwh: c.billTotalUsageKwh,
        peakUsageKwh: c.billPeakUsageKwh,
        offPeakUsageKwh: c.billOffPeakUsageKwh,
        shoulderUsageKwh: c.billShoulderUsageKwh,
        solarExportsKwh: c.billSolarExportsKwh,
        peakRateCents: c.billPeakRateCents,
        offPeakRateCents: c.billOffPeakRateCents,
        shoulderRateCents: c.billShoulderRateCents,
        feedInTariffCents: c.billFeedInTariffCents,
        dailyAverageKwh: c.dailyAverageKwh,
        dailyAverageCost: c.dailyAverageCost,
      },
    },
    // Slide 4: Monthly Usage Analysis
    {
      slideNumber: 4, slideType: 'monthly_usage', title: 'Monthly Usage Analysis',
      isConditional: false, isIncluded: true,
      content: {
        dailyAverageKwh: c.dailyAverageKwh,
        monthlyUsageKwh: c.monthlyUsageKwh,
        yearlyUsageKwh: c.yearlyUsageKwh,
        peakUsageKwh: c.billPeakUsageKwh,
        offPeakUsageKwh: c.billOffPeakUsageKwh,
        shoulderUsageKwh: c.billShoulderUsageKwh,
        billingDays: c.billDays,
      },
    },
    // Slide 5: Yearly Cost Projection
    {
      slideNumber: 5, slideType: 'yearly_projection', title: 'Yearly Cost Projection',
      isConditional: false, isIncluded: true,
      content: {
        yearlyUsageKwh: c.yearlyUsageKwh,
        projectedAnnualCost: c.projectedAnnualCost,
        annualSupplyCharge: c.annualSupplyCharge,
        annualUsageCharge: c.annualUsageCharge,
        annualSolarCredit: c.annualSolarCredit,
        dailyAverageCost: c.dailyAverageCost,
        peakRateCents: c.billPeakRateCents,
        offPeakRateCents: c.billOffPeakRateCents,
        shoulderRateCents: c.billShoulderRateCents,
        feedInTariffCents: c.billFeedInTariffCents,
        dailySupplyCharge: c.billDailySupplyCharge,
        gasAnnualCost: c.gasAnnualCost,
      },
    },
    // Slide 6: Current Gas Footprint (Conditional)
    {
      slideNumber: 6, slideType: 'gas_footprint', title: 'Current Gas Footprint',
      isConditional: true, isIncluded: hasGasBill,
      content: {
        gasBillRetailer: c.gasBillRetailer,
        gasBillPeriodStart: c.gasBillPeriodStart,
        gasBillPeriodEnd: c.gasBillPeriodEnd,
        gasBillDays: c.gasBillDays,
        gasBillTotalAmount: c.gasBillTotalAmount,
        gasBillDailySupplyCharge: c.gasBillDailySupplyCharge,
        gasBillUsageMj: c.gasBillUsageMj,
        gasBillRateCentsMj: c.gasBillRateCentsMj,
        gasAnnualCost: c.gasAnnualCost,
        gasKwhEquivalent: c.gasKwhEquivalent,
        gasCo2Emissions: c.gasCo2Emissions,
        gasDailyGasCost: c.gasDailyGasCost,
        gasAnnualSupplyCharge: c.gasAnnualSupplyCharge,
      },
    },
    // Slide 7: Gas Appliance Inventory (Conditional)
    {
      slideNumber: 7, slideType: 'gas_appliances', title: 'Gas Appliance Inventory',
      isConditional: true, isIncluded: hasGasBill && (customer.gasAppliances?.length ?? 0) > 0,
      content: {
        appliances: customer.gasAppliances,
        gasAnnualCost: c.gasAnnualCost,
        gasKwhEquivalent: c.gasKwhEquivalent,
      },
    },
    // Slide 8: Strategic Assessment
    {
      slideNumber: 8, slideType: 'strategic_assessment', title: 'Strategic Assessment',
      isConditional: false, isIncluded: true,
      content: {
        totalAnnualSavings: c.totalAnnualSavings,
        paybackYears: c.paybackYears,
        netInvestment: c.netInvestment,
        co2ReductionTonnes: c.co2ReductionTonnes,
        hasGas: hasGasBill,
      hasSolarNew: customer.hasSolarNew ?? false,
      hasSolarOld: customer.hasSolarOld ?? false,
        hasEV: customer.hasEV,
        hasPool: customer.hasPool,
        hasExistingSolar: customer.hasExistingSolar,
      },
    },
    // Slide 9: Recommended Battery Size
    {
      slideNumber: 9, slideType: 'battery_recommendation', title: 'Recommended Battery Size',
      isConditional: false, isIncluded: true,
      content: {
        recommendedBatteryKwh: c.recommendedBatteryKwh,
        batteryProduct: c.batteryProduct,
        batteryEstimatedCost: c.batteryEstimatedCost,
        dailyAverageKwh: c.dailyAverageKwh,
        hasEV: customer.hasEV,
      },
    },
    // Slide 10: Proposed Solar PV System (Conditional)
    {
      slideNumber: 10, slideType: 'solar_recommendation', title: 'Proposed Solar PV System',
      isConditional: true, isIncluded: !customer.hasExistingSolar,
      content: {
        recommendedSolarKw: c.recommendedSolarKw,
        solarPanelCount: c.solarPanelCount,
        solarAnnualGeneration: c.solarAnnualGeneration,
        solarEstimatedCost: c.solarEstimatedCost,
        yearlyUsageKwh: c.yearlyUsageKwh,
      },
    },
    // Slide 11: VPP Provider Comparison
    {
      slideNumber: 11, slideType: 'vpp_comparison', title: 'VPP Provider Comparison',
      isConditional: false, isIncluded: true,
      content: {
        providers: c.vppProviderComparison,
        state: customer.state,
        hasGas: hasGasBill,
      hasSolarNew: customer.hasSolarNew ?? false,
      hasSolarOld: customer.hasSolarOld ?? false,
      },
    },
    // Slide 12: VPP Recommendation
    {
      slideNumber: 12, slideType: 'vpp_recommendation', title: 'VPP Recommendation',
      isConditional: false, isIncluded: true,
      content: {
        selectedVppProvider: c.selectedVppProvider,
        vppAnnualValue: c.vppAnnualValue,
        vppDailyCreditAnnual: c.vppDailyCreditAnnual,
        vppEventPaymentsAnnual: c.vppEventPaymentsAnnual,
        vppBundleDiscount: c.vppBundleDiscount,
        recommendedBatteryKwh: c.recommendedBatteryKwh,
      },
    },
    // Slide 13: Hot Water Electrification (Conditional)
    {
      slideNumber: 13, slideType: 'hot_water', title: 'Hot Water Electrification',
      isConditional: true, isIncluded: hasGasBill,
      content: {
        hotWaterSavings: c.hotWaterSavings,
        hotWaterCurrentGasCost: c.hotWaterCurrentGasCost,
        hotWaterHeatPumpCost: c.hotWaterHeatPumpCost,
        hotWaterDailySupplySaved: c.hotWaterDailySupplySaved,
        investmentHeatPumpHw: c.investmentHeatPumpHw,
        heatPumpHwRebateAmount: c.heatPumpHwRebateAmount,
      },
    },
    // Slide 14: Heating & Cooling Upgrade (Conditional)
    {
      slideNumber: 14, slideType: 'heating_cooling', title: 'Heating & Cooling Upgrade',
      isConditional: true, isIncluded: hasGasBill,
      content: {
        heatingCoolingSavings: c.heatingCoolingSavings,
        heatingCurrentGasCost: c.heatingCurrentGasCost,
        heatingRcAcCost: c.heatingRcAcCost,
        investmentRcAc: c.investmentRcAc,
        heatPumpAcRebateAmount: c.heatPumpAcRebateAmount,
      },
    },
    // Slide 15: Induction Cooking Upgrade (Conditional)
    {
      slideNumber: 15, slideType: 'induction_cooking', title: 'Induction Cooking Upgrade',
      isConditional: true, isIncluded: hasGasBill,
      content: {
        cookingSavings: c.cookingSavings,
        cookingCurrentGasCost: c.cookingCurrentGasCost,
        cookingInductionCost: c.cookingInductionCost,
        investmentInduction: c.investmentInduction,
      },
    },
    // Slide 16: EV Analysis
    {
      slideNumber: 16, slideType: 'ev_analysis', title: 'EV Analysis - Low KM Vehicle',
      isConditional: false, isIncluded: true,
      content: {
        evPetrolCost: c.evPetrolCost,
        evGridChargeCost: c.evGridChargeCost,
        evSolarChargeCost: c.evSolarChargeCost,
        evAnnualSavings: c.evAnnualSavings,
        evKmPerYear: c.evKmPerYear,
        evConsumptionPer100km: c.evConsumptionPer100km,
        evPetrolPricePerLitre: c.evPetrolPricePerLitre,
        peakRateCents: c.billPeakRateCents,
      },
    },
    // Slide 17: EV Charger Recommendation
    {
      slideNumber: 17, slideType: 'ev_charger', title: 'EV Charger Recommendation',
      isConditional: false,
      isIncluded: (customer.hasEV ?? false) || customer.evInterest === 'interested' || customer.evInterest === 'owns',
      content: {
        hasEV: customer.hasEV,
        evInterest: customer.evInterest,
        investmentEvCharger: c.investmentEvCharger,
        evAnnualSavings: c.evAnnualSavings,
      },
    },
    // Slide 18: Pool Heat Pump (Conditional)
    {
      slideNumber: 18, slideType: 'pool_heat_pump', title: 'Pool Heat Pump',
      isConditional: true, isIncluded: customer.hasPool ?? false,
      content: {
        poolVolume: customer.poolVolume,
        poolHeatPumpSavings: c.poolHeatPumpSavings,
        poolRecommendedKw: c.poolRecommendedKw,
        poolAnnualOperatingCost: c.poolAnnualOperatingCost,
        investmentPoolHeatPump: c.investmentPoolHeatPump,
      },
    },
    // Slide 19: Full Electrification Investment (Conditional)
    {
      slideNumber: 19, slideType: 'electrification_investment', title: 'Full Electrification Investment',
      isConditional: true, isIncluded: hasGasBill,
      content: {
        totalInvestment: c.totalInvestment,
        totalRebates: c.totalRebates,
        netInvestment: c.netInvestment,
        investmentSolar: c.investmentSolar,
        investmentBattery: c.investmentBattery,
        investmentHeatPumpHw: c.investmentHeatPumpHw,
        investmentRcAc: c.investmentRcAc,
        investmentInduction: c.investmentInduction,
        investmentEvCharger: c.investmentEvCharger,
        investmentPoolHeatPump: c.investmentPoolHeatPump,
        solarRebateAmount: c.solarRebateAmount,
        batteryRebateAmount: c.batteryRebateAmount,
        heatPumpHwRebateAmount: c.heatPumpHwRebateAmount,
        heatPumpAcRebateAmount: c.heatPumpAcRebateAmount,
      },
    },
    // Slide 20: Total Savings Summary
    {
      slideNumber: 20, slideType: 'savings_summary', title: 'Total Savings Summary',
      isConditional: false, isIncluded: true,
      content: {
        totalAnnualSavings: c.totalAnnualSavings,
        projectedAnnualCost: c.projectedAnnualCost,
        gasAnnualCost: c.gasAnnualCost,
        hotWaterSavings: c.hotWaterSavings,
        heatingCoolingSavings: c.heatingCoolingSavings,
        cookingSavings: c.cookingSavings,
        evAnnualSavings: c.evAnnualSavings,
        vppAnnualValue: c.vppAnnualValue,
        poolHeatPumpSavings: c.poolHeatPumpSavings,
      },
    },
    // Slide 21: Financial Summary & Payback
    {
      slideNumber: 21, slideType: 'financial_summary', title: 'Financial Summary & Payback',
      isConditional: false, isIncluded: true,
      content: {
        totalInvestment: c.totalInvestment,
        totalRebates: c.totalRebates,
        netInvestment: c.netInvestment,
        totalAnnualSavings: c.totalAnnualSavings,
        paybackYears: c.paybackYears,
        tenYearSavings: c.tenYearSavings,
        twentyFiveYearSavings: c.twentyFiveYearSavings,
      },
    },
    // Slide 22: Environmental Impact
    {
      slideNumber: 22, slideType: 'environmental_impact', title: 'Environmental Impact',
      isConditional: false, isIncluded: true,
      content: {
        co2ReductionTonnes: c.co2ReductionTonnes,
        co2CurrentTonnes: c.co2CurrentTonnes,
        co2ProjectedTonnes: c.co2ProjectedTonnes,
        co2ReductionPercent: c.co2ReductionPercent,
      },
    },
    // Slide 23: Recommended Roadmap
    {
      slideNumber: 23, slideType: 'roadmap', title: 'Recommended Roadmap',
      isConditional: false, isIncluded: true,
      content: {
        milestones: [
          { phase: 1, title: 'Solar & Battery Installation', timeline: 'Month 1-2' },
          { phase: 2, title: 'VPP Enrollment', timeline: 'Month 2' },
          ...(hasGasBill ? [
            { phase: 3, title: 'Hot Water Upgrade', timeline: 'Month 3-4' },
            { phase: 4, title: 'HVAC Upgrade', timeline: 'Month 4-6' },
          ] : []),
          ...((customer.hasEV || customer.evInterest === 'interested') ? [
            { phase: hasGasBill ? 5 : 3, title: 'EV Charger Installation', timeline: hasGasBill ? 'Month 6' : 'Month 3' },
          ] : []),
        ],
        totalAnnualSavings: c.totalAnnualSavings,
        paybackYears: c.paybackYears,
      },
    },
    // Slide 24: Conclusion
    {
      slideNumber: 24, slideType: 'conclusion', title: 'Conclusion',
      isConditional: false, isIncluded: true,
      content: {
        totalAnnualSavings: c.totalAnnualSavings,
        paybackYears: c.paybackYears,
        co2ReductionTonnes: c.co2ReductionTonnes,
        twentyFiveYearSavings: c.twentyFiveYearSavings,
        netInvestment: c.netInvestment,
      },
    },
    // Slide 25: Contact Slide
    {
      slideNumber: 25, slideType: 'contact', title: 'Contact',
      isConditional: false, isIncluded: true,
      content: {
        preparedBy: '[Consultant Name]',
        title: 'Energy Solutions Consultant',
        company: 'Elite Smart Energy Solutions',
        address: 'South Australia',
        phone: '',
        email: 'george.f@elitesmartenergy.com.au',
        website: 'www.elitesmartenergy.com.au',
      },
    },
  ];
  
  return slides;
}

// Type alias for Customer
import type { Customer } from "../drizzle/schema";
