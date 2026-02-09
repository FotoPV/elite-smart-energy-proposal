// Lightning Energy Professional Slide Generator
// Matches exact design from Paul Stokes SA proposal example

import { BRAND } from '../shared/brand';

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
    hotWater?: { type: string; age?: number; annualCost?: number };
    heating?: { type: string; age?: number; annualCost?: number };
    cooktop?: { type: string; annualCost?: number };
    poolHeater?: { type: string; annualCost?: number };
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
  hasPoolPump: boolean;
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

// Generate all slides based on proposal data - Matches Frieda Lay SA reference exactly
// Slide order: Cover → Exec Summary → Bill Analysis → Usage Analysis → Yearly Projection
// → [Gas slides if applicable] → Strategic Site Assessment → Option 1 → Option 2
// → System Comparison → VPP Comparison → VPP Recommendation
// → [Electrification slides if applicable] → [EV slides if applicable] → [Pool if applicable]
// → Annual Financial Impact → Investment Analysis → Environmental Impact
// → Recommended Roadmap → Conclusion → Next Steps
export function generateSlides(data: ProposalData): SlideContent[] {
  const slides: SlideContent[] = [];
  let slideId = 1;
  
  // Slide 1: Cover Page
  slides.push({
    id: slideId++,
    type: 'cover',
    title: data.customerName,
    subtitle: 'Comprehensive Energy Optimization Report',
    content: {
      address: data.address,
      state: data.state,
      preparedBy: BRAND.contact.name,
      company: BRAND.contact.company,
      logoUrl: BRAND.logo.aqua,
      date: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }),
    }
  });
  
  // Slide 2: Executive Summary (4 narrative cards: Current Position, Opportunity, Solution, Impact)
  slides.push({
    id: slideId++,
    type: 'executive_summary',
    title: 'EXECUTIVE SUMMARY',
    subtitle: 'Overview',
    content: {
      currentAnnualCost: data.annualCost,
      projectedAnnualCost: data.annualCost - data.annualSavings,
      totalAnnualSavings: data.annualSavings,
      paybackYears: data.paybackYears,
      systemSize: data.solarSizeKw,
      batterySize: data.batterySizeKwh,
      vppProvider: data.vppProvider,
      co2Reduction: data.co2ReductionTonnes,
    }
  });
  
  // Slide 3: Current Bill Analysis (hero numbers left, bill table right)
  slides.push({
    id: slideId++,
    type: 'bill_analysis',
    title: 'CURRENT BILL ANALYSIS',
    subtitle: `${data.retailer} ${data.retailer ? 'Plan' : 'Detailed Breakdown'}`,
    content: {
      retailer: data.retailer,
      annualCost: data.annualCost,
      usageCost: data.annualUsageKwh * (data.usageRateCentsPerKwh / 100),
      supplyCost: data.supplyChargeCentsPerDay * 365 / 100,
      usageRate: data.usageRateCentsPerKwh,
      supplyCharge: data.supplyChargeCentsPerDay,
      feedInTariff: data.feedInTariffCentsPerKwh,
      controlledLoadRate: data.controlledLoadRateCentsPerKwh,
      dailyAverageKwh: data.dailyUsageKwh,
      dailyAverageCost: data.dailyAverageCost || (data.annualCost / 365),
      dailySolarExport: data.billSolarExportsKwh ? (data.billSolarExportsKwh / (data.billDays || 365)) : 0,
      monthlyData: data.monthlyUsageData || [],
    }
  });
  
  // Slide 4: Detailed Usage Analysis (3 stat cards left, bar chart right)
  slides.push({
    id: slideId++,
    type: 'usage_analysis',
    title: 'DETAILED USAGE ANALYSIS',
    subtitle: data.monthlyUsageData && data.monthlyUsageData.length > 0 
      ? `${data.monthlyUsageData.length}-Month Data Profile` 
      : 'Energy Consumption Pattern',
    content: {
      annualUsageKwh: data.annualUsageKwh,
      dailyAverageKwh: data.dailyUsageKwh,
      monthlyAverageKwh: data.annualUsageKwh / 12,
      peakMonth: findPeakMonth(data.monthlyUsageData),
      monthlyData: data.monthlyUsageData || [],
      usageRate: data.usageRateCentsPerKwh,
      feedInTariff: data.feedInTariffCentsPerKwh,
      peakUsagePercent: data.billPeakUsageKwh && data.billTotalUsageKwh 
        ? Math.round((data.billPeakUsageKwh / data.billTotalUsageKwh) * 100) : null,
    }
  });
  
  // Slide 5: Yearly Cost Projection (current path vs with battery, transformation visual)
  slides.push({
    id: slideId++,
    type: 'yearly_projection',
    title: 'YEARLY COST PROJECTION',
    subtitle: 'The cost of inaction vs. the value of action',
    content: {
      currentAnnualCost: data.annualCost,
      projectedAnnualCost: data.annualCost - data.annualSavings,
      tenYearSavings: data.tenYearSavings,
      twentyFiveYearSavings: data.twentyFiveYearSavings || data.annualSavings * 25,
      inflationRate: 3.5,
      batterySize: data.batterySizeKwh,
      yearlyProjection: generateYearlyProjection(data.annualCost, data.annualSavings, 25),
    }
  });
  
  // Slide 6: Current Gas Footprint (CONDITIONAL)
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
  
  // Slide 7: Gas Appliance Inventory (CONDITIONAL)
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
  
  // Slide: Strategic Site Assessment (infrastructure audit left, site photos right)
  slides.push({
    id: slideId++,
    type: 'strategic_site_assessment',
    title: 'STRATEGIC SITE ASSESSMENT',
    subtitle: 'Infrastructure Audit & Compatibility Check',
    content: {
      existingInverter: data.inverterBrand || 'To be assessed',
      electricalSupply: 'Single Phase',
      metering: 'Smart Meter',
      sitePhotos: data.sitePhotos || [],
    }
  });
  
  // Slide: Option 1 — Sigenergy SigenStor (narrative left, financial card right)
  slides.push({
    id: slideId++,
    type: 'option_1',
    title: 'OPTION 1: SIGENERGY SIGENSTOR',
    subtitle: "The World's First 5-in-1 Energy System",
    content: {
      batteryKwh: data.batterySizeKwh,
      inverterKw: data.inverterSizeKw || 5,
      systemCost: data.systemCost,
      rebateAmount: data.rebateAmount,
      netInvestment: data.netInvestment,
      annualSavings: data.annualSavings,
      paybackYears: data.paybackYears,
      features: [
        `${data.batterySizeKwh} kWh Capacity`,
        `${data.inverterSizeKw || 5}kW AC Output + EV Charger Ready`,
        '0ms Switchover — Seamless Backup',
        'AI-Driven Tariff Arbitrage',
      ],
    }
  });
  
  // Slide: Option 2 — GoodWe ESA Series (same layout, orange accents)
  const option2Cost = Math.round(data.systemCost * 0.87);
  const option2Rebate = Math.round(data.rebateAmount * 0.87);
  const option2Net = option2Cost - option2Rebate;
  const option2Savings = Math.round(data.annualSavings * 0.94);
  const option2Payback = parseFloat((option2Net / option2Savings).toFixed(1));
  slides.push({
    id: slideId++,
    type: 'option_2',
    title: 'OPTION 2: GOODWE ESA SERIES',
    subtitle: 'Proven Performance at Exceptional Value',
    content: {
      batteryKwh: data.batterySizeKwh,
      inverterKw: data.inverterSizeKw || 5,
      systemCost: option2Cost,
      rebateAmount: option2Rebate,
      netInvestment: option2Net,
      annualSavings: option2Savings,
      paybackYears: option2Payback,
      features: [
        `${data.batterySizeKwh} kWh Usable Capacity`,
        `${data.inverterSizeKw || 5}kW Hybrid Inverter`,
        '10ms Transfer Switch — Near-Instant Backup',
        'Proven Reliability — 500,000+ Units Deployed',
      ],
    }
  });
  
  // Slide: System Comparison (full-width comparison table)
  slides.push({
    id: slideId++,
    type: 'system_comparison',
    title: 'SYSTEM COMPARISON',
    subtitle: 'Selecting the right fit for your home',
    content: {
      option1: {
        name: 'Sigenergy SigenStor',
        netInvestment: data.netInvestment,
        annualSavings: data.annualSavings,
        paybackYears: data.paybackYears,
        backup: '0ms — Full Home Backup',
        evCharger: 'Integrated — Ready to Use',
        intelligence: 'AI-Driven Tariff Arbitrage',
        warranty: '15-Year Battery + 10-Year Inverter',
      },
      option2: {
        name: 'GoodWe ESA Series',
        netInvestment: option2Net,
        annualSavings: option2Savings,
        paybackYears: option2Payback,
        backup: '10ms — Essential Circuits',
        evCharger: 'Compatible — Separate Unit Required',
        intelligence: 'Smart Mode Scheduling',
        warranty: '10-Year Battery + 10-Year Inverter',
      },
    }
  });
  
  // Slide: VPP Provider Comparison (full 13-provider table)
  slides.push({
    id: slideId++,
    type: 'vpp_comparison',
    title: 'VPP PROVIDER COMPARISON',
    subtitle: `Virtual Power Plant Options for ${data.state}`,
    content: {
      providers: getVPPProviders(data.state, data.hasGasBundle),
      recommendedProvider: data.vppProvider,
      state: data.state,
      hasGas: data.hasGas,
    }
  });
  
  // Slide: VPP Recommendation (narrative left, income breakdown right)
  slides.push({
    id: slideId++,
    type: 'vpp_recommendation',
    title: 'VPP RECOMMENDATION',
    subtitle: `${data.vppProvider} ${data.vppProgram}`,
    content: {
      provider: data.vppProvider,
      program: data.vppProgram,
      annualValue: data.vppAnnualValue,
      vppDailyCreditAnnual: data.vppDailyCreditAnnual || Math.round(data.vppAnnualValue * 0.4),
      vppEventPaymentsAnnual: data.vppEventPaymentsAnnual || Math.round(data.vppAnnualValue * 0.5),
      vppBundleDiscount: data.vppBundleDiscount || Math.round(data.vppAnnualValue * 0.1),
      hasGas: data.hasGas,
      features: [
        { icon: '\u26A1', title: 'DAILY CREDITS', description: `Earn ~$${Math.round((data.vppDailyCreditAnnual || Math.round(data.vppAnnualValue * 0.4)))}/year in daily VPP credits for battery availability.` },
        { icon: '\uD83D\uDCB0', title: 'EVENT PAYMENTS', description: `Receive ~$${Math.round((data.vppEventPaymentsAnnual || Math.round(data.vppAnnualValue * 0.5)))}/year from grid stabilisation events during peak demand.` },
        { icon: '\uD83D\uDD17', title: 'BUNDLE SAVINGS', description: `Save ~$${Math.round((data.vppBundleDiscount || Math.round(data.vppAnnualValue * 0.1)))}/year through energy bundle discounts.` },
      ],
    }
  });
  
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
  
  // CONDITIONAL: EV Analysis
  if (data.hasEV) {
    slides.push({
      id: slideId++,
      type: 'ev_analysis',
      title: 'EV ANALYSIS',
      subtitle: `${(data.evAnnualKm || 15000).toLocaleString()} km Annual Usage Scenario`,
      content: {
        annualKm: data.evAnnualKm || 15000,
        annualSavings: data.evAnnualSavings || 2000,
        co2Avoided: ((data.evAnnualKm || 15000) / 100) * 0.23,
        comparison: [
          { scenario: 'Petrol SUV (10L/100km)', costPer100km: 20.00, annualCost: Math.round((data.evAnnualKm || 15000) / 100 * 20) },
          { scenario: 'EV (Grid Charge)', costPer100km: 4.50, annualCost: Math.round((data.evAnnualKm || 15000) / 100 * 4.5) },
          { scenario: 'EV (Solar Charge)', costPer100km: 0.00, annualCost: 0 },
        ],
      }
    });
  }
  
  // CONDITIONAL: EV Charger
  if (data.hasEV) {
    slides.push({
      id: slideId++,
      type: 'ev_charger',
      title: 'EV CHARGER RECOMMENDATION',
      subtitle: 'Smart Charging Solution',
      content: {
        recommendedCharger: data.evChargerBrand || 'Sigenergy EV Charger',
        chargingSpeed: '7.4kW / 32A Single Phase',
        installCost: data.evChargerCost || 2500,
        features: ['Solar-aware charging mode', 'Scheduled charging for off-peak', 'App control & monitoring', 'Load management integration'],
        solarChargingBenefits: ['Charge from excess solar for $0/km', 'Battery-to-EV overnight transfer', 'Smart scheduling around VPP events'],
      }
    });
  }
  
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
  
  // Slide: Annual Financial Impact (before/after cards top, savings breakdown bottom)
  const solarBatterySavings = Math.round(data.annualSavings - data.vppAnnualValue - (data.evAnnualSavings || 0));
  slides.push({
    id: slideId++,
    type: 'annual_financial_impact',
    title: 'ANNUAL FINANCIAL IMPACT',
    subtitle: `Projected outcomes with ${data.batterySizeKwh}kWh Battery + VPP`,
    content: {
      currentAnnualCost: data.annualCost,
      projectedAnnualCost: data.annualCost - data.annualSavings,
      totalTurnaround: data.annualSavings,
      savingsBreakdown: [
        { source: 'Peak Usage Avoided', value: Math.round(solarBatterySavings * 0.7), percent: '95%' },
        { source: 'Off-Peak Usage Avoided', value: Math.round(solarBatterySavings * 0.15) },
        { source: 'VPP Income', value: data.vppAnnualValue },
        data.hasEV ? { source: 'EV Fuel Savings', value: data.evAnnualSavings || 0 } : null,
        data.hasGas ? { source: 'Gas Elimination', value: data.gasAnnualCost || 0 } : null,
        { source: 'Less: Lost Feed-in Credits', value: -Math.round(data.feedInTariffCentsPerKwh * data.annualUsageKwh * 0.3 / 100) },
      ].filter(Boolean) as Array<{ source: string; value: number; percent?: string }>,
      batterySize: data.batterySizeKwh,
    }
  });
  
  // Slide: Investment Analysis (comparison table left, cashflow chart right)
  slides.push({
    id: slideId++,
    type: 'investment_analysis',
    title: 'INVESTMENT ANALYSIS',
    subtitle: 'Comparing ROI & Long-term Value',
    content: {
      option1: {
        name: 'Sigenergy',
        systemCost: data.systemCost,
        rebate: data.rebateAmount,
        netInvestment: data.netInvestment,
        annualBenefit: data.annualSavings,
        paybackYears: data.paybackYears,
        tenYearBenefit: data.tenYearSavings,
      },
      option2: {
        name: 'GoodWe',
        systemCost: option2Cost,
        rebate: option2Rebate,
        netInvestment: option2Net,
        annualBenefit: option2Savings,
        paybackYears: option2Payback,
        tenYearBenefit: Math.round(option2Savings * 10 - option2Net),
      },
    }
  });
  
  // Slide: Environmental Impact (3 metric cards, energy independence score)
  slides.push({
    id: slideId++,
    type: 'environmental_impact',
    title: 'ENVIRONMENTAL IMPACT',
    subtitle: 'Your contribution to a cleaner grid',
    content: {
      co2ReductionTonnes: data.co2ReductionTonnes,
      treesEquivalent: data.treesEquivalent || Math.round(data.co2ReductionTonnes * 45),
      carsOffRoad: Math.round(data.co2ReductionTonnes / 4.6),
      energyIndependenceScore: data.energyIndependenceScore || 85,
      twentyFiveYearCO2: data.co2ReductionTonnes * 25,
      benefits: [
        { icon: '🌿', title: 'CARBON REDUCTION', description: `${data.co2ReductionTonnes.toFixed(1)} tonnes CO2 avoided annually` },
        { icon: '🌳', title: 'TREE EQUIVALENT', description: `Equivalent to planting ${data.treesEquivalent || Math.round(data.co2ReductionTonnes * 45)} trees per year` },
        { icon: '⚡', title: 'ENERGY INDEPENDENCE', description: `${data.energyIndependenceScore || 85}% energy self-sufficiency achieved` },
      ],
    }
  });
  
  // Slide: Recommended Roadmap (4-column timeline)
  slides.push({
    id: slideId++,
    type: 'roadmap',
    title: 'RECOMMENDED ROADMAP',
    subtitle: 'Implementation & Future Expansion',
    content: {
      steps: [
        { number: '01', title: 'INSTALLATION', description: 'Battery system delivery and installation by certified team.', timeline: 'DAY 1-2', color: 'aqua', bullets: ['Site preparation', 'Battery mounting', 'Electrical connection'] },
        { number: '02', title: 'COMMISSIONING', description: 'System testing, grid connection, and monitoring setup.', timeline: 'DAY 3-7', color: 'aqua', bullets: ['Grid compliance testing', 'Monitoring app setup', 'Performance verification'] },
        { number: '03', title: 'VPP INTEGRATION', description: `Switch to ${data.vppProvider} and configure VPP participation.`, timeline: 'WEEK 2-4', color: 'aqua', bullets: ['Retailer switch', 'VPP enrollment', 'Battery scheduling'] },
        { number: '04', title: 'FUTURE EXPANSION', description: 'EV charger, additional panels, or electrification upgrades.', timeline: 'YEAR 1+', color: 'orange', bullets: ['EV charger install', 'Panel expansion', 'Gas elimination'] },
      ],
    }
  });
  
  // Slide: Conclusion / Executive Summary (3 cards: Financial, Strategic, Urgency + CTA)
  slides.push({
    id: slideId++,
    type: 'conclusion',
    title: 'EXECUTIVE SUMMARY',
    subtitle: 'Final Recommendation',
    content: {
      currentAnnualCost: data.annualCost,
      projectedAnnualCost: data.annualCost - data.annualSavings,
      annualSavings: data.annualSavings,
      batterySizeKwh: data.batterySizeKwh,
      paybackYears: data.paybackYears,
      features: [
        { icon: '\uD83D\uDCB0', title: 'FINANCIAL TRANSFORMATION', description: `From $${data.annualCost.toLocaleString()}/yr to $${Math.round(data.annualCost - data.annualSavings).toLocaleString()}/yr \u2014 saving $${data.annualSavings.toLocaleString()} annually.`, border: 'aqua' },
        { icon: '\u2699\uFE0F', title: 'SYSTEM STRATEGY', description: `${data.solarSizeKw}kW solar + ${data.batterySizeKwh}kWh battery delivering energy independence and VPP income.`, border: 'white' },
        { icon: '\u23F0', title: 'ACT NOW', description: `Federal rebates reduce your investment significantly. Lock in current pricing before incentives change.`, border: 'orange' },
      ],
      quote: `Your ${data.paybackYears}-year payback transforms a $${data.annualCost.toLocaleString()}/yr liability into a $${data.annualSavings.toLocaleString()}/yr asset.`,
      callToAction: 'Contact George Fotopoulos to secure your energy future today.',
    }
  });
  
  // Slide: Next Steps (4 numbered steps left, contact card right)
  slides.push({
    id: slideId++,
    type: 'contact',
    title: 'NEXT STEPS',
    subtitle: 'Ready to Electrify!',
    content: {
      preparedBy: BRAND.contact.name,
      title: BRAND.contact.title,
      company: BRAND.contact.company,
      address: BRAND.contact.address,
      phone: BRAND.contact.phone,
      email: BRAND.contact.email,
      website: BRAND.contact.website,
      copyright: BRAND.contact.copyright,
      logoUrl: BRAND.logo.aqua,
      nextSteps: [
        { number: '01', title: 'SELECT YOUR SYSTEM', description: 'Choose between Sigenergy SigenStor or GoodWe ESA based on your priorities.' },
        { number: '02', title: 'APPROVE PROPOSAL', description: 'Sign the proposal to lock in current Federal Rebate pricing.' },
        { number: '03', title: 'SCHEDULE INSTALLATION', description: 'Book your preferred installation date with our certified team.' },
        { number: '04', title: 'CONNECT & SAVE', description: 'Start generating clean energy and earning VPP income from day one.' },
      ],
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

const SLIDE_STYLES = `
<style>
  @font-face { font-family: 'NextSphere'; src: url('${BRAND.fontUrls.nextSphere}') format('truetype'); font-weight: 800; }
  @font-face { font-family: 'GeneralSans'; src: url('${BRAND.fontUrls.generalSans}') format('opentype'); font-weight: 400; }
  @font-face { font-family: 'Urbanist'; src: url('${BRAND.fontUrls.urbanist}') format('truetype'); font-weight: 600; }
  @font-face { font-family: 'UrbanistItalic'; src: url('${BRAND.fontUrls.urbanistItalic}') format('truetype'); font-weight: 600; font-style: italic; }
  
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
  let content = '';
  switch (slide.type) {
    case 'cover': content = genCover(slide); break;
    case 'executive_summary': content = genExecutiveSummary(slide); break;
    case 'bill_analysis': content = genBillAnalysis(slide); break;
    case 'usage_analysis': content = genUsageAnalysis(slide); break;
    case 'yearly_projection': content = genYearlyProjection(slide); break;
    case 'gas_footprint': content = genGasFootprint(slide); break;
    case 'gas_appliances': content = genGasAppliances(slide); break;
    case 'strategic_assessment': content = genStrategic(slide); break;
    case 'strategic_site_assessment': content = genStrategicSiteAssessment(slide); break;
    case 'option_1': content = genOption1(slide); break;
    case 'option_2': content = genOption2(slide); break;
    case 'system_comparison': content = genSystemComparison(slide); break;
    case 'battery_recommendation': content = genBattery(slide); break;
    case 'solar_system': content = genSolar(slide); break;
    case 'vpp_comparison': content = genVPPComparison(slide); break;
    case 'vpp_recommendation': content = genVPPRecommendation(slide); break;
    case 'hot_water_electrification': content = genHotWater(slide); break;
    case 'heating_cooling': content = genHeatingCooling(slide); break;
    case 'induction_cooking': content = genInduction(slide); break;
    case 'ev_analysis': content = genEVAnalysis(slide); break;
    case 'ev_charger': content = genEVCharger(slide); break;
    case 'pool_heat_pump': content = genPoolHeatPump(slide); break;
    case 'electrification_investment': content = genElectrificationInvestment(slide); break;
    case 'savings_summary': content = genSavingsSummary(slide); break;
    case 'annual_financial_impact': content = genAnnualFinancialImpact(slide); break;
    case 'investment_analysis': content = genInvestmentAnalysis(slide); break;
    case 'financial_summary': content = genFinancial(slide); break;
    case 'environmental_impact': content = genEnvironmental(slide); break;
    case 'roadmap': content = genRoadmap(slide); break;
    case 'conclusion': content = genConclusion(slide); break;
    case 'contact': content = genContact(slide); break;
    case 'tariff_comparison': content = genTariffComparison(slide); break;
    case 'daily_load_profile': content = genDailyLoadProfile(slide); break;
    case 'solar_generation_profile': content = genSolarGenerationProfile(slide); break;
    case 'battery_cycle': content = genBatteryCycle(slide); break;
    case 'grid_independence': content = genGridIndependence(slide); break;
    case 'rebate_breakdown': content = genRebateBreakdown(slide); break;
    case 'financial_projection_25yr': content = genFinancialProjection25yr(slide); break;
    case 'system_specifications': content = genSystemSpecifications(slide); break;
    case 'warranty_maintenance': content = genWarrantyMaintenance(slide); break;
    default: content = genGeneric(slide);
  }
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${SLIDE_STYLES}</head><body>${content}</body></html>`;
}

// ---- SLIDE 1: COVER ----
function genCover(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  return `
    <div class="slide" style="display: flex; flex-direction: column; justify-content: center; padding: 80px; background: #000000 url('${BRAND.coverBg}') no-repeat right center; background-size: contain;">
      <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 60px;">
        <img src="${BRAND.logo.aqua}" style="width: 50px; height: 50px;" alt="LE" />
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
      <img src="${BRAND.logo.aqua}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 0; margin-top: 20px;">
        <div style="flex: 1; text-align: center; border-right: 1px solid #333; padding: 20px;">
          <p class="lbl">CURRENT ANNUAL BILL</p>
          <p class="hero-num white" style="font-size: 56px;">$${(c.currentAnnualCost as number).toLocaleString()}</p>
          <p class="gray" style="font-size: 13px; margin-top: 8px;">With existing setup</p>
        </div>
        <div style="flex: 1; text-align: center; border-right: 1px solid #333; padding: 20px;">
          <p class="lbl">PROJECTED ANNUAL BILL</p>
          <p class="hero-num white" style="font-size: 56px;">$${Math.round(c.projectedAnnualCost as number).toLocaleString()}</p>
          <p class="gray" style="font-size: 13px; margin-top: 8px;">With new system</p>
        </div>
        <div style="flex: 1; text-align: center; border-right: 1px solid #333; padding: 20px;">
          <p class="lbl">TOTAL ANNUAL SAVINGS</p>
          <p class="hero-num aqua" style="font-size: 56px;">$${(c.totalAnnualSavings as number).toLocaleString()}</p>
          <p class="gray" style="font-size: 13px; margin-top: 8px;">Incl. VPP + EV</p>
        </div>
        <div style="flex: 1; text-align: center; padding: 20px;">
          <p class="lbl">SYSTEM PAYBACK</p>
          <p class="hero-num orange" style="font-size: 56px;">${(c.paybackYears as number).toFixed(1)}</p>
          <p class="gray" style="font-size: 13px; margin-top: 8px;">Years</p>
        </div>
      </div>
      ${c.narrativeOverview ? `
      <div style="margin-top: 24px; padding: 0 20px;">
        <div style="font-size: 14px; line-height: 1.8; color: #FFFFFF;">${c.narrativeOverview}</div>
      </div>
      <div style="display: flex; gap: 20px; margin-top: 20px; padding: 0 20px;">
        ${c.narrativeFinancial ? `<div class="card" style="flex: 1; padding: 16px;"><p class="lbl" style="color: #00EAD3; margin-bottom: 8px;">FINANCIAL OUTLOOK</p><p style="font-size: 13px; line-height: 1.7; color: #ccc;">${c.narrativeFinancial}</p></div>` : ''}
        ${c.narrativeSystem ? `<div class="card" style="flex: 1; padding: 16px;"><p class="lbl" style="color: #00EAD3; margin-bottom: 8px;">SYSTEM STRATEGY</p><p style="font-size: 13px; line-height: 1.7; color: #ccc;">${c.narrativeSystem}</p></div>` : ''}
        ${c.narrativeUrgency ? `<div class="card" style="flex: 1; padding: 16px;"><p class="lbl" style="color: #00EAD3; margin-bottom: 8px;">TIME SENSITIVITY</p><p style="font-size: 13px; line-height: 1.7; color: #ccc;">${c.narrativeUrgency}</p></div>` : ''}
      </div>
      ` : `
      <div class="insight-card" style="margin-top: 40px;">
        <p style="color: #FFFFFF; font-size: 15px; line-height: 1.7;">This comprehensive analysis evaluates your current energy expenditure and presents a tailored solar + battery solution designed to deliver <span class="hl-aqua">$${(c.totalAnnualSavings as number).toLocaleString()} in annual savings</span>. The proposed ${c.systemSize}kW solar system paired with a ${c.batterySize}kWh battery and ${c.vppProvider} VPP partnership achieves payback in <span class="hl-orange">${(c.paybackYears as number).toFixed(1)} years</span>.</p>
      </div>
      `}
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- SLIDE 3: BILL ANALYSIS ----
function genBillAnalysis(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="LE" />
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
      <img src="${BRAND.logo.aqua}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1.2;">
          <p class="lbl" style="margin-bottom: 16px;">DAILY ENERGY USAGE COMPARISON (kWh)</p>
          <div style="display: flex; align-items: flex-end; height: 320px; gap: 30px; padding: 0 20px;">
            ${benchmarks.map(b => `
              <div style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end;">
                <p style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: ${b.color === '#00EAD3' ? '#00EAD3' : '#FFFFFF'};">${b.kwh.toFixed(1)}</p>
                <div style="width: 100%; height: ${(b.kwh / maxKwh) * 260}px; background: ${b.color}; border-radius: 4px 4px 0 0;"></div>
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
      <img src="${BRAND.logo.aqua}" class="logo" alt="LE" />
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
      <img src="${BRAND.logo.aqua}" class="logo" alt="LE" />
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
      <img src="${BRAND.logo.aqua}" class="logo" alt="LE" />
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
      <img src="${BRAND.logo.aqua}" class="logo" alt="LE" />
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
      <img src="${BRAND.logo.aqua}" class="logo" alt="LE" />
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
      <img src="${BRAND.logo.aqua}" class="logo" alt="LE" />
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
  const c = slide.content as Record<string, unknown>;
  const providers = c.providers as Array<{ provider: string; program: string; gasBundle: boolean; annualValue: string; strategicFit: string }>;
  const rec = c.recommendedProvider as string;
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="LE" />
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
  const c = slide.content as Record<string, unknown>;
  const features = c.features as Array<{ icon: string; title: string; description: string }>;
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="text-align: center; margin-top: 20px;">
        <p class="lbl">SELECTED PARTNER</p>
        <p style="font-family: 'NextSphere', sans-serif; font-size: 72px; font-weight: 800; margin: 10px 0;">${c.provider}</p>
        <p style="color: #00EAD3; font-size: 22px; font-family: 'Urbanist', sans-serif;">${c.program}</p>
      </div>
      <div style="display: flex; gap: 24px; margin-top: 36px;">
        ${features.map(f => `
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
      <img src="${BRAND.logo.aqua}" class="logo" alt="LE" />
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
  const comparison = (c.comparison as Array<{ scenario: string; costPer100km: number; annualCost: number }>) || [];
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1;">
          <table>
            <tr><th>VEHICLE TYPE</th><th style="text-align: right;">COST / 100KM</th><th style="text-align: right;">ANNUAL COST</th></tr>
            ${comparison.map((comp, i) => `
              <tr class="${i === 2 ? 'highlight-row' : ''}">
                <td>${comp.scenario}</td>
                <td style="text-align: right; color: ${i === 0 ? '#f36710' : i === 1 ? '#FFFFFF' : '#00EAD3'}; font-weight: 600;">$${comp.costPer100km.toFixed(2)}</td>
                <td style="text-align: right; color: ${i === 0 ? '#f36710' : i === 1 ? '#FFFFFF' : '#00EAD3'}; font-weight: 600;">$${comp.annualCost.toLocaleString()}</td>
              </tr>
            `).join('')}
          </table>
        </div>
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 30px;">
            <div style="width: 4px; height: 60px; background: #00EAD3; border-radius: 2px;"></div>
            <div>
              <p class="lbl" style="color: #00EAD3;">POTENTIAL ANNUAL SAVINGS</p>
              <p class="hero-num white" style="font-size: 64px;">$${(c.annualSavings as number).toLocaleString()}</p>
            </div>
          </div>
          <div class="insight-card">
            <p style="color: #808285; font-size: 14px; line-height: 1.6;">Solar-charged EV driving eliminates fuel costs entirely. With your proposed solar system, every kilometre driven is effectively <span class="hl-aqua">free</span>.</p>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; margin-top: 20px;">
            <span style="color: #22c55e;">🌿</span>
            <p class="gray" style="font-size: 13px;">Environmental Impact: Avoid <span class="hl-aqua">${(c.co2Avoided as number).toFixed(1)} tonnes</span> of CO2 emissions annually.</p>
          </div>
        </div>
      </div>
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
      <img src="${BRAND.logo.aqua}" class="logo" alt="LE" />
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
      <img src="${BRAND.logo.aqua}" class="logo" alt="LE" />
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
      <img src="${BRAND.logo.aqua}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1;">
          <div style="height: 380px; display: flex; align-items: flex-end; justify-content: center;">
            <div style="width: 200px; display: flex; flex-direction: column;">
              ${breakdown.map(b => {
                const col = b.color === 'aqua' ? '#00EAD3' : b.color === 'orange' ? '#f36710' : '#FFFFFF';
                return `<div style="height: ${(b.value / total) * 300}px; background: ${col}; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #000; font-weight: 600;">${b.category}</div>`;
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
      <img src="${BRAND.logo.aqua}" class="logo" alt="LE" />
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
      <img src="${BRAND.logo.aqua}" class="logo" alt="LE" />
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
      <img src="${BRAND.logo.aqua}" class="logo" alt="LE" />
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

// ---- SLIDE 24: CONCLUSION ----
function genConclusion(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const features = c.features as Array<{ icon: string; title: string; description: string; border: string }>;
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 24px; margin-top: 10px;">
        ${features.map(f => {
          const borderCol = f.border === 'aqua' ? '#00EAD3' : f.border === 'orange' ? '#f36710' : '#FFFFFF';
          const iconCol = f.border === 'aqua' ? '#00EAD3' : f.border === 'orange' ? '#f36710' : '#FFFFFF';
          return `
            <div class="card" style="flex: 1; text-align: center; border-top: 3px solid ${borderCol}; padding: 30px;">
              <p style="color: ${iconCol}; font-size: 36px; margin-bottom: 14px;">${f.icon}</p>
              <p style="font-family: 'NextSphere', sans-serif; font-size: 16px; font-weight: 800; color: ${f.border === 'orange' ? '#f36710' : '#FFFFFF'}; margin-bottom: 12px;">${f.title}</p>
              <p style="color: #808285; font-size: 13px; line-height: 1.6;">${f.description}</p>
            </div>
          `;
        }).join('')}
      </div>
      ${c.narrativeFinancial || c.narrativeStrategic || c.narrativeUrgency ? `
      <div style="display: flex; gap: 20px; margin-top: 24px;">
        ${c.narrativeFinancial ? `<div class="card" style="flex: 1; padding: 20px; border-top: 3px solid #00EAD3;"><p class="lbl" style="color: #00EAD3; margin-bottom: 8px;">FINANCIAL TRANSFORMATION</p><p style="font-size: 13px; line-height: 1.7; color: #ccc;">${c.narrativeFinancial}</p></div>` : ''}
        ${c.narrativeStrategic ? `<div class="card" style="flex: 1; padding: 20px; border-top: 3px solid #FFFFFF;"><p class="lbl" style="margin-bottom: 8px;">STRATEGIC CHOICE</p><p style="font-size: 13px; line-height: 1.7; color: #ccc;">${c.narrativeStrategic}</p></div>` : ''}
        ${c.narrativeUrgency ? `<div class="card" style="flex: 1; padding: 20px; border-top: 3px solid #f36710;"><p class="lbl" style="color: #f36710; margin-bottom: 8px;">ACT NOW</p><p style="font-size: 13px; line-height: 1.7; color: #ccc;">${c.narrativeUrgency}</p></div>` : ''}
      </div>
      ` : ''}
      <div style="text-align: center; margin-top: ${c.narrativeFinancial ? '20' : '40'}px;">
        <p style="font-family: 'NextSphere', sans-serif; font-size: 28px; font-weight: 800; line-height: 1.4; max-width: 1200px; margin: 0 auto;">${c.quote}</p>
        <div style="width: 200px; height: 2px; background: #00EAD3; margin: 24px auto;"></div>
        <p style="color: #00EAD3; font-size: 18px; font-family: 'Urbanist', sans-serif;">${c.callToAction}</p>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

// ---- SLIDE 25: CONTACT ----
function genContact(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const nextSteps = (c.nextSteps as Array<{ number?: string; title?: string; description?: string } | string>) || [];
  return `
    <div class="slide" style="display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
      <img src="${BRAND.logo.aqua}" style="width: 100px; height: 100px; margin-bottom: 30px;" alt="LE" />
      <h1 class="slide-title" style="font-size: 64px; margin-bottom: 16px;">${slide.title}</h1>
      <p class="slide-subtitle" style="font-size: 24px; margin-bottom: 40px; text-align: center;">${slide.subtitle}</p>
      <div style="display: flex; gap: 60px; margin-bottom: 36px;">
        <div style="text-align: left;">
          <p class="lbl" style="margin-bottom: 8px;">PREPARED BY</p>
          <p style="font-size: 22px; font-weight: 600;">${c.preparedBy}</p>
          <p style="color: #00EAD3; font-family: 'Urbanist', sans-serif;">${c.title}</p>
          <p class="gray" style="margin-top: 8px;">${c.company}</p>
        </div>
        <div style="text-align: left;">
          <p class="lbl" style="margin-bottom: 8px;">CONTACT</p>
          <p class="gray">📞 ${c.phone}</p>
          <p class="gray">✉️ ${c.email}</p>
          <p style="color: #00EAD3;">🌐 ${c.website}</p>
        </div>
        <div style="text-align: left;">
          <p class="lbl" style="margin-bottom: 8px;">LOCATION</p>
          <p class="gray">${c.address}</p>
        </div>
      </div>
      <div class="card aqua-b" style="max-width: 800px; text-align: left; padding: 28px;">
        <p class="lbl" style="color: #00EAD3; margin-bottom: 14px;">YOUR NEXT STEPS</p>
        ${nextSteps.map((step, i) => {
          if (typeof step === 'string') {
            return `<p style="font-size: 15px; margin-bottom: 10px;"><span style="color: #f36710; font-weight: 700;">${i + 1}.</span> ${step}</p>`;
          }
          const s = step as { number?: string; title?: string; description?: string };
          return `<p style="font-size: 15px; margin-bottom: 10px;"><span style="color: #f36710; font-weight: 700;">${s.number || (i + 1)}.</span> <strong>${s.title || ''}</strong> — ${s.description || ''}</p>`;
        }).join('')}
      </div>
      <div class="copyright">${c.copyright}</div>
    </div>
  `;
}

// ---- STRATEGIC SITE ASSESSMENT ----
function genStrategicSiteAssessment(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const photos = (c.sitePhotos as Array<{ url: string; caption: string }>) || [];
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="LE" />
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
      <img src="${BRAND.logo.aqua}" class="logo" alt="LE" />
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
      <img src="${BRAND.logo.aqua}" class="logo" alt="LE" />
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
      <img src="${BRAND.logo.aqua}" class="logo" alt="LE" />
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
      <img src="${BRAND.logo.aqua}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; align-items: center; gap: 30px; margin-top: 10px;">
        <div class="card" style="flex: 1; text-align: center; padding: 30px; border-top: 3px solid #f36710;">
          <p class="lbl">Current Projected Bill</p>
          <p class="hero-num white" style="font-size: 56px;">$${currentCost.toLocaleString()}</p>
          <p class="gray">per year</p>
        </div>
        <div style="text-align: center;">
          <img src="${BRAND.logo.aqua}" style="width: 50px; height: 50px;" alt="LE" />
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
      <img src="${BRAND.logo.aqua}" class="logo" alt="LE" />
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
              <polyline points="${o1Points.join(' ')}" fill="none" stroke="#00EAD3" stroke-width="0.5" />
              <polyline points="${o2Points.join(' ')}" fill="none" stroke="#f36710" stroke-width="0.5" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="#333" stroke-width="0.2" stroke-dasharray="2,2" />
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

// ---- GENERIC FALLBACK ----
function genGeneric(slide: SlideContent): string {
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="LE" />
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
      <img src="${BRAND.logo.aqua}" class="logo" alt="LE" />
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
                <div style="width: 100%; height: ${(r.rate / maxRate) * 220}px; background: ${r.color}; border-radius: 4px 4px 0 0;"></div>
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
      <img src="${BRAND.logo.aqua}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || 'Estimated 24-hour energy consumption pattern')}
      <div style="margin-top: 10px;">
        <div style="display: flex; align-items: flex-end; height: 300px; gap: 2px; padding: 0 10px; border-bottom: 1px solid #333;">
          ${hourly.map(h => {
            const isSolar = h.h >= 7 && h.h <= 17;
            const isPeak = h.h >= 15 && h.h <= 21;
            const color = isPeak ? '#FFFFFF' : isSolar ? '#00EAD3' : '#808285';
            return `
              <div style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end;">
                <div style="width: 100%; height: ${(h.kwh / maxKwh) * 260}px; background: ${color}; border-radius: 2px 2px 0 0; min-height: 4px;"></div>
              </div>
            `;
          }).join('')}
        </div>
        <div style="display: flex; gap: 2px; padding: 0 10px;">
          ${hourly.map(h => `<div style="flex: 1; text-align: center; font-size: 9px; color: #808285; padding-top: 4px;">${h.label}</div>`).join('')}
        </div>
      </div>
      <div style="display: flex; gap: 24px; margin-top: 24px;">
        <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 12px; height: 12px; background: #00EAD3; border-radius: 2px;"></div><span style="font-size: 11px; color: #808285;">Solar Generation Hours (7am-5pm)</span></div>
        <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 12px; height: 12px; background: #FFFFFF; border-radius: 2px;"></div><span style="font-size: 11px; color: #808285;">Peak Demand (3pm-9pm)</span></div>
        <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 12px; height: 12px; background: #808285; border-radius: 2px;"></div><span style="font-size: 11px; color: #808285;">Off-Peak / Overnight</span></div>
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
      <img src="${BRAND.logo.aqua}" class="logo" alt="LE" />
      ${slideHeader(slide.title, slide.subtitle || 'Monthly solar generation vs household consumption')}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1.5;">
          <div style="display: flex; align-items: flex-end; height: 300px; gap: 6px; padding: 0 10px; border-bottom: 1px solid #333;">
            ${months.map(m => `
              <div style="flex: 1; display: flex; gap: 2px; align-items: flex-end; height: 100%;">
                <div style="flex: 1; height: ${(m.gen / maxVal) * 260}px; background: #00EAD3; border-radius: 2px 2px 0 0;"></div>
                <div style="flex: 1; height: ${(m.use / maxVal) * 260}px; background: #808285; border-radius: 2px 2px 0 0;"></div>
              </div>
            `).join('')}
          </div>
          <div style="display: flex; gap: 6px; padding: 0 10px;">
            ${months.map(m => `<div style="flex: 1; text-align: center; font-size: 10px; color: #808285; padding-top: 6px;">${m.month}</div>`).join('')}
          </div>
          <div style="display: flex; gap: 24px; margin-top: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 12px; height: 12px; background: #00EAD3; border-radius: 2px;"></div><span style="font-size: 11px; color: #808285;">Solar Generation</span></div>
            <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 12px; height: 12px; background: #808285; border-radius: 2px;"></div><span style="font-size: 11px; color: #808285;">Household Consumption</span></div>
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
      <img src="${BRAND.logo.aqua}" class="logo" alt="LE" />
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
              <path d="M${socCurve.map((soc, i) => `${(i / 23) * 240},${100 - soc}`).join(' L')}" fill="none" stroke="#00EAD3" stroke-width="2"/>
              <path d="M0,100 L${socCurve.map((soc, i) => `${(i / 23) * 240},${100 - soc}`).join(' L')} L240,100 Z" fill="url(#socGrad)"/>
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
      <img src="${BRAND.logo.aqua}" class="logo" alt="LE" />
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
      <img src="${BRAND.logo.aqua}" class="logo" alt="LE" />
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
      <img src="${BRAND.logo.aqua}" class="logo" alt="LE" />
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
      <img src="${BRAND.logo.aqua}" class="logo" alt="LE" />
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
      <img src="${BRAND.logo.aqua}" class="logo" alt="LE" />
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
