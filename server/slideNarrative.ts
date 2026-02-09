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

const SYSTEM_PROMPT = `You are a senior energy consultant at Lightning Energy, Australia's premier solar and battery advisory firm. You write in-depth, professional analysis for high-net-worth residential customers considering solar + battery investments.

WRITING STYLE:
- Write in complete, flowing paragraphs — NEVER use bullet points or numbered lists
- Bold key financial figures using <b> tags (e.g., <b>$1,471</b>)
- Use <span class="hl-aqua"> for positive/savings figures
- Use <span class="hl-orange"> for costs/current spend figures  
- Use <span class="hl-white"> for neutral emphasis
- Be specific and data-driven — reference the customer's actual numbers
- Write 2-3 paragraphs per section, each 3-5 sentences
- Sound like a trusted advisor, not a salesperson
- Australian English spelling (analyse, optimise, colour, etc.)
- Reference seasonal patterns, time-of-use tariffs, and grid dynamics where relevant
- NEVER use emoji or informal language
- NEVER fabricate data — only reference numbers provided in the data context`;

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
Monthly Usage Data: ${data.monthlyUsageData?.map(m => `${m.month}: ${m.kwh}kWh`).join(', ') || 'Not available'}`;
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
- "overview": A compelling opening paragraph summarising the entire proposal opportunity. Reference the transformation from $${data.annualCost}/year to ${projectedCost < 0 ? 'a $' + Math.abs(projectedCost) + ' annual credit' : '$' + projectedCost + '/year'}.
- "financialCard": Analysis of the financial transformation — current spend vs projected, savings breakdown, ROI context.
- "systemCard": Why this specific system configuration (${data.solarSizeKw}kW solar + ${data.batterySizeKwh}kWh ${data.batteryBrand}) is the strategic choice for this customer.
- "urgencyCard": Time-sensitive factors — rebate deadlines, rising electricity costs, seasonal considerations based on their usage pattern.

Each value should be 2-3 sentences of professional analysis using <b>, <span class="hl-aqua">, <span class="hl-orange"> for emphasis.` }
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
    `Write 2-3 paragraphs analysing this customer's current electricity bill. Cover:
    1. Their overall cost structure — what proportion is usage vs supply charges
    2. The gap between their usage rate (${data.usageRateCentsPerKwh}¢) and feed-in tariff (${data.feedInTariffCentsPerKwh}¢) — this is the key arbitrage opportunity
    3. How their daily usage of ${data.dailyUsageKwh.toFixed(1)}kWh compares to Australian household benchmarks (small: 7.5kWh, medium: 12.7kWh, large: 14.7kWh)
    Use <span class="hl-orange"> for current costs and <span class="hl-aqua"> for opportunities.`);
}

export async function narrativeUsageAnalysis(data: ProposalData): Promise<string> {
  const ctx = buildDataContext(data);
  const peakMonth = data.monthlyUsageData?.reduce((max, curr) => curr.kwh > max.kwh ? curr : max, data.monthlyUsageData[0]);
  const lowMonth = data.monthlyUsageData?.reduce((min, curr) => curr.kwh < min.kwh ? curr : min, data.monthlyUsageData[0]);
  
  return generateNarrative('Detailed Usage Analysis', ctx,
    `Write 2-3 paragraphs analysing the customer's monthly usage patterns. Their peak month is ${peakMonth?.month || 'winter'} at ${peakMonth?.kwh || 'N/A'}kWh and lowest is ${lowMonth?.month || 'spring'} at ${lowMonth?.kwh || 'N/A'}kWh.
    Cover:
    1. Seasonal variation — what drives the peaks (heating/cooling) and what this means for solar sizing
    2. The ratio between peak and low months — is this a highly variable or stable load?
    3. How battery storage addresses the evening peak demand gap when solar isn't generating
    Use <span class="hl-aqua"> for solar/savings references and <span class="hl-orange"> for cost/problem references.`);
}

export async function narrativeYearlyProjection(data: ProposalData): Promise<string> {
  const ctx = buildDataContext(data);
  const tenYearNoAction = Math.round(data.annualCost * 10 * Math.pow(1.035, 5)); // rough 10yr with inflation
  
  return generateNarrative('Yearly Cost Projection', ctx,
    `Write 2-3 paragraphs about the long-term cost trajectory. Without action, at 3.5% annual electricity inflation, this customer's $${data.annualCost}/year bill becomes approximately $${Math.round(data.annualCost * Math.pow(1.035, 10))}/year in 10 years and $${Math.round(data.annualCost * Math.pow(1.035, 25))}/year in 25 years.
    Cover:
    1. The compounding effect of electricity price inflation on their current bill
    2. How the solar + battery system creates a hedge against rising prices
    3. The cumulative 25-year savings of $${(data.twentyFiveYearSavings || data.annualSavings * 25).toLocaleString()} and what that means in real terms
    Use <span class="hl-orange"> for escalating costs and <span class="hl-aqua"> for savings/protection.`);
}

export async function narrativeStrategicAssessment(data: ProposalData): Promise<string> {
  const ctx = buildDataContext(data);
  return generateNarrative('Strategic Site Assessment', ctx,
    `Write 3 paragraphs providing a strategic assessment of this customer's property and energy situation. This should read like a professional site audit report.
    Cover:
    1. SOLAR OPPORTUNITY: Based on their ${data.state} location, roof orientation considerations, and ${data.solarSizeKw}kW system capacity — why this is an excellent candidate for solar
    2. FEED-IN TARIFF EROSION: The current ${data.feedInTariffCentsPerKwh}¢/kWh feed-in rate is declining across Australia. Battery storage captures the full ${data.usageRateCentsPerKwh}¢/kWh value instead
    3. VPP REVENUE STREAM: The ${data.vppProvider} partnership adds $${data.vppAnnualValue}/year in additional income, effectively creating a third revenue stream beyond self-consumption and feed-in
    Each paragraph should be 3-4 sentences of substantive analysis.`);
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
    `Write 2-3 paragraphs explaining why ${data.vppProvider} (${data.vppProgram}) is the recommended VPP provider for this customer.
    Cover:
    1. Why this provider was selected from the 13 evaluated — what makes them the best strategic fit
    2. The income breakdown — daily credits, event payments, and how the $${data.vppAnnualValue}/year value is achieved
    3. How VPP participation works in practice — what the customer experiences day-to-day and during grid events
    Use <span class="hl-aqua"> for income/savings figures.`);
}

export async function narrativeAnnualFinancialImpact(data: ProposalData): Promise<string> {
  const ctx = buildDataContext(data);
  const projectedCost = data.annualCost - data.annualSavings;
  
  return generateNarrative('Annual Financial Impact', ctx,
    `Write 2-3 paragraphs analysing the complete annual financial transformation.
    Before: $${data.annualCost}/year electricity cost.
    After: ${projectedCost < 0 ? '$' + Math.abs(projectedCost) + '/year CREDIT (the customer is now earning money)' : '$' + projectedCost + '/year (reduced cost)'}.
    Total Annual Turnaround: $${data.annualSavings.toLocaleString()}/year.
    
    Cover:
    1. The before/after transformation — what changes and why
    2. Itemised savings breakdown: solar self-consumption, battery arbitrage, VPP income ($${data.vppAnnualValue}), feed-in credits${data.hasEV ? ', EV fuel savings ($' + data.evAnnualSavings + ')' : ''}
    3. The concept of "Total Annual Turnaround" — this isn't just savings, it's a complete financial reversal
    Use <span class="hl-orange"> for before/costs and <span class="hl-aqua"> for after/savings.`);
}

export async function narrativeInvestmentAnalysis(data: ProposalData): Promise<string> {
  const ctx = buildDataContext(data);
  return generateNarrative('Investment Analysis', ctx,
    `Write 2-3 paragraphs providing a rigorous investment analysis.
    Gross cost: $${data.systemCost.toLocaleString()}
    Rebates: $${data.rebateAmount.toLocaleString()}
    Net investment: $${data.netInvestment.toLocaleString()}
    Annual return: $${data.annualSavings.toLocaleString()} (${Math.round(data.annualSavings / data.netInvestment * 100)}% ROI)
    Payback: ${data.paybackYears.toFixed(1)} years
    
    Cover:
    1. Compare this investment to traditional alternatives — term deposits (4-5%), shares (7-10%), property. This system delivers ${Math.round(data.annualSavings / data.netInvestment * 100)}% annual return, tax-free
    2. The accelerating returns — as electricity prices rise 3.5%/year, the savings grow while the investment is fixed
    3. The 20-year cumulative cashflow — when does the system become pure profit, and what's the total lifetime value
    Use <span class="hl-aqua"> for returns/savings and <span class="hl-orange"> for costs.`);
}

export async function narrativeEnvironmentalImpact(data: ProposalData): Promise<string> {
  const ctx = buildDataContext(data);
  return generateNarrative('Environmental Impact', ctx,
    `Write 2-3 paragraphs on the environmental impact of this system.
    Annual CO2 reduction: ${data.co2ReductionTonnes.toFixed(1)} tonnes
    25-year CO2 reduction: ${(data.co2ReductionTonnes * 25).toFixed(0)} tonnes
    Trees equivalent: ${data.treesEquivalent || Math.round(data.co2ReductionTonnes * 45)} per year
    Energy independence: ${data.energyIndependenceScore || 85}%
    
    Cover:
    1. The tangible environmental impact — what ${data.co2ReductionTonnes.toFixed(1)} tonnes of CO2 actually means in real-world terms
    2. Energy independence — moving from 100% grid-dependent to ${data.energyIndependenceScore || 85}% self-sufficient
    3. The broader contribution — how residential solar + battery systems contribute to Australia's renewable energy transition
    Keep the tone authoritative and factual, not preachy.`);
}

export async function narrativeFinalRecommendation(data: ProposalData): Promise<{ financial: string; strategic: string; urgency: string }> {
  const ctx = buildDataContext(data);
  const projectedCost = data.annualCost - data.annualSavings;
  
  const result = await invokeLLM({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `CUSTOMER DATA:\n${ctx}\n\nGenerate the FINAL RECOMMENDATION — the closing executive summary that drives action.

Return JSON:
- "financial": FINANCIAL TRANSFORMATION — 2-3 sentences on the complete financial picture. Reference the transformation from $${data.annualCost}/year to ${projectedCost < 0 ? 'a $' + Math.abs(projectedCost) + ' annual credit' : '$' + projectedCost + '/year'}. This is the headline number.
- "strategic": STRATEGIC CHOICE — 2-3 sentences on why ${data.batteryBrand} + ${data.vppProvider} is the optimal combination. Reference specific technical and financial advantages.
- "urgency": URGENCY — 2-3 sentences on why acting now is critical. Reference rebate availability, rising electricity costs, and seasonal timing.

Each should be compelling, data-driven, and end with a clear implication. Use <b>, <span class="hl-aqua">, <span class="hl-orange"> for emphasis.` }
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
    `Write a brief introductory paragraph (2-3 sentences) for the implementation roadmap. Explain the phased approach — from approval through installation to optimisation — and why this structured timeline ensures the best outcome. Reference the specific system components (${data.panelBrand} panels, ${data.batteryBrand} battery, ${data.vppProvider} VPP activation).`);
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
