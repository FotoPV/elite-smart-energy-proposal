/**
 * Slide Content Markdown Generator
 * 
 * Takes ProposalCalculations + Customer data and produces a comprehensive
 * markdown file for Manus Slides (image mode) rendering.
 * 
 * Each slide is written with strategic, analytical content — professional tone
 * for a HIGH LEVEL OF EDUCATED PUBLICS audience.
 */

import type { Customer, ProposalCalculations, VppComparisonItem } from '../drizzle/schema';
import { BRAND } from '../shared/brand';

interface SlideContentInput {
  customer: Customer;
  calculations: ProposalCalculations;
  proposalTitle?: string;
}

/**
 * Format currency with $ sign and commas
 */
function fmt(n: number | undefined | null, decimals = 0): string {
  if (n == null) return '$0';
  return '$' + n.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format number with commas
 */
function num(n: number | undefined | null, decimals = 0): string {
  if (n == null) return '0';
  return n.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format cents
 */
function cents(n: number | undefined | null): string {
  if (n == null) return '0c';
  return n.toFixed(2) + 'c';
}

/**
 * Generate the complete slide content markdown for Manus Slides (image mode).
 * 
 * The output follows the reference project quality:
 * - Midnight Navy (#0F172A) backgrounds throughout
 * - Strategic, data-driven content (not surface-level)
 * - Each slide tells a story with context and recommendations
 * - Professional tone for educated audience
 */
export function generateSlideContentMarkdown(input: SlideContentInput): string {
  const { customer, calculations: calc, proposalTitle } = input;
  
  const hasGas = customer.hasGas && calc.gasAnnualCost != null && calc.gasAnnualCost > 0;
  const hasPool = customer.hasPool === true;
  const hasEV = customer.hasEV === true || customer.evInterest === 'owns' || customer.evInterest === 'interested';
  const hasExistingSolar = customer.hasExistingSolar === true;
  const gasAppliances = customer.gasAppliances || [];
  const hasHotWater = hasGas && gasAppliances.some(a => a.toLowerCase().includes('hot water'));
  const hasHeating = hasGas && gasAppliances.some(a => a.toLowerCase().includes('heat'));
  const hasCooktop = hasGas && gasAppliances.some(a => a.toLowerCase().includes('cook') || a.toLowerCase().includes('stove'));
  
  const customerName = customer.fullName;
  const customerAddress = customer.address;
  const customerState = customer.state;
  
  // Calculate derived values
  const totalCurrentCost = calc.projectedAnnualCost + (calc.gasAnnualCost || 0);
  const selfConsumptionPercent = hasExistingSolar ? 85 : 0;
  const solarExportPercent = hasExistingSolar && calc.billSolarExportsKwh && calc.billTotalUsageKwh
    ? Math.round((calc.billSolarExportsKwh / (calc.billTotalUsageKwh + calc.billSolarExportsKwh)) * 100)
    : 0;
  const inflationRate = 3.5;
  
  // Build slides array
  const slides: string[] = [];
  let slideNum = 0;
  
  // ================================================================
  // SLIDE 1: COVER PAGE
  // ================================================================
  slideNum++;
  slides.push(`
---
# Slide ${slideNum}: COVER PAGE

## Design
- **Background**: Midnight Navy (#0F172A) with the Elite Smart Energy Solutions cover background image on the right side
- **Logo**: Elite Smart Energy Solutions aqua starburst logo (${BRAND.logo.aqua}) positioned top-left with "ELITE SMART ENERGY SOLUTIONS" text beside it in white
- **Cover background image**: ${BRAND.coverBg}

## Content

### Title (large, white, NextSphere font)
IN-DEPTH BILL ANALYSIS & SOLAR BATTERY PROPOSAL

### Subtitle (smaller, aqua line separator, then white text)
Prepared exclusively for

### Customer Details (white, GeneralSans font)
**${customerName}**
${customerAddress}
${customerState}

### Orange accent bar
A thin horizontal orange (#f36710) bar beneath the customer details

### Aqua separator line
A thin aqua (#00EAD3) horizontal line near the bottom

### Prepared By (small, ash text at bottom)
Prepared by ${BRAND.contact.name} | ${BRAND.contact.company}
${BRAND.contact.phone} | ${BRAND.contact.email}

## Style Notes
- The cover must feel premium and authoritative
- Right side has the background image (solar panels/energy imagery)
- Left side has all text content, left-aligned
- No data tables on this slide — purely branding and identification
`);

  // ================================================================
  // SLIDE 2: EXECUTIVE SUMMARY
  // ================================================================
  slideNum++;
  const execInsight = calc.billSolarExportsKwh && calc.billFeedInTariffCents
    ? `Currently exporting ${num(calc.billSolarExportsKwh)} kWh of solar energy at just ${cents(calc.billFeedInTariffCents)}/kWh — a significant undervaluation of your solar asset that battery storage can capture.`
    : `Your current energy expenditure of ${fmt(totalCurrentCost)} annually presents a substantial optimisation opportunity through strategic battery storage and VPP participation.`;
  
  slides.push(`
---
# Slide ${slideNum}: EXECUTIVE SUMMARY

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner, 60x60px aqua logo
- **Heading**: "EXECUTIVE SUMMARY" in NextSphere font, white, ALL CAPS
- **Subtitle**: "Strategic Overview" in Urbanist Italic, aqua, right-aligned
- **Aqua line separator** beneath heading

## Content Layout: 4 key metric cards in a row, then insight box below

### Key Metrics (4 cards, dark background with thin #333 border)

| Metric | Value | Color |
|--------|-------|-------|
| CURRENT ANNUAL COST | ${fmt(totalCurrentCost)} | Orange (#f36710) |
| RECOMMENDED SYSTEM | ${num(calc.recommendedBatteryKwh, 1)} kWh Battery${calc.recommendedSolarKw ? ' + ' + num(calc.recommendedSolarKw, 1) + 'kW Solar' : ''} | White |
| PROJECTED ANNUAL SAVINGS | ${fmt(calc.totalAnnualSavings)} | Aqua (#00EAD3) |
| PAYBACK PERIOD | ${num(calc.paybackYears, 1)} Years | Aqua (#00EAD3) |

### Key Insight Box (dark grey #1a1a1a background, 4px aqua left border)
${execInsight}

### Summary Text (GeneralSans, white, below the cards)
This proposal presents a comprehensive analysis of your current energy position and a strategic pathway to significantly reduce costs through battery storage${hasGas ? ', gas-to-electric conversion' : ''}, and Virtual Power Plant participation. The recommended solution delivers a strong return on investment while enhancing your energy independence.

## Style Notes
- Metric values should be large (40px+) and color-coded as specified
- Labels above values in Urbanist, 11px, ash, ALL CAPS
- The insight box should stand out with the aqua left border
- Copyright at bottom-left: "${BRAND.contact.copyright}"
`);

  // ================================================================
  // SLIDE 3: CURRENT BILL ANALYSIS
  // ================================================================
  slideNum++;
  const dailyAvg = calc.dailyAverageCost || (calc.projectedAnnualCost / 365);
  slides.push(`
---
# Slide ${slideNum}: CURRENT BILL ANALYSIS

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner
- **Heading**: "CURRENT BILL ANALYSIS" in NextSphere, white
- **Subtitle**: "Rate Structure & Cost Breakdown" in Urbanist Italic, aqua, right-aligned
- **Aqua line separator**

## Content Layout: Left side = bill summary table, Right side = cost breakdown chart

### Bill Summary Table (left 55%)

| Item | Detail |
|------|--------|
| **Retailer** | ${calc.billRetailer || 'Current Retailer'} |
| **Billing Period** | ${calc.billPeriodStart || 'N/A'} to ${calc.billPeriodEnd || 'N/A'} |
| **Billing Days** | ${calc.billDays || 'N/A'} days |
| **Total Bill Amount** | ${fmt(calc.billTotalAmount)} |
| **Daily Average Cost** | ${fmt(dailyAvg, 2)}/day |
| **Total Usage** | ${num(calc.billTotalUsageKwh)} kWh |
| **Daily Average Usage** | ${num(calc.dailyAverageKwh, 1)} kWh/day |

### Tariff Rate Structure Table

| Rate Type | Usage (kWh) | Rate (c/kWh) | Cost |
|-----------|-------------|--------------|------|
| Peak | ${num(calc.billPeakUsageKwh)} | ${cents(calc.billPeakRateCents)} | ${fmt((calc.billPeakUsageKwh || 0) * (calc.billPeakRateCents || 0) / 100)} |
| Off-Peak | ${num(calc.billOffPeakUsageKwh)} | ${cents(calc.billOffPeakRateCents)} | ${fmt((calc.billOffPeakUsageKwh || 0) * (calc.billOffPeakRateCents || 0) / 100)} |
| Shoulder | ${num(calc.billShoulderUsageKwh)} | ${cents(calc.billShoulderRateCents)} | ${fmt((calc.billShoulderUsageKwh || 0) * (calc.billShoulderRateCents || 0) / 100)} |
| **Supply Charge** | — | ${cents(calc.billDailySupplyCharge)}/day | ${fmt((calc.billDailySupplyCharge || 0) * (calc.billDays || 90) / 100)} |
${calc.billSolarExportsKwh ? `| **Solar Feed-in Credit** | ${num(calc.billSolarExportsKwh)} kWh | ${cents(calc.billFeedInTariffCents)}/kWh | -${fmt((calc.billSolarExportsKwh || 0) * (calc.billFeedInTariffCents || 0) / 100)} |` : ''}

### Cost Breakdown Visual (right 40%) — horizontal bar chart
- Usage Charges: largest bar (aqua)
- Supply Charges: medium bar (white)
- Solar Credits: negative bar (aqua, if applicable)
- Net Total: orange bar

### Insight Box (aqua left border)
${calc.billFeedInTariffCents && calc.billFeedInTariffCents < 5 
  ? `Your feed-in tariff of ${cents(calc.billFeedInTariffCents)}/kWh is well below the cost of grid electricity. Every kilowatt-hour exported represents lost value that battery storage would capture at full retail rate.`
  : `Your current rate structure reveals opportunities for cost optimisation through strategic load shifting and battery storage to minimise peak-rate consumption.`}

## Style Notes
- Table headers in Urbanist, aqua, ALL CAPS
- Table values in GeneralSans, white
- Highlight the total row with aqua left border
- Numbers right-aligned in table cells
`);

  // ================================================================
  // SLIDE 4: MONTHLY USAGE ANALYSIS
  // ================================================================
  slideNum++;
  const monthlyKwh = calc.monthlyUsageKwh;
  const winterMultiplier = 1.35;
  const summerMultiplier = 0.75;
  slides.push(`
---
# Slide ${slideNum}: MONTHLY USAGE ANALYSIS

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner
- **Heading**: "MONTHLY USAGE ANALYSIS" in NextSphere, white
- **Subtitle**: "Consumption Pattern & Solar Opportunity" in Urbanist Italic, aqua
- **Aqua line separator**

## Content Layout: Bar chart showing 12-month usage pattern

### Monthly Consumption Chart (full width bar chart)
A bar chart showing estimated monthly consumption across 12 months:

| Month | Usage (kWh) | Type |
|-------|-------------|------|
| Jan | ${num(monthlyKwh * summerMultiplier)} | Summer (low) |
| Feb | ${num(monthlyKwh * summerMultiplier)} | Summer (low) |
| Mar | ${num(monthlyKwh * 0.9)} | Autumn |
| Apr | ${num(monthlyKwh * 1.05)} | Autumn |
| May | ${num(monthlyKwh * 1.2)} | Winter onset |
| Jun | ${num(monthlyKwh * winterMultiplier)} | Winter peak |
| Jul | ${num(monthlyKwh * winterMultiplier)} | Winter peak |
| Aug | ${num(monthlyKwh * 1.25)} | Winter |
| Sep | ${num(monthlyKwh * 1.1)} | Spring |
| Oct | ${num(monthlyKwh * 0.95)} | Spring |
| Nov | ${num(monthlyKwh * 0.85)} | Summer onset |
| Dec | ${num(monthlyKwh * summerMultiplier)} | Summer (low) |

- **Aqua bars** for each month
- **Orange dashed line** showing the annual average (${num(monthlyKwh)} kWh/month)
- **Winter months highlighted** with slightly brighter bars

### Key Statistics (3 cards below chart)

| Metric | Value |
|--------|-------|
| Annual Consumption | ${num(calc.yearlyUsageKwh)} kWh |
| Monthly Average | ${num(monthlyKwh)} kWh |
| Daily Average | ${num(calc.dailyAverageKwh, 1)} kWh |

### Insight Box (aqua left border)
Winter months (June–August) show consumption ${Math.round((winterMultiplier - 1) * 100)}% above the annual average, driven by heating loads. This seasonal variation creates an ideal use case for battery storage — storing excess solar during summer for winter evening consumption, while VPP participation generates income during peak demand events that typically coincide with these high-consumption periods.

## Style Notes
- Bar chart should be visually prominent, taking 60% of slide height
- Each bar labelled with month abbreviation below
- Average line clearly visible with label
`);

  // ================================================================
  // SLIDE 5: YEARLY COST PROJECTION
  // ================================================================
  slideNum++;
  slides.push(`
---
# Slide ${slideNum}: YEARLY COST PROJECTION

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner
- **Heading**: "YEARLY COST PROJECTION" in NextSphere, white
- **Subtitle**: "10-Year Outlook Without Intervention" in Urbanist Italic, aqua
- **Aqua line separator**

## Content Layout: Rising cost chart + cumulative table

### 10-Year Cost Projection Table

| Year | Annual Cost | Cumulative Spend |
|------|------------|-----------------|
| 2026 (Current) | ${fmt(totalCurrentCost)} | ${fmt(totalCurrentCost)} |
| 2027 | ${fmt(totalCurrentCost * 1.035)} | ${fmt(totalCurrentCost * 2.035)} |
| 2028 | ${fmt(totalCurrentCost * 1.035 * 1.035)} | ${fmt(totalCurrentCost * (1 + 1.035 + 1.035 * 1.035))} |
| 2029 | ${fmt(totalCurrentCost * Math.pow(1.035, 3))} | — |
| 2030 | ${fmt(totalCurrentCost * Math.pow(1.035, 4))} | — |
| 2031 | ${fmt(totalCurrentCost * Math.pow(1.035, 5))} | — |
| 2032 | ${fmt(totalCurrentCost * Math.pow(1.035, 6))} | — |
| 2033 | ${fmt(totalCurrentCost * Math.pow(1.035, 7))} | — |
| 2034 | ${fmt(totalCurrentCost * Math.pow(1.035, 8))} | — |
| 2035 | ${fmt(totalCurrentCost * Math.pow(1.035, 9))} | — |

### Visual: Rising bar chart showing escalating costs
- Bars grow taller each year (orange bars)
- A horizontal aqua dashed line showing "with solar + battery" flat cost
- The gap between the two lines represents cumulative savings

### Key Metrics (2 cards)

| Metric | Value | Color |
|--------|-------|-------|
| 10-YEAR COST (NO ACTION) | ${fmt(Array.from({length: 10}, (_, i) => totalCurrentCost * Math.pow(1.035, i)).reduce((a, b) => a + b, 0))} | Orange |
| 10-YEAR SAVINGS (WITH SYSTEM) | ${fmt(calc.tenYearSavings || calc.totalAnnualSavings * 10)} | Aqua |

### Insight Box (orange left border — warning tone)
At the current ${inflationRate}% annual electricity price inflation, your energy costs will increase by ${Math.round((Math.pow(1.035, 10) - 1) * 100)}% over the next decade. Without intervention, the cumulative expenditure represents a significant financial commitment that could be substantially reduced through strategic investment in battery storage and energy optimisation.

## Style Notes
- The escalating bars should create a visual sense of urgency
- Orange colour for the "without action" scenario
- Aqua for the "with system" comparison line
`);

  // ================================================================
  // SLIDE 6: GAS FOOTPRINT (Conditional)
  // ================================================================
  if (hasGas) {
    slideNum++;
    slides.push(`
---
# Slide ${slideNum}: CURRENT GAS FOOTPRINT

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner
- **Heading**: "CURRENT GAS FOOTPRINT" in NextSphere, white
- **Subtitle**: "Gas Consumption & Conversion Analysis" in Urbanist Italic, aqua
- **Aqua line separator**

## Content Layout: Gas bill breakdown + conversion analysis

### Gas Bill Summary Table

| Item | Detail |
|------|--------|
| **Gas Retailer** | ${calc.gasBillRetailer || 'Current Gas Retailer'} |
| **Billing Period** | ${calc.gasBillPeriodStart || 'N/A'} to ${calc.gasBillPeriodEnd || 'N/A'} |
| **Billing Days** | ${calc.gasBillDays || 'N/A'} days |
| **Total Gas Bill** | ${fmt(calc.gasBillTotalAmount)} |
| **Gas Usage** | ${num(calc.gasBillUsageMj)} MJ |
| **Gas Rate** | ${cents(calc.gasBillRateCentsMj)}/MJ |
| **Daily Supply Charge** | ${cents(calc.gasBillDailySupplyCharge)}/day |

### Gas-to-Electric Conversion

| Metric | Value |
|--------|-------|
| Gas Usage (MJ) | ${num(calc.gasBillUsageMj)} MJ |
| Equivalent Electricity (kWh) | ${num(calc.gasKwhEquivalent)} kWh |
| Annual Gas Cost | ${fmt(calc.gasAnnualCost)} |
| Annual Gas Supply Charge | ${fmt(calc.gasAnnualSupplyCharge)} |
| CO₂ Emissions from Gas | ${num(calc.gasCo2Emissions, 1)} tonnes/year |

### Gas Appliance Breakdown
${gasAppliances.map(a => `- ${a}`).join('\n')}

### Insight Box (orange left border)
Your gas connection costs ${fmt(calc.gasAnnualCost)} annually, with ${fmt(calc.gasAnnualSupplyCharge)} in supply charges alone — a fixed cost regardless of usage. Full electrification eliminates both the gas consumption cost and the daily supply charge, while modern heat pump technology delivers the same heating output at approximately one-third the energy cost.

## Style Notes
- Conversion arrow visual: MJ → kWh with efficiency factor shown
- Gas appliances shown as icon-style list
`);
  }

  // ================================================================
  // SLIDE 7: GAS APPLIANCE INVENTORY (Conditional)
  // ================================================================
  if (hasGas && gasAppliances.length > 0) {
    slideNum++;
    slides.push(`
---
# Slide ${slideNum}: GAS APPLIANCE INVENTORY

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner
- **Heading**: "GAS APPLIANCE INVENTORY" in NextSphere, white
- **Subtitle**: "Electrification Opportunity Assessment" in Urbanist Italic, aqua
- **Aqua line separator**

## Content Layout: Table showing each gas appliance with replacement recommendation

### Appliance Replacement Table

| Current Gas Appliance | Electric Replacement | Est. Annual Gas Cost | Est. Electric Cost | Annual Saving |
|----------------------|---------------------|---------------------|-------------------|--------------|
${hasHotWater ? `| Gas Hot Water | Heat Pump Hot Water (COP 3.5) | ${fmt(calc.hotWaterCurrentGasCost)} | ${fmt(calc.hotWaterHeatPumpCost)} | ${fmt(calc.hotWaterSavings)} |` : ''}
${hasHeating ? `| Gas Ducted Heating | Reverse Cycle AC (COP 4.0) | ${fmt(calc.heatingCurrentGasCost)} | ${fmt(calc.heatingRcAcCost)} | ${fmt(calc.heatingCoolingSavings)} |` : ''}
${hasCooktop ? `| Gas Cooktop | Induction Cooktop | ${fmt(calc.cookingCurrentGasCost)} | ${fmt(calc.cookingInductionCost)} | ${fmt(calc.cookingSavings)} |` : ''}

### Total Electrification Summary

| Metric | Value | Color |
|--------|-------|-------|
| TOTAL GAS COST ELIMINATED | ${fmt(calc.gasAnnualCost)} | Orange |
| TOTAL ELECTRIC REPLACEMENT COST | ${fmt((calc.hotWaterHeatPumpCost || 0) + (calc.heatingRcAcCost || 0) + (calc.cookingInductionCost || 0))} | White |
| NET ANNUAL SAVING | ${fmt((calc.hotWaterSavings || 0) + (calc.heatingCoolingSavings || 0) + (calc.cookingSavings || 0))} | Aqua |
| GAS SUPPLY CHARGE ELIMINATED | ${fmt(calc.gasAnnualSupplyCharge)} | Aqua |

### Insight Box (aqua left border)
Full electrification of your gas appliances eliminates the ${fmt(calc.gasAnnualSupplyCharge)}/year gas supply charge — a fixed cost you pay regardless of usage. Combined with the efficiency gains of heat pump technology (COP 3.5–4.0 vs gas efficiency of ~0.85), the total annual benefit significantly exceeds the running cost of electric alternatives.

## Style Notes
- Each appliance row should have a subtle icon
- Savings column highlighted in aqua
- The "Gas Supply Charge Eliminated" is a bonus saving often overlooked — highlight it
`);
  }

  // ================================================================
  // SLIDE 8: STRATEGIC ASSESSMENT
  // ================================================================
  slideNum++;
  slides.push(`
---
# Slide ${slideNum}: STRATEGIC ASSESSMENT

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner
- **Heading**: "STRATEGIC ASSESSMENT" in NextSphere, white
- **Subtitle**: "Opportunity Analysis" in Urbanist Italic, aqua
- **Aqua line separator**

## Content Layout: 3 strategic insight cards stacked vertically

### Strategic Insight 1: ${hasExistingSolar ? 'Underutilised Solar Asset' : 'Solar Opportunity'}
**Card** (dark bg, aqua left border)
${hasExistingSolar && solarExportPercent > 0
  ? `Your existing ${num(Number(customer.existingSolarSize), 1)}kW solar system is currently exporting approximately ${solarExportPercent}% of its generation back to the grid at just ${cents(calc.billFeedInTariffCents)}/kWh. This represents a significant undervaluation of your solar investment. Battery storage would capture this exported energy at the full retail rate of ${cents(calc.billPeakRateCents)}/kWh — a ${num((calc.billPeakRateCents || 30) / (calc.billFeedInTariffCents || 5), 1)}x value multiplier.`
  : `With ${num(calc.yearlyUsageKwh)} kWh of annual consumption, a solar system would offset a significant portion of your grid dependency. Combined with battery storage, self-consumption rates of 80-85% are achievable, dramatically reducing your energy costs.`}

### Strategic Insight 2: Feed-in Tariff Erosion
**Card** (dark bg, orange left border)
Feed-in tariffs across ${customerState} have been declining steadily and are projected to continue falling as rooftop solar penetration increases. ${calc.billFeedInTariffCents ? `Your current rate of ${cents(calc.billFeedInTariffCents)}/kWh` : 'Current feed-in rates'} will likely decrease further, making self-consumption through battery storage increasingly valuable. Acting now locks in the maximum benefit from your solar generation.

### Strategic Insight 3: VPP Revenue Opportunity
**Card** (dark bg, aqua left border)
Virtual Power Plant programs offer a compelling additional revenue stream. By allowing controlled discharge during grid peak events, your battery can earn ${fmt(calc.vppAnnualValue || 400)}+ annually while maintaining sufficient reserve for household needs. This transforms your battery from a cost-saving device into an income-generating asset.

## Style Notes
- Each card should be substantial (roughly 1/3 of content area)
- Aqua borders for opportunities, orange for risks/warnings
- Strategic language — this slide sets the narrative for the rest of the proposal
`);

  // ================================================================
  // SLIDE 9: RECOMMENDED BATTERY SIZE
  // ================================================================
  slideNum++;
  slides.push(`
---
# Slide ${slideNum}: RECOMMENDED BATTERY SIZE

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner
- **Heading**: "RECOMMENDED BATTERY SIZE" in NextSphere, white
- **Subtitle**: "Sizing Analysis & Specification" in Urbanist Italic, aqua
- **Aqua line separator**

## Content Layout: Battery spec card + sizing breakdown

### Recommended Battery (large feature card, aqua border)

| Specification | Detail |
|--------------|--------|
| **Model** | ${calc.batteryProduct || 'Sigenergy SigenStor'} |
| **Capacity** | ${num(calc.recommendedBatteryKwh, 1)} kWh |
| **Estimated Cost** | ${fmt(calc.batteryEstimatedCost)} |
| **Battery Rebate** | -${fmt(calc.batteryRebateAmount)} |
| **Net Cost** | ${fmt((calc.batteryEstimatedCost || 0) - (calc.batteryRebateAmount || 0))} |

### Sizing Breakdown (how the battery size was determined)

| Component | kWh Required |
|-----------|-------------|
| Overnight household consumption (6pm–6am) | ${num(calc.dailyAverageKwh * 0.55, 1)} kWh |
| Morning peak coverage (6am–9am) | ${num(calc.dailyAverageKwh * 0.15, 1)} kWh |
| VPP reserve allocation | ${num(calc.recommendedBatteryKwh * 0.2, 1)} kWh |
| Buffer for degradation (10%) | ${num(calc.recommendedBatteryKwh * 0.1, 1)} kWh |
| **Total Recommended** | **${num(calc.recommendedBatteryKwh, 1)} kWh** |

### Insight Box (aqua left border)
The ${num(calc.recommendedBatteryKwh, 1)} kWh battery is sized to cover your overnight consumption while maintaining a 20% reserve for VPP trading events. This balanced approach maximises both self-consumption savings and VPP income, delivering the optimal return on investment for your usage profile.

## Style Notes
- Battery model name should be prominent
- Sizing breakdown should use a visual stacked bar showing each component
- The net cost (after rebate) should be highlighted in aqua
`);

  // ================================================================
  // SLIDE 10: SOLAR SYSTEM
  // ================================================================
  slideNum++;
  slides.push(`
---
# Slide ${slideNum}: ${hasExistingSolar ? 'EXISTING SOLAR ASSESSMENT' : 'PROPOSED SOLAR PV SYSTEM'}

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner
- **Heading**: "${hasExistingSolar ? 'EXISTING SOLAR ASSESSMENT' : 'PROPOSED SOLAR PV SYSTEM'}" in NextSphere, white
- **Subtitle**: "${hasExistingSolar ? 'Performance Review & Battery Impact' : 'System Specification & Generation'}" in Urbanist Italic, aqua
- **Aqua line separator**

## Content

${hasExistingSolar ? `
### Current Solar System

| Specification | Detail |
|--------------|--------|
| System Size | ${num(Number(customer.existingSolarSize), 1)} kW |
| System Age | ${customer.existingSolarAge || 'N/A'} years |
| Est. Annual Generation | ${num(calc.solarAnnualGeneration)} kWh |
| Current Self-Consumption | ~${100 - solarExportPercent}% |
| Current Export Rate | ${solarExportPercent}% |
| Feed-in Tariff | ${cents(calc.billFeedInTariffCents)}/kWh |

### With Battery Storage (projected improvement)

| Metric | Before Battery | After Battery | Improvement |
|--------|---------------|--------------|-------------|
| Self-Consumption | ${100 - solarExportPercent}% | ~${selfConsumptionPercent}% | +${selfConsumptionPercent - (100 - solarExportPercent)}% |
| Grid Dependency | High | Minimal | Significant |
| Export Value | ${cents(calc.billFeedInTariffCents)}/kWh | Captured at retail rate | ${num((calc.billPeakRateCents || 30) / (calc.billFeedInTariffCents || 5), 1)}x value |

### Insight Box (aqua left border)
Adding battery storage to your existing ${num(Number(customer.existingSolarSize), 1)}kW system transforms its economics. Instead of exporting ${solarExportPercent}% of generation at ${cents(calc.billFeedInTariffCents)}/kWh, the battery captures this energy for self-consumption at the full retail rate — effectively multiplying the value of every exported kilowatt-hour by ${num((calc.billPeakRateCents || 30) / (calc.billFeedInTariffCents || 5), 1)}x.
` : `
### Proposed Solar System

| Specification | Detail |
|--------------|--------|
| System Size | ${num(calc.recommendedSolarKw, 1)} kW |
| Panel Count | ${calc.solarPanelCount || Math.ceil((calc.recommendedSolarKw || 6.6) / 0.5)} panels |
| Est. Annual Generation | ${num(calc.solarAnnualGeneration)} kWh |
| Estimated Cost | ${fmt(calc.solarEstimatedCost)} |
| Solar Rebate (STC) | -${fmt(calc.solarRebateAmount)} |
| Net Cost | ${fmt((calc.solarEstimatedCost || 0) - (calc.solarRebateAmount || 0))} |

### Insight Box (aqua left border)
The ${num(calc.recommendedSolarKw, 1)}kW system is sized to generate approximately ${num(calc.solarAnnualGeneration)} kWh annually, covering ${num(((calc.solarAnnualGeneration || 0) / calc.yearlyUsageKwh) * 100)}% of your current consumption. Combined with battery storage, self-consumption rates of 80-85% are achievable.
`}

## Style Notes
- If existing solar: show before/after comparison prominently
- The value multiplier (e.g., "6.5x") should be a large aqua number
`);

  // ================================================================
  // SLIDE 11: VPP PROVIDER COMPARISON
  // ================================================================
  slideNum++;
  const vppComparison = calc.vppProviderComparison || [];
  slides.push(`
---
# Slide ${slideNum}: VPP PROVIDER COMPARISON

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner
- **Heading**: "VPP PROVIDER COMPARISON" in NextSphere, white
- **Subtitle**: "${customerState} Market Analysis" in Urbanist Italic, aqua
- **Aqua line separator**

## Content Layout: Full-width comparison table

### VPP Provider Comparison Table

| Provider | Program | Gas Bundle | Est. Annual Value | Strategic Fit |
|----------|---------|-----------|-------------------|--------------|
${vppComparison.length > 0 
  ? vppComparison.map((v: VppComparisonItem) => `| ${v.provider} | ${v.programName} | ${v.hasGasBundle ? 'Yes' : 'No'} | ${fmt(v.estimatedAnnualValue)} | ${v.strategicFit.charAt(0).toUpperCase() + v.strategicFit.slice(1)} |`).join('\n')
  : `| AGL | Bring Your Own Battery | Yes | $400 | Good |
| Origin Energy | Origin Battery Lite | Yes | $380 | Good |
| Amber Electric | SmartShift | No | $450 | Excellent |
| Energy Locals | Battery Local | No | $350 | Good |
| Powershop | Battery Boost | No | $320 | Moderate |
| Red Energy | Battery Credits | No | $300 | Moderate |`}

### Recommendation Highlight
The top-ranked provider row should have an aqua left border and slightly brighter background (rgba(0,234,211,0.08))

${hasGas ? `### Gas Bundle Note (orange left border card)
Providers with gas bundling capability offer additional discounts when you maintain both electricity and gas accounts during the transition period. This can provide ${fmt(calc.vppBundleDiscount || 50)}+ in additional annual savings.` : ''}

## Style Notes
- Table should be the primary visual element
- "Strategic Fit" column uses color coding: Excellent=Aqua, Good=White, Moderate=Ash
- Recommended provider row highlighted
`);

  // ================================================================
  // SLIDE 12: VPP RECOMMENDATION
  // ================================================================
  slideNum++;
  slides.push(`
---
# Slide ${slideNum}: VPP RECOMMENDATION

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner
- **Heading**: "VPP RECOMMENDATION" in NextSphere, white
- **Subtitle**: "Recommended Program Analysis" in Urbanist Italic, aqua
- **Aqua line separator**

## Content Layout: Featured provider card + value breakdown

### Recommended VPP Provider (large feature card, aqua border)
**${calc.selectedVppProvider || 'Top Recommended Provider'}**

### Annual Value Breakdown

| Income Stream | Annual Value |
|--------------|-------------|
| Daily Battery Credits | ${fmt(calc.vppDailyCreditAnnual)} |
| Peak Event Payments | ${fmt(calc.vppEventPaymentsAnnual)} |
${calc.vppBundleDiscount ? `| Gas Bundle Discount | ${fmt(calc.vppBundleDiscount)} |` : ''}
| **Total Annual VPP Income** | **${fmt(calc.vppAnnualValue)}** |

### How It Works (3 step cards)
1. **ENROL** — Register your battery with the VPP program (no cost, no lock-in)
2. **EARN** — Receive daily credits and event payments when the grid needs support
3. **CONTROL** — Set your minimum battery reserve to ensure household needs are always met

### Insight Box (aqua left border)
VPP participation transforms your battery from a passive storage device into an active income-generating asset. The ${calc.selectedVppProvider || 'recommended program'} offers the optimal balance of guaranteed daily credits and event-based payments, with an estimated annual return of ${fmt(calc.vppAnnualValue)} — effectively reducing your battery payback period by ${num((calc.vppAnnualValue || 400) / ((calc.batteryEstimatedCost || 10000) / calc.paybackYears), 1)} years.

## Style Notes
- Provider name should be large and prominent
- Value breakdown as horizontal bars (aqua)
- The 3-step process should be clean and visual
`);

  // ================================================================
  // CONDITIONAL ELECTRIFICATION SLIDES (13-15)
  // ================================================================
  if (hasHotWater) {
    slideNum++;
    slides.push(`
---
# Slide ${slideNum}: HOT WATER ELECTRIFICATION

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner
- **Heading**: "HOT WATER ELECTRIFICATION" in NextSphere, white
- **Subtitle**: "Heat Pump Conversion Analysis" in Urbanist Italic, aqua
- **Aqua line separator**

## Content: Before/After comparison

### Cost Comparison

| Metric | Gas Hot Water | Heat Pump (COP 3.5) |
|--------|-------------|---------------------|
| Annual Energy Cost | ${fmt(calc.hotWaterCurrentGasCost)} | ${fmt(calc.hotWaterHeatPumpCost)} |
| Daily Supply Charge | ${fmt(calc.hotWaterDailySupplySaved, 2)}/day | Eliminated |
| Annual Saving | — | ${fmt(calc.hotWaterSavings)} |
| Rebate Available | — | ${fmt(calc.heatPumpHwRebateAmount)} |

### Insight Box
A heat pump hot water system operates at a Coefficient of Performance (COP) of 3.5, meaning it produces 3.5 kWh of heat for every 1 kWh of electricity consumed. This is approximately 4x more efficient than gas hot water, delivering the same comfort at a fraction of the cost.
`);
  }

  if (hasHeating) {
    slideNum++;
    slides.push(`
---
# Slide ${slideNum}: HEATING & COOLING UPGRADE

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner
- **Heading**: "HEATING & COOLING UPGRADE" in NextSphere, white
- **Subtitle**: "Reverse Cycle AC Analysis" in Urbanist Italic, aqua
- **Aqua line separator**

## Content: Before/After comparison

### Cost Comparison

| Metric | Gas Ducted Heating | Reverse Cycle AC (COP 4.0) |
|--------|-------------------|---------------------------|
| Annual Heating Cost | ${fmt(calc.heatingCurrentGasCost)} | ${fmt(calc.heatingRcAcCost)} |
| Cooling Capability | None (separate unit) | Included |
| Annual Saving | — | ${fmt(calc.heatingCoolingSavings)} |
| Rebate Available | — | ${fmt(calc.heatPumpAcRebateAmount)} |

### Insight Box
Modern reverse cycle air conditioning delivers both heating and cooling at a COP of 4.0 — producing 4 kWh of heating for every 1 kWh of electricity. This replaces both your gas heater and any existing cooling system with a single, highly efficient solution.
`);
  }

  if (hasCooktop) {
    slideNum++;
    slides.push(`
---
# Slide ${slideNum}: INDUCTION COOKING UPGRADE

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner
- **Heading**: "INDUCTION COOKING UPGRADE" in NextSphere, white
- **Subtitle**: "Gas to Induction Analysis" in Urbanist Italic, aqua
- **Aqua line separator**

## Content

### Cost Comparison

| Metric | Gas Cooktop | Induction Cooktop |
|--------|-----------|------------------|
| Annual Energy Cost | ${fmt(calc.cookingCurrentGasCost)} | ${fmt(calc.cookingInductionCost)} |
| Annual Saving | — | ${fmt(calc.cookingSavings)} |
| Energy Efficiency | ~40% | ~90% |

### Insight Box
Induction cooking is approximately 90% energy efficient compared to 40% for gas, meaning more energy goes into heating your food rather than heating your kitchen. The faster heating, precise temperature control, and improved indoor air quality make induction the superior choice for modern kitchens.
`);
  }

  // ================================================================
  // SLIDE: EV ANALYSIS (Conditional)
  // ================================================================
  if (hasEV) {
    slideNum++;
    slides.push(`
---
# Slide ${slideNum}: EV CHARGING ANALYSIS

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner
- **Heading**: "EV CHARGING ANALYSIS" in NextSphere, white
- **Subtitle**: "Petrol vs Electric Cost Comparison" in Urbanist Italic, aqua
- **Aqua line separator**

## Content

### Annual Driving Cost Comparison

| Metric | Petrol Vehicle | EV (Grid Charging) | EV (Solar Charging) |
|--------|---------------|-------------------|-------------------|
| Annual km | ${num(calc.evKmPerYear)} | ${num(calc.evKmPerYear)} | ${num(calc.evKmPerYear)} |
| Cost per 100km | ${fmt((calc.evPetrolPricePerLitre || 1.85) * 8, 2)} | ${fmt((calc.evConsumptionPer100km || 15) * (calc.billPeakRateCents || 30) / 100, 2)} | ${fmt((calc.evConsumptionPer100km || 15) * (calc.billFeedInTariffCents || 5) / 100, 2)} |
| Annual Fuel Cost | ${fmt(calc.evPetrolCost)} | ${fmt(calc.evGridChargeCost)} | ${fmt(calc.evSolarChargeCost)} |
| **Annual Saving vs Petrol** | — | ${fmt((calc.evPetrolCost || 0) - (calc.evGridChargeCost || 0))} | ${fmt(calc.evAnnualSavings)} |

### Insight Box (aqua left border)
Charging your EV from solar during the day effectively costs just ${cents(calc.billFeedInTariffCents)}/kWh (the opportunity cost of feed-in), compared to ${fmt((calc.evPetrolPricePerLitre || 1.85), 2)}/L for petrol. Over ${num(calc.evKmPerYear)} km annually, this translates to ${fmt(calc.evAnnualSavings)} in fuel savings — one of the most compelling financial benefits of combining solar, battery, and EV ownership.
`);
  }

  // ================================================================
  // SLIDE: POOL HEAT PUMP (Conditional)
  // ================================================================
  if (hasPool) {
    slideNum++;
    slides.push(`
---
# Slide ${slideNum}: POOL HEAT PUMP

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner
- **Heading**: "POOL HEAT PUMP" in NextSphere, white
- **Subtitle**: "Efficient Pool Heating Solution" in Urbanist Italic, aqua
- **Aqua line separator**

## Content

### Recommended System

| Specification | Detail |
|--------------|--------|
| Recommended Size | ${num(calc.poolRecommendedKw)} kW |
| Pool Volume | ${num(customer.poolVolume)} L |
| Annual Operating Cost | ${fmt(calc.poolAnnualOperatingCost)} |
| Annual Saving vs Gas | ${fmt(calc.poolHeatPumpSavings)} |

### Insight Box
A ${num(calc.poolRecommendedKw)} kW pool heat pump extends your swimming season by 4-6 months while operating at a fraction of the cost of gas pool heating. When powered by excess solar generation, the effective running cost approaches zero.
`);
  }

  // ================================================================
  // SLIDE: FULL ELECTRIFICATION INVESTMENT (Conditional)
  // ================================================================
  if (hasGas) {
    slideNum++;
    slides.push(`
---
# Slide ${slideNum}: FULL ELECTRIFICATION INVESTMENT

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner
- **Heading**: "FULL ELECTRIFICATION INVESTMENT" in NextSphere, white
- **Subtitle**: "Complete Gas Elimination Pathway" in Urbanist Italic, aqua
- **Aqua line separator**

## Content: Investment breakdown table

### Investment Summary

| Component | Gross Cost | Rebate | Net Cost |
|-----------|-----------|--------|---------|
${hasHotWater ? `| Heat Pump Hot Water | ${fmt(calc.investmentHeatPumpHw)} | -${fmt(calc.heatPumpHwRebateAmount)} | ${fmt((calc.investmentHeatPumpHw || 0) - (calc.heatPumpHwRebateAmount || 0))} |` : ''}
${hasHeating ? `| Reverse Cycle AC | ${fmt(calc.investmentRcAc)} | -${fmt(calc.heatPumpAcRebateAmount)} | ${fmt((calc.investmentRcAc || 0) - (calc.heatPumpAcRebateAmount || 0))} |` : ''}
${hasCooktop ? `| Induction Cooktop | ${fmt(calc.investmentInduction)} | — | ${fmt(calc.investmentInduction)} |` : ''}
| **Total Electrification** | ${fmt((calc.investmentHeatPumpHw || 0) + (calc.investmentRcAc || 0) + (calc.investmentInduction || 0))} | -${fmt((calc.heatPumpHwRebateAmount || 0) + (calc.heatPumpAcRebateAmount || 0))} | ${fmt((calc.investmentHeatPumpHw || 0) + (calc.investmentRcAc || 0) + (calc.investmentInduction || 0) - (calc.heatPumpHwRebateAmount || 0) - (calc.heatPumpAcRebateAmount || 0))} |

### Annual Benefit

| Benefit | Amount |
|---------|--------|
| Gas consumption eliminated | ${fmt(calc.gasAnnualCost)} |
| Gas supply charge eliminated | ${fmt(calc.gasAnnualSupplyCharge)} |
| **Total annual benefit** | **${fmt((calc.gasAnnualCost || 0))}** |

### Insight Box (aqua left border)
Full electrification eliminates your entire gas bill — both consumption and the ${fmt(calc.gasAnnualSupplyCharge)}/year supply charge. The combined annual saving of ${fmt(calc.gasAnnualCost)} delivers a rapid payback on the electrification investment, while improving comfort, air quality, and property value.
`);
  }

  // ================================================================
  // SLIDE: TOTAL SAVINGS SUMMARY
  // ================================================================
  slideNum++;
  slides.push(`
---
# Slide ${slideNum}: TOTAL SAVINGS SUMMARY

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner
- **Heading**: "TOTAL SAVINGS SUMMARY" in NextSphere, white
- **Subtitle**: "Annual Impact Analysis" in Urbanist Italic, aqua
- **Aqua line separator**

## Content Layout: Before/After visual comparison + savings breakdown

### Current vs Projected Comparison (large visual)

| | Current Annual Cost | Projected Annual Cost | Annual Saving |
|--|--------------------|--------------------|--------------|
| **Electricity** | ${fmt(calc.projectedAnnualCost)} | ${fmt(calc.projectedAnnualCost - calc.totalAnnualSavings + (calc.gasAnnualCost || 0))} | ${fmt(calc.totalAnnualSavings - (calc.gasAnnualCost || 0))} |
${hasGas ? `| **Gas** | ${fmt(calc.gasAnnualCost)} | $0 (eliminated) | ${fmt(calc.gasAnnualCost)} |` : ''}
| **VPP Income** | $0 | +${fmt(calc.vppAnnualValue)} | ${fmt(calc.vppAnnualValue)} |
| **TOTAL** | **${fmt(totalCurrentCost)}** | **${fmt(totalCurrentCost - calc.totalAnnualSavings)}** | **${fmt(calc.totalAnnualSavings)}** |

### Savings Breakdown (horizontal bar chart)
- Battery self-consumption savings (aqua bar)
- VPP income (aqua bar)
${hasGas ? '- Gas elimination savings (aqua bar)' : ''}
${hasEV ? '- EV fuel savings (aqua bar)' : ''}

### Key Metric (large, centred)
**${fmt(calc.totalAnnualSavings)}** ANNUAL SAVINGS (large aqua number, 56px)

## Style Notes
- The before/after should be a dramatic visual comparison
- Current cost in orange, projected in aqua
- The total savings number should be the hero element
`);

  // ================================================================
  // SLIDE: FINANCIAL SUMMARY & PAYBACK
  // ================================================================
  slideNum++;
  slides.push(`
---
# Slide ${slideNum}: FINANCIAL SUMMARY & PAYBACK

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner
- **Heading**: "FINANCIAL SUMMARY & PAYBACK" in NextSphere, white
- **Subtitle**: "Investment Analysis & Return" in Urbanist Italic, aqua
- **Aqua line separator**

## Content Layout: Investment table + ROI metrics + payback chart

### Investment Breakdown

| Component | Cost |
|-----------|------|
| Battery System (${num(calc.recommendedBatteryKwh, 1)} kWh) | ${fmt(calc.investmentBattery || calc.batteryEstimatedCost)} |
${!hasExistingSolar && calc.investmentSolar ? `| Solar PV System (${num(calc.recommendedSolarKw, 1)} kW) | ${fmt(calc.investmentSolar)} |` : ''}
${hasHotWater ? `| Heat Pump Hot Water | ${fmt(calc.investmentHeatPumpHw)} |` : ''}
${hasHeating ? `| Reverse Cycle AC | ${fmt(calc.investmentRcAc)} |` : ''}
${hasCooktop ? `| Induction Cooktop | ${fmt(calc.investmentInduction)} |` : ''}
${hasEV ? `| EV Charger | ${fmt(calc.investmentEvCharger)} |` : ''}
${hasPool ? `| Pool Heat Pump | ${fmt(calc.investmentPoolHeatPump)} |` : ''}
| **Gross Investment** | **${fmt(calc.totalInvestment)}** |
| Less: Rebates & Incentives | -${fmt(calc.totalRebates)} |
| **Net Investment** | **${fmt(calc.netInvestment)}** |

### Return on Investment (3 key metric cards)

| Metric | Value | Color |
|--------|-------|-------|
| PAYBACK PERIOD | ${num(calc.paybackYears, 1)} years | Aqua |
| 10-YEAR NET RETURN | ${fmt(calc.tenYearSavings)} | Aqua |
| 25-YEAR NET RETURN | ${fmt(calc.twentyFiveYearSavings)} | Aqua |

### Payback Timeline Visual
A horizontal timeline bar showing:
- Year 0: Investment (orange)
- Year ${num(calc.paybackYears, 1)}: Breakeven point (white marker)
- Year 10: Cumulative return (aqua)
- Year 25: Total lifetime return (aqua)

### Insight Box (aqua left border)
With a net investment of ${fmt(calc.netInvestment)} after rebates and a ${num(calc.paybackYears, 1)}-year payback period, this system delivers a strong financial return. By year 10, the cumulative savings of ${fmt(calc.tenYearSavings)} represent a ${num(((calc.tenYearSavings || 0) / calc.netInvestment) * 100)}% return on investment — significantly outperforming traditional investment alternatives.

## Style Notes
- Net investment should be prominent
- Payback period is the hero metric
- The timeline visual should clearly show the breakeven point
`);

  // ================================================================
  // SLIDE: ENVIRONMENTAL IMPACT
  // ================================================================
  slideNum++;
  const treesEquivalent = Math.round((calc.co2ReductionTonnes || 3.5) * 45);
  slides.push(`
---
# Slide ${slideNum}: ENVIRONMENTAL IMPACT

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner
- **Heading**: "ENVIRONMENTAL IMPACT" in NextSphere, white
- **Subtitle**: "Carbon Reduction & Sustainability" in Urbanist Italic, aqua
- **Aqua line separator**

## Content Layout: 3 large metric cards + context

### Environmental Metrics (3 large cards)

| Metric | Value | Visual |
|--------|-------|--------|
| CO₂ REDUCTION | ${num(calc.co2ReductionTonnes, 1)} tonnes/year | Large aqua number |
| TREES EQUIVALENT | ${num(treesEquivalent)} trees planted | Large aqua number |
| ENERGY INDEPENDENCE | ${num(calc.co2ReductionPercent || 75)}% | Large aqua number with circular progress |

### Detailed Breakdown

| Metric | Current | Projected | Reduction |
|--------|---------|-----------|-----------|
| Annual CO₂ Emissions | ${num(calc.co2CurrentTonnes, 1)} t | ${num(calc.co2ProjectedTonnes, 1)} t | ${num(calc.co2ReductionTonnes, 1)} t (${num(calc.co2ReductionPercent)}%) |
| Grid Dependency | 100% | ~${100 - (calc.co2ReductionPercent || 75)}% | ${num(calc.co2ReductionPercent || 75)}% reduction |

### Insight Box (aqua left border)
By reducing your carbon footprint by ${num(calc.co2ReductionTonnes, 1)} tonnes annually, your household's environmental impact is equivalent to planting ${num(treesEquivalent)} trees every year. This positions your property as an active contributor to Australia's renewable energy transition while delivering tangible financial returns.

## Style Notes
- Environmental metrics should feel impactful — large numbers, clean design
- Use a subtle green tint on the aqua for environmental context (still aqua, not green)
- The trees equivalent is a powerful visual metaphor — consider a subtle tree icon
`);

  // ================================================================
  // SLIDE: RECOMMENDED ROADMAP
  // ================================================================
  slideNum++;
  slides.push(`
---
# Slide ${slideNum}: RECOMMENDED ROADMAP

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner
- **Heading**: "RECOMMENDED ROADMAP" in NextSphere, white
- **Subtitle**: "Implementation Timeline" in Urbanist Italic, aqua
- **Aqua line separator**

## Content Layout: 4-phase horizontal timeline

### Phase 1: IMMEDIATE (Week 1-2)
**Card with aqua left border**
- Submit rebate applications (battery${hasGas ? ', heat pump' : ''})
- Confirm VPP provider selection
- Finalise system specifications and quotes
- Schedule installation dates

### Phase 2: INSTALLATION (Week 3-6)
**Card with aqua left border**
- Battery system installation and commissioning
${hasGas ? '- Heat pump hot water installation' : ''}
${hasHeating ? '- Reverse cycle AC installation' : ''}
- Smart meter upgrade (if required)
- VPP enrolment and activation

### Phase 3: OPTIMISATION (Month 2-3)
**Card with aqua left border**
- Monitor system performance and adjust settings
- Optimise battery charge/discharge schedule
- Verify VPP participation and income
- Fine-tune self-consumption patterns

### Phase 4: ONGOING REVIEW (Quarterly)
**Card with aqua left border**
- Quarterly performance review with Elite Smart Energy Solutions
- Annual tariff and VPP market review
- System health monitoring
- Identify further optimisation opportunities

## Style Notes
- Timeline should flow left to right with connecting lines
- Each phase is a card with clear timeframe
- Aqua accent on phase numbers/icons
`);

  // ================================================================
  // SLIDE: CONCLUSION
  // ================================================================
  slideNum++;
  slides.push(`
---
# Slide ${slideNum}: CONCLUSION

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner
- **Heading**: "CONCLUSION" in NextSphere, white
- **Subtitle**: "Your Energy Future" in Urbanist Italic, aqua
- **Aqua line separator**

## Content Layout: 3 key value propositions + call to action

### Value Proposition 1: Capture Wasted Value
**Card with aqua left border**
${hasExistingSolar 
  ? `Your existing solar system is currently exporting valuable energy at a fraction of its worth. Battery storage captures this wasted value, converting ${cents(calc.billFeedInTariffCents)}/kWh exports into ${cents(calc.billPeakRateCents)}/kWh self-consumption — a ${num((calc.billPeakRateCents || 30) / (calc.billFeedInTariffCents || 5), 1)}x value multiplier.`
  : `A solar and battery system captures free energy from your roof and stores it for when you need it most, dramatically reducing your grid dependency and energy costs.`}

### Value Proposition 2: Strong Financial Return
**Card with aqua left border**
With ${fmt(calc.totalAnnualSavings)} in annual savings and a ${num(calc.paybackYears, 1)}-year payback, this investment delivers a ${num(((calc.tenYearSavings || 0) / calc.netInvestment) * 100)}% return over 10 years — outperforming most traditional investment alternatives while providing daily utility value.

### Value Proposition 3: Environmental Leadership
**Card with aqua left border**
Reducing your carbon footprint by ${num(calc.co2ReductionTonnes, 1)} tonnes annually positions your household as an active contributor to Australia's clean energy transition, equivalent to planting ${num(treesEquivalent)} trees every year.

### Call to Action (centred, prominent)
**Ready to transform your energy economics?**
Contact ${BRAND.contact.name} to discuss your personalised implementation plan.

## Style Notes
- Each value proposition should be substantial and compelling
- The call to action should be warm but professional
- This slide synthesises the entire proposal narrative
`);

  // ================================================================
  // SLIDE: GET IN TOUCH
  // ================================================================
  slideNum++;
  slides.push(`
---
# Slide ${slideNum}: GET IN TOUCH

## Design
- **Background**: Black (#000000)
- **Logo**: Large centred Elite Smart Energy Solutions aqua logo (${BRAND.logo.aqua}), approximately 200x200px
- **No standard heading** — this is a contact/closing slide

## Content Layout: Centred contact details below logo

### Company Name (NextSphere, white, large)
ELITE SMART ENERGY SOLUTIONS

### Contact Details (GeneralSans, white, centred)

| | |
|--|--|
| **${BRAND.contact.name}** | ${BRAND.contact.title} |
| Phone | ${BRAND.contact.phone} |
| Email | ${BRAND.contact.email} |
| Address | ${BRAND.contact.address} |
| Website | ${BRAND.contact.website} |

### Orange accent bar (thin horizontal line, centred)

### Copyright (small, ash, bottom)
${BRAND.contact.copyright}

## Style Notes
- This should feel like a premium closing card
- Logo is the hero element, centred and large
- Contact details are clean and scannable
- Orange accent bar adds warmth
- Minimal content — let the branding speak
`);

  // ================================================================
  // ASSEMBLE FINAL MARKDOWN
  // ================================================================
  const header = `# Elite Smart Energy Solutions — In-Depth Bill Analysis & Solar Battery Proposal

## Presentation Details
- **Customer**: ${customerName}
- **Address**: ${customerAddress}, ${customerState}
- **Prepared by**: ${BRAND.contact.name}, ${BRAND.contact.company}
- **Date**: ${new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
- **Total Slides**: ${slideNum}

## Design Specifications
- **Background**: Midnight Navy (#0F172A) on ALL slides
- **Primary Font (Headings ONLY)**: NextSphere ExtraBold — ALL CAPS, white
- **Body Font (all text & numbers)**: GeneralSans Regular — white for primary, ash (#808285) for secondary
- **Label Font (subtitles, table headers)**: Urbanist SemiBold — ALL CAPS, aqua for subtitles, ash for labels
- **Primary Accent**: Aqua (#00EAD3) — used sparingly for savings, positive values, borders, subtitles
- **Secondary Accent**: Burnt Orange (#f36710) — used minimally for costs, warnings, accent bars
- **Logo**: Elite Smart Energy Solutions aqua starburst (${BRAND.logo.aqua}) — top-right on every slide except cover
- **Cover Background**: ${BRAND.coverBg}
- **Style**: Minimal, data-driven, professional. NO purple. NO gradients. NO decorative elements.
- **Tone**: Strategic, analytical, authoritative — for HIGH LEVEL OF EDUCATED PUBLICS audience

## Slide Content
`;

  return header + slides.join('\n');
}
