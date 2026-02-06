// Lightning Energy Professional Slide Generator
// Matches exact design from Paul Stokes SA proposal example

import { BRAND } from '../shared/brand';

export interface ProposalData {
  // Customer Info
  customerName: string;
  address: string;
  state: string;
  
  // Bill Data
  retailer: string;
  dailyUsageKwh: number;
  annualUsageKwh: number;
  supplyChargeCentsPerDay: number;
  usageRateCentsPerKwh: number;
  feedInTariffCentsPerKwh: number;
  controlledLoadRateCentsPerKwh?: number;
  annualCost: number;
  monthlyUsageData?: { month: string; kwh: number; cost: number }[];
  
  // Gas Data (optional)
  hasGas: boolean;
  gasAnnualMJ?: number;
  gasAnnualCost?: number;
  
  // System Recommendations
  solarSizeKw: number;
  panelCount: number;
  panelWattage: number;
  panelBrand: string;
  batterySizeKwh: number;
  batteryBrand: string;
  inverterSizeKw: number;
  inverterBrand: string;
  
  // Financial
  systemCost: number;
  rebateAmount: number;
  netInvestment: number;
  annualSavings: number;
  paybackYears: number;
  tenYearSavings: number;
  
  // VPP
  vppProvider: string;
  vppProgram: string;
  vppAnnualValue: number;
  hasGasBundle: boolean;
  
  // EV (optional)
  hasEV: boolean;
  evAnnualKm?: number;
  evAnnualSavings?: number;
  
  // Electrification (optional)
  hasPoolPump: boolean;
  poolPumpSavings?: number;
  hasHeatPump: boolean;
  heatPumpSavings?: number;
  
  // Environmental
  co2ReductionTonnes: number;
}

export interface SlideContent {
  id: number;
  type: string;
  title: string;
  subtitle?: string;
  content: Record<string, unknown>;
}

// Generate all slides based on proposal data
export function generateSlides(data: ProposalData): SlideContent[] {
  const slides: SlideContent[] = [];
  let slideId = 1;
  
  // Slide 1: Cover
  slides.push({
    id: slideId++,
    type: 'cover',
    title: data.customerName,
    subtitle: 'In-Depth Bill Analysis & Solar Battery Proposal',
    content: {
      address: data.address,
      state: data.state,
      preparedBy: BRAND.contact.name,
      company: BRAND.contact.company,
      logoUrl: BRAND.logo.aqua,
    }
  });
  
  // Slide 2: Projected Annual Expenditure
  slides.push({
    id: slideId++,
    type: 'annual_expenditure',
    title: 'PROJECTED ANNUAL EXPENDITURE',
    subtitle: 'Current Energy Costs',
    content: {
      annualCost: data.annualCost,
      monthlyAverage: data.annualCost / 12,
      dailyAverage: data.annualCost / 365,
      usageCost: data.annualUsageKwh * (data.usageRateCentsPerKwh / 100),
      supplyCost: data.supplyChargeCentsPerDay * 365 / 100,
      retailer: data.retailer,
      monthlyData: data.monthlyUsageData || [],
    }
  });
  
  // Slide 3: Usage Analysis
  slides.push({
    id: slideId++,
    type: 'usage_analysis',
    title: 'USAGE ANALYSIS',
    subtitle: 'Consumption Patterns',
    content: {
      annualUsageKwh: data.annualUsageKwh,
      dailyAverageKwh: data.dailyUsageKwh,
      monthlyAverageKwh: data.annualUsageKwh / 12,
      peakMonth: findPeakMonth(data.monthlyUsageData),
      usageRate: data.usageRateCentsPerKwh,
      feedInTariff: data.feedInTariffCentsPerKwh,
      monthlyData: data.monthlyUsageData || [],
    }
  });
  
  // Slide 4: Current Situation Summary
  slides.push({
    id: slideId++,
    type: 'current_situation',
    title: 'CURRENT SITUATION',
    subtitle: 'Energy Profile Summary',
    content: {
      annualCost: data.annualCost,
      annualUsage: data.annualUsageKwh,
      retailer: data.retailer,
      hasGas: data.hasGas,
      gasAnnualCost: data.gasAnnualCost,
      challenges: [
        'Rising electricity prices',
        'Grid dependency during peak periods',
        'No protection against outages',
        data.hasGas ? 'Dual fuel costs and complexity' : null,
      ].filter(Boolean),
      opportunities: [
        'Solar self-consumption potential',
        'Battery storage for peak shifting',
        'VPP income generation',
        'Future EV charging readiness',
      ],
    }
  });
  
  // Slide 5: Strategic Assessment - Battery Storage
  slides.push({
    id: slideId++,
    type: 'strategic_assessment',
    title: 'STRATEGIC ASSESSMENT',
    subtitle: 'Battery Storage Investment',
    content: {
      advantages: [
        { icon: 'zap', title: 'ENERGY INDEPENDENCE', description: `Reduce grid reliance from 100% to near-zero during outages.` },
        { icon: 'dollar', title: 'VPP INCOME', description: `Earn $${data.vppAnnualValue}-${data.vppAnnualValue + 150}/year through Virtual Power Plant participation.` },
        { icon: 'car', title: 'FUTURE-PROOFING', description: 'Ready for EV charging and time-of-use tariffs.' },
        { icon: 'trending-up', title: 'PEAK SHIFTING', description: 'Store cheap solar energy for expensive peak periods (6-9pm).' },
        { icon: 'shield', title: 'BLACKOUT PROTECTION', description: `Partial home backup with ${data.batteryBrand} system.` },
        { icon: 'leaf', title: 'ENVIRONMENTAL', description: `Reduce ${data.co2ReductionTonnes.toFixed(1)} tonnes CO2 annually.` },
      ],
      considerations: [
        { icon: 'dollar-sign', title: 'UPFRONT COST', description: `$${data.netInvestment.toLocaleString()} investment (after rebates).` },
        { icon: 'hourglass', title: 'PAYBACK PERIOD', description: `${data.paybackYears.toFixed(1)} years for battery component alone.` },
        { icon: 'cpu', title: 'TECHNOLOGY EVOLUTION', description: 'Battery technology is improving rapidly.' },
        { icon: 'box', title: 'SPACE REQUIREMENTS', description: 'Floor-mounted unit requires dedicated garage space.' },
        { icon: 'battery', title: 'DEGRADATION', description: 'Battery capacity reduces over time (approx. 0.35%/year).' },
      ],
    }
  });
  
  // Slide 6: Recommended Battery Size
  slides.push({
    id: slideId++,
    type: 'battery_recommendation',
    title: 'RECOMMENDED BATTERY SIZE',
    subtitle: `${data.batteryBrand} Configuration`,
    content: {
      totalCapacity: data.batterySizeKwh,
      inverterSize: data.inverterSizeKw,
      inverterType: 'HYBRID',
      modules: calculateBatteryModules(data.batterySizeKwh),
      technology: 'LFP (SAFE)',
      brand: data.batteryBrand,
      whyThisCapacity: {
        home: Math.min(4, data.dailyUsageKwh * 0.3),
        evCharge: data.hasEV ? 10 : 0,
        vppTrade: Math.max(0, data.batterySizeKwh - 4 - (data.hasEV ? 10 : 0)),
      },
      explanation: `This configuration ensures your home runs 100% off-grid overnight, ${data.hasEV ? 'fully charges your EV for daily commuting, and ' : ''}leaves substantial capacity for high-value VPP trading events.`,
    }
  });
  
  // Slide 7: Proposed Solar PV System
  slides.push({
    id: slideId++,
    type: 'solar_system',
    title: 'PROPOSED SOLAR PV SYSTEM',
    subtitle: 'High-Performance Hardware Specification',
    content: {
      systemSize: data.solarSizeKw,
      panelCount: data.panelCount,
      panelPower: data.panelWattage,
      panelBrand: data.panelBrand,
      whyThisBrand: `Ranked #1 for module efficiency globally. The ABC technology eliminates front grid lines, absorbing 100% of incident light for maximum energy generation per square meter.`,
      features: [
        { icon: 'panel', title: 'Full Black Design', description: 'Premium all-black appearance integrates seamlessly with modern rooflines.' },
        { icon: 'shield', title: '25-Year Warranty', description: 'Comprehensive coverage for both product defects and performance output.' },
        { icon: 'chart', title: 'Shade Optimization', description: 'Advanced partial shading optimization ensures maximum output even in challenging conditions.' },
      ],
    }
  });
  
  // Slide 8: VPP Provider Comparison
  slides.push({
    id: slideId++,
    type: 'vpp_comparison',
    title: 'VPP PROVIDER COMPARISON',
    subtitle: 'Evaluating Market Leaders for Gas & Elec Bundles',
    content: {
      providers: getVPPProviders(data.state, data.hasGas),
      recommendedProvider: data.vppProvider,
    }
  });
  
  // Slide 9: VPP Recommendation
  slides.push({
    id: slideId++,
    type: 'vpp_recommendation',
    title: 'VPP RECOMMENDATION',
    subtitle: 'Optimal Provider Selection',
    content: {
      provider: data.vppProvider,
      program: data.vppProgram,
      annualValue: data.vppAnnualValue,
      hasGasBundle: data.hasGasBundle,
      features: [
        { icon: 'layers', title: 'INTEGRATED BUNDLE', description: data.hasGasBundle ? 'The only top-tier VPP provider offering a seamless Gas & Electricity bundle, simplifying your administration.' : 'Streamlined electricity management with competitive rates.' },
        { icon: 'chart', title: 'FINANCIAL CERTAINTY', description: 'Provides guaranteed fixed credits for battery access, protecting you from market volatility while ensuring steady returns.' },
        { icon: 'target', title: 'STRATEGIC FIT', description: 'Perfectly aligned with your usage profile, maximizing self-consumption value while monetizing excess capacity.' },
      ],
    }
  });
  
  // Slide 10: EV Analysis (conditional)
  if (data.hasEV && data.evAnnualKm) {
    slides.push({
      id: slideId++,
      type: 'ev_analysis',
      title: 'EV ANALYSIS',
      subtitle: `${data.evAnnualKm.toLocaleString()} km Annual Usage Scenario`,
      content: {
        annualKm: data.evAnnualKm,
        petrolCostPer100km: 20.00,
        evGridCostPer100km: 4.50,
        evSolarCostPer100km: 0,
        petrolAnnualCost: (data.evAnnualKm / 100) * 20,
        evGridAnnualCost: (data.evAnnualKm / 100) * 4.50,
        evSolarAnnualCost: 0,
        annualSavings: data.evAnnualSavings || (data.evAnnualKm / 100) * 20,
        co2Avoided: (data.evAnnualKm / 10000) * 2.3,
      }
    });
  }
  
  // Slide 11: Total Savings Summary
  slides.push({
    id: slideId++,
    type: 'savings_summary',
    title: 'TOTAL SAVINGS SUMMARY',
    subtitle: 'Combined Annual Financial Benefits',
    content: {
      totalAnnualBenefit: data.annualSavings,
      breakdown: [
        { category: 'Solar & Battery', value: data.annualSavings - data.vppAnnualValue - (data.evAnnualSavings || 0), color: 'aqua' },
        { category: 'EV Integration', value: data.evAnnualSavings || 0, color: 'white' },
        { category: 'VPP Credits', value: data.vppAnnualValue, color: 'orange' },
      ],
      taxFree: true,
    }
  });
  
  // Slide 12: Financial Summary & Payback
  slides.push({
    id: slideId++,
    type: 'financial_summary',
    title: 'FINANCIAL SUMMARY & PAYBACK',
    subtitle: 'Investment Analysis & ROI',
    content: {
      systemCost: data.systemCost,
      rebates: data.rebateAmount,
      netInvestment: data.netInvestment,
      annualBenefit: data.annualSavings,
      paybackYears: data.paybackYears,
      tenYearSavings: data.tenYearSavings,
      acceleratedBy: data.hasEV ? 'EV & VPP' : 'VPP',
    }
  });
  
  // Slide 13: Recommended Roadmap
  slides.push({
    id: slideId++,
    type: 'roadmap',
    title: 'RECOMMENDED ROADMAP',
    subtitle: 'Implementation Timeline',
    content: {
      steps: [
        { number: '01', title: 'APPROVAL & FINANCE', description: 'Sign proposal and submit finance application. Secure rebates.', timeline: 'WEEK 1', color: 'aqua' },
        { number: '02', title: 'INSTALLATION', description: `Installation of ${data.panelBrand} panels, ${data.inverterBrand} inverter, and battery modules. System commissioning.`, timeline: 'WEEK 3-4', color: 'aqua' },
        { number: '03', title: 'VPP ACTIVATION', description: `Switch to ${data.vppProvider} ${data.vppProgram}. Configure battery for VPP events.`, timeline: 'WEEK 5', color: 'aqua' },
        { number: '04', title: 'EV INTEGRATION', description: 'Install EV charger. Set up solar-only charging logic to maximize savings.', timeline: 'MONTH 2+', color: 'orange' },
      ],
    }
  });
  
  // Slide 14: Conclusion
  slides.push({
    id: slideId++,
    type: 'conclusion',
    title: 'CONCLUSION',
    subtitle: 'Executive Summary',
    content: {
      features: [
        { icon: 'chart', title: 'MAXIMIZE RETURNS', description: `Turn a $${Math.round(data.annualCost / 12)} monthly bill into a $${data.annualSavings.toLocaleString()} annual profit center through smart solar, battery, and VPP integration.`, border: 'aqua' },
        { icon: 'shield', title: 'SECURE POWER', description: `Gain independence from grid instability and rising costs with a ${data.batterySizeKwh}kWh battery backup system.`, border: 'white' },
        { icon: 'zap', title: 'FUTURE READY', description: `Prepare your home for EV charging and electrification, eliminating petrol costs forever.`, border: 'orange' },
      ],
      quote: '"THIS SOLUTION TRANSFORMS YOUR HOME FROM AN ENERGY CONSUMER INTO A CLEAN POWER STATION."',
      callToAction: 'Recommended Action: Approve Proposal to Secure Rebates',
    }
  });
  
  // Slide 15: Contact
  slides.push({
    id: slideId++,
    type: 'contact',
    title: 'NEXT STEPS',
    subtitle: 'Get Started Today',
    content: {
      preparedBy: BRAND.contact.name,
      company: BRAND.contact.company,
      copyright: BRAND.contact.copyright,
      logoUrl: BRAND.logo.aqua,
    }
  });
  
  return slides;
}

// Helper functions
function findPeakMonth(monthlyData?: { month: string; kwh: number }[]): { month: string; kwh: number } | null {
  if (!monthlyData || monthlyData.length === 0) return null;
  return monthlyData.reduce((max, curr) => curr.kwh > max.kwh ? curr : max, monthlyData[0]);
}

function calculateBatteryModules(totalKwh: number): string {
  const moduleSize = 8.06; // Sigenergy module size
  const count = Math.ceil(totalKwh / moduleSize);
  return `${count} x ${moduleSize} KWH`;
}

function getVPPProviders(state: string, hasGas: boolean): Array<{
  provider: string;
  program: string;
  gasBundle: boolean;
  annualValue: string;
  strategicFit: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'COMPLEX';
}> {
  // State-specific VPP providers
  const providers = [
    { provider: 'ENGIE', program: 'VPP Advantage', gasBundle: true, annualValue: '$450+', strategicFit: 'EXCELLENT' as const },
    { provider: 'ORIGIN', program: 'Loop VPP', gasBundle: true, annualValue: '~$300', strategicFit: 'GOOD' as const },
    { provider: 'AGL', program: 'Night Saver', gasBundle: true, annualValue: '~$250', strategicFit: 'MODERATE' as const },
    { provider: 'AMBER', program: 'SmartShift', gasBundle: false, annualValue: 'VARIABLE', strategicFit: 'COMPLEX' as const },
    { provider: 'SIMPLY ENERGY', program: 'VPP Access', gasBundle: true, annualValue: '~$280', strategicFit: 'MODERATE' as const },
  ];
  
  // Filter based on gas requirement
  if (hasGas) {
    return providers.filter(p => p.gasBundle || p.strategicFit === 'COMPLEX');
  }
  return providers;
}

// Generate HTML for a single slide
export function generateSlideHTML(slide: SlideContent): string {
  const styles = `
    <style>
      @import url('https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/fRacvGdPvRdejhxR.ttf');
      @import url('https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/FlnvYEaVCWLmtgQE.otf');
      @import url('https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/ifpxpyNGTnspcxRL.ttf');
      
      * { margin: 0; padding: 0; box-sizing: border-box; }
      
      .slide {
        width: 1920px;
        height: 1080px;
        background: #000000;
        color: #FFFFFF;
        font-family: 'GeneralSans', sans-serif;
        padding: 60px 80px;
        position: relative;
      }
      
      .slide-title {
        font-family: 'NextSphere', sans-serif;
        font-size: 72px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 10px;
      }
      
      .slide-subtitle {
        font-family: 'Urbanist', sans-serif;
        font-size: 28px;
        color: #00EAD3;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        margin-bottom: 40px;
      }
      
      .logo {
        position: absolute;
        top: 40px;
        right: 60px;
        width: 80px;
        height: 80px;
      }
      
      .hero-number {
        font-family: 'NextSphere', sans-serif;
        font-size: 120px;
        font-weight: 800;
        color: #00EAD3;
      }
      
      .hero-number.white { color: #FFFFFF; }
      .hero-number.orange { color: #f36710; }
      
      .label {
        font-family: 'Urbanist', sans-serif;
        font-size: 14px;
        color: #808285;
        text-transform: uppercase;
        letter-spacing: 0.15em;
      }
      
      .card {
        background: rgba(255,255,255,0.03);
        border: 1px solid #333;
        border-radius: 8px;
        padding: 24px;
      }
      
      .card.aqua-border { border-color: #00EAD3; }
      .card.orange-border { border-color: #f36710; }
      
      .badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
      }
      
      .badge.excellent { background: #00EAD3; color: #000; }
      .badge.good { background: #22c55e; color: #000; }
      .badge.moderate { background: #f36710; color: #000; }
      .badge.complex { background: #666; color: #fff; }
      
      .copyright {
        position: absolute;
        bottom: 30px;
        left: 80px;
        font-size: 12px;
        color: #808285;
      }
      
      table {
        width: 100%;
        border-collapse: collapse;
      }
      
      th {
        font-family: 'Urbanist', sans-serif;
        font-size: 12px;
        color: #808285;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        text-align: left;
        padding: 12px 16px;
        border-bottom: 1px solid #333;
      }
      
      td {
        padding: 16px;
        border-bottom: 1px solid #222;
      }
      
      .highlight-row {
        background: rgba(0, 234, 211, 0.1);
        border-left: 3px solid #00EAD3;
      }
      
      .aqua { color: #00EAD3; }
      .orange { color: #f36710; }
      .gray { color: #808285; }
    </style>
  `;
  
  // Generate content based on slide type
  let content = '';
  
  switch (slide.type) {
    case 'cover':
      content = generateCoverSlide(slide);
      break;
    case 'annual_expenditure':
      content = generateExpenditureSlide(slide);
      break;
    case 'usage_analysis':
      content = generateUsageSlide(slide);
      break;
    case 'strategic_assessment':
      content = generateStrategicSlide(slide);
      break;
    case 'battery_recommendation':
      content = generateBatterySlide(slide);
      break;
    case 'solar_system':
      content = generateSolarSlide(slide);
      break;
    case 'vpp_comparison':
      content = generateVPPComparisonSlide(slide);
      break;
    case 'vpp_recommendation':
      content = generateVPPRecommendationSlide(slide);
      break;
    case 'savings_summary':
      content = generateSavingsSummarySlide(slide);
      break;
    case 'financial_summary':
      content = generateFinancialSlide(slide);
      break;
    case 'roadmap':
      content = generateRoadmapSlide(slide);
      break;
    case 'conclusion':
      content = generateConclusionSlide(slide);
      break;
    default:
      content = generateGenericSlide(slide);
  }
  
  return `<!DOCTYPE html><html><head>${styles}</head><body>${content}</body></html>`;
}

// Individual slide generators
function generateCoverSlide(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  return `
    <div class="slide" style="display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
      <img src="${c.logoUrl}" class="logo" alt="Lightning Energy" />
      <h1 class="slide-title" style="font-size: 96px; margin-bottom: 20px;">${slide.title}</h1>
      <p class="slide-subtitle" style="font-size: 36px; margin-bottom: 40px;">${slide.subtitle}</p>
      <p style="color: #808285; font-size: 18px;">${c.address}</p>
      <div class="copyright">Prepared by ${c.preparedBy} | ${c.company}</div>
    </div>
  `;
}

function generateExpenditureSlide(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="Lightning Energy" />
      <h1 class="slide-title">${slide.title}</h1>
      <p class="slide-subtitle">${slide.subtitle}</p>
      <div style="display: flex; gap: 80px; margin-top: 40px;">
        <div>
          <p class="label">PROJECTED ANNUAL COST</p>
          <p class="hero-number">$${(c.annualCost as number).toLocaleString()}</p>
          <p style="color: #808285; margin-top: 10px;">Based on current usage patterns</p>
        </div>
        <div style="flex: 1;">
          <table>
            <tr><th>COMPONENT</th><th style="text-align: right;">ANNUAL COST</th></tr>
            <tr><td>Usage Charges</td><td style="text-align: right;" class="orange">$${Math.round(c.usageCost as number).toLocaleString()}</td></tr>
            <tr><td>Supply Charges</td><td style="text-align: right;">$${Math.round(c.supplyCost as number).toLocaleString()}</td></tr>
            <tr class="highlight-row"><td><strong>TOTAL</strong></td><td style="text-align: right;" class="aqua"><strong>$${(c.annualCost as number).toLocaleString()}</strong></td></tr>
          </table>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

function generateUsageSlide(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="Lightning Energy" />
      <h1 class="slide-title">${slide.title}</h1>
      <p class="slide-subtitle">${slide.subtitle}</p>
      <div style="display: flex; gap: 60px; margin-top: 40px;">
        <div style="flex: 2;">
          <div style="display: flex; gap: 40px; margin-bottom: 40px;">
            <div class="card">
              <p class="label">ANNUAL USAGE</p>
              <p class="hero-number" style="font-size: 64px;">${Math.round(c.annualUsageKwh as number).toLocaleString()}<span style="font-size: 24px; color: #808285;"> kWh</span></p>
            </div>
            <div class="card">
              <p class="label">DAILY AVERAGE</p>
              <p class="hero-number white" style="font-size: 64px;">${(c.dailyAverageKwh as number).toFixed(1)}<span style="font-size: 24px; color: #808285;"> kWh</span></p>
            </div>
          </div>
        </div>
        <div style="flex: 1;">
          <div class="card">
            <p class="label">USAGE RATE</p>
            <p style="font-size: 32px; color: #f36710;">${c.usageRate}¢/kWh</p>
          </div>
          <div class="card" style="margin-top: 20px;">
            <p class="label">FEED-IN TARIFF</p>
            <p style="font-size: 32px; color: #00EAD3;">${c.feedInTariff}¢/kWh</p>
          </div>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

function generateStrategicSlide(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const advantages = c.advantages as Array<{ icon: string; title: string; description: string }>;
  const considerations = c.considerations as Array<{ icon: string; title: string; description: string }>;
  
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="Lightning Energy" />
      <h1 class="slide-title">${slide.title}</h1>
      <p class="slide-subtitle">${slide.subtitle}</p>
      <div style="display: flex; gap: 60px; margin-top: 30px;">
        <div style="flex: 1;">
          <h3 style="color: #00EAD3; font-size: 24px; margin-bottom: 20px;">✓ KEY ADVANTAGES</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            ${advantages.slice(0, 6).map(a => `
              <div>
                <p style="color: #00EAD3; font-weight: 600; font-size: 14px; text-transform: uppercase;">${a.title}</p>
                <p style="color: #808285; font-size: 13px; margin-top: 4px;">${a.description}</p>
              </div>
            `).join('')}
          </div>
        </div>
        <div style="flex: 1;">
          <h3 style="color: #f36710; font-size: 24px; margin-bottom: 20px;">⚠ CONSIDERATIONS</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            ${considerations.slice(0, 5).map(c => `
              <div>
                <p style="color: #f36710; font-weight: 600; font-size: 14px; text-transform: uppercase;">${c.title}</p>
                <p style="color: #808285; font-size: 13px; margin-top: 4px;">${c.description}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

function generateBatterySlide(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const capacity = c.whyThisCapacity as { home: number; evCharge: number; vppTrade: number };
  
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="Lightning Energy" />
      <h1 class="slide-title">${slide.title}</h1>
      <p class="slide-subtitle">${slide.subtitle}</p>
      <div style="display: flex; gap: 60px; margin-top: 40px;">
        <div style="flex: 1;">
          <div class="card aqua-border" style="text-align: center; padding: 40px;">
            <p class="label">TOTAL USABLE CAPACITY</p>
            <p class="hero-number">${c.totalCapacity}<span style="font-size: 36px;"> KWH</span></p>
          </div>
          <div style="display: flex; gap: 20px; margin-top: 20px;">
            <div class="card" style="flex: 1;">
              <p class="label" style="color: #00EAD3;">INVERTER</p>
              <p style="font-size: 24px;">${c.inverterSize} KW<br/>${c.inverterType}</p>
            </div>
            <div class="card" style="flex: 1;">
              <p class="label" style="color: #00EAD3;">MODULES</p>
              <p style="font-size: 24px;">${c.modules}</p>
            </div>
            <div class="card" style="flex: 1;">
              <p class="label" style="color: #00EAD3;">TECHNOLOGY</p>
              <p style="font-size: 24px;">${c.technology}</p>
            </div>
          </div>
        </div>
        <div style="flex: 1;">
          <p style="font-size: 20px; margin-bottom: 20px;">Why this capacity?</p>
          <div style="display: flex; height: 40px; border-radius: 4px; overflow: hidden;">
            <div style="width: ${(capacity.home / (c.totalCapacity as number)) * 100}%; background: #808285; display: flex; align-items: center; justify-content: center; font-size: 12px;">HOME ~${capacity.home.toFixed(0)}kWh</div>
            ${capacity.evCharge > 0 ? `<div style="width: ${(capacity.evCharge / (c.totalCapacity as number)) * 100}%; background: #00EAD3; color: #000; display: flex; align-items: center; justify-content: center; font-size: 12px;">EV CHARGE ~${capacity.evCharge}kWh</div>` : ''}
            <div style="width: ${(capacity.vppTrade / (c.totalCapacity as number)) * 100}%; background: #f36710; color: #000; display: flex; align-items: center; justify-content: center; font-size: 12px;">VPP TRADE ~${capacity.vppTrade.toFixed(0)}kWh</div>
          </div>
          <p style="color: #808285; font-size: 14px; margin-top: 20px;">${c.explanation}</p>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

function generateSolarSlide(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const features = c.features as Array<{ icon: string; title: string; description: string }>;
  
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="Lightning Energy" />
      <h1 class="slide-title">${slide.title}</h1>
      <p class="slide-subtitle">${slide.subtitle}</p>
      <div style="display: flex; gap: 40px; margin-top: 30px;">
        <div class="card" style="text-align: center;">
          <p class="label">SYSTEM SIZE</p>
          <p class="hero-number white" style="font-size: 80px;">${c.systemSize}<span style="font-size: 24px; color: #808285;">KW</span></p>
        </div>
        <div class="card" style="text-align: center;">
          <p class="label">PANEL COUNT</p>
          <p class="hero-number" style="font-size: 80px; color: #00EAD3;">${c.panelCount}<span style="font-size: 24px; color: #808285;">UNITS</span></p>
        </div>
        <div class="card" style="text-align: center;">
          <p class="label" style="color: #f36710;">HARDWARE TECHNOLOGY</p>
          <p class="hero-number orange" style="font-size: 80px;">${c.panelPower}<span style="font-size: 24px; color: #808285;">W</span></p>
          <p style="color: #808285; font-size: 14px;">${c.panelBrand}</p>
        </div>
      </div>
      <div style="display: flex; gap: 40px; margin-top: 30px;">
        <div class="card aqua-border" style="flex: 1;">
          <p style="color: #00EAD3; font-weight: 600; margin-bottom: 10px;">WHY ${(c.panelBrand as string).split(' ')[0].toUpperCase()}?</p>
          <p style="color: #808285; font-size: 14px;">${c.whyThisBrand}</p>
        </div>
        <div style="flex: 1;">
          <p style="color: #f36710; font-weight: 600; margin-bottom: 16px;">PERFORMANCE & WARRANTY</p>
          ${features.map(f => `
            <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
              <span style="color: #00EAD3;">●</span>
              <div>
                <p style="font-weight: 600; font-size: 14px;">${f.title}</p>
                <p style="color: #808285; font-size: 13px;">${f.description}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

function generateVPPComparisonSlide(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const providers = c.providers as Array<{ provider: string; program: string; gasBundle: boolean; annualValue: string; strategicFit: string }>;
  const recommended = c.recommendedProvider as string;
  
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="Lightning Energy" />
      <h1 class="slide-title">${slide.title}</h1>
      <p class="slide-subtitle">${slide.subtitle}</p>
      <table style="margin-top: 30px;">
        <tr>
          <th>PROVIDER</th>
          <th>VPP MODEL</th>
          <th>GAS BUNDLE</th>
          <th>EST. ANNUAL VALUE</th>
          <th>STRATEGIC FIT</th>
        </tr>
        ${providers.map(p => `
          <tr class="${p.provider === recommended ? 'highlight-row' : ''}">
            <td style="font-weight: 600;">${p.provider}${p.provider === recommended ? '<br/><span style="color: #00EAD3; font-size: 12px;">Recommended</span>' : ''}</td>
            <td><span style="color: #f36710;">${p.program}</span><br/><span style="color: #808285; font-size: 12px;">Variable event payments</span></td>
            <td>${p.gasBundle ? '<span style="color: #00EAD3;">✓ Yes</span>' : '<span style="color: #808285;">✗ No</span>'}</td>
            <td style="font-weight: 600;">${p.annualValue}</td>
            <td><span class="badge ${p.strategicFit.toLowerCase()}">${p.strategicFit}</span></td>
          </tr>
        `).join('')}
      </table>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

function generateVPPRecommendationSlide(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const features = c.features as Array<{ icon: string; title: string; description: string }>;
  
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="Lightning Energy" />
      <h1 class="slide-title">${slide.title}</h1>
      <p class="slide-subtitle">${slide.subtitle}</p>
      <div style="text-align: center; margin-top: 40px;">
        <p class="label">SELECTED PARTNER</p>
        <p style="font-family: 'NextSphere', sans-serif; font-size: 72px; font-weight: 800; margin: 10px 0;">${c.provider}</p>
        <p style="color: #00EAD3; font-size: 24px;">${c.program}</p>
      </div>
      <div style="display: flex; gap: 30px; margin-top: 40px;">
        ${features.map((f, i) => `
          <div class="card ${i === 0 ? 'aqua-border' : ''}" style="flex: 1; text-align: center;">
            <p style="color: ${i === 0 ? '#f36710' : i === 1 ? '#00EAD3' : '#f36710'}; font-size: 32px; margin-bottom: 10px;">${i === 0 ? '≡' : i === 1 ? '↗' : '⊕'}</p>
            <p style="font-weight: 600; text-transform: uppercase; margin-bottom: 10px;">${f.title}</p>
            <p style="color: #808285; font-size: 14px;">${f.description}</p>
          </div>
        `).join('')}
      </div>
      <div style="display: flex; align-items: center; gap: 20px; margin-top: 40px;">
        <div style="width: 4px; height: 60px; background: #00EAD3;"></div>
        <div>
          <p class="label">Estimated Annual Value (Credits + Bundle Savings)</p>
          <p class="hero-number" style="font-size: 72px;">~$${c.annualValue}<span style="font-size: 24px;"> / YEAR</span></p>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

function generateSavingsSummarySlide(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const breakdown = c.breakdown as Array<{ category: string; value: number; color: string }>;
  const total = c.totalAnnualBenefit as number;
  
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="Lightning Energy" />
      <h1 class="slide-title">${slide.title}</h1>
      <p class="slide-subtitle">${slide.subtitle}</p>
      <div style="display: flex; gap: 60px; margin-top: 40px;">
        <div style="flex: 1;">
          <div style="height: 400px; display: flex; flex-direction: column; justify-content: flex-end;">
            ${breakdown.map(b => `
              <div style="height: ${(b.value / total) * 100}%; background: ${b.color === 'aqua' ? '#00EAD3' : b.color === 'orange' ? '#f36710' : '#FFFFFF'}; display: flex; align-items: center; justify-content: center;">
                <span style="color: #000; font-weight: 600;">${b.category}</span>
              </div>
            `).join('')}
          </div>
        </div>
        <div style="flex: 1;">
          <div class="card aqua-border" style="text-align: center; padding: 40px; margin-bottom: 30px;">
            <p class="label" style="color: #00EAD3;">TOTAL ANNUAL BENEFIT</p>
            <p class="hero-number white" style="font-size: 96px;">$${total.toLocaleString()}</p>
            <p style="color: #808285;">Tax-Free Savings</p>
          </div>
          ${breakdown.map(b => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #333;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 16px; height: 16px; background: ${b.color === 'aqua' ? '#00EAD3' : b.color === 'orange' ? '#f36710' : '#FFFFFF'};"></div>
                <span>${b.category}</span>
              </div>
              <span style="font-weight: 600;">$${b.value.toLocaleString()}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

function generateFinancialSlide(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="Lightning Energy" />
      <h1 class="slide-title">${slide.title}</h1>
      <p class="slide-subtitle">${slide.subtitle}</p>
      <div style="display: flex; gap: 60px; margin-top: 40px;">
        <div style="flex: 1;">
          <p class="label" style="margin-bottom: 20px;">INVESTMENT BREAKDOWN</p>
          <div style="display: flex; justify-content: space-between; padding: 16px 0; border-bottom: 1px solid #333;">
            <span>Solar & Battery System</span>
            <span style="font-weight: 600;">$${(c.systemCost as number).toLocaleString()}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 16px 0; border-bottom: 1px solid #333;">
            <span>Govt. Rebates & Incentives</span>
            <span style="font-weight: 600; color: #00EAD3;">-$${(c.rebates as number).toLocaleString()}</span>
          </div>
          <div class="card orange-border" style="margin-top: 20px;">
            <p class="label" style="color: #f36710;">NET INVESTMENT</p>
            <p class="hero-number white" style="font-size: 72px;">$${(c.netInvestment as number).toLocaleString()}</p>
            <p style="color: #808285; font-size: 14px;">Fully Installed (Inc. GST)</p>
          </div>
        </div>
        <div style="flex: 1;">
          <p class="label" style="margin-bottom: 20px;">PROJECTED RETURNS</p>
          <div style="display: flex; gap: 20px;">
            <div class="card aqua-border" style="flex: 1;">
              <p class="label" style="color: #00EAD3;">ANNUAL BENEFIT</p>
              <p class="hero-number white" style="font-size: 48px;">$${(c.annualBenefit as number).toLocaleString()}</p>
              <p style="color: #808285; font-size: 12px;">Combined Savings & Income</p>
            </div>
            <div class="card aqua-border" style="flex: 1;">
              <p class="label" style="color: #00EAD3;">PAYBACK PERIOD</p>
              <p class="hero-number white" style="font-size: 48px;">${(c.paybackYears as number).toFixed(1)} YRS</p>
              <p style="color: #808285; font-size: 12px;">Accelerated by ${c.acceleratedBy}</p>
            </div>
          </div>
          <div class="card" style="margin-top: 20px; text-align: center;">
            <p style="font-size: 24px; font-weight: 600;">10-YEAR TOTAL SAVINGS: <span class="aqua">~$${(c.tenYearSavings as number).toLocaleString()}</span></p>
          </div>
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

function generateRoadmapSlide(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const steps = c.steps as Array<{ number: string; title: string; description: string; timeline: string; color: string }>;
  
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="Lightning Energy" />
      <h1 class="slide-title">${slide.title}</h1>
      <p class="slide-subtitle">${slide.subtitle}</p>
      <div style="margin-top: 40px;">
        <div style="display: flex; align-items: center; margin-bottom: 30px;">
          ${steps.map((s, i) => `
            <div style="display: flex; align-items: center;">
              <div style="width: 24px; height: 24px; border-radius: 50%; border: 2px solid ${s.color === 'aqua' ? '#00EAD3' : '#f36710'}; background: transparent;"></div>
              ${i < steps.length - 1 ? `<div style="width: 200px; height: 2px; background: linear-gradient(to right, ${s.color === 'aqua' ? '#00EAD3' : '#f36710'}, ${steps[i + 1].color === 'aqua' ? '#00EAD3' : '#f36710'});"></div>` : ''}
            </div>
          `).join('')}
        </div>
        <div style="display: flex; gap: 20px;">
          ${steps.map(s => `
            <div class="card" style="flex: 1; border-top: 3px solid ${s.color === 'aqua' ? '#00EAD3' : '#f36710'};">
              <p style="font-size: 48px; color: #333; font-weight: 800;">${s.number}</p>
              <p style="font-weight: 600; text-transform: uppercase; color: ${s.color === 'aqua' ? '#FFFFFF' : '#f36710'}; margin: 10px 0;">${s.title}</p>
              <p style="color: #808285; font-size: 13px; margin-bottom: 16px;">${s.description}</p>
              <p style="color: #00EAD3; font-size: 12px;">⏱ ${s.timeline}</p>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

function generateConclusionSlide(slide: SlideContent): string {
  const c = slide.content as Record<string, unknown>;
  const features = c.features as Array<{ icon: string; title: string; description: string; border: string }>;
  
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="Lightning Energy" />
      <h1 class="slide-title">${slide.title}</h1>
      <p class="slide-subtitle">${slide.subtitle}</p>
      <div style="display: flex; gap: 30px; margin-top: 40px;">
        ${features.map(f => `
          <div class="card ${f.border}-border" style="flex: 1; text-align: center;">
            <p style="color: ${f.border === 'aqua' ? '#00EAD3' : f.border === 'orange' ? '#f36710' : '#FFFFFF'}; font-size: 40px; margin-bottom: 16px;">${f.icon === 'chart' ? '↗' : f.icon === 'shield' ? '🛡' : '⚡'}</p>
            <p style="font-weight: 600; text-transform: uppercase; margin-bottom: 12px;">${f.title}</p>
            <p style="color: #808285; font-size: 14px;">${f.description}</p>
          </div>
        `).join('')}
      </div>
      <div style="text-align: center; margin-top: 60px;">
        <p style="font-family: 'NextSphere', sans-serif; font-size: 36px; font-weight: 800; line-height: 1.4;">${c.quote}</p>
        <p style="color: #00EAD3; font-size: 20px; margin-top: 30px;">${c.callToAction}</p>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}

function generateGenericSlide(slide: SlideContent): string {
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" class="logo" alt="Lightning Energy" />
      <h1 class="slide-title">${slide.title}</h1>
      ${slide.subtitle ? `<p class="slide-subtitle">${slide.subtitle}</p>` : ''}
      <div style="margin-top: 40px;">
        <pre style="color: #808285; font-size: 14px;">${JSON.stringify(slide.content, null, 2)}</pre>
      </div>
      <div class="copyright">${BRAND.contact.copyright}</div>
    </div>
  `;
}
