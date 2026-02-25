/**
 * Proposal Export Service
 * Generates PDF and PPT exports with Elite Smart Energy Solutions branding
 */

import { SlideData, ProposalCalculations } from "../drizzle/schema";

// ============================================
// EXPORT TYPES
// ============================================

export interface ExportOptions {
  format: 'pdf' | 'ppt';
  includeConditionalSlides: boolean;
  customerName: string;
  customerAddress: string;
}

export interface ExportResult {
  success: boolean;
  fileUrl?: string;
  fileName?: string;
  error?: string;
}

// ============================================
// HTML SLIDE TEMPLATES
// ============================================

const SLIDE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Inter', sans-serif;
    background: #0F172A;
    color: #ffffff;
  }
  
  .slide {
    width: 1920px;
    height: 1080px;
    background: linear-gradient(135deg, #000000 0%, #0a0a0a 100%);
    position: relative;
    overflow: hidden;
    page-break-after: always;
  }
  
  .slide-content {
    padding: 80px;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .slide-header {
    margin-bottom: 60px;
  }
  
  .slide-title {
    font-size: 48px;
    font-weight: 700;
    color: #46B446;
    text-transform: uppercase;
    letter-spacing: 2px;
  }
  
  .slide-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  
  .stat-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 40px;
  }
  
  .stat-box {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 40px;
  }
  
  .stat-box.accent {
    border-color: #46B446;
    background: rgba(0, 234, 211, 0.1);
  }
  
  .stat-label {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 12px;
  }
  
  .stat-value {
    font-size: 48px;
    font-weight: 700;
    color: #ffffff;
  }
  
  .stat-box.accent .stat-value {
    color: #46B446;
  }
  
  .slide-footer {
    position: absolute;
    bottom: 40px;
    left: 80px;
    right: 80px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.4);
  }
  
  .logo-text {
    color: #46B446;
    font-weight: 600;
  }
  
  /* Cover slide */
  .cover-slide .slide-body {
    text-align: center;
    align-items: center;
  }
  
  .cover-logo {
    width: 120px;
    height: 120px;
    margin-bottom: 60px;
  }
  
  .cover-title {
    font-size: 72px;
    font-weight: 700;
    color: #46B446;
    margin-bottom: 20px;
    text-transform: uppercase;
    letter-spacing: 4px;
  }
  
  .cover-customer {
    font-size: 36px;
    color: #ffffff;
    margin-bottom: 40px;
  }
  
  .cover-address {
    font-size: 24px;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 20px;
  }
  
  .cover-date {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.4);
  }
  
  /* VPP comparison */
  .vpp-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .vpp-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 24px 32px;
  }
  
  .vpp-rank {
    font-size: 24px;
    font-weight: 700;
    color: #46B446;
    margin-right: 24px;
  }
  
  .vpp-name {
    font-size: 24px;
    color: #ffffff;
    flex: 1;
  }
  
  .vpp-badge {
    background: rgba(243, 103, 16, 0.2);
    color: #46B446;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 14px;
    margin-right: 24px;
  }
  
  .vpp-value {
    font-size: 28px;
    font-weight: 600;
    color: #46B446;
  }
  
  /* Contact slide */
  .contact-slide .slide-body {
    text-align: center;
    align-items: center;
  }
  
  .contact-cta {
    font-size: 48px;
    font-weight: 700;
    color: #46B446;
    margin-bottom: 40px;
  }
  
  .contact-name {
    font-size: 32px;
    color: #ffffff;
    margin-bottom: 12px;
  }
  
  .contact-title {
    font-size: 20px;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 8px;
  }
  
  .contact-company {
    font-size: 24px;
    color: #46B446;
    font-weight: 600;
    margin-bottom: 40px;
  }
  
  .contact-details {
    display: flex;
    flex-direction: column;
    gap: 16px;
    font-size: 18px;
    color: rgba(255, 255, 255, 0.6);
  }
  
  /* Decorative elements */
  .decor-top-right {
    position: absolute;
    top: 0;
    right: 0;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle at top right, rgba(0, 234, 211, 0.1) 0%, transparent 70%);
  }
  
  .decor-bottom-left {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle at bottom left, rgba(243, 103, 16, 0.1) 0%, transparent 70%);
  }
`;

// ============================================
// SLIDE GENERATORS
// ============================================

export function generateSlideHtml(slide: SlideData): string {
  const content = slide.content as Record<string, unknown>;
  
  let bodyHtml = '';
  
  switch (slide.slideType) {
    case 'cover':
      bodyHtml = `
        <div class="cover-slide">
          <div class="slide-body">
            <svg class="cover-logo" viewBox="0 0 100 100" fill="none">
              <path d="M50 5L60 40H95L65 60L75 95L50 75L25 95L35 60L5 40H40L50 5Z" fill="#46B446"/>
            </svg>
            <h1 class="cover-title">Electrification Proposal</h1>
            <p class="cover-customer">${content.customerName}</p>
            <p class="cover-address">${content.customerAddress}</p>
            <p class="cover-date">${content.date}</p>
          </div>
        </div>
      `;
      break;
      
    case 'executive_summary':
      bodyHtml = `
        <div class="slide-header">
          <h2 class="slide-title">${slide.title}</h2>
        </div>
        <div class="slide-body">
          <div class="stat-grid">
            <div class="stat-box">
              <p class="stat-label">Current Annual Cost</p>
              <p class="stat-value">$${(content.currentAnnualCost as number)?.toLocaleString()}</p>
            </div>
            <div class="stat-box accent">
              <p class="stat-label">Total Annual Savings</p>
              <p class="stat-value">$${(content.totalAnnualSavings as number)?.toLocaleString()}</p>
            </div>
            <div class="stat-box">
              <p class="stat-label">Payback Period</p>
              <p class="stat-value">${content.paybackYears} years</p>
            </div>
            <div class="stat-box">
              <p class="stat-label">Net Investment</p>
              <p class="stat-value">$${(content.netInvestment as number)?.toLocaleString()}</p>
            </div>
          </div>
        </div>
      `;
      break;
      
    case 'bill_analysis':
      bodyHtml = `
        <div class="slide-header">
          <h2 class="slide-title">${slide.title}</h2>
        </div>
        <div class="slide-body">
          <div class="stat-grid">
            <div class="stat-box">
              <p class="stat-label">Daily Average</p>
              <p class="stat-value">${(content.dailyAverageKwh as number)?.toFixed(1)} kWh</p>
            </div>
            <div class="stat-box">
              <p class="stat-label">Monthly Usage</p>
              <p class="stat-value">${(content.monthlyUsageKwh as number)?.toFixed(0)} kWh</p>
            </div>
            <div class="stat-box">
              <p class="stat-label">Yearly Usage</p>
              <p class="stat-value">${(content.yearlyUsageKwh as number)?.toLocaleString()} kWh</p>
            </div>
            <div class="stat-box accent">
              <p class="stat-label">Projected Annual Cost</p>
              <p class="stat-value">$${(content.projectedAnnualCost as number)?.toLocaleString()}</p>
            </div>
          </div>
        </div>
      `;
      break;
      
    case 'vpp_comparison':
      const providers = content.providers as Array<{ provider: string; estimatedAnnualValue: number; hasGasBundle: boolean }>;
      const vppItems = providers?.slice(0, 5).map((p, i) => `
        <div class="vpp-item">
          <span class="vpp-rank">${i + 1}</span>
          <span class="vpp-name">${p.provider}</span>
          ${p.hasGasBundle ? '<span class="vpp-badge">Gas Bundle</span>' : ''}
          <span class="vpp-value">$${p.estimatedAnnualValue?.toFixed(0)}/yr</span>
        </div>
      `).join('') || '';
      
      bodyHtml = `
        <div class="slide-header">
          <h2 class="slide-title">${slide.title}</h2>
        </div>
        <div class="slide-body">
          <div class="vpp-list">
            ${vppItems}
          </div>
        </div>
      `;
      break;
      
    case 'financial_summary':
      bodyHtml = `
        <div class="slide-header">
          <h2 class="slide-title">${slide.title}</h2>
        </div>
        <div class="slide-body">
          <div class="stat-grid">
            <div class="stat-box">
              <p class="stat-label">Total Investment</p>
              <p class="stat-value">$${(content.totalInvestment as number)?.toLocaleString()}</p>
            </div>
            <div class="stat-box accent">
              <p class="stat-label">Total Rebates</p>
              <p class="stat-value">-$${(content.totalRebates as number)?.toLocaleString()}</p>
            </div>
            <div class="stat-box">
              <p class="stat-label">Net Investment</p>
              <p class="stat-value">$${(content.netInvestment as number)?.toLocaleString()}</p>
            </div>
            <div class="stat-box accent">
              <p class="stat-label">Payback Period</p>
              <p class="stat-value">${content.paybackYears} years</p>
            </div>
          </div>
        </div>
      `;
      break;
      
    case 'contact':
      bodyHtml = `
        <div class="contact-slide">
          <div class="slide-body">
            <h2 class="contact-cta">Get Started Today</h2>
            <p class="contact-name">Prepared by ${content.preparedBy}</p>
            <p class="contact-title">${content.title}</p>
            <p class="contact-company">${content.company}</p>
            <div class="contact-details">
              <p>${content.address}</p>
              <p>${content.phone}</p>
              <p>${content.email}</p>
              <p>${content.website}</p>
            </div>
          </div>
        </div>
      `;
      break;
      
    default:
      // Generic slide template
      const entries = Object.entries(content).filter(([_, v]) => v !== null && v !== undefined);
      const genericContent = entries.map(([key, value]) => `
        <div class="stat-box">
          <p class="stat-label">${formatKey(key)}</p>
          <p class="stat-value">${formatValue(value)}</p>
        </div>
      `).join('');
      
      bodyHtml = `
        <div class="slide-header">
          <h2 class="slide-title">${slide.title}</h2>
        </div>
        <div class="slide-body">
          <div class="stat-grid">
            ${genericContent}
          </div>
        </div>
      `;
  }
  
  return `
    <div class="slide">
      <div class="decor-top-right"></div>
      <div class="decor-bottom-left"></div>
      <div class="slide-content">
        ${bodyHtml}
      </div>
      <div class="slide-footer">
        <span class="logo-text">Elite Smart Energy Solutions</span>
        <span>Slide ${slide.slideNumber}</span>
      </div>
    </div>
  `;
}

export function generateFullPresentationHtml(slides: SlideData[], options: ExportOptions): string {
  const includedSlides = options.includeConditionalSlides 
    ? slides 
    : slides.filter(s => s.isIncluded);
  
  const slidesHtml = includedSlides.map(slide => generateSlideHtml(slide)).join('\n');
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Electrification Proposal - ${options.customerName}</title>
      <style>${SLIDE_STYLES}</style>
    </head>
    <body>
      ${slidesHtml}
    </body>
    </html>
  `;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

function formatValue(value: unknown): string {
  if (typeof value === 'number') {
    if (value > 1000) {
      return value.toLocaleString();
    }
    return value.toFixed(value % 1 === 0 ? 0 : 1);
  }
  if (Array.isArray(value)) {
    return value.length.toString();
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  return String(value ?? '-');
}
