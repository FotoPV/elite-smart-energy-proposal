import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { storagePut } from "./storage";
import { extractElectricityBillData, extractGasBillData, validateElectricityBillData, validateGasBillData } from "./billExtraction";
import { generateFullCalculations } from "./calculations";
import { nanoid } from "nanoid";


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
  // DASHBOARD ROUTES
  // ============================================
  dashboard: router({
    stats: protectedProcedure.query(async ({ ctx }) => {
      return db.getDashboardStats(ctx.user.id);
    }),
    
    recentProposals: protectedProcedure.query(async ({ ctx }) => {
      const proposals = await db.getProposalsByUserId(ctx.user.id);
      return proposals.slice(0, 5);
    }),
    
    recentCustomers: protectedProcedure.query(async ({ ctx }) => {
      const customers = await db.getCustomersByUserId(ctx.user.id);
      return customers.slice(0, 5);
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
        hasGas: z.boolean().optional(),
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
        hasGas: z.boolean().optional(),
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
        gasBillId: z.number().optional(),
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
          gasBillId: input.gasBillId,
          status: 'draft',
        });
        
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
    
    generate: protectedProcedure
      .input(z.object({ proposalId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const proposal = await db.getProposalById(input.proposalId);
        if (!proposal) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Proposal not found' });
        }
        
        if (!proposal.calculations) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Run calculations first' });
        }
        
        const customer = await db.getCustomerById(proposal.customerId);
        if (!customer) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Customer not found' });
        }
        
        // Generate slides data structure
        const slidesData = generateSlidesData(customer, proposal.calculations, proposal.gasBillId !== null);
        
        await db.updateProposal(input.proposalId, {
          slidesData,
          slideCount: slidesData.filter(s => s.isIncluded).length,
          status: 'generated',
        });
        
        return { success: true, slideCount: slidesData.filter(s => s.isIncluded).length };
      }),
    
    update: protectedProcedure
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
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteProposal(input.id);
        return { success: true };
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

function generateSlidesData(
  customer: Customer,
  calculations: ProposalCalculations,
  hasGasBill: boolean
): SlideData[] {
  const slides: SlideData[] = [
    // Slide 1: Cover Page
    {
      slideNumber: 1,
      slideType: 'cover',
      title: 'Cover Page',
      isConditional: false,
      isIncluded: true,
      content: {
        customerName: customer.fullName,
        customerAddress: customer.address,
        date: new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' }),
      },
    },
    // Slide 2: Executive Summary
    {
      slideNumber: 2,
      slideType: 'executive_summary',
      title: 'Executive Summary',
      isConditional: false,
      isIncluded: true,
      content: {
        currentAnnualCost: calculations.projectedAnnualCost,
        totalAnnualSavings: calculations.totalAnnualSavings,
        paybackYears: calculations.paybackYears,
        netInvestment: calculations.netInvestment,
      },
    },
    // Slide 3: Current Bill Analysis
    {
      slideNumber: 3,
      slideType: 'bill_analysis',
      title: 'Current Bill Analysis',
      isConditional: false,
      isIncluded: true,
      content: {
        dailyAverageKwh: calculations.dailyAverageKwh,
        monthlyUsageKwh: calculations.monthlyUsageKwh,
        yearlyUsageKwh: calculations.yearlyUsageKwh,
        projectedAnnualCost: calculations.projectedAnnualCost,
      },
    },
    // Slide 4: Monthly Usage Analysis
    {
      slideNumber: 4,
      slideType: 'monthly_usage',
      title: 'Monthly Usage Analysis',
      isConditional: false,
      isIncluded: true,
      content: {
        dailyAverageKwh: calculations.dailyAverageKwh,
        monthlyUsageKwh: calculations.monthlyUsageKwh,
      },
    },
    // Slide 5: Yearly Cost Projection
    {
      slideNumber: 5,
      slideType: 'yearly_projection',
      title: 'Yearly Cost Projection',
      isConditional: false,
      isIncluded: true,
      content: {
        yearlyUsageKwh: calculations.yearlyUsageKwh,
        projectedAnnualCost: calculations.projectedAnnualCost,
      },
    },
    // Slide 6: Current Gas Footprint (Conditional)
    {
      slideNumber: 6,
      slideType: 'gas_footprint',
      title: 'Current Gas Footprint',
      isConditional: true,
      isIncluded: hasGasBill,
      content: {
        gasAnnualCost: calculations.gasAnnualCost,
        gasKwhEquivalent: calculations.gasKwhEquivalent,
        gasCo2Emissions: calculations.gasCo2Emissions,
      },
    },
    // Slide 7: Gas Appliance Inventory (Conditional)
    {
      slideNumber: 7,
      slideType: 'gas_appliances',
      title: 'Gas Appliance Inventory',
      isConditional: true,
      isIncluded: hasGasBill && (customer.gasAppliances?.length ?? 0) > 0,
      content: {
        appliances: customer.gasAppliances,
      },
    },
    // Slide 8: Strategic Assessment
    {
      slideNumber: 8,
      slideType: 'strategic_assessment',
      title: 'Strategic Assessment',
      isConditional: false,
      isIncluded: true,
      content: {
        pros: ['Reduce electricity costs', 'Energy independence', 'VPP income potential', 'Environmental benefits'],
        cons: ['Upfront investment', 'Payback period', 'Technology maintenance'],
      },
    },
    // Slide 9: Recommended Battery Size
    {
      slideNumber: 9,
      slideType: 'battery_recommendation',
      title: 'Recommended Battery Size',
      isConditional: false,
      isIncluded: true,
      content: {
        recommendedBatteryKwh: calculations.recommendedBatteryKwh,
        batteryProduct: calculations.batteryProduct,
      },
    },
    // Slide 10: Proposed Solar PV System (Conditional)
    {
      slideNumber: 10,
      slideType: 'solar_recommendation',
      title: 'Proposed Solar PV System',
      isConditional: true,
      isIncluded: !customer.hasExistingSolar,
      content: {
        recommendedSolarKw: calculations.recommendedSolarKw,
        solarPanelCount: calculations.solarPanelCount,
        solarAnnualGeneration: calculations.solarAnnualGeneration,
      },
    },
    // Slide 11: VPP Provider Comparison
    {
      slideNumber: 11,
      slideType: 'vpp_comparison',
      title: 'VPP Provider Comparison',
      isConditional: false,
      isIncluded: true,
      content: {
        providers: calculations.vppProviderComparison,
      },
    },
    // Slide 12: VPP Recommendation
    {
      slideNumber: 12,
      slideType: 'vpp_recommendation',
      title: 'VPP Recommendation',
      isConditional: false,
      isIncluded: true,
      content: {
        selectedVppProvider: calculations.selectedVppProvider,
        vppAnnualValue: calculations.vppAnnualValue,
      },
    },
    // Slide 13: Hot Water Electrification (Conditional)
    {
      slideNumber: 13,
      slideType: 'hot_water',
      title: 'Hot Water Electrification',
      isConditional: true,
      isIncluded: hasGasBill,
      content: {
        hotWaterSavings: calculations.hotWaterSavings,
      },
    },
    // Slide 14: Heating & Cooling Upgrade (Conditional)
    {
      slideNumber: 14,
      slideType: 'heating_cooling',
      title: 'Heating & Cooling Upgrade',
      isConditional: true,
      isIncluded: hasGasBill,
      content: {
        heatingCoolingSavings: calculations.heatingCoolingSavings,
      },
    },
    // Slide 15: Induction Cooking Upgrade (Conditional)
    {
      slideNumber: 15,
      slideType: 'induction_cooking',
      title: 'Induction Cooking Upgrade',
      isConditional: true,
      isIncluded: hasGasBill,
      content: {
        cookingSavings: calculations.cookingSavings,
      },
    },
    // Slide 16: EV Analysis
    {
      slideNumber: 16,
      slideType: 'ev_analysis',
      title: 'EV Analysis - Low KM Vehicle',
      isConditional: false,
      isIncluded: true,
      content: {
        evPetrolCost: calculations.evPetrolCost,
        evGridChargeCost: calculations.evGridChargeCost,
        evSolarChargeCost: calculations.evSolarChargeCost,
        evAnnualSavings: calculations.evAnnualSavings,
      },
    },
    // Slide 17: EV Charger Recommendation
    {
      slideNumber: 17,
      slideType: 'ev_charger',
      title: 'EV Charger Recommendation',
      isConditional: false,
      isIncluded: (customer.hasEV ?? false) || customer.evInterest === 'interested' || customer.evInterest === 'owns',
      content: {
        hasEV: customer.hasEV,
        evInterest: customer.evInterest,
      },
    },
    // Slide 18: Pool Heat Pump (Conditional)
    {
      slideNumber: 18,
      slideType: 'pool_heat_pump',
      title: 'Pool Heat Pump',
      isConditional: true,
      isIncluded: customer.hasPool ?? false,
      content: {
        poolVolume: customer.poolVolume,
        poolHeatPumpSavings: calculations.poolHeatPumpSavings,
      },
    },
    // Slide 19: Full Electrification Investment (Conditional)
    {
      slideNumber: 19,
      slideType: 'electrification_investment',
      title: 'Full Electrification Investment',
      isConditional: true,
      isIncluded: hasGasBill,
      content: {
        totalInvestment: calculations.totalInvestment,
        totalRebates: calculations.totalRebates,
        netInvestment: calculations.netInvestment,
      },
    },
    // Slide 20: Total Savings Summary
    {
      slideNumber: 20,
      slideType: 'savings_summary',
      title: 'Total Savings Summary',
      isConditional: false,
      isIncluded: true,
      content: {
        totalAnnualSavings: calculations.totalAnnualSavings,
        hotWaterSavings: calculations.hotWaterSavings,
        heatingCoolingSavings: calculations.heatingCoolingSavings,
        cookingSavings: calculations.cookingSavings,
        evAnnualSavings: calculations.evAnnualSavings,
        vppAnnualValue: calculations.vppAnnualValue,
      },
    },
    // Slide 21: Financial Summary & Payback
    {
      slideNumber: 21,
      slideType: 'financial_summary',
      title: 'Financial Summary & Payback',
      isConditional: false,
      isIncluded: true,
      content: {
        totalInvestment: calculations.totalInvestment,
        totalRebates: calculations.totalRebates,
        netInvestment: calculations.netInvestment,
        totalAnnualSavings: calculations.totalAnnualSavings,
        paybackYears: calculations.paybackYears,
      },
    },
    // Slide 22: Environmental Impact
    {
      slideNumber: 22,
      slideType: 'environmental_impact',
      title: 'Environmental Impact',
      isConditional: false,
      isIncluded: true,
      content: {
        co2ReductionTonnes: calculations.co2ReductionTonnes,
      },
    },
    // Slide 23: Recommended Roadmap
    {
      slideNumber: 23,
      slideType: 'roadmap',
      title: 'Recommended Roadmap',
      isConditional: false,
      isIncluded: true,
      content: {
        milestones: [
          { phase: 1, title: 'Solar & Battery Installation', timeline: 'Month 1-2' },
          { phase: 2, title: 'VPP Enrollment', timeline: 'Month 2' },
          { phase: 3, title: 'Hot Water Upgrade', timeline: 'Month 3-4' },
          { phase: 4, title: 'HVAC Upgrade', timeline: 'Month 4-6' },
          { phase: 5, title: 'EV Charger Installation', timeline: 'Month 6' },
        ],
      },
    },
    // Slide 24: Conclusion
    {
      slideNumber: 24,
      slideType: 'conclusion',
      title: 'Conclusion',
      isConditional: false,
      isIncluded: true,
      content: {
        keyBenefits: [
          `Save $${calculations.totalAnnualSavings?.toLocaleString()} annually`,
          `${calculations.paybackYears} year payback period`,
          `Reduce CO2 by ${calculations.co2ReductionTonnes} tonnes/year`,
          'Energy independence and price protection',
        ],
      },
    },
    // Slide 25: Contact Slide
    {
      slideNumber: 25,
      slideType: 'contact',
      title: 'Contact',
      isConditional: false,
      isIncluded: true,
      content: {
        preparedBy: 'George Fotopoulos',
        title: 'Renewables Strategist & Designer',
        company: 'Lightning Energy',
        address: 'Showroom 1, Waverley Road, Malvern East VIC 3145',
        phone: '0419 574 520',
        email: 'george.f@lightning-energy.com.au',
        website: 'www.lightning-energy.com.au',
      },
    },
  ];
  
  return slides;
}

// Type alias for Customer
import type { Customer } from "../drizzle/schema";
