// Lightning Energy Professional Slide Generator
// Matches exact design from Paul Stokes SA proposal example

import { BRAND } from '../shared/brand';

export interface ProposalData {
  // Customer Info
  customerName: string;
  address: string;
  state: string;
  
  // Bill Data
  retailer: string;
  dailyUsageKwh: number;
  annualUsageKwh: number;
  supplyChargeCentsPerDay: number;
  usageRateCentsPerKwh: number;
  feedInTariffCentsPerKwh: number;
  controlledLoadRateCentsPerKwh?: number;
  annualCost: number;
  monthlyUsageData?: { month: string; kwh: number; cost: number }[];
  
  // Gas Data (optional)
  hasGas: boolean;
  gasAnnualMJ?: number;
  gasAnnualCost?: number;
  gasDailySupplyCharge?: number;
  gasUsageRate?: number;
  gasCO2Emissions?: number;
  
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
  
  // EV (optional)
  hasEV: boolean;
  evAnnualKm?: number;
  evAnnualSavings?: number;
  evChargerCost?: number;
  evChargerBrand?: string;
  
  // Electrification (optional)
  hasPoolPump: boolean;
  poolPumpSavings?: number;
  poolHeatPumpCost?: number;
  poolHeatPumpBrand?: string;
  hasHeatPump: boolean;
  heatPumpSavings?: number;
  heatPumpCost?: number;
  heatPumpBrand?: string;
  
  // Heating & Cooling
  heatingCoolingSavings?: number;
  heatingCoolingCost?: number;
  acBrand?: string;
  
  // Induction Cooking
  inductionSavings?: number;
  inductionCost?: number;
  inductionBrand?: string;
  
  // Full Electrification Investment
  electrificationTotalCost?: number;
  electrificationTotalRebates?: number;
  electrificationNetCost?: number;
  
  // Environmental
  co2ReductionTonnes: number;
  treesEquivalent?: number;
  energyIndependenceScore?: number;
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
      logoUrl: BRAND.logo.aqua,
      date: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }),
    }
  });
  
  // Slide 2: Executive Summary
  slides.push({
    id: slideId++,
    type: 'executive_summary',
    title: 'EXECUTIVE SUMMARY',
    subtitle: 'Key Metrics at a Glance',
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
    subtitle: 'Consumption Patterns',
    content: {
      annualUsageKwh: data.annualUsageKwh,
      dailyAverageKwh: data.dailyUsageKwh,
      monthlyAverageKwh: data.annualUsageKwh / 12,
      peakMonth: findPeakMonth(data.monthlyUsageData),
      monthlyData: data.monthlyUsageData || [],
    }
  });
  
  // Slide 5: Yearly Cost Projection
  slides.push({
    id: slideId++,
    type: 'yearly_projection',
    title: 'YEARLY COST PROJECTION',
    subtitle: '25-Year Cumulative Outlook',
    content: {
      currentAnnualCost: data.annualCost,
      projectedAnnualCost: data.annualCost - data.annualSavings,
      tenYearSavings: data.tenYearSavings,
      twentyFiveYearSavings: data.twentyFiveYearSavings || data.annualSavings * 25,
      inflationRate: 3.5,
      yearlyProjection: generateYearlyProjection(data.annualCost, data.annualSavings, 25),
    }
  });
  
  // Slide 6: Current Gas Footprint (CONDITIONAL - only if gas bill provided)
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
  
  // Slide 7: Gas Appliance Inventory (CONDITIONAL - only if gas appliances data)
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
    subtitle: 'Pros & Cons of Solar Battery Investment',
    content: {
      advantages: [
        { icon: 'zap', title: 'ENERGY INDEPENDENCE', description: 'Reduce grid reliance from 100% to near-zero during outages.' },
        { icon: 'dollar', title: 'VPP INCOME', description: `Earn $${data.vppAnnualValue}-${data.vppAnnualValue + 150}/year through Virtual Power Plant participation.` },
        { icon: 'car', title: 'FUTURE-PROOFING', description: 'Ready for EV charging and time-of-use tariffs.' },
        { icon: 'trending-up', title: 'PEAK SHIFTING', description: 'Store cheap solar energy for expensive peak periods (6-9pm).' },
        { icon: 'shield', title: 'BLACKOUT PROTECTION', description: `Partial home backup with ${data.batteryBrand} system.` },
        { icon: 'leaf', title: 'ENVIRONMENTAL', description: `Reduce ${data.co2ReductionTonnes.toFixed(1)} tonnes CO2 annually.` },
      ],
      considerations: [
        { icon: 'dollar-sign', title: 'UPFRONT COST', description: `$${data.netInvestment.toLocaleString()} investment (after rebates).` },
        { icon: 'hourglass', title: 'PAYBACK PERIOD', description: `${data.paybackYears.toFixed(1)} years for battery component alone.` },
        { icon: 'cpu', title: 'TECHNOLOGY EVOLUTION', description: 'Battery technology is improving rapidly.' },
        { icon: 'box', title: 'SPACE REQUIREMENTS', description: 'Floor-mounted unit requires dedicated garage space.' },
        { icon: 'battery', title: 'DEGRADATION', description: 'Battery capacity reduces over time (approx. 0.35%/year).' },
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
      expectedGeneration: data.solarSizeKw * 4 * 365, // Approx 4 kWh per kW per day
      selfConsumptionRatio: 70,
      exportRatio: 30,
      whyThisBrand: 'Ranked #1 for module efficiency globally. The ABC technology eliminates front grid lines, absorbing 100% of incident light for maximum energy generation per square meter.',
      features: [
        { icon: 'panel', title: 'Full Black Design', description: 'Premium all-black appearance integrates seamlessly with modern rooflines.' },
        { icon: 'shield', title: '25-Year Warranty', description: 'Comprehensive coverage for both product defects and performance output.' },
        { icon: 'chart', title: 'Shade Optimization', description: 'Advanced partial shading optimization ensures maximum output even in challenging conditions.' },
      ],
    }
  });
  
  // Slide 11: VPP Provider Comparison (All 13 Providers)
  slides.push({
    id: slideId++,
    type: 'vpp_comparison',
    title: 'VPP PROVIDER COMPARISON',
    subtitle: 'Evaluating All 13 Market Leaders',
    content: {
      providers: getVPPProviders(data.state, data.hasGas),
      recommendedProvider: data.vppProvider,
      gasBundleRequired: data.hasGas,
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
      hasGasBundle: data.hasGasBundle,
      features: [
        { icon: 'layers', title: 'INTEGRATED BUNDLE', description: data.hasGasBundle ? 'The only top-tier VPP provider offering a seamless Gas & Electricity bundle, simplifying your administration.' : 'Streamlined electricity management with competitive rates.' },
        { icon: 'chart', title: 'FINANCIAL CERTAINTY', description: 'Provides guaranteed fixed credits for battery access, protecting you from market volatility while ensuring steady returns.' },
        { icon: 'target', title: 'STRATEGIC FIT', description: 'Perfectly aligned with your usage profile, maximizing self-consumption value while monetizing excess capacity.' },
      ],
    }
  });
  
  // Slide 13: Hot Water Electrification (CONDITIONAL - only if gas)
  if (data.hasGas && data.heatPumpSavings) {
    slides.push({
      id: slideId++,
      type: 'hot_water_electrification',
      title: 'HOT WATER ELECTRIFICATION',
      subtitle: 'Heat Pump Hot Water System',
      content: {
        currentSystem: data.gasAppliances?.hotWater?.type || 'Gas Storage',
        recommendedSystem: data.heatPumpBrand || 'Reclaim Energy CO2 Heat Pump',
        annualGasCost: data.gasAppliances?.hotWater?.annualCost || 600,
        annualHeatPumpCost: 150,
        annualSavings: data.heatPumpSavings,
        installCost: data.heatPumpCost || 3500,
        rebates: 1000,
        netCost: (data.heatPumpCost || 3500) - 1000,
        cop: 4.0,
        features: [
          'Uses ambient air to heat water - 4x more efficient than gas',
          'Eligible for VEU rebates up to $1,000',
          'Eliminates gas supply charge allocation',
          '10-year warranty on compressor',
        ],
      }
    });
  }
  
  // Slide 14: Heating & Cooling Upgrade (CONDITIONAL - only if gas heating)
  if (data.hasGas && data.heatingCoolingSavings) {
    slides.push({
      id: slideId++,
      type: 'heating_cooling',
      title: 'HEATING & COOLING UPGRADE',
      subtitle: 'Reverse Cycle Air Conditioning',
      content: {
        currentSystem: data.gasAppliances?.heating?.type || 'Gas Ducted',
        recommendedSystem: data.acBrand || 'Daikin US7 Reverse Cycle',
        annualGasCost: data.gasAppliances?.heating?.annualCost || 800,
        annualACCost: 200,
        annualSavings: data.heatingCoolingSavings,
        installCost: data.heatingCoolingCost || 8000,
        rebates: 1500,
        netCost: (data.heatingCoolingCost || 8000) - 1500,
        cop: 5.5,
        features: [
          'Provides both heating AND cooling from one system',
          '5-6x more efficient than gas heating',
          'Eligible for VEU certificates',
          'Zoned control for individual room comfort',
        ],
      }
    });
  }
  
  // Slide 15: Induction Cooking Upgrade (CONDITIONAL - only if gas cooktop)
  if (data.hasGas && data.inductionSavings) {
    slides.push({
      id: slideId++,
      type: 'induction_cooking',
      title: 'INDUCTION COOKING UPGRADE',
      subtitle: 'Modern Electric Cooking',
      content: {
        currentSystem: data.gasAppliances?.cooktop?.type || 'Gas Cooktop',
        recommendedSystem: data.inductionBrand || 'Fisher & Paykel Induction',
        annualGasCost: data.gasAppliances?.cooktop?.annualCost || 150,
        annualInductionCost: 50,
        annualSavings: data.inductionSavings,
        installCost: data.inductionCost || 2500,
        features: [
          'Instant heat control - faster than gas',
          'Safer - no open flame, cool surface',
          'Easier to clean - flat surface',
          'More efficient - 90% vs 40% for gas',
          'Better indoor air quality - no combustion',
        ],
      }
    });
  }
  
  // Slide 16: EV Analysis (CONDITIONAL - only if EV)
  if (data.hasEV && data.evAnnualKm) {
    slides.push({
      id: slideId++,
      type: 'ev_analysis',
      title: 'EV ANALYSIS',
      subtitle: `${data.evAnnualKm.toLocaleString()} km Annual Usage Scenario`,
      content: {
        annualKm: data.evAnnualKm,
        petrolCostPer100km: 20.00,
        evGridCostPer100km: 4.50,
        evSolarCostPer100km: 0,
        petrolAnnualCost: (data.evAnnualKm / 100) * 20,
        evGridAnnualCost: (data.evAnnualKm / 100) * 4.50,
        evSolarAnnualCost: 0,
        annualSavings: data.evAnnualSavings || (data.evAnnualKm / 100) * 20,
        co2Avoided: (data.evAnnualKm / 10000) * 2.3,
        comparison: [
          { scenario: 'Petrol Vehicle', costPer100km: 20.00, annualCost: (data.evAnnualKm / 100) * 20 },
          { scenario: 'EV (Grid Charging)', costPer100km: 4.50, annualCost: (data.evAnnualKm / 100) * 4.50 },
          { scenario: 'EV (Solar Charging)', costPer100km: 0, annualCost: 0 },
        ],
      }
    });
  }
  
  // Slide 17: EV Charger Recommendation (CONDITIONAL - only if EV)
  if (data.hasEV) {
    slides.push({
      id: slideId++,
      type: 'ev_charger',
      title: 'EV CHARGER RECOMMENDATION',
      subtitle: 'Smart Home Charging Solution',
      content: {
        recommendedCharger: data.evChargerBrand || 'Sigenergy 7kW Smart Charger',
        chargingSpeed: '7kW (32A single phase)',
        installCost: data.evChargerCost || 1800,
        features: [
          'Solar-only charging mode - charge only from excess solar',
          'Scheduled charging - charge during off-peak periods',
          'Load balancing - prevents circuit overload',
          'App control - monitor and control from anywhere',
          'Integrated with battery system for optimal energy flow',
        ],
        solarChargingBenefits: [
          'Zero fuel cost when charging from solar',
          'Maximize self-consumption of solar generation',
          'Reduce grid dependence and peak demand charges',
        ],
      }
    });
  }
  
  // Slide 18: Pool Heat Pump (CONDITIONAL - only if pool)
  if (data.hasPoolPump && data.poolPumpSavings) {
    slides.push({
      id: slideId++,
      type: 'pool_heat_pump',
      title: 'POOL HEAT PUMP',
      subtitle: 'Efficient Pool Heating Solution',
      content: {
        currentSystem: data.gasAppliances?.poolHeater?.type || 'Gas Pool Heater',
        recommendedSystem: data.poolHeatPumpBrand || 'Madimack Elite V3 Inverter',
        annualGasCost: data.gasAppliances?.poolHeater?.annualCost || 1200,
        annualHeatPumpCost: 300,
        annualSavings: data.poolPumpSavings,
        installCost: data.poolHeatPumpCost || 4500,
        cop: 6.0,
        features: [
          'COP of 6.0 - 6x more efficient than gas',
          'Inverter technology for quiet operation',
          'Extends swimming season by 4-6 months',
          'Can be powered by excess solar',
          'Wi-Fi control and scheduling',
        ],
      }
    });
  }
  
  // Slide 19: Full Electrification Investment (CONDITIONAL - only if gas)
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
        { category: 'Solar Self-Consumption', value: Math.round((data.annualSavings - data.vppAnnualValue - (data.evAnnualSavings || 0)) * 0.6), color: 'aqua' },
        { category: 'Battery Peak Shifting', value: Math.round((data.annualSavings - data.vppAnnualValue - (data.evAnnualSavings || 0)) * 0.4), color: 'white' },
        { category: 'VPP Credits', value: data.vppAnnualValue, color: 'orange' },
        data.hasEV ? { category: 'EV Fuel Savings', value: data.evAnnualSavings || 0, color: 'aqua' } : null,
        data.hasGas ? { category: 'Gas Elimination', value: data.gasAnnualCost || 0, color: 'orange' } : null,
      ].filter(Boolean),
      taxFree: true,
      note: 'All savings are tax-free as they represent reduced household expenses.',
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
        { icon: 'leaf', title: 'CARBON REDUCTION', description: `${data.co2ReductionTonnes.toFixed(1)} tonnes CO2 avoided annually` },
        { icon: 'tree', title: 'TREE EQUIVALENT', description: `Equivalent to planting ${data.treesEquivalent || Math.round(data.co2ReductionTonnes * 45)} trees per year` },
        { icon: 'zap', title: 'ENERGY INDEPENDENCE', description: `${data.energyIndependenceScore || 85}% energy self-sufficiency achieved` },
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
        { number: '02', title: 'INSTALLATION', description: `Installation of ${data.panelBrand} panels, ${data.inverterBrand} inverter, and battery modules. System commissioning.`, timeline: 'WEEK 3-4', color: 'aqua' },
        { number: '03', title: 'VPP ACTIVATION', description: `Switch to ${data.vppProvider} ${data.vppProgram}. Configure battery for VPP events.`, timeline: 'WEEK 5', color: 'aqua' },
        { number: '04', title: 'EV INTEGRATION', description: 'Install EV charger. Set up solar-only charging logic to maximize savings.', timeline: 'MONTH 2+', color: 'orange' },
        data.hasGas ? { number: '05', title: 'ELECTRIFICATION', description: 'Phase out gas appliances. Install heat pump hot water, reverse cycle AC, and induction cooktop.', timeline: 'MONTH 3-6', color: 'orange' } : null,
      ].filter(Boolean),
    }
  });
  
  // Slide 24: Conclusion
  slides.push({
    id: slideId++,
    type: 'conclusion',
    title: 'CONCLUSION',
    subtitle: 'Key Benefits Summary',
    content: {
      features: [
        { icon: 'chart', title: 'MAXIMIZE RETURNS', description: `Turn a $${Math.round(data.annualCost / 12)} monthly bill into a $${data.annualSavings.toLocaleString()} annual profit center through smart solar, battery, and VPP integration.`, border: 'aqua' },
        { icon: 'shield', title: 'SECURE POWER', description: `Gain independence from grid instability and rising costs with a ${data.batterySizeKwh}kWh battery backup system.`, border: 'white' },
        { icon: 'zap', title: 'FUTURE READY', description: 'Prepare your home for EV charging and full electrification, eliminating petrol and gas costs forever.', border: 'orange' },
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
      logoUrl: BRAND.logo.aqua,
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

// Helper function to generate yearly projection data
function generateYearlyProjection(currentCost: number, annualSavings: number, years: number): Array<{ year: number; withoutSolar: number; withSolar: number; cumulativeSavings: number }> {
  const projection = [];
  let cumulativeSavings = 0;
  const inflationRate = 0.035; // 3.5% annual electricity price increase
  
  for (let i = 1; i <= years; i++) {
    const inflatedCost = currentCost * Math.pow(1 + inflationRate, i);
    const withSolar = Math.max(0, inflatedCost - annualSavings);
    cumulativeSavings += inflatedCost - withSolar;
    
    projection.push({
      year: i,
      withoutSolar: Math.round(inflatedCost),
      withSolar: Math.round(withSolar),
      cumulativeSavings: Math.round(cumulativeSavings),
    });
  }
  
  return projection;
}

// Helper functions
function findPeakMonth(monthlyData?: { month: string; kwh: number }[]): { month: string; kwh: number } | null {
  if (!monthlyData || monthlyData.length === 0) return null;
  return monthlyData.reduce((max, curr) => curr.kwh > max.kwh ? curr : max, monthlyData[0]);
}

function calculateBatteryModules(totalKwh: number): string {
  const moduleSize = 8.06; // Sigenergy module size
  const count = Math.ceil(totalKwh / moduleSize);
  return `${count} x ${moduleSize} KWH`;
}

function getVPPProviders(state: string, hasGas: boolean): Array<{
  provider: string;
  program: string;
  gasBundle: boolean;
  annualValue: string;
  strategicFit: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'COMPLEX';
}> {
  // All 13 VPP providers as per Lightning Energy specifications
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
  
  // Filter based on gas requirement - show all providers but highlight gas bundle availability
  if (hasGas) {
    // Sort to show gas bundle providers first
    return providers.sort((a, b) => {
      if (a.gasBundle && !b.gasBundle) return -1;
      if (!a.gasBundle && b.gasBundle) return 1;
      return 0;
    });
  }
  return providers;
}

// Generate HTML for a single slide
export function generateSlideHTML(slide: SlideContent): string {
  const styles = `
    <style>
      @import url('https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/fRacvGdPvRdejhxR.ttf');
      @import url('https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/FlnvYEaVCWLmtgQE.otf');
      @import url('https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/ifpxpyNGTnspcxRL.ttf');
      
      * { margin: 0; padding: 0; box-sizing: border-box; }
      
      .slide {
        width: 1920px;
        height: 1080px;
        background: #000000;
        color: #FFFFFF;
        font-family: 'GeneralSans', sans-serif;
        padding: 60px 80px;
        position: relative;
      }
      
      .slide-title {
        font-family: 'NextSphere', sans-serif;
        font-size: 72px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 10px;
      }
      
      .slide-subtitle {
        font-family: 'Urbanist', sans-serif;
        font-size: 28px;
        color: #00EAD3;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        margin-bottom: 40px;
      }
      
      .logo {
        position: absolute;
        top: 40px;
        right: 60px;
        width: 80px;
        height: 80px;
      }
      
      .hero-number {
        font-family: 'NextSphere', sans-serif;
        font-size: 120px;
        font-weight: 800;
        color: #00EAD3;
      }
      
      .hero-number.white { color: #FFFFFF; }
      .hero-number.orange { color: #f36710; }
      
      .label {
        font-family: 'Urbanist', sans-serif;
        font-size: 14px;
        color: #808285;
        text-transform: uppercase;
        letter-spacing: 0.15em;
      }
      
      .card {
        background: rgba(255,255,255,0.03);
        border: 1px solid #333;
        border-radius: 8px;
        padding: 24px;
      }
      
      .card.aqua-border { border-color: #00EAD3; }
      .card.orange-border { border-color: #f36710; }
      
      .badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
      }
      
      .badge.excellent { background: #00EAD3; color: #000; }
      .badge.good { background: #22c55e; color: #000; }
      .badge.moderate { background: #f36710; color: #000; }
      .badge.complex { background: #666; color: #fff; }
      
      .copyright {
        position: absolute;
        bottom: 30px;
        left: 80px;
        font-size: 12px;
        color: #808285;
      }
      
      table {
        width: 100%;
        border-collapse: collapse;
      }
      
      th {
        font-family: 'Urbanist', sans-serif;
        font-size: 12px;
        color: #808285;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        text-align: left;
        padding: 12px 16px;
        border-bottom: 1px solid #333;
      }
      
      td {
        padding: 16px;
        border-bottom: 1px solid #222;
      }
      
      .highlight-row {
        background: rgba(0, 234, 211, 0.1);
        border-left: 3px solid #00EAD3;
      }
      
      .aqua { color: #00EAD3; }
      .orange { color: #f36710; }
      .gray { color: #808285; }
    </style>
  `;
  
  // Generate content based on slide type
  let content = '';
  
  switch (slide.type) {
    case 'cover':
      content = generateCoverSlide(slide);
      break;
    case 'executive_summary':
      content = generateExecutiveSummarySlide(slide);
      break;
    case 'bill_analysis':
      content = generateBillAnalysisSlide(slide);
      break;
    case 'annual_expenditure':
      content = generateExpenditureSlide(slide);
      break;
    case 'usage_analysis':
      content = generateUsageSlide(slide);
      break;
    case 'yearly_projection':
      content = generateYearlyProjectionSlide(slide);
      break;
    case 'gas_footprint':
      content = generateGasFootprintSlide(slide);
      break;
    case 'gas_appliances':
      content = generateGasAppliancesSlide(slide);
      break;
    case 'strategic_assessment':
      content = generateStrategicSlide(slide);
      break;
    case 'battery_recommendation':
      content = generateBatterySlide(slide);
      break;
    case 'solar_system':
      content = generateSolarSlide(slide);
      break;
    case 'vpp_comparison':
      content = generateVPPComparisonSlide(slide);
      break;
    case 'vpp_recommendation':
      content = generateVPPRecommendationSlide(slide);
      break;
    case 'hot_water_electrification':
      content = generateHotWaterSlide(slide);
      break;
    case 'heating_cooling':
      content = generateHeatingCoolingSlide(slide);
      break;
    case 'induction_cooking':
      content = generateInductionSlide(slide);
      break;
    case 'ev_analysis':
      content = generateEVAnalysisSlide(slide);
      break;
    case 'ev_charger':
      content = generateEVChargerSlide(slide);
      break;
    case 'pool_heat_pump':
      content = generatePoolHeatPumpSlide(slide);
      break;
    case 'electrification_investment':
      content = generateElectrificationInvestmentSlide(slide);
      break;
    case 'savings_summary':
      content = generateSavingsSummarySlide(slide);
      break;
    case 'financial_summary':
      content = generateFinancialSlide(slide);
      break;
    case 'environmental_impact':
      content = generateEnvironmentalSlide(slide);
      break;
    case 'roadmap':
      content = generateRoadmapSlide(slide);
      break;
    case 'conclusion':
      content = generateConclusionSlide(slide);
      break;
    case 'contact':
      content = generateContactSlide(slide);
      break;
    default:
      content = generateGenericSlide(slide);
  }
  
  return `<!DOCTYPE html><html><head>${styles}</head><body>${content}</body></html>`;
}

// Individual slide generators
function generateCoverSlide(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  return `
    <div class="slide" style="display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
      <img src="${c.logoUrl}" class="logo" alt="Lightning Energy" />
      <h1 class="slide-title" style="font-size: 96px; margin-bottom: 20px;">${slide.title}</h1>
      <p class="slide-subtitle" style="font-size: 36px; margin-bottom: 40px;">${slide.subtitle}</p>
      <p style="color: #808285; font-size: 18px;">${c.address}</p>
      <div class="copyright">Prepared by ${c.preparedBy} | ${c.company}</div>
    </div>
  `;
}

function generateExpenditureSlide(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="Lightning Energy" />
      <h1 class="slide-title">${slide.title}</h1>
      <p class="slide-subtitle">${slide.subtitle}</p>
      <div style="display: flex; gap: 80px; margin-top: 40px;">
        <div>
          <p class="label">PROJECTED ANNUAL COST</p>
          <p class="hero-number">$${(c.annualCost as number).toLocaleString()}</p>
          <p style="color: #808285; margin-top: 10px;">Based on current usage patterns</p>
        </div>
        <div style="flex: 1;">
          <table>
            <tr><th>COMPONENT</th><th style="text-align: right;">ANNUAL COST</th></tr>
            <tr><td>Usage Charges</td><td style="text-align: right;" class="orange">$${Math.round(c.usageCost as number).toLocaleString()}</td></tr>
            <tr><td>Supply Charges</td><td style="text-align: right;">$${Math.round(c.supplyCost as number).toLocaleString()}</td></tr>
            <tr class="highlight-row"><td><strong>TOTAL</strong></td><td style="text-align: right;" class="aqua"><strong>$${(c.annualCost as number).toLocaleString()}</strong></td></tr>
          </table>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

function generateUsageSlide(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="Lightning Energy" />
      <h1 class="slide-title">${slide.title}</h1>
      <p class="slide-subtitle">${slide.subtitle}</p>
      <div style="display: flex; gap: 60px; margin-top: 40px;">
        <div style="flex: 2;">
          <div style="display: flex; gap: 40px; margin-bottom: 40px;">
            <div class="card">
              <p class="label">ANNUAL USAGE</p>
              <p class="hero-number" style="font-size: 64px;">${Math.round(c.annualUsageKwh as number).toLocaleString()}<span style="font-size: 24px; color: #808285;"> kWh</span></p>
            </div>
            <div class="card">
              <p class="label">DAILY AVERAGE</p>
              <p class="hero-number white" style="font-size: 64px;">${(c.dailyAverageKwh as number).toFixed(1)}<span style="font-size: 24px; color: #808285;"> kWh</span></p>
            </div>
          </div>
        </div>
        <div style="flex: 1;">
          <div class="card">
            <p class="label">USAGE RATE</p>
            <p style="font-size: 32px; color: #f36710;">${c.usageRate}¢/kWh</p>
          </div>
          <div class="card" style="margin-top: 20px;">
            <p class="label">FEED-IN TARIFF</p>
            <p style="font-size: 32px; color: #00EAD3;">${c.feedInTariff}¢/kWh</p>
          </div>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

function generateStrategicSlide(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const advantages = c.advantages as Array<{ icon: string; title: string; description: string }>;
  const considerations = c.considerations as Array<{ icon: string; title: string; description: string }>;
  
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="Lightning Energy" />
      <h1 class="slide-title">${slide.title}</h1>
      <p class="slide-subtitle">${slide.subtitle}</p>
      <div style="display: flex; gap: 60px; margin-top: 30px;">
        <div style="flex: 1;">
          <h3 style="color: #00EAD3; font-size: 24px; margin-bottom: 20px;">✓ KEY ADVANTAGES</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            ${advantages.slice(0, 6).map(a => `
              <div>
                <p style="color: #00EAD3; font-weight: 600; font-size: 14px; text-transform: uppercase;">${a.title}</p>
                <p style="color: #808285; font-size: 13px; margin-top: 4px;">${a.description}</p>
              </div>
            `).join('')}
          </div>
        </div>
        <div style="flex: 1;">
          <h3 style="color: #f36710; font-size: 24px; margin-bottom: 20px;">⚠ CONSIDERATIONS</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            ${considerations.slice(0, 5).map(c => `
              <div>
                <p style="color: #f36710; font-weight: 600; font-size: 14px; text-transform: uppercase;">${c.title}</p>
                <p style="color: #808285; font-size: 13px; margin-top: 4px;">${c.description}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

function generateBatterySlide(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const capacity = c.whyThisCapacity as { home: number; evCharge: number; vppTrade: number };
  
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="Lightning Energy" />
      <h1 class="slide-title">${slide.title}</h1>
      <p class="slide-subtitle">${slide.subtitle}</p>
      <div style="display: flex; gap: 60px; margin-top: 40px;">
        <div style="flex: 1;">
          <div class="card aqua-border" style="text-align: center; padding: 40px;">
            <p class="label">TOTAL USABLE CAPACITY</p>
            <p class="hero-number">${c.totalCapacity}<span style="font-size: 36px;"> KWH</span></p>
          </div>
          <div style="display: flex; gap: 20px; margin-top: 20px;">
            <div class="card" style="flex: 1;">
              <p class="label" style="color: #00EAD3;">INVERTER</p>
              <p style="font-size: 24px;">${c.inverterSize} KW<br/>${c.inverterType}</p>
            </div>
            <div class="card" style="flex: 1;">
              <p class="label" style="color: #00EAD3;">MODULES</p>
              <p style="font-size: 24px;">${c.modules}</p>
            </div>
            <div class="card" style="flex: 1;">
              <p class="label" style="color: #00EAD3;">TECHNOLOGY</p>
              <p style="font-size: 24px;">${c.technology}</p>
            </div>
          </div>
        </div>
        <div style="flex: 1;">
          <p style="font-size: 20px; margin-bottom: 20px;">Why this capacity?</p>
          <div style="display: flex; height: 40px; border-radius: 4px; overflow: hidden;">
            <div style="width: ${(capacity.home / (c.totalCapacity as number)) * 100}%; background: #808285; display: flex; align-items: center; justify-content: center; font-size: 12px;">HOME ~${capacity.home.toFixed(0)}kWh</div>
            ${capacity.evCharge > 0 ? `<div style="width: ${(capacity.evCharge / (c.totalCapacity as number)) * 100}%; background: #00EAD3; color: #000; display: flex; align-items: center; justify-content: center; font-size: 12px;">EV CHARGE ~${capacity.evCharge}kWh</div>` : ''}
            <div style="width: ${(capacity.vppTrade / (c.totalCapacity as number)) * 100}%; background: #f36710; color: #000; display: flex; align-items: center; justify-content: center; font-size: 12px;">VPP TRADE ~${capacity.vppTrade.toFixed(0)}kWh</div>
          </div>
          <p style="color: #808285; font-size: 14px; margin-top: 20px;">${c.explanation}</p>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

function generateSolarSlide(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const features = c.features as Array<{ icon: string; title: string; description: string }>;
  
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="Lightning Energy" />
      <h1 class="slide-title">${slide.title}</h1>
      <p class="slide-subtitle">${slide.subtitle}</p>
      <div style="display: flex; gap: 40px; margin-top: 30px;">
        <div class="card" style="text-align: center;">
          <p class="label">SYSTEM SIZE</p>
          <p class="hero-number white" style="font-size: 80px;">${c.systemSize}<span style="font-size: 24px; color: #808285;">KW</span></p>
        </div>
        <div class="card" style="text-align: center;">
          <p class="label">PANEL COUNT</p>
          <p class="hero-number" style="font-size: 80px; color: #00EAD3;">${c.panelCount}<span style="font-size: 24px; color: #808285;">UNITS</span></p>
        </div>
        <div class="card" style="text-align: center;">
          <p class="label" style="color: #f36710;">HARDWARE TECHNOLOGY</p>
          <p class="hero-number orange" style="font-size: 80px;">${c.panelPower}<span style="font-size: 24px; color: #808285;">W</span></p>
          <p style="color: #808285; font-size: 14px;">${c.panelBrand}</p>
        </div>
      </div>
      <div style="display: flex; gap: 40px; margin-top: 30px;">
        <div class="card aqua-border" style="flex: 1;">
          <p style="color: #00EAD3; font-weight: 600; margin-bottom: 10px;">WHY ${(c.panelBrand as string).split(' ')[0].toUpperCase()}?</p>
          <p style="color: #808285; font-size: 14px;">${c.whyThisBrand}</p>
        </div>
        <div style="flex: 1;">
          <p style="color: #f36710; font-weight: 600; margin-bottom: 16px;">PERFORMANCE & WARRANTY</p>
          ${features.map(f => `
            <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
              <span style="color: #00EAD3;">●</span>
              <div>
                <p style="font-weight: 600; font-size: 14px;">${f.title}</p>
                <p style="color: #808285; font-size: 13px;">${f.description}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

function generateVPPComparisonSlide(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const providers = c.providers as Array<{ provider: string; program: string; gasBundle: boolean; annualValue: string; strategicFit: string }>;
  const recommended = c.recommendedProvider as string;
  
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="Lightning Energy" />
      <h1 class="slide-title">${slide.title}</h1>
      <p class="slide-subtitle">${slide.subtitle}</p>
      <table style="margin-top: 30px;">
        <tr>
          <th>PROVIDER</th>
          <th>VPP MODEL</th>
          <th>GAS BUNDLE</th>
          <th>EST. ANNUAL VALUE</th>
          <th>STRATEGIC FIT</th>
        </tr>
        ${providers.map(p => `
          <tr class="${p.provider === recommended ? 'highlight-row' : ''}">
            <td style="font-weight: 600;">${p.provider}${p.provider === recommended ? '<br/><span style="color: #00EAD3; font-size: 12px;">Recommended</span>' : ''}</td>
            <td><span style="color: #f36710;">${p.program}</span><br/><span style="color: #808285; font-size: 12px;">Variable event payments</span></td>
            <td>${p.gasBundle ? '<span style="color: #00EAD3;">✓ Yes</span>' : '<span style="color: #808285;">✗ No</span>'}</td>
            <td style="font-weight: 600;">${p.annualValue}</td>
            <td><span class="badge ${p.strategicFit.toLowerCase()}">${p.strategicFit}</span></td>
          </tr>
        `).join('')}
      </table>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

function generateVPPRecommendationSlide(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const features = c.features as Array<{ icon: string; title: string; description: string }>;
  
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="Lightning Energy" />
      <h1 class="slide-title">${slide.title}</h1>
      <p class="slide-subtitle">${slide.subtitle}</p>
      <div style="text-align: center; margin-top: 40px;">
        <p class="label">SELECTED PARTNER</p>
        <p style="font-family: 'NextSphere', sans-serif; font-size: 72px; font-weight: 800; margin: 10px 0;">${c.provider}</p>
        <p style="color: #00EAD3; font-size: 24px;">${c.program}</p>
      </div>
      <div style="display: flex; gap: 30px; margin-top: 40px;">
        ${features.map((f, i) => `
          <div class="card ${i === 0 ? 'aqua-border' : ''}" style="flex: 1; text-align: center;">
            <p style="color: ${i === 0 ? '#f36710' : i === 1 ? '#00EAD3' : '#f36710'}; font-size: 32px; margin-bottom: 10px;">${i === 0 ? '≡' : i === 1 ? '↗' : '⊕'}</p>
            <p style="font-weight: 600; text-transform: uppercase; margin-bottom: 10px;">${f.title}</p>
            <p style="color: #808285; font-size: 14px;">${f.description}</p>
          </div>
        `).join('')}
      </div>
      <div style="display: flex; align-items: center; gap: 20px; margin-top: 40px;">
        <div style="width: 4px; height: 60px; background: #00EAD3;"></div>
        <div>
          <p class="label">Estimated Annual Value (Credits + Bundle Savings)</p>
          <p class="hero-number" style="font-size: 72px;">~$${c.annualValue}<span style="font-size: 24px;"> / YEAR</span></p>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

function generateSavingsSummarySlide(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const breakdown = c.breakdown as Array<{ category: string; value: number; color: string }>;
  const total = c.totalAnnualBenefit as number;
  
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="Lightning Energy" />
      <h1 class="slide-title">${slide.title}</h1>
      <p class="slide-subtitle">${slide.subtitle}</p>
      <div style="display: flex; gap: 60px; margin-top: 40px;">
        <div style="flex: 1;">
          <div style="height: 400px; display: flex; flex-direction: column; justify-content: flex-end;">
            ${breakdown.map(b => `
              <div style="height: ${(b.value / total) * 100}%; background: ${b.color === 'aqua' ? '#00EAD3' : b.color === 'orange' ? '#f36710' : '#FFFFFF'}; display: flex; align-items: center; justify-content: center;">
                <span style="color: #000; font-weight: 600;">${b.category}</span>
              </div>
            `).join('')}
          </div>
        </div>
        <div style="flex: 1;">
          <div class="card aqua-border" style="text-align: center; padding: 40px; margin-bottom: 30px;">
            <p class="label" style="color: #00EAD3;">TOTAL ANNUAL BENEFIT</p>
            <p class="hero-number white" style="font-size: 96px;">$${total.toLocaleString()}</p>
            <p style="color: #808285;">Tax-Free Savings</p>
          </div>
          ${breakdown.map(b => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #333;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 16px; height: 16px; background: ${b.color === 'aqua' ? '#00EAD3' : b.color === 'orange' ? '#f36710' : '#FFFFFF'};"></div>
                <span>${b.category}</span>
              </div>
              <span style="font-weight: 600;">$${b.value.toLocaleString()}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

function generateFinancialSlide(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="Lightning Energy" />
      <h1 class="slide-title">${slide.title}</h1>
      <p class="slide-subtitle">${slide.subtitle}</p>
      <div style="display: flex; gap: 60px; margin-top: 40px;">
        <div style="flex: 1;">
          <p class="label" style="margin-bottom: 20px;">INVESTMENT BREAKDOWN</p>
          <div style="display: flex; justify-content: space-between; padding: 16px 0; border-bottom: 1px solid #333;">
            <span>Solar & Battery System</span>
            <span style="font-weight: 600;">$${(c.systemCost as number).toLocaleString()}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 16px 0; border-bottom: 1px solid #333;">
            <span>Govt. Rebates & Incentives</span>
            <span style="font-weight: 600; color: #00EAD3;">-$${(c.rebates as number).toLocaleString()}</span>
          </div>
          <div class="card orange-border" style="margin-top: 20px;">
            <p class="label" style="color: #f36710;">NET INVESTMENT</p>
            <p class="hero-number white" style="font-size: 72px;">$${(c.netInvestment as number).toLocaleString()}</p>
            <p style="color: #808285; font-size: 14px;">Fully Installed (Inc. GST)</p>
          </div>
        </div>
        <div style="flex: 1;">
          <p class="label" style="margin-bottom: 20px;">PROJECTED RETURNS</p>
          <div style="display: flex; gap: 20px;">
            <div class="card aqua-border" style="flex: 1;">
              <p class="label" style="color: #00EAD3;">ANNUAL BENEFIT</p>
              <p class="hero-number white" style="font-size: 48px;">$${(c.annualBenefit as number).toLocaleString()}</p>
              <p style="color: #808285; font-size: 12px;">Combined Savings & Income</p>
            </div>
            <div class="card aqua-border" style="flex: 1;">
              <p class="label" style="color: #00EAD3;">PAYBACK PERIOD</p>
              <p class="hero-number white" style="font-size: 48px;">${(c.paybackYears as number).toFixed(1)} YRS</p>
              <p style="color: #808285; font-size: 12px;">Accelerated by ${c.acceleratedBy}</p>
            </div>
          </div>
          <div class="card" style="margin-top: 20px; text-align: center;">
            <p style="font-size: 24px; font-weight: 600;">10-YEAR TOTAL SAVINGS: <span class="aqua">~$${(c.tenYearSavings as number).toLocaleString()}</span></p>
          </div>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

function generateRoadmapSlide(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const steps = c.steps as Array<{ number: string; title: string; description: string; timeline: string; color: string }>;
  
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="Lightning Energy" />
      <h1 class="slide-title">${slide.title}</h1>
      <p class="slide-subtitle">${slide.subtitle}</p>
      <div style="margin-top: 40px;">
        <div style="display: flex; align-items: center; margin-bottom: 30px;">
          ${steps.map((s, i) => `
            <div style="display: flex; align-items: center;">
              <div style="width: 24px; height: 24px; border-radius: 50%; border: 2px solid ${s.color === 'aqua' ? '#00EAD3' : '#f36710'}; background: transparent;"></div>
              ${i < steps.length - 1 ? `<div style="width: 200px; height: 2px; background: linear-gradient(to right, ${s.color === 'aqua' ? '#00EAD3' : '#f36710'}, ${steps[i + 1].color === 'aqua' ? '#00EAD3' : '#f36710'});"></div>` : ''}
            </div>
          `).join('')}
        </div>
        <div style="display: flex; gap: 20px;">
          ${steps.map(s => `
            <div class="card" style="flex: 1; border-top: 3px solid ${s.color === 'aqua' ? '#00EAD3' : '#f36710'};">
              <p style="font-size: 48px; color: #333; font-weight: 800;">${s.number}</p>
              <p style="font-weight: 600; text-transform: uppercase; color: ${s.color === 'aqua' ? '#FFFFFF' : '#f36710'}; margin: 10px 0;">${s.title}</p>
              <p style="color: #808285; font-size: 13px; margin-bottom: 16px;">${s.description}</p>
              <p style="color: #00EAD3; font-size: 12px;">⏱ ${s.timeline}</p>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

function generateConclusionSlide(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const features = c.features as Array<{ icon: string; title: string; description: string; border: string }>;
  
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="Lightning Energy" />
      <h1 class="slide-title">${slide.title}</h1>
      <p class="slide-subtitle">${slide.subtitle}</p>
      <div style="display: flex; gap: 30px; margin-top: 40px;">
        ${features.map(f => `
          <div class="card ${f.border}-border" style="flex: 1; text-align: center;">
            <p style="color: ${f.border === 'aqua' ? '#00EAD3' : f.border === 'orange' ? '#f36710' : '#FFFFFF'}; font-size: 40px; margin-bottom: 16px;">${f.icon === 'chart' ? '↗' : f.icon === 'shield' ? '🛡' : '⚡'}</p>
            <p style="font-weight: 600; text-transform: uppercase; margin-bottom: 12px;">${f.title}</p>
            <p style="color: #808285; font-size: 14px;">${f.description}</p>
          </div>
        `).join('')}
      </div>
      <div style="text-align: center; margin-top: 60px;">
        <p style="font-family: 'NextSphere', sans-serif; font-size: 36px; font-weight: 800; line-height: 1.4;">${c.quote}</p>
        <p style="color: #00EAD3; font-size: 20px; margin-top: 30px;">${c.callToAction}</p>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

function generateGenericSlide(slide: SlideContent): string {
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="Lightning Energy" />
      <h1 class="slide-title">${slide.title}</h1>
      ${slide.subtitle ? `<p class="slide-subtitle">${slide.subtitle}</p>` : ''}
      <div style="margin-top: 40px;">
        <pre style="color: #808285; font-size: 14px;">${JSON.stringify(slide.content, null, 2)}</pre>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}


// New slide generators for full 25-slide structure

function generateExecutiveSummarySlide(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="Lightning Energy" />
      <h1 class="slide-title">${slide.title}</h1>
      <p class="slide-subtitle">${slide.subtitle}</p>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 30px; margin-top: 40px;">
        <div class="card aqua-border" style="text-align: center;">
          <p class="label">CURRENT ANNUAL COST</p>
          <p class="hero-number orange" style="font-size: 48px;">$${(c.currentAnnualCost as number).toLocaleString()}</p>
        </div>
        <div class="card aqua-border" style="text-align: center;">
          <p class="label">PROJECTED ANNUAL COST</p>
          <p class="hero-number" style="font-size: 48px;">$${Math.round(c.projectedAnnualCost as number).toLocaleString()}</p>
        </div>
        <div class="card aqua-border" style="text-align: center;">
          <p class="label">TOTAL ANNUAL SAVINGS</p>
          <p class="hero-number white" style="font-size: 48px;">$${(c.totalAnnualSavings as number).toLocaleString()}</p>
        </div>
        <div class="card aqua-border" style="text-align: center;">
          <p class="label">PAYBACK PERIOD</p>
          <p class="hero-number" style="font-size: 48px;">${(c.paybackYears as number).toFixed(1)}<span style="font-size: 20px;">YRS</span></p>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 30px; margin-top: 30px;">
        <div class="card" style="text-align: center;">
          <p class="label">SOLAR SYSTEM</p>
          <p style="font-size: 32px; color: #f36710;">${c.systemSize}kW</p>
        </div>
        <div class="card" style="text-align: center;">
          <p class="label">BATTERY</p>
          <p style="font-size: 32px; color: #f36710;">${c.batterySize}kWh</p>
        </div>
        <div class="card" style="text-align: center;">
          <p class="label">VPP PARTNER</p>
          <p style="font-size: 24px; color: #00EAD3;">${c.vppProvider}</p>
        </div>
        <div class="card" style="text-align: center;">
          <p class="label">CO2 REDUCTION</p>
          <p style="font-size: 32px; color: #00EAD3;">${(c.co2Reduction as number).toFixed(1)}t</p>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

function generateBillAnalysisSlide(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="Lightning Energy" />
      <h1 class="slide-title">${slide.title}</h1>
      <p class="slide-subtitle">${slide.subtitle}</p>
      <div style="display: flex; gap: 60px; margin-top: 40px;">
        <div style="flex: 1;">
          <div class="card orange-border" style="margin-bottom: 20px;">
            <p class="label">CURRENT RETAILER</p>
            <p style="font-size: 36px; font-weight: 600;">${c.retailer}</p>
          </div>
          <div class="card aqua-border">
            <p class="label">ANNUAL ELECTRICITY COST</p>
            <p class="hero-number" style="font-size: 72px;">$${(c.annualCost as number).toLocaleString()}</p>
          </div>
        </div>
        <div style="flex: 1;">
          <table>
            <tr><th>RATE TYPE</th><th style="text-align: right;">VALUE</th></tr>
            <tr><td>Usage Rate</td><td style="text-align: right;" class="orange">${c.usageRate}¢/kWh</td></tr>
            <tr><td>Supply Charge</td><td style="text-align: right;">${c.supplyCharge}¢/day</td></tr>
            <tr><td>Feed-in Tariff</td><td style="text-align: right;" class="aqua">${c.feedInTariff}¢/kWh</td></tr>
            ${c.controlledLoadRate ? `<tr><td>Controlled Load</td><td style="text-align: right;">${c.controlledLoadRate}¢/kWh</td></tr>` : ''}
          </table>
          <div style="margin-top: 30px;">
            <p class="label">COST BREAKDOWN</p>
            <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #333;">
              <span>Usage Charges</span>
              <span class="orange">$${Math.round(c.usageCost as number).toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #333;">
              <span>Supply Charges</span>
              <span>$${Math.round(c.supplyCost as number).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

function generateYearlyProjectionSlide(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const projection = (c.yearlyProjection as Array<{ year: number; withoutSolar: number; withSolar: number; cumulativeSavings: number }>) || [];
  
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="Lightning Energy" />
      <h1 class="slide-title">${slide.title}</h1>
      <p class="slide-subtitle">${slide.subtitle}</p>
      <div style="display: flex; gap: 40px; margin-top: 30px;">
        <div style="flex: 2;">
          <div style="display: flex; align-items: flex-end; height: 350px; gap: 4px;">
            ${projection.slice(0, 25).map((p, i) => `
              <div style="flex: 1; display: flex; flex-direction: column; align-items: center;">
                <div style="width: 100%; height: ${(p.withoutSolar / (c.currentAnnualCost as number * 2.5)) * 300}px; background: #f36710; opacity: 0.3;"></div>
                <div style="width: 100%; height: ${(p.withSolar / (c.currentAnnualCost as number * 2.5)) * 300}px; background: #00EAD3; margin-top: -${(p.withSolar / (c.currentAnnualCost as number * 2.5)) * 300}px;"></div>
                ${i % 5 === 0 ? `<span style="font-size: 10px; color: #808285; margin-top: 4px;">Y${p.year}</span>` : ''}
              </div>
            `).join('')}
          </div>
          <div style="display: flex; gap: 20px; margin-top: 20px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 16px; height: 16px; background: #f36710; opacity: 0.3;"></div>
              <span style="font-size: 12px; color: #808285;">Without Solar</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 16px; height: 16px; background: #00EAD3;"></div>
              <span style="font-size: 12px; color: #808285;">With Solar</span>
            </div>
          </div>
        </div>
        <div style="flex: 1;">
          <div class="card aqua-border" style="margin-bottom: 20px;">
            <p class="label">10-YEAR SAVINGS</p>
            <p class="hero-number white" style="font-size: 48px;">$${(c.tenYearSavings as number).toLocaleString()}</p>
          </div>
          <div class="card orange-border">
            <p class="label">25-YEAR SAVINGS</p>
            <p class="hero-number" style="font-size: 48px;">$${(c.twentyFiveYearSavings as number).toLocaleString()}</p>
          </div>
          <p style="color: #808285; font-size: 12px; margin-top: 16px;">* Assumes ${c.inflationRate}% annual electricity price inflation</p>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

function generateGasFootprintSlide(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="Lightning Energy" />
      <h1 class="slide-title">${slide.title}</h1>
      <p class="slide-subtitle">${slide.subtitle}</p>
      <div style="display: flex; gap: 60px; margin-top: 40px;">
        <div style="flex: 1;">
          <div class="card orange-border" style="text-align: center; padding: 40px;">
            <p class="label">ANNUAL GAS COST</p>
            <p class="hero-number orange" style="font-size: 72px;">$${(c.annualCost as number).toLocaleString()}</p>
          </div>
          <div style="display: flex; gap: 20px; margin-top: 20px;">
            <div class="card" style="flex: 1;">
              <p class="label">ANNUAL USAGE</p>
              <p style="font-size: 24px;">${(c.annualMJ as number).toLocaleString()} MJ</p>
            </div>
            <div class="card" style="flex: 1;">
              <p class="label">kWh EQUIVALENT</p>
              <p style="font-size: 24px;">${Math.round(c.kwhEquivalent as number).toLocaleString()} kWh</p>
            </div>
          </div>
        </div>
        <div style="flex: 1;">
          <p class="label" style="margin-bottom: 20px;">ENVIRONMENTAL IMPACT</p>
          <div class="card" style="margin-bottom: 20px;">
            <p style="font-size: 20px;">CO2 Emissions from Gas</p>
            <p class="hero-number orange" style="font-size: 48px;">${(c.co2Emissions as number).toFixed(1)}<span style="font-size: 20px;"> tonnes/year</span></p>
          </div>
          <div class="card aqua-border">
            <p style="color: #00EAD3; font-weight: 600; margin-bottom: 10px;">ELECTRIFICATION OPPORTUNITY</p>
            <p style="color: #808285; font-size: 14px;">By replacing gas appliances with efficient electric alternatives, you can eliminate this carbon footprint entirely while reducing costs.</p>
          </div>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

function generateGasAppliancesSlide(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const priorities = (c.electrificationPriority as Array<{ name: string; type: string; priority: string; savings: number }>) || [];
  
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="Lightning Energy" />
      <h1 class="slide-title">${slide.title}</h1>
      <p class="slide-subtitle">${slide.subtitle}</p>
      <div style="margin-top: 40px;">
        <table>
          <tr>
            <th>APPLIANCE</th>
            <th>CURRENT TYPE</th>
            <th>PRIORITY</th>
            <th style="text-align: right;">EST. ANNUAL SAVINGS</th>
          </tr>
          ${priorities.map(p => `
            <tr>
              <td style="font-weight: 600;">${p.name}</td>
              <td style="color: #808285;">${p.type}</td>
              <td><span class="badge ${p.priority.toLowerCase()}">${p.priority}</span></td>
              <td style="text-align: right; color: #00EAD3; font-weight: 600;">$${p.savings.toLocaleString()}</td>
            </tr>
          `).join('')}
        </table>
        <div class="card aqua-border" style="margin-top: 30px;">
          <p style="color: #00EAD3; font-weight: 600; margin-bottom: 10px;">TOTAL GAS ELIMINATION POTENTIAL</p>
          <p style="font-size: 24px;">Annual Cost: <span class="orange">$${(c.totalGasCost as number).toLocaleString()}</span> → <span class="aqua">$0</span></p>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

function generateHotWaterSlide(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const features = (c.features as string[]) || [];
  
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="Lightning Energy" />
      <h1 class="slide-title">${slide.title}</h1>
      <p class="slide-subtitle">${slide.subtitle}</p>
      <div style="display: flex; gap: 60px; margin-top: 40px;">
        <div style="flex: 1;">
          <div class="card" style="margin-bottom: 20px;">
            <p class="label">CURRENT SYSTEM</p>
            <p style="font-size: 24px; color: #f36710;">${c.currentSystem}</p>
            <p style="color: #808285; margin-top: 10px;">Annual Cost: $${c.annualGasCost}/year</p>
          </div>
          <div class="card aqua-border">
            <p class="label" style="color: #00EAD3;">RECOMMENDED UPGRADE</p>
            <p style="font-size: 24px;">${c.recommendedSystem}</p>
            <p style="color: #808285; margin-top: 10px;">Annual Cost: $${c.annualHeatPumpCost}/year</p>
          </div>
        </div>
        <div style="flex: 1;">
          <div class="card orange-border" style="text-align: center; margin-bottom: 20px;">
            <p class="label">ANNUAL SAVINGS</p>
            <p class="hero-number" style="font-size: 64px;">$${c.annualSavings}</p>
          </div>
          <div style="display: flex; gap: 20px;">
            <div class="card" style="flex: 1;">
              <p class="label">INSTALL COST</p>
              <p style="font-size: 20px;">$${(c.installCost as number).toLocaleString()}</p>
            </div>
            <div class="card" style="flex: 1;">
              <p class="label" style="color: #00EAD3;">REBATES</p>
              <p style="font-size: 20px; color: #00EAD3;">-$${(c.rebates as number).toLocaleString()}</p>
            </div>
            <div class="card aqua-border" style="flex: 1;">
              <p class="label">NET COST</p>
              <p style="font-size: 20px;">$${(c.netCost as number).toLocaleString()}</p>
            </div>
          </div>
          <div style="margin-top: 20px;">
            ${features.map(f => `<p style="color: #808285; font-size: 13px; margin-bottom: 8px;">✓ ${f}</p>`).join('')}
          </div>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

function generateHeatingCoolingSlide(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const features = (c.features as string[]) || [];
  
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="Lightning Energy" />
      <h1 class="slide-title">${slide.title}</h1>
      <p class="slide-subtitle">${slide.subtitle}</p>
      <div style="display: flex; gap: 60px; margin-top: 40px;">
        <div style="flex: 1;">
          <div class="card" style="margin-bottom: 20px;">
            <p class="label">CURRENT SYSTEM</p>
            <p style="font-size: 24px; color: #f36710;">${c.currentSystem}</p>
            <p style="color: #808285; margin-top: 10px;">Annual Cost: $${c.annualGasCost}/year</p>
          </div>
          <div class="card aqua-border">
            <p class="label" style="color: #00EAD3;">RECOMMENDED UPGRADE</p>
            <p style="font-size: 24px;">${c.recommendedSystem}</p>
            <p style="color: #808285; margin-top: 10px;">Annual Cost: $${c.annualACCost}/year</p>
            <p style="color: #00EAD3; margin-top: 10px;">COP: ${c.cop} (${c.cop}x more efficient)</p>
          </div>
        </div>
        <div style="flex: 1;">
          <div class="card orange-border" style="text-align: center; margin-bottom: 20px;">
            <p class="label">ANNUAL SAVINGS</p>
            <p class="hero-number" style="font-size: 64px;">$${c.annualSavings}</p>
          </div>
          <div style="display: flex; gap: 20px;">
            <div class="card" style="flex: 1;">
              <p class="label">INSTALL COST</p>
              <p style="font-size: 20px;">$${(c.installCost as number).toLocaleString()}</p>
            </div>
            <div class="card" style="flex: 1;">
              <p class="label" style="color: #00EAD3;">REBATES</p>
              <p style="font-size: 20px; color: #00EAD3;">-$${(c.rebates as number).toLocaleString()}</p>
            </div>
            <div class="card aqua-border" style="flex: 1;">
              <p class="label">NET COST</p>
              <p style="font-size: 20px;">$${(c.netCost as number).toLocaleString()}</p>
            </div>
          </div>
          <div style="margin-top: 20px;">
            ${features.map(f => `<p style="color: #808285; font-size: 13px; margin-bottom: 8px;">✓ ${f}</p>`).join('')}
          </div>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

function generateInductionSlide(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const features = (c.features as string[]) || [];
  
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="Lightning Energy" />
      <h1 class="slide-title">${slide.title}</h1>
      <p class="slide-subtitle">${slide.subtitle}</p>
      <div style="display: flex; gap: 60px; margin-top: 40px;">
        <div style="flex: 1;">
          <div class="card" style="margin-bottom: 20px;">
            <p class="label">CURRENT SYSTEM</p>
            <p style="font-size: 24px; color: #f36710;">${c.currentSystem}</p>
            <p style="color: #808285; margin-top: 10px;">Annual Cost: $${c.annualGasCost}/year</p>
          </div>
          <div class="card aqua-border">
            <p class="label" style="color: #00EAD3;">RECOMMENDED UPGRADE</p>
            <p style="font-size: 24px;">${c.recommendedSystem}</p>
            <p style="color: #808285; margin-top: 10px;">Annual Cost: $${c.annualInductionCost}/year</p>
          </div>
        </div>
        <div style="flex: 1;">
          <div class="card orange-border" style="text-align: center; margin-bottom: 20px;">
            <p class="label">ANNUAL SAVINGS</p>
            <p class="hero-number" style="font-size: 64px;">$${c.annualSavings}</p>
          </div>
          <div class="card" style="margin-bottom: 20px;">
            <p class="label">INSTALL COST</p>
            <p style="font-size: 24px;">$${(c.installCost as number).toLocaleString()}</p>
          </div>
          <div style="margin-top: 20px;">
            <p class="label" style="margin-bottom: 12px;">KEY BENEFITS</p>
            ${features.map(f => `<p style="color: #808285; font-size: 13px; margin-bottom: 8px;">✓ ${f}</p>`).join('')}
          </div>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

function generateEVAnalysisSlide(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const comparison = (c.comparison as Array<{ scenario: string; costPer100km: number; annualCost: number }>) || [];
  
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="Lightning Energy" />
      <h1 class="slide-title">${slide.title}</h1>
      <p class="slide-subtitle">${slide.subtitle}</p>
      <div style="display: flex; gap: 60px; margin-top: 40px;">
        <div style="flex: 1;">
          <table>
            <tr>
              <th>SCENARIO</th>
              <th style="text-align: right;">COST/100KM</th>
              <th style="text-align: right;">ANNUAL COST</th>
            </tr>
            ${comparison.map((comp, i) => `
              <tr class="${i === 2 ? 'highlight-row' : ''}">
                <td>${comp.scenario}</td>
                <td style="text-align: right; color: ${i === 0 ? '#f36710' : i === 1 ? '#FFFFFF' : '#00EAD3'};">$${comp.costPer100km.toFixed(2)}</td>
                <td style="text-align: right; color: ${i === 0 ? '#f36710' : i === 1 ? '#FFFFFF' : '#00EAD3'};">$${comp.annualCost.toLocaleString()}</td>
              </tr>
            `).join('')}
          </table>
        </div>
        <div style="flex: 1;">
          <div class="card aqua-border" style="text-align: center; margin-bottom: 20px;">
            <p class="label">ANNUAL FUEL SAVINGS</p>
            <p class="hero-number" style="font-size: 64px;">$${(c.annualSavings as number).toLocaleString()}</p>
          </div>
          <div class="card" style="text-align: center;">
            <p class="label">CO2 AVOIDED</p>
            <p style="font-size: 36px; color: #00EAD3;">${(c.co2Avoided as number).toFixed(1)} tonnes/year</p>
          </div>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

function generateEVChargerSlide(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const features = (c.features as string[]) || [];
  const benefits = (c.solarChargingBenefits as string[]) || [];
  
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="Lightning Energy" />
      <h1 class="slide-title">${slide.title}</h1>
      <p class="slide-subtitle">${slide.subtitle}</p>
      <div style="display: flex; gap: 60px; margin-top: 40px;">
        <div style="flex: 1;">
          <div class="card aqua-border" style="margin-bottom: 20px;">
            <p class="label" style="color: #00EAD3;">RECOMMENDED CHARGER</p>
            <p style="font-size: 28px; font-weight: 600;">${c.recommendedCharger}</p>
            <p style="color: #808285; margin-top: 10px;">${c.chargingSpeed}</p>
          </div>
          <div class="card orange-border">
            <p class="label">INSTALLED COST</p>
            <p class="hero-number white" style="font-size: 48px;">$${(c.installCost as number).toLocaleString()}</p>
          </div>
        </div>
        <div style="flex: 1;">
          <p class="label" style="margin-bottom: 16px;">SMART FEATURES</p>
          ${features.map(f => `<p style="color: #808285; font-size: 13px; margin-bottom: 8px;">✓ ${f}</p>`).join('')}
          <p class="label" style="margin-top: 24px; margin-bottom: 16px; color: #00EAD3;">SOLAR CHARGING BENEFITS</p>
          ${benefits.map(b => `<p style="color: #00EAD3; font-size: 13px; margin-bottom: 8px;">⚡ ${b}</p>`).join('')}
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

function generatePoolHeatPumpSlide(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const features = (c.features as string[]) || [];
  
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="Lightning Energy" />
      <h1 class="slide-title">${slide.title}</h1>
      <p class="slide-subtitle">${slide.subtitle}</p>
      <div style="display: flex; gap: 60px; margin-top: 40px;">
        <div style="flex: 1;">
          <div class="card" style="margin-bottom: 20px;">
            <p class="label">CURRENT SYSTEM</p>
            <p style="font-size: 24px; color: #f36710;">${c.currentSystem}</p>
            <p style="color: #808285; margin-top: 10px;">Annual Cost: $${c.annualGasCost}/year</p>
          </div>
          <div class="card aqua-border">
            <p class="label" style="color: #00EAD3;">RECOMMENDED UPGRADE</p>
            <p style="font-size: 24px;">${c.recommendedSystem}</p>
            <p style="color: #808285; margin-top: 10px;">Annual Cost: $${c.annualHeatPumpCost}/year</p>
            <p style="color: #00EAD3; margin-top: 10px;">COP: ${c.cop} (${c.cop}x more efficient)</p>
          </div>
        </div>
        <div style="flex: 1;">
          <div class="card orange-border" style="text-align: center; margin-bottom: 20px;">
            <p class="label">ANNUAL SAVINGS</p>
            <p class="hero-number" style="font-size: 64px;">$${c.annualSavings}</p>
          </div>
          <div class="card" style="margin-bottom: 20px;">
            <p class="label">INSTALL COST</p>
            <p style="font-size: 24px;">$${(c.installCost as number).toLocaleString()}</p>
          </div>
          <div style="margin-top: 20px;">
            ${features.map(f => `<p style="color: #808285; font-size: 13px; margin-bottom: 8px;">✓ ${f}</p>`).join('')}
          </div>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

function generateElectrificationInvestmentSlide(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const items = (c.items as Array<{ item: string; cost: number; rebate: number }>) || [];
  
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="Lightning Energy" />
      <h1 class="slide-title">${slide.title}</h1>
      <p class="slide-subtitle">${slide.subtitle}</p>
      <div style="display: flex; gap: 60px; margin-top: 40px;">
        <div style="flex: 1;">
          <table>
            <tr>
              <th>UPGRADE ITEM</th>
              <th style="text-align: right;">COST</th>
              <th style="text-align: right;">REBATE</th>
              <th style="text-align: right;">NET</th>
            </tr>
            ${items.map(item => `
              <tr>
                <td>${item.item}</td>
                <td style="text-align: right;">$${item.cost.toLocaleString()}</td>
                <td style="text-align: right; color: #00EAD3;">-$${item.rebate.toLocaleString()}</td>
                <td style="text-align: right; font-weight: 600;">$${(item.cost - item.rebate).toLocaleString()}</td>
              </tr>
            `).join('')}
            <tr class="highlight-row">
              <td><strong>TOTAL</strong></td>
              <td style="text-align: right;"><strong>$${(c.totalCost as number).toLocaleString()}</strong></td>
              <td style="text-align: right; color: #00EAD3;"><strong>-$${(c.totalRebates as number).toLocaleString()}</strong></td>
              <td style="text-align: right;"><strong>$${(c.netInvestment as number).toLocaleString()}</strong></td>
            </tr>
          </table>
        </div>
        <div style="flex: 1;">
          <div class="card aqua-border" style="text-align: center; margin-bottom: 20px;">
            <p class="label">ANNUAL GAS SAVINGS</p>
            <p class="hero-number" style="font-size: 64px;">$${(c.annualGasSavings as number).toLocaleString()}</p>
          </div>
          <div class="card" style="text-align: center;">
            <p class="label">GAS SUPPLY CHARGE SAVED</p>
            <p style="font-size: 36px; color: #00EAD3;">$${Math.round(c.gasSupplyChargeSaved as number).toLocaleString()}/year</p>
          </div>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

function generateEnvironmentalSlide(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const benefits = (c.benefits as Array<{ icon: string; title: string; description: string }>) || [];
  
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="Lightning Energy" />
      <h1 class="slide-title">${slide.title}</h1>
      <p class="slide-subtitle">${slide.subtitle}</p>
      <div style="display: flex; gap: 60px; margin-top: 40px;">
        <div style="flex: 1;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="card aqua-border" style="text-align: center;">
              <p class="label">ANNUAL CO2 REDUCTION</p>
              <p class="hero-number" style="font-size: 48px;">${(c.co2ReductionTonnes as number).toFixed(1)}<span style="font-size: 20px;">t</span></p>
            </div>
            <div class="card" style="text-align: center;">
              <p class="label">25-YEAR CO2 REDUCTION</p>
              <p class="hero-number white" style="font-size: 48px;">${(c.twentyFiveYearCO2 as number).toFixed(0)}<span style="font-size: 20px;">t</span></p>
            </div>
            <div class="card" style="text-align: center;">
              <p class="label">TREES EQUIVALENT</p>
              <p style="font-size: 36px; color: #00EAD3;">${c.treesEquivalent} trees/year</p>
            </div>
            <div class="card" style="text-align: center;">
              <p class="label">CARS OFF ROAD</p>
              <p style="font-size: 36px; color: #f36710;">${c.carsOffRoad} cars</p>
            </div>
          </div>
        </div>
        <div style="flex: 1;">
          <div class="card aqua-border" style="text-align: center; margin-bottom: 30px;">
            <p class="label">ENERGY INDEPENDENCE SCORE</p>
            <p class="hero-number" style="font-size: 72px;">${c.energyIndependenceScore}%</p>
          </div>
          ${benefits.map(b => `
            <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px;">
              <span style="color: #00EAD3; font-size: 24px;">${b.icon === 'leaf' ? '🌿' : b.icon === 'tree' ? '🌳' : '⚡'}</span>
              <div>
                <p style="font-weight: 600; text-transform: uppercase; font-size: 14px;">${b.title}</p>
                <p style="color: #808285; font-size: 13px;">${b.description}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

function generateContactSlide(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const nextSteps = (c.nextSteps as string[]) || [];
  
  return `
    <div class="slide" style="display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
      <img src="${c.logoUrl}" style="width: 120px; height: 120px; margin-bottom: 40px;" alt="Lightning Energy" />
      <h1 class="slide-title" style="font-size: 72px; margin-bottom: 20px;">${slide.title}</h1>
      <p class="slide-subtitle" style="font-size: 28px; margin-bottom: 40px;">${slide.subtitle}</p>
      
      <div style="display: flex; gap: 60px; margin-bottom: 40px;">
        <div style="text-align: left;">
          <p class="label" style="margin-bottom: 10px;">PREPARED BY</p>
          <p style="font-size: 24px; font-weight: 600;">${c.preparedBy}</p>
          <p style="color: #00EAD3;">${c.title}</p>
          <p style="color: #808285; margin-top: 10px;">${c.company}</p>
        </div>
        <div style="text-align: left;">
          <p class="label" style="margin-bottom: 10px;">CONTACT</p>
          <p style="color: #808285;">📞 ${c.phone}</p>
          <p style="color: #808285;">✉️ ${c.email}</p>
          <p style="color: #00EAD3;">🌐 ${c.website}</p>
        </div>
        <div style="text-align: left;">
          <p class="label" style="margin-bottom: 10px;">LOCATION</p>
          <p style="color: #808285;">${c.address}</p>
        </div>
      </div>
      
      <div class="card aqua-border" style="max-width: 800px; text-align: left; padding: 30px;">
        <p class="label" style="color: #00EAD3; margin-bottom: 16px;">YOUR NEXT STEPS</p>
        ${nextSteps.map((step, i) => `
          <p style="color: #FFFFFF; font-size: 16px; margin-bottom: 12px;">
            <span style="color: #f36710; font-weight: 600;">${i + 1}.</span> ${step}
          </p>
        `).join('')}
      </div>
      
      <div class="copyright">${c.copyright}</div>
    </div>
  `;
}
