/**
 * Batch analyze all switchboard photos using LLM vision
 * Stores analysis results in extractedData column of customerDocuments
 */
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const FORGE_API_URL = process.env.BUILT_IN_FORGE_API_URL;
const FORGE_API_KEY = process.env.BUILT_IN_FORGE_API_KEY;

async function invokeLLMDirect(messages) {
  const res = await fetch(`${FORGE_API_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${FORGE_API_KEY}`,
    },
    body: JSON.stringify({
      messages,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "switchboard_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              mainSwitchRating: { type: ["number", "null"], description: "Main switch rating in Amps" },
              mainSwitchType: { type: ["string", "null"], description: "e.g. Single pole, Double pole" },
              totalCircuits: { type: ["number", "null"] },
              usedCircuits: { type: ["number", "null"] },
              availableCircuits: { type: ["number", "null"] },
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
                  required: ["position", "rating", "type", "label", "isUsed"],
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
    }),
  });
  
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`LLM API error ${res.status}: ${errText}`);
  }
  
  const data = await res.json();
  return data.choices[0].message.content;
}

async function analyzePhoto(imageUrl) {
  const systemPrompt = `You are an expert electrical inspector analyzing switchboard photos for solar and battery installation assessments.
Analyze the image and extract detailed information about the switchboard.
Be precise with numbers and ratings. If you cannot determine something clearly, indicate it as null.
Provide warnings for any safety concerns or code compliance issues you observe.`;

  const userPrompt = `Analyze this switchboard photo and extract all relevant electrical details for a solar/battery installation assessment.`;

  const messages = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: [
        { type: "text", text: userPrompt },
        { type: "image_url", image_url: { url: imageUrl, detail: "high" } }
      ]
    }
  ];

  const result = await invokeLLMDirect(messages);
  return JSON.parse(result);
}

function generateReport(analysis) {
  const parts = [];
  if (analysis.mainSwitchRating) parts.push(`Main switch: ${analysis.mainSwitchRating}A ${analysis.mainSwitchType || ''}`);
  if (analysis.totalCircuits) parts.push(`${analysis.totalCircuits} circuits (${analysis.usedCircuits || 0} used, ${analysis.availableCircuits || 0} available)`);
  if (analysis.hasRcd) parts.push(`${analysis.rcdCount || 1} RCD/safety switch(es) present`);
  parts.push(`Board condition: ${analysis.boardCondition}`);
  if (analysis.upgradeRequired) parts.push(`Upgrade required: ${analysis.upgradeReason}`);
  if (analysis.warnings?.length) parts.push(`Warnings: ${analysis.warnings.join('; ')}`);
  return parts.join('. ') + '.';
}

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  // Get all switchboard photos without analysis
  const [photos] = await conn.query(
    'SELECT id, customerId, fileUrl, fileName, extractedData FROM customerDocuments WHERE documentType = "switchboard_photo"'
  );
  
  const needsAnalysis = photos.filter(p => !p.extractedData);
  console.log(`Found ${photos.length} switchboard photos, ${needsAnalysis.length} need analysis`);
  
  let success = 0;
  let failed = 0;
  
  for (let i = 0; i < needsAnalysis.length; i++) {
    const photo = needsAnalysis[i];
    console.log(`\n[${i + 1}/${needsAnalysis.length}] Analyzing: ${photo.fileName} (customer ${photo.customerId})`);
    
    try {
      const analysis = await analyzePhoto(photo.fileUrl);
      const report = generateReport(analysis);
      
      await conn.query(
        'UPDATE customerDocuments SET extractedData = ?, description = ? WHERE id = ?',
        [JSON.stringify(analysis), report, photo.id]
      );
      
      console.log(`  ✓ Board: ${analysis.boardCondition} | Circuits: ${analysis.totalCircuits} | RCD: ${analysis.hasRcd} | Upgrade: ${analysis.upgradeRequired}`);
      success++;
    } catch (err) {
      console.log(`  ✗ Failed: ${err.message}`);
      failed++;
    }
    
    // 2-second delay between API calls
    if (i < needsAnalysis.length - 1) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  
  console.log(`\n=== COMPLETE ===`);
  console.log(`Success: ${success} | Failed: ${failed} | Total: ${needsAnalysis.length}`);
  
  await conn.end();
}

main().catch(console.error);
