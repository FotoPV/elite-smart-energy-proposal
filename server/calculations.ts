/**
 * Lightning Energy Proposal Calculation Engine
 * All formulas for usage projections, conversions, savings, and payback calculations
 */

import { Bill, Customer, VppProvider, StateRebate, ProposalCalculations, VppComparisonItem } from "../drizzle/schema";

// ============================================
// CONSTANTS
// ============================================

export const CONSTANTS = {
  // Conversion factors
  GAS_MJ_TO_KWH: 0.2778,
  
  // Heat pump efficiency (COP)
  HEAT_PUMP_COP_MIN: 3.5,
  HEAT_PUMP_COP_MAX: 4.5,
  HEAT_PUMP_COP_DEFAULT: 4.0,
  
  // EV assumptions
  EV_KM_PER_YEAR: 10000,
  EV_CONSUMPTION_KWH_PER_100KM: 15,
  PETROL_CONSUMPTION_L_PER_100KM: 8,
  PETROL_PRICE_PER_LITRE: 1.80,
  
  // Pool heat pump sizing
  POOL_KW_PER_1000L_MIN: 0.5,
  POOL_KW_PER_1000L_MAX: 0.7,
  
  // CO2 emission factors (kg CO2 per unit)
  CO2_PER_KWH_GRID: 0.79, // Australian average
  CO2_PER_MJ_GAS: 0.0512,
  
  // Default rates (fallback if not extracted)
  DEFAULT_ELECTRICITY_RATE_CENTS: 30,
  DEFAULT_GAS_RATE_CENTS_MJ: 3.5,
  DEFAULT_FEED_IN_TARIFF_CENTS: 5,
  DEFAULT_DAILY_SUPPLY_CHARGE: 1.20,
};

// ============================================
// USAGE PROJECTIONS
// ============================================

export interface UsageProjections {
  dailyAverageKwh: number;
  monthlyUsageKwh: number;
  yearlyUsageKwh: number;
  projectedAnnualCost: number;
  dailyAverageCost: number;
}

export function calculateUsageProjections(electricityBill: Bill): UsageProjections {
  const totalUsage = Number(electricityBill.totalUsageKwh) || 0;
  const billingDays = electricityBill.billingDays || 90;
  const totalAmount = Number(electricityBill.totalAmount) || 0;
  
  const dailyAverageKwh = totalUsage / billingDays;
  const monthlyUsageKwh = dailyAverageKwh * 30;
  const yearlyUsageKwh = dailyAverageKwh * 365;
  
  const dailyAverageCost = totalAmount / billingDays;
  const projectedAnnualCost = dailyAverageCost * 365;
  
  return {
    dailyAverageKwh: round(dailyAverageKwh, 2),
    monthlyUsageKwh: round(monthlyUsageKwh, 2),
    yearlyUsageKwh: round(yearlyUsageKwh, 2),
    projectedAnnualCost: round(projectedAnnualCost, 2),
    dailyAverageCost: round(dailyAverageCost, 2),
  };
}

// ============================================
// GAS ANALYSIS
// ============================================

export interface GasAnalysis {
  annualGasCost: number;
  gasKwhEquivalent: number;
  co2EmissionsKg: number;
  dailyGasCost: number;
}

export function calculateGasAnalysis(gasBill: Bill): GasAnalysis {
  const gasUsageMj = Number(gasBill.gasUsageMj) || 0;
  const totalAmount = Number(gasBill.totalAmount) || 0;
  const billingDays = gasBill.billingDays || 90;
  
  const dailyGasCost = totalAmount / billingDays;
  const annualGasCost = dailyGasCost * 365;
  const gasKwhEquivalent = gasUsageMj * CONSTANTS.GAS_MJ_TO_KWH;
  const co2EmissionsKg = gasUsageMj * CONSTANTS.CO2_PER_MJ_GAS * (365 / billingDays);
  
  return {
    annualGasCost: round(annualGasCost, 2),
    gasKwhEquivalent: round(gasKwhEquivalent, 2),
    co2EmissionsKg: round(co2EmissionsKg, 2),
    dailyGasCost: round(dailyGasCost, 2),
  };
}

// ============================================
// HOT WATER HEAT PUMP SAVINGS
// ============================================

export interface HotWaterSavings {
  currentGasHwsCost: number;
  heatPumpAnnualCost: number;
  annualSavings: number;
  dailySupplySaved: number;
}

export function calculateHotWaterSavings(
  gasBill: Bill,
  electricityRate: number = CONSTANTS.DEFAULT_ELECTRICITY_RATE_CENTS,
  hotWaterPercentOfGas: number = 0.4 // Typically 40% of gas usage is hot water
): HotWaterSavings {
  const gasUsageMj = Number(gasBill.gasUsageMj) || 0;
  const gasRate = Number(gasBill.gasRateCentsMj) || CONSTANTS.DEFAULT_GAS_RATE_CENTS_MJ;
  const dailySupply = Number(gasBill.dailySupplyCharge) || CONSTANTS.DEFAULT_DAILY_SUPPLY_CHARGE;
  const billingDays = gasBill.billingDays || 90;
  
  // Calculate hot water portion
  const hwsGasUsageMj = gasUsageMj * hotWaterPercentOfGas;
  const hwsGasKwh = hwsGasUsageMj * CONSTANTS.GAS_MJ_TO_KWH;
  
  // Annual gas HWS cost
  const currentGasHwsCost = (hwsGasUsageMj * gasRate / 100) * (365 / billingDays);
  
  // Heat pump annual cost (much more efficient due to COP)
  const heatPumpKwh = hwsGasKwh / CONSTANTS.HEAT_PUMP_COP_DEFAULT;
  const heatPumpAnnualCost = (heatPumpKwh * electricityRate / 100) * (365 / billingDays);
  
  // Daily supply saved (if removing gas connection entirely)
  const dailySupplySaved = dailySupply * 365;
  
  const annualSavings = currentGasHwsCost - heatPumpAnnualCost;
  
  return {
    currentGasHwsCost: round(currentGasHwsCost, 2),
    heatPumpAnnualCost: round(heatPumpAnnualCost, 2),
    annualSavings: round(annualSavings, 2),
    dailySupplySaved: round(dailySupplySaved, 2),
  };
}

// ============================================
// HEATING/COOLING SAVINGS
// ============================================

export interface HeatingCoolingSavings {
  currentGasHeatingCost: number;
  rcAcAnnualCost: number;
  annualSavings: number;
  additionalCoolingBenefit: boolean;
}

export function calculateHeatingCoolingSavings(
  gasBill: Bill,
  electricityRate: number = CONSTANTS.DEFAULT_ELECTRICITY_RATE_CENTS,
  heatingPercentOfGas: number = 0.35 // Typically 35% of gas usage is heating
): HeatingCoolingSavings {
  const gasUsageMj = Number(gasBill.gasUsageMj) || 0;
  const gasRate = Number(gasBill.gasRateCentsMj) || CONSTANTS.DEFAULT_GAS_RATE_CENTS_MJ;
  const billingDays = gasBill.billingDays || 90;
  
  // Calculate heating portion
  const heatingGasUsageMj = gasUsageMj * heatingPercentOfGas;
  const heatingGasKwh = heatingGasUsageMj * CONSTANTS.GAS_MJ_TO_KWH;
  
  // Annual gas heating cost
  const currentGasHeatingCost = (heatingGasUsageMj * gasRate / 100) * (365 / billingDays);
  
  // RC AC annual cost (much more efficient due to COP)
  const rcAcKwh = heatingGasKwh / CONSTANTS.HEAT_PUMP_COP_DEFAULT;
  const rcAcAnnualCost = (rcAcKwh * electricityRate / 100) * (365 / billingDays);
  
  const annualSavings = currentGasHeatingCost - rcAcAnnualCost;
  
  return {
    currentGasHeatingCost: round(currentGasHeatingCost, 2),
    rcAcAnnualCost: round(rcAcAnnualCost, 2),
    annualSavings: round(annualSavings, 2),
    additionalCoolingBenefit: true, // RC AC provides cooling in summer
  };
}

// ============================================
// COOKING SAVINGS
// ============================================

export interface CookingSavings {
  currentGasCookingCost: number;
  inductionAnnualCost: number;
  annualSavings: number;
}

export function calculateCookingSavings(
  gasBill: Bill,
  electricityRate: number = CONSTANTS.DEFAULT_ELECTRICITY_RATE_CENTS,
  cookingPercentOfGas: number = 0.05 // Typically 5% of gas usage is cooking
): CookingSavings {
  const gasUsageMj = Number(gasBill.gasUsageMj) || 0;
  const gasRate = Number(gasBill.gasRateCentsMj) || CONSTANTS.DEFAULT_GAS_RATE_CENTS_MJ;
  const billingDays = gasBill.billingDays || 90;
  
  // Calculate cooking portion
  const cookingGasUsageMj = gasUsageMj * cookingPercentOfGas;
  const cookingGasKwh = cookingGasUsageMj * CONSTANTS.GAS_MJ_TO_KWH;
  
  // Annual gas cooking cost
  const currentGasCookingCost = (cookingGasUsageMj * gasRate / 100) * (365 / billingDays);
  
  // Induction is about 90% efficient vs gas 40%, so roughly 2.25x more efficient
  const inductionKwh = cookingGasKwh / 2.25;
  const inductionAnnualCost = (inductionKwh * electricityRate / 100) * (365 / billingDays);
  
  const annualSavings = currentGasCookingCost - inductionAnnualCost;
  
  return {
    currentGasCookingCost: round(currentGasCookingCost, 2),
    inductionAnnualCost: round(inductionAnnualCost, 2),
    annualSavings: round(annualSavings, 2),
  };
}

// ============================================
// POOL HEAT PUMP
// ============================================

export interface PoolHeatPumpAnalysis {
  recommendedKw: number;
  annualOperatingCost: number;
  estimatedSavingsVsGas: number;
}

export function calculatePoolHeatPump(
  poolVolumeLitres: number,
  electricityRate: number = CONSTANTS.DEFAULT_ELECTRICITY_RATE_CENTS,
  hoursPerDay: number = 8,
  monthsPerYear: number = 6 // Typically used 6 months
): PoolHeatPumpAnalysis {
  // Recommended kW based on pool volume
  const avgFactor = (CONSTANTS.POOL_KW_PER_1000L_MIN + CONSTANTS.POOL_KW_PER_1000L_MAX) / 2;
  const recommendedKw = (poolVolumeLitres / 1000) * avgFactor;
  
  // Operating cost calculation
  const daysPerYear = monthsPerYear * 30;
  const kwhPerYear = recommendedKw * hoursPerDay * daysPerYear / CONSTANTS.HEAT_PUMP_COP_DEFAULT;
  const annualOperatingCost = kwhPerYear * electricityRate / 100;
  
  // Estimated savings vs gas pool heater (gas is typically 3-4x more expensive)
  const estimatedGasCost = annualOperatingCost * 3.5;
  const estimatedSavingsVsGas = estimatedGasCost - annualOperatingCost;
  
  return {
    recommendedKw: round(recommendedKw, 1),
    annualOperatingCost: round(annualOperatingCost, 2),
    estimatedSavingsVsGas: round(estimatedSavingsVsGas, 2),
  };
}

// ============================================
// VPP INCOME ESTIMATION
// ============================================

export interface VppIncome {
  dailyCreditAnnual: number;
  eventPaymentsAnnual: number;
  bundleDiscount: number;
  totalAnnualValue: number;
}

export function calculateVppIncome(provider: VppProvider): VppIncome {
  const dailyCredit = Number(provider.dailyCredit) || 0;
  const eventPayment = Number(provider.eventPayment) || 0;
  const eventsPerYear = provider.estimatedEventsPerYear || 10;
  const bundleDiscount = Number(provider.bundleDiscount) || 0;
  
  const dailyCreditAnnual = dailyCredit * 365;
  const eventPaymentsAnnual = eventPayment * eventsPerYear;
  const totalAnnualValue = dailyCreditAnnual + eventPaymentsAnnual + bundleDiscount;
  
  return {
    dailyCreditAnnual: round(dailyCreditAnnual, 2),
    eventPaymentsAnnual: round(eventPaymentsAnnual, 2),
    bundleDiscount: round(bundleDiscount, 2),
    totalAnnualValue: round(totalAnnualValue, 2),
  };
}

export function compareVppProviders(
  providers: VppProvider[],
  customerState: string,
  needsGasBundle: boolean
): VppComparisonItem[] {
  return providers
    .filter(p => {
      const states = p.availableStates as string[] | null;
      if (!states?.includes(customerState)) return false;
      if (needsGasBundle && !p.hasGasBundle) return false;
      return true;
    })
    .map(p => {
      const income = calculateVppIncome(p);
      return {
        provider: p.name,
        programName: p.programName || '',
        hasGasBundle: p.hasGasBundle || false,
        estimatedAnnualValue: income.totalAnnualValue,
        strategicFit: getStrategicFit(income.totalAnnualValue, needsGasBundle, p.hasGasBundle || false),
      };
    })
    .sort((a, b) => b.estimatedAnnualValue - a.estimatedAnnualValue);
}

function getStrategicFit(
  annualValue: number,
  needsGasBundle: boolean,
  hasGasBundle: boolean
): "excellent" | "good" | "moderate" | "poor" {
  let score = 0;
  
  if (annualValue >= 500) score += 3;
  else if (annualValue >= 300) score += 2;
  else if (annualValue >= 100) score += 1;
  
  if (needsGasBundle && hasGasBundle) score += 2;
  else if (!needsGasBundle) score += 1;
  
  if (score >= 4) return "excellent";
  if (score >= 3) return "good";
  if (score >= 2) return "moderate";
  return "poor";
}

// ============================================
// EV SAVINGS
// ============================================

export interface EvSavings {
  petrolAnnualCost: number;
  evGridChargeCost: number;
  evSolarChargeCost: number;
  savingsVsPetrol: number;
  savingsWithSolar: number;
}

export function calculateEvSavings(
  electricityRate: number = CONSTANTS.DEFAULT_ELECTRICITY_RATE_CENTS,
  kmPerYear: number = CONSTANTS.EV_KM_PER_YEAR
): EvSavings {
  // Petrol cost
  const litresPerYear = (kmPerYear / 100) * CONSTANTS.PETROL_CONSUMPTION_L_PER_100KM;
  const petrolAnnualCost = litresPerYear * CONSTANTS.PETROL_PRICE_PER_LITRE;
  
  // EV grid charging cost
  const kwhPerYear = (kmPerYear / 100) * CONSTANTS.EV_CONSUMPTION_KWH_PER_100KM;
  const evGridChargeCost = kwhPerYear * electricityRate / 100;
  
  // EV solar charging cost (essentially free)
  const evSolarChargeCost = 0;
  
  return {
    petrolAnnualCost: round(petrolAnnualCost, 2),
    evGridChargeCost: round(evGridChargeCost, 2),
    evSolarChargeCost: round(evSolarChargeCost, 2),
    savingsVsPetrol: round(petrolAnnualCost - evGridChargeCost, 2),
    savingsWithSolar: round(petrolAnnualCost - evSolarChargeCost, 2),
  };
}

// ============================================
// BATTERY SIZING
// ============================================

export interface BatteryRecommendation {
  recommendedKwh: number;
  reasoning: string;
  estimatedCost: number;
}

export function calculateBatterySize(
  dailyUsageKwh: number,
  hasEv: boolean,
  vppParticipation: boolean
): BatteryRecommendation {
  // Base: cover evening/night usage (typically 40-50% of daily)
  let recommendedKwh = dailyUsageKwh * 0.45;
  let reasoning = "Sized to cover typical evening/overnight usage";
  
  // Add for EV charging
  if (hasEv) {
    recommendedKwh += 5; // Extra 5kWh for EV charging buffer
    reasoning += ", plus EV charging capacity";
  }
  
  // Add for VPP participation
  if (vppParticipation) {
    recommendedKwh = Math.max(recommendedKwh, 10); // Minimum 10kWh for VPP
    reasoning += ", optimized for VPP participation";
  }
  
  // Round to nearest standard size
  const standardSizes = [5, 7, 10, 13, 15, 20, 26, 30];
  recommendedKwh = standardSizes.reduce((prev, curr) => 
    Math.abs(curr - recommendedKwh) < Math.abs(prev - recommendedKwh) ? curr : prev
  );
  
  // Estimated cost ($800-1000 per kWh installed)
  const estimatedCost = recommendedKwh * 900;
  
  return {
    recommendedKwh,
    reasoning,
    estimatedCost: round(estimatedCost, 0),
  };
}

// ============================================
// SOLAR SIZING
// ============================================

export interface SolarRecommendation {
  recommendedKw: number;
  panelCount: number;
  annualGeneration: number;
  estimatedCost: number;
}

export function calculateSolarSize(
  yearlyUsageKwh: number,
  batteryKwh: number,
  hasEv: boolean
): SolarRecommendation {
  // Target: generate 100-120% of annual usage
  let targetGeneration = yearlyUsageKwh * 1.1;
  
  // Add for battery charging
  targetGeneration += batteryKwh * 365 * 0.5; // Assume 50% daily battery cycling
  
  // Add for EV
  if (hasEv) {
    targetGeneration += CONSTANTS.EV_KM_PER_YEAR / 100 * CONSTANTS.EV_CONSUMPTION_KWH_PER_100KM;
  }
  
  // Convert to system size (assume 4 peak sun hours average in Australia)
  const recommendedKw = targetGeneration / (365 * 4);
  
  // Round to nearest 0.5kW
  const roundedKw = Math.ceil(recommendedKw * 2) / 2;
  
  // Panel count (assuming 400W panels)
  const panelCount = Math.ceil(roundedKw * 1000 / 400);
  
  // Annual generation (more accurate)
  const annualGeneration = roundedKw * 365 * 4;
  
  // Estimated cost ($1000-1200 per kW installed)
  const estimatedCost = roundedKw * 1100;
  
  return {
    recommendedKw: roundedKw,
    panelCount,
    annualGeneration: round(annualGeneration, 0),
    estimatedCost: round(estimatedCost, 0),
  };
}

// ============================================
// TOTAL PAYBACK CALCULATION
// ============================================

export interface PaybackAnalysis {
  totalInvestment: number;
  totalRebates: number;
  netInvestment: number;
  totalAnnualBenefit: number;
  paybackYears: number;
  tenYearSavings: number;
  twentyFiveYearSavings: number;
}

export function calculatePayback(
  investments: {
    solar?: number;
    battery?: number;
    heatPumpHw?: number;
    rcAc?: number;
    induction?: number;
    evCharger?: number;
    poolHeatPump?: number;
  },
  rebates: {
    solar?: number;
    battery?: number;
    heatPumpHw?: number;
    rcAc?: number;
  },
  annualSavings: {
    electricity?: number;
    gas?: number;
    vpp?: number;
    ev?: number;
  }
): PaybackAnalysis {
  const totalInvestment = Object.values(investments).reduce((sum, val) => sum + (val || 0), 0);
  const totalRebates = Object.values(rebates).reduce((sum, val) => sum + (val || 0), 0);
  const netInvestment = totalInvestment - totalRebates;
  const totalAnnualBenefit = Object.values(annualSavings).reduce((sum, val) => sum + (val || 0), 0);
  
  const paybackYears = totalAnnualBenefit > 0 ? netInvestment / totalAnnualBenefit : 0;
  const tenYearSavings = (totalAnnualBenefit * 10) - netInvestment;
  const twentyFiveYearSavings = (totalAnnualBenefit * 25) - netInvestment;
  
  return {
    totalInvestment: round(totalInvestment, 0),
    totalRebates: round(totalRebates, 0),
    netInvestment: round(netInvestment, 0),
    totalAnnualBenefit: round(totalAnnualBenefit, 0),
    paybackYears: round(paybackYears, 1),
    tenYearSavings: round(tenYearSavings, 0),
    twentyFiveYearSavings: round(twentyFiveYearSavings, 0),
  };
}

// ============================================
// CO2 REDUCTION
// ============================================

export interface Co2Reduction {
  currentCo2Tonnes: number;
  projectedCo2Tonnes: number;
  reductionTonnes: number;
  reductionPercent: number;
}

export function calculateCo2Reduction(
  currentElectricityKwh: number,
  currentGasMj: number,
  solarGenerationKwh: number,
  gasEliminated: boolean
): Co2Reduction {
  // Current emissions
  const electricityCo2 = currentElectricityKwh * CONSTANTS.CO2_PER_KWH_GRID / 1000;
  const gasCo2 = currentGasMj * CONSTANTS.CO2_PER_MJ_GAS / 1000;
  const currentCo2Tonnes = electricityCo2 + gasCo2;
  
  // Projected emissions (with solar offsetting grid usage)
  const netGridUsage = Math.max(0, currentElectricityKwh - solarGenerationKwh);
  const projectedElectricityCo2 = netGridUsage * CONSTANTS.CO2_PER_KWH_GRID / 1000;
  const projectedGasCo2 = gasEliminated ? 0 : gasCo2;
  const projectedCo2Tonnes = projectedElectricityCo2 + projectedGasCo2;
  
  const reductionTonnes = currentCo2Tonnes - projectedCo2Tonnes;
  const reductionPercent = currentCo2Tonnes > 0 ? (reductionTonnes / currentCo2Tonnes) * 100 : 0;
  
  return {
    currentCo2Tonnes: round(currentCo2Tonnes, 2),
    projectedCo2Tonnes: round(projectedCo2Tonnes, 2),
    reductionTonnes: round(reductionTonnes, 2),
    reductionPercent: round(reductionPercent, 1),
  };
}

// ============================================
// FULL PROPOSAL CALCULATIONS
// ============================================

export function generateFullCalculations(
  customer: Customer,
  electricityBill: Bill,
  gasBill: Bill | null,
  vppProviders: VppProvider[],
  rebates: StateRebate[]
): ProposalCalculations {
  // Usage projections
  const usage = calculateUsageProjections(electricityBill);
  const electricityRate = Number(electricityBill.peakRateCents) || CONSTANTS.DEFAULT_ELECTRICITY_RATE_CENTS;
  
  // Gas analysis
  let gasAnalysis: GasAnalysis | null = null;
  let hotWaterSavings: HotWaterSavings | null = null;
  let heatingCoolingSavings: HeatingCoolingSavings | null = null;
  let cookingSavings: CookingSavings | null = null;
  
  if (gasBill) {
    gasAnalysis = calculateGasAnalysis(gasBill);
    hotWaterSavings = calculateHotWaterSavings(gasBill, electricityRate);
    heatingCoolingSavings = calculateHeatingCoolingSavings(gasBill, electricityRate);
    cookingSavings = calculateCookingSavings(gasBill, electricityRate);
  }
  
  // Pool heat pump
  let poolAnalysis: PoolHeatPumpAnalysis | null = null;
  if (customer.hasPool && customer.poolVolume) {
    poolAnalysis = calculatePoolHeatPump(customer.poolVolume, electricityRate);
  }
  
  // EV savings
  let evSavings: EvSavings | null = null;
  if (customer.hasEV || customer.evInterest === 'interested' || customer.evInterest === 'owns') {
    evSavings = calculateEvSavings(electricityRate);
  }
  
  // Battery recommendation
  const battery = calculateBatterySize(
    usage.dailyAverageKwh,
    customer.hasEV || false,
    true // Assume VPP participation
  );
  
  // Solar recommendation (if no existing system)
  let solar: SolarRecommendation | null = null;
  if (!customer.hasExistingSolar) {
    solar = calculateSolarSize(
      usage.yearlyUsageKwh,
      battery.recommendedKwh,
      customer.hasEV || false
    );
  }
  
  // VPP comparison
  const vppComparison = compareVppProviders(
    vppProviders,
    customer.state,
    gasBill !== null // Needs gas bundle if they have gas
  );
  const selectedVpp = vppComparison[0];
  const vppIncome = selectedVpp ? calculateVppIncome(
    vppProviders.find(p => p.name === selectedVpp.provider)!
  ) : null;
  
  // Calculate rebates
  const solarRebate = rebates.find(r => r.rebateType === 'solar');
  const batteryRebate = rebates.find(r => r.rebateType === 'battery');
  const heatPumpHwRebate = rebates.find(r => r.rebateType === 'heat_pump_hw');
  const heatPumpAcRebate = rebates.find(r => r.rebateType === 'heat_pump_ac');
  
  // Payback calculation
  const payback = calculatePayback(
    {
      solar: solar?.estimatedCost,
      battery: battery.estimatedCost,
      heatPumpHw: gasBill ? 3500 : undefined, // Typical heat pump HW cost
      rcAc: gasBill ? 8000 : undefined, // Typical RC AC cost
      induction: gasBill ? 2000 : undefined, // Typical induction cost
      evCharger: customer.hasEV ? 1500 : undefined,
      poolHeatPump: poolAnalysis ? 4000 : undefined,
    },
    {
      solar: solarRebate ? Number(solarRebate.amount) : 0,
      battery: batteryRebate ? Number(batteryRebate.amount) : 0,
      heatPumpHw: heatPumpHwRebate ? Number(heatPumpHwRebate.amount) : 0,
      rcAc: heatPumpAcRebate ? Number(heatPumpAcRebate.amount) : 0,
    },
    {
      electricity: solar ? usage.projectedAnnualCost * 0.7 : 0, // 70% reduction with solar
      gas: gasAnalysis ? gasAnalysis.annualGasCost : 0,
      vpp: vppIncome?.totalAnnualValue,
      ev: evSavings?.savingsWithSolar,
    }
  );
  
  // CO2 reduction
  const co2 = calculateCo2Reduction(
    usage.yearlyUsageKwh,
    gasBill ? Number(gasBill.gasUsageMj) * (365 / (gasBill.billingDays || 90)) : 0,
    solar?.annualGeneration || 0,
    gasBill !== null
  );
  
  // Calculate charge breakdowns
  const billingDays = electricityBill.billingDays || 90;
  const dailySupply = Number(electricityBill.dailySupplyCharge) || CONSTANTS.DEFAULT_DAILY_SUPPLY_CHARGE;
  const annualSupplyCharge = round(dailySupply * 365, 2);
  const feedInTariff = Number(electricityBill.feedInTariffCents) || CONSTANTS.DEFAULT_FEED_IN_TARIFF_CENTS;
  const solarExports = Number(electricityBill.solarExportsKwh) || 0;
  const annualSolarCredit = round((solarExports * feedInTariff / 100) * (365 / billingDays), 2);
  const annualUsageCharge = round(usage.projectedAnnualCost - annualSupplyCharge + annualSolarCredit, 2);
  
  // Gas supply charge annual
  const gasAnnualSupplyCharge = gasBill ? round((Number(gasBill.dailySupplyCharge) || 0) * 365, 2) : undefined;
  
  // Investment amounts
  const investSolar = solar?.estimatedCost;
  const investBattery = battery.estimatedCost;
  const investHeatPumpHw = gasBill ? 3500 : undefined;
  const investRcAc = gasBill ? 8000 : undefined;
  const investInduction = gasBill ? 2000 : undefined;
  const investEvCharger = customer.hasEV ? 1500 : undefined;
  const investPoolHeatPump = poolAnalysis ? 4000 : undefined;
  
  return {
    // ========== RAW BILL DATA ==========
    billRetailer: electricityBill.retailer || undefined,
    billPeriodStart: electricityBill.billingPeriodStart?.toISOString().split('T')[0],
    billPeriodEnd: electricityBill.billingPeriodEnd?.toISOString().split('T')[0],
    billDays: electricityBill.billingDays || undefined,
    billTotalAmount: Number(electricityBill.totalAmount) || undefined,
    billDailySupplyCharge: Number(electricityBill.dailySupplyCharge) || undefined,
    billTotalUsageKwh: Number(electricityBill.totalUsageKwh) || undefined,
    billPeakUsageKwh: Number(electricityBill.peakUsageKwh) || undefined,
    billOffPeakUsageKwh: Number(electricityBill.offPeakUsageKwh) || undefined,
    billShoulderUsageKwh: Number(electricityBill.shoulderUsageKwh) || undefined,
    billSolarExportsKwh: Number(electricityBill.solarExportsKwh) || undefined,
    billPeakRateCents: Number(electricityBill.peakRateCents) || undefined,
    billOffPeakRateCents: Number(electricityBill.offPeakRateCents) || undefined,
    billShoulderRateCents: Number(electricityBill.shoulderRateCents) || undefined,
    billFeedInTariffCents: Number(electricityBill.feedInTariffCents) || undefined,
    
    // Gas Bill Details
    gasBillRetailer: gasBill?.retailer || undefined,
    gasBillPeriodStart: gasBill?.billingPeriodStart?.toISOString().split('T')[0],
    gasBillPeriodEnd: gasBill?.billingPeriodEnd?.toISOString().split('T')[0],
    gasBillDays: gasBill?.billingDays || undefined,
    gasBillTotalAmount: gasBill ? Number(gasBill.totalAmount) || undefined : undefined,
    gasBillDailySupplyCharge: gasBill ? Number(gasBill.dailySupplyCharge) || undefined : undefined,
    gasBillUsageMj: gasBill ? Number(gasBill.gasUsageMj) || undefined : undefined,
    gasBillRateCentsMj: gasBill ? Number(gasBill.gasRateCentsMj) || undefined : undefined,
    
    // ========== USAGE PROJECTIONS ==========
    dailyAverageKwh: usage.dailyAverageKwh,
    monthlyUsageKwh: usage.monthlyUsageKwh,
    yearlyUsageKwh: usage.yearlyUsageKwh,
    projectedAnnualCost: usage.projectedAnnualCost,
    dailyAverageCost: usage.dailyAverageCost,
    annualSupplyCharge,
    annualUsageCharge,
    annualSolarCredit,
    
    // ========== GAS ANALYSIS ==========
    gasAnnualCost: gasAnalysis?.annualGasCost,
    gasKwhEquivalent: gasAnalysis?.gasKwhEquivalent,
    gasCo2Emissions: gasAnalysis?.co2EmissionsKg,
    gasDailyGasCost: gasAnalysis?.dailyGasCost,
    gasAnnualSupplyCharge,
    
    // ========== ELECTRIFICATION DETAIL ==========
    hotWaterSavings: hotWaterSavings?.annualSavings,
    hotWaterCurrentGasCost: hotWaterSavings?.currentGasHwsCost,
    hotWaterHeatPumpCost: hotWaterSavings?.heatPumpAnnualCost,
    hotWaterDailySupplySaved: hotWaterSavings?.dailySupplySaved,
    
    heatingCoolingSavings: heatingCoolingSavings?.annualSavings,
    heatingCurrentGasCost: heatingCoolingSavings?.currentGasHeatingCost,
    heatingRcAcCost: heatingCoolingSavings?.rcAcAnnualCost,
    
    cookingSavings: cookingSavings?.annualSavings,
    cookingCurrentGasCost: cookingSavings?.currentGasCookingCost,
    cookingInductionCost: cookingSavings?.inductionAnnualCost,
    
    poolHeatPumpSavings: poolAnalysis?.estimatedSavingsVsGas,
    poolRecommendedKw: poolAnalysis?.recommendedKw,
    poolAnnualOperatingCost: poolAnalysis?.annualOperatingCost,
    
    // ========== BATTERY ==========
    recommendedBatteryKwh: battery.recommendedKwh,
    batteryProduct: "Sigenergy SigenStor",
    batteryPaybackYears: payback.paybackYears,
    batteryEstimatedCost: battery.estimatedCost,
    
    // ========== SOLAR ==========
    recommendedSolarKw: solar?.recommendedKw,
    solarPanelCount: solar?.panelCount,
    solarAnnualGeneration: solar?.annualGeneration,
    solarEstimatedCost: solar?.estimatedCost,
    
    // ========== VPP ==========
    selectedVppProvider: selectedVpp?.provider,
    vppAnnualValue: vppIncome?.totalAnnualValue,
    vppDailyCreditAnnual: vppIncome?.dailyCreditAnnual,
    vppEventPaymentsAnnual: vppIncome?.eventPaymentsAnnual,
    vppBundleDiscount: vppIncome?.bundleDiscount,
    vppProviderComparison: vppComparison,
    
    // ========== EV ==========
    evPetrolCost: evSavings?.petrolAnnualCost,
    evGridChargeCost: evSavings?.evGridChargeCost,
    evSolarChargeCost: evSavings?.evSolarChargeCost,
    evAnnualSavings: evSavings?.savingsWithSolar,
    evKmPerYear: CONSTANTS.EV_KM_PER_YEAR,
    evConsumptionPer100km: CONSTANTS.EV_CONSUMPTION_KWH_PER_100KM,
    evPetrolPricePerLitre: CONSTANTS.PETROL_PRICE_PER_LITRE,
    
    // ========== CO2 ==========
    co2ReductionTonnes: co2.reductionTonnes,
    co2CurrentTonnes: co2.currentCo2Tonnes,
    co2ProjectedTonnes: co2.projectedCo2Tonnes,
    co2ReductionPercent: co2.reductionPercent,
    
    // ========== REBATES DETAIL ==========
    solarRebateAmount: solarRebate ? Number(solarRebate.amount) : undefined,
    batteryRebateAmount: batteryRebate ? Number(batteryRebate.amount) : undefined,
    heatPumpHwRebateAmount: heatPumpHwRebate ? Number(heatPumpHwRebate.amount) : undefined,
    heatPumpAcRebateAmount: heatPumpAcRebate ? Number(heatPumpAcRebate.amount) : undefined,
    
    // ========== INVESTMENT DETAIL ==========
    investmentSolar: investSolar,
    investmentBattery: investBattery,
    investmentHeatPumpHw: investHeatPumpHw,
    investmentRcAc: investRcAc,
    investmentInduction: investInduction,
    investmentEvCharger: investEvCharger,
    investmentPoolHeatPump: investPoolHeatPump,
    
    // ========== TOTAL SUMMARY ==========
    totalAnnualSavings: payback.totalAnnualBenefit,
    totalInvestment: payback.totalInvestment,
    totalRebates: payback.totalRebates,
    netInvestment: payback.netInvestment,
    paybackYears: payback.paybackYears,
    tenYearSavings: payback.tenYearSavings,
    twentyFiveYearSavings: payback.twentyFiveYearSavings,
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
