import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

// ============================================
// USER TABLE (Extended from template)
// ============================================
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================
// CUSTOMERS TABLE
// ============================================
export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Created by user
  
  // Basic Info
  fullName: varchar("fullName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address").notNull(),
  state: varchar("state", { length: 10 }).notNull(), // VIC, NSW, SA, QLD, etc.
  
  // Optional Inputs
  hasGas: boolean("hasGas").default(false),
  gasAppliances: json("gasAppliances").$type<string[]>(), // ["Hot Water", "Heating", "Cooktop", "Pool Heater"]
  hasPool: boolean("hasPool").default(false),
  poolVolume: int("poolVolume"), // Litres
  hasEV: boolean("hasEV").default(false),
  evInterest: mysqlEnum("evInterest", ["none", "interested", "owns"]).default("none"),
  hasExistingSolar: boolean("hasExistingSolar").default(false),
  existingSolarSize: decimal("existingSolarSize", { precision: 5, scale: 2 }), // kW
  existingSolarAge: int("existingSolarAge"), // Years
  
  // Metadata
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

// ============================================
// BILLS TABLE (Electricity & Gas)
// ============================================
export const bills = mysqlTable("bills", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  billType: mysqlEnum("billType", ["electricity", "gas"]).notNull(),
  
  // File Storage
  fileUrl: varchar("fileUrl", { length: 512 }),
  fileKey: varchar("fileKey", { length: 255 }),
  fileName: varchar("fileName", { length: 255 }),
  
  // Extracted Data - Common
  retailer: varchar("retailer", { length: 100 }),
  billingPeriodStart: timestamp("billingPeriodStart"),
  billingPeriodEnd: timestamp("billingPeriodEnd"),
  billingDays: int("billingDays"),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }),
  dailySupplyCharge: decimal("dailySupplyCharge", { precision: 8, scale: 4 }),
  
  // Electricity Specific
  totalUsageKwh: decimal("totalUsageKwh", { precision: 10, scale: 2 }),
  peakUsageKwh: decimal("peakUsageKwh", { precision: 10, scale: 2 }),
  offPeakUsageKwh: decimal("offPeakUsageKwh", { precision: 10, scale: 2 }),
  shoulderUsageKwh: decimal("shoulderUsageKwh", { precision: 10, scale: 2 }),
  solarExportsKwh: decimal("solarExportsKwh", { precision: 10, scale: 2 }),
  peakRateCents: decimal("peakRateCents", { precision: 8, scale: 4 }),
  offPeakRateCents: decimal("offPeakRateCents", { precision: 8, scale: 4 }),
  shoulderRateCents: decimal("shoulderRateCents", { precision: 8, scale: 4 }),
  feedInTariffCents: decimal("feedInTariffCents", { precision: 8, scale: 4 }),
  
  // Gas Specific
  gasUsageMj: decimal("gasUsageMj", { precision: 10, scale: 2 }),
  gasRateCentsMj: decimal("gasRateCentsMj", { precision: 8, scale: 4 }),
  
  // Raw Extracted Data (JSON for flexibility)
  rawExtractedData: json("rawExtractedData"),
  extractionConfidence: decimal("extractionConfidence", { precision: 5, scale: 2 }),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Bill = typeof bills.$inferSelect;
export type InsertBill = typeof bills.$inferInsert;

// ============================================
// PROPOSALS TABLE
// ============================================
export const proposals = mysqlTable("proposals", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  userId: int("userId").notNull(), // Created by user
  
  // Proposal Info
  title: varchar("title", { length: 255 }),
  status: mysqlEnum("status", ["draft", "calculating", "generated", "exported", "archived"]).default("draft").notNull(),
  proposalDate: timestamp("proposalDate").defaultNow().notNull(),
  
  // Linked Bills
  electricityBillId: int("electricityBillId"),
  gasBillId: int("gasBillId"),
  
  // Calculated Results (stored as JSON for flexibility)
  calculations: json("calculations").$type<ProposalCalculations>(),
  
  // Generated Slides Data
  slidesData: json("slidesData").$type<SlideData[]>(),
  slideCount: int("slideCount"),
  
  // Export Info
  pdfUrl: varchar("pdfUrl", { length: 512 }),
  pptUrl: varchar("pptUrl", { length: 512 }),
  lastExportedAt: timestamp("lastExportedAt"),
  
  // Soft Delete
  deletedAt: timestamp("deletedAt"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = typeof proposals.$inferInsert;

// ============================================
// VPP PROVIDERS REFERENCE TABLE
// ============================================
export const vppProviders = mysqlTable("vppProviders", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  programName: varchar("programName", { length: 100 }),
  
  // Availability
  availableStates: json("availableStates").$type<string[]>(), // ["VIC", "NSW", "SA", "QLD"]
  hasGasBundle: boolean("hasGasBundle").default(false),
  
  // VPP Details
  dailyCredit: decimal("dailyCredit", { precision: 8, scale: 2 }),
  eventPayment: decimal("eventPayment", { precision: 8, scale: 2 }),
  estimatedEventsPerYear: int("estimatedEventsPerYear"),
  bundleDiscount: decimal("bundleDiscount", { precision: 8, scale: 2 }),
  
  // Additional Info
  minBatterySize: decimal("minBatterySize", { precision: 5, scale: 2 }), // kWh
  website: varchar("website", { length: 255 }),
  notes: text("notes"),
  
  // Metadata
  isActive: boolean("isActive").default(true),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VppProvider = typeof vppProviders.$inferSelect;
export type InsertVppProvider = typeof vppProviders.$inferInsert;

// ============================================
// STATE REBATES REFERENCE TABLE
// ============================================
export const stateRebates = mysqlTable("stateRebates", {
  id: int("id").autoincrement().primaryKey(),
  state: varchar("state", { length: 10 }).notNull(),
  rebateType: mysqlEnum("rebateType", ["solar", "battery", "heat_pump_hw", "heat_pump_ac", "ev_charger", "induction"]).notNull(),
  
  // Rebate Details
  name: varchar("name", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  isPercentage: boolean("isPercentage").default(false),
  maxAmount: decimal("maxAmount", { precision: 10, scale: 2 }),
  
  // Eligibility
  eligibilityCriteria: text("eligibilityCriteria"),
  incomeThreshold: decimal("incomeThreshold", { precision: 12, scale: 2 }),
  
  // Validity
  validFrom: timestamp("validFrom"),
  validUntil: timestamp("validUntil"),
  isActive: boolean("isActive").default(true),
  
  // Metadata
  sourceUrl: varchar("sourceUrl", { length: 512 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StateRebate = typeof stateRebates.$inferSelect;
export type InsertStateRebate = typeof stateRebates.$inferInsert;

// ============================================
// CUSTOMER DOCUMENTS TABLE (Photos & PDFs)
// ============================================
export const customerDocuments = mysqlTable("customerDocuments", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  userId: int("userId").notNull(), // Uploaded by user
  
  // Document Type
  documentType: mysqlEnum("documentType", [
    "switchboard_photo",
    "meter_photo", 
    "roof_photo",
    "property_photo",
    "solar_proposal_pdf",
    "other"
  ]).notNull(),
  
  // File Storage
  fileUrl: varchar("fileUrl", { length: 512 }).notNull(),
  fileKey: varchar("fileKey", { length: 255 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileSize: int("fileSize"), // bytes
  mimeType: varchar("mimeType", { length: 100 }),
  
  // Metadata
  description: text("description"),
  extractedData: json("extractedData"), // For AI-extracted info from photos/PDFs
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomerDocument = typeof customerDocuments.$inferSelect;
export type InsertCustomerDocument = typeof customerDocuments.$inferInsert;

// ============================================
// TYPE DEFINITIONS FOR JSON FIELDS
// ============================================

export interface ProposalCalculations {
  // ========== RAW BILL DATA ==========
  // Electricity Bill Details
  billRetailer?: string;
  billPeriodStart?: string;
  billPeriodEnd?: string;
  billDays?: number;
  billTotalAmount?: number;
  billDailySupplyCharge?: number;
  billTotalUsageKwh?: number;
  billPeakUsageKwh?: number;
  billOffPeakUsageKwh?: number;
  billShoulderUsageKwh?: number;
  billSolarExportsKwh?: number;
  billPeakRateCents?: number;
  billOffPeakRateCents?: number;
  billShoulderRateCents?: number;
  billFeedInTariffCents?: number;
  
  // Gas Bill Details (if applicable)
  gasBillRetailer?: string;
  gasBillPeriodStart?: string;
  gasBillPeriodEnd?: string;
  gasBillDays?: number;
  gasBillTotalAmount?: number;
  gasBillDailySupplyCharge?: number;
  gasBillUsageMj?: number;
  gasBillRateCentsMj?: number;
  
  // ========== USAGE PROJECTIONS ==========
  dailyAverageKwh: number;
  monthlyUsageKwh: number;
  yearlyUsageKwh: number;
  projectedAnnualCost: number;
  dailyAverageCost?: number;
  
  // Calculated charge breakdowns
  annualSupplyCharge?: number;
  annualUsageCharge?: number;
  annualSolarCredit?: number;
  
  // ========== GAS ANALYSIS ==========
  gasAnnualCost?: number;
  gasKwhEquivalent?: number;
  gasCo2Emissions?: number;
  gasDailyGasCost?: number;
  gasAnnualSupplyCharge?: number;
  
  // ========== ELECTRIFICATION DETAIL ==========
  // Hot Water
  hotWaterSavings?: number;
  hotWaterCurrentGasCost?: number;
  hotWaterHeatPumpCost?: number;
  hotWaterDailySupplySaved?: number;
  
  // Heating & Cooling
  heatingCoolingSavings?: number;
  heatingCurrentGasCost?: number;
  heatingRcAcCost?: number;
  
  // Cooking
  cookingSavings?: number;
  cookingCurrentGasCost?: number;
  cookingInductionCost?: number;
  
  // Pool
  poolHeatPumpSavings?: number;
  poolRecommendedKw?: number;
  poolAnnualOperatingCost?: number;
  
  // ========== BATTERY ==========
  recommendedBatteryKwh: number;
  batteryProduct?: string;
  batteryPaybackYears?: number;
  batteryEstimatedCost?: number;
  
  // ========== SOLAR ==========
  recommendedSolarKw?: number;
  solarPanelCount?: number;
  solarAnnualGeneration?: number;
  solarEstimatedCost?: number;
  
  // ========== VPP ==========
  selectedVppProvider?: string;
  vppAnnualValue?: number;
  vppDailyCreditAnnual?: number;
  vppEventPaymentsAnnual?: number;
  vppBundleDiscount?: number;
  vppProviderComparison?: VppComparisonItem[];
  
  // ========== EV ==========
  evPetrolCost?: number;
  evGridChargeCost?: number;
  evSolarChargeCost?: number;
  evAnnualSavings?: number;
  evKmPerYear?: number;
  evConsumptionPer100km?: number;
  evPetrolPricePerLitre?: number;
  
  // ========== CO2 ==========
  co2ReductionTonnes?: number;
  co2CurrentTonnes?: number;
  co2ProjectedTonnes?: number;
  co2ReductionPercent?: number;
  
  // ========== REBATES DETAIL ==========
  solarRebateAmount?: number;
  batteryRebateAmount?: number;
  heatPumpHwRebateAmount?: number;
  heatPumpAcRebateAmount?: number;
  
  // ========== INVESTMENT DETAIL ==========
  investmentSolar?: number;
  investmentBattery?: number;
  investmentHeatPumpHw?: number;
  investmentRcAc?: number;
  investmentInduction?: number;
  investmentEvCharger?: number;
  investmentPoolHeatPump?: number;
  
  // ========== TOTAL SUMMARY ==========
  totalAnnualSavings: number;
  totalInvestment: number;
  totalRebates: number;
  netInvestment: number;
  paybackYears: number;
  tenYearSavings?: number;
  twentyFiveYearSavings?: number;
}

export interface VppComparisonItem {
  provider: string;
  programName: string;
  hasGasBundle: boolean;
  estimatedAnnualValue: number;
  strategicFit: "excellent" | "good" | "moderate" | "poor";
}

export interface SlideData {
  type: string;
  title: string;
  html: string;
  isIncluded: boolean;
}

// ============================================
// PROPOSAL ACCESS TOKENS TABLE (Customer Portal)
// ============================================
export const proposalAccessTokens = mysqlTable("proposalAccessTokens", {
  id: int("id").autoincrement().primaryKey(),
  proposalId: int("proposalId").notNull(),
  customerId: int("customerId").notNull(),
  
  // Access Token
  token: varchar("token", { length: 64 }).notNull().unique(),
  
  // Access Control
  expiresAt: timestamp("expiresAt"),
  isActive: boolean("isActive").default(true),
  
  // Tracking
  viewCount: int("viewCount").default(0),
  lastViewedAt: timestamp("lastViewedAt"),
  
  // Metadata
  createdBy: int("createdBy").notNull(), // User who created the link
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProposalAccessToken = typeof proposalAccessTokens.$inferSelect;
export type InsertProposalAccessToken = typeof proposalAccessTokens.$inferInsert;


// ============================================
// PROPOSAL VIEWS TABLE (Analytics)
// ============================================
export const proposalViews = mysqlTable("proposalViews", {
  id: int("id").autoincrement().primaryKey(),
  proposalId: int("proposalId").notNull(),
  accessTokenId: int("accessTokenId"),
  
  // Visitor Info
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  referrer: varchar("referrer", { length: 512 }),
  
  // Session Tracking
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  durationSeconds: int("durationSeconds").default(0),
  totalSlidesViewed: int("totalSlidesViewed").default(0),
  
  // Device Info
  deviceType: varchar("deviceType", { length: 20 }), // desktop, mobile, tablet
  browser: varchar("browser", { length: 50 }),
  os: varchar("os", { length: 50 }),
  
  // Timestamps
  viewedAt: timestamp("viewedAt").defaultNow().notNull(),
  lastActivityAt: timestamp("lastActivityAt").defaultNow().notNull(),
});

export type ProposalView = typeof proposalViews.$inferSelect;
export type InsertProposalView = typeof proposalViews.$inferInsert;

// ============================================
// SLIDE ENGAGEMENT TABLE (Analytics)
// ============================================
export const slideEngagement = mysqlTable("slideEngagement", {
  id: int("id").autoincrement().primaryKey(),
  proposalId: int("proposalId").notNull(),
  viewId: int("viewId").notNull(), // Links to proposalViews
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  
  // Slide Info
  slideIndex: int("slideIndex").notNull(),
  slideType: varchar("slideType", { length: 50 }).notNull(),
  slideTitle: varchar("slideTitle", { length: 255 }),
  
  // Engagement Metrics
  timeSpentSeconds: int("timeSpentSeconds").default(0),
  viewCount: int("viewCount").default(1), // Times revisited within session
  
  // Timestamps
  firstViewedAt: timestamp("firstViewedAt").defaultNow().notNull(),
  lastViewedAt: timestamp("lastViewedAt").defaultNow().notNull(),
});

export type SlideEngagement = typeof slideEngagement.$inferSelect;
export type InsertSlideEngagement = typeof slideEngagement.$inferInsert;
