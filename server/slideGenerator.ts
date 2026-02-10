// Lightning Energy Professional Slide Generator
// Matches exact design from Paul Stokes SA proposal example

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
  
  // Site Assessment
  sitePhotos?: Array<{ url: string; caption: string }>;
  
  // Environmental
  co2ReductionTonnes: number;
  treesEquivalent?: number;
  energyIndependenceScore?: number;
  co2CurrentTonnes?: number;
  co2ProjectedTonnes?: number;
  co2ReductionPercent?: number;
}

export interface SlideContent {
  id: number;
  type: string;
  title: string;
  subtitle?: string;
  content: Record<string, unknown>;
}

// Generate all slides based on proposal data - Matches Master Reference exactly
// Slide order: Cover → Exec Summary → Bill Analysis Monthly → Bill Breakdown (donut)
// → Annual Energy Projection → Usage Benchmarking → Solar Recommendation → Battery Recommendation
// → Why Add Battery → Solar Battery Considerations → VPP Comparison → Recommended VPP
// → [EV Analysis] → [EV vs Petrol] → Financial Investment → Return on Investment
// → Implementation Roadmap → Energy Optimisation Report → Required Electrical Works
// → [System Integration] → Conclusion → Contact
export function generateSlides(data: ProposalData): SlideContent[] {
  const slides: SlideContent[] = [];
  let slideId = 1;
  
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
  
  // Slide 2: EXECUTIVE SUMMARY (narrative left, stacked metrics right)
  slides.push({
    id: slideId++,
    type: 'executive_summary',
    title: 'EXECUTIVE SUMMARY',
    subtitle: 'Your Energy Profile Reveals Significant Savings Opportunity',
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
    }
  });
  
  // Slide 3: CURRENT BILL ANALYSIS — MONTHLY BREAKDOWN (full-width table)
  slides.push({
    id: slideId++,
    type: 'bill_analysis',
    title: 'CURRENT BILL ANALYSIS',
    subtitle: data.billPeriodStart && data.billPeriodEnd 
      ? `Billing Period: ${data.billPeriodStart} to ${data.billPeriodEnd} (${data.billDays || 90} days)` 
      : `${data.retailer} Plan Analysis`,
    content: {
      retailer: data.retailer,
      annualCost: data.annualCost,
      usageCost: data.annualUsageCharge || data.annualUsageKwh * (data.usageRateCentsPerKwh / 100),
      supplyCost: data.annualSupplyCharge || data.supplyChargeCentsPerDay * 365 / 100,
      solarCredit: data.annualSolarCredit || 0,
      usageRate: data.usageRateCentsPerKwh,
      supplyCharge: data.supplyChargeCentsPerDay,
      feedInTariff: data.feedInTariffCentsPerKwh,
      controlledLoadRate: data.controlledLoadRateCentsPerKwh,
      dailyAverageKwh: data.dailyUsageKwh,
      dailyAverageCost: data.dailyAverageCost || (data.annualCost ? data.annualCost / 365 : 0),
      monthlyData: data.monthlyUsageData || [],
      billDays: data.billDays,
      billTotalAmount: data.billTotalAmount,
      billTotalUsageKwh: data.billTotalUsageKwh,
    }
  });
  
  // Slide 4: CURRENT BILL BREAKDOWN (donut chart + metrics)
  const usageCostAnnual = data.annualUsageCharge || data.annualUsageKwh * (data.usageRateCentsPerKwh / 100);
  const supplyCostAnnual = data.annualSupplyCharge || data.supplyChargeCentsPerDay * 365 / 100;
  const totalCostForPercent = usageCostAnnual + supplyCostAnnual;
  const usagePercent = totalCostForPercent > 0 ? Math.round((usageCostAnnual / totalCostForPercent) * 100) : 50;
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
      usageChargesPercent: usagePercent,
      supplyChargesPercent: 100 - usagePercent,
    }
  });
  
  // Slide 5: ANNUAL ENERGY PROJECTION (bar chart + insight cards)
  // Solar production varies by month - approximate seasonal factors
  const monthlyFactors: Record<string, number> = { Jan: 1.4, Feb: 1.3, Mar: 1.1, Apr: 0.9, May: 0.7, Jun: 0.6, Jul: 0.6, Aug: 0.7, Sep: 0.9, Oct: 1.1, Nov: 1.3, Dec: 1.4 };
  const avgDailySolar = data.solarSizeKw * 4.2;
  const defaultMonths = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthlyProjection = (data.monthlyUsageData && data.monthlyUsageData.length > 0)
    ? data.monthlyUsageData.map(m => ({
        month: m.month,
        usage: Math.round(m.kwh),
        solar: Math.round(avgDailySolar * (monthlyFactors[m.month.substring(0, 3)] || 1.0) * 30),
      }))
    : defaultMonths.map(m => ({
        month: m,
        usage: Math.round(data.annualUsageKwh / 12),
        solar: Math.round(avgDailySolar * (monthlyFactors[m] || 1.0) * 30),
      }));
  slides.push({
    id: slideId++,
    type: 'annual_energy_projection',
    title: 'ANNUAL ENERGY PROJECTION',
    subtitle: 'Monthly Consumption vs Solar Production',
    content: {
      monthlyData: monthlyProjection,
      annualUsageKwh: data.annualUsageKwh,
      solarSizeKw: data.solarSizeKw,
      dailyUsageKwh: data.dailyUsageKwh,
      annualSolarProduction: data.solarSizeKw * 4.2 * 365,
    }
  });
  
  // Slide 6: USAGE BENCHMARKING (comparison bar + metric cards)
  const stateAverages: Record<string, number> = { VIC: 13.0, NSW: 14.5, QLD: 15.2, SA: 12.8, WA: 16.0, TAS: 14.0, NT: 18.0, ACT: 13.5 };
  const stateAvg = stateAverages[data.state] || 13.0;
  slides.push({
    id: slideId++,
    type: 'usage_benchmarking',
    title: 'USAGE BENCHMARKING',
    subtitle: 'Your Consumption vs Average Household',
    content: {
      dailyAverage: data.dailyUsageKwh,
      stateAverage: stateAvg,
      comparisonFactor: parseFloat((data.dailyUsageKwh / stateAvg).toFixed(1)),
      state: data.state,
    }
  });
  
  // Slide 7: SOLAR RECOMMENDATION (metrics + Why This Config card)
  slides.push({
    id: slideId++,
    type: 'solar_recommendation',
    title: 'SOLAR RECOMMENDATION',
    subtitle: `${data.solarSizeKw} kW High-Performance Array`,
    content: {
      systemSizeKw: data.solarSizeKw,
      panelCount: data.panelCount,
      panelWattage: data.panelWattage,
      panelBrand: data.panelBrand,
      panelConfig: `${data.panelCount} x ${data.panelWattage}W Panels`,
      annualProductionKwh: Math.round(data.solarSizeKw * 4.2 * 365),
      dailyProductionKwh: parseFloat((data.solarSizeKw * 4.2).toFixed(1)),
      inverterSize: data.inverterSizeKw,
      inverterModel: `${data.inverterBrand || 'Sigenergy'} SigenStor`,
    }
  });
  
  // Slide 8: BATTERY RECOMMENDATION (metrics + government incentive card)
  slides.push({
    id: slideId++,
    type: 'battery_recommendation',
    title: 'BATTERY RECOMMENDATION',
    subtitle: `${data.batterySizeKwh} kWh ${data.batteryBrand} Storage`,
    content: {
      totalCapacityKwh: data.batterySizeKwh,
      batteryBrand: data.batteryBrand,
      moduleConfig: calculateBatteryModules(data.batterySizeKwh),
      backupCapability: data.inverterSizeKw >= 8 ? '3-PHASE BACKUP' : 'SINGLE PHASE BACKUP',
      backupDescription: data.inverterSizeKw >= 8 ? 'Full home backup capability with 3-phase support' : 'Essential circuit backup with automatic switchover',
      technology: 'LFP LITHIUM',
      rebateAmount: data.rebateAmount || data.batteryRebateAmount || 0,
      rebateDescription: `Government incentive applied to reduce your upfront investment`,
      solarRebateAmount: data.solarRebateAmount || 0,
    }
  });
  
  // Slide 9: WHY ADD A BATTERY? (2x2 benefits grid)
  slides.push({
    id: slideId++,
    type: 'why_battery',
    title: 'WHY ADD A BATTERY?',
    subtitle: 'Strategic Advantages & Benefits',
    content: {
      benefits: [
        { icon: '+', title: 'ENERGY INDEPENDENCE', description: `Store excess solar during the day and use it at night, reducing grid dependence by up to ${data.energyIndependenceScore || 85}%. Your ${data.batterySizeKwh}kWh battery provides substantial overnight coverage.` },
        { icon: '+', title: 'VPP REVENUE STREAM', description: `Earn $${data.vppAnnualValue.toLocaleString()}+/year through ${data.vppProvider} Virtual Power Plant participation. Your battery becomes a revenue-generating asset, not just storage.` },
        { icon: '+', title: 'BLACKOUT PROTECTION', description: `Seamless backup power during grid outages. Essential circuits remain powered, protecting your home and family with automatic switchover.` },
        { icon: '+', title: 'EV OPTIMIZATION', description: `Charge your electric vehicle from stored solar energy at near-zero cost. Smart scheduling ensures your battery prioritizes home needs while maximizing EV charging during peak solar hours.` },
      ],
    }
  });
  
  // Slide 10: SOLAR BATTERY CONSIDERATIONS (2x2 warnings grid)
  slides.push({
    id: slideId++,
    type: 'battery_considerations',
    title: 'SOLAR BATTERY CONSIDERATIONS',
    subtitle: 'Investment and Technical Factors',
    content: {
      considerations: [
        { icon: '!', title: 'UPFRONT CAPITAL', description: `Net investment of $${data.netInvestment.toLocaleString()} after government rebates of $${data.rebateAmount.toLocaleString()}. This represents a significant but strategic investment in your property's energy infrastructure.` },
        { icon: '!', title: 'PAYBACK PERIOD', description: `Estimated ${data.paybackYears.toFixed(1)}-year payback based on current energy prices. Rising electricity costs (avg 3.5%/yr) will likely accelerate this timeline.` },
        { icon: '!', title: 'INSTALLATION REQUIREMENTS', description: `Professional installation by CEC-accredited installers. May require switchboard upgrade and smart meter reconfiguration depending on your current infrastructure.` },
        { icon: '!', title: 'LIFECYCLE & REPLACEMENT', description: `LFP battery chemistry provides 6,000+ cycles (15+ year lifespan). Battery degradation is typically <20% over 10 years. Warranty covers performance guarantees.` },
      ],
    }
  });
  
  // Slide 11: VPP PROVIDER COMPARISON (full table)
  slides.push({
    id: slideId++,
    type: 'vpp_comparison',
    title: 'VPP PROVIDER COMPARISON',
    subtitle: `Evaluation of Top Market Options for ${data.state}`,
    content: {
      providers: getVPPProviders(data.state, data.hasGasBundle),
      recommendedProvider: data.vppProvider,
      state: data.state,
      hasGas: data.hasGas,
    }
  });
  
  // Slide 12: RECOMMENDED VPP PROVIDER (selected provider + features)
  slides.push({
    id: slideId++,
    type: 'vpp_recommendation',
    title: 'RECOMMENDED VPP PROVIDER',
    subtitle: 'Strategic Selection for Maximum Convenience and Value',
    content: {
      provider: data.vppProvider,
      program: data.vppProgram,
      annualValue: data.vppAnnualValue,
      hasGas: data.hasGas,
      strategicFit: [
        { icon: '✓', title: data.hasGas ? 'Gas & Electricity Bundle' : 'Optimized for Your Profile', description: data.hasGas ? 'Consolidate both energy accounts for simplified billing and additional bundle discounts.' : 'Selected based on your usage profile and state-specific market conditions.' },
        { icon: '✓', title: 'Seamless Integration', description: `Compatible with your ${data.batteryBrand} battery system for automated VPP participation and smart scheduling.` },
      ],
      financialValue: [
        { icon: '✓', title: 'Guaranteed Credits', description: `Estimated $${data.vppAnnualValue.toLocaleString()}/year in VPP credits through daily availability payments and grid event participation.` },
        { icon: '✓', title: 'No Lock-in Contracts', description: 'Flexible arrangement with no exit fees — switch providers anytime if a better option emerges.' },
      ],
    }
  });
  
  // CONDITIONAL: Gas Electrification slides
  if (data.hasGas && data.gasAnnualCost) {
    slides.push({
      id: slideId++,
      type: 'gas_footprint',
      title: 'CURRENT GAS FOOTPRINT',
      subtitle: 'Gas Usage & Environmental Impact',
      content: {
        annualMJ: data.gasAnnualMJ || 0,
        annualCost: data.gasAnnualCost,
        dailySupplyCharge: data.gasDailySupplyCharge || 0,
        usageRate: data.gasUsageRate || 0,
        kwhEquivalent: (data.gasAnnualMJ || 0) * 0.2778,
        co2Emissions: data.gasCO2Emissions || ((data.gasAnnualMJ || 0) * 0.0519),
      }
    });
  }
  
  if (data.hasGas && data.gasAppliances) {
    slides.push({
      id: slideId++,
      type: 'gas_appliances',
      title: 'GAS APPLIANCE INVENTORY',
      subtitle: 'Electrification Priority Assessment',
      content: {
        appliances: data.gasAppliances,
        totalGasCost: data.gasAnnualCost || 0,
        electrificationPriority: [
          data.gasAppliances.hotWater ? { name: 'Hot Water System', type: data.gasAppliances.hotWater.type, priority: 'HIGH', savings: data.heatPumpSavings || 800 } : null,
          data.gasAppliances.heating ? { name: 'Heating System', type: data.gasAppliances.heating.type, priority: 'MEDIUM', savings: data.heatingCoolingSavings || 600 } : null,
          data.gasAppliances.cooktop ? { name: 'Gas Cooktop', type: data.gasAppliances.cooktop.type, priority: 'LOW', savings: data.inductionSavings || 200 } : null,
          data.gasAppliances.poolHeater ? { name: 'Pool Heater', type: data.gasAppliances.poolHeater.type, priority: 'MEDIUM', savings: data.poolPumpSavings || 500 } : null,
        ].filter(Boolean),
      }
    });
  }
  
  // CONDITIONAL: EV Vehicle Analysis
  if (data.hasEV) {
    slides.push({
      id: slideId++,
      type: 'ev_analysis',
      title: 'EV VEHICLE ANALYSIS',
      subtitle: `${((data.evAnnualKm || 10000) / 1000).toFixed(0)}k km Usage Scenario & Solar Integration`,
      content: {
        annualKm: data.evAnnualKm || 10000,
        dailyKm: parseFloat(((data.evAnnualKm || 10000) / 365).toFixed(1)),
        vehicleEfficiency: data.evConsumptionPer100km || 15,
        dailyEnergyNeed: parseFloat((((data.evAnnualKm || 10000) / 365) * (data.evConsumptionPer100km || 15) / 100).toFixed(1)),
        dailySolarGeneration: parseFloat((data.solarSizeKw * 4.2).toFixed(1)),
        remainingForHome: parseFloat((data.solarSizeKw * 4.2 - ((data.evAnnualKm || 10000) / 365) * (data.evConsumptionPer100km || 15) / 100).toFixed(1)),
        evPercentOfSolar: parseFloat((((data.evAnnualKm || 10000) / 365) * (data.evConsumptionPer100km || 15) / 100 / (data.solarSizeKw * 4.2) * 100).toFixed(1)),
      }
    });
    
    // EV vs Petrol Vehicle
    slides.push({
      id: slideId++,
      type: 'ev_vs_petrol',
      title: 'EV VS PETROL VEHICLE',
      subtitle: `Annual Fuel Cost Comparison (${((data.evAnnualKm || 10000) / 1000).toFixed(0)},000 km/year)`,
      content: {
        annualKm: data.evAnnualKm || 10000,
        petrolEfficiency: 10.0,
        petrolPrice: data.evPetrolPricePerLitre || 1.50,
        annualPetrolCost: data.evPetrolCost || Math.round((data.evAnnualKm || 10000) / 100 * 10 * (data.evPetrolPricePerLitre || 1.50)),
        totalLitres: Math.round((data.evAnnualKm || 10000) / 100 * 10),
        evEfficiency: data.evConsumptionPer100km || 15,
        chargingCostPerKwh: 0.115,
        annualEvCost: data.evGridChargeCost || Math.round((data.evAnnualKm || 10000) / 100 * (data.evConsumptionPer100km || 15) * 0.115),
        totalKwhRequired: Math.round((data.evAnnualKm || 10000) / 100 * (data.evConsumptionPer100km || 15)),
        annualSavings: data.evAnnualSavings || Math.round((data.evPetrolCost || Math.round((data.evAnnualKm || 10000) / 100 * 10 * 1.50)) - (data.evGridChargeCost || Math.round((data.evAnnualKm || 10000) / 100 * 15 * 0.115))),
      }
    });
  }
  
  // CONDITIONAL: Hot Water Electrification
  if (data.hasGas && data.gasAppliances?.hotWater) {
    slides.push({
      id: slideId++,
      type: 'hot_water_electrification',
      title: 'HOT WATER ELECTRIFICATION',
      subtitle: 'Heat Pump Upgrade Analysis',
      content: {
        currentSystem: data.gasAppliances.hotWater.type || 'Gas Storage Hot Water',
        recommendedSystem: data.heatPumpBrand || 'Reclaim Energy CO2 Heat Pump',
        annualGasCost: data.gasAppliances.hotWater.annualCost || 600,
        annualHeatPumpCost: Math.round((data.gasAppliances.hotWater.annualCost || 600) * 0.25),
        annualSavings: data.heatPumpSavings || 800,
        installCost: data.heatPumpCost || 3500,
        rebates: 1000,
        netCost: (data.heatPumpCost || 3500) - 1000,
        features: ['COP 4.0+ efficiency rating', 'Works in temperatures -10°C to 43°C', 'Quiet operation (37dB)', 'Smart timer integration with solar'],
      }
    });
  }
  
  // CONDITIONAL: Heating & Cooling
  if (data.hasGas && data.gasAppliances?.heating) {
    slides.push({
      id: slideId++,
      type: 'heating_cooling',
      title: 'HEATING & COOLING UPGRADE',
      subtitle: 'Reverse Cycle AC Analysis',
      content: {
        currentSystem: data.gasAppliances.heating.type || 'Gas Ducted Heating',
        recommendedSystem: data.acBrand || 'Daikin Reverse Cycle Split System',
        annualGasCost: data.gasAppliances.heating.annualCost || 1200,
        annualACCost: Math.round((data.gasAppliances.heating.annualCost || 1200) * 0.3),
        annualSavings: data.heatingCoolingSavings || 600,
        installCost: data.heatingCoolingCost || 8000,
        rebates: 1500,
        netCost: (data.heatingCoolingCost || 8000) - 1500,
        cop: 4.5,
        features: ['Heating AND cooling in one system', 'Zone control for individual rooms', 'Wi-Fi smart control', 'Pairs with solar for free operation'],
      }
    });
  }
  
  // CONDITIONAL: Induction Cooking
  if (data.hasGas && data.gasAppliances?.cooktop) {
    slides.push({
      id: slideId++,
      type: 'induction_cooking',
      title: 'INDUCTION COOKING UPGRADE',
      subtitle: 'Gas Cooktop Replacement',
      content: {
        currentSystem: data.gasAppliances.cooktop.type || 'Gas Cooktop',
        recommendedSystem: data.inductionBrand || 'Bosch Induction Cooktop',
        annualGasCost: data.gasAppliances.cooktop.annualCost || 200,
        annualInductionCost: Math.round((data.gasAppliances.cooktop.annualCost || 200) * 0.4),
        annualSavings: data.inductionSavings || 200,
        installCost: data.inductionCost || 2500,
        features: ['90% energy efficiency (vs 40% gas)', 'Instant heat control', 'Safer - no open flame', 'Easy to clean flat surface'],
      }
    });
  }
  
  // (Duplicate EV slides removed — EV Analysis + EV vs Petrol are already included above)
  
  // CONDITIONAL: Pool Heat Pump
  if (data.hasPoolPump) {
    slides.push({
      id: slideId++,
      type: 'pool_heat_pump',
      title: 'POOL HEAT PUMP',
      subtitle: 'Efficient Pool Heating Solution',
      content: {
        currentSystem: 'Gas Pool Heater',
        recommendedSystem: data.poolHeatPumpBrand || 'Madimack InverECO Pool Heat Pump',
        annualGasCost: data.gasAppliances?.poolHeater?.annualCost || 1200,
        annualHeatPumpCost: Math.round((data.gasAppliances?.poolHeater?.annualCost || 1200) * 0.2),
        annualSavings: data.poolPumpSavings || 500,
        installCost: data.poolHeatPumpCost || 4500,
        cop: 6.0,
        features: ['COP 6.0 - 6x more efficient than gas', 'Extends swimming season year-round', 'Quiet inverter operation', 'Solar-powered for near-zero running cost'],
      }
    });
  }
  
  // CONDITIONAL: Full Electrification Investment
  if (data.hasGas && data.electrificationTotalCost) {
    slides.push({
      id: slideId++,
      type: 'electrification_investment',
      title: 'FULL ELECTRIFICATION INVESTMENT',
      subtitle: 'Complete Gas Elimination Pathway',
      content: {
        items: [
          { item: 'Heat Pump Hot Water', cost: data.heatPumpCost || 3500, rebate: 1000 },
          { item: 'Reverse Cycle AC', cost: data.heatingCoolingCost || 8000, rebate: 1500 },
          { item: 'Induction Cooktop', cost: data.inductionCost || 2500, rebate: 0 },
          data.hasPoolPump ? { item: 'Pool Heat Pump', cost: data.poolHeatPumpCost || 4500, rebate: 0 } : null,
        ].filter(Boolean),
        totalCost: data.electrificationTotalCost,
        totalRebates: data.electrificationTotalRebates || 2500,
        netInvestment: data.electrificationNetCost || (data.electrificationTotalCost - (data.electrificationTotalRebates || 2500)),
        annualGasSavings: data.gasAnnualCost || 0,
        gasSupplyChargeSaved: (data.gasDailySupplyCharge || 0.80) * 365,
      }
    });
  }
  
  // Slide: FINANCIAL INVESTMENT (line items + hero metrics)
  const solarBatterySavings = data.annualSavings - data.vppAnnualValue - (data.evAnnualSavings || 0) - (data.gasAnnualCost || 0);
  slides.push({
    id: slideId++,
    type: 'financial_investment',
    title: 'FINANCIAL INVESTMENT',
    subtitle: 'Complete Cost Analysis & Government Incentives',
    content: {
      lineItems: [
        { label: `${data.solarSizeKw}kW Solar Array (${data.panelCount} x ${data.panelWattage}W Panels)`, amount: Math.round(data.systemCost * 0.35), isCredit: false },
        { label: `${data.batterySizeKwh}kWh ${data.batteryBrand} Battery Storage`, amount: Math.round(data.systemCost * 0.50), isCredit: false },
        { label: 'Hybrid Inverter & Installation', amount: Math.round(data.systemCost * 0.15), isCredit: false },
        { label: 'STC Solar Rebate', amount: data.solarRebateAmount || Math.round(data.systemCost * 0.12), isCredit: true },
        { label: `${data.state} Battery Rebate`, amount: data.batteryRebateAmount || data.rebateAmount, isCredit: true },
      ],
      grossCost: data.systemCost,
      totalRebates: data.rebateAmount,
      netInvestment: data.netInvestment,
      annualSavings: data.annualSavings,
      paybackYears: data.paybackYears,
      billReductionPct: Math.round((data.annualSavings / data.annualCost) * 100),
      firstYearSavings: data.annualSavings,
      tenYearNetBenefit: data.tenYearSavings,
    }
  });
  
  // Slide: RETURN ON INVESTMENT (line chart + metrics)
  const roiProjection = generateYearlyProjection(data.annualCost, data.annualSavings, 10);
  const breakEvenYear = Math.ceil(data.paybackYears);
  slides.push({
    id: slideId++,
    type: 'return_on_investment',
    title: 'RETURN ON INVESTMENT',
    subtitle: '10-Year Financial Projection',
    content: {
      netInvestment: data.netInvestment,
      annualSavings: data.annualSavings,
      breakEvenYear: breakEvenYear,
      tenYearNetBenefit: data.tenYearSavings,
      roi: Math.round((data.tenYearSavings / data.netInvestment) * 100),
      yearlyData: Array.from({ length: 10 }, (_, i) => {
        const year = i + 1;
        const cumulativeSavings = Math.round(data.annualSavings * year * Math.pow(1.035, year / 2));
        return { year, cumulative: cumulativeSavings - data.netInvestment };
      }),
    }
  });
  
  // Slide: IMPLEMENTATION ROADMAP (4-step horizontal timeline)
  slides.push({
    id: slideId++,
    type: 'roadmap',
    title: 'IMPLEMENTATION ROADMAP',
    subtitle: 'Your Path to Energy Independence',
    content: {
      steps: [
        { number: '01', title: 'INSTALLATION', description: `Professional installation of your ${data.solarSizeKw}kW solar array and ${data.batterySizeKwh}kWh battery system by CEC-accredited installers. Includes switchboard upgrade and smart meter configuration.`, timeline: 'WEEK 1-2', color: 'aqua' },
        { number: '02', title: 'CONNECTION', description: `Grid connection approval and system commissioning. Your ${data.batteryBrand} system goes live with real-time monitoring via the manufacturer app.`, timeline: 'WEEK 2-4', color: 'aqua' },
        { number: '03', title: 'OPTIMIZATION', description: `Switch to ${data.vppProvider} and enroll in VPP program. Configure battery scheduling for maximum self-consumption and VPP revenue generation.`, timeline: 'MONTH 1-2', color: 'aqua' },
        { number: '04', title: 'INTEGRATION', description: 'Full system integration with existing appliances. Solar soaking schedules for HVAC, pool pump, and EV charging optimized for maximum solar utilization.', timeline: 'MONTH 2-3', color: 'orange' },
      ],
    }
  });
  
  // Slide: ENERGY OPTIMISATION REPORT (strategies left, projected impact right)
  slides.push({
    id: slideId++,
    type: 'energy_optimisation',
    title: 'ENERGY OPTIMISATION REPORT',
    subtitle: 'Strategic Load Control & Asset Management',
    content: {
      strategies: [
        { title: 'ACTIVE SOLAR SOAKING', borderColor: 'orange', description: `Schedule high-draw appliances (HVAC, pool pump, washing machine) between 10am-3pm to maximize direct solar consumption. Your ${data.solarSizeKw}kW array generates peak output during these hours.` },
        { title: 'WINTER RESILIENCE STRATEGY', borderColor: 'aqua', description: `During reduced solar months (May-August), the ${data.batterySizeKwh}kWh battery provides overnight coverage. ${data.hasGas ? 'Gas heating serves as backup during extended cloudy periods.' : 'Battery scheduling prioritizes essential loads during peak pricing windows.'}` },
        { title: data.hasEV ? 'SMART EV INTEGRATION' : 'PEAK DEMAND MANAGEMENT', borderColor: 'orange', description: data.hasEV ? `Configure EV charging in Solar Only mode during 10am-3pm. Your daily solar surplus of ${(data.solarSizeKw * 4.2 - data.dailyUsageKwh).toFixed(1)}kWh can charge approximately ${((data.solarSizeKw * 4.2 - data.dailyUsageKwh) / 0.15 * 100 / (data.evAnnualKm || 10000) * 365).toFixed(0)}% of annual EV needs.` : `Battery discharges during peak pricing (3pm-9pm) to avoid expensive grid imports. VPP events provide additional revenue during high-demand periods.` },
      ],
      projectedImpact: [
        { label: 'Solar Self-Consumption', value: 'Increase to >65%' },
        { label: 'Grid Independence', value: `${data.energyIndependenceScore || 85}% Annually` },
        data.hasEV ? { label: 'EV Fuel Cost', value: '$0 / year' } : { label: 'Peak Demand Reduction', value: '>80%' },
        { label: 'Battery Utilisation', value: '95%+ Daily' },
      ],
    }
  });
  
  // Slide: REQUIRED ELECTRICAL WORKS (assessment blocks left, site photos right)
  slides.push({
    id: slideId++,
    type: 'required_electrical_works',
    title: 'REQUIRED ELECTRICAL WORKS',
    subtitle: `Infrastructure Upgrade for ${data.solarSizeKw >= 10 ? '3-Phase' : 'Single Phase'} Solar Integration`,
    content: {
      assessments: [
        { title: 'SWITCHBOARD CAPACITY UPGRADE', description: `Current switchboard assessment required for ${data.solarSizeKw}kW array integration. May require DIN rail sub-board installation for additional circuit breakers and RCBOs.` },
        { title: `${data.solarSizeKw >= 10 ? '3-PHASE' : 'SINGLE PHASE'} PROTECTION`, description: `Installation of appropriate RCBOs and circuit protection for the ${data.solarSizeKw}kW solar array. Compliance with AS/NZS 4777.2 grid connection standards.` },
        { title: 'SMART METER CONFIGURATION', description: 'Meter reconfiguration for bidirectional measurement — tracking both grid imports and solar exports for accurate billing and VPP participation.' },
      ],
      sitePhotos: data.sitePhotos || [],
    }
  });
  
  // CONDITIONAL: SYSTEM INTEGRATION (appliance cards with photos)
  if (data.hasAppliances || data.hasPool || (data.hasGas && data.gasAppliances)) {
    const applianceCards: Array<{ name: string; strategy: string; description: string; photo?: string }> = [];
    if (data.gasAppliances?.heating) {
      applianceCards.push({ name: `${data.gasAppliances.heating.brand || ''} HVAC`.trim(), strategy: 'PRE-COOLING STRATEGY', description: `Schedule cooling cycles during peak solar hours (10am-3pm) to pre-cool the home using free solar energy. Reduces evening grid consumption significantly.` });
    }
    if (data.hasPool) {
      applianceCards.push({ name: 'POOL HEAT PUMP', strategy: 'SOLAR SOAKING', description: `Run pool filtration and heating during 10am-3pm solar window. Estimated ${data.poolPumpSavings || 500}/year savings by shifting from grid to solar power.` });
    }
    if (data.gasAppliances?.hotWater) {
      applianceCards.push({ name: `${data.gasAppliances.hotWater.brand || ''} HOT WATER`.trim(), strategy: 'HEAT PUMP UPGRADE', description: `Replace gas hot water with heat pump system. COP of 3.5 means 1kWh electricity produces 3.5kWh of heat — powered by your solar array.` });
    }
    if (data.gasAppliances?.cooktop) {
      applianceCards.push({ name: 'INDUCTION COOKTOP', strategy: 'GAS ELIMINATION', description: `Replace gas cooktop with induction. 90% energy efficiency vs 40% for gas. Powered by solar during daytime cooking.` });
    }
    if (data.hasEV) {
      applianceCards.push({ name: 'EV CHARGER', strategy: 'SOLAR ONLY MODE', description: `Dedicated EV charging circuit with solar-only scheduling. Charge during peak solar hours for near-zero fuel costs.` });
    }
    if (applianceCards.length > 0) {
      slides.push({
        id: slideId++,
        type: 'system_integration',
        title: 'SYSTEM INTEGRATION',
        subtitle: 'Targeted Control of Existing Mechanical Assets',
        content: {
          appliances: applianceCards,
        }
      });
    }
  }
  
  // Slide: CONCLUSION (narrative + recommendation callout)
  slides.push({
    id: slideId++,
    type: 'conclusion',
    title: 'CONCLUSION',
    subtitle: 'The Path to Energy Independence',
    content: {
      currentAnnualCost: data.annualCost,
      projectedAnnualCost: data.annualCost - data.annualSavings,
      annualSavings: data.annualSavings,
      systemSize: data.solarSizeKw,
      batterySize: data.batterySizeKwh,
      netInvestment: data.netInvestment,
      rebateAmount: data.rebateAmount,
      paybackYears: data.paybackYears,
      vppProvider: data.vppProvider,
      recommendation: `PROCEED WITH THE ${data.solarSizeKw}KW / ${data.batterySizeKwh}KWH SYSTEM INSTALLATION.`,
    }
  });
  
  // Slide: CONTACT (George Fotopoulos details — clean, no numbered steps)
  slides.push({
    id: slideId++,
    type: 'contact',
    title: BRAND.contact.name.toUpperCase(),
    subtitle: BRAND.contact.title,
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
  
  return slides;
}
// Helper functions
function generateYearlyProjection(currentCost: number, annualSavings: number, years: number): Array<{ year: number; withoutSolar: number; withSolar: number; cumulativeSavings: number }> {
  const projection = [];
  let cumulativeSavings = 0;
  const inflationRate = 0.035;
  for (let i = 1; i <= years; i++) {
    const inflatedCost = currentCost * Math.pow(1 + inflationRate, i);
    const withSolar = Math.max(0, inflatedCost - annualSavings);
    cumulativeSavings += inflatedCost - withSolar;
    projection.push({ year: i, withoutSolar: Math.round(inflatedCost), withSolar: Math.round(withSolar), cumulativeSavings: Math.round(cumulativeSavings) });
  }
  return projection;
}

function findPeakMonth(monthlyData?: { month: string; kwh: number }[]): { month: string; kwh: number } | null {
  if (!monthlyData || monthlyData.length === 0) return null;
  return monthlyData.reduce((max, curr) => curr.kwh > max.kwh ? curr : max, monthlyData[0]);
}

function calculateBatteryModules(totalKwh: number): string {
  const moduleSize = 8.06;
  const count = Math.ceil(totalKwh / moduleSize);
  return `${count} x ${moduleSize} KWH`;
}

function getVPPProviders(state: string, hasGas: boolean): Array<{
  provider: string; program: string; gasBundle: boolean; annualValue: string; strategicFit: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'COMPLEX';
}> {
  const providers = [
    { provider: 'ENGIE', program: 'VPP Advantage', gasBundle: true, annualValue: '$450+', strategicFit: 'EXCELLENT' as const },
    { provider: 'ORIGIN', program: 'Loop VPP', gasBundle: true, annualValue: '~$300', strategicFit: 'GOOD' as const },
    { provider: 'AGL', program: 'Night Saver', gasBundle: true, annualValue: '~$250', strategicFit: 'MODERATE' as const },
    { provider: 'AMBER ELECTRIC', program: 'SmartShift', gasBundle: false, annualValue: 'VARIABLE', strategicFit: 'COMPLEX' as const },
    { provider: 'SIMPLY ENERGY', program: 'VPP Access', gasBundle: true, annualValue: '~$280', strategicFit: 'MODERATE' as const },
    { provider: 'ENERGY LOCALS', program: 'Community VPP', gasBundle: false, annualValue: '~$200', strategicFit: 'MODERATE' as const },
    { provider: 'POWERSHOP', program: 'Battery Saver', gasBundle: false, annualValue: '~$220', strategicFit: 'MODERATE' as const },
    { provider: 'RED ENERGY', program: 'PowerResponse', gasBundle: true, annualValue: '~$260', strategicFit: 'GOOD' as const },
    { provider: 'MOMENTUM ENERGY', program: 'VPP Program', gasBundle: true, annualValue: '~$240', strategicFit: 'MODERATE' as const },
    { provider: 'LUMO ENERGY', program: 'Battery VPP', gasBundle: true, annualValue: '~$230', strategicFit: 'MODERATE' as const },
    { provider: 'ALINTA ENERGY', program: 'Home Battery', gasBundle: true, annualValue: '~$270', strategicFit: 'GOOD' as const },
    { provider: 'TANGO ENERGY', program: 'VPP Rewards', gasBundle: false, annualValue: '~$180', strategicFit: 'MODERATE' as const },
    { provider: 'GLOBIRD ENERGY', program: 'Battery Connect', gasBundle: false, annualValue: '~$190', strategicFit: 'MODERATE' as const },
  ];
  if (hasGas) {
    return providers.sort((a, b) => {
      if (a.gasBundle && !b.gasBundle) return -1;
      if (!a.gasBundle && b.gasBundle) return 1;
      return 0;
    });
  }
  return providers;
}

// ============================================================
// HTML SLIDE GENERATORS - Matching Paul Stokes Best Example
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
    padding: 60px 80px;
    position: relative;
    overflow: hidden;
  }
  
  /* Header area with title left, subtitle right */
  .slide-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 8px;
  }
  
  .slide-title {
    font-family: 'NextSphere', sans-serif;
    font-size: 64px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: #FFFFFF;
    line-height: 1.1;
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
  
  /* Thin aqua line separator under heading */
  .aqua-line {
    width: 100%;
    height: 1px;
    background: #00EAD3;
    margin-bottom: 36px;
  }
  
  .logo {
    position: absolute;
    top: 40px;
    right: 60px;
    width: 60px;
    height: 60px;
  }
  
  /* Hero numbers - GeneralSans for all numeric content */
  .hero-num {
    font-family: 'GeneralSans', sans-serif;
    font-weight: 700;
    line-height: 1;
  }
  .hero-num.aqua { color: #00EAD3; }
  .hero-num.white { color: #FFFFFF; }
  .hero-num.orange { color: #f36710; }
  .hero-num .unit { font-family: 'GeneralSans', sans-serif; font-weight: 400; }
  
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
    border-radius: 8px;
    padding: 24px;
  }
  .card.aqua-b { border-color: #00EAD3; }
  .card.orange-b { border-color: #f36710; }
  .card.white-b { border-color: #FFFFFF; }
  
  /* Insight cards - dark grey bg with colored left border */
  .insight-card {
    background: #1a1a1a;
    border-radius: 8px;
    padding: 24px 28px;
    border-left: 4px solid #00EAD3;
  }
  .insight-card.orange { border-left-color: #f36710; }
  .insight-card .insight-title {
    font-family: 'NextSphere', sans-serif;
    font-size: 18px;
    font-weight: 800;
    color: #00EAD3;
    text-transform: uppercase;
    margin-bottom: 10px;
  }
  .insight-card.orange .insight-title { color: #f36710; }
  .insight-card p { color: #808285; font-size: 14px; line-height: 1.6; }
  .insight-card .hl-aqua { color: #00EAD3; font-weight: 600; }
  .insight-card .hl-orange { color: #f36710; font-weight: 600; }
  .insight-card .hl-white { color: #FFFFFF; font-weight: 600; }
  
  /* Badges */
  .badge { display: inline-block; padding: 4px 14px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
  .badge.excellent { background: #00EAD3; color: #000; }
  .badge.good { background: #22c55e; color: #000; }
  .badge.moderate { background: #f36710; color: #000; }
  .badge.complex { background: #555; color: #fff; }
  .badge.high { background: #ef4444; color: #fff; }
  .badge.medium { background: #f36710; color: #000; }
  .badge.low { background: #22c55e; color: #000; }
  
  /* Tables */
  table { width: 100%; border-collapse: collapse; }
  th {
    font-family: 'Urbanist', sans-serif;
    font-size: 11px;
    color: #00EAD3;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    text-align: left;
    padding: 12px 16px;
    border-bottom: 1px solid #333;
  }
  td { padding: 14px 16px; border-bottom: 1px solid #1a1a1a; font-size: 15px; }
  .highlight-row { background: rgba(0, 234, 211, 0.08); border-left: 3px solid #00EAD3; }
  
  /* Colors */
  .aqua { color: #00EAD3; }
  .orange { color: #f36710; }
  .gray { color: #808285; }
  .white { color: #FFFFFF; }
  
  /* Copyright */
  .copyright {
    position: absolute;
    bottom: 28px;
    left: 80px;
    font-size: 11px;
    color: #808285;
    font-family: 'GeneralSans', sans-serif;
  }
</style>
`;

function slideHeader(title: string, subtitle?: string): string {
  return `
    <div class="slide-header">
      <h1 class="slide-title">${title}</h1>
      ${subtitle ? `<p class="slide-subtitle">${subtitle}</p>` : ''}
    </div>
    <div class="aqua-line"></div>
  `;
}

export function generateSlideHTML(slide: SlideContent): string {
  try {
    let content = '';
    switch (slide.type) {
      case 'cover': content = genCover(slide); break;
      case 'executive_summary': content = genExecutiveSummary(slide); break;
      case 'bill_analysis': content = genBillAnalysis(slide); break;
      case 'bill_breakdown': content = genBillBreakdown(slide); break;
      case 'annual_energy_projection': content = genAnnualEnergyProjection(slide); break;
      case 'usage_benchmarking': content = genUsageBenchmarking(slide); break;
      case 'gas_footprint': content = genGasFootprint(slide); break;
      case 'gas_appliances': content = genGasAppliances(slide); break;
      case 'solar_recommendation': content = genSolarRecommendation(slide); break;
      case 'battery_recommendation': content = genBatteryRecommendation(slide); break;
      case 'why_battery': content = genWhyBattery(slide); break;
      case 'battery_considerations': content = genBatteryConsiderations(slide); break;
      case 'vpp_comparison': content = genVPPComparison(slide); break;
      case 'vpp_recommendation': content = genVPPRecommendation(slide); break;
      case 'ev_analysis': content = genEVAnalysis(slide); break;
      case 'ev_vs_petrol': content = genEVvsPetrol(slide); break;
      case 'financial_investment': content = genFinancialInvestment(slide); break;
      case 'return_on_investment': content = genReturnOnInvestment(slide); break;
      case 'roadmap': content = genRoadmap(slide); break;
      case 'energy_optimisation': content = genEnergyOptimisation(slide); break;
      case 'required_electrical_works': content = genRequiredElectricalWorks(slide); break;
      case 'system_integration': content = genSystemIntegration(slide); break;
      case 'hot_water_electrification': content = genHotWater(slide); break;
      case 'heating_cooling': content = genHeatingCooling(slide); break;
      case 'induction_cooking': content = genInduction(slide); break;
      case 'pool_heat_pump': content = genPoolHeatPump(slide); break;
      case 'electrification_investment': content = genElectrificationInvestment(slide); break;
      case 'conclusion': content = genConclusion(slide); break;
      case 'contact': content = genContact(slide); break;
      default: content = genGeneric(slide);
    }
    return `<!DOCTYPE html><html><head><meta charset="UTF-8">${SLIDE_STYLES}</head><body>${content}</body></html>`;
  } catch (err: any) {
    console.error(`[generateSlideHTML] Error generating ${slide.type}:`, err.message);
    // Return a valid error slide so generation never fully fails
    const errorContent = `
      <div class="slide">
        <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
        ${slideHeader(slide.title || slide.type.toUpperCase(), 'Slide generation encountered an issue — please regenerate')}
        <div style="flex: 1; display: flex; align-items: center; justify-content: center;">
          <p style="color: #808285; font-size: 18px;">This slide will be regenerated with your data.</p>
        </div>
        <div class="copyright">${BRAND.contact.copyright}</div>
      </div>
    `;
    return `<!DOCTYPE html><html><head><meta charset="UTF-8">${SLIDE_STYLES}</head><body>${errorContent}</body></html>`;
  }
}

// ---- SLIDE 1: COVER ----
function genCover(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  return `
    <div class="slide" style="display: flex; flex-direction: column; justify-content: center; padding: 80px; background: #000000 url('${COVER_BG_URI}') no-repeat right center; background-size: contain;">
      <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 60px;">
        <img src="${LOGO_URI_AQUA}" style="width: 50px; height: 50px;" alt="LE" />
        <span style="font-family: 'NextSphere', sans-serif; font-size: 24px; color: #00EAD3; letter-spacing: 0.15em;">LIGHTNING ENERGY</span>
      </div>
      <h1 style="font-family: 'NextSphere', sans-serif; font-size: 56px; font-weight: 800; color: #FFFFFF; text-transform: uppercase; line-height: 1.15; max-width: 800px;">IN-DEPTH BILL ANALYSIS &amp; SOLAR BATTERY PROPOSAL</h1>
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

// ---- SLIDE 2: EXECUTIVE SUMMARY ----
function genExecutiveSummary(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 50px; margin-top: 20px;">
        <div style="flex: 1.3;">
          <div style="font-size: 15px; line-height: 1.9; color: #FFFFFF;">
            ${c.narrativeOverview || `This comprehensive analysis evaluates your current energy expenditure of <span class="hl-aqua">$${(c.currentAnnualCost as number || 0).toLocaleString()}</span> per annum and presents a tailored solar + battery solution designed to deliver <span class="hl-aqua">$${(c.totalAnnualSavings as number || 0).toLocaleString()} in annual savings</span>.`}
          </div>
          ${c.strategicRecommendation ? `
          <div style="border-left: 4px solid #00EAD3; padding: 16px 24px; background: #1a1a1a; border-radius: 0 8px 8px 0; margin-top: 28px;">
            <p style="font-family: 'Urbanist', sans-serif; font-size: 12px; color: #00EAD3; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 8px;">STRATEGIC RECOMMENDATION</p>
            <p style="font-size: 14px; line-height: 1.7; color: #ccc;">${c.strategicRecommendation}</p>
          </div>
          ` : ''}
        </div>
        <div style="flex: 0.7; display: flex; flex-direction: column; gap: 0;">
          <div style="border-bottom: 1px solid #333; padding: 20px 0;">
            <p class="lbl">CURRENT ANNUAL COST</p>
            <p class="hero-num white" style="font-size: 48px;">$${(c.currentAnnualCost as number || 0).toLocaleString()}</p>
          </div>
          <div style="border-bottom: 1px solid #333; padding: 20px 0;">
            <p class="lbl">RECOMMENDED SOLAR</p>
            <p class="hero-num white" style="font-size: 48px;">${c.systemSize || '6.6'} <span class="unit" style="font-size: 20px;">KW</span></p>
          </div>
          <div style="border-bottom: 1px solid #333; padding: 20px 0;">
            <p class="lbl">RECOMMENDED BATTERY</p>
            <p class="hero-num white" style="font-size: 48px;">${c.batterySize || '10'} <span class="unit" style="font-size: 20px;">KWH</span></p>
          </div>
          <div style="border-bottom: 1px solid #333; padding: 20px 0;">
            <p class="lbl">PAYBACK PERIOD</p>
            <p class="hero-num orange" style="font-size: 48px;">${(c.paybackYears as number || 0).toFixed(1)} <span class="unit" style="font-size: 20px;">YRS</span></p>
          </div>
          <div style="padding: 20px 0;">
            <p class="lbl">10-YEAR NET BENEFIT</p>
            <p class="hero-num aqua" style="font-size: 48px;">$${(c.tenYearBenefit as number || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- SLIDE 3: BILL ANALYSIS ----
function genBillAnalysis(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1.2;">
          <table>
            <tr><th>COMPONENT</th><th>DETAILS</th><th style="text-align: right; color: #f36710;">AMOUNT</th></tr>
            <tr><td>General Usage</td><td class="gray">${(c.annualCost as number / (c.usageRate as number / 100)).toFixed(0)} kWh @ $${(c.usageRate as number / 100).toFixed(4)}/kWh</td><td style="text-align: right; font-weight: 600;">$${Math.round(c.usageCost as number).toLocaleString()}</td></tr>
            <tr><td>Daily Supply Charge</td><td class="gray">365 days @ $${(c.supplyCharge as number / 100).toFixed(4)}/day</td><td style="text-align: right; font-weight: 600;">$${Math.round(c.supplyCost as number).toLocaleString()}</td></tr>
            <tr><td>Solar Feed-in Credit</td><td class="gray">@ ${c.feedInTariff}¢/kWh</td><td style="text-align: right; color: #00EAD3;">Credit</td></tr>
            <tr class="highlight-row"><td style="font-weight: 700; color: #00EAD3;">NET ANNUAL BILL</td><td></td><td style="text-align: right; font-weight: 700; color: #00EAD3; font-size: 20px;">$${(c.annualCost as number).toLocaleString()}</td></tr>
          </table>
        </div>
        <div style="flex: 0.8;">
          <div class="insight-card orange" style="margin-bottom: 24px;">
            <p class="insight-title">ANALYSIS</p>
            ${c.narrative ? `<div style="font-size: 13px; line-height: 1.7; color: #ccc;">${c.narrative}</div>` : `<p>Your current feed-in tariff of <span class="hl-aqua">${c.feedInTariff}¢/kWh</span> is significantly below the usage rate of <span class="hl-orange">${c.usageRate}¢/kWh</span>. Self-consumption with battery storage will capture the full value of your solar generation.</p>`}
          </div>
          <div style="display: flex; gap: 16px;">
            <div class="card" style="flex: 1; text-align: center;">
              <p class="lbl">USAGE RATE</p>
              <p style="font-size: 28px; color: #f36710; font-weight: 600;">${c.usageRate}¢</p>
              <p class="gray" style="font-size: 11px;">per kWh</p>
            </div>
            <div class="card" style="flex: 1; text-align: center;">
              <p class="lbl">FEED-IN</p>
              <p style="font-size: 28px; color: #00EAD3; font-weight: 600;">${c.feedInTariff}¢</p>
              <p class="gray" style="font-size: 11px;">per kWh</p>
            </div>
          </div>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- SLIDE 4: USAGE ANALYSIS ----
function genUsageAnalysis(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const daily = c.dailyAverageKwh as number;
  const benchmarks = [
    { label: 'Your Usage', kwh: daily, color: '#00EAD3' },
    { label: 'Small Home', kwh: 7.49, color: '#333' },
    { label: 'Medium Home', kwh: 12.70, color: '#333' },
    { label: 'Large Home', kwh: 14.71, color: '#333' },
  ];
  const maxKwh = Math.max(...benchmarks.map(b => b.kwh), 16);
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1.2;">
          <p class="lbl" style="margin-bottom: 16px;">DAILY ENERGY USAGE COMPARISON (kWh)</p>
          <div style="display: flex; align-items: flex-end; height: 320px; gap: 30px; padding: 0 20px;">
            ${benchmarks.map(b => `
              <div style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end;">
                <p style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: ${b.color === '#00EAD3' ? '#00EAD3' : '#FFFFFF'};">${b.kwh.toFixed(1)}</p>
                <div style="width: 100%; height: ${(b.kwh / maxKwh) * 260}px; background: ${b.color}; border-radius: 8px 8px 0 0;"></div>
                <p style="font-size: 11px; color: #808285; margin-top: 8px; text-align: center;">${b.label}</p>
              </div>
            `).join('')}
          </div>
        </div>
        <div style="flex: 0.8;">
          <p class="lbl" style="margin-bottom: 16px;">COMPARISON TABLE</p>
          ${benchmarks.map(b => `
            <div style="display: flex; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #1a1a1a;">
              <span style="color: #808285;">${b.label}</span>
              <span style="font-weight: 600; color: ${b.color === '#00EAD3' ? '#00EAD3' : '#FFFFFF'};">${b.kwh.toFixed(2)} KWH</span>
            </div>
          `).join('')}
          <div class="insight-card orange" style="margin-top: 24px;">
            <p class="insight-title">ANALYSIS</p>
            ${c.narrative ? `<div style="font-size: 13px; line-height: 1.7; color: #ccc;">${c.narrative}</div>` : `<p>Your daily usage of <span class="hl-aqua">${daily.toFixed(1)} kWh</span> is <span class="hl-orange">${Math.round((1 - daily / 12.7) * 100)}%</span> below the medium household average, indicating an energy-efficient home.</p>`}
          </div>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- SLIDE 5: YEARLY PROJECTION ----
function genYearlyProjection(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const projection = (c.yearlyProjection as Array<{ year: number; withoutSolar: number; withSolar: number; cumulativeSavings: number }>) || [];
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1;">
          <table>
            <tr><th>PERIOD</th><th style="text-align: right;">GRID USAGE</th><th style="text-align: right;">SOLAR EXPORT</th><th style="text-align: right;">NET COST</th></tr>
            <tr><td>Monthly Avg</td><td style="text-align: right;">${Math.round((c.currentAnnualCost as number) / 12)} kWh</td><td style="text-align: right;">Est.</td><td style="text-align: right; font-weight: 600;">$${Math.round((c.currentAnnualCost as number) / 12).toLocaleString()}</td></tr>
            <tr><td>Annual Total</td><td style="text-align: right;">Est.</td><td style="text-align: right;">Est.</td><td style="text-align: right; font-weight: 600;">$${(c.currentAnnualCost as number).toLocaleString()}</td></tr>
          </table>
          <div class="insight-card" style="margin-top: 24px;">
            <p class="insight-title">ANALYSIS</p>
            ${c.narrative ? `<div style="font-size: 13px; line-height: 1.7; color: #ccc;">${c.narrative}</div>` : `<p>With the proposed system, your projected annual cost drops from <span class="hl-orange">$${(c.currentAnnualCost as number).toLocaleString()}</span> to <span class="hl-aqua">$${Math.round(c.projectedAnnualCost as number).toLocaleString()}</span>, delivering cumulative savings of <span class="hl-aqua">$${(c.tenYearSavings as number).toLocaleString()}</span> over 10 years.</p>`}
          </div>
        </div>
        <div style="flex: 1;">
          <p style="font-family: 'NextSphere', sans-serif; font-size: 18px; font-weight: 800; margin-bottom: 16px;">25-YEAR CUMULATIVE FINANCIAL OUTLOOK</p>
          <div style="height: 320px; position: relative; border-left: 1px solid #333; border-bottom: 1px solid #333; padding: 10px;">
            ${projection.filter((_, i) => i % 5 === 0 || i === projection.length - 1).map((p, i, arr) => {
              const maxVal = (c.twentyFiveYearSavings as number) * 1.2;
              const x = (p.year / 25) * 100;
              const yOrange = 100 - ((p.withoutSolar * p.year * 0.5) / maxVal) * 100;
              const yAqua = 100 - (p.cumulativeSavings / maxVal) * 100;
              return `
                <div style="position: absolute; left: ${x}%; bottom: 0; width: 2px; height: 100%; border-left: 1px dashed #1a1a1a;"></div>
                <div style="position: absolute; left: ${x}%; bottom: ${100 - yAqua}%; width: 8px; height: 8px; background: #00EAD3; border-radius: 50%; transform: translate(-4px, 4px);"></div>
                <div style="position: absolute; left: ${x}%; bottom: ${100 - yOrange}%; width: 8px; height: 8px; background: #f36710; border-radius: 50%; transform: translate(-4px, 4px);"></div>
              `;
            }).join('')}
          </div>
          <div style="display: flex; gap: 24px; margin-top: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 12px; height: 12px; background: #f36710; border-radius: 50%;"></div><span style="font-size: 11px; color: #808285;">Cumulative Bill Cost (Current)</span></div>
            <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 12px; height: 12px; background: #00EAD3; border-radius: 50%;"></div><span style="font-size: 11px; color: #808285;">Cumulative Total Benefit (Proposed)</span></div>
          </div>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- SLIDE 6: GAS FOOTPRINT ----
function genGasFootprint(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1;">
          <div class="card orange-b" style="text-align: center; padding: 36px; margin-bottom: 20px;">
            <p class="lbl">ANNUAL GAS COST</p>
            <p class="hero-num orange" style="font-size: 64px;">$${(c.annualCost as number).toLocaleString()}</p>
          </div>
          <div style="display: flex; gap: 16px;">
            <div class="card" style="flex: 1; text-align: center;"><p class="lbl">ANNUAL USAGE</p><p style="font-size: 22px;">${(c.annualMJ as number).toLocaleString()} MJ</p></div>
            <div class="card" style="flex: 1; text-align: center;"><p class="lbl">kWh EQUIVALENT</p><p style="font-size: 22px;">${Math.round(c.kwhEquivalent as number).toLocaleString()} kWh</p></div>
          </div>
        </div>
        <div style="flex: 1;">
          <div class="card" style="margin-bottom: 20px;">
            <p class="lbl">CO2 EMISSIONS FROM GAS</p>
            <p class="hero-num orange" style="font-size: 48px;">${(c.co2Emissions as number).toFixed(1)}<span style="font-size: 18px; color: #808285;"> tonnes/year</span></p>
          </div>
          <div class="insight-card">
            <p class="insight-title">ELECTRIFICATION OPPORTUNITY</p>
            <p>By replacing gas appliances with efficient electric alternatives, you can eliminate <span class="hl-orange">$${(c.annualCost as number).toLocaleString()}/year</span> in gas costs and <span class="hl-aqua">${(c.co2Emissions as number).toFixed(1)} tonnes</span> of CO2 emissions entirely.</p>
          </div>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- SLIDE 7: GAS APPLIANCES ----
function genGasAppliances(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const priorities = (c.electrificationPriority as Array<{ name: string; type: string; priority: string; savings: number }>) || [];
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <table style="margin-top: 10px;">
        <tr><th>APPLIANCE</th><th>CURRENT TYPE</th><th>PRIORITY</th><th style="text-align: right;">EST. ANNUAL SAVINGS</th></tr>
        ${priorities.map(p => `
          <tr>
            <td style="font-weight: 600;">${p.name}</td>
            <td class="gray">${p.type}</td>
            <td><span class="badge ${p.priority.toLowerCase()}">${p.priority}</span></td>
            <td style="text-align: right; color: #00EAD3; font-weight: 600;">$${p.savings.toLocaleString()}</td>
          </tr>
        `).join('')}
      </table>
      <div class="insight-card" style="margin-top: 30px;">
        <p class="insight-title">TOTAL GAS ELIMINATION POTENTIAL</p>
        <p>Annual Gas Cost: <span class="hl-orange">$${(c.totalGasCost as number).toLocaleString()}</span> → <span class="hl-aqua">$0</span> through complete electrification of all gas appliances.</p>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- SLIDE 8: STRATEGIC ASSESSMENT ----
function genStrategic(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const advantages = c.advantages as Array<{ icon: string; title: string; description: string }>;
  const considerations = c.considerations as Array<{ icon: string; title: string; description: string }>;
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 40px; margin-top: 10px;">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
            <span style="color: #00EAD3; font-size: 24px;">✓</span>
            <span style="font-family: 'NextSphere', sans-serif; font-size: 20px; font-weight: 800; color: #00EAD3;">KEY ADVANTAGES</span>
          </div>
          <div style="border-bottom: 2px solid #00EAD3; margin-bottom: 20px;"></div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            ${advantages.map(a => `
              <div>
                <p style="font-size: 20px; margin-bottom: 6px;">${a.icon}</p>
                <p style="font-family: 'NextSphere', sans-serif; font-size: 13px; font-weight: 800; color: #FFFFFF; margin-bottom: 4px;">${a.title}</p>
                <p style="color: #808285; font-size: 12px; line-height: 1.5;">${a.description}</p>
              </div>
            `).join('')}
          </div>
        </div>
        <div style="width: 1px; background: #333;"></div>
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
            <span style="color: #f36710; font-size: 24px;">⚠</span>
            <span style="font-family: 'NextSphere', sans-serif; font-size: 20px; font-weight: 800; color: #f36710;">CONSIDERATIONS</span>
          </div>
          <div style="border-bottom: 2px solid #f36710; margin-bottom: 20px;"></div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            ${considerations.map(co => `
              <div>
                <p style="font-size: 20px; margin-bottom: 6px;">${co.icon}</p>
                <p style="font-family: 'NextSphere', sans-serif; font-size: 13px; font-weight: 800; color: #FFFFFF; margin-bottom: 4px;">${co.title}</p>
                <p style="color: #808285; font-size: 12px; line-height: 1.5;">${co.description}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- SLIDE 9: BATTERY RECOMMENDATION ----
function genBattery(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const cap = c.whyThisCapacity as { home: number; evCharge: number; vppTrade: number };
  const total = c.totalCapacity as number;
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1;">
          <div style="text-align: center; margin-bottom: 30px;">
            <p class="lbl">TOTAL USABLE CAPACITY</p>
            <p class="hero-num aqua" style="font-size: 96px;">${total}<span style="font-size: 28px; color: #FFFFFF;"> KWH</span></p>
          </div>
          <div style="display: flex; gap: 16px;">
            <div class="card" style="flex: 1; border-top: 3px solid #00EAD3;">
              <p class="lbl" style="color: #00EAD3;">INVERTER</p>
              <p style="font-size: 20px; font-weight: 600;">${c.inverterSize} KW ${c.inverterType}</p>
            </div>
            <div class="card" style="flex: 1; border-top: 3px solid #00EAD3;">
              <p class="lbl" style="color: #00EAD3;">MODULES</p>
              <p style="font-size: 20px; font-weight: 600;">${c.modules}</p>
            </div>
            <div class="card" style="flex: 1; border-top: 3px solid #00EAD3;">
              <p class="lbl" style="color: #00EAD3;">TECHNOLOGY</p>
              <p style="font-size: 20px; font-weight: 600;">${c.technology}</p>
            </div>
          </div>
        </div>
        <div style="flex: 1;">
          <p style="font-family: 'NextSphere', sans-serif; font-size: 18px; font-weight: 800; margin-bottom: 20px;">WHY THIS CAPACITY?</p>
          <div style="display: flex; height: 44px; border-radius: 6px; overflow: hidden; margin-bottom: 16px;">
            <div style="width: ${(cap.home / total) * 100}%; background: #808285; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600;">HOME ~${cap.home.toFixed(0)}kWh</div>
            ${cap.evCharge > 0 ? `<div style="width: ${(cap.evCharge / total) * 100}%; background: #00EAD3; color: #000; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600;">EV CHARGE ~${cap.evCharge}kWh</div>` : ''}
            <div style="width: ${(cap.vppTrade / total) * 100}%; background: #f36710; color: #000; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600;">VPP TRADE ~${cap.vppTrade.toFixed(0)}kWh</div>
          </div>
          <div style="display: flex; gap: 20px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 6px;"><div style="width: 10px; height: 10px; background: #808285; border-radius: 50%;"></div><span style="font-size: 11px; color: #808285;">Home Overnight</span></div>
            ${cap.evCharge > 0 ? `<div style="display: flex; align-items: center; gap: 6px;"><div style="width: 10px; height: 10px; background: #00EAD3; border-radius: 50%;"></div><span style="font-size: 11px; color: #808285;">EV Charging</span></div>` : ''}
            <div style="display: flex; align-items: center; gap: 6px;"><div style="width: 10px; height: 10px; background: #f36710; border-radius: 50%;"></div><span style="font-size: 11px; color: #808285;">VPP Trading</span></div>
          </div>
          ${c.narrativeWhy ? `<div style="font-size: 13px; line-height: 1.7; color: #ccc; margin-bottom: 12px;">${c.narrativeWhy}</div>` : ''}
          ${c.narrativeFinancial ? `<div style="font-size: 13px; line-height: 1.7; color: #ccc;">${c.narrativeFinancial}</div>` : `<p style="color: #808285; font-size: 14px; line-height: 1.6;">${c.explanation}</p>`}
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- SLIDE 10: SOLAR SYSTEM ----
function genSolar(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const features = c.features as Array<{ icon: string; title: string; description: string }>;
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 30px; margin-top: 10px;">
        <div class="card" style="flex: 1; text-align: center; padding: 30px;">
          <p class="lbl">SYSTEM SIZE</p>
          <p class="hero-num white" style="font-size: 72px;">${c.systemSize}<span style="font-size: 20px; color: #808285;"> KW</span></p>
        </div>
        <div class="card" style="flex: 1; text-align: center; padding: 30px;">
          <p class="lbl">PANEL COUNT</p>
          <p class="hero-num white" style="font-size: 72px;">${c.panelCount}<span style="font-size: 20px; color: #00EAD3;"> UNITS</span></p>
        </div>
        <div class="card orange-b" style="flex: 1; text-align: center; padding: 30px; background: rgba(232,115,26,0.05);">
          <p class="lbl" style="color: #f36710;">HARDWARE TECHNOLOGY</p>
          <p class="hero-num orange" style="font-size: 72px;">${c.panelPower}<span style="font-size: 20px; color: #808285;"> W</span></p>
          <p class="gray" style="font-size: 13px; margin-top: 8px;">${c.panelBrand}</p>
        </div>
      </div>
      <div style="display: flex; gap: 30px; margin-top: 24px;">
        <div class="insight-card" style="flex: 1;">
          <p class="insight-title">WHY ${(c.panelBrand as string).split(' ')[0].toUpperCase()}?</p>
          <p>${c.whyThisBrand}</p>
        </div>
        <div style="flex: 1;">
          <p style="font-family: 'NextSphere', sans-serif; font-size: 16px; font-weight: 800; color: #f36710; margin-bottom: 16px;">PERFORMANCE & WARRANTY</p>
          ${features.map(f => `
            <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 14px;">
              <span style="color: #00EAD3; font-size: 10px; margin-top: 4px;">●</span>
              <div>
                <p style="font-weight: 600; font-size: 14px;">${f.title}</p>
                <p style="color: #808285; font-size: 12px;">${f.description}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- SLIDE 11: VPP COMPARISON ----
function genVPPComparison(slide: SlideContent): string {
  const c = (slide.content || {}) as Record<string, unknown>;
  const providers = (c.providers as Array<{ provider: string; program: string; gasBundle: boolean; annualValue: string; strategicFit: string }>) || [];
  const rec = (c.recommendedProvider as string) || '';
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <table style="margin-top: 10px;">
        <tr><th>PROVIDER</th><th>VPP MODEL</th><th>GAS BUNDLE</th><th>EST. ANNUAL VALUE</th><th>STRATEGIC FIT</th></tr>
        ${providers.map(p => `
          <tr class="${p.provider === rec ? 'highlight-row' : ''}">
            <td style="font-weight: 600;">${p.provider}${p.provider === rec ? '<br/><span style="color: #f36710; font-size: 11px;">Recommended</span>' : ''}</td>
            <td><span style="color: #f36710;">${p.program}</span></td>
            <td>${p.gasBundle ? '<span style="color: #00EAD3;">✓ Yes</span>' : '<span class="gray">✗ No</span>'}</td>
            <td style="font-weight: 600;">${p.annualValue}</td>
            <td><span class="badge ${p.strategicFit.toLowerCase()}">${p.strategicFit}</span></td>
          </tr>
        `).join('')}
      </table>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- SLIDE 12: VPP RECOMMENDATION ----
function genVPPRecommendation(slide: SlideContent): string {
  const c = (slide.content || {}) as Record<string, unknown>;
  const strategicFit = (c.strategicFit as Array<{ icon: string; title: string; description: string }>) || [];
  const financialValue = (c.financialValue as Array<{ icon: string; title: string; description: string }>) || [];
  const allFeatures = [...strategicFit, ...financialValue];
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="text-align: center; margin-top: 20px;">
        <p class="lbl">SELECTED PARTNER</p>
        <p style="font-family: 'NextSphere', sans-serif; font-size: 72px; font-weight: 800; margin: 10px 0;">${c.provider || 'TBD'}</p>
        <p style="color: #00EAD3; font-size: 22px; font-family: 'Urbanist', sans-serif;">${c.program || ''}</p>
      </div>
      <div style="display: flex; gap: 24px; margin-top: 36px;">
        ${allFeatures.map(f => `
          <div class="card" style="flex: 1; text-align: center; border-top: 3px solid #f36710;">
            <p style="color: #f36710; font-size: 28px; margin-bottom: 12px;">${f.icon}</p>
            <p style="font-family: 'NextSphere', sans-serif; font-size: 14px; font-weight: 800; margin-bottom: 8px;">${f.title}</p>
            <p style="color: #808285; font-size: 13px; line-height: 1.5;">${f.description}</p>
          </div>
        `).join('')}
      </div>
      <div style="display: flex; align-items: center; gap: 20px; margin-top: 36px;">
        <div style="width: 4px; height: 60px; background: #00EAD3; border-radius: 2px;"></div>
        <div>
          <p class="lbl">Estimated Annual Value (Credits + Bundle Savings)</p>
          <p class="hero-num aqua" style="font-size: 64px;">~$${c.annualValue}<span style="font-size: 22px;"> / YEAR</span></p>
        </div>
      </div>
      ${c.narrative ? `<div style="margin-top: 20px; font-size: 13px; line-height: 1.7; color: #ccc;">${c.narrative}</div>` : ''}
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- SLIDE 13-15: ELECTRIFICATION SLIDES (Hot Water, Heating, Induction) ----
function genElectrificationSlide(slide: SlideContent, type: string): string {
  const c = slide.content as Record<string, unknown>;
  const features = (c.features as string[]) || [];
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1;">
          <div class="card" style="margin-bottom: 20px;">
            <p class="lbl">CURRENT SYSTEM</p>
            <p style="font-size: 22px; color: #f36710; font-weight: 600;">${c.currentSystem}</p>
            <p class="gray" style="margin-top: 8px;">Annual Cost: <span class="orange">$${c[type === 'hot_water' ? 'annualGasCost' : type === 'heating' ? 'annualGasCost' : 'annualGasCost']}/year</span></p>
          </div>
          <div class="card aqua-b">
            <p class="lbl" style="color: #00EAD3;">RECOMMENDED UPGRADE</p>
            <p style="font-size: 22px; font-weight: 600;">${c.recommendedSystem}</p>
            ${c.cop ? `<p style="color: #00EAD3; margin-top: 8px;">COP: ${c.cop} (${c.cop}x more efficient)</p>` : ''}
          </div>
        </div>
        <div style="flex: 1;">
          <div class="card orange-b" style="text-align: center; margin-bottom: 20px; padding: 30px;">
            <p class="lbl">ANNUAL SAVINGS</p>
            <p class="hero-num aqua" style="font-size: 56px;">$${c.annualSavings}</p>
          </div>
          <div style="display: flex; gap: 16px; margin-bottom: 20px;">
            <div class="card" style="flex: 1; text-align: center;">
              <p class="lbl">INSTALL COST</p>
              <p style="font-size: 20px;">$${(c.installCost as number).toLocaleString()}</p>
            </div>
            ${c.rebates !== undefined ? `
              <div class="card" style="flex: 1; text-align: center;">
                <p class="lbl" style="color: #00EAD3;">REBATES</p>
                <p style="font-size: 20px; color: #00EAD3;">-$${(c.rebates as number).toLocaleString()}</p>
              </div>
              <div class="card aqua-b" style="flex: 1; text-align: center;">
                <p class="lbl">NET COST</p>
                <p style="font-size: 20px;">$${(c.netCost as number).toLocaleString()}</p>
              </div>
            ` : ''}
          </div>
          ${features.length > 0 ? `
            <p class="lbl" style="margin-bottom: 10px;">KEY BENEFITS</p>
            ${features.map(f => `<p style="color: #808285; font-size: 13px; margin-bottom: 6px;">✓ ${f}</p>`).join('')}
          ` : ''}
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

function genHotWater(slide: SlideContent): string { return genElectrificationSlide(slide, 'hot_water'); }
function genHeatingCooling(slide: SlideContent): string { return genElectrificationSlide(slide, 'heating'); }
function genInduction(slide: SlideContent): string { return genElectrificationSlide(slide, 'induction'); }

// ---- SLIDE 16: EV ANALYSIS ----
function genEVAnalysis(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const annualKm = Number(c.annualKm) || 10000;
  const dailyKm = Number(c.dailyKm) || 27.4;
  const vehicleEfficiency = Number(c.vehicleEfficiency) || 15;
  const dailyEnergyNeed = Number(c.dailyEnergyNeed) || 4.1;
  const dailySolarGeneration = Number(c.dailySolarGeneration) || 0;
  const remainingForHome = Number(c.remainingForHome) || 0;
  const evPercentOfSolar = Number(c.evPercentOfSolar) || 0;
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 60px; margin-top: 20px;">
        <div style="flex: 1;">
          <div class="card" style="margin-bottom: 20px;">
            <p class="lbl">DRIVING PROFILE</p>
            <div style="display: flex; gap: 30px; margin-top: 16px;">
              <div>
                <p class="hero-num aqua" style="font-size: 48px;">${(annualKm / 1000).toFixed(0)}k</p>
                <p class="gray" style="font-size: 13px;">km / year</p>
              </div>
              <div>
                <p class="hero-num white" style="font-size: 48px;">${dailyKm}</p>
                <p class="gray" style="font-size: 13px;">km / day</p>
              </div>
            </div>
          </div>
          <div class="card" style="margin-bottom: 20px;">
            <p class="lbl">VEHICLE EFFICIENCY</p>
            <p style="font-size: 22px; margin-top: 12px;"><span class="hl-aqua">${vehicleEfficiency} kWh</span> per 100 km</p>
            <p class="gray" style="margin-top: 8px; font-size: 13px;">Daily energy requirement: <span style="color: #fff;">${dailyEnergyNeed} kWh</span></p>
          </div>
        </div>
        <div style="flex: 1;">
          <div class="card aqua-b" style="margin-bottom: 20px; text-align: center; padding: 30px;">
            <p class="lbl" style="color: #00EAD3;">SOLAR INTEGRATION</p>
            <p class="hero-num aqua" style="font-size: 56px;">${dailySolarGeneration}</p>
            <p class="gray">kWh daily solar generation</p>
          </div>
          <div style="display: flex; gap: 16px;">
            <div class="card" style="flex: 1; text-align: center;">
              <p class="lbl">EV SHARE</p>
              <p style="font-size: 28px; color: #f36710; font-weight: 600;">${evPercentOfSolar.toFixed(0)}%</p>
              <p class="gray" style="font-size: 12px;">of solar output</p>
            </div>
            <div class="card" style="flex: 1; text-align: center;">
              <p class="lbl">REMAINING</p>
              <p style="font-size: 28px; color: #00EAD3; font-weight: 600;">${remainingForHome.toFixed(1)}</p>
              <p class="gray" style="font-size: 12px;">kWh for home</p>
            </div>
          </div>
          <div class="insight-card" style="margin-top: 20px;">
            <p style="color: #808285; font-size: 13px; line-height: 1.6;">Your solar system can power your EV using just <span class="hl-aqua">${evPercentOfSolar.toFixed(0)}%</span> of daily generation, leaving <span class="hl-aqua">${remainingForHome.toFixed(1)} kWh</span> for household use.</p>
          </div>
        </div>
      </div>
      ${c.narrative ? `<div style="margin-top: 16px; font-size: 13px; line-height: 1.7; color: #ccc;">${c.narrative}</div>` : ''}
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- SLIDE 17: EV CHARGER ----
function genEVCharger(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const features = (c.features as string[]) || [];
  const benefits = (c.solarChargingBenefits as string[]) || [];
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1;">
          <div class="card aqua-b" style="margin-bottom: 20px;">
            <p class="lbl" style="color: #00EAD3;">RECOMMENDED CHARGER</p>
            <p style="font-size: 24px; font-weight: 600;">${c.recommendedCharger}</p>
            <p class="gray" style="margin-top: 8px;">${c.chargingSpeed}</p>
          </div>
          <div class="card orange-b" style="text-align: center; padding: 30px;">
            <p class="lbl">INSTALLED COST</p>
            <p class="hero-num white" style="font-size: 48px;">$${(c.installCost as number).toLocaleString()}</p>
          </div>
        </div>
        <div style="flex: 1;">
          <p class="lbl" style="margin-bottom: 14px;">SMART FEATURES</p>
          ${features.map(f => `<p style="color: #808285; font-size: 13px; margin-bottom: 8px;">✓ ${f}</p>`).join('')}
          <p class="lbl" style="margin-top: 24px; margin-bottom: 14px; color: #00EAD3;">SOLAR CHARGING BENEFITS</p>
          ${benefits.map(b => `<p style="color: #00EAD3; font-size: 13px; margin-bottom: 8px;">⚡ ${b}</p>`).join('')}
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- SLIDE 18: POOL HEAT PUMP ----
function genPoolHeatPump(slide: SlideContent): string {
  return genElectrificationSlide(slide, 'pool');
}

// ---- SLIDE 19: ELECTRIFICATION INVESTMENT ----
function genElectrificationInvestment(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const items = (c.items as Array<{ item: string; cost: number; rebate: number }>) || [];
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1.2;">
          <table>
            <tr><th>UPGRADE ITEM</th><th style="text-align: right;">COST</th><th style="text-align: right;">REBATE</th><th style="text-align: right;">NET</th></tr>
            ${items.map(item => `
              <tr>
                <td>${item.item}</td>
                <td style="text-align: right;">$${item.cost.toLocaleString()}</td>
                <td style="text-align: right; color: #00EAD3;">-$${item.rebate.toLocaleString()}</td>
                <td style="text-align: right; font-weight: 600;">$${(item.cost - item.rebate).toLocaleString()}</td>
              </tr>
            `).join('')}
            <tr class="highlight-row">
              <td style="font-weight: 700;">TOTAL</td>
              <td style="text-align: right; font-weight: 700;">$${(c.totalCost as number).toLocaleString()}</td>
              <td style="text-align: right; color: #00EAD3; font-weight: 700;">-$${(c.totalRebates as number).toLocaleString()}</td>
              <td style="text-align: right; font-weight: 700;">$${(c.netInvestment as number).toLocaleString()}</td>
            </tr>
          </table>
        </div>
        <div style="flex: 0.8;">
          <div class="card aqua-b" style="text-align: center; margin-bottom: 20px; padding: 30px;">
            <p class="lbl" style="color: #00EAD3;">ANNUAL GAS SAVINGS</p>
            <p class="hero-num aqua" style="font-size: 56px;">$${(c.annualGasSavings as number).toLocaleString()}</p>
          </div>
          <div class="card" style="text-align: center;">
            <p class="lbl">GAS SUPPLY CHARGE SAVED</p>
            <p style="font-size: 28px; color: #00EAD3; font-weight: 600;">$${Math.round(c.gasSupplyChargeSaved as number).toLocaleString()}/year</p>
          </div>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- SLIDE 20: SAVINGS SUMMARY ----
function genSavingsSummary(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const breakdown = c.breakdown as Array<{ category: string; value: number; color: string }>;
  const total = c.totalAnnualBenefit as number;
  const maxVal = Math.max(...breakdown.map(b => b.value));
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1;">
          <div style="height: 380px; display: flex; align-items: flex-end; justify-content: center;">
            <div style="width: 200px; display: flex; flex-direction: column;">
              ${breakdown.map((b, idx) => {
                const col = b.color === 'aqua' ? '#00EAD3' : b.color === 'orange' ? '#f36710' : '#FFFFFF';
                const isFirst = idx === 0;
                const isLast = idx === breakdown.length - 1;
                const radius = isFirst && isLast ? '8px' : isFirst ? '8px 8px 0 0' : isLast ? '0 0 8px 8px' : '0';
                return `<div style="height: ${(b.value / total) * 300}px; background: ${col}; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #000; font-weight: 600; border-radius: ${radius};">${b.category}</div>`;
              }).join('')}
            </div>
          </div>
          <div style="display: flex; gap: 16px; margin-top: 16px; justify-content: center;">
            ${breakdown.map(b => {
              const col = b.color === 'aqua' ? '#00EAD3' : b.color === 'orange' ? '#f36710' : '#FFFFFF';
              return `<div style="display: flex; align-items: center; gap: 6px;"><div style="width: 12px; height: 12px; background: ${col};"></div><span style="font-size: 11px; color: #808285;">${b.category}</span></div>`;
            }).join('')}
          </div>
        </div>
        <div style="flex: 1;">
          <div class="card aqua-b" style="text-align: center; padding: 36px; margin-bottom: 24px;">
            <p class="lbl" style="color: #00EAD3;">TOTAL ANNUAL BENEFIT</p>
            <p class="hero-num white" style="font-size: 80px;">$${total.toLocaleString()}</p>
            <p class="gray" style="margin-top: 8px;">Tax-Free Savings</p>
          </div>
          ${breakdown.map(b => {
            const col = b.color === 'aqua' ? '#00EAD3' : b.color === 'orange' ? '#f36710' : '#FFFFFF';
            return `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #1a1a1a;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="width: 14px; height: 14px; background: ${col};"></div>
                  <span>${b.category}</span>
                </div>
                <span style="font-weight: 600;">$${b.value.toLocaleString()}</span>
              </div>
            `;
          }).join('')}
          ${c.narrative ? `<div style="margin-top: 16px; font-size: 13px; line-height: 1.7; color: #ccc;">${c.narrative}</div>` : ''}
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- SLIDE 21: FINANCIAL SUMMARY ----
function genFinancial(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1;">
          <p class="lbl" style="margin-bottom: 16px;">INVESTMENT BREAKDOWN</p>
          <div style="display: flex; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #333;">
            <span>Solar & Battery System</span>
            <span style="font-weight: 600; font-style: italic;">$${(c.systemCost as number).toLocaleString()}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #333;">
            <span>Govt. Rebates & Incentives</span>
            <span style="font-weight: 600; color: #00EAD3; font-style: italic;">-$${(c.rebates as number).toLocaleString()}</span>
          </div>
          <div class="card orange-b" style="margin-top: 20px; padding: 30px;">
            <p class="lbl" style="color: #f36710;">NET INVESTMENT</p>
            <p class="hero-num white" style="font-size: 64px;">$${(c.netInvestment as number).toLocaleString()}</p>
            <p class="gray" style="font-size: 13px; margin-top: 8px;">Fully Installed (Inc. GST)</p>
          </div>
        </div>
        <div style="flex: 1;">
          <p class="lbl" style="margin-bottom: 16px;">PROJECTED RETURNS</p>
          <div style="display: flex; gap: 16px; margin-bottom: 20px;">
            <div class="card aqua-b" style="flex: 1; text-align: center; padding: 24px;">
              <p class="lbl" style="color: #00EAD3;">ANNUAL BENEFIT</p>
              <p style="font-size: 36px; font-weight: 700;">$${(c.annualBenefit as number).toLocaleString()}</p>
              <p class="gray" style="font-size: 11px;">Combined Savings & Income</p>
            </div>
            <div class="card aqua-b" style="flex: 1; text-align: center; padding: 24px;">
              <p class="lbl" style="color: #00EAD3;">PAYBACK PERIOD</p>
              <p style="font-size: 36px; font-weight: 700;">${(c.paybackYears as number).toFixed(1)} YRS</p>
              <p class="gray" style="font-size: 11px;">Accelerated by ${c.acceleratedBy}</p>
            </div>
          </div>
          <div class="card" style="text-align: center; padding: 24px;">
            <p style="font-family: 'NextSphere', sans-serif; font-size: 22px; font-weight: 800;">10-YEAR TOTAL SAVINGS: <span class="aqua">~$${(c.tenYearSavings as number).toLocaleString()}</span></p>
          </div>
          ${c.narrative ? `<div style="margin-top: 16px; font-size: 13px; line-height: 1.7; color: #ccc;">${c.narrative}</div>` : ''}
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- SLIDE 22: ENVIRONMENTAL IMPACT ----
function genEnvironmental(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div class="card aqua-b" style="text-align: center; padding: 24px;">
              <p class="lbl">ANNUAL CO2 REDUCTION</p>
              <p class="hero-num aqua" style="font-size: 48px;">${(c.co2ReductionTonnes as number).toFixed(1)}<span style="font-size: 18px;">t</span></p>
            </div>
            <div class="card" style="text-align: center; padding: 24px;">
              <p class="lbl">25-YEAR CO2 REDUCTION</p>
              <p class="hero-num white" style="font-size: 48px;">${(c.twentyFiveYearCO2 as number).toFixed(0)}<span style="font-size: 18px;">t</span></p>
            </div>
            <div class="card" style="text-align: center; padding: 24px;">
              <p class="lbl">TREES EQUIVALENT</p>
              <p style="font-size: 32px; color: #00EAD3; font-weight: 600;">${c.treesEquivalent}</p>
              <p class="gray" style="font-size: 11px;">trees/year</p>
            </div>
            <div class="card" style="text-align: center; padding: 24px;">
              <p class="lbl">CARS OFF ROAD</p>
              <p style="font-size: 32px; color: #f36710; font-weight: 600;">${c.carsOffRoad}</p>
              <p class="gray" style="font-size: 11px;">equivalent</p>
            </div>
          </div>
        </div>
        <div style="flex: 1;">
          <div class="card aqua-b" style="text-align: center; margin-bottom: 24px; padding: 30px;">
            <p class="lbl">ENERGY INDEPENDENCE SCORE</p>
            <p class="hero-num aqua" style="font-size: 72px;">${c.energyIndependenceScore}%</p>
          </div>
          ${c.narrative ? `<div style="margin-bottom: 16px; font-size: 13px; line-height: 1.7; color: #ccc;">${c.narrative}</div>` : ''}
          ${(c.benefits as Array<{ icon: string; title: string; description: string }>).map(b => `
            <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px;">
              <span style="font-size: 22px;">${b.icon}</span>
              <div>
                <p style="font-family: 'NextSphere', sans-serif; font-size: 13px; font-weight: 800; text-transform: uppercase;">${b.title}</p>
                <p style="color: #808285; font-size: 12px;">${b.description}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- SLIDE 23: ROADMAP ----
function genRoadmap(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const steps = c.steps as Array<{ number: string; title: string; description: string; timeline: string; color: string }>;
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      ${c.narrative ? `<div style="padding: 0 40px; margin-top: 10px; font-size: 13px; line-height: 1.7; color: #ccc;">${c.narrative}</div>` : ''}
      <div style="display: flex; align-items: center; margin: 20px 0 30px; padding: 0 40px;">
        ${steps.map((s, i) => `
          <div style="display: flex; align-items: center;">
            <div style="width: 20px; height: 20px; border-radius: 50%; background: ${s.color === 'aqua' ? '#00EAD3' : '#f36710'};"></div>
            ${i < steps.length - 1 ? `<div style="width: ${800 / steps.length}px; height: 2px; background: linear-gradient(to right, ${s.color === 'aqua' ? '#00EAD3' : '#f36710'}, ${steps[i + 1].color === 'aqua' ? '#00EAD3' : '#f36710'});"></div>` : ''}
          </div>
        `).join('')}
      </div>
      <div style="display: flex; gap: 16px;">
        ${steps.map(s => `
          <div class="card" style="flex: 1; border-top: 3px solid ${s.color === 'aqua' ? '#00EAD3' : '#f36710'};">
            <p style="font-size: 40px; color: #333; font-weight: 800; font-family: 'NextSphere', sans-serif;">${s.number}</p>
            <p style="font-family: 'NextSphere', sans-serif; font-size: 14px; font-weight: 800; color: ${s.color === 'aqua' ? '#FFFFFF' : '#f36710'}; margin: 10px 0; text-transform: uppercase;">${s.title}</p>
            <p style="color: #808285; font-size: 12px; line-height: 1.5; margin-bottom: 14px;">${s.description}</p>
            <p style="color: ${s.color === 'aqua' ? '#00EAD3' : '#f36710'}; font-size: 12px; font-family: 'Urbanist', sans-serif;">⏱ ${s.timeline}</p>
          </div>
        `).join('')}
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- SLIDE: CONCLUSION (Executive Summary) ----
function genConclusion(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="margin-top: 20px; padding: 0 20px;">
        <div style="font-size: 15px; line-height: 1.9; color: #FFFFFF; margin-bottom: 24px;">
          ${c.narrativeSummary || 'This proposal outlines a comprehensive solar and battery solution tailored to your energy profile.'}
        </div>
        <div style="font-size: 15px; line-height: 1.9; color: #FFFFFF; margin-bottom: 32px;">
          ${c.narrativeFinancial || ''}
        </div>
      </div>
      <div style="border-left: 4px solid #f36710; padding: 20px 28px; background: #1a1a1a; border-radius: 0 8px 8px 0; margin: 0 20px;">
        <p style="font-family: 'Urbanist', sans-serif; font-size: 12px; color: #f36710; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 10px;">RECOMMENDATION</p>
        <p style="font-family: 'NextSphere', sans-serif; font-size: 28px; font-weight: 800; color: #FFFFFF; line-height: 1.4; text-transform: uppercase;">${c.recommendation || `PROCEED WITH THE ${c.systemSize || '6.6'}KW / ${c.batterySize || '10'}KWH SYSTEM INSTALLATION.`}</p>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- SLIDE: CONTACT ----
function genContact(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  return `
    <div class="slide" style="display: flex; flex-direction: column; justify-content: center; padding: 60px 80px;">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      <div style="width: 80px; height: 4px; background: #00EAD3; margin-bottom: 24px;"></div>
      <h1 style="font-family: 'NextSphere', sans-serif; font-size: 64px; font-weight: 800; color: #FFFFFF; text-transform: uppercase; margin-bottom: 8px;">${c.preparedBy || BRAND.contact.name}</h1>
      <p style="font-family: 'Urbanist', sans-serif; font-size: 18px; color: #00EAD3; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 48px;">${c.title || BRAND.contact.title}</p>
      <div style="display: flex; flex-direction: column; gap: 20px; max-width: 500px;">
        <div>
          <p style="font-size: 11px; color: #808285; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 4px;">PHONE</p>
          <p style="font-size: 20px; color: #FFFFFF;">${c.phone || BRAND.contact.phone}</p>
        </div>
        <div>
          <p style="font-size: 11px; color: #808285; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 4px;">EMAIL</p>
          <p style="font-size: 20px; color: #00EAD3;">${c.email || BRAND.contact.email}</p>
        </div>
        <div>
          <p style="font-size: 11px; color: #808285; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 4px;">WEBSITE</p>
          <p style="font-size: 20px; color: #00EAD3;">${c.website || BRAND.contact.website}</p>
        </div>
        <div>
          <p style="font-size: 11px; color: #808285; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 4px;">ADDRESS</p>
          <p style="font-size: 20px; color: #FFFFFF;">${c.address || BRAND.contact.address}</p>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- STRATEGIC SITE ASSESSMENT ----
function genStrategicSiteAssessment(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const photos = (c.sitePhotos as Array<{ url: string; caption: string }>) || [];
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1;">
          <div style="border-left: 4px solid #00EAD3; padding-left: 20px; margin-bottom: 28px;">
            <p class="lbl" style="color: #00EAD3; margin-bottom: 6px;">EXISTING INVERTER</p>
            <p style="font-size: 20px; font-weight: 600; margin-bottom: 8px;">${c.existingInverter || 'To be assessed'}</p>
            ${c.narrativeInverter ? `<p style="font-size: 13px; line-height: 1.7; color: #ccc;">${c.narrativeInverter}</p>` : `<p style="font-size: 13px; line-height: 1.7; color: #ccc;">Current inverter to be assessed during site inspection for compatibility with battery storage system.</p>`}
          </div>
          <div style="border-left: 4px solid #00EAD3; padding-left: 20px; margin-bottom: 28px;">
            <p class="lbl" style="color: #00EAD3; margin-bottom: 6px;">ELECTRICAL SUPPLY</p>
            <p style="font-size: 20px; font-weight: 600; margin-bottom: 8px;">${c.electricalSupply || 'Single Phase'}</p>
            ${c.narrativeElectrical ? `<p style="font-size: 13px; line-height: 1.7; color: #ccc;">${c.narrativeElectrical}</p>` : `<p style="font-size: 13px; line-height: 1.7; color: #ccc;">Electrical supply configuration to be confirmed during site assessment.</p>`}
          </div>
          <div style="border-left: 4px solid #00EAD3; padding-left: 20px; margin-bottom: 28px;">
            <p class="lbl" style="color: #00EAD3; margin-bottom: 6px;">METERING</p>
            <p style="font-size: 20px; font-weight: 600; margin-bottom: 8px;">${c.metering || 'Smart Meter'}</p>
            ${c.narrativeMetering ? `<p style="font-size: 13px; line-height: 1.7; color: #ccc;">${c.narrativeMetering}</p>` : `<p style="font-size: 13px; line-height: 1.7; color: #ccc;">Smart meter configuration supports bi-directional energy flow and VPP participation.</p>`}
          </div>
        </div>
        <div style="flex: 1;">
          ${photos.length > 0 ? `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              ${photos.slice(0, 4).map(p => `
                <div>
                  <img src="${p.url}" style="width: 100%; height: 180px; object-fit: cover; border-radius: 4px; border: 1px solid #333;" alt="${p.caption}" />
                  <p style="font-size: 11px; color: #808285; margin-top: 6px; text-align: center;">${p.caption}</p>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="card" style="height: 100%; display: flex; align-items: center; justify-content: center; text-align: center; padding: 40px;">
              <div>
                <p style="font-size: 48px; margin-bottom: 16px;">\ud83d\udcf7</p>
                <p style="font-family: 'NextSphere', sans-serif; font-size: 18px; font-weight: 800; margin-bottom: 8px;">SITE PHOTOS</p>
                <p style="color: #808285; font-size: 13px;">Photos will be added after site inspection</p>
              </div>
            </div>
          `}
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- OPTION 1: SIGENERGY SIGENSTOR ----
function genOption1(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const features = (c.features as string[]) || [];
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1;">
          <p style="font-family: 'NextSphere', sans-serif; font-size: 20px; font-weight: 800; color: #00EAD3; text-transform: uppercase; margin-bottom: 16px;">WHY WE RECOMMEND IT</p>
          ${c.narrative ? `<div style="font-size: 14px; line-height: 1.8; color: #ccc; margin-bottom: 24px;">${c.narrative}</div>` : `<p style="font-size: 14px; line-height: 1.8; color: #ccc; margin-bottom: 24px;">The Sigenergy SigenStor represents the pinnacle of residential energy storage technology, integrating battery, inverter, EV charger, and smart energy management into a single, elegant unit.</p>`}
          ${features.map(f => `
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
              <span style="color: #00EAD3; font-size: 10px;">\u25cf</span>
              <p style="font-size: 14px; font-weight: 600;">${f}</p>
            </div>
          `).join('')}
        </div>
        <div style="flex: 0.8;">
          <div class="card" style="padding: 30px; border-top: 3px solid #00EAD3;">
            <div style="margin-bottom: 20px;">
              <p class="lbl">TOTAL SYSTEM INVESTMENT</p>
              <p style="font-size: 36px; font-weight: 700;">$${(c.systemCost as number).toLocaleString()}</p>
            </div>
            <div style="margin-bottom: 20px;">
              <p style="color: #00EAD3; font-size: 18px; font-weight: 600;">-$${(c.rebateAmount as number).toLocaleString()} <span style="font-size: 13px; color: #808285;">Federal Rebate</span></p>
            </div>
            <div style="border-top: 1px solid #333; padding-top: 16px; margin-bottom: 24px;">
              <p class="lbl">NET INVESTMENT</p>
              <p style="font-size: 36px; font-weight: 700;">= $${(c.netInvestment as number).toLocaleString()}</p>
            </div>
            <div style="display: flex; gap: 20px;">
              <div style="flex: 1;">
                <p class="lbl" style="color: #00EAD3;">ANNUAL SAVINGS</p>
                <p style="font-size: 24px; font-weight: 700; color: #00EAD3;">$${(c.annualSavings as number).toLocaleString()}</p>
              </div>
              <div style="flex: 1;">
                <p class="lbl">PAYBACK PERIOD</p>
                <p style="font-size: 24px; font-weight: 700;">${(c.paybackYears as number).toFixed(1)} Years</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- OPTION 2: GOODWE ESA SERIES ----
function genOption2(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const features = (c.features as string[]) || [];
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1;">
          <p style="font-family: 'NextSphere', sans-serif; font-size: 20px; font-weight: 800; color: #f36710; text-transform: uppercase; margin-bottom: 16px;">WHY CONSIDER IT</p>
          ${c.narrative ? `<div style="font-size: 14px; line-height: 1.8; color: #ccc; margin-bottom: 24px;">${c.narrative}</div>` : `<p style="font-size: 14px; line-height: 1.8; color: #ccc; margin-bottom: 24px;">The GoodWe ESA Series delivers exceptional value with proven reliability, making it an excellent choice for homeowners seeking a cost-effective path to energy independence.</p>`}
          ${features.map(f => `
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
              <span style="color: #f36710; font-size: 10px;">\u25cf</span>
              <p style="font-size: 14px; font-weight: 600;">${f}</p>
            </div>
          `).join('')}
        </div>
        <div style="flex: 0.8;">
          <div class="card" style="padding: 30px; border-top: 3px solid #f36710;">
            <div style="margin-bottom: 20px;">
              <p class="lbl">TOTAL SYSTEM INVESTMENT</p>
              <p style="font-size: 36px; font-weight: 700;">$${(c.systemCost as number).toLocaleString()}</p>
            </div>
            <div style="margin-bottom: 20px;">
              <p style="color: #00EAD3; font-size: 18px; font-weight: 600;">-$${(c.rebateAmount as number).toLocaleString()} <span style="font-size: 13px; color: #808285;">Federal Rebate</span></p>
            </div>
            <div style="border-top: 1px solid #333; padding-top: 16px; margin-bottom: 24px;">
              <p class="lbl">NET INVESTMENT</p>
              <p style="font-size: 36px; font-weight: 700;">= $${(c.netInvestment as number).toLocaleString()}</p>
            </div>
            <div style="display: flex; gap: 20px;">
              <div style="flex: 1;">
                <p class="lbl" style="color: #00EAD3;">ANNUAL SAVINGS</p>
                <p style="font-size: 24px; font-weight: 700; color: #00EAD3;">$${(c.annualSavings as number).toLocaleString()}</p>
              </div>
              <div style="flex: 1;">
                <p class="lbl">PAYBACK PERIOD</p>
                <p style="font-size: 24px; font-weight: 700;">${(c.paybackYears as number).toFixed(1)} Years</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- SYSTEM COMPARISON ----
function genSystemComparison(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const o1 = c.option1 as Record<string, unknown>;
  const o2 = c.option2 as Record<string, unknown>;
  const rows = [
    { feature: 'Net Investment', v1: `$${(o1.netInvestment as number).toLocaleString()}`, v2: `$${(o2.netInvestment as number).toLocaleString()}`, highlight: false },
    { feature: 'Annual Savings', v1: `$${(o1.annualSavings as number).toLocaleString()}`, v2: `$${(o2.annualSavings as number).toLocaleString()}`, highlight: false },
    { feature: 'Payback Period', v1: `${(o1.paybackYears as number).toFixed(1)} Years`, v2: `${(o2.paybackYears as number).toFixed(1)} Years`, highlight: true },
    { feature: 'Backup Capability', v1: o1.backup as string, v2: o2.backup as string, highlight: false },
    { feature: 'EV Charger Integration', v1: o1.evCharger as string, v2: o2.evCharger as string, highlight: false },
    { feature: 'Intelligence', v1: o1.intelligence as string, v2: o2.intelligence as string, highlight: false },
    { feature: 'Warranty', v1: o1.warranty as string, v2: o2.warranty as string, highlight: false },
  ];
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <table style="margin-top: 10px;">
        <tr>
          <th style="width: 25%;">FEATURE</th>
          <th style="width: 37.5%; color: #00EAD3;">${o1.name}</th>
          <th style="width: 37.5%; color: #f36710;">${o2.name}</th>
        </tr>
        ${rows.map(r => `
          <tr ${r.highlight ? 'class="highlight-row"' : ''}>
            <td style="font-weight: 600;">${r.feature}</td>
            <td>${r.v1}</td>
            <td>${r.v2}</td>
          </tr>
        `).join('')}
      </table>
      ${c.narrative ? `<div class="insight-card" style="margin-top: 24px;"><p class="insight-title">RECOMMENDATION</p><div style="font-size: 13px; line-height: 1.7; color: #ccc;">${c.narrative}</div></div>` : ''}
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- ANNUAL FINANCIAL IMPACT ----
function genAnnualFinancialImpact(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const breakdown = (c.savingsBreakdown as Array<{ source: string; value: number; percent?: string }>) || [];
  const currentCost = c.currentAnnualCost as number;
  const projectedCost = c.projectedAnnualCost as number;
  const totalTurnaround = c.totalTurnaround as number;
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; align-items: center; gap: 30px; margin-top: 10px;">
        <div class="card" style="flex: 1; text-align: center; padding: 30px; border-top: 3px solid #f36710;">
          <p class="lbl">Current Projected Bill</p>
          <p class="hero-num white" style="font-size: 56px;">$${currentCost.toLocaleString()}</p>
          <p class="gray">per year</p>
        </div>
        <div style="text-align: center;">
          <img src="${LOGO_URI_AQUA}" style="width: 50px; height: 50px;" alt="LE" />
          <p style="font-family: 'NextSphere', sans-serif; font-size: 11px; font-weight: 800; color: #808285; margin-top: 8px; letter-spacing: 0.1em;">TRANSFORMATION</p>
        </div>
        <div class="card" style="flex: 1; text-align: center; padding: 30px; border-top: 3px solid #00EAD3;">
          <p class="lbl">New Projected Bill</p>
          <p class="hero-num ${projectedCost <= 0 ? 'aqua' : 'white'}" style="font-size: 56px;">${projectedCost <= 0 ? '-' : ''}$${Math.abs(projectedCost).toLocaleString()}</p>
          <p class="gray">${projectedCost <= 0 ? 'Annual Credit' : 'per year'}</p>
        </div>
      </div>
      <div style="display: flex; gap: 40px; margin-top: 30px;">
        <div style="flex: 1;">
          <p style="font-family: 'NextSphere', sans-serif; font-size: 18px; font-weight: 800; color: #00EAD3; margin-bottom: 16px;">WHERE THE SAVINGS COME FROM</p>
          ${breakdown.map(b => `
            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #1a1a1a;">
              <span style="color: #ccc;">${b.source}${b.percent ? ` (${b.percent})` : ''}</span>
              <span style="font-weight: 600; color: ${b.value < 0 ? '#f36710' : '#00EAD3'};">${b.value < 0 ? '-' : ''}$${Math.abs(b.value).toLocaleString()}</span>
            </div>
          `).join('')}
        </div>
        <div style="flex: 0.8;">
          <div style="background: linear-gradient(135deg, rgba(0,234,211,0.15), rgba(0,234,211,0.05)); border-radius: 8px; padding: 30px; text-align: center;">
            <p style="font-family: 'NextSphere', sans-serif; font-size: 14px; font-weight: 800; color: #808285; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">Total Annual Turnaround</p>
            <p class="hero-num aqua" style="font-size: 64px;">$${totalTurnaround.toLocaleString()}</p>
            <p style="color: #ccc; font-size: 13px; margin-top: 12px; line-height: 1.6;">Combined value of bill elimination and new income generation.</p>
          </div>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- INVESTMENT ANALYSIS ----
function genInvestmentAnalysis(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const o1 = c.option1 as Record<string, unknown>;
  const o2 = c.option2 as Record<string, unknown>;
  
  // Generate cashflow data points for chart
  const years = 20;
  const o1Points: string[] = [];
  const o2Points: string[] = [];
  for (let y = 0; y <= years; y++) {
    const o1Val = -(o1.netInvestment as number) + (o1.annualBenefit as number) * y;
    const o2Val = -(o2.netInvestment as number) + (o2.annualBenefit as number) * y;
    o1Points.push(`${(y / years) * 100},${50 - (o1Val / ((o1.annualBenefit as number) * years * 1.2)) * 45}`);
    o2Points.push(`${(y / years) * 100},${50 - (o2Val / ((o1.annualBenefit as number) * years * 1.2)) * 45}`);
  }
  
  // Pre-compute smooth SVG paths for cashflow chart (outside template literal for esbuild compatibility)
  function smoothCashflowPath(pts: string[]): string {
    const coords = pts.map(p => { const [x, y] = p.split(',').map(Number); return { x, y }; });
    if (coords.length < 2) return '';
    let d = 'M' + coords[0].x + ',' + coords[0].y;
    for (let ii = 0; ii < coords.length - 1; ii++) {
      const cpx = (coords[ii].x + coords[ii + 1].x) / 2;
      d += ' C' + cpx + ',' + coords[ii].y + ' ' + cpx + ',' + coords[ii + 1].y + ' ' + coords[ii + 1].x + ',' + coords[ii + 1].y;
    }
    return d;
  }
  const cfSvgPath1 = smoothCashflowPath(o1Points);
  const cfSvgPath2 = smoothCashflowPath(o2Points);

  const compRows = [
    { metric: 'Total System Cost', v1: `$${(o1.systemCost as number).toLocaleString()}`, v2: `$${(o2.systemCost as number).toLocaleString()}` },
    { metric: 'Federal Rebate', v1: `-$${(o1.rebate as number).toLocaleString()}`, v2: `-$${(o2.rebate as number).toLocaleString()}`, highlight: false, aqua: true },
    { metric: 'Net Investment', v1: `$${(o1.netInvestment as number).toLocaleString()}`, v2: `$${(o2.netInvestment as number).toLocaleString()}`, highlight: true },
    { metric: 'Annual Benefit', v1: `$${(o1.annualBenefit as number).toLocaleString()}`, v2: `$${(o2.annualBenefit as number).toLocaleString()}` },
    { metric: 'Payback Period', v1: `${(o1.paybackYears as number).toFixed(1)} Years`, v2: `${(o2.paybackYears as number).toFixed(1)} Years` },
    { metric: '10-Year Net Benefit', v1: `$${(o1.tenYearBenefit as number).toLocaleString()}`, v2: `$${(o2.tenYearBenefit as number).toLocaleString()}` },
  ];
  
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 40px; margin-top: 10px;">
        <div style="flex: 1;">
          <table>
            <tr><th>METRIC</th><th style="color: #00EAD3;">${o1.name}</th><th style="color: #f36710;">${o2.name}</th></tr>
            ${compRows.map(r => `
              <tr ${r.highlight ? 'class="highlight-row"' : ''}>
                <td style="font-weight: 600;">${r.metric}</td>
                <td ${r.aqua ? 'style="color: #00EAD3;"' : ''}>${r.v1}</td>
                <td ${r.aqua ? 'style="color: #00EAD3;"' : ''}>${r.v2}</td>
              </tr>
            `).join('')}
          </table>
        </div>
        <div style="flex: 1;">
          <p style="font-family: 'NextSphere', sans-serif; font-size: 16px; font-weight: 800; margin-bottom: 16px;">CUMULATIVE CASHFLOW (20 YEARS)</p>
          <div style="height: 280px; position: relative; border-left: 1px solid #333; border-bottom: 1px solid #333;">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width: 100%; height: 100%;">
              <defs>
                <linearGradient id="cfGrad1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#00EAD3" stop-opacity="0.15"/><stop offset="100%" stop-color="#00EAD3" stop-opacity="0"/></linearGradient>
                <linearGradient id="cfGrad2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f36710" stop-opacity="0.15"/><stop offset="100%" stop-color="#f36710" stop-opacity="0"/></linearGradient>
              </defs>
              <line x1="0" y1="50" x2="100" y2="50" stroke="#333" stroke-width="0.2" stroke-dasharray="2,2" />
              <path d="${cfSvgPath1}" fill="none" stroke="#00EAD3" stroke-width="0.8" stroke-linecap="round" />
              <path d="${cfSvgPath2}" fill="none" stroke="#f36710" stroke-width="0.8" stroke-linecap="round" />
            </svg>
          </div>
          <div style="display: flex; gap: 24px; margin-top: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 12px; height: 12px; background: #00EAD3; border-radius: 50%;"></div><span style="font-size: 11px; color: #808285;">${o1.name}</span></div>
            <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 12px; height: 12px; background: #f36710; border-radius: 50%;"></div><span style="font-size: 11px; color: #808285;">${o2.name}</span></div>
          </div>
        </div>
      </div>
      ${c.narrative ? `<div class="insight-card" style="margin-top: 16px;"><p class="insight-title">ANALYSIS</p><div style="font-size: 13px; line-height: 1.7; color: #ccc;">${c.narrative}</div></div>` : ''}
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- NEW: BILL BREAKDOWN (donut chart + metrics) ----
function genBillBreakdown(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const usagePct = c.usageChargesPercent as number || 85;
  const supplyPct = c.supplyChargesPercent as number || 15;
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 60px; margin-top: 20px;">
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <div style="position: relative; width: 320px; height: 320px;">
            <svg viewBox="0 0 200 200" style="width: 320px; height: 320px; transform: rotate(-90deg);">
              <circle cx="100" cy="100" r="80" fill="none" stroke="#333" stroke-width="30" />
              <circle cx="100" cy="100" r="80" fill="none" stroke="#f36710" stroke-width="30" stroke-dasharray="${usagePct * 5.026} ${(100 - usagePct) * 5.026}" stroke-dashoffset="0" stroke-linecap="round" />
              <circle cx="100" cy="100" r="80" fill="none" stroke="#00EAD3" stroke-width="30" stroke-dasharray="${supplyPct * 5.026} ${(100 - supplyPct) * 5.026}" stroke-dashoffset="-${usagePct * 5.026}" stroke-linecap="round" />
            </svg>
          </div>
          <div style="display: flex; gap: 30px; margin-top: 20px;">
            <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 14px; height: 14px; background: #f36710; border-radius: 4px;"></div><span style="font-size: 13px; color: #808285;">Usage Charges</span></div>
            <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 14px; height: 14px; background: #00EAD3; border-radius: 4px;"></div><span style="font-size: 13px; color: #808285;">Supply Charges</span></div>
          </div>
        </div>
        <div style="flex: 1;">
          <div style="border-bottom: 1px solid #333; padding: 20px 0;">
            <p class="lbl">TOTAL ANNUAL COST</p>
            <p class="hero-num orange" style="font-size: 52px;">$${(c.totalAnnualCost as number || 0).toLocaleString()}</p>
          </div>
          <div style="border-bottom: 1px solid #333; padding: 20px 0;">
            <p class="lbl">DAILY AVERAGE COST</p>
            <p class="hero-num white" style="font-size: 52px;">$${(c.dailyAverageCost as number || 0).toFixed(2)}</p>
          </div>
          <div style="border-bottom: 1px solid #333; padding: 20px 0;">
            <p class="lbl">USAGE CHARGES</p>
            <p class="hero-num white" style="font-size: 52px;">~${usagePct}%</p>
          </div>
          <div style="padding: 20px 0;">
            <p class="lbl">SUPPLY CHARGES</p>
            <p class="hero-num white" style="font-size: 52px;">~${supplyPct}%</p>
          </div>
          ${c.narrative ? `<div class="insight-card" style="margin-top: 16px;"><p class="insight-title">KEY INSIGHT</p><div style="font-size: 13px; line-height: 1.7; color: #ccc;">${c.narrative}</div></div>` : ''}
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- NEW: ANNUAL ENERGY PROJECTION (bar chart + insight cards) ----
function genAnnualEnergyProjection(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const months = (c.monthlyData as Array<{ month: string; usage: number; solar: number }>) || [];
  const maxVal = Math.max(...months.map(m => Math.max(m.usage, m.solar)), 2000);
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 40px; margin-top: 16px;">
        <div style="flex: 1.8;">
          <div style="display: flex; align-items: flex-end; gap: 8px; height: 400px; padding-bottom: 30px;">
            ${months.map(m => `
              <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%;">
                <div style="flex: 1; display: flex; align-items: flex-end; gap: 3px; width: 100%;">
                  <div style="flex: 1; background: #f36710; border-radius: 8px 8px 0 0; height: ${(m.usage / maxVal) * 100}%;"></div>
                  <div style="flex: 1; background: #00EAD3; border-radius: 8px 8px 0 0; height: ${(m.solar / maxVal) * 100}%;"></div>
                </div>
                <span style="font-size: 10px; color: #808285;">${m.month.substring(0, 3)}</span>
              </div>
            `).join('')}
          </div>
          <div style="display: flex; gap: 24px; margin-top: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 14px; height: 14px; background: #f36710; border-radius: 4px;"></div><span style="font-size: 12px; color: #808285;">Current Usage</span></div>
            <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 14px; height: 14px; background: #00EAD3; border-radius: 4px;"></div><span style="font-size: 12px; color: #808285;">Solar Production (Est.)</span></div>
          </div>
        </div>
        <div style="flex: 1; display: flex; flex-direction: column; gap: 16px;">
          <div class="insight-card orange"><p class="insight-title">CURRENT REALITY</p><p>${c.currentReality || 'Your energy consumption pattern shows significant seasonal variation.'}</p></div>
          <div class="insight-card"><p class="insight-title">SOLAR IMPACT</p><p>${c.solarImpact || 'Solar production will offset the majority of your daytime consumption.'}</p></div>
          <div class="insight-card" style="border-left-color: #fff;"><p class="insight-title" style="color: #fff;">WINTER STRATEGY</p><p>${c.winterStrategy || 'Battery storage bridges the gap during shorter winter days.'}</p></div>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- NEW: USAGE BENCHMARKING ----
function genUsageBenchmarking(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const daily = c.dailyAverage as number || 0;
  const stateAvg = c.stateAverage as number || 13;
  const factor = c.comparisonFactor as number || (daily / stateAvg);
  const maxBar = Math.max(daily, stateAvg) * 1.3;
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 60px; margin-top: 20px;">
        <div style="flex: 1.2; display: flex; align-items: flex-end; gap: 40px; padding: 40px 60px 30px;">
          <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 10px;">
            <div style="width: 100%; background: #f36710; border-radius: 10px 10px 0 0; height: ${(daily / maxBar) * 350}px; display: flex; align-items: flex-start; justify-content: center; padding-top: 12px;">
              <span style="font-family: 'NextSphere', sans-serif; font-size: 28px; color: #000; font-weight: 800;">${daily.toFixed(1)}</span>
            </div>
            <span style="font-size: 13px; color: #808285;">Your Usage</span>
          </div>
          <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 10px;">
            <div style="width: 100%; background: #00EAD3; border-radius: 10px 10px 0 0; height: ${(stateAvg / maxBar) * 350}px; display: flex; align-items: flex-start; justify-content: center; padding-top: 12px;">
              <span style="font-family: 'NextSphere', sans-serif; font-size: 28px; color: #000; font-weight: 800;">${stateAvg.toFixed(1)}</span>
            </div>
            <span style="font-size: 13px; color: #808285;">Average Household</span>
          </div>
        </div>
        <div style="flex: 1; display: flex; flex-direction: column; gap: 20px;">
          <div style="border-left: 4px solid #00EAD3; padding: 16px 20px; background: #1a1a1a; border-radius: 0 8px 8px 0;">
            <p class="lbl">YOUR DAILY AVERAGE</p>
            <p class="hero-num orange" style="font-size: 48px;">${daily.toFixed(1)} <span class="unit" style="font-size: 20px;">KWH</span></p>
            <p style="font-size: 13px; color: #808285; margin-top: 4px;">${daily > 20 ? 'High consumption profile' : daily > 12 ? 'Above average consumption' : 'Standard consumption'}</p>
          </div>
          <div style="border-left: 4px solid #00EAD3; padding: 16px 20px; background: #1a1a1a; border-radius: 0 8px 8px 0;">
            <p class="lbl">${(c.state as string || 'VIC').toUpperCase()} AVERAGE (4-PERSON)</p>
            <p class="hero-num aqua" style="font-size: 48px;">${stateAvg.toFixed(1)} <span class="unit" style="font-size: 20px;">KWH</span></p>
            <p style="font-size: 13px; color: #808285; margin-top: 4px;">Standard residential usage</p>
          </div>
          <div style="border-left: 4px solid #00EAD3; padding: 16px 20px; background: #1a1a1a; border-radius: 0 8px 8px 0;">
            <p class="lbl">COMPARISON FACTOR</p>
            <p class="hero-num white" style="font-size: 48px;">${factor.toFixed(1)}X</p>
            <p style="font-size: 13px; color: #808285; margin-top: 4px;">Higher than average</p>
          </div>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- NEW: SOLAR RECOMMENDATION ----
function genSolarRecommendation(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 50px; margin-top: 20px;">
        <div style="flex: 1; display: flex; flex-direction: column; gap: 24px;">
          <div style="border-left: 4px solid #00EAD3; padding: 16px 24px; background: #1a1a1a; border-radius: 0 8px 8px 0;">
            <p class="lbl">SYSTEM SIZE</p>
            <p class="hero-num white" style="font-size: 48px;">${c.systemSizeKw || '6.6'} <span class="unit" style="font-size: 20px;">KW</span></p>
            <p style="font-size: 14px; color: #808285; margin-top: 6px;">${c.panelConfig || '12 x 550W Panels'}</p>
          </div>
          <div style="border-left: 4px solid #00EAD3; padding: 16px 24px; background: #1a1a1a; border-radius: 0 8px 8px 0;">
            <p class="lbl">ANNUAL PRODUCTION</p>
            <p class="hero-num white" style="font-size: 48px;">${(c.annualProductionKwh as number || 0).toLocaleString()} <span class="unit" style="font-size: 20px;">KWH</span></p>
            <p style="font-size: 14px; color: #808285; margin-top: 6px;">~${(c.dailyProductionKwh as number || 0).toFixed(1)} kWh Daily Average</p>
          </div>
          <div style="border-left: 4px solid #00EAD3; padding: 16px 24px; background: #1a1a1a; border-radius: 0 8px 8px 0;">
            <p class="lbl">INVERTER TECHNOLOGY</p>
            <p class="hero-num white" style="font-size: 42px;">${c.inverterSize || '5'} <span class="unit" style="font-size: 20px;">KW HYBRID</span></p>
            <p style="font-size: 14px; color: #808285; margin-top: 6px;">${c.inverterModel || 'Sigenergy SigenStor'}</p>
          </div>
        </div>
        <div style="flex: 1;">
          <div style="background: #1a1a1a; border-radius: 8px; border-top: 4px solid #f36710; padding: 32px;">
            <p style="font-family: 'NextSphere', sans-serif; font-size: 22px; color: #00EAD3; text-transform: uppercase; margin-bottom: 16px;">WHY THIS CONFIGURATION?</p>
            <div style="font-size: 15px; line-height: 1.8; color: #ccc;">${c.narrative || c.whyThisConfig || 'This system is optimally sized to match your consumption profile and roof space.'}</div>
          </div>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- NEW: BATTERY RECOMMENDATION ----
function genBatteryRecommendation(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 50px; margin-top: 20px;">
        <div style="flex: 1; display: flex; flex-direction: column; gap: 24px;">
          <div style="border-left: 4px solid #00EAD3; padding: 16px 24px; background: #1a1a1a; border-radius: 0 8px 8px 0;">
            <p class="lbl">TOTAL CAPACITY</p>
            <p class="hero-num white" style="font-size: 48px;">${c.totalCapacityKwh || '10'} <span class="unit" style="font-size: 20px;">KWH</span></p>
            <p style="font-size: 14px; color: #808285; margin-top: 6px;">${c.moduleConfig || '2 x 5kWh Modules'}</p>
          </div>
          <div style="border-left: 4px solid #00EAD3; padding: 16px 24px; background: #1a1a1a; border-radius: 0 8px 8px 0;">
            <p class="lbl">BACKUP CAPABILITY</p>
            <p class="hero-num white" style="font-size: 42px;">${c.backupCapability || 'FULL BACKUP'}</p>
            <p style="font-size: 14px; color: #808285; margin-top: 6px;">${c.backupDescription || 'Protection for essential circuits & lighting'}</p>
          </div>
          <div style="border-left: 4px solid #00EAD3; padding: 16px 24px; background: #1a1a1a; border-radius: 0 8px 8px 0;">
            <p class="lbl">TECHNOLOGY</p>
            <p class="hero-num white" style="font-size: 42px;">LFP LITHIUM</p>
            <p style="font-size: 14px; color: #808285; margin-top: 6px;">Safest chemistry, 10-Year Warranty</p>
          </div>
        </div>
        <div style="flex: 1;">
          <div style="background: #1a1a1a; border-radius: 8px; border-top: 4px solid #00EAD3; padding: 32px;">
            <p style="font-family: 'NextSphere', sans-serif; font-size: 20px; color: #00EAD3; text-transform: uppercase; margin-bottom: 16px;">GOVERNMENT INCENTIVE</p>
            <p class="hero-num aqua" style="font-size: 56px; margin-bottom: 16px;">$${(c.rebateAmount as number || 0).toLocaleString()}</p>
            <div style="font-size: 15px; line-height: 1.8; color: #ccc;">${c.narrative || c.rebateDescription || 'Federal STC rebate reduces your upfront investment significantly.'}</div>
          </div>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- NEW: WHY ADD A BATTERY? (2x2 benefits grid) ----
function genWhyBattery(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const benefits = (c.benefits as Array<{ title: string; description: string }>) || [
    { title: 'ENERGY INDEPENDENCE', description: 'Store excess solar energy for evening use, reducing grid dependence to near zero.' },
    { title: 'VPP REVENUE STREAM', description: 'Earn income by trading stored energy back to the grid during peak demand periods.' },
    { title: 'BLACKOUT PROTECTION', description: 'Maintain power to essential circuits during grid outages with automatic switchover.' },
    { title: 'EV OPTIMIZATION', description: 'Charge your electric vehicle with stored solar energy at virtually zero cost.' },
  ];
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 0; margin-top: 20px; flex: 1;">
        ${benefits.slice(0, 4).map((b, i) => `
          <div style="padding: 36px 40px; ${i % 2 === 0 ? 'border-right: 1px solid #333;' : ''} ${i < 2 ? 'border-bottom: 1px solid #333;' : ''}">
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
              <div style="width: 36px; height: 36px; border: 2px solid #00EAD3; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                <span style="color: #00EAD3; font-size: 22px; font-weight: 700;">+</span>
              </div>
              <p style="font-family: 'Urbanist', sans-serif; font-size: 18px; font-weight: 600; color: #FFFFFF; text-transform: uppercase; letter-spacing: 0.05em;">${b.title}</p>
            </div>
            <p style="font-size: 15px; line-height: 1.7; color: #808285;">${b.description}</p>
          </div>
        `).join('')}
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- NEW: SOLAR BATTERY CONSIDERATIONS (2x2 warnings grid) ----
function genBatteryConsiderations(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const considerations = (c.considerations as Array<{ title: string; description: string }>) || [
    { title: 'UPFRONT CAPITAL', description: 'Initial investment requires careful financial planning, though rebates significantly reduce costs.' },
    { title: 'PAYBACK PERIOD', description: 'Return on investment typically occurs within 4-7 years depending on usage and tariff structure.' },
    { title: 'INSTALLATION REQUIREMENTS', description: 'Professional installation required with potential switchboard upgrades for optimal integration.' },
    { title: 'LIFECYCLE & REPLACEMENT', description: 'Battery systems have a 10-15 year lifespan with gradual capacity degradation over time.' },
  ];
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 0; margin-top: 20px; flex: 1;">
        ${considerations.slice(0, 4).map((c, i) => `
          <div style="padding: 36px 40px; ${i % 2 === 0 ? 'border-right: 1px solid #333;' : ''} ${i < 2 ? 'border-bottom: 1px solid #333;' : ''}">
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
              <div style="width: 36px; height: 36px; border: 2px solid #f36710; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                <span style="color: #f36710; font-size: 22px; font-weight: 700;">!</span>
              </div>
              <p style="font-family: 'Urbanist', sans-serif; font-size: 18px; font-weight: 600; color: #FFFFFF; text-transform: uppercase; letter-spacing: 0.05em;">${c.title}</p>
            </div>
            <p style="font-size: 15px; line-height: 1.7; color: #808285;">${c.description}</p>
          </div>
        `).join('')}
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- NEW: EV VS PETROL VEHICLE ----
function genEVvsPetrol(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 40px; margin-top: 20px;">
        <div style="flex: 1; background: #1a1a1a; border-radius: 8px; padding: 32px;">
          <p style="font-family: 'NextSphere', sans-serif; font-size: 24px; color: #FFFFFF; text-transform: uppercase; margin-bottom: 24px;">PETROL VEHICLE</p>
          <div style="border-bottom: 1px solid #333; padding: 12px 0;"><span class="gray" style="font-size: 13px;">Fuel Efficiency</span><span style="float: right; font-weight: 600;">${c.petrolEfficiency || '10.0'} L / 100km</span></div>
          <div style="border-bottom: 1px solid #333; padding: 12px 0;"><span class="gray" style="font-size: 13px;">Fuel Price (Avg)</span><span style="float: right; font-weight: 600;">$${c.petrolPrice || '1.80'} / L</span></div>
          <div style="padding: 12px 0;"><span class="gray" style="font-size: 13px;">Total Fuel Consumed</span><span style="float: right; font-weight: 600;">${c.totalLitres || '1,000'} Litres</span></div>
          <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #333;">
            <p class="lbl" style="color: #f36710;">ANNUAL FUEL COST</p>
            <p class="hero-num white" style="font-size: 52px;">$${(c.annualPetrolCost as number || 1800).toLocaleString()}</p>
          </div>
        </div>
        <div style="flex: 1; background: #1a1a1a; border-radius: 8px; padding: 32px;">
          <p style="font-family: 'NextSphere', sans-serif; font-size: 24px; color: #00EAD3; text-transform: uppercase; margin-bottom: 24px;">ELECTRIC VEHICLE</p>
          <div style="border-bottom: 1px solid #333; padding: 12px 0;"><span class="gray" style="font-size: 13px;">Energy Efficiency</span><span style="float: right; font-weight: 600;">${c.evEfficiency || '15.0'} kWh / 100km</span></div>
          <div style="border-bottom: 1px solid #333; padding: 12px 0;"><span class="gray" style="font-size: 13px;">Charging Cost (Avg)</span><span style="float: right; font-weight: 600;">$${c.chargingCostPerKwh || '0.115'} / kWh</span></div>
          <div style="padding: 12px 0;"><span class="gray" style="font-size: 13px;">Total Energy Required</span><span style="float: right; font-weight: 600;">${c.totalKwhRequired || '1,500'} kWh</span></div>
          <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #333;">
            <p class="lbl">ANNUAL CHARGING COST</p>
            <p class="hero-num aqua" style="font-size: 52px;">$${(c.annualEvCost as number || 173).toLocaleString()}</p>
          </div>
        </div>
      </div>
      <div style="margin-top: 24px; background: #1a1a1a; border-left: 4px solid #00EAD3; border-radius: 0 8px 8px 0; padding: 20px 28px; display: flex; justify-content: space-between; align-items: center;">
        <p style="font-family: 'NextSphere', sans-serif; font-size: 18px; color: #00EAD3; text-transform: uppercase;">PROJECTED ANNUAL SAVINGS</p>
        <p class="hero-num aqua" style="font-size: 48px;">$${(c.annualSavings as number || 1327).toLocaleString()}</p>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- NEW: FINANCIAL INVESTMENT ----
function genFinancialInvestment(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const lineItems = (c.lineItems as Array<{ label: string; amount: number; isCredit: boolean }>) || [];
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 50px; margin-top: 20px;">
        <div style="flex: 1.2;">
          ${lineItems.map(item => `
            <div style="display: flex; justify-content: space-between; padding: 16px 0; border-bottom: 1px solid #333;">
              <span style="font-size: 16px; color: ${item.isCredit ? '#00EAD3' : '#FFFFFF'};">${item.label}</span>
              <span style="font-size: 18px; font-weight: 600; color: ${item.isCredit ? '#00EAD3' : '#FFFFFF'};">${item.isCredit ? '-' : ''}$${Math.abs(item.amount).toLocaleString()}</span>
            </div>
          `).join('')}
          <div style="margin-top: 24px; padding-top: 24px; border-top: 2px solid #00EAD3;">
            <p style="font-family: 'NextSphere', sans-serif; font-size: 22px; color: #FFFFFF; text-transform: uppercase;">NET INVESTMENT</p>
            <p class="hero-num aqua" style="font-size: 64px; margin-top: 8px;">$${(c.netInvestment as number || 0).toLocaleString()}</p>
          </div>
        </div>
        <div style="flex: 0.8;">
          <div style="background: #1a1a1a; border-radius: 8px; padding: 32px; display: flex; flex-direction: column; gap: 28px;">
            <div style="text-align: center;">
              <p class="hero-num aqua" style="font-size: 56px;">${c.billReductionPct || '96'}%</p>
              <p class="lbl" style="margin-top: 8px;">BILL REDUCTION</p>
            </div>
            <div style="text-align: center; border-top: 1px solid #333; padding-top: 24px;">
              <p class="hero-num aqua" style="font-size: 56px;">$${(c.firstYearSavings as number || 0).toLocaleString()}</p>
              <p class="lbl" style="margin-top: 8px;">1ST YEAR SAVINGS</p>
            </div>
            <div style="text-align: center; border-top: 1px solid #333; padding-top: 24px;">
              <p class="hero-num aqua" style="font-size: 56px;">${c.paybackYears || '4-5'} <span class="unit" style="font-size: 24px;">YRS</span></p>
              <p class="lbl" style="margin-top: 8px;">PAYBACK PERIOD</p>
            </div>
          </div>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- NEW: RETURN ON INVESTMENT ----
function genReturnOnInvestment(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const netInvestment = c.netInvestment as number || 10000;
  const annualSavings = c.annualSavings as number || 1500;
  const years = 10;
  const dataPoints: Array<{ year: number; value: number }> = [{ year: 0, value: -netInvestment }];
  for (let i = 1; i <= years; i++) {
    dataPoints.push({ year: i, value: -netInvestment + (annualSavings * i * Math.pow(1.035, i)) });
  }
  const breakEvenYear = dataPoints.findIndex(d => d.value >= 0);
  const tenYearBenefit = Math.round(dataPoints[years].value);
  const roi = Math.round((tenYearBenefit / netInvestment) * 100);
  const maxVal = Math.max(...dataPoints.map(d => Math.abs(d.value)));
  const midY = 350;
  const scale = midY / maxVal;
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 40px; margin-top: 20px;">
        <div style="flex: 1.8; position: relative; height: 500px;">
          <svg viewBox="0 0 800 500" style="width: 100%; height: 100%;">
            <defs>
              <linearGradient id="roiGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#00EAD3" stop-opacity="0.3"/>
                <stop offset="100%" stop-color="#00EAD3" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <line x1="60" y1="250" x2="780" y2="250" stroke="#333" stroke-width="1" />
            <text x="40" y="255" fill="#808285" font-size="11" text-anchor="end">$0</text>
            ${(() => {
              const pts = dataPoints.map((d, i) => ({ x: 80 + (i * 70), y: 250 - (d.value * scale * 0.7) }));
              // Build smooth cubic bezier path
              let curvePath = `M${pts[0].x},${pts[0].y}`;
              for (let i = 0; i < pts.length - 1; i++) {
                const cpx = (pts[i].x + pts[i + 1].x) / 2;
                curvePath += ` C${cpx},${pts[i].y} ${cpx},${pts[i + 1].y} ${pts[i + 1].x},${pts[i + 1].y}`;
              }
              // Build filled area path
              const lastPt = pts[pts.length - 1];
              const fillPath = curvePath + ` L${lastPt.x},250 L${pts[0].x},250 Z`;
              return `
                <path d="${fillPath}" fill="url(#roiGrad)" />
                <path d="${curvePath}" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
              `;
            })()}
            ${dataPoints.map((d, i) => {
              const x = 80 + (i * 70);
              const y = 250 - (d.value * scale * 0.7);
              const color = d.value >= 0 ? '#00EAD3' : '#f36710';
              return `
                <circle cx="${x}" cy="${y}" r="6" fill="${color}" stroke="#000" stroke-width="2" />
                <text x="${x}" y="480" fill="#808285" font-size="10" text-anchor="middle">${d.year === 0 ? 'Start' : 'Yr ' + d.year}</text>
              `;
            }).join('')}
          </svg>
        </div>
        <div style="flex: 1; display: flex; flex-direction: column; gap: 20px;">
          <div style="border-left: 4px solid #00EAD3; padding: 16px 20px; background: #1a1a1a; border-radius: 0 8px 8px 0;">
            <p class="lbl">BREAK EVEN POINT</p>
            <p class="hero-num white" style="font-size: 48px;">YEAR ${breakEvenYear > 0 ? breakEvenYear : '4'}</p>
            <p style="font-size: 13px; color: #808285; margin-top: 4px;">System fully paid off</p>
          </div>
          <div style="border-left: 4px solid #00EAD3; padding: 16px 20px; background: #1a1a1a; border-radius: 0 8px 8px 0;">
            <p class="lbl">10-YEAR NET BENEFIT</p>
            <p class="hero-num aqua" style="font-size: 48px;">$${Math.abs(tenYearBenefit).toLocaleString()}</p>
            <p style="font-size: 13px; color: #808285; margin-top: 4px;">Total profit after investment</p>
          </div>
          <div style="border-left: 4px solid #00EAD3; padding: 16px 20px; background: #1a1a1a; border-radius: 0 8px 8px 0;">
            <p class="lbl">RETURN ON INVESTMENT</p>
            <p class="hero-num white" style="font-size: 48px;">${roi}%</p>
            <p style="font-size: 13px; color: #808285; margin-top: 4px;">Over 10-year period</p>
          </div>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- NEW: ENERGY OPTIMISATION REPORT ----
function genEnergyOptimisation(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const strategies = (c.strategies as Array<{ title: string; description: string; borderColor: string }>) || [
    { title: 'ACTIVE SOLAR SOAKING', description: 'Schedule HVAC and pool pump operation between 10am-3pm to maximise self-consumption.', borderColor: '#f36710' },
    { title: 'WINTER RESILIENCE STRATEGY', description: 'Maintain gas heating as backup during peak winter months for reliable comfort.', borderColor: '#00EAD3' },
    { title: 'SMART EV INTEGRATION', description: 'Set EV charger to Solar Only mode for zero-cost charging during daylight hours.', borderColor: '#f36710' },
  ];
  const impacts = (c.projectedImpact as Array<{ label: string; value: string }>) || [
    { label: 'Solar Self-Consumption', value: 'Increase to >65%' },
    { label: 'Grid Independence', value: '93% Annually' },
    { label: 'EV Fuel Cost', value: '$0 / year' },
    { label: 'Heating Security', value: '100% Backup' },
  ];
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 40px; margin-top: 20px;">
        <div style="flex: 1.2; display: flex; flex-direction: column; gap: 20px;">
          ${strategies.map(s => `
            <div style="border-left: 4px solid ${s.borderColor}; padding: 16px 24px; background: #1a1a1a; border-radius: 0 8px 8px 0;">
              <p style="font-family: 'NextSphere', sans-serif; font-size: 18px; color: ${s.borderColor === '#f36710' ? '#f36710' : '#00EAD3'}; text-transform: uppercase; margin-bottom: 10px;">${s.title}</p>
              <p style="font-size: 14px; line-height: 1.7; color: #ccc;">${s.description}</p>
            </div>
          `).join('')}
        </div>
        <div style="flex: 0.8;">
          <div style="background: #1a1a1a; border-radius: 8px; padding: 32px;">
            <p style="font-family: 'NextSphere', sans-serif; font-size: 20px; color: #00EAD3; text-transform: uppercase; text-align: center; margin-bottom: 24px;">PROJECTED IMPACT</p>
            ${impacts.map(imp => `
              <div style="display: flex; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #333;">
                <span style="font-size: 14px; color: #808285;">${imp.label}</span>
                <span style="font-size: 16px; font-weight: 600; color: #00EAD3;">${imp.value}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- NEW: REQUIRED ELECTRICAL WORKS ----
function genRequiredElectricalWorks(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const assessments = (c.assessments as Array<{ title: string; description: string }>) || [
    { title: 'SWITCHBOARD CAPACITY', description: 'Assessment of current switchboard capacity and potential upgrade requirements.' },
    { title: 'PROTECTION DEVICES', description: 'Installation of appropriate RCBOs and circuit protection for the solar array.' },
    { title: 'SMART METER', description: 'Meter configuration or replacement for solar export and VPP participation.' },
  ];
  const photos = (c.sitePhotos as Array<{ url: string; caption: string }>) || [];
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 40px; margin-top: 20px;">
        <div style="flex: 1; display: flex; flex-direction: column; gap: 20px;">
          ${assessments.map(a => `
            <div style="border-left: 4px solid #f36710; padding: 16px 24px; background: #1a1a1a; border-radius: 0 8px 8px 0;">
              <p style="font-family: 'NextSphere', sans-serif; font-size: 18px; color: #FFFFFF; text-transform: uppercase; margin-bottom: 10px;">${a.title}</p>
              <p style="font-size: 14px; line-height: 1.7; color: #ccc;">${a.description}</p>
            </div>
          `).join('')}
        </div>
        <div style="flex: 1; display: flex; gap: 16px;">
          ${photos.length > 0 ? photos.slice(0, 2).map((p, i) => `
            <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
              <div style="border: 1px solid #333; border-radius: 4px; padding: 4px; flex: 1;">
                <img src="${p.url}" style="width: 100%; height: 300px; object-fit: cover; border-radius: 2px;" />
              </div>
              <p style="font-size: 11px; color: #808285; text-transform: uppercase; text-align: center; letter-spacing: 0.1em;">PHOTO ${String.fromCharCode(65 + i)}: ${p.caption}</p>
            </div>
          `).join('') : `
            <div style="flex: 1; display: flex; align-items: center; justify-content: center; border: 1px dashed #333; border-radius: 8px;">
              <p style="color: #808285; font-size: 14px;">Site photos will be added during assessment</p>
            </div>
          `}
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- NEW: SYSTEM INTEGRATION (appliance cards) ----
function genSystemIntegration(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const appliances = (c.appliances as Array<{ name: string; strategy: string; description: string; photoUrl?: string }>) || [];
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: grid; grid-template-columns: repeat(${Math.min(appliances.length, 3)}, 1fr); gap: 24px; margin-top: 20px;">
        ${appliances.slice(0, 3).map(a => `
          <div style="background: #1a1a1a; border-radius: 8px; border-top: 3px solid #f36710; overflow: hidden;">
            ${a.photoUrl ? `<img src="${a.photoUrl}" style="width: 100%; height: 200px; object-fit: cover;" />` : '<div style="height: 200px; background: #111; display: flex; align-items: center; justify-content: center;"><span style="color: #808285;">Photo</span></div>'}
            <div style="padding: 20px;">
              <p style="font-family: 'NextSphere', sans-serif; font-size: 20px; color: #FFFFFF; text-transform: uppercase; margin-bottom: 6px;">${a.name}</p>
              <p style="font-family: 'Urbanist', sans-serif; font-size: 13px; color: #00EAD3; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">${a.strategy}</p>
              <p style="font-size: 14px; line-height: 1.7; color: #808285;">${a.description}</p>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- GENERIC FALLBACK ----
function genGeneric(slide: SlideContent): string {
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="margin-top: 20px;">
        <pre style="color: #808285; font-size: 13px; white-space: pre-wrap;">${JSON.stringify(slide.content, null, 2)}</pre>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- NEW SLIDE: TARIFF RATE COMPARISON ----
function genTariffComparison(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const peakRate = (c.peakRate as number) || 0;
  const offPeakRate = (c.offPeakRate as number) || 0;
  const shoulderRate = (c.shoulderRate as number) || 0;
  const feedIn = (c.feedInTariff as number) || 0;
  const supply = (c.dailySupplyCharge as number) || 0;
  const peakKwh = (c.peakUsageKwh as number) || 0;
  const offPeakKwh = (c.offPeakUsageKwh as number) || 0;
  const shoulderKwh = (c.shoulderUsageKwh as number) || 0;
  const totalKwh = (c.totalUsageKwh as number) || peakKwh + offPeakKwh + shoulderKwh || 1;
  const maxRate = Math.max(peakRate, offPeakRate, shoulderRate, feedIn, 30);
  
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || 'Understanding your electricity rate structure')}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1;">
          <p class="lbl" style="margin-bottom: 16px;">RATE COMPARISON (¢/kWh)</p>
          <div style="display: flex; align-items: flex-end; height: 280px; gap: 30px; padding: 0 20px;">
            ${[
              { label: 'Peak', rate: peakRate, color: '#FFFFFF' },
              { label: 'Off-Peak', rate: offPeakRate, color: '#808285' },
              { label: 'Shoulder', rate: shoulderRate, color: '#808285' },
              { label: 'Feed-In', rate: feedIn, color: '#00EAD3' },
            ].map(r => `
              <div style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end;">
                <p style="font-size: 16px; font-weight: 600; margin-bottom: 8px; color: ${r.color};">${r.rate.toFixed(1)}¢</p>
                <div style="width: 100%; height: ${(r.rate / maxRate) * 220}px; background: ${r.color}; border-radius: 8px 8px 0 0;"></div>
                <p style="font-size: 11px; color: #808285; margin-top: 8px; text-align: center;">${r.label}</p>
              </div>
            `).join('')}
          </div>
        </div>
        <div style="flex: 1;">
          <p class="lbl" style="margin-bottom: 16px;">USAGE DISTRIBUTION</p>
          <table>
            <tr><th>TARIFF BAND</th><th style="text-align: right;">USAGE (kWh)</th><th style="text-align: right;">% OF TOTAL</th></tr>
            <tr><td>Peak</td><td style="text-align: right;">${peakKwh.toFixed(0)}</td><td style="text-align: right; font-weight: 600;">${((peakKwh / totalKwh) * 100).toFixed(1)}%</td></tr>
            <tr><td>Off-Peak</td><td style="text-align: right;">${offPeakKwh.toFixed(0)}</td><td style="text-align: right; font-weight: 600;">${((offPeakKwh / totalKwh) * 100).toFixed(1)}%</td></tr>
            <tr><td>Shoulder</td><td style="text-align: right;">${shoulderKwh.toFixed(0)}</td><td style="text-align: right; font-weight: 600;">${((shoulderKwh / totalKwh) * 100).toFixed(1)}%</td></tr>
          </table>
          <div class="insight-card" style="margin-top: 24px;">
            <p class="insight-title">TARIFF INSIGHT</p>
            <p>Your peak rate of <span class="hl-aqua">${peakRate.toFixed(1)}¢/kWh</span> is ${((peakRate / feedIn) - 1).toFixed(0)}x higher than your feed-in tariff of <span class="hl-aqua">${feedIn.toFixed(1)}¢/kWh</span>. Battery storage captures this arbitrage by storing solar energy for peak consumption.</p>
          </div>
          <div style="margin-top: 16px;">
            <p class="lbl">DAILY SUPPLY CHARGE</p>
            <p style="font-size: 24px; font-weight: 600; color: #FFFFFF;">${supply.toFixed(2)}¢ <span class="gray" style="font-size: 14px;">per day ($${((supply * 365) / 100).toFixed(0)}/year)</span></p>
          </div>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- NEW SLIDE: DAILY LOAD PROFILE ----
function genDailyLoadProfile(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const daily = (c.dailyAverageKwh as number) || 10;
  const hasEv = c.hasEV as boolean;
  const hasPool = c.hasPool as boolean;
  
  // Typical load curve
  const loadCurve = [
    0.02, 0.015, 0.015, 0.015, 0.02, 0.03,
    0.05, 0.06, 0.05, 0.04, 0.035, 0.03,
    0.03, 0.03, 0.035, 0.04, 0.05, 0.06,
    0.08, 0.09, 0.08, 0.07, 0.05, 0.03,
  ];
  const labels = ['12a','1a','2a','3a','4a','5a','6a','7a','8a','9a','10a','11a',
    '12p','1p','2p','3p','4p','5p','6p','7p','8p','9p','10p','11p'];
  
  const hourly = loadCurve.map((pct, h) => {
    let kwh = daily * pct;
    if (hasEv && h >= 0 && h <= 5) kwh += 1.5;
    if (hasPool && h >= 10 && h <= 14) kwh += 0.4;
    return { h, kwh, label: labels[h] };
  });
  const maxKwh = Math.max(...hourly.map(h => h.kwh));
  
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || 'Estimated 24-hour energy consumption pattern')}
      <div style="margin-top: 10px;">
        <div style="display: flex; align-items: flex-end; height: 300px; gap: 2px; padding: 0 10px; border-bottom: 1px solid #333;">
          ${hourly.map(h => {
            const isSolar = h.h >= 7 && h.h <= 17;
            const isPeak = h.h >= 15 && h.h <= 21;
            const color = isPeak ? '#FFFFFF' : isSolar ? '#00EAD3' : '#808285';
            return `
              <div style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end;">
                <div style="width: 100%; height: ${(h.kwh / maxKwh) * 260}px; background: ${color}; border-radius: 8px 8px 0 0; min-height: 4px;"></div>
              </div>
            `;
          }).join('')}
        </div>
        <div style="display: flex; gap: 2px; padding: 0 10px;">
          ${hourly.map(h => `<div style="flex: 1; text-align: center; font-size: 9px; color: #808285; padding-top: 4px;">${h.label}</div>`).join('')}
        </div>
      </div>
      <div style="display: flex; gap: 24px; margin-top: 24px;">
        <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 12px; height: 12px; background: #00EAD3; border-radius: 4px;"></div><span style="font-size: 11px; color: #808285;">Solar Generation Hours (7am-5pm)</span></div>
        <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 12px; height: 12px; background: #FFFFFF; border-radius: 4px;"></div><span style="font-size: 11px; color: #808285;">Peak Demand (3pm-9pm)</span></div>
        <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 12px; height: 12px; background: #808285; border-radius: 4px;"></div><span style="font-size: 11px; color: #808285;">Off-Peak / Overnight</span></div>
      </div>
      <div style="display: flex; gap: 24px; margin-top: 20px;">
        <div class="card" style="flex: 1; text-align: center;">
          <p class="lbl">DAILY AVERAGE</p>
          <p style="font-size: 28px; font-weight: 600; color: #00EAD3;">${daily.toFixed(1)} kWh</p>
        </div>
        <div class="card" style="flex: 1; text-align: center;">
          <p class="lbl">PEAK DEMAND</p>
          <p style="font-size: 28px; font-weight: 600; color: #FFFFFF;">6pm - 9pm</p>
        </div>
        <div class="card" style="flex: 1; text-align: center;">
          <p class="lbl">SOLAR WINDOW</p>
          <p style="font-size: 28px; font-weight: 600; color: #00EAD3;">7am - 5pm</p>
        </div>
        ${hasEv ? `<div class="card" style="flex: 1; text-align: center;"><p class="lbl">EV CHARGING</p><p style="font-size: 28px; font-weight: 600; color: #00EAD3;">Overnight</p></div>` : ''}
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- NEW SLIDE: SOLAR GENERATION PROFILE ----
function genSolarGenerationProfile(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const solarKw = (c.solarKw as number) || 6.6;
  const yearlyUsage = (c.yearlyUsageKwh as number) || 3000;
  const annualGen = (c.solarAnnualGeneration as number) || solarKw * 365 * 4;
  
  const monthlyFactors = [
    { month: 'Jan', factor: 1.35 }, { month: 'Feb', factor: 1.25 },
    { month: 'Mar', factor: 1.10 }, { month: 'Apr', factor: 0.90 },
    { month: 'May', factor: 0.70 }, { month: 'Jun', factor: 0.60 },
    { month: 'Jul', factor: 0.65 }, { month: 'Aug', factor: 0.80 },
    { month: 'Sep', factor: 0.95 }, { month: 'Oct', factor: 1.15 },
    { month: 'Nov', factor: 1.25 }, { month: 'Dec', factor: 1.30 },
  ];
  
  const monthlyAvgGen = annualGen / 12;
  const monthlyAvgUse = yearlyUsage / 12;
  const months = monthlyFactors.map(m => ({
    month: m.month,
    gen: Math.round(monthlyAvgGen * m.factor),
    use: Math.round(monthlyAvgUse * (m.factor > 1 ? 0.9 : 1.1)),
  }));
  const maxVal = Math.max(...months.map(m => Math.max(m.gen, m.use)));
  const coverage = Math.round((annualGen / yearlyUsage) * 100);
  
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || 'Monthly solar generation vs household consumption')}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1.5;">
          <div style="display: flex; align-items: flex-end; height: 300px; gap: 6px; padding: 0 10px; border-bottom: 1px solid #333;">
            ${months.map(m => `
              <div style="flex: 1; display: flex; gap: 2px; align-items: flex-end; height: 100%;">
                <div style="flex: 1; height: ${(m.gen / maxVal) * 260}px; background: #00EAD3; border-radius: 8px 8px 0 0;"></div>
                <div style="flex: 1; height: ${(m.use / maxVal) * 260}px; background: #808285; border-radius: 8px 8px 0 0;"></div>
              </div>
            `).join('')}
          </div>
          <div style="display: flex; gap: 6px; padding: 0 10px;">
            ${months.map(m => `<div style="flex: 1; text-align: center; font-size: 10px; color: #808285; padding-top: 6px;">${m.month}</div>`).join('')}
          </div>
          <div style="display: flex; gap: 24px; margin-top: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 12px; height: 12px; background: #00EAD3; border-radius: 4px;"></div><span style="font-size: 11px; color: #808285;">Solar Generation</span></div>
            <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 12px; height: 12px; background: #808285; border-radius: 4px;"></div><span style="font-size: 11px; color: #808285;">Household Consumption</span></div>
          </div>
        </div>
        <div style="flex: 0.8;">
          <div class="card aqua-b" style="text-align: center; margin-bottom: 20px; padding: 30px;">
            <p class="lbl" style="color: #00EAD3;">SOLAR COVERAGE</p>
            <p class="hero-num aqua" style="font-size: 64px;">${coverage}%</p>
          </div>
          <div class="card" style="text-align: center; margin-bottom: 16px;">
            <p class="lbl">ANNUAL GENERATION</p>
            <p style="font-size: 22px; font-weight: 600;">${annualGen.toLocaleString()} kWh</p>
          </div>
          <div class="card" style="text-align: center;">
            <p class="lbl">ANNUAL CONSUMPTION</p>
            <p style="font-size: 22px; font-weight: 600;">${yearlyUsage.toLocaleString()} kWh</p>
          </div>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- NEW SLIDE: BATTERY CHARGE/DISCHARGE CYCLE ----
function genBatteryCycle(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const batteryKwh = (c.batteryKwh as number) || 10;
  const hasEv = c.hasEV as boolean;
  
  // SOC curve simulation
  const socCurve = [
    30, 25, 20, 18, 15, 12, // 0-5am: overnight discharge
    15, 18, 25, 40, 55, 70, // 6-11am: morning solar charge
    82, 90, 95, 100, 98, 95, // 12-5pm: peak solar
    85, 70, 55, 40, 35, 32, // 6-11pm: evening discharge
  ];
  const labels = ['12a','1a','2a','3a','4a','5a','6a','7a','8a','9a','10a','11a',
    '12p','1p','2p','3p','4p','5p','6p','7p','8p','9p','10p','11p'];
  
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || 'Typical daily battery state of charge pattern')}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1.5;">
          <p class="lbl" style="margin-bottom: 12px;">STATE OF CHARGE (%) — TYPICAL DAY</p>
          <div style="position: relative; height: 280px; border-left: 1px solid #333; border-bottom: 1px solid #333; padding: 0 10px;">
            ${[100, 75, 50, 25, 0].map(pct => `
              <div style="position: absolute; left: 0; bottom: ${pct}%; width: 100%; border-bottom: 1px dashed #1a1a1a;">
                <span style="position: absolute; left: -30px; font-size: 9px; color: #808285; transform: translateY(50%);">${pct}%</span>
              </div>
            `).join('')}
            <svg viewBox="0 0 240 100" style="width: 100%; height: 100%;" preserveAspectRatio="none">
              <defs>
                <linearGradient id="socGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#00EAD3" stop-opacity="0.3"/>
                  <stop offset="100%" stop-color="#00EAD3" stop-opacity="0"/>
                </linearGradient>
              </defs>
              ${(() => {
                // Build smooth cubic bezier path for SOC curve
                const pts = socCurve.map((soc, i) => ({ x: (i / 23) * 240, y: 100 - soc }));
                let curvePath = 'M' + pts[0].x + ',' + pts[0].y;
                for (let i = 0; i < pts.length - 1; i++) {
                  const cpx = (pts[i].x + pts[i + 1].x) / 2;
                  curvePath += ' C' + cpx + ',' + pts[i].y + ' ' + cpx + ',' + pts[i + 1].y + ' ' + pts[i + 1].x + ',' + pts[i + 1].y;
                }
                const fillPath = 'M0,100 L' + pts[0].x + ',' + pts[0].y + curvePath.substring(curvePath.indexOf(' C')) + ' L' + pts[pts.length - 1].x + ',100 Z';
                return '<path d="' + curvePath + '" fill="none" stroke="#00EAD3" stroke-width="2" stroke-linecap="round"/>' +
                  '<path d="' + fillPath + '" fill="url(#socGrad)"/>';
              })()}
            </svg>
          </div>
          <div style="display: flex; gap: 2px; padding: 0 10px;">
            ${labels.map(l => `<div style="flex: 1; text-align: center; font-size: 9px; color: #808285; padding-top: 4px;">${l}</div>`).join('')}
          </div>
        </div>
        <div style="flex: 0.8;">
          <div class="card aqua-b" style="text-align: center; margin-bottom: 16px; padding: 24px;">
            <p class="lbl" style="color: #00EAD3;">BATTERY CAPACITY</p>
            <p class="hero-num aqua" style="font-size: 48px;">${batteryKwh} kWh</p>
          </div>
          <div class="card" style="margin-bottom: 16px;">
            <p class="lbl">DAILY CYCLE</p>
            <div style="margin-top: 10px;">
              <p style="font-size: 12px; color: #808285; margin-bottom: 6px;">☀️ <span style="color: #00EAD3;">7am-5pm</span> Solar Charging</p>
              <p style="font-size: 12px; color: #808285; margin-bottom: 6px;">🔋 <span style="color: #FFFFFF;">6pm-9pm</span> Peak Discharge</p>
              <p style="font-size: 12px; color: #808285; margin-bottom: 6px;">🌙 <span style="color: #808285;">10pm-6am</span> Base Load</p>
              ${hasEv ? `<p style="font-size: 12px; color: #808285;">⚡ <span style="color: #00EAD3;">12am-5am</span> EV Charging</p>` : ''}
            </div>
          </div>
          <div style="display: flex; gap: 12px;">
            <div class="card" style="flex: 1; text-align: center;">
              <p class="lbl">DOD</p>
              <p style="font-size: 18px; font-weight: 600;">90%</p>
            </div>
            <div class="card" style="flex: 1; text-align: center;">
              <p class="lbl">EFFICIENCY</p>
              <p style="font-size: 18px; font-weight: 600;">95%</p>
            </div>
          </div>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- NEW SLIDE: GRID INDEPENDENCE ----
function genGridIndependence(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const yearlyUsage = (c.yearlyUsageKwh as number) || 3000;
  const solarGen = (c.solarGenerationKwh as number) || 5000;
  const batteryKwh = (c.batteryKwh as number) || 10;
  
  const solarSelfConsumed = Math.min(solarGen * 0.35, yearlyUsage);
  const batteryContribution = batteryKwh * 365 * 0.8 * 0.95;
  const totalSelfConsumed = Math.min(solarSelfConsumed + batteryContribution, yearlyUsage);
  const selfSufficiency = Math.min(Math.round((totalSelfConsumed / yearlyUsage) * 100), 100);
  const gridImport = Math.max(0, Math.round(yearlyUsage - totalSelfConsumed));
  const gridExport = Math.max(0, Math.round(solarGen - solarSelfConsumed - batteryContribution));
  
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || 'Your path to energy independence')}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1; text-align: center;">
          <p class="lbl" style="margin-bottom: 20px;">ENERGY SELF-SUFFICIENCY</p>
          <div style="position: relative; width: 240px; height: 240px; margin: 0 auto;">
            <svg viewBox="0 0 100 100" style="width: 100%; height: 100%; transform: rotate(-90deg);">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#1a1a1a" stroke-width="8"/>
              <circle cx="50" cy="50" r="42" fill="none" stroke="#00EAD3" stroke-width="8" stroke-dasharray="${selfSufficiency * 2.64} ${(100 - selfSufficiency) * 2.64}" stroke-linecap="round"/>
            </svg>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
              <p class="hero-num aqua" style="font-size: 56px;">${selfSufficiency}%</p>
              <p class="gray" style="font-size: 12px;">Self-Sufficient</p>
            </div>
          </div>
          <div style="display: flex; gap: 16px; margin-top: 24px;">
            <div class="card" style="flex: 1; text-align: center;">
              <p class="lbl">BEFORE</p>
              <p style="font-size: 36px; font-weight: 600; color: #FFFFFF;">0%</p>
              <p class="gray" style="font-size: 11px;">100% Grid Dependent</p>
            </div>
            <div style="display: flex; align-items: center; font-size: 24px; color: #00EAD3;">→</div>
            <div class="card aqua-b" style="flex: 1; text-align: center;">
              <p class="lbl" style="color: #00EAD3;">AFTER</p>
              <p style="font-size: 36px; font-weight: 600; color: #00EAD3;">${selfSufficiency}%</p>
              <p class="gray" style="font-size: 11px;">Energy Independent</p>
            </div>
          </div>
        </div>
        <div style="flex: 1;">
          <p class="lbl" style="margin-bottom: 16px;">ENERGY FLOW BREAKDOWN</p>
          <table>
            <tr><th>SOURCE</th><th style="text-align: right;">kWh / YEAR</th><th style="text-align: right;">% OF TOTAL</th></tr>
            <tr><td style="color: #00EAD3;">Solar Self-Consumed</td><td style="text-align: right;">${Math.round(solarSelfConsumed).toLocaleString()}</td><td style="text-align: right; color: #00EAD3;">${Math.round((solarSelfConsumed / yearlyUsage) * 100)}%</td></tr>
            <tr><td style="color: #00EAD3;">Battery Contribution</td><td style="text-align: right;">${Math.round(batteryContribution).toLocaleString()}</td><td style="text-align: right; color: #00EAD3;">${Math.round((batteryContribution / yearlyUsage) * 100)}%</td></tr>
            <tr><td>Grid Import (Remaining)</td><td style="text-align: right;">${gridImport.toLocaleString()}</td><td style="text-align: right;">${Math.round((gridImport / yearlyUsage) * 100)}%</td></tr>
            <tr class="highlight-row"><td style="color: #00EAD3; font-weight: 700;">Grid Export (Revenue)</td><td style="text-align: right; color: #00EAD3; font-weight: 700;">${gridExport.toLocaleString()}</td><td style="text-align: right; color: #00EAD3; font-weight: 700;">Surplus</td></tr>
          </table>
          <div class="insight-card" style="margin-top: 20px;">
            <p class="insight-title">INDEPENDENCE INSIGHT</p>
            <p>Your proposed system achieves <span class="hl-aqua">${selfSufficiency}% energy independence</span>, reducing grid reliance from 100% to just ${100 - selfSufficiency}%. ${gridExport > 0 ? `You'll also export <span class="hl-aqua">${gridExport.toLocaleString()} kWh</span> back to the grid annually.` : ''}</p>
          </div>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- NEW SLIDE: REBATE BREAKDOWN ----
function genRebateBreakdown(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const state = (c.state as string) || 'VIC';
  const solarRebate = (c.solarRebate as number) || 0;
  const batteryRebate = (c.batteryRebate as number) || 0;
  const heatPumpHwRebate = (c.heatPumpHwRebate as number) || 0;
  const heatPumpAcRebate = (c.heatPumpAcRebate as number) || 0;
  const totalRebates = (c.totalRebates as number) || 0;
  const totalInvestment = (c.totalInvestment as number) || 0;
  const netInvestment = (c.netInvestment as number) || 0;
  
  const rebates = [
    { name: 'Solar PV (STCs)', amount: solarRebate, source: 'Federal Government', status: 'Available' },
    { name: 'Battery Rebate', amount: batteryRebate, source: `${state} State Government`, status: batteryRebate > 0 ? 'Available' : 'N/A' },
    { name: 'Heat Pump HW Rebate', amount: heatPumpHwRebate, source: `${state} State Government`, status: heatPumpHwRebate > 0 ? 'Available' : 'N/A' },
    { name: 'Heat Pump AC Rebate', amount: heatPumpAcRebate, source: `${state} State Government`, status: heatPumpAcRebate > 0 ? 'Available' : 'N/A' },
  ].filter(r => r.amount > 0);
  
  const savingsPercent = totalInvestment > 0 ? Math.round((totalRebates / totalInvestment) * 100) : 0;
  
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || 'Government incentives reducing your investment')}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1.2;">
          <table>
            <tr><th>REBATE / INCENTIVE</th><th>SOURCE</th><th style="text-align: right;">AMOUNT</th></tr>
            ${rebates.map(r => `
              <tr>
                <td style="font-weight: 600;">${r.name}</td>
                <td class="gray">${r.source}</td>
                <td style="text-align: right; color: #00EAD3; font-weight: 600;">$${r.amount.toLocaleString()}</td>
              </tr>
            `).join('')}
            <tr class="highlight-row">
              <td style="font-weight: 700; color: #00EAD3;">TOTAL REBATES</td>
              <td></td>
              <td style="text-align: right; font-weight: 700; color: #00EAD3; font-size: 20px;">$${totalRebates.toLocaleString()}</td>
            </tr>
          </table>
        </div>
        <div style="flex: 0.8;">
          <div class="card aqua-b" style="text-align: center; margin-bottom: 20px; padding: 30px;">
            <p class="lbl" style="color: #00EAD3;">YOU SAVE</p>
            <p class="hero-num aqua" style="font-size: 56px;">${savingsPercent}%</p>
            <p class="gray" style="font-size: 13px;">off gross investment</p>
          </div>
          <div style="display: flex; gap: 16px;">
            <div class="card" style="flex: 1; text-align: center;">
              <p class="lbl">GROSS</p>
              <p style="font-size: 20px; font-weight: 600;">$${totalInvestment.toLocaleString()}</p>
            </div>
            <div class="card" style="flex: 1; text-align: center;">
              <p class="lbl">REBATES</p>
              <p style="font-size: 20px; font-weight: 600; color: #00EAD3;">-$${totalRebates.toLocaleString()}</p>
            </div>
          </div>
          <div class="card aqua-b" style="text-align: center; margin-top: 16px; padding: 24px;">
            <p class="lbl">NET INVESTMENT</p>
            <p style="font-size: 32px; font-weight: 600;">$${netInvestment.toLocaleString()}</p>
          </div>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- NEW SLIDE: 25-YEAR FINANCIAL PROJECTION ----
function genFinancialProjection25yr(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const currentCost = (c.currentAnnualCost as number) || 1000;
  const annualSavings = (c.annualSavings as number) || 500;
  const netInvestment = (c.netInvestment as number) || 5000;
  const paybackYears = (c.paybackYears as number) || 5;
  const twentyFiveYearSavings = (c.twentyFiveYearSavings as number) || 20000;
  const tenYearSavings = (c.tenYearSavings as number) || 8000;
  
  // Generate projection data
  const milestones = [1, 5, 10, 15, 20, 25];
  const inflationRate = 0.035;
  
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || 'Long-term financial outlook with 3.5% annual inflation')}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1.2;">
          <table>
            <tr><th>YEAR</th><th style="text-align: right;">BILL (NO ACTION)</th><th style="text-align: right;">BILL (WITH SYSTEM)</th><th style="text-align: right;">CUMULATIVE SAVING</th></tr>
            ${milestones.map(yr => {
              const inflatedCost = Math.round(currentCost * Math.pow(1 + inflationRate, yr));
              const withSystem = Math.max(0, Math.round(inflatedCost - annualSavings));
              let cumSaving = -netInvestment;
              for (let y = 1; y <= yr; y++) {
                cumSaving += currentCost * Math.pow(1 + inflationRate, y) - Math.max(0, currentCost * Math.pow(1 + inflationRate, y) - annualSavings);
              }
              return `
                <tr class="${yr === Math.ceil(paybackYears) ? 'highlight-row' : ''}">
                  <td style="font-weight: 600;">${yr === Math.ceil(paybackYears) ? `Year ${yr} ⚡` : `Year ${yr}`}</td>
                  <td style="text-align: right; color: #FFFFFF;">$${inflatedCost.toLocaleString()}</td>
                  <td style="text-align: right; color: #00EAD3;">$${withSystem.toLocaleString()}</td>
                  <td style="text-align: right; font-weight: 600; color: ${cumSaving >= 0 ? '#00EAD3' : '#FFFFFF'};">${cumSaving >= 0 ? '+' : ''}$${Math.round(cumSaving).toLocaleString()}</td>
                </tr>
              `;
            }).join('')}
          </table>
          <p style="font-size: 11px; color: #808285; margin-top: 10px;">* Assumes 3.5% annual electricity price inflation. Payback at Year ${Math.ceil(paybackYears)}.</p>
        </div>
        <div style="flex: 0.8;">
          <div class="card aqua-b" style="text-align: center; margin-bottom: 16px; padding: 24px;">
            <p class="lbl" style="color: #00EAD3;">25-YEAR NET BENEFIT</p>
            <p class="hero-num aqua" style="font-size: 48px;">$${twentyFiveYearSavings.toLocaleString()}</p>
          </div>
          <div class="card" style="text-align: center; margin-bottom: 16px;">
            <p class="lbl">10-YEAR NET BENEFIT</p>
            <p style="font-size: 28px; font-weight: 600; color: #00EAD3;">$${tenYearSavings.toLocaleString()}</p>
          </div>
          <div class="card" style="text-align: center; margin-bottom: 16px;">
            <p class="lbl">PAYBACK PERIOD</p>
            <p style="font-size: 28px; font-weight: 600;">${paybackYears.toFixed(1)} Years</p>
          </div>
          <div class="insight-card" style="margin-top: 16px;">
            <p class="insight-title">INVESTMENT RETURN</p>
            <p>Your $${netInvestment.toLocaleString()} investment generates <span class="hl-aqua">$${twentyFiveYearSavings.toLocaleString()}</span> in net savings over 25 years — a <span class="hl-aqua">${Math.round((twentyFiveYearSavings / netInvestment) * 100)}%</span> return.</p>
          </div>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- NEW SLIDE: SYSTEM SPECIFICATIONS ----
function genSystemSpecifications(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const solarKw = (c.solarKw as number) || 6.6;
  const panelCount = (c.panelCount as number) || 16;
  const batteryKwh = (c.batteryKwh as number) || 10;
  const batteryProduct = (c.batteryProduct as string) || 'Sigenergy SigenStor';
  const hasExistingSolar = c.hasExistingSolar as boolean;
  
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || 'Complete technical specifications for your system')}
      <div style="display: flex; gap: 30px; margin-top: 10px;">
        ${!hasExistingSolar ? `
        <div style="flex: 1;">
          <div style="border-top: 3px solid #00EAD3; background: #0a0a0a; padding: 24px;">
            <p style="font-family: 'NextSphere', sans-serif; font-size: 18px; font-weight: 800; color: #00EAD3; margin-bottom: 16px;">SOLAR PV SYSTEM</p>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #1a1a1a; padding-bottom: 10px;">
                <span class="gray">System Size</span><span style="font-weight: 600;">${solarKw} kW</span>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #1a1a1a; padding-bottom: 10px;">
                <span class="gray">Panel Count</span><span style="font-weight: 600;">${panelCount} panels</span>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #1a1a1a; padding-bottom: 10px;">
                <span class="gray">Panel Wattage</span><span style="font-weight: 600;">400W</span>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #1a1a1a; padding-bottom: 10px;">
                <span class="gray">Panel Brand</span><span style="font-weight: 600;">Trina Solar Vertex S+</span>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #1a1a1a; padding-bottom: 10px;">
                <span class="gray">Annual Generation</span><span style="font-weight: 600; color: #00EAD3;">${(solarKw * 365 * 4).toLocaleString()} kWh</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span class="gray">Performance Warranty</span><span style="font-weight: 600;">25 years</span>
              </div>
            </div>
          </div>
        </div>
        ` : ''}
        <div style="flex: 1;">
          <div style="border-top: 3px solid #00EAD3; background: #0a0a0a; padding: 24px;">
            <p style="font-family: 'NextSphere', sans-serif; font-size: 18px; font-weight: 800; color: #00EAD3; margin-bottom: 16px;">BATTERY STORAGE</p>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #1a1a1a; padding-bottom: 10px;">
                <span class="gray">Total Capacity</span><span style="font-weight: 600;">${batteryKwh} kWh</span>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #1a1a1a; padding-bottom: 10px;">
                <span class="gray">Usable Capacity</span><span style="font-weight: 600;">${(batteryKwh * 0.9).toFixed(1)} kWh</span>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #1a1a1a; padding-bottom: 10px;">
                <span class="gray">Product</span><span style="font-weight: 600;">${batteryProduct}</span>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #1a1a1a; padding-bottom: 10px;">
                <span class="gray">Chemistry</span><span style="font-weight: 600;">LFP</span>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #1a1a1a; padding-bottom: 10px;">
                <span class="gray">Round-Trip Efficiency</span><span style="font-weight: 600; color: #00EAD3;">95%</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span class="gray">Cycle Warranty</span><span style="font-weight: 600;">6,000 cycles / 10 years</span>
              </div>
            </div>
          </div>
        </div>
        <div style="flex: 1;">
          <div style="border-top: 3px solid #00EAD3; background: #0a0a0a; padding: 24px;">
            <p style="font-family: 'NextSphere', sans-serif; font-size: 18px; font-weight: 800; color: #00EAD3; margin-bottom: 16px;">HYBRID INVERTER</p>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #1a1a1a; padding-bottom: 10px;">
                <span class="gray">Capacity</span><span style="font-weight: 600;">${Math.ceil(solarKw * 1.2)} kW</span>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #1a1a1a; padding-bottom: 10px;">
                <span class="gray">Brand</span><span style="font-weight: 600;">Sigenergy</span>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #1a1a1a; padding-bottom: 10px;">
                <span class="gray">Type</span><span style="font-weight: 600;">Hybrid (Solar + Battery)</span>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #1a1a1a; padding-bottom: 10px;">
                <span class="gray">Phases</span><span style="font-weight: 600;">Single Phase</span>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #1a1a1a; padding-bottom: 10px;">
                <span class="gray">VPP Compatible</span><span style="font-weight: 600; color: #00EAD3;">Yes</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span class="gray">Warranty</span><span style="font-weight: 600;">10 years</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- NEW SLIDE: WARRANTY & MAINTENANCE ----
function genWarrantyMaintenance(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const hasExistingSolar = c.hasExistingSolar as boolean;
  
  const warranties = [
    ...(!hasExistingSolar ? [
      { component: 'Solar Panels', manufacturer: '25 years', performance: '87.4% at 25 years', maintenance: 'Annual clean recommended' },
    ] : []),
    { component: 'Battery System', manufacturer: '10 years', performance: '6,000 cycles', maintenance: 'Firmware updates (automatic)' },
    { component: 'Hybrid Inverter', manufacturer: '10 years', performance: 'N/A', maintenance: 'Annual inspection' },
  ];
  
  const maintenanceSchedule = [
    { task: 'Visual Panel Inspection', frequency: 'Quarterly', cost: 'Free (DIY)' },
    { task: 'Professional Panel Clean', frequency: 'Annual', cost: '$150-250' },
    { task: 'System Health Check', frequency: 'Annual', cost: '$200-350' },
    { task: 'Inverter Firmware Update', frequency: 'As released', cost: 'Free (automatic)' },
    { task: 'Battery Performance Review', frequency: 'Annual', cost: 'Included in health check' },
  ];
  
  return `
    <div class="slide">
      <img src="${LOGO_URI_AQUA}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || 'Comprehensive warranty coverage and maintenance schedule')}
      <div style="display: flex; gap: 40px; margin-top: 10px;">
        <div style="flex: 1;">
          <p style="font-family: 'NextSphere', sans-serif; font-size: 16px; font-weight: 800; color: #00EAD3; margin-bottom: 14px;">WARRANTY COVERAGE</p>
          <table>
            <tr><th>COMPONENT</th><th>MANUFACTURER</th><th>PERFORMANCE</th></tr>
            ${warranties.map(w => `
              <tr>
                <td style="font-weight: 600;">${w.component}</td>
                <td style="color: #00EAD3;">${w.manufacturer}</td>
                <td class="gray">${w.performance}</td>
              </tr>
            `).join('')}
          </table>
        </div>
        <div style="flex: 1;">
          <p style="font-family: 'NextSphere', sans-serif; font-size: 16px; font-weight: 800; color: #00EAD3; margin-bottom: 14px;">MAINTENANCE SCHEDULE</p>
          <table>
            <tr><th>TASK</th><th>FREQUENCY</th><th style="text-align: right;">EST. COST</th></tr>
            ${maintenanceSchedule.map(m => `
              <tr>
                <td style="font-weight: 600;">${m.task}</td>
                <td class="gray">${m.frequency}</td>
                <td style="text-align: right;">${m.cost}</td>
              </tr>
            `).join('')}
          </table>
        </div>
      </div>
      <div class="insight-card" style="margin-top: 20px;">
        <p class="insight-title">LIGHTNING ENERGY SUPPORT</p>
        <p>All systems installed by Lightning Energy include <span class="hl-aqua">complimentary first-year maintenance</span> and ongoing support. Our team monitors your system performance remotely and proactively addresses any issues.</p>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}
