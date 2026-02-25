/**
 * Seed Data for Elite Smart Energy Solutions Proposal Generator v2
 * VPP Providers: 14 providers using baseRate/monthlyFee model (v2)
 * State Rebates: Comprehensive Australian rebate database (v2)
 * Updated: 25 February 2026
 */
import { getDb } from "./db";
import { vppProviders, stateRebates } from "../drizzle/schema";

// ============================================
// VPP PROVIDERS — 14 Providers (v2 baseRate model)
// Formula: annualRevenue = (dailyExportKwh × baseRateCents/100 × 365) - (monthlyFee × 12)
// ============================================
export const VPP_PROVIDERS_DATA = [
  // ── WHOLESALE PROVIDERS ──────────────────────────────────────
  {
    name: "Amber Electric",
    programName: "Amber for Batteries",
    availableStates: ["NSW", "VIC", "QLD", "SA"],
    hasGasBundle: false,
    dailyCredit: "0",
    eventPayment: "0",
    estimatedEventsPerYear: 0,
    bundleDiscount: "0",
    minBatterySize: "5",
    website: "https://www.amber.com.au",
    notes: "Dynamic pricing based on live AEMO wholesale rates. Best performer for large batteries. baseRateCents=35.80, monthlyFee=15.00",
    isActive: true,
  },
  {
    name: "Tesla Energy",
    programName: "Tesla Virtual Power Plant",
    availableStates: ["NSW", "VIC", "SA"],
    hasGasBundle: false,
    dailyCredit: "0",
    eventPayment: "0",
    estimatedEventsPerYear: 0,
    bundleDiscount: "0",
    minBatterySize: "13.5",
    website: "https://www.tesla.com/en_AU/powerwall",
    notes: "Tesla Powerwall required. Premium VPP with excellent app integration. baseRateCents=32.00, monthlyFee=0",
    isActive: true,
  },
  {
    name: "Reposit Power",
    programName: "Reposit GridCredits",
    availableStates: ["NSW", "VIC", "QLD", "SA", "TAS"],
    hasGasBundle: false,
    dailyCredit: "0",
    eventPayment: "0",
    estimatedEventsPerYear: 0,
    bundleDiscount: "0",
    minBatterySize: "5",
    website: "https://www.repositpower.com",
    notes: "GridCredits system — earns credits during grid stress events. baseRateCents=30.00, monthlyFee=12.00",
    isActive: true,
  },
  {
    name: "ShineHub",
    programName: "ShineHub Community VPP",
    availableStates: ["NSW", "VIC", "QLD", "SA"],
    hasGasBundle: false,
    dailyCredit: "0",
    eventPayment: "0",
    estimatedEventsPerYear: 0,
    bundleDiscount: "0",
    minBatterySize: "5",
    website: "https://www.shinehub.com.au",
    notes: "Community solar focus. Strong for households with large solar arrays. baseRateCents=28.00, monthlyFee=10.00",
    isActive: true,
  },
  {
    name: "sonnen",
    programName: "sonnen VPP",
    availableStates: ["NSW", "VIC", "QLD", "SA", "TAS"],
    hasGasBundle: false,
    dailyCredit: "0",
    eventPayment: "0",
    estimatedEventsPerYear: 0,
    bundleDiscount: "0",
    minBatterySize: "5",
    website: "https://www.sonnen.com.au",
    notes: "sonnen battery preferred but not required. Excellent for whole-home energy management. baseRateCents=29.00, monthlyFee=8.00",
    isActive: true,
  },
  {
    name: "Zero Hero",
    programName: "Zero Hero (GloBird Wholesale)",
    availableStates: ["NSW", "VIC", "QLD", "SA"],
    hasGasBundle: false,
    dailyCredit: "0",
    eventPayment: "0",
    estimatedEventsPerYear: 0,
    bundleDiscount: "0",
    minBatterySize: "5",
    website: "https://www.globirdenergy.com.au",
    notes: "GloBird wholesale VPP. No monthly fee. baseRateCents=15.00, monthlyFee=0",
    isActive: true,
  },
  // ── FIXED RATE PROVIDERS ─────────────────────────────────────
  {
    name: "Nectr",
    programName: "Nectr Battery VPP",
    availableStates: ["NSW", "VIC", "QLD", "SA"],
    hasGasBundle: false,
    dailyCredit: "0",
    eventPayment: "0",
    estimatedEventsPerYear: 0,
    bundleDiscount: "0",
    minBatterySize: "5",
    website: "https://www.nectr.com.au",
    notes: "Highest fixed rate provider. No monthly fee. baseRateCents=12.50, monthlyFee=0",
    isActive: true,
  },
  {
    name: "AGL",
    programName: "AGL VPP",
    availableStates: ["NSW", "VIC", "QLD", "SA"],
    hasGasBundle: true,
    dailyCredit: "0",
    eventPayment: "0",
    estimatedEventsPerYear: 0,
    bundleDiscount: "150",
    minBatterySize: "5",
    website: "https://www.agl.com.au",
    notes: "Fixed rate VPP. Gas bundle available. baseRateCents=12.00, monthlyFee=5.00",
    isActive: true,
  },
  {
    name: "Powershop",
    programName: "Powershop Battery VPP",
    availableStates: ["NSW", "VIC", "QLD", "SA", "TAS"],
    hasGasBundle: false,
    dailyCredit: "0",
    eventPayment: "0",
    estimatedEventsPerYear: 0,
    bundleDiscount: "0",
    minBatterySize: "5",
    website: "https://www.powershop.com.au",
    notes: "Fixed rate, no monthly fee. Good for TAS customers. baseRateCents=11.50, monthlyFee=0",
    isActive: true,
  },
  {
    name: "ENGIE",
    programName: "ENGIE VPP Advantage",
    availableStates: ["NSW", "VIC", "QLD", "SA"],
    hasGasBundle: true,
    dailyCredit: "0",
    eventPayment: "0",
    estimatedEventsPerYear: 0,
    bundleDiscount: "100",
    minBatterySize: "5",
    website: "https://www.engie.com.au",
    notes: "Fixed rate with small monthly fee. Gas bundle available. baseRateCents=11.00, monthlyFee=3.00",
    isActive: true,
  },
  {
    name: "GloBird Energy",
    programName: "GloBird Battery VPP",
    availableStates: ["NSW", "VIC", "QLD", "SA"],
    hasGasBundle: false,
    dailyCredit: "0",
    eventPayment: "0",
    estimatedEventsPerYear: 0,
    bundleDiscount: "0",
    minBatterySize: "5",
    website: "https://www.globirdenergy.com.au",
    notes: "Fixed rate VPP. No monthly fee. baseRateCents=10.20, monthlyFee=0",
    isActive: true,
  },
  {
    name: "Discover Energy",
    programName: "Discover Battery VPP",
    availableStates: ["NSW", "VIC", "QLD", "SA"],
    hasGasBundle: false,
    dailyCredit: "0",
    eventPayment: "0",
    estimatedEventsPerYear: 0,
    bundleDiscount: "0",
    minBatterySize: "5",
    website: "https://www.discoverenergy.com.au",
    notes: "Fixed rate VPP. No monthly fee. baseRateCents=10.50, monthlyFee=0",
    isActive: true,
  },
  {
    name: "Origin Energy",
    programName: "Origin Loop VPP",
    availableStates: ["NSW", "VIC", "QLD", "SA", "ACT"],
    hasGasBundle: true,
    dailyCredit: "0",
    eventPayment: "0",
    estimatedEventsPerYear: 0,
    bundleDiscount: "120",
    minBatterySize: "5",
    website: "https://www.originenergy.com.au",
    notes: "Fixed rate, no monthly fee. Gas bundle available. Strong ACT coverage. baseRateCents=10.00, monthlyFee=0",
    isActive: true,
  },
  {
    name: "Energy Australia",
    programName: "Energy Australia VPP",
    availableStates: ["NSW", "VIC", "QLD", "SA"],
    hasGasBundle: false,
    dailyCredit: "0",
    eventPayment: "0",
    estimatedEventsPerYear: 0,
    bundleDiscount: "0",
    minBatterySize: "5",
    website: "https://www.energyaustralia.com.au",
    notes: "Fixed rate VPP. No monthly fee. baseRateCents=9.50, monthlyFee=0",
    isActive: true,
  },
];

// ============================================
// STATE REBATES — Comprehensive Australian Database (v2)
// ============================================
export const STATE_REBATES_DATA = [
  // ── VICTORIA ─────────────────────────────────────────────────
  { state: "VIC", rebateType: "solar" as const, name: "Solar Homes Program", amount: "1400", isPercentage: false, maxAmount: "1400", eligibilityCriteria: "Income < $210,000 household. Owner-occupier. Interest-free loan also available.", isActive: true, sourceUrl: "https://www.solar.vic.gov.au" },
  { state: "VIC", rebateType: "battery" as const, name: "Solar Battery Rebate", amount: "2950", isPercentage: false, maxAmount: "2950", eligibilityCriteria: "Must have existing or new solar PV. Interest-free loan also available.", isActive: true, sourceUrl: "https://www.solar.vic.gov.au" },
  { state: "VIC", rebateType: "heat_pump_hw" as const, name: "Hot Water Rebate", amount: "1000", isPercentage: false, maxAmount: "1000", eligibilityCriteria: "Replace gas or electric storage hot water system with heat pump.", isActive: true, sourceUrl: "https://www.solar.vic.gov.au" },
  { state: "VIC", rebateType: "heat_pump_ac" as const, name: "Heating & Cooling Upgrade", amount: "1000", isPercentage: false, maxAmount: "1000", eligibilityCriteria: "Replace old gas heating with reverse cycle air conditioner.", isActive: true, sourceUrl: "https://www.solar.vic.gov.au" },
  // ── NEW SOUTH WALES ──────────────────────────────────────────
  { state: "NSW", rebateType: "solar" as const, name: "Energy Savings Scheme (ESS)", amount: "600", isPercentage: false, maxAmount: "600", eligibilityCriteria: "Residential property. STCs provide additional value from federal government.", isActive: true, sourceUrl: "https://www.energy.nsw.gov.au" },
  { state: "NSW", rebateType: "battery" as const, name: "Empowering Homes Program", amount: "2400", isPercentage: false, maxAmount: "14000", eligibilityCriteria: "Interest-free loan program up to $14,000. Owner-occupier.", isActive: true, sourceUrl: "https://www.energy.nsw.gov.au" },
  { state: "NSW", rebateType: "heat_pump_hw" as const, name: "ESS Hot Water", amount: "800", isPercentage: false, maxAmount: "800", eligibilityCriteria: "Replace electric or gas hot water system. Via energy retailer certificates.", isActive: true, sourceUrl: "https://www.energy.nsw.gov.au" },
  // ── QUEENSLAND ───────────────────────────────────────────────
  { state: "QLD", rebateType: "solar" as const, name: "QLD Solar Rebate (STCs)", amount: "500", isPercentage: false, maxAmount: "500", eligibilityCriteria: "Owner-occupier. STCs provide main federal rebate value.", isActive: true, sourceUrl: "https://www.energex.com.au" },
  { state: "QLD", rebateType: "battery" as const, name: "Battery Booster Program", amount: "3000", isPercentage: false, maxAmount: "3000", eligibilityCriteria: "Must have existing solar PV. Interest-free loans available.", isActive: true, sourceUrl: "https://www.qld.gov.au" },
  // ── SOUTH AUSTRALIA ──────────────────────────────────────────
  { state: "SA", rebateType: "solar" as const, name: "SA Home Battery Scheme (Solar)", amount: "500", isPercentage: false, maxAmount: "500", eligibilityCriteria: "Residential property. Combined with battery subsidy.", isActive: true, sourceUrl: "https://www.sa.gov.au" },
  { state: "SA", rebateType: "battery" as const, name: "SA Home Battery Scheme", amount: "4500", isPercentage: false, maxAmount: "4500", eligibilityCriteria: "Must have solar PV. One of Australia's best battery rebates.", isActive: true, sourceUrl: "https://www.sa.gov.au" },
  { state: "SA", rebateType: "heat_pump_hw" as const, name: "Retailer Energy Productivity Scheme", amount: "700", isPercentage: false, maxAmount: "700", eligibilityCriteria: "Replace gas or electric hot water system. Via energy retailer.", isActive: true, sourceUrl: "https://www.sa.gov.au" },
  // ── WESTERN AUSTRALIA ────────────────────────────────────────
  { state: "WA", rebateType: "solar" as const, name: "Distributed Energy Buyback Scheme", amount: "400", isPercentage: false, maxAmount: "400", eligibilityCriteria: "Synergy customer. Up to 5kW system. Feed-in tariff based.", isActive: true, sourceUrl: "https://www.synergy.net.au" },
  { state: "WA", rebateType: "battery" as const, name: "WA Battery Subsidy", amount: "2000", isPercentage: false, maxAmount: "2000", eligibilityCriteria: "Must have existing solar. Limited availability — check current status.", isActive: true, sourceUrl: "https://www.wa.gov.au" },
  // ── TASMANIA ─────────────────────────────────────────────────
  { state: "TAS", rebateType: "solar" as const, name: "TAS Energy Saver Loan", amount: "500", isPercentage: false, maxAmount: "500", eligibilityCriteria: "Low-interest loan scheme. Up to 6.6kW system.", isActive: true, sourceUrl: "https://www.energysaver.tas.gov.au" },
  { state: "TAS", rebateType: "battery" as const, name: "TAS Battery Scheme", amount: "2000", isPercentage: false, maxAmount: "2000", eligibilityCriteria: "Must have existing solar. Limited program — check availability.", isActive: true, sourceUrl: "https://www.energysaver.tas.gov.au" },
  // ── AUSTRALIAN CAPITAL TERRITORY ─────────────────────────────
  { state: "ACT", rebateType: "solar" as const, name: "Sustainable Household Scheme", amount: "800", isPercentage: false, maxAmount: "800", eligibilityCriteria: "ACT resident. Zero-interest loan available up to $15,000.", isActive: true, sourceUrl: "https://www.climatechoices.act.gov.au" },
  { state: "ACT", rebateType: "battery" as const, name: "Next Gen Energy Storage", amount: "3500", isPercentage: false, maxAmount: "3500", eligibilityCriteria: "ACT resident with existing solar. Strong battery support program.", isActive: true, sourceUrl: "https://www.climatechoices.act.gov.au" },
  { state: "ACT", rebateType: "heat_pump_hw" as const, name: "Home Energy Support Scheme", amount: "1200", isPercentage: false, maxAmount: "1200", eligibilityCriteria: "Replace gas hot water system. Gas transition focus.", isActive: true, sourceUrl: "https://www.climatechoices.act.gov.au" },
  // ── NORTHERN TERRITORY ───────────────────────────────────────
  { state: "NT", rebateType: "solar" as const, name: "NT Solar Scheme", amount: "400", isPercentage: false, maxAmount: "400", eligibilityCriteria: "NT resident. Up to 5kW system. Limited program.", isActive: true, sourceUrl: "https://www.nt.gov.au" },
  { state: "NT", rebateType: "battery" as const, name: "NT Battery Support", amount: "1500", isPercentage: false, maxAmount: "1500", eligibilityCriteria: "Must have existing solar. Remote area focus.", isActive: true, sourceUrl: "https://www.nt.gov.au" },
];

// ============================================
// SEED FUNCTIONS
// ============================================
export async function seedVppProviders() {
  const db = await getDb();
  console.log("[Seed] Seeding 14 VPP providers (v2 baseRate model)...");
  for (const provider of VPP_PROVIDERS_DATA) {
    try {
      await db.insert(vppProviders).values(provider);
      console.log(`[Seed] ✓ ${provider.name}`);
    } catch (err: any) {
      if (err?.code === 'ER_DUP_ENTRY' || err?.message?.includes('duplicate')) {
        console.log(`[Seed] ↷ ${provider.name} (already exists)`);
      } else {
        console.error(`[Seed] ✗ ${provider.name}:`, err?.message);
      }
    }
  }
  console.log("[Seed] VPP providers seeding complete.");
}

export async function seedStateRebates() {
  const db = await getDb();
  console.log("[Seed] Seeding state rebates (v2 comprehensive database)...");
  for (const rebate of STATE_REBATES_DATA) {
    try {
      await db.insert(stateRebates).values(rebate);
      console.log(`[Seed] ✓ ${rebate.state} ${rebate.rebateType}: ${rebate.name}`);
    } catch (err: any) {
      if (err?.code === 'ER_DUP_ENTRY' || err?.message?.includes('duplicate')) {
        console.log(`[Seed] ↷ ${rebate.state} ${rebate.rebateType} (already exists)`);
      } else {
        console.error(`[Seed] ✗ ${rebate.state} ${rebate.rebateType}:`, err?.message);
      }
    }
  }
  console.log("[Seed] State rebates seeding complete.");
}

export async function seedAll() {
  await seedVppProviders();
  await seedStateRebates();
}
