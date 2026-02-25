// Professional Slide Generator


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
  
  // Solar Status
  hasSolarNew?: boolean; // Has Solar PV <5yrs
  hasSolarOld?: boolean; // Has Solar PV >5yrs
  
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

// Generate all slides based on proposal data - Full 25-slide structure
export function generateSlides(data: ProposalData): SlideContent[] {
  const slides: SlideContent[] = [];
  let slideId = 1;
  
  // Slide 1: Cover Page
  slides.push({
    id: slideId++,
    type: 'cover',
    title: data.customerName,
    subtitle: 'In-Depth Bill Analysis & Solar Battery Proposal',
    content: {
      address: data.address,
      state: data.state,
      preparedBy: BRAND.contact.name,
      company: BRAND.contact.company,
      logoUrl: BRAND.logo.iconWhite,
      date: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }),
    }
  });
  
  // Slide 2: Executive Summary
  slides.push({
    id: slideId++,
    type: 'executive_summary',
    title: 'EXECUTIVE SUMMARY',
    subtitle: 'Your Energy Transformation at a Glance',
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
  
  // Slide 3: Current Bill Analysis
  slides.push({
    id: slideId++,
    type: 'bill_analysis',
    title: 'CURRENT BILL ANALYSIS',
    subtitle: 'Detailed Breakdown',
    content: {
      retailer: data.retailer,
      annualCost: data.annualCost,
      usageCost: data.annualUsageKwh * (data.usageRateCentsPerKwh / 100),
      supplyCost: data.supplyChargeCentsPerDay * 365 / 100,
      usageRate: data.usageRateCentsPerKwh,
      supplyCharge: data.supplyChargeCentsPerDay,
      feedInTariff: data.feedInTariffCentsPerKwh,
      controlledLoadRate: data.controlledLoadRateCentsPerKwh,
    }
  });
  
  // Slide 4: Monthly Usage Analysis
  slides.push({
    id: slideId++,
    type: 'usage_analysis',
    title: 'MONTHLY USAGE ANALYSIS',
    subtitle: 'Your Energy Consumption Pattern',
    content: {
      annualUsageKwh: data.annualUsageKwh,
      dailyAverageKwh: data.dailyUsageKwh,
      monthlyAverageKwh: data.annualUsageKwh / 12,
      peakMonth: findPeakMonth(data.monthlyUsageData),
      monthlyData: data.monthlyUsageData || [],
      usageRate: data.usageRateCentsPerKwh,
      feedInTariff: data.feedInTariffCentsPerKwh,
    }
  });
  
  // Slide 5: Yearly Cost Projection
  slides.push({
    id: slideId++,
    type: 'yearly_projection',
    title: 'YEARLY COST PROJECTION',
    subtitle: 'Annual Analysis & 25-Year Outlook',
    content: {
      currentAnnualCost: data.annualCost,
      projectedAnnualCost: data.annualCost - data.annualSavings,
      tenYearSavings: data.tenYearSavings,
      twentyFiveYearSavings: data.twentyFiveYearSavings || data.annualSavings * 25,
      inflationRate: 3.5,
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
  
  // Slide 8: Strategic Assessment
  slides.push({
    id: slideId++,
    type: 'strategic_assessment',
    title: 'STRATEGIC ASSESSMENT',
    subtitle: 'Battery Storage Investment',
    content: {
      advantages: [
        { icon: '⚡', title: 'ENERGY INDEPENDENCE', description: 'Reduce grid reliance from 100% to near-zero during outages.' },
        { icon: '💰', title: 'VPP INCOME', description: `Earn $${data.vppAnnualValue}-${data.vppAnnualValue + 150}/year through Virtual Power Plant participation.` },
        { icon: '🚗', title: 'FUTURE-PROOFING', description: 'Ready for EV charging and time-of-use tariffs.' },
        { icon: '📈', title: 'PEAK SHIFTING', description: 'Store cheap solar energy for expensive peak periods (6-9pm).' },
        { icon: '🛡', title: 'BLACKOUT PROTECTION', description: `Partial home backup with ${data.batteryBrand} system.` },
      ],
      considerations: [
        { icon: '💵', title: 'UPFRONT COST', description: `$${data.netInvestment.toLocaleString()} investment (after rebates).` },
        { icon: '⏳', title: 'PAYBACK PERIOD', description: `${data.paybackYears.toFixed(1)} years for battery component alone.` },
        { icon: '🖥', title: 'TECHNOLOGY EVOLUTION', description: 'Battery technology is improving rapidly.' },
        { icon: '📦', title: 'SPACE REQUIREMENTS', description: 'Floor-mounted unit requires dedicated garage space.' },
        { icon: '🔋', title: 'DEGRADATION', description: 'Battery capacity reduces over time (approx. 0.35%/year).' },
      ],
    }
  });
  
  // Slide 9: Recommended Battery Size
  slides.push({
    id: slideId++,
    type: 'battery_recommendation',
    title: 'RECOMMENDED BATTERY SIZE',
    subtitle: `${data.batteryBrand} Configuration`,
    content: {
      totalCapacity: data.batterySizeKwh,
      inverterSize: data.inverterSizeKw,
      inverterType: 'HYBRID',
      modules: calculateBatteryModules(data.batterySizeKwh),
      technology: 'LFP (SAFE)',
      brand: data.batteryBrand,
      whyThisCapacity: {
        home: Math.min(4, data.dailyUsageKwh * 0.3),
        evCharge: data.hasEV ? 10 : 0,
        vppTrade: Math.max(0, data.batterySizeKwh - 4 - (data.hasEV ? 10 : 0)),
      },
      explanation: `This configuration ensures your home runs 100% off-grid overnight, ${data.hasEV ? 'fully charges your EV for daily commuting, and ' : ''}leaves substantial capacity for high-value VPP trading events.`,
    }
  });
  
  // Slide 10: Proposed Solar PV System
  slides.push({
    id: slideId++,
    type: 'solar_system',
    title: 'PROPOSED SOLAR PV SYSTEM',
    subtitle: 'High-Performance Hardware Specification',
    content: {
      systemSize: data.solarSizeKw,
      panelCount: data.panelCount,
      panelPower: data.panelWattage,
      panelBrand: data.panelBrand,
      whyThisBrand: `${data.panelBrand} panels deliver industry-leading efficiency with superior shade performance, maximizing energy harvest from your roof.`,
      features: [
        { icon: '●', title: '25-Year Warranty', description: 'Full product and performance guarantee' },
        { icon: '●', title: 'Full Black Design', description: 'Premium aesthetic integration with your roof' },
        { icon: '●', title: 'Shade Optimization', description: 'Advanced cell technology for partial shade conditions' },
      ],
    }
  });
  
  // Slide 11: VPP Provider Comparison
  slides.push({
    id: slideId++,
    type: 'vpp_comparison',
    title: 'VPP PROVIDER COMPARISON',
    subtitle: `Evaluating Market Leaders${data.hasGasBundle ? ' for Gas & Elec Bundles' : ''}`,
    content: {
      providers: getVPPProviders(data.state, data.hasGasBundle).slice(0, 5),
      recommendedProvider: data.vppProvider,
    }
  });
  
  // Slide 12: VPP Recommendation
  slides.push({
    id: slideId++,
    type: 'vpp_recommendation',
    title: 'VPP RECOMMENDATION',
    subtitle: 'Optimal Provider Selection',
    content: {
      provider: data.vppProvider,
      program: data.vppProgram,
      annualValue: data.vppAnnualValue,
      features: [
        { icon: '≡', title: 'INTEGRATED BUNDLE', description: `Gas & Electricity combined for maximum savings with ${data.vppProvider}.` },
        { icon: '↗', title: 'FINANCIAL CERTAINTY', description: 'Fixed daily credits plus variable event payments provide predictable income.' },
        { icon: '⊕', title: 'STRATEGIC FIT', description: `Optimized for your ${data.batterySizeKwh}kWh battery and ${data.solarSizeKw}kW solar system.` },
      ],
    }
  });
  
  // Slide 13: Hot Water Electrification (CONDITIONAL)
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
  
  // Slide 14: Heating & Cooling (CONDITIONAL)
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
  
  // Slide 15: Induction Cooking (CONDITIONAL)
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
  
  // Slide 16: EV Analysis (CONDITIONAL)
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
  
  // Slide 17: EV Charger Recommendation (CONDITIONAL)
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
  
  // Slide 18: Pool Heat Pump (CONDITIONAL)
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
  
  // Slide 19: Full Electrification Investment (CONDITIONAL)
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
  
  // Slide 20: Total Savings Summary
  slides.push({
    id: slideId++,
    type: 'savings_summary',
    title: 'TOTAL SAVINGS SUMMARY',
    subtitle: 'Combined Annual Financial Benefits',
    content: {
      totalAnnualSavings: data.annualSavings,
      electricitySavings: Math.round(data.annualSavings - data.vppAnnualValue - (data.evAnnualSavings || 0) - (data.hasGas ? (data.gasAnnualCost || 0) : 0)),
      vppAnnualValue: data.vppAnnualValue,
      vppProvider: data.vppProvider,
      evAnnualSavings: data.hasEV ? (data.evAnnualSavings || 0) : 0,
      gasAnnualCost: data.hasGas ? (data.gasAnnualCost || 0) : 0,
      poolHeatPumpSavings: data.hasPoolPump ? (data.poolPumpSavings || 0) : 0,
      netInvestment: data.netInvestment,
      totalRebates: data.rebateAmount,
      paybackYears: data.paybackYears,
      tenYearSavings: data.tenYearSavings,
      twentyFiveYearSavings: data.twentyFiveYearSavings || data.annualSavings * 25,
    }
  });
  
  // Slide 21: Financial Summary & Payback
  slides.push({
    id: slideId++,
    type: 'financial_summary',
    title: 'FINANCIAL SUMMARY & PAYBACK',
    subtitle: 'Investment Analysis & ROI',
    content: {
      systemCost: data.systemCost,
      rebates: data.rebateAmount,
      netInvestment: data.netInvestment,
      annualBenefit: data.annualSavings,
      paybackYears: data.paybackYears,
      tenYearSavings: data.tenYearSavings,
      twentyFiveYearSavings: data.twentyFiveYearSavings || data.annualSavings * 25,
      roi: Math.round((data.annualSavings / data.netInvestment) * 100),
      acceleratedBy: data.hasEV ? 'EV & VPP' : 'VPP',
    }
  });
  
  // Slide 22: Environmental Impact
  slides.push({
    id: slideId++,
    type: 'environmental_impact',
    title: 'ENVIRONMENTAL IMPACT',
    subtitle: 'Your Contribution to a Cleaner Future',
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
  
  // Slide 23: Recommended Roadmap
  slides.push({
    id: slideId++,
    type: 'roadmap',
    title: 'RECOMMENDED ROADMAP',
    subtitle: 'Implementation Timeline',
    content: {
      steps: [
        { number: '01', title: 'APPROVAL & FINANCE', description: 'Sign proposal and submit finance application. Secure rebates.', timeline: 'WEEK 1', color: 'aqua' },
        { number: '02', title: 'INSTALLATION', description: `Installation of ${data.panelBrand} panels, ${data.inverterBrand} inverter, and battery modules.`, timeline: 'WEEK 3-4', color: 'aqua' },
        { number: '03', title: 'VPP ACTIVATION', description: `Switch to ${data.vppProvider} ${data.vppProgram}. Configure battery for VPP events.`, timeline: 'WEEK 5', color: 'aqua' },
        { number: '04', title: 'EV INTEGRATION', description: 'Install EV charger. Set up solar-only charging logic.', timeline: 'MONTH 2+', color: 'orange' },
        data.hasGas ? { number: '05', title: 'ELECTRIFICATION', description: 'Phase out gas appliances. Install heat pump, AC, and induction.', timeline: 'MONTH 3-6', color: 'orange' } : null,
      ].filter(Boolean),
    }
  });
  
  // Slide 24: Conclusion
  slides.push({
    id: slideId++,
    type: 'conclusion',
    title: 'CONCLUSION',
    subtitle: 'Executive Summary',
    content: {
      features: [
        { icon: '📈', title: 'MAXIMIZE RETURNS', description: `Turn a $${Math.round(data.annualCost / 12)} monthly bill into a $${data.annualSavings.toLocaleString()} annual profit center through smart solar, battery, and VPP integration.`, border: 'aqua' },
        { icon: '🛡', title: 'SECURE POWER', description: `Gain independence from grid instability and rising costs with a ${data.batterySizeKwh}kWh battery backup system.`, border: 'white' },
        { icon: '⚡', title: 'FUTURE READY', description: 'Prepare your home for EV charging and full electrification, eliminating petrol and gas costs forever.', border: 'orange' },
      ],
      quote: '"THIS SOLUTION TRANSFORMS YOUR HOME FROM AN ENERGY CONSUMER INTO A CLEAN POWER STATION."',
      callToAction: 'Recommended Action: Approve Proposal to Secure Rebates',
    }
  });
  
  // Slide 25: Contact/Next Steps
  slides.push({
    id: slideId++,
    type: 'contact',
    title: 'NEXT STEPS',
    subtitle: 'Get Started Today',
    content: {
      preparedBy: BRAND.contact.name,
      title: BRAND.contact.title,
      company: BRAND.contact.company,
      address: BRAND.contact.address,
      phone: BRAND.contact.phone,
      email: BRAND.contact.email,
      website: BRAND.contact.website,
      copyright: BRAND.contact.copyright,
      logoUrl: BRAND.logo.iconWhite,
      nextSteps: [
        'Review this proposal and ask any questions',
        'Approve the proposal to lock in current rebates',
        'Schedule site inspection and installation date',
        'Enjoy clean, free energy for 25+ years',
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
// HTML SLIDE GENERATORS — Elite Smart Energy Solutions Design System
// ============================================================

// ── BRAND CONSTANTS — ELITE SMART ENERGY SOLUTIONS ──────────
const AQUA = '#46B446';         // Solar Green — primary accent
const ORANGE = '#4A6B8A';       // Steel Blue — secondary accent (replaces orange)
const BLACK = '#1B3A5C';        // Elite Navy — universal background
const WHITE = '#FFFFFF';        // Pure White — text
const ASH = '#4A6B8A';          // Steel Blue — muted text
const CARD_BG = 'rgba(44,62,80,0.6)';   // Charcoal card surface
const CARD_BORDER = '#4A6B8A';  // Steel Blue border
const INSIGHT_BG = '#2C3E50';   // Charcoal insight panels

const LOGO_URL = 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/CEecvotbhlfqjFdS.png';
const COVER_BG_URL = 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/efFUlWSUSNJuclEL.png';
const NEXTSPHERE_URL = 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/kMqxsAvtbLaduJLn.ttf';
const GENERALSANS_URL = 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/vrzfchblYdJojJyn.otf';
const URBANIST_URL = 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/eYiOkjJCeeZuKAcI.ttf';
const URBANIST_ITALIC_URL = 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/FXkHnZytykxslQaU.ttf';

// ── SHARED CSS ───────────────────────────────────────────────
const SLIDE_STYLES = `
<style>
@font-face { font-family: 'NextSphere'; src: url('${NEXTSPHERE_URL}') format('truetype'); font-weight: 800; }
@font-face { font-family: 'GeneralSans'; src: url('${GENERALSANS_URL}') format('opentype'); font-weight: 400; }
@font-face { font-family: 'Urbanist'; src: url('${URBANIST_URL}') format('truetype'); font-weight: 600; }
@font-face { font-family: 'UrbanistItalic'; src: url('${URBANIST_ITALIC_URL}') format('truetype'); font-weight: 600; font-style: italic; }

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 1920px; height: 1080px; background: ${BLACK}; overflow: hidden; }

.slide {
  width: 1920px; height: 1080px;
  background: ${BLACK};
  color: ${WHITE};
  font-family: 'GeneralSans', 'Open Sans', sans-serif;
  padding: 60px 80px;
  position: relative;
  overflow: hidden;
}

/* ── Header ── */
.slide-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 8px;
}
.slide-title {
  font-family: 'NextSphere', 'Montserrat', sans-serif;
  font-size: 64px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: ${WHITE};
  line-height: 1.05;
}
.slide-title-sm {
  font-family: 'Urbanist', 'Montserrat', sans-serif;
  font-size: 22px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${ASH};
  line-height: 1.0;
}
.slide-subtitle-right {
  font-family: 'UrbanistItalic', 'Montserrat', sans-serif;
  font-size: 22px;
  font-style: italic;
  color: ${AQUA};
  text-align: right;
  line-height: 1.2;
}
.slide-subtitle-right-ash {
  font-family: 'UrbanistItalic', 'Montserrat', sans-serif;
  font-size: 22px;
  font-style: italic;
  color: ${ASH};
  text-align: right;
  line-height: 1.2;
}
.slide-title-right {
  font-family: 'NextSphere', 'Montserrat', sans-serif;
  font-size: 40px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${AQUA};
  text-align: right;
  line-height: 1.0;
}
.slide-num {
  font-family: 'NextSphere', 'Montserrat', sans-serif;
  font-size: 200px;
  font-weight: 800;
  color: rgba(255,255,255,0.05);
  line-height: 1;
  position: absolute;
  top: -20px;
  right: 50px;
  pointer-events: none;
  user-select: none;
  z-index: 0;
}
.aqua-line {
  width: 100%;
  height: 1px;
  background: ${AQUA};
  margin-bottom: 36px;
  opacity: 0.4;
}

/* ── Logo ── */
.logo {
  position: absolute;
  top: 40px;
  right: 60px;
  width: 60px;
  height: 60px;
  object-fit: contain;
  z-index: 10;
}

/* ── Copyright ── */
.copyright {
  position: absolute;
  bottom: 28px;
  left: 80px;
  font-size: 11px;
  color: ${ASH};
  font-family: 'GeneralSans', sans-serif;
}

/* ── Cards ── */
.card {
  background: ${CARD_BG};
  border: 1px solid ${CARD_BORDER};
  border-radius: 8px;
  padding: 24px;
}
.card.aqua-b { border-color: ${AQUA}; }
.card.orange-b { border-color: ${ORANGE}; }
.insight-card {
  background: ${INSIGHT_BG};
  border-radius: 8px;
  padding: 24px 28px;
  border-left: 4px solid ${AQUA};
}
.insight-card.orange { border-left-color: ${ORANGE}; }
.insight-card-title {
  font-family: 'Urbanist', sans-serif;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${AQUA};
  margin-bottom: 10px;
}
.insight-card.orange .insight-card-title { color: ${ORANGE}; }
.insight-card p { color: ${ASH}; font-size: 15px; line-height: 1.6; }

/* ── Typography ── */
.lbl {
  font-family: 'Urbanist', sans-serif;
  font-size: 12px;
  color: ${ASH};
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin-bottom: 6px;
}
.hero-num {
  font-family: 'GeneralSans', sans-serif;
  font-weight: 700;
  line-height: 1;
}
.hero-num.aqua { color: ${AQUA}; }
.hero-num.white { color: ${WHITE}; }
.hero-num.orange { color: ${ORANGE}; }
.hero-num .unit { font-family: 'GeneralSans', sans-serif; font-weight: 400; }
.aqua { color: ${AQUA}; }
.orange { color: ${ORANGE}; }
.ash { color: ${ASH}; }
.white { color: ${WHITE}; }

/* ── Tables ── */
table { width: 100%; border-collapse: collapse; }
th {
  font-family: 'Urbanist', sans-serif;
  font-size: 11px;
  color: ${AQUA};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-align: left;
  padding: 12px 16px;
  border-bottom: 1px solid #4A6B8A;
}
td { padding: 14px 16px; border-bottom: 1px solid #4A6B8A; font-size: 15px; color: ${WHITE}; }
.highlight-row { background: rgba(70,180,70,0.08); border-left: 3px solid ${AQUA}; }

/* ── Badges ── */
.badge { display: inline-block; padding: 4px 14px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
.badge-yes { background: ${AQUA}; color: #FFFFFF; }
.badge-no { background: #333; color: ${ASH}; }
.badge-orange { background: ${ORANGE}; color: #fff; }

/* ── Two-column layouts ── */
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
.two-col-60-40 { display: grid; grid-template-columns: 60fr 40fr; gap: 40px; }
.two-col-40-60 { display: grid; grid-template-columns: 40fr 60fr; gap: 40px; }
.two-col-65-35 { display: grid; grid-template-columns: 65fr 35fr; gap: 40px; }

/* ── Table rows ── */
.table-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #4A6B8A;
  font-size: 17px;
}
.table-row:last-child { border-bottom: none; }
.table-row-label { color: ${ASH}; }
.table-row-value { color: ${WHITE}; font-weight: 600; }

/* ── Check items ── */
.check-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 14px;
  font-size: 16px;
  color: ${WHITE};
}
.check-tick { color: ${AQUA}; font-weight: 700; min-width: 18px; }

/* ── Progress bars ── */
.progress-bar-wrap { background: #4A6B8A; border-radius: 3px; height: 8px; margin-top: 8px; overflow: hidden; }
.progress-bar-fill { height: 100%; border-radius: 3px; }

/* ── Step items ── */
.step-item { display: flex; align-items: flex-start; gap: 24px; padding: 20px 0; border-bottom: 1px solid #4A6B8A; }
.step-item:last-child { border-bottom: none; }
.step-num { font-family: 'NextSphere', sans-serif; font-size: 36px; font-weight: 800; color: ${AQUA}; min-width: 50px; }
.step-title { font-size: 20px; font-weight: 600; color: ${WHITE}; margin-bottom: 4px; }
.step-desc { font-size: 15px; color: ${ASH}; line-height: 1.4; }

/* ── Next step boxes ── */
.next-step-box {
  background: ${INSIGHT_BG};
  border: 1px solid #4A6B8A;
  border-left: 3px solid ${AQUA};
  border-radius: 6px;
  padding: 18px 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 12px;
}
.next-step-num { font-family: 'NextSphere', sans-serif; font-size: 28px; font-weight: 800; color: ${AQUA}; min-width: 40px; }
.next-step-text { font-size: 19px; color: ${WHITE}; font-weight: 500; }

/* ── Capacity bar ── */
.cap-bar { display: flex; height: 44px; border-radius: 4px; overflow: hidden; margin: 16px 0; }
.cap-seg { display: flex; align-items: center; justify-content: center; font-family: 'Urbanist', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }

/* ── Benefit cards ── */
.benefit-card {
  background: ${INSIGHT_BG};
  border: 1px solid #4A6B8A;
  border-top: 2px solid ${AQUA};
  border-radius: 6px;
  padding: 20px 22px;
}
.benefit-card-title {
  font-family: 'Urbanist', sans-serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${AQUA};
  margin-bottom: 10px;
}
.benefit-card-body { font-size: 15px; line-height: 1.5; color: #ccc; }

/* ── Contact rows ── */
.contact-row { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; font-size: 17px; color: #ccc; }
.contact-icon { color: ${AQUA}; font-size: 18px; min-width: 22px; }
</style>
`;

// ── HELPERS ──────────────────────────────────────────────────
function fmt$(n: number): string {
  return '$' + Math.round(n).toLocaleString('en-AU');
}
function fmtN(n: number, decimals = 0): string {
  return n.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
function lastName(name: string): string {
  const parts = name.trim().split(' ');
  return parts.length > 1 ? parts[parts.length - 1] : name;
}
function slideHeader(title: string, subtitle?: string): string {
  return `
    <div class="slide-header">
      <h1 class="slide-title">${title}</h1>
      ${subtitle ? `<p class="slide-subtitle-right">${subtitle}</p>` : ''}
    </div>
    <div class="aqua-line"></div>
  `;
}
function slideHeaderSmall(titleSmall: string, titleRight: string, subtitleRight: string): string {
  return `
    <div class="slide-header">
      <div class="slide-title-sm">${titleSmall}</div>
      <div style="text-align:right;">
        <div class="slide-subtitle-right-ash">${subtitleRight}</div>
        <div class="slide-title-right">${titleRight}</div>
      </div>
    </div>
    <div class="aqua-line"></div>
  `;
}
function slideWrap(num: number, content: string): string {
  return `<!DOCTYPE html>
<html style="background:#1B3A5C;margin:0;padding:0;">
<head><meta charset="UTF-8">${SLIDE_STYLES}</head>
<body style="background:#1B3A5C;margin:0;padding:0;">
<div class="slide">
  <div class="slide-num">${String(num).padStart(2, '0')}</div>
  ${content}
  <img class="logo" src="${LOGO_URL}" alt="Elite Smart Energy" />
  <div class="copyright">© Elite Smart Energy Solutions</div>
</div>
</body>
</html>`;
}

// ── MONTHLY ESTIMATE HELPERS ─────────────────────────────────
function genMonthlyEstimate(annualKwh: number, state: string): number[] {
  const isCoolingDominant = ['QLD', 'NT', 'WA'].includes(state);
  const m = isCoolingDominant
    ? [1.15, 1.10, 1.00, 0.85, 0.80, 0.85, 0.90, 0.95, 0.90, 0.90, 0.95, 1.10]
    : [1.15, 1.10, 0.90, 0.85, 0.90, 1.05, 1.10, 1.05, 0.90, 0.85, 0.90, 1.05];
  const sum = m.reduce((a, b) => a + b, 0);
  return m.map(v => Math.round(annualKwh * v / sum));
}
function genSolarMonthly(solarKw: number, state: string): number[] {
  const isSouthern = ['VIC', 'TAS', 'SA'].includes(state);
  const m = isSouthern
    ? [1.35, 1.25, 1.10, 0.90, 0.75, 0.65, 0.70, 0.80, 0.95, 1.10, 1.20, 1.30]
    : [1.20, 1.15, 1.05, 0.95, 0.85, 0.80, 0.85, 0.90, 1.00, 1.10, 1.15, 1.20];
  const annualGen = solarKw * 1.21 * 365;
  const sum = m.reduce((a, b) => a + b, 0);
  return m.map(v => Math.round(annualGen * v / sum));
}

// ── SLIDE 1: COVER ────────────────────────────────────────────
function genCover(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  return `<!DOCTYPE html>
<html style="background:#1B3A5C;margin:0;padding:0;">
<head><meta charset="UTF-8">${SLIDE_STYLES}
<style>
.cover-bg {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: url('${COVER_BG_URL}') right center / 55% auto no-repeat, ${BLACK};
  z-index: 0;
}
.cover-overlay {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(to right, #1B3A5C 42%, rgba(27,58,92,0.25) 100%);
  z-index: 1;
}
.cover-content {
  position: relative; z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 60px 80px 50px 80px;
}
</style>
</head>
<body style="background:#1B3A5C;margin:0;padding:0;">
<div style="width:1920px;height:1080px;position:relative;overflow:hidden;background:#1B3A5C;">
  <div class="cover-bg"></div>
  <div class="cover-overlay"></div>
  <div class="cover-content">
    <div style="display:flex;align-items:center;gap:16px;">
      <img src="${LOGO_URL}" style="width:52px;height:52px;object-fit:contain;" alt="Elite Smart Energy" />
      <span style="font-family:'Urbanist',sans-serif;font-size:20px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:${AQUA};">Elite Smart Energy</span>
    </div>
    <div>
      <div style="font-family:'NextSphere',sans-serif;font-size:96px;font-weight:800;text-transform:uppercase;letter-spacing:0.02em;color:${WHITE};line-height:0.95;max-width:750px;">In-Depth<br>Electricity Bill<br>Analysis</div>
    </div>
    <div>
      <div style="display:flex;align-items:stretch;gap:0;">
        <div style="width:4px;background:${AQUA};border-radius:2px;margin-right:20px;"></div>
        <div>
          <div style="font-family:'Urbanist',sans-serif;font-size:26px;font-weight:700;color:${AQUA};margin-bottom:6px;">${c.customerName || slide.title}</div>
          <div style="font-size:18px;color:#ccc;">${c.address || ''}</div>
        </div>
      </div>
    </div>
    <div style="font-size:14px;color:${ASH};border-top:1px solid #4A6B8A;padding-top:16px;">Elite Smart Energy Solutions</div>
  </div>
</div>
</body>
</html>`;
}

// ── SLIDE 2: EXECUTIVE SUMMARY ────────────────────────────────
function genExecutiveSummary(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const annualCost = (c.currentAnnualCost as number) || 0;
  const annualSavings = (c.totalAnnualSavings as number) || 0;
  const payback = (c.paybackYears as number) || 0;
  const solarKw = (c.systemSize as number) || 0;
  const batteryKwh = (c.batterySize as number) || 0;
  const vppProvider = (c.vppProvider as string) || 'AGL';
  const co2 = (c.co2Reduction as number) || 0;
  const projectedCost = Math.max(0, annualCost - annualSavings);

  return slideWrap(2, `
    ${slideHeader('EXECUTIVE SUMMARY', 'Your Energy Transformation at a Glance')}
    <div class="two-col">
      <div>
        <div class="lbl" style="margin-bottom:16px;">Current Situation</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
          <div class="card">
            <div class="lbl">Annual Cost</div>
            <div class="hero-num orange" style="font-size:48px;">${fmt$(annualCost)}</div>
          </div>
          <div class="card">
            <div class="lbl">Annual Savings</div>
            <div class="hero-num aqua" style="font-size:48px;">${fmt$(annualSavings)}</div>
          </div>
          <div class="card">
            <div class="lbl">Payback Period</div>
            <div class="hero-num white" style="font-size:48px;">${payback.toFixed(1)}<span class="unit" style="font-size:20px;"> yrs</span></div>
          </div>
          <div class="card">
            <div class="lbl">CO₂ Reduction</div>
            <div class="hero-num aqua" style="font-size:48px;">${fmtN(co2, 1)}<span class="unit" style="font-size:20px;"> t/yr</span></div>
          </div>
        </div>
        <div class="insight-card">
          <div class="insight-card-title">Recommended System</div>
          <p><span style="color:${WHITE};font-weight:600;">${fmtN(solarKw, 2)}kW Solar + ${fmtN(batteryKwh, 1)}kWh Battery</span> with ${vppProvider} VPP participation. This system transforms your ${fmt$(annualCost)} annual electricity cost, delivering <span style="color:${AQUA};font-weight:600;">${fmt$(annualSavings)}</span> in annual savings from day one.</p>
        </div>
      </div>
      <div>
        <div class="lbl" style="margin-bottom:16px;">Strategic Outcomes</div>
        <div class="insight-card" style="margin-bottom:12px;">
          <div class="insight-card-title">Bill Reduction</div>
          <p>Reduce your annual electricity cost from <span style="color:${ORANGE};font-weight:600;">${fmt$(annualCost)}</span> to approximately <span style="color:${AQUA};font-weight:600;">${fmt$(projectedCost)}</span> — a <span style="color:${AQUA};font-weight:600;">${Math.round(annualSavings/annualCost*100)}% reduction</span> from day one.</p>
        </div>
        <div class="insight-card" style="margin-bottom:12px;">
          <div class="insight-card-title">Energy Independence</div>
          <p>Your ${fmtN(batteryKwh, 1)}kWh battery provides complete overnight coverage, reducing grid dependence by up to 85% and protecting against future price increases.</p>
        </div>
        <div class="insight-card" style="margin-bottom:12px;">
          <div class="insight-card-title">VPP Income Stream</div>
          <p>Earn additional income through ${vppProvider} Virtual Power Plant participation — your battery becomes a revenue-generating asset supporting grid stability.</p>
        </div>
        <div class="insight-card">
          <div class="insight-card-title">Rapid Payback</div>
          <p>A <span style="color:${WHITE};font-weight:600;">${payback.toFixed(1)}-year payback</span> on a 25-year asset delivering exceptional tax-free returns that outperform traditional investments.</p>
        </div>
      </div>
    </div>
  `);
}

// ── SLIDE 3: BILL ANALYSIS ────────────────────────────────────
function genBillAnalysis(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const retailer = (c.retailer as string) || 'Your Retailer';
  const annualCost = (c.annualCost as number) || 0;
  const usageCost = (c.usageCost as number) || 0;
  const supplyCost = (c.supplyCost as number) || 0;
  const usageRate = (c.usageRate as number) || 0;
  const supplyCharge = (c.supplyCharge as number) || 0;
  const feedIn = (c.feedInTariff as number) || 0;
  const controlledLoad = (c.controlledLoadRate as number) || 0;
  const usagePct = Math.round(usageCost / (usageCost + supplyCost) * 100) || 93;
  const supplyPct = 100 - usagePct;

  return slideWrap(3, `
    ${slideHeader('CURRENT BILL ANALYSIS', 'Detailed Breakdown')}
    <div class="two-col">
      <div>
        <div class="lbl" style="margin-bottom:16px;">Annual Cost Breakdown</div>
        <div class="table-row">
          <span class="table-row-label">Usage Charges</span>
          <span style="display:flex;align-items:center;gap:20px;">
            <span style="color:${ORANGE};font-weight:700;font-size:18px;">${fmt$(usageCost)}</span>
            <span style="color:${ASH};font-size:15px;">${usagePct}%</span>
          </span>
        </div>
        <div class="table-row">
          <span class="table-row-label">Supply Charges</span>
          <span style="display:flex;align-items:center;gap:20px;">
            <span style="color:${WHITE};font-weight:700;font-size:18px;">${fmt$(supplyCost)}</span>
            <span style="color:${ASH};font-size:15px;">${supplyPct}%</span>
          </span>
        </div>
        <div class="table-row" style="border-top:1px solid #333;margin-top:8px;padding-top:16px;">
          <span style="font-family:'Urbanist',sans-serif;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${WHITE};">Total Annual</span>
          <span style="color:${ORANGE};font-weight:700;font-size:20px;">${fmt$(annualCost)}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:20px;">
          <div class="card">
            <div class="lbl">Daily Average</div>
            <div class="hero-num orange" style="font-size:40px;">${fmt$(Math.round(annualCost/365))}</div>
          </div>
          <div class="card">
            <div class="lbl">Monthly Average</div>
            <div class="hero-num orange" style="font-size:40px;">${fmt$(Math.round(annualCost/12))}</div>
          </div>
        </div>
        <div style="margin-top:20px;font-size:16px;line-height:1.6;color:#ccc;">Your current annual electricity cost of <span style="color:${ORANGE};font-weight:600;">${fmt$(annualCost)}</span> is driven by a <span style="color:${WHITE};font-weight:600;">${fmtN(usageRate, 2)}c/kWh</span> usage rate and <span style="color:${WHITE};font-weight:600;">${fmtN(supplyCharge, 2)}c/day</span> supply charge. The significant gap between your usage rate and <span style="color:${AQUA};font-weight:600;">${fmtN(feedIn, 1)}c/kWh</span> feed-in tariff presents a major optimisation opportunity.</div>
      </div>
      <div>
        <div class="lbl" style="margin-bottom:16px;">Current Tariff Structure</div>
        <div class="card" style="margin-bottom:12px;text-align:center;padding:28px;">
          <div class="lbl">Peak Rate</div>
          <div class="hero-num orange" style="font-size:64px;">${fmtN(usageRate, 2)}<span class="unit" style="font-size:24px;">c/kWh</span></div>
        </div>
        <div class="card" style="margin-bottom:12px;text-align:center;padding:28px;">
          <div class="lbl">Daily Supply Charge</div>
          <div class="hero-num white" style="font-size:64px;">${fmtN(supplyCharge, 2)}<span class="unit" style="font-size:24px;">c/day</span></div>
        </div>
        <div class="card" style="text-align:center;padding:28px;">
          <div class="lbl">Feed-in Tariff</div>
          <div class="hero-num aqua" style="font-size:64px;">${fmtN(feedIn, 1)}<span class="unit" style="font-size:24px;">c/kWh</span></div>
        </div>
        ${controlledLoad > 0 ? `<div class="card" style="margin-top:12px;text-align:center;padding:20px;">
          <div class="lbl">Controlled Load Rate</div>
          <div class="hero-num white" style="font-size:48px;">${fmtN(controlledLoad, 2)}<span class="unit" style="font-size:20px;">c/kWh</span></div>
        </div>` : ''}
      </div>
    </div>
  `);
}

// ── SLIDE 4: USAGE ANALYSIS ───────────────────────────────────
function genUsageAnalysis(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const annualKwh = (c.annualUsageKwh as number) || 0;
  const dailyKwh = (c.dailyAverageKwh as number) || 0;
  const state = (c.state as string) || 'VIC';
  const monthlyData = (c.monthlyData as Array<{month:string;kwh:number;cost:number}>) || [];
  
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const kwhData = monthlyData.length === 12
    ? monthlyData.map(m => m.kwh)
    : genMonthlyEstimate(annualKwh, state);
  const maxKwh = Math.max(...kwhData);
  const minKwh = Math.min(...kwhData);
  const peakIdx = kwhData.indexOf(maxKwh);
  const lowIdx = kwhData.indexOf(minKwh);
  const seasonColors = ['#FF8C5A','#FF8C5A','#888','#888','#888','#46B446','#46B446','#46B446','#ccc','#ccc','#ccc','#FF8C5A'];
  const chartId = `chart_${slide.id}_usage`;

  return slideWrap(4, `
    ${slideHeader('MONTHLY USAGE ANALYSIS', 'Your Energy Consumption Pattern')}
    <div class="two-col-60-40">
      <div>
        <canvas id="${chartId}" width="950" height="480"></canvas>
        <div style="display:flex;gap:20px;margin-top:12px;flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap:8px;font-size:14px;color:#ccc;"><div style="width:12px;height:12px;background:#FF8C5A;border-radius:2px;"></div>Summer</div>
          <div style="display:flex;align-items:center;gap:8px;font-size:14px;color:#ccc;"><div style="width:12px;height:12px;background:#888;border-radius:2px;"></div>Autumn</div>
          <div style="display:flex;align-items:center;gap:8px;font-size:14px;color:#ccc;"><div style="width:12px;height:12px;background:${AQUA};border-radius:2px;"></div>Winter</div>
          <div style="display:flex;align-items:center;gap:8px;font-size:14px;color:#ccc;"><div style="width:12px;height:12px;background:#ccc;border-radius:2px;"></div>Spring</div>
        </div>
      </div>
      <div>
        <div style="padding:20px 0;border-bottom:1px solid #4A6B8A;">
          <div class="lbl">Annual Consumption</div>
          <div class="hero-num white" style="font-size:48px;">${fmtN(annualKwh, 0)}<span class="unit" style="font-size:20px;"> kWh</span></div>
        </div>
        <div style="padding:20px 0;border-bottom:1px solid #4A6B8A;">
          <div class="lbl">Daily Average</div>
          <div class="hero-num white" style="font-size:48px;">${fmtN(dailyKwh, 1)}<span class="unit" style="font-size:20px;"> kWh</span></div>
        </div>
        <div style="padding:20px 0;border-bottom:1px solid #4A6B8A;">
          <div class="lbl">Peak Month</div>
          <div class="hero-num aqua" style="font-size:48px;">${months[peakIdx]}</div>
          <div style="font-size:14px;color:${ASH};margin-top:4px;">${fmtN(maxKwh, 0)} kWh</div>
        </div>
        <div style="padding:20px 0;">
          <div class="lbl">Lowest Month</div>
          <div class="hero-num aqua" style="font-size:48px;">${months[lowIdx]}</div>
          <div style="font-size:14px;color:${ASH};margin-top:4px;">${fmtN(minKwh, 0)} kWh</div>
        </div>
        <div style="margin-top:16px;font-size:14px;line-height:1.6;color:${ASH};">Your substantial ${fmtN(annualKwh, 0)} kWh annual usage, averaging ${fmtN(dailyKwh, 1)} kWh/day, indicates significant consumption. Battery storage is crucial for optimising this high usage, especially addressing evening peak demand.</div>
      </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <script>
    (function() {
      var ctx = document.getElementById('${chartId}');
      if (!ctx) return;
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ${JSON.stringify(months)},
          datasets: [{ data: ${JSON.stringify(kwhData)}, backgroundColor: ${JSON.stringify(seasonColors)}, borderRadius: 3, borderSkipped: false }]
        },
        options: {
          responsive: false,
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: '${ASH}', font: { size: 14, family: 'Urbanist' } }, border: { color: '#333' } },
            y: { display: false }
          },
          animation: false,
          layout: { padding: { top: 30 } }
        },
        plugins: [{
          id: 'valLabels',
          afterDatasetsDraw(chart) {
            var ctx2 = chart.ctx;
            chart.data.datasets.forEach(function(ds, i) {
              chart.getDatasetMeta(i).data.forEach(function(bar, idx) {
                ctx2.save();
                ctx2.fillStyle = '#ccc';
                ctx2.font = '13px Urbanist, sans-serif';
                ctx2.textAlign = 'center';
                ctx2.fillText(ds.data[idx], bar.x, bar.y - 8);
                ctx2.restore();
              });
            });
          }
        }]
      });
    })();
    </script>
  `);
}

// ── SLIDE 5: YEARLY PROJECTION ────────────────────────────────
function genYearlyProjection(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const currentCost = (c.currentAnnualCost as number) || 0;
  const annualSavings = (c.projectedAnnualCost as number) || 0; // this is actually projectedAnnualCost
  const tenYr = Math.round(currentCost * Math.pow(1.035, 10));
  const yr25 = Math.round(currentCost * Math.pow(1.035, 25));
  const cumul25 = (c.twentyFiveYearSavings as number) || 0;
  const chartId = `chart_${slide.id}_proj`;
  
  const labels: string[] = [];
  const withoutSolar: number[] = [];
  const withSolar: number[] = [];
  for (let i = 0; i <= 25; i++) {
    labels.push(i % 5 === 0 ? `YR ${i}` : '');
    withoutSolar.push(Math.round(currentCost * Math.pow(1.035, i)));
    withSolar.push(Math.max(0, Math.round(currentCost - (c.totalAnnualSavings as number || 0) + (currentCost * Math.pow(1.035, i) - currentCost) * 0.1)));
  }

  return slideWrap(5, `
    ${slideHeader('YEARLY COST PROJECTION', '25-Year Cost Trajectory')}
    <div class="two-col-60-40">
      <div>
        <canvas id="${chartId}" width="950" height="500"></canvas>
        <div style="display:flex;gap:24px;margin-top:12px;">
          <div style="display:flex;align-items:center;gap:8px;font-size:14px;color:#ccc;"><div style="width:20px;height:3px;background:${ORANGE};"></div>Without Solar (3.5% inflation)</div>
          <div style="display:flex;align-items:center;gap:8px;font-size:14px;color:#ccc;"><div style="width:20px;height:3px;background:${AQUA};"></div>With Solar + Battery</div>
        </div>
      </div>
      <div>
        <div style="padding:20px 0;border-bottom:1px solid #4A6B8A;">
          <div class="lbl">Current Annual</div>
          <div class="hero-num orange" style="font-size:48px;">${fmt$(currentCost)}</div>
        </div>
        <div style="padding:20px 0;border-bottom:1px solid #4A6B8A;">
          <div class="lbl">Year 10 (No Action)</div>
          <div class="hero-num orange" style="font-size:48px;">${fmt$(tenYr)}</div>
        </div>
        <div style="padding:20px 0;border-bottom:1px solid #4A6B8A;">
          <div class="lbl">25-Year Projection</div>
          <div class="hero-num orange" style="font-size:48px;">${fmt$(yr25)}</div>
        </div>
        <div class="card aqua-b" style="margin-top:16px;padding:24px;">
          <div class="lbl">25-Year Cumulative Savings</div>
          <div class="hero-num aqua" style="font-size:52px;">${fmt$(cumul25)}</div>
        </div>
        <div style="margin-top:16px;font-size:14px;line-height:1.6;color:${ASH};">Without solar, your current ${fmt$(currentCost)} annual electricity cost could inflate to ~${fmt$(tenYr)} in 10 years. This investment secures substantial long-term savings, projected at ${fmt$(cumul25)} over 25 years.</div>
      </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <script>
    (function() {
      var ctx = document.getElementById('${chartId}');
      if (!ctx) return;
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ${JSON.stringify(labels)},
          datasets: [
            { data: ${JSON.stringify(withoutSolar)}, borderColor: '${ORANGE}', backgroundColor: 'rgba(243,103,16,0.12)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 0 },
            { data: ${JSON.stringify(withSolar)}, borderColor: '${AQUA}', backgroundColor: 'transparent', fill: false, tension: 0.4, borderWidth: 2, pointRadius: 0 }
          ]
        },
        options: {
          responsive: false,
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          scales: {
            x: { grid: { color: '#4A6B8A' }, ticks: { color: '${ASH}', font: { size: 13 }, maxRotation: 0 }, border: { color: '#333' } },
            y: { grid: { color: '#4A6B8A' }, ticks: { color: '${ASH}', font: { size: 13 }, callback: function(v) { return '$' + (v/1000).toFixed(0) + 'K'; } }, border: { color: '#333' } }
          },
          animation: false
        }
      });
    })();
    </script>
  `);
}

// ── SLIDE 6: GAS FOOTPRINT ────────────────────────────────────
function genGasFootprint(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const annualMJ = (c.annualMJ as number) || 0;
  const annualCost = (c.annualCost as number) || 0;
  const dailySupply = (c.dailySupplyCharge as number) || 0;
  const usageRate = (c.usageRate as number) || 0;
  const kwhEquiv = (c.kwhEquivalent as number) || annualMJ * 0.2778;
  const co2 = (c.co2Emissions as number) || annualMJ * 0.0519;

  return slideWrap(6, `
    ${slideHeader('CURRENT GAS FOOTPRINT', 'Gas Usage & Environmental Impact')}
    <div class="two-col">
      <div>
        <div class="lbl" style="margin-bottom:16px;">Gas Bill Summary</div>
        <div class="table-row"><span class="table-row-label">Annual Gas Usage</span><span class="table-row-value">${fmtN(annualMJ, 0)} MJ</span></div>
        <div class="table-row"><span class="table-row-label">Annual Gas Cost</span><span style="color:${ORANGE};font-weight:700;font-size:18px;">${fmt$(annualCost)}</span></div>
        <div class="table-row"><span class="table-row-label">Daily Supply Charge</span><span class="table-row-value">${fmtN(dailySupply, 2)}c/day</span></div>
        <div class="table-row"><span class="table-row-label">Usage Rate</span><span class="table-row-value">${fmtN(usageRate, 4)}c/MJ</span></div>
        <div class="table-row"><span class="table-row-label">kWh Equivalent</span><span class="table-row-value">${fmtN(kwhEquiv, 0)} kWh</span></div>
        <div class="table-row"><span class="table-row-label">CO₂ Emissions</span><span style="color:${ORANGE};font-weight:700;font-size:18px;">${fmtN(co2, 1)} tonnes/yr</span></div>
        <div style="margin-top:20px;font-size:16px;line-height:1.6;color:#ccc;">Your current gas usage generates <span style="color:${ORANGE};font-weight:600;">${fmtN(co2, 1)} tonnes</span> of CO₂ annually. Electrification of your gas appliances would eliminate this footprint while reducing your total energy costs.</div>
      </div>
      <div>
        <div class="lbl" style="margin-bottom:16px;">Electrification Opportunity</div>
        <div class="card aqua-b" style="margin-bottom:12px;text-align:center;padding:32px;">
          <div class="lbl">Annual Gas Cost</div>
          <div class="hero-num orange" style="font-size:64px;">${fmt$(annualCost)}</div>
          <div style="font-size:15px;color:${ASH};margin-top:8px;">Eliminable through full electrification</div>
        </div>
        <div class="insight-card">
          <div class="insight-card-title">Why Electrify?</div>
          <p>By switching to heat pump hot water, reverse cycle heating/cooling, and induction cooking, you can eliminate your entire gas bill while reducing CO₂ emissions by ${fmtN(co2, 1)} tonnes per year. Combined with solar, your electrified home runs on clean, free energy.</p>
        </div>
      </div>
    </div>
  `);
}

// ── SLIDE 7: GAS APPLIANCES ───────────────────────────────────
function genGasAppliances(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const appliances = (c.appliances as Record<string, {type:string;age?:number;annualCost?:number}>) || {};
  const priority = (c.electrificationPriority as Array<{name:string;type:string;priority:string;savings:number}|null>) || [];
  const totalGasCost = (c.totalGasCost as number) || 0;

  const rows = priority.filter(Boolean).map(p => {
    if (!p) return '';
    const badgeClass = p.priority === 'HIGH' ? 'badge-orange' : 'badge-yes';
    return `<tr>
      <td style="color:${WHITE};font-weight:600;">${p.name}</td>
      <td style="color:${ASH};">${p.type}</td>
      <td><span class="badge ${badgeClass}">${p.priority}</span></td>
      <td style="color:${AQUA};font-weight:600;">${fmt$(p.savings)}/yr</td>
    </tr>`;
  }).join('');

  return slideWrap(7, `
    ${slideHeader('GAS APPLIANCE INVENTORY', 'Electrification Priority Assessment')}
    <div class="two-col">
      <div>
        <div class="lbl" style="margin-bottom:16px;">Appliance Inventory</div>
        <table>
          <thead><tr><th>Appliance</th><th>Type</th><th>Priority</th><th>Est. Savings</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div style="margin-top:24px;" class="card orange-b">
          <div class="lbl">Total Annual Gas Cost</div>
          <div class="hero-num orange" style="font-size:52px;">${fmt$(totalGasCost)}</div>
          <div style="font-size:14px;color:${ASH};margin-top:6px;">Fully eliminable through electrification</div>
        </div>
      </div>
      <div>
        <div class="lbl" style="margin-bottom:16px;">Electrification Pathway</div>
        ${priority.filter(Boolean).map(p => {
          if (!p) return '';
          return `<div class="insight-card" style="margin-bottom:12px;">
            <div class="insight-card-title">${p.name}</div>
            <p><span style="color:${WHITE};font-weight:600;">${p.type}</span> — Replace with heat pump/induction technology. Estimated savings: <span style="color:${AQUA};font-weight:600;">${fmt$(p.savings)}/year</span></p>
          </div>`;
        }).join('')}
      </div>
    </div>
  `);
}

// ── SLIDE 8: STRATEGIC ASSESSMENT ────────────────────────────
function genStrategic(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const advantages = (c.advantages as Array<{icon:string;title:string;description:string}>) || [];
  const considerations = (c.considerations as Array<{icon:string;title:string;description:string}>) || [];

  return slideWrap(8, `
    ${slideHeader('STRATEGIC ASSESSMENT', 'Battery Storage Investment')}
    <div class="two-col">
      <div>
        <div class="lbl" style="color:${AQUA};margin-bottom:16px;">Advantages</div>
        ${advantages.map(a => `
          <div class="insight-card" style="margin-bottom:10px;padding:18px 22px;">
            <div class="insight-card-title">${a.title}</div>
            <p>${a.description}</p>
          </div>
        `).join('')}
      </div>
      <div>
        <div class="lbl" style="color:${ORANGE};margin-bottom:16px;">Considerations</div>
        ${considerations.map(a => `
          <div class="insight-card orange" style="margin-bottom:10px;padding:18px 22px;">
            <div class="insight-card-title">${a.title}</div>
            <p>${a.description}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `);
}

// ── SLIDE 9: BATTERY RECOMMENDATION ──────────────────────────
function genBattery(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const totalKwh = (c.totalCapacity as number) || 0;
  const brand = (c.brand as string) || 'Sigenergy';
  const modules = (c.modules as string) || `${Math.ceil(totalKwh / 8.06)} x 8.06 KWH`;
  const inverterSize = (c.inverterSize as number) || 10;
  const cap = (c.whyThisCapacity as {home:number;evCharge:number;vppTrade:number}) || {home:4,evCharge:0,vppTrade:totalKwh-4};
  const total = cap.home + cap.evCharge + cap.vppTrade;
  const homePct = Math.round(cap.home / total * 100);
  const evPct = Math.round(cap.evCharge / total * 100);
  const vppPct = 100 - homePct - evPct;

  return slideWrap(9, `
    ${slideHeaderSmall('Battery Storage Solution', `${fmtN(totalKwh, 1)} KWH Capacity`, 'Ultimate Independence')}
    <div class="two-col">
      <div>
        <div class="card" style="text-align:center;padding:36px;margin-bottom:14px;">
          <div class="hero-num white" style="font-size:88px;">${fmtN(totalKwh, 1)}<span class="unit" style="font-size:36px;"> KWH</span></div>
          <div class="lbl" style="margin-top:10px;">Total Installed Capacity</div>
          <div style="font-size:17px;color:${AQUA};margin-top:8px;">${modules} (${Math.round(totalKwh * 0.95)} kWh Usable)</div>
        </div>
        <div class="insight-card" style="margin-bottom:12px;">
          <div class="insight-card-title">Why This Capacity?</div>
          <p>This storage capacity ensures complete overnight coverage and enables aggressive VPP trading during peak demand events. The modular design allows future expansion as your energy needs grow.</p>
        </div>
        <div class="insight-card">
          <div class="insight-card-title">Technical Edge</div>
          <div class="check-item"><span class="check-tick">✓</span><span><span style="color:${AQUA};">LFP Technology</span> — 6,000+ cycle lifespan</span></div>
          <div class="check-item"><span class="check-tick">✓</span><span><span style="color:${AQUA};">High Voltage</span> — Superior efficiency</span></div>
          <div class="check-item"><span class="check-tick">✓</span><span><span style="color:${AQUA};">Modular Design</span> — Scalable capacity</span></div>
          <div class="check-item" style="margin-bottom:0;"><span class="check-tick">✓</span><span><span style="color:${AQUA};">98% DoD</span> — Maximum usable energy</span></div>
        </div>
      </div>
      <div>
        <div class="lbl" style="margin-bottom:12px;">Strategic Capacity Allocation</div>
        <div class="cap-bar">
          <div class="cap-seg" style="width:${homePct}%;background:${AQUA};color:#FFFFFF;">Evening Use (${homePct}%)</div>
          ${evPct > 0 ? `<div class="cap-seg" style="width:${evPct}%;background:#4A6B8A;color:#FFFFFF;">EV (${evPct}%)</div>` : ''}
          <div class="cap-seg" style="width:${vppPct}%;background:#005a52;color:#fff;">VPP (${vppPct}%)</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px;">
          <div>
            <div style="font-size:14px;font-weight:700;color:${AQUA};margin-bottom:6px;">Home Power</div>
            <div style="font-size:13px;color:${ASH};">Overnight household consumption from stored solar</div>
          </div>
          ${evPct > 0 ? `<div>
            <div style="font-size:14px;font-weight:700;color:${AQUA};margin-bottom:6px;">EV Charging</div>
            <div style="font-size:13px;color:${ASH};">Daily commute charged overnight from solar</div>
          </div>` : ''}
          <div>
            <div style="font-size:14px;font-weight:700;color:${AQUA};margin-bottom:6px;">Income Generation</div>
            <div style="font-size:13px;color:${ASH};">VPP grid events and peak demand trading</div>
          </div>
        </div>
        <div class="card aqua-b" style="padding:24px;">
          <div class="insight-card-title">The Result</div>
          <div style="font-size:18px;font-weight:600;color:${WHITE};margin-bottom:6px;">You effectively become your own power plant.</div>
          <div style="font-size:15px;color:${ASH};">Complete energy independence during peak hours with revenue generation from surplus capacity.</div>
        </div>
      </div>
    </div>
  `);
}

// ── SLIDE 10: SOLAR SYSTEM ────────────────────────────────────
function genSolar(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const solarKw = (c.systemSize as number) || 0;
  const panelCount = (c.panelCount as number) || 0;
  const panelPower = (c.panelPower as number) || 440;
  const panelBrand = (c.panelBrand as string) || 'Jinko Solar';
  const annualGen = Math.round(solarKw * 1.21 * 365);

  return slideWrap(10, `
    ${slideHeaderSmall('Solar PV Recommendation', `${fmtN(solarKw, 2)} KW System`, 'System Configuration')}
    <div class="two-col">
      <div>
        <div class="card" style="text-align:center;padding:36px;margin-bottom:14px;">
          <div class="hero-num white" style="font-size:88px;">${fmtN(solarKw, 2)}<span class="unit" style="font-size:36px;"> KW</span></div>
          <div class="lbl" style="margin-top:10px;">Total Solar Capacity</div>
          <div style="font-size:17px;color:${AQUA};margin-top:8px;">${panelCount} × ${panelPower}W ${panelBrand} Panels</div>
        </div>
        <div class="insight-card">
          <div class="insight-card-title">Premium Hardware</div>
          <div class="check-item"><span class="check-tick">✓</span><span><span style="color:${AQUA};">Panels:</span> ${panelBrand} ${panelPower}W — Tier 1 manufacturer</span></div>
          <div class="check-item"><span class="check-tick">✓</span><span><span style="color:${AQUA};">Warranty:</span> 25-year panel performance guarantee</span></div>
          <div class="check-item"><span class="check-tick">✓</span><span><span style="color:${AQUA};">Aesthetics:</span> All-black panels for premium appearance</span></div>
          <div class="check-item" style="margin-bottom:0;"><span class="check-tick">✓</span><span><span style="color:${AQUA};">Shade Optimization:</span> Advanced cell technology</span></div>
        </div>
      </div>
      <div>
        <div class="card" style="margin-bottom:14px;padding:32px;">
          <div class="lbl">Annual Production</div>
          <div class="hero-num white" style="font-size:72px;">${fmtN(annualGen, 0)}<span class="unit" style="font-size:28px;"> KWH</span></div>
          <div class="lbl" style="margin-top:8px;">Estimated Yearly Generation</div>
        </div>
        <div class="insight-card">
          <div class="insight-card-title">Why This Size?</div>
          <p>The ${fmtN(solarKw, 2)}kW system is strategically sized to exceed your annual consumption, ensuring surplus generation for battery charging, VPP participation, and feed-in credits. This oversizing strategy maximises your return on investment while future-proofing for increased consumption.</p>
        </div>
      </div>
    </div>
  `);
}

// ── SLIDE 11: VPP COMPARISON ──────────────────────────────────
function genVPPComparison(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const providers = (c.providers as Array<{provider:string;program:string;gasBundle:boolean;annualValue:string;strategicFit:string}>) || [];
  const recommended = (c.recommendedProvider as string) || '';

  return slideWrap(11, `
    ${slideHeader('VPP PROVIDER COMPARISON', 'Evaluating Market Leaders')}
    <table>
      <thead>
        <tr>
          <th>Provider</th>
          <th>Program</th>
          <th>Gas Bundle</th>
          <th>Annual Value</th>
          <th>Strategic Fit</th>
          <th>Verdict</th>
        </tr>
      </thead>
      <tbody>
        ${providers.map(p => {
          const isRec = p.provider.toLowerCase() === recommended.toLowerCase();
          const fitColor = p.strategicFit === 'EXCELLENT' ? AQUA : p.strategicFit === 'GOOD' ? WHITE : ASH;
          return `<tr class="${isRec ? 'highlight-row' : ''}">
            <td style="color:${WHITE};font-weight:600;">${p.provider}${isRec ? ` <span style="color:${AQUA};font-size:12px;">★ RECOMMENDED</span>` : ''}</td>
            <td style="color:${ASH};">${p.program}</td>
            <td><span class="badge ${p.gasBundle ? 'badge-yes' : 'badge-no'}">${p.gasBundle ? 'YES' : 'NO'}</span></td>
            <td style="color:${AQUA};font-weight:600;">${p.annualValue}</td>
            <td style="color:${fitColor};font-weight:600;">${p.strategicFit}</td>
            <td style="color:${isRec ? AQUA : ASH};font-weight:${isRec ? '700' : '400'};">${isRec ? 'RECOMMENDED' : 'Alternative'}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
    <div style="margin-top:20px;font-size:14px;color:${ASH};font-style:italic;">VPP values are estimates based on current program terms. Actual earnings depend on grid events, battery availability, and program changes.</div>
  `);
}

// ── SLIDE 12: VPP RECOMMENDATION ─────────────────────────────
function genVPPRecommendation(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const provider = (c.provider as string) || 'AGL';
  const program = (c.program as string) || 'Night Saver';
  const annualValue = (c.annualValue as number) || 0;
  const features = (c.features as Array<{icon:string;title:string;description:string}>) || [];

  return slideWrap(12, `
    ${slideHeaderSmall('Recommended VPP Strategy', program, 'Strategic Roadmap')}
    <div class="two-col">
      <div>
        <div class="insight-card" style="margin-bottom:14px;">
          <div class="insight-card-title">Why ${program}?</div>
          <p>After analyzing 13 providers, ${provider} offers the best combination of VPP earnings, gas bundling, and battery compatibility for your system configuration.</p>
        </div>
        <div class="check-item"><span class="check-tick">✓</span><span><span style="color:${AQUA};">Gas + Electricity Bundle</span><br><span style="font-size:14px;color:${ASH};">Maximise savings with dual fuel discounts</span></span></div>
        <div class="check-item"><span class="check-tick">✓</span><span><span style="color:${AQUA};">Battery Compatible</span><br><span style="font-size:14px;color:${ASH};">Fully supported by your new battery system</span></span></div>
        <div class="check-item"><span class="check-tick">✓</span><span><span style="color:${AQUA};">No Lock-In Contract</span><br><span style="font-size:14px;color:${ASH};">Flexibility to switch if rates change</span></span></div>
        <div class="check-item" style="margin-bottom:0;"><span class="check-tick">✓</span><span><span style="color:${AQUA};">20% Reserve Protection</span><br><span style="font-size:14px;color:${ASH};">Ensures backup power during blackouts</span></span></div>
        <div class="card aqua-b" style="margin-top:20px;text-align:center;padding:28px;">
          <div class="lbl">Annual VPP Value</div>
          <div class="hero-num aqua" style="font-size:64px;">~${fmt$(annualValue)}</div>
          <div style="font-size:14px;color:${ASH};margin-top:6px;">Ongoing per year</div>
        </div>
      </div>
      <div>
        ${features.map(f => `
          <div class="insight-card" style="margin-bottom:12px;">
            <div class="insight-card-title">${f.title}</div>
            <p>${f.description}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `);
}

// ── SLIDE 13-15: ELECTRIFICATION (Hot Water / Heating / Induction) ──
function genElectrificationSlide(slide: SlideContent, type: string): string {
  const c = slide.content as Record<string, unknown>;
  const current = (c.currentSystem as string) || 'Gas System';
  const recommended = (c.recommendedSystem as string) || 'Heat Pump';
  const annualGasCost = (c.annualGasCost as number) || 0;
  const annualNewCost = (c.annualHeatPumpCost as number) || (c.annualACCost as number) || (c.annualInductionCost as number) || 0;
  const annualSavings = (c.annualSavings as number) || 0;
  const installCost = (c.installCost as number) || 0;
  const rebates = (c.rebates as number) || 0;
  const netCost = (c.netCost as number) || installCost - rebates;
  const features = (c.features as string[]) || [];
  const titles: Record<string, string> = {
    hot_water: 'HOT WATER ELECTRIFICATION',
    heating: 'HEATING & COOLING UPGRADE',
    induction: 'INDUCTION COOKING UPGRADE',
  };
  const subtitles: Record<string, string> = {
    hot_water: 'Heat Pump Upgrade Analysis',
    heating: 'Reverse Cycle AC Analysis',
    induction: 'Gas Cooktop Replacement',
  };

  return slideWrap(slide.id, `
    ${slideHeader(titles[type] || 'ELECTRIFICATION', subtitles[type] || 'Analysis')}
    <div class="two-col">
      <div>
        <div class="table-row"><span class="table-row-label">Current System</span><span style="color:${ORANGE};font-weight:600;">${current}</span></div>
        <div class="table-row"><span class="table-row-label">Recommended</span><span style="color:${AQUA};font-weight:600;">${recommended}</span></div>
        <div class="table-row"><span class="table-row-label">Current Annual Cost</span><span style="color:${ORANGE};font-weight:700;font-size:18px;">${fmt$(annualGasCost)}</span></div>
        <div class="table-row"><span class="table-row-label">New Annual Cost</span><span style="color:${AQUA};font-weight:700;font-size:18px;">${fmt$(annualNewCost)}</span></div>
        <div class="table-row"><span class="table-row-label">Annual Savings</span><span style="color:${AQUA};font-weight:700;font-size:18px;">${fmt$(annualSavings)}</span></div>
        <div class="card aqua-b" style="margin-top:20px;">
          <div class="lbl">Investment Summary</div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-top:12px;">
            <div style="text-align:center;">
              <div class="lbl">Install Cost</div>
              <div class="hero-num white" style="font-size:32px;">${fmt$(installCost)}</div>
            </div>
            <div style="text-align:center;">
              <div class="lbl">Rebates</div>
              <div class="hero-num aqua" style="font-size:32px;">-${fmt$(rebates)}</div>
            </div>
            <div style="text-align:center;">
              <div class="lbl">Net Cost</div>
              <div class="hero-num orange" style="font-size:32px;">${fmt$(netCost)}</div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div class="lbl" style="margin-bottom:16px;">Key Features</div>
        ${features.map(f => `<div class="check-item"><span class="check-tick">✓</span><span>${f}</span></div>`).join('')}
        <div class="insight-card" style="margin-top:20px;">
          <div class="insight-card-title">Payback</div>
          <p>At ${fmt$(annualSavings)}/year savings, this upgrade pays back in <span style="color:${AQUA};font-weight:600;">${(netCost / annualSavings).toFixed(1)} years</span>. Combined with solar, the new system runs on free energy, dramatically reducing ongoing costs.</p>
        </div>
      </div>
    </div>
  `);
}
function genHotWater(slide: SlideContent): string { return genElectrificationSlide(slide, 'hot_water'); }
function genHeatingCooling(slide: SlideContent): string { return genElectrificationSlide(slide, 'heating'); }
function genInduction(slide: SlideContent): string { return genElectrificationSlide(slide, 'induction'); }

// ── SLIDE 16-17: EV ───────────────────────────────────────────
function genEVAnalysis(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const annualKm = (c.annualKm as number) || 15000;
  const petrolCost = (c.petrolCost as number) || 0;
  const gridCost = (c.gridCost as number) || 0;
  const solarCost = (c.solarCost as number) || 0;
  const annualSavings = (c.annualSavings as number) || 0;

  return slideWrap(slide.id, `
    ${slideHeader('EV ANALYSIS', 'Electric Vehicle Cost Comparison')}
    <div class="two-col">
      <div>
        <div class="lbl" style="margin-bottom:16px;">Annual Driving Costs</div>
        <div class="table-row"><span class="table-row-label">Annual Distance</span><span class="table-row-value">${fmtN(annualKm, 0)} km</span></div>
        <div class="table-row"><span class="table-row-label">Petrol Cost (Current)</span><span style="color:${ORANGE};font-weight:700;font-size:18px;">${fmt$(petrolCost)}</span></div>
        <div class="table-row"><span class="table-row-label">EV (Grid Charging)</span><span class="table-row-value">${fmt$(gridCost)}</span></div>
        <div class="table-row"><span class="table-row-label">EV (Solar Charging)</span><span style="color:${AQUA};font-weight:700;font-size:18px;">${fmt$(solarCost)}</span></div>
        <div class="card aqua-b" style="margin-top:20px;text-align:center;padding:28px;">
          <div class="lbl">Annual Savings (Solar EV)</div>
          <div class="hero-num aqua" style="font-size:64px;">${fmt$(annualSavings)}</div>
        </div>
      </div>
      <div>
        <div class="insight-card">
          <div class="insight-card-title">Solar + EV Synergy</div>
          <p>Charging your EV from solar eliminates fuel costs entirely. With your ${fmtN(solarCost, 0) === '0' ? 'proposed' : 'existing'} solar system, you can charge your EV for free during daylight hours, saving ${fmt$(petrolCost - solarCost)} annually compared to petrol.</p>
        </div>
      </div>
    </div>
  `);
}

function genEVCharger(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const brand = (c.brand as string) || 'Zappi';
  const cost = (c.cost as number) || 2500;
  const features = (c.features as string[]) || [];

  return slideWrap(slide.id, `
    ${slideHeader('EV CHARGER RECOMMENDATION', 'Smart Home Charging Solution')}
    <div class="two-col">
      <div>
        <div class="card" style="text-align:center;padding:40px;margin-bottom:14px;">
          <div style="font-family:'NextSphere',sans-serif;font-size:64px;font-weight:800;color:${WHITE};">${brand}</div>
          <div class="lbl" style="margin-top:8px;">Recommended EV Charger</div>
          <div style="font-size:17px;color:${AQUA};margin-top:8px;">Smart Solar-Integrated Charging</div>
        </div>
        <div class="card aqua-b" style="text-align:center;padding:24px;">
          <div class="lbl">Installed Cost</div>
          <div class="hero-num orange" style="font-size:52px;">${fmt$(cost)}</div>
        </div>
      </div>
      <div>
        <div class="lbl" style="margin-bottom:16px;">Key Features</div>
        ${features.map(f => `<div class="check-item"><span class="check-tick">✓</span><span>${f}</span></div>`).join('')}
      </div>
    </div>
  `);
}

// ── SLIDE 18: POOL HEAT PUMP ──────────────────────────────────
function genPoolHeatPump(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  return slideWrap(slide.id, `
    ${slideHeader('POOL HEAT PUMP', 'Solar-Powered Pool Heating')}
    <div class="two-col">
      <div>
        <div class="insight-card">
          <div class="insight-card-title">Recommendation</div>
          <p>A solar-compatible pool heat pump eliminates gas pool heating costs while maintaining comfortable pool temperatures year-round. Run entirely from your solar system during daylight hours.</p>
        </div>
      </div>
      <div>
        <div class="card aqua-b" style="text-align:center;padding:32px;">
          <div class="lbl">Annual Savings</div>
          <div class="hero-num aqua" style="font-size:64px;">${fmt$((c.annualSavings as number) || 0)}</div>
        </div>
      </div>
    </div>
  `);
}

// ── SLIDE 19: ELECTRIFICATION INVESTMENT ─────────────────────
function genElectrificationInvestment(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const items = (c.investmentItems as Array<{name:string;cost:number;rebate:number;netCost:number;savings:number}>) || [];
  const totalCost = (c.totalCost as number) || 0;
  const totalRebates = (c.totalRebates as number) || 0;
  const netInvestment = (c.netInvestment as number) || 0;
  const totalSavings = (c.totalAnnualSavings as number) || 0;

  return slideWrap(slide.id, `
    ${slideHeader('FULL ELECTRIFICATION INVESTMENT', 'Complete Upgrade Summary')}
    <div class="two-col">
      <div>
        <table>
          <thead><tr><th>Item</th><th>Cost</th><th>Rebate</th><th>Net</th><th>Savings/yr</th></tr></thead>
          <tbody>
            ${items.map(item => `<tr>
              <td style="color:${WHITE};font-weight:600;">${item.name}</td>
              <td style="color:${ASH};">${fmt$(item.cost)}</td>
              <td style="color:${AQUA};">-${fmt$(item.rebate)}</td>
              <td style="color:${WHITE};font-weight:600;">${fmt$(item.netCost)}</td>
              <td style="color:${AQUA};font-weight:600;">${fmt$(item.savings)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div>
        <div class="card" style="margin-bottom:12px;">
          <div class="lbl">Total Investment</div>
          <div class="hero-num orange" style="font-size:52px;">${fmt$(totalCost)}</div>
        </div>
        <div class="card" style="margin-bottom:12px;">
          <div class="lbl">Total Rebates</div>
          <div class="hero-num aqua" style="font-size:52px;">-${fmt$(totalRebates)}</div>
        </div>
        <div class="card aqua-b" style="margin-bottom:12px;">
          <div class="lbl">Net Investment</div>
          <div class="hero-num white" style="font-size:52px;">${fmt$(netInvestment)}</div>
        </div>
        <div class="card" style="text-align:center;padding:24px;">
          <div class="lbl">Annual Savings</div>
          <div class="hero-num aqua" style="font-size:52px;">${fmt$(totalSavings)}</div>
        </div>
      </div>
    </div>
  `);
}

// ── SLIDE 20: SAVINGS SUMMARY ─────────────────────────────────
function genSavingsSummary(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const totalSavings = (c.totalAnnualSavings as number) || 0;
  const tenYrSavings = (c.tenYearSavings as number) || 0;
  const yr25Savings = (c.twentyFiveYearSavings as number) || 0;
  const vppProvider = (c.vppProvider as string) || 'VPP';

  // Build breakdown from individual savings values
  const electricitySavings = (c.electricitySavings as number) || 0;
  const vppValue = (c.vppAnnualValue as number) || 0;
  const gasValue = (c.gasAnnualCost as number) || 0;
  const evValue = (c.evAnnualSavings as number) || 0;
  const poolValue = (c.poolHeatPumpSavings as number) || 0;

  const categories: Array<{category: string; value: number; color: string}> = [
    { category: 'Electricity Bill Savings', value: electricitySavings, color: AQUA },
    { category: `${vppProvider} VPP Earnings`, value: vppValue, color: ORANGE },
    ...(gasValue > 0 ? [{ category: 'Gas Elimination Savings', value: gasValue, color: '#4A9EFF' }] : []),
    ...(evValue > 0 ? [{ category: 'EV Fuel Savings', value: evValue, color: '#9B59B6' }] : []),
    ...(poolValue > 0 ? [{ category: 'Pool Heat Pump Savings', value: poolValue, color: '#27AE60' }] : []),
  ].filter(cat => cat.value > 0);

  const displayTotal = categories.reduce((sum, cat) => sum + cat.value, 0) || totalSavings;

  return slideWrap(slide.id, `
    ${slideHeaderSmall('Financial Impact Analysis', 'ROI & PAYBACK', 'Investment Overview')}
    <div class="two-col">
      <div>
        <div class="lbl" style="margin-bottom:8px;">SYSTEM COST</div>
        <div class="card" style="margin-bottom:12px;padding:20px 24px;">
          <div class="hero-num white" style="font-size:52px;">${fmt$(c.netInvestment as number || 0)}</div>
          <div style="font-size:14px;color:${ASH};margin-top:4px;">After ${fmt$((c.totalRebates as number) || 0)} in rebates</div>
        </div>
        <div class="lbl" style="margin-bottom:8px;">PAYBACK PERIOD</div>
        <div class="card" style="margin-bottom:12px;padding:20px 24px;">
          <div class="hero-num aqua" style="font-size:52px;">${fmtN((c.paybackYears as number) || 0, 1)}<span style="font-size:20px;font-weight:400;"> YEARS</span></div>
          <div style="font-size:14px;color:${ASH};margin-top:4px;">Without VPP: ${fmtN(((c.paybackYears as number) || 0) + 1.5, 1)} years</div>
        </div>
        <div class="lbl" style="margin-bottom:8px;">25-YEAR ROI</div>
        <div class="card" style="padding:20px 24px;">
          <div class="hero-num orange" style="font-size:52px;">${Math.round(yr25Savings / Math.max((c.netInvestment as number) || 1, 1) * 100)}%</div>
          <div style="font-size:14px;color:${ASH};margin-top:4px;">Lifetime savings: ${fmt$(yr25Savings)}</div>
        </div>
      </div>
      <div>
        <div class="lbl" style="margin-bottom:16px;">ANNUAL BENEFIT BREAKDOWN</div>
        ${categories.map(cat => `
          <div style="margin-bottom:16px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
              <span style="font-size:15px;color:${WHITE};font-weight:600;">${cat.category}</span>
              <span style="font-family:'GeneralSans',sans-serif;font-size:18px;font-weight:700;color:${AQUA};">${fmt$(cat.value)}</span>
            </div>
            <div style="font-size:12px;color:${ASH};margin-bottom:4px;">${Math.round(cat.value/displayTotal*100)}% of total benefit</div>
            <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${Math.round(cat.value/displayTotal*100)}%;background:${cat.color};"></div></div>
          </div>
        `).join('')}
        <div class="card aqua-b" style="margin-top:20px;text-align:center;padding:24px;">
          <div class="lbl">TOTAL ANNUAL BENEFIT</div>
          <div class="hero-num aqua" style="font-size:64px;">${fmt$(displayTotal)}<span style="font-size:20px;font-weight:400;">/year</span></div>
        </div>
        <div style="font-size:12px;color:${ASH};margin-top:12px;font-style:italic;">Values are estimates based on current electricity rates and VPP program terms. Actual results may vary based on usage patterns, grid conditions, and program changes.</div>
      </div>
    </div>
  `);
}

// ── SLIDE 21: FINANCIAL SUMMARY ───────────────────────────────
function genFinancial(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const annualSavings = (c.annualSavings as number) || 0;
  const payback = (c.paybackYears as number) || 0;
  const netInvestment = (c.netInvestment as number) || 0;
  const rebates = (c.rebateAmount as number) || 0;
  const roi25 = (c.roi25Year as number) || Math.round(((c.twentyFiveYearSavings as number) || annualSavings * 25) / netInvestment * 100);
  const npv = (c.npv as number) || Math.round(annualSavings * 12.4 - netInvestment);
  const irr = (c.irr as number) || Math.round((annualSavings / netInvestment) * 100 * 1.1);
  const billPct = Math.round(annualSavings / ((c.currentAnnualCost as number) || annualSavings * 1.1) * 100);

  return slideWrap(slide.id, `
    ${slideHeaderSmall('Financial Impact', '25-Year Outlook', 'Investment Analysis')}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
      <div class="card" style="text-align:center;padding:40px 24px;">
        <div class="hero-num aqua" style="font-size:80px;">${fmt$(annualSavings)}</div>
        <div class="lbl" style="margin-top:8px;">Est. Annual Savings</div>
        <div style="font-size:15px;color:${ASH};margin-top:6px;">Day 1 Bill Reduction: ${billPct}%</div>
      </div>
      <div class="card" style="text-align:center;padding:40px 24px;">
        <div class="hero-num aqua" style="font-size:80px;">${Math.floor(payback)}–${Math.ceil(payback + 0.5)}</div>
        <div class="lbl" style="margin-top:8px;">Year Payback</div>
        <div style="font-size:15px;color:${ASH};margin-top:6px;">Tax-Free Return on Investment</div>
      </div>
    </div>
    <div class="card" style="display:grid;grid-template-columns:1fr 1px 1fr 1px 1fr;gap:0;padding:32px 0;">
      <div style="text-align:center;padding:0 24px;">
        <div class="hero-num aqua" style="font-size:60px;">${roi25}%</div>
        <div class="lbl" style="margin-top:8px;">Total ROI (25 Years)</div>
      </div>
      <div style="background:#4A6B8A;"></div>
      <div style="text-align:center;padding:0 24px;">
        <div class="hero-num aqua" style="font-size:60px;">${fmt$(npv > 0 ? npv : 0)}</div>
        <div class="lbl" style="margin-top:8px;">Net Present Value</div>
      </div>
      <div style="background:#4A6B8A;"></div>
      <div style="text-align:center;padding:0 24px;">
        <div class="hero-num aqua" style="font-size:60px;">${irr}%</div>
        <div class="lbl" style="margin-top:8px;">Internal Rate of Return</div>
      </div>
    </div>
    <div style="text-align:center;margin-top:20px;font-size:16px;font-style:italic;color:${ASH};">By leveraging battery storage for peak arbitrage and VPP participation, this system delivers returns that significantly exceed traditional investment vehicles.</div>
  `);
}

// ── SLIDE 22: ENVIRONMENTAL IMPACT ───────────────────────────
function genEnvironmental(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const co2Reduction = (c.co2ReductionTonnes as number) || 0;
  const trees = (c.treesEquivalent as number) || Math.round(co2Reduction * 45);
  const currentCo2 = (c.co2CurrentTonnes as number) || 0;
  const projectedCo2 = (c.co2ProjectedTonnes as number) || 0;
  const reductionPct = (c.co2ReductionPercent as number) || Math.round(co2Reduction / currentCo2 * 100);
  const energyScore = (c.energyIndependenceScore as number) || 85;

  return slideWrap(slide.id, `
    ${slideHeader('ENVIRONMENTAL IMPACT', 'Your Green Energy Contribution')}
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-bottom:24px;">
      <div class="card" style="text-align:center;padding:36px 24px;">
        <div class="hero-num aqua" style="font-size:64px;">${fmtN(co2Reduction, 1)}</div>
        <div class="lbl" style="margin-top:8px;">Tonnes CO₂ Saved/Year</div>
      </div>
      <div class="card" style="text-align:center;padding:36px 24px;">
        <div class="hero-num aqua" style="font-size:64px;">${fmtN(trees, 0)}</div>
        <div class="lbl" style="margin-top:8px;">Trees Equivalent/Year</div>
      </div>
      <div class="card" style="text-align:center;padding:36px 24px;">
        <div class="hero-num aqua" style="font-size:64px;">${reductionPct}%</div>
        <div class="lbl" style="margin-top:8px;">Carbon Footprint Reduction</div>
      </div>
    </div>
    <div class="two-col">
      <div>
        <div class="insight-card">
          <div class="insight-card-title">Carbon Reduction</div>
          <p>Your solar + battery system will reduce your household carbon footprint by <span style="color:${AQUA};font-weight:600;">${fmtN(co2Reduction, 1)} tonnes</span> of CO₂ per year — equivalent to planting <span style="color:${AQUA};font-weight:600;">${fmtN(trees, 0)} trees</span> annually. Over 25 years, this represents a ${fmtN(co2Reduction * 25, 0)}-tonne reduction.</p>
        </div>
      </div>
      <div>
        <div class="insight-card">
          <div class="insight-card-title">Energy Independence Score</div>
          <div style="font-family:'GeneralSans',sans-serif;font-size:48px;font-weight:700;color:${AQUA};margin:8px 0;">${energyScore}%</div>
          <p>Your system achieves ${energyScore}% energy independence, dramatically reducing reliance on the grid and protecting against future price increases.</p>
        </div>
      </div>
    </div>
  `);
}

// ── SLIDE 23: ROADMAP ─────────────────────────────────────────
function genRoadmap(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const steps = (c.steps as Array<{phase:string;title:string;timeline:string;description:string}>) || [
    { phase: '01', title: 'Site Assessment', timeline: 'Week 1', description: 'Professional site inspection, switchboard assessment, and system design.' },
    { phase: '02', title: 'System Design', timeline: 'Week 1-2', description: 'Custom solar + battery system design optimised for your property.' },
    { phase: '03', title: 'Approvals & Permits', timeline: 'Week 2-3', description: 'Grid connection application, council permits, and CEC accreditation.' },
    { phase: '04', title: 'Installation', timeline: 'Week 3-5', description: 'Professional installation by CEC-accredited installers.' },
    { phase: '05', title: 'Commissioning', timeline: 'Week 5-6', description: 'System testing, monitoring setup, and VPP registration.' },
  ];

  return slideWrap(slide.id, `
    ${slideHeader('RECOMMENDED ROADMAP', 'Your Path to Energy Independence')}
    <div class="two-col">
      <div>
        ${steps.map(s => `
          <div class="step-item">
            <div class="step-num">${s.phase}</div>
            <div>
              <div class="step-title">${s.title} <span style="font-size:14px;color:${ASH};font-weight:400;">— ${s.timeline}</span></div>
              <div class="step-desc">${s.description}</div>
            </div>
          </div>
        `).join('')}
      </div>
      <div>
        <div class="insight-card">
          <div class="insight-card-title">Timeline Summary</div>
          <p>From initial consultation to a fully operational solar + battery system in as little as <span style="color:${AQUA};font-weight:600;">4–6 weeks</span>. Our streamlined process handles all approvals, permits, and grid connections on your behalf.</p>
        </div>
        <div class="card aqua-b" style="margin-top:16px;text-align:center;padding:28px;">
          <div class="lbl">Installation Start</div>
          <div style="font-family:'NextSphere',sans-serif;font-size:48px;font-weight:800;color:${WHITE};">2–4 Weeks</div>
          <div style="font-size:14px;color:${ASH};margin-top:6px;">From signed agreement to installation</div>
        </div>
      </div>
    </div>
  `);
}

// ── SLIDE 24: CONCLUSION ──────────────────────────────────────
function genConclusion(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const annualSavings = (c.annualSavings as number) || 0;
  const payback = (c.paybackYears as number) || 0;
  const solarKw = (c.solarSizeKw as number) || 0;
  const batteryKwh = (c.batterySizeKwh as number) || 0;
  const yr25 = (c.twentyFiveYearSavings as number) || 0;

  return slideWrap(slide.id, `
    ${slideHeader('CONCLUSION', 'Your Energy Future Starts Today')}
    <div class="two-col">
      <div>
        <div class="insight-card" style="margin-bottom:14px;">
          <div class="insight-card-title">The Opportunity</div>
          <p>Your current energy costs represent a significant and growing financial burden. With electricity prices rising at 3.5% annually, inaction means paying substantially more each year. The time to act is now.</p>
        </div>
        <div class="insight-card" style="margin-bottom:14px;">
          <div class="insight-card-title">The Solution</div>
          <p>A ${fmtN(solarKw, 2)}kW solar + ${fmtN(batteryKwh, 1)}kWh battery system delivers <span style="color:${AQUA};font-weight:600;">${fmt$(annualSavings)}</span> in annual savings, a ${payback.toFixed(1)}-year payback, and <span style="color:${AQUA};font-weight:600;">${fmt$(yr25)}</span> in 25-year cumulative savings.</p>
        </div>
        <div class="insight-card">
          <div class="insight-card-title">The Decision</div>
          <p>This is not just an energy upgrade — it's a strategic financial investment in your property and future. Every month of delay costs you money. Take control of your energy future today.</p>
        </div>
      </div>
      <div>
        <div class="card aqua-b" style="text-align:center;padding:40px;margin-bottom:14px;">
          <div class="lbl">Annual Savings</div>
          <div class="hero-num aqua" style="font-size:72px;">${fmt$(annualSavings)}</div>
          <div style="font-size:15px;color:${ASH};margin-top:8px;">Starting from day one</div>
        </div>
        <div class="card" style="text-align:center;padding:32px;">
          <div class="lbl">25-Year Net Benefit</div>
          <div class="hero-num orange" style="font-size:64px;">${fmt$(yr25)}</div>
          <div style="font-size:15px;color:${ASH};margin-top:8px;">Tax-free return on investment</div>
        </div>
      </div>
    </div>
  `);
}

// ── SLIDE 25: CONTACT ─────────────────────────────────────────
function genContact(slide: SlideContent): string {
  return slideWrap(slide.id, `
    ${slideHeader('READY TO BEGIN YOUR SOLAR JOURNEY?', '')}
    <div class="two-col">
      <div>
        <div class="lbl" style="color:${AQUA};margin-bottom:20px;">Next Steps</div>
        <div class="next-step-box"><div class="next-step-num">01</div><div class="next-step-text">Schedule Site Assessment</div></div>
        <div class="next-step-box"><div class="next-step-num">02</div><div class="next-step-text">Receive Detailed System Design</div></div>
        <div class="next-step-box"><div class="next-step-num">03</div><div class="next-step-text">Review Financing Options</div></div>
        <div class="next-step-box"><div class="next-step-num">04</div><div class="next-step-text">Installation Within 2–4 Weeks</div></div>
      </div>
      <div>
        <div class="lbl" style="margin-bottom:16px;">Prepared By</div>
        <div style="font-family:'NextSphere',sans-serif;font-size:48px;font-weight:800;text-transform:uppercase;color:${WHITE};line-height:1.1;margin-bottom:10px;">George Fotopoulos</div>
        <div style="font-size:17px;color:${ASH};margin-bottom:4px;">Renewables Strategist &amp; Designer</div>
        <div style="font-size:17px;color:${AQUA};margin-bottom:24px;">Elite Smart Energy Solutions</div>
        <div class="contact-row"><span class="contact-icon">📍</span>Showroom 1, Waverley Road, Malvern East VIC 3145</div>
        <div class="contact-row"><span class="contact-icon">📞</span>0419 574 520</div>
        <div class="contact-row"><span class="contact-icon">✉</span>george.f@lightning-energy.com.au</div>
        <div class="contact-row"><span class="contact-icon">🌐</span>www.lightning-energy.com.au</div>
        <div style="margin-top:28px;">
          <img src="${LOGO_URL}" style="width:90px;height:90px;object-fit:contain;opacity:0.9;" alt="Elite Smart Energy" />
        </div>
      </div>
    </div>
  `);
}

// ── GENERIC FALLBACK ──────────────────────────────────────────
function genGeneric(slide: SlideContent): string {
  return slideWrap(slide.id, `
    ${slideHeader(slide.title.toUpperCase(), slide.subtitle || '')}
    <div style="display:flex;align-items:center;justify-content:center;height:60%;">
      <div style="font-family:'GeneralSans',sans-serif;font-size:24px;color:${ASH};">Content for this slide type is being prepared.</div>
    </div>
  `);
}

// ── MAIN EXPORT ───────────────────────────────────────────────
export function generateSlideHTML(slide: SlideContent): string {
  switch (slide.type) {
    case 'cover': return genCover(slide);
    case 'executive_summary': return genExecutiveSummary(slide);
    case 'bill_analysis': return genBillAnalysis(slide);
    case 'usage_analysis': return genUsageAnalysis(slide);
    case 'yearly_projection': return genYearlyProjection(slide);
    case 'gas_footprint': return genGasFootprint(slide);
    case 'gas_appliances': return genGasAppliances(slide);
    case 'strategic_assessment': return genStrategic(slide);
    case 'battery_recommendation': return genBattery(slide);
    case 'solar_system': return genSolar(slide);
    case 'vpp_comparison': return genVPPComparison(slide);
    case 'vpp_recommendation': return genVPPRecommendation(slide);
    case 'hot_water_electrification': return genHotWater(slide);
    case 'heating_cooling': return genHeatingCooling(slide);
    case 'induction_cooking': return genInduction(slide);
    case 'ev_analysis': return genEVAnalysis(slide);
    case 'ev_charger': return genEVCharger(slide);
    case 'pool_heat_pump': return genPoolHeatPump(slide);
    case 'electrification_investment': return genElectrificationInvestment(slide);
    case 'savings_summary': return genSavingsSummary(slide);
    case 'financial_summary': return genFinancial(slide);
    case 'environmental_impact': return genEnvironmental(slide);
    case 'roadmap': return genRoadmap(slide);
    case 'conclusion': return genConclusion(slide);
    case 'contact': return genContact(slide);
    default: return genGeneric(slide);
  }
}
