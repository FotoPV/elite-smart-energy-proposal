// Lightning Energy Proposal Generator — Slide Generator
// Matches exact design from Steve Zafiriou SA proposal example (17 slides)

import { BRAND } from '../shared/brand';
import { calculateTotalCostRange } from './switchboardAnalysis';
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
  batteryCount?: number;       // Number of battery units (from solar proposal, defaults to calculated)
  batteryModuleKwh?: number;   // Per-module kWh (from solar proposal, defaults to brand-specific)
  inverterSizeKw: number;
  inverterBrand: string;
  estimatedAnnualProductionKwh?: number;  // From solar proposal extraction (overrides calculated value)
  
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
  vppProviderComparison?: Array<{ provider: string; programName: string; hasGasBundle: boolean; estimatedAnnualValue: number; strategicFit: string }>;
  
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
  switchboardAnalysis?: {
    boardCondition: string;
    mainSwitchRating: number | null;
    mainSwitchType: string | null;
    totalCircuits: number | null;
    usedCircuits: number | null;
    availableCircuits: number | null;
    hasRcd: boolean;
    rcdCount: number | null;
    hasSpaceForSolar: boolean;
    hasSpaceForBattery: boolean;
    upgradeRequired: boolean;
    upgradeReason: string | null;
    warnings: string[];
    confidence: number;
    // Enhanced installer-level fields
    circuitBreakers?: Array<{ position: number; rating: number; type: string; label: string | null; isUsed: boolean }>;
    phaseConfiguration?: 'single' | 'three' | 'unknown';
    phaseConfirmationSource?: string | null;
    meterType?: string | null;
    meterIsBidirectional?: boolean | null;
    meterSwapRequired?: boolean;
    meterNotes?: string | null;
    upgradeScope?: Array<{ item: string; detail: string; priority: 'required' | 'recommended' | 'optional'; estimatedCost: string | null }>;
    proposedSolarBreakerPosition?: number | null;
    proposedSolarBreakerRating?: string | null;
    proposedBatteryBreakerPosition?: number | null;
    proposedBatteryBreakerRating?: string | null;
    proposedDcIsolatorLocation?: string | null;
    proposedAcIsolatorLocation?: string | null;
    boardLocation?: 'internal' | 'external' | 'unknown';
    boardLocationNotes?: string | null;
    cableAssessment?: string | null;
    existingCableSizeAdequate?: boolean | null;
  };

  // Cable Run Analysis
  cableRunAnalysis?: {
    cableRunDistanceMetres: number | null;
    cableRoutePath: string | null;
    installationMethod: string | null;
    obstructions: string[];
    notes: string[];
    confidence: number;
    photoUrl?: string;  // URL of the annotated cable run photo
  };

  // Meter Analysis (dedicated meter photo analysis)
  meterAnalysis?: {
    meterNumber: string | null;
    nmi: string | null;
    meterBrand: string | null;
    meterModel: string | null;
    meterType: 'smart' | 'digital' | 'analog' | 'unknown';
    meterGeneration: string | null;
    isBidirectional: boolean | null;
    bidirectionalEvidence: string | null;
    supportsSolarExport: boolean | null;
    meterSwapRequired: boolean;
    meterSwapReason: string | null;
    hasCTs: boolean | null;
    ctRating: string | null;
    displayReading: string | null;
    displayRegisters: string[];
    meterCondition: 'good' | 'fair' | 'poor' | 'unknown';
    meterAge: string | null;
    sealIntact: boolean | null;
    connectionType: string | null;
    phaseConfiguration: 'single' | 'three' | 'unknown';
    notes: string[];
    warnings: string[];
    confidence: number;
  };

  // Cable Sizing (AS/NZS 3008.1.1)
  cableSizing?: {
    inverterSizeKw: number;
    phaseConfig: 'single' | 'three' | 'unknown';
    runDistanceMetres: number;
    acCableSize: string;
    acCableType: string;
    acVoltageDrop: number;
    acVoltageDropCompliant: boolean;
    acCurrentRating: number;
    dcCableSize: string;
    dcCableType: string;
    earthCableSize: string;
    batteryCableSize: string | null;
    batteryCableType: string | null;
    referenceTable: Array<{
      distanceRange: string;
      recommendedCable: string;
      voltageDropPercent: number;
      compliant: boolean;
      note: string;
    }>;
    standard: string;
    disclaimer: string;
  };
  
  // Environmental
  co2ReductionTonnes: number;
  treesEquivalent?: number;
  energyIndependenceScore?: number;
  co2CurrentTonnes?: number;
  co2ProjectedTonnes?: number;
  co2ReductionPercent?: number;
  
  // Roof Analysis (from roof photo LLM vision)
  roofAnalysis?: {
    primaryOrientation: 'north' | 'north-east' | 'north-west' | 'east' | 'west' | 'south' | 'south-east' | 'south-west' | 'flat' | 'unknown';
    orientationConfidence: 'high' | 'medium' | 'low';
    orientationEvidence: string | null;
    tiltAngleDegrees: number | null;
    tiltCategory: 'flat' | 'low_pitch' | 'standard' | 'steep' | 'unknown';
    tiltEvidence: string | null;
    shadingLevel: 'none' | 'minimal' | 'moderate' | 'heavy' | 'unknown';
    shadingSources: string[];
    shadingImpactPercent: number | null;
    morningShading: boolean | null;
    afternoonShading: boolean | null;
    roofMaterial: 'colorbond' | 'tile_concrete' | 'tile_terracotta' | 'slate' | 'flat_membrane' | 'polycarbonate' | 'unknown';
    roofCondition: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
    roofColor: string | null;
    usableAreaEstimateSqm: number | null;
    panelCapacityEstimate: number | null;
    obstructions: string[];
    mountingType: 'flush' | 'tilt_frame' | 'ballast' | 'unknown';
    mountingNotes: string | null;
    solarEfficiencyMultiplier: number;
    annualProductionAdjustment: string | null;
    notes: string[];
    warnings: string[];
    confidence: number;
  };

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
  const calculatedAnnualProduction = Math.round(data.solarSizeKw * psh * performanceRatio * 365);
  const annualSolarProduction = data.estimatedAnnualProductionKwh || calculatedAnnualProduction;
  const solarOffset = data.annualUsageKwh > 0 ? Math.round((annualSolarProduction / data.annualUsageKwh) * 100) : 100;
  
  // Monthly solar production factors (higher in summer, lower in winter)
  const solarMonthlyFactors: Record<string, number> = { Jan: 1.4, Feb: 1.3, Mar: 1.1, Apr: 0.9, May: 0.7, Jun: 0.6, Jul: 0.6, Aug: 0.7, Sep: 0.9, Oct: 1.1, Nov: 1.3, Dec: 1.4 };
  
  // State-based seasonal USAGE distribution patterns
  // These reflect real Australian consumption patterns: summer peaks (cooling), winter peaks (heating)
  const stateUsagePatterns: Record<string, Record<string, number>> = {
    SA:  { Jan: 1.30, Feb: 1.25, Mar: 1.05, Apr: 0.85, May: 0.80, Jun: 0.85, Jul: 0.85, Aug: 0.80, Sep: 0.85, Oct: 0.95, Nov: 1.10, Dec: 1.35 },
    VIC: { Jan: 1.15, Feb: 1.10, Mar: 0.95, Apr: 0.85, May: 0.90, Jun: 1.05, Jul: 1.10, Aug: 1.05, Sep: 0.95, Oct: 0.90, Nov: 0.95, Dec: 1.05 },
    NSW: { Jan: 1.25, Feb: 1.20, Mar: 1.05, Apr: 0.90, May: 0.80, Jun: 0.80, Jul: 0.80, Aug: 0.80, Sep: 0.85, Oct: 0.95, Nov: 1.15, Dec: 1.30 },
    QLD: { Jan: 1.35, Feb: 1.30, Mar: 1.15, Apr: 0.90, May: 0.75, Jun: 0.70, Jul: 0.70, Aug: 0.70, Sep: 0.80, Oct: 0.95, Nov: 1.20, Dec: 1.35 },
    WA:  { Jan: 1.35, Feb: 1.30, Mar: 1.10, Apr: 0.85, May: 0.75, Jun: 0.75, Jul: 0.75, Aug: 0.75, Sep: 0.85, Oct: 1.00, Nov: 1.15, Dec: 1.35 },
    TAS: { Jan: 0.90, Feb: 0.85, Mar: 0.90, Apr: 0.95, May: 1.10, Jun: 1.20, Jul: 1.25, Aug: 1.20, Sep: 1.05, Oct: 0.95, Nov: 0.85, Dec: 0.80 },
    NT:  { Jan: 1.30, Feb: 1.25, Mar: 1.20, Apr: 1.00, May: 0.75, Jun: 0.65, Jul: 0.65, Aug: 0.70, Sep: 0.80, Oct: 1.00, Nov: 1.20, Dec: 1.30 },
    ACT: { Jan: 1.15, Feb: 1.10, Mar: 0.95, Apr: 0.85, May: 0.95, Jun: 1.10, Jul: 1.15, Aug: 1.10, Sep: 0.95, Oct: 0.85, Nov: 0.90, Dec: 1.05 },
  };
  const usagePattern = stateUsagePatterns[data.state] || stateUsagePatterns['NSW'];
  const defaultMonths = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  
  // Normalise usage pattern so total sums to annualUsageKwh
  const patternSum = defaultMonths.reduce((sum, m) => sum + (usagePattern[m] || 1.0), 0);
  
  const monthlyProjection = (data.monthlyUsageData && data.monthlyUsageData.length > 0)
    ? data.monthlyUsageData.map(m => ({
        month: m.month,
        kwh: Math.round(m.kwh),
        cost: m.cost || Math.round(m.kwh * data.usageRateCentsPerKwh / 100),
        solar: Math.round(avgDailySolar * (solarMonthlyFactors[m.month.substring(0, 3)] || 1.0) * 30),
      }))
    : defaultMonths.map(m => {
        const factor = usagePattern[m] || 1.0;
        const monthKwh = Math.round((data.annualUsageKwh * factor) / patternSum);
        return {
          month: m,
          kwh: monthKwh,
          cost: Math.round(monthKwh * data.usageRateCentsPerKwh / 100),
          solar: Math.round(avgDailySolar * (solarMonthlyFactors[m] || 1.0) * 30),
        };
      });
  
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
  
  // Safety round all floating-point values to avoid display issues like 72.53999999999999
  data.batterySizeKwh = Math.round(data.batterySizeKwh * 100) / 100;
  data.solarSizeKw = Math.round(data.solarSizeKw * 100) / 100;
  if (data.inverterSizeKw) data.inverterSizeKw = Math.round(data.inverterSizeKw * 100) / 100;
  
  // Battery modules calculation — brand-aware
  // Known module sizes by brand (kWh per module)
  const BRAND_MODULE_SIZES: Record<string, number> = {
    'Sigenergy': 8.06,
    'SigenStor': 8.06,
    'GoodWe': 8.3,
    'Tesla': 13.5,
    'BYD': 12.8,
    'Enphase': 5.0,
    'Pylontech': 3.55,
    'Alpha ESS': 5.7,
  };
  // Determine module size: use explicit value, or look up by brand, or default to total capacity (single unit)
  const brandKey = Object.keys(BRAND_MODULE_SIZES).find(k => data.batteryBrand.includes(k));
  const moduleSize = data.batteryModuleKwh || (brandKey ? BRAND_MODULE_SIZES[brandKey] : data.batterySizeKwh);
  const batteryModuleCount = data.batteryCount || Math.ceil(data.batterySizeKwh / moduleSize);
  const usableCapacity = Math.round(data.batterySizeKwh * 0.95);
  
  // VPP providers for comparison table — use real data from calculations
  const vppProviders = (data.vppProviderComparison || []).map((p, i) => ({
    provider: p.provider,
    program: p.programName,
    gasBundle: p.hasGasBundle,
    batterySupport: true,
    annualValue: `~$${Math.round(p.estimatedAnnualValue).toLocaleString()}`,
    verdict: i === 0 ? 'RECOMMENDED' : p.strategicFit === 'excellent' ? 'Excellent Fit' : p.strategicFit === 'good' ? 'Strong Alternative' : p.strategicFit === 'moderate' ? 'Moderate Fit' : 'Lower Returns',
  }));
  
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
      vppAnnualValue: data.vppAnnualValue,
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
    title: 'SOLAR GENERATION PROFILE',
    subtitle: 'Monthly Output Estimate',
    content: {
      monthlyData: monthlyProjection,
      annualUsageKwh: data.annualUsageKwh,
      annualSolarProduction,
      solarSizeKw: data.solarSizeKw,
      solarOffset,
      dailyUsageKwh: data.dailyUsageKwh,
      state: data.state,
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
      moduleConfig: batteryModuleCount === 1
        ? `${data.batteryBrand} (${usableCapacity} kWh Usable)`
        : `${batteryModuleCount} × ${data.batteryBrand.split(' ')[0]} Modules (${usableCapacity} kWh Usable)`,
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
      // Roof analysis data (from photo)
      roofOrientation: data.roofAnalysis?.primaryOrientation || null,
      roofOrientationConfidence: data.roofAnalysis?.orientationConfidence || null,
      roofTiltDegrees: data.roofAnalysis?.tiltAngleDegrees ?? null,
      roofTiltCategory: data.roofAnalysis?.tiltCategory || null,
      roofShadingLevel: data.roofAnalysis?.shadingLevel || null,
      roofShadingImpactPercent: data.roofAnalysis?.shadingImpactPercent ?? null,
      roofMaterial: data.roofAnalysis?.roofMaterial || null,
      roofCondition: data.roofAnalysis?.roofCondition || null,
      roofUsableAreaSqm: data.roofAnalysis?.usableAreaEstimateSqm ?? null,
      roofPanelCapacity: data.roofAnalysis?.panelCapacityEstimate ?? null,
      roofMountingType: data.roofAnalysis?.mountingType || null,
      roofEfficiencyMultiplier: data.roofAnalysis?.solarEfficiencyMultiplier ?? null,
      roofAnnualAdjustment: data.roofAnalysis?.annualProductionAdjustment || null,
      roofObstructions: data.roofAnalysis?.obstructions || [],
      roofShadingSources: data.roofAnalysis?.shadingSources || [],
      roofWarnings: data.roofAnalysis?.warnings || [],
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
  
  // (Environmental Impact slide removed — space reallocated to Scope of Electrical Works)
  
  // Slide 14: ELECTRICAL ASSESSMENT & SITE PHOTOS (conditional — only if sitePhotos exist)
  if (data.sitePhotos && data.sitePhotos.length > 0) {
    slides.push({
      id: slideId++,
      type: 'site_assessment',
      title: 'ELECTRICAL ASSESSMENT',
      subtitle: 'SITE INSPECTION',
      content: {
        sitePhotos: data.sitePhotos,
        state: data.state,
        solarSizeKw: data.solarSizeKw,
        batterySizeKwh: data.batterySizeKwh,
        existingSolar: data.existingSolar,
        switchboardAnalysis: data.switchboardAnalysis,
        headerRight: 'Installation Readiness',
      }
    });
  }
  
  // Slide 14-15: SCOPE OF ELECTRICAL WORKS (split across 2 slides for full detail)
  if (data.switchboardAnalysis) {
    const scopeContent = {
      switchboardAnalysis: data.switchboardAnalysis,
      meterAnalysis: data.meterAnalysis,
      cableRunAnalysis: data.cableRunAnalysis,
      cableSizing: data.cableSizing,
      solarSizeKw: data.solarSizeKw,
      batterySizeKwh: data.batterySizeKwh,
      inverterBrand: data.inverterBrand,
      inverterSizeKw: data.inverterSizeKw,
      batteryBrand: data.batteryBrand,
      state: data.state,
    };
    // Page 1: Board Layout + Assessment Cards
    slides.push({
      id: slideId++,
      type: 'scope_of_works_1',
      title: 'SCOPE OF ELECTRICAL WORKS',
      subtitle: 'SWITCHBOARD & SITE ASSESSMENT',
      content: {
        ...scopeContent,
        headerRight: 'Installer Assessment',
      }
    });
    // Page 2: Scope Items + Costs + Cable Sizing + Total
    slides.push({
      id: slideId++,
      type: 'scope_of_works_2',
      title: 'SCOPE OF ELECTRICAL WORKS',
      subtitle: 'UPGRADE REQUIREMENTS & COST ESTIMATES',
      content: {
        ...scopeContent,
        headerRight: 'Preliminary Quote',
      }
    });
  }

  // Slide 16: STRATEGIC PATHWAY TO ENERGY INDEPENDENCE (Roadmap)
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

// getVPPProviders removed — now uses real vppProviderComparison data from calculations

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
    background: #000000;
    color: #FFFFFF;
    font-family: 'GeneralSans', sans-serif;
    padding: 60px 90px;
    position: relative;
    overflow: hidden;
    font-size: 18px;
    line-height: 1.7;
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
    font-size: 48px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #FFFFFF;
    line-height: 1.15;
    max-width: 80%;
  }
  .slide-subtitle {
    font-family: 'UrbanistItalic', 'Urbanist', sans-serif;
    font-size: 24px;
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
    margin-bottom: 40px;
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
    font-size: 18px;
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
    background: #00EAD3;
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
    font-size: 56px;
  }
  .hero-num.aqua { color: #00EAD3; }
  .hero-num.white { color: #FFFFFF; }
  .hero-num.orange { color: #f36710; }
  
  /* Labels */
  .lbl {
    font-family: 'Urbanist', sans-serif;
    font-size: 16px;
    color: #808285;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    margin-bottom: 10px;
  }
  
  /* Cards */
  .card {
    background: rgba(255,255,255,0.02);
    border: 1px solid #2a2a2a;
    padding: 32px 36px;
  }
  .card.aqua-b { border-color: #00EAD3; }
  .card.orange-b { border-color: #00EAD3; }
  
  /* Insight cards */
  .insight-card {
    background: #111;
    padding: 32px 36px;
    border-left: 3px solid #333;
  }
  .insight-card.orange { border-left-color: #333; }
  .insight-card .insight-title {
    font-family: 'Urbanist', sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: #FFFFFF;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin-bottom: 14px;
  }
  .insight-card p { color: #999; font-size: 18px; line-height: 1.75; }
  .insight-card .hl-aqua { color: #00EAD3; font-weight: 600; }
  .insight-card .hl-orange { color: #f36710; font-weight: 600; }
  .insight-card .hl-white { color: #FFFFFF; font-weight: 600; }
  
  /* Badges */
  .badge { display: inline-block; padding: 4px 14px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
  .badge.yes { background: #00EAD3; color: #000; }
  .badge.no { background: #808285; color: #000; }
  .badge.recommended { color: #00EAD3; font-weight: 700; }
  
  /* Tables */
  table { width: 100%; border-collapse: collapse; }
  th {
    font-family: 'Urbanist', sans-serif;
    font-size: 14px;
    color: #00EAD3;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    text-align: left;
    padding: 14px 18px;
    border-bottom: 1px solid #333;
  }
  td { padding: 18px 20px; border-bottom: 1px solid #1a1a1a; font-size: 19px; color: #ccc; }
  
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
      case 'site_assessment': content = genSiteAssessment(slide); break;
      case 'scope_of_works': content = genScopeOfWorks(slide); break;
      case 'scope_of_works_1': content = genScopeOfWorks1(slide); break;
      case 'scope_of_works_2': content = genScopeOfWorks2(slide); break;
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
        <div style="width: 4px; height: 50px; background: #00EAD3; border-radius: 2px;"></div>
        <div>
          <p style="font-family: 'Urbanist', sans-serif; font-size: 20px; color: #00EAD3; font-weight: 600;">${slide.title}</p>
          <p style="font-family: 'GeneralSans', sans-serif; font-size: 18px; color: #00EAD3;">${c.address}</p>
        </div>
      </div>
      <div style="position: absolute; bottom: 28px; left: 80px; right: 80px; height: 1px; background: #00EAD3;"></div>
      <div style="position: absolute; bottom: 10px; left: 80px; font-size: 13px; color: #808285;">Prepared by ${c.preparedBy} | ${c.company}</div>
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
      <div style="display: flex; gap: 70px;">
        <!-- Left: Key Metrics -->
        <div style="flex: 1;">
          <p style="font-family: 'Urbanist', sans-serif; font-size: 16px; color: #808285; text-transform: uppercase; letter-spacing: 0.18em; margin-bottom: 28px;">KEY FINDINGS</p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 36px;">
            <div class="card">
              <p class="lbl">ANNUAL COST</p>
              <p class="hero-num orange" style="font-size: 48px;">${fmtCurrency(annualCost)}</p>
            </div>
            <div class="card">
              <p class="lbl">DAILY USAGE</p>
              <p class="hero-num white" style="font-size: 48px;">${dailyUsage.toFixed(1)} <span style="font-size: 22px; color: #808285;">kWh</span></p>
            </div>
            <div class="card">
              <p class="lbl">ANNUAL CONSUMPTION</p>
              <p class="hero-num white" style="font-size: 48px;">${Math.round(annualUsage).toLocaleString()} <span style="font-size: 22px; color: #808285;">kWh</span></p>
            </div>
            <div class="card">
              <p class="lbl">PROJECTED SAVINGS</p>
              <p class="hero-num aqua" style="font-size: 48px;">${fmtCurrency(savings)}<span style="font-size: 20px; color: #808285;">/yr</span></p>
            </div>
          </div>
          ${narrative ? `<div style="color: #999; font-size: 19px; line-height: 1.8;">${narrative}</div>` : ''}
        </div>
        <!-- Right: Strategic Recommendations -->
        <div style="flex: 1;">
          <p style="font-family: 'Urbanist', sans-serif; font-size: 16px; color: #808285; text-transform: uppercase; letter-spacing: 0.18em; margin-bottom: 28px;">STRATEGIC RECOMMENDATIONS</p>
          <div style="display: flex; flex-direction: column; gap: 20px;">
            <div class="insight-card">
              <div class="insight-title">SOLAR + BATTERY SYSTEM</div>
              <p>${c.systemSize}kW solar + ${c.batterySize}kWh battery delivering <span class="hl-aqua">${billRedPct}% bill reduction</span> and <span class="hl-aqua">${offset}% solar offset</span>.</p>
            </div>
            <div class="insight-card">
              <div class="insight-title">FINANCIAL RETURN</div>
              <p>Payback in <span class="hl-aqua">${payback.toFixed(1)} years</span>. 10-year net benefit: <span class="hl-aqua">${fmtCurrency(tenYr)}</span>.</p>
            </div>
            <div class="insight-card">
              <div class="insight-title">VPP INCOME</div>
              <p>${c.vppProvider} VPP: <span class="hl-aqua">${fmtCurrency(c.vppAnnualValue as number || 0)}/year</span> in grid participation credits.</p>
            </div>
            ${stratRec ? `<div style="color: #999; font-size: 18px; line-height: 1.7; margin-top: 8px;">${stratRec}</div>` : ''}
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
          <p style="font-family: 'Urbanist', sans-serif; font-size: 16px; color: #808285; text-transform: uppercase; letter-spacing: 0.18em; margin-bottom: 20px;">ACCOUNT DETAILS</p>
          <table>
            <tr><td style="color: #808285; width: 180px;">Account Holder</td><td style="color: #fff; font-weight: 600;">${c.customerName}</td></tr>
            <tr><td style="color: #808285;">Service Address</td><td style="color: #fff;">${c.address}, ${c.state}</td></tr>
            <tr><td style="color: #808285;">Retailer</td><td style="color: #fff;">${c.retailer}</td></tr>
            <tr><td style="color: #808285;">Billing Period</td><td style="color: #fff;">${c.billDays ? `${c.billDays} days` : 'Quarterly'}</td></tr>
            <tr><td style="color: #808285;">Daily Average</td><td style="color: #fff;">${(c.dailyAverageKwh as number || 0).toFixed(1)} kWh</td></tr>
            <tr><td style="color: #808285;">Annual Cost</td><td style="color: #f36710; font-weight: 700;">${fmtCurrency(c.annualCost as number || 0)}</td></tr>
          </table>
          ${narrative ? `<div style="margin-top: 28px; color: #999; font-size: 19px; line-height: 1.8;">${narrative}</div>` : ''}
        </div>
        <!-- Right: Tariff Rate Cards -->
        <div style="flex: 1;">
          <p style="font-family: 'Urbanist', sans-serif; font-size: 16px; color: #808285; text-transform: uppercase; letter-spacing: 0.18em; margin-bottom: 20px;">CURRENT TARIFF STRUCTURE</p>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${peakRate ? `<div class="card" style="display: flex; justify-content: space-between; align-items: center;">
              <div><p class="lbl">PEAK RATE</p><p style="color: #808285; font-size: 17px;">Weekdays 3pm-9pm</p></div>
              <p class="hero-num orange" style="font-size: 42px;">${peakRate.toFixed(1)}<span style="font-size: 18px; color: #808285;">¢/kWh</span></p>
            </div>` : ''}
            ${offPeakRate ? `<div class="card" style="display: flex; justify-content: space-between; align-items: center;">
              <div><p class="lbl">OFF-PEAK RATE</p><p style="color: #808285; font-size: 17px;">10pm-7am</p></div>
              <p class="hero-num aqua" style="font-size: 42px;">${offPeakRate.toFixed(1)}<span style="font-size: 18px; color: #808285;">¢/kWh</span></p>
            </div>` : ''}
            ${shoulderRate ? `<div class="card" style="display: flex; justify-content: space-between; align-items: center;">
              <div><p class="lbl">SHOULDER RATE</p><p style="color: #808285; font-size: 17px;">7am-3pm, 9pm-10pm</p></div>
              <p class="hero-num white" style="font-size: 42px;">${shoulderRate.toFixed(1)}<span style="font-size: 18px; color: #808285;">¢/kWh</span></p>
            </div>` : ''}
            ${!peakRate && !offPeakRate && !shoulderRate ? `<div class="card" style="display: flex; justify-content: space-between; align-items: center;">
              <div><p class="lbl">USAGE RATE (FLAT)</p><p style="color: #808285; font-size: 17px;">All times</p></div>
              <p class="hero-num orange" style="font-size: 42px;">${usageRate.toFixed(1)}<span style="font-size: 18px; color: #808285;">¢/kWh</span></p>
            </div>` : ''}
            <div class="card" style="display: flex; justify-content: space-between; align-items: center;">
              <div><p class="lbl">DAILY SUPPLY CHARGE</p><p style="color: #808285; font-size: 17px;">Fixed daily cost</p></div>
              <p class="hero-num white" style="font-size: 42px;">${supplyCharge.toFixed(1)}<span style="font-size: 18px; color: #808285;">¢/day</span></p>
            </div>
            <div class="card" style="display: flex; justify-content: space-between; align-items: center;">
              <div><p class="lbl">FEED-IN TARIFF</p><p style="color: #808285; font-size: 17px;">Solar export credit</p></div>
              <p class="hero-num aqua" style="font-size: 42px;">${feedIn.toFixed(1)}<span style="font-size: 18px; color: #808285;">¢/kWh</span></p>
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
            <div><p class="lbl">BILLING PERIOD</p><p style="color: #fff; font-size: 17px;">${c.billPeriodStart} — ${c.billPeriodEnd}</p></div>
            <div style="text-align: right;"><p class="lbl">BILL TOTAL</p><p style="color: #f36710; font-size: 20px; font-weight: 700;">${fmtCurrency(c.billTotalAmount as number || totalCost / 4)}</p></div>
          </div>` : ''}
          <p style="font-family: 'Urbanist', sans-serif; font-size: 17px; color: #00EAD3; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 16px;">ANNUAL COST BREAKDOWN</p>
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
          ${narrative ? `<div style="margin-top: 20px; color: #808285; font-size: 17px; line-height: 1.6;">${narrative}</div>` : ''}
        </div>
        <!-- Right: Donut Chart -->
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <div style="position: relative; width: 350px; height: 350px;">
            <svg viewBox="0 0 200 200" width="350" height="350">
              <defs>
                <linearGradient id="usageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#ff8a3d" />
                  <stop offset="100%" stop-color="#f36710" />
                </linearGradient>
                <linearGradient id="supplyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#9a9a9a" />
                  <stop offset="100%" stop-color="#606060" />
                </linearGradient>
                <filter id="donutGlow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <radialGradient id="centreGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="rgba(243,103,16,0.08)" />
                  <stop offset="100%" stop-color="rgba(0,0,0,0)" />
                </radialGradient>
              </defs>
              <circle cx="100" cy="100" r="80" fill="none" stroke="url(#usageGrad)" stroke-width="28" stroke-dasharray="${usagePct * 5.03} ${(100 - usagePct) * 5.03}" stroke-dashoffset="126" stroke-linecap="round" filter="url(#donutGlow)" />
              <circle cx="100" cy="100" r="80" fill="none" stroke="url(#supplyGrad)" stroke-width="28" stroke-dasharray="${supplyPct * 5.03} ${(100 - supplyPct) * 5.03}" stroke-dashoffset="${126 - usagePct * 5.03}" stroke-linecap="round" />
              <circle cx="100" cy="100" r="62" fill="#1a1a1a" />
              <circle cx="100" cy="100" r="62" fill="url(#centreGlow)" />
            </svg>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
              <p style="font-family: 'GeneralSans', sans-serif; font-size: 36px; font-weight: 700; color: #fff;">${fmtCurrency(totalCost)}</p>
              <p style="font-size: 14px; color: #808285; text-transform: uppercase; letter-spacing: 0.1em;">PER YEAR</p>
            </div>
          </div>
          <div style="display: flex; gap: 40px; margin-top: 30px;">
            <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 16px; height: 16px; border-radius: 4px; background: linear-gradient(135deg, #ff8a3d, #f36710);"></div><span style="color: #808285; font-size: 17px;">Usage (${usagePct}%)</span></div>
            <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 16px; height: 16px; border-radius: 4px; background: linear-gradient(135deg, #9a9a9a, #606060);"></div><span style="color: #808285; font-size: 17px;">Supply (${supplyPct}%)</span></div>
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
  
  // Season colors and gradients
  const seasonGradient = (month: string): { color: string; gradStart: string; gradEnd: string } => {
    const m = month.substring(0, 3);
    if (['Dec', 'Jan', 'Feb'].includes(m)) return { color: '#FF9E6D', gradStart: '#FFB088', gradEnd: '#FF9E6D' };
    if (['Mar', 'Apr', 'May'].includes(m)) return { color: '#808285', gradStart: '#a0a0a5', gradEnd: '#606065' };
    if (['Jun', 'Jul', 'Aug'].includes(m)) return { color: '#00EAD3', gradStart: '#33FFE8', gradEnd: '#00C4B0' };
    return { color: '#FFFFFF', gradStart: '#FFFFFF', gradEnd: '#C8C8C8' };
  };
  
  const peakMonth = monthlyData.reduce((max, curr) => curr.kwh > max.kwh ? curr : max, monthlyData[0] || { month: 'Jan', kwh: 0 });
  const lowMonth = monthlyData.reduce((min, curr) => curr.kwh < min.kwh ? curr : min, monthlyData[0] || { month: 'Jan', kwh: 0 });
  const narrative = (c.narrative as string) || '';
  
  // SVG bar chart dimensions
  const chartW = 750, chartH = 440;
  const barW = 44;
  const barGap = (chartW - barW * 12) / 13;
  const yMax = Math.ceil(maxKwh * 1.15 / 100) * 100;
  
  return `
    <div class="slide">
      ${slideNum(slide.id)}
      ${logoBR()}
      ${slideHeader(slide.title, slide.subtitle)}
      <div style="display: flex; gap: 40px;">
        <!-- Left: Premium Bar Chart -->
        <div style="flex: 1.4;">
          <svg viewBox="0 0 ${chartW} ${chartH + 60}" width="${chartW}" height="${chartH + 60}">
            <defs>
              ${monthlyData.map((m, i) => {
                const g = seasonGradient(m.month);
                return `<linearGradient id="barGrad${i}" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="${g.gradStart}" />
                  <stop offset="100%" stop-color="${g.gradEnd}" />
                </linearGradient>
                <filter id="barGlow${i}"><feGaussianBlur stdDeviation="4" result="blur" /><feFlood flood-color="${g.color}" flood-opacity="0.3" /><feComposite in2="blur" operator="in" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>`;
              }).join('')}
            </defs>
            <!-- Subtle grid lines -->
            ${Array.from({ length: 5 }, (_, i) => {
              const v = (yMax / 4) * i;
              const y = chartH - (v / yMax) * chartH;
              return `<line x1="0" y1="${y}" x2="${chartW}" y2="${y}" stroke="rgba(128,130,133,0.15)" stroke-width="1" />`;
            }).join('')}
            <!-- Bars with gradient + glow -->
            ${monthlyData.map((m, i) => {
              const x = barGap + i * (barW + barGap);
              const barH = (m.kwh / yMax) * chartH;
              const y = chartH - barH;
              return `<rect x="${x}" y="${y}" width="${barW}" height="${barH}" fill="url(#barGrad${i})" rx="6" ry="6" filter="url(#barGlow${i})" />
                <text x="${x + barW / 2}" y="${y - 8}" fill="#808285" font-size="13" text-anchor="middle" font-family="GeneralSans, sans-serif">${Math.round(m.kwh)}</text>`;
            }).join('')}
            <!-- Month labels -->
            ${monthlyData.map((m, i) => {
              const x = barGap + i * (barW + barGap) + barW / 2;
              return `<text x="${x}" y="${chartH + 24}" fill="#808285" font-size="14" text-anchor="middle" font-family="Urbanist, sans-serif" text-transform="uppercase" letter-spacing="0.05em">${m.month.substring(0, 3).toUpperCase()}</text>`;
            }).join('')}
          </svg>
          <div style="display: flex; gap: 24px; margin-top: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 14px; height: 14px; border-radius: 3px; background: linear-gradient(180deg, #FFB088, #FF9E6D);"></div><span style="color: #808285; font-size: 14px;">Summer</span></div>
            <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 14px; height: 14px; border-radius: 3px; background: linear-gradient(180deg, #a0a0a5, #606065);"></div><span style="color: #808285; font-size: 14px;">Autumn</span></div>
            <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 14px; height: 14px; border-radius: 3px; background: linear-gradient(180deg, #33FFE8, #00C4B0);"></div><span style="color: #808285; font-size: 14px;">Winter</span></div>
            <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 14px; height: 14px; border-radius: 3px; background: linear-gradient(180deg, #FFFFFF, #C8C8C8);"></div><span style="color: #808285; font-size: 14px;">Spring</span></div>
          </div>
        </div>
        <!-- Right: Metrics -->
        <div style="flex: 0.7; display: flex; flex-direction: column; gap: 16px;">
          <div style="border-left: 4px solid #00EAD3; padding: 16px 20px; background: rgba(255,255,255,0.03);">
            <p class="lbl">ANNUAL CONSUMPTION</p>
            <p style="font-family: GeneralSans, sans-serif; font-size: 36px; font-weight: 700; color: #fff; margin: 4px 0;">${Math.round(annualUsage).toLocaleString()} <span style="font-size: 18px; color: #808285; font-weight: 400;">kWh</span></p>
          </div>
          <div style="border-left: 4px solid #808285; padding: 16px 20px; background: rgba(255,255,255,0.03);">
            <p class="lbl">DAILY AVERAGE</p>
            <p style="font-family: GeneralSans, sans-serif; font-size: 36px; font-weight: 700; color: #fff; margin: 4px 0;">${dailyUsage.toFixed(1)} <span style="font-size: 18px; color: #808285; font-weight: 400;">kWh</span></p>
          </div>
          <div style="border-left: 4px solid #00EAD3; padding: 16px 20px; background: rgba(255,255,255,0.03);">
            <p class="lbl">PEAK MONTH</p>
            <p style="font-family: NextSphere, sans-serif; font-size: 28px; font-weight: 800; color: #00EAD3; margin: 4px 0;">${peakMonth.month}</p>
            <p style="color: #808285; font-size: 17px;">${Math.round(peakMonth.kwh).toLocaleString()} kWh</p>
          </div>
          <div style="border-left: 4px solid #00EAD3; padding: 16px 20px; background: rgba(255,255,255,0.03);">
            <p class="lbl">LOWEST MONTH</p>
            <p style="font-family: NextSphere, sans-serif; font-size: 28px; font-weight: 800; color: #00EAD3; margin: 4px 0;">${lowMonth.month}</p>
            <p style="color: #808285; font-size: 17px;">${Math.round(lowMonth.kwh).toLocaleString()} kWh</p>
          </div>
          ${narrative ? `<div style="color: #808285; font-size: 14px; line-height: 1.6; margin-top: 8px;">${narrative}</div>` : ''}
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
  const state = (c.state as string) || 'NSW';
  
  // Find max value for chart scaling (use solar as bars, consumption as line)
  const maxSolar = Math.max(...monthlyData.map(m => m.solar), 1);
  const maxKwh = Math.max(...monthlyData.map(m => m.kwh), 1);
  const maxVal = Math.max(maxSolar, maxKwh) * 1.1; // 10% headroom
  
  // Determine seasonal variance info
  const winterMonths = ['Jun', 'Jul', 'Aug'];
  const summerMonths = ['Nov', 'Dec', 'Jan', 'Feb'];
  const winterDeficit = monthlyData.filter(m => winterMonths.includes(m.month.substring(0, 3))).some(m => m.kwh > m.solar);
  const summerAvg = monthlyData.filter(m => summerMonths.includes(m.month.substring(0, 3))).reduce((s, m) => s + m.solar, 0) / 4;
  
  // Build SVG bar chart with consumption line overlay
  const chartW = 750, chartH = 380;
  const barW = 42;
  const barGap = (chartW - barW * 12) / 13;
  
  // Y-axis scale
  const yMax = Math.ceil(maxVal / 500) * 500;
  const yTicks = [];
  for (let v = 0; v <= yMax; v += 500) yTicks.push(v);
  
  // Bar positions
  const bars = monthlyData.map((m, i) => {
    const x = barGap + i * (barW + barGap);
    const barH = (m.solar / yMax) * chartH;
    const y = chartH - barH;
    return { x, y, barH, month: m.month, solar: m.solar, kwh: m.kwh };
  });
  
  // Consumption line points (smooth curve through bar centres)
  const linePts = bars.map(b => {
    const cx = b.x + barW / 2;
    const cy = chartH - (b.kwh / yMax) * chartH;
    return { cx, cy };
  });
  
  // Build smooth cubic bezier path for consumption line
  let linePath = `M ${linePts[0].cx},${linePts[0].cy}`;
  for (let i = 1; i < linePts.length; i++) {
    const prev = linePts[i - 1];
    const curr = linePts[i];
    const cpx = (prev.cx + curr.cx) / 2;
    linePath += ` C ${cpx},${prev.cy} ${cpx},${curr.cy} ${curr.cx},${curr.cy}`;
  }
  
  return `
    <div class="slide">
      ${slideNum(slide.id)}
      ${logoBR()}
      ${slideHeader(slide.title, slide.subtitle)}
      <div style="display: flex; gap: 40px;">
        <!-- Left: Bar Chart with Line Overlay -->
        <div style="flex: 1.4;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 6px;"><div style="width: 10px; height: 10px; border-radius: 50%; background: #f36710;"></div><span style="color: #808285; font-size: 17px; font-family: GeneralSans, sans-serif;">Consumption (kWh)</span></div>
          </div>
          <svg viewBox="0 0 ${chartW} ${chartH + 50}" width="${chartW}" height="${chartH + 50}">
            <defs>
              <linearGradient id="solarBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#33FFE8" />
                <stop offset="100%" stop-color="#00C4B0" />
              </linearGradient>
              <filter id="solarBarGlow"><feGaussianBlur stdDeviation="4" result="blur" /><feFlood flood-color="#00EAD3" flood-opacity="0.25" /><feComposite in2="blur" operator="in" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              <filter id="lineGlow"><feGaussianBlur stdDeviation="3" result="blur" /><feFlood flood-color="#f36710" flood-opacity="0.5" /><feComposite in2="blur" operator="in" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>
            <!-- Subtle grid lines -->
            ${yTicks.map(v => {
              const y = chartH - (v / yMax) * chartH;
              return `<line x1="0" y1="${y}" x2="${chartW}" y2="${y}" stroke="rgba(128,130,133,0.12)" stroke-width="1" />`;
            }).join('')}
            <!-- Y-axis labels -->
            ${yTicks.map(v => {
              const y = chartH - (v / yMax) * chartH;
              return `<text x="-8" y="${y + 4}" fill="#808285" font-size="13" text-anchor="end" font-family="GeneralSans, sans-serif">${v.toLocaleString()}</text>`;
            }).join('')}
            <!-- Bars (solar generation) with gradient + glow -->
            ${bars.map(b => `<rect x="${b.x}" y="${b.y}" width="${barW}" height="${b.barH}" fill="url(#solarBarGrad)" rx="5" ry="5" filter="url(#solarBarGlow)" />`).join('')}
            <!-- Consumption line (smooth curve) with glow -->
            <path d="${linePath}" fill="none" stroke="#f36710" stroke-width="3" stroke-linecap="round" filter="url(#lineGlow)" />
            <!-- Consumption dots with glow ring -->
            ${linePts.map(p => `<circle cx="${p.cx}" cy="${p.cy}" r="6" fill="none" stroke="rgba(243,103,16,0.3)" stroke-width="3" /><circle cx="${p.cx}" cy="${p.cy}" r="4" fill="#f36710" />`).join('')}
            <!-- X-axis month labels -->
            ${bars.map(b => `<text x="${b.x + barW / 2}" y="${chartH + 22}" fill="#808285" font-size="14" text-anchor="middle" font-family="Urbanist, sans-serif">${b.month.substring(0, 3)}</text>`).join('')}
          </svg>
        </div>
        <!-- Right: Info Cards -->
        <div style="flex: 0.7; display: flex; flex-direction: column; gap: 16px;">
          <div style="border-left: 4px solid #00EAD3; padding: 16px 20px; background: rgba(255,255,255,0.03);">
            <p class="lbl">ANNUAL GENERATION</p>
            <p style="font-family: GeneralSans, sans-serif; font-size: 38px; font-weight: 700; color: #00EAD3; margin: 4px 0;">${Math.round(annualSolar).toLocaleString()} <span style="font-size: 18px; color: #808285; font-weight: 400;">KWH</span></p>
            <p style="color: #808285; font-size: 17px; line-height: 1.5;">${offset}% of current annual usage. ${offset > 100 ? 'Significant surplus available for battery charging and VPP export.' : 'Solar covers the majority of annual consumption with battery optimisation.'}</p>
          </div>
          <div style="border-left: 4px solid #00EAD3; padding: 16px 20px; background: rgba(255,255,255,0.03);">
            <p class="lbl">SEASONAL VARIANCE</p>
            <p style="font-family: NextSphere, sans-serif; font-size: 28px; font-weight: 800; color: ${winterDeficit ? '#FF9E6D' : '#00EAD3'}; margin: 4px 0; text-transform: uppercase;">${winterDeficit ? 'WINTER DEFICIT' : 'BALANCED PROFILE'}</p>
            <p style="color: #808285; font-size: 17px; line-height: 1.5;">${winterDeficit ? `June-August consumption exceeds generation. Grid and battery support required during ${state === 'QLD' || state === 'NT' ? 'wet' : 'heating'} season.` : 'Solar generation closely matches consumption patterns year-round.'}</p>
          </div>
          <div style="border-left: 4px solid #00EAD3; padding: 16px 20px; background: rgba(255,255,255,0.03);">
            <p class="lbl">SUMMER PERFORMANCE</p>
            <p style="font-family: NextSphere, sans-serif; font-size: 28px; font-weight: 800; color: #ffffff; margin: 4px 0;">PEAK SURPLUS</p>
            <p style="color: #808285; font-size: 17px; line-height: 1.5;">Nov-Feb generation (avg ${Math.round(summerAvg).toLocaleString()}+ kWh/mo) maximises VPP credits and bill offsets.</p>
          </div>
          ${narrative ? `<div style="color: #808285; font-size: 14px; line-height: 1.6; margin-top: 4px;">${narrative}</div>` : ''}
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
  
  const maxCost = Math.max(...costProjection.map(p => p.withoutSolar), 1) * 1.1;
  const chartW = 750, chartH = 380;
  const xStep = chartW / (costProjection.length - 1 || 1);
  
  // Build smooth bezier paths
  const pts = (key: 'withoutSolar' | 'withSolar') => costProjection.map((p, i) => ({
    x: i * xStep,
    y: chartH - (p[key] / maxCost) * chartH
  }));
  const buildPath = (points: Array<{x: number; y: number}>): string => {
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const cpx = (points[i - 1].x + points[i].x) / 2;
      d += ` C ${cpx},${points[i - 1].y} ${cpx},${points[i].y} ${points[i].x},${points[i].y}`;
    }
    return d;
  };
  const buildArea = (points: Array<{x: number; y: number}>): string => {
    return buildPath(points) + ` L ${points[points.length - 1].x},${chartH} L ${points[0].x},${chartH} Z`;
  };
  const withoutPoints = pts('withoutSolar');
  const withPoints = pts('withSolar');
  const withoutPath = buildPath(withoutPoints);
  const withPath = buildPath(withPoints);
  const withoutArea = buildArea(withoutPoints);
  const withArea = buildArea(withPoints);
  
  // Y-axis ticks
  const yMax = Math.ceil(maxCost / 1000) * 1000;
  const yTicks: number[] = [];
  for (let v = 0; v <= yMax; v += Math.ceil(yMax / 5 / 1000) * 1000) yTicks.push(v);
  
  return `
    <div class="slide">
      ${slideNum(slide.id)}
      ${logoBR()}
      ${slideHeader(slide.title, slide.subtitle)}
      <div style="display: flex; gap: 40px;">
        <!-- Left: Premium Line Chart -->
        <div style="flex: 1.4;">
          <svg viewBox="0 0 ${chartW} ${chartH + 50}" width="${chartW}" height="${chartH + 50}">
            <defs>
              <linearGradient id="orangeAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="rgba(243,103,16,0.25)" />
                <stop offset="100%" stop-color="rgba(243,103,16,0)" />
              </linearGradient>
              <linearGradient id="aquaAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="rgba(0,234,211,0.2)" />
                <stop offset="100%" stop-color="rgba(0,234,211,0)" />
              </linearGradient>
              <filter id="orangeLineGlow"><feGaussianBlur stdDeviation="3" result="blur" /><feFlood flood-color="#f36710" flood-opacity="0.4" /><feComposite in2="blur" operator="in" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              <filter id="aquaLineGlow"><feGaussianBlur stdDeviation="3" result="blur" /><feFlood flood-color="#00EAD3" flood-opacity="0.4" /><feComposite in2="blur" operator="in" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>
            <!-- Subtle grid lines -->
            ${yTicks.map(v => {
              const y = chartH - (v / maxCost) * chartH;
              return `<line x1="0" y1="${y}" x2="${chartW}" y2="${y}" stroke="rgba(128,130,133,0.12)" stroke-width="1" />
                <text x="-8" y="${y + 4}" fill="#808285" font-size="12" text-anchor="end" font-family="GeneralSans, sans-serif">$${(v / 1000).toFixed(0)}k</text>`;
            }).join('')}
            <!-- Area fills -->
            <path d="${withoutArea}" fill="url(#orangeAreaGrad)" />
            <path d="${withArea}" fill="url(#aquaAreaGrad)" />
            <!-- Lines with glow -->
            <path d="${withoutPath}" fill="none" stroke="#f36710" stroke-width="3" stroke-linecap="round" filter="url(#orangeLineGlow)" />
            <path d="${withPath}" fill="none" stroke="#00EAD3" stroke-width="3" stroke-linecap="round" filter="url(#aquaLineGlow)" />
            <!-- Key data point dots -->
            ${[0, 10, 25].map(yr => {
              const i = yr;
              if (i >= costProjection.length) return '';
              const wx = withoutPoints[i].x, wy = withoutPoints[i].y;
              const sx = withPoints[i].x, sy = withPoints[i].y;
              return `<circle cx="${wx}" cy="${wy}" r="5" fill="#f36710" /><circle cx="${sx}" cy="${sy}" r="5" fill="#00EAD3" />`;
            }).join('')}
            <!-- X-axis year labels -->
            ${[0, 5, 10, 15, 20, 25].map(yr => {
              const x = (yr / 25) * chartW;
              return `<text x="${x}" y="${chartH + 25}" fill="#808285" font-size="14" text-anchor="middle" font-family="Urbanist, sans-serif">YR ${yr}</text>`;
            }).join('')}
          </svg>
          <div style="display: flex; gap: 30px; margin-top: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 20px; height: 3px; border-radius: 2px; background: #f36710; box-shadow: 0 0 6px rgba(243,103,16,0.5);"></div><span style="color: #808285; font-size: 14px;">Without Solar (3.5% inflation)</span></div>
            <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 20px; height: 3px; border-radius: 2px; background: #00EAD3; box-shadow: 0 0 6px rgba(0,234,211,0.5);"></div><span style="color: #808285; font-size: 14px;">With Solar + Battery</span></div>
          </div>
        </div>
        <!-- Right: Metrics -->
        <div style="flex: 0.7; display: flex; flex-direction: column; gap: 16px;">
          <div style="border-left: 4px solid #00EAD3; padding: 16px 20px; background: rgba(255,255,255,0.03);">
            <p class="lbl">CURRENT ANNUAL</p>T</p>
            <p style="font-family: GeneralSans, sans-serif; font-size: 32px; font-weight: 700; color: #f36710; margin: 4px 0;">${fmtCurrency(currentCost)}</p>
          </div>
          <div style="border-left: 4px solid #00EAD3; padding: 16px 20px; background: rgba(255,255,255,0.03);">
            <p class="lbl">YEAR 10 (NO ACTION)</p>
            <p style="font-family: GeneralSans, sans-serif; font-size: 32px; font-weight: 700; color: #f36710; margin: 4px 0;">${fmtCurrency(yr10)}</p>
          </div>
          <div style="border-left: 4px solid #00EAD3; padding: 16px 20px; background: rgba(255,255,255,0.03);">
            <p class="lbl">25-YEAR PROJECTION</p>>
            <p style="font-family: GeneralSans, sans-serif; font-size: 32px; font-weight: 700; color: #f36710; margin: 4px 0;">${fmtCurrency(yr25)}</p>
          </div>
          <div style="border-left: 4px solid #00EAD3; padding: 16px 20px; background: rgba(0,234,211,0.05); border: 1px solid rgba(0,234,211,0.2);">
            <p class="lbl">25-YEAR CUMULATIVE SAVINGS</p>
            <p style="font-family: GeneralSans, sans-serif; font-size: 36px; font-weight: 700; color: #00EAD3; margin: 4px 0;">${fmtCurrency(cumSavings)}</p>
          </div>
          ${narrative ? `<div style="color: #808285; font-size: 14px; line-height: 1.6; margin-top: 8px;">${narrative}</div>` : ''}
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
            <p style="font-family: 'Urbanist', sans-serif; font-size: 17px; color: #00EAD3; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; font-weight: 600;">${b.title}</p>
            <p style="color: #808285; font-size: 17px; line-height: 1.5;">${b.description}</p>
          </div>
        `).join('')}
      </div>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
        ${bottomRow.map(b => `
          <div class="card" style="border-top: 3px solid #00EAD3;">
            <p style="font-family: 'Urbanist', sans-serif; font-size: 17px; color: #00EAD3; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; font-weight: 600;">${b.title}</p>
            <p style="color: #808285; font-size: 17px; line-height: 1.5;">${b.description}</p>
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
            <div style="background: #222; padding: 20px; border-top: 3px solid #00EAD3;">
              <p style="font-family: 'Urbanist', sans-serif; font-size: 17px; color: #00EAD3; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; font-weight: 600;">${con.title}</p>
              <p style="color: #808285; font-size: 14px; line-height: 1.5;">${con.description}</p>
            </div>
          `).join('')}
        </div>
        <!-- Right: Balanced View Quote -->
        <div style="flex: 0.8; display: flex; flex-direction: column; justify-content: center;">
          <div class="card" style="border-color: #444;">
            <p style="font-family: 'GeneralSans', sans-serif; font-size: 18px; color: #fff; font-weight: 600; margin-bottom: 12px;">Balanced View</p>
            <div style="width: 40px; height: 2px; background: #00EAD3; margin-bottom: 16px;"></div>
            <p style="font-family: 'UrbanistItalic', sans-serif; font-style: italic; color: #808285; font-size: 18px; line-height: 1.7;">"${balancedView}"</p>
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
            <p style="color: #00EAD3; font-size: 17px; margin-top: 8px;">${moduleConfig}</p>
          </div>
          <!-- Why This Capacity -->
          <div class="card">
            <p style="font-family: 'Urbanist', sans-serif; font-size: 17px; color: #00EAD3; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; font-weight: 600;">WHY THIS CAPACITY?</p>
            <p style="color: #808285; font-size: 17px; line-height: 1.6;">This massive storage capacity ensures complete overnight coverage and enables aggressive VPP trading during peak demand events. The modular design allows future expansion as your energy needs grow.</p>
          </div>
          <!-- Technical Edge -->
          <div class="card">
            <p style="font-family: 'Urbanist', sans-serif; font-size: 17px; color: #00EAD3; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; font-weight: 600;">TECHNICAL EDGE</p>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <p style="color: #808285; font-size: 17px;">✓ <span style="color: #00EAD3;">LFP Technology</span> — 6,000+ cycle lifespan</p>
              <p style="color: #808285; font-size: 17px;">✓ <span style="color: #00EAD3;">High Voltage</span> — Superior efficiency</p>
              <p style="color: #808285; font-size: 17px;">✓ <span style="color: #00EAD3;">Modular Design</span> — Scalable capacity</p>
              <p style="color: #808285; font-size: 17px;">✓ <span style="color: #00EAD3;">98% DoD</span> — Maximum usable energy</p>
            </div>
          </div>
        </div>
        <!-- Right Column -->
        <div style="flex: 1; display: flex; flex-direction: column; gap: 20px;">
          <p style="font-family: 'Urbanist', sans-serif; font-size: 17px; color: #fff; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">Strategic Capacity Allocation</p>
          <!-- Stacked Bar -->
          <div style="display: flex; height: 50px; width: 100%;">
            <div style="flex: ${eveningUse}; background: #00EAD3; display: flex; align-items: center; justify-content: center;"><span style="color: #000; font-size: 17px; font-weight: 700;">EVENING USE (${eveningUse}%)</span></div>
            <div style="flex: ${vppTrading}; background: #00EAD3; display: flex; align-items: center; justify-content: center;"><span style="color: #000; font-size: 17px; font-weight: 700;">VPP TRADING (${vppTrading}%)</span></div>
            <div style="flex: ${backup}; background: #808285; display: flex; align-items: center; justify-content: center;"><span style="color: #000; font-size: 17px; font-weight: 700;">BACKUP (${backup}%)</span></div>
          </div>
          <div style="display: flex; gap: 16px;">
            <div style="flex: 1;"><p style="color: #00EAD3; font-size: 17px; font-weight: 600;">Home Power</p><p style="color: #808285; font-size: 14px;">Overnight household consumption from stored solar</p></div>
            <div style="flex: 1;"><p style="color: #00EAD3; font-size: 17px; font-weight: 600;">Income Generation</p><p style="color: #808285; font-size: 14px;">VPP grid events and peak demand trading</p></div>
            <div style="flex: 1;"><p style="color: #808285; font-size: 17px; font-weight: 600;">Safety Reserve</p><p style="color: #808285; font-size: 14px;">Blackout protection and emergency backup</p></div>
          </div>
          <!-- The Result -->
          <div class="card orange-b" style="margin-top: auto;">
            <p style="font-family: 'Urbanist', sans-serif; font-size: 17px; color: #00EAD3; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; font-weight: 600;">THE RESULT</p>
            <p style="color: #fff; font-size: 18px; font-weight: 600;">You effectively become your own power plant.</p>
            <p style="color: #808285; font-size: 17px; margin-top: 6px;">Complete energy independence during peak hours with revenue generation from surplus capacity.</p>
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
  
  // Roof analysis data
  const roofOrientation = c.roofOrientation as string | null;
  const roofTiltDegrees = c.roofTiltDegrees as number | null;
  const roofTiltCategory = c.roofTiltCategory as string | null;
  const roofShadingLevel = c.roofShadingLevel as string | null;
  const roofShadingImpactPercent = c.roofShadingImpactPercent as number | null;
  const roofMaterial = c.roofMaterial as string | null;
  const roofCondition = c.roofCondition as string | null;
  const roofUsableAreaSqm = c.roofUsableAreaSqm as number | null;
  const roofPanelCapacity = c.roofPanelCapacity as number | null;
  const roofMountingType = c.roofMountingType as string | null;
  const roofEfficiencyMultiplier = c.roofEfficiencyMultiplier as number | null;
  const roofAnnualAdjustment = c.roofAnnualAdjustment as string | null;
  const roofObstructions = c.roofObstructions as string[] || [];
  const roofShadingSources = c.roofShadingSources as string[] || [];
  const roofWarnings = c.roofWarnings as string[] || [];
  const hasRoofData = roofOrientation && roofOrientation !== 'unknown';
  
  // Format helpers
  const fmtOrientation = (o: string) => o.replace(/-/g, '-').replace(/^\w/, ch => ch.toUpperCase());
  const fmtMaterial = (m: string) => m.replace(/_/g, ' ').replace(/^\w/, ch => ch.toUpperCase());
  const fmtShading = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const fmtMounting = (m: string) => m === 'flush' ? 'Flush Mount' : m === 'tilt_frame' ? 'Tilt Frame' : m === 'ballast' ? 'Ballast' : 'TBD';
  
  // Build roof profile section (replaces "Why This Size" when roof data available)
  const roofProfileSection = hasRoofData ? `
          <!-- Roof Profile (from photo analysis) -->
          <div class="card">
            <p style="font-family: 'Urbanist', sans-serif; font-size: 17px; color: #00EAD3; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; font-weight: 600;">ROOF PROFILE</p>
            <div style="display: flex; flex-direction: column; gap: 5px;">
              <div style="display: flex; justify-content: space-between;">
                <p style="color: #808285; font-size: 15px;">Orientation</p>
                <p style="color: #FFFFFF; font-size: 15px; font-family: 'GeneralSans', sans-serif; font-weight: 600;">${fmtOrientation(roofOrientation!)}-Facing</p>
              </div>
              ${roofTiltDegrees !== null ? `<div style="display: flex; justify-content: space-between;">
                <p style="color: #808285; font-size: 15px;">Pitch</p>
                <p style="color: #FFFFFF; font-size: 15px; font-family: 'GeneralSans', sans-serif; font-weight: 600;">${roofTiltDegrees}° (${roofTiltCategory ? roofTiltCategory.replace(/_/g, ' ') : ''})</p>
              </div>` : ''}
              ${roofMaterial && roofMaterial !== 'unknown' ? `<div style="display: flex; justify-content: space-between;">
                <p style="color: #808285; font-size: 15px;">Material</p>
                <p style="color: #FFFFFF; font-size: 15px; font-family: 'GeneralSans', sans-serif; font-weight: 600;">${fmtMaterial(roofMaterial)}</p>
              </div>` : ''}
              ${roofCondition && roofCondition !== 'unknown' ? `<div style="display: flex; justify-content: space-between;">
                <p style="color: #808285; font-size: 15px;">Condition</p>
                <p style="color: #FFFFFF; font-size: 15px; font-family: 'GeneralSans', sans-serif; font-weight: 600;">${roofCondition.charAt(0).toUpperCase() + roofCondition.slice(1)}</p>
              </div>` : ''}
              ${roofShadingLevel && roofShadingLevel !== 'unknown' ? `<div style="display: flex; justify-content: space-between;">
                <p style="color: #808285; font-size: 15px;">Shading</p>
                <p style="color: ${roofShadingLevel === 'none' || roofShadingLevel === 'minimal' ? '#00EAD3' : '#FF6B35'}; font-size: 15px; font-family: 'GeneralSans', sans-serif; font-weight: 600;">${fmtShading(roofShadingLevel)}${roofShadingImpactPercent !== null ? ` (−${roofShadingImpactPercent}%)` : ''}</p>
              </div>` : ''}
              ${roofMountingType && roofMountingType !== 'unknown' ? `<div style="display: flex; justify-content: space-between;">
                <p style="color: #808285; font-size: 15px;">Mounting</p>
                <p style="color: #FFFFFF; font-size: 15px; font-family: 'GeneralSans', sans-serif; font-weight: 600;">${fmtMounting(roofMountingType)}</p>
              </div>` : ''}
              ${roofUsableAreaSqm ? `<div style="display: flex; justify-content: space-between;">
                <p style="color: #808285; font-size: 15px;">Usable Area</p>
                <p style="color: #FFFFFF; font-size: 15px; font-family: 'GeneralSans', sans-serif; font-weight: 600;">~${roofUsableAreaSqm}m² (${roofPanelCapacity || '?'} panels)</p>
              </div>` : ''}
              ${roofEfficiencyMultiplier !== null ? `<div style="display: flex; justify-content: space-between; margin-top: 4px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.08);">
                <p style="color: #808285; font-size: 15px;">Efficiency Rating</p>
                <p style="color: ${roofEfficiencyMultiplier >= 0.9 ? '#00EAD3' : roofEfficiencyMultiplier >= 0.8 ? '#FFFFFF' : '#FF6B35'}; font-size: 15px; font-family: 'GeneralSans', sans-serif; font-weight: 600;">${Math.round(roofEfficiencyMultiplier * 100)}%</p>
              </div>` : ''}
            </div>
            ${roofAnnualAdjustment ? `<p style="color: #808285; font-size: 13px; margin-top: 8px; font-style: italic;">${roofAnnualAdjustment}</p>` : ''}
            ${roofWarnings.length > 0 ? `<p style="color: #FF6B35; font-size: 13px; margin-top: 6px;">⚠ ${roofWarnings[0]}</p>` : ''}
          </div>` : `
          <!-- Why This Size (fallback when no roof data) -->
          <div class="card">
            <p style="font-family: 'Urbanist', sans-serif; font-size: 17px; color: #00EAD3; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; font-weight: 600;">WHY THIS SIZE?</p>
            <p style="color: #808285; font-size: 17px; line-height: 1.6;">The ${sizeKw}kW system is strategically sized to exceed your annual consumption, ensuring surplus generation for battery charging, VPP participation, and feed-in credits. This oversizing strategy maximises your return on investment while future-proofing for increased consumption (EV charging, heat pump hot water).</p>
          </div>`;
  
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
            <p style="color: #00EAD3; font-size: 17px; margin-top: 8px;">${panelConfig}</p>
          </div>
          <!-- Premium Hardware -->
          <div class="card">
            <p style="font-family: 'Urbanist', sans-serif; font-size: 17px; color: #00EAD3; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; font-weight: 600;">PREMIUM HARDWARE</p>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <p style="color: #808285; font-size: 17px;">✓ <span style="color: #00EAD3;">Panels:</span> ${c.panelBrand} ${c.panelWattage}W — Tier 1 manufacturer</p>
              <p style="color: #808285; font-size: 17px;">✓ <span style="color: #00EAD3;">Inverter:</span> ${c.inverterBrand} ${c.inverterSize}kW Hybrid</p>
              <p style="color: #808285; font-size: 17px;">✓ <span style="color: #00EAD3;">Warranty:</span> 25-year panel performance guarantee</p>
              <p style="color: #808285; font-size: 17px;">✓ <span style="color: #00EAD3;">Aesthetics:</span> All-black panels for premium appearance</p>
            </div>
          </div>
        </div>
        <!-- Right Column -->
        <div style="flex: 1; display: flex; flex-direction: column; gap: 20px;">
          <!-- Annual Production -->
          <div class="card" style="text-align: center; padding: 30px;">
            <p style="font-family: 'Urbanist', sans-serif; font-size: 17px; color: #00EAD3; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; font-weight: 600;">ANNUAL PRODUCTION</p>
            <p class="hero-num white" style="font-size: 64px;">${Math.round(annualProd).toLocaleString()} <span style="font-size: 24px;">KWH</span></p>
            <p class="lbl" style="margin-top: 8px;">ESTIMATED YEARLY GENERATION</p>
            <p style="color: #808285; font-size: 17px; margin-top: 12px;">This system is perfectly sized to cover your annual usage of ~${Math.round(annualUsage).toLocaleString()} kWh, delivering a <span style="color: #00EAD3; font-weight: 600;">${offset}% offset</span> of your consumption.</p>
          </div>
          ${roofProfileSection}
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
          <p style="font-family: 'Urbanist', sans-serif; font-size: 17px; color: #fff; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 12px; font-weight: 600;">EST. ANNUAL SAVINGS</p>
          <p style="color: #808285; font-size: 17px; margin-top: 8px;">Day 1 Bill Reduction: ${billRedPct}%</p>
        </div>
        <div class="card" style="flex: 1; text-align: center; padding: 40px;">
          <p class="hero-num aqua" style="font-size: 64px;">${Math.floor(payback)}-${Math.ceil(payback)}</p>
          <p style="font-family: 'Urbanist', sans-serif; font-size: 17px; color: #fff; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 12px; font-weight: 600;">YEAR PAYBACK</p>
          <p style="color: #808285; font-size: 17px; margin-top: 8px;">Tax-Free Return on Investment</p>
        </div>
      </div>
      <!-- Bottom Row: 3 metrics in dark maroon card -->
      <div style="background: rgba(0,234,211,0.05); border: 1px solid #00EAD3; padding: 40px; display: flex; justify-content: space-around;">
        <div style="text-align: center;">
          <p class="hero-num aqua" style="font-size: 48px;">${roi}%</p>
          <p style="font-family: 'Urbanist', sans-serif; font-size: 14px; color: #00EAD3; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 8px;">TOTAL ROI (25 YEARS)</p>
        </div>
        <div style="width: 1px; background: #444;"></div>
        <div style="text-align: center;">
          <p class="hero-num aqua" style="font-size: 48px;">${fmtCurrency(npv)}</p>
          <p style="font-family: 'Urbanist', sans-serif; font-size: 14px; color: #00EAD3; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 8px;">NET PRESENT VALUE</p>
        </div>
        <div style="width: 1px; background: #444;"></div>
        <div style="text-align: center;">
          <p class="hero-num aqua" style="font-size: 48px;">${irr}%</p>
          <p style="font-family: 'Urbanist', sans-serif; font-size: 14px; color: #00EAD3; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 8px;">INTERNAL RATE OF RETURN</p>
        </div>
      </div>
      <p style="color: #808285; font-size: 17px; font-style: italic; margin-top: 24px; text-align: center;">By leveraging battery storage for peak arbitrage and VPP participation, this system delivers returns that significantly exceed traditional investment vehicles.</p>
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
            <p style="font-family: 'Urbanist', sans-serif; font-size: 17px; color: #00EAD3; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 8px;">TOTAL REDUCTION</p>
            <p class="hero-num white" style="font-size: 96px;">${reductionPct}%</p>
          </div>
        </div>
        <!-- Right: 3 Equivalency Cards -->
        <div style="flex: 1; display: flex; flex-direction: column; gap: 20px; justify-content: center;">
          <div class="card" style="display: flex; align-items: center; gap: 20px;">
            <div style="width: 50px; height: 50px; background: #00EAD3; display: flex; align-items: center; justify-content: center; font-size: 24px;">🌲</div>
            <div>
              <p class="lbl">EQUIVALENT TO PLANTING</p>
              <p style="font-family: 'Urbanist', sans-serif; font-size: 22px; color: #fff; text-transform: uppercase; font-weight: 600;">~${trees} TREES ANNUALLY</p>
            </div>
          </div>
          <div class="card" style="display: flex; align-items: center; gap: 20px;">
            <div style="width: 50px; height: 50px; background: #00EAD3; display: flex; align-items: center; justify-content: center; font-size: 24px;">🚗</div>
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
// SLIDE: ELECTRICAL ASSESSMENT & SITE PHOTOS
// ============================================================
function genSiteAssessment(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const photos = (c.sitePhotos as Array<{ url: string; caption: string }>) || [];
  const solarKw = c.solarSizeKw as number || 0;
  const batteryKwh = c.batterySizeKwh as number || 0;
  const state = c.state as string || '';
  const existingSolar = c.existingSolar as string || 'none';
  const swb = c.switchboardAnalysis as ProposalData['switchboardAnalysis'] | undefined;
  
  // Build photo grid (up to 4 photos)
  const displayPhotos = photos.slice(0, 4);
  const photoWidth = displayPhotos.length <= 2 ? 420 : 320;
  const photoHeight = displayPhotos.length <= 2 ? 340 : 260;
  
  const photoGrid = displayPhotos.map(p => `
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="width: ${photoWidth}px; height: ${photoHeight}px; background: #222; border: 1px solid #333; overflow: hidden; display: flex; align-items: center; justify-content: center; position: relative;">
        <img src="${p.url}" style="width: 100%; height: 100%; object-fit: cover; image-orientation: from-image;" alt="Site Photo" loading="eager" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=&quot;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#808285;font-family:Urbanist,sans-serif;&quot;><svg width=&quot;48&quot; height=&quot;48&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;#808285&quot; stroke-width=&quot;1.5&quot;><rect x=&quot;3&quot; y=&quot;3&quot; width=&quot;18&quot; height=&quot;18&quot; rx=&quot;2&quot;/><circle cx=&quot;8.5&quot; cy=&quot;8.5&quot; r=&quot;1.5&quot;/><path d=&quot;M21 15l-5-5L5 21&quot;/></svg><p style=&quot;margin-top:12px;font-size: 15px;text-transform:uppercase;letter-spacing:0.1em;&quot;>Photo Loading</p></div>';" />
      </div>
      <p style="font-family: 'Urbanist', sans-serif; font-size: 15px; color: #808285; text-transform: uppercase; letter-spacing: 0.1em; text-align: center;">${p.caption}</p>
    </div>
  `).join('');
  
  // Installation readiness checklist
  const existingSolarLabel = existingSolar === 'none' ? 'New Installation' : existingSolar === 'under_5_years' ? 'Existing System (<5 yrs)' : 'Existing System (>5 yrs)';
  
  // Use real switchboard analysis data when available, fallback to generic labels
  const boardCondition = swb?.boardCondition || 'unknown';
  const conditionColor = boardCondition === 'good' ? '#00EAD3' : boardCondition === 'fair' ? '#F5A623' : boardCondition === 'poor' ? '#FF4444' : '#808285';
  const conditionLabel = boardCondition.toUpperCase();
  
  // Switchboard capacity line
  const swbCapacity = swb?.mainSwitchRating 
    ? `${swb.mainSwitchRating}A ${swb.mainSwitchType || 'MAIN SWITCH'}`.toUpperCase()
    : 'ASSESSED';
  
  // Circuit details
  const circuitInfo = swb?.totalCircuits 
    ? `${swb.usedCircuits || 0}/${swb.totalCircuits} CIRCUITS USED`
    : 'VERIFIED';
  
  // RCD status
  const rcdStatus = swb 
    ? (swb.hasRcd ? `${swb.rcdCount || 1} RCD PRESENT` : 'RCD REQUIRED')
    : 'REQUIRED';
  const rcdColor = swb?.hasRcd ? '#00EAD3' : '#F5A623';
  
  // Space assessment
  const spaceStatus = swb 
    ? (swb.hasSpaceForSolar && swb.hasSpaceForBattery ? 'SPACE AVAILABLE' : swb.hasSpaceForSolar ? 'SOLAR SPACE OK' : 'UPGRADE NEEDED')
    : `${state} COMPLIANT`;
  const spaceColor = (!swb || (swb.hasSpaceForSolar && swb.hasSpaceForBattery)) ? '#00EAD3' : '#F5A623';
  
  // Overall site status
  const upgradeNeeded = swb?.upgradeRequired || false;
  const siteStatus = upgradeNeeded ? 'UPGRADE REQUIRED' : 'READY FOR INSTALLATION';
  const siteStatusColor = upgradeNeeded ? '#F5A623' : '#00EAD3';
  
  // Warnings section — filter out "cannot assess" / "cannot see" notes when we have real analysis data,
  // and limit to 2 notes max to prevent overflow that hides the UPGRADE REQUIRED section
  const filteredWarnings = (swb?.warnings || []).filter(w => {
    // Remove generic "cannot assess" notes that come from low-quality meter photo analyses
    const lower = w.toLowerCase();
    if (lower.includes('cannot assess') && lower.includes('without a view')) return false;
    if (lower.includes('cannot see') && lower.includes('switchboard')) return false;
    return true;
  });
  const warningsHtml = filteredWarnings.length > 0 ? `
    <div class="card" style="border-color: #F5A623;">
      <p class="lbl" style="color: #F5A623;">INSPECTOR NOTES</p>
      <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 6px;">
        ${filteredWarnings.slice(0, 2).map(w => `
          <p style="color: #ccc; font-size: 14px; line-height: 1.35;">• ${w}</p>
        `).join('')}
      </div>
    </div>
  ` : '';
  
  return `
    <div class="slide">
      ${slideNum(slide.id)}
      ${logoBR()}
      ${altHeader(slide.title, c.headerRight as string || 'Installation Readiness', existingSolarLabel.toUpperCase())}
      <div style="display: flex; gap: 60px;">
        <!-- Left: Site Photos -->
        <div style="flex: 1.2; display: flex; flex-direction: column; gap: 16px;">
          <p style="font-family: 'Urbanist', sans-serif; font-size: 17px; color: #fff; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">SITE INSPECTION PHOTOS</p>
          <div style="display: flex; flex-wrap: wrap; gap: 16px;">
            ${photoGrid}
          </div>
        </div>
        <!-- Right: Assessment Summary -->
        <div style="flex: 0.8; display: flex; flex-direction: column; gap: 16px;">
          <p style="font-family: 'Urbanist', sans-serif; font-size: 17px; color: #fff; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">INSTALLATION REQUIREMENTS</p>
          <div class="card">
            <p class="lbl">PROPOSED SYSTEM</p>
            <p style="color: #00EAD3; font-family: 'GeneralSans', sans-serif; font-size: 28px; font-weight: 700;">${solarKw}kW Solar</p>
            <p style="color: #fff; font-family: 'GeneralSans', sans-serif; font-size: 22px; font-weight: 600; margin-top: 4px;">${batteryKwh}kWh Battery</p>
          </div>
          <div class="card">
            <p class="lbl">SWITCHBOARD INSPECTION</p>
            <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #808285; font-size: 16px;">Board Condition</span>
                <span style="color: ${conditionColor}; font-size: 16px; font-weight: 600;">${conditionLabel}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #808285; font-size: 16px;">Main Switch</span>
                <span style="color: #00EAD3; font-size: 16px; font-weight: 600;">${swbCapacity}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #808285; font-size: 16px;">Circuit Configuration</span>
                <span style="color: #00EAD3; font-size: 16px; font-weight: 600;">${circuitInfo}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #808285; font-size: 16px;">Safety Switches (RCD)</span>
                <span style="color: ${rcdColor}; font-size: 16px; font-weight: 600;">${rcdStatus}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #808285; font-size: 16px;">Installation Space</span>
                <span style="color: ${spaceColor}; font-size: 16px; font-weight: 600;">${spaceStatus}</span>
              </div>
            </div>
          </div>
          ${warningsHtml}
          <div class="card aqua-b" style="text-align: center; padding: 16px; border-color: ${siteStatusColor};">
            <p style="font-family: 'Urbanist', sans-serif; font-size: 14px; color: ${siteStatusColor}; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 4px;">SITE STATUS</p>
            <p style="font-family: 'GeneralSans', sans-serif; font-size: 22px; color: #fff; font-weight: 700;">${siteStatus}</p>
            ${upgradeNeeded && swb?.upgradeReason ? `<p style="font-family: 'GeneralSans', sans-serif; font-size: 13px; color: #ccc; margin-top: 6px; line-height: 1.3;">${swb.upgradeReason}</p>` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// SLIDE 15: SCOPE OF ELECTRICAL WORKS (Pre/Post Installation)
// ============================================================
function genScopeOfWorks(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const swb = c.switchboardAnalysis as ProposalData['switchboardAnalysis'] | undefined;
  const cableRun = c.cableRunAnalysis as ProposalData['cableRunAnalysis'] | undefined;
  const cableSizing = c.cableSizing as ProposalData['cableSizing'] | undefined;
  const solarKw = c.solarSizeKw as number || 0;
  const batteryKwh = c.batterySizeKwh as number || 0;
  const inverterBrand = c.inverterBrand as string || 'Hybrid Inverter';
  const inverterSizeKw = c.inverterSizeKw as number || 0;
  const batteryBrand = c.batteryBrand as string || 'Battery';

  if (!swb) return genGeneric(slide);

  // Phase configuration
  const phaseLabel = swb.phaseConfiguration === 'single' ? 'SINGLE PHASE' : swb.phaseConfiguration === 'three' ? 'THREE PHASE' : 'UNKNOWN';
  const phaseColor = swb.phaseConfiguration !== 'unknown' ? '#00EAD3' : '#F5A623';
  const phaseSource = swb.phaseConfirmationSource || 'Visual inspection';

  // Metering — prefer dedicated meter analysis over switchboard-derived data
  const meter = c.meterAnalysis as ProposalData['meterAnalysis'] | undefined;
  const meterLabel = meter?.meterType || swb.meterType || 'Unknown';
  const meterBiDi = (meter?.isBidirectional ?? swb.meterIsBidirectional) === true ? 'YES' : (meter?.isBidirectional ?? swb.meterIsBidirectional) === false ? 'NO' : 'UNKNOWN';
  const meterBiDiColor = (meter?.isBidirectional ?? swb.meterIsBidirectional) === true ? '#00EAD3' : (meter?.isBidirectional ?? swb.meterIsBidirectional) === false ? '#F5A623' : '#808285';
  const meterSwapNeeded = meter?.meterSwapRequired ?? swb.meterSwapRequired;
  const meterSwapLabel = meterSwapNeeded ? 'REQUIRED' : 'NOT REQUIRED';
  const meterSwapColor = meterSwapNeeded ? '#F5A623' : '#00EAD3';
  const meterNumber = meter?.meterNumber || null;
  const meterNmi = meter?.nmi || null;
  const meterBrand = meter?.meterBrand || null;
  const meterModel = meter?.meterModel || null;
  const meterSwapReason = meter?.meterSwapReason || swb.meterNotes || null;

  // Cable assessment
  const cableAdequate = swb.existingCableSizeAdequate === true ? 'ADEQUATE' : swb.existingCableSizeAdequate === false ? 'UPGRADE NEEDED' : 'TO BE ASSESSED';
  const cableColor = swb.existingCableSizeAdequate === true ? '#00EAD3' : swb.existingCableSizeAdequate === false ? '#F5A623' : '#808285';

  // Build PRE board layout (current state)
  const currentBreakers = (swb.circuitBreakers || []).slice(0, 12);
  const preBoard = currentBreakers.length > 0 ? currentBreakers.map(cb => `
    <div style="display: flex; align-items: center; gap: 6px; padding: 3px 0;">
      <div style="width: 20px; height: 20px; background: ${cb.isUsed ? '#333' : '#1a1a1a'}; border: 1px solid ${cb.isUsed ? '#555' : '#333'}; border-radius: 2px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 10px; color: ${cb.isUsed ? '#ccc' : '#555'};">${cb.position}</span>
      </div>
      <span style="font-size: 12px; color: ${cb.isUsed ? '#ccc' : '#555'}; font-family: 'Urbanist', sans-serif;">${cb.rating}A ${cb.type}</span>
      <span style="font-size: 11px; color: #808285; margin-left: auto; max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${cb.label || (cb.isUsed ? 'In Use' : 'Empty')}</span>
    </div>
  `).join('') : `
    <div style="padding: 8px 0;">
      <p style="color: #808285; font-size: 13px;">Main Switch: ${swb.mainSwitchRating || '?'}A ${swb.mainSwitchType || ''}</p>
      <p style="color: #808285; font-size: 13px; margin-top: 4px;">${swb.usedCircuits || '?'}/${swb.totalCircuits || '?'} circuits used</p>
      <p style="color: #808285; font-size: 13px; margin-top: 4px;">${swb.availableCircuits || '?'} positions available</p>
    </div>
  `;

  // Build POST board layout (proposed additions)
  const solarPos = swb.proposedSolarBreakerPosition;
  const batteryPos = swb.proposedBatteryBreakerPosition;
  const solarBreaker = swb.proposedSolarBreakerRating || `32A MCB`;
  const batteryBreaker = swb.proposedBatteryBreakerRating || `32A MCB`;

  const postAdditions = `
    <div style="display: flex; flex-direction: column; gap: 4px;">
      <div style="display: flex; align-items: center; gap: 6px; padding: 3px 0;">
        <div style="width: 20px; height: 20px; background: rgba(0,234,211,0.15); border: 2px solid #00EAD3; border-radius: 2px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 10px; color: #00EAD3; font-weight: 700;">+</span>
        </div>
        <span style="font-size: 12px; color: #00EAD3; font-family: 'Urbanist', sans-serif; font-weight: 600;">${solarBreaker}</span>
        <span style="font-size: 11px; color: #00EAD3; margin-left: auto;">Solar PV${solarPos ? ` (Pos ${solarPos})` : ''}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 6px; padding: 3px 0;">
        <div style="width: 20px; height: 20px; background: rgba(0,234,211,0.15); border: 2px solid #00EAD3; border-radius: 2px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 10px; color: #00EAD3; font-weight: 700;">+</span>
        </div>
        <span style="font-size: 12px; color: #00EAD3; font-family: 'Urbanist', sans-serif; font-weight: 600;">${batteryBreaker}</span>
        <span style="font-size: 11px; color: #00EAD3; margin-left: auto;">Battery${batteryPos ? ` (Pos ${batteryPos})` : ''}</span>
      </div>
      ${swb.proposedAcIsolatorLocation ? `
      <div style="display: flex; align-items: center; gap: 6px; padding: 3px 0;">
        <div style="width: 20px; height: 20px; background: rgba(0,234,211,0.15); border: 2px solid #00EAD3; border-radius: 2px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 10px; color: #00EAD3; font-weight: 700;">+</span>
        </div>
        <span style="font-size: 12px; color: #00EAD3; font-family: 'Urbanist', sans-serif; font-weight: 600;">AC Isolator</span>
        <span style="font-size: 11px; color: #00EAD3; margin-left: auto;">${swb.proposedAcIsolatorLocation}</span>
      </div>` : ''}
      ${swb.proposedDcIsolatorLocation ? `
      <div style="display: flex; align-items: center; gap: 6px; padding: 3px 0;">
        <div style="width: 20px; height: 20px; background: rgba(245,166,35,0.15); border: 2px solid #F5A623; border-radius: 2px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 10px; color: #F5A623; font-weight: 700;">+</span>
        </div>
        <span style="font-size: 12px; color: #F5A623; font-family: 'Urbanist', sans-serif; font-weight: 600;">DC Isolator</span>
        <span style="font-size: 11px; color: #F5A623; margin-left: auto;">${swb.proposedDcIsolatorLocation}</span>
      </div>` : ''}
    </div>
  `;

  // Scope of works items + total cost calculation
  const scopeItems = (swb.upgradeScope || []).slice(0, 6);
  // Calculate total estimated cost range
  let totalCostHtml = '';
  try {
    const totalCost = calculateTotalCostRange(scopeItems);
    if (totalCost) {
      totalCostHtml = `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-top: 2px solid #00EAD3; margin-top: 8px;">
          <span style="font-size: 14px; color: #00EAD3; font-weight: 700; font-family: 'Urbanist', sans-serif; letter-spacing: 0.05em;">ESTIMATED TOTAL</span>
          <span style="font-size: 18px; color: #00EAD3; font-weight: 700; font-family: 'GeneralSans', sans-serif;">${totalCost.formatted}</span>
        </div>
        <p style="font-size: 10px; color: #555; font-style: italic; margin-top: 4px;">Estimates based on standard Australian electrical contractor rates. Final pricing subject to site inspection.</p>
      `;
    }
  } catch (e) { /* fallback: no total */ }
  const scopeHtml = scopeItems.length > 0 ? scopeItems.map(item => {
    const priorityColor = item.priority === 'required' ? '#FF4444' : item.priority === 'recommended' ? '#F5A623' : '#00EAD3';
    const priorityLabel = item.priority.toUpperCase();
    return `
      <div style="display: flex; gap: 10px; align-items: flex-start; padding: 6px 0; border-bottom: 1px solid #222;">
        <span style="font-size: 11px; color: ${priorityColor}; font-weight: 700; min-width: 90px; font-family: 'Urbanist', sans-serif; letter-spacing: 0.05em;">${priorityLabel}</span>
        <div style="flex: 1;">
          <p style="font-size: 14px; color: #fff; font-weight: 600; font-family: 'Urbanist', sans-serif;">${item.item}</p>
          <p style="font-size: 12px; color: #808285; margin-top: 2px;">${item.detail}</p>
        </div>
        ${item.estimatedCost ? `<span style="font-size: 13px; color: #F5A623; font-weight: 600; font-family: 'GeneralSans', sans-serif; white-space: nowrap; min-width: 80px; text-align: right;">${item.estimatedCost}</span>` : ''}
      </div>
    `;
  }).join('') : `
    <div style="padding: 8px 0;">
      <p style="color: #00EAD3; font-size: 14px; font-weight: 600;">No additional upgrades identified</p>
      <p style="color: #808285; font-size: 12px; margin-top: 4px;">Board is ready for solar + battery installation</p>
    </div>
  `;

  return `
    <div class="slide">
      ${slideNum(slide.id)}
      ${logoBR()}
      ${altHeader(slide.title, c.headerRight as string || 'Installer Assessment', phaseLabel)}
      <div style="display: flex; gap: 40px;">
        <!-- Left Column: Pre/Post Board Layout -->
        <div style="flex: 1; display: flex; flex-direction: column; gap: 16px;">
          <!-- PRE-INSTALLATION -->
          <div class="card" style="padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <p style="font-family: 'Urbanist', sans-serif; font-size: 14px; color: #F5A623; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">CURRENT BOARD LAYOUT</p>
              <span style="font-size: 12px; color: #808285;">${swb.mainSwitchRating || '?'}A ${swb.mainSwitchType || 'Main'}</span>
            </div>
            ${preBoard}
          </div>
          <!-- Cable Run Photo -->
          ${cableRun?.photoUrl ? `
          <div class="card" style="padding: 10px;">
            <p style="font-family: 'Urbanist', sans-serif; font-size: 11px; color: #F5A623; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; margin-bottom: 6px;">CABLE RUN — ${cableRun.cableRunDistanceMetres ? cableRun.cableRunDistanceMetres.toFixed(1) + 'm' : 'MEASURED'}</p>
            <img src="${cableRun.photoUrl}" style="width: 100%; max-height: 120px; object-fit: contain; border-radius: 4px;" />
          </div>` : ''}
          <!-- POST-INSTALLATION -->
          <div class="card" style="padding: 16px; border-color: #00EAD3;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <p style="font-family: 'Urbanist', sans-serif; font-size: 14px; color: #00EAD3; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">PROPOSED ADDITIONS</p>
              <span style="font-size: 12px; color: #00EAD3;">${solarKw}kW + ${batteryKwh}kWh</span>
            </div>
            ${postAdditions}
          </div>
        </div>

        <!-- Right Column: Assessment Details + Scope -->
        <div style="flex: 1.2; display: flex; flex-direction: column; gap: 16px;">
          <!-- Phase + Metering + Cable Row -->
          <div style="display: flex; gap: 12px;">
            <div class="card" style="flex: 1; padding: 14px;">
              <p class="lbl" style="font-size: 11px;">PHASE CONFIG</p>
              <p style="color: ${phaseColor}; font-size: 18px; font-weight: 700; font-family: 'GeneralSans', sans-serif;">${phaseLabel}</p>
              <p style="color: #808285; font-size: 11px; margin-top: 4px;">${phaseSource}</p>
            </div>
            <div class="card" style="flex: 1; padding: 14px;">
              <p class="lbl" style="font-size: 11px;">METERING</p>
              <p style="color: ${meterBiDiColor}; font-size: 14px; font-weight: 600;">Bi-Di: ${meterBiDi}</p>
              <p style="color: ${meterSwapColor}; font-size: 12px; margin-top: 4px;">Swap: ${meterSwapLabel}</p>
              ${meterNumber ? `<p style="color: #808285; font-size: 10px; margin-top: 4px;">Meter #${meterNumber}</p>` : ''}
              ${meterNmi ? `<p style="color: #808285; font-size: 10px; margin-top: 2px;">NMI: ${meterNmi}</p>` : ''}
              ${meterBrand || meterModel ? `<p style="color: #808285; font-size: 10px; margin-top: 2px;">${[meterBrand, meterModel].filter(Boolean).join(' ')}</p>` : ''}
              ${meterSwapReason ? `<p style="color: #808285; font-size: 10px; margin-top: 2px; font-style: italic;">${meterSwapReason.substring(0, 60)}${meterSwapReason.length > 60 ? '...' : ''}</p>` : ''}
            </div>
            <div class="card" style="flex: 1; padding: 14px;">
              <p class="lbl" style="font-size: 11px;">CABLE RUN</p>
              ${cableRun?.cableRunDistanceMetres ? `
                <p style="color: #00EAD3; font-size: 18px; font-weight: 700; font-family: 'GeneralSans', sans-serif;">${cableRun.cableRunDistanceMetres.toFixed(1)}m</p>
                <p style="color: #808285; font-size: 11px; margin-top: 4px;">${cableRun.installationMethod || 'Measured'}</p>
              ` : `
                <p style="color: ${cableColor}; font-size: 14px; font-weight: 600;">${cableAdequate}</p>
                ${swb.cableAssessment ? `<p style="color: #808285; font-size: 11px; margin-top: 4px;">${swb.cableAssessment.substring(0, 80)}${swb.cableAssessment.length > 80 ? '...' : ''}</p>` : ''}
              `}
            </div>
          </div>

          <!-- Cable Sizing Reference Table (AS/NZS 3008.1.1) -->
          ${cableSizing ? `
          <div class="card" style="padding: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <p style="font-family: 'Urbanist', sans-serif; font-size: 13px; color: #00EAD3; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">CABLE SIZING — AS/NZS 3008.1.1</p>
              <span style="font-size: 11px; color: #808285;">${cableSizing.phaseConfig === 'single' ? '1Ø' : '3Ø'} ${cableSizing.inverterSizeKw}kW</span>
            </div>
            <div style="display: flex; gap: 10px; margin-bottom: 8px;">
              <div style="flex: 1; background: rgba(0,234,211,0.08); border-radius: 4px; padding: 8px;">
                <p style="font-size: 10px; color: #808285; text-transform: uppercase; letter-spacing: 0.05em;">AC CABLE</p>
                <p style="font-size: 16px; color: #00EAD3; font-weight: 700; font-family: 'GeneralSans', sans-serif;">${cableSizing.acCableSize}</p>
                <p style="font-size: 10px; color: #808285;">${cableSizing.acCableType}</p>
              </div>
              <div style="flex: 1; background: rgba(0,234,211,0.08); border-radius: 4px; padding: 8px;">
                <p style="font-size: 10px; color: #808285; text-transform: uppercase; letter-spacing: 0.05em;">DC CABLE</p>
                <p style="font-size: 16px; color: #00EAD3; font-weight: 700; font-family: 'GeneralSans', sans-serif;">${cableSizing.dcCableSize}</p>
                <p style="font-size: 10px; color: #808285;">${cableSizing.dcCableType}</p>
              </div>
              <div style="flex: 1; background: rgba(0,234,211,0.08); border-radius: 4px; padding: 8px;">
                <p style="font-size: 10px; color: #808285; text-transform: uppercase; letter-spacing: 0.05em;">EARTH</p>
                <p style="font-size: 16px; color: #00EAD3; font-weight: 700; font-family: 'GeneralSans', sans-serif;">${cableSizing.earthCableSize}</p>
                <p style="font-size: 10px; color: #808285;">Cu Earth</p>
              </div>
              ${cableSizing.batteryCableSize ? `
              <div style="flex: 1; background: rgba(245,166,35,0.08); border-radius: 4px; padding: 8px;">
                <p style="font-size: 10px; color: #808285; text-transform: uppercase; letter-spacing: 0.05em;">BATTERY</p>
                <p style="font-size: 16px; color: #F5A623; font-weight: 700; font-family: 'GeneralSans', sans-serif;">${cableSizing.batteryCableSize}</p>
                <p style="font-size: 10px; color: #808285;">${cableSizing.batteryCableType || 'Battery Cable'}</p>
              </div>` : ''}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <p style="font-size: 11px; color: ${cableSizing.acVoltageDropCompliant ? '#00EAD3' : '#FF4444'}; font-weight: 600;">V-Drop: ${cableSizing.acVoltageDrop.toFixed(1)}% ${cableSizing.acVoltageDropCompliant ? '✓ COMPLIANT' : '✗ EXCEEDS LIMIT'}</p>
              <p style="font-size: 10px; color: #808285;">Run: ${cableSizing.runDistanceMetres}m</p>
            </div>
            ${cableSizing.referenceTable && cableSizing.referenceTable.length > 0 ? `
            <div style="margin-top: 8px; border-top: 1px solid #222; padding-top: 6px;">
              <p style="font-size: 10px; color: #808285; margin-bottom: 4px;">DISTANCE REFERENCE:</p>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                ${cableSizing.referenceTable.map(r => `
                  <div style="background: ${r.compliant ? 'rgba(0,234,211,0.06)' : 'rgba(255,68,68,0.06)'}; border: 1px solid ${r.compliant ? '#333' : '#442222'}; border-radius: 3px; padding: 3px 8px;">
                    <span style="font-size: 10px; color: ${r.compliant ? '#ccc' : '#FF4444'};">${r.distanceRange}: ${r.recommendedCable} (${r.voltageDropPercent.toFixed(1)}%)</span>
                  </div>
                `).join('')}
              </div>
            </div>` : ''}
            <p style="font-size: 9px; color: #555; margin-top: 6px; font-style: italic;">${cableSizing.disclaimer}</p>
          </div>` : ''}

          <!-- Scope of Electrical Works -->
          <div class="card" style="flex: 1; padding: 16px;">
            <p style="font-family: 'Urbanist', sans-serif; font-size: 14px; color: #fff; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; margin-bottom: 12px;">SCOPE OF ELECTRICAL WORKS</p>
            <div style="display: flex; flex-direction: column;">
              ${scopeHtml}
            </div>
            ${totalCostHtml}
          </div>

          <!-- System being installed summary -->
          <div class="card aqua-b" style="padding: 14px; text-align: center;">
            <p style="font-family: 'Urbanist', sans-serif; font-size: 12px; color: #00EAD3; text-transform: uppercase; letter-spacing: 0.1em;">SYSTEM TO BE INSTALLED</p>
            <p style="font-family: 'GeneralSans', sans-serif; font-size: 18px; color: #fff; font-weight: 700; margin-top: 4px;">${solarKw}kW ${inverterBrand} + ${batteryKwh}kWh ${batteryBrand}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// SCOPE OF WORKS — PAGE 1: Board Layout + Assessment Cards
// ============================================================
function genScopeOfWorks1(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const swb = c.switchboardAnalysis as ProposalData['switchboardAnalysis'] | undefined;
  const cableRun = c.cableRunAnalysis as ProposalData['cableRunAnalysis'] | undefined;
  const solarKw = c.solarSizeKw as number || 0;
  const batteryKwh = c.batterySizeKwh as number || 0;

  if (!swb) return genGeneric(slide);

  // Phase configuration
  const phaseLabel = swb.phaseConfiguration === 'single' ? 'SINGLE PHASE' : swb.phaseConfiguration === 'three' ? 'THREE PHASE' : 'UNKNOWN';
  const phaseColor = swb.phaseConfiguration !== 'unknown' ? '#00EAD3' : '#F5A623';
  const phaseSource = swb.phaseConfirmationSource || 'Visual inspection';

  // Metering
  const meter = c.meterAnalysis as ProposalData['meterAnalysis'] | undefined;
  const meterLabel = meter?.meterType || swb.meterType || 'Unknown';
  const meterBiDi = (meter?.isBidirectional ?? swb.meterIsBidirectional) === true ? 'YES' : (meter?.isBidirectional ?? swb.meterIsBidirectional) === false ? 'NO' : 'UNKNOWN';
  const meterBiDiColor = (meter?.isBidirectional ?? swb.meterIsBidirectional) === true ? '#00EAD3' : (meter?.isBidirectional ?? swb.meterIsBidirectional) === false ? '#F5A623' : '#808285';
  const meterSwapNeeded = meter?.meterSwapRequired ?? swb.meterSwapRequired;
  const meterSwapLabel = meterSwapNeeded ? 'REQUIRED' : 'NOT REQUIRED';
  const meterSwapColor = meterSwapNeeded ? '#F5A623' : '#00EAD3';
  const meterNumber = meter?.meterNumber || null;
  const meterNmi = meter?.nmi || null;
  const meterBrand = meter?.meterBrand || null;
  const meterModel = meter?.meterModel || null;
  const meterSwapReason = meter?.meterSwapReason || swb.meterNotes || null;

  // Cable assessment
  const cableAdequate = swb.existingCableSizeAdequate === true ? 'ADEQUATE' : swb.existingCableSizeAdequate === false ? 'UPGRADE NEEDED' : 'TO BE ASSESSED';
  const cableColor = swb.existingCableSizeAdequate === true ? '#00EAD3' : swb.existingCableSizeAdequate === false ? '#F5A623' : '#808285';

  // Build PRE board layout
  const currentBreakers = (swb.circuitBreakers || []).slice(0, 12);
  const preBoard = currentBreakers.length > 0 ? currentBreakers.map(cb => `
    <div style="display: flex; align-items: center; gap: 6px; padding: 3px 0;">
      <div style="width: 20px; height: 20px; background: ${cb.isUsed ? '#333' : '#1a1a1a'}; border: 1px solid ${cb.isUsed ? '#555' : '#333'}; border-radius: 2px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 10px; color: ${cb.isUsed ? '#ccc' : '#555'};">${cb.position}</span>
      </div>
      <span style="font-size: 12px; color: ${cb.isUsed ? '#ccc' : '#555'}; font-family: 'Urbanist', sans-serif;">${cb.rating}A ${cb.type}</span>
      <span style="font-size: 11px; color: #808285; margin-left: auto; max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${cb.label || (cb.isUsed ? 'In Use' : 'Empty')}</span>
    </div>
  `).join('') : `
    <div style="padding: 8px 0;">
      <p style="color: #808285; font-size: 13px;">Main Switch: ${swb.mainSwitchRating || '?'}A ${swb.mainSwitchType || ''}</p>
      <p style="color: #808285; font-size: 13px; margin-top: 4px;">${swb.usedCircuits || '?'}/${swb.totalCircuits || '?'} circuits used</p>
      <p style="color: #808285; font-size: 13px; margin-top: 4px;">${swb.availableCircuits || '?'} positions available</p>
    </div>
  `;

  // Build POST board layout
  const solarPos = swb.proposedSolarBreakerPosition;
  const batteryPos = swb.proposedBatteryBreakerPosition;
  const solarBreaker = swb.proposedSolarBreakerRating || '32A MCB';
  const batteryBreaker = swb.proposedBatteryBreakerRating || '32A MCB';

  const postAdditions = `
    <div style="display: flex; flex-direction: column; gap: 4px;">
      <div style="display: flex; align-items: center; gap: 6px; padding: 3px 0;">
        <div style="width: 20px; height: 20px; background: rgba(0,234,211,0.15); border: 2px solid #00EAD3; border-radius: 2px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 10px; color: #00EAD3; font-weight: 700;">+</span>
        </div>
        <span style="font-size: 12px; color: #00EAD3; font-family: 'Urbanist', sans-serif; font-weight: 600;">${solarBreaker}</span>
        <span style="font-size: 11px; color: #00EAD3; margin-left: auto;">Solar PV${solarPos ? ` (Pos ${solarPos})` : ''}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 6px; padding: 3px 0;">
        <div style="width: 20px; height: 20px; background: rgba(0,234,211,0.15); border: 2px solid #00EAD3; border-radius: 2px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 10px; color: #00EAD3; font-weight: 700;">+</span>
        </div>
        <span style="font-size: 12px; color: #00EAD3; font-family: 'Urbanist', sans-serif; font-weight: 600;">${batteryBreaker}</span>
        <span style="font-size: 11px; color: #00EAD3; margin-left: auto;">Battery${batteryPos ? ` (Pos ${batteryPos})` : ''}</span>
      </div>
      ${swb.proposedAcIsolatorLocation ? `
      <div style="display: flex; align-items: center; gap: 6px; padding: 3px 0;">
        <div style="width: 20px; height: 20px; background: rgba(0,234,211,0.15); border: 2px solid #00EAD3; border-radius: 2px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 10px; color: #00EAD3; font-weight: 700;">+</span>
        </div>
        <span style="font-size: 12px; color: #00EAD3; font-family: 'Urbanist', sans-serif; font-weight: 600;">AC Isolator</span>
        <span style="font-size: 11px; color: #00EAD3; margin-left: auto;">${swb.proposedAcIsolatorLocation}</span>
      </div>` : ''}
      ${swb.proposedDcIsolatorLocation ? `
      <div style="display: flex; align-items: center; gap: 6px; padding: 3px 0;">
        <div style="width: 20px; height: 20px; background: rgba(245,166,35,0.15); border: 2px solid #F5A623; border-radius: 2px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 10px; color: #F5A623; font-weight: 700;">+</span>
        </div>
        <span style="font-size: 12px; color: #F5A623; font-family: 'Urbanist', sans-serif; font-weight: 600;">DC Isolator</span>
        <span style="font-size: 11px; color: #F5A623; margin-left: auto;">${swb.proposedDcIsolatorLocation}</span>
      </div>` : ''}
    </div>
  `;

  // Site status
  const upgradeRequired = swb.upgradeRequired;
  const statusColor = upgradeRequired ? '#F5A623' : '#00EAD3';
  const statusLabel = upgradeRequired ? 'UPGRADE REQUIRED' : 'INSTALLATION READY';

  // Inspector notes
  const inspectorNotes = ((swb as any).notes || []).slice(0, 3) as string[];
  const warnings = ((swb as any).warnings || []).slice(0, 2) as string[];

  return `
    <div class="slide">
      ${slideNum(slide.id)}
      ${logoBR()}
      ${altHeader(slide.title, c.headerRight as string || 'Installer Assessment', phaseLabel)}
      <div style="display: flex; gap: 40px;">
        <!-- Left Column: Pre/Post Board Layout -->
        <div style="flex: 1; display: flex; flex-direction: column; gap: 16px;">
          <!-- PRE-INSTALLATION -->
          <div class="card" style="padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <p style="font-family: 'Urbanist', sans-serif; font-size: 14px; color: #F5A623; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">CURRENT BOARD LAYOUT</p>
              <span style="font-size: 12px; color: #808285;">${swb.mainSwitchRating || '?'}A ${swb.mainSwitchType || 'Main'}</span>
            </div>
            ${preBoard}
          </div>
          <!-- Cable Run Photo -->
          ${cableRun?.photoUrl ? `
          <div class="card" style="padding: 10px;">
            <p style="font-family: 'Urbanist', sans-serif; font-size: 11px; color: #F5A623; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; margin-bottom: 6px;">CABLE RUN — ${cableRun.cableRunDistanceMetres ? cableRun.cableRunDistanceMetres.toFixed(1) + 'm' : 'MEASURED'}</p>
            <img src="${cableRun.photoUrl}" style="width: 100%; max-height: 120px; object-fit: contain; border-radius: 4px;" />
          </div>` : ''}
          <!-- POST-INSTALLATION -->
          <div class="card" style="padding: 16px; border-color: #00EAD3;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <p style="font-family: 'Urbanist', sans-serif; font-size: 14px; color: #00EAD3; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">PROPOSED ADDITIONS</p>
              <span style="font-size: 12px; color: #00EAD3;">${solarKw}kW + ${batteryKwh}kWh</span>
            </div>
            ${postAdditions}
          </div>
        </div>

        <!-- Right Column: Assessment Cards + Site Status -->
        <div style="flex: 1.2; display: flex; flex-direction: column; gap: 16px;">
          <!-- Phase + Metering + Cable Row -->
          <div style="display: flex; gap: 12px;">
            <div class="card" style="flex: 1; padding: 14px;">
              <p class="lbl" style="font-size: 11px;">PHASE CONFIG</p>
              <p style="color: ${phaseColor}; font-size: 18px; font-weight: 700; font-family: 'GeneralSans', sans-serif;">${phaseLabel}</p>
              <p style="color: #808285; font-size: 11px; margin-top: 4px;">${phaseSource}</p>
            </div>
            <div class="card" style="flex: 1; padding: 14px;">
              <p class="lbl" style="font-size: 11px;">METERING</p>
              <p style="color: ${meterBiDiColor}; font-size: 14px; font-weight: 600;">Bi-Di: ${meterBiDi}</p>
              <p style="color: ${meterSwapColor}; font-size: 12px; margin-top: 4px;">Swap: ${meterSwapLabel}</p>
              ${meterNumber ? `<p style="color: #808285; font-size: 10px; margin-top: 4px;">Meter #${meterNumber}</p>` : ''}
              ${meterNmi ? `<p style="color: #808285; font-size: 10px; margin-top: 2px;">NMI: ${meterNmi}</p>` : ''}
              ${meterBrand || meterModel ? `<p style="color: #808285; font-size: 10px; margin-top: 2px;">${[meterBrand, meterModel].filter(Boolean).join(' ')}</p>` : ''}
              ${meterSwapReason ? `<p style="color: #808285; font-size: 10px; margin-top: 2px; font-style: italic;">${meterSwapReason.substring(0, 60)}${meterSwapReason.length > 60 ? '...' : ''}</p>` : ''}
            </div>
            <div class="card" style="flex: 1; padding: 14px;">
              <p class="lbl" style="font-size: 11px;">CABLE RUN</p>
              ${cableRun?.cableRunDistanceMetres ? `
                <p style="color: #00EAD3; font-size: 18px; font-weight: 700; font-family: 'GeneralSans', sans-serif;">${cableRun.cableRunDistanceMetres.toFixed(1)}m</p>
                <p style="color: #808285; font-size: 11px; margin-top: 4px;">${cableRun.installationMethod || 'Measured'}</p>
              ` : `
                <p style="color: ${cableColor}; font-size: 14px; font-weight: 600;">${cableAdequate}</p>
                ${swb.cableAssessment ? `<p style="color: #808285; font-size: 11px; margin-top: 4px;">${swb.cableAssessment.substring(0, 80)}${swb.cableAssessment.length > 80 ? '...' : ''}</p>` : ''}
              `}
            </div>
          </div>

          <!-- Inspector Notes -->
          ${inspectorNotes.length > 0 || warnings.length > 0 ? `
          <div class="card" style="padding: 16px; flex: 1;">
            <p style="font-family: 'Urbanist', sans-serif; font-size: 14px; color: #00EAD3; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; margin-bottom: 12px;">INSPECTOR NOTES</p>
            ${warnings.map(w => `
              <div style="display: flex; gap: 8px; align-items: flex-start; padding: 6px 0; border-bottom: 1px solid #222;">
                <span style="color: #FF4444; font-size: 14px; min-width: 16px;">&#9888;</span>
                <p style="font-size: 13px; color: #FF4444; line-height: 1.5;">${w}</p>
              </div>
            `).join('')}
            ${inspectorNotes.map((n: string) => `
              <div style="display: flex; gap: 8px; align-items: flex-start; padding: 6px 0; border-bottom: 1px solid #222;">
                <span style="color: #808285; font-size: 14px; min-width: 16px;">&#8226;</span>
                <p style="font-size: 13px; color: #999; line-height: 1.5;">${n}</p>
              </div>
            `).join('')}
          </div>` : ''}

          <!-- Site Status -->
          <div class="card" style="padding: 20px; text-align: center; border-color: ${statusColor};">
            <p style="font-family: 'Urbanist', sans-serif; font-size: 12px; color: ${statusColor}; text-transform: uppercase; letter-spacing: 0.15em;">SITE STATUS</p>
            <p style="font-family: 'GeneralSans', sans-serif; font-size: 22px; color: #fff; font-weight: 700; margin-top: 6px;">${statusLabel}</p>
            ${swb.upgradeReason ? `<p style="font-size: 12px; color: #808285; margin-top: 8px; line-height: 1.5;">${swb.upgradeReason.substring(0, 150)}${swb.upgradeReason.length > 150 ? '...' : ''}</p>` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// SCOPE OF WORKS — PAGE 2: Scope Items + Costs + Cable Sizing
// ============================================================
function genScopeOfWorks2(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const swb = c.switchboardAnalysis as ProposalData['switchboardAnalysis'] | undefined;
  const cableRun = c.cableRunAnalysis as ProposalData['cableRunAnalysis'] | undefined;
  const cableSizing = c.cableSizing as ProposalData['cableSizing'] | undefined;
  const solarKw = c.solarSizeKw as number || 0;
  const batteryKwh = c.batterySizeKwh as number || 0;
  const inverterBrand = c.inverterBrand as string || 'Hybrid Inverter';
  const inverterSizeKw = c.inverterSizeKw as number || 0;
  const batteryBrand = c.batteryBrand as string || 'Battery';

  if (!swb) return genGeneric(slide);

  // Phase label for header
  const phaseLabel = swb.phaseConfiguration === 'single' ? 'SINGLE PHASE' : swb.phaseConfiguration === 'three' ? 'THREE PHASE' : 'UNKNOWN';

  // Scope items — NO LIMIT, show all items
  const scopeItems = swb.upgradeScope || [];
  let totalCostHtml = '';
  try {
    const totalCost = calculateTotalCostRange(scopeItems);
    if (totalCost) {
      totalCostHtml = `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-top: 2px solid #00EAD3; margin-top: 12px;">
          <span style="font-size: 16px; color: #00EAD3; font-weight: 700; font-family: 'Urbanist', sans-serif; letter-spacing: 0.05em;">ESTIMATED TOTAL</span>
          <span style="font-size: 22px; color: #00EAD3; font-weight: 700; font-family: 'GeneralSans', sans-serif;">${totalCost.formatted}</span>
        </div>
        <p style="font-size: 11px; color: #555; font-style: italic; margin-top: 6px;">Estimates based on standard Australian electrical contractor rates. Final pricing subject to site inspection.</p>
      `;
    }
  } catch (e) { /* fallback: no total */ }

  const scopeHtml = scopeItems.length > 0 ? scopeItems.map(item => {
    const priorityColor = item.priority === 'required' ? '#FF4444' : item.priority === 'recommended' ? '#F5A623' : '#00EAD3';
    const priorityLabel = item.priority.toUpperCase();
    return `
      <div style="display: flex; gap: 12px; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid #222;">
        <span style="font-size: 12px; color: ${priorityColor}; font-weight: 700; min-width: 100px; font-family: 'Urbanist', sans-serif; letter-spacing: 0.05em;">${priorityLabel}</span>
        <div style="flex: 1;">
          <p style="font-size: 15px; color: #fff; font-weight: 600; font-family: 'Urbanist', sans-serif;">${item.item}</p>
          <p style="font-size: 13px; color: #808285; margin-top: 3px; line-height: 1.4;">${item.detail}</p>
        </div>
        ${item.estimatedCost ? `<span style="font-size: 15px; color: #F5A623; font-weight: 600; font-family: 'GeneralSans', sans-serif; white-space: nowrap; min-width: 100px; text-align: right;">${item.estimatedCost}</span>` : ''}
      </div>
    `;
  }).join('') : `
    <div style="padding: 12px 0;">
      <p style="color: #00EAD3; font-size: 15px; font-weight: 600;">No additional upgrades identified</p>
      <p style="color: #808285; font-size: 13px; margin-top: 4px;">Board is ready for solar + battery installation</p>
    </div>
  `;

  return `
    <div class="slide">
      ${slideNum(slide.id)}
      ${logoBR()}
      ${altHeader(slide.title, c.headerRight as string || 'Preliminary Quote', phaseLabel)}
      <div style="display: flex; gap: 40px;">
        <!-- Left Column: Scope Items + Costs -->
        <div style="flex: 1.3; display: flex; flex-direction: column;">
          <p style="font-family: 'Urbanist', sans-serif; font-size: 16px; color: #fff; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; margin-bottom: 16px;">UPGRADE REQUIREMENTS & COST ESTIMATES</p>
          <div style="display: flex; flex-direction: column;">
            ${scopeHtml}
          </div>
          ${totalCostHtml}
        </div>

        <!-- Right Column: Cable Sizing + System Summary -->
        <div style="flex: 0.7; display: flex; flex-direction: column; gap: 16px;">
          <!-- Cable Sizing Reference Table -->
          ${cableSizing ? `
          <div class="card" style="padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <p style="font-family: 'Urbanist', sans-serif; font-size: 13px; color: #00EAD3; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">CABLE SIZING</p>
              <span style="font-size: 11px; color: #808285;">AS/NZS 3008.1.1</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
              <div style="background: rgba(0,234,211,0.08); border-radius: 4px; padding: 10px;">
                <p style="font-size: 10px; color: #808285; text-transform: uppercase; letter-spacing: 0.05em;">AC CABLE</p>
                <p style="font-size: 18px; color: #00EAD3; font-weight: 700; font-family: 'GeneralSans', sans-serif;">${cableSizing.acCableSize}</p>
                <p style="font-size: 10px; color: #808285;">${cableSizing.acCableType}</p>
              </div>
              <div style="background: rgba(0,234,211,0.08); border-radius: 4px; padding: 10px;">
                <p style="font-size: 10px; color: #808285; text-transform: uppercase; letter-spacing: 0.05em;">DC CABLE</p>
                <p style="font-size: 18px; color: #00EAD3; font-weight: 700; font-family: 'GeneralSans', sans-serif;">${cableSizing.dcCableSize}</p>
                <p style="font-size: 10px; color: #808285;">${cableSizing.dcCableType}</p>
              </div>
              <div style="background: rgba(0,234,211,0.08); border-radius: 4px; padding: 10px;">
                <p style="font-size: 10px; color: #808285; text-transform: uppercase; letter-spacing: 0.05em;">EARTH</p>
                <p style="font-size: 18px; color: #00EAD3; font-weight: 700; font-family: 'GeneralSans', sans-serif;">${cableSizing.earthCableSize}</p>
                <p style="font-size: 10px; color: #808285;">Cu Earth</p>
              </div>
              ${cableSizing.batteryCableSize ? `
              <div style="background: rgba(245,166,35,0.08); border-radius: 4px; padding: 10px;">
                <p style="font-size: 10px; color: #808285; text-transform: uppercase; letter-spacing: 0.05em;">BATTERY</p>
                <p style="font-size: 18px; color: #F5A623; font-weight: 700; font-family: 'GeneralSans', sans-serif;">${cableSizing.batteryCableSize}</p>
                <p style="font-size: 10px; color: #808285;">${cableSizing.batteryCableType || 'Battery Cable'}</p>
              </div>` : ''}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid #222;">
              <p style="font-size: 11px; color: ${cableSizing.acVoltageDropCompliant ? '#00EAD3' : '#FF4444'}; font-weight: 600;">V-Drop: ${cableSizing.acVoltageDrop.toFixed(1)}% ${cableSizing.acVoltageDropCompliant ? '\u2713 COMPLIANT' : '\u2717 EXCEEDS LIMIT'}</p>
              <p style="font-size: 10px; color: #808285;">Run: ${cableSizing.runDistanceMetres}m</p>
            </div>
            ${cableSizing.referenceTable && cableSizing.referenceTable.length > 0 ? `
            <div style="margin-top: 8px; border-top: 1px solid #222; padding-top: 6px;">
              <p style="font-size: 10px; color: #808285; margin-bottom: 4px;">DISTANCE REFERENCE:</p>
              <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                ${cableSizing.referenceTable.map(r => `
                  <div style="background: ${r.compliant ? 'rgba(0,234,211,0.06)' : 'rgba(255,68,68,0.06)'}; border: 1px solid ${r.compliant ? '#333' : '#442222'}; border-radius: 3px; padding: 3px 6px;">
                    <span style="font-size: 9px; color: ${r.compliant ? '#ccc' : '#FF4444'};">${r.distanceRange}: ${r.recommendedCable} (${r.voltageDropPercent.toFixed(1)}%)</span>
                  </div>
                `).join('')}
              </div>
            </div>` : ''}
            <p style="font-size: 9px; color: #555; margin-top: 6px; font-style: italic;">${cableSizing.disclaimer}</p>
          </div>` : ''}

          <!-- System being installed summary -->
          <div class="card aqua-b" style="padding: 16px; text-align: center;">
            <p style="font-family: 'Urbanist', sans-serif; font-size: 12px; color: #00EAD3; text-transform: uppercase; letter-spacing: 0.1em;">SYSTEM TO BE INSTALLED</p>
            <p style="font-family: 'GeneralSans', sans-serif; font-size: 18px; color: #fff; font-weight: 700; margin-top: 6px;">${solarKw}kW ${inverterBrand}</p>
            <p style="font-family: 'GeneralSans', sans-serif; font-size: 18px; color: #fff; font-weight: 700; margin-top: 2px;">${batteryKwh}kWh ${batteryBrand}</p>
          </div>

          <!-- Cable run pricing note -->
          ${cableRun?.cableRunDistanceMetres ? `
          <div class="card" style="padding: 14px; border-color: #F5A623;">
            <p style="font-family: 'Urbanist', sans-serif; font-size: 11px; color: #F5A623; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; margin-bottom: 6px;">CABLE RUN PRICING NOTE</p>
            <p style="font-size: 12px; color: #999; line-height: 1.5;">Measured distance: <span style="color: #fff; font-weight: 600;">${cableRun.cableRunDistanceMetres.toFixed(1)}m</span></p>
            <p style="font-size: 11px; color: #808285; margin-top: 4px;">1\u00D8 16mm: $33/m after 10m | 3\u00D8 16mm: $55/m after 5m</p>
          </div>` : ''}
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// SLIDE 16: STRATEGIC PATHWAY TO ENERGY INDEPENDENCE (Roadmap)
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
                <p style="font-family: 'GeneralSans', sans-serif; font-size: 19px; color: #fff; font-weight: 600;">${s.title}</p>
                <p style="color: #808285; font-size: 17px; margin-top: 4px;">${s.description}</p>
              </div>
            </div>
          `).join('')}
        </div>
        <!-- Right: Investment Summary Card -->
        <div style="flex: 0.8; display: flex; align-items: center;">
          <div class="card" style="width: 100%; padding: 30px;">
            <p style="font-family: 'Urbanist', sans-serif; font-size: 18px; color: #00EAD3; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; font-weight: 600;">INVESTMENT SUMMARY</p>
            <div style="width: 40px; height: 2px; background: #00EAD3; margin-bottom: 24px;"></div>
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
          <p style="font-family: 'Urbanist', sans-serif; font-size: 18px; color: #00EAD3; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 24px; font-weight: 600;">NEXT STEPS</p>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${[
              { num: '01', text: 'Schedule Site Assessment' },
              { num: '02', text: 'Receive Detailed System Design' },
              { num: '03', text: 'Review Financing Options' },
              { num: '04', text: 'Installation Within 2-4 Weeks' },
            ].map(s => `
              <div style="display: flex; align-items: center; gap: 16px; background: #222; padding: 16px 20px; border-left: 3px solid #00EAD3;">
                <span style="font-family: 'GeneralSans', sans-serif; font-size: 28px; font-weight: 700; color: #00EAD3; min-width: 50px;">${s.num}</span>
                <p style="font-size: 18px; color: #fff;">${s.text}</p>
              </div>
            `).join('')}
          </div>
        </div>
        <!-- Right: Contact Details -->
        <div style="flex: 1;">
          <p style="font-family: 'Urbanist', sans-serif; font-size: 17px; color: #00EAD3; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 12px;">PREPARED BY</p>
          <p style="font-family: 'NextSphere', sans-serif; font-size: 36px; color: #fff; text-transform: uppercase; margin-bottom: 8px;">${c.preparedBy}</p>
          <p style="color: #808285; font-size: 18px;">${c.title}</p>
          <p style="color: #00EAD3; font-size: 18px; margin-bottom: 30px;">${c.company}</p>
          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="color: #00EAD3; font-size: 18px;">📍</span>
              <span style="color: #ccc; font-size: 17px;">${c.address}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="color: #00EAD3; font-size: 18px;">📞</span>
              <span style="color: #ccc; font-size: 17px;">${c.phone}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="color: #00EAD3; font-size: 18px;">✉️</span>
              <span style="color: #ccc; font-size: 17px;">${c.email}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="color: #00EAD3; font-size: 18px;">🌐</span>
              <span style="color: #ccc; font-size: 17px;">${c.website}</span>
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
            <p style="color: #00EAD3; font-size: 18px; font-weight: 600; margin-bottom: 10px;">Why ${program || provider}?</p>
            <p style="color: #808285; font-size: 17px; line-height: 1.6;">After analyzing 13 providers, ${provider} offers the best combination of VPP earnings, gas bundling, and compatibility with your ${batteryBrand} system.</p>
            <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 16px;">
              <p style="color: #808285; font-size: 17px;">✓ <span style="color: #fff; font-weight: 600;">Gas + Electricity Bundle</span><br/><span style="color: #666; font-size: 14px;">Maximize savings with dual fuel discounts</span></p>
              <p style="color: #808285; font-size: 17px;">✓ <span style="color: #fff; font-weight: 600;">${batteryBrand.split(' ')[0]} Compatible</span><br/><span style="color: #666; font-size: 14px;">Fully supported by your new battery system</span></p>
              <p style="color: #808285; font-size: 17px;">✓ <span style="color: #fff; font-weight: 600;">No Lock-in Contract</span><br/><span style="color: #666; font-size: 14px;">Flexibility to switch if rates change</span></p>
              <p style="color: #808285; font-size: 17px;">✓ <span style="color: #fff; font-weight: 600;">20% Reserve Protection</span><br/><span style="color: #666; font-size: 14px;">Ensures backup power during blackouts</span></p>
            </div>
          </div>
          <!-- Value Cards -->
          <div style="background: rgba(0,234,211,0.05); border: 1px solid #00EAD3; padding: 24px; display: flex; gap: 30px;">
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
          <p style="font-size: 18px; color: #fff; font-weight: 600;">Provider Landscape Analysis</p>
          <table>
            <thead>
              <tr>
                <th style="color: #00EAD3;">Provider</th>
                <th style="color: #00EAD3;">Gas Bundle</th>
                <th style="color: #00EAD3;">${batteryBrand.split(' ')[0]} Support</th>
                <th style="color: #00EAD3;">VPP Value (Year 1)</th>
                <th style="color: #00EAD3;">Verdict</th>
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
            <p style="font-family: 'UrbanistItalic', sans-serif; font-size: 18px; color: #00EAD3; font-style: italic; margin-bottom: 12px;">Implementation Steps</p>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <p style="color: #808285; font-size: 17px;">Proceed with ${solarKw}kW Solar + ${batteryKwh}kWh Battery installation.</p>
              <p style="color: #808285; font-size: 17px;">Register system with ${provider} "${program}" VPP.</p>
              <p style="color: #808285; font-size: 17px;">Switch Gas account to ${provider} to activate bundle discounts.</p>
              <p style="color: #808285; font-size: 17px;">Link Everyday Rewards account for additional points.</p>
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
          <div class="card" style="border-left: 4px solid #00EAD3; padding: 24px;">
            <p class="lbl">SYSTEM COST</p>
            <p class="hero-num white" style="font-size: 42px;">${fmtCurrency(netCost)}</p>
            <p style="color: #808285; font-size: 14px; margin-top: 4px;">After ${fmtCurrency(rebates)} in rebates</p>
          </div>
          <div class="card" style="border-left: 4px solid #00EAD3; padding: 24px;">
            <p class="lbl">PAYBACK PERIOD</p>
            <p class="hero-num aqua" style="font-size: 42px;">${payback.toFixed(1)} <span style="font-size: 18px;">YEARS</span></p>
            <p style="color: #808285; font-size: 14px; margin-top: 4px;">Without VPP: ${paybackNoVpp.toFixed(1)} years</p>
          </div>
          <div class="card" style="border-left: 4px solid #00EAD3; padding: 24px;">
            <p class="lbl">25-YEAR ROI</p>
            <p class="hero-num orange" style="font-size: 42px;">${roi}%</p>
            <p style="color: #808285; font-size: 14px; margin-top: 4px;">Lifetime savings: ${fmtCurrency(lifetime)}</p>
          </div>
        </div>
        <!-- Right: Annual Benefit Breakdown with gradient bars -->
        <div style="flex: 1; display: flex; flex-direction: column; gap: 16px;">
          <p style="font-family: 'Urbanist', sans-serif; font-size: 18px; color: #fff; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">ANNUAL BENEFIT BREAKDOWN</p>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${benefits.map((b, i) => {
              const barColors = i === 0 ? 'linear-gradient(90deg, #33FFE8, #00C4B0)' : i === 1 ? 'linear-gradient(90deg, #ff8a3d, #f36710)' : 'linear-gradient(90deg, #a0a0a5, #808285)';
              return `
              <div style="padding: 14px 20px; background: rgba(255,255,255,0.03);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <p style="color: #fff; font-size: 17px; font-weight: 600;">${b.category}</p>
                  <p style="font-family: GeneralSans, sans-serif; font-size: 24px; font-weight: 700; color: #00EAD3;">${fmtCurrency(b.value)}</p>
                </div>
                <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden;">
                  <div style="width: ${b.percent}%; height: 100%; background: ${barColors}; border-radius: 4px; box-shadow: 0 0 8px rgba(0,234,211,0.3);"></div>
                </div>
                <p style="color: #808285; font-size: 13px; margin-top: 4px;">${b.percent}% of total benefit</p>
              </div>`;
            }).join('')}
          </div>
          <div style="background: rgba(0,234,211,0.05); border: 1px solid rgba(0,234,211,0.25); padding: 20px; text-align: center; border-radius: 4px;">
            <p class="lbl">TOTAL ANNUAL BENEFIT</p>
            <p style="font-family: GeneralSans, sans-serif; font-size: 44px; font-weight: 700; color: #00EAD3; margin: 4px 0;">${fmtCurrency(totalBenefit)}<span style="font-size: 18px; color: #808285; font-weight: 400;">/year</span></p>
          </div>
          <p style="color: #808285; font-size: 14px; font-style: italic; line-height: 1.5;">Values are estimates based on current electricity rates and VPP program terms. Actual results may vary based on usage patterns, grid conditions, and program changes.</p>
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
