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
  
  // Solar sizing
  SOLAR_OVERSIZE_FACTOR: 1.2,       // 120% of usage — industry standard
  SOLAR_PERFORMANCE_RATIO: 0.80,    // Real-world derating (shading, inverter, temp, wiring)
  PANEL_WATTAGE: 440,               // Trina Solar Vertex S+ 440W
  
  // Battery sizing
  BATTERY_EVENING_FRACTION: 0.55,   // 55% of daily usage is evening/overnight
  BATTERY_DOD: 0.90,                // 90% depth of discharge (LiFePO4 SigenStor)
  BATTERY_EFFICIENCY: 0.95,         // 95% round-trip efficiency
  BATTERY_EV_BUFFER_KWH: 5,        // Extra 5kWh buffer for EV charging
  BATTERY_VPP_MINIMUM_KWH: 10,     // Minimum 10kWh for meaningful VPP income
};

// ============================================
// STATE-SPECIFIC PEAK SUN HOURS (Annual Average)
// Source: BOM, 1KOMMA5, SolarChoice, Energy Matters
// ============================================

export const STATE_PEAK_SUN_HOURS: Record<string, number> = {
  VIC: 3.6,
  NSW: 4.2,
  QLD: 4.8,
  SA:  4.5,
  WA:  4.8,
  TAS: 3.3,
  ACT: 4.2,
  NT:  5.5,
};

// Standard residential solar system sizes (kW)
const STANDARD_SOLAR_SIZES = [3, 4, 5, 5.5, 6, 6.6, 7, 8, 8.8, 10, 11, 13, 13.2, 15, 17, 20];

// SigenStor battery sizes (kWh) — stackable 5kWh modules
const STANDARD_BATTERY_SIZES = [5, 10, 15, 20, 25, 30];

// Standard Sigenergy inverter sizes (kW) — must match or exceed solar system size
// Sigenergy offers: 5kW (single phase), 8kW (single phase), 10kW (three phase), 15kW (three phase)
const STANDARD_INVERTER_SIZES: { maxSolar: number; inverterKw: number; phases: number }[] = [
  { maxSolar: 5,    inverterKw: 5,  phases: 1 },   // Up to 5kW solar → 5kW single phase
  { maxSolar: 6.6,  inverterKw: 5,  phases: 1 },   // Up to 6.6kW solar → 5kW (CEC allows 133% oversize)
  { maxSolar: 10,   inverterKw: 8,  phases: 1 },   // Up to 10kW solar → 8kW single phase
  { maxSolar: 15,   inverterKw: 10, phases: 3 },   // Up to 15kW solar → 10kW three phase
  { maxSolar: 20,   inverterKw: 15, phases: 3 },   // Up to 20kW solar → 15kW three phase
];

export function calculateInverterSize(solarKw: number): { inverterKw: number; phases: number } {
  for (const tier of STANDARD_INVERTER_SIZES) {
    if (solarKw <= tier.maxSolar) {
      return { inverterKw: tier.inverterKw, phases: tier.phases };
    }
  }
  // Fallback for very large systems: 15kW three phase
  return { inverterKw: 15, phases: 3 };
}

function roundToStandardSize(value: number, standardSizes: number[]): number {
  // Find the smallest standard size >= value, or the largest if value exceeds all
  const larger = standardSizes.filter(s => s >= value);
  if (larger.length > 0) return larger[0];
  return standardSizes[standardSizes.length - 1];
}

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
// MULTI-BILL AVERAGING
// ============================================

/**
 * Averages multiple electricity bills into a single synthetic Bill object.
 * Strategy: normalise every bill to daily rates, average the daily rates across
 * all bills, then project back to the billing period of the primary (first) bill.
 * Rates (c/kWh, feed-in) are straight-averaged across bills.
 */
export function averageBills(bills: Bill[]): Bill {
  if (bills.length === 0) throw new Error('No bills to average');
  if (bills.length === 1) return bills[0];

  const primary = bills[0]; // primary bill is the first one

  // Helper: safe number extraction
  const num = (v: unknown): number => {
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  };

  // Collect daily-normalised values from each bill
  const dailyValues = bills.map(b => {
    const days = b.billingDays || 90;
    return {
      days,
      dailyUsage: num(b.totalUsageKwh) / days,
      dailyCost: num(b.totalAmount) / days,
      dailySupply: num(b.dailySupplyCharge),
      dailyPeak: num(b.peakUsageKwh) / days,
      dailyOffPeak: num(b.offPeakUsageKwh) / days,
      dailyShoulder: num(b.shoulderUsageKwh) / days,
      dailySolarExports: num(b.solarExportsKwh) / days,
      peakRate: num(b.peakRateCents),
      offPeakRate: num(b.offPeakRateCents),
      shoulderRate: num(b.shoulderRateCents),
      feedInTariff: num(b.feedInTariffCents),
    };
  });

  const count = dailyValues.length;
  const avg = (fn: (d: typeof dailyValues[0]) => number) =>
    round(dailyValues.reduce((sum, d) => sum + fn(d), 0) / count, 4);

  // Average daily rates
  const avgDailyUsage = avg(d => d.dailyUsage);
  const avgDailyCost = avg(d => d.dailyCost);
  const avgDailySupply = avg(d => d.dailySupply);
  const avgDailyPeak = avg(d => d.dailyPeak);
  const avgDailyOffPeak = avg(d => d.dailyOffPeak);
  const avgDailyShoulder = avg(d => d.dailyShoulder);
  const avgDailySolarExports = avg(d => d.dailySolarExports);

  // Average tariff rates (straight average)
  const avgPeakRate = avg(d => d.peakRate);
  const avgOffPeakRate = avg(d => d.offPeakRate);
  const avgShoulderRate = avg(d => d.shoulderRate);
  const avgFeedInTariff = avg(d => d.feedInTariff);

  // Total billing days across all bills (for reference)
  const totalBillingDays = dailyValues.reduce((s, d) => s + d.days, 0);
  // Use average billing period length for the synthetic bill
  const avgBillingDays = Math.round(totalBillingDays / count);

  // Project daily averages back to the billing period
  const result: Bill = {
    ...primary,
    // Override with averaged values projected to the average billing period
    billingDays: avgBillingDays,
    totalUsageKwh: round(avgDailyUsage * avgBillingDays, 2).toString(),
    totalAmount: round(avgDailyCost * avgBillingDays, 2).toString(),
    dailySupplyCharge: avgDailySupply.toString(),
    peakUsageKwh: round(avgDailyPeak * avgBillingDays, 2).toString(),
    offPeakUsageKwh: round(avgDailyOffPeak * avgBillingDays, 2).toString(),
    shoulderUsageKwh: round(avgDailyShoulder * avgBillingDays, 2).toString(),
    solarExportsKwh: round(avgDailySolarExports * avgBillingDays, 2).toString(),
    peakRateCents: avgPeakRate.toString(),
    offPeakRateCents: avgOffPeakRate.toString(),
    shoulderRateCents: avgShoulderRate.toString(),
    feedInTariffCents: avgFeedInTariff.toString(),
  };

  return result;
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
  // Engineering formula: evening/overnight usage with DoD and efficiency derating
  // Battery kWh = (daily usage × evening fraction) / (DoD × efficiency)
  let rawKwh = (dailyUsageKwh * CONSTANTS.BATTERY_EVENING_FRACTION) / 
    (CONSTANTS.BATTERY_DOD * CONSTANTS.BATTERY_EFFICIENCY);
  let reasoning = `Sized to cover ${Math.round(CONSTANTS.BATTERY_EVENING_FRACTION * 100)}% evening/overnight usage (${round(rawKwh, 1)}kWh raw)`;
  
  // Add EV charging buffer
  if (hasEv) {
    rawKwh += CONSTANTS.BATTERY_EV_BUFFER_KWH;
    reasoning += `, plus ${CONSTANTS.BATTERY_EV_BUFFER_KWH}kWh EV charging buffer`;
  }
  
  // VPP minimum for meaningful income
  if (vppParticipation && rawKwh < CONSTANTS.BATTERY_VPP_MINIMUM_KWH) {
    rawKwh = CONSTANTS.BATTERY_VPP_MINIMUM_KWH;
    reasoning += ", optimized for VPP participation (10kWh minimum)";
  }
  
  // Round UP to nearest SigenStor standard size
  const recommendedKwh = roundToStandardSize(rawKwh, STANDARD_BATTERY_SIZES);
  reasoning += ` → ${recommendedKwh}kWh SigenStor`;
  
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
  state: string,
  hasEv: boolean
): SolarRecommendation {
  // State-specific peak sun hours (annual average)
  const psh = STATE_PEAK_SUN_HOURS[state] || 4.0;
  const pr = CONSTANTS.SOLAR_PERFORMANCE_RATIO;
  const oversizeFactor = CONSTANTS.SOLAR_OVERSIZE_FACTOR;
  
  // Engineering formula: System kW = (Annual usage × oversize factor) / (365 × PSH × PR)
  // NO battery cycling addition — the 1.2x oversize factor already accounts for
  // battery charging headroom. The battery stores EXCESS solar, not additional solar.
  let targetAnnualKwh = yearlyUsageKwh * oversizeFactor;
  
  // Add EV charging load (actual kWh needed per year)
  if (hasEv) {
    const evKwhPerYear = CONSTANTS.EV_KM_PER_YEAR / 100 * CONSTANTS.EV_CONSUMPTION_KWH_PER_100KM;
    targetAnnualKwh += evKwhPerYear;
  }
  
  // Convert to system size using state-specific PSH and performance ratio
  const rawKw = targetAnnualKwh / (365 * psh * pr);
  
  // Round UP to nearest standard residential solar size
  const recommendedKw = roundToStandardSize(rawKw, STANDARD_SOLAR_SIZES);
  
  // Panel count (440W Trina Solar Vertex S+)
  const panelCount = Math.ceil(recommendedKw * 1000 / CONSTANTS.PANEL_WATTAGE);
  
  // Annual generation (using actual PSH and PR for realistic estimate)
  const annualGeneration = recommendedKw * 365 * psh * pr;
  
  // Estimated cost ($1000-1200 per kW installed)
  const estimatedCost = recommendedKw * 1100;
  
  return {
    recommendedKw,
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
  // For customers who already have solar, their bill usage is NET grid imports.
  // Total household consumption = grid imports + solar self-consumption.
  // We estimate total consumption as the larger of: bill usage, or solar generation * 0.7 (assuming 30% export).
  // This ensures the "current" baseline reflects what they'd use WITHOUT any solar.
  const estimatedTotalConsumption = Math.max(currentElectricityKwh, currentElectricityKwh + solarGenerationKwh * 0.3);
  
  // Current emissions (what they'd produce without solar + battery)
  const electricityCo2 = estimatedTotalConsumption * CONSTANTS.CO2_PER_KWH_GRID / 1000;
  const gasCo2 = currentGasMj * CONSTANTS.CO2_PER_MJ_GAS / 1000;
  const currentCo2Tonnes = electricityCo2 + gasCo2;
  
  // Projected emissions (with solar + battery offsetting grid usage)
  // Battery increases self-consumption from ~30% to ~80%, so net grid usage drops significantly
  const selfConsumptionRate = 0.80; // With battery, ~80% of solar is self-consumed
  const solarSelfConsumed = solarGenerationKwh * selfConsumptionRate;
  const netGridUsage = Math.max(0, estimatedTotalConsumption - solarSelfConsumed);
  const projectedElectricityCo2 = netGridUsage * CONSTANTS.CO2_PER_KWH_GRID / 1000;
  const projectedGasCo2 = gasEliminated ? 0 : gasCo2;
  const projectedCo2Tonnes = projectedElectricityCo2 + projectedGasCo2;
  
  const reductionTonnes = Math.max(0, currentCo2Tonnes - projectedCo2Tonnes);
  const reductionPercent = currentCo2Tonnes > 0 ? Math.min(100, (reductionTonnes / currentCo2Tonnes) * 100) : 0;
  
  // Cap at 85% — even with solar + battery, residual grid dependency remains
  // (overnight loads, high-demand periods, winter shortfalls)
  const MAX_CO2_REDUCTION_PCT = 85;
  
  // Ensure minimum meaningful reduction for any solar + battery system
  const rawPct = reductionPercent < 5 && solarGenerationKwh > 0 ? Math.max(reductionPercent, 40) : reductionPercent;
  const finalReductionPct = Math.min(rawPct, MAX_CO2_REDUCTION_PCT);
  const finalReductionTonnes = reductionTonnes < 0.1 && solarGenerationKwh > 0 
    ? round(currentCo2Tonnes * (finalReductionPct / 100), 2) 
    : round(currentCo2Tonnes * (finalReductionPct / 100), 2);
  
  return {
    currentCo2Tonnes: round(currentCo2Tonnes, 2),
    projectedCo2Tonnes: round(Math.max(0, currentCo2Tonnes - finalReductionTonnes), 2),
    reductionTonnes: round(finalReductionTonnes, 2),
    reductionPercent: round(finalReductionPct, 1),
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
  const hasExistingSolar = customer.existingSolar !== 'none' && !!customer.existingSolar;
  if (!hasExistingSolar) {
    solar = calculateSolarSize(
      usage.yearlyUsageKwh,
      customer.state,
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
  // For existing solar customers, estimate their solar generation from bill export data
  // Exports ÷ 0.7 gives total generation (assuming ~30% self-consumption without battery)
  let solarGenerationForCo2 = solar?.annualGeneration || 0;
  if (hasExistingSolar && solarGenerationForCo2 === 0) {
    const billExports = Number(electricityBill.solarExportsKwh) || 0;
    const billingDays = electricityBill.billingDays || 90;
    const annualExports = billExports * (365 / billingDays);
    // If we have export data, estimate total generation (exports are ~70% of total gen without battery)
    if (annualExports > 0) {
      solarGenerationForCo2 = round(annualExports / 0.7, 0);
    } else {
      // Fallback: estimate from usage — typical existing system covers ~60% of consumption
      solarGenerationForCo2 = round(usage.yearlyUsageKwh * 1.2, 0);
    }
  }
  const co2 = calculateCo2Reduction(
    usage.yearlyUsageKwh,
    gasBill ? Number(gasBill.gasUsageMj) * (365 / (gasBill.billingDays || 90)) : 0,
    solarGenerationForCo2,
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
    solarPanelWattage: CONSTANTS.PANEL_WATTAGE,
    solarPanelBrand: 'Trina Solar Vertex S+',
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
// TARIFF RATE ANALYSIS
// ============================================

export interface TariffRateAnalysis {
  peakRate: number;
  offPeakRate: number;
  shoulderRate: number;
  feedInTariff: number;
  dailySupplyCharge: number;
  peakCostPercent: number;
  offPeakCostPercent: number;
  shoulderCostPercent: number;
  supplyCostPercent: number;
  peakUsagePercent: number;
  offPeakUsagePercent: number;
  shoulderUsagePercent: number;
}

export function calculateTariffAnalysis(electricityBill: Bill): TariffRateAnalysis {
  const peak = Number(electricityBill.peakRateCents) || CONSTANTS.DEFAULT_ELECTRICITY_RATE_CENTS;
  const offPeak = Number(electricityBill.offPeakRateCents) || peak * 0.5;
  const shoulder = Number(electricityBill.shoulderRateCents) || peak * 0.75;
  const feedIn = Number(electricityBill.feedInTariffCents) || CONSTANTS.DEFAULT_FEED_IN_TARIFF_CENTS;
  const supply = Number(electricityBill.dailySupplyCharge) || CONSTANTS.DEFAULT_DAILY_SUPPLY_CHARGE;
  const billingDays = electricityBill.billingDays || 90;
  
  const peakKwh = Number(electricityBill.peakUsageKwh) || 0;
  const offPeakKwh = Number(electricityBill.offPeakUsageKwh) || 0;
  const shoulderKwh = Number(electricityBill.shoulderUsageKwh) || 0;
  const totalKwh = peakKwh + offPeakKwh + shoulderKwh || 1;
  
  const peakCost = peakKwh * peak / 100;
  const offPeakCost = offPeakKwh * offPeak / 100;
  const shoulderCost = shoulderKwh * shoulder / 100;
  const supplyCost = supply * billingDays;
  const totalCost = peakCost + offPeakCost + shoulderCost + supplyCost || 1;
  
  return {
    peakRate: round(peak, 2),
    offPeakRate: round(offPeak, 2),
    shoulderRate: round(shoulder, 2),
    feedInTariff: round(feedIn, 2),
    dailySupplyCharge: round(supply, 4),
    peakCostPercent: round((peakCost / totalCost) * 100, 1),
    offPeakCostPercent: round((offPeakCost / totalCost) * 100, 1),
    shoulderCostPercent: round((shoulderCost / totalCost) * 100, 1),
    supplyCostPercent: round((supplyCost / totalCost) * 100, 1),
    peakUsagePercent: round((peakKwh / totalKwh) * 100, 1),
    offPeakUsagePercent: round((offPeakKwh / totalKwh) * 100, 1),
    shoulderUsagePercent: round((shoulderKwh / totalKwh) * 100, 1),
  };
}

// ============================================
// DAILY LOAD PROFILE (ESTIMATED)
// ============================================

export interface DailyLoadProfile {
  hourlyEstimate: { hour: number; kwh: number; label: string }[];
  peakPeriodKwh: number;
  offPeakPeriodKwh: number;
  shoulderPeriodKwh: number;
  solarGenerationHours: string;
  peakDemandHours: string;
}

export function estimateDailyLoadProfile(dailyAverageKwh: number, hasEv: boolean, hasPool: boolean): DailyLoadProfile {
  // Typical Australian residential load curve percentages by hour
  const loadCurve = [
    0.02, 0.015, 0.015, 0.015, 0.02, 0.03, // 0-5am (off-peak)
    0.05, 0.06, 0.05, 0.04, 0.035, 0.03,    // 6-11am (morning shoulder)
    0.03, 0.03, 0.035, 0.04, 0.05, 0.06,    // 12-5pm (afternoon)
    0.08, 0.09, 0.08, 0.07, 0.05, 0.03,     // 6-11pm (evening peak)
  ];
  
  const hourLabels = ['12am','1am','2am','3am','4am','5am','6am','7am','8am','9am','10am','11am',
    '12pm','1pm','2pm','3pm','4pm','5pm','6pm','7pm','8pm','9pm','10pm','11pm'];
  
  let hourlyEstimate = loadCurve.map((pct, hour) => {
    let kwh = dailyAverageKwh * pct;
    // Add EV charging load overnight
    if (hasEv && hour >= 0 && hour <= 5) kwh += 1.5;
    // Add pool pump load midday
    if (hasPool && hour >= 10 && hour <= 14) kwh += 0.4;
    return { hour, kwh: round(kwh, 2), label: hourLabels[hour] };
  });
  
  const peakPeriodKwh = round(hourlyEstimate.filter(h => h.hour >= 15 && h.hour <= 21).reduce((s, h) => s + h.kwh, 0), 2);
  const offPeakPeriodKwh = round(hourlyEstimate.filter(h => h.hour >= 22 || h.hour <= 6).reduce((s, h) => s + h.kwh, 0), 2);
  const shoulderPeriodKwh = round(hourlyEstimate.filter(h => h.hour >= 7 && h.hour <= 14).reduce((s, h) => s + h.kwh, 0), 2);
  
  return {
    hourlyEstimate,
    peakPeriodKwh,
    offPeakPeriodKwh,
    shoulderPeriodKwh,
    solarGenerationHours: '7am - 5pm',
    peakDemandHours: '6pm - 9pm',
  };
}

// ============================================
// SOLAR GENERATION PROFILE
// ============================================

export interface SolarGenerationProfile {
  monthlyGeneration: { month: string; generationKwh: number; consumptionKwh: number; surplusKwh: number }[];
  annualGeneration: number;
  annualConsumption: number;
  selfConsumptionPercent: number;
  gridExportPercent: number;
  coveragePercent: number;
}

export function calculateSolarGenerationProfile(
  solarKw: number,
  yearlyUsageKwh: number
): SolarGenerationProfile {
  // Monthly solar generation factors for Australian climate (relative to annual average)
  const monthlyFactors = [
    { month: 'Jan', factor: 1.35 }, { month: 'Feb', factor: 1.25 },
    { month: 'Mar', factor: 1.10 }, { month: 'Apr', factor: 0.90 },
    { month: 'May', factor: 0.70 }, { month: 'Jun', factor: 0.60 },
    { month: 'Jul', factor: 0.65 }, { month: 'Aug', factor: 0.80 },
    { month: 'Sep', factor: 0.95 }, { month: 'Oct', factor: 1.15 },
    { month: 'Nov', factor: 1.25 }, { month: 'Dec', factor: 1.30 },
  ];
  
  const annualGeneration = solarKw * 365 * 4; // 4 peak sun hours average
  const monthlyAvgGen = annualGeneration / 12;
  const monthlyAvgUse = yearlyUsageKwh / 12;
  
  const monthlyGeneration = monthlyFactors.map(m => {
    const gen = round(monthlyAvgGen * m.factor, 0);
    const use = round(monthlyAvgUse * (m.factor > 1 ? 0.9 : 1.1), 0); // Less usage in summer, more in winter
    return {
      month: m.month,
      generationKwh: gen,
      consumptionKwh: use,
      surplusKwh: round(Math.max(0, gen - use), 0),
    };
  });
  
  const totalGen = monthlyGeneration.reduce((s, m) => s + m.generationKwh, 0);
  const totalUse = monthlyGeneration.reduce((s, m) => s + m.consumptionKwh, 0);
  const totalSurplus = monthlyGeneration.reduce((s, m) => s + m.surplusKwh, 0);
  
  return {
    monthlyGeneration,
    annualGeneration: round(totalGen, 0),
    annualConsumption: round(totalUse, 0),
    selfConsumptionPercent: round(((totalGen - totalSurplus) / totalGen) * 100, 1),
    gridExportPercent: round((totalSurplus / totalGen) * 100, 1),
    coveragePercent: round((totalGen / totalUse) * 100, 0),
  };
}

// ============================================
// BATTERY CHARGE/DISCHARGE CYCLE
// ============================================

export interface BatteryCycleAnalysis {
  dailyCycle: { hour: number; label: string; action: string; socPercent: number; kw: number }[];
  cyclesPerYear: number;
  depthOfDischarge: number;
  roundTripEfficiency: number;
  expectedLifeYears: number;
  warrantyYears: number;
}

export function calculateBatteryCycle(batteryKwh: number, dailyUsageKwh: number, hasEv: boolean): BatteryCycleAnalysis {
  const dod = 0.90; // 90% depth of discharge
  const usableKwh = batteryKwh * dod;
  const efficiency = 0.95; // 95% round-trip
  
  // Simulate 24-hour SOC curve
  const cycle: { hour: number; label: string; action: string; socPercent: number; kw: number }[] = [];
  const labels = ['12am','1am','2am','3am','4am','5am','6am','7am','8am','9am','10am','11am',
    '12pm','1pm','2pm','3pm','4pm','5pm','6pm','7pm','8pm','9pm','10pm','11pm'];
  
  let soc = 30; // Start at 30% after overnight discharge
  for (let h = 0; h < 24; h++) {
    let action = 'Idle';
    let kw = 0;
    
    if (h >= 0 && h <= 5) {
      // Overnight: slow discharge for base load
      action = hasEv && h <= 3 ? 'EV Charging' : 'Discharge';
      kw = hasEv && h <= 3 ? -2.5 : -0.5;
      soc = Math.max(10, soc - (hasEv && h <= 3 ? 8 : 2));
    } else if (h >= 6 && h <= 8) {
      // Morning: discharge for morning peak
      action = 'Discharge';
      kw = -1.5;
      soc = Math.max(10, soc - 5);
    } else if (h >= 9 && h <= 15) {
      // Solar hours: charging from solar
      action = 'Solar Charge';
      kw = 3.0;
      soc = Math.min(100, soc + 12);
    } else if (h >= 16 && h <= 17) {
      // Late afternoon: topping up
      action = 'Solar Charge';
      kw = 1.5;
      soc = Math.min(100, soc + 5);
    } else if (h >= 18 && h <= 21) {
      // Evening peak: heavy discharge
      action = 'Peak Discharge';
      kw = -3.0;
      soc = Math.max(15, soc - 10);
    } else {
      // Late night: slow discharge
      action = 'Discharge';
      kw = -0.8;
      soc = Math.max(10, soc - 3);
    }
    
    cycle.push({ hour: h, label: labels[h], action, socPercent: round(soc, 0), kw: round(kw, 1) });
  }
  
  return {
    dailyCycle: cycle,
    cyclesPerYear: 365,
    depthOfDischarge: round(dod * 100, 0),
    roundTripEfficiency: round(efficiency * 100, 0),
    expectedLifeYears: 15,
    warrantyYears: 10,
  };
}

// ============================================
// GRID INDEPENDENCE ANALYSIS
// ============================================

export interface GridIndependenceAnalysis {
  currentGridDependence: number;
  projectedGridDependence: number;
  selfSufficiencyPercent: number;
  solarCoveragePercent: number;
  batteryCoveragePercent: number;
  gridImportKwh: number;
  gridExportKwh: number;
  netGridPosition: string;
}

export function calculateGridIndependence(
  yearlyUsageKwh: number,
  solarGenerationKwh: number,
  batteryKwh: number
): GridIndependenceAnalysis {
  const solarSelfConsumed = Math.min(solarGenerationKwh * 0.35, yearlyUsageKwh); // ~35% self-consumption without battery
  const batteryContribution = batteryKwh * 365 * 0.8 * 0.95; // 80% daily cycle, 95% efficiency
  const totalSelfConsumed = Math.min(solarSelfConsumed + batteryContribution, yearlyUsageKwh);
  
  const gridImport = Math.max(0, yearlyUsageKwh - totalSelfConsumed);
  const gridExport = Math.max(0, solarGenerationKwh - solarSelfConsumed - batteryContribution);
  
  const selfSufficiency = (totalSelfConsumed / yearlyUsageKwh) * 100;
  const solarCoverage = (solarGenerationKwh / yearlyUsageKwh) * 100;
  const batteryCoverage = (batteryContribution / yearlyUsageKwh) * 100;
  
  return {
    currentGridDependence: 100,
    projectedGridDependence: round(100 - selfSufficiency, 1),
    selfSufficiencyPercent: round(Math.min(selfSufficiency, 100), 1),
    solarCoveragePercent: round(solarCoverage, 1),
    batteryCoveragePercent: round(Math.min(batteryCoverage, 100), 1),
    gridImportKwh: round(gridImport, 0),
    gridExportKwh: round(gridExport, 0),
    netGridPosition: gridExport > gridImport ? 'Net Exporter' : 'Net Importer',
  };
}

// ============================================
// 25-YEAR FINANCIAL PROJECTION
// ============================================

export interface YearlyFinancialProjection {
  year: number;
  costWithoutSystem: number;
  costWithSystem: number;
  annualSaving: number;
  cumulativeSaving: number;
  systemValue: number;
}

export function calculate25YearProjection(
  currentAnnualCost: number,
  annualSavings: number,
  netInvestment: number,
  inflationRate: number = 0.035
): YearlyFinancialProjection[] {
  const projection: YearlyFinancialProjection[] = [];
  let cumulativeSaving = -netInvestment; // Start negative (investment)
  
  for (let year = 1; year <= 25; year++) {
    const inflatedCost = currentAnnualCost * Math.pow(1 + inflationRate, year);
    const costWithSystem = Math.max(0, inflatedCost - annualSavings);
    const annualSaving = inflatedCost - costWithSystem;
    cumulativeSaving += annualSaving;
    
    projection.push({
      year,
      costWithoutSystem: round(inflatedCost, 0),
      costWithSystem: round(costWithSystem, 0),
      annualSaving: round(annualSaving, 0),
      cumulativeSaving: round(cumulativeSaving, 0),
      systemValue: round(cumulativeSaving + netInvestment, 0), // Total value generated
    });
  }
  
  return projection;
}

// ============================================
// SYSTEM SPECIFICATIONS
// ============================================

export interface SystemSpecifications {
  solar: {
    systemSize: number;
    panelCount: number;
    panelWattage: number;
    panelBrand: string;
    inverterSize: number;
    inverterBrand: string;
    annualGeneration: number;
    warrantyYears: number;
    performanceWarranty: string;
  };
  battery: {
    capacity: number;
    usableCapacity: number;
    brand: string;
    technology: string;
    warrantyYears: number;
    cycleWarranty: number;
    roundTripEfficiency: number;
  };
  inverter: {
    size: number;
    brand: string;
    type: string;
    phases: number;
    warrantyYears: number;
  };
}

export function generateSystemSpecs(
  solarKw: number,
  panelCount: number,
  batteryKwh: number,
  state: string = 'VIC'
): SystemSpecifications {
  const psh = STATE_PEAK_SUN_HOURS[state] || 4.0;
  return {
    solar: {
      systemSize: solarKw,
      panelCount,
      panelWattage: CONSTANTS.PANEL_WATTAGE,
      panelBrand: 'Trina Solar Vertex S+',
      inverterSize: calculateInverterSize(solarKw).inverterKw,
      inverterBrand: 'Sigenergy',
      annualGeneration: round(solarKw * 365 * psh * CONSTANTS.SOLAR_PERFORMANCE_RATIO, 0),
      warrantyYears: 25,
      performanceWarranty: '87.4% output at 25 years',
    },
    battery: {
      capacity: batteryKwh,
      usableCapacity: round(batteryKwh * 0.9, 1),
      brand: 'Sigenergy SigenStor',
      technology: 'LFP (Lithium Iron Phosphate)',
      warrantyYears: 10,
      cycleWarranty: 6000,
      roundTripEfficiency: 95,
    },
    inverter: {
      size: calculateInverterSize(solarKw).inverterKw,
      brand: 'Sigenergy',
      type: 'Hybrid (Solar + Battery)',
      phases: calculateInverterSize(solarKw).phases,
      warrantyYears: 10,
    },
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
