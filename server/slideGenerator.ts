// Lightning Energy Proposal Generator — Slide Generator
// Matches exact design from Steve Zafiriou SA proposal example (17 slides)

import { BRAND } from '../shared/brand';
import { FONT_NEXTSPHERE_B64, FONT_GENERALSANS_B64, FONT_URBANIST_B64, FONT_URBANIST_ITALIC_B64, LOGO_AQUA_B64, COVER_BG_B64 } from '../shared/fontAssets';

export interface ProposalData {
  // Customer Info
  customerName: string;
  address: string;
  state: string;
  
  // Bill Data - Summary
  retailer: string;
  dailyUsageKwh: number;
  annualUsageKwh: number;
  supplyChargeCentsPerDay: number;
  usageRateCentsPerKwh: number;
  feedInTariffCentsPerKwh: number;
  controlledLoadRateCentsPerKwh?: number;
  annualCost: number;
  monthlyUsageData?: { month: string; kwh: number; cost: number }[];
  
  // Bill Data - Detailed Breakdown (from extraction)
  billPeriodStart?: string;
  billPeriodEnd?: string;
  billDays?: number;
  billTotalAmount?: number;
  billTotalUsageKwh?: number;
  billPeakUsageKwh?: number;
  billOffPeakUsageKwh?: number;
  billShoulderUsageKwh?: number;
  billSolarExportsKwh?: number;
  billPeakRateCents?: number;
  billOffPeakRateCents?: number;
  billShoulderRateCents?: number;
  dailyAverageCost?: number;
  annualSupplyCharge?: number;
  annualUsageCharge?: number;
  annualSolarCredit?: number;
  monthlyUsageKwh?: number;
  
  // Gas Data (optional)
  hasGas: boolean;
  gasAnnualMJ?: number;
  gasAnnualCost?: number;
  gasDailySupplyCharge?: number;
  gasUsageRate?: number;
  gasCO2Emissions?: number;
  
  // Gas Bill - Detailed Breakdown
  gasBillRetailer?: string;
  gasBillPeriodStart?: string;
  gasBillPeriodEnd?: string;
  gasBillDays?: number;
  gasBillTotalAmount?: number;
  gasBillUsageMj?: number;
  gasBillRateCentsMj?: number;
  gasDailyGasCost?: number;
  gasAnnualSupplyCharge?: number;
  gasKwhEquivalent?: number;
  
  // Gas Appliances (optional)
  gasAppliances?: {
    hotWater?: { type: string; brand?: string; age?: number; annualCost?: number };
    heating?: { type: string; brand?: string; age?: number; annualCost?: number };
    cooktop?: { type: string; brand?: string; annualCost?: number };
    poolHeater?: { type: string; brand?: string; annualCost?: number };
  };
  
  // System Recommendations
  solarSizeKw: number;
  panelCount: number;
  panelWattage: number;
  panelBrand: string;
  batterySizeKwh: number;
  batteryBrand: string;
  inverterSizeKw: number;
  inverterBrand: string;
  
  // Financial
  systemCost: number;
  rebateAmount: number;
  netInvestment: number;
  annualSavings: number;
  paybackYears: number;
  tenYearSavings: number;
  twentyFiveYearSavings?: number;
  
  // VPP
  vppProvider: string;
  vppProgram: string;
  vppAnnualValue: number;
  hasGasBundle: boolean;
  vppDailyCreditAnnual?: number;
  vppEventPaymentsAnnual?: number;
  vppBundleDiscount?: number;
  
  // EV (optional)
  hasEV: boolean;
  evAnnualKm?: number;
  evAnnualSavings?: number;
  evChargerCost?: number;
  evChargerBrand?: string;
  evPetrolCost?: number;
  evGridChargeCost?: number;
  evSolarChargeCost?: number;
  evConsumptionPer100km?: number;
  evPetrolPricePerLitre?: number;
  
  // Electrification - Pool
  hasPool: boolean;
  hasPoolPump: boolean;
  hasAppliances: boolean;
  poolPumpSavings?: number;
  poolHeatPumpCost?: number;
  poolHeatPumpBrand?: string;
  poolRecommendedKw?: number;
  poolAnnualOperatingCost?: number;
  
  // Electrification - Heat Pump
  hasHeatPump: boolean;
  heatPumpSavings?: number;
  heatPumpCost?: number;
  heatPumpBrand?: string;
  hotWaterCurrentGasCost?: number;
  hotWaterHeatPumpCost?: number;
  hotWaterDailySupplySaved?: number;
  
  // Heating & Cooling
  heatingCoolingSavings?: number;
  heatingCoolingCost?: number;
  acBrand?: string;
  heatingCurrentGasCost?: number;
  heatingRcAcCost?: number;
  
  // Induction Cooking
  inductionSavings?: number;
  inductionCost?: number;
  inductionBrand?: string;
  cookingCurrentGasCost?: number;
  cookingInductionCost?: number;
  
  // Investment Details
  investmentSolar?: number;
  investmentBattery?: number;
  investmentHeatPumpHw?: number;
  investmentRcAc?: number;
  investmentInduction?: number;
  investmentEvCharger?: number;
  investmentPoolHeatPump?: number;
  solarRebateAmount?: number;
  batteryRebateAmount?: number;
  heatPumpHwRebateAmount?: number;
  heatPumpAcRebateAmount?: number;
  
  // Full Electrification Investment
  electrificationTotalCost?: number;
  electrificationTotalRebates?: number;
  electrificationNetCost?: number;
  
  // Existing Solar System
  existingSolar?: 'none' | 'under_5_years' | 'over_5_years';
  
  // Site Assessment
  sitePhotos?: Array<{ url: string; caption: string }>;
  
  // Environmental
  co2ReductionTonnes: number;
  treesEquivalent?: number;
  energyIndependenceScore?: number;
  co2CurrentTonnes?: number;
  co2ProjectedTonnes?: number;
  co2ReductionPercent?: number;
  
  // Custom Notes & Instructions (for LLM narrative enrichment)
  proposalNotes?: string;
  regeneratePrompt?: string;
}

export interface SlideContent {
  id: number;
  type: string;
  title: string;
  subtitle?: string;
  content: Record<string, unknown>;
}

// ============================================================
// GENERATE ALL SLIDES — 17-slide structure matching Steve Zafiriou PDF
// ============================================================
// Slide order: Cover → Exec Summary → Bill Analysis → Bill Breakdown
// → Seasonal Usage → Annual Consumption → Projected Annual Cost
// → Battery Benefits → Battery Considerations → Battery Storage
// → Solar PV → Financial Impact → Environmental Impact
// → Strategic Pathway → Contact → VPP Recommendation → Financial Impact Analysis
export function generateSlides(data: ProposalData): SlideContent[] {
  const slides: SlideContent[] = [];
  let slideId = 1;
  
  // State-specific peak sun hours for accurate solar production estimates
  const statePSH: Record<string, number> = { VIC: 3.6, NSW: 4.2, QLD: 4.8, SA: 4.5, WA: 4.8, TAS: 3.3, NT: 5.5, ACT: 4.0 };
  const psh = statePSH[data.state] || 4.0;
  const performanceRatio = 0.80;
  const avgDailySolar = data.solarSizeKw * psh * performanceRatio;
  const annualSolarProduction = Math.round(data.solarSizeKw * psh * performanceRatio * 365);
  const solarOffset = data.annualUsageKwh > 0 ? Math.round((annualSolarProduction / data.annualUsageKwh) * 100) : 100;
  
  // Monthly factors for seasonal variation
  const monthlyFactors: Record<string, number> = { Jan: 1.4, Feb: 1.3, Mar: 1.1, Apr: 0.9, May: 0.7, Jun: 0.6, Jul: 0.6, Aug: 0.7, Sep: 0.9, Oct: 1.1, Nov: 1.3, Dec: 1.4 };
  const defaultMonths = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  
  const monthlyProjection = (data.monthlyUsageData && data.monthlyUsageData.length > 0)
    ? data.monthlyUsageData.map(m => ({
        month: m.month,
        kwh: Math.round(m.kwh),
        cost: m.cost || Math.round(m.kwh * data.usageRateCentsPerKwh / 100),
        solar: Math.round(avgDailySolar * (monthlyFactors[m.month.substring(0, 3)] || 1.0) * 30),
      }))
    : defaultMonths.map(m => ({
        month: m,
        kwh: Math.round(data.annualUsageKwh / 12),
        cost: Math.round((data.annualUsageKwh / 12) * data.usageRateCentsPerKwh / 100),
        solar: Math.round(avgDailySolar * (monthlyFactors[m] || 1.0) * 30),
      }));
  
  // Cost calculations
  const usageCostAnnual = data.annualUsageCharge || data.annualUsageKwh * (data.usageRateCentsPerKwh / 100);
  const supplyCostAnnual = data.annualSupplyCharge || data.supplyChargeCentsPerDay * 365 / 100;
  const totalCostForPercent = usageCostAnnual + supplyCostAnnual;
  const usagePercent = totalCostForPercent > 0 ? Math.round((usageCostAnnual / totalCostForPercent) * 100) : 50;
  
  // Environmental calculations
  const co2Current = data.co2CurrentTonnes || parseFloat((data.annualUsageKwh * 0.7 / 1000).toFixed(1));
  const co2Projected = data.co2ProjectedTonnes || parseFloat((co2Current * 0.2).toFixed(1));
  const co2ReductionPct = data.co2ReductionPercent || Math.round(((co2Current - co2Projected) / co2Current) * 100);
  const treesEquiv = data.treesEquivalent || Math.round(data.co2ReductionTonnes * 37);
  const carsRemoved = parseFloat((data.co2ReductionTonnes / 4.6).toFixed(1));
  const co2_25yr = Math.round(data.co2ReductionTonnes * 25);
  
  // Financial calculations
  const billReductionPct = data.annualCost > 0 ? Math.round((data.annualSavings / data.annualCost) * 100) : 0;
  const roi25yr = data.netInvestment > 0 ? Math.round(((data.twentyFiveYearSavings || data.annualSavings * 25) / data.netInvestment) * 100) : 0;
  const npv25yr = Math.round((data.twentyFiveYearSavings || data.annualSavings * 25) - data.netInvestment);
  const irr = data.netInvestment > 0 ? parseFloat((data.annualSavings / data.netInvestment * 100).toFixed(1)) : 0;
  
  // Battery modules calculation
  const moduleSize = 8.06;
  const batteryModuleCount = Math.ceil(data.batterySizeKwh / moduleSize);
  const usableCapacity = Math.round(data.batterySizeKwh * 0.95);
  
  // VPP providers for comparison table
  const vppProviders = getVPPProviders(data.state, data.hasGasBundle);
  
  // Slide 1: COVER
  slides.push({
    id: slideId++,
    type: 'cover',
    title: data.customerName,
    subtitle: 'Strategic Pathway to Energy Independence and Cost Reduction',
    content: {
      address: data.address,
      state: data.state,
      preparedBy: BRAND.contact.name,
      preparedByTitle: BRAND.contact.title,
      company: BRAND.contact.company,
      logoUrl: LOGO_URI_AQUA,
      date: new Date().toLocaleDateString('en-AU', { month: 'long', year: 'numeric' }),
    }
  });
  
  // Slide 2: EXECUTIVE SUMMARY — Current Energy Profile
  slides.push({
    id: slideId++,
    type: 'executive_summary',
    title: 'CURRENT ENERGY PROFILE',
    subtitle: 'Key Findings & Strategic Recommendations',
    content: {
      currentAnnualCost: data.annualCost,
      systemSize: data.solarSizeKw,
      batterySize: data.batterySizeKwh,
      paybackYears: data.paybackYears,
      tenYearBenefit: data.tenYearSavings,
      dailyUsageKwh: data.dailyUsageKwh,
      annualUsageKwh: data.annualUsageKwh,
      totalAnnualSavings: data.annualSavings,
      vppProvider: data.vppProvider,
      billReductionPct,
      solarOffset,
    }
  });
  
  // Slide 3: ACCOUNT DETAILS & CURRENT TARIFF STRUCTURE
  slides.push({
    id: slideId++,
    type: 'bill_analysis',
    title: 'ACCOUNT DETAILS & CURRENT TARIFF STRUCTURE',
    subtitle: data.billPeriodStart && data.billPeriodEnd 
      ? `Billing Period: ${data.billPeriodStart} to ${data.billPeriodEnd} (${data.billDays || 90} days)` 
      : `${data.retailer} Plan Analysis`,
    content: {
      retailer: data.retailer,
      customerName: data.customerName,
      address: data.address,
      state: data.state,
      annualCost: data.annualCost,
      usageCost: usageCostAnnual,
      supplyCost: supplyCostAnnual,
      solarCredit: data.annualSolarCredit || 0,
      usageRate: data.usageRateCentsPerKwh,
      supplyCharge: data.supplyChargeCentsPerDay,
      feedInTariff: data.feedInTariffCentsPerKwh,
      controlledLoadRate: data.controlledLoadRateCentsPerKwh,
      peakRate: data.billPeakRateCents,
      offPeakRate: data.billOffPeakRateCents,
      shoulderRate: data.billShoulderRateCents,
      dailyAverageKwh: data.dailyUsageKwh,
      dailyAverageCost: data.dailyAverageCost || (data.annualCost ? data.annualCost / 365 : 0),
      billDays: data.billDays,
      billTotalAmount: data.billTotalAmount,
      billTotalUsageKwh: data.billTotalUsageKwh,
    }
  });
  
  // Slide 4: CURRENT BILL BREAKDOWN (donut chart + charges table)
  slides.push({
    id: slideId++,
    type: 'bill_breakdown',
    title: 'CURRENT BILL BREAKDOWN',
    subtitle: 'Annual Cost Analysis',
    content: {
      totalAnnualCost: data.annualCost,
      dailyAverageCost: data.dailyAverageCost || (data.annualCost ? data.annualCost / 365 : 0),
      usageCharges: usageCostAnnual,
      supplyCharges: supplyCostAnnual,
      solarCredit: data.annualSolarCredit || 0,
      usageChargesPercent: usagePercent,
      supplyChargesPercent: 100 - usagePercent,
      billDays: data.billDays,
      billPeriodStart: data.billPeriodStart,
      billPeriodEnd: data.billPeriodEnd,
      billTotalAmount: data.billTotalAmount,
    }
  });
  
  // Slide 5: SEASONAL USAGE PATTERNS (monthly bar chart with season colors)
  slides.push({
    id: slideId++,
    type: 'seasonal_usage',
    title: 'SEASONAL USAGE PATTERNS',
    subtitle: 'Monthly Consumption Analysis',
    content: {
      monthlyData: monthlyProjection,
      annualUsageKwh: data.annualUsageKwh,
      dailyUsageKwh: data.dailyUsageKwh,
    }
  });
  
  // Slide 6: ANNUAL CONSUMPTION ANALYSIS (area line chart + metrics)
  slides.push({
    id: slideId++,
    type: 'annual_consumption',
    title: 'ANNUAL CONSUMPTION ANALYSIS',
    subtitle: 'Usage vs Solar Production',
    content: {
      monthlyData: monthlyProjection,
      annualUsageKwh: data.annualUsageKwh,
      annualSolarProduction,
      solarSizeKw: data.solarSizeKw,
      solarOffset,
      dailyUsageKwh: data.dailyUsageKwh,
    }
  });
  
  // Slide 7: PROJECTED ANNUAL COST (cost trend line chart)
  const costProjection = Array.from({ length: 26 }, (_, i) => ({
    year: i,
    withoutSolar: Math.round(data.annualCost * Math.pow(1.035, i)),
    withSolar: Math.round(Math.max(0, data.annualCost - data.annualSavings) * Math.pow(1.02, i)),
  }));
  slides.push({
    id: slideId++,
    type: 'projected_annual_cost',
    title: 'PROJECTED ANNUAL COST',
    subtitle: '25-Year Cost Trajectory',
    content: {
      costProjection,
      currentAnnualCost: data.annualCost,
      projectedCostYear10: Math.round(data.annualCost * Math.pow(1.035, 10)),
      projectedCostYear25: Math.round(data.annualCost * Math.pow(1.035, 25)),
      withSolarYear10: Math.round(Math.max(0, data.annualCost - data.annualSavings) * Math.pow(1.02, 10)),
      cumulativeSavings25yr: data.twentyFiveYearSavings || Math.round(data.annualSavings * 25 * 1.4),
    }
  });
  
  // Slide 8: SEVEN KEY BENEFITS OF SOLAR BATTERY (7 benefit cards)
  slides.push({
    id: slideId++,
    type: 'battery_benefits',
    title: 'SEVEN KEY BENEFITS OF SOLAR BATTERY',
    subtitle: 'Why Battery Storage Makes Sense',
    content: {
      benefits: [
        { icon: '⚡', title: 'ENERGY INDEPENDENCE', description: `Reduce grid dependence by up to ${data.energyIndependenceScore || 85}% with your ${data.batterySizeKwh}kWh battery providing substantial overnight coverage.` },
        { icon: '💰', title: 'SIGNIFICANT BILL REDUCTION', description: `Save up to $${data.annualSavings.toLocaleString()} annually by storing excess solar for evening use instead of buying expensive peak electricity.` },
        { icon: '🔋', title: 'BLACKOUT PROTECTION', description: `Seamless backup power during grid outages. Essential circuits remain powered with automatic switchover from your ${data.batteryBrand} system.` },
        { icon: '📈', title: 'VPP REVENUE STREAM', description: `Earn $${data.vppAnnualValue.toLocaleString()}+/year through ${data.vppProvider} Virtual Power Plant participation — your battery becomes a revenue-generating asset.` },
        { icon: '🌱', title: 'ENVIRONMENTAL IMPACT', description: `Reduce your carbon footprint by ${co2ReductionPct}% — equivalent to planting ${treesEquiv} trees annually.` },
        { icon: '🏠', title: 'PROPERTY VALUE INCREASE', description: `Solar + battery systems add 3-5% to property value. A smart investment that pays dividends whether you stay or sell.` },
        { icon: '🔒', title: 'PRICE HEDGE', description: `Lock in energy costs and protect against rising electricity prices (averaging 3.5% annual increases) for the next 25 years.` },
      ],
    }
  });
  
  // Slide 9: IMPORTANT FACTORS TO CONSIDER (6 factor cards + balanced view)
  slides.push({
    id: slideId++,
    type: 'battery_considerations',
    title: 'IMPORTANT FACTORS TO CONSIDER BEFORE INVESTMENT',
    subtitle: 'Balanced Assessment',
    content: {
      considerations: [
        { icon: '💵', title: 'INITIAL INVESTMENT', description: `$${(data.netInvestment || 15000).toLocaleString()} net after rebates. Significant but strategic investment in your property's energy infrastructure.` },
        { icon: '📉', title: 'DEGRADATION', description: '2-3% annual capacity reduction. LFP chemistry provides 6,000+ cycles with <20% degradation over 10 years.' },
        { icon: '📋', title: 'WARRANTY LIMITS', description: '10-year manufacturer warranty with performance guarantees. Battery replacement costs may apply after warranty period.' },
        { icon: '⏱️', title: 'PAYBACK TIME', description: `${data.paybackYears.toFixed(0)}-${(data.paybackYears + 2).toFixed(0)} year estimated payback. Rising electricity costs (3.5%/yr) will likely accelerate this timeline.` },
        { icon: '📐', title: 'SPACE NEEDS', description: 'Wall-mounted battery requires approximately 1m² of protected wall space. Inverter requires additional mounting space.' },
        { icon: '🔄', title: 'TECH EVOLUTION', description: 'Battery technology continues to improve. However, delaying means missing current rebates and paying higher electricity costs.' },
      ],
      balancedView: 'Despite these considerations, the long-term savings, energy security, and protection against rising grid prices typically outweigh the initial costs for high-consumption households like yours.',
    }
  });
  
  // Slide 10: BATTERY STORAGE SOLUTION (alt header style)
  slides.push({
    id: slideId++,
    type: 'battery_storage',
    title: 'BATTERY STORAGE SOLUTION',
    subtitle: `${data.batterySizeKwh} KWH CAPACITY`,
    content: {
      totalCapacityKwh: data.batterySizeKwh,
      usableCapacity,
      batteryBrand: data.batteryBrand,
      moduleCount: batteryModuleCount,
      moduleSize,
      moduleConfig: `${batteryModuleCount} × ${data.batteryBrand.includes('GoodWe') ? 'GoodWe GW8.3' : 'Sigenergy'} Modules (${usableCapacity} kWh Usable)`,
      technology: 'LFP',
      depthOfDischarge: '98%',
      headerRight: 'Ultimate Independence',
      // Capacity allocation
      eveningUse: 30,
      vppTrading: 40,
      backup: 30,
    }
  });
  
  // Slide 11: SOLAR PV RECOMMENDATION (alt header style)
  slides.push({
    id: slideId++,
    type: 'solar_pv',
    title: 'SOLAR PV RECOMMENDATION',
    subtitle: `${data.solarSizeKw} KW SYSTEM`,
    content: {
      systemSizeKw: data.solarSizeKw,
      panelCount: data.panelCount,
      panelWattage: data.panelWattage,
      panelBrand: data.panelBrand,
      panelConfig: `${data.panelCount} × ${data.panelWattage}W ${data.panelBrand} Panels`,
      annualProductionKwh: annualSolarProduction,
      solarOffset,
      annualUsageKwh: data.annualUsageKwh,
      inverterSize: data.inverterSizeKw,
      inverterBrand: data.inverterBrand,
      headerRight: 'System Configuration',
    }
  });
  
  // Slide 12: FINANCIAL IMPACT — 25-Year Outlook (alt header style)
  slides.push({
    id: slideId++,
    type: 'financial_impact',
    title: 'FINANCIAL IMPACT',
    subtitle: '25-YEAR OUTLOOK',
    content: {
      annualSavings: data.annualSavings,
      billReductionPct,
      paybackYears: data.paybackYears,
      roi25yr,
      npv25yr,
      irr,
      headerRight: 'Investment Analysis',
    }
  });
  
  // Slide 13: ENVIRONMENTAL IMPACT — Carbon Reduction
  slides.push({
    id: slideId++,
    type: 'environmental_impact',
    title: `${co2ReductionPct}% CARBON REDUCTION THROUGH SOLAR + BATTERY INSTALLATION`,
    content: {
      co2Current,
      co2Projected,
      co2ReductionPct,
      treesEquiv,
      carsRemoved,
      co2_25yr,
    }
  });
  
  // Slide 14: STRATEGIC PATHWAY TO ENERGY INDEPENDENCE (Roadmap)
  slides.push({
    id: slideId++,
    type: 'strategic_pathway',
    title: 'STRATEGIC PATHWAY TO ENERGY INDEPENDENCE',
    content: {
      steps: [
        { number: '01', title: `Install ${data.solarSizeKw >= 8 ? '8-10' : '5-8'} kW Solar PV System`, description: 'Cover 100%+ of annual consumption and generate surplus for export credits.' },
        { number: '02', title: `Add ${data.batterySizeKwh >= 10 ? '10-13.5' : '5-10'} kWh Battery Storage`, description: 'Maximize self-consumption to 80%+ and provide essential backup power.' },
        { number: '03', title: 'Select Hybrid Inverter Technology', description: 'Ensure seamless solar/battery integration and future-ready expansion.' },
        { number: '04', title: 'Switch to Time-of-Use Tariff', description: 'Optimize savings by avoiding peak rates and leveraging battery storage.' },
        { number: '05', title: 'Explore VPP Program Participation', description: 'Generate additional income streams by supporting grid stability.' },
      ],
      investmentSummary: {
        totalCostRange: `$${Math.round(data.netInvestment * 0.85 / 1000)}K - $${Math.round(data.netInvestment * 1.15 / 1000)}K`,
        annualSavings: data.annualSavings,
        paybackRange: `${(data.paybackYears - 0.5).toFixed(1)} - ${(data.paybackYears + 1.5).toFixed(0)} YEARS`,
        netBenefit25yr: data.twentyFiveYearSavings || Math.round(data.annualSavings * 25 * 1.4),
      },
    }
  });
  
  // Slide 15: CONTACT — Next Steps + Contact Details
  slides.push({
    id: slideId++,
    type: 'contact',
    title: 'READY TO BEGIN YOUR SOLAR JOURNEY?',
    content: {
      preparedBy: BRAND.contact.name,
      title: BRAND.contact.title,
      company: BRAND.contact.company,
      address: BRAND.contact.address,
      phone: BRAND.contact.phone,
      email: BRAND.contact.email,
      website: BRAND.contact.website,
      copyright: BRAND.contact.copyright,
      logoUrl: LOGO_URI_AQUA,
    }
  });
  
  // Slide 16: VPP RECOMMENDATION (alt header style)
  slides.push({
    id: slideId++,
    type: 'vpp_recommendation',
    title: 'RECOMMENDED VPP STRATEGY',
    subtitle: data.vppProgram?.toUpperCase() || data.vppProvider.toUpperCase(),
    content: {
      provider: data.vppProvider,
      program: data.vppProgram,
      annualValue: data.vppAnnualValue,
      firstYearValue: data.vppAnnualValue + (data.vppBundleDiscount || 0) + 200,
      ongoingValue: data.vppAnnualValue,
      hasGas: data.hasGas,
      hasGasBundle: data.hasGasBundle,
      batteryBrand: data.batteryBrand,
      solarSizeKw: data.solarSizeKw,
      batterySizeKwh: data.batterySizeKwh,
      providers: vppProviders.slice(0, 5),
      headerRight: 'Strategic Roadmap',
    }
  });
  
  // Slide 17: FINANCIAL IMPACT ANALYSIS — ROI & Payback (alt header style)
  const electricitySavings = data.annualSavings - data.vppAnnualValue - (data.vppBundleDiscount || 0);
  slides.push({
    id: slideId++,
    type: 'financial_impact_analysis',
    title: 'FINANCIAL IMPACT ANALYSIS',
    subtitle: 'ROI & PAYBACK',
    content: {
      netSystemCost: data.netInvestment,
      rebateAmount: data.rebateAmount,
      paybackYears: data.paybackYears,
      paybackWithoutVpp: parseFloat((data.paybackYears * 1.1).toFixed(1)),
      roi25yr,
      lifetimeSavings: data.twentyFiveYearSavings || Math.round(data.annualSavings * 25 * 1.4),
      annualBenefitBreakdown: [
        { category: 'Electricity Bill Savings', value: electricitySavings, percent: Math.round((electricitySavings / data.annualSavings) * 100) },
        { category: `${data.vppProvider} VPP Earnings`, value: data.vppAnnualValue, percent: Math.round((data.vppAnnualValue / data.annualSavings) * 100) },
        ...(data.hasGasBundle ? [{ category: 'Gas + Elec Bundle Discount', value: data.vppBundleDiscount || 150, percent: Math.round(((data.vppBundleDiscount || 150) / data.annualSavings) * 100) }] : []),
      ],
      totalAnnualBenefit: data.annualSavings,
      headerRight: 'Investment Overview',
    }
  });
  
  return slides;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getVPPProviders(state: string, hasGas: boolean): Array<{
  provider: string; program: string; gasBundle: boolean; batterySupport: boolean; annualValue: string; verdict: string;
}> {
  const providers = [
    { provider: 'Origin Energy', program: 'Origin Loop', gasBundle: true, batterySupport: true, annualValue: '~$550', verdict: 'RECOMMENDED' },
    { provider: 'AGL', program: 'Night Saver', gasBundle: true, batterySupport: true, annualValue: '~$280', verdict: 'Strong Alternative' },
    { provider: 'EnergyAustralia', program: 'PowerResponse', gasBundle: true, batterySupport: true, annualValue: '~$180', verdict: 'Lower Returns' },
    { provider: 'Diamond Energy', program: 'GridCredits', gasBundle: false, batterySupport: true, annualValue: '~$450', verdict: 'No Gas Bundle' },
    { provider: 'ENGIE', program: 'VPP Advantage', gasBundle: true, batterySupport: false, annualValue: 'N/A', verdict: 'Not Compatible' },
  ];
  return providers;
}

// ============================================================
// HTML SLIDE GENERATORS
// ============================================================

// Base64 data URIs for fonts — eliminates ALL CORS issues
const FONT_URI_NEXTSPHERE = `data:font/ttf;base64,${FONT_NEXTSPHERE_B64}`;
const FONT_URI_GENERALSANS = `data:font/otf;base64,${FONT_GENERALSANS_B64}`;
const FONT_URI_URBANIST = `data:font/ttf;base64,${FONT_URBANIST_B64}`;
const FONT_URI_URBANIST_ITALIC = `data:font/ttf;base64,${FONT_URBANIST_ITALIC_B64}`;
export const LOGO_URI_AQUA = `data:image/png;base64,${LOGO_AQUA_B64}`;
const COVER_BG_URI = `data:image/jpeg;base64,${COVER_BG_B64}`;

const SLIDE_STYLES = `
<style>
  @font-face { font-family: 'NextSphere'; src: url('${FONT_URI_NEXTSPHERE}') format('truetype'); font-weight: 800; }
  @font-face { font-family: 'GeneralSans'; src: url('${FONT_URI_GENERALSANS}') format('opentype'); font-weight: 400; }
  @font-face { font-family: 'Urbanist'; src: url('${FONT_URI_URBANIST}') format('truetype'); font-weight: 600; }
  @font-face { font-family: 'UrbanistItalic'; src: url('${FONT_URI_URBANIST_ITALIC}') format('truetype'); font-weight: 600; font-style: italic; }
  
  * { margin: 0; padding: 0; box-sizing: border-box; }
  
  .slide {
    width: 1920px;
    height: 1080px;
    background: #1a1a1a;
    color: #FFFFFF;
    font-family: 'GeneralSans', sans-serif;
    padding: 60px 80px;
    position: relative;
    overflow: hidden;
  }
  
  /* Standard header: NextSphere title + aqua line */
  .slide-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 8px;
  }
  .slide-title {
    font-family: 'NextSphere', sans-serif;
    font-size: 52px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: #FFFFFF;
    line-height: 1.1;
    max-width: 75%;
  }
  .slide-subtitle {
    font-family: 'UrbanistItalic', 'Urbanist', sans-serif;
    font-size: 22px;
    color: #00EAD3;
    font-style: italic;
    letter-spacing: 0.05em;
    text-align: right;
    white-space: nowrap;
  }
  .aqua-line {
    width: 100%;
    height: 1px;
    background: #00EAD3;
    margin-bottom: 36px;
  }
  
  /* Alternate header: Urbanist title left + grey italic / aqua subtitle right + ORANGE line */
  .alt-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 8px;
  }
  .alt-header .alt-title {
    font-family: 'Urbanist', sans-serif;
    font-size: 24px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: #FFFFFF;
  }
  .alt-header .alt-right {
    text-align: right;
  }
  .alt-header .alt-label {
    font-family: 'UrbanistItalic', 'Urbanist', sans-serif;
    font-size: 16px;
    color: #808285;
    font-style: italic;
  }
  .alt-header .alt-value {
    font-family: 'Urbanist', sans-serif;
    font-size: 24px;
    font-weight: 600;
    color: #00EAD3;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  .orange-line {
    width: 100%;
    height: 2px;
    background: #f36710;
    margin-bottom: 36px;
  }
  
  /* Slide number watermark */
  .slide-number {
    position: absolute;
    top: 30px;
    right: 70px;
    font-family: 'GeneralSans', sans-serif;
    font-size: 120px;
    font-weight: 700;
    color: rgba(255,255,255,0.06);
    line-height: 1;
    z-index: 0;
  }
  
  /* Logo bottom-right */
  .logo-br {
    position: absolute;
    bottom: 30px;
    right: 60px;
    width: 80px;
    height: 80px;
  }
  
  /* Hero numbers */
  .hero-num {
    font-family: 'GeneralSans', sans-serif;
    font-weight: 700;
    line-height: 1;
  }
  .hero-num.aqua { color: #00EAD3; }
  .hero-num.white { color: #FFFFFF; }
  .hero-num.orange { color: #f36710; }
  
  /* Labels */
  .lbl {
    font-family: 'Urbanist', sans-serif;
    font-size: 12px;
    color: #808285;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    margin-bottom: 6px;
  }
  
  /* Cards */
  .card {
    background: rgba(255,255,255,0.02);
    border: 1px solid #333;
    padding: 24px;
  }
  .card.aqua-b { border-color: #00EAD3; }
  .card.orange-b { border-color: #f36710; }
  
  /* Insight cards */
  .insight-card {
    background: #222;
    padding: 24px 28px;
    border-left: 4px solid #00EAD3;
  }
  .insight-card.orange { border-left-color: #f36710; }
  .insight-card .insight-title {
    font-family: 'Urbanist', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #f36710;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 10px;
  }
  .insight-card p { color: #808285; font-size: 14px; line-height: 1.6; }
  .insight-card .hl-aqua { color: #00EAD3; font-weight: 600; }
  .insight-card .hl-orange { color: #f36710; font-weight: 600; }
  .insight-card .hl-white { color: #FFFFFF; font-weight: 600; }
  
  /* Badges */
  .badge { display: inline-block; padding: 4px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
  .badge.yes { background: #00EAD3; color: #000; }
  .badge.no { background: #f36710; color: #000; }
  .badge.recommended { color: #00EAD3; font-weight: 700; }
  
  /* Tables */
  table { width: 100%; border-collapse: collapse; }
  th {
    font-family: 'Urbanist', sans-serif;
    font-size: 11px;
    color: #f36710;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    text-align: left;
    padding: 12px 16px;
    border-bottom: 1px solid #333;
  }
  td { padding: 14px 16px; border-bottom: 1px solid #2a2a2a; font-size: 15px; color: #ccc; }
  
  /* Colors */
  .aqua { color: #00EAD3; }
  .orange { color: #f36710; }
  .gray { color: #808285; }
  .white { color: #FFFFFF; }
</style>
`;

// Standard header (NextSphere title + aqua line)
function slideHeader(title: string, subtitle?: string): string {
  return `
    <div class="slide-header">
      <h1 class="slide-title">${title}</h1>
      ${subtitle ? `<p class="slide-subtitle">${subtitle}</p>` : ''}
    </div>
    <div class="aqua-line"></div>
  `;
}

// Alternate header (Urbanist title + orange line) — used for slides 10-12, 16-17
function altHeader(title: string, rightLabel: string, rightValue: string): string {
  return `
    <div class="alt-header">
      <div class="alt-title">${title}</div>
      <div class="alt-right">
        <div class="alt-label">${rightLabel}</div>
        <div class="alt-value">${rightValue}</div>
      </div>
    </div>
    <div class="orange-line"></div>
  `;
}

// Slide number watermark
function slideNum(n: number): string {
  return `<div class="slide-number">${String(n).padStart(2, '0')}</div>`;
}

// Logo bottom-right
function logoBR(): string {
  return `<img src="${LOGO_URI_AQUA}" class="logo-br" alt="LE" />`;
}

// Format currency
function fmtCurrency(n: number): string {
  return '$' + Math.round(n).toLocaleString();
}

// ============================================================
// MAIN DISPATCH
// ============================================================

export function generateSlideHTML(slide: SlideContent): string {
  try {
    let content = '';
    switch (slide.type) {
      case 'cover': content = genCover(slide); break;
      case 'executive_summary': content = genExecutiveSummary(slide); break;
      case 'bill_analysis': content = genBillAnalysis(slide); break;
      case 'bill_breakdown': content = genBillBreakdown(slide); break;
      case 'seasonal_usage': content = genSeasonalUsage(slide); break;
      case 'annual_consumption': content = genAnnualConsumption(slide); break;
      case 'projected_annual_cost': content = genProjectedAnnualCost(slide); break;
      case 'battery_benefits': content = genBatteryBenefits(slide); break;
      case 'battery_considerations': content = genBatteryConsiderations(slide); break;
      case 'battery_storage': content = genBatteryStorage(slide); break;
      case 'solar_pv': content = genSolarPV(slide); break;
      case 'financial_impact': content = genFinancialImpact(slide); break;
      case 'environmental_impact': content = genEnvironmentalImpact(slide); break;
      case 'strategic_pathway': content = genStrategicPathway(slide); break;
      case 'contact': content = genContact(slide); break;
      case 'vpp_recommendation': content = genVPPRecommendation(slide); break;
      case 'financial_impact_analysis': content = genFinancialImpactAnalysis(slide); break;
      default: content = genGeneric(slide);
    }
    return `<!DOCTYPE html><html><head><meta charset="UTF-8">${SLIDE_STYLES}</head><body>${content}</body></html>`;
  } catch (err: any) {
    console.error(`[generateSlideHTML] Error generating ${slide.type}:`, err.message);
    const errorContent = `
      <div class="slide">
        ${slideNum(slide.id)}
        ${logoBR()}
        ${slideHeader(slide.title || slide.type.toUpperCase())}
        <div style="flex: 1; display: flex; align-items: center; justify-content: center;">
          <p style="color: #808285; font-size: 18px;">This slide will be regenerated with your data.</p>
        </div>
      </div>
    `;
    return `<!DOCTYPE html><html><head><meta charset="UTF-8">${SLIDE_STYLES}</head><body>${errorContent}</body></html>`;
  }
}

// ============================================================
// SLIDE 1: COVER
// ============================================================
function genCover(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  return `
    <div class="slide" style="display: flex; flex-direction: column; justify-content: center; padding: 80px; background: #1a1a1a url('${COVER_BG_URI}') no-repeat right center; background-size: contain;">
      <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 60px;">
        <img src="${LOGO_URI_AQUA}" style="width: 50px; height: 50px;" alt="LE" />
        <span style="font-family: 'NextSphere', sans-serif; font-size: 24px; color: #00EAD3; letter-spacing: 0.15em;">LIGHTNING ENERGY</span>
      </div>
      <h1 style="font-family: 'NextSphere', sans-serif; font-size: 56px; font-weight: 800; color: #FFFFFF; text-transform: uppercase; line-height: 1.15; max-width: 800px;">IN-DEPTH ELECTRICITY BILL ANALYSIS</h1>
      <div style="position: absolute; bottom: 80px; left: 80px; display: flex; align-items: flex-start; gap: 16px;">
        <div style="width: 4px; height: 50px; background: #f36710; border-radius: 2px;"></div>
        <div>
          <p style="font-family: 'Urbanist', sans-serif; font-size: 20px; color: #00EAD3; font-weight: 600;">${slide.title}</p>
          <p style="font-family: 'GeneralSans', sans-serif; font-size: 16px; color: #00EAD3;">${c.address}</p>
        </div>
      </div>
      <div style="position: absolute; bottom: 28px; left: 80px; right: 80px; height: 1px; background: #00EAD3;"></div>
      <div style="position: absolute; bottom: 10px; left: 80px; font-size: 11px; color: #808285;">Prepared by ${c.preparedBy} | ${c.company}</div>
    </div>
  `;
}

// ============================================================
// SLIDE 2: EXECUTIVE SUMMARY — Current Energy Profile
// ============================================================
function genExecutiveSummary(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const annualCost = c.currentAnnualCost as number || 0;
  const savings = c.totalAnnualSavings as number || 0;
  const dailyUsage = c.dailyUsageKwh as number || 0;
  const annualUsage = c.annualUsageKwh as number || 0;
  const payback = c.paybackYears as number || 0;
  const tenYr = c.tenYearBenefit as number || 0;
  const billRedPct = c.billReductionPct as number || 0;
  const offset = c.solarOffset as number || 0;
  const narrative = (c.narrativeOverview as string) || '';
  const stratRec = (c.strategicRecommendation as string) || '';
  
  return `
    <div class="slide">
      ${slideNum(slide.id)}
      ${logoBR()}
      ${slideHeader(slide.title, slide.subtitle)}
      <div style="display: flex; gap: 60px; height: 820px;">
        <!-- Left: Key Findings -->
        <div style="flex: 1;">
          <p style="font-family: 'Urbanist', sans-serif; font-size: 14px; color: #f36710; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 24px;">KEY FINDINGS</p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
            <div class="card">
              <p class="lbl">ANNUAL ELECTRICITY COST</p>
              <p class="hero-num orange" style="font-size: 42px;">${fmtCurrency(annualCost)}</p>
            </div>
            <div class="card">
              <p class="lbl">DAILY AVERAGE USAGE</p>
              <p class="hero-num white" style="font-size: 42px;">${dailyUsage.toFixed(1)} <span style="font-size: 20px; color: #808285;">kWh</span></p>
            </div>
            <div class="card">
              <p class="lbl">ANNUAL CONSUMPTION</p>
              <p class="hero-num white" style="font-size: 42px;">${Math.round(annualUsage).toLocaleString()} <span style="font-size: 20px; color: #808285;">kWh</span></p>
            </div>
            <div class="card">
              <p class="lbl">PROJECTED SAVINGS</p>
              <p class="hero-num aqua" style="font-size: 42px;">${fmtCurrency(savings)}<span style="font-size: 18px; color: #808285;">/yr</span></p>
            </div>
          </div>
          ${narrative ? `<div style="color: #808285; font-size: 14px; line-height: 1.7;">${narrative}</div>` : ''}
        </div>
        <!-- Right: Strategic Recommendations -->
        <div style="flex: 1;">
          <p style="font-family: 'Urbanist', sans-serif; font-size: 14px; color: #f36710; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 24px;">STRATEGIC RECOMMENDATIONS</p>
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div class="insight-card">
              <div class="insight-title">SOLAR + BATTERY SYSTEM</div>
              <p>Install a ${c.systemSize}kW solar array with ${c.batterySize}kWh battery storage to achieve <span class="hl-aqua">${billRedPct}% bill reduction</span> and <span class="hl-aqua">${offset}% solar offset</span>.</p>
            </div>
            <div class="insight-card">
              <div class="insight-title">FINANCIAL RETURN</div>
              <p>Payback in <span class="hl-aqua">${payback.toFixed(1)} years</span> with 10-year net benefit of <span class="hl-aqua">${fmtCurrency(tenYr)}</span>. Tax-free returns exceeding traditional investments.</p>
            </div>
            <div class="insight-card">
              <div class="insight-title">VPP INCOME</div>
              <p>Enrol in ${c.vppProvider} VPP program for additional <span class="hl-aqua">${fmtCurrency(c.vppAnnualValue as number || 0)}/year</span> in grid participation credits.</p>
            </div>
            ${stratRec ? `<div style="color: #808285; font-size: 13px; line-height: 1.6; margin-top: 8px;">${stratRec}</div>` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// SLIDE 3: ACCOUNT DETAILS & CURRENT TARIFF STRUCTURE
// ============================================================
function genBillAnalysis(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const narrative = (c.narrative as string) || '';
  const usageRate = c.usageRate as number || 0;
  const supplyCharge = c.supplyCharge as number || 0;
  const feedIn = c.feedInTariff as number || 0;
  const peakRate = c.peakRate as number;
  const offPeakRate = c.offPeakRate as number;
  const shoulderRate = c.shoulderRate as number;
  
  return `
    <div class="slide">
      ${slideNum(slide.id)}
      ${logoBR()}
      ${slideHeader(slide.title, slide.subtitle)}
      <div style="display: flex; gap: 60px;">
        <!-- Left: Customer Details Table -->
        <div style="flex: 1;">
          <p style="font-family: 'Urbanist', sans-serif; font-size: 14px; color: #f36710; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 16px;">ACCOUNT DETAILS</p>
          <table>
            <tr><td style="color: #808285; width: 180px;">Account Holder</td><td style="color: #fff; font-weight: 600;">${c.customerName}</td></tr>
            <tr><td style="color: #808285;">Service Address</td><td style="color: #fff;">${c.address}, ${c.state}</td></tr>
            <tr><td style="color: #808285;">Retailer</td><td style="color: #fff;">${c.retailer}</td></tr>
            <tr><td style="color: #808285;">Billing Period</td><td style="color: #fff;">${c.billDays ? `${c.billDays} days` : 'Quarterly'}</td></tr>
            <tr><td style="color: #808285;">Daily Average</td><td style="color: #fff;">${(c.dailyAverageKwh as number || 0).toFixed(1)} kWh</td></tr>
            <tr><td style="color: #808285;">Annual Cost</td><td style="color: #f36710; font-weight: 700;">${fmtCurrency(c.annualCost as number || 0)}</td></tr>
          </table>
          ${narrative ? `<div style="margin-top: 24px; color: #808285; font-size: 13px; line-height: 1.7;">${narrative}</div>` : ''}
        </div>
        <!-- Right: Tariff Rate Cards -->
        <div style="flex: 1;">
          <p style="font-family: 'Urbanist', sans-serif; font-size: 14px; color: #f36710; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 16px;">CURRENT TARIFF STRUCTURE</p>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${peakRate ? `<div class="card" style="display: flex; justify-content: space-between; align-items: center;">
              <div><p class="lbl">PEAK RATE</p><p style="color: #808285; font-size: 13px;">Weekdays 3pm-9pm</p></div>
              <p class="hero-num orange" style="font-size: 36px;">${peakRate.toFixed(1)}<span style="font-size: 16px; color: #808285;">¢/kWh</span></p>
            </div>` : ''}
            ${offPeakRate ? `<div class="card" style="display: flex; justify-content: space-between; align-items: center;">
              <div><p class="lbl">OFF-PEAK RATE</p><p style="color: #808285; font-size: 13px;">10pm-7am</p></div>
              <p class="hero-num aqua" style="font-size: 36px;">${offPeakRate.toFixed(1)}<span style="font-size: 16px; color: #808285;">¢/kWh</span></p>
            </div>` : ''}
            ${shoulderRate ? `<div class="card" style="display: flex; justify-content: space-between; align-items: center;">
              <div><p class="lbl">SHOULDER RATE</p><p style="color: #808285; font-size: 13px;">7am-3pm, 9pm-10pm</p></div>
              <p class="hero-num white" style="font-size: 36px;">${shoulderRate.toFixed(1)}<span style="font-size: 16px; color: #808285;">¢/kWh</span></p>
            </div>` : ''}
            ${!peakRate && !offPeakRate && !shoulderRate ? `<div class="card" style="display: flex; justify-content: space-between; align-items: center;">
              <div><p class="lbl">USAGE RATE (FLAT)</p><p style="color: #808285; font-size: 13px;">All times</p></div>
              <p class="hero-num orange" style="font-size: 36px;">${usageRate.toFixed(1)}<span style="font-size: 16px; color: #808285;">¢/kWh</span></p>
            </div>` : ''}
            <div class="card" style="display: flex; justify-content: space-between; align-items: center;">
              <div><p class="lbl">DAILY SUPPLY CHARGE</p><p style="color: #808285; font-size: 13px;">Fixed daily cost</p></div>
              <p class="hero-num white" style="font-size: 36px;">${supplyCharge.toFixed(1)}<span style="font-size: 16px; color: #808285;">¢/day</span></p>
            </div>
            <div class="card" style="display: flex; justify-content: space-between; align-items: center;">
              <div><p class="lbl">FEED-IN TARIFF</p><p style="color: #808285; font-size: 13px;">Solar export credit</p></div>
              <p class="hero-num aqua" style="font-size: 36px;">${feedIn.toFixed(1)}<span style="font-size: 16px; color: #808285;">¢/kWh</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// SLIDE 4: CURRENT BILL BREAKDOWN (donut chart + charges)
// ============================================================
function genBillBreakdown(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const totalCost = c.totalAnnualCost as number || 0;
  const dailyCost = c.dailyAverageCost as number || 0;
  const usageCharges = c.usageCharges as number || 0;
  const supplyCharges = c.supplyCharges as number || 0;
  const solarCredit = c.solarCredit as number || 0;
  const usagePct = c.usageChargesPercent as number || 50;
  const supplyPct = c.supplyChargesPercent as number || 50;
  const narrative = (c.narrative as string) || '';
  
  // Donut chart angles
  const usageAngle = (usagePct / 100) * 360;
  
  return `
    <div class="slide">
      ${slideNum(slide.id)}
      ${logoBR()}
      ${slideHeader(slide.title, slide.subtitle)}
      <div style="display: flex; gap: 60px;">
        <!-- Left: Billing Period + Charges Table -->
        <div style="flex: 1;">
          ${c.billPeriodStart ? `<div style="background: #222; padding: 16px 24px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
            <div><p class="lbl">BILLING PERIOD</p><p style="color: #fff; font-size: 15px;">${c.billPeriodStart} — ${c.billPeriodEnd}</p></div>
            <div style="text-align: right;"><p class="lbl">BILL TOTAL</p><p style="color: #f36710; font-size: 20px; font-weight: 700;">${fmtCurrency(c.billTotalAmount as number || totalCost / 4)}</p></div>
          </div>` : ''}
          <p style="font-family: 'Urbanist', sans-serif; font-size: 14px; color: #f36710; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 16px;">ANNUAL COST BREAKDOWN</p>
          <table>
            <tr><td style="color: #808285;">Usage Charges</td><td style="color: #f36710; text-align: right; font-weight: 600;">${fmtCurrency(usageCharges)}</td><td style="color: #808285; text-align: right;">${usagePct}%</td></tr>
            <tr><td style="color: #808285;">Supply Charges</td><td style="color: #fff; text-align: right; font-weight: 600;">${fmtCurrency(supplyCharges)}</td><td style="color: #808285; text-align: right;">${supplyPct}%</td></tr>
            ${solarCredit > 0 ? `<tr><td style="color: #808285;">Solar Credits</td><td style="color: #00EAD3; text-align: right; font-weight: 600;">-${fmtCurrency(solarCredit)}</td><td></td></tr>` : ''}
            <tr style="border-top: 2px solid #444;"><td style="color: #fff; font-weight: 700;">TOTAL ANNUAL</td><td style="color: #f36710; text-align: right; font-weight: 700; font-size: 18px;">${fmtCurrency(totalCost)}</td><td></td></tr>
          </table>
          <div style="margin-top: 24px; display: flex; gap: 20px;">
            <div class="card" style="flex: 1; text-align: center;">
              <p class="lbl">DAILY AVERAGE</p>
              <p class="hero-num orange" style="font-size: 32px;">${fmtCurrency(dailyCost)}</p>
            </div>
            <div class="card" style="flex: 1; text-align: center;">
              <p class="lbl">MONTHLY AVERAGE</p>
              <p class="hero-num orange" style="font-size: 32px;">${fmtCurrency(totalCost / 12)}</p>
            </div>
          </div>
          ${narrative ? `<div style="margin-top: 20px; color: #808285; font-size: 13px; line-height: 1.6;">${narrative}</div>` : ''}
        </div>
        <!-- Right: Donut Chart -->
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <div style="position: relative; width: 350px; height: 350px;">
            <svg viewBox="0 0 200 200" width="350" height="350">
              <circle cx="100" cy="100" r="80" fill="none" stroke="#f36710" stroke-width="30" stroke-dasharray="${usagePct * 5.03} ${(100 - usagePct) * 5.03}" stroke-dashoffset="126" />
              <circle cx="100" cy="100" r="80" fill="none" stroke="#808285" stroke-width="30" stroke-dasharray="${supplyPct * 5.03} ${(100 - supplyPct) * 5.03}" stroke-dashoffset="${126 - usagePct * 5.03}" />
              <circle cx="100" cy="100" r="60" fill="#1a1a1a" />
            </svg>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
              <p style="font-family: 'GeneralSans', sans-serif; font-size: 36px; font-weight: 700; color: #fff;">${fmtCurrency(totalCost)}</p>
              <p style="font-size: 12px; color: #808285; text-transform: uppercase; letter-spacing: 0.1em;">PER YEAR</p>
            </div>
          </div>
          <div style="display: flex; gap: 40px; margin-top: 30px;">
            <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 16px; height: 16px; background: #f36710;"></div><span style="color: #808285; font-size: 13px;">Usage (${usagePct}%)</span></div>
            <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 16px; height: 16px; background: #808285;"></div><span style="color: #808285; font-size: 13px;">Supply (${supplyPct}%)</span></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// SLIDE 5: SEASONAL USAGE PATTERNS (monthly bar chart)
// ============================================================
function genSeasonalUsage(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const monthlyData = (c.monthlyData as Array<{ month: string; kwh: number }>) || [];
  const maxKwh = Math.max(...monthlyData.map(m => m.kwh), 1);
  const annualUsage = c.annualUsageKwh as number || 0;
  const dailyUsage = c.dailyUsageKwh as number || 0;
  
  // Season colors: Summer=orange, Autumn=grey, Winter=aqua, Spring=white
  const seasonColor = (month: string): string => {
    const m = month.substring(0, 3);
    if (['Dec', 'Jan', 'Feb'].includes(m)) return '#f36710';
    if (['Mar', 'Apr', 'May'].includes(m)) return '#808285';
    if (['Jun', 'Jul', 'Aug'].includes(m)) return '#00EAD3';
    return '#FFFFFF';
  };
  
  const peakMonth = monthlyData.reduce((max, curr) => curr.kwh > max.kwh ? curr : max, monthlyData[0] || { month: 'Jan', kwh: 0 });
  const lowMonth = monthlyData.reduce((min, curr) => curr.kwh < min.kwh ? curr : min, monthlyData[0] || { month: 'Jan', kwh: 0 });
  const narrative = (c.narrative as string) || '';
  
  return `
    <div class="slide">
      ${slideNum(slide.id)}
      ${logoBR()}
      ${slideHeader(slide.title, slide.subtitle)}
      <div style="display: flex; gap: 60px;">
        <!-- Left: Bar Chart -->
        <div style="flex: 1.5;">
          <div style="display: flex; align-items: flex-end; gap: 12px; height: 500px; padding-bottom: 40px;">
            ${monthlyData.map(m => `
              <div style="flex: 1; display: flex; flex-direction: column; align-items: center;">
                <p style="font-size: 11px; color: #808285; margin-bottom: 6px;">${Math.round(m.kwh)}</p>
                <div style="width: 100%; height: ${Math.round((m.kwh / maxKwh) * 400)}px; background: ${seasonColor(m.month)}; border-radius: 4px 4px 0 0;"></div>
                <p style="font-size: 12px; color: #808285; margin-top: 8px; font-family: 'Urbanist', sans-serif; text-transform: uppercase; letter-spacing: 0.05em;">${m.month.substring(0, 3)}</p>
              </div>
            `).join('')}
          </div>
          <div style="display: flex; gap: 24px; margin-top: 16px;">
            <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 12px; height: 12px; background: #f36710;"></div><span style="color: #808285; font-size: 11px;">Summer</span></div>
            <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 12px; height: 12px; background: #808285;"></div><span style="color: #808285; font-size: 11px;">Autumn</span></div>
            <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 12px; height: 12px; background: #00EAD3;"></div><span style="color: #808285; font-size: 11px;">Winter</span></div>
            <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 12px; height: 12px; background: #FFFFFF;"></div><span style="color: #808285; font-size: 11px;">Spring</span></div>
          </div>
        </div>
        <!-- Right: Metrics -->
        <div style="flex: 0.8; display: flex; flex-direction: column; gap: 16px;">
          <div class="card">
            <p class="lbl">ANNUAL CONSUMPTION</p>
            <p class="hero-num white" style="font-size: 36px;">${Math.round(annualUsage).toLocaleString()} <span style="font-size: 16px; color: #808285;">kWh</span></p>
          </div>
          <div class="card">
            <p class="lbl">DAILY AVERAGE</p>
            <p class="hero-num white" style="font-size: 36px;">${dailyUsage.toFixed(1)} <span style="font-size: 16px; color: #808285;">kWh</span></p>
          </div>
          <div class="card">
            <p class="lbl">PEAK MONTH</p>
            <p class="hero-num orange" style="font-size: 30px;">${peakMonth.month}</p>
            <p style="color: #808285; font-size: 14px;">${Math.round(peakMonth.kwh).toLocaleString()} kWh</p>
          </div>
          <div class="card">
            <p class="lbl">LOWEST MONTH</p>
            <p class="hero-num aqua" style="font-size: 30px;">${lowMonth.month}</p>
            <p style="color: #808285; font-size: 14px;">${Math.round(lowMonth.kwh).toLocaleString()} kWh</p>
          </div>
          ${narrative ? `<div style="color: #808285; font-size: 12px; line-height: 1.6; margin-top: 8px;">${narrative}</div>` : ''}
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// SLIDE 6: ANNUAL CONSUMPTION ANALYSIS (area chart)
// ============================================================
function genAnnualConsumption(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const monthlyData = (c.monthlyData as Array<{ month: string; kwh: number; solar: number }>) || [];
  const annualUsage = c.annualUsageKwh as number || 0;
  const annualSolar = c.annualSolarProduction as number || 0;
  const solarSize = c.solarSizeKw as number || 0;
  const offset = c.solarOffset as number || 0;
  const narrative = (c.narrative as string) || '';
  const maxVal = Math.max(...monthlyData.map(m => Math.max(m.kwh, m.solar)), 1);
  
  // Build SVG area chart
  const chartW = 900, chartH = 400;
  const xStep = chartW / (monthlyData.length - 1 || 1);
  const usagePts = monthlyData.map((m, i) => `${i * xStep},${chartH - (m.kwh / maxVal) * chartH}`).join(' ');
  const solarPts = monthlyData.map((m, i) => `${i * xStep},${chartH - (m.solar / maxVal) * chartH}`).join(' ');
  const usageArea = `0,${chartH} ${usagePts} ${(monthlyData.length - 1) * xStep},${chartH}`;
  const solarArea = `0,${chartH} ${solarPts} ${(monthlyData.length - 1) * xStep},${chartH}`;
  
  return `
    <div class="slide">
      ${slideNum(slide.id)}
      ${logoBR()}
      ${slideHeader(slide.title, slide.subtitle)}
      <div style="display: flex; gap: 60px;">
        <!-- Left: Area Chart -->
        <div style="flex: 1.5;">
          <svg viewBox="0 0 ${chartW} ${chartH + 40}" width="${chartW}" height="${chartH + 40}">
            <polygon points="${usageArea}" fill="rgba(243,103,16,0.15)" />
            <polyline points="${usagePts}" fill="none" stroke="#f36710" stroke-width="2.5" />
            <polygon points="${solarArea}" fill="rgba(0,234,211,0.15)" />
            <polyline points="${solarPts}" fill="none" stroke="#00EAD3" stroke-width="2.5" />
            ${monthlyData.map((m, i) => `<text x="${i * xStep}" y="${chartH + 25}" fill="#808285" font-size="12" text-anchor="middle" font-family="Urbanist">${m.month.substring(0, 3)}</text>`).join('')}
          </svg>
          <div style="display: flex; gap: 30px; margin-top: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 20px; height: 3px; background: #f36710;"></div><span style="color: #808285; font-size: 12px;">Consumption</span></div>
            <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 20px; height: 3px; background: #00EAD3;"></div><span style="color: #808285; font-size: 12px;">Solar Production</span></div>
          </div>
        </div>
        <!-- Right: Metrics -->
        <div style="flex: 0.8; display: flex; flex-direction: column; gap: 16px;">
          <div class="card">
            <p class="lbl">ANNUAL CONSUMPTION</p>
            <p class="hero-num orange" style="font-size: 36px;">${Math.round(annualUsage).toLocaleString()} <span style="font-size: 16px; color: #808285;">kWh</span></p>
          </div>
          <div class="card">
            <p class="lbl">SOLAR PRODUCTION</p>
            <p class="hero-num aqua" style="font-size: 36px;">${Math.round(annualSolar).toLocaleString()} <span style="font-size: 16px; color: #808285;">kWh</span></p>
          </div>
          <div class="card aqua-b">
            <p class="lbl">SOLAR OFFSET</p>
            <p class="hero-num aqua" style="font-size: 48px;">${offset}%</p>
            <p style="color: #808285; font-size: 13px;">${solarSize}kW system covers ${offset}% of annual usage</p>
          </div>
          ${narrative ? `<div style="color: #808285; font-size: 12px; line-height: 1.6; margin-top: 8px;">${narrative}</div>` : ''}
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// SLIDE 7: PROJECTED ANNUAL COST (line chart)
// ============================================================
function genProjectedAnnualCost(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const costProjection = (c.costProjection as Array<{ year: number; withoutSolar: number; withSolar: number }>) || [];
  const currentCost = c.currentAnnualCost as number || 0;
  const yr10 = c.projectedCostYear10 as number || 0;
  const yr25 = c.projectedCostYear25 as number || 0;
  const cumSavings = c.cumulativeSavings25yr as number || 0;
  const narrative = (c.narrative as string) || '';
  
  const maxCost = Math.max(...costProjection.map(p => p.withoutSolar), 1);
  const chartW = 900, chartH = 400;
  const xStep = chartW / (costProjection.length - 1 || 1);
  const withoutPts = costProjection.map((p, i) => `${i * xStep},${chartH - (p.withoutSolar / maxCost) * chartH}`).join(' ');
  const withPts = costProjection.map((p, i) => `${i * xStep},${chartH - (p.withSolar / maxCost) * chartH}`).join(' ');
  
  return `
    <div class="slide">
      ${slideNum(slide.id)}
      ${logoBR()}
      ${slideHeader(slide.title, slide.subtitle)}
      <div style="display: flex; gap: 60px;">
        <!-- Left: Line Chart -->
        <div style="flex: 1.5;">
          <svg viewBox="0 0 ${chartW} ${chartH + 40}" width="${chartW}" height="${chartH + 40}">
            <polyline points="${withoutPts}" fill="none" stroke="#f36710" stroke-width="2.5" />
            <polyline points="${withPts}" fill="none" stroke="#00EAD3" stroke-width="2.5" />
            ${[0, 5, 10, 15, 20, 25].map(yr => {
              const x = (yr / 25) * chartW;
              return `<text x="${x}" y="${chartH + 25}" fill="#808285" font-size="12" text-anchor="middle" font-family="Urbanist">YR ${yr}</text>`;
            }).join('')}
          </svg>
          <div style="display: flex; gap: 30px; margin-top: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 20px; height: 3px; background: #f36710;"></div><span style="color: #808285; font-size: 12px;">Without Solar (3.5% inflation)</span></div>
            <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 20px; height: 3px; background: #00EAD3;"></div><span style="color: #808285; font-size: 12px;">With Solar + Battery</span></div>
          </div>
        </div>
        <!-- Right: Metrics -->
        <div style="flex: 0.8; display: flex; flex-direction: column; gap: 16px;">
          <div class="card">
            <p class="lbl">CURRENT ANNUAL COST</p>
            <p class="hero-num orange" style="font-size: 32px;">${fmtCurrency(currentCost)}</p>
          </div>
          <div class="card">
            <p class="lbl">YEAR 10 (NO ACTION)</p>
            <p class="hero-num orange" style="font-size: 32px;">${fmtCurrency(yr10)}</p>
          </div>
          <div class="card">
            <p class="lbl">YEAR 25 (NO ACTION)</p>
            <p class="hero-num orange" style="font-size: 32px;">${fmtCurrency(yr25)}</p>
          </div>
          <div class="card aqua-b">
            <p class="lbl">25-YEAR CUMULATIVE SAVINGS</p>
            <p class="hero-num aqua" style="font-size: 36px;">${fmtCurrency(cumSavings)}</p>
          </div>
          ${narrative ? `<div style="color: #808285; font-size: 12px; line-height: 1.6; margin-top: 8px;">${narrative}</div>` : ''}
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// SLIDE 8: SEVEN KEY BENEFITS OF SOLAR BATTERY (7 cards)
// ============================================================
function genBatteryBenefits(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const benefits = (c.benefits as Array<{ icon: string; title: string; description: string }>) || [];
  
  // Layout: 4 cards top row, 3 cards bottom row
  const topRow = benefits.slice(0, 4);
  const bottomRow = benefits.slice(4, 7);
  
  return `
    <div class="slide">
      ${slideNum(slide.id)}
      ${logoBR()}
      ${slideHeader(slide.title, slide.subtitle)}
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px;">
        ${topRow.map(b => `
          <div class="card" style="border-top: 3px solid #00EAD3;">
            <p style="font-family: 'Urbanist', sans-serif; font-size: 13px; color: #00EAD3; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; font-weight: 600;">${b.title}</p>
            <p style="color: #808285; font-size: 13px; line-height: 1.5;">${b.description}</p>
          </div>
        `).join('')}
      </div>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
        ${bottomRow.map(b => `
          <div class="card" style="border-top: 3px solid #00EAD3;">
            <p style="font-family: 'Urbanist', sans-serif; font-size: 13px; color: #00EAD3; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; font-weight: 600;">${b.title}</p>
            <p style="color: #808285; font-size: 13px; line-height: 1.5;">${b.description}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ============================================================
// SLIDE 9: IMPORTANT FACTORS TO CONSIDER (6 cards + balanced view)
// ============================================================
function genBatteryConsiderations(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const considerations = (c.considerations as Array<{ icon: string; title: string; description: string }>) || [];
  const balancedView = (c.balancedView as string) || '';
  
  return `
    <div class="slide">
      ${slideNum(slide.id)}
      ${logoBR()}
      ${slideHeader(slide.title, slide.subtitle)}
      <div style="display: flex; gap: 30px;">
        <!-- Left: 6 Factor Cards (3 rows x 2 cols) -->
        <div style="flex: 1.5; display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          ${considerations.map(con => `
            <div style="background: #222; padding: 20px; border-top: 3px solid #f36710;">
              <p style="font-family: 'Urbanist', sans-serif; font-size: 13px; color: #f36710; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; font-weight: 600;">${con.title}</p>
              <p style="color: #808285; font-size: 12px; line-height: 1.5;">${con.description}</p>
            </div>
          `).join('')}
        </div>
        <!-- Right: Balanced View Quote -->
        <div style="flex: 0.8; display: flex; flex-direction: column; justify-content: center;">
          <div class="card" style="border-color: #444;">
            <p style="font-family: 'GeneralSans', sans-serif; font-size: 16px; color: #fff; font-weight: 600; margin-bottom: 12px;">Balanced View</p>
            <div style="width: 40px; height: 2px; background: #f36710; margin-bottom: 16px;"></div>
            <p style="font-family: 'UrbanistItalic', sans-serif; font-style: italic; color: #808285; font-size: 14px; line-height: 1.7;">"${balancedView}"</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// SLIDE 10: BATTERY STORAGE SOLUTION (alt header)
// ============================================================
function genBatteryStorage(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const totalKwh = c.totalCapacityKwh as number || 0;
  const usable = c.usableCapacity as number || 0;
  const moduleConfig = c.moduleConfig as string || '';
  const eveningUse = c.eveningUse as number || 30;
  const vppTrading = c.vppTrading as number || 40;
  const backup = c.backup as number || 30;
  
  return `
    <div class="slide">
      ${slideNum(slide.id)}
      ${logoBR()}
      ${altHeader(slide.title, c.headerRight as string || 'Ultimate Independence', `${totalKwh} KWH CAPACITY`)}
      <div style="display: flex; gap: 60px;">
        <!-- Left Column -->
        <div style="flex: 1; display: flex; flex-direction: column; gap: 20px;">
          <!-- Hero Metric -->
          <div class="card" style="text-align: center; padding: 30px;">
            <p class="hero-num white" style="font-size: 72px;">${totalKwh} <span style="font-size: 28px;">KWH</span></p>
            <p class="lbl" style="margin-top: 8px;">TOTAL INSTALLED CAPACITY</p>
            <p style="color: #00EAD3; font-size: 14px; margin-top: 8px;">${moduleConfig}</p>
          </div>
          <!-- Why This Capacity -->
          <div class="card">
            <p style="font-family: 'Urbanist', sans-serif; font-size: 13px; color: #f36710; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; font-weight: 600;">WHY THIS CAPACITY?</p>
            <p style="color: #808285; font-size: 13px; line-height: 1.6;">This massive storage capacity ensures complete overnight coverage and enables aggressive VPP trading during peak demand events. The modular design allows future expansion as your energy needs grow.</p>
          </div>
          <!-- Technical Edge -->
          <div class="card">
            <p style="font-family: 'Urbanist', sans-serif; font-size: 13px; color: #f36710; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; font-weight: 600;">TECHNICAL EDGE</p>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <p style="color: #808285; font-size: 13px;">✓ <span style="color: #00EAD3;">LFP Technology</span> — 6,000+ cycle lifespan</p>
              <p style="color: #808285; font-size: 13px;">✓ <span style="color: #00EAD3;">High Voltage</span> — Superior efficiency</p>
              <p style="color: #808285; font-size: 13px;">✓ <span style="color: #00EAD3;">Modular Design</span> — Scalable capacity</p>
              <p style="color: #808285; font-size: 13px;">✓ <span style="color: #00EAD3;">98% DoD</span> — Maximum usable energy</p>
            </div>
          </div>
        </div>
        <!-- Right Column -->
        <div style="flex: 1; display: flex; flex-direction: column; gap: 20px;">
          <p style="font-family: 'Urbanist', sans-serif; font-size: 14px; color: #fff; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">Strategic Capacity Allocation</p>
          <!-- Stacked Bar -->
          <div style="display: flex; height: 50px; width: 100%;">
            <div style="flex: ${eveningUse}; background: #00EAD3; display: flex; align-items: center; justify-content: center;"><span style="color: #000; font-size: 13px; font-weight: 700;">EVENING USE (${eveningUse}%)</span></div>
            <div style="flex: ${vppTrading}; background: #f36710; display: flex; align-items: center; justify-content: center;"><span style="color: #000; font-size: 13px; font-weight: 700;">VPP TRADING (${vppTrading}%)</span></div>
            <div style="flex: ${backup}; background: #808285; display: flex; align-items: center; justify-content: center;"><span style="color: #000; font-size: 13px; font-weight: 700;">BACKUP (${backup}%)</span></div>
          </div>
          <div style="display: flex; gap: 16px;">
            <div style="flex: 1;"><p style="color: #00EAD3; font-size: 14px; font-weight: 600;">Home Power</p><p style="color: #808285; font-size: 12px;">Overnight household consumption from stored solar</p></div>
            <div style="flex: 1;"><p style="color: #f36710; font-size: 14px; font-weight: 600;">Income Generation</p><p style="color: #808285; font-size: 12px;">VPP grid events and peak demand trading</p></div>
            <div style="flex: 1;"><p style="color: #808285; font-size: 14px; font-weight: 600;">Safety Reserve</p><p style="color: #808285; font-size: 12px;">Blackout protection and emergency backup</p></div>
          </div>
          <!-- The Result -->
          <div class="card orange-b" style="margin-top: auto;">
            <p style="font-family: 'Urbanist', sans-serif; font-size: 13px; color: #f36710; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; font-weight: 600;">THE RESULT</p>
            <p style="color: #fff; font-size: 16px; font-weight: 600;">You effectively become your own power plant.</p>
            <p style="color: #808285; font-size: 13px; margin-top: 6px;">Complete energy independence during peak hours with revenue generation from surplus capacity.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// SLIDE 11: SOLAR PV RECOMMENDATION (alt header)
// ============================================================
function genSolarPV(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const sizeKw = c.systemSizeKw as number || 0;
  const panelConfig = c.panelConfig as string || '';
  const annualProd = c.annualProductionKwh as number || 0;
  const offset = c.solarOffset as number || 0;
  const annualUsage = c.annualUsageKwh as number || 0;
  
  return `
    <div class="slide">
      ${slideNum(slide.id)}
      ${logoBR()}
      ${altHeader(slide.title, c.headerRight as string || 'System Configuration', `${sizeKw} KW SYSTEM`)}
      <div style="display: flex; gap: 60px;">
        <!-- Left Column -->
        <div style="flex: 1; display: flex; flex-direction: column; gap: 20px;">
          <!-- Hero Metric -->
          <div class="card" style="text-align: center; padding: 30px;">
            <p class="hero-num white" style="font-size: 72px;">${sizeKw} <span style="font-size: 28px;">KW</span></p>
            <p class="lbl" style="margin-top: 8px;">TOTAL SOLAR CAPACITY</p>
            <p style="color: #00EAD3; font-size: 14px; margin-top: 8px;">${panelConfig}</p>
          </div>
          <!-- Premium Hardware -->
          <div class="card">
            <p style="font-family: 'Urbanist', sans-serif; font-size: 13px; color: #f36710; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; font-weight: 600;">PREMIUM HARDWARE</p>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <p style="color: #808285; font-size: 13px;">✓ <span style="color: #00EAD3;">Panels:</span> ${c.panelBrand} ${c.panelWattage}W — Tier 1 manufacturer</p>
              <p style="color: #808285; font-size: 13px;">✓ <span style="color: #00EAD3;">Inverter:</span> ${c.inverterBrand} ${c.inverterSize}kW Hybrid</p>
              <p style="color: #808285; font-size: 13px;">✓ <span style="color: #00EAD3;">Warranty:</span> 25-year panel performance guarantee</p>
              <p style="color: #808285; font-size: 13px;">✓ <span style="color: #00EAD3;">Aesthetics:</span> All-black panels for premium appearance</p>
            </div>
          </div>
        </div>
        <!-- Right Column -->
        <div style="flex: 1; display: flex; flex-direction: column; gap: 20px;">
          <!-- Annual Production -->
          <div class="card" style="text-align: center; padding: 30px;">
            <p style="font-family: 'Urbanist', sans-serif; font-size: 13px; color: #f36710; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; font-weight: 600;">ANNUAL PRODUCTION</p>
            <p class="hero-num white" style="font-size: 64px;">${Math.round(annualProd).toLocaleString()} <span style="font-size: 24px;">KWH</span></p>
            <p class="lbl" style="margin-top: 8px;">ESTIMATED YEARLY GENERATION</p>
            <p style="color: #808285; font-size: 14px; margin-top: 12px;">This system is perfectly sized to cover your annual usage of ~${Math.round(annualUsage).toLocaleString()} kWh, delivering a <span style="color: #00EAD3; font-weight: 600;">${offset}% offset</span> of your consumption.</p>
          </div>
          <!-- Why This Size -->
          <div class="card">
            <p style="font-family: 'Urbanist', sans-serif; font-size: 13px; color: #f36710; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; font-weight: 600;">WHY THIS SIZE?</p>
            <p style="color: #808285; font-size: 13px; line-height: 1.6;">The ${sizeKw}kW system is strategically sized to exceed your annual consumption, ensuring surplus generation for battery charging, VPP participation, and feed-in credits. This oversizing strategy maximises your return on investment while future-proofing for increased consumption (EV charging, heat pump hot water).</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// SLIDE 12: FINANCIAL IMPACT — 25-Year Outlook (alt header)
// ============================================================
function genFinancialImpact(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const annualSavings = c.annualSavings as number || 0;
  const billRedPct = c.billReductionPct as number || 0;
  const payback = c.paybackYears as number || 0;
  const roi = c.roi25yr as number || 0;
  const npv = c.npv25yr as number || 0;
  const irr = c.irr as number || 0;
  
  return `
    <div class="slide">
      ${slideNum(slide.id)}
      ${logoBR()}
      ${altHeader(slide.title, c.headerRight as string || 'Investment Analysis', '25-YEAR OUTLOOK')}
      <!-- Top Row: 2 hero cards -->
      <div style="display: flex; gap: 30px; margin-bottom: 30px;">
        <div class="card" style="flex: 1; text-align: center; padding: 40px;">
          <p class="hero-num aqua" style="font-size: 64px;">${fmtCurrency(annualSavings)}</p>
          <p style="font-family: 'Urbanist', sans-serif; font-size: 14px; color: #fff; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 12px; font-weight: 600;">EST. ANNUAL SAVINGS</p>
          <p style="color: #808285; font-size: 14px; margin-top: 8px;">Day 1 Bill Reduction: ${billRedPct}%</p>
        </div>
        <div class="card" style="flex: 1; text-align: center; padding: 40px;">
          <p class="hero-num aqua" style="font-size: 64px;">${Math.floor(payback)}-${Math.ceil(payback)}</p>
          <p style="font-family: 'Urbanist', sans-serif; font-size: 14px; color: #fff; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 12px; font-weight: 600;">YEAR PAYBACK</p>
          <p style="color: #808285; font-size: 14px; margin-top: 8px;">Tax-Free Return on Investment</p>
        </div>
      </div>
      <!-- Bottom Row: 3 metrics in dark maroon card -->
      <div style="background: #2a1a0a; border: 1px solid #f36710; padding: 40px; display: flex; justify-content: space-around;">
        <div style="text-align: center;">
          <p class="hero-num aqua" style="font-size: 48px;">${roi}%</p>
          <p style="font-family: 'Urbanist', sans-serif; font-size: 12px; color: #f36710; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 8px;">TOTAL ROI (25 YEARS)</p>
        </div>
        <div style="width: 1px; background: #444;"></div>
        <div style="text-align: center;">
          <p class="hero-num aqua" style="font-size: 48px;">${fmtCurrency(npv)}</p>
          <p style="font-family: 'Urbanist', sans-serif; font-size: 12px; color: #f36710; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 8px;">NET PRESENT VALUE</p>
        </div>
        <div style="width: 1px; background: #444;"></div>
        <div style="text-align: center;">
          <p class="hero-num aqua" style="font-size: 48px;">${irr}%</p>
          <p style="font-family: 'Urbanist', sans-serif; font-size: 12px; color: #f36710; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 8px;">INTERNAL RATE OF RETURN</p>
        </div>
      </div>
      <p style="color: #808285; font-size: 13px; font-style: italic; margin-top: 24px; text-align: center;">By leveraging battery storage for peak arbitrage and VPP participation, this system delivers returns that significantly exceed traditional investment vehicles.</p>
    </div>
  `;
}

// ============================================================
// SLIDE 13: ENVIRONMENTAL IMPACT — Carbon Reduction
// ============================================================
function genEnvironmentalImpact(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const co2Current = c.co2Current as number || 0;
  const co2Projected = c.co2Projected as number || 0;
  const reductionPct = c.co2ReductionPct as number || 0;
  const trees = c.treesEquiv as number || 0;
  const cars = c.carsRemoved as number || 0;
  const co2_25yr = c.co2_25yr as number || 0;
  
  return `
    <div class="slide">
      ${slideNum(slide.id)}
      ${logoBR()}
      ${slideHeader(slide.title)}
      <div style="display: flex; gap: 60px;">
        <!-- Left: Before/After + Total Reduction -->
        <div style="flex: 1; display: flex; flex-direction: column; gap: 30px;">
          <div>
            <p class="lbl">CURRENT EMISSIONS</p>
            <p class="hero-num orange" style="font-size: 56px;">${co2Current.toFixed(1)} <span style="font-size: 24px;">TONNES</span></p>
          </div>
          <div>
            <p class="lbl">WITH SOLAR + BATTERY</p>
            <p class="hero-num aqua" style="font-size: 56px;">${co2Projected.toFixed(1)} <span style="font-size: 24px;">TONNES</span></p>
          </div>
          <div class="card aqua-b" style="text-align: center; padding: 30px;">
            <p style="font-family: 'Urbanist', sans-serif; font-size: 14px; color: #00EAD3; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 8px;">TOTAL REDUCTION</p>
            <p class="hero-num white" style="font-size: 96px;">${reductionPct}%</p>
          </div>
        </div>
        <!-- Right: 3 Equivalency Cards -->
        <div style="flex: 1; display: flex; flex-direction: column; gap: 20px; justify-content: center;">
          <div class="card" style="display: flex; align-items: center; gap: 20px;">
            <div style="width: 50px; height: 50px; background: #f36710; display: flex; align-items: center; justify-content: center; font-size: 24px;">🌲</div>
            <div>
              <p class="lbl">EQUIVALENT TO PLANTING</p>
              <p style="font-family: 'Urbanist', sans-serif; font-size: 22px; color: #fff; text-transform: uppercase; font-weight: 600;">~${trees} TREES ANNUALLY</p>
            </div>
          </div>
          <div class="card" style="display: flex; align-items: center; gap: 20px;">
            <div style="width: 50px; height: 50px; background: #f36710; display: flex; align-items: center; justify-content: center; font-size: 24px;">🚗</div>
            <div>
              <p class="lbl">EQUIVALENT TO REMOVING</p>
              <p style="font-family: 'Urbanist', sans-serif; font-size: 22px; color: #fff; text-transform: uppercase; font-weight: 600;">${cars} CARS FROM THE ROAD</p>
            </div>
          </div>
          <div class="card" style="display: flex; align-items: center; gap: 20px;">
            <div style="width: 50px; height: 50px; background: #00EAD3; display: flex; align-items: center; justify-content: center; font-size: 24px;">🌍</div>
            <div>
              <p class="lbl">25-YEAR IMPACT</p>
              <p style="font-family: 'Urbanist', sans-serif; font-size: 22px; color: #fff; text-transform: uppercase; font-weight: 600;">PREVENT ${co2_25yr} TONNES CO2</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// SLIDE 14: STRATEGIC PATHWAY TO ENERGY INDEPENDENCE (Roadmap)
// ============================================================
function genStrategicPathway(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const steps = (c.steps as Array<{ number: string; title: string; description: string }>) || [];
  const inv = c.investmentSummary as Record<string, unknown> || {};
  
  return `
    <div class="slide">
      ${slideNum(slide.id)}
      ${logoBR()}
      ${slideHeader(slide.title)}
      <div style="display: flex; gap: 60px;">
        <!-- Left: 5 Steps -->
        <div style="flex: 1.2; display: flex; flex-direction: column; gap: 16px;">
          ${steps.map(s => `
            <div style="display: flex; align-items: flex-start; gap: 16px;">
              <span style="font-family: 'GeneralSans', sans-serif; font-size: 36px; font-weight: 700; color: #00EAD3; min-width: 60px;">${s.number}</span>
              <div>
                <p style="font-family: 'GeneralSans', sans-serif; font-size: 17px; color: #fff; font-weight: 600;">${s.title}</p>
                <p style="color: #808285; font-size: 13px; margin-top: 4px;">${s.description}</p>
              </div>
            </div>
          `).join('')}
        </div>
        <!-- Right: Investment Summary Card -->
        <div style="flex: 0.8; display: flex; align-items: center;">
          <div class="card" style="width: 100%; padding: 30px;">
            <p style="font-family: 'Urbanist', sans-serif; font-size: 16px; color: #f36710; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; font-weight: 600;">INVESTMENT SUMMARY</p>
            <div style="width: 40px; height: 2px; background: #f36710; margin-bottom: 24px;"></div>
            <div style="margin-bottom: 24px;">
              <p class="lbl">TOTAL SYSTEM COST (EST.)</p>
              <p class="hero-num white" style="font-size: 40px;">${inv.totalCostRange || '$18K - $22K'}</p>
            </div>
            <div style="margin-bottom: 24px;">
              <p class="lbl">ANNUAL SAVINGS</p>
              <p class="hero-num aqua" style="font-size: 40px;">~${fmtCurrency(inv.annualSavings as number || 0)}</p>
            </div>
            <div style="margin-bottom: 24px;">
              <p class="lbl">PAYBACK PERIOD</p>
              <p class="hero-num white" style="font-size: 36px;">${inv.paybackRange || '7.5 - 9 YEARS'}</p>
            </div>
            <div>
              <p class="lbl">25-YEAR NET BENEFIT</p>
              <p class="hero-num orange" style="font-size: 36px;">${fmtCurrency(inv.netBenefit25yr as number || 60000)}+</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// SLIDE 15: CONTACT — Next Steps + Contact Details
// ============================================================
function genContact(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  
  return `
    <div class="slide">
      ${slideNum(slide.id)}
      ${slideHeader(slide.title)}
      <div style="display: flex; gap: 60px;">
        <!-- Left: Next Steps -->
        <div style="flex: 1;">
          <p style="font-family: 'Urbanist', sans-serif; font-size: 16px; color: #f36710; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 24px; font-weight: 600;">NEXT STEPS</p>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${[
              { num: '01', text: 'Schedule Site Assessment' },
              { num: '02', text: 'Receive Detailed System Design' },
              { num: '03', text: 'Review Financing Options' },
              { num: '04', text: 'Installation Within 2-4 Weeks' },
            ].map(s => `
              <div style="display: flex; align-items: center; gap: 16px; background: #222; padding: 16px 20px; border-left: 3px solid #00EAD3;">
                <span style="font-family: 'GeneralSans', sans-serif; font-size: 28px; font-weight: 700; color: #00EAD3; min-width: 50px;">${s.num}</span>
                <p style="font-size: 16px; color: #fff;">${s.text}</p>
              </div>
            `).join('')}
          </div>
        </div>
        <!-- Right: Contact Details -->
        <div style="flex: 1;">
          <p style="font-family: 'Urbanist', sans-serif; font-size: 14px; color: #f36710; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 12px;">PREPARED BY</p>
          <p style="font-family: 'NextSphere', sans-serif; font-size: 36px; color: #fff; text-transform: uppercase; margin-bottom: 8px;">${c.preparedBy}</p>
          <p style="color: #808285; font-size: 16px;">${c.title}</p>
          <p style="color: #00EAD3; font-size: 16px; margin-bottom: 30px;">${c.company}</p>
          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="color: #00EAD3; font-size: 18px;">📍</span>
              <span style="color: #ccc; font-size: 15px;">${c.address}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="color: #00EAD3; font-size: 18px;">📞</span>
              <span style="color: #ccc; font-size: 15px;">${c.phone}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="color: #00EAD3; font-size: 18px;">✉️</span>
              <span style="color: #ccc; font-size: 15px;">${c.email}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="color: #00EAD3; font-size: 18px;">🌐</span>
              <span style="color: #ccc; font-size: 15px;">${c.website}</span>
            </div>
          </div>
          <div style="display: flex; justify-content: center; margin-top: 40px;">
            <img src="${LOGO_URI_AQUA}" style="width: 150px; height: 150px;" alt="Lightning Energy" />
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// SLIDE 16: VPP RECOMMENDATION (alt header)
// ============================================================
function genVPPRecommendation(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const provider = c.provider as string || '';
  const program = c.program as string || '';
  const firstYrValue = c.firstYearValue as number || 0;
  const ongoingValue = c.ongoingValue as number || 0;
  const providers = (c.providers as Array<{ provider: string; gasBundle: boolean; batterySupport: boolean; annualValue: string; verdict: string }>) || [];
  const solarKw = c.solarSizeKw as number || 0;
  const batteryKwh = c.batterySizeKwh as number || 0;
  const batteryBrand = c.batteryBrand as string || '';
  
  return `
    <div class="slide">
      ${slideNum(slide.id)}
      ${logoBR()}
      ${altHeader(slide.title, c.headerRight as string || 'Strategic Roadmap', program.toUpperCase() || provider.toUpperCase())}
      <div style="display: flex; gap: 40px;">
        <!-- Left: Why + Value Cards -->
        <div style="flex: 1; display: flex; flex-direction: column; gap: 20px;">
          <div class="card">
            <p style="color: #f36710; font-size: 16px; font-weight: 600; margin-bottom: 10px;">Why ${program || provider}?</p>
            <p style="color: #808285; font-size: 13px; line-height: 1.6;">After analyzing 13 providers, ${provider} offers the best combination of VPP earnings, gas bundling, and compatibility with your ${batteryBrand} system.</p>
            <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 16px;">
              <p style="color: #808285; font-size: 13px;">✓ <span style="color: #fff; font-weight: 600;">Gas + Electricity Bundle</span><br/><span style="color: #666; font-size: 12px;">Maximize savings with dual fuel discounts</span></p>
              <p style="color: #808285; font-size: 13px;">✓ <span style="color: #fff; font-weight: 600;">${batteryBrand.split(' ')[0]} Compatible</span><br/><span style="color: #666; font-size: 12px;">Fully supported by your new battery system</span></p>
              <p style="color: #808285; font-size: 13px;">✓ <span style="color: #fff; font-weight: 600;">No Lock-in Contract</span><br/><span style="color: #666; font-size: 12px;">Flexibility to switch if rates change</span></p>
              <p style="color: #808285; font-size: 13px;">✓ <span style="color: #fff; font-weight: 600;">20% Reserve Protection</span><br/><span style="color: #666; font-size: 12px;">Ensures backup power during blackouts</span></p>
            </div>
          </div>
          <!-- Value Cards -->
          <div style="background: #2a1a0a; border: 1px solid #f36710; padding: 24px; display: flex; gap: 30px;">
            <div style="flex: 1; text-align: center;">
              <p class="hero-num aqua" style="font-size: 36px;">~${fmtCurrency(firstYrValue)}</p>
              <p class="lbl" style="margin-top: 6px;">FIRST YEAR VALUE</p>
            </div>
            <div style="flex: 1; text-align: center;">
              <p class="hero-num aqua" style="font-size: 36px;">~${fmtCurrency(ongoingValue)}</p>
              <p class="lbl" style="margin-top: 6px;">ONGOING / YEAR</p>
            </div>
          </div>
        </div>
        <!-- Right: Provider Table + Implementation -->
        <div style="flex: 1; display: flex; flex-direction: column; gap: 20px;">
          <p style="font-size: 16px; color: #fff; font-weight: 600;">Provider Landscape Analysis</p>
          <table>
            <thead>
              <tr>
                <th style="color: #f36710;">Provider</th>
                <th style="color: #f36710;">Gas Bundle</th>
                <th style="color: #f36710;">${batteryBrand.split(' ')[0]} Support</th>
                <th style="color: #f36710;">VPP Value (Year 1)</th>
                <th style="color: #f36710;">Verdict</th>
              </tr>
            </thead>
            <tbody>
              ${providers.map(p => `
                <tr>
                  <td style="color: #fff; font-weight: 600;">${p.provider}</td>
                  <td><span class="badge ${p.gasBundle ? 'yes' : 'no'}">${p.gasBundle ? 'YES' : 'NO'}</span></td>
                  <td><span class="badge ${p.batterySupport ? 'yes' : 'no'}">${p.batterySupport ? 'YES' : 'NO'}</span></td>
                  <td style="color: #ccc;">${p.annualValue}</td>
                  <td style="color: ${p.verdict === 'RECOMMENDED' ? '#00EAD3' : '#808285'}; font-weight: ${p.verdict === 'RECOMMENDED' ? '700' : '400'};">${p.verdict}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div>
            <p style="font-family: 'UrbanistItalic', sans-serif; font-size: 16px; color: #f36710; font-style: italic; margin-bottom: 12px;">Implementation Steps</p>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <p style="color: #808285; font-size: 13px;">Proceed with ${solarKw}kW Solar + ${batteryKwh}kWh Battery installation.</p>
              <p style="color: #808285; font-size: 13px;">Register system with ${provider} "${program}" VPP.</p>
              <p style="color: #808285; font-size: 13px;">Switch Gas account to ${provider} to activate bundle discounts.</p>
              <p style="color: #808285; font-size: 13px;">Link Everyday Rewards account for additional points.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// SLIDE 17: FINANCIAL IMPACT ANALYSIS — ROI & Payback (alt header)
// ============================================================
function genFinancialImpactAnalysis(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const netCost = c.netSystemCost as number || 0;
  const rebates = c.rebateAmount as number || 0;
  const payback = c.paybackYears as number || 0;
  const paybackNoVpp = c.paybackWithoutVpp as number || 0;
  const roi = c.roi25yr as number || 0;
  const lifetime = c.lifetimeSavings as number || 0;
  const benefits = (c.annualBenefitBreakdown as Array<{ category: string; value: number; percent: number }>) || [];
  const totalBenefit = c.totalAnnualBenefit as number || 0;
  
  return `
    <div class="slide">
      ${slideNum(slide.id)}
      ${logoBR()}
      ${altHeader(slide.title, c.headerRight as string || 'Investment Overview', 'ROI & PAYBACK')}
      <div style="display: flex; gap: 60px;">
        <!-- Left: 3 Stacked Metric Cards -->
        <div style="flex: 1; display: flex; flex-direction: column; gap: 16px;">
          <div class="card" style="border-left: 4px solid #f36710; padding: 24px;">
            <p class="lbl">NET SYSTEM COST</p>
            <p class="hero-num white" style="font-size: 42px;">${fmtCurrency(netCost)}</p>
            <p style="color: #808285; font-size: 12px; margin-top: 4px;">After ${fmtCurrency(rebates)} in rebates</p>
          </div>
          <div class="card" style="border-left: 4px solid #00EAD3; padding: 24px;">
            <p class="lbl">PAYBACK PERIOD</p>
            <p class="hero-num aqua" style="font-size: 42px;">${payback.toFixed(1)} <span style="font-size: 18px;">YEARS</span></p>
            <p style="color: #808285; font-size: 12px; margin-top: 4px;">Without VPP: ${paybackNoVpp.toFixed(1)} years</p>
          </div>
          <div class="card" style="border-left: 4px solid #f36710; padding: 24px;">
            <p class="lbl">25-YEAR ROI</p>
            <p class="hero-num orange" style="font-size: 42px;">${roi}%</p>
            <p style="color: #808285; font-size: 12px; margin-top: 4px;">Lifetime savings: ${fmtCurrency(lifetime)}</p>
          </div>
        </div>
        <!-- Right: Annual Benefit Breakdown -->
        <div style="flex: 1; display: flex; flex-direction: column; gap: 20px;">
          <p style="font-family: 'Urbanist', sans-serif; font-size: 16px; color: #fff; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">ANNUAL BENEFIT BREAKDOWN</p>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${benefits.map(b => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: #222;">
                <div>
                  <p style="color: #fff; font-size: 15px; font-weight: 600;">${b.category}</p>
                  <p style="color: #808285; font-size: 12px;">${b.percent}% of total benefit</p>
                </div>
                <p class="hero-num aqua" style="font-size: 28px;">${fmtCurrency(b.value)}</p>
              </div>
            `).join('')}
          </div>
          <div style="background: #2a1a0a; border: 1px solid #f36710; padding: 24px; text-align: center;">
            <p class="lbl">TOTAL ANNUAL BENEFIT</p>
            <p class="hero-num aqua" style="font-size: 48px;">${fmtCurrency(totalBenefit)}<span style="font-size: 18px; color: #808285;">/year</span></p>
          </div>
          <p style="color: #808285; font-size: 13px; font-style: italic;">Values are estimates based on current electricity rates and VPP program terms. Actual results may vary based on usage patterns, grid conditions, and program changes.</p>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// GENERIC FALLBACK
// ============================================================
function genGeneric(slide: SlideContent): string {
  return `
    <div class="slide">
      ${slideNum(slide.id)}
      ${logoBR()}
      ${slideHeader(slide.title || slide.type.toUpperCase(), slide.subtitle)}
      <div style="flex: 1; display: flex; align-items: center; justify-content: center;">
        <p style="color: #808285; font-size: 18px;">Content for this slide type will be generated with your data.</p>
      </div>
    </div>
  `;
}
