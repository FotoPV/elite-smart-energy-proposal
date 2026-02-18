import puppeteer from 'puppeteer';
import { BRAND } from '../shared/brand';

export interface SlideData {
  title: string;
  subtitle?: string;
  content: string;
  type: string;
}

/**
 * Fetch an image URL and return a base64 data URI.
 * Falls back to the original URL if fetch fails.
 */
async function fetchImageAsDataUri(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout per image
    const resp = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!resp.ok) {
      console.warn(`[pdfExport] Failed to fetch image ${url}: ${resp.status}`);
      return url;
    }
    const contentType = resp.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(await resp.arrayBuffer());
    return `data:${contentType};base64,${buffer.toString('base64')}`;
  } catch (err: any) {
    console.warn(`[pdfExport] Error fetching image ${url}: ${err.message}`);
    return url;
  }
}

/**
 * Find all image src URLs in HTML and replace them with base64 data URIs.
 * This ensures Puppeteer doesn't need to make external network requests for images.
 */
async function embedImagesAsBase64(html: string): Promise<string> {
  // Match all src="https://..." patterns (S3 URLs and other external images)
  const imgRegex = /src="(https?:\/\/[^"]+)"/g;
  const matches: { full: string; url: string }[] = [];
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    matches.push({ full: match[0], url: match[1] });
  }

  if (matches.length === 0) return html;

  // Deduplicate URLs
  const uniqueUrls = Array.from(new Set(matches.map(m => m.url)));
  console.log(`[pdfExport] Pre-fetching ${uniqueUrls.length} images for PDF embedding...`);

  // Fetch all images in parallel
  const urlToDataUri = new Map<string, string>();
  const results = await Promise.allSettled(
    uniqueUrls.map(async (url) => {
      const dataUri = await fetchImageAsDataUri(url);
      urlToDataUri.set(url, dataUri);
    })
  );

  // Count successes
  const embedded = results.filter(r => r.status === 'fulfilled').length;
  console.log(`[pdfExport] Successfully embedded ${embedded}/${uniqueUrls.length} images as base64`);

  // Replace all URLs with data URIs
  let result = html;
  urlToDataUri.forEach((dataUri, url) => {
    // Replace all occurrences of this URL
    result = result.split(`src="${url}"`).join(`src="${dataUri}"`);
  });

  return result;
}

/**
 * Generate a PDF from proposal slides using Puppeteer.
 * All external images are pre-fetched and embedded as base64 data URIs
 * to prevent missing/broken images in the PDF output.
 */
export async function generateProposalPdf(
  slides: SlideData[],
  customerName: string,
  proposalTitle: string
): Promise<Buffer> {
  // Generate full HTML document with all slides
  let html = generateFullHtml(slides, customerName, proposalTitle);
  
  // Pre-fetch all external images and embed as base64 data URIs
  // This is the critical fix — Puppeteer's networkidle0 doesn't reliably
  // wait for all S3 images, causing them to render as black boxes
  html = await embedImagesAsBase64(html);
  
  // Launch Puppeteer and generate PDF
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set content — with base64 images embedded, we only need to wait for fonts
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
    
    // Additional safety: wait for all images to be fully decoded
    await page.evaluate(() => {
      return Promise.all(
        Array.from(document.querySelectorAll('img')).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve(); // Don't block on failed images
            // Timeout after 10s per image
            setTimeout(() => resolve(), 10000);
          });
        })
      );
    });
    
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
      <img src="${BRAND.logo.aqua}" alt="Lightning Energy" class="logo" />
      ${slide.content}
      <div class="footer">
        <span class="copyright">© Lightning Energy</span>
        <span class="page-number">${slideNumber} / ${totalSlides}</span>
      </div>
    </div>
  `;
}
