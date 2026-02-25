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
}

export interface CircuitBreaker {
  position: number;
  rating: number;  // Amps
  type: string;    // e.g., "MCB", "RCBO"
  label: string | null;
  isUsed: boolean;
}

/**
 * Analyze a switchboard photo using LLM vision to extract circuit details
 */
export async function analyzeSwitchboardPhoto(imageUrl: string): Promise<SwitchboardAnalysis> {
  const systemPrompt = `You are an expert electrical inspector analyzing switchboard photos for solar and battery installation assessments. 
Your task is to extract detailed information about the switchboard from the image.

Analyze the following aspects:
1. Main switch rating and type
2. Total number of circuit positions
3. Number of used vs available circuits
4. Individual circuit breaker details (rating, type, labels)
5. RCD/Safety switch presence and count
6. Meter type if visible
7. Overall board condition
8. Space availability for solar inverter and battery connections
9. Any upgrade requirements

Be precise with numbers and ratings. If you cannot determine something clearly, indicate it as null.
Provide warnings for any safety concerns or code compliance issues you observe.`;

  const userPrompt = `Analyze this switchboard photo and extract all relevant electrical details for a solar/battery installation assessment.

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
              confidence: { type: "number" }
            },
            required: [
              "mainSwitchRating", "mainSwitchType", "totalCircuits", "usedCircuits", 
              "availableCircuits", "circuitBreakers", "hasRcd", "rcdCount",
              "meterType", "meterNumber", "boardCondition", "boardAge",
              "hasSpaceForSolar", "hasSpaceForBattery", "upgradeRequired", "upgradeReason",
              "notes", "warnings", "confidence"
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
      confidence: 0
    };
  }
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
  
  // Solar/Battery readiness
  lines.push("\n### Installation Readiness\n");
  lines.push(`- Space for Solar: ${analysis.hasSpaceForSolar ? '✓ Yes' : '✗ No'}`);
  lines.push(`- Space for Battery: ${analysis.hasSpaceForBattery ? '✓ Yes' : '✗ No'}`);
  
  if (analysis.upgradeRequired) {
    lines.push(`\n**⚠️ Upgrade Required:** ${analysis.upgradeReason || 'See notes'}`);
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
