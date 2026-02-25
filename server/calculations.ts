/**
 * Elite Smart Energy Solutions — Proposal Calculation Engine v2
 * Updated per LLM Prompts Registry v2.0 — 25 February 2026
 */
import { Bill, Customer, VppProvider, StateRebate, ProposalCalculations, VppComparisonItem } from "../drizzle/schema";

export const CONSTANTS = {
  GAS_MJ_TO_KWH: 0.2778,
  HEAT_PUMP_COP_MIN: 3.5,
  HEAT_PUMP_COP_MAX: 4.5,
  HEAT_PUMP_COP_DEFAULT: 4.0,
  EV_KM_PER_YEAR: 10000,
  EV_CONSUMPTION_KWH_PER_100KM: 15,
  PETROL_CONSUMPTION_L_PER_100KM: 8,
  PETROL_PRICE_PER_LITRE: 1.80,
  POOL_KW_PER_1000L_MIN: 0.5,
  POOL_KW_PER_1000L_MAX: 0.7,
  CO2_PER_KWH_GRID: 0.79,
  CO2_PER_MJ_GAS: 0.0512,
  DEFAULT_ELECTRICITY_RATE_CENTS: 30,
  DEFAULT_GAS_RATE_CENTS_MJ: 3.5,
  DEFAULT_FEED_IN_TARIFF_CENTS: 5,
  DEFAULT_DAILY_SUPPLY_CHARGE: 1.20,
  SOLAR_OVERSIZE_FACTOR: 1.2,
  SOLAR_PERFORMANCE_RATIO: 0.80,
  PANEL_WATTAGE: 440,
  BATTERY_EVENING_FRACTION: 0.55,
  BATTERY_DOD: 0.90,
  BATTERY_EFFICIENCY: 0.95,
  BATTERY_EV_BUFFER_KWH: 5,
  BATTERY_VPP_MINIMUM_KWH: 10,
  ELECTRICITY_INFLATION_RATE: 0.035,
};

export const STATE_PSH: Record<string, number> = {
  VIC: 3.6, NSW: 4.2, QLD: 4.8, SA: 4.5, WA: 4.8, TAS: 3.3, ACT: 4.2, NT: 5.5,
};

export const STANDARD_SOLAR_SIZES_KW = [3, 4, 5, 5.5, 6, 6.6, 7, 8, 8.8, 10, 11, 13, 13.2, 15, 17, 20];
export const STANDARD_BATTERY_SIZES_KWH = [5, 10, 15, 20, 25, 30];

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

export interface HotWaterSavings {
  currentGasHwsCost: number;
  heatPumpAnnualCost: number;
  annualSavings: number;
  dailySupplySaved: number;
}

export function calculateHotWaterSavings(
  gasBill: Bill,
  electricityRate: number = CONSTANTS.DEFAULT_ELECTRICITY_RATE_CENTS
): HotWaterSavings {
  const gasUsageMj = Number(gasBill.gasUsageMj) || 0;
  const billingDays = gasBill.billingDays || 90;
  const gasRate = Number(gasBill.gasRateCentsMj) || CONSTANTS.DEFAULT_GAS_RATE_CENTS_MJ;
  const dailySupply = Number(gasBill.dailySupplyCharge) || CONSTANTS.DEFAULT_DAILY_SUPPLY_CHARGE;
  const hwsGasUsageMj = gasUsageMj * 0.40;
  const hwsGasKwh = hwsGasUsageMj * CONSTANTS.GAS_MJ_TO_KWH;
  const currentGasHwsCost = (hwsGasUsageMj * gasRate / 100) * (365 / billingDays);
  const heatPumpKwh = hwsGasKwh / CONSTANTS.HEAT_PUMP_COP_DEFAULT;
  const heatPumpAnnualCost = heatPumpKwh * electricityRate / 100 * (365 / billingDays);
  const annualSavings = currentGasHwsCost - heatPumpAnnualCost;
  const dailySupplySaved = dailySupply;
  return {
    currentGasHwsCost: round(currentGasHwsCost, 2),
    heatPumpAnnualCost: round(heatPumpAnnualCost, 2),
    annualSavings: round(annualSavings, 2),
    dailySupplySaved: round(dailySupplySaved, 2),
  };
}

export interface HeatingCoolingSavings {
  currentGasHeatingCost: number;
  rcAcAnnualCost: number;
  annualSavings: number;
  additionalCoolingBenefit: boolean;
}

export function calculateHeatingCoolingSavings(
  gasBill: Bill,
  electricityRate: number = CONSTANTS.DEFAULT_ELECTRICITY_RATE_CENTS
): HeatingCoolingSavings {
  const gasUsageMj = Number(gasBill.gasUsageMj) || 0;
  const billingDays = gasBill.billingDays || 90;
  const gasRate = Number(gasBill.gasRateCentsMj) || CONSTANTS.DEFAULT_GAS_RATE_CENTS_MJ;
  const heatingGasUsageMj = gasUsageMj * 0.40;
  const heatingGasKwh = heatingGasUsageMj * CONSTANTS.GAS_MJ_TO_KWH;
  const currentGasHeatingCost = (heatingGasUsageMj * gasRate / 100) * (365 / billingDays);
  const rcAcKwh = heatingGasKwh / CONSTANTS.HEAT_PUMP_COP_DEFAULT;
  const rcAcAnnualCost = rcAcKwh * electricityRate / 100 * (365 / billingDays);
  const annualSavings = currentGasHeatingCost - rcAcAnnualCost;
  return {
    currentGasHeatingCost: round(currentGasHeatingCost, 2),
    rcAcAnnualCost: round(rcAcAnnualCost, 2),
    annualSavings: round(annualSavings, 2),
    additionalCoolingBenefit: true,
  };
}

export interface CookingSavings {
  currentGasCookingCost: number;
  inductionAnnualCost: number;
  annualSavings: number;
}

export function calculateCookingSavings(
  gasBill: Bill,
  electricityRate: number = CONSTANTS.DEFAULT_ELECTRICITY_RATE_CENTS
): CookingSavings {
  const gasUsageMj = Number(gasBill.gasUsageMj) || 0;
  const billingDays = gasBill.billingDays || 90;
  const gasRate = Number(gasBill.gasRateCentsMj) || CONSTANTS.DEFAULT_GAS_RATE_CENTS_MJ;
  const cookingGasUsageMj = gasUsageMj * 0.20;
  const cookingGasKwh = cookingGasUsageMj * CONSTANTS.GAS_MJ_TO_KWH;
  const currentGasCookingCost = (cookingGasUsageMj * gasRate / 100) * (365 / billingDays);
  const inductionKwh = cookingGasKwh * 0.55 / 0.90;
  const inductionAnnualCost = inductionKwh * electricityRate / 100 * (365 / billingDays);
  const annualSavings = currentGasCookingCost - inductionAnnualCost;
  return {
    currentGasCookingCost: round(currentGasCookingCost, 2),
    inductionAnnualCost: round(inductionAnnualCost, 2),
    annualSavings: round(annualSavings, 2),
  };
}

export interface PoolHeatPumpAnalysis {
  recommendedKw: number;
  annualOperatingCost: number;
  estimatedSavingsVsGas: number;
}

export function calculatePoolHeatPump(
  poolVolumeLitres: number,
  electricityRate: number = CONSTANTS.DEFAULT_ELECTRICITY_RATE_CENTS
): PoolHeatPumpAnalysis {
  const avgFactor = (CONSTANTS.POOL_KW_PER_1000L_MIN + CONSTANTS.POOL_KW_PER_1000L_MAX) / 2;
  const recommendedKw = (poolVolumeLitres / 1000) * avgFactor;
  const hoursPerDay = 8;
  const daysPerYear = 200;
  const kwhPerYear = recommendedKw * hoursPerDay * daysPerYear / CONSTANTS.HEAT_PUMP_COP_DEFAULT;
  const annualOperatingCost = kwhPerYear * electricityRate / 100;
  const estimatedSavingsVsGas = annualOperatingCost * 0.30;
  return {
    recommendedKw: round(recommendedKw, 1),
    annualOperatingCost: round(annualOperatingCost, 2),
    estimatedSavingsVsGas: round(estimatedSavingsVsGas, 2),
  };
}

export interface VppIncome {
  dailyExportKwh: number;
  annualRevenue: number;
  totalAnnualValue: number;
  dailyCreditAnnual: number;
  eventPaymentsAnnual: number;
  bundleDiscount: number;
}

export function calculateVppIncome(provider: VppProvider, batteryKwh?: number): VppIncome {
  const effectiveBatteryKwh = batteryKwh || 10;
  const batteryUsableKwh = effectiveBatteryKwh * CONSTANTS.BATTERY_DOD;
  const dailyExportKwh = batteryUsableKwh * 0.8;
  const baseRate = Number((provider as any).baseRateCents) || 0;
  const monthlyFee = Number((provider as any).monthlyFee) || 0;
  const dailyCredit = Number(provider.dailyCredit) || 0;
  const eventPayment = Number(provider.eventPayment) || 0;
  const eventsPerYear = provider.estimatedEventsPerYear || 10;
  const bundleDiscount = Number(provider.bundleDiscount) || 0;

  let annualRevenue: number;
  if (baseRate > 0) {
    const grossAnnual = dailyExportKwh * (baseRate / 100) * 365;
    const annualFees = monthlyFee * 12;
    annualRevenue = Math.max(0, grossAnnual - annualFees);
  } else {
    annualRevenue = dailyCredit * 365 + eventPayment * eventsPerYear + bundleDiscount;
  }

  return {
    dailyExportKwh: round(dailyExportKwh, 2),
    annualRevenue: round(annualRevenue, 2),
    totalAnnualValue: round(annualRevenue, 2),
    dailyCreditAnnual: round(dailyCredit * 365, 2),
    eventPaymentsAnnual: round(eventPayment * eventsPerYear, 2),
    bundleDiscount: round(bundleDiscount, 2),
  };
}

export function compareVppProviders(
  providers: VppProvider[],
  customerState: string,
  batteryKwh?: number
): VppComparisonItem[] {
  return providers
    .filter(p => {
      const states = p.availableStates as string[] | null;
      return states?.includes(customerState) ?? false;
    })
    .map(p => {
      const income = calculateVppIncome(p, batteryKwh);
      return {
        provider: p.name,
        programName: p.programName || '',
        hasGasBundle: p.hasGasBundle || false,
        estimatedAnnualValue: income.totalAnnualValue,
        strategicFit: getStrategicFit(income.totalAnnualValue),
      };
    })
    .sort((a, b) => b.estimatedAnnualValue - a.estimatedAnnualValue);
}

function getStrategicFit(annualValue: number): "excellent" | "good" | "moderate" | "poor" {
  if (annualValue >= 500) return "excellent";
  if (annualValue >= 300) return "good";
  if (annualValue >= 150) return "moderate";
  return "poor";
}

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
  const litresPerYear = (kmPerYear / 100) * CONSTANTS.PETROL_CONSUMPTION_L_PER_100KM;
  const petrolAnnualCost = litresPerYear * CONSTANTS.PETROL_PRICE_PER_LITRE;
  const kwhPerYear = (kmPerYear / 100) * CONSTANTS.EV_CONSUMPTION_KWH_PER_100KM;
  const evGridChargeCost = kwhPerYear * electricityRate / 100;
  const evSolarChargeCost = 0;
  return {
    petrolAnnualCost: round(petrolAnnualCost, 2),
    evGridChargeCost: round(evGridChargeCost, 2),
    evSolarChargeCost: round(evSolarChargeCost, 2),
    savingsVsPetrol: round(petrolAnnualCost - evGridChargeCost, 2),
    savingsWithSolar: round(petrolAnnualCost - evSolarChargeCost, 2),
  };
}

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
  let rawKwh = (dailyUsageKwh * CONSTANTS.BATTERY_EVENING_FRACTION) /
    (CONSTANTS.BATTERY_DOD * CONSTANTS.BATTERY_EFFICIENCY);
  let reasoning = "Sized to cover evening/overnight usage (55% of daily load)";
  if (hasEv) {
    rawKwh += CONSTANTS.BATTERY_EV_BUFFER_KWH;
    reasoning += ", plus EV charging buffer";
  }
  if (vppParticipation) {
    rawKwh = Math.max(rawKwh, CONSTANTS.BATTERY_VPP_MINIMUM_KWH);
    reasoning += ", minimum 10kWh for VPP income";
  }
  const recommendedKwh = STANDARD_BATTERY_SIZES_KWH.find(s => s >= rawKwh) ||
    STANDARD_BATTERY_SIZES_KWH[STANDARD_BATTERY_SIZES_KWH.length - 1];
  const estimatedCost = recommendedKwh * 900;
  return { recommendedKwh, reasoning, estimatedCost: round(estimatedCost, 0) };
}

export interface SolarRecommendation {
  recommendedKw: number;
  panelCount: number;
  panelWattage: number;
  panelBrand: string;
  annualGeneration: number;
  estimatedCost: number;
}

export function calculateSolarSize(
  yearlyUsageKwh: number,
  batteryKwh: number,
  hasEv: boolean,
  state: string = 'VIC'
): SolarRecommendation {
  let targetAnnualKwh = yearlyUsageKwh * CONSTANTS.SOLAR_OVERSIZE_FACTOR;
  if (hasEv) {
    targetAnnualKwh += (CONSTANTS.EV_KM_PER_YEAR / 100) * CONSTANTS.EV_CONSUMPTION_KWH_PER_100KM;
  }
  const psh = STATE_PSH[state] || 4.0;
  const rawKw = targetAnnualKwh / (365 * psh * CONSTANTS.SOLAR_PERFORMANCE_RATIO);
  const recommendedKw = STANDARD_SOLAR_SIZES_KW.find(s => s >= rawKw) ||
    STANDARD_SOLAR_SIZES_KW[STANDARD_SOLAR_SIZES_KW.length - 1];
  const panelWattage = CONSTANTS.PANEL_WATTAGE;
  const panelCount = Math.ceil(recommendedKw * 1000 / panelWattage);
  const annualGeneration = recommendedKw * 365 * psh * CONSTANTS.SOLAR_PERFORMANCE_RATIO;
  const estimatedCost = recommendedKw * 1000;
  return {
    recommendedKw,
    panelCount,
    panelWattage,
    panelBrand: "Trina Solar",
    annualGeneration: round(annualGeneration, 0),
    estimatedCost: round(estimatedCost, 0),
  };
}

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
  investments: { solar?: number; battery?: number; heatPumpHw?: number; rcAc?: number; induction?: number; evCharger?: number; poolHeatPump?: number; },
  rebates: { solar?: number; battery?: number; heatPumpHw?: number; rcAc?: number; },
  annualSavings: { electricity?: number; gas?: number; vpp?: number; ev?: number; }
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
  const electricityCo2 = currentElectricityKwh * CONSTANTS.CO2_PER_KWH_GRID / 1000;
  const gasCo2 = currentGasMj * CONSTANTS.CO2_PER_MJ_GAS / 1000;
  const currentCo2Tonnes = electricityCo2 + gasCo2;
  const solarSelfConsumed = solarGenerationKwh * 0.80;
  const netGridUsage = Math.max(0, currentElectricityKwh - solarSelfConsumed);
  const projectedElectricityCo2 = netGridUsage * CONSTANTS.CO2_PER_KWH_GRID / 1000;
  const projectedGasCo2 = gasEliminated ? 0 : gasCo2;
  const projectedCo2Tonnes = projectedElectricityCo2 + projectedGasCo2;
  const reductionTonnes = currentCo2Tonnes - projectedCo2Tonnes;
  const rawReductionPercent = currentCo2Tonnes > 0 ? (reductionTonnes / currentCo2Tonnes) * 100 : 0;
  const reductionPercent = Math.min(rawReductionPercent, 85);
  return {
    currentCo2Tonnes: round(currentCo2Tonnes, 2),
    projectedCo2Tonnes: round(projectedCo2Tonnes, 2),
    reductionTonnes: round(reductionTonnes, 2),
    reductionPercent: round(reductionPercent, 1),
  };
}

export interface YearlyProjection {
  year: number;
  inflatedCost: number;
  costWithSystem: number;
  cumulativeSaving: number;
}

export function calculate25YearProjection(
  currentAnnualCost: number,
  annualSavings: number
): YearlyProjection[] {
  const projections: YearlyProjection[] = [];
  let cumulativeSaving = 0;
  for (let year = 1; year <= 25; year++) {
    const inflatedCost = currentAnnualCost * Math.pow(1 + CONSTANTS.ELECTRICITY_INFLATION_RATE, year);
    const costWithSystem = Math.max(0, inflatedCost - annualSavings);
    cumulativeSaving += (inflatedCost - costWithSystem);
    projections.push({
      year,
      inflatedCost: round(inflatedCost, 0),
      costWithSystem: round(costWithSystem, 0),
      cumulativeSaving: round(cumulativeSaving, 0),
    });
  }
  return projections;
}

export function generateFullCalculations(
  customer: Customer,
  electricityBill: Bill,
  gasBill: Bill | null,
  vppProviders: VppProvider[],
  rebates: StateRebate[]
): ProposalCalculations {
  const usage = calculateUsageProjections(electricityBill);
  const electricityRate = Number(electricityBill.peakRateCents) ||
    Number((electricityBill as any).usageRateCents) ||
    CONSTANTS.DEFAULT_ELECTRICITY_RATE_CENTS;

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

  let poolAnalysis: PoolHeatPumpAnalysis | null = null;
  if (customer.hasPool && customer.poolVolume) {
    poolAnalysis = calculatePoolHeatPump(customer.poolVolume, electricityRate);
  }

  let evSavings: EvSavings | null = null;
  const hasEV = customer.hasEV === true || customer.evInterest === 'owns' || customer.evInterest === 'interested';
  if (hasEV) {
    evSavings = calculateEvSavings(electricityRate);
  }

  const battery = calculateBatterySize(usage.dailyAverageKwh, hasEV, true);
  const solar = calculateSolarSize(usage.yearlyUsageKwh, battery.recommendedKwh, hasEV, customer.state || 'VIC');

  const customerState = customer.state || 'VIC';
  const vppComparison = compareVppProviders(vppProviders, customerState, battery.recommendedKwh);
  const selectedVpp = vppComparison.length > 0 ? vppComparison[0] : null;
  const selectedVppProvider = selectedVpp ? vppProviders.find(p => p.name === selectedVpp.provider) : null;
  const vppIncome = selectedVppProvider ? calculateVppIncome(selectedVppProvider, battery.recommendedKwh) : null;

  const solarRebate = rebates.find(r => r.state === customerState && r.rebateType === 'solar' && r.isActive);
  const batteryRebate = rebates.find(r => r.state === customerState && r.rebateType === 'battery' && r.isActive);
  const heatPumpHwRebate = rebates.find(r => r.state === customerState && r.rebateType === 'heat_pump_hw' && r.isActive);
  const heatPumpAcRebate = rebates.find(r => r.state === customerState && r.rebateType === 'heat_pump_ac' && r.isActive);

  const investSolar = solar?.estimatedCost || 0;
  const investBattery = battery.estimatedCost || 0;
  const investHeatPumpHw = customer.gasAppliances?.some(a => a.toLowerCase().includes('hot water')) ? 3500 : 0;
  const investRcAc = customer.gasAppliances?.some(a => a.toLowerCase().includes('heat')) ? 3000 : 0;
  const investInduction = customer.gasAppliances?.some(a => a.toLowerCase().includes('cook') || a.toLowerCase().includes('stove')) ? 2500 : 0;
  const investEvCharger = hasEV ? 1800 : 0;
  const investPoolHeatPump = customer.hasPool ? (poolAnalysis?.recommendedKw || 10) * 1200 : 0;

  // Calculate electricity savings based on solar self-consumption:
  // Solar generation × self-consumption rate (80%) × electricity rate
  // This is the value of solar energy used directly instead of buying from grid
  const solarAnnualGeneration = solar?.annualGeneration || 0;
  const selfConsumptionRate = 0.80; // 80% of solar is self-consumed (rest exported)
  const electricityRateDollars = electricityRate / 100; // convert cents to dollars
  const solarSelfConsumptionSavings = solarAnnualGeneration * selfConsumptionRate * electricityRateDollars;
  // Battery arbitrage: additional savings from storing and using solar at night
  // Battery shifts ~30% of remaining export to self-consumption
  const batteryArbitrageSavings = solarAnnualGeneration * (1 - selfConsumptionRate) * 0.30 * electricityRateDollars;
  const annualElectricitySavings = Math.round(solarSelfConsumptionSavings + batteryArbitrageSavings);
  const annualGasSavings = gasBill ? (gasAnalysis?.annualGasCost || 0) * 0.85 : 0;
  const annualVppIncome = vppIncome?.totalAnnualValue || 0;
  const annualEvSavings = evSavings?.savingsWithSolar || 0;

  const payback = calculatePayback(
    { solar: investSolar, battery: investBattery, heatPumpHw: investHeatPumpHw, rcAc: investRcAc, induction: investInduction, evCharger: investEvCharger, poolHeatPump: investPoolHeatPump },
    { solar: solarRebate ? Number(solarRebate.amount) : 0, battery: batteryRebate ? Number(batteryRebate.amount) : 0, heatPumpHw: heatPumpHwRebate ? Number(heatPumpHwRebate.amount) : 0, rcAc: heatPumpAcRebate ? Number(heatPumpAcRebate.amount) : 0 },
    { electricity: annualElectricitySavings, gas: annualGasSavings, vpp: annualVppIncome, ev: annualEvSavings }
  );

  const co2 = calculateCo2Reduction(
    usage.yearlyUsageKwh,
    gasBill ? (Number(gasBill.gasUsageMj) * (365 / (gasBill.billingDays || 90))) : 0,
    solar?.annualGeneration || 0,
    gasBill != null
  );

  const dailySupply = Number(electricityBill.dailySupplyCharge) || CONSTANTS.DEFAULT_DAILY_SUPPLY_CHARGE;
  const feedInTariff = Number(electricityBill.feedInTariffCents) || CONSTANTS.DEFAULT_FEED_IN_TARIFF_CENTS;
  const annualSupplyCharge = dailySupply * 365;
  const annualUsageCharge = usage.projectedAnnualCost - annualSupplyCharge;
  const annualSolarCredit = Number(electricityBill.solarExportsKwh) ? Number(electricityBill.solarExportsKwh) * feedInTariff / 100 : 0;
  const gasAnnualSupplyCharge = gasBill ? (Number(gasBill.dailySupplyCharge) || CONSTANTS.DEFAULT_DAILY_SUPPLY_CHARGE) * 365 : undefined;

  return {
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
    gasBillRetailer: gasBill?.retailer || undefined,
    gasBillPeriodStart: gasBill?.billingPeriodStart?.toISOString().split('T')[0],
    gasBillPeriodEnd: gasBill?.billingPeriodEnd?.toISOString().split('T')[0],
    gasBillDays: gasBill?.billingDays || undefined,
    gasBillTotalAmount: gasBill ? Number(gasBill.totalAmount) || undefined : undefined,
    gasBillDailySupplyCharge: gasBill ? Number(gasBill.dailySupplyCharge) || undefined : undefined,
    gasBillUsageMj: gasBill ? Number(gasBill.gasUsageMj) || undefined : undefined,
    gasBillRateCentsMj: gasBill ? Number(gasBill.gasRateCentsMj) || undefined : undefined,
    dailyAverageKwh: usage.dailyAverageKwh,
    monthlyUsageKwh: usage.monthlyUsageKwh,
    yearlyUsageKwh: usage.yearlyUsageKwh,
    projectedAnnualCost: usage.projectedAnnualCost,
    dailyAverageCost: usage.dailyAverageCost,
    annualSupplyCharge,
    annualUsageCharge,
    annualSolarCredit,
    gasAnnualCost: gasAnalysis?.annualGasCost,
    gasKwhEquivalent: gasAnalysis?.gasKwhEquivalent,
    gasCo2Emissions: gasAnalysis?.co2EmissionsKg,
    gasDailyGasCost: gasAnalysis?.dailyGasCost,
    gasAnnualSupplyCharge,
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
    recommendedBatteryKwh: battery.recommendedKwh,
    batteryProduct: "Sigenergy SigenStor",
    batteryPaybackYears: payback.paybackYears,
    batteryEstimatedCost: battery.estimatedCost,
    recommendedSolarKw: solar?.recommendedKw,
    solarPanelCount: solar?.panelCount,
    solarAnnualGeneration: solar?.annualGeneration,
    solarEstimatedCost: solar?.estimatedCost,
    selectedVppProvider: selectedVpp?.provider,
    vppAnnualValue: vppIncome?.totalAnnualValue,
    vppDailyCreditAnnual: vppIncome?.dailyCreditAnnual,
    vppEventPaymentsAnnual: vppIncome?.eventPaymentsAnnual,
    vppBundleDiscount: vppIncome?.bundleDiscount,
    vppProviderComparison: vppComparison,
    evPetrolCost: evSavings?.petrolAnnualCost,
    evGridChargeCost: evSavings?.evGridChargeCost,
    evSolarChargeCost: evSavings?.evSolarChargeCost,
    evAnnualSavings: evSavings?.savingsWithSolar,
    evKmPerYear: CONSTANTS.EV_KM_PER_YEAR,
    evConsumptionPer100km: CONSTANTS.EV_CONSUMPTION_KWH_PER_100KM,
    evPetrolPricePerLitre: CONSTANTS.PETROL_PRICE_PER_LITRE,
    co2ReductionTonnes: co2.reductionTonnes,
    co2CurrentTonnes: co2.currentCo2Tonnes,
    co2ProjectedTonnes: co2.projectedCo2Tonnes,
    co2ReductionPercent: co2.reductionPercent,
    solarRebateAmount: solarRebate ? Number(solarRebate.amount) : undefined,
    batteryRebateAmount: batteryRebate ? Number(batteryRebate.amount) : undefined,
    heatPumpHwRebateAmount: heatPumpHwRebate ? Number(heatPumpHwRebate.amount) : undefined,
    heatPumpAcRebateAmount: heatPumpAcRebate ? Number(heatPumpAcRebate.amount) : undefined,
    investmentSolar: investSolar,
    investmentBattery: investBattery,
    investmentHeatPumpHw: investHeatPumpHw,
    investmentRcAc: investRcAc,
    investmentInduction: investInduction,
    investmentEvCharger: investEvCharger,
    investmentPoolHeatPump: investPoolHeatPump,
    totalAnnualSavings: payback.totalAnnualBenefit,
    electricitySavings: annualElectricitySavings,
    totalInvestment: payback.totalInvestment,
    totalRebates: payback.totalRebates,
    netInvestment: payback.netInvestment,
    paybackYears: payback.paybackYears,
    tenYearSavings: payback.tenYearSavings,
    twentyFiveYearSavings: payback.twentyFiveYearSavings,
  };
}

function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
