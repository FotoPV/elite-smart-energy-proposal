// Elite Smart Energy Solutions PowerPoint Generator
// Generates native .pptx files with embedded brand fonts and full data tables
// Uses pptxgenjs for pixel-perfect control

import { createRequire } from 'module';
const _require = createRequire(import.meta.url);
// Force CJS version of pptxgenjs to avoid jszip ESM import error on Node 18/19
// Explicitly resolve to pptxgen.cjs.js to bypass the exports.import condition
const _pptxResolved = _require.resolve('pptxgenjs');
const _pptxCjsPath = _pptxResolved.replace(/pptxgen\.es\.js$/, 'pptxgen.cjs.js');
const PptxGenJS = _require(_pptxCjsPath) as typeof import('pptxgenjs');
const PptxCtor = ((PptxGenJS as any).default || PptxGenJS) as typeof PptxGenJS;
import { BRAND } from '../shared/brand';
import { ProposalData } from './slideGenerator';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---- CONSTANTS ----
const SLIDE_W = 13.333; // 16:9 at 96dpi = 1280px → 13.333 inches
const SLIDE_H = 7.5;
const PAD_L = 0.8;
const PAD_R = 0.6;
const PAD_T = 0.6;
const PAD_B = 0.5;
const CONTENT_W = SLIDE_W - PAD_L - PAD_R;
const CONTENT_H = SLIDE_H - PAD_T - PAD_B;

// Colors (no # prefix for pptxgenjs) — Elite Smart Energy Solutions brand palette
const C = {
  black: '0F172A',       // Midnight Navy — slide background
  navy: '1B3A5C',        // Elite Navy — primary brand colour
  solarGreen: '46B446',  // Solar Green — primary accent
  white: 'FFFFFF',       // Pure White
  steelBlue: '4A6B8A',   // Steel Blue — secondary text
  charcoal: '2C3E50',    // Charcoal — card backgrounds
  skyMist: 'E8F0F7',     // Sky Mist — light backgrounds
  lightGrey: 'F5F7FA',   // Light Grey
  darkCard: '1E2D40',    // Dark card variant
  cardBorder: '1B3A5C',  // Elite Navy border
  // Legacy aliases (keep for backward compat)
  aqua: '46B446',
  orange: '46B446',
  ash: '4A6B8A',
  darkGrey: '2C3E50',
  cardBg: '1E2D40',
};

// Font paths for embedding
const FONT_DIR = path.join(__dirname, 'fonts');

// Font names (pptxgenjs uses system fonts or embedded)
const F = {
  heading: 'Montserrat',
  body: 'Open Sans',
  label: 'Montserrat',
};

// CDN URLs for assets needed at runtime
const ASSET_CDN: Record<string, string> = {
  // White-transparent icon — used on dark slide backgrounds
  'elite-logo.jpg': 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/OOvYOULsnTCxOyIC.png',
  // White-on-navy icon — used on navy/charcoal backgrounds
  'elite-icon-navy.png': 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/NDYOCRwnFOhisDUR.png',
  // Transparent icon (dark rays) — used on light backgrounds
  'elite-icon-transparent.png': 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/vkYTXfpVJByJjaGo.png',
};

// Ensure logo is available locally (download from CDN if needed)
async function ensureAssets(): Promise<void> {
  if (!fs.existsSync(FONT_DIR)) fs.mkdirSync(FONT_DIR, { recursive: true });
  for (const [filename, cdnUrl] of Object.entries(ASSET_CDN)) {
    const localPath = path.join(FONT_DIR, filename);
    if (!fs.existsSync(localPath)) {
      const resp = await fetch(cdnUrl);
      if (!resp.ok) throw new Error(`Failed to download ${filename}: ${resp.status}`);
      const buffer = Buffer.from(await resp.arrayBuffer());
      fs.writeFileSync(localPath, buffer);
    }
  }
}

// ---- HELPERS ----
function fmt(n: number | undefined, decimals = 0): string {
  if (n === undefined || n === null) return '—';
  return n.toLocaleString('en-AU', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtDollar(n: number | undefined): string {
  if (n === undefined || n === null) return '—';
  return `$${fmt(n)}`;
}

function fmtCents(n: number | undefined): string {
  if (n === undefined || n === null) return '—';
  return `${fmt(n, 1)}c`;
}

function addLogo(slide: PptxGenJS.Slide) {
  const logoPath = path.join(FONT_DIR, 'elite-logo.jpg');
  if (fs.existsSync(logoPath)) {
    slide.addImage({
      path: logoPath,
      x: SLIDE_W - 1.2,
      y: 0.3,
      w: 0.6,
      h: 0.6,
    });
  }
}

function addCopyright(slide: PptxGenJS.Slide) {
  slide.addText(BRAND.contact.copyright, {
    x: PAD_L,
    y: SLIDE_H - 0.4,
    w: CONTENT_W,
    h: 0.3,
    fontSize: 8,
    fontFace: F.label,
    color: C.ash,
  });
}

function addSlideHeader(slide: PptxGenJS.Slide, title: string, subtitle?: string) {
  // Title (Montserrat, large, white, ALL CAPS)
  slide.addText(title.toUpperCase(), {
    x: PAD_L,
    y: PAD_T,
    w: subtitle ? CONTENT_W * 0.6 : CONTENT_W,
    h: 0.6,
    fontSize: 28,
    fontFace: F.heading,
    color: C.white,
    bold: true,
  });

  // Subtitle (Montserrat Italic, aqua, right-aligned)
  if (subtitle) {
    slide.addText(subtitle, {
      x: PAD_L + CONTENT_W * 0.6,
      y: PAD_T,
      w: CONTENT_W * 0.4,
      h: 0.6,
      fontSize: 14,
      fontFace: F.label,
      color: C.aqua,
      italic: true,
      align: 'right',
    });
  }

  // Aqua separator line
  slide.addShape('rect' as any, {
    x: PAD_L,
    y: PAD_T + 0.65,
    w: CONTENT_W,
    h: 0.015,
    fill: { color: C.aqua },
  });
}

// Standard table styling
interface TableRow {
  label: string;
  value: string;
  valueColor?: string;
}

function addDataTable(
  slide: PptxGenJS.Slide,
  rows: TableRow[],
  x: number,
  y: number,
  w: number,
  headerLabel?: string,
  headerValue?: string
) {
  const tableRows: PptxGenJS.TableRow[] = [];

  if (headerLabel) {
    tableRows.push([
      { text: headerLabel, options: { fontSize: 9, fontFace: F.label, color: C.aqua, bold: true, fill: { color: C.darkGrey } } },
      { text: headerValue || '', options: { fontSize: 9, fontFace: F.label, color: C.aqua, bold: true, align: 'right', fill: { color: C.darkGrey } } },
    ]);
  }

  for (const row of rows) {
    tableRows.push([
      { text: row.label, options: { fontSize: 11, fontFace: F.body, color: C.white } },
      { text: row.value, options: { fontSize: 11, fontFace: F.body, color: row.valueColor || C.white, align: 'right', bold: true } },
    ]);
  }

  slide.addTable(tableRows, {
    x,
    y,
    w,
    colW: [w * 0.6, w * 0.4],
    border: { type: 'solid', pt: 0.5, color: C.darkGrey },
    rowH: 0.35,
    autoPage: false,
  });
}

// ---- SLIDE GENERATORS ----

function slideCover(pptx: PptxGenJS, d: ProposalData) {
  const slide = pptx.addSlide();

  // Cover backdrop — Electrification Specialists background image
  const coverBgPath = path.join(FONT_DIR, '..', '..', 'client', 'public', 'cover_backdrop.jpg');
  if (fs.existsSync(coverBgPath)) {
    slide.background = { path: coverBgPath };
  } else {
    slide.background = { color: C.black };
  }

  // Dark overlay rectangle for text legibility
  slide.addShape('rect' as any, {
    x: 0, y: 0, w: 10, h: 7.5,
    fill: { color: '0F172A', transparency: 30 },
    line: { color: '0F172A', width: 0 },
  });

  // Logo + Company Name
  const logoPath = path.join(FONT_DIR, 'elite-logo.jpg');
  if (fs.existsSync(logoPath)) {
    slide.addImage({ path: logoPath, x: 0.8, y: 0.5, w: 0.7, h: 0.7 });
  }
  slide.addText('ELITE SMART ENERGY SOLUTIONS', {
    x: 1.7, y: 0.55, w: 5, h: 0.4,
    fontSize: 20, fontFace: F.heading, color: C.white, bold: true, charSpacing: 2,
  });
  slide.addText('ELECTRIFICATION SPECIALISTS', {
    x: 1.7, y: 0.95, w: 5, h: 0.3,
    fontSize: 10, fontFace: F.label, color: '46B446', charSpacing: 3,
  });

  // Main Title
  slide.addText('IN-DEPTH BILL ANALYSIS\n& SOLAR BATTERY PROPOSAL', {
    x: 0.8, y: 2.0, w: 6.5, h: 1.6,
    fontSize: 34, fontFace: F.heading, color: C.white, bold: true, lineSpacing: 44,
  });

  // Solar Green accent bar
  slide.addShape('rect' as any, {
    x: 0.8, y: 4.0, w: 0.08, h: 1.0,
    fill: { color: '46B446' },
  });

  // Customer details
  slide.addText([
    { text: 'PREPARED FOR\n', options: { fontSize: 10, fontFace: F.label, color: C.ash } },
    { text: `${d.customerName}\n`, options: { fontSize: 20, fontFace: F.body, color: C.white, bold: true } },
    { text: d.address, options: { fontSize: 12, fontFace: F.body, color: C.ash } },
  ], {
    x: 1.1, y: 3.9, w: 5, h: 1.2,
  });

  // Solar Green line
  slide.addShape('rect' as any, {
    x: 0.8, y: 5.5, w: 8, h: 0.03,
    fill: { color: '46B446' },
  });

  // Prepared by
  slide.addText(`Prepared by ${BRAND.contact.name} — ${BRAND.contact.company}`, {
    x: 0.8, y: 6.8, w: 6, h: 0.3,
    fontSize: 10, fontFace: F.label, color: C.ash,
  });
}

function slideExecutiveSummary(pptx: PptxGenJS, d: ProposalData) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, 'Executive Summary', 'Your Energy Transformation');

  const startY = 1.5;

  // Key metrics in a 2x2 grid
  const metrics = [
    { label: 'CURRENT ANNUAL COST', value: fmtDollar(d.annualCost), color: C.orange },
    { label: 'PROJECTED ANNUAL SAVINGS', value: fmtDollar(d.annualSavings), color: C.aqua },
    { label: 'NET INVESTMENT', value: fmtDollar(d.netInvestment), color: C.white },
    { label: 'PAYBACK PERIOD', value: `${d.paybackYears.toFixed(1)} Years`, color: C.aqua },
  ];

  metrics.forEach((m, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = PAD_L + col * (CONTENT_W / 2 + 0.1);
    const y = startY + row * 1.4;
    const w = CONTENT_W / 2 - 0.1;

    // Card background
    slide.addShape('rect' as any, {
      x, y, w, h: 1.2,
      fill: { color: C.cardBg },
      line: { color: C.cardBorder, width: 0.5 },
      rectRadius: 0.08,
    });

    // Label
    slide.addText(m.label, {
      x: x + 0.2, y: y + 0.15, w: w - 0.4, h: 0.3,
      fontSize: 9, fontFace: F.label, color: C.ash,
    });

    // Value
    slide.addText(m.value, {
      x: x + 0.2, y: y + 0.45, w: w - 0.4, h: 0.6,
      fontSize: 32, fontFace: F.body, color: m.color, bold: true,
    });
  });

  // System recommendation summary
  slide.addText([
    { text: 'RECOMMENDED SYSTEM\n', options: { fontSize: 9, fontFace: F.label, color: C.ash } },
    { text: `${d.solarSizeKw}kW Solar + ${d.batterySizeKwh}kWh Battery`, options: { fontSize: 18, fontFace: F.body, color: C.white, bold: true } },
    { text: `\n${d.panelBrand} Panels  ·  ${d.batteryBrand}  ·  ${d.vppProvider} VPP`, options: { fontSize: 11, fontFace: F.body, color: C.ash } },
  ], {
    x: PAD_L, y: startY + 3.0, w: CONTENT_W, h: 1.0,
  });

  addCopyright(slide);
}

function slideBillAnalysis(pptx: PptxGenJS, d: ProposalData) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, 'Current Bill Analysis', `${d.retailer} · ${d.state}`);

  const startY = 1.5;
  const colW = CONTENT_W / 2 - 0.15;

  // LEFT: Bill Overview Table
  const billRows: TableRow[] = [
    { label: 'Retailer', value: d.retailer },
    { label: 'Billing Period', value: d.billPeriodStart && d.billPeriodEnd ? `${d.billPeriodStart} — ${d.billPeriodEnd}` : '—' },
    { label: 'Billing Days', value: d.billDays ? `${d.billDays} days` : '—' },
    { label: 'Total Bill Amount', value: d.billTotalAmount ? fmtDollar(d.billTotalAmount) : fmtDollar(d.annualCost / 4), valueColor: C.orange },
    { label: 'Total Usage', value: d.billTotalUsageKwh ? `${fmt(d.billTotalUsageKwh)} kWh` : `${fmt(d.dailyUsageKwh * (d.billDays || 90))} kWh` },
    { label: 'Daily Average Usage', value: `${fmt(d.dailyUsageKwh, 1)} kWh/day` },
    { label: 'Daily Average Cost', value: d.dailyAverageCost ? `$${fmt(d.dailyAverageCost, 2)}/day` : '—', valueColor: C.orange },
  ];

  addDataTable(slide, billRows, PAD_L, startY, colW, 'BILL OVERVIEW', '');

  // RIGHT: Tariff Rates Table
  const tariffRows: TableRow[] = [
    { label: 'Daily Supply Charge', value: `${fmt(d.supplyChargeCentsPerDay, 1)}c/day` },
    { label: 'Peak Rate', value: d.billPeakRateCents ? fmtCents(d.billPeakRateCents) + '/kWh' : fmtCents(d.usageRateCentsPerKwh) + '/kWh' },
  ];
  if (d.billOffPeakRateCents) tariffRows.push({ label: 'Off-Peak Rate', value: fmtCents(d.billOffPeakRateCents) + '/kWh' });
  if (d.billShoulderRateCents) tariffRows.push({ label: 'Shoulder Rate', value: fmtCents(d.billShoulderRateCents) + '/kWh' });
  tariffRows.push({ label: 'Feed-in Tariff', value: fmtCents(d.feedInTariffCentsPerKwh) + '/kWh', valueColor: C.aqua });
  if (d.billSolarExportsKwh) tariffRows.push({ label: 'Solar Exports', value: `${fmt(d.billSolarExportsKwh)} kWh`, valueColor: C.aqua });

  addDataTable(slide, tariffRows, PAD_L + colW + 0.3, startY, colW, 'TARIFF RATES', '');

  // Bottom: Annual Projections
  const annualY = startY + (billRows.length + 1) * 0.35 + 0.3;
  const annualRows: TableRow[] = [
    { label: 'Projected Annual Cost', value: fmtDollar(d.annualCost), valueColor: C.orange },
    { label: 'Annual Supply Charges', value: d.annualSupplyCharge ? fmtDollar(d.annualSupplyCharge) : '—' },
    { label: 'Annual Usage Charges', value: d.annualUsageCharge ? fmtDollar(d.annualUsageCharge) : '—' },
    { label: 'Annual Solar Credits', value: d.annualSolarCredit ? `-${fmtDollar(d.annualSolarCredit)}` : '—', valueColor: C.aqua },
    { label: 'Monthly Usage (est.)', value: d.monthlyUsageKwh ? `${fmt(d.monthlyUsageKwh)} kWh` : `${fmt(d.dailyUsageKwh * 30)} kWh` },
    { label: 'Yearly Usage (est.)', value: `${fmt(d.annualUsageKwh)} kWh` },
  ];

  addDataTable(slide, annualRows, PAD_L, annualY, CONTENT_W, 'ANNUAL PROJECTIONS', '');

  addCopyright(slide);
}

function slideUsageAnalysis(pptx: PptxGenJS, d: ProposalData) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, 'Usage Analysis', 'Time-of-Use Breakdown');

  const startY = 1.5;
  const colW = CONTENT_W / 2 - 0.15;

  // LEFT: Usage Breakdown
  const usageRows: TableRow[] = [];
  if (d.billPeakUsageKwh) usageRows.push({ label: 'Peak Usage', value: `${fmt(d.billPeakUsageKwh)} kWh` });
  if (d.billOffPeakUsageKwh) usageRows.push({ label: 'Off-Peak Usage', value: `${fmt(d.billOffPeakUsageKwh)} kWh` });
  if (d.billShoulderUsageKwh) usageRows.push({ label: 'Shoulder Usage', value: `${fmt(d.billShoulderUsageKwh)} kWh` });
  usageRows.push({ label: 'Total Period Usage', value: `${fmt(d.billTotalUsageKwh || d.dailyUsageKwh * (d.billDays || 90))} kWh` });
  usageRows.push({ label: 'Daily Average', value: `${fmt(d.dailyUsageKwh, 1)} kWh/day` });
  usageRows.push({ label: 'Monthly Average', value: `${fmt(d.monthlyUsageKwh || d.dailyUsageKwh * 30)} kWh/month` });
  usageRows.push({ label: 'Annual Projection', value: `${fmt(d.annualUsageKwh)} kWh/year`, valueColor: C.aqua });

  addDataTable(slide, usageRows, PAD_L, startY, colW, 'USAGE BREAKDOWN', '');

  // RIGHT: Cost Breakdown
  const costRows: TableRow[] = [
    { label: 'Annual Supply Charges', value: d.annualSupplyCharge ? fmtDollar(d.annualSupplyCharge) : fmtDollar(d.supplyChargeCentsPerDay / 100 * 365) },
    { label: 'Annual Usage Charges', value: d.annualUsageCharge ? fmtDollar(d.annualUsageCharge) : fmtDollar(d.annualUsageKwh * d.usageRateCentsPerKwh / 100) },
  ];
  if (d.annualSolarCredit) costRows.push({ label: 'Solar Feed-in Credits', value: `-${fmtDollar(d.annualSolarCredit)}`, valueColor: C.aqua });
  costRows.push({ label: 'Total Annual Cost', value: fmtDollar(d.annualCost), valueColor: C.orange });
  costRows.push({ label: 'Monthly Average Cost', value: fmtDollar(d.annualCost / 12) });
  costRows.push({ label: 'Daily Average Cost', value: d.dailyAverageCost ? `$${fmt(d.dailyAverageCost, 2)}` : `$${fmt(d.annualCost / 365, 2)}` });

  addDataTable(slide, costRows, PAD_L + colW + 0.3, startY, colW, 'COST BREAKDOWN', '');

  // Usage bar chart (simple visual)
  const barY = startY + Math.max(usageRows.length, costRows.length) * 0.35 + 1.0;
  const totalUsage = (d.billPeakUsageKwh || 0) + (d.billOffPeakUsageKwh || 0) + (d.billShoulderUsageKwh || 0);
  if (totalUsage > 0) {
    const peakPct = (d.billPeakUsageKwh || 0) / totalUsage;
    const offPeakPct = (d.billOffPeakUsageKwh || 0) / totalUsage;
    const shoulderPct = (d.billShoulderUsageKwh || 0) / totalUsage;

    slide.addText('USAGE DISTRIBUTION', {
      x: PAD_L, y: barY - 0.4, w: CONTENT_W, h: 0.3,
      fontSize: 9, fontFace: F.label, color: C.ash,
    });

    // Stacked bar
    let barX = PAD_L;
    const barW = CONTENT_W;
    const barH = 0.4;

    if (peakPct > 0) {
      slide.addShape('rect' as any, { x: barX, y: barY, w: barW * peakPct, h: barH, fill: { color: C.orange } });
      slide.addText(`Peak ${fmt(peakPct * 100)}%`, { x: barX, y: barY, w: barW * peakPct, h: barH, fontSize: 9, fontFace: F.body, color: C.black, align: 'center', valign: 'middle' });
      barX += barW * peakPct;
    }
    if (offPeakPct > 0) {
      slide.addShape('rect' as any, { x: barX, y: barY, w: barW * offPeakPct, h: barH, fill: { color: C.aqua } });
      slide.addText(`Off-Peak ${fmt(offPeakPct * 100)}%`, { x: barX, y: barY, w: barW * offPeakPct, h: barH, fontSize: 9, fontFace: F.body, color: C.black, align: 'center', valign: 'middle' });
      barX += barW * offPeakPct;
    }
    if (shoulderPct > 0) {
      slide.addShape('rect' as any, { x: barX, y: barY, w: barW * shoulderPct, h: barH, fill: { color: C.ash } });
      slide.addText(`Shoulder ${fmt(shoulderPct * 100)}%`, { x: barX, y: barY, w: barW * shoulderPct, h: barH, fontSize: 9, fontFace: F.body, color: C.white, align: 'center', valign: 'middle' });
    }
  }

  addCopyright(slide);
}

function slideYearlyProjection(pptx: PptxGenJS, d: ProposalData) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, 'Yearly Cost Projection', '25-Year Outlook at 3.5% Inflation');

  const startY = 1.5;

  // Build projection table
  const years = [1, 2, 3, 5, 7, 10, 15, 20, 25];
  const projRows: TableRow[] = years.map(yr => {
    const withoutSolar = d.annualCost * Math.pow(1.035, yr);
    const withSolar = Math.max(0, withoutSolar - d.annualSavings);
    const savings = withoutSolar - withSolar;
    return {
      label: `Year ${yr}`,
      value: `${fmtDollar(withoutSolar)}  →  ${fmtDollar(withSolar)}  (Save ${fmtDollar(savings)})`,
      valueColor: C.aqua,
    };
  });

  addDataTable(slide, projRows, PAD_L, startY, CONTENT_W, 'YEAR', 'WITHOUT SOLAR  →  WITH SOLAR  (SAVINGS)');

  // Summary cards at bottom
  const summaryY = startY + (projRows.length + 1) * 0.35 + 0.4;
  const cardW = CONTENT_W / 3 - 0.2;

  const summaryItems = [
    { label: '10-YEAR SAVINGS', value: fmtDollar(d.tenYearSavings), color: C.aqua },
    { label: '25-YEAR SAVINGS', value: d.twentyFiveYearSavings ? fmtDollar(d.twentyFiveYearSavings) : fmtDollar(d.tenYearSavings * 2.5), color: C.aqua },
    { label: 'PAYBACK PERIOD', value: `${d.paybackYears.toFixed(1)} Years`, color: C.white },
  ];

  summaryItems.forEach((item, i) => {
    const x = PAD_L + i * (cardW + 0.3);
    slide.addShape('rect' as any, {
      x, y: summaryY, w: cardW, h: 1.0,
      fill: { color: C.cardBg },
      line: { color: i < 2 ? C.aqua : C.cardBorder, width: 0.5 },
      rectRadius: 0.08,
    });
    slide.addText(item.label, { x: x + 0.15, y: summaryY + 0.1, w: cardW - 0.3, h: 0.25, fontSize: 9, fontFace: F.label, color: C.ash });
    slide.addText(item.value, { x: x + 0.15, y: summaryY + 0.4, w: cardW - 0.3, h: 0.5, fontSize: 28, fontFace: F.body, color: item.color, bold: true });
  });

  addCopyright(slide);
}

function slideGasFootprint(pptx: PptxGenJS, d: ProposalData) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, 'Current Gas Footprint', d.gasBillRetailer || 'Gas Analysis');

  const startY = 1.5;
  const colW = CONTENT_W / 2 - 0.15;

  // LEFT: Gas Bill Details
  const gasRows: TableRow[] = [
    { label: 'Gas Retailer', value: d.gasBillRetailer || '—' },
    { label: 'Billing Period', value: d.gasBillPeriodStart && d.gasBillPeriodEnd ? `${d.gasBillPeriodStart} — ${d.gasBillPeriodEnd}` : '—' },
    { label: 'Billing Days', value: d.gasBillDays ? `${d.gasBillDays} days` : '—' },
    { label: 'Total Bill Amount', value: d.gasBillTotalAmount ? fmtDollar(d.gasBillTotalAmount) : '—', valueColor: C.orange },
    { label: 'Gas Usage', value: d.gasBillUsageMj ? `${fmt(d.gasBillUsageMj)} MJ` : d.gasAnnualMJ ? `${fmt(d.gasAnnualMJ)} MJ/yr` : '—' },
    { label: 'Usage Rate', value: d.gasBillRateCentsMj ? `${fmt(d.gasBillRateCentsMj, 2)}c/MJ` : '—' },
    { label: 'Daily Supply Charge', value: d.gasDailySupplyCharge ? `${fmt(d.gasDailySupplyCharge, 2)}c/day` : '—' },
  ];

  addDataTable(slide, gasRows, PAD_L, startY, colW, 'GAS BILL DETAILS', '');

  // RIGHT: Annual Gas Projections
  const annualGasRows: TableRow[] = [
    { label: 'Annual Gas Cost', value: d.gasAnnualCost ? fmtDollar(d.gasAnnualCost) : '—', valueColor: C.orange },
    { label: 'Annual Supply Charges', value: d.gasAnnualSupplyCharge ? fmtDollar(d.gasAnnualSupplyCharge) : '—' },
    { label: 'Annual Usage (MJ)', value: d.gasAnnualMJ ? `${fmt(d.gasAnnualMJ)} MJ` : '—' },
    { label: 'kWh Equivalent', value: d.gasKwhEquivalent ? `${fmt(d.gasKwhEquivalent)} kWh` : '—' },
    { label: 'CO2 Emissions', value: d.gasCO2Emissions ? `${fmt(d.gasCO2Emissions, 1)} kg/yr` : '—', valueColor: C.orange },
    { label: 'Daily Gas Cost', value: d.gasDailyGasCost ? `$${fmt(d.gasDailyGasCost, 2)}/day` : '—' },
  ];

  addDataTable(slide, annualGasRows, PAD_L + colW + 0.3, startY, colW, 'ANNUAL GAS PROJECTIONS', '');

  // Insight box
  const insightY = startY + Math.max(gasRows.length, annualGasRows.length) * 0.35 + 1.0;
  slide.addShape('rect' as any, {
    x: PAD_L, y: insightY, w: CONTENT_W, h: 0.8,
    fill: { color: C.darkGrey },
    line: { color: C.orange, width: 1, dashType: 'solid' },
    rectRadius: 0.08,
  });
  slide.addText('Eliminating gas entirely removes both usage charges AND the daily supply charge — a double saving that accelerates your payback period significantly.', {
    x: PAD_L + 0.2, y: insightY + 0.1, w: CONTENT_W - 0.4, h: 0.6,
    fontSize: 11, fontFace: F.body, color: C.ash, italic: true,
  });

  addCopyright(slide);
}

function slideGasAppliances(pptx: PptxGenJS, d: ProposalData) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, 'Gas Appliance Inventory', 'Electrification Opportunities');

  const startY = 1.5;
  const apps = d.gasAppliances || {};

  const tableRows: PptxGenJS.TableRow[] = [
    [
      { text: 'APPLIANCE', options: { fontSize: 9, fontFace: F.label, color: C.aqua, bold: true, fill: { color: C.darkGrey } } },
      { text: 'TYPE', options: { fontSize: 9, fontFace: F.label, color: C.aqua, bold: true, fill: { color: C.darkGrey } } },
      { text: 'AGE', options: { fontSize: 9, fontFace: F.label, color: C.aqua, bold: true, align: 'center', fill: { color: C.darkGrey } } },
      { text: 'EST. ANNUAL COST', options: { fontSize: 9, fontFace: F.label, color: C.aqua, bold: true, align: 'right', fill: { color: C.darkGrey } } },
      { text: 'REPLACEMENT', options: { fontSize: 9, fontFace: F.label, color: C.aqua, bold: true, align: 'right', fill: { color: C.darkGrey } } },
    ],
  ];

  if (apps.hotWater) {
    tableRows.push([
      { text: 'Hot Water System', options: { fontSize: 11, fontFace: F.body, color: C.white } },
      { text: apps.hotWater.type || 'Gas Storage', options: { fontSize: 11, fontFace: F.body, color: C.ash } },
      { text: apps.hotWater.age ? `${apps.hotWater.age} yrs` : '—', options: { fontSize: 11, fontFace: F.body, color: C.ash, align: 'center' } },
      { text: apps.hotWater.annualCost ? fmtDollar(apps.hotWater.annualCost) : '—', options: { fontSize: 11, fontFace: F.body, color: C.orange, align: 'right' } },
      { text: 'Heat Pump HWS', options: { fontSize: 11, fontFace: F.body, color: C.aqua, align: 'right' } },
    ]);
  }
  if (apps.heating) {
    tableRows.push([
      { text: 'Heating System', options: { fontSize: 11, fontFace: F.body, color: C.white } },
      { text: apps.heating.type || 'Gas Ducted', options: { fontSize: 11, fontFace: F.body, color: C.ash } },
      { text: apps.heating.age ? `${apps.heating.age} yrs` : '—', options: { fontSize: 11, fontFace: F.body, color: C.ash, align: 'center' } },
      { text: apps.heating.annualCost ? fmtDollar(apps.heating.annualCost) : '—', options: { fontSize: 11, fontFace: F.body, color: C.orange, align: 'right' } },
      { text: 'Reverse Cycle AC', options: { fontSize: 11, fontFace: F.body, color: C.aqua, align: 'right' } },
    ]);
  }
  if (apps.cooktop) {
    tableRows.push([
      { text: 'Cooktop', options: { fontSize: 11, fontFace: F.body, color: C.white } },
      { text: apps.cooktop.type || 'Gas Cooktop', options: { fontSize: 11, fontFace: F.body, color: C.ash } },
      { text: '—', options: { fontSize: 11, fontFace: F.body, color: C.ash, align: 'center' } },
      { text: apps.cooktop.annualCost ? fmtDollar(apps.cooktop.annualCost) : '—', options: { fontSize: 11, fontFace: F.body, color: C.orange, align: 'right' } },
      { text: 'Induction Cooktop', options: { fontSize: 11, fontFace: F.body, color: C.aqua, align: 'right' } },
    ]);
  }
  if (apps.poolHeater) {
    tableRows.push([
      { text: 'Pool Heater', options: { fontSize: 11, fontFace: F.body, color: C.white } },
      { text: apps.poolHeater.type || 'Gas Pool Heater', options: { fontSize: 11, fontFace: F.body, color: C.ash } },
      { text: '—', options: { fontSize: 11, fontFace: F.body, color: C.ash, align: 'center' } },
      { text: apps.poolHeater.annualCost ? fmtDollar(apps.poolHeater.annualCost) : '—', options: { fontSize: 11, fontFace: F.body, color: C.orange, align: 'right' } },
      { text: 'Electric Heat Pump', options: { fontSize: 11, fontFace: F.body, color: C.aqua, align: 'right' } },
    ]);
  }

  slide.addTable(tableRows, {
    x: PAD_L, y: startY, w: CONTENT_W,
    colW: [CONTENT_W * 0.2, CONTENT_W * 0.2, CONTENT_W * 0.12, CONTENT_W * 0.22, CONTENT_W * 0.26],
    border: { type: 'solid', pt: 0.5, color: C.darkGrey },
    rowH: 0.45,
    autoPage: false,
  });

  addCopyright(slide);
}

function slideStrategicAssessment(pptx: PptxGenJS, d: ProposalData) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, 'Strategic Assessment', 'Tailored Recommendations');

  const startY = 1.5;
  const items = [
    { title: 'SOLAR PV SYSTEM', desc: `${d.solarSizeKw}kW system with ${d.panelCount}× ${d.panelBrand} ${d.panelWattage}W panels. Sized to cover ${fmt(d.annualUsageKwh)} kWh annual consumption plus battery charging and EV needs.`, color: C.aqua },
    { title: 'BATTERY STORAGE', desc: `${d.batterySizeKwh}kWh ${d.batteryBrand} system. Provides overnight home coverage, EV charging buffer, and VPP trading capacity for maximum return.`, color: C.aqua },
    { title: 'VPP PARTICIPATION', desc: `${d.vppProvider} ${d.vppProgram} — estimated ${fmtDollar(d.vppAnnualValue)}/year income through daily credits, event payments${d.hasGasBundle ? ', and gas bundle discount' : ''}.`, color: C.aqua },
  ];

  if (d.hasGas) {
    items.push({ title: 'FULL ELECTRIFICATION', desc: `Eliminate gas entirely — remove ${fmtDollar(d.gasAnnualCost || 0)}/year in gas costs plus daily supply charges. Replace with efficient heat pump hot water, reverse cycle AC, and induction cooking.`, color: C.orange });
  }
  if (d.hasEV) {
    items.push({ title: 'EV INTEGRATION', desc: `Solar-charged EV driving saves ${fmtDollar(d.evAnnualSavings || 0)}/year vs petrol. Smart charger enables off-peak and solar-priority charging.`, color: C.aqua });
  }

  items.forEach((item, i) => {
    const y = startY + i * 1.1;
    // Left accent bar
    slide.addShape('rect' as any, { x: PAD_L, y, w: 0.06, h: 0.85, fill: { color: item.color } });
    // Title
    slide.addText(item.title, { x: PAD_L + 0.2, y, w: CONTENT_W - 0.2, h: 0.3, fontSize: 13, fontFace: F.heading, color: C.white, bold: true });
    // Description
    slide.addText(item.desc, { x: PAD_L + 0.2, y: y + 0.3, w: CONTENT_W - 0.2, h: 0.55, fontSize: 11, fontFace: F.body, color: C.ash });
  });

  addCopyright(slide);
}

function slideBatteryRecommendation(pptx: PptxGenJS, d: ProposalData) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, 'Battery Recommendation', `${d.batteryBrand} · ${d.batterySizeKwh}kWh`);

  const startY = 1.5;
  const colW = CONTENT_W / 2 - 0.15;

  // LEFT: Sizing breakdown
  const homeOvernight = d.dailyUsageKwh * 0.3;
  const evCharging = d.hasEV ? 10 : 0;
  const vppTrading = d.batterySizeKwh - homeOvernight - evCharging;

  const sizingRows: TableRow[] = [
    { label: 'Home Overnight Load', value: `${fmt(homeOvernight, 1)} kWh` },
    { label: 'EV Charging Buffer', value: d.hasEV ? `${fmt(evCharging, 1)} kWh` : 'N/A' },
    { label: 'VPP Trading Capacity', value: `${fmt(Math.max(0, vppTrading), 1)} kWh`, valueColor: C.aqua },
    { label: 'Total Battery Size', value: `${d.batterySizeKwh} kWh`, valueColor: C.white },
    { label: 'Battery Brand', value: d.batteryBrand },
    { label: 'Module Size', value: '8.06 kWh' },
    { label: 'Modules Required', value: `${Math.ceil(d.batterySizeKwh / 8.06)}` },
  ];

  addDataTable(slide, sizingRows, PAD_L, startY, colW, 'SIZING BREAKDOWN', '');

  // RIGHT: Financial impact
  const financialRows: TableRow[] = [
    { label: 'Battery Investment', value: d.investmentBattery ? fmtDollar(d.investmentBattery) : '—' },
    { label: 'Battery Rebate', value: d.batteryRebateAmount ? `-${fmtDollar(d.batteryRebateAmount)}` : '—', valueColor: C.aqua },
    { label: 'Net Battery Cost', value: d.investmentBattery && d.batteryRebateAmount ? fmtDollar(d.investmentBattery - d.batteryRebateAmount) : '—' },
    { label: 'VPP Annual Income', value: fmtDollar(d.vppAnnualValue), valueColor: C.aqua },
    { label: 'Self-Consumption Savings', value: fmtDollar(d.dailyUsageKwh * 0.3 * 365 * d.usageRateCentsPerKwh / 100), valueColor: C.aqua },
    { label: 'Battery Payback', value: d.investmentBattery ? `${fmt((d.investmentBattery - (d.batteryRebateAmount || 0)) / (d.vppAnnualValue + d.dailyUsageKwh * 0.3 * 365 * d.usageRateCentsPerKwh / 100), 1)} years` : '—' },
  ];

  addDataTable(slide, financialRows, PAD_L + colW + 0.3, startY, colW, 'FINANCIAL IMPACT', '');

  addCopyright(slide);
}

function slideSolarSystem(pptx: PptxGenJS, d: ProposalData) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, 'Solar PV System', `${d.panelBrand} · ${d.solarSizeKw}kW`);

  const startY = 1.5;
  const colW = CONTENT_W / 2 - 0.15;

  // LEFT: System specs
  const specRows: TableRow[] = [
    { label: 'System Size', value: `${d.solarSizeKw} kW` },
    { label: 'Panel Brand', value: d.panelBrand },
    { label: 'Panel Wattage', value: `${d.panelWattage}W` },
    { label: 'Panel Count', value: `${d.panelCount} panels` },
    { label: 'Inverter', value: `${d.inverterBrand} ${d.inverterSizeKw}kW` },
    { label: 'Est. Annual Generation', value: `${fmt(d.solarSizeKw * 4 * 365)} kWh`, valueColor: C.aqua },
    { label: 'Coverage of Usage', value: `${fmt(Math.min(100, (d.solarSizeKw * 4 * 365) / d.annualUsageKwh * 100))}%`, valueColor: C.aqua },
  ];

  addDataTable(slide, specRows, PAD_L, startY, colW, 'SYSTEM SPECIFICATIONS', '');

  // RIGHT: Financial
  const solarFinRows: TableRow[] = [
    { label: 'Solar Investment', value: d.investmentSolar ? fmtDollar(d.investmentSolar) : '—' },
    { label: 'STC Rebate', value: d.solarRebateAmount ? `-${fmtDollar(d.solarRebateAmount)}` : '—', valueColor: C.aqua },
    { label: 'Net Solar Cost', value: d.investmentSolar && d.solarRebateAmount ? fmtDollar(d.investmentSolar - d.solarRebateAmount) : '—' },
    { label: 'Annual Generation Value', value: fmtDollar(d.solarSizeKw * 4 * 365 * d.usageRateCentsPerKwh / 100), valueColor: C.aqua },
    { label: 'Feed-in Revenue', value: fmtDollar(d.billSolarExportsKwh ? d.billSolarExportsKwh * d.feedInTariffCentsPerKwh / 100 * 4 : d.solarSizeKw * 4 * 365 * 0.3 * d.feedInTariffCentsPerKwh / 100), valueColor: C.aqua },
  ];

  addDataTable(slide, solarFinRows, PAD_L + colW + 0.3, startY, colW, 'FINANCIAL IMPACT', '');

  addCopyright(slide);
}

function slideVppComparison(pptx: PptxGenJS, d: ProposalData) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, 'VPP Provider Comparison', `${d.state} · Top Providers`);

  // This slide shows the VPP comparison - data comes from the calculation engine
  const startY = 1.5;

  slide.addText('Virtual Power Plant providers are ranked by estimated annual value for your location and energy profile. The recommended provider maximises your return through daily credits, event payments, and bundle discounts.', {
    x: PAD_L, y: startY, w: CONTENT_W, h: 0.6,
    fontSize: 11, fontFace: F.body, color: C.ash,
  });

  // Recommended provider highlight
  slide.addShape('rect' as any, {
    x: PAD_L, y: startY + 0.8, w: CONTENT_W, h: 1.2,
    fill: { color: C.cardBg },
    line: { color: C.aqua, width: 1 },
    rectRadius: 0.08,
  });

  slide.addText('RECOMMENDED PROVIDER', {
    x: PAD_L + 0.2, y: startY + 0.9, w: 3, h: 0.25,
    fontSize: 9, fontFace: F.label, color: C.aqua,
  });
  slide.addText(`${d.vppProvider} — ${d.vppProgram}`, {
    x: PAD_L + 0.2, y: startY + 1.15, w: 5, h: 0.4,
    fontSize: 22, fontFace: F.body, color: C.white, bold: true,
  });
  slide.addText(fmtDollar(d.vppAnnualValue) + '/year', {
    x: SLIDE_W - PAD_R - 3, y: startY + 1.0, w: 2.5, h: 0.8,
    fontSize: 36, fontFace: F.body, color: C.aqua, bold: true, align: 'right',
  });

  // VPP value breakdown
  const vppY = startY + 2.3;
  const vppRows: TableRow[] = [];
  if (d.vppDailyCreditAnnual) vppRows.push({ label: 'Daily Credits (365 days)', value: fmtDollar(d.vppDailyCreditAnnual), valueColor: C.aqua });
  if (d.vppEventPaymentsAnnual) vppRows.push({ label: 'Event Payments', value: fmtDollar(d.vppEventPaymentsAnnual), valueColor: C.aqua });
  if (d.vppBundleDiscount) vppRows.push({ label: 'Gas Bundle Discount', value: fmtDollar(d.vppBundleDiscount), valueColor: C.aqua });
  vppRows.push({ label: 'Total Annual VPP Value', value: fmtDollar(d.vppAnnualValue), valueColor: C.aqua });

  addDataTable(slide, vppRows, PAD_L, vppY, CONTENT_W / 2, 'VALUE BREAKDOWN', '');

  addCopyright(slide);
}

function slideVppRecommendation(pptx: PptxGenJS, d: ProposalData) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, 'VPP Recommendation', `${d.vppProvider} · ${d.vppProgram}`);

  const startY = 1.5;

  // Key benefits
  const benefits = [
    `Annual VPP income of ${fmtDollar(d.vppAnnualValue)} through daily credits and event payments`,
    d.hasGasBundle ? `Gas + electricity bundle discount of ${fmtDollar(d.vppBundleDiscount || 0)}/year` : 'No gas bundle required — standalone electricity plan',
    `Compatible with ${d.batteryBrand} ${d.batterySizeKwh}kWh battery system`,
    'Automated battery dispatch — no manual intervention required',
    'Real-time monitoring via provider app',
  ];

  benefits.forEach((b, i) => {
    slide.addText(`✓  ${b}`, {
      x: PAD_L, y: startY + i * 0.5, w: CONTENT_W, h: 0.4,
      fontSize: 12, fontFace: F.body, color: C.white,
    });
  });

  addCopyright(slide);
}

function slideElectrification(pptx: PptxGenJS, d: ProposalData, type: 'hot_water' | 'heating' | 'induction') {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);

  const configs = {
    hot_water: {
      title: 'Hot Water Electrification',
      subtitle: 'Heat Pump Hot Water System',
      currentLabel: 'Gas Hot Water Cost',
      currentCost: d.hotWaterCurrentGasCost,
      newLabel: 'Heat Pump Running Cost',
      newCost: d.hotWaterHeatPumpCost,
      savings: d.heatPumpSavings,
      extraRows: d.hotWaterDailySupplySaved ? [{ label: 'Daily Supply Charge Saved', value: fmtDollar(d.hotWaterDailySupplySaved * 365) + '/yr', valueColor: C.aqua }] : [],
    },
    heating: {
      title: 'Heating & Cooling Upgrade',
      subtitle: 'Reverse Cycle Air Conditioning',
      currentLabel: 'Gas Heating Cost',
      currentCost: d.heatingCurrentGasCost,
      newLabel: 'Reverse Cycle AC Cost',
      newCost: d.heatingRcAcCost,
      savings: d.heatingCoolingSavings,
      extraRows: [],
    },
    induction: {
      title: 'Induction Cooking Upgrade',
      subtitle: 'Premium Induction Cooktop',
      currentLabel: 'Gas Cooktop Cost',
      currentCost: d.cookingCurrentGasCost,
      newLabel: 'Induction Running Cost',
      newCost: d.cookingInductionCost,
      savings: d.inductionSavings,
      extraRows: [],
    },
  };

  const cfg = configs[type];
  addSlideHeader(slide, cfg.title, cfg.subtitle);

  const startY = 1.5;
  const rows: TableRow[] = [
    { label: cfg.currentLabel, value: cfg.currentCost ? fmtDollar(cfg.currentCost) + '/yr' : '—', valueColor: C.orange },
    { label: cfg.newLabel, value: cfg.newCost ? fmtDollar(cfg.newCost) + '/yr' : '—', valueColor: C.aqua },
    ...cfg.extraRows,
    { label: 'Annual Savings', value: cfg.savings ? fmtDollar(cfg.savings) + '/yr' : '—', valueColor: C.aqua },
  ];

  addDataTable(slide, rows, PAD_L, startY, CONTENT_W / 2, 'COST COMPARISON', '');

  addCopyright(slide);
}

function slideEvAnalysis(pptx: PptxGenJS, d: ProposalData) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, 'EV Analysis', `${fmt(d.evAnnualKm || 10000)} km/year`);

  const startY = 1.5;
  const colW = CONTENT_W / 2 - 0.15;

  const evRows: TableRow[] = [
    { label: 'Annual Distance', value: `${fmt(d.evAnnualKm || 10000)} km` },
    { label: 'EV Consumption', value: d.evConsumptionPer100km ? `${fmt(d.evConsumptionPer100km, 1)} kWh/100km` : '15 kWh/100km' },
    { label: 'Petrol Price', value: d.evPetrolPricePerLitre ? `$${fmt(d.evPetrolPricePerLitre, 2)}/L` : '$1.80/L' },
    { label: 'Annual Petrol Cost', value: d.evPetrolCost ? fmtDollar(d.evPetrolCost) : '—', valueColor: C.orange },
    { label: 'Annual Grid Charge Cost', value: d.evGridChargeCost ? fmtDollar(d.evGridChargeCost) : '—' },
    { label: 'Annual Solar Charge Cost', value: d.evSolarChargeCost !== undefined ? fmtDollar(d.evSolarChargeCost) : '$0', valueColor: C.aqua },
    { label: 'Annual EV Savings', value: d.evAnnualSavings ? fmtDollar(d.evAnnualSavings) : '—', valueColor: C.aqua },
  ];

  addDataTable(slide, evRows, PAD_L, startY, colW, 'EV COST COMPARISON', '');

  addCopyright(slide);
}

function slideEvCharger(pptx: PptxGenJS, d: ProposalData) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, 'EV Charger Recommendation', 'Smart Home Charging');

  const startY = 1.5;
  const features = [
    'Solar-priority charging — charges from excess solar first',
    'Scheduled charging — set off-peak charging windows',
    'Load management — prevents circuit overload',
    'App control — monitor and control remotely',
    'VPP compatible — participates in grid events',
  ];

  features.forEach((f, i) => {
    slide.addText(`✓  ${f}`, {
      x: PAD_L, y: startY + i * 0.45, w: CONTENT_W, h: 0.35,
      fontSize: 12, fontFace: F.body, color: C.white,
    });
  });

  if (d.investmentEvCharger) {
    slide.addShape('rect' as any, {
      x: PAD_L, y: startY + 3.0, w: 3, h: 0.8,
      fill: { color: C.cardBg },
      line: { color: C.orange, width: 0.5 },
      rectRadius: 0.08,
    });
    slide.addText('INSTALLED COST', { x: PAD_L + 0.15, y: startY + 3.05, w: 2.7, h: 0.25, fontSize: 9, fontFace: F.label, color: C.ash });
    slide.addText(fmtDollar(d.investmentEvCharger), { x: PAD_L + 0.15, y: startY + 3.3, w: 2.7, h: 0.45, fontSize: 28, fontFace: F.body, color: C.white, bold: true });
  }

  addCopyright(slide);
}

function slidePoolHeatPump(pptx: PptxGenJS, d: ProposalData) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, 'Pool Heat Pump', 'Energy-Efficient Pool Heating');

  const startY = 1.5;
  const rows: TableRow[] = [
    { label: 'Recommended Size', value: d.poolRecommendedKw ? `${d.poolRecommendedKw} kW` : '—' },
    { label: 'Annual Operating Cost', value: d.poolAnnualOperatingCost ? fmtDollar(d.poolAnnualOperatingCost) : '—' },
    { label: 'Annual Savings', value: d.poolPumpSavings ? fmtDollar(d.poolPumpSavings) : '—', valueColor: C.aqua },
    { label: 'Investment Cost', value: d.investmentPoolHeatPump ? fmtDollar(d.investmentPoolHeatPump) : '—' },
  ];

  addDataTable(slide, rows, PAD_L, startY, CONTENT_W / 2, 'POOL HEAT PUMP DETAILS', '');

  addCopyright(slide);
}

function slideElectrificationInvestment(pptx: PptxGenJS, d: ProposalData) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, 'Electrification Investment', 'Complete Gas Elimination');

  const startY = 1.5;

  // Build investment table
  const investRows: PptxGenJS.TableRow[] = [
    [
      { text: 'ITEM', options: { fontSize: 9, fontFace: F.label, color: C.aqua, bold: true, fill: { color: C.darkGrey } } },
      { text: 'COST', options: { fontSize: 9, fontFace: F.label, color: C.aqua, bold: true, align: 'right', fill: { color: C.darkGrey } } },
      { text: 'REBATE', options: { fontSize: 9, fontFace: F.label, color: C.aqua, bold: true, align: 'right', fill: { color: C.darkGrey } } },
      { text: 'NET', options: { fontSize: 9, fontFace: F.label, color: C.aqua, bold: true, align: 'right', fill: { color: C.darkGrey } } },
    ],
  ];

  const items = [
    { name: 'Solar PV System', cost: d.investmentSolar, rebate: d.solarRebateAmount },
    { name: 'Battery Storage', cost: d.investmentBattery, rebate: d.batteryRebateAmount },
    { name: 'Heat Pump Hot Water', cost: d.investmentHeatPumpHw, rebate: d.heatPumpHwRebateAmount },
    { name: 'Reverse Cycle AC', cost: d.investmentRcAc, rebate: d.heatPumpAcRebateAmount },
    { name: 'Induction Cooktop', cost: d.investmentInduction, rebate: 0 },
    { name: 'EV Charger', cost: d.investmentEvCharger, rebate: 0 },
    { name: 'Pool Heat Pump', cost: d.investmentPoolHeatPump, rebate: 0 },
  ].filter(i => i.cost && i.cost > 0);

  items.forEach(item => {
    const rebate = item.rebate || 0;
    investRows.push([
      { text: item.name, options: { fontSize: 11, fontFace: F.body, color: C.white } },
      { text: fmtDollar(item.cost!), options: { fontSize: 11, fontFace: F.body, color: C.white, align: 'right' } },
      { text: rebate > 0 ? `-${fmtDollar(rebate)}` : '—', options: { fontSize: 11, fontFace: F.body, color: C.aqua, align: 'right' } },
      { text: fmtDollar(item.cost! - rebate), options: { fontSize: 11, fontFace: F.body, color: C.white, align: 'right', bold: true } },
    ]);
  });

  // Total row
  investRows.push([
    { text: 'TOTAL', options: { fontSize: 11, fontFace: F.body, color: C.white, bold: true, fill: { color: C.darkGrey } } },
    { text: fmtDollar(d.systemCost), options: { fontSize: 11, fontFace: F.body, color: C.white, bold: true, align: 'right', fill: { color: C.darkGrey } } },
    { text: `-${fmtDollar(d.rebateAmount)}`, options: { fontSize: 11, fontFace: F.body, color: C.aqua, bold: true, align: 'right', fill: { color: C.darkGrey } } },
    { text: fmtDollar(d.netInvestment), options: { fontSize: 11, fontFace: F.body, color: C.white, bold: true, align: 'right', fill: { color: C.darkGrey } } },
  ]);

  slide.addTable(investRows, {
    x: PAD_L, y: startY, w: CONTENT_W,
    colW: [CONTENT_W * 0.4, CONTENT_W * 0.2, CONTENT_W * 0.2, CONTENT_W * 0.2],
    border: { type: 'solid', pt: 0.5, color: C.darkGrey },
    rowH: 0.4,
    autoPage: false,
  });

  addCopyright(slide);
}

function slideSavingsSummary(pptx: PptxGenJS, d: ProposalData) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, 'Total Savings Summary', 'Combined Annual Benefit');

  const startY = 1.5;

  // Build savings breakdown
  const savingsItems: { category: string; value: number; color: string }[] = [
    { category: 'Solar Self-Consumption', value: Math.round(d.annualSavings * 0.4), color: C.aqua },
    { category: 'VPP Income', value: d.vppAnnualValue, color: C.aqua },
  ];
  if (d.hasGas && d.gasAnnualCost) savingsItems.push({ category: 'Gas Elimination', value: d.gasAnnualCost, color: C.orange });
  if (d.evAnnualSavings) savingsItems.push({ category: 'EV Fuel Savings', value: d.evAnnualSavings, color: C.aqua });
  if (d.poolPumpSavings) savingsItems.push({ category: 'Pool Heat Pump', value: d.poolPumpSavings, color: C.aqua });

  const totalBenefit = savingsItems.reduce((sum, s) => sum + s.value, 0);

  // Savings table
  const savingsRows: TableRow[] = savingsItems.map(s => ({
    label: s.category,
    value: fmtDollar(s.value),
    valueColor: s.color,
  }));
  savingsRows.push({ label: 'TOTAL ANNUAL BENEFIT', value: fmtDollar(totalBenefit), valueColor: C.aqua });

  addDataTable(slide, savingsRows, PAD_L, startY, CONTENT_W / 2, 'SAVINGS BREAKDOWN', '');

  // Big total card
  slide.addShape('rect' as any, {
    x: PAD_L + CONTENT_W / 2 + 0.3, y: startY, w: CONTENT_W / 2 - 0.3, h: 2.0,
    fill: { color: C.cardBg },
    line: { color: C.aqua, width: 1 },
    rectRadius: 0.08,
  });
  slide.addText('TOTAL ANNUAL BENEFIT', {
    x: PAD_L + CONTENT_W / 2 + 0.5, y: startY + 0.2, w: CONTENT_W / 2 - 0.7, h: 0.3,
    fontSize: 9, fontFace: F.label, color: C.aqua,
  });
  slide.addText(fmtDollar(totalBenefit), {
    x: PAD_L + CONTENT_W / 2 + 0.5, y: startY + 0.6, w: CONTENT_W / 2 - 0.7, h: 0.8,
    fontSize: 48, fontFace: F.body, color: C.white, bold: true,
  });
  slide.addText('Tax-Free Savings', {
    x: PAD_L + CONTENT_W / 2 + 0.5, y: startY + 1.4, w: CONTENT_W / 2 - 0.7, h: 0.3,
    fontSize: 11, fontFace: F.body, color: C.ash,
  });

  addCopyright(slide);
}

function slideFinancialSummary(pptx: PptxGenJS, d: ProposalData) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, 'Financial Summary', 'Investment & Returns');

  const startY = 1.5;
  const colW = CONTENT_W / 2 - 0.15;

  // LEFT: Investment
  const investRows: TableRow[] = [
    { label: 'Total System Cost', value: fmtDollar(d.systemCost) },
    { label: 'Government Rebates', value: `-${fmtDollar(d.rebateAmount)}`, valueColor: C.aqua },
    { label: 'Net Investment', value: fmtDollar(d.netInvestment), valueColor: C.orange },
  ];

  addDataTable(slide, investRows, PAD_L, startY, colW, 'INVESTMENT', '');

  // RIGHT: Returns
  const returnRows: TableRow[] = [
    { label: 'Annual Benefit', value: fmtDollar(d.annualSavings), valueColor: C.aqua },
    { label: 'Payback Period', value: `${d.paybackYears.toFixed(1)} years` },
    { label: '10-Year Savings', value: fmtDollar(d.tenYearSavings), valueColor: C.aqua },
    { label: '25-Year Savings', value: d.twentyFiveYearSavings ? fmtDollar(d.twentyFiveYearSavings) : fmtDollar(d.tenYearSavings * 2.5), valueColor: C.aqua },
  ];

  addDataTable(slide, returnRows, PAD_L + colW + 0.3, startY, colW, 'PROJECTED RETURNS', '');

  addCopyright(slide);
}

function slideEnvironmental(pptx: PptxGenJS, d: ProposalData) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, 'Environmental Impact', 'Your Carbon Reduction');

  const startY = 1.5;
  const treesEquiv = d.treesEquivalent || Math.round(d.co2ReductionTonnes * 50);
  const carsOffRoad = Math.round(d.co2ReductionTonnes / 4.6 * 10) / 10;

  const envRows: TableRow[] = [
    { label: 'Annual CO2 Reduction', value: `${fmt(d.co2ReductionTonnes, 1)} tonnes`, valueColor: C.aqua },
    { label: '25-Year CO2 Reduction', value: `${fmt(d.co2ReductionTonnes * 25)} tonnes`, valueColor: C.aqua },
    { label: 'Trees Equivalent', value: `${treesEquiv} trees/year`, valueColor: C.aqua },
    { label: 'Cars Off Road Equivalent', value: `${carsOffRoad}`, valueColor: C.orange },
  ];
  if (d.co2CurrentTonnes) envRows.push({ label: 'Current CO2 Emissions', value: `${fmt(d.co2CurrentTonnes, 1)} tonnes/yr`, valueColor: C.orange });
  if (d.co2ProjectedTonnes) envRows.push({ label: 'Projected CO2 Emissions', value: `${fmt(d.co2ProjectedTonnes, 1)} tonnes/yr`, valueColor: C.aqua });
  if (d.co2ReductionPercent) envRows.push({ label: 'CO2 Reduction', value: `${fmt(d.co2ReductionPercent)}%`, valueColor: C.aqua });

  const energyIndep = d.energyIndependenceScore || Math.min(95, Math.round((d.solarSizeKw * 4 * 365) / d.annualUsageKwh * 100));
  envRows.push({ label: 'Energy Independence Score', value: `${energyIndep}%`, valueColor: C.aqua });

  addDataTable(slide, envRows, PAD_L, startY, CONTENT_W / 2, 'ENVIRONMENTAL METRICS', '');

  addCopyright(slide);
}

function slideRoadmap(pptx: PptxGenJS, d: ProposalData) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, 'Recommended Roadmap', 'Your Path to Energy Independence');

  const startY = 1.5;
  const steps = [
    { num: '01', title: 'SITE ASSESSMENT', desc: 'Professional site inspection, roof analysis, switchboard review, and system design.', timeline: 'Week 1-2', color: C.aqua },
    { num: '02', title: 'SYSTEM INSTALLATION', desc: 'Solar panels, battery, inverter installation by CEC-accredited installers.', timeline: 'Week 3-4', color: C.aqua },
    { num: '03', title: 'ELECTRIFICATION', desc: 'Heat pump hot water, reverse cycle AC, induction cooktop installation.', timeline: 'Week 4-6', color: C.orange },
    { num: '04', title: 'VPP ACTIVATION', desc: `Enrol in ${d.vppProvider} ${d.vppProgram}. Start earning from day one.`, timeline: 'Week 6-8', color: C.aqua },
  ];

  const stepW = (CONTENT_W - 0.6) / steps.length;
  steps.forEach((s, i) => {
    const x = PAD_L + i * (stepW + 0.2);
    // Card
    slide.addShape('rect' as any, {
      x, y: startY, w: stepW, h: 3.5,
      fill: { color: C.cardBg },
      line: { color: s.color, width: 0.5 },
      rectRadius: 0.08,
    });
    // Top accent
    slide.addShape('rect' as any, { x, y: startY, w: stepW, h: 0.04, fill: { color: s.color } });
    // Number
    slide.addText(s.num, { x: x + 0.15, y: startY + 0.2, w: 1, h: 0.5, fontSize: 28, fontFace: F.heading, color: C.cardBorder });
    // Title
    slide.addText(s.title, { x: x + 0.15, y: startY + 0.8, w: stepW - 0.3, h: 0.4, fontSize: 11, fontFace: F.heading, color: C.white, bold: true });
    // Description
    slide.addText(s.desc, { x: x + 0.15, y: startY + 1.3, w: stepW - 0.3, h: 1.2, fontSize: 10, fontFace: F.body, color: C.ash });
    // Timeline
    slide.addText(s.timeline, { x: x + 0.15, y: startY + 2.8, w: stepW - 0.3, h: 0.3, fontSize: 10, fontFace: F.label, color: s.color });
  });

  addCopyright(slide);
}

function slideConclusion(pptx: PptxGenJS, d: ProposalData) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, 'Conclusion', 'Your Energy Future');

  const startY = 1.5;

  // Key outcomes
  const outcomes = [
    { icon: '⚡', title: 'ENERGY SAVINGS', value: `${fmtDollar(d.annualSavings)}/year`, color: C.aqua },
    { icon: '🔋', title: 'ENERGY STORAGE', value: `${d.batterySizeKwh}kWh Battery`, color: C.aqua },
    { icon: '☀️', title: 'SOLAR GENERATION', value: `${d.solarSizeKw}kW System`, color: C.aqua },
    { icon: '💰', title: 'PAYBACK PERIOD', value: `${d.paybackYears.toFixed(1)} Years`, color: C.orange },
  ];

  const cardW = (CONTENT_W - 0.6) / outcomes.length;
  outcomes.forEach((o, i) => {
    const x = PAD_L + i * (cardW + 0.2);
    slide.addShape('rect' as any, {
      x, y: startY, w: cardW, h: 1.5,
      fill: { color: C.cardBg },
      line: { color: o.color, width: 0.5 },
      rectRadius: 0.08,
    });
    slide.addText(o.icon, { x, y: startY + 0.1, w: cardW, h: 0.4, fontSize: 24, align: 'center' });
    slide.addText(o.title, { x: x + 0.1, y: startY + 0.5, w: cardW - 0.2, h: 0.3, fontSize: 9, fontFace: F.label, color: C.ash, align: 'center' });
    slide.addText(o.value, { x: x + 0.1, y: startY + 0.85, w: cardW - 0.2, h: 0.5, fontSize: 18, fontFace: F.body, color: o.color, bold: true, align: 'center' });
  });

  // Quote
  slide.addText('Your investment in solar, battery, and electrification delivers immediate savings, long-term wealth creation, and a meaningful reduction in carbon emissions.', {
    x: PAD_L + 1, y: startY + 2.2, w: CONTENT_W - 2, h: 0.8,
    fontSize: 14, fontFace: F.heading, color: C.white, align: 'center', bold: true,
  });

  // CTA
  slide.addShape('rect' as any, { x: PAD_L + 3, y: startY + 3.3, w: CONTENT_W - 6, h: 0.02, fill: { color: C.aqua } });
  slide.addText('Ready to start your energy transformation?', {
    x: PAD_L, y: startY + 3.5, w: CONTENT_W, h: 0.4,
    fontSize: 14, fontFace: F.label, color: C.aqua, align: 'center',
  });

  addCopyright(slide);
}

function slideContact(pptx: PptxGenJS, d: ProposalData) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };

  // Centered logo
  const logoPath = path.join(FONT_DIR, 'elite-logo.jpg');
  if (fs.existsSync(logoPath)) {
    slide.addImage({ path: logoPath, x: SLIDE_W / 2 - 0.5, y: 1.0, w: 1.0, h: 1.0 });
  }

  // Thank You
  slide.addText('THANK YOU', {
    x: 0, y: 2.2, w: SLIDE_W, h: 0.8,
    fontSize: 42, fontFace: F.heading, color: C.white, bold: true, align: 'center',
  });

  slide.addText("Let's power your future together", {
    x: 0, y: 2.9, w: SLIDE_W, h: 0.5,
    fontSize: 16, fontFace: F.label, color: C.aqua, italic: true, align: 'center',
  });

  // Contact details
  const contactY = 3.8;
  const contactItems = [
    { label: 'PREPARED BY', value: BRAND.contact.name, sub: `${BRAND.contact.title}\n${BRAND.contact.company}` },
    { label: 'CONTACT', value: `${BRAND.contact.phone}\n${BRAND.contact.email}`, sub: BRAND.contact.website },
    { label: 'LOCATION', value: BRAND.contact.address, sub: '' },
  ];

  const colW = CONTENT_W / 3;
  contactItems.forEach((item, i) => {
    const x = PAD_L + i * colW;
    slide.addText(item.label, { x, y: contactY, w: colW, h: 0.25, fontSize: 9, fontFace: F.label, color: C.ash });
    slide.addText(item.value, { x, y: contactY + 0.3, w: colW, h: 0.5, fontSize: 12, fontFace: F.body, color: C.white });
    if (item.sub) {
      slide.addText(item.sub, { x, y: contactY + 0.8, w: colW, h: 0.4, fontSize: 10, fontFace: F.body, color: C.aqua });
    }
  });

  // Next steps
  const stepsY = 5.2;
  slide.addShape('rect' as any, {
    x: PAD_L + 2, y: stepsY, w: CONTENT_W - 4, h: 1.5,
    fill: { color: C.cardBg },
    line: { color: C.aqua, width: 0.5 },
    rectRadius: 0.08,
  });
  slide.addText('YOUR NEXT STEPS', { x: PAD_L + 2.2, y: stepsY + 0.1, w: CONTENT_W - 4.4, h: 0.25, fontSize: 9, fontFace: F.label, color: C.aqua });

  const nextSteps = [
    'Review this proposal and discuss with your household',
    'Schedule a site assessment with Elite Smart Energy Solutions',
    'Confirm system configuration and financing options',
    'Installation and activation within 6-8 weeks',
  ];
  nextSteps.forEach((step, i) => {
    slide.addText(`${i + 1}.  ${step}`, {
      x: PAD_L + 2.4, y: stepsY + 0.4 + i * 0.25, w: CONTENT_W - 4.8, h: 0.25,
      fontSize: 11, fontFace: F.body, color: C.white,
    });
  });

  addCopyright(slide);
}

// ---- MAIN EXPORT ----

export async function generatePptx(data: ProposalData): Promise<Buffer> {
  await ensureAssets();
  const pptx = new PptxCtor();

  // Presentation metadata
  pptx.author = BRAND.contact.name;
  pptx.company = BRAND.contact.company;
  pptx.title = `${data.customerName} — Solar & Battery Proposal`;
  pptx.subject = 'In-Depth Bill Analysis & Solar Battery Proposal';
  pptx.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5 inches (16:9)

  // Generate all slides in order
  slideCover(pptx, data);
  slideExecutiveSummary(pptx, data);
  slideBillAnalysis(pptx, data);
  slideUsageAnalysis(pptx, data);
  slideYearlyProjection(pptx, data);

  // Conditional: Gas slides
  if (data.hasGas) {
    slideGasFootprint(pptx, data);
    if (data.gasAppliances) {
      slideGasAppliances(pptx, data);
    }
  }

  slideStrategicAssessment(pptx, data);
  slideBatteryRecommendation(pptx, data);
  slideSolarSystem(pptx, data);
  slideVppComparison(pptx, data);
  slideVppRecommendation(pptx, data);

  // Conditional: Electrification slides
  if (data.hasGas) {
    if (data.heatPumpSavings) slideElectrification(pptx, data, 'hot_water');
    if (data.heatingCoolingSavings) slideElectrification(pptx, data, 'heating');
    if (data.inductionSavings) slideElectrification(pptx, data, 'induction');
  }

  // Conditional: EV slides
  if (data.hasEV) {
    slideEvAnalysis(pptx, data);
    slideEvCharger(pptx, data);
  }

  // Conditional: Pool
  if (data.hasPoolPump && data.poolPumpSavings) {
    slidePoolHeatPump(pptx, data);
  }

  // Conditional: Full electrification investment
  if (data.hasGas) {
    slideElectrificationInvestment(pptx, data);
  }

  slideSavingsSummary(pptx, data);
  slideFinancialSummary(pptx, data);
  slideEnvironmental(pptx, data);
  slideRoadmap(pptx, data);
  slideConclusion(pptx, data);
  slideContact(pptx, data);

  // Generate buffer
  const output = await pptx.write({ outputType: 'nodebuffer' });
  return output as Buffer;
}
