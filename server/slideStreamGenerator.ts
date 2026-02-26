/**
 * Elite Smart Energy Solutions — Real-Time Slide Stream Generator
 * 
 * SSE (Server-Sent Events) endpoint that generates slides sequentially,
 * streaming each slide to the client as it is produced. Each slide takes
 * 15–25 seconds (LLM narrative generation + HTML rendering).
 * 
 * Endpoint: GET /api/proposals/:proposalId/generate-slides-stream
 * 
 * Events emitted:
 *   { type: 'start',    total: number }
 *   { type: 'slide',    index: number, title: string, html: string, slideType: string }
 *   { type: 'progress', index: number, total: number, title: string, status: 'generating' | 'done' }
 *   { type: 'complete', slideCount: number }
 *   { type: 'error',    message: string }
 */

import type { Express, Request, Response } from "express";
import * as db from "./db";
import { generateFullCalculations } from "./calculations";
import { generateSlides, generateSlideHTML } from "./slideGenerator";
import { invokeLLM } from "./_core/llm";
import type { ProposalCalculations } from "../drizzle/schema";

// ─── Master System Prompt (from LLM Prompts Registry) ──────────────────────
const MASTER_SYSTEM_PROMPT = `You are a senior energy consultant at Elite Smart Energy Solutions, Australia's premier solar and battery advisory firm. You write in-depth, professional analysis for high-net-worth residential customers considering solar + battery investments.

WRITING STYLE:
- Write in complete, flowing paragraphs — NEVER use bullet points or numbered lists
- Bold key financial figures using <b> tags (e.g., <b>$1,471</b>)
- Use <span class="hl-aqua"> for positive/savings figures
- Use <span class="hl-orange"> for costs/current spend figures
- Use <span class="hl-white"> for neutral emphasis
- Be specific and data-driven — reference the customer's actual numbers
- Write 2-3 paragraphs per section, each 3-5 sentences
- Sound like a trusted advisor, not a salesperson
- Australian English spelling (analyse, optimise, colour, etc.)
- Reference seasonal patterns, time-of-use tariffs, and grid dynamics where relevant
- NEVER use emoji or informal language
- NEVER fabricate data — only reference numbers provided in the data context`;

// ─── Helper: format currency ────────────────────────────────────────────────
function fmt(n: number | undefined | null, decimals = 0): string {
  if (n == null) return "$0";
  return "$" + n.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// ─── Helper: send SSE event ─────────────────────────────────────────────────
function sendEvent(res: Response, data: Record<string, unknown>): void {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

// ─── Build data context string for LLM ─────────────────────────────────────
function buildDataContext(
  customerName: string,
  state: string,
  calc: ProposalCalculations
): string {
  const annualCost = calc.projectedAnnualCost || 0;
  const annualSavings = calc.totalAnnualSavings || 0;
  const projectedCost = Math.max(0, annualCost - annualSavings);
  const tenYrCost = Math.round(annualCost * Math.pow(1.035, 10));
  const twentyFiveYrCost = Math.round(annualCost * Math.pow(1.035, 25));
  const twentyFiveYrSavings = calc.twentyFiveYearSavings || annualSavings * 25;

  return `
CUSTOMER: ${customerName}
STATE: ${state}
ANNUAL ELECTRICITY COST: ${fmt(annualCost)}
DAILY USAGE: ${(calc.dailyAverageKwh || 0).toFixed(1)} kWh
ANNUAL USAGE: ${Math.round(calc.yearlyUsageKwh || 0)} kWh
USAGE RATE: ${(calc.billPeakRateCents || 30).toFixed(2)}¢/kWh
SUPPLY CHARGE: ${((calc.billDailySupplyCharge || 1.2) * 100).toFixed(2)}¢/day
FEED-IN TARIFF: ${(calc.billFeedInTariffCents || 5).toFixed(2)}¢/kWh
RETAILER: ${calc.billRetailer || "Current Retailer"}
SOLAR SIZE: ${calc.recommendedSolarKw || 10} kW
BATTERY SIZE: ${calc.recommendedBatteryKwh || 15} kWh
BATTERY BRAND: Sigenergy SigenStor
INVERTER: Sigenergy ${8} kW
SYSTEM COST: ${fmt(calc.totalInvestment)}
REBATES: ${fmt(calc.totalRebates)}
NET INVESTMENT: ${fmt(calc.netInvestment)}
ANNUAL SAVINGS: ${fmt(annualSavings)}
PAYBACK: ${(calc.paybackYears || 7).toFixed(1)} years
10-YEAR SAVINGS: ${fmt(calc.tenYearSavings)}
25-YEAR SAVINGS: ${fmt(twentyFiveYrSavings)}
PROJECTED ANNUAL COST (WITH SOLAR+BATTERY): ${fmt(projectedCost)}
10-YEAR COST (WITHOUT SOLAR, AT 3.5% INFLATION): ${fmt(tenYrCost)}
25-YEAR COST (WITHOUT SOLAR, AT 3.5% INFLATION): ${fmt(twentyFiveYrCost)}
VPP PROVIDER: ${typeof calc.selectedVppProvider === "object" ? (calc.selectedVppProvider as any)?.name || "ENGIE" : calc.selectedVppProvider || "ENGIE"}
VPP ANNUAL VALUE: ${fmt(calc.vppAnnualValue)}
CO2 REDUCTION: ${(calc.co2ReductionTonnes || 5).toFixed(1)} tonnes/year
HAS GAS: ${calc.gasAnnualCost ? "Yes" : "No"}
GAS ANNUAL COST: ${fmt(calc.gasAnnualCost)}
`;
}

// ─── LLM Narrative Generator per slide type ────────────────────────────────
async function generateNarrative(
  slideType: string,
  slideTitle: string,
  customerName: string,
  state: string,
  calc: ProposalCalculations
): Promise<string> {
  const dataContext = buildDataContext(customerName, state, calc);
  const annualCost = calc.projectedAnnualCost || 0;
  const annualSavings = calc.totalAnnualSavings || 0;
  const projectedCost = Math.max(0, annualCost - annualSavings);
  const twentyFiveYrSavings = calc.twentyFiveYearSavings || annualSavings * 25;
  const tenYrCost = Math.round(annualCost * Math.pow(1.035, 10));
  const twentyFiveYrCost = Math.round(annualCost * Math.pow(1.035, 25));
  const usageRate = calc.billPeakRateCents || 30;
  const feedIn = calc.billFeedInTariffCents || 5;
  const solarKw = calc.recommendedSolarKw || 10;
  const batteryKwh = calc.recommendedBatteryKwh || 15;
  const vppName = typeof calc.selectedVppProvider === "object"
    ? (calc.selectedVppProvider as any)?.name || "ENGIE"
    : calc.selectedVppProvider || "ENGIE";
  const vppValue = calc.vppAnnualValue || 300;
  const netInvestment = calc.netInvestment || 22000;
  const dailyKwh = calc.dailyAverageKwh || 0;

  let taskPrompt = "";

  switch (slideType) {
    case "executive_summary":
      taskPrompt = `Generate 4 narrative sections for an Executive Summary slide for ${customerName}. Each section should be 2-3 sentences of rich analysis.

Return JSON with these keys:
- "overview": A compelling opening paragraph summarising the entire proposal opportunity. Reference the transformation from ${fmt(annualCost)}/year to ${fmt(projectedCost)}/year.
- "financialCard": Analysis of the financial transformation — current spend vs projected, savings breakdown, ROI context.
- "systemCard": Why this specific system configuration (${solarKw}kW solar + ${batteryKwh}kWh Sigenergy SigenStor) is the strategic choice for this customer.
- "urgencyCard": Time-sensitive factors — rebate deadlines, rising electricity costs, seasonal considerations.

Each value should be 2-3 sentences using <b>, <span class="hl-aqua">, <span class="hl-orange"> for emphasis.`;
      break;

    case "bill_analysis":
      taskPrompt = `Write 2-3 paragraphs analysing ${customerName}'s current electricity bill. Cover:
1. Their overall cost structure — what proportion is usage vs supply charges
2. The gap between their usage rate (${usageRate}¢) and feed-in tariff (${feedIn}¢) — this is the key arbitrage opportunity
3. How their daily usage of ${dailyKwh.toFixed(1)}kWh compares to Australian household benchmarks (small: 7.5kWh, medium: 12.7kWh, large: 14.7kWh)
Use <span class="hl-orange"> for current costs and <span class="hl-aqua"> for opportunities.`;
      break;

    case "usage_analysis":
      taskPrompt = `Write 2-3 paragraphs analysing ${customerName}'s monthly usage patterns. Their annual usage is ${Math.round(calc.yearlyUsageKwh || 0)} kWh.
Cover:
1. Seasonal variation — what drives the peaks (heating/cooling) and what this means for solar sizing
2. How battery storage addresses the evening peak demand gap when solar isn't generating
3. The opportunity to shift load to solar generation hours
Use <span class="hl-aqua"> for solar/savings references and <span class="hl-orange"> for cost/problem references.`;
      break;

    case "yearly_projection":
      taskPrompt = `Write 2-3 paragraphs about the long-term cost trajectory for ${customerName}. Without action, at 3.5% annual electricity inflation, their ${fmt(annualCost)}/year bill becomes approximately ${fmt(tenYrCost)}/year in 10 years and ${fmt(twentyFiveYrCost)}/year in 25 years.
Cover:
1. The compounding effect of electricity price inflation on their current bill
2. How the solar + battery system creates a hedge against rising prices
3. The cumulative 25-year savings of ${fmt(twentyFiveYrSavings)} and what that means in real terms
Use <span class="hl-orange"> for escalating costs and <span class="hl-aqua"> for savings/protection.`;
      break;

    case "strategic_assessment":
      taskPrompt = `Write 3 paragraphs providing a strategic assessment of ${customerName}'s property and energy situation. This should read like a professional site audit report.
Cover:
1. SOLAR OPPORTUNITY: Based on their ${state} location and ${solarKw}kW system capacity — why this is an excellent candidate for solar
2. FEED-IN TARIFF EROSION: The current ${feedIn}¢/kWh feed-in rate is declining across Australia. Battery storage captures the full ${usageRate}¢/kWh value instead
3. VPP REVENUE STREAM: The ${vppName} partnership adds ${fmt(vppValue)}/year in additional income, effectively creating a third revenue stream beyond self-consumption and feed-in
Each paragraph should be 3-4 sentences of substantive analysis.`;
      break;

    case "battery_recommendation":
      taskPrompt = `Generate narrative for the ${batteryKwh}kWh Sigenergy SigenStor battery recommendation for ${customerName}.
Return JSON with:
- "whyRecommend": 2-3 sentences explaining why this specific system is recommended. Reference their usage pattern, VPP compatibility, and technical advantages.
- "financialAnalysis": 2-3 sentences on the financial case — net investment of ${fmt(netInvestment)}, annual savings, payback period of ${(calc.paybackYears || 7).toFixed(1)} years.
- "technicalSpecs": 2-3 sentences on the technical specifications — capacity, power output, warranty, and compatibility.
Each value should use <b>, <span class="hl-aqua">, <span class="hl-orange"> for emphasis.`;
      break;

    case "solar_system":
      taskPrompt = `Write 2-3 paragraphs about the proposed ${solarKw}kW solar PV system with AIKO Neostar panels for ${customerName} in ${state}.
Cover:
1. Why this system size is optimal for their ${Math.round(calc.yearlyUsageKwh || 0)} kWh annual usage
2. Expected annual generation and self-consumption rate
3. The quality and performance advantages of AIKO Neostar panels
Use <span class="hl-aqua"> for generation/savings and <span class="hl-orange"> for current grid costs.`;
      break;

    case "savings_summary":
      taskPrompt = `Write 2-3 paragraphs summarising the total savings picture for ${customerName}.
Cover:
1. The combined annual savings of ${fmt(annualSavings)} from solar self-consumption, battery arbitrage, and VPP income
2. The 10-year and 25-year cumulative savings trajectory
3. How this investment compares to other financial instruments in terms of return
Use <span class="hl-aqua"> for savings figures and <span class="hl-orange"> for current costs.`;
      break;

    case "financial_summary":
      taskPrompt = `Write 2-3 paragraphs on the financial summary and payback analysis for ${customerName}.
Cover:
1. The net investment of ${fmt(netInvestment)} after rebates and the ${(calc.paybackYears || 7).toFixed(1)}-year payback period
2. The internal rate of return and how it compares to bank interest rates
3. The risk-adjusted value of locking in energy costs for 25+ years
Use <span class="hl-aqua"> for positive financial outcomes and <span class="hl-orange"> for investment figures.`;
      break;

    case "environmental_impact":
      taskPrompt = `Write 2-3 paragraphs on the environmental impact for ${customerName}.
Cover:
1. The ${(calc.co2ReductionTonnes || 5).toFixed(1)} tonnes/year CO2 reduction and what that equates to in practical terms
2. The 25-year cumulative environmental benefit
3. The broader community benefit of distributed solar generation and VPP participation
Use <span class="hl-aqua"> for environmental benefits and neutral professional language throughout.`;
      break;

    case "conclusion":
      taskPrompt = `Write 2-3 paragraphs as a compelling conclusion for ${customerName}'s proposal.
Cover:
1. A summary of the key opportunity — the transformation from ${fmt(annualCost)}/year to ${fmt(projectedCost)}/year
2. Why now is the right time to act — rebate availability, rising energy costs, technology maturity
3. A call to action — the next steps to move forward with Elite Smart Energy Solutions
Use <span class="hl-aqua"> for positive outcomes and <span class="hl-orange"> for the cost of inaction.`;
      break;

    default:
      // For slides without specific narrative prompts, generate a generic one
      taskPrompt = `Write 2-3 professional paragraphs for the "${slideTitle}" slide in ${customerName}'s solar and battery proposal.
Be specific, data-driven, and reference the customer's actual numbers from the data context.
Use <span class="hl-aqua"> for positive/savings figures and <span class="hl-orange"> for costs.`;
  }

  try {
    const result = await invokeLLM({
      messages: [
        {
          role: "system",
          content: MASTER_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `DATA CONTEXT:\n${dataContext}\n\nTASK:\n${taskPrompt}`,
        },
      ],
      maxTokens: 800,
    });

    const rawContent = result.choices?.[0]?.message?.content || "";
    const content = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);
    return content;
  } catch (err) {
    console.error(`[SlideStream] LLM error for ${slideType}:`, err);
    return ""; // Return empty string on error — slide will render without narrative
  }
}

// ─── Register the SSE route ─────────────────────────────────────────────────
export function registerSlideStreamRoute(app: Express): void {
  app.get(
    "/api/proposals/:proposalId/generate-slides-stream",
    async (req: Request, res: Response) => {
      const proposalId = parseInt(req.params.proposalId, 10);
      if (isNaN(proposalId)) {
        res.status(400).json({ error: "Invalid proposal ID" });
        return;
      }

      // Set SSE headers
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering
      res.flushHeaders();

      // Keep-alive ping every 15s
      const pingInterval = setInterval(() => {
        res.write(": ping\n\n");
      }, 15000);

      const cleanup = () => clearInterval(pingInterval);
      req.on("close", cleanup);

      try {
        // ── 1. Load proposal ──────────────────────────────────────────────
        let proposal = await db.getProposalById(proposalId);
        if (!proposal) {
          sendEvent(res, { type: "error", message: "Proposal not found" });
          res.end();
          cleanup();
          return;
        }

        const customer = await db.getCustomerById(proposal.customerId);
        if (!customer) {
          sendEvent(res, { type: "error", message: "Customer not found" });
          res.end();
          cleanup();
          return;
        }

        // ── 2. Auto-calculate if needed ───────────────────────────────────
        if (!proposal.calculations) {
          if (!proposal.electricityBillId) {
            sendEvent(res, {
              type: "error",
              message: "Electricity bill required for calculations",
            });
            res.end();
            cleanup();
            return;
          }
          const electricityBill = await db.getBillById(proposal.electricityBillId);
          if (!electricityBill) {
            sendEvent(res, { type: "error", message: "Electricity bill not found" });
            res.end();
            cleanup();
            return;
          }
          let gasBill = null;
          if (proposal.gasBillId) {
            gasBill = await db.getBillById(proposal.gasBillId);
          }
          const vppProviders = await db.getVppProvidersByState(customer.state);
          const rebates = await db.getRebatesByState(customer.state);
          const calculations = generateFullCalculations(
            customer,
            electricityBill,
            gasBill ?? null,
            vppProviders,
            rebates
          );
          await db.updateProposal(proposalId, { calculations, status: "draft" });
          proposal = await db.getProposalById(proposalId);
          if (!proposal) {
            sendEvent(res, { type: "error", message: "Failed to reload proposal" });
            res.end();
            cleanup();
            return;
          }
        }

        const calc = proposal.calculations as ProposalCalculations;

        // ── 3. Generate slide structure ───────────────────────────────────
        // We use buildProposalData via dynamic import to avoid circular deps
        const { generateSlides: genSlides } = await import("./slideGenerator");
        // Build a minimal ProposalData for slide structure generation
        const vppName =
          typeof calc.selectedVppProvider === "object"
            ? (calc.selectedVppProvider as any)?.name || "ENGIE"
            : calc.selectedVppProvider || "ENGIE";
        const vppProgram =
          typeof calc.selectedVppProvider === "object"
            ? (calc.selectedVppProvider as any)?.programName || "VPP Advantage"
            : "VPP Advantage";

        const proposalData = {
          customerName: customer.fullName,
          address: customer.address || "",
          state: customer.state,
          retailer: calc.billRetailer || "Current Retailer",
          dailyUsageKwh: calc.dailyAverageKwh || 0,
          annualUsageKwh: calc.yearlyUsageKwh || 0,
          supplyChargeCentsPerDay: (calc.billDailySupplyCharge || 1.2) * 100,
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
          hasGas: !!(calc.gasAnnualCost && calc.gasAnnualCost > 0),
          hasSolarNew: customer.hasSolarNew ?? false,
          hasSolarOld: customer.hasSolarOld ?? false,
          gasAnnualMJ: calc.gasBillUsageMj
            ? (calc.gasBillUsageMj / (calc.gasBillDays || 90)) * 365
            : undefined,
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
          panelBrand: "AIKO Neostar",
          batterySizeKwh: calc.recommendedBatteryKwh || 15,
          batteryBrand: "Sigenergy SigenStor",
          inverterSizeKw: 8,
          inverterBrand: "Sigenergy",
          systemCost: calc.totalInvestment || 25000,
          rebateAmount: calc.totalRebates || 3000,
          netInvestment: calc.netInvestment || 22000,
          annualSavings: calc.totalAnnualSavings || 3000,
          paybackYears: calc.paybackYears || 7,
          tenYearSavings:
            calc.tenYearSavings || (calc.totalAnnualSavings || 3000) * 10,
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
          hasHeatPump: !!(calc.gasAnnualCost && calc.gasAnnualCost > 0),
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

        const slides = genSlides(proposalData as any);
        const total = slides.length;

        // ── 4. Emit start event ───────────────────────────────────────────
        sendEvent(res, { type: "start", total });

        // ── 5. Generate each slide sequentially ───────────────────────────
        const completedSlides: Array<{
          id: number;
          type: string;
          title: string;
          html: string;
        }> = [];

        // Slides that benefit from LLM narrative enrichment
        const narrativeSlideTypes = new Set([
          "executive_summary",
          "bill_analysis",
          "usage_analysis",
          "yearly_projection",
          "strategic_assessment",
          "battery_recommendation",
          "solar_system",
          "savings_summary",
          "financial_summary",
          "environmental_impact",
          "conclusion",
        ]);

        for (let i = 0; i < slides.length; i++) {
          const slide = slides[i];

          // Emit "generating" progress event
          sendEvent(res, {
            type: "progress",
            index: i,
            total,
            title: slide.title,
            status: "generating",
          });

          let html = "";

          if (narrativeSlideTypes.has(slide.type)) {
            // Generate LLM narrative first (15-25s per slide)
            const narrative = await generateNarrative(
              slide.type,
              slide.title,
              customer.fullName,
              customer.state,
              calc
            );

            // Inject narrative into slide content if it's non-empty
            if (narrative) {
              // Try to parse as JSON for structured slides (executive_summary, battery_recommendation)
              if (
                slide.type === "executive_summary" ||
                slide.type === "battery_recommendation"
              ) {
                try {
                  // Extract JSON from the response (handle markdown code blocks)
                  const jsonMatch = narrative.match(/```(?:json)?\s*([\s\S]*?)```/) ||
                    narrative.match(/(\{[\s\S]*\})/);
                  if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[1]);
                    slide.content = { ...slide.content, narrative: parsed };
                  } else {
                    slide.content = { ...slide.content, narrativeText: narrative };
                  }
                } catch {
                  slide.content = { ...slide.content, narrativeText: narrative };
                }
              } else {
                slide.content = { ...slide.content, narrativeText: narrative };
              }
            }
          }

          // Generate HTML for this slide
          html = generateSlideHTML(slide);

          completedSlides.push({
            id: slide.id,
            type: slide.type,
            title: slide.title,
            html,
          });

          // Emit the completed slide
          sendEvent(res, {
            type: "slide",
            index: i,
            slideId: slide.id,
            slideType: slide.type,
            title: slide.title,
            html,
          });

          // Emit "done" progress event
          sendEvent(res, {
            type: "progress",
            index: i,
            total,
            title: slide.title,
            status: "done",
          });
        }

        // ── 6. Save final slides to DB ─────────────────────────────────────
        // Build SlideData array for DB storage
        const slidesData = slides.map((s, idx) => ({
          slideNumber: idx + 1,
          slideType: s.type,
          title: s.title,
          isConditional: false,
          isIncluded: true,
          content: s.content,
        }));

        await db.updateProposal(proposalId, {
          slidesData,
          slideCount: slidesData.length,
          status: "generated",
        });

        // ── 7. Emit complete event ─────────────────────────────────────────
        sendEvent(res, { type: "complete", slideCount: slides.length });
        res.end();
        cleanup();
      } catch (err) {
        console.error("[SlideStream] Fatal error:", err);
        sendEvent(res, {
          type: "error",
          message: err instanceof Error ? err.message : "Unknown error",
        });
        res.end();
        cleanup();
      }
    }
  );
}
