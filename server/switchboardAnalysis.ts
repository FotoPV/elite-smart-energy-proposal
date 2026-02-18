import { invokeLLM } from "./_core/llm";

export interface SwitchboardAnalysis {
  // Main switch details
  mainSwitchRating: number | null;  // Amps
  mainSwitchType: string | null;    // e.g., "Single pole", "Double pole"
  
  // Circuit information
  totalCircuits: number | null;
  usedCircuits: number | null;
  availableCircuits: number | null;
  
  // Circuit breaker details
  circuitBreakers: CircuitBreaker[];
  
  // RCD/Safety switch information
  hasRcd: boolean;
  rcdCount: number | null;
  
  // Meter details (if visible)
  meterType: string | null;
  meterNumber: string | null;
  
  // Board condition
  boardCondition: 'good' | 'fair' | 'poor' | 'unknown';
  boardAge: string | null;  // Estimated age range
  
  // Space assessment
  hasSpaceForSolar: boolean;
  hasSpaceForBattery: boolean;
  upgradeRequired: boolean;
  upgradeReason: string | null;
  
  // Additional notes
  notes: string[];
  warnings: string[];
  
  // Confidence score
  confidence: number;  // 0-100

  // === ENHANCED INSTALLER-LEVEL FIELDS ===

  // Phase configuration
  phaseConfiguration: 'single' | 'three' | 'unknown';
  phaseConfirmationSource: string | null; // e.g., "Main switch is 2-pole (single-phase)", "3-pole main switch observed"

  // Metering assessment
  meterIsBidirectional: boolean | null;  // null = cannot determine
  meterSwapRequired: boolean;
  meterNotes: string | null;  // e.g., "Analog meter — requires digital bi-directional upgrade"

  // Specific upgrade scope items
  upgradeScope: UpgradeScopeItem[];

  // Proposed new breaker positions for solar + battery
  proposedSolarBreakerPosition: number | null;
  proposedSolarBreakerRating: string | null;  // e.g., "32A MCB"
  proposedBatteryBreakerPosition: number | null;
  proposedBatteryBreakerRating: string | null;  // e.g., "32A MCB"
  proposedDcIsolatorLocation: string | null;  // e.g., "Adjacent to inverter on external wall"
  proposedAcIsolatorLocation: string | null;  // e.g., "Next to main switch inside board"

  // Cable run assessment
  cableAssessment: string | null;  // General notes on cable sizing and runs
  existingCableSizeAdequate: boolean | null;  // null = cannot determine from photo
}

export interface CircuitBreaker {
  position: number;
  rating: number;  // Amps
  type: string;    // e.g., "MCB", "RCBO"
  label: string | null;
  isUsed: boolean;
}

export interface UpgradeScopeItem {
  item: string;        // e.g., "Replace main switch"
  detail: string;      // e.g., "Upgrade from 63A to 80A to accommodate solar + battery load"
  priority: 'required' | 'recommended' | 'optional';
  estimatedCost: string | null;  // e.g., "$200-$400"
}

/**
 * Analyze a switchboard photo using LLM vision to extract circuit details
 * Enhanced with installer-level assessment for solar/battery installations
 */
export async function analyzeSwitchboardPhoto(imageUrl: string): Promise<SwitchboardAnalysis> {
  const systemPrompt = `You are a licensed Australian electrician and CEC-accredited solar installer conducting a pre-installation switchboard assessment for a solar PV and battery storage system.

Your task is to perform a thorough electrical inspection from the switchboard photo, extracting data that an installer needs to plan and quote the electrical works.

Analyze the following aspects with installer-level precision:

BOARD ASSESSMENT:
1. Main switch rating (Amps) and type (MCB, MCCB, 2-pole, 4-pole)
2. Total circuit positions and how many are used vs available
3. Individual circuit breaker details — rating, type (MCB/RCBO/RCD), labels where visible
4. RCD/Safety switch presence, count, and whether they cover all circuits per AS/NZS 3000
5. Overall board condition (good/fair/poor) and estimated age
6. Meter type if visible (analog, digital, smart meter)

PHASE CONFIGURATION:
7. Determine if the property is single-phase or three-phase from the main switch (2-pole = single, 4-pole = three) and any other visible indicators
8. Note the evidence for your phase determination

METERING ASSESSMENT:
9. Is the meter bi-directional / solar-ready? (digital/smart meters usually are, analog meters are not)
10. Will a meter swap be required for solar export?

INSTALLATION READINESS:
11. Space availability for solar inverter AC isolator and dedicated MCB
12. Space availability for battery AC connection and dedicated MCB
13. Identify the best available circuit positions for the new solar and battery breakers
14. Assess if a DC isolator can be mounted adjacent to the board or needs external mounting

UPGRADE SCOPE:
15. List every specific upgrade item needed, with detail. Examples:
    - "Replace 63A main switch with 80A MCB" if load will exceed current rating
    - "Add dedicated 32A MCB at position X for solar inverter"
    - "Add dedicated 32A MCB at position Y for battery system"
    - "Install additional RCD to cover solar/battery circuits"
    - "Replace board — insufficient space and poor condition"
    - "Add AC isolator adjacent to main switch for inverter"

COST ESTIMATION:
16. For each upgrade scope item, provide an estimated cost range in AUD based on standard Australian electrical contractor rates:
    - Main switch upgrade (e.g., 63A to 80A): $250-$450
    - Additional MCB installation: $80-$150 per breaker
    - RCD/RCBO installation: $150-$300 per device
    - Full RCD compliance upgrade (multiple circuits): $400-$800
    - AC isolator supply + install: $120-$200
    - DC isolator supply + install: $150-$250
    - Switchboard upgrade/replacement: $1,500-$3,500
    - Meter upgrade (DNSP application + install): $0 (DNSP responsibility) or $200-$500 if private
    - Cable upgrade per metre: $15-$40/m depending on size
    Use these as guidelines — adjust based on the specific scope observed.

CABLE ASSESSMENT:
17. Note any visible cable sizing concerns (e.g., undersized mains, aging wiring)
18. Comment on whether existing cable sizes appear adequate for the additional solar/battery load

Be precise with numbers and ratings. If you cannot determine something clearly, indicate it as null.
Provide warnings for any safety concerns or AS/NZS 3000 compliance issues you observe.`;

  const userPrompt = `Analyze this switchboard photo and extract all relevant electrical details for a solar PV + battery storage installation assessment.

Return your analysis as a JSON object with the following structure:
{
  "mainSwitchRating": <number or null>,
  "mainSwitchType": <string or null>,
  "totalCircuits": <number or null>,
  "usedCircuits": <number or null>,
  "availableCircuits": <number or null>,
  "circuitBreakers": [
    {
      "position": <number>,
      "rating": <number>,
      "type": <string>,
      "label": <string or null>,
      "isUsed": <boolean>
    }
  ],
  "hasRcd": <boolean>,
  "rcdCount": <number or null>,
  "meterType": <string or null>,
  "meterNumber": <string or null>,
  "boardCondition": <"good" | "fair" | "poor" | "unknown">,
  "boardAge": <string or null>,
  "hasSpaceForSolar": <boolean>,
  "hasSpaceForBattery": <boolean>,
  "upgradeRequired": <boolean>,
  "upgradeReason": <string or null>,
  "notes": [<string>],
  "warnings": [<string>],
  "confidence": <number 0-100>,
  "phaseConfiguration": <"single" | "three" | "unknown">,
  "phaseConfirmationSource": <string or null>,
  "meterIsBidirectional": <boolean or null>,
  "meterSwapRequired": <boolean>,
  "meterNotes": <string or null>,
  "upgradeScope": [
    {
      "item": <string - specific upgrade action>,
      "detail": <string - detailed description of what needs to happen>,
      "priority": <"required" | "recommended" | "optional">,
      "estimatedCost": <string - MUST provide AUD cost range e.g. "$250-$450" based on standard Australian electrical rates>
    }
  ],
  "proposedSolarBreakerPosition": <number or null>,
  "proposedSolarBreakerRating": <string or null>,
  "proposedBatteryBreakerPosition": <number or null>,
  "proposedBatteryBreakerRating": <string or null>,
  "proposedDcIsolatorLocation": <string or null>,
  "proposedAcIsolatorLocation": <string or null>,
  "cableAssessment": <string or null>,
  "existingCableSizeAdequate": <boolean or null>
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
          name: "switchboard_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              mainSwitchRating: { type: ["number", "null"], description: "Main switch rating in Amps" },
              mainSwitchType: { type: ["string", "null"], description: "Type of main switch" },
              totalCircuits: { type: ["number", "null"], description: "Total circuit positions" },
              usedCircuits: { type: ["number", "null"], description: "Number of used circuits" },
              availableCircuits: { type: ["number", "null"], description: "Number of available circuits" },
              circuitBreakers: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    position: { type: "number" },
                    rating: { type: "number" },
                    type: { type: "string" },
                    label: { type: ["string", "null"] },
                    isUsed: { type: "boolean" }
                  },
                  required: ["position", "rating", "type", "isUsed"],
                  additionalProperties: false
                }
              },
              hasRcd: { type: "boolean" },
              rcdCount: { type: ["number", "null"] },
              meterType: { type: ["string", "null"] },
              meterNumber: { type: ["string", "null"] },
              boardCondition: { type: "string", enum: ["good", "fair", "poor", "unknown"] },
              boardAge: { type: ["string", "null"] },
              hasSpaceForSolar: { type: "boolean" },
              hasSpaceForBattery: { type: "boolean" },
              upgradeRequired: { type: "boolean" },
              upgradeReason: { type: ["string", "null"] },
              notes: { type: "array", items: { type: "string" } },
              warnings: { type: "array", items: { type: "string" } },
              confidence: { type: "number" },
              // Enhanced installer-level fields
              phaseConfiguration: { type: "string", enum: ["single", "three", "unknown"] },
              phaseConfirmationSource: { type: ["string", "null"] },
              meterIsBidirectional: { type: ["boolean", "null"] },
              meterSwapRequired: { type: "boolean" },
              meterNotes: { type: ["string", "null"] },
              upgradeScope: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    item: { type: "string" },
                    detail: { type: "string" },
                    priority: { type: "string", enum: ["required", "recommended", "optional"] },
                    estimatedCost: { type: ["string", "null"] }
                  },
                  required: ["item", "detail", "priority", "estimatedCost"],
                  additionalProperties: false
                }
              },
              proposedSolarBreakerPosition: { type: ["number", "null"] },
              proposedSolarBreakerRating: { type: ["string", "null"] },
              proposedBatteryBreakerPosition: { type: ["number", "null"] },
              proposedBatteryBreakerRating: { type: ["string", "null"] },
              proposedDcIsolatorLocation: { type: ["string", "null"] },
              proposedAcIsolatorLocation: { type: ["string", "null"] },
              cableAssessment: { type: ["string", "null"] },
              existingCableSizeAdequate: { type: ["boolean", "null"] }
            },
            required: [
              "mainSwitchRating", "mainSwitchType", "totalCircuits", "usedCircuits", 
              "availableCircuits", "circuitBreakers", "hasRcd", "rcdCount",
              "meterType", "meterNumber", "boardCondition", "boardAge",
              "hasSpaceForSolar", "hasSpaceForBattery", "upgradeRequired", "upgradeReason",
              "notes", "warnings", "confidence",
              "phaseConfiguration", "phaseConfirmationSource",
              "meterIsBidirectional", "meterSwapRequired", "meterNotes",
              "upgradeScope",
              "proposedSolarBreakerPosition", "proposedSolarBreakerRating",
              "proposedBatteryBreakerPosition", "proposedBatteryBreakerRating",
              "proposedDcIsolatorLocation", "proposedAcIsolatorLocation",
              "cableAssessment", "existingCableSizeAdequate"
            ],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from LLM");
    }

    // Handle content which could be string or array
    const textContent = typeof content === 'string' ? content : 
      Array.isArray(content) ? (content.find((c: any) => c.type === 'text') as any)?.text || '' : '';
    
    if (!textContent) {
      throw new Error("No text content in response");
    }

    const analysis = JSON.parse(textContent) as SwitchboardAnalysis;
    return analysis;
  } catch (error) {
    console.error("Switchboard analysis error:", error);
    // Return a default analysis with unknown values
    return {
      mainSwitchRating: null,
      mainSwitchType: null,
      totalCircuits: null,
      usedCircuits: null,
      availableCircuits: null,
      circuitBreakers: [],
      hasRcd: false,
      rcdCount: null,
      meterType: null,
      meterNumber: null,
      boardCondition: 'unknown',
      boardAge: null,
      hasSpaceForSolar: false,
      hasSpaceForBattery: false,
      upgradeRequired: true,
      upgradeReason: 'Unable to analyze switchboard photo',
      notes: [],
      warnings: ['Analysis failed - manual inspection required'],
      confidence: 0,
      // Enhanced defaults
      phaseConfiguration: 'unknown',
      phaseConfirmationSource: null,
      meterIsBidirectional: null,
      meterSwapRequired: true,
      meterNotes: 'Unable to determine — manual inspection required',
      upgradeScope: [{ item: 'Manual inspection required', detail: 'Photo analysis failed — full site inspection needed before installation', priority: 'required', estimatedCost: null }],
      proposedSolarBreakerPosition: null,
      proposedSolarBreakerRating: null,
      proposedBatteryBreakerPosition: null,
      proposedBatteryBreakerRating: null,
      proposedDcIsolatorLocation: null,
      proposedAcIsolatorLocation: null,
      cableAssessment: null,
      existingCableSizeAdequate: null
    };
  }
}

/**
 * Cable run pricing per metre (16mm cable including installation).
 * Single-phase: $33/m — gateway both ways after 10m free run.
 * Three-phase: $55/m — gateway both ways after 5m free run.
 */
const CABLE_RUN_RATES = {
  singlePhase: { ratePerMetre: 33, freeMetres: 10, cableSpec: '16mm single phase' },
  threePhase:  { ratePerMetre: 55, freeMetres: 5,  cableSpec: '16mm 3 phase' },
} as const;

/**
 * Calculate a cable run cost scope item based on measured distance and phase configuration.
 * Returns null if no cable run data is available.
 */
export function calculateCableRunCostItem(
  distanceMetres: number,
  phaseConfig: 'single' | 'three' | string
): UpgradeScopeItem | null {
  if (!distanceMetres || distanceMetres <= 0) return null;

  const isThreePhase = phaseConfig === 'three' || phaseConfig === '3-phase' || phaseConfig === 'three-phase';
  const rate = isThreePhase ? CABLE_RUN_RATES.threePhase : CABLE_RUN_RATES.singlePhase;

  const chargeableMetres = Math.max(0, distanceMetres - rate.freeMetres);
  const totalCost = Math.round(chargeableMetres * rate.ratePerMetre);

  // If within free run, no cost
  if (chargeableMetres <= 0) {
    return {
      item: `Battery Cable Run (${rate.cableSpec})`,
      detail: `${distanceMetres.toFixed(1)}m measured — within ${rate.freeMetres}m included allowance (gateway both ways). No additional cable cost.`,
      priority: 'required',
      estimatedCost: '$0',
    };
  }

  return {
    item: `Battery Cable Run (${rate.cableSpec})`,
    detail: `${distanceMetres.toFixed(1)}m measured — ${rate.freeMetres}m included, ${chargeableMetres.toFixed(1)}m chargeable at $${rate.ratePerMetre}/m (gateway both ways).`,
    priority: 'required',
    estimatedCost: `$${totalCost.toLocaleString('en-AU')}`,
  };
}

/**
 * Standard Australian electrical contractor rates for common solar/battery installation works.
 * Used as fallback when LLM doesn't provide cost estimates.
 */
const STANDARD_COST_RATES: Record<string, string> = {
  'main switch': '$250-$450',
  'main switch upgrade': '$250-$450',
  'replace main switch': '$250-$450',
  'upgrade main switch': '$250-$450',
  'mcb': '$80-$150',
  'dedicated mcb': '$80-$150',
  'add dedicated': '$80-$150',
  'circuit breaker': '$80-$150',
  'rcd': '$150-$300',
  'rcbo': '$150-$300',
  'safety switch': '$150-$300',
  'rcd compliance': '$400-$800',
  'rcd protected': '$400-$800',
  'full rcd': '$400-$800',
  'ac isolator': '$120-$200',
  'dc isolator': '$150-$250',
  'switchboard upgrade': '$1,500-$3,500',
  'switchboard replacement': '$1,500-$3,500',
  'switchboard expansion': '$1,500-$3,500',
  'board expansion': '$1,500-$3,500',
  'replace board': '$1,500-$3,500',
  'new switchboard': '$1,500-$3,500',
  'new board': '$1,500-$3,500',
  'meter upgrade': '$0 (DNSP)',
  'meter swap': '$0 (DNSP)',
  'meter replacement': '$0 (DNSP)',
  'cable upgrade': '$300-$800',
  'rewire': '$500-$1,200',
  'earthing': '$200-$400',
  'earth stake': '$150-$300',
  'inspection': '$150-$250',
  'manual inspection': '$150-$250',
  'site inspection': '$150-$250',
};

/**
 * Fill in missing cost estimates on upgrade scope items using standard rates.
 * Matches item text against known cost patterns.
 */
export function applyFallbackCostEstimates(items: UpgradeScopeItem[]): UpgradeScopeItem[] {
  return items.map(item => {
    if (item.estimatedCost) return item; // Already has a cost
    
    const searchText = (item.item + ' ' + item.detail).toLowerCase();
    let matchedCost: string | null = null;
    let bestMatchLength = 0;
    
    for (const [keyword, cost] of Object.entries(STANDARD_COST_RATES)) {
      if (searchText.includes(keyword) && keyword.length > bestMatchLength) {
        matchedCost = cost;
        bestMatchLength = keyword.length;
      }
    }
    
    return { ...item, estimatedCost: matchedCost || '$TBC' };
  });
}

/**
 * Calculate the total estimated cost range from upgrade scope items.
 * Returns a formatted string like "$1,050-$2,100" or null if no costs available.
 */
export function calculateTotalCostRange(items: UpgradeScopeItem[]): { min: number; max: number; formatted: string } | null {
  let totalMin = 0;
  let totalMax = 0;
  let hasAnyCost = false;
  
  for (const item of items) {
    if (!item.estimatedCost || item.estimatedCost === '$TBC') continue;
    
    // Parse cost range like "$250-$450" or "$0 (DNSP)"
    const matches = item.estimatedCost.match(/\$([\d,]+)/g);
    if (matches && matches.length >= 1) {
      hasAnyCost = true;
      const values = matches.map(m => parseInt(m.replace(/[$,]/g, ''), 10)).filter(v => !isNaN(v));
      if (values.length >= 2) {
        totalMin += Math.min(...values);
        totalMax += Math.max(...values);
      } else if (values.length === 1) {
        totalMin += values[0];
        totalMax += values[0];
      }
    }
  }
  
  if (!hasAnyCost) return null;
  
  const fmt = (n: number) => '$' + n.toLocaleString('en-AU');
  return {
    min: totalMin,
    max: totalMax,
    formatted: totalMin === totalMax ? fmt(totalMin) : `${fmt(totalMin)}-${fmt(totalMax)}`
  };
}

/**
 * Generate a summary report from switchboard analysis
 */
export function generateSwitchboardReport(analysis: SwitchboardAnalysis): string {
  const lines: string[] = [];
  
  lines.push("## Switchboard Analysis Report\n");
  
  // Main switch
  if (analysis.mainSwitchRating) {
    lines.push(`**Main Switch:** ${analysis.mainSwitchRating}A ${analysis.mainSwitchType || ''}`);
  }
  
  // Phase configuration
  lines.push(`**Phase Configuration:** ${analysis.phaseConfiguration === 'single' ? 'Single Phase' : analysis.phaseConfiguration === 'three' ? 'Three Phase' : 'Unknown'}`);
  if (analysis.phaseConfirmationSource) {
    lines.push(`  _Source: ${analysis.phaseConfirmationSource}_`);
  }
  
  // Circuit summary
  if (analysis.totalCircuits) {
    lines.push(`**Circuits:** ${analysis.usedCircuits || 0} used / ${analysis.totalCircuits} total (${analysis.availableCircuits || 0} available)`);
  }
  
  // RCD status
  lines.push(`**RCD/Safety Switch:** ${analysis.hasRcd ? `Yes (${analysis.rcdCount || 1})` : 'No'}`);
  
  // Condition
  lines.push(`**Board Condition:** ${analysis.boardCondition.charAt(0).toUpperCase() + analysis.boardCondition.slice(1)}`);
  if (analysis.boardAge) {
    lines.push(`**Estimated Age:** ${analysis.boardAge}`);
  }
  
  // Metering
  lines.push("\n### Metering Assessment\n");
  lines.push(`- Meter Type: ${analysis.meterType || 'Unknown'}`);
  lines.push(`- Bi-directional: ${analysis.meterIsBidirectional === true ? '✓ Yes' : analysis.meterIsBidirectional === false ? '✗ No' : '? Unknown'}`);
  lines.push(`- Meter Swap Required: ${analysis.meterSwapRequired ? '⚠️ Yes' : '✓ No'}`);
  if (analysis.meterNotes) {
    lines.push(`- Notes: ${analysis.meterNotes}`);
  }
  
  // Solar/Battery readiness
  lines.push("\n### Installation Readiness\n");
  lines.push(`- Space for Solar: ${analysis.hasSpaceForSolar ? '✓ Yes' : '✗ No'}`);
  lines.push(`- Space for Battery: ${analysis.hasSpaceForBattery ? '✓ Yes' : '✗ No'}`);
  lines.push(`- Cable Sizing Adequate: ${analysis.existingCableSizeAdequate === true ? '✓ Yes' : analysis.existingCableSizeAdequate === false ? '✗ No' : '? Unknown'}`);
  
  if (analysis.cableAssessment) {
    lines.push(`- Cable Notes: ${analysis.cableAssessment}`);
  }
  
  // Upgrade scope
  if (analysis.upgradeScope.length > 0) {
    lines.push("\n### Scope of Electrical Works\n");
    analysis.upgradeScope.forEach(item => {
      const priorityIcon = item.priority === 'required' ? '🔴' : item.priority === 'recommended' ? '🟡' : '🟢';
      lines.push(`${priorityIcon} **${item.item}**: ${item.detail}${item.estimatedCost ? ` (Est. ${item.estimatedCost})` : ''}`);
    });
  }
  
  if (analysis.upgradeRequired) {
    lines.push(`\n**⚠️ Upgrade Required:** ${analysis.upgradeReason || 'See scope items'}`);
  }
  
  // Warnings
  if (analysis.warnings.length > 0) {
    lines.push("\n### Warnings\n");
    analysis.warnings.forEach(w => lines.push(`- ⚠️ ${w}`));
  }
  
  // Notes
  if (analysis.notes.length > 0) {
    lines.push("\n### Notes\n");
    analysis.notes.forEach(n => lines.push(`- ${n}`));
  }
  
  lines.push(`\n*Analysis confidence: ${analysis.confidence}%*`);
  
  return lines.join('\n');
}
