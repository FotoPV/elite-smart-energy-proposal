import { invokeLLM } from "./_core/llm";

// ============================================
// SOLAR PROPOSAL SYSTEM DETAILS EXTRACTION
// ============================================
// Uses LLM vision to extract exact system components
// from an uploaded solar proposal page/PDF

export interface ExtractedSystemSpecs {
  // Solar
  solarSystemSizeKw: number | null;
  solarPanelCount: number | null;
  solarPanelWattage: number | null;
  solarPanelBrand: string | null;
  solarPanelModel: string | null;
  estimatedAnnualProductionKwh: number | null;
  systemEfficiencyPercent: number | null;

  // Inverter
  inverterBrand: string | null;
  inverterModel: string | null;
  inverterSizeW: number | null;
  inverterPhase: string | null; // "single" | "three"
  inverterEfficiencyPercent: number | null;
  inverterCount: number | null;

  // Battery
  batteryBrand: string | null;
  batteryModel: string | null;
  batterySizeKwh: number | null;
  batteryUsableKwh: number | null;
  batteryCount: number | null;
  batteryChemistry: string | null; // e.g. "LiFePO4"

  // Metadata
  proposalSource: string | null; // e.g. "OpenSolar", "SolarQuotes", etc.
  extractionConfidence: number; // 0-100
  notes: string[];
}

const SOLAR_PROPOSAL_EXTRACTION_PROMPT = `You are an expert at extracting system specifications from Australian solar proposal documents.
Your task is to carefully analyze the provided solar proposal image/PDF page and extract all system component details.

Key guidelines:
- Extract the EXACT solar system size in kW (look for kW_DC, kW STC, or just kW)
- Extract the EXACT panel brand, model, wattage, and count (e.g., "23 × 475W LONGi Solar Hi-MO X6")
- Extract the EXACT inverter brand, model, size in watts, and phase type
- Extract the EXACT battery brand, model, PER-UNIT kWh capacity, usable kWh PER UNIT, count, and chemistry
- CRITICAL: batterySizeKwh must be the capacity of ONE battery module/unit, NOT the total. For example, if the proposal shows "3 × GoodWe GW8.3-BAT-D-G20", batterySizeKwh should be 8.3 (one module), batteryCount should be 3
- Similarly, batteryUsableKwh should be the usable capacity of ONE unit
- Extract estimated annual production in kWh if shown
- Extract system efficiency percentage if shown
- Identify the proposal platform/source if visible (OpenSolar, SolarQuotes, Sungrow iEnergyPro, etc.)
- Be precise with numbers — do not round or approximate
- If a value is not clearly visible or not present, set it to null
- For battery count, look for patterns like "2 ×" or "2x" before the model name
- For inverter count, look for patterns like "1 ×" or "1x" before the model name

Provide a confidence score (0-100) based on how clearly you could read and extract the data.
Add any relevant notes about the extraction (e.g., "Battery specs found on separate page", "Pricing not visible").

Return your response as valid JSON matching this exact schema:
{
  "solarSystemSizeKw": number or null,
  "solarPanelCount": number or null,
  "solarPanelWattage": number or null,
  "solarPanelBrand": "string or null",
  "solarPanelModel": "string or null",
  "estimatedAnnualProductionKwh": number or null,
  "systemEfficiencyPercent": number or null,
  "inverterBrand": "string or null",
  "inverterModel": "string or null",
  "inverterSizeW": number or null,
  "inverterPhase": "single" or "three" or null,
  "inverterEfficiencyPercent": number or null,
  "inverterCount": number or null,
  "batteryBrand": "string or null",
  "batteryModel": "string or null",
  "batterySizeKwh": number or null (PER-UNIT capacity in kWh, NOT total),
  "batteryUsableKwh": number or null (PER-UNIT usable capacity, NOT total),
  "batteryCount": number or null (number of battery units/modules),
  "batteryChemistry": "string or null",
  "proposalSource": "string or null",
  "extractionConfidence": number,
  "notes": ["string"]
}`;

export async function extractSolarProposalSpecs(fileUrl: string, mimeType?: string): Promise<ExtractedSystemSpecs> {
  // Determine if this is a PDF or image based on URL extension or mime type
  const isPdf = mimeType?.includes('pdf') || fileUrl.toLowerCase().endsWith('.pdf');
  
  // Build the file content block — use file_url for PDFs, image_url for images
  const fileContent = isPdf 
    ? {
        type: "file_url" as const,
        file_url: {
          url: fileUrl,
          mime_type: "application/pdf" as const,
        },
      }
    : {
        type: "image_url" as const,
        image_url: {
          url: fileUrl,
          detail: "high" as const,
        },
      };
  
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: SOLAR_PROPOSAL_EXTRACTION_PROMPT,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract the system specifications from this solar proposal document. Return valid JSON only.",
          },
          fileContent,
        ],
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "solar_proposal_specs",
        strict: true,
        schema: {
          type: "object",
          properties: {
            solarSystemSizeKw: { type: ["number", "null"], description: "Solar system size in kW" },
            solarPanelCount: { type: ["number", "null"], description: "Number of solar panels" },
            solarPanelWattage: { type: ["number", "null"], description: "Individual panel wattage" },
            solarPanelBrand: { type: ["string", "null"], description: "Panel manufacturer brand" },
            solarPanelModel: { type: ["string", "null"], description: "Panel model name" },
            estimatedAnnualProductionKwh: { type: ["number", "null"], description: "Estimated annual production in kWh" },
            systemEfficiencyPercent: { type: ["number", "null"], description: "System efficiency percentage" },
            inverterBrand: { type: ["string", "null"], description: "Inverter manufacturer brand" },
            inverterModel: { type: ["string", "null"], description: "Inverter model name" },
            inverterSizeW: { type: ["number", "null"], description: "Inverter size in watts" },
            inverterPhase: { type: ["string", "null"], description: "Phase type: single or three" },
            inverterEfficiencyPercent: { type: ["number", "null"], description: "Inverter max efficiency %" },
            inverterCount: { type: ["number", "null"], description: "Number of inverters" },
            batteryBrand: { type: ["string", "null"], description: "Battery manufacturer brand" },
            batteryModel: { type: ["string", "null"], description: "Battery model name" },
            batterySizeKwh: { type: ["number", "null"], description: "PER-UNIT battery capacity in kWh (one module, NOT total). E.g. for 3x GoodWe GW8.3, this should be 8.3" },
            batteryUsableKwh: { type: ["number", "null"], description: "PER-UNIT usable battery capacity in kWh (one module, NOT total)" },
            batteryCount: { type: ["number", "null"], description: "Number of battery units/modules" },
            batteryChemistry: { type: ["string", "null"], description: "Battery chemistry type" },
            proposalSource: { type: ["string", "null"], description: "Proposal platform/source" },
            extractionConfidence: { type: "number", description: "Confidence score 0-100" },
            notes: { type: "array", items: { type: "string" }, description: "Extraction notes" },
          },
          required: [
            "solarSystemSizeKw", "solarPanelCount", "solarPanelWattage", "solarPanelBrand", "solarPanelModel",
            "estimatedAnnualProductionKwh", "systemEfficiencyPercent",
            "inverterBrand", "inverterModel", "inverterSizeW", "inverterPhase", "inverterEfficiencyPercent", "inverterCount",
            "batteryBrand", "batteryModel", "batterySizeKwh", "batteryUsableKwh", "batteryCount", "batteryChemistry",
            "proposalSource", "extractionConfidence", "notes"
          ],
          additionalProperties: false,
        },
      },
    },
  });

  const rawContent = response.choices[0]?.message?.content;
  if (!rawContent) {
    throw new Error("No response from LLM for solar proposal extraction");
  }

  // Content can be string or array of content blocks
  const contentStr = typeof rawContent === 'string' 
    ? rawContent 
    : (rawContent as Array<{type: string; text?: string}>).find(c => c.type === 'text')?.text || '';
  
  if (!contentStr) {
    throw new Error("No text content in LLM response for solar proposal extraction");
  }

  const parsed = JSON.parse(contentStr) as ExtractedSystemSpecs;
  return parsed;
}

/**
 * Generate a human-readable summary of extracted specs for confirmation
 */
export function generateSpecsSummary(specs: ExtractedSystemSpecs): string {
  const lines: string[] = [];

  if (specs.solarSystemSizeKw) {
    lines.push(`Solar: ${specs.solarSystemSizeKw}kW`);
    if (specs.solarPanelCount && specs.solarPanelWattage && specs.solarPanelBrand) {
      lines.push(`  Panels: ${specs.solarPanelCount} × ${specs.solarPanelWattage}W ${specs.solarPanelBrand}${specs.solarPanelModel ? ` ${specs.solarPanelModel}` : ''}`);
    }
  }

  if (specs.inverterBrand) {
    const sizeKw = specs.inverterSizeW ? `${(specs.inverterSizeW / 1000).toFixed(1)}kW` : '';
    lines.push(`Inverter: ${specs.inverterCount ? `${specs.inverterCount} × ` : ''}${specs.inverterBrand}${specs.inverterModel ? ` ${specs.inverterModel}` : ''} ${sizeKw}`.trim());
    if (specs.inverterPhase) lines.push(`  Phase: ${specs.inverterPhase}`);
  }

  if (specs.batteryBrand) {
    lines.push(`Battery: ${specs.batteryCount ? `${specs.batteryCount} × ` : ''}${specs.batteryBrand}${specs.batteryModel ? ` ${specs.batteryModel}` : ''} ${specs.batterySizeKwh ? `${specs.batterySizeKwh}kWh` : ''}`);
    if (specs.batteryUsableKwh) lines.push(`  Usable: ${specs.batteryUsableKwh}kWh`);
    if (specs.batteryChemistry) lines.push(`  Chemistry: ${specs.batteryChemistry}`);
  }

  if (specs.estimatedAnnualProductionKwh) {
    lines.push(`Annual Production: ${specs.estimatedAnnualProductionKwh.toLocaleString()}kWh`);
  }

  if (specs.systemEfficiencyPercent) {
    lines.push(`System Efficiency: ${specs.systemEfficiencyPercent}%`);
  }

  lines.push(`Confidence: ${specs.extractionConfidence}%`);

  return lines.join('\n');
}
