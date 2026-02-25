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
      totalAnnualBenefit: data.annualSavings,
      breakdown: [
        { category: 'Solar & Battery', value: Math.round((data.annualSavings - data.vppAnnualValue - (data.evAnnualSavings || 0)) * 1), color: 'aqua' },
        data.hasEV ? { category: 'EV Integration', value: data.evAnnualSavings || 0, color: 'white' } : null,
        { category: 'VPP Credits', value: data.vppAnnualValue, color: 'orange' },
        data.hasGas ? { category: 'Gas Elimination', value: data.gasAnnualCost || 0, color: 'orange' } : null,
      ].filter(Boolean) as Array<{ category: string; value: number; color: string }>,
      taxFree: true,
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
// HTML SLIDE GENERATORS - Matching Paul Stokes Best Example
// ============================================================

const SLIDE_STYLES = `
<style>
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,600;0,700;0,800;1,600&family=Open+Sans:wght@300;400;600&display=swap');
  
  * { margin: 0; padding: 0; box-sizing: border-box; }
  
  .slide {
    width: 1920px;
    height: 1080px;
    background: #0F172A;
    color: #FFFFFF;
    font-family: 'Open Sans', sans-serif;
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
    font-family: 'Montserrat', sans-serif;
    font-size: 64px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: #FFFFFF;
    line-height: 1.1;
  }
  
  .slide-subtitle {
    font-family: 'MontserratItalic', 'Montserrat', sans-serif;
    font-size: 22px;
    color: #46B446;
    font-style: italic;
    letter-spacing: 0.05em;
    text-align: right;
    white-space: nowrap;
  }
  
  /* Thin aqua line separator under heading */
  .aqua-line {
    width: 100%;
    height: 1px;
    background: #46B446;
    margin-bottom: 36px;
  }
  
  .logo {
    position: absolute;
    top: 40px;
    right: 60px;
    width: 60px;
    height: 60px;
  }
  
  /* Hero numbers - Open Sans for all numeric content */
  .hero-num {
    font-family: 'Open Sans', sans-serif;
    font-weight: 700;
    line-height: 1;
  }
  .hero-num.aqua { color: #46B446; }
  .hero-num.white { color: #FFFFFF; }
  .hero-num.orange { color: #46B446; }
  .hero-num .unit { font-family: 'Open Sans', sans-serif; font-weight: 400; }
  
  /* Labels */
  .lbl {
    font-family: 'Montserrat', sans-serif;
    font-size: 12px;
    color: #4A6B8A;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    margin-bottom: 6px;
  }
  
  /* Cards */
  .card {
    background: rgba(255,255,255,0.03);
    border: 1px solid #1B3A5C;
    border-radius: 8px;
    padding: 24px;
  }
  .card.aqua-b { border-color: #46B446; }
  .card.orange-b { border-color: #46B446; }
  .card.white-b { border-color: #FFFFFF; }
  
  /* Insight cards - dark grey bg with colored left border */
  .insight-card {
    background: #2C3E50;
    border-radius: 8px;
    padding: 24px 28px;
    border-left: 4px solid #46B446;
  }
  .insight-card.orange { border-left-color: #46B446; }
  .insight-card .insight-title {
    font-family: 'Montserrat', sans-serif;
    font-size: 18px;
    font-weight: 800;
    color: #46B446;
    text-transform: uppercase;
    margin-bottom: 10px;
  }
  .insight-card.orange .insight-title { color: #46B446; }
  .insight-card p { color: #4A6B8A; font-size: 14px; line-height: 1.6; }
  .insight-card .hl-aqua { color: #46B446; font-weight: 600; }
  .insight-card .hl-orange { color: #46B446; font-weight: 600; }
  .insight-card .hl-white { color: #FFFFFF; font-weight: 600; }
  
  /* Badges */
  .badge { display: inline-block; padding: 4px 14px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
  .badge.excellent { background: #46B446; color: #000; }
  .badge.good { background: #22c55e; color: #000; }
  .badge.moderate { background: #46B446; color: #000; }
  .badge.complex { background: #555; color: #fff; }
  .badge.high { background: #ef4444; color: #fff; }
  .badge.medium { background: #46B446; color: #000; }
  .badge.low { background: #22c55e; color: #000; }
  
  /* Tables */
  table { width: 100%; border-collapse: collapse; }
  th {
    font-family: 'Montserrat', sans-serif;
    font-size: 11px;
    color: #46B446;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    text-align: left;
    padding: 12px 16px;
    border-bottom: 1px solid #1B3A5C;
  }
  td { padding: 14px 16px; border-bottom: 1px solid #2C3E50; font-size: 15px; }
  .highlight-row { background: rgba(0, 234, 211, 0.06); border-left: 3px solid #46B446; }
  
  /* Colors */
  .aqua { color: #46B446; }
  .orange { color: #46B446; }
  .gray { color: #4A6B8A; }
  .white { color: #FFFFFF; }
  
  /* Copyright */
  .copyright {
    position: absolute;
    bottom: 28px;
    left: 80px;
    font-size: 11px;
    color: #4A6B8A;
    font-family: 'Open Sans', sans-serif;
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
    case 'financial_summary': content = genFinancial(slide); break;
    case 'environmental_impact': content = genEnvironmental(slide); break;
    case 'roadmap': content = genRoadmap(slide); break;
    case 'conclusion': content = genConclusion(slide); break;
    case 'contact': content = genContact(slide); break;
    default: content = genGeneric(slide);
  }
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${SLIDE_STYLES}</head><body>${content}</body></html>`;
}

// ---- SLIDE 1: COVER ----
function genCover(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const backdropUrl = BRAND.coverBg || 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/RcCbZwZNUIzvPlwn.jpg';
  return `
    <div class="slide" style="display: flex; flex-direction: column; justify-content: center; padding: 80px; position: relative; overflow: hidden; background: url('${backdropUrl}') center center / cover no-repeat;">
      <!-- Dark overlay for text legibility -->
      <div style="position: absolute; inset: 0; background: linear-gradient(135deg, rgba(15,23,42,0.88) 0%, rgba(15,23,42,0.65) 50%, rgba(15,23,42,0.45) 100%); z-index: 0;"></div>
      <div style="position: relative; z-index: 1; display: flex; flex-direction: column; height: 100%;">
      <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 48px;">
        <img src="${BRAND.logo.iconWhite}" style="width: 56px; height: 56px; filter: drop-shadow(0 0 12px rgba(70,180,70,0.6));" alt="Elite Smart Energy Solutions" />
        <div>
          <span style="font-family: 'Montserrat', sans-serif; font-size: 22px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.12em; display: block;">ELITE SMART ENERGY SOLUTIONS</span>
          <span style="font-family: 'Open Sans', sans-serif; font-size: 13px; color: #46B446; letter-spacing: 0.2em; text-transform: uppercase;">ELECTRIFICATION SPECIALISTS</span>
        </div>
      </div>
      <h1 style="font-family: 'Montserrat', sans-serif; font-size: 54px; font-weight: 800; color: #FFFFFF; text-transform: uppercase; line-height: 1.15; max-width: 820px; text-shadow: 0 2px 20px rgba(0,0,0,0.8);">IN-DEPTH BILL ANALYSIS &amp; SOLAR BATTERY PROPOSAL</h1>
      <div style="margin-top: auto; display: flex; align-items: flex-start; gap: 16px; padding-top: 40px;">
        <div style="width: 4px; height: 56px; background: #46B446; border-radius: 2px; flex-shrink: 0;"></div>
        <div>
          <p style="font-family: 'Montserrat', sans-serif; font-size: 20px; color: #FFFFFF; font-weight: 700;">${slide.title}</p>
          <p style="font-family: 'Open Sans', sans-serif; font-size: 15px; color: #CBD5E1;">${c.address}</p>
          <p style="font-family: 'Open Sans', sans-serif; font-size: 12px; color: #94A3B8; margin-top: 8px;">Prepared by ${c.preparedBy} | ${c.company}</p>
        </div>
      </div>
      <div style="margin-top: 24px; height: 2px; background: linear-gradient(90deg, #46B446 0%, rgba(70,180,70,0.2) 100%);"></div>
      </div>
    </div>
  `;
}

// ---- SLIDE 2: EXECUTIVE SUMMARY ----
function genExecutiveSummary(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  return `
    <div class="slide">
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
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
      <div class="insight-card" style="margin-top: 40px;">
        <p style="color: #FFFFFF; font-size: 15px; line-height: 1.7;">This comprehensive analysis evaluates your current energy expenditure and presents a tailored solar + battery solution designed to deliver <span class="hl-aqua">$${(c.totalAnnualSavings as number).toLocaleString()} in annual savings</span>. The proposed ${c.systemSize}kW solar system paired with a ${c.batterySize}kWh battery and ${c.vppProvider} VPP partnership achieves payback in <span class="hl-orange">${(c.paybackYears as number).toFixed(1)} years</span>.</p>
      </div>
      
    </div>
  `;
}

// ---- SLIDE 3: BILL ANALYSIS ----
function genBillAnalysis(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  return `
    <div class="slide">
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1.2;">
          <table>
            <tr><th>COMPONENT</th><th>DETAILS</th><th style="text-align: right; color: #46B446;">AMOUNT</th></tr>
            <tr><td>General Usage</td><td class="gray">${(c.annualCost as number / (c.usageRate as number / 100)).toFixed(0)} kWh @ $${(c.usageRate as number / 100).toFixed(4)}/kWh</td><td style="text-align: right; font-weight: 600;">$${Math.round(c.usageCost as number).toLocaleString()}</td></tr>
            <tr><td>Daily Supply Charge</td><td class="gray">365 days @ $${(c.supplyCharge as number / 100).toFixed(4)}/day</td><td style="text-align: right; font-weight: 600;">$${Math.round(c.supplyCost as number).toLocaleString()}</td></tr>
            <tr><td>Solar Feed-in Credit</td><td class="gray">@ ${c.feedInTariff}¢/kWh</td><td style="text-align: right; color: #46B446;">Credit</td></tr>
            <tr class="highlight-row"><td style="font-weight: 700; color: #46B446;">NET ANNUAL BILL</td><td></td><td style="text-align: right; font-weight: 700; color: #46B446; font-size: 20px;">$${(c.annualCost as number).toLocaleString()}</td></tr>
          </table>
        </div>
        <div style="flex: 0.8;">
          <div class="insight-card orange" style="margin-bottom: 24px;">
            <p class="insight-title">KEY INSIGHT</p>
            <p>Your current feed-in tariff of <span class="hl-aqua">${c.feedInTariff}¢/kWh</span> is significantly below the usage rate of <span class="hl-orange">${c.usageRate}¢/kWh</span>. Self-consumption with battery storage will capture the full value of your solar generation.</p>
          </div>
          <div style="display: flex; gap: 16px;">
            <div class="card" style="flex: 1; text-align: center;">
              <p class="lbl">USAGE RATE</p>
              <p style="font-size: 28px; color: #46B446; font-weight: 600;">${c.usageRate}¢</p>
              <p class="gray" style="font-size: 11px;">per kWh</p>
            </div>
            <div class="card" style="flex: 1; text-align: center;">
              <p class="lbl">FEED-IN</p>
              <p style="font-size: 28px; color: #46B446; font-weight: 600;">${c.feedInTariff}¢</p>
              <p class="gray" style="font-size: 11px;">per kWh</p>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  `;
}

// ---- SLIDE 4: USAGE ANALYSIS ----
function genUsageAnalysis(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const daily = c.dailyAverageKwh as number;
  const benchmarks = [
    { label: 'Your Usage', kwh: daily, color: '#46B446' },
    { label: 'Small Home', kwh: 7.49, color: '#333' },
    { label: 'Medium Home', kwh: 12.70, color: '#333' },
    { label: 'Large Home', kwh: 14.71, color: '#333' },
  ];
  const maxKwh = Math.max(...benchmarks.map(b => b.kwh), 16);
  return `
    <div class="slide">
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1.2;">
          <p class="lbl" style="margin-bottom: 16px;">DAILY ENERGY USAGE COMPARISON (kWh)</p>
          <div style="display: flex; align-items: flex-end; height: 320px; gap: 30px; padding: 0 20px;">
            ${benchmarks.map(b => `
              <div style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end;">
                <p style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: ${b.color === '#46B446' ? '#46B446' : '#FFFFFF'};">${b.kwh.toFixed(1)}</p>
                <div style="width: 100%; height: ${(b.kwh / maxKwh) * 260}px; background: ${b.color}; border-radius: 4px 4px 0 0;"></div>
                <p style="font-size: 11px; color: #4A6B8A; margin-top: 8px; text-align: center;">${b.label}</p>
              </div>
            `).join('')}
          </div>
        </div>
        <div style="flex: 0.8;">
          <p class="lbl" style="margin-bottom: 16px;">COMPARISON TABLE</p>
          ${benchmarks.map(b => `
            <div style="display: flex; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #2C3E50;">
              <span style="color: #4A6B8A;">${b.label}</span>
              <span style="font-weight: 600; color: ${b.color === '#46B446' ? '#46B446' : '#FFFFFF'};">${b.kwh.toFixed(2)} KWH</span>
            </div>
          `).join('')}
          <div class="insight-card orange" style="margin-top: 24px;">
            <p class="insight-title">EFFICIENCY INSIGHT</p>
            <p>Your daily usage of <span class="hl-aqua">${daily.toFixed(1)} kWh</span> is <span class="hl-orange">${Math.round((1 - daily / 12.7) * 100)}%</span> below the medium household average, indicating an energy-efficient home.</p>
          </div>
        </div>
      </div>
      
    </div>
  `;
}

// ---- SLIDE 5: YEARLY PROJECTION ----
function genYearlyProjection(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const projection = (c.yearlyProjection as Array<{ year: number; withoutSolar: number; withSolar: number; cumulativeSavings: number }>) || [];
  return `
    <div class="slide">
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1;">
          <table>
            <tr><th>PERIOD</th><th style="text-align: right;">GRID USAGE</th><th style="text-align: right;">SOLAR EXPORT</th><th style="text-align: right;">NET COST</th></tr>
            <tr><td>Monthly Avg</td><td style="text-align: right;">${Math.round((c.currentAnnualCost as number) / 12)} kWh</td><td style="text-align: right;">Est.</td><td style="text-align: right; font-weight: 600;">$${Math.round((c.currentAnnualCost as number) / 12).toLocaleString()}</td></tr>
            <tr><td>Annual Total</td><td style="text-align: right;">Est.</td><td style="text-align: right;">Est.</td><td style="text-align: right; font-weight: 600;">$${(c.currentAnnualCost as number).toLocaleString()}</td></tr>
          </table>
          <div class="insight-card" style="margin-top: 24px;">
            <p class="insight-title">KEY FINDING</p>
            <p>With the proposed system, your projected annual cost drops from <span class="hl-orange">$${(c.currentAnnualCost as number).toLocaleString()}</span> to <span class="hl-aqua">$${Math.round(c.projectedAnnualCost as number).toLocaleString()}</span>, delivering cumulative savings of <span class="hl-aqua">$${(c.tenYearSavings as number).toLocaleString()}</span> over 10 years.</p>
          </div>
        </div>
        <div style="flex: 1;">
          <p style="font-family: 'Montserrat', sans-serif; font-size: 18px; font-weight: 800; margin-bottom: 16px;">25-YEAR CUMULATIVE FINANCIAL OUTLOOK</p>
          <div style="height: 320px; position: relative; border-left: 1px solid #333; border-bottom: 1px solid #1B3A5C; padding: 10px;">
            ${projection.filter((_, i) => i % 5 === 0 || i === projection.length - 1).map((p, i, arr) => {
              const maxVal = (c.twentyFiveYearSavings as number) * 1.2;
              const x = (p.year / 25) * 100;
              const yOrange = 100 - ((p.withoutSolar * p.year * 0.5) / maxVal) * 100;
              const yAqua = 100 - (p.cumulativeSavings / maxVal) * 100;
              return `
                <div style="position: absolute; left: ${x}%; bottom: 0; width: 2px; height: 100%; border-left: 1px dashed #2C3E50;"></div>
                <div style="position: absolute; left: ${x}%; bottom: ${100 - yAqua}%; width: 8px; height: 8px; background: #46B446; border-radius: 50%; transform: translate(-4px, 4px);"></div>
                <div style="position: absolute; left: ${x}%; bottom: ${100 - yOrange}%; width: 8px; height: 8px; background: #46B446; border-radius: 50%; transform: translate(-4px, 4px);"></div>
              `;
            }).join('')}
          </div>
          <div style="display: flex; gap: 24px; margin-top: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 12px; height: 12px; background: #46B446; border-radius: 50%;"></div><span style="font-size: 11px; color: #4A6B8A;">Cumulative Bill Cost (Current)</span></div>
            <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 12px; height: 12px; background: #46B446; border-radius: 50%;"></div><span style="font-size: 11px; color: #4A6B8A;">Cumulative Total Benefit (Proposed)</span></div>
          </div>
        </div>
      </div>
      
    </div>
  `;
}

// ---- SLIDE 6: GAS FOOTPRINT ----
function genGasFootprint(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  return `
    <div class="slide">
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
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
            <p class="hero-num orange" style="font-size: 48px;">${(c.co2Emissions as number).toFixed(1)}<span style="font-size: 18px; color: #4A6B8A;"> tonnes/year</span></p>
          </div>
          <div class="insight-card">
            <p class="insight-title">ELECTRIFICATION OPPORTUNITY</p>
            <p>By replacing gas appliances with efficient electric alternatives, you can eliminate <span class="hl-orange">$${(c.annualCost as number).toLocaleString()}/year</span> in gas costs and <span class="hl-aqua">${(c.co2Emissions as number).toFixed(1)} tonnes</span> of CO2 emissions entirely.</p>
          </div>
        </div>
      </div>
      
    </div>
  `;
}

// ---- SLIDE 7: GAS APPLIANCES ----
function genGasAppliances(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const priorities = (c.electrificationPriority as Array<{ name: string; type: string; priority: string; savings: number }>) || [];
  return `
    <div class="slide">
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
      ${slideHeader(slide.title, slide.subtitle || '')}
      <table style="margin-top: 10px;">
        <tr><th>APPLIANCE</th><th>CURRENT TYPE</th><th>PRIORITY</th><th style="text-align: right;">EST. ANNUAL SAVINGS</th></tr>
        ${priorities.map(p => `
          <tr>
            <td style="font-weight: 600;">${p.name}</td>
            <td class="gray">${p.type}</td>
            <td><span class="badge ${p.priority.toLowerCase()}">${p.priority}</span></td>
            <td style="text-align: right; color: #46B446; font-weight: 600;">$${p.savings.toLocaleString()}</td>
          </tr>
        `).join('')}
      </table>
      <div class="insight-card" style="margin-top: 30px;">
        <p class="insight-title">TOTAL GAS ELIMINATION POTENTIAL</p>
        <p>Annual Gas Cost: <span class="hl-orange">$${(c.totalGasCost as number).toLocaleString()}</span> → <span class="hl-aqua">$0</span> through complete electrification of all gas appliances.</p>
      </div>
      
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
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 40px; margin-top: 10px;">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
            <span style="color: #46B446; font-size: 24px;">✓</span>
            <span style="font-family: 'Montserrat', sans-serif; font-size: 20px; font-weight: 800; color: #46B446;">KEY ADVANTAGES</span>
          </div>
          <div style="border-bottom: 2px solid #46B446; margin-bottom: 20px;"></div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            ${advantages.map(a => `
              <div>
                <p style="font-size: 20px; margin-bottom: 6px;">${a.icon}</p>
                <p style="font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 800; color: #FFFFFF; margin-bottom: 4px;">${a.title}</p>
                <p style="color: #4A6B8A; font-size: 12px; line-height: 1.5;">${a.description}</p>
              </div>
            `).join('')}
          </div>
        </div>
        <div style="width: 1px; background: #333;"></div>
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
            <span style="color: #46B446; font-size: 24px;">⚠</span>
            <span style="font-family: 'Montserrat', sans-serif; font-size: 20px; font-weight: 800; color: #46B446;">CONSIDERATIONS</span>
          </div>
          <div style="border-bottom: 2px solid #46B446; margin-bottom: 20px;"></div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            ${considerations.map(co => `
              <div>
                <p style="font-size: 20px; margin-bottom: 6px;">${co.icon}</p>
                <p style="font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 800; color: #FFFFFF; margin-bottom: 4px;">${co.title}</p>
                <p style="color: #4A6B8A; font-size: 12px; line-height: 1.5;">${co.description}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      
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
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1;">
          <div style="text-align: center; margin-bottom: 30px;">
            <p class="lbl">TOTAL USABLE CAPACITY</p>
            <p class="hero-num aqua" style="font-size: 96px;">${total}<span style="font-size: 28px; color: #FFFFFF;"> KWH</span></p>
          </div>
          <div style="display: flex; gap: 16px;">
            <div class="card" style="flex: 1; border-top: 3px solid #46B446;">
              <p class="lbl" style="color: #46B446;">INVERTER</p>
              <p style="font-size: 20px; font-weight: 600;">${c.inverterSize} KW ${c.inverterType}</p>
            </div>
            <div class="card" style="flex: 1; border-top: 3px solid #46B446;">
              <p class="lbl" style="color: #46B446;">MODULES</p>
              <p style="font-size: 20px; font-weight: 600;">${c.modules}</p>
            </div>
            <div class="card" style="flex: 1; border-top: 3px solid #46B446;">
              <p class="lbl" style="color: #46B446;">TECHNOLOGY</p>
              <p style="font-size: 20px; font-weight: 600;">${c.technology}</p>
            </div>
          </div>
        </div>
        <div style="flex: 1;">
          <p style="font-family: 'Montserrat', sans-serif; font-size: 18px; font-weight: 800; margin-bottom: 20px;">WHY THIS CAPACITY?</p>
          <div style="display: flex; height: 44px; border-radius: 6px; overflow: hidden; margin-bottom: 16px;">
            <div style="width: ${(cap.home / total) * 100}%; background: #4A6B8A; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600;">HOME ~${cap.home.toFixed(0)}kWh</div>
            ${cap.evCharge > 0 ? `<div style="width: ${(cap.evCharge / total) * 100}%; background: #46B446; color: #000; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600;">EV CHARGE ~${cap.evCharge}kWh</div>` : ''}
            <div style="width: ${(cap.vppTrade / total) * 100}%; background: #46B446; color: #000; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600;">VPP TRADE ~${cap.vppTrade.toFixed(0)}kWh</div>
          </div>
          <div style="display: flex; gap: 20px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 6px;"><div style="width: 10px; height: 10px; background: #4A6B8A; border-radius: 50%;"></div><span style="font-size: 11px; color: #4A6B8A;">Home Overnight</span></div>
            ${cap.evCharge > 0 ? `<div style="display: flex; align-items: center; gap: 6px;"><div style="width: 10px; height: 10px; background: #46B446; border-radius: 50%;"></div><span style="font-size: 11px; color: #4A6B8A;">EV Charging</span></div>` : ''}
            <div style="display: flex; align-items: center; gap: 6px;"><div style="width: 10px; height: 10px; background: #46B446; border-radius: 50%;"></div><span style="font-size: 11px; color: #4A6B8A;">VPP Trading</span></div>
          </div>
          <p style="color: #4A6B8A; font-size: 14px; line-height: 1.6;">${c.explanation}</p>
        </div>
      </div>
      
    </div>
  `;
}

// ---- SLIDE 10: SOLAR SYSTEM ----
function genSolar(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const features = c.features as Array<{ icon: string; title: string; description: string }>;
  return `
    <div class="slide">
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 30px; margin-top: 10px;">
        <div class="card" style="flex: 1; text-align: center; padding: 30px;">
          <p class="lbl">SYSTEM SIZE</p>
          <p class="hero-num white" style="font-size: 72px;">${c.systemSize}<span style="font-size: 20px; color: #4A6B8A;"> KW</span></p>
        </div>
        <div class="card" style="flex: 1; text-align: center; padding: 30px;">
          <p class="lbl">PANEL COUNT</p>
          <p class="hero-num white" style="font-size: 72px;">${c.panelCount}<span style="font-size: 20px; color: #46B446;"> UNITS</span></p>
        </div>
        <div class="card orange-b" style="flex: 1; text-align: center; padding: 30px; background: rgba(232,115,26,0.05);">
          <p class="lbl" style="color: #46B446;">HARDWARE TECHNOLOGY</p>
          <p class="hero-num orange" style="font-size: 72px;">${c.panelPower}<span style="font-size: 20px; color: #4A6B8A;"> W</span></p>
          <p class="gray" style="font-size: 13px; margin-top: 8px;">${c.panelBrand}</p>
        </div>
      </div>
      <div style="display: flex; gap: 30px; margin-top: 24px;">
        <div class="insight-card" style="flex: 1;">
          <p class="insight-title">WHY ${(c.panelBrand as string).split(' ')[0].toUpperCase()}?</p>
          <p>${c.whyThisBrand}</p>
        </div>
        <div style="flex: 1;">
          <p style="font-family: 'Montserrat', sans-serif; font-size: 16px; font-weight: 800; color: #46B446; margin-bottom: 16px;">PERFORMANCE & WARRANTY</p>
          ${features.map(f => `
            <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 14px;">
              <span style="color: #46B446; font-size: 10px; margin-top: 4px;">●</span>
              <div>
                <p style="font-weight: 600; font-size: 14px;">${f.title}</p>
                <p style="color: #4A6B8A; font-size: 12px;">${f.description}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
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
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
      ${slideHeader(slide.title, slide.subtitle || '')}
      <table style="margin-top: 10px;">
        <tr><th>PROVIDER</th><th>VPP MODEL</th><th>GAS BUNDLE</th><th>EST. ANNUAL VALUE</th><th>STRATEGIC FIT</th></tr>
        ${providers.map(p => `
          <tr class="${p.provider === rec ? 'highlight-row' : ''}">
            <td style="font-weight: 600;">${p.provider}${p.provider === rec ? '<br/><span style="color: #46B446; font-size: 11px;">Recommended</span>' : ''}</td>
            <td><span style="color: #46B446;">${p.program}</span></td>
            <td>${p.gasBundle ? '<span style="color: #46B446;">✓ Yes</span>' : '<span class="gray">✗ No</span>'}</td>
            <td style="font-weight: 600;">${p.annualValue}</td>
            <td><span class="badge ${p.strategicFit.toLowerCase()}">${p.strategicFit}</span></td>
          </tr>
        `).join('')}
      </table>
      
    </div>
  `;
}

// ---- SLIDE 12: VPP RECOMMENDATION ----
function genVPPRecommendation(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const features = c.features as Array<{ icon: string; title: string; description: string }>;
  return `
    <div class="slide">
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="text-align: center; margin-top: 20px;">
        <p class="lbl">SELECTED PARTNER</p>
        <p style="font-family: 'Montserrat', sans-serif; font-size: 72px; font-weight: 800; margin: 10px 0;">${c.provider}</p>
        <p style="color: #46B446; font-size: 22px; font-family: 'Montserrat', sans-serif;">${c.program}</p>
      </div>
      <div style="display: flex; gap: 24px; margin-top: 36px;">
        ${features.map(f => `
          <div class="card" style="flex: 1; text-align: center; border-top: 3px solid #46B446;">
            <p style="color: #46B446; font-size: 28px; margin-bottom: 12px;">${f.icon}</p>
            <p style="font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 800; margin-bottom: 8px;">${f.title}</p>
            <p style="color: #4A6B8A; font-size: 13px; line-height: 1.5;">${f.description}</p>
          </div>
        `).join('')}
      </div>
      <div style="display: flex; align-items: center; gap: 20px; margin-top: 36px;">
        <div style="width: 4px; height: 60px; background: #46B446; border-radius: 2px;"></div>
        <div>
          <p class="lbl">Estimated Annual Value (Credits + Bundle Savings)</p>
          <p class="hero-num aqua" style="font-size: 64px;">~$${c.annualValue}<span style="font-size: 22px;"> / YEAR</span></p>
        </div>
      </div>
      
    </div>
  `;
}

// ---- SLIDE 13-15: ELECTRIFICATION SLIDES (Hot Water, Heating, Induction) ----
function genElectrificationSlide(slide: SlideContent, type: string): string {
  const c = slide.content as Record<string, unknown>;
  const features = (c.features as string[]) || [];
  return `
    <div class="slide">
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1;">
          <div class="card" style="margin-bottom: 20px;">
            <p class="lbl">CURRENT SYSTEM</p>
            <p style="font-size: 22px; color: #46B446; font-weight: 600;">${c.currentSystem}</p>
            <p class="gray" style="margin-top: 8px;">Annual Cost: <span class="orange">$${c[type === 'hot_water' ? 'annualGasCost' : type === 'heating' ? 'annualGasCost' : 'annualGasCost']}/year</span></p>
          </div>
          <div class="card aqua-b">
            <p class="lbl" style="color: #46B446;">RECOMMENDED UPGRADE</p>
            <p style="font-size: 22px; font-weight: 600;">${c.recommendedSystem}</p>
            ${c.cop ? `<p style="color: #46B446; margin-top: 8px;">COP: ${c.cop} (${c.cop}x more efficient)</p>` : ''}
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
                <p class="lbl" style="color: #46B446;">REBATES</p>
                <p style="font-size: 20px; color: #46B446;">-$${(c.rebates as number).toLocaleString()}</p>
              </div>
              <div class="card aqua-b" style="flex: 1; text-align: center;">
                <p class="lbl">NET COST</p>
                <p style="font-size: 20px;">$${(c.netCost as number).toLocaleString()}</p>
              </div>
            ` : ''}
          </div>
          ${features.length > 0 ? `
            <p class="lbl" style="margin-bottom: 10px;">KEY BENEFITS</p>
            ${features.map(f => `<p style="color: #4A6B8A; font-size: 13px; margin-bottom: 6px;">✓ ${f}</p>`).join('')}
          ` : ''}
        </div>
      </div>
      
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
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1;">
          <table>
            <tr><th>VEHICLE TYPE</th><th style="text-align: right;">COST / 100KM</th><th style="text-align: right;">ANNUAL COST</th></tr>
            ${comparison.map((comp, i) => `
              <tr class="${i === 2 ? 'highlight-row' : ''}">
                <td>${comp.scenario}</td>
                <td style="text-align: right; color: ${i === 0 ? '#46B446' : i === 1 ? '#FFFFFF' : '#46B446'}; font-weight: 600;">$${comp.costPer100km.toFixed(2)}</td>
                <td style="text-align: right; color: ${i === 0 ? '#46B446' : i === 1 ? '#FFFFFF' : '#46B446'}; font-weight: 600;">$${comp.annualCost.toLocaleString()}</td>
              </tr>
            `).join('')}
          </table>
        </div>
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 30px;">
            <div style="width: 4px; height: 60px; background: #46B446; border-radius: 2px;"></div>
            <div>
              <p class="lbl" style="color: #46B446;">POTENTIAL ANNUAL SAVINGS</p>
              <p class="hero-num white" style="font-size: 64px;">$${(c.annualSavings as number).toLocaleString()}</p>
            </div>
          </div>
          <div class="insight-card">
            <p style="color: #4A6B8A; font-size: 14px; line-height: 1.6;">Solar-charged EV driving eliminates fuel costs entirely. With your proposed solar system, every kilometre driven is effectively <span class="hl-aqua">free</span>.</p>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; margin-top: 20px;">
            <span style="color: #22c55e;">🌿</span>
            <p class="gray" style="font-size: 13px;">Environmental Impact: Avoid <span class="hl-aqua">${(c.co2Avoided as number).toFixed(1)} tonnes</span> of CO2 emissions annually.</p>
          </div>
        </div>
      </div>
      
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
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1;">
          <div class="card aqua-b" style="margin-bottom: 20px;">
            <p class="lbl" style="color: #46B446;">RECOMMENDED CHARGER</p>
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
          ${features.map(f => `<p style="color: #4A6B8A; font-size: 13px; margin-bottom: 8px;">✓ ${f}</p>`).join('')}
          <p class="lbl" style="margin-top: 24px; margin-bottom: 14px; color: #46B446;">SOLAR CHARGING BENEFITS</p>
          ${benefits.map(b => `<p style="color: #46B446; font-size: 13px; margin-bottom: 8px;">⚡ ${b}</p>`).join('')}
        </div>
      </div>
      
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
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1.2;">
          <table>
            <tr><th>UPGRADE ITEM</th><th style="text-align: right;">COST</th><th style="text-align: right;">REBATE</th><th style="text-align: right;">NET</th></tr>
            ${items.map(item => `
              <tr>
                <td>${item.item}</td>
                <td style="text-align: right;">$${item.cost.toLocaleString()}</td>
                <td style="text-align: right; color: #46B446;">-$${item.rebate.toLocaleString()}</td>
                <td style="text-align: right; font-weight: 600;">$${(item.cost - item.rebate).toLocaleString()}</td>
              </tr>
            `).join('')}
            <tr class="highlight-row">
              <td style="font-weight: 700;">TOTAL</td>
              <td style="text-align: right; font-weight: 700;">$${(c.totalCost as number).toLocaleString()}</td>
              <td style="text-align: right; color: #46B446; font-weight: 700;">-$${(c.totalRebates as number).toLocaleString()}</td>
              <td style="text-align: right; font-weight: 700;">$${(c.netInvestment as number).toLocaleString()}</td>
            </tr>
          </table>
        </div>
        <div style="flex: 0.8;">
          <div class="card aqua-b" style="text-align: center; margin-bottom: 20px; padding: 30px;">
            <p class="lbl" style="color: #46B446;">ANNUAL GAS SAVINGS</p>
            <p class="hero-num aqua" style="font-size: 56px;">$${(c.annualGasSavings as number).toLocaleString()}</p>
          </div>
          <div class="card" style="text-align: center;">
            <p class="lbl">GAS SUPPLY CHARGE SAVED</p>
            <p style="font-size: 28px; color: #46B446; font-weight: 600;">$${Math.round(c.gasSupplyChargeSaved as number).toLocaleString()}/year</p>
          </div>
        </div>
      </div>
      
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
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1;">
          <div style="height: 380px; display: flex; align-items: flex-end; justify-content: center;">
            <div style="width: 200px; display: flex; flex-direction: column;">
              ${breakdown.map(b => {
                const col = b.color === 'aqua' ? '#46B446' : b.color === 'orange' ? '#46B446' : '#FFFFFF';
                return `<div style="height: ${(b.value / total) * 300}px; background: ${col}; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #000; font-weight: 600;">${b.category}</div>`;
              }).join('')}
            </div>
          </div>
          <div style="display: flex; gap: 16px; margin-top: 16px; justify-content: center;">
            ${breakdown.map(b => {
              const col = b.color === 'aqua' ? '#46B446' : b.color === 'orange' ? '#46B446' : '#FFFFFF';
              return `<div style="display: flex; align-items: center; gap: 6px;"><div style="width: 12px; height: 12px; background: ${col};"></div><span style="font-size: 11px; color: #4A6B8A;">${b.category}</span></div>`;
            }).join('')}
          </div>
        </div>
        <div style="flex: 1;">
          <div class="card aqua-b" style="text-align: center; padding: 36px; margin-bottom: 24px;">
            <p class="lbl" style="color: #46B446;">TOTAL ANNUAL BENEFIT</p>
            <p class="hero-num white" style="font-size: 80px;">$${total.toLocaleString()}</p>
            <p class="gray" style="margin-top: 8px;">Tax-Free Savings</p>
          </div>
          ${breakdown.map(b => {
            const col = b.color === 'aqua' ? '#46B446' : b.color === 'orange' ? '#46B446' : '#FFFFFF';
            return `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #2C3E50;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="width: 14px; height: 14px; background: ${col};"></div>
                  <span>${b.category}</span>
                </div>
                <span style="font-weight: 600;">$${b.value.toLocaleString()}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      
    </div>
  `;
}

// ---- SLIDE 21: FINANCIAL SUMMARY ----
function genFinancial(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  return `
    <div class="slide">
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1;">
          <p class="lbl" style="margin-bottom: 16px;">INVESTMENT BREAKDOWN</p>
          <div style="display: flex; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #1B3A5C;">
            <span>Solar & Battery System</span>
            <span style="font-weight: 600; font-style: italic;">$${(c.systemCost as number).toLocaleString()}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #1B3A5C;">
            <span>Govt. Rebates & Incentives</span>
            <span style="font-weight: 600; color: #46B446; font-style: italic;">-$${(c.rebates as number).toLocaleString()}</span>
          </div>
          <div class="card orange-b" style="margin-top: 20px; padding: 30px;">
            <p class="lbl" style="color: #46B446;">NET INVESTMENT</p>
            <p class="hero-num white" style="font-size: 64px;">$${(c.netInvestment as number).toLocaleString()}</p>
            <p class="gray" style="font-size: 13px; margin-top: 8px;">Fully Installed (Inc. GST)</p>
          </div>
        </div>
        <div style="flex: 1;">
          <p class="lbl" style="margin-bottom: 16px;">PROJECTED RETURNS</p>
          <div style="display: flex; gap: 16px; margin-bottom: 20px;">
            <div class="card aqua-b" style="flex: 1; text-align: center; padding: 24px;">
              <p class="lbl" style="color: #46B446;">ANNUAL BENEFIT</p>
              <p style="font-size: 36px; font-weight: 700;">$${(c.annualBenefit as number).toLocaleString()}</p>
              <p class="gray" style="font-size: 11px;">Combined Savings & Income</p>
            </div>
            <div class="card aqua-b" style="flex: 1; text-align: center; padding: 24px;">
              <p class="lbl" style="color: #46B446;">PAYBACK PERIOD</p>
              <p style="font-size: 36px; font-weight: 700;">${(c.paybackYears as number).toFixed(1)} YRS</p>
              <p class="gray" style="font-size: 11px;">Accelerated by ${c.acceleratedBy}</p>
            </div>
          </div>
          <div class="card" style="text-align: center; padding: 24px;">
            <p style="font-family: 'Montserrat', sans-serif; font-size: 22px; font-weight: 800;">10-YEAR TOTAL SAVINGS: <span class="aqua">~$${(c.tenYearSavings as number).toLocaleString()}</span></p>
          </div>
        </div>
      </div>
      
    </div>
  `;
}

// ---- SLIDE 22: ENVIRONMENTAL IMPACT ----
function genEnvironmental(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  return `
    <div class="slide">
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
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
              <p style="font-size: 32px; color: #46B446; font-weight: 600;">${c.treesEquivalent}</p>
              <p class="gray" style="font-size: 11px;">trees/year</p>
            </div>
            <div class="card" style="text-align: center; padding: 24px;">
              <p class="lbl">CARS OFF ROAD</p>
              <p style="font-size: 32px; color: #46B446; font-weight: 600;">${c.carsOffRoad}</p>
              <p class="gray" style="font-size: 11px;">equivalent</p>
            </div>
          </div>
        </div>
        <div style="flex: 1;">
          <div class="card aqua-b" style="text-align: center; margin-bottom: 24px; padding: 30px;">
            <p class="lbl">ENERGY INDEPENDENCE SCORE</p>
            <p class="hero-num aqua" style="font-size: 72px;">${c.energyIndependenceScore}%</p>
          </div>
          ${(c.benefits as Array<{ icon: string; title: string; description: string }>).map(b => `
            <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px;">
              <span style="font-size: 22px;">${b.icon}</span>
              <div>
                <p style="font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 800; text-transform: uppercase;">${b.title}</p>
                <p style="color: #4A6B8A; font-size: 12px;">${b.description}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
    </div>
  `;
}

// ---- SLIDE 23: ROADMAP ----
function genRoadmap(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const steps = c.steps as Array<{ number: string; title: string; description: string; timeline: string; color: string }>;
  return `
    <div class="slide">
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; align-items: center; margin: 20px 0 30px; padding: 0 40px;">
        ${steps.map((s, i) => `
          <div style="display: flex; align-items: center;">
            <div style="width: 20px; height: 20px; border-radius: 50%; background: ${s.color === 'aqua' ? '#46B446' : '#46B446'};"></div>
            ${i < steps.length - 1 ? `<div style="width: ${800 / steps.length}px; height: 2px; background: linear-gradient(to right, ${s.color === 'aqua' ? '#46B446' : '#46B446'}, ${steps[i + 1].color === 'aqua' ? '#46B446' : '#46B446'});"></div>` : ''}
          </div>
        `).join('')}
      </div>
      <div style="display: flex; gap: 16px;">
        ${steps.map(s => `
          <div class="card" style="flex: 1; border-top: 3px solid ${s.color === 'aqua' ? '#46B446' : '#46B446'};">
            <p style="font-size: 40px; color: #333; font-weight: 800; font-family: 'Montserrat', sans-serif;">${s.number}</p>
            <p style="font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 800; color: ${s.color === 'aqua' ? '#FFFFFF' : '#46B446'}; margin: 10px 0; text-transform: uppercase;">${s.title}</p>
            <p style="color: #4A6B8A; font-size: 12px; line-height: 1.5; margin-bottom: 14px;">${s.description}</p>
            <p style="color: ${s.color === 'aqua' ? '#46B446' : '#46B446'}; font-size: 12px; font-family: 'Montserrat', sans-serif;">⏱ ${s.timeline}</p>
          </div>
        `).join('')}
      </div>
      
    </div>
  `;
}

// ---- SLIDE 24: CONCLUSION ----
function genConclusion(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const features = c.features as Array<{ icon: string; title: string; description: string; border: string }>;
  return `
    <div class="slide">
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="display: flex; gap: 24px; margin-top: 10px;">
        ${features.map(f => {
          const borderCol = f.border === 'aqua' ? '#46B446' : f.border === 'orange' ? '#46B446' : '#FFFFFF';
          const iconCol = f.border === 'aqua' ? '#46B446' : f.border === 'orange' ? '#46B446' : '#FFFFFF';
          return `
            <div class="card" style="flex: 1; text-align: center; border-top: 3px solid ${borderCol}; padding: 30px;">
              <p style="color: ${iconCol}; font-size: 36px; margin-bottom: 14px;">${f.icon}</p>
              <p style="font-family: 'Montserrat', sans-serif; font-size: 16px; font-weight: 800; color: ${f.border === 'orange' ? '#46B446' : '#FFFFFF'}; margin-bottom: 12px;">${f.title}</p>
              <p style="color: #4A6B8A; font-size: 13px; line-height: 1.6;">${f.description}</p>
            </div>
          `;
        }).join('')}
      </div>
      <div style="text-align: center; margin-top: 40px;">
        <p style="font-family: 'Montserrat', sans-serif; font-size: 28px; font-weight: 800; line-height: 1.4; max-width: 1200px; margin: 0 auto;">${c.quote}</p>
        <div style="width: 200px; height: 2px; background: #46B446; margin: 24px auto;"></div>
        <p style="color: #46B446; font-size: 18px; font-family: 'Montserrat', sans-serif;">${c.callToAction}</p>
      </div>
      
    </div>
  `;
}

// ---- SLIDE 25: CONTACT ----
function genContact(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const nextSteps = (c.nextSteps as string[]) || [];
  return `
    <div class="slide" style="display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
      <img src="${c.logoUrl}" style="width: 100px; height: 100px; margin-bottom: 30px;" alt="Elite Smart Energy Solutions" />
      <h1 class="slide-title" style="font-size: 64px; margin-bottom: 16px;">${slide.title}</h1>
      <p class="slide-subtitle" style="font-size: 24px; margin-bottom: 40px; text-align: center;">${slide.subtitle}</p>
      <div style="display: flex; gap: 60px; margin-bottom: 36px;">
        <div style="text-align: left;">
          <p class="lbl" style="margin-bottom: 8px;">PREPARED BY</p>
          <p style="font-size: 22px; font-weight: 600;">${c.preparedBy}</p>
          <p style="color: #46B446; font-family: 'Montserrat', sans-serif;">${c.title}</p>
          <p class="gray" style="margin-top: 8px;">${c.company}</p>
        </div>
        <div style="text-align: left;">
          <p class="lbl" style="margin-bottom: 8px;">CONTACT</p>
          <p class="gray">📞 ${c.phone}</p>
          <p class="gray">✉️ ${c.email}</p>
          <p style="color: #46B446;">🌐 ${c.website}</p>
        </div>
        <div style="text-align: left;">
          <p class="lbl" style="margin-bottom: 8px;">LOCATION</p>
          <p class="gray">${c.address}</p>
        </div>
      </div>
      <div class="card aqua-b" style="max-width: 800px; text-align: left; padding: 28px;">
        <p class="lbl" style="color: #46B446; margin-bottom: 14px;">YOUR NEXT STEPS</p>
        ${nextSteps.map((step, i) => `
          <p style="font-size: 15px; margin-bottom: 10px;">
            <span style="color: #46B446; font-weight: 700;">${i + 1}.</span> ${step}
          </p>
        `).join('')}
      </div>
      
    </div>
  `;
}

// ---- GENERIC FALLBACK ----
function genGeneric(slide: SlideContent): string {
  return `
    <div class="slide">
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
      ${slideHeader(slide.title, slide.subtitle || '')}
      <div style="margin-top: 20px;">
        <pre style="color: #4A6B8A; font-size: 13px; white-space: pre-wrap;">${JSON.stringify(slide.content, null, 2)}</pre>
      </div>
      
    </div>
  `;
}
