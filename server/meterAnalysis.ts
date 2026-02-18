import { invokeLLM } from "./_core/llm";

// ============================================================
// Meter Photo Analysis — LLM Vision Extraction
// Dedicated analysis for photos tagged as 'meter_photo'
// ============================================================

export interface MeterAnalysis {
  // Meter identification
  meterNumber: string | null;           // The meter serial number visible on the device
  nmi: string | null;                   // National Metering Identifier (if visible on meter or label)
  meterBrand: string | null;            // e.g., "Landis+Gyr", "Secure", "Itron", "Ausgrid"
  meterModel: string | null;            // e.g., "E350", "Liberty 100"

  // Meter type classification
  meterType: 'smart' | 'digital' | 'analog' | 'unknown';
  meterGeneration: string | null;       // e.g., "Type 4 (smart)", "Type 5 (interval)", "Type 6 (basic)"

  // Solar readiness
  isBidirectional: boolean | null;      // Can measure export? null = cannot determine
  bidirectionalEvidence: string | null; // e.g., "Import/Export registers visible on display"
  supportsSolarExport: boolean | null;  // null = cannot determine
  meterSwapRequired: boolean;           // Whether the meter needs to be replaced for solar
  meterSwapReason: string | null;       // e.g., "Analog meter cannot measure solar export"

  // CT (Current Transformer) details
  hasCTs: boolean | null;               // Current transformers visible?
  ctRating: string | null;              // e.g., "60/5A"

  // Display readings (if visible)
  displayReading: string | null;        // Current display value if readable
  displayRegisters: string[];           // e.g., ["Import: 12345.6 kWh", "Export: 678.9 kWh"]

  // Physical condition
  meterCondition: 'good' | 'fair' | 'poor' | 'unknown';
  meterAge: string | null;              // Estimated age or manufacture date if visible
  sealIntact: boolean | null;           // Meter seal/tamper seal visible and intact

  // Connection details
  connectionType: string | null;        // e.g., "Single-phase direct connect", "Three-phase CT connected"
  phaseConfiguration: 'single' | 'three' | 'unknown';

  // Additional notes
  notes: string[];
  warnings: string[];

  // Confidence score
  confidence: number;                   // 0-100
}

/**
 * Analyze a meter photo using LLM vision to extract meter details
 * for solar installation metering requirements assessment
 */
export async function analyzeMeterPhoto(imageUrl: string): Promise<MeterAnalysis> {
  const systemPrompt = `You are a licensed Australian electrician and metering specialist conducting a pre-installation meter assessment for a solar PV and battery storage system.

Your task is to perform a thorough analysis of the electricity meter from the photo, extracting all data that an installer and the DNSP (Distribution Network Service Provider) need to determine metering requirements.

Analyze the following aspects with precision:

METER IDENTIFICATION:
1. Meter serial number (usually printed on a label or engraved on the meter body)
2. NMI (National Metering Identifier) — typically a 10-11 digit number, may be on a separate label
3. Meter brand and model (e.g., Landis+Gyr E350, Secure Liberty 100, Itron ACE6000)
4. Meter generation/type classification:
   - Type 4 (smart meter) — communicates remotely, interval data
   - Type 5 (interval meter) — records interval data, manually read
   - Type 6 (basic/accumulation) — single register, no interval data
   - Analog (electromechanical) — spinning disc, no digital display

SOLAR READINESS ASSESSMENT:
5. Is this meter bi-directional? Look for:
   - Import/Export registers on the display
   - "Bi-directional" or "Net meter" labels
   - Multiple register displays (cycling through readings)
   - Arrow indicators showing import and export
6. Can it support solar export measurement?
7. Will a meter swap be required? (Analog meters ALWAYS need replacement. Basic digital meters usually need replacement. Smart meters are usually fine.)
8. If swap required, explain why

CT (CURRENT TRANSFORMER) DETAILS:
9. Are CTs visible? (external donut-shaped devices on cables)
10. CT rating if readable

DISPLAY AND READINGS:
11. Current display reading if visible
12. Any register values visible (import kWh, export kWh, etc.)

PHYSICAL ASSESSMENT:
13. Overall meter condition
14. Manufacture date or estimated age
15. Are seals intact?

CONNECTION TYPE:
16. Single-phase or three-phase (count the number of active conductors entering the meter)
17. Direct connect or CT connected

Be precise with numbers and identifiers. If you cannot determine something clearly, indicate it as null.
Provide warnings for any concerns that could affect the solar installation timeline (e.g., "Meter swap required — allow 2-4 weeks for DNSP processing").`;

  const userPrompt = `Analyze this electricity meter photo and extract all relevant details for a solar PV + battery storage installation metering assessment.

Return your analysis as a JSON object:
{
  "meterNumber": <string or null — meter serial number>,
  "nmi": <string or null — National Metering Identifier>,
  "meterBrand": <string or null>,
  "meterModel": <string or null>,
  "meterType": <"smart" | "digital" | "analog" | "unknown">,
  "meterGeneration": <string or null — e.g., "Type 4 (smart)">,
  "isBidirectional": <boolean or null>,
  "bidirectionalEvidence": <string or null>,
  "supportsSolarExport": <boolean or null>,
  "meterSwapRequired": <boolean>,
  "meterSwapReason": <string or null>,
  "hasCTs": <boolean or null>,
  "ctRating": <string or null>,
  "displayReading": <string or null>,
  "displayRegisters": [<string>],
  "meterCondition": <"good" | "fair" | "poor" | "unknown">,
  "meterAge": <string or null>,
  "sealIntact": <boolean or null>,
  "connectionType": <string or null>,
  "phaseConfiguration": <"single" | "three" | "unknown">,
  "notes": [<string>],
  "warnings": [<string>],
  "confidence": <number 0-100>
}`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user" as const,
          content: [
            { type: "text" as const, text: userPrompt },
            {
              type: "image_url" as const,
              image_url: {
                url: imageUrl,
                detail: "high" as const
              }
            }
          ]
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "meter_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              meterNumber: { type: ["string", "null"], description: "Meter serial number" },
              nmi: { type: ["string", "null"], description: "National Metering Identifier" },
              meterBrand: { type: ["string", "null"], description: "Meter brand" },
              meterModel: { type: ["string", "null"], description: "Meter model" },
              meterType: { type: "string", enum: ["smart", "digital", "analog", "unknown"] },
              meterGeneration: { type: ["string", "null"], description: "Meter type classification" },
              isBidirectional: { type: ["boolean", "null"], description: "Is the meter bi-directional?" },
              bidirectionalEvidence: { type: ["string", "null"], description: "Evidence for bi-directional determination" },
              supportsSolarExport: { type: ["boolean", "null"], description: "Can it support solar export?" },
              meterSwapRequired: { type: "boolean", description: "Does the meter need replacement?" },
              meterSwapReason: { type: ["string", "null"], description: "Reason for meter swap" },
              hasCTs: { type: ["boolean", "null"], description: "Are CTs visible?" },
              ctRating: { type: ["string", "null"], description: "CT rating if visible" },
              displayReading: { type: ["string", "null"], description: "Current display reading" },
              displayRegisters: { type: "array", items: { type: "string" }, description: "Visible register values" },
              meterCondition: { type: "string", enum: ["good", "fair", "poor", "unknown"] },
              meterAge: { type: ["string", "null"], description: "Estimated age or manufacture date" },
              sealIntact: { type: ["boolean", "null"], description: "Are seals intact?" },
              connectionType: { type: ["string", "null"], description: "Connection type" },
              phaseConfiguration: { type: "string", enum: ["single", "three", "unknown"] },
              notes: { type: "array", items: { type: "string" } },
              warnings: { type: "array", items: { type: "string" } },
              confidence: { type: "number", description: "Confidence score 0-100" }
            },
            required: [
              "meterNumber", "nmi", "meterBrand", "meterModel",
              "meterType", "meterGeneration",
              "isBidirectional", "bidirectionalEvidence", "supportsSolarExport",
              "meterSwapRequired", "meterSwapReason",
              "hasCTs", "ctRating",
              "displayReading", "displayRegisters",
              "meterCondition", "meterAge", "sealIntact",
              "connectionType", "phaseConfiguration",
              "notes", "warnings", "confidence"
            ],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No response from LLM");

    const textContent = typeof content === 'string' ? content :
      Array.isArray(content) ? (content.find((c: any) => c.type === 'text') as any)?.text || '' : '';

    if (!textContent) throw new Error("No text content in response");

    return JSON.parse(textContent) as MeterAnalysis;
  } catch (error) {
    console.error("Meter analysis error:", error);
    return {
      meterNumber: null,
      nmi: null,
      meterBrand: null,
      meterModel: null,
      meterType: 'unknown',
      meterGeneration: null,
      isBidirectional: null,
      bidirectionalEvidence: null,
      supportsSolarExport: null,
      meterSwapRequired: true,
      meterSwapReason: 'Unable to analyze meter photo — manual inspection required',
      hasCTs: null,
      ctRating: null,
      displayReading: null,
      displayRegisters: [],
      meterCondition: 'unknown',
      meterAge: null,
      sealIntact: null,
      connectionType: null,
      phaseConfiguration: 'unknown',
      notes: [],
      warnings: ['Meter analysis failed — manual inspection required'],
      confidence: 0
    };
  }
}

/**
 * Generate a summary report from meter analysis
 */
export function generateMeterReport(analysis: MeterAnalysis): string {
  const lines: string[] = [];

  lines.push("## Meter Analysis Report\n");

  // Meter identification
  if (analysis.meterBrand || analysis.meterModel) {
    lines.push(`**Meter:** ${[analysis.meterBrand, analysis.meterModel].filter(Boolean).join(' ')}`);
  }
  if (analysis.meterNumber) {
    lines.push(`**Serial Number:** ${analysis.meterNumber}`);
  }
  if (analysis.nmi) {
    lines.push(`**NMI:** ${analysis.nmi}`);
  }

  // Type and generation
  lines.push(`**Type:** ${analysis.meterType.charAt(0).toUpperCase() + analysis.meterType.slice(1)}`);
  if (analysis.meterGeneration) {
    lines.push(`**Classification:** ${analysis.meterGeneration}`);
  }

  // Solar readiness
  lines.push("\n### Solar Readiness\n");
  lines.push(`- Bi-directional: ${analysis.isBidirectional === true ? '✓ Yes' : analysis.isBidirectional === false ? '✗ No' : '? Unknown'}`);
  if (analysis.bidirectionalEvidence) {
    lines.push(`  _Evidence: ${analysis.bidirectionalEvidence}_`);
  }
  lines.push(`- Supports Solar Export: ${analysis.supportsSolarExport === true ? '✓ Yes' : analysis.supportsSolarExport === false ? '✗ No' : '? Unknown'}`);
  lines.push(`- Meter Swap Required: ${analysis.meterSwapRequired ? '⚠️ Yes' : '✓ No'}`);
  if (analysis.meterSwapReason) {
    lines.push(`  _Reason: ${analysis.meterSwapReason}_`);
  }

  // Condition
  lines.push(`\n**Condition:** ${analysis.meterCondition.charAt(0).toUpperCase() + analysis.meterCondition.slice(1)}`);
  lines.push(`**Phase:** ${analysis.phaseConfiguration === 'single' ? 'Single Phase' : analysis.phaseConfiguration === 'three' ? 'Three Phase' : 'Unknown'}`);

  lines.push(`\n*Analysis confidence: ${analysis.confidence}%*`);

  return lines.join('\n');
}
