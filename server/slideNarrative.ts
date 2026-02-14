/**
 * slideNarrative.ts
 * 
 * LLM-powered narrative generation for each slide type.
 * Each function takes customer data and returns rich, contextual analysis paragraphs
 * that transform raw numbers into professional, in-depth analysis.
 * 
 * Target audience: HIGH LEVEL OF EDUCATED PUBLICS
 * Tone: Professional, authoritative, data-driven but accessible
 * Style: Full paragraphs with bold key figures, not bullet points
 */

import { invokeLLM } from './_core/llm';
import type { ProposalData } from './slideGenerator';

const SYSTEM_PROMPT = `You are a senior energy consultant at Lightning Energy, Australia's premier solar and battery advisory firm. You write concise, authoritative analysis for high-net-worth residential customers considering solar + battery investments.

WRITING STYLE:
- Write CONCISE paragraphs — maximum 2-3 sentences per paragraph
- Maximum 2 short paragraphs per section (total 4-6 sentences)
- Bold key financial figures using <b> tags (e.g., <b>$1,471</b>)
- Use <span class="hl-aqua"> for positive/savings figures
- Use <span class="hl-orange"> for costs/current spend figures  
- Use <span class="hl-white"> for neutral emphasis
- Be specific and data-driven — reference the customer's actual numbers
- Every sentence must deliver value — no filler, no repetition
- Sound like a trusted advisor delivering a boardroom briefing
- Australian English spelling (analyse, optimise, colour, etc.)
- NEVER use emoji, bullet points, numbered lists, or informal language
- NEVER fabricate data — only reference numbers provided in the data context
- Keep total text under 80 words per section`;

async function generateNarrative(slideType: string, dataContext: string, specificPrompt: string): Promise<string> {
  try {
    const result = await invokeLLM({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `SLIDE TYPE: ${slideType}\n\nCUSTOMER DATA:\n${dataContext}\n\nTASK:\n${specificPrompt}\n\nRespond with ONLY the HTML paragraph content (using <p> tags). Do not include any headings, titles, or wrapper elements.` }
      ],
    });
    
    const content = result.choices?.[0]?.message?.content;
    if (typeof content === 'string') {
      return content.trim();
    }
    if (Array.isArray(content)) {
      const textPart = content.find(p => p.type === 'text');
      if (textPart && 'text' in textPart) return (textPart as any).text.trim();
    }
    return '';
  } catch (err: any) {
    console.error(`[slideNarrative] Failed to generate narrative for ${slideType}:`, err.message);
    return '';
  }
}

function buildDataContext(data: ProposalData): string {
  return `Customer: ${data.customerName}
Address: ${data.address}, ${data.state}
Current Retailer: ${data.retailer}
Annual Electricity Cost: $${data.annualCost.toLocaleString()}
Daily Usage: ${data.dailyUsageKwh.toFixed(1)} kWh
Annual Usage: ${data.annualUsageKwh.toLocaleString()} kWh
Usage Rate: ${data.usageRateCentsPerKwh}¢/kWh
Supply Charge: ${data.supplyChargeCentsPerDay}¢/day
Feed-in Tariff: ${data.feedInTariffCentsPerKwh}¢/kWh
Peak Rate: ${data.billPeakRateCents || 'N/A'}¢/kWh
Off-Peak Rate: ${data.billOffPeakRateCents || 'N/A'}¢/kWh
Shoulder Rate: ${data.billShoulderRateCents || 'N/A'}¢/kWh
Solar Exports: ${data.billSolarExportsKwh || 0} kWh
Proposed Solar: ${data.solarSizeKw}kW (${data.panelCount} x ${data.panelBrand} ${data.panelWattage}W panels)
Proposed Battery: ${data.batterySizeKwh}kWh ${data.batteryBrand}
Inverter: ${data.inverterSizeKw}kW ${data.inverterBrand}
System Cost: $${data.systemCost.toLocaleString()}
Rebates: $${data.rebateAmount.toLocaleString()}
Net Investment: $${data.netInvestment.toLocaleString()}
Annual Savings: $${data.annualSavings.toLocaleString()}
Payback: ${data.paybackYears.toFixed(1)} years
10-Year Savings: $${data.tenYearSavings.toLocaleString()}
VPP Provider: ${data.vppProvider} (${data.vppProgram})
VPP Annual Value: $${data.vppAnnualValue}
CO2 Reduction: ${data.co2ReductionTonnes.toFixed(1)} tonnes/year
Has EV: ${data.hasEV}${data.hasEV ? ` (${data.evAnnualKm?.toLocaleString()} km/year, saves $${data.evAnnualSavings}/year)` : ''}
Has Pool: ${data.hasPoolPump}${data.hasPoolPump ? ` (saves $${data.poolPumpSavings}/year)` : ''}
Monthly Usage Data: ${data.monthlyUsageData?.map(m => `${m.month}: ${m.kwh}kWh`).join(', ') || 'Not available'}
Existing Solar: ${data.existingSolar || 'none'}${data.proposalNotes ? `\n\n--- CONSULTANT NOTES ---\nThe following notes have been added by the Lightning Energy consultant. Incorporate these observations and requirements into your analysis where relevant:\n${data.proposalNotes}` : ''}${data.regeneratePrompt ? `\n\n--- SPECIAL INSTRUCTIONS ---\nThe consultant has provided the following specific instructions for this regeneration. Follow these closely:\n${data.regeneratePrompt}` : ''}${data.sitePhotos && data.sitePhotos.length > 0 ? `\n\n--- SITE PHOTOS ---\nThe following site photos have been uploaded for this customer:\n${data.sitePhotos.map(p => `- ${p.caption}: ${p.url}`).join('\n')}\nReference these photos in your analysis where relevant (e.g., switchboard condition, meter type, roof orientation).` : ''}`;
}

// ============================================================
// NARRATIVE GENERATORS FOR EACH SLIDE TYPE
// ============================================================

export async function narrativeExecutiveSummary(data: ProposalData): Promise<{ overview: string; financialCard: string; systemCard: string; urgencyCard: string }> {
  const ctx = buildDataContext(data);
  const projectedCost = data.annualCost - data.annualSavings;
  
  const result = await invokeLLM({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `CUSTOMER DATA:\n${ctx}\n\nGenerate 4 narrative sections for an Executive Summary slide. Each section should be 2-3 sentences of rich analysis.

Return JSON with these keys:
- "overview": One compelling sentence summarising the proposal opportunity. Reference the transformation from $${data.annualCost}/year to ${projectedCost < 0 ? 'a $' + Math.abs(projectedCost) + ' annual credit' : '$' + projectedCost + '/year'}.
- "financialCard": 1-2 sentences on the financial transformation — current spend vs projected savings.
- "systemCard": 1-2 sentences on why this system (${data.solarSizeKw}kW solar + ${data.batterySizeKwh}kWh ${data.batteryBrand}) is the right choice.
- "urgencyCard": 1-2 sentences on time-sensitive factors — rebates, rising costs.

Keep each value under 40 words. Use <b>, <span class="hl-aqua">, <span class="hl-orange"> for emphasis.` }
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'executive_summary_narrative',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            overview: { type: 'string' },
            financialCard: { type: 'string' },
            systemCard: { type: 'string' },
            urgencyCard: { type: 'string' },
          },
          required: ['overview', 'financialCard', 'systemCard', 'urgencyCard'],
          additionalProperties: false,
        }
      }
    }
  });
  
  try {
    const content = result.choices?.[0]?.message?.content;
    const text = typeof content === 'string' ? content : '';
    return JSON.parse(text);
  } catch {
    return {
      overview: `This comprehensive analysis evaluates your current energy expenditure of <span class="hl-orange">$${data.annualCost.toLocaleString()}</span> and presents a tailored solar + battery solution designed to deliver <span class="hl-aqua">$${data.annualSavings.toLocaleString()} in annual savings</span>.`,
      financialCard: `Your proposed ${data.solarSizeKw}kW system with ${data.batterySizeKwh}kWh battery achieves payback in <b>${data.paybackYears.toFixed(1)} years</b>.`,
      systemCard: `The ${data.batteryBrand} ${data.batterySizeKwh}kWh battery paired with ${data.panelBrand} panels provides optimal performance for your usage profile.`,
      urgencyCard: `Current state rebates of <span class="hl-aqua">$${data.rebateAmount.toLocaleString()}</span> are subject to change. Acting now secures the best financial outcome.`,
    };
  }
}

export async function narrativeBillAnalysis(data: ProposalData): Promise<string> {
  const ctx = buildDataContext(data);
  return generateNarrative('Current Bill Analysis', ctx,
    `Write 1 concise paragraph (3-4 sentences max, under 60 words total) analysing this customer's electricity bill. Cover their cost structure, the arbitrage gap between usage rate (${data.usageRateCentsPerKwh}¢) and feed-in tariff (${data.feedInTariffCentsPerKwh}¢), and how their ${data.dailyUsageKwh.toFixed(1)}kWh daily usage compares to benchmarks. Use <span class="hl-orange"> for costs and <span class="hl-aqua"> for opportunities.`);
}

export async function narrativeUsageAnalysis(data: ProposalData): Promise<string> {
  const ctx = buildDataContext(data);
  const peakMonth = data.monthlyUsageData?.reduce((max, curr) => curr.kwh > max.kwh ? curr : max, data.monthlyUsageData[0]);
  const lowMonth = data.monthlyUsageData?.reduce((min, curr) => curr.kwh < min.kwh ? curr : min, data.monthlyUsageData[0]);
  
  return generateNarrative('Detailed Usage Analysis', ctx,
    `Write 1 concise paragraph (3-4 sentences max, under 60 words total) analysing usage patterns. Peak month: ${peakMonth?.month || 'winter'} at ${peakMonth?.kwh || 'N/A'}kWh, lowest: ${lowMonth?.month || 'spring'} at ${lowMonth?.kwh || 'N/A'}kWh. Cover seasonal variation drivers and how battery storage addresses evening peak demand. Use <span class="hl-aqua"> for solar/savings and <span class="hl-orange"> for costs.`);
}

export async function narrativeYearlyProjection(data: ProposalData): Promise<string> {
  const ctx = buildDataContext(data);
  const tenYearNoAction = Math.round(data.annualCost * 10 * Math.pow(1.035, 5)); // rough 10yr with inflation
  
  return generateNarrative('Yearly Cost Projection', ctx,
    `Write 1 concise paragraph (3-4 sentences max, under 60 words total) on the long-term cost trajectory. At 3.5% inflation, their $${data.annualCost}/year becomes ~$${Math.round(data.annualCost * Math.pow(1.035, 10))}/year in 10 years. Cover compounding inflation impact and how solar + battery hedges against it. 25-year savings: $${(data.twentyFiveYearSavings || data.annualSavings * 25).toLocaleString()}. Use <span class="hl-orange"> for costs and <span class="hl-aqua"> for savings.`);
}

export async function narrativeStrategicAssessment(data: ProposalData): Promise<string> {
  const ctx = buildDataContext(data);
  return generateNarrative('Strategic Site Assessment', ctx,
    `Write 1 concise paragraph (4-5 sentences max, under 80 words total) providing a strategic assessment. Cover: ${data.state} solar opportunity with ${data.solarSizeKw}kW system, feed-in tariff erosion (${data.feedInTariffCentsPerKwh}¢ vs ${data.usageRateCentsPerKwh}¢ usage rate), and ${data.vppProvider} VPP adding $${data.vppAnnualValue}/year. Keep it authoritative and concise.`);
}

export async function narrativeBatteryOption(data: ProposalData, optionNumber: 1 | 2): Promise<{ whyRecommend: string; financialAnalysis: string }> {
  const ctx = buildDataContext(data);
  
  // Option 1 is the primary recommendation, Option 2 is the alternative
  const option1 = { brand: data.batteryBrand, size: data.batterySizeKwh, inverter: data.inverterBrand, inverterSize: data.inverterSizeKw };
  const option2 = { brand: 'GoodWe', size: Math.max(5, data.batterySizeKwh - 5), inverter: 'GoodWe', inverterSize: data.inverterSizeKw };
  const opt = optionNumber === 1 ? option1 : option2;
  const costMultiplier = optionNumber === 1 ? 1 : 0.75;
  
  const result = await invokeLLM({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `CUSTOMER DATA:\n${ctx}\n\nGenerate narrative for Battery Option ${optionNumber}: ${opt.brand} ${opt.size}kWh with ${opt.inverter} ${opt.inverterSize}kW inverter.
${optionNumber === 1 ? 'This is the PRIMARY recommendation — the premium choice.' : 'This is the ALTERNATIVE option — a more budget-conscious choice with slightly smaller capacity.'}

Return JSON:
- "whyRecommend": 2-3 sentences explaining why this specific system is recommended for this customer. Reference their usage pattern, VPP compatibility, and technical advantages.
- "financialAnalysis": 2-3 sentences on the financial case — cost of ~$${Math.round(data.netInvestment * costMultiplier).toLocaleString()} after rebates, payback period, and long-term value proposition.

Use <b>, <span class="hl-aqua">, <span class="hl-orange"> for emphasis.` }
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'battery_option_narrative',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            whyRecommend: { type: 'string' },
            financialAnalysis: { type: 'string' },
          },
          required: ['whyRecommend', 'financialAnalysis'],
          additionalProperties: false,
        }
      }
    }
  });
  
  try {
    const content = result.choices?.[0]?.message?.content;
    return JSON.parse(typeof content === 'string' ? content : '{}');
  } catch {
    return {
      whyRecommend: `The ${opt.brand} ${opt.size}kWh system delivers optimal performance for your ${data.dailyUsageKwh.toFixed(1)}kWh daily usage profile.`,
      financialAnalysis: `At <span class="hl-aqua">$${Math.round(data.netInvestment * costMultiplier).toLocaleString()}</span> after rebates, this system achieves payback in approximately <b>${(data.paybackYears * (optionNumber === 1 ? 1 : 1.2)).toFixed(1)} years</b>.`,
    };
  }
}

export async function narrativeVPPRecommendation(data: ProposalData): Promise<string> {
  const ctx = buildDataContext(data);
  return generateNarrative('VPP Recommendation', ctx,
    `Write 1 concise paragraph (3-4 sentences max, under 60 words total) on why ${data.vppProvider} (${data.vppProgram}) is recommended. Cover why selected from 13 providers, the $${data.vppAnnualValue}/year income, and how it works in practice. Use <span class="hl-aqua"> for income figures.`);
}

export async function narrativeAnnualFinancialImpact(data: ProposalData): Promise<string> {
  const ctx = buildDataContext(data);
  const projectedCost = data.annualCost - data.annualSavings;
  
  return generateNarrative('Annual Financial Impact', ctx,
    `Write 1 concise paragraph (3-4 sentences max, under 60 words total) on the financial transformation. Before: $${data.annualCost}/year. After: ${projectedCost < 0 ? '$' + Math.abs(projectedCost) + '/year credit' : '$' + projectedCost + '/year'}. Total turnaround: $${data.annualSavings.toLocaleString()}/year. Cover the key savings drivers. Use <span class="hl-orange"> for costs and <span class="hl-aqua"> for savings.`);
}

export async function narrativeInvestmentAnalysis(data: ProposalData): Promise<string> {
  const ctx = buildDataContext(data);
  return generateNarrative('Investment Analysis', ctx,
    `Write 1 concise paragraph (3-4 sentences max, under 60 words total) on the investment case. Net investment: $${data.netInvestment.toLocaleString()}, annual return: $${data.annualSavings.toLocaleString()} (${Math.round(data.annualSavings / data.netInvestment * 100)}% ROI), payback: ${data.paybackYears.toFixed(1)} years. Compare to traditional investments. Use <span class="hl-aqua"> for returns and <span class="hl-orange"> for costs.`);
}

export async function narrativeEnvironmentalImpact(data: ProposalData): Promise<string> {
  const ctx = buildDataContext(data);
  return generateNarrative('Environmental Impact', ctx,
    `Write 1 concise paragraph (3-4 sentences max, under 60 words total) on environmental impact. Annual CO2 reduction: ${data.co2ReductionTonnes.toFixed(1)} tonnes, 25-year: ${(data.co2ReductionTonnes * 25).toFixed(0)} tonnes, trees equivalent: ${data.treesEquivalent || Math.round(data.co2ReductionTonnes * 45)}/year. Cover the tangible impact and energy independence (${data.energyIndependenceScore || 85}%). Authoritative and factual tone.`);
}

export async function narrativeFinalRecommendation(data: ProposalData): Promise<{ financial: string; strategic: string; urgency: string }> {
  const ctx = buildDataContext(data);
  const projectedCost = data.annualCost - data.annualSavings;
  
  const result = await invokeLLM({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `CUSTOMER DATA:\n${ctx}\n\nGenerate the FINAL RECOMMENDATION — the closing executive summary that drives action.

Return JSON:
- "financial": 1-2 sentences on the financial transformation from $${data.annualCost}/year to ${projectedCost < 0 ? '$' + Math.abs(projectedCost) + ' annual credit' : '$' + projectedCost + '/year'}.
- "strategic": 1-2 sentences on why ${data.batteryBrand} + ${data.vppProvider} is the optimal combination.
- "urgency": 1-2 sentences on why acting now is critical — rebates and rising costs.

Keep each under 40 words. Use <b>, <span class="hl-aqua">, <span class="hl-orange"> for emphasis.` }
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'final_recommendation',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            financial: { type: 'string' },
            strategic: { type: 'string' },
            urgency: { type: 'string' },
          },
          required: ['financial', 'strategic', 'urgency'],
          additionalProperties: false,
        }
      }
    }
  });
  
  try {
    const content = result.choices?.[0]?.message?.content;
    return JSON.parse(typeof content === 'string' ? content : '{}');
  } catch {
    return {
      financial: `This solution transforms your <span class="hl-orange">$${data.annualCost.toLocaleString()}</span> annual energy cost into ${projectedCost < 0 ? 'a <span class="hl-aqua">$' + Math.abs(projectedCost).toLocaleString() + ' annual credit</span>' : 'just <span class="hl-aqua">$' + projectedCost.toLocaleString() + '/year</span>'}.`,
      strategic: `The ${data.batteryBrand} ${data.batterySizeKwh}kWh system paired with ${data.vppProvider} delivers the optimal balance of self-consumption, VPP income, and future-proofing.`,
      urgency: `Current ${data.state} rebates of <span class="hl-aqua">$${data.rebateAmount.toLocaleString()}</span> are subject to reduction. Securing this investment now locks in the maximum financial benefit.`,
    };
  }
}

export async function narrativeRoadmap(data: ProposalData): Promise<string> {
  const ctx = buildDataContext(data);
  return generateNarrative('Recommended Roadmap', ctx,
    `Write 1-2 sentences introducing the implementation roadmap. Mention the phased approach from approval to installation to VPP activation with ${data.panelBrand} panels and ${data.batteryBrand} battery. Keep under 40 words.`);
}

export async function narrativeTariffComparison(data: ProposalData): Promise<string> {
  const ctx = buildDataContext(data);
  return generateNarrative('Tariff Rate Comparison', ctx,
    `Write 2 paragraphs analysing this customer's tariff rate structure. Discuss the spread between peak rate (${data.billPeakRateCents || data.usageRateCentsPerKwh}¢/kWh) and feed-in tariff (${data.feedInTariffCentsPerKwh}¢/kWh), and what this means for battery arbitrage opportunity. Explain how time-of-use tariffs create value for battery storage — buying low (solar/off-peak) and consuming during peak. Reference the daily supply charge of ${data.supplyChargeCentsPerDay}¢/day as a fixed cost that cannot be avoided.`);
}

export async function narrativeDailyLoadProfile(data: ProposalData): Promise<string> {
  const ctx = buildDataContext(data);
  return generateNarrative('Daily Load Profile', ctx,
    `Write 2 paragraphs about this customer's estimated daily energy consumption pattern. Their daily average is ${data.dailyUsageKwh.toFixed(1)} kWh. Discuss typical residential load patterns — morning and evening peaks, midday solar generation window, and overnight base load. ${data.hasEV ? 'Include EV charging impact on overnight consumption.' : ''} ${data.hasPoolPump ? 'Include pool pump load during daytime hours.' : ''} Explain how the proposed battery system captures solar excess during midday for evening peak use.`);
}

export async function narrativeSolarGeneration(data: ProposalData): Promise<string> {
  const ctx = buildDataContext(data);
  const annualGen = data.solarSizeKw * 365 * 4;
  const coverage = Math.round((annualGen / data.annualUsageKwh) * 100);
  return generateNarrative('Solar Generation vs Consumption', ctx,
    `Write 2 paragraphs comparing the proposed ${data.solarSizeKw}kW solar system's annual generation (~${annualGen.toLocaleString()} kWh) against the household's annual consumption (${data.annualUsageKwh.toLocaleString()} kWh). The solar coverage ratio is approximately ${coverage}%. Discuss seasonal variation — summer months generating 30-35% more than winter — and how the battery bridges this gap. Explain self-consumption optimisation strategies.`);
}

export async function narrativeBatteryCycle(data: ProposalData): Promise<string> {
  const ctx = buildDataContext(data);
  return generateNarrative('Battery Charge & Discharge Cycle', ctx,
    `Write 2 paragraphs explaining the typical daily charge/discharge cycle of the proposed ${data.batterySizeKwh}kWh ${data.batteryBrand} battery. Describe the cycle: overnight base load discharge (30% → 15%), morning solar charging (6am-12pm), peak solar saturation (12pm-5pm reaching 100%), evening peak discharge (6pm-10pm), and overnight base load. ${data.hasEV ? 'Include how EV charging integrates with the battery cycle during off-peak hours.' : ''} Explain the 90% depth of discharge and 95% round-trip efficiency.`);
}

export async function narrativeGridIndependence(data: ProposalData): Promise<string> {
  const ctx = buildDataContext(data);
  const annualGen = data.solarSizeKw * 365 * 4;
  const solarSelfConsumed = Math.min(annualGen * 0.35, data.annualUsageKwh);
  const batteryContrib = data.batterySizeKwh * 365 * 0.8 * 0.95;
  const selfSufficiency = Math.min(Math.round(((solarSelfConsumed + batteryContrib) / data.annualUsageKwh) * 100), 100);
  return generateNarrative('Grid Independence Analysis', ctx,
    `Write 2 paragraphs about this customer's path from 100% grid dependence to approximately ${selfSufficiency}% energy self-sufficiency. Explain how the ${data.solarSizeKw}kW solar system and ${data.batterySizeKwh}kWh battery work together — solar self-consumption, battery contribution, and remaining grid import. Discuss the financial and resilience benefits of reduced grid dependence, including protection against future price rises and blackout resilience.`);
}

export async function narrativeRebateBreakdown(data: ProposalData): Promise<string> {
  const ctx = buildDataContext(data);
  const savingsPercent = data.systemCost > 0 ? Math.round((data.rebateAmount / data.systemCost) * 100) : 0;
  return generateNarrative('Rebate & Incentive Breakdown', ctx,
    `Write 2 paragraphs about the government rebates and incentives available for this ${data.state} customer. Total rebates of $${data.rebateAmount.toLocaleString()} reduce the gross investment of $${data.systemCost.toLocaleString()} by ${savingsPercent}% to a net cost of $${data.netInvestment.toLocaleString()}. Discuss the specific rebate programs (Federal STCs for solar, state battery rebates if applicable). Emphasise that these rebates are subject to change and acting now secures the current incentive levels.`);
}

export async function narrativeFinancialProjection25yr(data: ProposalData): Promise<string> {
  const ctx = buildDataContext(data);
  const twentyFiveYr = data.twentyFiveYearSavings || data.annualSavings * 25;
  const roi = Math.round((twentyFiveYr / data.netInvestment) * 100);
  return generateNarrative('25-Year Financial Projection', ctx,
    `Write 2 paragraphs about the long-term financial outlook. The $${data.netInvestment.toLocaleString()} investment pays back in ${data.paybackYears.toFixed(1)} years, generates $${data.tenYearSavings.toLocaleString()} in 10-year savings, and $${twentyFiveYr.toLocaleString()} over 25 years — a ${roi}% return on investment. Factor in 3.5% annual electricity price inflation which accelerates the value proposition over time. Compare this return to traditional investment vehicles (term deposits, shares) to contextualise the financial opportunity.`);
}

export async function narrativeSystemSpecs(data: ProposalData): Promise<string> {
  const ctx = buildDataContext(data);
  return generateNarrative('System Specifications', ctx,
    `Write 2 paragraphs about the technical specifications of the recommended system. The ${data.solarSizeKw}kW solar array uses ${data.panelCount} x ${data.panelBrand} ${data.panelWattage}W panels — discuss why this panel technology was selected (efficiency, shade performance, warranty). The ${data.batterySizeKwh}kWh ${data.batteryBrand} battery uses LFP chemistry — explain why LFP is preferred for residential (safety, longevity, thermal stability). The ${data.inverterSizeKw}kW ${data.inverterBrand} hybrid inverter manages all energy flows — discuss its role as the system brain.`);
}

export async function narrativeWarrantyMaintenance(data: ProposalData): Promise<string> {
  const ctx = buildDataContext(data);
  return generateNarrative('Warranty & Maintenance', ctx,
    `Write 2 paragraphs about the warranty coverage and maintenance requirements. Solar panels carry a 25-year performance warranty (87.4% output at year 25). The ${data.batteryBrand} battery has a 10-year/6,000 cycle warranty. The inverter carries a 10-year manufacturer warranty. Discuss the minimal maintenance requirements — annual panel cleaning, system health checks — and how Lightning Energy provides ongoing monitoring and support. Emphasise that the system is largely maintenance-free with automatic firmware updates.`);
}

// Export all narrative generators as a map for easy lookup
export const narrativeGenerators: Record<string, (data: ProposalData) => Promise<any>> = {
  executive_summary: narrativeExecutiveSummary,
  bill_analysis: narrativeBillAnalysis,
  usage_analysis: narrativeUsageAnalysis,
  yearly_projection: narrativeYearlyProjection,
  strategic_assessment: narrativeStrategicAssessment,
  battery_option_1: (data) => narrativeBatteryOption(data, 1),
  battery_option_2: (data) => narrativeBatteryOption(data, 2),
  vpp_recommendation: narrativeVPPRecommendation,
  annual_financial_impact: narrativeAnnualFinancialImpact,
  investment_analysis: narrativeInvestmentAnalysis,
  environmental_impact: narrativeEnvironmentalImpact,
  final_recommendation: narrativeFinalRecommendation,
  roadmap: narrativeRoadmap,
  tariff_comparison: narrativeTariffComparison,
  daily_load_profile: narrativeDailyLoadProfile,
  solar_generation_profile: narrativeSolarGeneration,
  battery_cycle: narrativeBatteryCycle,
  grid_independence: narrativeGridIndependence,
  rebate_breakdown: narrativeRebateBreakdown,
  financial_projection_25yr: narrativeFinancialProjection25yr,
  system_specifications: narrativeSystemSpecs,
  warranty_maintenance: narrativeWarrantyMaintenance,
};
