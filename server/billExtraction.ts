/**
 * AI-Powered Bill Data Extraction Service
 * Uses LLM with vision capabilities to extract data from electricity and gas bills
 */

import { invokeLLM } from "./_core/llm";

// ============================================
// TYPES
// ============================================

export interface ElectricityBillData {
  // Customer Info
  customerName?: string;
  serviceAddress?: string;
  state?: string;
  
  // Billing Period
  billingPeriodStart?: string;
  billingPeriodEnd?: string;
  billingDays?: number;
  
  // Costs
  totalAmount?: number;
  dailySupplyCharge?: number;
  
  // Usage
  totalUsageKwh?: number;
  peakUsageKwh?: number;
  offPeakUsageKwh?: number;
  shoulderUsageKwh?: number;
  solarExportsKwh?: number;
  
  // Rates
  peakRateCents?: number;
  offPeakRateCents?: number;
  shoulderRateCents?: number;
  feedInTariffCents?: number;
  
  // Retailer
  retailer?: string;
  
  // Confidence
  extractionConfidence?: number;
  rawData?: Record<string, unknown>;
}

export interface GasBillData {
  // Customer Info
  customerName?: string;
  serviceAddress?: string;
  state?: string;
  
  // Billing Period
  billingPeriodStart?: string;
  billingPeriodEnd?: string;
  billingDays?: number;
  
  // Costs
  totalAmount?: number;
  dailySupplyCharge?: number;
  
  // Usage
  gasUsageMj?: number;
  gasRateCentsMj?: number;
  
  // Retailer
  retailer?: string;
  
  // Confidence
  extractionConfidence?: number;
  rawData?: Record<string, unknown>;
}

// ============================================
// EXTRACTION PROMPTS
// ============================================

const ELECTRICITY_BILL_SCHEMA = {
  type: "object",
  properties: {
    customerName: { type: "string", description: "Full name of the account holder" },
    serviceAddress: { type: "string", description: "Service/supply address" },
    state: { type: "string", description: "Australian state abbreviation (VIC, NSW, QLD, SA, WA, TAS, NT, ACT)" },
    billingPeriodStart: { type: "string", description: "Start date of billing period (YYYY-MM-DD format)" },
    billingPeriodEnd: { type: "string", description: "End date of billing period (YYYY-MM-DD format)" },
    billingDays: { type: "number", description: "Number of days in the billing period" },
    totalAmount: { type: "number", description: "Total amount due in dollars (e.g., 450.25)" },
    dailySupplyCharge: { type: "number", description: "Daily supply charge in dollars (e.g., 1.20)" },
    totalUsageKwh: { type: "number", description: "Total electricity usage in kWh" },
    peakUsageKwh: { type: "number", description: "Peak period usage in kWh (if available)" },
    offPeakUsageKwh: { type: "number", description: "Off-peak period usage in kWh (if available)" },
    shoulderUsageKwh: { type: "number", description: "Shoulder period usage in kWh (if available)" },
    solarExportsKwh: { type: "number", description: "Solar exports/feed-in in kWh (if available)" },
    peakRateCents: { type: "number", description: "Peak rate in cents per kWh (e.g., 35.5)" },
    offPeakRateCents: { type: "number", description: "Off-peak rate in cents per kWh (if available)" },
    shoulderRateCents: { type: "number", description: "Shoulder rate in cents per kWh (if available)" },
    feedInTariffCents: { type: "number", description: "Feed-in tariff in cents per kWh (if available)" },
    retailer: { type: "string", description: "Name of the electricity retailer" },
    extractionConfidence: { type: "number", description: "Confidence score 0-100 for the extraction accuracy" },
  },
  required: ["totalAmount", "totalUsageKwh", "retailer", "extractionConfidence"],
  additionalProperties: false,
};

const GAS_BILL_SCHEMA = {
  type: "object",
  properties: {
    customerName: { type: "string", description: "Full name of the account holder" },
    serviceAddress: { type: "string", description: "Service/supply address" },
    state: { type: "string", description: "Australian state abbreviation (VIC, NSW, QLD, SA, WA, TAS, NT, ACT)" },
    billingPeriodStart: { type: "string", description: "Start date of billing period (YYYY-MM-DD format)" },
    billingPeriodEnd: { type: "string", description: "End date of billing period (YYYY-MM-DD format)" },
    billingDays: { type: "number", description: "Number of days in the billing period" },
    totalAmount: { type: "number", description: "Total amount due in dollars (e.g., 150.75)" },
    dailySupplyCharge: { type: "number", description: "Daily supply charge in dollars (e.g., 0.85)" },
    gasUsageMj: { type: "number", description: "Total gas usage in MJ (megajoules)" },
    gasRateCentsMj: { type: "number", description: "Gas rate in cents per MJ (e.g., 3.5)" },
    retailer: { type: "string", description: "Name of the gas retailer" },
    extractionConfidence: { type: "number", description: "Confidence score 0-100 for the extraction accuracy" },
  },
  required: ["totalAmount", "gasUsageMj", "retailer", "extractionConfidence"],
  additionalProperties: false,
};

// ============================================
// EXTRACTION FUNCTIONS
// ============================================

export async function extractElectricityBillData(fileUrl: string): Promise<ElectricityBillData> {
  const systemPrompt = `You are an expert at extracting data from Australian electricity bills. 
Your task is to carefully analyze the provided electricity bill image/PDF and extract all relevant information.

Key guidelines:
- Look for the total amount due, not just usage charges
- Identify peak, off-peak, and shoulder usage if the bill has time-of-use pricing
- Extract the daily supply charge (sometimes called "service to property" or "daily charge")
- Find the feed-in tariff if the customer has solar
- Identify the billing period dates and calculate the number of days
- Determine the state from the service address
- Note the electricity retailer name

If a value is not clearly visible or not applicable, omit it from the response.
Provide a confidence score (0-100) based on how clearly you could read and extract the data.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { 
          role: "user", 
          content: [
            { type: "text", text: "Please extract all relevant data from this electricity bill:" },
            { type: "file_url", file_url: { url: fileUrl, mime_type: "application/pdf" } }
          ]
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "electricity_bill_data",
          strict: true,
          schema: ELECTRICITY_BILL_SCHEMA,
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new Error("No response from LLM");
    }

    const data = JSON.parse(content) as ElectricityBillData;
    data.rawData = { originalResponse: content };
    
    return data;
  } catch (error) {
    console.error("[BillExtraction] Failed to extract electricity bill:", error);
    throw new Error(`Failed to extract electricity bill data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function extractGasBillData(fileUrl: string): Promise<GasBillData> {
  const systemPrompt = `You are an expert at extracting data from Australian gas bills.
Your task is to carefully analyze the provided gas bill image/PDF and extract all relevant information.

Key guidelines:
- Gas usage in Australia is typically measured in MJ (megajoules)
- Look for the total amount due, not just usage charges
- Extract the daily supply charge (sometimes called "service charge" or "daily charge")
- Identify the billing period dates and calculate the number of days
- Determine the state from the service address
- Note the gas retailer name

If a value is not clearly visible or not applicable, omit it from the response.
Provide a confidence score (0-100) based on how clearly you could read and extract the data.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { 
          role: "user", 
          content: [
            { type: "text", text: "Please extract all relevant data from this gas bill:" },
            { type: "file_url", file_url: { url: fileUrl, mime_type: "application/pdf" } }
          ]
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "gas_bill_data",
          strict: true,
          schema: GAS_BILL_SCHEMA,
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new Error("No response from LLM");
    }

    const data = JSON.parse(content) as GasBillData;
    data.rawData = { originalResponse: content };
    
    return data;
  } catch (error) {
    console.error("[BillExtraction] Failed to extract gas bill:", error);
    throw new Error(`Failed to extract gas bill data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============================================
// VALIDATION HELPERS
// ============================================

export function validateElectricityBillData(data: ElectricityBillData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.totalAmount || data.totalAmount <= 0) {
    errors.push("Total amount is missing or invalid");
  }
  
  if (!data.totalUsageKwh || data.totalUsageKwh <= 0) {
    errors.push("Total usage is missing or invalid");
  }
  
  if (!data.retailer) {
    errors.push("Retailer name is missing");
  }
  
  if (data.billingDays && (data.billingDays < 1 || data.billingDays > 120)) {
    errors.push("Billing days seems incorrect (should be 1-120)");
  }
  
  if (data.extractionConfidence && data.extractionConfidence < 50) {
    errors.push("Low extraction confidence - manual review recommended");
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateGasBillData(data: GasBillData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.totalAmount || data.totalAmount <= 0) {
    errors.push("Total amount is missing or invalid");
  }
  
  if (!data.gasUsageMj || data.gasUsageMj <= 0) {
    errors.push("Gas usage is missing or invalid");
  }
  
  if (!data.retailer) {
    errors.push("Retailer name is missing");
  }
  
  if (data.billingDays && (data.billingDays < 1 || data.billingDays > 120)) {
    errors.push("Billing days seems incorrect (should be 1-120)");
  }
  
  if (data.extractionConfidence && data.extractionConfidence < 50) {
    errors.push("Low extraction confidence - manual review recommended");
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================
// STATE DETECTION HELPER
// ============================================

export function detectStateFromAddress(address: string): string | null {
  const statePatterns: Record<string, RegExp[]> = {
    VIC: [/\bVIC\b/i, /\bVictoria\b/i, /\b3\d{3}\b/],
    NSW: [/\bNSW\b/i, /\bNew South Wales\b/i, /\b2\d{3}\b/],
    QLD: [/\bQLD\b/i, /\bQueensland\b/i, /\b4\d{3}\b/],
    SA: [/\bSA\b/i, /\bSouth Australia\b/i, /\b5\d{3}\b/],
    WA: [/\bWA\b/i, /\bWestern Australia\b/i, /\b6\d{3}\b/],
    TAS: [/\bTAS\b/i, /\bTasmania\b/i, /\b7\d{3}\b/],
    NT: [/\bNT\b/i, /\bNorthern Territory\b/i, /\b0\d{3}\b/],
    ACT: [/\bACT\b/i, /\bAustralian Capital Territory\b/i, /\b2[67]\d{2}\b/],
  };
  
  for (const [state, patterns] of Object.entries(statePatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(address)) {
        return state;
      }
    }
  }
  
  return null;
}
