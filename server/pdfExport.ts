import puppeteer from 'puppeteer';
import { BRAND } from '../shared/brand';

export interface SlideData {
  title: string;
  subtitle?: string;
  content: string;
  type: string;
}

/**
 * Generate a PDF from proposal slides using Puppeteer
 */
export async function generateProposalPdf(
  slides: SlideData[],
  customerName: string,
  proposalTitle: string
): Promise<Buffer> {
  // Generate full HTML document with all slides
  const html = generateFullHtml(slides, customerName, proposalTitle);
  
  // Launch Puppeteer and generate PDF
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set content and wait for fonts to load
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Generate PDF with landscape orientation for slides
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });
    
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

/**
 * Generate full HTML document with all slides for PDF export
 */
function generateFullHtml(
  slides: SlideData[],
  customerName: string,
  proposalTitle: string
): string {
  const slidesHtml = slides.map((slide, index) => `
    <div class="slide" style="page-break-after: always; page-break-inside: avoid;">
      ${slide.content}
    </div>
  `).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${proposalTitle} - ${customerName}</title>
  <style>
    @font-face {
      font-family: 'NextSphere';
      src: url('${BRAND.fontUrls.nextSphere}') format('truetype');
      font-weight: 800;
    }
    @font-face {
      font-family: 'General Sans';
      src: url('${BRAND.fontUrls.generalSans}') format('opentype');
      font-weight: 400;
    }
    @font-face {
      font-family: 'Urbanist';
      src: url('${BRAND.fontUrls.urbanist}') format('truetype');
      font-weight: 600;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @page {
      size: A4 landscape;
      margin: 0;
    }
    
    body {
      font-family: 'General Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: ${BRAND.colors.black};
      color: ${BRAND.colors.white};
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    .slide {
      width: 297mm;
      height: 210mm;
      padding: 40px 60px;
      background: ${BRAND.colors.black};
      position: relative;
      overflow: hidden;
    }
    
    .slide-header {
      margin-bottom: 30px;
    }
    
    .slide-title {
      font-family: 'NextSphere', sans-serif;
      font-size: 36px;
      font-weight: 800;
      color: ${BRAND.colors.white};
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 8px;
    }
    
    .slide-subtitle {
      font-family: 'General Sans', sans-serif;
      font-size: 18px;
      color: ${BRAND.colors.aqua};
      font-weight: 400;
    }
    
    .slide-content {
      font-family: 'General Sans', sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: ${BRAND.colors.white};
    }
    
    .logo {
      position: absolute;
      top: 30px;
      right: 40px;
      width: 60px;
      height: 60px;
    }
    
    .footer {
      position: absolute;
      bottom: 20px;
      left: 60px;
      right: 60px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: ${BRAND.colors.ash};
    }
    
    .page-number {
      font-family: 'General Sans', sans-serif;
    }
    
    .copyright {
      font-family: 'General Sans', sans-serif;
    }
    
    /* Data tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    
    th, td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid ${BRAND.colors.ash}40;
    }
    
    th {
      font-family: 'General Sans', sans-serif;
      font-weight: 600;
      color: ${BRAND.colors.ash};
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    td {
      font-family: 'General Sans', sans-serif;
      font-size: 16px;
      color: ${BRAND.colors.white};
    }
    
    /* Metric cards */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      margin: 30px 0;
    }
    
    .metric-card {
      background: ${BRAND.colors.ash}15;
      border: 1px solid ${BRAND.colors.ash}30;
      border-radius: 12px;
      padding: 24px;
    }
    
    .metric-label {
      font-family: 'General Sans', sans-serif;
      font-size: 14px;
      color: ${BRAND.colors.ash};
      margin-bottom: 8px;
    }
    
    .metric-value {
      font-family: 'General Sans', sans-serif;
      font-size: 32px;
      font-weight: 700;
      color: ${BRAND.colors.white};
    }
    
    .metric-value.highlight {
      color: ${BRAND.colors.aqua};
    }
    
    .metric-value.accent {
      color: ${BRAND.colors.orange};
    }
    
    /* Charts placeholder */
    .chart-container {
      background: ${BRAND.colors.ash}10;
      border: 1px solid ${BRAND.colors.ash}30;
      border-radius: 12px;
      padding: 30px;
      margin: 20px 0;
      min-height: 200px;
    }
    
    /* Lists */
    ul, ol {
      margin: 16px 0;
      padding-left: 24px;
    }
    
    li {
      margin: 8px 0;
      font-family: 'General Sans', sans-serif;
      font-size: 16px;
      color: ${BRAND.colors.white};
    }
    
    /* Highlight boxes */
    .highlight-box {
      background: ${BRAND.colors.aqua}15;
      border-left: 4px solid ${BRAND.colors.aqua};
      padding: 20px;
      margin: 20px 0;
      border-radius: 0 8px 8px 0;
    }
    
    .highlight-box.orange {
      background: ${BRAND.colors.orange}15;
      border-left-color: ${BRAND.colors.orange};
    }
    
    /* Cover slide specific */
    .cover-slide {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      height: 100%;
    }
    
    .cover-logo {
      width: 120px;
      height: 120px;
      margin-bottom: 40px;
    }
    
    .cover-title {
      font-family: 'NextSphere', sans-serif;
      font-size: 48px;
      font-weight: 800;
      color: ${BRAND.colors.white};
      text-transform: uppercase;
      letter-spacing: 3px;
      margin-bottom: 16px;
    }
    
    .cover-subtitle {
      font-family: 'General Sans', sans-serif;
      font-size: 24px;
      color: ${BRAND.colors.aqua};
      margin-bottom: 40px;
    }
    
    .cover-customer {
      font-family: 'Urbanist', sans-serif;
      font-size: 28px;
      font-weight: 600;
      color: ${BRAND.colors.white};
    }
    
    .cover-date {
      font-family: 'General Sans', sans-serif;
      font-size: 16px;
      color: ${BRAND.colors.ash};
      margin-top: 20px;
    }
    
    /* Two column layout */
    .two-columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin: 20px 0;
    }
    
    /* Contact info */
    .contact-info {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid ${BRAND.colors.ash}30;
    }
    
    .contact-name {
      font-family: 'Urbanist', sans-serif;
      font-size: 18px;
      font-weight: 600;
      color: ${BRAND.colors.white};
    }
    
    .contact-details {
      font-family: 'General Sans', sans-serif;
      font-size: 14px;
      color: ${BRAND.colors.ash};
      margin-top: 8px;
    }
  </style>
</head>
<body>
  ${slidesHtml}
</body>
</html>`;
}

/**
 * Generate a single slide HTML for preview
 */
export function generateSlidePreviewHtml(slide: SlideData, slideNumber: number, totalSlides: number): string {
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" alt="Elite Smart Energy Solutions" class="logo" />
      ${slide.content}
      <div class="footer">
        <span class="copyright">© Elite Smart Energy Solutions</span>
        <span class="page-number">${slideNumber} / ${totalSlides}</span>
      </div>
    </div>
  `;
}
