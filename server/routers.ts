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
import { generateSlides, generateSlideHTML, ProposalData } from "./slideGenerator";
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
        
        const customer = await db.getCustomerById(proposal.customerId);
        if (!customer) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Customer not found' });
        }
        
        if (!proposal.calculations) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Run calculations first' });
        }
        
        const calc = proposal.calculations as ProposalCalculations;
        
        // Build ProposalData from customer and calculations
        const proposalData: ProposalData = {
          customerName: customer.fullName,
          address: customer.address || '',
          state: customer.state,
          retailer: 'Current Retailer',
          dailyUsageKwh: calc.dailyAverageKwh || 0,
          annualUsageKwh: calc.yearlyUsageKwh || 0,
          supplyChargeCentsPerDay: 100,
          usageRateCentsPerKwh: 30,
          feedInTariffCentsPerKwh: 5,
          annualCost: calc.projectedAnnualCost || 0,
          hasGas: !!proposal.gasBillId,
          gasAnnualMJ: calc.gasKwhEquivalent ? calc.gasKwhEquivalent * 3.6 : undefined,
          gasAnnualCost: calc.gasAnnualCost,
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
          tenYearSavings: (calc.totalAnnualSavings || 3000) * 10,
          vppProvider: typeof calc.selectedVppProvider === 'object' ? (calc.selectedVppProvider as any)?.name || 'ENGIE' : calc.selectedVppProvider || 'ENGIE',
          vppProgram: 'VPP Advantage',
          vppAnnualValue: calc.vppAnnualValue || 300,
          hasGasBundle: true,
          hasEV: customer.hasEV ?? false,
          evAnnualKm: (customer as any).evAnnualKm || 10000,
          evAnnualSavings: calc.evAnnualSavings,
          hasPoolPump: customer.hasPool ?? false,
          poolPumpSavings: calc.poolHeatPumpSavings,
          hasHeatPump: !!proposal.gasBillId,
          heatPumpSavings: calc.hotWaterSavings,
          co2ReductionTonnes: calc.co2ReductionTonnes || 5,
        };
        
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
        const proposal = await db.getProposalById(input.proposalId);
        if (!proposal) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Proposal not found' });
        }
        
        const customer = await db.getCustomerById(proposal.customerId);
        if (!customer) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Customer not found' });
        }
        
        if (!proposal.calculations) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Run calculations first' });
        }
        
        const calc = proposal.calculations as ProposalCalculations;
        
        // Build ProposalData from customer and calculations
        const proposalData: ProposalData = {
          customerName: customer.fullName,
          address: customer.address || '',
          state: customer.state,
          retailer: 'Current Retailer',
          dailyUsageKwh: calc.dailyAverageKwh || 0,
          annualUsageKwh: calc.yearlyUsageKwh || 0,
          supplyChargeCentsPerDay: 100,
          usageRateCentsPerKwh: 30,
          feedInTariffCentsPerKwh: 5,
          annualCost: calc.projectedAnnualCost || 0,
          hasGas: !!proposal.gasBillId,
          gasAnnualMJ: calc.gasKwhEquivalent ? calc.gasKwhEquivalent * 3.6 : undefined,
          gasAnnualCost: calc.gasAnnualCost,
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
          tenYearSavings: (calc.totalAnnualSavings || 3000) * 10,
          vppProvider: typeof calc.selectedVppProvider === 'object' ? (calc.selectedVppProvider as any)?.name || 'ENGIE' : calc.selectedVppProvider || 'ENGIE',
          vppProgram: 'VPP Advantage',
          vppAnnualValue: calc.vppAnnualValue || 300,
          hasGasBundle: true,
          hasEV: customer.hasEV ?? false,
          evAnnualKm: (customer as any).evAnnualKm || 10000,
          evAnnualSavings: calc.evAnnualSavings,
          hasPoolPump: customer.hasPool ?? false,
          poolPumpSavings: calc.poolHeatPumpSavings,
          hasHeatPump: !!proposal.gasBillId,
          heatPumpSavings: calc.hotWaterSavings,
          co2ReductionTonnes: calc.co2ReductionTonnes || 5,
        };
        
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
    
    createShareLink: protectedProcedure
      .input(z.object({
        proposalId: z.number(),
        expiresInDays: z.number().default(30),
      }))
      .mutation(async ({ ctx, input }) => {
        const proposal = await db.getProposalById(input.proposalId);
        if (!proposal) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Proposal not found' });
        }
        
        // Generate a unique token
        const token = nanoid(32);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + input.expiresInDays);
        
        // Create access token record
        await db.createProposalAccessToken({
          customerId: proposal.customerId,
          proposalId: input.proposalId,
          token,
          expiresAt,
          createdBy: ctx.user.id,
        });
        
        return {
          success: true,
          token,
          expiresAt,
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
  // CUSTOMER PORTAL ROUTES (Public)
  // ============================================
  portal: router({
    // Get proposal by access token (public - no auth required)
    getProposal: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const result = await db.getProposalWithCustomerByToken(input.token);
        if (!result) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Proposal not found or link expired' });
        }
        
        const { proposal, customer, accessToken } = result;
        
        // Generate slides HTML for viewing
        const slides: { slideNumber: number; html: string }[] = [];
        if (proposal.slidesData) {
          const slidesData = proposal.slidesData as any[];
          for (const slide of slidesData) {
            if (slide.isIncluded) {
              const html = generateSlideHTML(slide);
              slides.push({ slideNumber: slide.slideNumber, html });
            }
          }
        }
        
        return {
          proposal: {
            id: proposal.id,
            title: proposal.title,
            status: proposal.status,
            calculations: proposal.calculations,
            proposalDate: proposal.proposalDate,
          },
          customer: {
            fullName: customer.fullName,
            address: customer.address,
            state: customer.state,
          },
          slides,
          viewCount: accessToken.viewCount,
        };
      }),
    
    // Download PDF via access token (public)
    downloadPdf: publicProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input }) => {
        const result = await db.getProposalWithCustomerByToken(input.token);
        if (!result) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Proposal not found or link expired' });
        }
        
        const { proposal, customer } = result;
        
        // Check if PDF already exists
        if (proposal.pdfUrl) {
          return {
            fileUrl: proposal.pdfUrl,
            fileName: `${customer.fullName.replace(/\s+/g, '_')}_Proposal.pdf`,
          };
        }
        
        // Generate PDF if not exists
        const { generateProposalPdf } = await import('./pdfExport');
        
        // Build slides data for PDF
        const slidesForPdf: { title: string; subtitle?: string; content: string; type: string }[] = [];
        if (proposal.slidesData) {
          const slidesData = proposal.slidesData as any[];
          for (const slide of slidesData) {
            if (slide.isIncluded) {
              slidesForPdf.push({
                title: slide.title || '',
                subtitle: slide.content?.subtitle || '',
                content: JSON.stringify(slide.content || {}),
                type: slide.slideType || 'content',
              });
            }
          }
        }
        
        // Generate PDF
        const pdfBuffer = await generateProposalPdf(
          slidesForPdf,
          customer.fullName,
          proposal.title || `${customer.fullName} Proposal`
        );
        
        // Upload to S3
        const fileName = `proposals/${proposal.id}/${nanoid()}.pdf`;
        const { url } = await storagePut(fileName, pdfBuffer, 'application/pdf');
        
        // Update proposal with PDF URL
        await db.updateProposal(proposal.id, { pdfUrl: url, lastExportedAt: new Date() });
        
        return {
          fileUrl: url,
          fileName: `${customer.fullName.replace(/\s+/g, '_')}_Proposal.pdf`,
        };
      }),
  }),

  // ============================================
  // ANALYTICS ROUTES (Public tracking + Protected dashboard)
  // ============================================
  analytics: router({
    // Public: Record a new proposal view (called from customer portal)
    recordView: publicProcedure
      .input(z.object({
        proposalId: z.number(),
        token: z.string(),
        sessionId: z.string(),
        deviceType: z.string().optional(),
        browser: z.string().optional(),
        os: z.string().optional(),
        referrer: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Verify token is valid
        const accessToken = await db.getAccessTokenByToken(input.token);
        if (!accessToken || !accessToken.isActive) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Invalid access token' });
        }
        
        // Check if session already exists
        const existingView = await db.getViewsBySessionId(input.sessionId);
        if (existingView) {
          return { viewId: existingView.id, isReturning: true };
        }
        
        // Get IP from request
        const ipAddress = ctx.req.headers['x-forwarded-for'] as string || ctx.req.socket.remoteAddress || 'unknown';
        
        const viewId = await db.recordProposalView({
          proposalId: input.proposalId,
          accessTokenId: accessToken.id,
          sessionId: input.sessionId,
          ipAddress: ipAddress.split(',')[0].trim(),
          userAgent: ctx.req.headers['user-agent'] || '',
          referrer: input.referrer || null,
          deviceType: input.deviceType || null,
          browser: input.browser || null,
          os: input.os || null,
          durationSeconds: 0,
          totalSlidesViewed: 0,
        });
        
        return { viewId, isReturning: false };
      }),
    
    // Public: Update view duration (heartbeat from customer portal)
    updateViewDuration: publicProcedure
      .input(z.object({
        viewId: z.number(),
        durationSeconds: z.number(),
        totalSlidesViewed: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.updateProposalView(input.viewId, {
          durationSeconds: input.durationSeconds,
          totalSlidesViewed: input.totalSlidesViewed,
          lastActivityAt: new Date(),
        });
        return { success: true };
      }),
    
    // Public: Record slide engagement (called when user navigates slides)
    recordSlideView: publicProcedure
      .input(z.object({
        proposalId: z.number(),
        viewId: z.number(),
        sessionId: z.string(),
        slideIndex: z.number(),
        slideType: z.string(),
        slideTitle: z.string().optional(),
        timeSpentSeconds: z.number(),
      }))
      .mutation(async ({ input }) => {
        // Check if engagement record exists for this view + slide
        const existing = await db.getExistingSlideEngagement(input.viewId, input.slideIndex);
        
        if (existing) {
          // Update existing record
          await db.updateSlideEngagement(existing.id, {
            timeSpentSeconds: (existing.timeSpentSeconds || 0) + input.timeSpentSeconds,
            viewCount: (existing.viewCount || 0) + 1,
            lastViewedAt: new Date(),
          });
          return { engagementId: existing.id, updated: true };
        }
        
        // Create new record
        const engagementId = await db.recordSlideEngagement({
          proposalId: input.proposalId,
          viewId: input.viewId,
          sessionId: input.sessionId,
          slideIndex: input.slideIndex,
          slideType: input.slideType,
          slideTitle: input.slideTitle || null,
          timeSpentSeconds: input.timeSpentSeconds,
          viewCount: 1,
        });
        
        return { engagementId, updated: false };
      }),
    
    // Protected: Get analytics summary for a proposal
    getProposalAnalytics: protectedProcedure
      .input(z.object({ proposalId: z.number() }))
      .query(async ({ input }) => {
        return db.getProposalAnalyticsSummary(input.proposalId);
      }),
    
    // Protected: Get all views for a proposal
    getProposalViews: protectedProcedure
      .input(z.object({ proposalId: z.number() }))
      .query(async ({ input }) => {
        return db.getViewsByProposalId(input.proposalId);
      }),
    
    // Protected: Get slide engagement for a specific view
    getViewEngagement: protectedProcedure
      .input(z.object({ viewId: z.number() }))
      .query(async ({ input }) => {
        return db.getSlideEngagementByView(input.viewId);
      }),
    
    // Protected: Get aggregate analytics across all proposals
    getAggregateAnalytics: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getAggregateAnalytics(ctx.user.id);
      }),
    
    // Protected: Get expiring access tokens (links about to expire)
    getExpiringTokens: protectedProcedure
      .input(z.object({ daysUntilExpiry: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return db.getExpiringAccessTokens(ctx.user.id, input?.daysUntilExpiry ?? 7);
      }),
    
    // Protected: Get expired unviewed tokens (customer never viewed)
    getExpiredUnviewedTokens: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getExpiredUnviewedTokens(ctx.user.id);
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
