import { invokeLLM } from "./_core/llm";

// ============================================================
// Cable Run Analysis — LLM Vision Extraction + AS/NZS 3008 Sizing
// ============================================================

export interface CableRunAnalysis {
  // Extracted from annotated photo
  cableRunDistanceMetres: number | null;
  cableRoutePath: string | null;        // e.g., "Roof ridge to switchboard via external wall"
  installationMethod: string | null;     // e.g., "Clipped direct", "In conduit", "Underground"
  obstructions: string[];                // e.g., ["Gutter crossing", "Wall penetration required"]
  notes: string[];
  confidence: number;                    // 0-100
}

export interface CableSizingResult {
  // System context
  inverterSizeKw: number;
  phaseConfig: 'single' | 'three' | 'unknown';
  runDistanceMetres: number;

  // AC cable sizing (inverter to switchboard)
  acCableSize: string;                   // e.g., "10mm² TPS"
  acCableType: string;                   // e.g., "2C+E TPS (V90)"
  acVoltageDrop: number;                 // percentage
  acVoltageDropCompliant: boolean;       // true if <= 5% per AS/NZS 3008
  acCurrentRating: number;              // Amps — max continuous current of the cable

  // DC cable sizing (panels to inverter) — reference only
  dcCableSize: string;                   // e.g., "6mm² DC Solar"
  dcCableType: string;                   // e.g., "2-core DC Solar (UV rated)"

  // Earth cable
  earthCableSize: string;                // e.g., "6mm² Green/Yellow"

  // Battery cable (if applicable)
  batteryCableSize: string | null;
  batteryCableType: string | null;

  // Reference table — multiple distances
  referenceTable: CableSizingRow[];

  // Compliance
  standard: string;                      // "AS/NZS 3008.1.1:2017"
  disclaimer: string;
}

export interface CableSizingRow {
  distanceRange: string;                 // e.g., "0–15m"
  recommendedCable: string;              // e.g., "6mm² TPS"
  voltageDropPercent: number;            // at max distance in range
  compliant: boolean;
  note: string;                          // e.g., "Standard residential"
}

// ============================================================
// LLM Vision — Extract cable run distance from annotated photo
// ============================================================

export async function analyzeCableRunPhoto(imageUrl: string): Promise<CableRunAnalysis> {
  const systemPrompt = `You are a licensed Australian electrician assessing a cable run from an annotated aerial/site photo for a solar PV and battery storage installation.

The photo has been annotated by the installer with:
- A PINK/RED LINE showing the proposed cable route
- A BLUE LINE showing the measured distance
- A DISTANCE MEASUREMENT in metres (e.g., "21.3472m")

Your task is to extract:
1. The cable run distance in metres (read the measurement annotation carefully)
2. The cable route path description (e.g., "From roof-mounted panels down external wall to switchboard at rear of property")
3. The likely installation method based on the route (clipped direct on wall, in conduit, through roof space, underground)
4. Any obstructions or challenges visible along the route (gutter crossings, wall penetrations, etc.)

Be precise with the distance measurement — read the exact number from the annotation.
If you cannot clearly read the measurement, estimate from the scale of the building.`;

  const userPrompt = `Analyze this annotated cable run photo and extract the cable route details.

Return your analysis as a JSON object:
{
  "cableRunDistanceMetres": <number — the exact distance in metres from the annotation>,
  "cableRoutePath": <string — description of the cable route>,
  "installationMethod": <string — likely installation method>,
  "obstructions": [<string — any obstructions or challenges>],
  "notes": [<string — any additional observations>],
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
          name: "cable_run_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              cableRunDistanceMetres: { type: ["number", "null"], description: "Cable run distance in metres" },
              cableRoutePath: { type: ["string", "null"], description: "Description of the cable route" },
              installationMethod: { type: ["string", "null"], description: "Likely installation method" },
              obstructions: { type: "array", items: { type: "string" } },
              notes: { type: "array", items: { type: "string" } },
              confidence: { type: "number" }
            },
            required: ["cableRunDistanceMetres", "cableRoutePath", "installationMethod", "obstructions", "notes", "confidence"],
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

    return JSON.parse(textContent) as CableRunAnalysis;
  } catch (error) {
    console.error("Cable run analysis error:", error);
    return {
      cableRunDistanceMetres: null,
      cableRoutePath: null,
      installationMethod: null,
      obstructions: [],
      notes: ['Analysis failed — manual measurement required'],
      confidence: 0
    };
  }
}


// ============================================================
// AS/NZS 3008.1.1 Cable Sizing Calculator
// ============================================================

/**
 * Standard cable current ratings for copper conductors
 * Installation method: Clipped direct (Column 4, Table 3 of AS/NZS 3008)
 * Insulation: V90 PVC (TPS)
 * Ambient temperature: 40°C (Australian standard)
 * Single circuit (no grouping derating)
 */
const CABLE_RATINGS_SINGLE_PHASE: Record<string, { currentRating: number; resistance: number; reactance: number }> = {
  // size: { currentRating (A at 40°C), resistance (Ω/km at 75°C), reactance (Ω/km) }
  '2.5mm²': { currentRating: 23, resistance: 9.01, reactance: 0.0967 },
  '4mm²':   { currentRating: 30, resistance: 5.61, reactance: 0.0934 },
  '6mm²':   { currentRating: 38, resistance: 3.71, reactance: 0.0902 },
  '10mm²':  { currentRating: 52, resistance: 2.24, reactance: 0.0854 },
  '16mm²':  { currentRating: 67, resistance: 1.41, reactance: 0.0822 },
  '25mm²':  { currentRating: 89, resistance: 0.889, reactance: 0.0790 },
  '35mm²':  { currentRating: 110, resistance: 0.641, reactance: 0.0762 },
};

const CABLE_RATINGS_THREE_PHASE: Record<string, { currentRating: number; resistance: number; reactance: number }> = {
  '2.5mm²': { currentRating: 20, resistance: 9.01, reactance: 0.0967 },
  '4mm²':   { currentRating: 27, resistance: 5.61, reactance: 0.0934 },
  '6mm²':   { currentRating: 34, resistance: 3.71, reactance: 0.0902 },
  '10mm²':  { currentRating: 46, resistance: 2.24, reactance: 0.0854 },
  '16mm²':  { currentRating: 60, resistance: 1.41, reactance: 0.0822 },
  '25mm²':  { currentRating: 80, resistance: 0.889, reactance: 0.0790 },
  '35mm²':  { currentRating: 98, resistance: 0.641, reactance: 0.0762 },
};

/**
 * Earth cable sizing per AS/NZS 3000 Table 5.1
 */
const EARTH_CABLE_SIZES: Record<string, string> = {
  '2.5mm²': '2.5mm²',
  '4mm²':   '2.5mm²',
  '6mm²':   '4mm²',
  '10mm²':  '6mm²',
  '16mm²':  '6mm²',
  '25mm²':  '6mm²',
  '35mm²':  '10mm²',
};

/**
 * Calculate voltage drop percentage for a given cable
 * Formula: Vd = (I × L × Zc) / (1000 × V) × 100
 * Where:
 *   I = current (A)
 *   L = one-way length (m) × 2 for single-phase (go + return)
 *   Zc = impedance per km (R×cosφ + X×sinφ), simplified to R for PF≈1
 *   V = nominal voltage (230V single, 400V three)
 */
function calculateVoltageDrop(
  currentAmps: number,
  distanceMetres: number,
  resistancePerKm: number,
  reactancePerKm: number,
  phase: 'single' | 'three'
): number {
  const voltage = phase === 'single' ? 230 : 400;
  // Power factor ~0.95 for inverters
  const cosPhiVal = 0.95;
  const sinPhiVal = Math.sqrt(1 - cosPhiVal * cosPhiVal);
  const impedancePerKm = resistancePerKm * cosPhiVal + reactancePerKm * sinPhiVal;

  // For single-phase: multiply by 2 (go + return)
  // For three-phase: multiply by √3 (already factored into 400V)
  const multiplier = phase === 'single' ? 2 : 1.732;

  const vdVolts = (currentAmps * distanceMetres * impedancePerKm * multiplier) / 1000;
  return (vdVolts / voltage) * 100;
}

/**
 * Get the maximum continuous AC current for an inverter
 * Single-phase: P / V / PF = kW × 1000 / 230 / 0.95
 * Three-phase: P / (√3 × V × PF) = kW × 1000 / (1.732 × 400 × 0.95)
 */
function getInverterMaxCurrent(inverterSizeKw: number, phase: 'single' | 'three'): number {
  if (phase === 'single') {
    return (inverterSizeKw * 1000) / (230 * 0.95);
  }
  return (inverterSizeKw * 1000) / (1.732 * 400 * 0.95);
}

/**
 * Select the minimum cable size that satisfies both current rating and voltage drop
 */
function selectCableSize(
  inverterSizeKw: number,
  distanceMetres: number,
  phase: 'single' | 'three'
): { size: string; voltageDrop: number; currentRating: number; compliant: boolean } {
  const maxCurrent = getInverterMaxCurrent(inverterSizeKw, phase);
  const ratings = phase === 'single' ? CABLE_RATINGS_SINGLE_PHASE : CABLE_RATINGS_THREE_PHASE;
  const sizes = Object.keys(ratings);

  for (const size of sizes) {
    const cable = ratings[size];
    // Check current rating first
    if (cable.currentRating < maxCurrent) continue;

    // Check voltage drop
    const vd = calculateVoltageDrop(maxCurrent, distanceMetres, cable.resistance, cable.reactance, phase);
    if (vd <= 5.0) {
      return {
        size,
        voltageDrop: Math.round(vd * 100) / 100,
        currentRating: cable.currentRating,
        compliant: true
      };
    }
  }

  // If no cable satisfies, return the largest with a warning
  const largestSize = sizes[sizes.length - 1];
  const largest = ratings[largestSize];
  const vd = calculateVoltageDrop(maxCurrent, distanceMetres, largest.resistance, largest.reactance, phase);
  return {
    size: largestSize,
    voltageDrop: Math.round(vd * 100) / 100,
    currentRating: largest.currentRating,
    compliant: vd <= 5.0
  };
}

/**
 * Generate the full cable sizing result for a proposal
 */
export function calculateCableSizing(
  inverterSizeKw: number,
  phaseConfig: 'single' | 'three' | 'unknown',
  runDistanceMetres: number,
  batterySizeKwh?: number
): CableSizingResult {
  const phase = phaseConfig === 'unknown' ? 'single' : phaseConfig;

  // Calculate AC cable for the actual run distance
  const acResult = selectCableSize(inverterSizeKw, runDistanceMetres, phase);

  // DC cable — standard 6mm² for residential up to 15kW
  const dcSize = inverterSizeKw <= 10 ? '6mm²' : '10mm²';

  // Earth cable based on AC cable size
  const earthSize = EARTH_CABLE_SIZES[acResult.size] || '6mm²';

  // Battery cable — typically same as AC cable or one size down
  let batteryCableSize: string | null = null;
  let batteryCableType: string | null = null;
  if (batterySizeKwh && batterySizeKwh > 0) {
    // Battery inverter typically 5kW for residential
    const batteryInverterKw = batterySizeKwh <= 10 ? 5 : 8;
    const battResult = selectCableSize(batteryInverterKw, Math.min(runDistanceMetres, 10), phase);
    batteryCableSize = battResult.size;
    batteryCableType = phase === 'single' ? `2C+E TPS (V90) ${battResult.size}` : `4C+E TPS (V90) ${battResult.size}`;
  }

  // Generate reference table for common distances
  const distances = [
    { min: 0, max: 10, label: '0–10m' },
    { min: 10, max: 15, label: '10–15m' },
    { min: 15, max: 20, label: '15–20m' },
    { min: 20, max: 25, label: '20–25m' },
    { min: 25, max: 30, label: '25–30m' },
    { min: 30, max: 40, label: '30–40m' },
    { min: 40, max: 50, label: '40–50m' },
  ];

  const referenceTable: CableSizingRow[] = distances.map(d => {
    const result = selectCableSize(inverterSizeKw, d.max, phase);
    let note = '';
    if (d.max <= 15) note = 'Standard residential';
    else if (d.max <= 25) note = 'Extended run';
    else if (d.max <= 40) note = 'Long run — verify on site';
    else note = 'Requires site-specific assessment';

    return {
      distanceRange: d.label,
      recommendedCable: result.size,
      voltageDropPercent: result.voltageDrop,
      compliant: result.compliant,
      note
    };
  });

  return {
    inverterSizeKw,
    phaseConfig,
    runDistanceMetres,
    acCableSize: acResult.size,
    acCableType: phase === 'single'
      ? `2C+E TPS (V90) ${acResult.size}`
      : `4C+E TPS (V90) ${acResult.size}`,
    acVoltageDrop: acResult.voltageDrop,
    acVoltageDropCompliant: acResult.compliant,
    acCurrentRating: acResult.currentRating,
    dcCableSize: dcSize,
    dcCableType: `2-core DC Solar Cable (UV rated) ${dcSize}`,
    earthCableSize: earthSize,
    batteryCableSize,
    batteryCableType,
    referenceTable,
    standard: 'AS/NZS 3008.1.1:2017',
    disclaimer: 'Reference only — final cable sizing must be verified by the licensed installer per AS/NZS 3008.1.1 based on actual installation conditions, ambient temperature, grouping factors, and installation method.'
  };
}
