/**
 * Seed Data for Lightning Energy Proposal Generator
 * Contains VPP providers and state rebates
 */

import { getDb } from "./db";
import { vppProviders, stateRebates } from "../drizzle/schema";

// ============================================
// VPP PROVIDERS - 13 Nationwide Providers
// ============================================

export const VPP_PROVIDERS_DATA = [
  {
    name: "Tesla Energy",
    programName: "Tesla Virtual Power Plant",
    dailyCredit: "0.50",
    eventPayment: "20.00",
    estimatedEventsPerYear: 12,
    bundleDiscount: "0",
    hasGasBundle: false,
    availableStates: ["VIC", "NSW", "QLD", "SA", "WA", "TAS", "ACT"],
    requirements: "Tesla Powerwall required",
    notes: "Premium VPP with excellent app integration",
  },
  {
    name: "AGL",
    programName: "AGL Virtual Power Plant",
    dailyCredit: "0.45",
    eventPayment: "15.00",
    estimatedEventsPerYear: 15,
    bundleDiscount: "150",
    hasGasBundle: true,
    availableStates: ["VIC", "NSW", "QLD", "SA"],
    requirements: "Compatible battery required",
    notes: "Gas bundle available for additional savings",
  },
  {
    name: "Origin Energy",
    programName: "Origin Loop VPP",
    dailyCredit: "0.40",
    eventPayment: "18.00",
    estimatedEventsPerYear: 10,
    bundleDiscount: "120",
    hasGasBundle: true,
    availableStates: ["VIC", "NSW", "QLD", "SA", "ACT"],
    requirements: "Approved battery list",
    notes: "Strong gas+electricity bundle options",
  },
  {
    name: "Energy Australia",
    programName: "EA PowerResponse",
    dailyCredit: "0.35",
    eventPayment: "22.00",
    estimatedEventsPerYear: 8,
    bundleDiscount: "100",
    hasGasBundle: true,
    availableStates: ["VIC", "NSW", "QLD", "SA"],
    requirements: "5kWh minimum battery",
    notes: "Higher event payments, fewer events",
  },
  {
    name: "Simply Energy",
    programName: "Simply VPP",
    dailyCredit: "0.55",
    eventPayment: "12.00",
    estimatedEventsPerYear: 20,
    bundleDiscount: "80",
    hasGasBundle: true,
    availableStates: ["VIC", "NSW", "SA"],
    requirements: "Any compatible battery",
    notes: "High daily credits, frequent events",
  },
  {
    name: "Amber Electric",
    programName: "Amber SmartShift",
    dailyCredit: "0.30",
    eventPayment: "25.00",
    estimatedEventsPerYear: 12,
    bundleDiscount: "0",
    hasGasBundle: false,
    availableStates: ["VIC", "NSW", "QLD", "SA"],
    requirements: "Smart meter required",
    notes: "Wholesale pricing model, best for active users",
  },
  {
    name: "Powershop",
    programName: "Powershop VPP",
    dailyCredit: "0.42",
    eventPayment: "16.00",
    estimatedEventsPerYear: 14,
    bundleDiscount: "0",
    hasGasBundle: false,
    availableStates: ["VIC", "NSW", "QLD"],
    requirements: "Compatible inverter/battery",
    notes: "Good app, gamified energy management",
  },
  {
    name: "Red Energy",
    programName: "Red VPP",
    dailyCredit: "0.38",
    eventPayment: "17.00",
    estimatedEventsPerYear: 12,
    bundleDiscount: "90",
    hasGasBundle: true,
    availableStates: ["VIC", "NSW", "QLD", "SA"],
    requirements: "Approved battery",
    notes: "Snowy Hydro owned, reliable",
  },
  {
    name: "Lumo Energy",
    programName: "Lumo VPP",
    dailyCredit: "0.36",
    eventPayment: "14.00",
    estimatedEventsPerYear: 15,
    bundleDiscount: "70",
    hasGasBundle: true,
    availableStates: ["VIC", "NSW", "SA"],
    requirements: "Compatible system",
    notes: "Simple plans, no lock-in",
  },
  {
    name: "Synergy",
    programName: "Synergy VPP",
    dailyCredit: "0.48",
    eventPayment: "20.00",
    estimatedEventsPerYear: 10,
    bundleDiscount: "0",
    hasGasBundle: false,
    availableStates: ["WA"],
    requirements: "WA residents only",
    notes: "WA government owned, exclusive to WA",
  },
  {
    name: "ActewAGL",
    programName: "ActewAGL VPP",
    dailyCredit: "0.40",
    eventPayment: "15.00",
    estimatedEventsPerYear: 12,
    bundleDiscount: "100",
    hasGasBundle: true,
    availableStates: ["ACT", "NSW"],
    requirements: "ACT/Southern NSW",
    notes: "Local focus, good for ACT residents",
  },
  {
    name: "Alinta Energy",
    programName: "Alinta PowerUp",
    dailyCredit: "0.32",
    eventPayment: "18.00",
    estimatedEventsPerYear: 10,
    bundleDiscount: "60",
    hasGasBundle: true,
    availableStates: ["VIC", "NSW", "QLD", "SA", "WA"],
    requirements: "Compatible battery",
    notes: "Wide coverage including WA",
  },
  {
    name: "Momentum Energy",
    programName: "Momentum VPP",
    dailyCredit: "0.44",
    eventPayment: "14.00",
    estimatedEventsPerYear: 16,
    bundleDiscount: "0",
    hasGasBundle: false,
    availableStates: ["VIC", "NSW", "QLD", "SA", "ACT"],
    requirements: "Hydro Tasmania owned",
    notes: "100% carbon neutral, green focus",
  },
];

// ============================================
// STATE REBATES
// ============================================

export const STATE_REBATES_DATA: Array<{
  state: string;
  rebateType: "solar" | "battery" | "heat_pump_hw" | "heat_pump_ac" | "ev_charger" | "induction";
  name: string;
  amount: string;
  maxSystemSize: number | null;
  requirements: string;
  validUntil: string;
  notes: string;
}> = [
  // Victoria
  {
    state: "VIC",
    rebateType: "solar",
    name: "Solar Homes Program",
    amount: "1400",
    maxSystemSize: 6.6,
    requirements: "Combined household income under $210,000",
    validUntil: "2025-12-31",
    notes: "Interest-free loan also available",
  },
  {
    state: "VIC",
    rebateType: "battery",
    name: "Solar Battery Rebate",
    amount: "2950",
    maxSystemSize: null,
    requirements: "Must have solar PV installed",
    validUntil: "2025-12-31",
    notes: "Interest-free loan also available",
  },
  {
    state: "VIC",
    rebateType: "heat_pump_hw",
    name: "Hot Water Rebate",
    amount: "1000",
    maxSystemSize: null,
    requirements: "Replace gas or electric storage",
    validUntil: "2025-12-31",
    notes: "Heat pump hot water systems",
  },
  {
    state: "VIC",
    rebateType: "heat_pump_ac",
    name: "Home Heating & Cooling Upgrade",
    amount: "1000",
    maxSystemSize: null,
    requirements: "Replace old heating system",
    validUntil: "2025-12-31",
    notes: "Reverse cycle air conditioning",
  },
  // New South Wales
  {
    state: "NSW",
    rebateType: "solar",
    name: "Energy Savings Scheme",
    amount: "600",
    maxSystemSize: 10,
    requirements: "Residential property",
    validUntil: "2025-12-31",
    notes: "STCs provide additional value",
  },
  {
    state: "NSW",
    rebateType: "battery",
    name: "Empowering Homes",
    amount: "2400",
    maxSystemSize: null,
    requirements: "Interest-free loan program",
    validUntil: "2025-12-31",
    notes: "Up to $14,000 loan available",
  },
  {
    state: "NSW",
    rebateType: "heat_pump_hw",
    name: "Energy Savings Scheme - HW",
    amount: "800",
    maxSystemSize: null,
    requirements: "Replace electric/gas HW",
    validUntil: "2025-12-31",
    notes: "Via retailer certificates",
  },
  // Queensland
  {
    state: "QLD",
    rebateType: "solar",
    name: "QLD Solar Rebate",
    amount: "500",
    maxSystemSize: 6.6,
    requirements: "Owner-occupier",
    validUntil: "2025-12-31",
    notes: "STCs provide main value",
  },
  {
    state: "QLD",
    rebateType: "battery",
    name: "Battery Booster",
    amount: "3000",
    maxSystemSize: null,
    requirements: "Existing solar required",
    validUntil: "2025-12-31",
    notes: "Interest-free loans available",
  },
  // South Australia
  {
    state: "SA",
    rebateType: "solar",
    name: "SA Home Battery Scheme",
    amount: "500",
    maxSystemSize: 10,
    requirements: "Residential property",
    validUntil: "2025-12-31",
    notes: "Combined with battery subsidy",
  },
  {
    state: "SA",
    rebateType: "battery",
    name: "SA Home Battery Scheme",
    amount: "4500",
    maxSystemSize: null,
    requirements: "Must have solar PV",
    validUntil: "2025-12-31",
    notes: "One of the best battery rebates",
  },
  {
    state: "SA",
    rebateType: "heat_pump_hw",
    name: "Retailer Energy Productivity Scheme",
    amount: "700",
    maxSystemSize: null,
    requirements: "Replace gas/electric HW",
    validUntil: "2025-12-31",
    notes: "Via energy retailer",
  },
  // Western Australia
  {
    state: "WA",
    rebateType: "solar",
    name: "Distributed Energy Buyback",
    amount: "400",
    maxSystemSize: 5,
    requirements: "Synergy customer",
    validUntil: "2025-12-31",
    notes: "Feed-in tariff based",
  },
  {
    state: "WA",
    rebateType: "battery",
    name: "WA Battery Subsidy",
    amount: "2000",
    maxSystemSize: null,
    requirements: "Existing solar",
    validUntil: "2025-12-31",
    notes: "Limited availability",
  },
  // Tasmania
  {
    state: "TAS",
    rebateType: "solar",
    name: "TAS Energy Saver Loan",
    amount: "500",
    maxSystemSize: 6.6,
    requirements: "Low-interest loan",
    validUntil: "2025-12-31",
    notes: "Loan scheme primarily",
  },
  {
    state: "TAS",
    rebateType: "battery",
    name: "TAS Battery Scheme",
    amount: "2000",
    maxSystemSize: null,
    requirements: "Existing solar",
    validUntil: "2025-12-31",
    notes: "Limited program",
  },
  // ACT
  {
    state: "ACT",
    rebateType: "solar",
    name: "Sustainable Household Scheme",
    amount: "800",
    maxSystemSize: 10,
    requirements: "ACT resident",
    validUntil: "2025-12-31",
    notes: "Zero-interest loan available",
  },
  {
    state: "ACT",
    rebateType: "battery",
    name: "Next Gen Energy Storage",
    amount: "3500",
    maxSystemSize: null,
    requirements: "ACT resident with solar",
    validUntil: "2025-12-31",
    notes: "Strong battery support",
  },
  {
    state: "ACT",
    rebateType: "heat_pump_hw",
    name: "Home Energy Support",
    amount: "1200",
    maxSystemSize: null,
    requirements: "Replace gas HW",
    validUntil: "2025-12-31",
    notes: "Gas transition focus",
  },
  // Northern Territory
  {
    state: "NT",
    rebateType: "solar",
    name: "NT Solar Scheme",
    amount: "400",
    maxSystemSize: 5,
    requirements: "NT resident",
    validUntil: "2025-12-31",
    notes: "Limited program",
  },
  {
    state: "NT",
    rebateType: "battery",
    name: "NT Battery Support",
    amount: "1500",
    maxSystemSize: null,
    requirements: "Existing solar",
    validUntil: "2025-12-31",
    notes: "Remote area focus",
  },
];

// ============================================
// SEED FUNCTIONS
// ============================================

export async function seedVppProviders(): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Clear existing data
  await db.delete(vppProviders);
  
  // Insert new data
  for (const provider of VPP_PROVIDERS_DATA) {
    await db.insert(vppProviders).values(provider);
  }
  
  return VPP_PROVIDERS_DATA.length;
}

export async function seedStateRebates(): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Clear existing data
  await db.delete(stateRebates);
  
  // Insert new data
  for (const rebate of STATE_REBATES_DATA) {
    await db.insert(stateRebates).values({
      ...rebate,
      validUntil: rebate.validUntil ? new Date(rebate.validUntil) : null,
    });
  }
  
  return STATE_REBATES_DATA.length;
}

export async function seedAllData(): Promise<{ vppCount: number; rebateCount: number }> {
  const vppCount = await seedVppProviders();
  const rebateCount = await seedStateRebates();
  
  return { vppCount, rebateCount };
}
