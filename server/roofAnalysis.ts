import { invokeLLM } from "./_core/llm";

// ============================================================
// Roof Photo Analysis — LLM Vision Extraction
// Dedicated analysis for photos tagged as 'roof_photo'
// Extracts orientation, shading, tilt angle, material, and
// solar generation profile data for the Solar PV slide.
// ============================================================

export interface RoofAnalysis {
  // Roof orientation
  primaryOrientation: 'north' | 'north-east' | 'north-west' | 'east' | 'west' | 'south' | 'south-east' | 'south-west' | 'flat' | 'unknown';
  orientationConfidence: 'high' | 'medium' | 'low';
  orientationEvidence: string | null;  // e.g., "Shadow angle indicates north-facing", "Satellite dish on south side"

  // Tilt angle
  tiltAngleDegrees: number | null;     // Estimated roof pitch in degrees (0 = flat, 90 = vertical)
  tiltCategory: 'flat' | 'low_pitch' | 'standard' | 'steep' | 'unknown'; // flat: 0-5°, low: 5-15°, standard: 15-35°, steep: 35°+
  tiltEvidence: string | null;

  // Shading assessment
  shadingLevel: 'none' | 'minimal' | 'moderate' | 'heavy' | 'unknown';
  shadingSources: string[];            // e.g., ["Large tree to the west", "Two-storey neighbour to the east"]
  shadingImpactPercent: number | null; // Estimated % production loss from shading (0-50)
  morningShading: boolean | null;      // Shading in morning hours (east side)
  afternoonShading: boolean | null;    // Shading in afternoon hours (west side)

  // Roof material and condition
  roofMaterial: 'colorbond' | 'tile_concrete' | 'tile_terracotta' | 'slate' | 'flat_membrane' | 'polycarbonate' | 'unknown';
  roofCondition: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
  roofColor: string | null;            // e.g., "Dark grey", "Cream", "Red terracotta"

  // Usable roof area
  usableAreaEstimateSqm: number | null; // Estimated usable area for panels in m²
  panelCapacityEstimate: number | null; // Estimated number of standard 400W panels that could fit
  obstructions: string[];              // e.g., ["Skylight in centre of north face", "Vent pipe near ridge"]

  // Mounting considerations
  mountingType: 'flush' | 'tilt_frame' | 'ballast' | 'unknown'; // flush for pitched, tilt for flat, ballast for flat commercial
  mountingNotes: string | null;

  // Solar generation profile impact
  solarEfficiencyMultiplier: number;   // 0.5-1.0 — multiplier on ideal generation (1.0 = perfect north, no shade, optimal tilt)
  annualProductionAdjustment: string | null; // e.g., "North-west orientation reduces annual yield by ~8% vs true north"

  // Additional observations
  notes: string[];
  warnings: string[];

  // Confidence score
  confidence: number;                  // 0-100
}

/**
 * Analyze a roof photo using LLM vision to extract roof characteristics
 * for solar PV system design and generation profile estimation
 */
export async function analyzeRoofPhoto(imageUrl: string, state?: string): Promise<RoofAnalysis> {
  const stateContext = state ? `The property is located in ${state}, Australia.` : 'The property is in Australia.';

  const systemPrompt = `You are a senior solar PV system designer and CEC-accredited installer conducting a remote roof assessment for a residential solar installation in Australia.

Your task is to perform a thorough analysis of the roof from the photo, extracting all data needed to design an optimal solar PV array layout and estimate the solar generation profile.

${stateContext}

ORIENTATION ASSESSMENT:
1. Determine the primary roof face orientation (compass direction). In Australia, NORTH-facing is ideal for solar.
   - Look for shadow direction, satellite dishes (usually point north in Australia), compass clues
   - If this is an aerial/satellite view, use the image orientation
   - If uncertain, note what evidence you can see
2. Rate your confidence in the orientation assessment

TILT ANGLE ASSESSMENT:
3. Estimate the roof pitch angle in degrees
   - Flat roofs: 0-5°
   - Low pitch: 5-15° (common for modern homes)
   - Standard pitch: 15-35° (ideal for solar in most of Australia)
   - Steep pitch: 35°+ (may reduce output)
4. Provide evidence for your tilt estimate

SHADING ASSESSMENT:
5. Identify ALL shading sources:
   - Trees (species if identifiable, height relative to roof)
   - Neighbouring buildings (height, distance, direction)
   - Self-shading from roof features (dormers, chimneys, higher roof sections)
6. Estimate the percentage production loss from shading (0-50%)
7. Note if shading is primarily morning (east) or afternoon (west)

ROOF MATERIAL AND CONDITION:
8. Identify the roofing material (Colorbond steel, concrete tiles, terracotta tiles, slate, etc.)
9. Assess the roof condition — any visible damage, rust, broken tiles, sagging?
10. Note the roof colour (affects panel mounting bracket selection)

USABLE AREA:
11. Estimate the usable roof area in square metres (excluding setbacks, obstructions)
12. Estimate how many standard 400W panels (1.7m × 1.0m) could fit
13. List all obstructions (skylights, vents, antennas, air conditioning units, existing solar)

MOUNTING:
14. Recommend mounting type based on roof pitch and material
15. Note any special mounting considerations

SOLAR EFFICIENCY:
16. Calculate a solar efficiency multiplier (0.5-1.0) based on:
    - Orientation: North = 1.0, NE/NW = 0.95, E/W = 0.85, SE/SW = 0.80, S = 0.70
    - Tilt: Optimal (20-30° in most of AU) = 1.0, adjust ±2% per 5° deviation
    - Shading: Subtract the estimated shading loss percentage
17. Provide a brief statement about the annual production adjustment

Be precise with measurements and estimates. If you cannot determine something clearly from the photo, indicate it as null.
Provide warnings for any concerns that could affect installation or performance.`;

  const userPrompt = `Analyze this roof photo and extract all relevant details for solar PV system design and generation profile estimation.

Return your analysis as a JSON object:
{
  "primaryOrientation": <"north" | "north-east" | "north-west" | "east" | "west" | "south" | "south-east" | "south-west" | "flat" | "unknown">,
  "orientationConfidence": <"high" | "medium" | "low">,
  "orientationEvidence": <string or null>,
  "tiltAngleDegrees": <number or null>,
  "tiltCategory": <"flat" | "low_pitch" | "standard" | "steep" | "unknown">,
  "tiltEvidence": <string or null>,
  "shadingLevel": <"none" | "minimal" | "moderate" | "heavy" | "unknown">,
  "shadingSources": [<string>],
  "shadingImpactPercent": <number or null>,
  "morningShading": <boolean or null>,
  "afternoonShading": <boolean or null>,
  "roofMaterial": <"colorbond" | "tile_concrete" | "tile_terracotta" | "slate" | "flat_membrane" | "polycarbonate" | "unknown">,
  "roofCondition": <"excellent" | "good" | "fair" | "poor" | "unknown">,
  "roofColor": <string or null>,
  "usableAreaEstimateSqm": <number or null>,
  "panelCapacityEstimate": <number or null>,
  "obstructions": [<string>],
  "mountingType": <"flush" | "tilt_frame" | "ballast" | "unknown">,
  "mountingNotes": <string or null>,
  "solarEfficiencyMultiplier": <number 0.5-1.0>,
  "annualProductionAdjustment": <string or null>,
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
          name: "roof_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              primaryOrientation: { type: "string", enum: ["north", "north-east", "north-west", "east", "west", "south", "south-east", "south-west", "flat", "unknown"] },
              orientationConfidence: { type: "string", enum: ["high", "medium", "low"] },
              orientationEvidence: { type: ["string", "null"], description: "Evidence for orientation" },
              tiltAngleDegrees: { type: ["number", "null"], description: "Roof pitch in degrees" },
              tiltCategory: { type: "string", enum: ["flat", "low_pitch", "standard", "steep", "unknown"] },
              tiltEvidence: { type: ["string", "null"], description: "Evidence for tilt estimate" },
              shadingLevel: { type: "string", enum: ["none", "minimal", "moderate", "heavy", "unknown"] },
              shadingSources: { type: "array", items: { type: "string" } },
              shadingImpactPercent: { type: ["number", "null"], description: "Estimated % production loss" },
              morningShading: { type: ["boolean", "null"] },
              afternoonShading: { type: ["boolean", "null"] },
              roofMaterial: { type: "string", enum: ["colorbond", "tile_concrete", "tile_terracotta", "slate", "flat_membrane", "polycarbonate", "unknown"] },
              roofCondition: { type: "string", enum: ["excellent", "good", "fair", "poor", "unknown"] },
              roofColor: { type: ["string", "null"] },
              usableAreaEstimateSqm: { type: ["number", "null"] },
              panelCapacityEstimate: { type: ["number", "null"] },
              obstructions: { type: "array", items: { type: "string" } },
              mountingType: { type: "string", enum: ["flush", "tilt_frame", "ballast", "unknown"] },
              mountingNotes: { type: ["string", "null"] },
              solarEfficiencyMultiplier: { type: "number", description: "0.5-1.0 efficiency multiplier" },
              annualProductionAdjustment: { type: ["string", "null"] },
              notes: { type: "array", items: { type: "string" } },
              warnings: { type: "array", items: { type: "string" } },
              confidence: { type: "number", description: "Confidence score 0-100" }
            },
            required: [
              "primaryOrientation", "orientationConfidence", "orientationEvidence",
              "tiltAngleDegrees", "tiltCategory", "tiltEvidence",
              "shadingLevel", "shadingSources", "shadingImpactPercent",
              "morningShading", "afternoonShading",
              "roofMaterial", "roofCondition", "roofColor",
              "usableAreaEstimateSqm", "panelCapacityEstimate", "obstructions",
              "mountingType", "mountingNotes",
              "solarEfficiencyMultiplier", "annualProductionAdjustment",
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

    return JSON.parse(textContent) as RoofAnalysis;
  } catch (error) {
    console.error("Roof analysis error:", error);
    return {
      primaryOrientation: 'unknown',
      orientationConfidence: 'low',
      orientationEvidence: null,
      tiltAngleDegrees: null,
      tiltCategory: 'unknown',
      tiltEvidence: null,
      shadingLevel: 'unknown',
      shadingSources: [],
      shadingImpactPercent: null,
      morningShading: null,
      afternoonShading: null,
      roofMaterial: 'unknown',
      roofCondition: 'unknown',
      roofColor: null,
      usableAreaEstimateSqm: null,
      panelCapacityEstimate: null,
      obstructions: [],
      mountingType: 'unknown',
      mountingNotes: null,
      solarEfficiencyMultiplier: 0.85,
      annualProductionAdjustment: null,
      notes: [],
      warnings: ['Roof analysis failed — manual site inspection required'],
      confidence: 0
    };
  }
}

/**
 * Generate a summary report from roof analysis
 */
export function generateRoofReport(analysis: RoofAnalysis): string {
  const lines: string[] = [];

  lines.push("## Roof Analysis Report\n");

  // Orientation
  const orientationLabel = analysis.primaryOrientation.replace(/-/g, '-').replace(/^\w/, c => c.toUpperCase());
  lines.push(`**Primary Orientation:** ${orientationLabel} (${analysis.orientationConfidence} confidence)`);
  if (analysis.orientationEvidence) {
    lines.push(`  _Evidence: ${analysis.orientationEvidence}_`);
  }

  // Tilt
  if (analysis.tiltAngleDegrees !== null) {
    lines.push(`**Roof Pitch:** ${analysis.tiltAngleDegrees}° (${analysis.tiltCategory.replace(/_/g, ' ')})`);
  }

  // Shading
  lines.push(`\n### Shading Assessment\n`);
  lines.push(`- Level: ${analysis.shadingLevel.charAt(0).toUpperCase() + analysis.shadingLevel.slice(1)}`);
  if (analysis.shadingImpactPercent !== null) {
    lines.push(`- Estimated Production Loss: ${analysis.shadingImpactPercent}%`);
  }
  if (analysis.shadingSources.length > 0) {
    lines.push(`- Sources: ${analysis.shadingSources.join(', ')}`);
  }

  // Roof
  lines.push(`\n### Roof Details\n`);
  const materialLabel = analysis.roofMaterial.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
  lines.push(`- Material: ${materialLabel}`);
  lines.push(`- Condition: ${analysis.roofCondition.charAt(0).toUpperCase() + analysis.roofCondition.slice(1)}`);
  if (analysis.roofColor) lines.push(`- Colour: ${analysis.roofColor}`);

  // Area
  if (analysis.usableAreaEstimateSqm) {
    lines.push(`\n**Usable Area:** ~${analysis.usableAreaEstimateSqm}m² (est. ${analysis.panelCapacityEstimate || '?'} panels)`);
  }

  // Efficiency
  lines.push(`\n**Solar Efficiency Multiplier:** ${(analysis.solarEfficiencyMultiplier * 100).toFixed(0)}%`);
  if (analysis.annualProductionAdjustment) {
    lines.push(`_${analysis.annualProductionAdjustment}_`);
  }

  lines.push(`\n*Analysis confidence: ${analysis.confidence}%*`);

  return lines.join('\n');
}
