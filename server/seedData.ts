/**
 * Seed Data for Elite Smart Energy Proposal Generator
 * Contains VPP providers and state rebates
 * 
 * NOTE: VPP provider seeding is now primarily done via the admin mutation
 * in routers.ts (seedVppProviders). This file is kept as a reference
 * and for the state rebates seeding function.
 */

import { getDb } from "./db";
import { vppProviders, stateRebates } from "../drizzle/schema";

// ============================================
// VPP PROVIDERS - 14 Providers (matching VPP Calculator)
// Uses baseRate model: annualRevenue = (dailyExport × baseRate/100 × 365) - (monthlyFee × 12)
// ============================================

export const VPP_PROVIDERS_DATA = [
  // Wholesale providers
  { name: "Amber for Batteries", slug: "amber", providerType: "wholesale", baseRateCents: "35.80", monthlyFee: "15.00", wholesaleMargin: "5.00", availableStates: ["NSW", "VIC", "QLD", "SA"], minBatterySize: "5.00", website: "https://www.amber.com.au", notes: "Dynamic pricing based on live AEMO wholesale rates", isActive: true },
  { name: "Tesla VPP", slug: "tesla", providerType: "wholesale", baseRateCents: "32.00", monthlyFee: "0.00", wholesaleMargin: "3.00", availableStates: ["NSW", "VIC", "SA"], minBatterySize: "5.00", website: "https://www.tesla.com/en_au/support/energy/powerwall/own/virtual-power-plant", notes: "Tesla Powerwall required", isActive: true },
  { name: "Reposit", slug: "reposit", providerType: "wholesale", baseRateCents: "30.00", monthlyFee: "12.00", wholesaleMargin: "8.00", availableStates: ["NSW", "VIC", "QLD", "SA", "TAS"], minBatterySize: "5.00", website: "https://www.repositpower.com", notes: "GridCredits system", isActive: true },
  { name: "ShineHub", slug: "shinehub", providerType: "wholesale", baseRateCents: "28.00", monthlyFee: "10.00", wholesaleMargin: "10.00", availableStates: ["NSW", "VIC", "QLD", "SA"], minBatterySize: "5.00", website: "https://www.shinehub.com.au", notes: "Community solar focus", isActive: true },
  { name: "sonnen VPP", slug: "sonnen", providerType: "wholesale", baseRateCents: "29.00", monthlyFee: "8.00", wholesaleMargin: "9.00", availableStates: ["NSW", "VIC", "QLD", "SA", "TAS"], minBatterySize: "5.00", website: "https://sonnen.com.au", notes: "sonnen battery preferred", isActive: true },
  { name: "Zero Hero (GloBird)", slug: "zerohero", providerType: "wholesale", baseRateCents: "15.00", monthlyFee: "0.00", wholesaleMargin: "7.00", availableStates: ["NSW", "VIC", "QLD", "SA"], minBatterySize: "5.00", website: "https://www.globirdenergy.com.au", notes: "GloBird wholesale VPP", isActive: true },
  // Fixed rate providers
  { name: "AGL VPP", slug: "agl", providerType: "fixed", baseRateCents: "12.00", monthlyFee: "5.00", availableStates: ["NSW", "VIC", "QLD", "SA"], minBatterySize: "5.00", website: "https://www.agl.com.au", notes: "Fixed rate VPP", isActive: true },
  { name: "Origin VPP", slug: "origin", providerType: "fixed", baseRateCents: "10.00", monthlyFee: "0.00", availableStates: ["NSW", "VIC", "QLD", "SA"], minBatterySize: "5.00", website: "https://www.originenergy.com.au", notes: "Fixed rate, no monthly fee", isActive: true },
  { name: "Powershop", slug: "powershop", providerType: "fixed", baseRateCents: "11.50", monthlyFee: "0.00", availableStates: ["NSW", "VIC", "QLD", "SA", "TAS"], minBatterySize: "5.00", website: "https://www.powershop.com.au", notes: "Fixed rate", isActive: true },
  { name: "Discover Energy", slug: "discover", providerType: "fixed", baseRateCents: "10.50", monthlyFee: "0.00", availableStates: ["NSW", "VIC", "QLD", "SA"], minBatterySize: "5.00", website: "https://www.discoverenergy.com.au", notes: "Fixed rate VPP", isActive: true },
  { name: "Energy Australia", slug: "energyaustralia", providerType: "fixed", baseRateCents: "9.50", monthlyFee: "0.00", availableStates: ["NSW", "VIC", "QLD", "SA"], minBatterySize: "5.00", website: "https://www.energyaustralia.com.au", notes: "Fixed rate VPP", isActive: true },
  { name: "ENGIE", slug: "engie", providerType: "fixed", baseRateCents: "11.00", monthlyFee: "3.00", availableStates: ["NSW", "VIC", "QLD", "SA"], minBatterySize: "5.00", website: "https://www.engie.com.au", notes: "Fixed rate with small monthly fee", isActive: true },
  { name: "Globird", slug: "globird", providerType: "fixed", baseRateCents: "10.20", monthlyFee: "0.00", availableStates: ["NSW", "VIC", "QLD", "SA"], minBatterySize: "5.00", website: "https://www.globirdenergy.com.au", notes: "Fixed rate VPP", isActive: true },
  { name: "Nectr", slug: "nectr", providerType: "fixed", baseRateCents: "12.50", monthlyFee: "0.00", availableStates: ["NSW", "VIC", "QLD", "SA"], minBatterySize: "5.00", website: "https://www.nectrenergy.com.au", notes: "Highest fixed rate", isActive: true },
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
    await db.insert(vppProviders).values(provider as any);
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
