var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/_core/env.ts
var ENV;
var init_env = __esm({
  "server/_core/env.ts"() {
    "use strict";
    ENV = {
      appId: process.env.VITE_APP_ID ?? "",
      cookieSecret: process.env.JWT_SECRET ?? "",
      databaseUrl: process.env.DATABASE_URL ?? "",
      oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
      ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
      isProduction: process.env.NODE_ENV === "production",
      forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
      forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
    };
  }
});

// server/_core/llm.ts
async function invokeLLM(params) {
  assertApiKey();
  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format
  } = params;
  const payload = {
    model: "gpt-4.1-mini",
    messages: messages.map(normalizeMessage)
  };
  if (tools && tools.length > 0) {
    payload.tools = tools;
  }
  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }
  payload.max_tokens = params.maxTokens || params.max_tokens || 2048;
  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema
  });
  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }
  const response = await fetch(resolveApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.forgeApiKey}`
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed: ${response.status} ${response.statusText} \u2013 ${errorText}`
    );
  }
  return await response.json();
}
var ensureArray, normalizeContentPart, normalizeMessage, normalizeToolChoice, resolveApiUrl, assertApiKey, normalizeResponseFormat;
var init_llm = __esm({
  "server/_core/llm.ts"() {
    "use strict";
    init_env();
    ensureArray = (value) => Array.isArray(value) ? value : [value];
    normalizeContentPart = (part) => {
      if (typeof part === "string") {
        return { type: "text", text: part };
      }
      if (part.type === "text") {
        return part;
      }
      if (part.type === "image_url") {
        return part;
      }
      if (part.type === "file_url") {
        return part;
      }
      throw new Error("Unsupported message content part");
    };
    normalizeMessage = (message) => {
      const { role, name, tool_call_id } = message;
      if (role === "tool" || role === "function") {
        const content = ensureArray(message.content).map((part) => typeof part === "string" ? part : JSON.stringify(part)).join("\n");
        return {
          role,
          name,
          tool_call_id,
          content
        };
      }
      const contentParts = ensureArray(message.content).map(normalizeContentPart);
      if (contentParts.length === 1 && contentParts[0].type === "text") {
        return {
          role,
          name,
          content: contentParts[0].text
        };
      }
      return {
        role,
        name,
        content: contentParts
      };
    };
    normalizeToolChoice = (toolChoice, tools) => {
      if (!toolChoice) return void 0;
      if (toolChoice === "none" || toolChoice === "auto") {
        return toolChoice;
      }
      if (toolChoice === "required") {
        if (!tools || tools.length === 0) {
          throw new Error(
            "tool_choice 'required' was provided but no tools were configured"
          );
        }
        if (tools.length > 1) {
          throw new Error(
            "tool_choice 'required' needs a single tool or specify the tool name explicitly"
          );
        }
        return {
          type: "function",
          function: { name: tools[0].function.name }
        };
      }
      if ("name" in toolChoice) {
        return {
          type: "function",
          function: { name: toolChoice.name }
        };
      }
      return toolChoice;
    };
    resolveApiUrl = () => ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0 ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions` : "https://forge.manus.im/v1/chat/completions";
    assertApiKey = () => {
      if (!ENV.forgeApiKey) {
        throw new Error("OPENAI_API_KEY is not configured");
      }
    };
    normalizeResponseFormat = ({
      responseFormat,
      response_format,
      outputSchema,
      output_schema
    }) => {
      const explicitFormat = responseFormat || response_format;
      if (explicitFormat) {
        if (explicitFormat.type === "json_schema" && !explicitFormat.json_schema?.schema) {
          throw new Error(
            "responseFormat json_schema requires a defined schema object"
          );
        }
        return explicitFormat;
      }
      const schema = outputSchema || output_schema;
      if (!schema) return void 0;
      if (!schema.name || !schema.schema) {
        throw new Error("outputSchema requires both name and schema");
      }
      return {
        type: "json_schema",
        json_schema: {
          name: schema.name,
          schema: schema.schema,
          ...typeof schema.strict === "boolean" ? { strict: schema.strict } : {}
        }
      };
    };
  }
});

// shared/brand.ts
var BRAND;
var init_brand = __esm({
  "shared/brand.ts"() {
    "use strict";
    BRAND = {
      // ── COMPANY IDENTITY ───────────────────────────────────────
      name: "Elite Smart Energy Solutions",
      shortName: "Elite",
      tagline: "Smart Energy Solutions",
      website: "www.elitesmartenergy.com.au",
      email: "info@elitesmartenergy.com.au",
      address: "South Australia",
      // ── LOGOS & ICONS ──────────────────────────────────────────
      // Full horizontal logo (icon + wordmark) — use on light backgrounds
      logo: {
        full: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/HjYyMQuvAHbASIiI.jpg",
        // Icon only — transparent background, dark navy rays + green leaf
        iconTransparent: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/vkYTXfpVJByJjaGo.png",
        // Icon only — white rays on Elite Navy square — use on dark backgrounds
        iconNavy: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/NDYOCRwnFOhisDUR.png",
        // Icon only — white outline rays, transparent — use on dark/coloured backgrounds
        iconWhite: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/OOvYOULsnTCxOyIC.png",
        // Aqua variant (legacy)
        aqua: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/HjYyMQuvAHbASIiI.jpg"
      },
      // Cover page background image — Electrification Specialists backdrop
      coverBg: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/RcCbZwZNUIzvPlwn.jpg",
      // ── PRIMARY COLOUR PALETTE ─────────────────────────────────
      colors: {
        // Core brand colours
        eliteNavy: "#1B3A5C",
        // Primary navy — headings, sidebar, backgrounds
        solarGreen: "#46B446",
        // Solar green — CTAs, highlights, accents, graph bars
        pureWhite: "#FFFFFF",
        // Pure white — text on dark backgrounds
        // Secondary support colours
        skyMist: "#E8F0F7",
        // Light blue-grey — page backgrounds, light cards
        steelBlue: "#4A6B8A",
        // Mid-tone blue — borders, secondary text
        charcoal: "#2C3E50",
        // Dark charcoal — dark UI surfaces
        lightGrey: "#F5F7FA",
        // Near-white grey — subtle backgrounds
        // Dashboard & slide backgrounds
        midnightNavy: "#0F172A",
        // Darkest navy — slide/dashboard backgrounds
        slideCard: "#2C3E50",
        // Slide card surface
        slideBorder: "#1B3A5C",
        // Slide border / divider
        // Legacy aliases (keep for backward compatibility)
        aqua: "#46B446",
        // Maps to Solar Green
        orange: "#1B3A5C",
        // Maps to Elite Navy
        white: "#FFFFFF",
        ash: "#4A6B8A",
        // Maps to Steel Blue
        black: "#0F172A",
        // Maps to Midnight Navy
        navy: "#1B3A5C",
        green: "#46B446"
      },
      // ── TYPOGRAPHY ─────────────────────────────────────────────
      fonts: {
        // Primary typeface — ExtraBold, Bold, SemiBold, Regular
        primary: "Montserrat",
        // Secondary typeface — SemiBold, Regular, Light
        secondary: "Open Sans",
        // Google Fonts import URL
        googleFontsUrl: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Open+Sans:wght@300;400;600&display=swap",
        // Legacy aliases
        heading: "Montserrat",
        label: "Montserrat",
        body: "Open Sans"
      },
      // Legacy font CDN URLs (kept for backward compatibility)
      fontUrls: {
        nextSphere: "https://fonts.googleapis.com/css2?family=Montserrat:wght@800&display=swap",
        generalSans: "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400&display=swap",
        urbanist: "https://fonts.googleapis.com/css2?family=Montserrat:wght@600&display=swap",
        urbanistItalic: "https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@1,600&display=swap"
      },
      // ── SLIDE / PDF DEFAULTS ───────────────────────────────────
      slide: {
        bgColor: "#0F172A",
        cardColor: "#2C3E50",
        borderColor: "#1B3A5C",
        accentColor: "#46B446",
        headingColor: "#FFFFFF",
        bodyColor: "#CBD5E1",
        mutedColor: "#94A3B8"
      },
      // ── CONTACT INFO ───────────────────────────────────────────
      contact: {
        name: "",
        title: "Energy Solutions Consultant",
        company: "Elite Smart Energy Solutions",
        address: "South Australia",
        phone: "",
        email: "",
        website: "www.elitesmartenergy.com.au",
        copyright: "\xA9 Elite Smart Energy Solutions"
      }
    };
  }
});

// server/proposalExport.ts
var proposalExport_exports = {};
__export(proposalExport_exports, {
  generateFullPresentationHtml: () => generateFullPresentationHtml,
  generateSlideHtml: () => generateSlideHtml
});
function generateSlideHtml(slide) {
  const content = slide.content;
  let bodyHtml = "";
  switch (slide.slideType) {
    case "cover":
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
    case "executive_summary":
      bodyHtml = `
        <div class="slide-header">
          <h2 class="slide-title">${slide.title}</h2>
        </div>
        <div class="slide-body">
          <div class="stat-grid">
            <div class="stat-box">
              <p class="stat-label">Current Annual Cost</p>
              <p class="stat-value">$${content.currentAnnualCost?.toLocaleString()}</p>
            </div>
            <div class="stat-box accent">
              <p class="stat-label">Total Annual Savings</p>
              <p class="stat-value">$${content.totalAnnualSavings?.toLocaleString()}</p>
            </div>
            <div class="stat-box">
              <p class="stat-label">Payback Period</p>
              <p class="stat-value">${content.paybackYears} years</p>
            </div>
            <div class="stat-box">
              <p class="stat-label">Net Investment</p>
              <p class="stat-value">$${content.netInvestment?.toLocaleString()}</p>
            </div>
          </div>
        </div>
      `;
      break;
    case "bill_analysis":
      bodyHtml = `
        <div class="slide-header">
          <h2 class="slide-title">${slide.title}</h2>
        </div>
        <div class="slide-body">
          <div class="stat-grid">
            <div class="stat-box">
              <p class="stat-label">Daily Average</p>
              <p class="stat-value">${content.dailyAverageKwh?.toFixed(1)} kWh</p>
            </div>
            <div class="stat-box">
              <p class="stat-label">Monthly Usage</p>
              <p class="stat-value">${content.monthlyUsageKwh?.toFixed(0)} kWh</p>
            </div>
            <div class="stat-box">
              <p class="stat-label">Yearly Usage</p>
              <p class="stat-value">${content.yearlyUsageKwh?.toLocaleString()} kWh</p>
            </div>
            <div class="stat-box accent">
              <p class="stat-label">Projected Annual Cost</p>
              <p class="stat-value">$${content.projectedAnnualCost?.toLocaleString()}</p>
            </div>
          </div>
        </div>
      `;
      break;
    case "vpp_comparison":
      const providers = content.providers;
      const vppItems = providers?.slice(0, 5).map((p, i) => `
        <div class="vpp-item">
          <span class="vpp-rank">${i + 1}</span>
          <span class="vpp-name">${p.provider}</span>
          ${p.hasGasBundle ? '<span class="vpp-badge">Gas Bundle</span>' : ""}
          <span class="vpp-value">$${p.estimatedAnnualValue?.toFixed(0)}/yr</span>
        </div>
      `).join("") || "";
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
    case "financial_summary":
      bodyHtml = `
        <div class="slide-header">
          <h2 class="slide-title">${slide.title}</h2>
        </div>
        <div class="slide-body">
          <div class="stat-grid">
            <div class="stat-box">
              <p class="stat-label">Total Investment</p>
              <p class="stat-value">$${content.totalInvestment?.toLocaleString()}</p>
            </div>
            <div class="stat-box accent">
              <p class="stat-label">Total Rebates</p>
              <p class="stat-value">-$${content.totalRebates?.toLocaleString()}</p>
            </div>
            <div class="stat-box">
              <p class="stat-label">Net Investment</p>
              <p class="stat-value">$${content.netInvestment?.toLocaleString()}</p>
            </div>
            <div class="stat-box accent">
              <p class="stat-label">Payback Period</p>
              <p class="stat-value">${content.paybackYears} years</p>
            </div>
          </div>
        </div>
      `;
      break;
    case "contact":
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
      const entries = Object.entries(content).filter(([_, v]) => v !== null && v !== void 0);
      const genericContent = entries.map(([key, value]) => `
        <div class="stat-box">
          <p class="stat-label">${formatKey(key)}</p>
          <p class="stat-value">${formatValue(value)}</p>
        </div>
      `).join("");
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
function generateFullPresentationHtml(slides, options) {
  const includedSlides = options.includeConditionalSlides ? slides : slides.filter((s) => s.isIncluded);
  const slidesHtml = includedSlides.map((slide) => generateSlideHtml(slide)).join("\n");
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Electrification Proposal - ${options.customerName}</title>
      <style>${SLIDE_STYLES2}</style>
    </head>
    <body>
      ${slidesHtml}
    </body>
    </html>
  `;
}
function formatKey(key) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()).trim();
}
function formatValue(value) {
  if (typeof value === "number") {
    if (value > 1e3) {
      return value.toLocaleString();
    }
    return value.toFixed(value % 1 === 0 ? 0 : 1);
  }
  if (Array.isArray(value)) {
    return value.length.toString();
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return String(value ?? "-");
}
var SLIDE_STYLES2;
var init_proposalExport = __esm({
  "server/proposalExport.ts"() {
    "use strict";
    SLIDE_STYLES2 = `
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
  }
});

// server/pdfExport.ts
var pdfExport_exports = {};
__export(pdfExport_exports, {
  generateProposalPdf: () => generateProposalPdf,
  generateSlidePreviewHtml: () => generateSlidePreviewHtml
});
import puppeteer from "puppeteer";
async function generateProposalPdf(slides, customerName, proposalTitle) {
  const html = generateFullHtml(slides, customerName, proposalTitle);
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      landscape: true,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
function generateFullHtml(slides, customerName, proposalTitle) {
  const slidesHtml = slides.map((slide, index) => `
    <div class="slide" style="page-break-after: always; page-break-inside: avoid;">
      ${slide.content}
    </div>
  `).join("\n");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${proposalTitle} - ${customerName}</title>
  <style>
    @font-face {
      font-family: 'Montserrat';
      src: url('${BRAND.fontUrls.nextSphere}') format('truetype');
      font-weight: 800;
    }
    @font-face {
      font-family: 'General Sans';
      src: url('${BRAND.fontUrls.generalSans}') format('opentype');
      font-weight: 400;
    }
    @font-face {
      font-family: 'Montserrat';
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
      font-family: 'Montserrat', sans-serif;
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
      font-family: 'Montserrat', sans-serif;
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
      font-family: 'Montserrat', sans-serif;
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
      font-family: 'Montserrat', sans-serif;
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
function generateSlidePreviewHtml(slide, slideNumber, totalSlides) {
  return `
    <div class="slide">
      <img src="${BRAND.logo.aqua}" alt="Elite Smart Energy Solutions" class="logo" />
      ${slide.content}
      <div class="footer">
        <span class="copyright">\xA9 Elite Smart Energy Solutions</span>
        <span class="page-number">${slideNumber} / ${totalSlides}</span>
      </div>
    </div>
  `;
}
var init_pdfExport = __esm({
  "server/pdfExport.ts"() {
    "use strict";
    init_brand();
  }
});

// server/slideContentGenerator.ts
var slideContentGenerator_exports = {};
__export(slideContentGenerator_exports, {
  generateSlideContentMarkdown: () => generateSlideContentMarkdown
});
function fmt3(n, decimals = 0) {
  if (n == null) return "$0";
  return "$" + n.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function num(n, decimals = 0) {
  if (n == null) return "0";
  return n.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function cents(n) {
  if (n == null) return "0c";
  return n.toFixed(2) + "c";
}
function generateSlideContentMarkdown(input) {
  const { customer, calculations: calc, proposalTitle } = input;
  const hasGas = customer.hasGas && calc.gasAnnualCost != null && calc.gasAnnualCost > 0;
  const hasSolarNew = customer.hasSolarNew === true;
  const hasSolarOld = customer.hasSolarOld === true;
  const hasPool = customer.hasPool === true;
  const hasEV = customer.hasEV === true || customer.evInterest === "owns" || customer.evInterest === "interested";
  const hasExistingSolar = customer.hasExistingSolar === true || hasSolarNew || hasSolarOld;
  const gasAppliances = customer.gasAppliances || [];
  const hasHotWater = hasGas && gasAppliances.some((a) => a.toLowerCase().includes("hot water"));
  const hasHeating = hasGas && gasAppliances.some((a) => a.toLowerCase().includes("heat"));
  const hasCooktop = hasGas && gasAppliances.some((a) => a.toLowerCase().includes("cook") || a.toLowerCase().includes("stove"));
  const customerName = customer.fullName;
  const customerAddress = customer.address;
  const customerState = customer.state;
  const totalCurrentCost = calc.projectedAnnualCost + (calc.gasAnnualCost || 0);
  const selfConsumptionPercent = hasExistingSolar ? 85 : 0;
  const solarExportPercent = hasExistingSolar && calc.billSolarExportsKwh && calc.billTotalUsageKwh ? Math.round(calc.billSolarExportsKwh / (calc.billTotalUsageKwh + calc.billSolarExportsKwh) * 100) : 0;
  const inflationRate = 3.5;
  const slides = [];
  let slideNum = 0;
  slideNum++;
  slides.push(`
---
# Slide ${slideNum}: COVER PAGE

## Design
- **Background**: Midnight Navy (#0F172A) with the Elite Smart Energy Solutions cover background image on the right side
- **Logo**: Elite Smart Energy Solutions aqua starburst logo (${BRAND.logo.aqua}) positioned top-left with "ELITE SMART ENERGY SOLUTIONS" text beside it in white
- **Cover background image**: ${BRAND.coverBg}

## Content

### Title (large, white, Montserrat font)
IN-DEPTH BILL ANALYSIS & SOLAR BATTERY PROPOSAL

### Subtitle (smaller, aqua line separator, then white text)
Prepared exclusively for

### Customer Details (white, Open Sans font)
**${customerName}**
${customerAddress}
${customerState}

### Orange accent bar
A thin horizontal orange (#46B446) bar beneath the customer details

### Aqua separator line
A thin aqua (#46B446) horizontal line near the bottom

### Prepared By (small, ash text at bottom)
Prepared by ${BRAND.contact.name} | ${BRAND.contact.company}
${BRAND.contact.phone} | ${BRAND.contact.email}

## Style Notes
- The cover must feel premium and authoritative
- Right side has the background image (solar panels/energy imagery)
- Left side has all text content, left-aligned
- No data tables on this slide \u2014 purely branding and identification
`);
  slideNum++;
  const execInsight = calc.billSolarExportsKwh && calc.billFeedInTariffCents ? `Currently exporting ${num(calc.billSolarExportsKwh)} kWh of solar energy at just ${cents(calc.billFeedInTariffCents)}/kWh \u2014 a significant undervaluation of your solar asset that battery storage can capture.` : `Your current energy expenditure of ${fmt3(totalCurrentCost)} annually presents a substantial optimisation opportunity through strategic battery storage and VPP participation.`;
  slides.push(`
---
# Slide ${slideNum}: EXECUTIVE SUMMARY

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner, 60x60px aqua logo
- **Heading**: "EXECUTIVE SUMMARY" in Montserrat font, white, ALL CAPS
- **Subtitle**: "Strategic Overview" in Montserrat Italic, aqua, right-aligned
- **Aqua line separator** beneath heading

## Content Layout: 4 key metric cards in a row, then insight box below

### Key Metrics (4 cards, dark background with thin #333 border)

| Metric | Value | Color |
|--------|-------|-------|
| CURRENT ANNUAL COST | ${fmt3(totalCurrentCost)} | Orange (#46B446) |
| RECOMMENDED SYSTEM | ${num(calc.recommendedBatteryKwh, 1)} kWh Battery${calc.recommendedSolarKw ? " + " + num(calc.recommendedSolarKw, 1) + "kW Solar" : ""} | White |
| PROJECTED ANNUAL SAVINGS | ${fmt3(calc.totalAnnualSavings)} | Aqua (#46B446) |
| PAYBACK PERIOD | ${num(calc.paybackYears, 1)} Years | Aqua (#46B446) |

### Key Insight Box (dark grey #1a1a1a background, 4px aqua left border)
${execInsight}

### Summary Text (Open Sans, white, below the cards)
This proposal presents a comprehensive analysis of your current energy position and a strategic pathway to significantly reduce costs through battery storage${hasGas ? ", gas-to-electric conversion" : ""}, and Virtual Power Plant participation. The recommended solution delivers a strong return on investment while enhancing your energy independence.

## Style Notes
- Metric values should be large (40px+) and color-coded as specified
- Labels above values in Montserrat, 11px, ash, ALL CAPS
- The insight box should stand out with the aqua left border
- Copyright at bottom-left: "${BRAND.contact.copyright}"
`);
  slideNum++;
  const dailyAvg = calc.dailyAverageCost || calc.projectedAnnualCost / 365;
  slides.push(`
---
# Slide ${slideNum}: CURRENT BILL ANALYSIS

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner
- **Heading**: "CURRENT BILL ANALYSIS" in Montserrat, white
- **Subtitle**: "Rate Structure & Cost Breakdown" in Montserrat Italic, aqua, right-aligned
- **Aqua line separator**

## Content Layout: Left side = bill summary table, Right side = cost breakdown chart

### Bill Summary Table (left 55%)

| Item | Detail |
|------|--------|
| **Retailer** | ${calc.billRetailer || "Current Retailer"} |
| **Billing Period** | ${calc.billPeriodStart || "N/A"} to ${calc.billPeriodEnd || "N/A"} |
| **Billing Days** | ${calc.billDays || "N/A"} days |
| **Total Bill Amount** | ${fmt3(calc.billTotalAmount)} |
| **Daily Average Cost** | ${fmt3(dailyAvg, 2)}/day |
| **Total Usage** | ${num(calc.billTotalUsageKwh)} kWh |
| **Daily Average Usage** | ${num(calc.dailyAverageKwh, 1)} kWh/day |

### Tariff Rate Structure Table

| Rate Type | Usage (kWh) | Rate (c/kWh) | Cost |
|-----------|-------------|--------------|------|
| Peak | ${num(calc.billPeakUsageKwh)} | ${cents(calc.billPeakRateCents)} | ${fmt3((calc.billPeakUsageKwh || 0) * (calc.billPeakRateCents || 0) / 100)} |
| Off-Peak | ${num(calc.billOffPeakUsageKwh)} | ${cents(calc.billOffPeakRateCents)} | ${fmt3((calc.billOffPeakUsageKwh || 0) * (calc.billOffPeakRateCents || 0) / 100)} |
| Shoulder | ${num(calc.billShoulderUsageKwh)} | ${cents(calc.billShoulderRateCents)} | ${fmt3((calc.billShoulderUsageKwh || 0) * (calc.billShoulderRateCents || 0) / 100)} |
| **Supply Charge** | \u2014 | ${cents(calc.billDailySupplyCharge)}/day | ${fmt3((calc.billDailySupplyCharge || 0) * (calc.billDays || 90) / 100)} |
${calc.billSolarExportsKwh ? `| **Solar Feed-in Credit** | ${num(calc.billSolarExportsKwh)} kWh | ${cents(calc.billFeedInTariffCents)}/kWh | -${fmt3((calc.billSolarExportsKwh || 0) * (calc.billFeedInTariffCents || 0) / 100)} |` : ""}

### Cost Breakdown Visual (right 40%) \u2014 horizontal bar chart
- Usage Charges: largest bar (aqua)
- Supply Charges: medium bar (white)
- Solar Credits: negative bar (aqua, if applicable)
- Net Total: orange bar

### Insight Box (aqua left border)
${calc.billFeedInTariffCents && calc.billFeedInTariffCents < 5 ? `Your feed-in tariff of ${cents(calc.billFeedInTariffCents)}/kWh is well below the cost of grid electricity. Every kilowatt-hour exported represents lost value that battery storage would capture at full retail rate.` : `Your current rate structure reveals opportunities for cost optimisation through strategic load shifting and battery storage to minimise peak-rate consumption.`}

## Style Notes
- Table headers in Montserrat, aqua, ALL CAPS
- Table values in Open Sans, white
- Highlight the total row with aqua left border
- Numbers right-aligned in table cells
`);
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
- **Heading**: "MONTHLY USAGE ANALYSIS" in Montserrat, white
- **Subtitle**: "Consumption Pattern & Solar Opportunity" in Montserrat Italic, aqua
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
Winter months (June\u2013August) show consumption ${Math.round((winterMultiplier - 1) * 100)}% above the annual average, driven by heating loads. This seasonal variation creates an ideal use case for battery storage \u2014 storing excess solar during summer for winter evening consumption, while VPP participation generates income during peak demand events that typically coincide with these high-consumption periods.

## Style Notes
- Bar chart should be visually prominent, taking 60% of slide height
- Each bar labelled with month abbreviation below
- Average line clearly visible with label
`);
  slideNum++;
  slides.push(`
---
# Slide ${slideNum}: YEARLY COST PROJECTION

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner
- **Heading**: "YEARLY COST PROJECTION" in Montserrat, white
- **Subtitle**: "10-Year Outlook Without Intervention" in Montserrat Italic, aqua
- **Aqua line separator**

## Content Layout: Rising cost chart + cumulative table

### 10-Year Cost Projection Table

| Year | Annual Cost | Cumulative Spend |
|------|------------|-----------------|
| 2026 (Current) | ${fmt3(totalCurrentCost)} | ${fmt3(totalCurrentCost)} |
| 2027 | ${fmt3(totalCurrentCost * 1.035)} | ${fmt3(totalCurrentCost * 2.035)} |
| 2028 | ${fmt3(totalCurrentCost * 1.035 * 1.035)} | ${fmt3(totalCurrentCost * (1 + 1.035 + 1.035 * 1.035))} |
| 2029 | ${fmt3(totalCurrentCost * Math.pow(1.035, 3))} | \u2014 |
| 2030 | ${fmt3(totalCurrentCost * Math.pow(1.035, 4))} | \u2014 |
| 2031 | ${fmt3(totalCurrentCost * Math.pow(1.035, 5))} | \u2014 |
| 2032 | ${fmt3(totalCurrentCost * Math.pow(1.035, 6))} | \u2014 |
| 2033 | ${fmt3(totalCurrentCost * Math.pow(1.035, 7))} | \u2014 |
| 2034 | ${fmt3(totalCurrentCost * Math.pow(1.035, 8))} | \u2014 |
| 2035 | ${fmt3(totalCurrentCost * Math.pow(1.035, 9))} | \u2014 |

### Visual: Rising bar chart showing escalating costs
- Bars grow taller each year (orange bars)
- A horizontal aqua dashed line showing "with solar + battery" flat cost
- The gap between the two lines represents cumulative savings

### Key Metrics (2 cards)

| Metric | Value | Color |
|--------|-------|-------|
| 10-YEAR COST (NO ACTION) | ${fmt3(Array.from({ length: 10 }, (_, i) => totalCurrentCost * Math.pow(1.035, i)).reduce((a, b) => a + b, 0))} | Orange |
| 10-YEAR SAVINGS (WITH SYSTEM) | ${fmt3(calc.tenYearSavings || calc.totalAnnualSavings * 10)} | Aqua |

### Insight Box (orange left border \u2014 warning tone)
At the current ${inflationRate}% annual electricity price inflation, your energy costs will increase by ${Math.round((Math.pow(1.035, 10) - 1) * 100)}% over the next decade. Without intervention, the cumulative expenditure represents a significant financial commitment that could be substantially reduced through strategic investment in battery storage and energy optimisation.

## Style Notes
- The escalating bars should create a visual sense of urgency
- Orange colour for the "without action" scenario
- Aqua for the "with system" comparison line
`);
  if (hasGas) {
    slideNum++;
    slides.push(`
---
# Slide ${slideNum}: CURRENT GAS FOOTPRINT

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner
- **Heading**: "CURRENT GAS FOOTPRINT" in Montserrat, white
- **Subtitle**: "Gas Consumption & Conversion Analysis" in Montserrat Italic, aqua
- **Aqua line separator**

## Content Layout: Gas bill breakdown + conversion analysis

### Gas Bill Summary Table

| Item | Detail |
|------|--------|
| **Gas Retailer** | ${calc.gasBillRetailer || "Current Gas Retailer"} |
| **Billing Period** | ${calc.gasBillPeriodStart || "N/A"} to ${calc.gasBillPeriodEnd || "N/A"} |
| **Billing Days** | ${calc.gasBillDays || "N/A"} days |
| **Total Gas Bill** | ${fmt3(calc.gasBillTotalAmount)} |
| **Gas Usage** | ${num(calc.gasBillUsageMj)} MJ |
| **Gas Rate** | ${cents(calc.gasBillRateCentsMj)}/MJ |
| **Daily Supply Charge** | ${cents(calc.gasBillDailySupplyCharge)}/day |

### Gas-to-Electric Conversion

| Metric | Value |
|--------|-------|
| Gas Usage (MJ) | ${num(calc.gasBillUsageMj)} MJ |
| Equivalent Electricity (kWh) | ${num(calc.gasKwhEquivalent)} kWh |
| Annual Gas Cost | ${fmt3(calc.gasAnnualCost)} |
| Annual Gas Supply Charge | ${fmt3(calc.gasAnnualSupplyCharge)} |
| CO\u2082 Emissions from Gas | ${num(calc.gasCo2Emissions, 1)} tonnes/year |

### Gas Appliance Breakdown
${gasAppliances.map((a) => `- ${a}`).join("\n")}

### Insight Box (orange left border)
Your gas connection costs ${fmt3(calc.gasAnnualCost)} annually, with ${fmt3(calc.gasAnnualSupplyCharge)} in supply charges alone \u2014 a fixed cost regardless of usage. Full electrification eliminates both the gas consumption cost and the daily supply charge, while modern heat pump technology delivers the same heating output at approximately one-third the energy cost.

## Style Notes
- Conversion arrow visual: MJ \u2192 kWh with efficiency factor shown
- Gas appliances shown as icon-style list
`);
  }
  if (hasGas && gasAppliances.length > 0) {
    slideNum++;
    slides.push(`
---
# Slide ${slideNum}: GAS APPLIANCE INVENTORY

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner
- **Heading**: "GAS APPLIANCE INVENTORY" in Montserrat, white
- **Subtitle**: "Electrification Opportunity Assessment" in Montserrat Italic, aqua
- **Aqua line separator**

## Content Layout: Table showing each gas appliance with replacement recommendation

### Appliance Replacement Table

| Current Gas Appliance | Electric Replacement | Est. Annual Gas Cost | Est. Electric Cost | Annual Saving |
|----------------------|---------------------|---------------------|-------------------|--------------|
${hasHotWater ? `| Gas Hot Water | Heat Pump Hot Water (COP 3.5) | ${fmt3(calc.hotWaterCurrentGasCost)} | ${fmt3(calc.hotWaterHeatPumpCost)} | ${fmt3(calc.hotWaterSavings)} |` : ""}
${hasHeating ? `| Gas Ducted Heating | Reverse Cycle AC (COP 4.0) | ${fmt3(calc.heatingCurrentGasCost)} | ${fmt3(calc.heatingRcAcCost)} | ${fmt3(calc.heatingCoolingSavings)} |` : ""}
${hasCooktop ? `| Gas Cooktop | Induction Cooktop | ${fmt3(calc.cookingCurrentGasCost)} | ${fmt3(calc.cookingInductionCost)} | ${fmt3(calc.cookingSavings)} |` : ""}

### Total Electrification Summary

| Metric | Value | Color |
|--------|-------|-------|
| TOTAL GAS COST ELIMINATED | ${fmt3(calc.gasAnnualCost)} | Orange |
| TOTAL ELECTRIC REPLACEMENT COST | ${fmt3((calc.hotWaterHeatPumpCost || 0) + (calc.heatingRcAcCost || 0) + (calc.cookingInductionCost || 0))} | White |
| NET ANNUAL SAVING | ${fmt3((calc.hotWaterSavings || 0) + (calc.heatingCoolingSavings || 0) + (calc.cookingSavings || 0))} | Aqua |
| GAS SUPPLY CHARGE ELIMINATED | ${fmt3(calc.gasAnnualSupplyCharge)} | Aqua |

### Insight Box (aqua left border)
Full electrification of your gas appliances eliminates the ${fmt3(calc.gasAnnualSupplyCharge)}/year gas supply charge \u2014 a fixed cost you pay regardless of usage. Combined with the efficiency gains of heat pump technology (COP 3.5\u20134.0 vs gas efficiency of ~0.85), the total annual benefit significantly exceeds the running cost of electric alternatives.

## Style Notes
- Each appliance row should have a subtle icon
- Savings column highlighted in aqua
- The "Gas Supply Charge Eliminated" is a bonus saving often overlooked \u2014 highlight it
`);
  }
  slideNum++;
  slides.push(`
---
# Slide ${slideNum}: STRATEGIC ASSESSMENT

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner
- **Heading**: "STRATEGIC ASSESSMENT" in Montserrat, white
- **Subtitle**: "Opportunity Analysis" in Montserrat Italic, aqua
- **Aqua line separator**

## Content Layout: 3 strategic insight cards stacked vertically

### Strategic Insight 1: ${hasExistingSolar ? "Underutilised Solar Asset" : "Solar Opportunity"}
**Card** (dark bg, aqua left border)
${hasExistingSolar && solarExportPercent > 0 ? `Your existing ${num(Number(customer.existingSolarSize), 1)}kW solar system is currently exporting approximately ${solarExportPercent}% of its generation back to the grid at just ${cents(calc.billFeedInTariffCents)}/kWh. This represents a significant undervaluation of your solar investment. Battery storage would capture this exported energy at the full retail rate of ${cents(calc.billPeakRateCents)}/kWh \u2014 a ${num((calc.billPeakRateCents || 30) / (calc.billFeedInTariffCents || 5), 1)}x value multiplier.` : `With ${num(calc.yearlyUsageKwh)} kWh of annual consumption, a solar system would offset a significant portion of your grid dependency. Combined with battery storage, self-consumption rates of 80-85% are achievable, dramatically reducing your energy costs.`}

### Strategic Insight 2: Feed-in Tariff Erosion
**Card** (dark bg, orange left border)
Feed-in tariffs across ${customerState} have been declining steadily and are projected to continue falling as rooftop solar penetration increases. ${calc.billFeedInTariffCents ? `Your current rate of ${cents(calc.billFeedInTariffCents)}/kWh` : "Current feed-in rates"} will likely decrease further, making self-consumption through battery storage increasingly valuable. Acting now locks in the maximum benefit from your solar generation.

### Strategic Insight 3: VPP Revenue Opportunity
**Card** (dark bg, aqua left border)
Virtual Power Plant programs offer a compelling additional revenue stream. By allowing controlled discharge during grid peak events, your battery can earn ${fmt3(calc.vppAnnualValue || 400)}+ annually while maintaining sufficient reserve for household needs. This transforms your battery from a cost-saving device into an income-generating asset.

## Style Notes
- Each card should be substantial (roughly 1/3 of content area)
- Aqua borders for opportunities, orange for risks/warnings
- Strategic language \u2014 this slide sets the narrative for the rest of the proposal
`);
  slideNum++;
  slides.push(`
---
# Slide ${slideNum}: RECOMMENDED BATTERY SIZE

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner
- **Heading**: "RECOMMENDED BATTERY SIZE" in Montserrat, white
- **Subtitle**: "Sizing Analysis & Specification" in Montserrat Italic, aqua
- **Aqua line separator**

## Content Layout: Battery spec card + sizing breakdown

### Recommended Battery (large feature card, aqua border)

| Specification | Detail |
|--------------|--------|
| **Model** | ${calc.batteryProduct || "Sigenergy SigenStor"} |
| **Capacity** | ${num(calc.recommendedBatteryKwh, 1)} kWh |
| **Estimated Cost** | ${fmt3(calc.batteryEstimatedCost)} |
| **Battery Rebate** | -${fmt3(calc.batteryRebateAmount)} |
| **Net Cost** | ${fmt3((calc.batteryEstimatedCost || 0) - (calc.batteryRebateAmount || 0))} |

### Sizing Breakdown (how the battery size was determined)

| Component | kWh Required |
|-----------|-------------|
| Overnight household consumption (6pm\u20136am) | ${num(calc.dailyAverageKwh * 0.55, 1)} kWh |
| Morning peak coverage (6am\u20139am) | ${num(calc.dailyAverageKwh * 0.15, 1)} kWh |
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
  slideNum++;
  slides.push(`
---
# Slide ${slideNum}: ${hasExistingSolar ? "EXISTING SOLAR ASSESSMENT" : "PROPOSED SOLAR PV SYSTEM"}

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner
- **Heading**: "${hasExistingSolar ? "EXISTING SOLAR ASSESSMENT" : "PROPOSED SOLAR PV SYSTEM"}" in Montserrat, white
- **Subtitle**: "${hasExistingSolar ? "Performance Review & Battery Impact" : "System Specification & Generation"}" in Montserrat Italic, aqua
- **Aqua line separator**

## Content

${hasExistingSolar ? `
### Current Solar System

| Specification | Detail |
|--------------|--------|
| System Size | ${num(Number(customer.existingSolarSize), 1)} kW |
| System Age | ${customer.existingSolarAge || "N/A"} years |
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
Adding battery storage to your existing ${num(Number(customer.existingSolarSize), 1)}kW system transforms its economics. Instead of exporting ${solarExportPercent}% of generation at ${cents(calc.billFeedInTariffCents)}/kWh, the battery captures this energy for self-consumption at the full retail rate \u2014 effectively multiplying the value of every exported kilowatt-hour by ${num((calc.billPeakRateCents || 30) / (calc.billFeedInTariffCents || 5), 1)}x.
` : `
### Proposed Solar System

| Specification | Detail |
|--------------|--------|
| System Size | ${num(calc.recommendedSolarKw, 1)} kW |
| Panel Count | ${calc.solarPanelCount || Math.ceil((calc.recommendedSolarKw || 6.6) / 0.5)} panels |
| Est. Annual Generation | ${num(calc.solarAnnualGeneration)} kWh |
| Estimated Cost | ${fmt3(calc.solarEstimatedCost)} |
| Solar Rebate (STC) | -${fmt3(calc.solarRebateAmount)} |
| Net Cost | ${fmt3((calc.solarEstimatedCost || 0) - (calc.solarRebateAmount || 0))} |

### Insight Box (aqua left border)
The ${num(calc.recommendedSolarKw, 1)}kW system is sized to generate approximately ${num(calc.solarAnnualGeneration)} kWh annually, covering ${num((calc.solarAnnualGeneration || 0) / calc.yearlyUsageKwh * 100)}% of your current consumption. Combined with battery storage, self-consumption rates of 80-85% are achievable.
`}

## Style Notes
- If existing solar: show before/after comparison prominently
- The value multiplier (e.g., "6.5x") should be a large aqua number
`);
  slideNum++;
  const vppComparison = calc.vppProviderComparison || [];
  slides.push(`
---
# Slide ${slideNum}: VPP PROVIDER COMPARISON

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner
- **Heading**: "VPP PROVIDER COMPARISON" in Montserrat, white
- **Subtitle**: "${customerState} Market Analysis" in Montserrat Italic, aqua
- **Aqua line separator**

## Content Layout: Full-width comparison table

### VPP Provider Comparison Table

| Provider | Program | Gas Bundle | Est. Annual Value | Strategic Fit |
|----------|---------|-----------|-------------------|--------------|
${vppComparison.length > 0 ? vppComparison.map((v) => `| ${v.provider} | ${v.programName} | ${v.hasGasBundle ? "Yes" : "No"} | ${fmt3(v.estimatedAnnualValue)} | ${v.strategicFit.charAt(0).toUpperCase() + v.strategicFit.slice(1)} |`).join("\n") : `| AGL | Bring Your Own Battery | Yes | $400 | Good |
| Origin Energy | Origin Battery Lite | Yes | $380 | Good |
| Amber Electric | SmartShift | No | $450 | Excellent |
| Energy Locals | Battery Local | No | $350 | Good |
| Powershop | Battery Boost | No | $320 | Moderate |
| Red Energy | Battery Credits | No | $300 | Moderate |`}

### Recommendation Highlight
The top-ranked provider row should have an aqua left border and slightly brighter background (rgba(0,234,211,0.08))

${hasGas ? `### Gas Bundle Note (orange left border card)
Providers with gas bundling capability offer additional discounts when you maintain both electricity and gas accounts during the transition period. This can provide ${fmt3(calc.vppBundleDiscount || 50)}+ in additional annual savings.` : ""}

## Style Notes
- Table should be the primary visual element
- "Strategic Fit" column uses color coding: Excellent=Aqua, Good=White, Moderate=Ash
- Recommended provider row highlighted
`);
  slideNum++;
  slides.push(`
---
# Slide ${slideNum}: VPP RECOMMENDATION

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner
- **Heading**: "VPP RECOMMENDATION" in Montserrat, white
- **Subtitle**: "Recommended Program Analysis" in Montserrat Italic, aqua
- **Aqua line separator**

## Content Layout: Featured provider card + value breakdown

### Recommended VPP Provider (large feature card, aqua border)
**${calc.selectedVppProvider || "Top Recommended Provider"}**

### Annual Value Breakdown

| Income Stream | Annual Value |
|--------------|-------------|
| Daily Battery Credits | ${fmt3(calc.vppDailyCreditAnnual)} |
| Peak Event Payments | ${fmt3(calc.vppEventPaymentsAnnual)} |
${calc.vppBundleDiscount ? `| Gas Bundle Discount | ${fmt3(calc.vppBundleDiscount)} |` : ""}
| **Total Annual VPP Income** | **${fmt3(calc.vppAnnualValue)}** |

### How It Works (3 step cards)
1. **ENROL** \u2014 Register your battery with the VPP program (no cost, no lock-in)
2. **EARN** \u2014 Receive daily credits and event payments when the grid needs support
3. **CONTROL** \u2014 Set your minimum battery reserve to ensure household needs are always met

### Insight Box (aqua left border)
VPP participation transforms your battery from a passive storage device into an active income-generating asset. The ${calc.selectedVppProvider || "recommended program"} offers the optimal balance of guaranteed daily credits and event-based payments, with an estimated annual return of ${fmt3(calc.vppAnnualValue)} \u2014 effectively reducing your battery payback period by ${num((calc.vppAnnualValue || 400) / ((calc.batteryEstimatedCost || 1e4) / calc.paybackYears), 1)} years.

## Style Notes
- Provider name should be large and prominent
- Value breakdown as horizontal bars (aqua)
- The 3-step process should be clean and visual
`);
  if (hasHotWater) {
    slideNum++;
    slides.push(`
---
# Slide ${slideNum}: HOT WATER ELECTRIFICATION

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner
- **Heading**: "HOT WATER ELECTRIFICATION" in Montserrat, white
- **Subtitle**: "Heat Pump Conversion Analysis" in Montserrat Italic, aqua
- **Aqua line separator**

## Content: Before/After comparison

### Cost Comparison

| Metric | Gas Hot Water | Heat Pump (COP 3.5) |
|--------|-------------|---------------------|
| Annual Energy Cost | ${fmt3(calc.hotWaterCurrentGasCost)} | ${fmt3(calc.hotWaterHeatPumpCost)} |
| Daily Supply Charge | ${fmt3(calc.hotWaterDailySupplySaved, 2)}/day | Eliminated |
| Annual Saving | \u2014 | ${fmt3(calc.hotWaterSavings)} |
| Rebate Available | \u2014 | ${fmt3(calc.heatPumpHwRebateAmount)} |

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
- **Heading**: "HEATING & COOLING UPGRADE" in Montserrat, white
- **Subtitle**: "Reverse Cycle AC Analysis" in Montserrat Italic, aqua
- **Aqua line separator**

## Content: Before/After comparison

### Cost Comparison

| Metric | Gas Ducted Heating | Reverse Cycle AC (COP 4.0) |
|--------|-------------------|---------------------------|
| Annual Heating Cost | ${fmt3(calc.heatingCurrentGasCost)} | ${fmt3(calc.heatingRcAcCost)} |
| Cooling Capability | None (separate unit) | Included |
| Annual Saving | \u2014 | ${fmt3(calc.heatingCoolingSavings)} |
| Rebate Available | \u2014 | ${fmt3(calc.heatPumpAcRebateAmount)} |

### Insight Box
Modern reverse cycle air conditioning delivers both heating and cooling at a COP of 4.0 \u2014 producing 4 kWh of heating for every 1 kWh of electricity. This replaces both your gas heater and any existing cooling system with a single, highly efficient solution.
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
- **Heading**: "INDUCTION COOKING UPGRADE" in Montserrat, white
- **Subtitle**: "Gas to Induction Analysis" in Montserrat Italic, aqua
- **Aqua line separator**

## Content

### Cost Comparison

| Metric | Gas Cooktop | Induction Cooktop |
|--------|-----------|------------------|
| Annual Energy Cost | ${fmt3(calc.cookingCurrentGasCost)} | ${fmt3(calc.cookingInductionCost)} |
| Annual Saving | \u2014 | ${fmt3(calc.cookingSavings)} |
| Energy Efficiency | ~40% | ~90% |

### Insight Box
Induction cooking is approximately 90% energy efficient compared to 40% for gas, meaning more energy goes into heating your food rather than heating your kitchen. The faster heating, precise temperature control, and improved indoor air quality make induction the superior choice for modern kitchens.
`);
  }
  if (hasEV) {
    slideNum++;
    slides.push(`
---
# Slide ${slideNum}: EV CHARGING ANALYSIS

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner
- **Heading**: "EV CHARGING ANALYSIS" in Montserrat, white
- **Subtitle**: "Petrol vs Electric Cost Comparison" in Montserrat Italic, aqua
- **Aqua line separator**

## Content

### Annual Driving Cost Comparison

| Metric | Petrol Vehicle | EV (Grid Charging) | EV (Solar Charging) |
|--------|---------------|-------------------|-------------------|
| Annual km | ${num(calc.evKmPerYear)} | ${num(calc.evKmPerYear)} | ${num(calc.evKmPerYear)} |
| Cost per 100km | ${fmt3((calc.evPetrolPricePerLitre || 1.85) * 8, 2)} | ${fmt3((calc.evConsumptionPer100km || 15) * (calc.billPeakRateCents || 30) / 100, 2)} | ${fmt3((calc.evConsumptionPer100km || 15) * (calc.billFeedInTariffCents || 5) / 100, 2)} |
| Annual Fuel Cost | ${fmt3(calc.evPetrolCost)} | ${fmt3(calc.evGridChargeCost)} | ${fmt3(calc.evSolarChargeCost)} |
| **Annual Saving vs Petrol** | \u2014 | ${fmt3((calc.evPetrolCost || 0) - (calc.evGridChargeCost || 0))} | ${fmt3(calc.evAnnualSavings)} |

### Insight Box (aqua left border)
Charging your EV from solar during the day effectively costs just ${cents(calc.billFeedInTariffCents)}/kWh (the opportunity cost of feed-in), compared to ${fmt3(calc.evPetrolPricePerLitre || 1.85, 2)}/L for petrol. Over ${num(calc.evKmPerYear)} km annually, this translates to ${fmt3(calc.evAnnualSavings)} in fuel savings \u2014 one of the most compelling financial benefits of combining solar, battery, and EV ownership.
`);
  }
  if (hasPool) {
    slideNum++;
    slides.push(`
---
# Slide ${slideNum}: POOL HEAT PUMP

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner
- **Heading**: "POOL HEAT PUMP" in Montserrat, white
- **Subtitle**: "Efficient Pool Heating Solution" in Montserrat Italic, aqua
- **Aqua line separator**

## Content

### Recommended System

| Specification | Detail |
|--------------|--------|
| Recommended Size | ${num(calc.poolRecommendedKw)} kW |
| Pool Volume | ${num(customer.poolVolume)} L |
| Annual Operating Cost | ${fmt3(calc.poolAnnualOperatingCost)} |
| Annual Saving vs Gas | ${fmt3(calc.poolHeatPumpSavings)} |

### Insight Box
A ${num(calc.poolRecommendedKw)} kW pool heat pump extends your swimming season by 4-6 months while operating at a fraction of the cost of gas pool heating. When powered by excess solar generation, the effective running cost approaches zero.
`);
  }
  if (hasGas) {
    slideNum++;
    slides.push(`
---
# Slide ${slideNum}: FULL ELECTRIFICATION INVESTMENT

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner
- **Heading**: "FULL ELECTRIFICATION INVESTMENT" in Montserrat, white
- **Subtitle**: "Complete Gas Elimination Pathway" in Montserrat Italic, aqua
- **Aqua line separator**

## Content: Investment breakdown table

### Investment Summary

| Component | Gross Cost | Rebate | Net Cost |
|-----------|-----------|--------|---------|
${hasHotWater ? `| Heat Pump Hot Water | ${fmt3(calc.investmentHeatPumpHw)} | -${fmt3(calc.heatPumpHwRebateAmount)} | ${fmt3((calc.investmentHeatPumpHw || 0) - (calc.heatPumpHwRebateAmount || 0))} |` : ""}
${hasHeating ? `| Reverse Cycle AC | ${fmt3(calc.investmentRcAc)} | -${fmt3(calc.heatPumpAcRebateAmount)} | ${fmt3((calc.investmentRcAc || 0) - (calc.heatPumpAcRebateAmount || 0))} |` : ""}
${hasCooktop ? `| Induction Cooktop | ${fmt3(calc.investmentInduction)} | \u2014 | ${fmt3(calc.investmentInduction)} |` : ""}
| **Total Electrification** | ${fmt3((calc.investmentHeatPumpHw || 0) + (calc.investmentRcAc || 0) + (calc.investmentInduction || 0))} | -${fmt3((calc.heatPumpHwRebateAmount || 0) + (calc.heatPumpAcRebateAmount || 0))} | ${fmt3((calc.investmentHeatPumpHw || 0) + (calc.investmentRcAc || 0) + (calc.investmentInduction || 0) - (calc.heatPumpHwRebateAmount || 0) - (calc.heatPumpAcRebateAmount || 0))} |

### Annual Benefit

| Benefit | Amount |
|---------|--------|
| Gas consumption eliminated | ${fmt3(calc.gasAnnualCost)} |
| Gas supply charge eliminated | ${fmt3(calc.gasAnnualSupplyCharge)} |
| **Total annual benefit** | **${fmt3(calc.gasAnnualCost || 0)}** |

### Insight Box (aqua left border)
Full electrification eliminates your entire gas bill \u2014 both consumption and the ${fmt3(calc.gasAnnualSupplyCharge)}/year supply charge. The combined annual saving of ${fmt3(calc.gasAnnualCost)} delivers a rapid payback on the electrification investment, while improving comfort, air quality, and property value.
`);
  }
  slideNum++;
  slides.push(`
---
# Slide ${slideNum}: TOTAL SAVINGS SUMMARY

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner
- **Heading**: "TOTAL SAVINGS SUMMARY" in Montserrat, white
- **Subtitle**: "Annual Impact Analysis" in Montserrat Italic, aqua
- **Aqua line separator**

## Content Layout: Before/After visual comparison + savings breakdown

### Current vs Projected Comparison (large visual)

| | Current Annual Cost | Projected Annual Cost | Annual Saving |
|--|--------------------|--------------------|--------------|
| **Electricity** | ${fmt3(calc.projectedAnnualCost)} | ${fmt3(calc.projectedAnnualCost - calc.totalAnnualSavings + (calc.gasAnnualCost || 0))} | ${fmt3(calc.totalAnnualSavings - (calc.gasAnnualCost || 0))} |
${hasGas ? `| **Gas** | ${fmt3(calc.gasAnnualCost)} | $0 (eliminated) | ${fmt3(calc.gasAnnualCost)} |` : ""}
| **VPP Income** | $0 | +${fmt3(calc.vppAnnualValue)} | ${fmt3(calc.vppAnnualValue)} |
| **TOTAL** | **${fmt3(totalCurrentCost)}** | **${fmt3(totalCurrentCost - calc.totalAnnualSavings)}** | **${fmt3(calc.totalAnnualSavings)}** |

### Savings Breakdown (horizontal bar chart)
- Battery self-consumption savings (aqua bar)
- VPP income (aqua bar)
${hasGas ? "- Gas elimination savings (aqua bar)" : ""}
${hasEV ? "- EV fuel savings (aqua bar)" : ""}

### Key Metric (large, centred)
**${fmt3(calc.totalAnnualSavings)}** ANNUAL SAVINGS (large aqua number, 56px)

## Style Notes
- The before/after should be a dramatic visual comparison
- Current cost in orange, projected in aqua
- The total savings number should be the hero element
`);
  slideNum++;
  slides.push(`
---
# Slide ${slideNum}: FINANCIAL SUMMARY & PAYBACK

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner
- **Heading**: "FINANCIAL SUMMARY & PAYBACK" in Montserrat, white
- **Subtitle**: "Investment Analysis & Return" in Montserrat Italic, aqua
- **Aqua line separator**

## Content Layout: Investment table + ROI metrics + payback chart

### Investment Breakdown

| Component | Cost |
|-----------|------|
| Battery System (${num(calc.recommendedBatteryKwh, 1)} kWh) | ${fmt3(calc.investmentBattery || calc.batteryEstimatedCost)} |
${!hasExistingSolar && calc.investmentSolar ? `| Solar PV System (${num(calc.recommendedSolarKw, 1)} kW) | ${fmt3(calc.investmentSolar)} |` : ""}
${hasHotWater ? `| Heat Pump Hot Water | ${fmt3(calc.investmentHeatPumpHw)} |` : ""}
${hasHeating ? `| Reverse Cycle AC | ${fmt3(calc.investmentRcAc)} |` : ""}
${hasCooktop ? `| Induction Cooktop | ${fmt3(calc.investmentInduction)} |` : ""}
${hasEV ? `| EV Charger | ${fmt3(calc.investmentEvCharger)} |` : ""}
${hasPool ? `| Pool Heat Pump | ${fmt3(calc.investmentPoolHeatPump)} |` : ""}
| **Gross Investment** | **${fmt3(calc.totalInvestment)}** |
| Less: Rebates & Incentives | -${fmt3(calc.totalRebates)} |
| **Net Investment** | **${fmt3(calc.netInvestment)}** |

### Return on Investment (3 key metric cards)

| Metric | Value | Color |
|--------|-------|-------|
| PAYBACK PERIOD | ${num(calc.paybackYears, 1)} years | Aqua |
| 10-YEAR NET RETURN | ${fmt3(calc.tenYearSavings)} | Aqua |
| 25-YEAR NET RETURN | ${fmt3(calc.twentyFiveYearSavings)} | Aqua |

### Payback Timeline Visual
A horizontal timeline bar showing:
- Year 0: Investment (orange)
- Year ${num(calc.paybackYears, 1)}: Breakeven point (white marker)
- Year 10: Cumulative return (aqua)
- Year 25: Total lifetime return (aqua)

### Insight Box (aqua left border)
With a net investment of ${fmt3(calc.netInvestment)} after rebates and a ${num(calc.paybackYears, 1)}-year payback period, this system delivers a strong financial return. By year 10, the cumulative savings of ${fmt3(calc.tenYearSavings)} represent a ${num((calc.tenYearSavings || 0) / calc.netInvestment * 100)}% return on investment \u2014 significantly outperforming traditional investment alternatives.

## Style Notes
- Net investment should be prominent
- Payback period is the hero metric
- The timeline visual should clearly show the breakeven point
`);
  slideNum++;
  const treesEquivalent = Math.round((calc.co2ReductionTonnes || 3.5) * 45);
  slides.push(`
---
# Slide ${slideNum}: ENVIRONMENTAL IMPACT

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner
- **Heading**: "ENVIRONMENTAL IMPACT" in Montserrat, white
- **Subtitle**: "Carbon Reduction & Sustainability" in Montserrat Italic, aqua
- **Aqua line separator**

## Content Layout: 3 large metric cards + context

### Environmental Metrics (3 large cards)

| Metric | Value | Visual |
|--------|-------|--------|
| CO\u2082 REDUCTION | ${num(calc.co2ReductionTonnes, 1)} tonnes/year | Large aqua number |
| TREES EQUIVALENT | ${num(treesEquivalent)} trees planted | Large aqua number |
| ENERGY INDEPENDENCE | ${num(calc.co2ReductionPercent || 75)}% | Large aqua number with circular progress |

### Detailed Breakdown

| Metric | Current | Projected | Reduction |
|--------|---------|-----------|-----------|
| Annual CO\u2082 Emissions | ${num(calc.co2CurrentTonnes, 1)} t | ${num(calc.co2ProjectedTonnes, 1)} t | ${num(calc.co2ReductionTonnes, 1)} t (${num(calc.co2ReductionPercent)}%) |
| Grid Dependency | 100% | ~${100 - (calc.co2ReductionPercent || 75)}% | ${num(calc.co2ReductionPercent || 75)}% reduction |

### Insight Box (aqua left border)
By reducing your carbon footprint by ${num(calc.co2ReductionTonnes, 1)} tonnes annually, your household's environmental impact is equivalent to planting ${num(treesEquivalent)} trees every year. This positions your property as an active contributor to Australia's renewable energy transition while delivering tangible financial returns.

## Style Notes
- Environmental metrics should feel impactful \u2014 large numbers, clean design
- Use a subtle green tint on the aqua for environmental context (still aqua, not green)
- The trees equivalent is a powerful visual metaphor \u2014 consider a subtle tree icon
`);
  slideNum++;
  slides.push(`
---
# Slide ${slideNum}: RECOMMENDED ROADMAP

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner
- **Heading**: "RECOMMENDED ROADMAP" in Montserrat, white
- **Subtitle**: "Implementation Timeline" in Montserrat Italic, aqua
- **Aqua line separator**

## Content Layout: 4-phase horizontal timeline

### Phase 1: IMMEDIATE (Week 1-2)
**Card with aqua left border**
- Submit rebate applications (battery${hasGas ? ", heat pump" : ""})
- Confirm VPP provider selection
- Finalise system specifications and quotes
- Schedule installation dates

### Phase 2: INSTALLATION (Week 3-6)
**Card with aqua left border**
- Battery system installation and commissioning
${hasGas ? "- Heat pump hot water installation" : ""}
${hasHeating ? "- Reverse cycle AC installation" : ""}
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
  slideNum++;
  slides.push(`
---
# Slide ${slideNum}: CONCLUSION

## Design
- **Background**: Black (#000000)
- **Logo**: Top-right corner
- **Heading**: "CONCLUSION" in Montserrat, white
- **Subtitle**: "Your Energy Future" in Montserrat Italic, aqua
- **Aqua line separator**

## Content Layout: 3 key value propositions + call to action

### Value Proposition 1: Capture Wasted Value
**Card with aqua left border**
${hasExistingSolar ? `Your existing solar system is currently exporting valuable energy at a fraction of its worth. Battery storage captures this wasted value, converting ${cents(calc.billFeedInTariffCents)}/kWh exports into ${cents(calc.billPeakRateCents)}/kWh self-consumption \u2014 a ${num((calc.billPeakRateCents || 30) / (calc.billFeedInTariffCents || 5), 1)}x value multiplier.` : `A solar and battery system captures free energy from your roof and stores it for when you need it most, dramatically reducing your grid dependency and energy costs.`}

### Value Proposition 2: Strong Financial Return
**Card with aqua left border**
With ${fmt3(calc.totalAnnualSavings)} in annual savings and a ${num(calc.paybackYears, 1)}-year payback, this investment delivers a ${num((calc.tenYearSavings || 0) / calc.netInvestment * 100)}% return over 10 years \u2014 outperforming most traditional investment alternatives while providing daily utility value.

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
  slideNum++;
  slides.push(`
---
# Slide ${slideNum}: GET IN TOUCH

## Design
- **Background**: Black (#000000)
- **Logo**: Large centred Elite Smart Energy Solutions aqua logo (${BRAND.logo.aqua}), approximately 200x200px
- **No standard heading** \u2014 this is a contact/closing slide

## Content Layout: Centred contact details below logo

### Company Name (Montserrat, white, large)
ELITE SMART ENERGY SOLUTIONS

### Contact Details (Open Sans, white, centred)

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
- Minimal content \u2014 let the branding speak
`);
  const header = `# Elite Smart Energy Solutions \u2014 In-Depth Bill Analysis & Solar Battery Proposal

## Presentation Details
- **Customer**: ${customerName}
- **Address**: ${customerAddress}, ${customerState}
- **Prepared by**: ${BRAND.contact.name}, ${BRAND.contact.company}
- **Date**: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}
- **Total Slides**: ${slideNum}

## Design Specifications
- **Background**: Midnight Navy (#0F172A) on ALL slides
- **Primary Font (Headings ONLY)**: Montserrat ExtraBold \u2014 ALL CAPS, white
- **Body Font (all text & numbers)**: Open Sans Regular \u2014 white for primary, ash (#808285) for secondary
- **Label Font (subtitles, table headers)**: Montserrat SemiBold \u2014 ALL CAPS, aqua for subtitles, ash for labels
- **Primary Accent**: Aqua (#46B446) \u2014 used sparingly for savings, positive values, borders, subtitles
- **Secondary Accent**: Solar Green (#46B446) \u2014 used minimally for costs, warnings, accent bars
- **Logo**: Elite Smart Energy Solutions aqua starburst (${BRAND.logo.aqua}) \u2014 top-right on every slide except cover
- **Cover Background**: ${BRAND.coverBg}
- **Style**: Minimal, data-driven, professional. NO purple. NO gradients. NO decorative elements.
- **Tone**: Strategic, analytical, authoritative \u2014 for HIGH LEVEL OF EDUCATED PUBLICS audience

## Slide Content
`;
  return header + slides.join("\n");
}
var init_slideContentGenerator = __esm({
  "server/slideContentGenerator.ts"() {
    "use strict";
    init_brand();
  }
});

// server/switchboardAnalysis.ts
var switchboardAnalysis_exports = {};
__export(switchboardAnalysis_exports, {
  analyzeSwitchboardPhoto: () => analyzeSwitchboardPhoto,
  generateSwitchboardReport: () => generateSwitchboardReport
});
async function analyzeSwitchboardPhoto(imageUrl) {
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
          role: "user",
          content: [
            { type: "text", text: userPrompt },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high"
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
              "mainSwitchRating",
              "mainSwitchType",
              "totalCircuits",
              "usedCircuits",
              "availableCircuits",
              "circuitBreakers",
              "hasRcd",
              "rcdCount",
              "meterType",
              "meterNumber",
              "boardCondition",
              "boardAge",
              "hasSpaceForSolar",
              "hasSpaceForBattery",
              "upgradeRequired",
              "upgradeReason",
              "notes",
              "warnings",
              "confidence"
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
    const textContent = typeof content === "string" ? content : Array.isArray(content) ? content.find((c) => c.type === "text")?.text || "" : "";
    if (!textContent) {
      throw new Error("No text content in response");
    }
    const analysis = JSON.parse(textContent);
    return analysis;
  } catch (error) {
    console.error("Switchboard analysis error:", error);
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
      boardCondition: "unknown",
      boardAge: null,
      hasSpaceForSolar: false,
      hasSpaceForBattery: false,
      upgradeRequired: true,
      upgradeReason: "Unable to analyze switchboard photo",
      notes: [],
      warnings: ["Analysis failed - manual inspection required"],
      confidence: 0
    };
  }
}
function generateSwitchboardReport(analysis) {
  const lines = [];
  lines.push("## Switchboard Analysis Report\n");
  if (analysis.mainSwitchRating) {
    lines.push(`**Main Switch:** ${analysis.mainSwitchRating}A ${analysis.mainSwitchType || ""}`);
  }
  if (analysis.totalCircuits) {
    lines.push(`**Circuits:** ${analysis.usedCircuits || 0} used / ${analysis.totalCircuits} total (${analysis.availableCircuits || 0} available)`);
  }
  lines.push(`**RCD/Safety Switch:** ${analysis.hasRcd ? `Yes (${analysis.rcdCount || 1})` : "No"}`);
  lines.push(`**Board Condition:** ${analysis.boardCondition.charAt(0).toUpperCase() + analysis.boardCondition.slice(1)}`);
  if (analysis.boardAge) {
    lines.push(`**Estimated Age:** ${analysis.boardAge}`);
  }
  lines.push("\n### Installation Readiness\n");
  lines.push(`- Space for Solar: ${analysis.hasSpaceForSolar ? "\u2713 Yes" : "\u2717 No"}`);
  lines.push(`- Space for Battery: ${analysis.hasSpaceForBattery ? "\u2713 Yes" : "\u2717 No"}`);
  if (analysis.upgradeRequired) {
    lines.push(`
**\u26A0\uFE0F Upgrade Required:** ${analysis.upgradeReason || "See notes"}`);
  }
  if (analysis.warnings.length > 0) {
    lines.push("\n### Warnings\n");
    analysis.warnings.forEach((w) => lines.push(`- \u26A0\uFE0F ${w}`));
  }
  if (analysis.notes.length > 0) {
    lines.push("\n### Notes\n");
    analysis.notes.forEach((n) => lines.push(`- ${n}`));
  }
  lines.push(`
*Analysis confidence: ${analysis.confidence}%*`);
  return lines.join("\n");
}
var init_switchboardAnalysis = __esm({
  "server/switchboardAnalysis.ts"() {
    "use strict";
    init_llm();
  }
});

// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import fs6 from "fs";
import path7 from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
import { eq, desc, and, like, sql, gte, inArray, isNull, isNotNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // Created by user
  // Basic Info
  fullName: varchar("fullName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address").notNull(),
  state: varchar("state", { length: 10 }).notNull(),
  // VIC, NSW, SA, QLD, etc.
  // Optional Inputs
  hasSolarNew: boolean("hasSolarNew").default(false),
  // Has Solar PV <5yrs
  hasSolarOld: boolean("hasSolarOld").default(false),
  // Has Solar PV >5yrs
  gasAppliances: json("gasAppliances").$type(),
  // ["Hot Water", "Heating", "Cooktop", "Pool Heater"]
  hasPool: boolean("hasPool").default(false),
  poolVolume: int("poolVolume"),
  // Litres
  hasEV: boolean("hasEV").default(false),
  evInterest: mysqlEnum("evInterest", ["none", "interested", "owns"]).default("none"),
  hasExistingSolar: boolean("hasExistingSolar").default(false),
  existingSolarSize: decimal("existingSolarSize", { precision: 5, scale: 2 }),
  // kW
  existingSolarAge: int("existingSolarAge"),
  // Years
  // Metadata
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var bills = mysqlTable("bills", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  billType: mysqlEnum("billType", ["electricity", "gas"]).notNull(),
  // File Storage
  fileUrl: varchar("fileUrl", { length: 512 }),
  fileKey: varchar("fileKey", { length: 255 }),
  fileName: varchar("fileName", { length: 255 }),
  // Extracted Data - Common
  retailer: varchar("retailer", { length: 100 }),
  billingPeriodStart: timestamp("billingPeriodStart"),
  billingPeriodEnd: timestamp("billingPeriodEnd"),
  billingDays: int("billingDays"),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }),
  dailySupplyCharge: decimal("dailySupplyCharge", { precision: 8, scale: 4 }),
  // Electricity Specific
  totalUsageKwh: decimal("totalUsageKwh", { precision: 10, scale: 2 }),
  peakUsageKwh: decimal("peakUsageKwh", { precision: 10, scale: 2 }),
  offPeakUsageKwh: decimal("offPeakUsageKwh", { precision: 10, scale: 2 }),
  shoulderUsageKwh: decimal("shoulderUsageKwh", { precision: 10, scale: 2 }),
  solarExportsKwh: decimal("solarExportsKwh", { precision: 10, scale: 2 }),
  peakRateCents: decimal("peakRateCents", { precision: 8, scale: 4 }),
  offPeakRateCents: decimal("offPeakRateCents", { precision: 8, scale: 4 }),
  shoulderRateCents: decimal("shoulderRateCents", { precision: 8, scale: 4 }),
  feedInTariffCents: decimal("feedInTariffCents", { precision: 8, scale: 4 }),
  // Gas Specific
  gasUsageMj: decimal("gasUsageMj", { precision: 10, scale: 2 }),
  gasRateCentsMj: decimal("gasRateCentsMj", { precision: 8, scale: 4 }),
  // Raw Extracted Data (JSON for flexibility)
  rawExtractedData: json("rawExtractedData"),
  extractionConfidence: decimal("extractionConfidence", { precision: 5, scale: 2 }),
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var proposals = mysqlTable("proposals", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  userId: int("userId").notNull(),
  // Created by user
  // Proposal Info
  title: varchar("title", { length: 255 }),
  status: mysqlEnum("status", ["draft", "calculating", "generated", "exported", "archived"]).default("draft").notNull(),
  proposalDate: timestamp("proposalDate").defaultNow().notNull(),
  // Linked Bills
  electricityBillId: int("electricityBillId"),
  gasBillId: int("gasBillId"),
  // Calculated Results (stored as JSON for flexibility)
  calculations: json("calculations").$type(),
  // Generated Slides Data
  slidesData: json("slidesData").$type(),
  slideCount: int("slideCount"),
  // Export Info
  pdfUrl: varchar("pdfUrl", { length: 512 }),
  pptUrl: varchar("pptUrl", { length: 512 }),
  lastExportedAt: timestamp("lastExportedAt"),
  // Soft Delete
  deletedAt: timestamp("deletedAt"),
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var vppProviders = mysqlTable("vppProviders", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  programName: varchar("programName", { length: 100 }),
  // Availability
  availableStates: json("availableStates").$type(),
  // ["VIC", "NSW", "SA", "QLD"]
  hasGasBundle: boolean("hasGasBundle").default(false),
  // VPP Details
  dailyCredit: decimal("dailyCredit", { precision: 8, scale: 2 }),
  eventPayment: decimal("eventPayment", { precision: 8, scale: 2 }),
  estimatedEventsPerYear: int("estimatedEventsPerYear"),
  bundleDiscount: decimal("bundleDiscount", { precision: 8, scale: 2 }),
  // Additional Info
  minBatterySize: decimal("minBatterySize", { precision: 5, scale: 2 }),
  // kWh
  website: varchar("website", { length: 255 }),
  notes: text("notes"),
  // Metadata
  isActive: boolean("isActive").default(true),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var stateRebates = mysqlTable("stateRebates", {
  id: int("id").autoincrement().primaryKey(),
  state: varchar("state", { length: 10 }).notNull(),
  rebateType: mysqlEnum("rebateType", ["solar", "battery", "heat_pump_hw", "heat_pump_ac", "ev_charger", "induction"]).notNull(),
  // Rebate Details
  name: varchar("name", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  isPercentage: boolean("isPercentage").default(false),
  maxAmount: decimal("maxAmount", { precision: 10, scale: 2 }),
  // Eligibility
  eligibilityCriteria: text("eligibilityCriteria"),
  incomeThreshold: decimal("incomeThreshold", { precision: 12, scale: 2 }),
  // Validity
  validFrom: timestamp("validFrom"),
  validUntil: timestamp("validUntil"),
  isActive: boolean("isActive").default(true),
  // Metadata
  sourceUrl: varchar("sourceUrl", { length: 512 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var customerDocuments = mysqlTable("customerDocuments", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  userId: int("userId").notNull(),
  // Uploaded by user
  // Document Type
  documentType: mysqlEnum("documentType", [
    "switchboard_photo",
    "meter_photo",
    "roof_photo",
    "property_photo",
    "solar_proposal_pdf",
    "other"
  ]).notNull(),
  // File Storage
  fileUrl: varchar("fileUrl", { length: 512 }).notNull(),
  fileKey: varchar("fileKey", { length: 255 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileSize: int("fileSize"),
  // bytes
  mimeType: varchar("mimeType", { length: 100 }),
  // Metadata
  description: text("description"),
  extractedData: json("extractedData"),
  // For AI-extracted info from photos/PDFs
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var proposalAccessTokens = mysqlTable("proposalAccessTokens", {
  id: int("id").autoincrement().primaryKey(),
  proposalId: int("proposalId").notNull(),
  customerId: int("customerId").notNull(),
  // Access Token
  token: varchar("token", { length: 64 }).notNull().unique(),
  // Access Control
  expiresAt: timestamp("expiresAt"),
  isActive: boolean("isActive").default(true),
  // Tracking
  viewCount: int("viewCount").default(0),
  lastViewedAt: timestamp("lastViewedAt"),
  // Metadata
  createdBy: int("createdBy").notNull(),
  // User who created the link
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var proposalViews = mysqlTable("proposalViews", {
  id: int("id").autoincrement().primaryKey(),
  proposalId: int("proposalId").notNull(),
  accessTokenId: int("accessTokenId"),
  // Visitor Info
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  referrer: varchar("referrer", { length: 512 }),
  // Session Tracking
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  durationSeconds: int("durationSeconds").default(0),
  totalSlidesViewed: int("totalSlidesViewed").default(0),
  // Device Info
  deviceType: varchar("deviceType", { length: 20 }),
  // desktop, mobile, tablet
  browser: varchar("browser", { length: 50 }),
  os: varchar("os", { length: 50 }),
  // Timestamps
  viewedAt: timestamp("viewedAt").defaultNow().notNull(),
  lastActivityAt: timestamp("lastActivityAt").defaultNow().notNull()
});
var slideEngagement = mysqlTable("slideEngagement", {
  id: int("id").autoincrement().primaryKey(),
  proposalId: int("proposalId").notNull(),
  viewId: int("viewId").notNull(),
  // Links to proposalViews
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  // Slide Info
  slideIndex: int("slideIndex").notNull(),
  slideType: varchar("slideType", { length: 50 }).notNull(),
  slideTitle: varchar("slideTitle", { length: 255 }),
  // Engagement Metrics
  timeSpentSeconds: int("timeSpentSeconds").default(0),
  viewCount: int("viewCount").default(1),
  // Times revisited within session
  // Timestamps
  firstViewedAt: timestamp("firstViewedAt").defaultNow().notNull(),
  lastViewedAt: timestamp("lastViewedAt").defaultNow().notNull()
});

// server/db.ts
init_env();
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createCustomer(customer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(customers).values(customer);
  return Number(result[0].insertId);
}
async function getCustomerById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  return result[0];
}
async function getCustomersByUserId(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customers).where(eq(customers.userId, userId)).orderBy(desc(customers.createdAt));
}
async function searchCustomers(userId, searchTerm) {
  const db = await getDb();
  if (!db) return [];
  if (searchTerm) {
    return db.select().from(customers).where(and(
      eq(customers.userId, userId),
      like(customers.fullName, `%${searchTerm}%`)
    )).orderBy(desc(customers.createdAt));
  }
  return getCustomersByUserId(userId);
}
async function updateCustomer(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(customers).set(data).where(eq(customers.id, id));
}
async function deleteCustomer(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(customers).where(eq(customers.id, id));
}
async function createBill(bill) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(bills).values(bill);
  return Number(result[0].insertId);
}
async function getBillById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(bills).where(eq(bills.id, id)).limit(1);
  return result[0];
}
async function getBillsByCustomerId(customerId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bills).where(eq(bills.customerId, customerId)).orderBy(desc(bills.createdAt));
}
async function updateBill(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(bills).set(data).where(eq(bills.id, id));
}
async function deleteBill(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(bills).where(eq(bills.id, id));
}
async function createProposal(proposal) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(proposals).values(proposal);
  return Number(result[0].insertId);
}
async function getProposalById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(proposals).where(eq(proposals.id, id)).limit(1);
  return result[0];
}
async function getProposalsByCustomerId(customerId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(proposals).where(and(eq(proposals.customerId, customerId), isNull(proposals.deletedAt))).orderBy(desc(proposals.createdAt));
}
async function searchProposals(userId, filters) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(proposals.userId, userId), isNull(proposals.deletedAt)];
  if (filters?.status && filters.status !== "all") {
    conditions.push(eq(proposals.status, filters.status));
  }
  const results = await db.select({
    proposal: proposals,
    customerName: customers.fullName
  }).from(proposals).leftJoin(customers, eq(proposals.customerId, customers.id)).where(and(...conditions)).orderBy(desc(proposals.createdAt));
  return results.map((r) => ({
    ...r.proposal,
    customerName: r.customerName ?? void 0
  }));
}
async function updateProposal(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(proposals).set(data).where(eq(proposals.id, id));
}
async function softDeleteProposal(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(proposals).set({ deletedAt: /* @__PURE__ */ new Date() }).where(eq(proposals.id, id));
}
async function restoreProposal(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(proposals).set({ deletedAt: null }).where(eq(proposals.id, id));
}
async function getDeletedProposals(userId) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select({
    proposal: proposals,
    customerName: customers.fullName
  }).from(proposals).leftJoin(customers, eq(proposals.customerId, customers.id)).where(and(eq(proposals.userId, userId), isNotNull(proposals.deletedAt))).orderBy(desc(proposals.deletedAt));
  return results.map((r) => ({
    ...r.proposal,
    customerName: r.customerName ?? void 0
  }));
}
async function permanentlyDeleteProposal(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(proposals).where(eq(proposals.id, id));
}
async function getAllVppProviders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(vppProviders).where(eq(vppProviders.isActive, true));
}
async function getVppProvidersByState(state) {
  const db = await getDb();
  if (!db) return [];
  const allProviders = await getAllVppProviders();
  return allProviders.filter((p) => {
    const states = p.availableStates;
    return states?.includes(state);
  });
}
async function upsertVppProvider(provider) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(vppProviders).values(provider).onDuplicateKeyUpdate({
    set: provider
  });
}
async function getRebatesByState(state) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(stateRebates).where(and(
    eq(stateRebates.state, state),
    eq(stateRebates.isActive, true)
  ));
}
async function upsertStateRebate(rebate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(stateRebates).values(rebate).onDuplicateKeyUpdate({
    set: rebate
  });
}
async function createCustomerDocument(doc) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(customerDocuments).values(doc);
  return Number(result[0].insertId);
}
async function getDocumentById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(customerDocuments).where(eq(customerDocuments.id, id)).limit(1);
  return result[0];
}
async function getDocumentsByCustomerId(customerId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customerDocuments).where(eq(customerDocuments.customerId, customerId)).orderBy(desc(customerDocuments.createdAt));
}
async function getDocumentsByType(customerId, documentType) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customerDocuments).where(and(
    eq(customerDocuments.customerId, customerId),
    eq(customerDocuments.documentType, documentType)
  )).orderBy(desc(customerDocuments.createdAt));
}
async function updateCustomerDocument(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(customerDocuments).set(data).where(eq(customerDocuments.id, id));
}
async function deleteCustomerDocument(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(customerDocuments).where(eq(customerDocuments.id, id));
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
init_env();
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/storage.ts
import fs from "fs";
import path from "path";
var UPLOAD_DIR = path.resolve(process.cwd(), "uploads");
function getBaseUrl() {
  const railwayDomain = process.env.RAILWAY_PUBLIC_DOMAIN;
  if (railwayDomain) {
    return `https://${railwayDomain}`;
  }
  const port = process.env.PORT || 3e3;
  return `http://localhost:${port}`;
}
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const key = relKey.replace(/^\/+/, "");
  const filePath = path.join(UPLOAD_DIR, key);
  ensureDir(path.dirname(filePath));
  const buffer = typeof data === "string" ? Buffer.from(data, "utf-8") : Buffer.from(data);
  fs.writeFileSync(filePath, buffer);
  const url = `${getBaseUrl()}/uploads/${key}`;
  return { key, url };
}

// server/pdfUpload.ts
function registerPdfUploadRoute(app) {
  app.post("/api/upload-pdf", async (req, res) => {
    try {
      const chunks = [];
      req.on("data", (chunk) => {
        chunks.push(chunk);
      });
      req.on("end", async () => {
        try {
          const body = Buffer.concat(chunks);
          let pdfBuffer;
          let fileName;
          let proposalId;
          const contentType = req.headers["content-type"] || "";
          if (contentType.includes("application/json")) {
            const jsonBody = JSON.parse(body.toString());
            pdfBuffer = Buffer.from(jsonBody.pdfData, "base64");
            fileName = jsonBody.fileName || `proposal-${Date.now()}.pdf`;
            proposalId = jsonBody.proposalId || "0";
          } else {
            pdfBuffer = body;
            fileName = `proposal-${Date.now()}.pdf`;
            proposalId = "0";
          }
          const fileKey = `exports/${fileName}`;
          const { url } = await storagePut(fileKey, pdfBuffer, "application/pdf");
          res.json({ success: true, url, fileName });
        } catch (err) {
          console.error("PDF upload processing error:", err);
          res.status(500).json({ success: false, error: "Failed to process PDF upload" });
        }
      });
    } catch (err) {
      console.error("PDF upload error:", err);
      res.status(500).json({ success: false, error: "Failed to upload PDF" });
    }
  });
}

// server/routers.ts
import { z as z2 } from "zod";

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
init_env();
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
import { TRPCError as TRPCError3 } from "@trpc/server";

// server/billExtraction.ts
init_llm();
var ELECTRICITY_BILL_SCHEMA = {
  type: "object",
  properties: {
    customerName: { type: "string", description: "Full name of the account holder" },
    serviceAddress: { type: "string", description: "Service/supply address" },
    state: { type: "string", description: "Australian state abbreviation (VIC, NSW, QLD, SA, WA, TAS, NT, ACT)" },
    billingPeriodStart: { type: "string", description: "Start date of billing period (YYYY-MM-DD format)" },
    billingPeriodEnd: { type: "string", description: "End date of billing period (YYYY-MM-DD format)" },
    billingDays: { type: "number", description: "Number of days in the billing period" },
    totalAmount: { type: "number", description: "Total amount due in dollars (e.g., 450.25)" },
    dailySupplyCharge: { type: "number", description: "Daily supply charge in dollars (e.g., 1.20)" },
    totalUsageKwh: { type: "number", description: "Total electricity usage in kWh" },
    peakUsageKwh: { type: "number", description: "Peak period usage in kWh (if available)" },
    offPeakUsageKwh: { type: "number", description: "Off-peak period usage in kWh (if available)" },
    shoulderUsageKwh: { type: "number", description: "Shoulder period usage in kWh (if available)" },
    solarExportsKwh: { type: "number", description: "Solar exports/feed-in in kWh (if available)" },
    peakRateCents: { type: "number", description: "Peak rate in cents per kWh (e.g., 35.5)" },
    offPeakRateCents: { type: "number", description: "Off-peak rate in cents per kWh (if available)" },
    shoulderRateCents: { type: "number", description: "Shoulder rate in cents per kWh (if available)" },
    feedInTariffCents: { type: "number", description: "Feed-in tariff in cents per kWh (if available)" },
    retailer: { type: "string", description: "Name of the electricity retailer" },
    extractionConfidence: { type: "number", description: "Confidence score 0-100 for the extraction accuracy" }
  },
  required: ["totalAmount", "totalUsageKwh", "retailer", "extractionConfidence"],
  additionalProperties: false
};
var GAS_BILL_SCHEMA = {
  type: "object",
  properties: {
    customerName: { type: "string", description: "Full name of the account holder" },
    serviceAddress: { type: "string", description: "Service/supply address" },
    state: { type: "string", description: "Australian state abbreviation (VIC, NSW, QLD, SA, WA, TAS, NT, ACT)" },
    billingPeriodStart: { type: "string", description: "Start date of billing period (YYYY-MM-DD format)" },
    billingPeriodEnd: { type: "string", description: "End date of billing period (YYYY-MM-DD format)" },
    billingDays: { type: "number", description: "Number of days in the billing period" },
    totalAmount: { type: "number", description: "Total amount due in dollars (e.g., 150.75)" },
    dailySupplyCharge: { type: "number", description: "Daily supply charge in dollars (e.g., 0.85)" },
    gasUsageMj: { type: "number", description: "Total gas usage in MJ (megajoules)" },
    gasRateCentsMj: { type: "number", description: "Gas rate in cents per MJ (e.g., 3.5)" },
    retailer: { type: "string", description: "Name of the gas retailer" },
    extractionConfidence: { type: "number", description: "Confidence score 0-100 for the extraction accuracy" }
  },
  required: ["totalAmount", "gasUsageMj", "retailer", "extractionConfidence"],
  additionalProperties: false
};
async function extractElectricityBillData(fileUrl) {
  const systemPrompt = `You are an expert at extracting data from Australian electricity bills. 
Your task is to carefully analyze the provided electricity bill image/PDF and extract all relevant information.

Key guidelines:
- Look for the total amount due, not just usage charges
- Identify peak, off-peak, and shoulder usage if the bill has time-of-use pricing
- Extract the daily supply charge (sometimes called "service to property" or "daily charge")
- Find the feed-in tariff if the customer has solar
- Identify the billing period dates and calculate the number of days
- Determine the state from the service address
- Note the electricity retailer name

If a value is not clearly visible or not applicable, omit it from the response.
Provide a confidence score (0-100) based on how clearly you could read and extract the data.`;
  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: "Please extract all relevant data from this electricity bill:" },
            { type: "file_url", file_url: { url: fileUrl, mime_type: "application/pdf" } }
          ]
        }
      ],
      maxTokens: 1024,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "electricity_bill_data",
          strict: true,
          schema: ELECTRICITY_BILL_SCHEMA
        }
      }
    });
    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== "string") {
      throw new Error("No response from LLM");
    }
    const data = JSON.parse(content);
    data.rawData = { originalResponse: content };
    return data;
  } catch (error) {
    console.error("[BillExtraction] Failed to extract electricity bill:", error);
    throw new Error(`Failed to extract electricity bill data: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
async function extractGasBillData(fileUrl) {
  const systemPrompt = `You are an expert at extracting data from Australian gas bills.
Your task is to carefully analyze the provided gas bill image/PDF and extract all relevant information.

Key guidelines:
- Gas usage in Australia is typically measured in MJ (megajoules)
- Look for the total amount due, not just usage charges
- Extract the daily supply charge (sometimes called "service charge" or "daily charge")
- Identify the billing period dates and calculate the number of days
- Determine the state from the service address
- Note the gas retailer name

If a value is not clearly visible or not applicable, omit it from the response.
Provide a confidence score (0-100) based on how clearly you could read and extract the data.`;
  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: "Please extract all relevant data from this gas bill:" },
            { type: "file_url", file_url: { url: fileUrl, mime_type: "application/pdf" } }
          ]
        }
      ],
      maxTokens: 1024,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "gas_bill_data",
          strict: true,
          schema: GAS_BILL_SCHEMA
        }
      }
    });
    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== "string") {
      throw new Error("No response from LLM");
    }
    const data = JSON.parse(content);
    data.rawData = { originalResponse: content };
    return data;
  } catch (error) {
    console.error("[BillExtraction] Failed to extract gas bill:", error);
    throw new Error(`Failed to extract gas bill data: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
function validateElectricityBillData(data) {
  const errors = [];
  if (!data.totalAmount || data.totalAmount <= 0) {
    errors.push("Total amount is missing or invalid");
  }
  if (!data.totalUsageKwh || data.totalUsageKwh <= 0) {
    errors.push("Total usage is missing or invalid");
  }
  if (!data.retailer) {
    errors.push("Retailer name is missing");
  }
  if (data.billingDays && (data.billingDays < 1 || data.billingDays > 120)) {
    errors.push("Billing days seems incorrect (should be 1-120)");
  }
  if (data.extractionConfidence && data.extractionConfidence < 50) {
    errors.push("Low extraction confidence - manual review recommended");
  }
  return {
    valid: errors.length === 0,
    errors
  };
}
function validateGasBillData(data) {
  const errors = [];
  if (!data.totalAmount || data.totalAmount <= 0) {
    errors.push("Total amount is missing or invalid");
  }
  if (!data.gasUsageMj || data.gasUsageMj <= 0) {
    errors.push("Gas usage is missing or invalid");
  }
  if (!data.retailer) {
    errors.push("Retailer name is missing");
  }
  if (data.billingDays && (data.billingDays < 1 || data.billingDays > 120)) {
    errors.push("Billing days seems incorrect (should be 1-120)");
  }
  if (data.extractionConfidence && data.extractionConfidence < 50) {
    errors.push("Low extraction confidence - manual review recommended");
  }
  return {
    valid: errors.length === 0,
    errors
  };
}

// server/calculations.ts
var CONSTANTS = {
  // Conversion factors
  GAS_MJ_TO_KWH: 0.2778,
  // Heat pump efficiency (COP)
  HEAT_PUMP_COP_MIN: 3.5,
  HEAT_PUMP_COP_MAX: 4.5,
  HEAT_PUMP_COP_DEFAULT: 4,
  // EV assumptions
  EV_KM_PER_YEAR: 1e4,
  EV_CONSUMPTION_KWH_PER_100KM: 15,
  PETROL_CONSUMPTION_L_PER_100KM: 8,
  PETROL_PRICE_PER_LITRE: 1.8,
  // Pool heat pump sizing
  POOL_KW_PER_1000L_MIN: 0.5,
  POOL_KW_PER_1000L_MAX: 0.7,
  // CO2 emission factors (kg CO2 per unit)
  CO2_PER_KWH_GRID: 0.79,
  // Australian average
  CO2_PER_MJ_GAS: 0.0512,
  // Default rates (fallback if not extracted)
  DEFAULT_ELECTRICITY_RATE_CENTS: 30,
  DEFAULT_GAS_RATE_CENTS_MJ: 3.5,
  DEFAULT_FEED_IN_TARIFF_CENTS: 5,
  DEFAULT_DAILY_SUPPLY_CHARGE: 1.2
};
function calculateUsageProjections(electricityBill) {
  const totalUsage = Number(electricityBill.totalUsageKwh) || 0;
  const billingDays = electricityBill.billingDays || 90;
  const totalAmount = Number(electricityBill.totalAmount) || 0;
  const dailyAverageKwh = totalUsage / billingDays;
  const monthlyUsageKwh = dailyAverageKwh * 30;
  const yearlyUsageKwh = dailyAverageKwh * 365;
  const dailyAverageCost = totalAmount / billingDays;
  const projectedAnnualCost = dailyAverageCost * 365;
  return {
    dailyAverageKwh: round(dailyAverageKwh, 2),
    monthlyUsageKwh: round(monthlyUsageKwh, 2),
    yearlyUsageKwh: round(yearlyUsageKwh, 2),
    projectedAnnualCost: round(projectedAnnualCost, 2),
    dailyAverageCost: round(dailyAverageCost, 2)
  };
}
function calculateGasAnalysis(gasBill) {
  const gasUsageMj = Number(gasBill.gasUsageMj) || 0;
  const totalAmount = Number(gasBill.totalAmount) || 0;
  const billingDays = gasBill.billingDays || 90;
  const dailyGasCost = totalAmount / billingDays;
  const annualGasCost = dailyGasCost * 365;
  const gasKwhEquivalent = gasUsageMj * CONSTANTS.GAS_MJ_TO_KWH;
  const co2EmissionsKg = gasUsageMj * CONSTANTS.CO2_PER_MJ_GAS * (365 / billingDays);
  return {
    annualGasCost: round(annualGasCost, 2),
    gasKwhEquivalent: round(gasKwhEquivalent, 2),
    co2EmissionsKg: round(co2EmissionsKg, 2),
    dailyGasCost: round(dailyGasCost, 2)
  };
}
function calculateHotWaterSavings(gasBill, electricityRate = CONSTANTS.DEFAULT_ELECTRICITY_RATE_CENTS, hotWaterPercentOfGas = 0.4) {
  const gasUsageMj = Number(gasBill.gasUsageMj) || 0;
  const gasRate = Number(gasBill.gasRateCentsMj) || CONSTANTS.DEFAULT_GAS_RATE_CENTS_MJ;
  const dailySupply = Number(gasBill.dailySupplyCharge) || CONSTANTS.DEFAULT_DAILY_SUPPLY_CHARGE;
  const billingDays = gasBill.billingDays || 90;
  const hwsGasUsageMj = gasUsageMj * hotWaterPercentOfGas;
  const hwsGasKwh = hwsGasUsageMj * CONSTANTS.GAS_MJ_TO_KWH;
  const currentGasHwsCost = hwsGasUsageMj * gasRate / 100 * (365 / billingDays);
  const heatPumpKwh = hwsGasKwh / CONSTANTS.HEAT_PUMP_COP_DEFAULT;
  const heatPumpAnnualCost = heatPumpKwh * electricityRate / 100 * (365 / billingDays);
  const dailySupplySaved = dailySupply * 365;
  const annualSavings = currentGasHwsCost - heatPumpAnnualCost;
  return {
    currentGasHwsCost: round(currentGasHwsCost, 2),
    heatPumpAnnualCost: round(heatPumpAnnualCost, 2),
    annualSavings: round(annualSavings, 2),
    dailySupplySaved: round(dailySupplySaved, 2)
  };
}
function calculateHeatingCoolingSavings(gasBill, electricityRate = CONSTANTS.DEFAULT_ELECTRICITY_RATE_CENTS, heatingPercentOfGas = 0.35) {
  const gasUsageMj = Number(gasBill.gasUsageMj) || 0;
  const gasRate = Number(gasBill.gasRateCentsMj) || CONSTANTS.DEFAULT_GAS_RATE_CENTS_MJ;
  const billingDays = gasBill.billingDays || 90;
  const heatingGasUsageMj = gasUsageMj * heatingPercentOfGas;
  const heatingGasKwh = heatingGasUsageMj * CONSTANTS.GAS_MJ_TO_KWH;
  const currentGasHeatingCost = heatingGasUsageMj * gasRate / 100 * (365 / billingDays);
  const rcAcKwh = heatingGasKwh / CONSTANTS.HEAT_PUMP_COP_DEFAULT;
  const rcAcAnnualCost = rcAcKwh * electricityRate / 100 * (365 / billingDays);
  const annualSavings = currentGasHeatingCost - rcAcAnnualCost;
  return {
    currentGasHeatingCost: round(currentGasHeatingCost, 2),
    rcAcAnnualCost: round(rcAcAnnualCost, 2),
    annualSavings: round(annualSavings, 2),
    additionalCoolingBenefit: true
    // RC AC provides cooling in summer
  };
}
function calculateCookingSavings(gasBill, electricityRate = CONSTANTS.DEFAULT_ELECTRICITY_RATE_CENTS, cookingPercentOfGas = 0.05) {
  const gasUsageMj = Number(gasBill.gasUsageMj) || 0;
  const gasRate = Number(gasBill.gasRateCentsMj) || CONSTANTS.DEFAULT_GAS_RATE_CENTS_MJ;
  const billingDays = gasBill.billingDays || 90;
  const cookingGasUsageMj = gasUsageMj * cookingPercentOfGas;
  const cookingGasKwh = cookingGasUsageMj * CONSTANTS.GAS_MJ_TO_KWH;
  const currentGasCookingCost = cookingGasUsageMj * gasRate / 100 * (365 / billingDays);
  const inductionKwh = cookingGasKwh / 2.25;
  const inductionAnnualCost = inductionKwh * electricityRate / 100 * (365 / billingDays);
  const annualSavings = currentGasCookingCost - inductionAnnualCost;
  return {
    currentGasCookingCost: round(currentGasCookingCost, 2),
    inductionAnnualCost: round(inductionAnnualCost, 2),
    annualSavings: round(annualSavings, 2)
  };
}
function calculatePoolHeatPump(poolVolumeLitres, electricityRate = CONSTANTS.DEFAULT_ELECTRICITY_RATE_CENTS, hoursPerDay = 8, monthsPerYear = 6) {
  const avgFactor = (CONSTANTS.POOL_KW_PER_1000L_MIN + CONSTANTS.POOL_KW_PER_1000L_MAX) / 2;
  const recommendedKw = poolVolumeLitres / 1e3 * avgFactor;
  const daysPerYear = monthsPerYear * 30;
  const kwhPerYear = recommendedKw * hoursPerDay * daysPerYear / CONSTANTS.HEAT_PUMP_COP_DEFAULT;
  const annualOperatingCost = kwhPerYear * electricityRate / 100;
  const estimatedGasCost = annualOperatingCost * 3.5;
  const estimatedSavingsVsGas = estimatedGasCost - annualOperatingCost;
  return {
    recommendedKw: round(recommendedKw, 1),
    annualOperatingCost: round(annualOperatingCost, 2),
    estimatedSavingsVsGas: round(estimatedSavingsVsGas, 2)
  };
}
function calculateVppIncome(provider) {
  const dailyCredit = Number(provider.dailyCredit) || 0;
  const eventPayment = Number(provider.eventPayment) || 0;
  const eventsPerYear = provider.estimatedEventsPerYear || 10;
  const bundleDiscount = Number(provider.bundleDiscount) || 0;
  const dailyCreditAnnual = dailyCredit * 365;
  const eventPaymentsAnnual = eventPayment * eventsPerYear;
  const totalAnnualValue = dailyCreditAnnual + eventPaymentsAnnual + bundleDiscount;
  return {
    dailyCreditAnnual: round(dailyCreditAnnual, 2),
    eventPaymentsAnnual: round(eventPaymentsAnnual, 2),
    bundleDiscount: round(bundleDiscount, 2),
    totalAnnualValue: round(totalAnnualValue, 2)
  };
}
function compareVppProviders(providers, customerState, needsGasBundle) {
  return providers.filter((p) => {
    const states = p.availableStates;
    if (!states?.includes(customerState)) return false;
    if (needsGasBundle && !p.hasGasBundle) return false;
    return true;
  }).map((p) => {
    const income = calculateVppIncome(p);
    return {
      provider: p.name,
      programName: p.programName || "",
      hasGasBundle: p.hasGasBundle || false,
      estimatedAnnualValue: income.totalAnnualValue,
      strategicFit: getStrategicFit(income.totalAnnualValue, needsGasBundle, p.hasGasBundle || false)
    };
  }).sort((a, b) => b.estimatedAnnualValue - a.estimatedAnnualValue);
}
function getStrategicFit(annualValue, needsGasBundle, hasGasBundle) {
  let score = 0;
  if (annualValue >= 500) score += 3;
  else if (annualValue >= 300) score += 2;
  else if (annualValue >= 100) score += 1;
  if (needsGasBundle && hasGasBundle) score += 2;
  else if (!needsGasBundle) score += 1;
  if (score >= 4) return "excellent";
  if (score >= 3) return "good";
  if (score >= 2) return "moderate";
  return "poor";
}
function calculateEvSavings(electricityRate = CONSTANTS.DEFAULT_ELECTRICITY_RATE_CENTS, kmPerYear = CONSTANTS.EV_KM_PER_YEAR) {
  const litresPerYear = kmPerYear / 100 * CONSTANTS.PETROL_CONSUMPTION_L_PER_100KM;
  const petrolAnnualCost = litresPerYear * CONSTANTS.PETROL_PRICE_PER_LITRE;
  const kwhPerYear = kmPerYear / 100 * CONSTANTS.EV_CONSUMPTION_KWH_PER_100KM;
  const evGridChargeCost = kwhPerYear * electricityRate / 100;
  const evSolarChargeCost = 0;
  return {
    petrolAnnualCost: round(petrolAnnualCost, 2),
    evGridChargeCost: round(evGridChargeCost, 2),
    evSolarChargeCost: round(evSolarChargeCost, 2),
    savingsVsPetrol: round(petrolAnnualCost - evGridChargeCost, 2),
    savingsWithSolar: round(petrolAnnualCost - evSolarChargeCost, 2)
  };
}
function calculateBatterySize(dailyUsageKwh, hasEv, vppParticipation) {
  let recommendedKwh = dailyUsageKwh * 0.45;
  let reasoning = "Sized to cover typical evening/overnight usage";
  if (hasEv) {
    recommendedKwh += 5;
    reasoning += ", plus EV charging capacity";
  }
  if (vppParticipation) {
    recommendedKwh = Math.max(recommendedKwh, 10);
    reasoning += ", optimized for VPP participation";
  }
  const standardSizes = [5, 7, 10, 13, 15, 20, 26, 30];
  recommendedKwh = standardSizes.reduce(
    (prev, curr) => Math.abs(curr - recommendedKwh) < Math.abs(prev - recommendedKwh) ? curr : prev
  );
  const estimatedCost = recommendedKwh * 900;
  return {
    recommendedKwh,
    reasoning,
    estimatedCost: round(estimatedCost, 0)
  };
}
function calculateSolarSize(yearlyUsageKwh, batteryKwh, hasEv) {
  let targetGeneration = yearlyUsageKwh * 1.1;
  targetGeneration += batteryKwh * 365 * 0.5;
  if (hasEv) {
    targetGeneration += CONSTANTS.EV_KM_PER_YEAR / 100 * CONSTANTS.EV_CONSUMPTION_KWH_PER_100KM;
  }
  const recommendedKw = targetGeneration / (365 * 4);
  const roundedKw = Math.ceil(recommendedKw * 2) / 2;
  const panelCount = Math.ceil(roundedKw * 1e3 / 400);
  const annualGeneration = roundedKw * 365 * 4;
  const estimatedCost = roundedKw * 1100;
  return {
    recommendedKw: roundedKw,
    panelCount,
    annualGeneration: round(annualGeneration, 0),
    estimatedCost: round(estimatedCost, 0)
  };
}
function calculatePayback(investments, rebates, annualSavings) {
  const totalInvestment = Object.values(investments).reduce((sum, val) => sum + (val || 0), 0);
  const totalRebates = Object.values(rebates).reduce((sum, val) => sum + (val || 0), 0);
  const netInvestment = totalInvestment - totalRebates;
  const totalAnnualBenefit = Object.values(annualSavings).reduce((sum, val) => sum + (val || 0), 0);
  const paybackYears = totalAnnualBenefit > 0 ? netInvestment / totalAnnualBenefit : 0;
  const tenYearSavings = totalAnnualBenefit * 10 - netInvestment;
  const twentyFiveYearSavings = totalAnnualBenefit * 25 - netInvestment;
  return {
    totalInvestment: round(totalInvestment, 0),
    totalRebates: round(totalRebates, 0),
    netInvestment: round(netInvestment, 0),
    totalAnnualBenefit: round(totalAnnualBenefit, 0),
    paybackYears: round(paybackYears, 1),
    tenYearSavings: round(tenYearSavings, 0),
    twentyFiveYearSavings: round(twentyFiveYearSavings, 0)
  };
}
function calculateCo2Reduction(currentElectricityKwh, currentGasMj, solarGenerationKwh, gasEliminated) {
  const electricityCo2 = currentElectricityKwh * CONSTANTS.CO2_PER_KWH_GRID / 1e3;
  const gasCo2 = currentGasMj * CONSTANTS.CO2_PER_MJ_GAS / 1e3;
  const currentCo2Tonnes = electricityCo2 + gasCo2;
  const netGridUsage = Math.max(0, currentElectricityKwh - solarGenerationKwh);
  const projectedElectricityCo2 = netGridUsage * CONSTANTS.CO2_PER_KWH_GRID / 1e3;
  const projectedGasCo2 = gasEliminated ? 0 : gasCo2;
  const projectedCo2Tonnes = projectedElectricityCo2 + projectedGasCo2;
  const reductionTonnes = currentCo2Tonnes - projectedCo2Tonnes;
  const reductionPercent = currentCo2Tonnes > 0 ? reductionTonnes / currentCo2Tonnes * 100 : 0;
  return {
    currentCo2Tonnes: round(currentCo2Tonnes, 2),
    projectedCo2Tonnes: round(projectedCo2Tonnes, 2),
    reductionTonnes: round(reductionTonnes, 2),
    reductionPercent: round(reductionPercent, 1)
  };
}
function generateFullCalculations(customer, electricityBill, gasBill, vppProviders2, rebates) {
  const usage = calculateUsageProjections(electricityBill);
  const electricityRate = Number(electricityBill.peakRateCents) || CONSTANTS.DEFAULT_ELECTRICITY_RATE_CENTS;
  let gasAnalysis = null;
  let hotWaterSavings = null;
  let heatingCoolingSavings = null;
  let cookingSavings = null;
  if (gasBill) {
    gasAnalysis = calculateGasAnalysis(gasBill);
    hotWaterSavings = calculateHotWaterSavings(gasBill, electricityRate);
    heatingCoolingSavings = calculateHeatingCoolingSavings(gasBill, electricityRate);
    cookingSavings = calculateCookingSavings(gasBill, electricityRate);
  }
  let poolAnalysis = null;
  if (customer.hasPool && customer.poolVolume) {
    poolAnalysis = calculatePoolHeatPump(customer.poolVolume, electricityRate);
  }
  let evSavings = null;
  if (customer.hasEV || customer.evInterest === "interested" || customer.evInterest === "owns") {
    evSavings = calculateEvSavings(electricityRate);
  }
  const battery = calculateBatterySize(
    usage.dailyAverageKwh,
    customer.hasEV || false,
    true
    // Assume VPP participation
  );
  let solar = null;
  if (!customer.hasExistingSolar) {
    solar = calculateSolarSize(
      usage.yearlyUsageKwh,
      battery.recommendedKwh,
      customer.hasEV || false
    );
  }
  const vppComparison = compareVppProviders(
    vppProviders2,
    customer.state,
    gasBill !== null
    // Needs gas bundle if they have gas
  );
  const selectedVpp = vppComparison[0];
  const vppIncome = selectedVpp ? calculateVppIncome(
    vppProviders2.find((p) => p.name === selectedVpp.provider)
  ) : null;
  const solarRebate = rebates.find((r) => r.rebateType === "solar");
  const batteryRebate = rebates.find((r) => r.rebateType === "battery");
  const heatPumpHwRebate = rebates.find((r) => r.rebateType === "heat_pump_hw");
  const heatPumpAcRebate = rebates.find((r) => r.rebateType === "heat_pump_ac");
  const payback = calculatePayback(
    {
      solar: solar?.estimatedCost,
      battery: battery.estimatedCost,
      heatPumpHw: gasBill ? 3500 : void 0,
      // Typical heat pump HW cost
      rcAc: gasBill ? 8e3 : void 0,
      // Typical RC AC cost
      induction: gasBill ? 2e3 : void 0,
      // Typical induction cost
      evCharger: customer.hasEV ? 1500 : void 0,
      poolHeatPump: poolAnalysis ? 4e3 : void 0
    },
    {
      solar: solarRebate ? Number(solarRebate.amount) : 0,
      battery: batteryRebate ? Number(batteryRebate.amount) : 0,
      heatPumpHw: heatPumpHwRebate ? Number(heatPumpHwRebate.amount) : 0,
      rcAc: heatPumpAcRebate ? Number(heatPumpAcRebate.amount) : 0
    },
    {
      electricity: solar ? usage.projectedAnnualCost * 0.7 : 0,
      // 70% reduction with solar
      gas: gasAnalysis ? gasAnalysis.annualGasCost : 0,
      vpp: vppIncome?.totalAnnualValue,
      ev: evSavings?.savingsWithSolar
    }
  );
  const co2 = calculateCo2Reduction(
    usage.yearlyUsageKwh,
    gasBill ? Number(gasBill.gasUsageMj) * (365 / (gasBill.billingDays || 90)) : 0,
    solar?.annualGeneration || 0,
    gasBill !== null
  );
  const billingDays = electricityBill.billingDays || 90;
  const dailySupply = Number(electricityBill.dailySupplyCharge) || CONSTANTS.DEFAULT_DAILY_SUPPLY_CHARGE;
  const annualSupplyCharge = round(dailySupply * 365, 2);
  const feedInTariff = Number(electricityBill.feedInTariffCents) || CONSTANTS.DEFAULT_FEED_IN_TARIFF_CENTS;
  const solarExports = Number(electricityBill.solarExportsKwh) || 0;
  const annualSolarCredit = round(solarExports * feedInTariff / 100 * (365 / billingDays), 2);
  const annualUsageCharge = round(usage.projectedAnnualCost - annualSupplyCharge + annualSolarCredit, 2);
  const gasAnnualSupplyCharge = gasBill ? round((Number(gasBill.dailySupplyCharge) || 0) * 365, 2) : void 0;
  const investSolar = solar?.estimatedCost;
  const investBattery = battery.estimatedCost;
  const investHeatPumpHw = gasBill ? 3500 : void 0;
  const investRcAc = gasBill ? 8e3 : void 0;
  const investInduction = gasBill ? 2e3 : void 0;
  const investEvCharger = customer.hasEV ? 1500 : void 0;
  const investPoolHeatPump = poolAnalysis ? 4e3 : void 0;
  return {
    // ========== RAW BILL DATA ==========
    billRetailer: electricityBill.retailer || void 0,
    billPeriodStart: electricityBill.billingPeriodStart?.toISOString().split("T")[0],
    billPeriodEnd: electricityBill.billingPeriodEnd?.toISOString().split("T")[0],
    billDays: electricityBill.billingDays || void 0,
    billTotalAmount: Number(electricityBill.totalAmount) || void 0,
    billDailySupplyCharge: Number(electricityBill.dailySupplyCharge) || void 0,
    billTotalUsageKwh: Number(electricityBill.totalUsageKwh) || void 0,
    billPeakUsageKwh: Number(electricityBill.peakUsageKwh) || void 0,
    billOffPeakUsageKwh: Number(electricityBill.offPeakUsageKwh) || void 0,
    billShoulderUsageKwh: Number(electricityBill.shoulderUsageKwh) || void 0,
    billSolarExportsKwh: Number(electricityBill.solarExportsKwh) || void 0,
    billPeakRateCents: Number(electricityBill.peakRateCents) || void 0,
    billOffPeakRateCents: Number(electricityBill.offPeakRateCents) || void 0,
    billShoulderRateCents: Number(electricityBill.shoulderRateCents) || void 0,
    billFeedInTariffCents: Number(electricityBill.feedInTariffCents) || void 0,
    // Gas Bill Details
    gasBillRetailer: gasBill?.retailer || void 0,
    gasBillPeriodStart: gasBill?.billingPeriodStart?.toISOString().split("T")[0],
    gasBillPeriodEnd: gasBill?.billingPeriodEnd?.toISOString().split("T")[0],
    gasBillDays: gasBill?.billingDays || void 0,
    gasBillTotalAmount: gasBill ? Number(gasBill.totalAmount) || void 0 : void 0,
    gasBillDailySupplyCharge: gasBill ? Number(gasBill.dailySupplyCharge) || void 0 : void 0,
    gasBillUsageMj: gasBill ? Number(gasBill.gasUsageMj) || void 0 : void 0,
    gasBillRateCentsMj: gasBill ? Number(gasBill.gasRateCentsMj) || void 0 : void 0,
    // ========== USAGE PROJECTIONS ==========
    dailyAverageKwh: usage.dailyAverageKwh,
    monthlyUsageKwh: usage.monthlyUsageKwh,
    yearlyUsageKwh: usage.yearlyUsageKwh,
    projectedAnnualCost: usage.projectedAnnualCost,
    dailyAverageCost: usage.dailyAverageCost,
    annualSupplyCharge,
    annualUsageCharge,
    annualSolarCredit,
    // ========== GAS ANALYSIS ==========
    gasAnnualCost: gasAnalysis?.annualGasCost,
    gasKwhEquivalent: gasAnalysis?.gasKwhEquivalent,
    gasCo2Emissions: gasAnalysis?.co2EmissionsKg,
    gasDailyGasCost: gasAnalysis?.dailyGasCost,
    gasAnnualSupplyCharge,
    // ========== ELECTRIFICATION DETAIL ==========
    hotWaterSavings: hotWaterSavings?.annualSavings,
    hotWaterCurrentGasCost: hotWaterSavings?.currentGasHwsCost,
    hotWaterHeatPumpCost: hotWaterSavings?.heatPumpAnnualCost,
    hotWaterDailySupplySaved: hotWaterSavings?.dailySupplySaved,
    heatingCoolingSavings: heatingCoolingSavings?.annualSavings,
    heatingCurrentGasCost: heatingCoolingSavings?.currentGasHeatingCost,
    heatingRcAcCost: heatingCoolingSavings?.rcAcAnnualCost,
    cookingSavings: cookingSavings?.annualSavings,
    cookingCurrentGasCost: cookingSavings?.currentGasCookingCost,
    cookingInductionCost: cookingSavings?.inductionAnnualCost,
    poolHeatPumpSavings: poolAnalysis?.estimatedSavingsVsGas,
    poolRecommendedKw: poolAnalysis?.recommendedKw,
    poolAnnualOperatingCost: poolAnalysis?.annualOperatingCost,
    // ========== BATTERY ==========
    recommendedBatteryKwh: battery.recommendedKwh,
    batteryProduct: "Sigenergy SigenStor",
    batteryPaybackYears: payback.paybackYears,
    batteryEstimatedCost: battery.estimatedCost,
    // ========== SOLAR ==========
    recommendedSolarKw: solar?.recommendedKw,
    solarPanelCount: solar?.panelCount,
    solarAnnualGeneration: solar?.annualGeneration,
    solarEstimatedCost: solar?.estimatedCost,
    // ========== VPP ==========
    selectedVppProvider: selectedVpp?.provider,
    vppAnnualValue: vppIncome?.totalAnnualValue,
    vppDailyCreditAnnual: vppIncome?.dailyCreditAnnual,
    vppEventPaymentsAnnual: vppIncome?.eventPaymentsAnnual,
    vppBundleDiscount: vppIncome?.bundleDiscount,
    vppProviderComparison: vppComparison,
    // ========== EV ==========
    evPetrolCost: evSavings?.petrolAnnualCost,
    evGridChargeCost: evSavings?.evGridChargeCost,
    evSolarChargeCost: evSavings?.evSolarChargeCost,
    evAnnualSavings: evSavings?.savingsWithSolar,
    evKmPerYear: CONSTANTS.EV_KM_PER_YEAR,
    evConsumptionPer100km: CONSTANTS.EV_CONSUMPTION_KWH_PER_100KM,
    evPetrolPricePerLitre: CONSTANTS.PETROL_PRICE_PER_LITRE,
    // ========== CO2 ==========
    co2ReductionTonnes: co2.reductionTonnes,
    co2CurrentTonnes: co2.currentCo2Tonnes,
    co2ProjectedTonnes: co2.projectedCo2Tonnes,
    co2ReductionPercent: co2.reductionPercent,
    // ========== REBATES DETAIL ==========
    solarRebateAmount: solarRebate ? Number(solarRebate.amount) : void 0,
    batteryRebateAmount: batteryRebate ? Number(batteryRebate.amount) : void 0,
    heatPumpHwRebateAmount: heatPumpHwRebate ? Number(heatPumpHwRebate.amount) : void 0,
    heatPumpAcRebateAmount: heatPumpAcRebate ? Number(heatPumpAcRebate.amount) : void 0,
    // ========== INVESTMENT DETAIL ==========
    investmentSolar: investSolar,
    investmentBattery: investBattery,
    investmentHeatPumpHw: investHeatPumpHw,
    investmentRcAc: investRcAc,
    investmentInduction: investInduction,
    investmentEvCharger: investEvCharger,
    investmentPoolHeatPump: investPoolHeatPump,
    // ========== TOTAL SUMMARY ==========
    totalAnnualSavings: payback.totalAnnualBenefit,
    totalInvestment: payback.totalInvestment,
    totalRebates: payback.totalRebates,
    netInvestment: payback.netInvestment,
    paybackYears: payback.paybackYears,
    tenYearSavings: payback.tenYearSavings,
    twentyFiveYearSavings: payback.twentyFiveYearSavings
  };
}
function round(value, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

// server/slideGenerator.ts
init_brand();
function generateSlides(data) {
  const slides = [];
  let slideId = 1;
  slides.push({
    id: slideId++,
    type: "cover",
    title: data.customerName,
    subtitle: "In-Depth Bill Analysis & Solar Battery Proposal",
    content: {
      address: data.address,
      state: data.state,
      preparedBy: BRAND.contact.name,
      company: BRAND.contact.company,
      logoUrl: BRAND.logo.iconWhite,
      date: (/* @__PURE__ */ new Date()).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })
    }
  });
  slides.push({
    id: slideId++,
    type: "executive_summary",
    title: "EXECUTIVE SUMMARY",
    subtitle: "Your Energy Transformation at a Glance",
    content: {
      currentAnnualCost: data.annualCost,
      projectedAnnualCost: data.annualCost - data.annualSavings,
      totalAnnualSavings: data.annualSavings,
      paybackYears: data.paybackYears,
      systemSize: data.solarSizeKw,
      batterySize: data.batterySizeKwh,
      vppProvider: data.vppProvider,
      co2Reduction: data.co2ReductionTonnes
    }
  });
  slides.push({
    id: slideId++,
    type: "bill_analysis",
    title: "CURRENT BILL ANALYSIS",
    subtitle: "Detailed Breakdown",
    content: {
      retailer: data.retailer,
      annualCost: data.annualCost,
      usageCost: data.annualUsageKwh * (data.usageRateCentsPerKwh / 100),
      supplyCost: data.supplyChargeCentsPerDay * 365 / 100,
      usageRate: data.usageRateCentsPerKwh,
      supplyCharge: data.supplyChargeCentsPerDay,
      feedInTariff: data.feedInTariffCentsPerKwh,
      controlledLoadRate: data.controlledLoadRateCentsPerKwh
    }
  });
  slides.push({
    id: slideId++,
    type: "usage_analysis",
    title: "MONTHLY USAGE ANALYSIS",
    subtitle: "Your Energy Consumption Pattern",
    content: {
      annualUsageKwh: data.annualUsageKwh,
      dailyAverageKwh: data.dailyUsageKwh,
      monthlyAverageKwh: data.annualUsageKwh / 12,
      peakMonth: findPeakMonth(data.monthlyUsageData),
      monthlyData: data.monthlyUsageData || [],
      usageRate: data.usageRateCentsPerKwh,
      feedInTariff: data.feedInTariffCentsPerKwh
    }
  });
  slides.push({
    id: slideId++,
    type: "yearly_projection",
    title: "YEARLY COST PROJECTION",
    subtitle: "Annual Analysis & 25-Year Outlook",
    content: {
      currentAnnualCost: data.annualCost,
      projectedAnnualCost: data.annualCost - data.annualSavings,
      tenYearSavings: data.tenYearSavings,
      twentyFiveYearSavings: data.twentyFiveYearSavings || data.annualSavings * 25,
      inflationRate: 3.5,
      yearlyProjection: generateYearlyProjection(data.annualCost, data.annualSavings, 25)
    }
  });
  if (data.hasGas && data.gasAnnualCost) {
    slides.push({
      id: slideId++,
      type: "gas_footprint",
      title: "CURRENT GAS FOOTPRINT",
      subtitle: "Gas Usage & Environmental Impact",
      content: {
        annualMJ: data.gasAnnualMJ || 0,
        annualCost: data.gasAnnualCost,
        dailySupplyCharge: data.gasDailySupplyCharge || 0,
        usageRate: data.gasUsageRate || 0,
        kwhEquivalent: (data.gasAnnualMJ || 0) * 0.2778,
        co2Emissions: data.gasCO2Emissions || (data.gasAnnualMJ || 0) * 0.0519
      }
    });
  }
  if (data.hasGas && data.gasAppliances) {
    slides.push({
      id: slideId++,
      type: "gas_appliances",
      title: "GAS APPLIANCE INVENTORY",
      subtitle: "Electrification Priority Assessment",
      content: {
        appliances: data.gasAppliances,
        totalGasCost: data.gasAnnualCost || 0,
        electrificationPriority: [
          data.gasAppliances.hotWater ? { name: "Hot Water System", type: data.gasAppliances.hotWater.type, priority: "HIGH", savings: data.heatPumpSavings || 800 } : null,
          data.gasAppliances.heating ? { name: "Heating System", type: data.gasAppliances.heating.type, priority: "MEDIUM", savings: data.heatingCoolingSavings || 600 } : null,
          data.gasAppliances.cooktop ? { name: "Gas Cooktop", type: data.gasAppliances.cooktop.type, priority: "LOW", savings: data.inductionSavings || 200 } : null,
          data.gasAppliances.poolHeater ? { name: "Pool Heater", type: data.gasAppliances.poolHeater.type, priority: "MEDIUM", savings: data.poolPumpSavings || 500 } : null
        ].filter(Boolean)
      }
    });
  }
  slides.push({
    id: slideId++,
    type: "strategic_assessment",
    title: "STRATEGIC ASSESSMENT",
    subtitle: "Battery Storage Investment",
    content: {
      advantages: [
        { icon: "\u26A1", title: "ENERGY INDEPENDENCE", description: "Reduce grid reliance from 100% to near-zero during outages." },
        { icon: "\u{1F4B0}", title: "VPP INCOME", description: `Earn $${data.vppAnnualValue}-${data.vppAnnualValue + 150}/year through Virtual Power Plant participation.` },
        { icon: "\u{1F697}", title: "FUTURE-PROOFING", description: "Ready for EV charging and time-of-use tariffs." },
        { icon: "\u{1F4C8}", title: "PEAK SHIFTING", description: "Store cheap solar energy for expensive peak periods (6-9pm)." },
        { icon: "\u{1F6E1}", title: "BLACKOUT PROTECTION", description: `Partial home backup with ${data.batteryBrand} system.` }
      ],
      considerations: [
        { icon: "\u{1F4B5}", title: "UPFRONT COST", description: `$${data.netInvestment.toLocaleString()} investment (after rebates).` },
        { icon: "\u23F3", title: "PAYBACK PERIOD", description: `${data.paybackYears.toFixed(1)} years for battery component alone.` },
        { icon: "\u{1F5A5}", title: "TECHNOLOGY EVOLUTION", description: "Battery technology is improving rapidly." },
        { icon: "\u{1F4E6}", title: "SPACE REQUIREMENTS", description: "Floor-mounted unit requires dedicated garage space." },
        { icon: "\u{1F50B}", title: "DEGRADATION", description: "Battery capacity reduces over time (approx. 0.35%/year)." }
      ]
    }
  });
  slides.push({
    id: slideId++,
    type: "battery_recommendation",
    title: "RECOMMENDED BATTERY SIZE",
    subtitle: `${data.batteryBrand} Configuration`,
    content: {
      totalCapacity: data.batterySizeKwh,
      inverterSize: data.inverterSizeKw,
      inverterType: "HYBRID",
      modules: calculateBatteryModules(data.batterySizeKwh),
      technology: "LFP (SAFE)",
      brand: data.batteryBrand,
      whyThisCapacity: {
        home: Math.min(4, data.dailyUsageKwh * 0.3),
        evCharge: data.hasEV ? 10 : 0,
        vppTrade: Math.max(0, data.batterySizeKwh - 4 - (data.hasEV ? 10 : 0))
      },
      explanation: `This configuration ensures your home runs 100% off-grid overnight, ${data.hasEV ? "fully charges your EV for daily commuting, and " : ""}leaves substantial capacity for high-value VPP trading events.`
    }
  });
  slides.push({
    id: slideId++,
    type: "solar_system",
    title: "PROPOSED SOLAR PV SYSTEM",
    subtitle: "High-Performance Hardware Specification",
    content: {
      systemSize: data.solarSizeKw,
      panelCount: data.panelCount,
      panelPower: data.panelWattage,
      panelBrand: data.panelBrand,
      whyThisBrand: `${data.panelBrand} panels deliver industry-leading efficiency with superior shade performance, maximizing energy harvest from your roof.`,
      features: [
        { icon: "\u25CF", title: "25-Year Warranty", description: "Full product and performance guarantee" },
        { icon: "\u25CF", title: "Full Black Design", description: "Premium aesthetic integration with your roof" },
        { icon: "\u25CF", title: "Shade Optimization", description: "Advanced cell technology for partial shade conditions" }
      ]
    }
  });
  slides.push({
    id: slideId++,
    type: "vpp_comparison",
    title: "VPP PROVIDER COMPARISON",
    subtitle: `Evaluating Market Leaders${data.hasGasBundle ? " for Gas & Elec Bundles" : ""}`,
    content: {
      providers: getVPPProviders(data.state, data.hasGasBundle).slice(0, 5),
      recommendedProvider: data.vppProvider
    }
  });
  slides.push({
    id: slideId++,
    type: "vpp_recommendation",
    title: "VPP RECOMMENDATION",
    subtitle: "Optimal Provider Selection",
    content: {
      provider: data.vppProvider,
      program: data.vppProgram,
      annualValue: data.vppAnnualValue,
      features: [
        { icon: "\u2261", title: "INTEGRATED BUNDLE", description: `Gas & Electricity combined for maximum savings with ${data.vppProvider}.` },
        { icon: "\u2197", title: "FINANCIAL CERTAINTY", description: "Fixed daily credits plus variable event payments provide predictable income." },
        { icon: "\u2295", title: "STRATEGIC FIT", description: `Optimized for your ${data.batterySizeKwh}kWh battery and ${data.solarSizeKw}kW solar system.` }
      ]
    }
  });
  if (data.hasGas && data.gasAppliances?.hotWater) {
    slides.push({
      id: slideId++,
      type: "hot_water_electrification",
      title: "HOT WATER ELECTRIFICATION",
      subtitle: "Heat Pump Upgrade Analysis",
      content: {
        currentSystem: data.gasAppliances.hotWater.type || "Gas Storage Hot Water",
        recommendedSystem: data.heatPumpBrand || "Reclaim Energy CO2 Heat Pump",
        annualGasCost: data.gasAppliances.hotWater.annualCost || 600,
        annualHeatPumpCost: Math.round((data.gasAppliances.hotWater.annualCost || 600) * 0.25),
        annualSavings: data.heatPumpSavings || 800,
        installCost: data.heatPumpCost || 3500,
        rebates: 1e3,
        netCost: (data.heatPumpCost || 3500) - 1e3,
        features: ["COP 4.0+ efficiency rating", "Works in temperatures -10\xB0C to 43\xB0C", "Quiet operation (37dB)", "Smart timer integration with solar"]
      }
    });
  }
  if (data.hasGas && data.gasAppliances?.heating) {
    slides.push({
      id: slideId++,
      type: "heating_cooling",
      title: "HEATING & COOLING UPGRADE",
      subtitle: "Reverse Cycle AC Analysis",
      content: {
        currentSystem: data.gasAppliances.heating.type || "Gas Ducted Heating",
        recommendedSystem: data.acBrand || "Daikin Reverse Cycle Split System",
        annualGasCost: data.gasAppliances.heating.annualCost || 1200,
        annualACCost: Math.round((data.gasAppliances.heating.annualCost || 1200) * 0.3),
        annualSavings: data.heatingCoolingSavings || 600,
        installCost: data.heatingCoolingCost || 8e3,
        rebates: 1500,
        netCost: (data.heatingCoolingCost || 8e3) - 1500,
        cop: 4.5,
        features: ["Heating AND cooling in one system", "Zone control for individual rooms", "Wi-Fi smart control", "Pairs with solar for free operation"]
      }
    });
  }
  if (data.hasGas && data.gasAppliances?.cooktop) {
    slides.push({
      id: slideId++,
      type: "induction_cooking",
      title: "INDUCTION COOKING UPGRADE",
      subtitle: "Gas Cooktop Replacement",
      content: {
        currentSystem: data.gasAppliances.cooktop.type || "Gas Cooktop",
        recommendedSystem: data.inductionBrand || "Bosch Induction Cooktop",
        annualGasCost: data.gasAppliances.cooktop.annualCost || 200,
        annualInductionCost: Math.round((data.gasAppliances.cooktop.annualCost || 200) * 0.4),
        annualSavings: data.inductionSavings || 200,
        installCost: data.inductionCost || 2500,
        features: ["90% energy efficiency (vs 40% gas)", "Instant heat control", "Safer - no open flame", "Easy to clean flat surface"]
      }
    });
  }
  if (data.hasEV) {
    slides.push({
      id: slideId++,
      type: "ev_analysis",
      title: "EV ANALYSIS",
      subtitle: `${(data.evAnnualKm || 15e3).toLocaleString()} km Annual Usage Scenario`,
      content: {
        annualKm: data.evAnnualKm || 15e3,
        annualSavings: data.evAnnualSavings || 2e3,
        co2Avoided: (data.evAnnualKm || 15e3) / 100 * 0.23,
        comparison: [
          { scenario: "Petrol SUV (10L/100km)", costPer100km: 20, annualCost: Math.round((data.evAnnualKm || 15e3) / 100 * 20) },
          { scenario: "EV (Grid Charge)", costPer100km: 4.5, annualCost: Math.round((data.evAnnualKm || 15e3) / 100 * 4.5) },
          { scenario: "EV (Solar Charge)", costPer100km: 0, annualCost: 0 }
        ]
      }
    });
  }
  if (data.hasEV) {
    slides.push({
      id: slideId++,
      type: "ev_charger",
      title: "EV CHARGER RECOMMENDATION",
      subtitle: "Smart Charging Solution",
      content: {
        recommendedCharger: data.evChargerBrand || "Sigenergy EV Charger",
        chargingSpeed: "7.4kW / 32A Single Phase",
        installCost: data.evChargerCost || 2500,
        features: ["Solar-aware charging mode", "Scheduled charging for off-peak", "App control & monitoring", "Load management integration"],
        solarChargingBenefits: ["Charge from excess solar for $0/km", "Battery-to-EV overnight transfer", "Smart scheduling around VPP events"]
      }
    });
  }
  if (data.hasPoolPump) {
    slides.push({
      id: slideId++,
      type: "pool_heat_pump",
      title: "POOL HEAT PUMP",
      subtitle: "Efficient Pool Heating Solution",
      content: {
        currentSystem: "Gas Pool Heater",
        recommendedSystem: data.poolHeatPumpBrand || "Madimack InverECO Pool Heat Pump",
        annualGasCost: data.gasAppliances?.poolHeater?.annualCost || 1200,
        annualHeatPumpCost: Math.round((data.gasAppliances?.poolHeater?.annualCost || 1200) * 0.2),
        annualSavings: data.poolPumpSavings || 500,
        installCost: data.poolHeatPumpCost || 4500,
        cop: 6,
        features: ["COP 6.0 - 6x more efficient than gas", "Extends swimming season year-round", "Quiet inverter operation", "Solar-powered for near-zero running cost"]
      }
    });
  }
  if (data.hasGas && data.electrificationTotalCost) {
    slides.push({
      id: slideId++,
      type: "electrification_investment",
      title: "FULL ELECTRIFICATION INVESTMENT",
      subtitle: "Complete Gas Elimination Pathway",
      content: {
        items: [
          { item: "Heat Pump Hot Water", cost: data.heatPumpCost || 3500, rebate: 1e3 },
          { item: "Reverse Cycle AC", cost: data.heatingCoolingCost || 8e3, rebate: 1500 },
          { item: "Induction Cooktop", cost: data.inductionCost || 2500, rebate: 0 },
          data.hasPoolPump ? { item: "Pool Heat Pump", cost: data.poolHeatPumpCost || 4500, rebate: 0 } : null
        ].filter(Boolean),
        totalCost: data.electrificationTotalCost,
        totalRebates: data.electrificationTotalRebates || 2500,
        netInvestment: data.electrificationNetCost || data.electrificationTotalCost - (data.electrificationTotalRebates || 2500),
        annualGasSavings: data.gasAnnualCost || 0,
        gasSupplyChargeSaved: (data.gasDailySupplyCharge || 0.8) * 365
      }
    });
  }
  slides.push({
    id: slideId++,
    type: "savings_summary",
    title: "TOTAL SAVINGS SUMMARY",
    subtitle: "Combined Annual Financial Benefits",
    content: {
      totalAnnualBenefit: data.annualSavings,
      breakdown: [
        { category: "Solar & Battery", value: Math.round((data.annualSavings - data.vppAnnualValue - (data.evAnnualSavings || 0)) * 1), color: "aqua" },
        data.hasEV ? { category: "EV Integration", value: data.evAnnualSavings || 0, color: "white" } : null,
        { category: "VPP Credits", value: data.vppAnnualValue, color: "orange" },
        data.hasGas ? { category: "Gas Elimination", value: data.gasAnnualCost || 0, color: "orange" } : null
      ].filter(Boolean),
      taxFree: true
    }
  });
  slides.push({
    id: slideId++,
    type: "financial_summary",
    title: "FINANCIAL SUMMARY & PAYBACK",
    subtitle: "Investment Analysis & ROI",
    content: {
      systemCost: data.systemCost,
      rebates: data.rebateAmount,
      netInvestment: data.netInvestment,
      annualBenefit: data.annualSavings,
      paybackYears: data.paybackYears,
      tenYearSavings: data.tenYearSavings,
      twentyFiveYearSavings: data.twentyFiveYearSavings || data.annualSavings * 25,
      roi: Math.round(data.annualSavings / data.netInvestment * 100),
      acceleratedBy: data.hasEV ? "EV & VPP" : "VPP"
    }
  });
  slides.push({
    id: slideId++,
    type: "environmental_impact",
    title: "ENVIRONMENTAL IMPACT",
    subtitle: "Your Contribution to a Cleaner Future",
    content: {
      co2ReductionTonnes: data.co2ReductionTonnes,
      treesEquivalent: data.treesEquivalent || Math.round(data.co2ReductionTonnes * 45),
      carsOffRoad: Math.round(data.co2ReductionTonnes / 4.6),
      energyIndependenceScore: data.energyIndependenceScore || 85,
      twentyFiveYearCO2: data.co2ReductionTonnes * 25,
      benefits: [
        { icon: "\u{1F33F}", title: "CARBON REDUCTION", description: `${data.co2ReductionTonnes.toFixed(1)} tonnes CO2 avoided annually` },
        { icon: "\u{1F333}", title: "TREE EQUIVALENT", description: `Equivalent to planting ${data.treesEquivalent || Math.round(data.co2ReductionTonnes * 45)} trees per year` },
        { icon: "\u26A1", title: "ENERGY INDEPENDENCE", description: `${data.energyIndependenceScore || 85}% energy self-sufficiency achieved` }
      ]
    }
  });
  slides.push({
    id: slideId++,
    type: "roadmap",
    title: "RECOMMENDED ROADMAP",
    subtitle: "Implementation Timeline",
    content: {
      steps: [
        { number: "01", title: "APPROVAL & FINANCE", description: "Sign proposal and submit finance application. Secure rebates.", timeline: "WEEK 1", color: "aqua" },
        { number: "02", title: "INSTALLATION", description: `Installation of ${data.panelBrand} panels, ${data.inverterBrand} inverter, and battery modules.`, timeline: "WEEK 3-4", color: "aqua" },
        { number: "03", title: "VPP ACTIVATION", description: `Switch to ${data.vppProvider} ${data.vppProgram}. Configure battery for VPP events.`, timeline: "WEEK 5", color: "aqua" },
        { number: "04", title: "EV INTEGRATION", description: "Install EV charger. Set up solar-only charging logic.", timeline: "MONTH 2+", color: "orange" },
        data.hasGas ? { number: "05", title: "ELECTRIFICATION", description: "Phase out gas appliances. Install heat pump, AC, and induction.", timeline: "MONTH 3-6", color: "orange" } : null
      ].filter(Boolean)
    }
  });
  slides.push({
    id: slideId++,
    type: "conclusion",
    title: "CONCLUSION",
    subtitle: "Executive Summary",
    content: {
      features: [
        { icon: "\u{1F4C8}", title: "MAXIMIZE RETURNS", description: `Turn a $${Math.round(data.annualCost / 12)} monthly bill into a $${data.annualSavings.toLocaleString()} annual profit center through smart solar, battery, and VPP integration.`, border: "aqua" },
        { icon: "\u{1F6E1}", title: "SECURE POWER", description: `Gain independence from grid instability and rising costs with a ${data.batterySizeKwh}kWh battery backup system.`, border: "white" },
        { icon: "\u26A1", title: "FUTURE READY", description: "Prepare your home for EV charging and full electrification, eliminating petrol and gas costs forever.", border: "orange" }
      ],
      quote: '"THIS SOLUTION TRANSFORMS YOUR HOME FROM AN ENERGY CONSUMER INTO A CLEAN POWER STATION."',
      callToAction: "Recommended Action: Approve Proposal to Secure Rebates"
    }
  });
  slides.push({
    id: slideId++,
    type: "contact",
    title: "NEXT STEPS",
    subtitle: "Get Started Today",
    content: {
      preparedBy: BRAND.contact.name,
      title: BRAND.contact.title,
      company: BRAND.contact.company,
      address: BRAND.contact.address,
      phone: BRAND.contact.phone,
      email: BRAND.contact.email,
      website: BRAND.contact.website,
      copyright: BRAND.contact.copyright,
      logoUrl: BRAND.logo.iconWhite,
      nextSteps: [
        "Review this proposal and ask any questions",
        "Approve the proposal to lock in current rebates",
        "Schedule site inspection and installation date",
        "Enjoy clean, free energy for 25+ years"
      ]
    }
  });
  return slides;
}
function generateYearlyProjection(currentCost, annualSavings, years) {
  const projection = [];
  let cumulativeSavings = 0;
  const inflationRate = 0.035;
  for (let i = 1; i <= years; i++) {
    const inflatedCost = currentCost * Math.pow(1 + inflationRate, i);
    const withSolar = Math.max(0, inflatedCost - annualSavings);
    cumulativeSavings += inflatedCost - withSolar;
    projection.push({ year: i, withoutSolar: Math.round(inflatedCost), withSolar: Math.round(withSolar), cumulativeSavings: Math.round(cumulativeSavings) });
  }
  return projection;
}
function findPeakMonth(monthlyData) {
  if (!monthlyData || monthlyData.length === 0) return null;
  return monthlyData.reduce((max, curr) => curr.kwh > max.kwh ? curr : max, monthlyData[0]);
}
function calculateBatteryModules(totalKwh) {
  const moduleSize = 8.06;
  const count = Math.ceil(totalKwh / moduleSize);
  return `${count} x ${moduleSize} KWH`;
}
function getVPPProviders(state, hasGas) {
  const providers = [
    { provider: "ENGIE", program: "VPP Advantage", gasBundle: true, annualValue: "$450+", strategicFit: "EXCELLENT" },
    { provider: "ORIGIN", program: "Loop VPP", gasBundle: true, annualValue: "~$300", strategicFit: "GOOD" },
    { provider: "AGL", program: "Night Saver", gasBundle: true, annualValue: "~$250", strategicFit: "MODERATE" },
    { provider: "AMBER ELECTRIC", program: "SmartShift", gasBundle: false, annualValue: "VARIABLE", strategicFit: "COMPLEX" },
    { provider: "SIMPLY ENERGY", program: "VPP Access", gasBundle: true, annualValue: "~$280", strategicFit: "MODERATE" },
    { provider: "ENERGY LOCALS", program: "Community VPP", gasBundle: false, annualValue: "~$200", strategicFit: "MODERATE" },
    { provider: "POWERSHOP", program: "Battery Saver", gasBundle: false, annualValue: "~$220", strategicFit: "MODERATE" },
    { provider: "RED ENERGY", program: "PowerResponse", gasBundle: true, annualValue: "~$260", strategicFit: "GOOD" },
    { provider: "MOMENTUM ENERGY", program: "VPP Program", gasBundle: true, annualValue: "~$240", strategicFit: "MODERATE" },
    { provider: "LUMO ENERGY", program: "Battery VPP", gasBundle: true, annualValue: "~$230", strategicFit: "MODERATE" },
    { provider: "ALINTA ENERGY", program: "Home Battery", gasBundle: true, annualValue: "~$270", strategicFit: "GOOD" },
    { provider: "TANGO ENERGY", program: "VPP Rewards", gasBundle: false, annualValue: "~$180", strategicFit: "MODERATE" },
    { provider: "GLOBIRD ENERGY", program: "Battery Connect", gasBundle: false, annualValue: "~$190", strategicFit: "MODERATE" }
  ];
  if (hasGas) {
    return providers.sort((a, b) => {
      if (a.gasBundle && !b.gasBundle) return -1;
      if (!a.gasBundle && b.gasBundle) return 1;
      return 0;
    });
  }
  return providers;
}
var SLIDE_STYLES = `
<style>
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,600;0,700;0,800;1,600&family=Open+Sans:wght@300;400;600&display=swap');
  
  * { margin: 0; padding: 0; box-sizing: border-box; }
  
  .slide {
    width: 1920px;
    height: 1080px;
    background: #0F172A;
    color: #FFFFFF;
    font-family: 'Open Sans', sans-serif;
    padding: 60px 80px;
    position: relative;
    overflow: hidden;
  }
  
  /* Header area with title left, subtitle right */
  .slide-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 8px;
  }
  
  .slide-title {
    font-family: 'Montserrat', sans-serif;
    font-size: 64px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: #FFFFFF;
    line-height: 1.1;
  }
  
  .slide-subtitle {
    font-family: 'MontserratItalic', 'Montserrat', sans-serif;
    font-size: 22px;
    color: #46B446;
    font-style: italic;
    letter-spacing: 0.05em;
    text-align: right;
    white-space: nowrap;
  }
  
  /* Thin aqua line separator under heading */
  .aqua-line {
    width: 100%;
    height: 1px;
    background: #46B446;
    margin-bottom: 36px;
  }
  
  .logo {
    position: absolute;
    top: 40px;
    right: 60px;
    width: 60px;
    height: 60px;
  }
  
  /* Hero numbers - Open Sans for all numeric content */
  .hero-num {
    font-family: 'Open Sans', sans-serif;
    font-weight: 700;
    line-height: 1;
  }
  .hero-num.aqua { color: #46B446; }
  .hero-num.white { color: #FFFFFF; }
  .hero-num.orange { color: #46B446; }
  .hero-num .unit { font-family: 'Open Sans', sans-serif; font-weight: 400; }
  
  /* Labels */
  .lbl {
    font-family: 'Montserrat', sans-serif;
    font-size: 12px;
    color: #4A6B8A;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    margin-bottom: 6px;
  }
  
  /* Cards */
  .card {
    background: rgba(255,255,255,0.03);
    border: 1px solid #1B3A5C;
    border-radius: 8px;
    padding: 24px;
  }
  .card.aqua-b { border-color: #46B446; }
  .card.orange-b { border-color: #46B446; }
  .card.white-b { border-color: #FFFFFF; }
  
  /* Insight cards - dark grey bg with colored left border */
  .insight-card {
    background: #2C3E50;
    border-radius: 8px;
    padding: 24px 28px;
    border-left: 4px solid #46B446;
  }
  .insight-card.orange { border-left-color: #46B446; }
  .insight-card .insight-title {
    font-family: 'Montserrat', sans-serif;
    font-size: 18px;
    font-weight: 800;
    color: #46B446;
    text-transform: uppercase;
    margin-bottom: 10px;
  }
  .insight-card.orange .insight-title { color: #46B446; }
  .insight-card p { color: #4A6B8A; font-size: 14px; line-height: 1.6; }
  .insight-card .hl-aqua { color: #46B446; font-weight: 600; }
  .insight-card .hl-orange { color: #46B446; font-weight: 600; }
  .insight-card .hl-white { color: #FFFFFF; font-weight: 600; }
  
  /* Badges */
  .badge { display: inline-block; padding: 4px 14px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
  .badge.excellent { background: #46B446; color: #000; }
  .badge.good { background: #22c55e; color: #000; }
  .badge.moderate { background: #46B446; color: #000; }
  .badge.complex { background: #555; color: #fff; }
  .badge.high { background: #ef4444; color: #fff; }
  .badge.medium { background: #46B446; color: #000; }
  .badge.low { background: #22c55e; color: #000; }
  
  /* Tables */
  table { width: 100%; border-collapse: collapse; }
  th {
    font-family: 'Montserrat', sans-serif;
    font-size: 11px;
    color: #46B446;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    text-align: left;
    padding: 12px 16px;
    border-bottom: 1px solid #1B3A5C;
  }
  td { padding: 14px 16px; border-bottom: 1px solid #2C3E50; font-size: 15px; }
  .highlight-row { background: rgba(0, 234, 211, 0.06); border-left: 3px solid #46B446; }
  
  /* Colors */
  .aqua { color: #46B446; }
  .orange { color: #46B446; }
  .gray { color: #4A6B8A; }
  .white { color: #FFFFFF; }
  
  /* Copyright */
  .copyright {
    position: absolute;
    bottom: 28px;
    left: 80px;
    font-size: 11px;
    color: #4A6B8A;
    font-family: 'Open Sans', sans-serif;
  }
</style>
`;
function slideHeader(title, subtitle) {
  return `
    <div class="slide-header">
      <h1 class="slide-title">${title}</h1>
      ${subtitle ? `<p class="slide-subtitle">${subtitle}</p>` : ""}
    </div>
    <div class="aqua-line"></div>
  `;
}
function generateSlideHTML(slide) {
  let content = "";
  switch (slide.type) {
    case "cover":
      content = genCover(slide);
      break;
    case "executive_summary":
      content = genExecutiveSummary(slide);
      break;
    case "bill_analysis":
      content = genBillAnalysis(slide);
      break;
    case "usage_analysis":
      content = genUsageAnalysis(slide);
      break;
    case "yearly_projection":
      content = genYearlyProjection(slide);
      break;
    case "gas_footprint":
      content = genGasFootprint(slide);
      break;
    case "gas_appliances":
      content = genGasAppliances(slide);
      break;
    case "strategic_assessment":
      content = genStrategic(slide);
      break;
    case "battery_recommendation":
      content = genBattery(slide);
      break;
    case "solar_system":
      content = genSolar(slide);
      break;
    case "vpp_comparison":
      content = genVPPComparison(slide);
      break;
    case "vpp_recommendation":
      content = genVPPRecommendation(slide);
      break;
    case "hot_water_electrification":
      content = genHotWater(slide);
      break;
    case "heating_cooling":
      content = genHeatingCooling(slide);
      break;
    case "induction_cooking":
      content = genInduction(slide);
      break;
    case "ev_analysis":
      content = genEVAnalysis(slide);
      break;
    case "ev_charger":
      content = genEVCharger(slide);
      break;
    case "pool_heat_pump":
      content = genPoolHeatPump(slide);
      break;
    case "electrification_investment":
      content = genElectrificationInvestment(slide);
      break;
    case "savings_summary":
      content = genSavingsSummary(slide);
      break;
    case "financial_summary":
      content = genFinancial(slide);
      break;
    case "environmental_impact":
      content = genEnvironmental(slide);
      break;
    case "roadmap":
      content = genRoadmap(slide);
      break;
    case "conclusion":
      content = genConclusion(slide);
      break;
    case "contact":
      content = genContact(slide);
      break;
    default:
      content = genGeneric(slide);
  }
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${SLIDE_STYLES}</head><body>${content}</body></html>`;
}
function genCover(slide) {
  const c = slide.content;
  const backdropUrl = BRAND.coverBg || "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/RcCbZwZNUIzvPlwn.jpg";
  return `
    <div class="slide" style="display: flex; flex-direction: column; justify-content: center; padding: 80px; position: relative; overflow: hidden; background: url('${backdropUrl}') center center / cover no-repeat;">
      <!-- Dark overlay for text legibility -->
      <div style="position: absolute; inset: 0; background: linear-gradient(135deg, rgba(15,23,42,0.88) 0%, rgba(15,23,42,0.65) 50%, rgba(15,23,42,0.45) 100%); z-index: 0;"></div>
      <div style="position: relative; z-index: 1; display: flex; flex-direction: column; height: 100%;">
      <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 48px;">
        <img src="${BRAND.logo.iconWhite}" style="width: 56px; height: 56px; filter: drop-shadow(0 0 12px rgba(70,180,70,0.6));" alt="Elite Smart Energy Solutions" />
        <div>
          <span style="font-family: 'Montserrat', sans-serif; font-size: 22px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.12em; display: block;">ELITE SMART ENERGY SOLUTIONS</span>
          <span style="font-family: 'Open Sans', sans-serif; font-size: 13px; color: #46B446; letter-spacing: 0.2em; text-transform: uppercase;">ELECTRIFICATION SPECIALISTS</span>
        </div>
      </div>
      <h1 style="font-family: 'Montserrat', sans-serif; font-size: 54px; font-weight: 800; color: #FFFFFF; text-transform: uppercase; line-height: 1.15; max-width: 820px; text-shadow: 0 2px 20px rgba(0,0,0,0.8);">IN-DEPTH BILL ANALYSIS &amp; SOLAR BATTERY PROPOSAL</h1>
      <div style="margin-top: auto; display: flex; align-items: flex-start; gap: 16px; padding-top: 40px;">
        <div style="width: 4px; height: 56px; background: #46B446; border-radius: 2px; flex-shrink: 0;"></div>
        <div>
          <p style="font-family: 'Montserrat', sans-serif; font-size: 20px; color: #FFFFFF; font-weight: 700;">${slide.title}</p>
          <p style="font-family: 'Open Sans', sans-serif; font-size: 15px; color: #CBD5E1;">${c.address}</p>
          <p style="font-family: 'Open Sans', sans-serif; font-size: 12px; color: #94A3B8; margin-top: 8px;">Prepared by ${c.preparedBy} | ${c.company}</p>
        </div>
      </div>
      <div style="margin-top: 24px; height: 2px; background: linear-gradient(90deg, #46B446 0%, rgba(70,180,70,0.2) 100%);"></div>
      </div>
    </div>
  `;
}
function genExecutiveSummary(slide) {
  const c = slide.content;
  return `
    <div class="slide">
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
      ${slideHeader(slide.title, slide.subtitle || "")}
      <div style="display: flex; gap: 0; margin-top: 20px;">
        <div style="flex: 1; text-align: center; border-right: 1px solid #333; padding: 20px;">
          <p class="lbl">CURRENT ANNUAL BILL</p>
          <p class="hero-num white" style="font-size: 56px;">$${c.currentAnnualCost.toLocaleString()}</p>
          <p class="gray" style="font-size: 13px; margin-top: 8px;">With existing setup</p>
        </div>
        <div style="flex: 1; text-align: center; border-right: 1px solid #333; padding: 20px;">
          <p class="lbl">PROJECTED ANNUAL BILL</p>
          <p class="hero-num white" style="font-size: 56px;">$${Math.round(c.projectedAnnualCost).toLocaleString()}</p>
          <p class="gray" style="font-size: 13px; margin-top: 8px;">With new system</p>
        </div>
        <div style="flex: 1; text-align: center; border-right: 1px solid #333; padding: 20px;">
          <p class="lbl">TOTAL ANNUAL SAVINGS</p>
          <p class="hero-num aqua" style="font-size: 56px;">$${c.totalAnnualSavings.toLocaleString()}</p>
          <p class="gray" style="font-size: 13px; margin-top: 8px;">Incl. VPP + EV</p>
        </div>
        <div style="flex: 1; text-align: center; padding: 20px;">
          <p class="lbl">SYSTEM PAYBACK</p>
          <p class="hero-num orange" style="font-size: 56px;">${c.paybackYears.toFixed(1)}</p>
          <p class="gray" style="font-size: 13px; margin-top: 8px;">Years</p>
        </div>
      </div>
      <div class="insight-card" style="margin-top: 40px;">
        <p style="color: #FFFFFF; font-size: 15px; line-height: 1.7;">This comprehensive analysis evaluates your current energy expenditure and presents a tailored solar + battery solution designed to deliver <span class="hl-aqua">$${c.totalAnnualSavings.toLocaleString()} in annual savings</span>. The proposed ${c.systemSize}kW solar system paired with a ${c.batterySize}kWh battery and ${c.vppProvider} VPP partnership achieves payback in <span class="hl-orange">${c.paybackYears.toFixed(1)} years</span>.</p>
      </div>
      
    </div>
  `;
}
function genBillAnalysis(slide) {
  const c = slide.content;
  return `
    <div class="slide">
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
      ${slideHeader(slide.title, slide.subtitle || "")}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1.2;">
          <table>
            <tr><th>COMPONENT</th><th>DETAILS</th><th style="text-align: right; color: #46B446;">AMOUNT</th></tr>
            <tr><td>General Usage</td><td class="gray">${(c.annualCost / (c.usageRate / 100)).toFixed(0)} kWh @ $${(c.usageRate / 100).toFixed(4)}/kWh</td><td style="text-align: right; font-weight: 600;">$${Math.round(c.usageCost).toLocaleString()}</td></tr>
            <tr><td>Daily Supply Charge</td><td class="gray">365 days @ $${(c.supplyCharge / 100).toFixed(4)}/day</td><td style="text-align: right; font-weight: 600;">$${Math.round(c.supplyCost).toLocaleString()}</td></tr>
            <tr><td>Solar Feed-in Credit</td><td class="gray">@ ${c.feedInTariff}\xA2/kWh</td><td style="text-align: right; color: #46B446;">Credit</td></tr>
            <tr class="highlight-row"><td style="font-weight: 700; color: #46B446;">NET ANNUAL BILL</td><td></td><td style="text-align: right; font-weight: 700; color: #46B446; font-size: 20px;">$${c.annualCost.toLocaleString()}</td></tr>
          </table>
        </div>
        <div style="flex: 0.8;">
          <div class="insight-card orange" style="margin-bottom: 24px;">
            <p class="insight-title">KEY INSIGHT</p>
            <p>Your current feed-in tariff of <span class="hl-aqua">${c.feedInTariff}\xA2/kWh</span> is significantly below the usage rate of <span class="hl-orange">${c.usageRate}\xA2/kWh</span>. Self-consumption with battery storage will capture the full value of your solar generation.</p>
          </div>
          <div style="display: flex; gap: 16px;">
            <div class="card" style="flex: 1; text-align: center;">
              <p class="lbl">USAGE RATE</p>
              <p style="font-size: 28px; color: #46B446; font-weight: 600;">${c.usageRate}\xA2</p>
              <p class="gray" style="font-size: 11px;">per kWh</p>
            </div>
            <div class="card" style="flex: 1; text-align: center;">
              <p class="lbl">FEED-IN</p>
              <p style="font-size: 28px; color: #46B446; font-weight: 600;">${c.feedInTariff}\xA2</p>
              <p class="gray" style="font-size: 11px;">per kWh</p>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  `;
}
function genUsageAnalysis(slide) {
  const c = slide.content;
  const daily = c.dailyAverageKwh;
  const benchmarks = [
    { label: "Your Usage", kwh: daily, color: "#46B446" },
    { label: "Small Home", kwh: 7.49, color: "#333" },
    { label: "Medium Home", kwh: 12.7, color: "#333" },
    { label: "Large Home", kwh: 14.71, color: "#333" }
  ];
  const maxKwh = Math.max(...benchmarks.map((b) => b.kwh), 16);
  return `
    <div class="slide">
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
      ${slideHeader(slide.title, slide.subtitle || "")}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1.2;">
          <p class="lbl" style="margin-bottom: 16px;">DAILY ENERGY USAGE COMPARISON (kWh)</p>
          <div style="display: flex; align-items: flex-end; height: 320px; gap: 30px; padding: 0 20px;">
            ${benchmarks.map((b) => `
              <div style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end;">
                <p style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: ${b.color === "#46B446" ? "#46B446" : "#FFFFFF"};">${b.kwh.toFixed(1)}</p>
                <div style="width: 100%; height: ${b.kwh / maxKwh * 260}px; background: ${b.color}; border-radius: 4px 4px 0 0;"></div>
                <p style="font-size: 11px; color: #4A6B8A; margin-top: 8px; text-align: center;">${b.label}</p>
              </div>
            `).join("")}
          </div>
        </div>
        <div style="flex: 0.8;">
          <p class="lbl" style="margin-bottom: 16px;">COMPARISON TABLE</p>
          ${benchmarks.map((b) => `
            <div style="display: flex; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #2C3E50;">
              <span style="color: #4A6B8A;">${b.label}</span>
              <span style="font-weight: 600; color: ${b.color === "#46B446" ? "#46B446" : "#FFFFFF"};">${b.kwh.toFixed(2)} KWH</span>
            </div>
          `).join("")}
          <div class="insight-card orange" style="margin-top: 24px;">
            <p class="insight-title">EFFICIENCY INSIGHT</p>
            <p>Your daily usage of <span class="hl-aqua">${daily.toFixed(1)} kWh</span> is <span class="hl-orange">${Math.round((1 - daily / 12.7) * 100)}%</span> below the medium household average, indicating an energy-efficient home.</p>
          </div>
        </div>
      </div>
      
    </div>
  `;
}
function genYearlyProjection(slide) {
  const c = slide.content;
  const projection = c.yearlyProjection || [];
  return `
    <div class="slide">
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
      ${slideHeader(slide.title, slide.subtitle || "")}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1;">
          <table>
            <tr><th>PERIOD</th><th style="text-align: right;">GRID USAGE</th><th style="text-align: right;">SOLAR EXPORT</th><th style="text-align: right;">NET COST</th></tr>
            <tr><td>Monthly Avg</td><td style="text-align: right;">${Math.round(c.currentAnnualCost / 12)} kWh</td><td style="text-align: right;">Est.</td><td style="text-align: right; font-weight: 600;">$${Math.round(c.currentAnnualCost / 12).toLocaleString()}</td></tr>
            <tr><td>Annual Total</td><td style="text-align: right;">Est.</td><td style="text-align: right;">Est.</td><td style="text-align: right; font-weight: 600;">$${c.currentAnnualCost.toLocaleString()}</td></tr>
          </table>
          <div class="insight-card" style="margin-top: 24px;">
            <p class="insight-title">KEY FINDING</p>
            <p>With the proposed system, your projected annual cost drops from <span class="hl-orange">$${c.currentAnnualCost.toLocaleString()}</span> to <span class="hl-aqua">$${Math.round(c.projectedAnnualCost).toLocaleString()}</span>, delivering cumulative savings of <span class="hl-aqua">$${c.tenYearSavings.toLocaleString()}</span> over 10 years.</p>
          </div>
        </div>
        <div style="flex: 1;">
          <p style="font-family: 'Montserrat', sans-serif; font-size: 18px; font-weight: 800; margin-bottom: 16px;">25-YEAR CUMULATIVE FINANCIAL OUTLOOK</p>
          <div style="height: 320px; position: relative; border-left: 1px solid #333; border-bottom: 1px solid #1B3A5C; padding: 10px;">
            ${projection.filter((_, i) => i % 5 === 0 || i === projection.length - 1).map((p, i, arr) => {
    const maxVal = c.twentyFiveYearSavings * 1.2;
    const x = p.year / 25 * 100;
    const yOrange = 100 - p.withoutSolar * p.year * 0.5 / maxVal * 100;
    const yAqua = 100 - p.cumulativeSavings / maxVal * 100;
    return `
                <div style="position: absolute; left: ${x}%; bottom: 0; width: 2px; height: 100%; border-left: 1px dashed #2C3E50;"></div>
                <div style="position: absolute; left: ${x}%; bottom: ${100 - yAqua}%; width: 8px; height: 8px; background: #46B446; border-radius: 50%; transform: translate(-4px, 4px);"></div>
                <div style="position: absolute; left: ${x}%; bottom: ${100 - yOrange}%; width: 8px; height: 8px; background: #46B446; border-radius: 50%; transform: translate(-4px, 4px);"></div>
              `;
  }).join("")}
          </div>
          <div style="display: flex; gap: 24px; margin-top: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 12px; height: 12px; background: #46B446; border-radius: 50%;"></div><span style="font-size: 11px; color: #4A6B8A;">Cumulative Bill Cost (Current)</span></div>
            <div style="display: flex; align-items: center; gap: 8px;"><div style="width: 12px; height: 12px; background: #46B446; border-radius: 50%;"></div><span style="font-size: 11px; color: #4A6B8A;">Cumulative Total Benefit (Proposed)</span></div>
          </div>
        </div>
      </div>
      
    </div>
  `;
}
function genGasFootprint(slide) {
  const c = slide.content;
  return `
    <div class="slide">
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
      ${slideHeader(slide.title, slide.subtitle || "")}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1;">
          <div class="card orange-b" style="text-align: center; padding: 36px; margin-bottom: 20px;">
            <p class="lbl">ANNUAL GAS COST</p>
            <p class="hero-num orange" style="font-size: 64px;">$${c.annualCost.toLocaleString()}</p>
          </div>
          <div style="display: flex; gap: 16px;">
            <div class="card" style="flex: 1; text-align: center;"><p class="lbl">ANNUAL USAGE</p><p style="font-size: 22px;">${c.annualMJ.toLocaleString()} MJ</p></div>
            <div class="card" style="flex: 1; text-align: center;"><p class="lbl">kWh EQUIVALENT</p><p style="font-size: 22px;">${Math.round(c.kwhEquivalent).toLocaleString()} kWh</p></div>
          </div>
        </div>
        <div style="flex: 1;">
          <div class="card" style="margin-bottom: 20px;">
            <p class="lbl">CO2 EMISSIONS FROM GAS</p>
            <p class="hero-num orange" style="font-size: 48px;">${c.co2Emissions.toFixed(1)}<span style="font-size: 18px; color: #4A6B8A;"> tonnes/year</span></p>
          </div>
          <div class="insight-card">
            <p class="insight-title">ELECTRIFICATION OPPORTUNITY</p>
            <p>By replacing gas appliances with efficient electric alternatives, you can eliminate <span class="hl-orange">$${c.annualCost.toLocaleString()}/year</span> in gas costs and <span class="hl-aqua">${c.co2Emissions.toFixed(1)} tonnes</span> of CO2 emissions entirely.</p>
          </div>
        </div>
      </div>
      
    </div>
  `;
}
function genGasAppliances(slide) {
  const c = slide.content;
  const priorities = c.electrificationPriority || [];
  return `
    <div class="slide">
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
      ${slideHeader(slide.title, slide.subtitle || "")}
      <table style="margin-top: 10px;">
        <tr><th>APPLIANCE</th><th>CURRENT TYPE</th><th>PRIORITY</th><th style="text-align: right;">EST. ANNUAL SAVINGS</th></tr>
        ${priorities.map((p) => `
          <tr>
            <td style="font-weight: 600;">${p.name}</td>
            <td class="gray">${p.type}</td>
            <td><span class="badge ${p.priority.toLowerCase()}">${p.priority}</span></td>
            <td style="text-align: right; color: #46B446; font-weight: 600;">$${p.savings.toLocaleString()}</td>
          </tr>
        `).join("")}
      </table>
      <div class="insight-card" style="margin-top: 30px;">
        <p class="insight-title">TOTAL GAS ELIMINATION POTENTIAL</p>
        <p>Annual Gas Cost: <span class="hl-orange">$${c.totalGasCost.toLocaleString()}</span> \u2192 <span class="hl-aqua">$0</span> through complete electrification of all gas appliances.</p>
      </div>
      
    </div>
  `;
}
function genStrategic(slide) {
  const c = slide.content;
  const advantages = c.advantages;
  const considerations = c.considerations;
  return `
    <div class="slide">
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
      ${slideHeader(slide.title, slide.subtitle || "")}
      <div style="display: flex; gap: 40px; margin-top: 10px;">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
            <span style="color: #46B446; font-size: 24px;">\u2713</span>
            <span style="font-family: 'Montserrat', sans-serif; font-size: 20px; font-weight: 800; color: #46B446;">KEY ADVANTAGES</span>
          </div>
          <div style="border-bottom: 2px solid #46B446; margin-bottom: 20px;"></div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            ${advantages.map((a) => `
              <div>
                <p style="font-size: 20px; margin-bottom: 6px;">${a.icon}</p>
                <p style="font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 800; color: #FFFFFF; margin-bottom: 4px;">${a.title}</p>
                <p style="color: #4A6B8A; font-size: 12px; line-height: 1.5;">${a.description}</p>
              </div>
            `).join("")}
          </div>
        </div>
        <div style="width: 1px; background: #333;"></div>
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
            <span style="color: #46B446; font-size: 24px;">\u26A0</span>
            <span style="font-family: 'Montserrat', sans-serif; font-size: 20px; font-weight: 800; color: #46B446;">CONSIDERATIONS</span>
          </div>
          <div style="border-bottom: 2px solid #46B446; margin-bottom: 20px;"></div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            ${considerations.map((co) => `
              <div>
                <p style="font-size: 20px; margin-bottom: 6px;">${co.icon}</p>
                <p style="font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 800; color: #FFFFFF; margin-bottom: 4px;">${co.title}</p>
                <p style="color: #4A6B8A; font-size: 12px; line-height: 1.5;">${co.description}</p>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
      
    </div>
  `;
}
function genBattery(slide) {
  const c = slide.content;
  const cap = c.whyThisCapacity;
  const total = c.totalCapacity;
  return `
    <div class="slide">
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
      ${slideHeader(slide.title, slide.subtitle || "")}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1;">
          <div style="text-align: center; margin-bottom: 30px;">
            <p class="lbl">TOTAL USABLE CAPACITY</p>
            <p class="hero-num aqua" style="font-size: 96px;">${total}<span style="font-size: 28px; color: #FFFFFF;"> KWH</span></p>
          </div>
          <div style="display: flex; gap: 16px;">
            <div class="card" style="flex: 1; border-top: 3px solid #46B446;">
              <p class="lbl" style="color: #46B446;">INVERTER</p>
              <p style="font-size: 20px; font-weight: 600;">${c.inverterSize} KW ${c.inverterType}</p>
            </div>
            <div class="card" style="flex: 1; border-top: 3px solid #46B446;">
              <p class="lbl" style="color: #46B446;">MODULES</p>
              <p style="font-size: 20px; font-weight: 600;">${c.modules}</p>
            </div>
            <div class="card" style="flex: 1; border-top: 3px solid #46B446;">
              <p class="lbl" style="color: #46B446;">TECHNOLOGY</p>
              <p style="font-size: 20px; font-weight: 600;">${c.technology}</p>
            </div>
          </div>
        </div>
        <div style="flex: 1;">
          <p style="font-family: 'Montserrat', sans-serif; font-size: 18px; font-weight: 800; margin-bottom: 20px;">WHY THIS CAPACITY?</p>
          <div style="display: flex; height: 44px; border-radius: 6px; overflow: hidden; margin-bottom: 16px;">
            <div style="width: ${cap.home / total * 100}%; background: #4A6B8A; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600;">HOME ~${cap.home.toFixed(0)}kWh</div>
            ${cap.evCharge > 0 ? `<div style="width: ${cap.evCharge / total * 100}%; background: #46B446; color: #000; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600;">EV CHARGE ~${cap.evCharge}kWh</div>` : ""}
            <div style="width: ${cap.vppTrade / total * 100}%; background: #46B446; color: #000; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600;">VPP TRADE ~${cap.vppTrade.toFixed(0)}kWh</div>
          </div>
          <div style="display: flex; gap: 20px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 6px;"><div style="width: 10px; height: 10px; background: #4A6B8A; border-radius: 50%;"></div><span style="font-size: 11px; color: #4A6B8A;">Home Overnight</span></div>
            ${cap.evCharge > 0 ? `<div style="display: flex; align-items: center; gap: 6px;"><div style="width: 10px; height: 10px; background: #46B446; border-radius: 50%;"></div><span style="font-size: 11px; color: #4A6B8A;">EV Charging</span></div>` : ""}
            <div style="display: flex; align-items: center; gap: 6px;"><div style="width: 10px; height: 10px; background: #46B446; border-radius: 50%;"></div><span style="font-size: 11px; color: #4A6B8A;">VPP Trading</span></div>
          </div>
          <p style="color: #4A6B8A; font-size: 14px; line-height: 1.6;">${c.explanation}</p>
        </div>
      </div>
      
    </div>
  `;
}
function genSolar(slide) {
  const c = slide.content;
  const features = c.features;
  return `
    <div class="slide">
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
      ${slideHeader(slide.title, slide.subtitle || "")}
      <div style="display: flex; gap: 30px; margin-top: 10px;">
        <div class="card" style="flex: 1; text-align: center; padding: 30px;">
          <p class="lbl">SYSTEM SIZE</p>
          <p class="hero-num white" style="font-size: 72px;">${c.systemSize}<span style="font-size: 20px; color: #4A6B8A;"> KW</span></p>
        </div>
        <div class="card" style="flex: 1; text-align: center; padding: 30px;">
          <p class="lbl">PANEL COUNT</p>
          <p class="hero-num white" style="font-size: 72px;">${c.panelCount}<span style="font-size: 20px; color: #46B446;"> UNITS</span></p>
        </div>
        <div class="card orange-b" style="flex: 1; text-align: center; padding: 30px; background: rgba(232,115,26,0.05);">
          <p class="lbl" style="color: #46B446;">HARDWARE TECHNOLOGY</p>
          <p class="hero-num orange" style="font-size: 72px;">${c.panelPower}<span style="font-size: 20px; color: #4A6B8A;"> W</span></p>
          <p class="gray" style="font-size: 13px; margin-top: 8px;">${c.panelBrand}</p>
        </div>
      </div>
      <div style="display: flex; gap: 30px; margin-top: 24px;">
        <div class="insight-card" style="flex: 1;">
          <p class="insight-title">WHY ${c.panelBrand.split(" ")[0].toUpperCase()}?</p>
          <p>${c.whyThisBrand}</p>
        </div>
        <div style="flex: 1;">
          <p style="font-family: 'Montserrat', sans-serif; font-size: 16px; font-weight: 800; color: #46B446; margin-bottom: 16px;">PERFORMANCE & WARRANTY</p>
          ${features.map((f) => `
            <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 14px;">
              <span style="color: #46B446; font-size: 10px; margin-top: 4px;">\u25CF</span>
              <div>
                <p style="font-weight: 600; font-size: 14px;">${f.title}</p>
                <p style="color: #4A6B8A; font-size: 12px;">${f.description}</p>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
      
    </div>
  `;
}
function genVPPComparison(slide) {
  const c = slide.content;
  const providers = c.providers;
  const rec = c.recommendedProvider;
  return `
    <div class="slide">
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
      ${slideHeader(slide.title, slide.subtitle || "")}
      <table style="margin-top: 10px;">
        <tr><th>PROVIDER</th><th>VPP MODEL</th><th>GAS BUNDLE</th><th>EST. ANNUAL VALUE</th><th>STRATEGIC FIT</th></tr>
        ${providers.map((p) => `
          <tr class="${p.provider === rec ? "highlight-row" : ""}">
            <td style="font-weight: 600;">${p.provider}${p.provider === rec ? '<br/><span style="color: #46B446; font-size: 11px;">Recommended</span>' : ""}</td>
            <td><span style="color: #46B446;">${p.program}</span></td>
            <td>${p.gasBundle ? '<span style="color: #46B446;">\u2713 Yes</span>' : '<span class="gray">\u2717 No</span>'}</td>
            <td style="font-weight: 600;">${p.annualValue}</td>
            <td><span class="badge ${p.strategicFit.toLowerCase()}">${p.strategicFit}</span></td>
          </tr>
        `).join("")}
      </table>
      
    </div>
  `;
}
function genVPPRecommendation(slide) {
  const c = slide.content;
  const features = c.features;
  return `
    <div class="slide">
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
      ${slideHeader(slide.title, slide.subtitle || "")}
      <div style="text-align: center; margin-top: 20px;">
        <p class="lbl">SELECTED PARTNER</p>
        <p style="font-family: 'Montserrat', sans-serif; font-size: 72px; font-weight: 800; margin: 10px 0;">${c.provider}</p>
        <p style="color: #46B446; font-size: 22px; font-family: 'Montserrat', sans-serif;">${c.program}</p>
      </div>
      <div style="display: flex; gap: 24px; margin-top: 36px;">
        ${features.map((f) => `
          <div class="card" style="flex: 1; text-align: center; border-top: 3px solid #46B446;">
            <p style="color: #46B446; font-size: 28px; margin-bottom: 12px;">${f.icon}</p>
            <p style="font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 800; margin-bottom: 8px;">${f.title}</p>
            <p style="color: #4A6B8A; font-size: 13px; line-height: 1.5;">${f.description}</p>
          </div>
        `).join("")}
      </div>
      <div style="display: flex; align-items: center; gap: 20px; margin-top: 36px;">
        <div style="width: 4px; height: 60px; background: #46B446; border-radius: 2px;"></div>
        <div>
          <p class="lbl">Estimated Annual Value (Credits + Bundle Savings)</p>
          <p class="hero-num aqua" style="font-size: 64px;">~$${c.annualValue}<span style="font-size: 22px;"> / YEAR</span></p>
        </div>
      </div>
      
    </div>
  `;
}
function genElectrificationSlide(slide, type) {
  const c = slide.content;
  const features = c.features || [];
  return `
    <div class="slide">
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
      ${slideHeader(slide.title, slide.subtitle || "")}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1;">
          <div class="card" style="margin-bottom: 20px;">
            <p class="lbl">CURRENT SYSTEM</p>
            <p style="font-size: 22px; color: #46B446; font-weight: 600;">${c.currentSystem}</p>
            <p class="gray" style="margin-top: 8px;">Annual Cost: <span class="orange">$${c[type === "hot_water" ? "annualGasCost" : type === "heating" ? "annualGasCost" : "annualGasCost"]}/year</span></p>
          </div>
          <div class="card aqua-b">
            <p class="lbl" style="color: #46B446;">RECOMMENDED UPGRADE</p>
            <p style="font-size: 22px; font-weight: 600;">${c.recommendedSystem}</p>
            ${c.cop ? `<p style="color: #46B446; margin-top: 8px;">COP: ${c.cop} (${c.cop}x more efficient)</p>` : ""}
          </div>
        </div>
        <div style="flex: 1;">
          <div class="card orange-b" style="text-align: center; margin-bottom: 20px; padding: 30px;">
            <p class="lbl">ANNUAL SAVINGS</p>
            <p class="hero-num aqua" style="font-size: 56px;">$${c.annualSavings}</p>
          </div>
          <div style="display: flex; gap: 16px; margin-bottom: 20px;">
            <div class="card" style="flex: 1; text-align: center;">
              <p class="lbl">INSTALL COST</p>
              <p style="font-size: 20px;">$${c.installCost.toLocaleString()}</p>
            </div>
            ${c.rebates !== void 0 ? `
              <div class="card" style="flex: 1; text-align: center;">
                <p class="lbl" style="color: #46B446;">REBATES</p>
                <p style="font-size: 20px; color: #46B446;">-$${c.rebates.toLocaleString()}</p>
              </div>
              <div class="card aqua-b" style="flex: 1; text-align: center;">
                <p class="lbl">NET COST</p>
                <p style="font-size: 20px;">$${c.netCost.toLocaleString()}</p>
              </div>
            ` : ""}
          </div>
          ${features.length > 0 ? `
            <p class="lbl" style="margin-bottom: 10px;">KEY BENEFITS</p>
            ${features.map((f) => `<p style="color: #4A6B8A; font-size: 13px; margin-bottom: 6px;">\u2713 ${f}</p>`).join("")}
          ` : ""}
        </div>
      </div>
      
    </div>
  `;
}
function genHotWater(slide) {
  return genElectrificationSlide(slide, "hot_water");
}
function genHeatingCooling(slide) {
  return genElectrificationSlide(slide, "heating");
}
function genInduction(slide) {
  return genElectrificationSlide(slide, "induction");
}
function genEVAnalysis(slide) {
  const c = slide.content;
  const comparison = c.comparison || [];
  return `
    <div class="slide">
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
      ${slideHeader(slide.title, slide.subtitle || "")}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1;">
          <table>
            <tr><th>VEHICLE TYPE</th><th style="text-align: right;">COST / 100KM</th><th style="text-align: right;">ANNUAL COST</th></tr>
            ${comparison.map((comp, i) => `
              <tr class="${i === 2 ? "highlight-row" : ""}">
                <td>${comp.scenario}</td>
                <td style="text-align: right; color: ${i === 0 ? "#46B446" : i === 1 ? "#FFFFFF" : "#46B446"}; font-weight: 600;">$${comp.costPer100km.toFixed(2)}</td>
                <td style="text-align: right; color: ${i === 0 ? "#46B446" : i === 1 ? "#FFFFFF" : "#46B446"}; font-weight: 600;">$${comp.annualCost.toLocaleString()}</td>
              </tr>
            `).join("")}
          </table>
        </div>
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 30px;">
            <div style="width: 4px; height: 60px; background: #46B446; border-radius: 2px;"></div>
            <div>
              <p class="lbl" style="color: #46B446;">POTENTIAL ANNUAL SAVINGS</p>
              <p class="hero-num white" style="font-size: 64px;">$${c.annualSavings.toLocaleString()}</p>
            </div>
          </div>
          <div class="insight-card">
            <p style="color: #4A6B8A; font-size: 14px; line-height: 1.6;">Solar-charged EV driving eliminates fuel costs entirely. With your proposed solar system, every kilometre driven is effectively <span class="hl-aqua">free</span>.</p>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; margin-top: 20px;">
            <span style="color: #22c55e;">\u{1F33F}</span>
            <p class="gray" style="font-size: 13px;">Environmental Impact: Avoid <span class="hl-aqua">${c.co2Avoided.toFixed(1)} tonnes</span> of CO2 emissions annually.</p>
          </div>
        </div>
      </div>
      
    </div>
  `;
}
function genEVCharger(slide) {
  const c = slide.content;
  const features = c.features || [];
  const benefits = c.solarChargingBenefits || [];
  return `
    <div class="slide">
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
      ${slideHeader(slide.title, slide.subtitle || "")}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1;">
          <div class="card aqua-b" style="margin-bottom: 20px;">
            <p class="lbl" style="color: #46B446;">RECOMMENDED CHARGER</p>
            <p style="font-size: 24px; font-weight: 600;">${c.recommendedCharger}</p>
            <p class="gray" style="margin-top: 8px;">${c.chargingSpeed}</p>
          </div>
          <div class="card orange-b" style="text-align: center; padding: 30px;">
            <p class="lbl">INSTALLED COST</p>
            <p class="hero-num white" style="font-size: 48px;">$${c.installCost.toLocaleString()}</p>
          </div>
        </div>
        <div style="flex: 1;">
          <p class="lbl" style="margin-bottom: 14px;">SMART FEATURES</p>
          ${features.map((f) => `<p style="color: #4A6B8A; font-size: 13px; margin-bottom: 8px;">\u2713 ${f}</p>`).join("")}
          <p class="lbl" style="margin-top: 24px; margin-bottom: 14px; color: #46B446;">SOLAR CHARGING BENEFITS</p>
          ${benefits.map((b) => `<p style="color: #46B446; font-size: 13px; margin-bottom: 8px;">\u26A1 ${b}</p>`).join("")}
        </div>
      </div>
      
    </div>
  `;
}
function genPoolHeatPump(slide) {
  return genElectrificationSlide(slide, "pool");
}
function genElectrificationInvestment(slide) {
  const c = slide.content;
  const items = c.items || [];
  return `
    <div class="slide">
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
      ${slideHeader(slide.title, slide.subtitle || "")}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1.2;">
          <table>
            <tr><th>UPGRADE ITEM</th><th style="text-align: right;">COST</th><th style="text-align: right;">REBATE</th><th style="text-align: right;">NET</th></tr>
            ${items.map((item) => `
              <tr>
                <td>${item.item}</td>
                <td style="text-align: right;">$${item.cost.toLocaleString()}</td>
                <td style="text-align: right; color: #46B446;">-$${item.rebate.toLocaleString()}</td>
                <td style="text-align: right; font-weight: 600;">$${(item.cost - item.rebate).toLocaleString()}</td>
              </tr>
            `).join("")}
            <tr class="highlight-row">
              <td style="font-weight: 700;">TOTAL</td>
              <td style="text-align: right; font-weight: 700;">$${c.totalCost.toLocaleString()}</td>
              <td style="text-align: right; color: #46B446; font-weight: 700;">-$${c.totalRebates.toLocaleString()}</td>
              <td style="text-align: right; font-weight: 700;">$${c.netInvestment.toLocaleString()}</td>
            </tr>
          </table>
        </div>
        <div style="flex: 0.8;">
          <div class="card aqua-b" style="text-align: center; margin-bottom: 20px; padding: 30px;">
            <p class="lbl" style="color: #46B446;">ANNUAL GAS SAVINGS</p>
            <p class="hero-num aqua" style="font-size: 56px;">$${c.annualGasSavings.toLocaleString()}</p>
          </div>
          <div class="card" style="text-align: center;">
            <p class="lbl">GAS SUPPLY CHARGE SAVED</p>
            <p style="font-size: 28px; color: #46B446; font-weight: 600;">$${Math.round(c.gasSupplyChargeSaved).toLocaleString()}/year</p>
          </div>
        </div>
      </div>
      
    </div>
  `;
}
function genSavingsSummary(slide) {
  const c = slide.content;
  const breakdown = c.breakdown;
  const total = c.totalAnnualBenefit;
  const maxVal = Math.max(...breakdown.map((b) => b.value));
  return `
    <div class="slide">
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
      ${slideHeader(slide.title, slide.subtitle || "")}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1;">
          <div style="height: 380px; display: flex; align-items: flex-end; justify-content: center;">
            <div style="width: 200px; display: flex; flex-direction: column;">
              ${breakdown.map((b) => {
    const col = b.color === "aqua" ? "#46B446" : b.color === "orange" ? "#46B446" : "#FFFFFF";
    return `<div style="height: ${b.value / total * 300}px; background: ${col}; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #000; font-weight: 600;">${b.category}</div>`;
  }).join("")}
            </div>
          </div>
          <div style="display: flex; gap: 16px; margin-top: 16px; justify-content: center;">
            ${breakdown.map((b) => {
    const col = b.color === "aqua" ? "#46B446" : b.color === "orange" ? "#46B446" : "#FFFFFF";
    return `<div style="display: flex; align-items: center; gap: 6px;"><div style="width: 12px; height: 12px; background: ${col};"></div><span style="font-size: 11px; color: #4A6B8A;">${b.category}</span></div>`;
  }).join("")}
          </div>
        </div>
        <div style="flex: 1;">
          <div class="card aqua-b" style="text-align: center; padding: 36px; margin-bottom: 24px;">
            <p class="lbl" style="color: #46B446;">TOTAL ANNUAL BENEFIT</p>
            <p class="hero-num white" style="font-size: 80px;">$${total.toLocaleString()}</p>
            <p class="gray" style="margin-top: 8px;">Tax-Free Savings</p>
          </div>
          ${breakdown.map((b) => {
    const col = b.color === "aqua" ? "#46B446" : b.color === "orange" ? "#46B446" : "#FFFFFF";
    return `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #2C3E50;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="width: 14px; height: 14px; background: ${col};"></div>
                  <span>${b.category}</span>
                </div>
                <span style="font-weight: 600;">$${b.value.toLocaleString()}</span>
              </div>
            `;
  }).join("")}
        </div>
      </div>
      
    </div>
  `;
}
function genFinancial(slide) {
  const c = slide.content;
  return `
    <div class="slide">
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
      ${slideHeader(slide.title, slide.subtitle || "")}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1;">
          <p class="lbl" style="margin-bottom: 16px;">INVESTMENT BREAKDOWN</p>
          <div style="display: flex; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #1B3A5C;">
            <span>Solar & Battery System</span>
            <span style="font-weight: 600; font-style: italic;">$${c.systemCost.toLocaleString()}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #1B3A5C;">
            <span>Govt. Rebates & Incentives</span>
            <span style="font-weight: 600; color: #46B446; font-style: italic;">-$${c.rebates.toLocaleString()}</span>
          </div>
          <div class="card orange-b" style="margin-top: 20px; padding: 30px;">
            <p class="lbl" style="color: #46B446;">NET INVESTMENT</p>
            <p class="hero-num white" style="font-size: 64px;">$${c.netInvestment.toLocaleString()}</p>
            <p class="gray" style="font-size: 13px; margin-top: 8px;">Fully Installed (Inc. GST)</p>
          </div>
        </div>
        <div style="flex: 1;">
          <p class="lbl" style="margin-bottom: 16px;">PROJECTED RETURNS</p>
          <div style="display: flex; gap: 16px; margin-bottom: 20px;">
            <div class="card aqua-b" style="flex: 1; text-align: center; padding: 24px;">
              <p class="lbl" style="color: #46B446;">ANNUAL BENEFIT</p>
              <p style="font-size: 36px; font-weight: 700;">$${c.annualBenefit.toLocaleString()}</p>
              <p class="gray" style="font-size: 11px;">Combined Savings & Income</p>
            </div>
            <div class="card aqua-b" style="flex: 1; text-align: center; padding: 24px;">
              <p class="lbl" style="color: #46B446;">PAYBACK PERIOD</p>
              <p style="font-size: 36px; font-weight: 700;">${c.paybackYears.toFixed(1)} YRS</p>
              <p class="gray" style="font-size: 11px;">Accelerated by ${c.acceleratedBy}</p>
            </div>
          </div>
          <div class="card" style="text-align: center; padding: 24px;">
            <p style="font-family: 'Montserrat', sans-serif; font-size: 22px; font-weight: 800;">10-YEAR TOTAL SAVINGS: <span class="aqua">~$${c.tenYearSavings.toLocaleString()}</span></p>
          </div>
        </div>
      </div>
      
    </div>
  `;
}
function genEnvironmental(slide) {
  const c = slide.content;
  return `
    <div class="slide">
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
      ${slideHeader(slide.title, slide.subtitle || "")}
      <div style="display: flex; gap: 60px; margin-top: 10px;">
        <div style="flex: 1;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div class="card aqua-b" style="text-align: center; padding: 24px;">
              <p class="lbl">ANNUAL CO2 REDUCTION</p>
              <p class="hero-num aqua" style="font-size: 48px;">${c.co2ReductionTonnes.toFixed(1)}<span style="font-size: 18px;">t</span></p>
            </div>
            <div class="card" style="text-align: center; padding: 24px;">
              <p class="lbl">25-YEAR CO2 REDUCTION</p>
              <p class="hero-num white" style="font-size: 48px;">${c.twentyFiveYearCO2.toFixed(0)}<span style="font-size: 18px;">t</span></p>
            </div>
            <div class="card" style="text-align: center; padding: 24px;">
              <p class="lbl">TREES EQUIVALENT</p>
              <p style="font-size: 32px; color: #46B446; font-weight: 600;">${c.treesEquivalent}</p>
              <p class="gray" style="font-size: 11px;">trees/year</p>
            </div>
            <div class="card" style="text-align: center; padding: 24px;">
              <p class="lbl">CARS OFF ROAD</p>
              <p style="font-size: 32px; color: #46B446; font-weight: 600;">${c.carsOffRoad}</p>
              <p class="gray" style="font-size: 11px;">equivalent</p>
            </div>
          </div>
        </div>
        <div style="flex: 1;">
          <div class="card aqua-b" style="text-align: center; margin-bottom: 24px; padding: 30px;">
            <p class="lbl">ENERGY INDEPENDENCE SCORE</p>
            <p class="hero-num aqua" style="font-size: 72px;">${c.energyIndependenceScore}%</p>
          </div>
          ${c.benefits.map((b) => `
            <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px;">
              <span style="font-size: 22px;">${b.icon}</span>
              <div>
                <p style="font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 800; text-transform: uppercase;">${b.title}</p>
                <p style="color: #4A6B8A; font-size: 12px;">${b.description}</p>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
      
    </div>
  `;
}
function genRoadmap(slide) {
  const c = slide.content;
  const steps = c.steps;
  return `
    <div class="slide">
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
      ${slideHeader(slide.title, slide.subtitle || "")}
      <div style="display: flex; align-items: center; margin: 20px 0 30px; padding: 0 40px;">
        ${steps.map((s, i) => `
          <div style="display: flex; align-items: center;">
            <div style="width: 20px; height: 20px; border-radius: 50%; background: ${s.color === "aqua" ? "#46B446" : "#46B446"};"></div>
            ${i < steps.length - 1 ? `<div style="width: ${800 / steps.length}px; height: 2px; background: linear-gradient(to right, ${s.color === "aqua" ? "#46B446" : "#46B446"}, ${steps[i + 1].color === "aqua" ? "#46B446" : "#46B446"});"></div>` : ""}
          </div>
        `).join("")}
      </div>
      <div style="display: flex; gap: 16px;">
        ${steps.map((s) => `
          <div class="card" style="flex: 1; border-top: 3px solid ${s.color === "aqua" ? "#46B446" : "#46B446"};">
            <p style="font-size: 40px; color: #333; font-weight: 800; font-family: 'Montserrat', sans-serif;">${s.number}</p>
            <p style="font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 800; color: ${s.color === "aqua" ? "#FFFFFF" : "#46B446"}; margin: 10px 0; text-transform: uppercase;">${s.title}</p>
            <p style="color: #4A6B8A; font-size: 12px; line-height: 1.5; margin-bottom: 14px;">${s.description}</p>
            <p style="color: ${s.color === "aqua" ? "#46B446" : "#46B446"}; font-size: 12px; font-family: 'Montserrat', sans-serif;">\u23F1 ${s.timeline}</p>
          </div>
        `).join("")}
      </div>
      
    </div>
  `;
}
function genConclusion(slide) {
  const c = slide.content;
  const features = c.features;
  return `
    <div class="slide">
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
      ${slideHeader(slide.title, slide.subtitle || "")}
      <div style="display: flex; gap: 24px; margin-top: 10px;">
        ${features.map((f) => {
    const borderCol = f.border === "aqua" ? "#46B446" : f.border === "orange" ? "#46B446" : "#FFFFFF";
    const iconCol = f.border === "aqua" ? "#46B446" : f.border === "orange" ? "#46B446" : "#FFFFFF";
    return `
            <div class="card" style="flex: 1; text-align: center; border-top: 3px solid ${borderCol}; padding: 30px;">
              <p style="color: ${iconCol}; font-size: 36px; margin-bottom: 14px;">${f.icon}</p>
              <p style="font-family: 'Montserrat', sans-serif; font-size: 16px; font-weight: 800; color: ${f.border === "orange" ? "#46B446" : "#FFFFFF"}; margin-bottom: 12px;">${f.title}</p>
              <p style="color: #4A6B8A; font-size: 13px; line-height: 1.6;">${f.description}</p>
            </div>
          `;
  }).join("")}
      </div>
      <div style="text-align: center; margin-top: 40px;">
        <p style="font-family: 'Montserrat', sans-serif; font-size: 28px; font-weight: 800; line-height: 1.4; max-width: 1200px; margin: 0 auto;">${c.quote}</p>
        <div style="width: 200px; height: 2px; background: #46B446; margin: 24px auto;"></div>
        <p style="color: #46B446; font-size: 18px; font-family: 'Montserrat', sans-serif;">${c.callToAction}</p>
      </div>
      
    </div>
  `;
}
function genContact(slide) {
  const c = slide.content;
  const nextSteps = c.nextSteps || [];
  return `
    <div class="slide" style="display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
      <img src="${c.logoUrl}" style="width: 100px; height: 100px; margin-bottom: 30px;" alt="Elite Smart Energy Solutions" />
      <h1 class="slide-title" style="font-size: 64px; margin-bottom: 16px;">${slide.title}</h1>
      <p class="slide-subtitle" style="font-size: 24px; margin-bottom: 40px; text-align: center;">${slide.subtitle}</p>
      <div style="display: flex; gap: 60px; margin-bottom: 36px;">
        <div style="text-align: left;">
          <p class="lbl" style="margin-bottom: 8px;">PREPARED BY</p>
          <p style="font-size: 22px; font-weight: 600;">${c.preparedBy}</p>
          <p style="color: #46B446; font-family: 'Montserrat', sans-serif;">${c.title}</p>
          <p class="gray" style="margin-top: 8px;">${c.company}</p>
        </div>
        <div style="text-align: left;">
          <p class="lbl" style="margin-bottom: 8px;">CONTACT</p>
          <p class="gray">\u{1F4DE} ${c.phone}</p>
          <p class="gray">\u2709\uFE0F ${c.email}</p>
          <p style="color: #46B446;">\u{1F310} ${c.website}</p>
        </div>
        <div style="text-align: left;">
          <p class="lbl" style="margin-bottom: 8px;">LOCATION</p>
          <p class="gray">${c.address}</p>
        </div>
      </div>
      <div class="card aqua-b" style="max-width: 800px; text-align: left; padding: 28px;">
        <p class="lbl" style="color: #46B446; margin-bottom: 14px;">YOUR NEXT STEPS</p>
        ${nextSteps.map((step, i) => `
          <p style="font-size: 15px; margin-bottom: 10px;">
            <span style="color: #46B446; font-weight: 700;">${i + 1}.</span> ${step}
          </p>
        `).join("")}
      </div>
      
    </div>
  `;
}
function genGeneric(slide) {
  return `
    <div class="slide">
      ${BRAND.logo.iconWhite ? `<img src="${BRAND.logo.iconWhite}" class="logo" alt="Logo" />` : ""}
      ${slideHeader(slide.title, slide.subtitle || "")}
      <div style="margin-top: 20px;">
        <pre style="color: #4A6B8A; font-size: 13px; white-space: pre-wrap;">${JSON.stringify(slide.content, null, 2)}</pre>
      </div>
      
    </div>
  `;
}

// server/pptxGenerator.ts
init_brand();
import { createRequire } from "module";
import * as fs2 from "fs";
import * as path2 from "path";
import { fileURLToPath } from "url";
var _require = createRequire(import.meta.url);
var _pptxResolved = _require.resolve("pptxgenjs");
var _pptxCjsPath = _pptxResolved.replace(/pptxgen\.es\.js$/, "pptxgen.cjs.js");
var PptxGenJS = _require(_pptxCjsPath);
var PptxCtor = PptxGenJS.default || PptxGenJS;
var __filename = fileURLToPath(import.meta.url);
var __dirname = path2.dirname(__filename);
var SLIDE_W = 13.333;
var SLIDE_H = 7.5;
var PAD_L = 0.8;
var PAD_R = 0.6;
var PAD_T = 0.6;
var PAD_B = 0.5;
var CONTENT_W = SLIDE_W - PAD_L - PAD_R;
var CONTENT_H = SLIDE_H - PAD_T - PAD_B;
var C = {
  black: "0F172A",
  // Midnight Navy — slide background
  navy: "1B3A5C",
  // Elite Navy — primary brand colour
  solarGreen: "46B446",
  // Solar Green — primary accent
  white: "FFFFFF",
  // Pure White
  steelBlue: "4A6B8A",
  // Steel Blue — secondary text
  charcoal: "2C3E50",
  // Charcoal — card backgrounds
  skyMist: "E8F0F7",
  // Sky Mist — light backgrounds
  lightGrey: "F5F7FA",
  // Light Grey
  darkCard: "1E2D40",
  // Dark card variant
  cardBorder: "1B3A5C",
  // Elite Navy border
  // Legacy aliases (keep for backward compat)
  aqua: "46B446",
  orange: "46B446",
  ash: "4A6B8A",
  darkGrey: "2C3E50",
  cardBg: "1E2D40"
};
var FONT_DIR = path2.join(__dirname, "fonts");
var F = {
  heading: "Montserrat",
  body: "Open Sans",
  label: "Montserrat"
};
var ASSET_CDN = {
  // White-transparent icon — used on dark slide backgrounds
  "elite-logo.jpg": "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/OOvYOULsnTCxOyIC.png",
  // White-on-navy icon — used on navy/charcoal backgrounds
  "elite-icon-navy.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/NDYOCRwnFOhisDUR.png",
  // Transparent icon (dark rays) — used on light backgrounds
  "elite-icon-transparent.png": "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/vkYTXfpVJByJjaGo.png"
};
async function ensureAssets() {
  if (!fs2.existsSync(FONT_DIR)) fs2.mkdirSync(FONT_DIR, { recursive: true });
  for (const [filename, cdnUrl] of Object.entries(ASSET_CDN)) {
    const localPath = path2.join(FONT_DIR, filename);
    if (!fs2.existsSync(localPath)) {
      const resp = await fetch(cdnUrl);
      if (!resp.ok) throw new Error(`Failed to download ${filename}: ${resp.status}`);
      const buffer = Buffer.from(await resp.arrayBuffer());
      fs2.writeFileSync(localPath, buffer);
    }
  }
}
function fmt(n, decimals = 0) {
  if (n === void 0 || n === null) return "\u2014";
  return n.toLocaleString("en-AU", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
function fmtDollar(n) {
  if (n === void 0 || n === null) return "\u2014";
  return `$${fmt(n)}`;
}
function fmtCents(n) {
  if (n === void 0 || n === null) return "\u2014";
  return `${fmt(n, 1)}c`;
}
function addLogo(slide) {
  const logoPath = path2.join(FONT_DIR, "elite-logo.jpg");
  if (fs2.existsSync(logoPath)) {
    slide.addImage({
      path: logoPath,
      x: SLIDE_W - 1.2,
      y: 0.3,
      w: 0.6,
      h: 0.6
    });
  }
}
function addCopyright(slide) {
  slide.addText(BRAND.contact.copyright, {
    x: PAD_L,
    y: SLIDE_H - 0.4,
    w: CONTENT_W,
    h: 0.3,
    fontSize: 8,
    fontFace: F.label,
    color: C.ash
  });
}
function addSlideHeader(slide, title, subtitle) {
  slide.addText(title.toUpperCase(), {
    x: PAD_L,
    y: PAD_T,
    w: subtitle ? CONTENT_W * 0.6 : CONTENT_W,
    h: 0.6,
    fontSize: 28,
    fontFace: F.heading,
    color: C.white,
    bold: true
  });
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
      align: "right"
    });
  }
  slide.addShape("rect", {
    x: PAD_L,
    y: PAD_T + 0.65,
    w: CONTENT_W,
    h: 0.015,
    fill: { color: C.aqua }
  });
}
function addDataTable(slide, rows, x, y, w, headerLabel, headerValue) {
  const tableRows = [];
  if (headerLabel) {
    tableRows.push([
      { text: headerLabel, options: { fontSize: 9, fontFace: F.label, color: C.aqua, bold: true, fill: { color: C.darkGrey } } },
      { text: headerValue || "", options: { fontSize: 9, fontFace: F.label, color: C.aqua, bold: true, align: "right", fill: { color: C.darkGrey } } }
    ]);
  }
  for (const row of rows) {
    tableRows.push([
      { text: row.label, options: { fontSize: 11, fontFace: F.body, color: C.white } },
      { text: row.value, options: { fontSize: 11, fontFace: F.body, color: row.valueColor || C.white, align: "right", bold: true } }
    ]);
  }
  slide.addTable(tableRows, {
    x,
    y,
    w,
    colW: [w * 0.6, w * 0.4],
    border: { type: "solid", pt: 0.5, color: C.darkGrey },
    rowH: 0.35,
    autoPage: false
  });
}
function slideCover(pptx, d) {
  const slide = pptx.addSlide();
  const coverBgPath = path2.join(FONT_DIR, "..", "..", "client", "public", "cover_backdrop.jpg");
  if (fs2.existsSync(coverBgPath)) {
    slide.background = { path: coverBgPath };
  } else {
    slide.background = { color: C.black };
  }
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: 10,
    h: 7.5,
    fill: { color: "0F172A", transparency: 30 },
    line: { color: "0F172A", width: 0 }
  });
  const logoPath = path2.join(FONT_DIR, "elite-logo.jpg");
  if (fs2.existsSync(logoPath)) {
    slide.addImage({ path: logoPath, x: 0.8, y: 0.5, w: 0.7, h: 0.7 });
  }
  slide.addText("ELITE SMART ENERGY SOLUTIONS", {
    x: 1.7,
    y: 0.55,
    w: 5,
    h: 0.4,
    fontSize: 20,
    fontFace: F.heading,
    color: C.white,
    bold: true,
    charSpacing: 2
  });
  slide.addText("ELECTRIFICATION SPECIALISTS", {
    x: 1.7,
    y: 0.95,
    w: 5,
    h: 0.3,
    fontSize: 10,
    fontFace: F.label,
    color: "46B446",
    charSpacing: 3
  });
  slide.addText("IN-DEPTH BILL ANALYSIS\n& SOLAR BATTERY PROPOSAL", {
    x: 0.8,
    y: 2,
    w: 6.5,
    h: 1.6,
    fontSize: 34,
    fontFace: F.heading,
    color: C.white,
    bold: true,
    lineSpacing: 44
  });
  slide.addShape("rect", {
    x: 0.8,
    y: 4,
    w: 0.08,
    h: 1,
    fill: { color: "46B446" }
  });
  slide.addText([
    { text: "PREPARED FOR\n", options: { fontSize: 10, fontFace: F.label, color: C.ash } },
    { text: `${d.customerName}
`, options: { fontSize: 20, fontFace: F.body, color: C.white, bold: true } },
    { text: d.address, options: { fontSize: 12, fontFace: F.body, color: C.ash } }
  ], {
    x: 1.1,
    y: 3.9,
    w: 5,
    h: 1.2
  });
  slide.addShape("rect", {
    x: 0.8,
    y: 5.5,
    w: 8,
    h: 0.03,
    fill: { color: "46B446" }
  });
  slide.addText(`Prepared by ${BRAND.contact.name} \u2014 ${BRAND.contact.company}`, {
    x: 0.8,
    y: 6.8,
    w: 6,
    h: 0.3,
    fontSize: 10,
    fontFace: F.label,
    color: C.ash
  });
}
function slideExecutiveSummary(pptx, d) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, "Executive Summary", "Your Energy Transformation");
  const startY = 1.5;
  const metrics = [
    { label: "CURRENT ANNUAL COST", value: fmtDollar(d.annualCost), color: C.orange },
    { label: "PROJECTED ANNUAL SAVINGS", value: fmtDollar(d.annualSavings), color: C.aqua },
    { label: "NET INVESTMENT", value: fmtDollar(d.netInvestment), color: C.white },
    { label: "PAYBACK PERIOD", value: `${d.paybackYears.toFixed(1)} Years`, color: C.aqua }
  ];
  metrics.forEach((m, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = PAD_L + col * (CONTENT_W / 2 + 0.1);
    const y = startY + row * 1.4;
    const w = CONTENT_W / 2 - 0.1;
    slide.addShape("rect", {
      x,
      y,
      w,
      h: 1.2,
      fill: { color: C.cardBg },
      line: { color: C.cardBorder, width: 0.5 },
      rectRadius: 0.08
    });
    slide.addText(m.label, {
      x: x + 0.2,
      y: y + 0.15,
      w: w - 0.4,
      h: 0.3,
      fontSize: 9,
      fontFace: F.label,
      color: C.ash
    });
    slide.addText(m.value, {
      x: x + 0.2,
      y: y + 0.45,
      w: w - 0.4,
      h: 0.6,
      fontSize: 32,
      fontFace: F.body,
      color: m.color,
      bold: true
    });
  });
  slide.addText([
    { text: "RECOMMENDED SYSTEM\n", options: { fontSize: 9, fontFace: F.label, color: C.ash } },
    { text: `${d.solarSizeKw}kW Solar + ${d.batterySizeKwh}kWh Battery`, options: { fontSize: 18, fontFace: F.body, color: C.white, bold: true } },
    { text: `
${d.panelBrand} Panels  \xB7  ${d.batteryBrand}  \xB7  ${d.vppProvider} VPP`, options: { fontSize: 11, fontFace: F.body, color: C.ash } }
  ], {
    x: PAD_L,
    y: startY + 3,
    w: CONTENT_W,
    h: 1
  });
  addCopyright(slide);
}
function slideBillAnalysis(pptx, d) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, "Current Bill Analysis", `${d.retailer} \xB7 ${d.state}`);
  const startY = 1.5;
  const colW = CONTENT_W / 2 - 0.15;
  const billRows = [
    { label: "Retailer", value: d.retailer },
    { label: "Billing Period", value: d.billPeriodStart && d.billPeriodEnd ? `${d.billPeriodStart} \u2014 ${d.billPeriodEnd}` : "\u2014" },
    { label: "Billing Days", value: d.billDays ? `${d.billDays} days` : "\u2014" },
    { label: "Total Bill Amount", value: d.billTotalAmount ? fmtDollar(d.billTotalAmount) : fmtDollar(d.annualCost / 4), valueColor: C.orange },
    { label: "Total Usage", value: d.billTotalUsageKwh ? `${fmt(d.billTotalUsageKwh)} kWh` : `${fmt(d.dailyUsageKwh * (d.billDays || 90))} kWh` },
    { label: "Daily Average Usage", value: `${fmt(d.dailyUsageKwh, 1)} kWh/day` },
    { label: "Daily Average Cost", value: d.dailyAverageCost ? `$${fmt(d.dailyAverageCost, 2)}/day` : "\u2014", valueColor: C.orange }
  ];
  addDataTable(slide, billRows, PAD_L, startY, colW, "BILL OVERVIEW", "");
  const tariffRows = [
    { label: "Daily Supply Charge", value: `${fmt(d.supplyChargeCentsPerDay, 1)}c/day` },
    { label: "Peak Rate", value: d.billPeakRateCents ? fmtCents(d.billPeakRateCents) + "/kWh" : fmtCents(d.usageRateCentsPerKwh) + "/kWh" }
  ];
  if (d.billOffPeakRateCents) tariffRows.push({ label: "Off-Peak Rate", value: fmtCents(d.billOffPeakRateCents) + "/kWh" });
  if (d.billShoulderRateCents) tariffRows.push({ label: "Shoulder Rate", value: fmtCents(d.billShoulderRateCents) + "/kWh" });
  tariffRows.push({ label: "Feed-in Tariff", value: fmtCents(d.feedInTariffCentsPerKwh) + "/kWh", valueColor: C.aqua });
  if (d.billSolarExportsKwh) tariffRows.push({ label: "Solar Exports", value: `${fmt(d.billSolarExportsKwh)} kWh`, valueColor: C.aqua });
  addDataTable(slide, tariffRows, PAD_L + colW + 0.3, startY, colW, "TARIFF RATES", "");
  const annualY = startY + (billRows.length + 1) * 0.35 + 0.3;
  const annualRows = [
    { label: "Projected Annual Cost", value: fmtDollar(d.annualCost), valueColor: C.orange },
    { label: "Annual Supply Charges", value: d.annualSupplyCharge ? fmtDollar(d.annualSupplyCharge) : "\u2014" },
    { label: "Annual Usage Charges", value: d.annualUsageCharge ? fmtDollar(d.annualUsageCharge) : "\u2014" },
    { label: "Annual Solar Credits", value: d.annualSolarCredit ? `-${fmtDollar(d.annualSolarCredit)}` : "\u2014", valueColor: C.aqua },
    { label: "Monthly Usage (est.)", value: d.monthlyUsageKwh ? `${fmt(d.monthlyUsageKwh)} kWh` : `${fmt(d.dailyUsageKwh * 30)} kWh` },
    { label: "Yearly Usage (est.)", value: `${fmt(d.annualUsageKwh)} kWh` }
  ];
  addDataTable(slide, annualRows, PAD_L, annualY, CONTENT_W, "ANNUAL PROJECTIONS", "");
  addCopyright(slide);
}
function slideUsageAnalysis(pptx, d) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, "Usage Analysis", "Time-of-Use Breakdown");
  const startY = 1.5;
  const colW = CONTENT_W / 2 - 0.15;
  const usageRows = [];
  if (d.billPeakUsageKwh) usageRows.push({ label: "Peak Usage", value: `${fmt(d.billPeakUsageKwh)} kWh` });
  if (d.billOffPeakUsageKwh) usageRows.push({ label: "Off-Peak Usage", value: `${fmt(d.billOffPeakUsageKwh)} kWh` });
  if (d.billShoulderUsageKwh) usageRows.push({ label: "Shoulder Usage", value: `${fmt(d.billShoulderUsageKwh)} kWh` });
  usageRows.push({ label: "Total Period Usage", value: `${fmt(d.billTotalUsageKwh || d.dailyUsageKwh * (d.billDays || 90))} kWh` });
  usageRows.push({ label: "Daily Average", value: `${fmt(d.dailyUsageKwh, 1)} kWh/day` });
  usageRows.push({ label: "Monthly Average", value: `${fmt(d.monthlyUsageKwh || d.dailyUsageKwh * 30)} kWh/month` });
  usageRows.push({ label: "Annual Projection", value: `${fmt(d.annualUsageKwh)} kWh/year`, valueColor: C.aqua });
  addDataTable(slide, usageRows, PAD_L, startY, colW, "USAGE BREAKDOWN", "");
  const costRows = [
    { label: "Annual Supply Charges", value: d.annualSupplyCharge ? fmtDollar(d.annualSupplyCharge) : fmtDollar(d.supplyChargeCentsPerDay / 100 * 365) },
    { label: "Annual Usage Charges", value: d.annualUsageCharge ? fmtDollar(d.annualUsageCharge) : fmtDollar(d.annualUsageKwh * d.usageRateCentsPerKwh / 100) }
  ];
  if (d.annualSolarCredit) costRows.push({ label: "Solar Feed-in Credits", value: `-${fmtDollar(d.annualSolarCredit)}`, valueColor: C.aqua });
  costRows.push({ label: "Total Annual Cost", value: fmtDollar(d.annualCost), valueColor: C.orange });
  costRows.push({ label: "Monthly Average Cost", value: fmtDollar(d.annualCost / 12) });
  costRows.push({ label: "Daily Average Cost", value: d.dailyAverageCost ? `$${fmt(d.dailyAverageCost, 2)}` : `$${fmt(d.annualCost / 365, 2)}` });
  addDataTable(slide, costRows, PAD_L + colW + 0.3, startY, colW, "COST BREAKDOWN", "");
  const barY = startY + Math.max(usageRows.length, costRows.length) * 0.35 + 1;
  const totalUsage = (d.billPeakUsageKwh || 0) + (d.billOffPeakUsageKwh || 0) + (d.billShoulderUsageKwh || 0);
  if (totalUsage > 0) {
    const peakPct = (d.billPeakUsageKwh || 0) / totalUsage;
    const offPeakPct = (d.billOffPeakUsageKwh || 0) / totalUsage;
    const shoulderPct = (d.billShoulderUsageKwh || 0) / totalUsage;
    slide.addText("USAGE DISTRIBUTION", {
      x: PAD_L,
      y: barY - 0.4,
      w: CONTENT_W,
      h: 0.3,
      fontSize: 9,
      fontFace: F.label,
      color: C.ash
    });
    let barX = PAD_L;
    const barW = CONTENT_W;
    const barH = 0.4;
    if (peakPct > 0) {
      slide.addShape("rect", { x: barX, y: barY, w: barW * peakPct, h: barH, fill: { color: C.orange } });
      slide.addText(`Peak ${fmt(peakPct * 100)}%`, { x: barX, y: barY, w: barW * peakPct, h: barH, fontSize: 9, fontFace: F.body, color: C.black, align: "center", valign: "middle" });
      barX += barW * peakPct;
    }
    if (offPeakPct > 0) {
      slide.addShape("rect", { x: barX, y: barY, w: barW * offPeakPct, h: barH, fill: { color: C.aqua } });
      slide.addText(`Off-Peak ${fmt(offPeakPct * 100)}%`, { x: barX, y: barY, w: barW * offPeakPct, h: barH, fontSize: 9, fontFace: F.body, color: C.black, align: "center", valign: "middle" });
      barX += barW * offPeakPct;
    }
    if (shoulderPct > 0) {
      slide.addShape("rect", { x: barX, y: barY, w: barW * shoulderPct, h: barH, fill: { color: C.ash } });
      slide.addText(`Shoulder ${fmt(shoulderPct * 100)}%`, { x: barX, y: barY, w: barW * shoulderPct, h: barH, fontSize: 9, fontFace: F.body, color: C.white, align: "center", valign: "middle" });
    }
  }
  addCopyright(slide);
}
function slideYearlyProjection(pptx, d) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, "Yearly Cost Projection", "25-Year Outlook at 3.5% Inflation");
  const startY = 1.5;
  const years = [1, 2, 3, 5, 7, 10, 15, 20, 25];
  const projRows = years.map((yr) => {
    const withoutSolar = d.annualCost * Math.pow(1.035, yr);
    const withSolar = Math.max(0, withoutSolar - d.annualSavings);
    const savings = withoutSolar - withSolar;
    return {
      label: `Year ${yr}`,
      value: `${fmtDollar(withoutSolar)}  \u2192  ${fmtDollar(withSolar)}  (Save ${fmtDollar(savings)})`,
      valueColor: C.aqua
    };
  });
  addDataTable(slide, projRows, PAD_L, startY, CONTENT_W, "YEAR", "WITHOUT SOLAR  \u2192  WITH SOLAR  (SAVINGS)");
  const summaryY = startY + (projRows.length + 1) * 0.35 + 0.4;
  const cardW = CONTENT_W / 3 - 0.2;
  const summaryItems = [
    { label: "10-YEAR SAVINGS", value: fmtDollar(d.tenYearSavings), color: C.aqua },
    { label: "25-YEAR SAVINGS", value: d.twentyFiveYearSavings ? fmtDollar(d.twentyFiveYearSavings) : fmtDollar(d.tenYearSavings * 2.5), color: C.aqua },
    { label: "PAYBACK PERIOD", value: `${d.paybackYears.toFixed(1)} Years`, color: C.white }
  ];
  summaryItems.forEach((item, i) => {
    const x = PAD_L + i * (cardW + 0.3);
    slide.addShape("rect", {
      x,
      y: summaryY,
      w: cardW,
      h: 1,
      fill: { color: C.cardBg },
      line: { color: i < 2 ? C.aqua : C.cardBorder, width: 0.5 },
      rectRadius: 0.08
    });
    slide.addText(item.label, { x: x + 0.15, y: summaryY + 0.1, w: cardW - 0.3, h: 0.25, fontSize: 9, fontFace: F.label, color: C.ash });
    slide.addText(item.value, { x: x + 0.15, y: summaryY + 0.4, w: cardW - 0.3, h: 0.5, fontSize: 28, fontFace: F.body, color: item.color, bold: true });
  });
  addCopyright(slide);
}
function slideGasFootprint(pptx, d) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, "Current Gas Footprint", d.gasBillRetailer || "Gas Analysis");
  const startY = 1.5;
  const colW = CONTENT_W / 2 - 0.15;
  const gasRows = [
    { label: "Gas Retailer", value: d.gasBillRetailer || "\u2014" },
    { label: "Billing Period", value: d.gasBillPeriodStart && d.gasBillPeriodEnd ? `${d.gasBillPeriodStart} \u2014 ${d.gasBillPeriodEnd}` : "\u2014" },
    { label: "Billing Days", value: d.gasBillDays ? `${d.gasBillDays} days` : "\u2014" },
    { label: "Total Bill Amount", value: d.gasBillTotalAmount ? fmtDollar(d.gasBillTotalAmount) : "\u2014", valueColor: C.orange },
    { label: "Gas Usage", value: d.gasBillUsageMj ? `${fmt(d.gasBillUsageMj)} MJ` : d.gasAnnualMJ ? `${fmt(d.gasAnnualMJ)} MJ/yr` : "\u2014" },
    { label: "Usage Rate", value: d.gasBillRateCentsMj ? `${fmt(d.gasBillRateCentsMj, 2)}c/MJ` : "\u2014" },
    { label: "Daily Supply Charge", value: d.gasDailySupplyCharge ? `${fmt(d.gasDailySupplyCharge, 2)}c/day` : "\u2014" }
  ];
  addDataTable(slide, gasRows, PAD_L, startY, colW, "GAS BILL DETAILS", "");
  const annualGasRows = [
    { label: "Annual Gas Cost", value: d.gasAnnualCost ? fmtDollar(d.gasAnnualCost) : "\u2014", valueColor: C.orange },
    { label: "Annual Supply Charges", value: d.gasAnnualSupplyCharge ? fmtDollar(d.gasAnnualSupplyCharge) : "\u2014" },
    { label: "Annual Usage (MJ)", value: d.gasAnnualMJ ? `${fmt(d.gasAnnualMJ)} MJ` : "\u2014" },
    { label: "kWh Equivalent", value: d.gasKwhEquivalent ? `${fmt(d.gasKwhEquivalent)} kWh` : "\u2014" },
    { label: "CO2 Emissions", value: d.gasCO2Emissions ? `${fmt(d.gasCO2Emissions, 1)} kg/yr` : "\u2014", valueColor: C.orange },
    { label: "Daily Gas Cost", value: d.gasDailyGasCost ? `$${fmt(d.gasDailyGasCost, 2)}/day` : "\u2014" }
  ];
  addDataTable(slide, annualGasRows, PAD_L + colW + 0.3, startY, colW, "ANNUAL GAS PROJECTIONS", "");
  const insightY = startY + Math.max(gasRows.length, annualGasRows.length) * 0.35 + 1;
  slide.addShape("rect", {
    x: PAD_L,
    y: insightY,
    w: CONTENT_W,
    h: 0.8,
    fill: { color: C.darkGrey },
    line: { color: C.orange, width: 1, dashType: "solid" },
    rectRadius: 0.08
  });
  slide.addText("Eliminating gas entirely removes both usage charges AND the daily supply charge \u2014 a double saving that accelerates your payback period significantly.", {
    x: PAD_L + 0.2,
    y: insightY + 0.1,
    w: CONTENT_W - 0.4,
    h: 0.6,
    fontSize: 11,
    fontFace: F.body,
    color: C.ash,
    italic: true
  });
  addCopyright(slide);
}
function slideGasAppliances(pptx, d) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, "Gas Appliance Inventory", "Electrification Opportunities");
  const startY = 1.5;
  const apps = d.gasAppliances || {};
  const tableRows = [
    [
      { text: "APPLIANCE", options: { fontSize: 9, fontFace: F.label, color: C.aqua, bold: true, fill: { color: C.darkGrey } } },
      { text: "TYPE", options: { fontSize: 9, fontFace: F.label, color: C.aqua, bold: true, fill: { color: C.darkGrey } } },
      { text: "AGE", options: { fontSize: 9, fontFace: F.label, color: C.aqua, bold: true, align: "center", fill: { color: C.darkGrey } } },
      { text: "EST. ANNUAL COST", options: { fontSize: 9, fontFace: F.label, color: C.aqua, bold: true, align: "right", fill: { color: C.darkGrey } } },
      { text: "REPLACEMENT", options: { fontSize: 9, fontFace: F.label, color: C.aqua, bold: true, align: "right", fill: { color: C.darkGrey } } }
    ]
  ];
  if (apps.hotWater) {
    tableRows.push([
      { text: "Hot Water System", options: { fontSize: 11, fontFace: F.body, color: C.white } },
      { text: apps.hotWater.type || "Gas Storage", options: { fontSize: 11, fontFace: F.body, color: C.ash } },
      { text: apps.hotWater.age ? `${apps.hotWater.age} yrs` : "\u2014", options: { fontSize: 11, fontFace: F.body, color: C.ash, align: "center" } },
      { text: apps.hotWater.annualCost ? fmtDollar(apps.hotWater.annualCost) : "\u2014", options: { fontSize: 11, fontFace: F.body, color: C.orange, align: "right" } },
      { text: "Heat Pump HWS", options: { fontSize: 11, fontFace: F.body, color: C.aqua, align: "right" } }
    ]);
  }
  if (apps.heating) {
    tableRows.push([
      { text: "Heating System", options: { fontSize: 11, fontFace: F.body, color: C.white } },
      { text: apps.heating.type || "Gas Ducted", options: { fontSize: 11, fontFace: F.body, color: C.ash } },
      { text: apps.heating.age ? `${apps.heating.age} yrs` : "\u2014", options: { fontSize: 11, fontFace: F.body, color: C.ash, align: "center" } },
      { text: apps.heating.annualCost ? fmtDollar(apps.heating.annualCost) : "\u2014", options: { fontSize: 11, fontFace: F.body, color: C.orange, align: "right" } },
      { text: "Reverse Cycle AC", options: { fontSize: 11, fontFace: F.body, color: C.aqua, align: "right" } }
    ]);
  }
  if (apps.cooktop) {
    tableRows.push([
      { text: "Cooktop", options: { fontSize: 11, fontFace: F.body, color: C.white } },
      { text: apps.cooktop.type || "Gas Cooktop", options: { fontSize: 11, fontFace: F.body, color: C.ash } },
      { text: "\u2014", options: { fontSize: 11, fontFace: F.body, color: C.ash, align: "center" } },
      { text: apps.cooktop.annualCost ? fmtDollar(apps.cooktop.annualCost) : "\u2014", options: { fontSize: 11, fontFace: F.body, color: C.orange, align: "right" } },
      { text: "Induction Cooktop", options: { fontSize: 11, fontFace: F.body, color: C.aqua, align: "right" } }
    ]);
  }
  if (apps.poolHeater) {
    tableRows.push([
      { text: "Pool Heater", options: { fontSize: 11, fontFace: F.body, color: C.white } },
      { text: apps.poolHeater.type || "Gas Pool Heater", options: { fontSize: 11, fontFace: F.body, color: C.ash } },
      { text: "\u2014", options: { fontSize: 11, fontFace: F.body, color: C.ash, align: "center" } },
      { text: apps.poolHeater.annualCost ? fmtDollar(apps.poolHeater.annualCost) : "\u2014", options: { fontSize: 11, fontFace: F.body, color: C.orange, align: "right" } },
      { text: "Electric Heat Pump", options: { fontSize: 11, fontFace: F.body, color: C.aqua, align: "right" } }
    ]);
  }
  slide.addTable(tableRows, {
    x: PAD_L,
    y: startY,
    w: CONTENT_W,
    colW: [CONTENT_W * 0.2, CONTENT_W * 0.2, CONTENT_W * 0.12, CONTENT_W * 0.22, CONTENT_W * 0.26],
    border: { type: "solid", pt: 0.5, color: C.darkGrey },
    rowH: 0.45,
    autoPage: false
  });
  addCopyright(slide);
}
function slideStrategicAssessment(pptx, d) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, "Strategic Assessment", "Tailored Recommendations");
  const startY = 1.5;
  const items = [
    { title: "SOLAR PV SYSTEM", desc: `${d.solarSizeKw}kW system with ${d.panelCount}\xD7 ${d.panelBrand} ${d.panelWattage}W panels. Sized to cover ${fmt(d.annualUsageKwh)} kWh annual consumption plus battery charging and EV needs.`, color: C.aqua },
    { title: "BATTERY STORAGE", desc: `${d.batterySizeKwh}kWh ${d.batteryBrand} system. Provides overnight home coverage, EV charging buffer, and VPP trading capacity for maximum return.`, color: C.aqua },
    { title: "VPP PARTICIPATION", desc: `${d.vppProvider} ${d.vppProgram} \u2014 estimated ${fmtDollar(d.vppAnnualValue)}/year income through daily credits, event payments${d.hasGasBundle ? ", and gas bundle discount" : ""}.`, color: C.aqua }
  ];
  if (d.hasGas) {
    items.push({ title: "FULL ELECTRIFICATION", desc: `Eliminate gas entirely \u2014 remove ${fmtDollar(d.gasAnnualCost || 0)}/year in gas costs plus daily supply charges. Replace with efficient heat pump hot water, reverse cycle AC, and induction cooking.`, color: C.orange });
  }
  if (d.hasEV) {
    items.push({ title: "EV INTEGRATION", desc: `Solar-charged EV driving saves ${fmtDollar(d.evAnnualSavings || 0)}/year vs petrol. Smart charger enables off-peak and solar-priority charging.`, color: C.aqua });
  }
  items.forEach((item, i) => {
    const y = startY + i * 1.1;
    slide.addShape("rect", { x: PAD_L, y, w: 0.06, h: 0.85, fill: { color: item.color } });
    slide.addText(item.title, { x: PAD_L + 0.2, y, w: CONTENT_W - 0.2, h: 0.3, fontSize: 13, fontFace: F.heading, color: C.white, bold: true });
    slide.addText(item.desc, { x: PAD_L + 0.2, y: y + 0.3, w: CONTENT_W - 0.2, h: 0.55, fontSize: 11, fontFace: F.body, color: C.ash });
  });
  addCopyright(slide);
}
function slideBatteryRecommendation(pptx, d) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, "Battery Recommendation", `${d.batteryBrand} \xB7 ${d.batterySizeKwh}kWh`);
  const startY = 1.5;
  const colW = CONTENT_W / 2 - 0.15;
  const homeOvernight = d.dailyUsageKwh * 0.3;
  const evCharging = d.hasEV ? 10 : 0;
  const vppTrading = d.batterySizeKwh - homeOvernight - evCharging;
  const sizingRows = [
    { label: "Home Overnight Load", value: `${fmt(homeOvernight, 1)} kWh` },
    { label: "EV Charging Buffer", value: d.hasEV ? `${fmt(evCharging, 1)} kWh` : "N/A" },
    { label: "VPP Trading Capacity", value: `${fmt(Math.max(0, vppTrading), 1)} kWh`, valueColor: C.aqua },
    { label: "Total Battery Size", value: `${d.batterySizeKwh} kWh`, valueColor: C.white },
    { label: "Battery Brand", value: d.batteryBrand },
    { label: "Module Size", value: "8.06 kWh" },
    { label: "Modules Required", value: `${Math.ceil(d.batterySizeKwh / 8.06)}` }
  ];
  addDataTable(slide, sizingRows, PAD_L, startY, colW, "SIZING BREAKDOWN", "");
  const financialRows = [
    { label: "Battery Investment", value: d.investmentBattery ? fmtDollar(d.investmentBattery) : "\u2014" },
    { label: "Battery Rebate", value: d.batteryRebateAmount ? `-${fmtDollar(d.batteryRebateAmount)}` : "\u2014", valueColor: C.aqua },
    { label: "Net Battery Cost", value: d.investmentBattery && d.batteryRebateAmount ? fmtDollar(d.investmentBattery - d.batteryRebateAmount) : "\u2014" },
    { label: "VPP Annual Income", value: fmtDollar(d.vppAnnualValue), valueColor: C.aqua },
    { label: "Self-Consumption Savings", value: fmtDollar(d.dailyUsageKwh * 0.3 * 365 * d.usageRateCentsPerKwh / 100), valueColor: C.aqua },
    { label: "Battery Payback", value: d.investmentBattery ? `${fmt((d.investmentBattery - (d.batteryRebateAmount || 0)) / (d.vppAnnualValue + d.dailyUsageKwh * 0.3 * 365 * d.usageRateCentsPerKwh / 100), 1)} years` : "\u2014" }
  ];
  addDataTable(slide, financialRows, PAD_L + colW + 0.3, startY, colW, "FINANCIAL IMPACT", "");
  addCopyright(slide);
}
function slideSolarSystem(pptx, d) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, "Solar PV System", `${d.panelBrand} \xB7 ${d.solarSizeKw}kW`);
  const startY = 1.5;
  const colW = CONTENT_W / 2 - 0.15;
  const specRows = [
    { label: "System Size", value: `${d.solarSizeKw} kW` },
    { label: "Panel Brand", value: d.panelBrand },
    { label: "Panel Wattage", value: `${d.panelWattage}W` },
    { label: "Panel Count", value: `${d.panelCount} panels` },
    { label: "Inverter", value: `${d.inverterBrand} ${d.inverterSizeKw}kW` },
    { label: "Est. Annual Generation", value: `${fmt(d.solarSizeKw * 4 * 365)} kWh`, valueColor: C.aqua },
    { label: "Coverage of Usage", value: `${fmt(Math.min(100, d.solarSizeKw * 4 * 365 / d.annualUsageKwh * 100))}%`, valueColor: C.aqua }
  ];
  addDataTable(slide, specRows, PAD_L, startY, colW, "SYSTEM SPECIFICATIONS", "");
  const solarFinRows = [
    { label: "Solar Investment", value: d.investmentSolar ? fmtDollar(d.investmentSolar) : "\u2014" },
    { label: "STC Rebate", value: d.solarRebateAmount ? `-${fmtDollar(d.solarRebateAmount)}` : "\u2014", valueColor: C.aqua },
    { label: "Net Solar Cost", value: d.investmentSolar && d.solarRebateAmount ? fmtDollar(d.investmentSolar - d.solarRebateAmount) : "\u2014" },
    { label: "Annual Generation Value", value: fmtDollar(d.solarSizeKw * 4 * 365 * d.usageRateCentsPerKwh / 100), valueColor: C.aqua },
    { label: "Feed-in Revenue", value: fmtDollar(d.billSolarExportsKwh ? d.billSolarExportsKwh * d.feedInTariffCentsPerKwh / 100 * 4 : d.solarSizeKw * 4 * 365 * 0.3 * d.feedInTariffCentsPerKwh / 100), valueColor: C.aqua }
  ];
  addDataTable(slide, solarFinRows, PAD_L + colW + 0.3, startY, colW, "FINANCIAL IMPACT", "");
  addCopyright(slide);
}
function slideVppComparison(pptx, d) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, "VPP Provider Comparison", `${d.state} \xB7 Top Providers`);
  const startY = 1.5;
  slide.addText("Virtual Power Plant providers are ranked by estimated annual value for your location and energy profile. The recommended provider maximises your return through daily credits, event payments, and bundle discounts.", {
    x: PAD_L,
    y: startY,
    w: CONTENT_W,
    h: 0.6,
    fontSize: 11,
    fontFace: F.body,
    color: C.ash
  });
  slide.addShape("rect", {
    x: PAD_L,
    y: startY + 0.8,
    w: CONTENT_W,
    h: 1.2,
    fill: { color: C.cardBg },
    line: { color: C.aqua, width: 1 },
    rectRadius: 0.08
  });
  slide.addText("RECOMMENDED PROVIDER", {
    x: PAD_L + 0.2,
    y: startY + 0.9,
    w: 3,
    h: 0.25,
    fontSize: 9,
    fontFace: F.label,
    color: C.aqua
  });
  slide.addText(`${d.vppProvider} \u2014 ${d.vppProgram}`, {
    x: PAD_L + 0.2,
    y: startY + 1.15,
    w: 5,
    h: 0.4,
    fontSize: 22,
    fontFace: F.body,
    color: C.white,
    bold: true
  });
  slide.addText(fmtDollar(d.vppAnnualValue) + "/year", {
    x: SLIDE_W - PAD_R - 3,
    y: startY + 1,
    w: 2.5,
    h: 0.8,
    fontSize: 36,
    fontFace: F.body,
    color: C.aqua,
    bold: true,
    align: "right"
  });
  const vppY = startY + 2.3;
  const vppRows = [];
  if (d.vppDailyCreditAnnual) vppRows.push({ label: "Daily Credits (365 days)", value: fmtDollar(d.vppDailyCreditAnnual), valueColor: C.aqua });
  if (d.vppEventPaymentsAnnual) vppRows.push({ label: "Event Payments", value: fmtDollar(d.vppEventPaymentsAnnual), valueColor: C.aqua });
  if (d.vppBundleDiscount) vppRows.push({ label: "Gas Bundle Discount", value: fmtDollar(d.vppBundleDiscount), valueColor: C.aqua });
  vppRows.push({ label: "Total Annual VPP Value", value: fmtDollar(d.vppAnnualValue), valueColor: C.aqua });
  addDataTable(slide, vppRows, PAD_L, vppY, CONTENT_W / 2, "VALUE BREAKDOWN", "");
  addCopyright(slide);
}
function slideVppRecommendation(pptx, d) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, "VPP Recommendation", `${d.vppProvider} \xB7 ${d.vppProgram}`);
  const startY = 1.5;
  const benefits = [
    `Annual VPP income of ${fmtDollar(d.vppAnnualValue)} through daily credits and event payments`,
    d.hasGasBundle ? `Gas + electricity bundle discount of ${fmtDollar(d.vppBundleDiscount || 0)}/year` : "No gas bundle required \u2014 standalone electricity plan",
    `Compatible with ${d.batteryBrand} ${d.batterySizeKwh}kWh battery system`,
    "Automated battery dispatch \u2014 no manual intervention required",
    "Real-time monitoring via provider app"
  ];
  benefits.forEach((b, i) => {
    slide.addText(`\u2713  ${b}`, {
      x: PAD_L,
      y: startY + i * 0.5,
      w: CONTENT_W,
      h: 0.4,
      fontSize: 12,
      fontFace: F.body,
      color: C.white
    });
  });
  addCopyright(slide);
}
function slideElectrification(pptx, d, type) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  const configs = {
    hot_water: {
      title: "Hot Water Electrification",
      subtitle: "Heat Pump Hot Water System",
      currentLabel: "Gas Hot Water Cost",
      currentCost: d.hotWaterCurrentGasCost,
      newLabel: "Heat Pump Running Cost",
      newCost: d.hotWaterHeatPumpCost,
      savings: d.heatPumpSavings,
      extraRows: d.hotWaterDailySupplySaved ? [{ label: "Daily Supply Charge Saved", value: fmtDollar(d.hotWaterDailySupplySaved * 365) + "/yr", valueColor: C.aqua }] : []
    },
    heating: {
      title: "Heating & Cooling Upgrade",
      subtitle: "Reverse Cycle Air Conditioning",
      currentLabel: "Gas Heating Cost",
      currentCost: d.heatingCurrentGasCost,
      newLabel: "Reverse Cycle AC Cost",
      newCost: d.heatingRcAcCost,
      savings: d.heatingCoolingSavings,
      extraRows: []
    },
    induction: {
      title: "Induction Cooking Upgrade",
      subtitle: "Premium Induction Cooktop",
      currentLabel: "Gas Cooktop Cost",
      currentCost: d.cookingCurrentGasCost,
      newLabel: "Induction Running Cost",
      newCost: d.cookingInductionCost,
      savings: d.inductionSavings,
      extraRows: []
    }
  };
  const cfg = configs[type];
  addSlideHeader(slide, cfg.title, cfg.subtitle);
  const startY = 1.5;
  const rows = [
    { label: cfg.currentLabel, value: cfg.currentCost ? fmtDollar(cfg.currentCost) + "/yr" : "\u2014", valueColor: C.orange },
    { label: cfg.newLabel, value: cfg.newCost ? fmtDollar(cfg.newCost) + "/yr" : "\u2014", valueColor: C.aqua },
    ...cfg.extraRows,
    { label: "Annual Savings", value: cfg.savings ? fmtDollar(cfg.savings) + "/yr" : "\u2014", valueColor: C.aqua }
  ];
  addDataTable(slide, rows, PAD_L, startY, CONTENT_W / 2, "COST COMPARISON", "");
  addCopyright(slide);
}
function slideEvAnalysis(pptx, d) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, "EV Analysis", `${fmt(d.evAnnualKm || 1e4)} km/year`);
  const startY = 1.5;
  const colW = CONTENT_W / 2 - 0.15;
  const evRows = [
    { label: "Annual Distance", value: `${fmt(d.evAnnualKm || 1e4)} km` },
    { label: "EV Consumption", value: d.evConsumptionPer100km ? `${fmt(d.evConsumptionPer100km, 1)} kWh/100km` : "15 kWh/100km" },
    { label: "Petrol Price", value: d.evPetrolPricePerLitre ? `$${fmt(d.evPetrolPricePerLitre, 2)}/L` : "$1.80/L" },
    { label: "Annual Petrol Cost", value: d.evPetrolCost ? fmtDollar(d.evPetrolCost) : "\u2014", valueColor: C.orange },
    { label: "Annual Grid Charge Cost", value: d.evGridChargeCost ? fmtDollar(d.evGridChargeCost) : "\u2014" },
    { label: "Annual Solar Charge Cost", value: d.evSolarChargeCost !== void 0 ? fmtDollar(d.evSolarChargeCost) : "$0", valueColor: C.aqua },
    { label: "Annual EV Savings", value: d.evAnnualSavings ? fmtDollar(d.evAnnualSavings) : "\u2014", valueColor: C.aqua }
  ];
  addDataTable(slide, evRows, PAD_L, startY, colW, "EV COST COMPARISON", "");
  addCopyright(slide);
}
function slideEvCharger(pptx, d) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, "EV Charger Recommendation", "Smart Home Charging");
  const startY = 1.5;
  const features = [
    "Solar-priority charging \u2014 charges from excess solar first",
    "Scheduled charging \u2014 set off-peak charging windows",
    "Load management \u2014 prevents circuit overload",
    "App control \u2014 monitor and control remotely",
    "VPP compatible \u2014 participates in grid events"
  ];
  features.forEach((f, i) => {
    slide.addText(`\u2713  ${f}`, {
      x: PAD_L,
      y: startY + i * 0.45,
      w: CONTENT_W,
      h: 0.35,
      fontSize: 12,
      fontFace: F.body,
      color: C.white
    });
  });
  if (d.investmentEvCharger) {
    slide.addShape("rect", {
      x: PAD_L,
      y: startY + 3,
      w: 3,
      h: 0.8,
      fill: { color: C.cardBg },
      line: { color: C.orange, width: 0.5 },
      rectRadius: 0.08
    });
    slide.addText("INSTALLED COST", { x: PAD_L + 0.15, y: startY + 3.05, w: 2.7, h: 0.25, fontSize: 9, fontFace: F.label, color: C.ash });
    slide.addText(fmtDollar(d.investmentEvCharger), { x: PAD_L + 0.15, y: startY + 3.3, w: 2.7, h: 0.45, fontSize: 28, fontFace: F.body, color: C.white, bold: true });
  }
  addCopyright(slide);
}
function slidePoolHeatPump(pptx, d) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, "Pool Heat Pump", "Energy-Efficient Pool Heating");
  const startY = 1.5;
  const rows = [
    { label: "Recommended Size", value: d.poolRecommendedKw ? `${d.poolRecommendedKw} kW` : "\u2014" },
    { label: "Annual Operating Cost", value: d.poolAnnualOperatingCost ? fmtDollar(d.poolAnnualOperatingCost) : "\u2014" },
    { label: "Annual Savings", value: d.poolPumpSavings ? fmtDollar(d.poolPumpSavings) : "\u2014", valueColor: C.aqua },
    { label: "Investment Cost", value: d.investmentPoolHeatPump ? fmtDollar(d.investmentPoolHeatPump) : "\u2014" }
  ];
  addDataTable(slide, rows, PAD_L, startY, CONTENT_W / 2, "POOL HEAT PUMP DETAILS", "");
  addCopyright(slide);
}
function slideElectrificationInvestment(pptx, d) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, "Electrification Investment", "Complete Gas Elimination");
  const startY = 1.5;
  const investRows = [
    [
      { text: "ITEM", options: { fontSize: 9, fontFace: F.label, color: C.aqua, bold: true, fill: { color: C.darkGrey } } },
      { text: "COST", options: { fontSize: 9, fontFace: F.label, color: C.aqua, bold: true, align: "right", fill: { color: C.darkGrey } } },
      { text: "REBATE", options: { fontSize: 9, fontFace: F.label, color: C.aqua, bold: true, align: "right", fill: { color: C.darkGrey } } },
      { text: "NET", options: { fontSize: 9, fontFace: F.label, color: C.aqua, bold: true, align: "right", fill: { color: C.darkGrey } } }
    ]
  ];
  const items = [
    { name: "Solar PV System", cost: d.investmentSolar, rebate: d.solarRebateAmount },
    { name: "Battery Storage", cost: d.investmentBattery, rebate: d.batteryRebateAmount },
    { name: "Heat Pump Hot Water", cost: d.investmentHeatPumpHw, rebate: d.heatPumpHwRebateAmount },
    { name: "Reverse Cycle AC", cost: d.investmentRcAc, rebate: d.heatPumpAcRebateAmount },
    { name: "Induction Cooktop", cost: d.investmentInduction, rebate: 0 },
    { name: "EV Charger", cost: d.investmentEvCharger, rebate: 0 },
    { name: "Pool Heat Pump", cost: d.investmentPoolHeatPump, rebate: 0 }
  ].filter((i) => i.cost && i.cost > 0);
  items.forEach((item) => {
    const rebate = item.rebate || 0;
    investRows.push([
      { text: item.name, options: { fontSize: 11, fontFace: F.body, color: C.white } },
      { text: fmtDollar(item.cost), options: { fontSize: 11, fontFace: F.body, color: C.white, align: "right" } },
      { text: rebate > 0 ? `-${fmtDollar(rebate)}` : "\u2014", options: { fontSize: 11, fontFace: F.body, color: C.aqua, align: "right" } },
      { text: fmtDollar(item.cost - rebate), options: { fontSize: 11, fontFace: F.body, color: C.white, align: "right", bold: true } }
    ]);
  });
  investRows.push([
    { text: "TOTAL", options: { fontSize: 11, fontFace: F.body, color: C.white, bold: true, fill: { color: C.darkGrey } } },
    { text: fmtDollar(d.systemCost), options: { fontSize: 11, fontFace: F.body, color: C.white, bold: true, align: "right", fill: { color: C.darkGrey } } },
    { text: `-${fmtDollar(d.rebateAmount)}`, options: { fontSize: 11, fontFace: F.body, color: C.aqua, bold: true, align: "right", fill: { color: C.darkGrey } } },
    { text: fmtDollar(d.netInvestment), options: { fontSize: 11, fontFace: F.body, color: C.white, bold: true, align: "right", fill: { color: C.darkGrey } } }
  ]);
  slide.addTable(investRows, {
    x: PAD_L,
    y: startY,
    w: CONTENT_W,
    colW: [CONTENT_W * 0.4, CONTENT_W * 0.2, CONTENT_W * 0.2, CONTENT_W * 0.2],
    border: { type: "solid", pt: 0.5, color: C.darkGrey },
    rowH: 0.4,
    autoPage: false
  });
  addCopyright(slide);
}
function slideSavingsSummary(pptx, d) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, "Total Savings Summary", "Combined Annual Benefit");
  const startY = 1.5;
  const savingsItems = [
    { category: "Solar Self-Consumption", value: Math.round(d.annualSavings * 0.4), color: C.aqua },
    { category: "VPP Income", value: d.vppAnnualValue, color: C.aqua }
  ];
  if (d.hasGas && d.gasAnnualCost) savingsItems.push({ category: "Gas Elimination", value: d.gasAnnualCost, color: C.orange });
  if (d.evAnnualSavings) savingsItems.push({ category: "EV Fuel Savings", value: d.evAnnualSavings, color: C.aqua });
  if (d.poolPumpSavings) savingsItems.push({ category: "Pool Heat Pump", value: d.poolPumpSavings, color: C.aqua });
  const totalBenefit = savingsItems.reduce((sum, s) => sum + s.value, 0);
  const savingsRows = savingsItems.map((s) => ({
    label: s.category,
    value: fmtDollar(s.value),
    valueColor: s.color
  }));
  savingsRows.push({ label: "TOTAL ANNUAL BENEFIT", value: fmtDollar(totalBenefit), valueColor: C.aqua });
  addDataTable(slide, savingsRows, PAD_L, startY, CONTENT_W / 2, "SAVINGS BREAKDOWN", "");
  slide.addShape("rect", {
    x: PAD_L + CONTENT_W / 2 + 0.3,
    y: startY,
    w: CONTENT_W / 2 - 0.3,
    h: 2,
    fill: { color: C.cardBg },
    line: { color: C.aqua, width: 1 },
    rectRadius: 0.08
  });
  slide.addText("TOTAL ANNUAL BENEFIT", {
    x: PAD_L + CONTENT_W / 2 + 0.5,
    y: startY + 0.2,
    w: CONTENT_W / 2 - 0.7,
    h: 0.3,
    fontSize: 9,
    fontFace: F.label,
    color: C.aqua
  });
  slide.addText(fmtDollar(totalBenefit), {
    x: PAD_L + CONTENT_W / 2 + 0.5,
    y: startY + 0.6,
    w: CONTENT_W / 2 - 0.7,
    h: 0.8,
    fontSize: 48,
    fontFace: F.body,
    color: C.white,
    bold: true
  });
  slide.addText("Tax-Free Savings", {
    x: PAD_L + CONTENT_W / 2 + 0.5,
    y: startY + 1.4,
    w: CONTENT_W / 2 - 0.7,
    h: 0.3,
    fontSize: 11,
    fontFace: F.body,
    color: C.ash
  });
  addCopyright(slide);
}
function slideFinancialSummary(pptx, d) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, "Financial Summary", "Investment & Returns");
  const startY = 1.5;
  const colW = CONTENT_W / 2 - 0.15;
  const investRows = [
    { label: "Total System Cost", value: fmtDollar(d.systemCost) },
    { label: "Government Rebates", value: `-${fmtDollar(d.rebateAmount)}`, valueColor: C.aqua },
    { label: "Net Investment", value: fmtDollar(d.netInvestment), valueColor: C.orange }
  ];
  addDataTable(slide, investRows, PAD_L, startY, colW, "INVESTMENT", "");
  const returnRows = [
    { label: "Annual Benefit", value: fmtDollar(d.annualSavings), valueColor: C.aqua },
    { label: "Payback Period", value: `${d.paybackYears.toFixed(1)} years` },
    { label: "10-Year Savings", value: fmtDollar(d.tenYearSavings), valueColor: C.aqua },
    { label: "25-Year Savings", value: d.twentyFiveYearSavings ? fmtDollar(d.twentyFiveYearSavings) : fmtDollar(d.tenYearSavings * 2.5), valueColor: C.aqua }
  ];
  addDataTable(slide, returnRows, PAD_L + colW + 0.3, startY, colW, "PROJECTED RETURNS", "");
  addCopyright(slide);
}
function slideEnvironmental(pptx, d) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, "Environmental Impact", "Your Carbon Reduction");
  const startY = 1.5;
  const treesEquiv = d.treesEquivalent || Math.round(d.co2ReductionTonnes * 50);
  const carsOffRoad = Math.round(d.co2ReductionTonnes / 4.6 * 10) / 10;
  const envRows = [
    { label: "Annual CO2 Reduction", value: `${fmt(d.co2ReductionTonnes, 1)} tonnes`, valueColor: C.aqua },
    { label: "25-Year CO2 Reduction", value: `${fmt(d.co2ReductionTonnes * 25)} tonnes`, valueColor: C.aqua },
    { label: "Trees Equivalent", value: `${treesEquiv} trees/year`, valueColor: C.aqua },
    { label: "Cars Off Road Equivalent", value: `${carsOffRoad}`, valueColor: C.orange }
  ];
  if (d.co2CurrentTonnes) envRows.push({ label: "Current CO2 Emissions", value: `${fmt(d.co2CurrentTonnes, 1)} tonnes/yr`, valueColor: C.orange });
  if (d.co2ProjectedTonnes) envRows.push({ label: "Projected CO2 Emissions", value: `${fmt(d.co2ProjectedTonnes, 1)} tonnes/yr`, valueColor: C.aqua });
  if (d.co2ReductionPercent) envRows.push({ label: "CO2 Reduction", value: `${fmt(d.co2ReductionPercent)}%`, valueColor: C.aqua });
  const energyIndep = d.energyIndependenceScore || Math.min(95, Math.round(d.solarSizeKw * 4 * 365 / d.annualUsageKwh * 100));
  envRows.push({ label: "Energy Independence Score", value: `${energyIndep}%`, valueColor: C.aqua });
  addDataTable(slide, envRows, PAD_L, startY, CONTENT_W / 2, "ENVIRONMENTAL METRICS", "");
  addCopyright(slide);
}
function slideRoadmap(pptx, d) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, "Recommended Roadmap", "Your Path to Energy Independence");
  const startY = 1.5;
  const steps = [
    { num: "01", title: "SITE ASSESSMENT", desc: "Professional site inspection, roof analysis, switchboard review, and system design.", timeline: "Week 1-2", color: C.aqua },
    { num: "02", title: "SYSTEM INSTALLATION", desc: "Solar panels, battery, inverter installation by CEC-accredited installers.", timeline: "Week 3-4", color: C.aqua },
    { num: "03", title: "ELECTRIFICATION", desc: "Heat pump hot water, reverse cycle AC, induction cooktop installation.", timeline: "Week 4-6", color: C.orange },
    { num: "04", title: "VPP ACTIVATION", desc: `Enrol in ${d.vppProvider} ${d.vppProgram}. Start earning from day one.`, timeline: "Week 6-8", color: C.aqua }
  ];
  const stepW = (CONTENT_W - 0.6) / steps.length;
  steps.forEach((s, i) => {
    const x = PAD_L + i * (stepW + 0.2);
    slide.addShape("rect", {
      x,
      y: startY,
      w: stepW,
      h: 3.5,
      fill: { color: C.cardBg },
      line: { color: s.color, width: 0.5 },
      rectRadius: 0.08
    });
    slide.addShape("rect", { x, y: startY, w: stepW, h: 0.04, fill: { color: s.color } });
    slide.addText(s.num, { x: x + 0.15, y: startY + 0.2, w: 1, h: 0.5, fontSize: 28, fontFace: F.heading, color: C.cardBorder });
    slide.addText(s.title, { x: x + 0.15, y: startY + 0.8, w: stepW - 0.3, h: 0.4, fontSize: 11, fontFace: F.heading, color: C.white, bold: true });
    slide.addText(s.desc, { x: x + 0.15, y: startY + 1.3, w: stepW - 0.3, h: 1.2, fontSize: 10, fontFace: F.body, color: C.ash });
    slide.addText(s.timeline, { x: x + 0.15, y: startY + 2.8, w: stepW - 0.3, h: 0.3, fontSize: 10, fontFace: F.label, color: s.color });
  });
  addCopyright(slide);
}
function slideConclusion(pptx, d) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  addLogo(slide);
  addSlideHeader(slide, "Conclusion", "Your Energy Future");
  const startY = 1.5;
  const outcomes = [
    { icon: "\u26A1", title: "ENERGY SAVINGS", value: `${fmtDollar(d.annualSavings)}/year`, color: C.aqua },
    { icon: "\u{1F50B}", title: "ENERGY STORAGE", value: `${d.batterySizeKwh}kWh Battery`, color: C.aqua },
    { icon: "\u2600\uFE0F", title: "SOLAR GENERATION", value: `${d.solarSizeKw}kW System`, color: C.aqua },
    { icon: "\u{1F4B0}", title: "PAYBACK PERIOD", value: `${d.paybackYears.toFixed(1)} Years`, color: C.orange }
  ];
  const cardW = (CONTENT_W - 0.6) / outcomes.length;
  outcomes.forEach((o, i) => {
    const x = PAD_L + i * (cardW + 0.2);
    slide.addShape("rect", {
      x,
      y: startY,
      w: cardW,
      h: 1.5,
      fill: { color: C.cardBg },
      line: { color: o.color, width: 0.5 },
      rectRadius: 0.08
    });
    slide.addText(o.icon, { x, y: startY + 0.1, w: cardW, h: 0.4, fontSize: 24, align: "center" });
    slide.addText(o.title, { x: x + 0.1, y: startY + 0.5, w: cardW - 0.2, h: 0.3, fontSize: 9, fontFace: F.label, color: C.ash, align: "center" });
    slide.addText(o.value, { x: x + 0.1, y: startY + 0.85, w: cardW - 0.2, h: 0.5, fontSize: 18, fontFace: F.body, color: o.color, bold: true, align: "center" });
  });
  slide.addText("Your investment in solar, battery, and electrification delivers immediate savings, long-term wealth creation, and a meaningful reduction in carbon emissions.", {
    x: PAD_L + 1,
    y: startY + 2.2,
    w: CONTENT_W - 2,
    h: 0.8,
    fontSize: 14,
    fontFace: F.heading,
    color: C.white,
    align: "center",
    bold: true
  });
  slide.addShape("rect", { x: PAD_L + 3, y: startY + 3.3, w: CONTENT_W - 6, h: 0.02, fill: { color: C.aqua } });
  slide.addText("Ready to start your energy transformation?", {
    x: PAD_L,
    y: startY + 3.5,
    w: CONTENT_W,
    h: 0.4,
    fontSize: 14,
    fontFace: F.label,
    color: C.aqua,
    align: "center"
  });
  addCopyright(slide);
}
function slideContact(pptx, d) {
  const slide = pptx.addSlide();
  slide.background = { color: C.black };
  const logoPath = path2.join(FONT_DIR, "elite-logo.jpg");
  if (fs2.existsSync(logoPath)) {
    slide.addImage({ path: logoPath, x: SLIDE_W / 2 - 0.5, y: 1, w: 1, h: 1 });
  }
  slide.addText("THANK YOU", {
    x: 0,
    y: 2.2,
    w: SLIDE_W,
    h: 0.8,
    fontSize: 42,
    fontFace: F.heading,
    color: C.white,
    bold: true,
    align: "center"
  });
  slide.addText("Let's power your future together", {
    x: 0,
    y: 2.9,
    w: SLIDE_W,
    h: 0.5,
    fontSize: 16,
    fontFace: F.label,
    color: C.aqua,
    italic: true,
    align: "center"
  });
  const contactY = 3.8;
  const contactItems = [
    { label: "PREPARED BY", value: BRAND.contact.name, sub: `${BRAND.contact.title}
${BRAND.contact.company}` },
    { label: "CONTACT", value: `${BRAND.contact.phone}
${BRAND.contact.email}`, sub: BRAND.contact.website },
    { label: "LOCATION", value: BRAND.contact.address, sub: "" }
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
  const stepsY = 5.2;
  slide.addShape("rect", {
    x: PAD_L + 2,
    y: stepsY,
    w: CONTENT_W - 4,
    h: 1.5,
    fill: { color: C.cardBg },
    line: { color: C.aqua, width: 0.5 },
    rectRadius: 0.08
  });
  slide.addText("YOUR NEXT STEPS", { x: PAD_L + 2.2, y: stepsY + 0.1, w: CONTENT_W - 4.4, h: 0.25, fontSize: 9, fontFace: F.label, color: C.aqua });
  const nextSteps = [
    "Review this proposal and discuss with your household",
    "Schedule a site assessment with Elite Smart Energy Solutions",
    "Confirm system configuration and financing options",
    "Installation and activation within 6-8 weeks"
  ];
  nextSteps.forEach((step, i) => {
    slide.addText(`${i + 1}.  ${step}`, {
      x: PAD_L + 2.4,
      y: stepsY + 0.4 + i * 0.25,
      w: CONTENT_W - 4.8,
      h: 0.25,
      fontSize: 11,
      fontFace: F.body,
      color: C.white
    });
  });
  addCopyright(slide);
}
async function generatePptx(data) {
  await ensureAssets();
  const pptx = new PptxCtor();
  pptx.author = BRAND.contact.name;
  pptx.company = BRAND.contact.company;
  pptx.title = `${data.customerName} \u2014 Solar & Battery Proposal`;
  pptx.subject = "In-Depth Bill Analysis & Solar Battery Proposal";
  pptx.layout = "LAYOUT_WIDE";
  slideCover(pptx, data);
  slideExecutiveSummary(pptx, data);
  slideBillAnalysis(pptx, data);
  slideUsageAnalysis(pptx, data);
  slideYearlyProjection(pptx, data);
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
  if (data.hasGas) {
    if (data.heatPumpSavings) slideElectrification(pptx, data, "hot_water");
    if (data.heatingCoolingSavings) slideElectrification(pptx, data, "heating");
    if (data.inductionSavings) slideElectrification(pptx, data, "induction");
  }
  if (data.hasEV) {
    slideEvAnalysis(pptx, data);
    slideEvCharger(pptx, data);
  }
  if (data.hasPoolPump && data.poolPumpSavings) {
    slidePoolHeatPump(pptx, data);
  }
  if (data.hasGas) {
    slideElectrificationInvestment(pptx, data);
  }
  slideSavingsSummary(pptx, data);
  slideFinancialSummary(pptx, data);
  slideEnvironmental(pptx, data);
  slideRoadmap(pptx, data);
  slideConclusion(pptx, data);
  slideContact(pptx, data);
  const output = await pptx.write({ outputType: "nodebuffer" });
  return output;
}

// server/pdfGenerator.ts
init_brand();
import PDFDocument from "pdfkit";
import * as fs3 from "fs";
import * as path3 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path3.dirname(__filename2);
var W = 1920;
var H = 1080;
var PAD = { l: 80, r: 60, t: 60, b: 50 };
var CW = W - PAD.l - PAD.r;
var C2 = {
  black: "#0F172A",
  aqua: "#46B446",
  orange: "#46B446",
  white: "#FFFFFF",
  ash: "#4A6B8A",
  darkGrey: "#1a1a1a",
  cardBg: "#0d0d0d",
  cardBorder: "#333333"
};
var FONT_CDN = {
  heading: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/BoSrlwmWTcqXBbDH.ttf",
  body: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/KuYDlPentRPOgmbu.otf",
  label: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/qDbgEGSyNMpWhJqi.ttf",
  labelItalic: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/yTZAvApGoYiepfBm.ttf"
};
var FONT_DIR2 = path3.join(__dirname2, "fonts");
var FONTS = {
  heading: path3.join(FONT_DIR2, "Montserrat-ExtraBold.ttf"),
  body: path3.join(FONT_DIR2, "Open Sans-Regular.otf"),
  label: path3.join(FONT_DIR2, "Montserrat-SemiBold.ttf"),
  labelItalic: path3.join(FONT_DIR2, "Montserrat-SemiBoldItalic.ttf")
};
async function ensureFonts() {
  if (!fs3.existsSync(FONT_DIR2)) fs3.mkdirSync(FONT_DIR2, { recursive: true });
  for (const [key, cdnUrl] of Object.entries(FONT_CDN)) {
    const localPath = FONTS[key];
    if (!fs3.existsSync(localPath)) {
      const resp = await fetch(cdnUrl);
      if (!resp.ok) throw new Error(`Failed to download font ${key}: ${resp.status}`);
      const buffer = Buffer.from(await resp.arrayBuffer());
      fs3.writeFileSync(localPath, buffer);
    }
  }
}
function fmt2(n, decimals = 0) {
  if (n === void 0 || n === null) return "\u2014";
  return n.toLocaleString("en-AU", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
function fmtDollar2(n) {
  if (n === void 0 || n === null) return "\u2014";
  return `$${fmt2(n)}`;
}
function fmtCents2(n) {
  if (n === void 0 || n === null) return "\u2014";
  return `${fmt2(n, 1)}c`;
}
var SlideBuilder = class {
  doc;
  data;
  constructor(data) {
    this.data = data;
    this.doc = new PDFDocument({
      size: [W, H],
      layout: "landscape",
      margin: 0,
      autoFirstPage: false,
      info: {
        Title: `${data.customerName} \u2014 Solar & Battery Proposal`,
        Author: BRAND.contact.name,
        Subject: "In-Depth Bill Analysis & Solar Battery Proposal",
        Creator: BRAND.contact.company
      }
    });
    if (fs3.existsSync(FONTS.heading)) this.doc.registerFont("Montserrat", FONTS.heading);
    if (fs3.existsSync(FONTS.body)) this.doc.registerFont("Open Sans", FONTS.body);
    if (fs3.existsSync(FONTS.label)) this.doc.registerFont("Montserrat", FONTS.label);
    if (fs3.existsSync(FONTS.labelItalic)) this.doc.registerFont("MontserratItalic", FONTS.labelItalic);
  }
  newSlide() {
    this.doc.addPage({ size: [W, H], layout: "landscape", margin: 0 });
    this.doc.rect(0, 0, W, H).fill(C2.black);
  }
  addLogo() {
    const logoPath = path3.join(FONT_DIR2, "elite-logo.jpg");
    if (fs3.existsSync(logoPath)) {
      this.doc.image(logoPath, W - 120, 30, { width: 60, height: 60 });
    }
  }
  addCopyright() {
    this.doc.font("Montserrat").fontSize(11).fillColor(C2.ash);
    this.doc.text(BRAND.contact.copyright, PAD.l, H - 40, { width: CW });
  }
  addHeader(title, subtitle) {
    this.doc.font("Montserrat").fontSize(48).fillColor(C2.white);
    this.doc.text(title.toUpperCase(), PAD.l, PAD.t, { width: CW * 0.65 });
    if (subtitle) {
      this.doc.font("MontserratItalic").fontSize(18).fillColor(C2.aqua);
      this.doc.text(subtitle, PAD.l + CW * 0.65, PAD.t + 10, { width: CW * 0.35, align: "right" });
    }
    const lineY = PAD.t + 60;
    this.doc.moveTo(PAD.l, lineY).lineTo(W - PAD.r, lineY).strokeColor(C2.aqua).lineWidth(1.5).stroke();
  }
  drawTable(x, y, w, headers, rows, colWidths) {
    const rowH = 32;
    const cols = headers.length;
    const cw = colWidths || headers.map(() => w / cols);
    this.doc.rect(x, y, w, rowH).fill(C2.darkGrey);
    let cx = x;
    for (let i = 0; i < cols; i++) {
      this.doc.font("Montserrat").fontSize(10).fillColor(C2.aqua);
      this.doc.text(headers[i], cx + 8, y + 9, { width: cw[i] - 16, align: i === 0 ? "left" : "right" });
      cx += cw[i];
    }
    let ry = y + rowH;
    for (const row of rows) {
      this.doc.moveTo(x, ry + rowH).lineTo(x + w, ry + rowH).strokeColor(C2.darkGrey).lineWidth(0.5).stroke();
      cx = x;
      for (let i = 0; i < cols; i++) {
        const color = row.colors?.[i] || C2.white;
        this.doc.font("Open Sans").fontSize(13).fillColor(color);
        this.doc.text(row.cells[i], cx + 8, ry + 8, { width: cw[i] - 16, align: i === 0 ? "left" : "right" });
        cx += cw[i];
      }
      ry += rowH;
    }
    return ry;
  }
  drawCard(x, y, w, h, borderColor) {
    this.doc.rect(x, y, w, h).fillAndStroke(C2.cardBg, borderColor || C2.cardBorder);
  }
  // ---- SLIDES ----
  slideCover() {
    this.newSlide();
    const logoPath = path3.join(FONT_DIR2, "elite-logo.jpg");
    if (fs3.existsSync(logoPath)) {
      this.doc.image(logoPath, 80, 50, { width: 60, height: 60 });
    }
    this.doc.font("Montserrat").fontSize(24).fillColor(C2.white);
    this.doc.text("ELITE SMART ENERGY SOLUTIONS", 160, 65, { width: 400 });
    this.doc.font("Montserrat").fontSize(44).fillColor(C2.white);
    this.doc.text("IN-DEPTH BILL ANALYSIS\n& SOLAR BATTERY PROPOSAL", 80, 250, { width: 700, lineGap: 10 });
    this.doc.rect(80, 480, 6, 100).fill(C2.orange);
    this.doc.font("Montserrat").fontSize(11).fillColor(C2.ash);
    this.doc.text("PREPARED FOR", 110, 480, { width: 400 });
    this.doc.font("Open Sans").fontSize(26).fillColor(C2.white);
    this.doc.text(this.data.customerName, 110, 500, { width: 500 });
    this.doc.font("Open Sans").fontSize(14).fillColor(C2.ash);
    this.doc.text(this.data.address, 110, 535, { width: 500 });
    this.doc.moveTo(80, 650).lineTo(600, 650).strokeColor(C2.aqua).lineWidth(2).stroke();
    this.doc.font("Montserrat").fontSize(11).fillColor(C2.ash);
    this.doc.text(`Prepared by ${BRAND.contact.name} \u2014 ${BRAND.contact.company}`, 80, H - 60, { width: 600 });
  }
  slideExecutiveSummary() {
    this.newSlide();
    this.addLogo();
    this.addHeader("Executive Summary", "Your Energy Transformation");
    const y = 140;
    const cardW = (CW - 60) / 2;
    const cardH = 120;
    const metrics = [
      { label: "CURRENT ANNUAL COST", value: fmtDollar2(this.data.annualCost), color: C2.orange },
      { label: "PROJECTED ANNUAL SAVINGS", value: fmtDollar2(this.data.annualSavings), color: C2.aqua },
      { label: "NET INVESTMENT", value: fmtDollar2(this.data.netInvestment), color: C2.white },
      { label: "PAYBACK PERIOD", value: `${this.data.paybackYears.toFixed(1)} Years`, color: C2.aqua }
    ];
    metrics.forEach((m, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx = PAD.l + col * (cardW + 30);
      const cy = y + row * (cardH + 20);
      this.drawCard(cx, cy, cardW, cardH, i === 1 || i === 3 ? C2.aqua : C2.cardBorder);
      this.doc.font("Montserrat").fontSize(10).fillColor(C2.ash);
      this.doc.text(m.label, cx + 20, cy + 15, { width: cardW - 40 });
      this.doc.font("Open Sans").fontSize(36).fillColor(m.color);
      this.doc.text(m.value, cx + 20, cy + 45, { width: cardW - 40 });
    });
    const sysY = y + 2 * (cardH + 20) + 20;
    this.doc.font("Montserrat").fontSize(10).fillColor(C2.ash);
    this.doc.text("RECOMMENDED SYSTEM", PAD.l, sysY, { width: CW });
    this.doc.font("Open Sans").fontSize(22).fillColor(C2.white);
    this.doc.text(`${this.data.solarSizeKw}kW Solar + ${this.data.batterySizeKwh}kWh Battery`, PAD.l, sysY + 25, { width: CW });
    this.doc.font("Open Sans").fontSize(13).fillColor(C2.ash);
    this.doc.text(`${this.data.panelBrand} Panels  \xB7  ${this.data.batteryBrand}  \xB7  ${this.data.vppProvider} VPP`, PAD.l, sysY + 55, { width: CW });
    this.addCopyright();
  }
  slideBillAnalysis() {
    this.newSlide();
    this.addLogo();
    this.addHeader("Current Bill Analysis", `${this.data.retailer} \xB7 ${this.data.state}`);
    const d = this.data;
    const y = 140;
    const halfW = CW / 2 - 20;
    this.drawTable(PAD.l, y, halfW, ["BILL OVERVIEW", ""], [
      { cells: ["Retailer", d.retailer] },
      { cells: ["Billing Period", d.billPeriodStart && d.billPeriodEnd ? `${d.billPeriodStart} \u2014 ${d.billPeriodEnd}` : "\u2014"] },
      { cells: ["Billing Days", d.billDays ? `${d.billDays} days` : "\u2014"] },
      { cells: ["Total Bill Amount", d.billTotalAmount ? fmtDollar2(d.billTotalAmount) : fmtDollar2(d.annualCost / 4)], colors: [C2.white, C2.orange] },
      { cells: ["Total Usage", d.billTotalUsageKwh ? `${fmt2(d.billTotalUsageKwh)} kWh` : `${fmt2(d.dailyUsageKwh * (d.billDays || 90))} kWh`] },
      { cells: ["Daily Average Usage", `${fmt2(d.dailyUsageKwh, 1)} kWh/day`] },
      { cells: ["Daily Average Cost", d.dailyAverageCost ? `$${fmt2(d.dailyAverageCost, 2)}/day` : "\u2014"], colors: [C2.white, C2.orange] }
    ], [halfW * 0.55, halfW * 0.45]);
    const tariffRows = [
      { cells: ["Daily Supply Charge", `${fmt2(d.supplyChargeCentsPerDay, 1)}c/day`] },
      { cells: ["Peak Rate", d.billPeakRateCents ? fmtCents2(d.billPeakRateCents) + "/kWh" : fmtCents2(d.usageRateCentsPerKwh) + "/kWh"] }
    ];
    if (d.billOffPeakRateCents) tariffRows.push({ cells: ["Off-Peak Rate", fmtCents2(d.billOffPeakRateCents) + "/kWh"] });
    if (d.billShoulderRateCents) tariffRows.push({ cells: ["Shoulder Rate", fmtCents2(d.billShoulderRateCents) + "/kWh"] });
    tariffRows.push({ cells: ["Feed-in Tariff", fmtCents2(d.feedInTariffCentsPerKwh) + "/kWh"], colors: [C2.white, C2.aqua] });
    if (d.billSolarExportsKwh) tariffRows.push({ cells: ["Solar Exports", `${fmt2(d.billSolarExportsKwh)} kWh`], colors: [C2.white, C2.aqua] });
    this.drawTable(PAD.l + halfW + 40, y, halfW, ["TARIFF RATES", ""], tariffRows, [halfW * 0.55, halfW * 0.45]);
    const annualY = y + 9 * 32 + 30;
    this.drawTable(PAD.l, annualY, CW, ["ANNUAL PROJECTIONS", "", ""], [
      { cells: ["Projected Annual Cost", fmtDollar2(d.annualCost), ""], colors: [C2.white, C2.orange, C2.white] },
      { cells: ["Monthly Usage (est.)", d.monthlyUsageKwh ? `${fmt2(d.monthlyUsageKwh)} kWh` : `${fmt2(d.dailyUsageKwh * 30)} kWh`, ""] },
      { cells: ["Yearly Usage (est.)", `${fmt2(d.annualUsageKwh)} kWh`, ""] }
    ], [CW * 0.4, CW * 0.3, CW * 0.3]);
    this.addCopyright();
  }
  slideUsageAnalysis() {
    this.newSlide();
    this.addLogo();
    this.addHeader("Usage Analysis", "Time-of-Use Breakdown");
    const d = this.data;
    const y = 140;
    const halfW = CW / 2 - 20;
    const usageRows = [];
    if (d.billPeakUsageKwh) usageRows.push({ cells: ["Peak Usage", `${fmt2(d.billPeakUsageKwh)} kWh`] });
    if (d.billOffPeakUsageKwh) usageRows.push({ cells: ["Off-Peak Usage", `${fmt2(d.billOffPeakUsageKwh)} kWh`] });
    if (d.billShoulderUsageKwh) usageRows.push({ cells: ["Shoulder Usage", `${fmt2(d.billShoulderUsageKwh)} kWh`] });
    usageRows.push({ cells: ["Daily Average", `${fmt2(d.dailyUsageKwh, 1)} kWh/day`] });
    usageRows.push({ cells: ["Monthly Average", `${fmt2(d.monthlyUsageKwh || d.dailyUsageKwh * 30)} kWh`] });
    usageRows.push({ cells: ["Annual Projection", `${fmt2(d.annualUsageKwh)} kWh`], colors: [C2.white, C2.aqua] });
    this.drawTable(PAD.l, y, halfW, ["USAGE BREAKDOWN", ""], usageRows, [halfW * 0.55, halfW * 0.45]);
    const costRows = [
      { cells: ["Annual Supply Charges", d.annualSupplyCharge ? fmtDollar2(d.annualSupplyCharge) : fmtDollar2(d.supplyChargeCentsPerDay / 100 * 365)] },
      { cells: ["Annual Usage Charges", d.annualUsageCharge ? fmtDollar2(d.annualUsageCharge) : fmtDollar2(d.annualUsageKwh * d.usageRateCentsPerKwh / 100)] }
    ];
    if (d.annualSolarCredit) costRows.push({ cells: ["Solar Feed-in Credits", `-${fmtDollar2(d.annualSolarCredit)}`], colors: [C2.white, C2.aqua] });
    costRows.push({ cells: ["Total Annual Cost", fmtDollar2(d.annualCost)], colors: [C2.white, C2.orange] });
    costRows.push({ cells: ["Monthly Average Cost", fmtDollar2(d.annualCost / 12)] });
    this.drawTable(PAD.l + halfW + 40, y, halfW, ["COST BREAKDOWN", ""], costRows, [halfW * 0.55, halfW * 0.45]);
    const totalUsage = (d.billPeakUsageKwh || 0) + (d.billOffPeakUsageKwh || 0) + (d.billShoulderUsageKwh || 0);
    if (totalUsage > 0) {
      const barY = y + 10 * 32;
      this.doc.font("Montserrat").fontSize(10).fillColor(C2.ash);
      this.doc.text("USAGE DISTRIBUTION", PAD.l, barY - 25, { width: CW });
      let barX = PAD.l;
      const barW = CW;
      const barH = 35;
      const peakPct = (d.billPeakUsageKwh || 0) / totalUsage;
      const offPeakPct = (d.billOffPeakUsageKwh || 0) / totalUsage;
      const shoulderPct = (d.billShoulderUsageKwh || 0) / totalUsage;
      if (peakPct > 0) {
        this.doc.rect(barX, barY, barW * peakPct, barH).fill(C2.orange);
        this.doc.font("Open Sans").fontSize(10).fillColor(C2.black);
        this.doc.text(`Peak ${fmt2(peakPct * 100)}%`, barX + 5, barY + 10, { width: barW * peakPct - 10 });
        barX += barW * peakPct;
      }
      if (offPeakPct > 0) {
        this.doc.rect(barX, barY, barW * offPeakPct, barH).fill(C2.aqua);
        this.doc.font("Open Sans").fontSize(10).fillColor(C2.black);
        this.doc.text(`Off-Peak ${fmt2(offPeakPct * 100)}%`, barX + 5, barY + 10, { width: barW * offPeakPct - 10 });
        barX += barW * offPeakPct;
      }
      if (shoulderPct > 0) {
        this.doc.rect(barX, barY, barW * shoulderPct, barH).fill(C2.ash);
        this.doc.font("Open Sans").fontSize(10).fillColor(C2.white);
        this.doc.text(`Shoulder ${fmt2(shoulderPct * 100)}%`, barX + 5, barY + 10, { width: barW * shoulderPct - 10 });
      }
    }
    this.addCopyright();
  }
  slideYearlyProjection() {
    this.newSlide();
    this.addLogo();
    this.addHeader("Yearly Cost Projection", "25-Year Outlook at 3.5% Inflation");
    const d = this.data;
    const y = 140;
    const years = [1, 2, 3, 5, 7, 10, 15, 20, 25];
    const projRows = years.map((yr) => {
      const withoutSolar = d.annualCost * Math.pow(1.035, yr);
      const withSolar = Math.max(0, withoutSolar - d.annualSavings);
      const savings = withoutSolar - withSolar;
      return {
        cells: [`Year ${yr}`, fmtDollar2(withoutSolar), fmtDollar2(withSolar), fmtDollar2(savings)],
        colors: [C2.white, C2.orange, C2.aqua, C2.aqua]
      };
    });
    this.drawTable(PAD.l, y, CW, ["YEAR", "WITHOUT SOLAR", "WITH SOLAR", "SAVINGS"], projRows, [CW * 0.2, CW * 0.27, CW * 0.27, CW * 0.26]);
    const summaryY = y + (projRows.length + 1) * 32 + 30;
    const cardW = CW / 3 - 20;
    [
      { label: "10-YEAR SAVINGS", value: fmtDollar2(d.tenYearSavings), color: C2.aqua },
      { label: "25-YEAR SAVINGS", value: d.twentyFiveYearSavings ? fmtDollar2(d.twentyFiveYearSavings) : fmtDollar2(d.tenYearSavings * 2.5), color: C2.aqua },
      { label: "PAYBACK PERIOD", value: `${d.paybackYears.toFixed(1)} Years`, color: C2.white }
    ].forEach((item, i) => {
      const cx = PAD.l + i * (cardW + 30);
      this.drawCard(cx, summaryY, cardW, 100, i < 2 ? C2.aqua : C2.cardBorder);
      this.doc.font("Montserrat").fontSize(10).fillColor(C2.ash);
      this.doc.text(item.label, cx + 15, summaryY + 12, { width: cardW - 30 });
      this.doc.font("Open Sans").fontSize(32).fillColor(item.color);
      this.doc.text(item.value, cx + 15, summaryY + 40, { width: cardW - 30 });
    });
    this.addCopyright();
  }
  slideGasFootprint() {
    this.newSlide();
    this.addLogo();
    this.addHeader("Current Gas Footprint", this.data.gasBillRetailer || "Gas Analysis");
    const d = this.data;
    const y = 140;
    const halfW = CW / 2 - 20;
    const gasRows = [
      { cells: ["Gas Retailer", d.gasBillRetailer || "\u2014"] },
      { cells: ["Billing Period", d.gasBillPeriodStart && d.gasBillPeriodEnd ? `${d.gasBillPeriodStart} \u2014 ${d.gasBillPeriodEnd}` : "\u2014"] },
      { cells: ["Total Bill Amount", d.gasBillTotalAmount ? fmtDollar2(d.gasBillTotalAmount) : "\u2014"], colors: [C2.white, C2.orange] },
      { cells: ["Gas Usage", d.gasBillUsageMj ? `${fmt2(d.gasBillUsageMj)} MJ` : "\u2014"] },
      { cells: ["Usage Rate", d.gasBillRateCentsMj ? `${fmt2(d.gasBillRateCentsMj, 2)}c/MJ` : "\u2014"] },
      { cells: ["Daily Supply Charge", d.gasDailySupplyCharge ? `${fmt2(d.gasDailySupplyCharge, 2)}c/day` : "\u2014"] }
    ];
    this.drawTable(PAD.l, y, halfW, ["GAS BILL DETAILS", ""], gasRows, [halfW * 0.55, halfW * 0.45]);
    const annualRows = [
      { cells: ["Annual Gas Cost", d.gasAnnualCost ? fmtDollar2(d.gasAnnualCost) : "\u2014"], colors: [C2.white, C2.orange] },
      { cells: ["Annual Usage (MJ)", d.gasAnnualMJ ? `${fmt2(d.gasAnnualMJ)} MJ` : "\u2014"] },
      { cells: ["kWh Equivalent", d.gasKwhEquivalent ? `${fmt2(d.gasKwhEquivalent)} kWh` : "\u2014"] },
      { cells: ["CO2 Emissions", d.gasCO2Emissions ? `${fmt2(d.gasCO2Emissions, 1)} kg/yr` : "\u2014"], colors: [C2.white, C2.orange] }
    ];
    this.drawTable(PAD.l + halfW + 40, y, halfW, ["ANNUAL GAS PROJECTIONS", ""], annualRows, [halfW * 0.55, halfW * 0.45]);
    this.addCopyright();
  }
  slideFinancialSummary() {
    this.newSlide();
    this.addLogo();
    this.addHeader("Financial Summary", "Investment & Returns");
    const d = this.data;
    const y = 140;
    const halfW = CW / 2 - 20;
    this.drawTable(PAD.l, y, halfW, ["INVESTMENT", ""], [
      { cells: ["Total System Cost", fmtDollar2(d.systemCost)] },
      { cells: ["Government Rebates", `-${fmtDollar2(d.rebateAmount)}`], colors: [C2.white, C2.aqua] },
      { cells: ["Net Investment", fmtDollar2(d.netInvestment)], colors: [C2.white, C2.orange] }
    ], [halfW * 0.55, halfW * 0.45]);
    this.drawTable(PAD.l + halfW + 40, y, halfW, ["PROJECTED RETURNS", ""], [
      { cells: ["Annual Benefit", fmtDollar2(d.annualSavings)], colors: [C2.white, C2.aqua] },
      { cells: ["Payback Period", `${d.paybackYears.toFixed(1)} years`] },
      { cells: ["10-Year Savings", fmtDollar2(d.tenYearSavings)], colors: [C2.white, C2.aqua] },
      { cells: ["25-Year Savings", d.twentyFiveYearSavings ? fmtDollar2(d.twentyFiveYearSavings) : fmtDollar2(d.tenYearSavings * 2.5)], colors: [C2.white, C2.aqua] }
    ], [halfW * 0.55, halfW * 0.45]);
    this.addCopyright();
  }
  slideEnvironmental() {
    this.newSlide();
    this.addLogo();
    this.addHeader("Environmental Impact", "Your Carbon Reduction");
    const d = this.data;
    const y = 140;
    const treesEquiv = d.treesEquivalent || Math.round(d.co2ReductionTonnes * 50);
    this.drawTable(PAD.l, y, CW / 2, ["ENVIRONMENTAL METRICS", ""], [
      { cells: ["Annual CO2 Reduction", `${fmt2(d.co2ReductionTonnes, 1)} tonnes`], colors: [C2.white, C2.aqua] },
      { cells: ["25-Year CO2 Reduction", `${fmt2(d.co2ReductionTonnes * 25)} tonnes`], colors: [C2.white, C2.aqua] },
      { cells: ["Trees Equivalent", `${treesEquiv} trees/year`], colors: [C2.white, C2.aqua] },
      { cells: ["Energy Independence", `${d.energyIndependenceScore || Math.min(95, Math.round(d.solarSizeKw * 4 * 365 / d.annualUsageKwh * 100))}%`], colors: [C2.white, C2.aqua] }
    ], [CW / 2 * 0.55, CW / 2 * 0.45]);
    this.addCopyright();
  }
  slideContact() {
    this.newSlide();
    const logoPath = path3.join(FONT_DIR2, "elite-logo.jpg");
    if (fs3.existsSync(logoPath)) {
      this.doc.image(logoPath, W / 2 - 50, 100, { width: 100, height: 100 });
    }
    this.doc.font("Montserrat").fontSize(52).fillColor(C2.white);
    this.doc.text("THANK YOU", 0, 240, { width: W, align: "center" });
    this.doc.font("MontserratItalic").fontSize(18).fillColor(C2.aqua);
    this.doc.text("Let's power your future together", 0, 310, { width: W, align: "center" });
    const contactY = 420;
    const colW = CW / 3;
    this.doc.font("Montserrat").fontSize(10).fillColor(C2.ash);
    this.doc.text("PREPARED BY", PAD.l, contactY, { width: colW });
    this.doc.font("Open Sans").fontSize(14).fillColor(C2.white);
    this.doc.text(BRAND.contact.name, PAD.l, contactY + 20, { width: colW });
    this.doc.font("Open Sans").fontSize(11).fillColor(C2.aqua);
    this.doc.text(`${BRAND.contact.title}
${BRAND.contact.company}`, PAD.l, contactY + 40, { width: colW });
    this.doc.font("Montserrat").fontSize(10).fillColor(C2.ash);
    this.doc.text("CONTACT", PAD.l + colW, contactY, { width: colW });
    this.doc.font("Open Sans").fontSize(14).fillColor(C2.white);
    this.doc.text(`${BRAND.contact.phone}
${BRAND.contact.email}`, PAD.l + colW, contactY + 20, { width: colW });
    this.doc.font("Open Sans").fontSize(11).fillColor(C2.aqua);
    this.doc.text(BRAND.contact.website, PAD.l + colW, contactY + 55, { width: colW });
    this.doc.font("Montserrat").fontSize(10).fillColor(C2.ash);
    this.doc.text("LOCATION", PAD.l + colW * 2, contactY, { width: colW });
    this.doc.font("Open Sans").fontSize(14).fillColor(C2.white);
    this.doc.text(BRAND.contact.address, PAD.l + colW * 2, contactY + 20, { width: colW });
    this.addCopyright();
  }
  // ---- BUILD ----
  async build() {
    const d = this.data;
    this.slideCover();
    this.slideExecutiveSummary();
    this.slideBillAnalysis();
    this.slideUsageAnalysis();
    this.slideYearlyProjection();
    if (d.hasGas) {
      this.slideGasFootprint();
    }
    this.slideFinancialSummary();
    this.slideEnvironmental();
    this.slideContact();
    this.doc.end();
    return new Promise((resolve, reject) => {
      const chunks = [];
      this.doc.on("data", (chunk) => chunks.push(chunk));
      this.doc.on("end", () => resolve(Buffer.concat(chunks)));
      this.doc.on("error", reject);
    });
  }
};
async function generatePdf(data) {
  await ensureFonts();
  const builder = new SlideBuilder(data);
  return builder.build();
}

// server/routers.ts
import { nanoid } from "nanoid";
var adminProcedure2 = publicProcedure.use(({ ctx, next }) => {
  if (false) {
    throw new TRPCError3({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});
var appRouter = router({
  system: systemRouter,
  // ============================================
  // AUTH ROUTES
  // ============================================
  auth: router({
    me: publicProcedure.query(() => ({ id: 1, name: "Public User", email: "public@elitesmartenergy.com.au", role: "admin", openId: "public", loginMethod: "public", createdAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date(), lastSignedIn: /* @__PURE__ */ new Date() })),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    })
  }),
  // ============================================
  // CUSTOMER ROUTES
  // ============================================
  customers: router({
    list: publicProcedure.input(z2.object({ search: z2.string().optional() }).optional()).query(async ({ ctx, input }) => {
      return searchCustomers(1, input?.search);
    }),
    get: publicProcedure.input(z2.object({ id: z2.number() })).query(async ({ ctx, input }) => {
      const customer = await getCustomerById(input.id);
      if (!customer) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Customer not found" });
      }
      return customer;
    }),
    create: publicProcedure.input(z2.object({
      fullName: z2.string().min(1),
      email: z2.string().email().optional(),
      phone: z2.string().optional(),
      address: z2.string().min(1),
      state: z2.string().min(2).max(3),
      hasSolarNew: z2.boolean().optional(),
      hasSolarOld: z2.boolean().optional(),
      gasAppliances: z2.array(z2.string()).optional(),
      hasPool: z2.boolean().optional(),
      poolVolume: z2.number().optional(),
      hasEV: z2.boolean().optional(),
      evInterest: z2.enum(["none", "interested", "owns"]).optional(),
      hasExistingSolar: z2.boolean().optional(),
      existingSolarSize: z2.number().optional(),
      existingSolarAge: z2.number().optional(),
      notes: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const id = await createCustomer({
        ...input,
        userId: 1,
        existingSolarSize: input.existingSolarSize?.toString()
      });
      return { id };
    }),
    update: publicProcedure.input(z2.object({
      id: z2.number(),
      fullName: z2.string().min(1).optional(),
      email: z2.string().email().optional(),
      phone: z2.string().optional(),
      address: z2.string().min(1).optional(),
      state: z2.string().min(2).max(3).optional(),
      hasSolarNew: z2.boolean().optional(),
      hasSolarOld: z2.boolean().optional(),
      gasAppliances: z2.array(z2.string()).optional(),
      hasPool: z2.boolean().optional(),
      poolVolume: z2.number().optional(),
      hasEV: z2.boolean().optional(),
      evInterest: z2.enum(["none", "interested", "owns"]).optional(),
      hasExistingSolar: z2.boolean().optional(),
      existingSolarSize: z2.number().optional(),
      existingSolarAge: z2.number().optional(),
      notes: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await updateCustomer(id, {
        ...data,
        existingSolarSize: data.existingSolarSize?.toString()
      });
      return { success: true };
    }),
    delete: publicProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      await deleteCustomer(input.id);
      return { success: true };
    })
  }),
  // ============================================
  // BILL ROUTES
  // ============================================
  bills: router({
    listByCustomer: publicProcedure.input(z2.object({ customerId: z2.number() })).query(async ({ ctx, input }) => {
      return getBillsByCustomerId(input.customerId);
    }),
    get: publicProcedure.input(z2.object({ id: z2.number() })).query(async ({ ctx, input }) => {
      const bill = await getBillById(input.id);
      if (!bill) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Bill not found" });
      }
      return bill;
    }),
    upload: publicProcedure.input(z2.object({
      customerId: z2.number(),
      billType: z2.enum(["electricity", "gas"]),
      fileData: z2.string(),
      // Base64 encoded
      fileName: z2.string()
    })).mutation(async ({ ctx, input }) => {
      const fileBuffer = Buffer.from(input.fileData, "base64");
      const fileKey = `bills/${input.customerId}/${nanoid()}-${input.fileName}`;
      const { url: fileUrl } = await storagePut(fileKey, fileBuffer, "application/pdf");
      const billId = await createBill({
        customerId: input.customerId,
        billType: input.billType,
        fileUrl,
        fileKey,
        fileName: input.fileName
      });
      return { id: billId, fileUrl };
    }),
    extract: publicProcedure.input(z2.object({ billId: z2.number() })).mutation(async ({ ctx, input }) => {
      const bill = await getBillById(input.billId);
      if (!bill || !bill.fileUrl) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Bill not found or no file uploaded" });
      }
      try {
        if (bill.billType === "electricity") {
          const data = await extractElectricityBillData(bill.fileUrl);
          const validation = validateElectricityBillData(data);
          await updateBill(input.billId, {
            retailer: data.retailer,
            billingPeriodStart: data.billingPeriodStart ? new Date(data.billingPeriodStart) : void 0,
            billingPeriodEnd: data.billingPeriodEnd ? new Date(data.billingPeriodEnd) : void 0,
            billingDays: data.billingDays,
            totalAmount: data.totalAmount?.toString(),
            dailySupplyCharge: data.dailySupplyCharge?.toString(),
            totalUsageKwh: data.totalUsageKwh?.toString(),
            peakUsageKwh: data.peakUsageKwh?.toString(),
            offPeakUsageKwh: data.offPeakUsageKwh?.toString(),
            shoulderUsageKwh: data.shoulderUsageKwh?.toString(),
            solarExportsKwh: data.solarExportsKwh?.toString(),
            peakRateCents: data.peakRateCents?.toString(),
            offPeakRateCents: data.offPeakRateCents?.toString(),
            shoulderRateCents: data.shoulderRateCents?.toString(),
            feedInTariffCents: data.feedInTariffCents?.toString(),
            rawExtractedData: data.rawData,
            extractionConfidence: data.extractionConfidence?.toString()
          });
          return { success: true, data, validation };
        } else {
          const data = await extractGasBillData(bill.fileUrl);
          const validation = validateGasBillData(data);
          await updateBill(input.billId, {
            retailer: data.retailer,
            billingPeriodStart: data.billingPeriodStart ? new Date(data.billingPeriodStart) : void 0,
            billingPeriodEnd: data.billingPeriodEnd ? new Date(data.billingPeriodEnd) : void 0,
            billingDays: data.billingDays,
            totalAmount: data.totalAmount?.toString(),
            dailySupplyCharge: data.dailySupplyCharge?.toString(),
            gasUsageMj: data.gasUsageMj?.toString(),
            gasRateCentsMj: data.gasRateCentsMj?.toString(),
            rawExtractedData: data.rawData,
            extractionConfidence: data.extractionConfidence?.toString()
          });
          return { success: true, data, validation };
        }
      } catch (error) {
        throw new TRPCError3({
          code: "INTERNAL_SERVER_ERROR",
          message: `Extraction failed: ${error instanceof Error ? error.message : "Unknown error"}`
        });
      }
    }),
    update: publicProcedure.input(z2.object({
      id: z2.number(),
      retailer: z2.string().optional(),
      billingDays: z2.number().optional(),
      totalAmount: z2.number().optional(),
      dailySupplyCharge: z2.number().optional(),
      totalUsageKwh: z2.number().optional(),
      peakUsageKwh: z2.number().optional(),
      offPeakUsageKwh: z2.number().optional(),
      shoulderUsageKwh: z2.number().optional(),
      solarExportsKwh: z2.number().optional(),
      peakRateCents: z2.number().optional(),
      offPeakRateCents: z2.number().optional(),
      shoulderRateCents: z2.number().optional(),
      feedInTariffCents: z2.number().optional(),
      gasUsageMj: z2.number().optional(),
      gasRateCentsMj: z2.number().optional()
    })).mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const updateData = {};
      for (const [key, value] of Object.entries(data)) {
        if (value !== void 0) {
          updateData[key] = typeof value === "number" ? value.toString() : value;
        }
      }
      await updateBill(id, updateData);
      return { success: true };
    }),
    delete: publicProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      await deleteBill(input.id);
      return { success: true };
    })
  }),
  // ============================================
  // PROPOSAL ROUTES
  // ============================================
  proposals: router({
    list: publicProcedure.input(z2.object({
      status: z2.string().optional(),
      search: z2.string().optional()
    }).optional()).query(async ({ ctx, input }) => {
      return searchProposals(1, input);
    }),
    get: publicProcedure.input(z2.object({ id: z2.number() })).query(async ({ ctx, input }) => {
      const proposal = await getProposalById(input.id);
      if (!proposal) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Proposal not found" });
      }
      return proposal;
    }),
    getByCustomer: publicProcedure.input(z2.object({ customerId: z2.number() })).query(async ({ ctx, input }) => {
      return getProposalsByCustomerId(input.customerId);
    }),
    create: publicProcedure.input(z2.object({
      customerId: z2.number(),
      title: z2.string().optional(),
      electricityBillId: z2.number().optional(),
      gasBillId: z2.number().optional()
    })).mutation(async ({ ctx, input }) => {
      const customer = await getCustomerById(input.customerId);
      if (!customer) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Customer not found" });
      }
      const id = await createProposal({
        customerId: input.customerId,
        userId: 1,
        title: input.title || `Proposal for ${customer.fullName}`,
        electricityBillId: input.electricityBillId,
        gasBillId: input.gasBillId,
        status: "draft"
      });
      if (input.electricityBillId) {
        try {
          const electricityBill = await getBillById(input.electricityBillId);
          if (electricityBill) {
            let gasBill = null;
            if (input.gasBillId) {
              gasBill = await getBillById(input.gasBillId);
            }
            const vppProviders2 = await getVppProvidersByState(customer.state);
            const rebates = await getRebatesByState(customer.state);
            const calculations = generateFullCalculations(customer, electricityBill, gasBill ?? null, vppProviders2, rebates);
            const proposalData = buildProposalData(customer, calculations, !!input.gasBillId);
            const slides = generateSlides(proposalData);
            const slideData = slides.map((s, i) => ({
              slideNumber: i + 1,
              slideType: s.type,
              title: s.title,
              isConditional: false,
              isIncluded: true,
              content: s
            }));
            await updateProposal(id, {
              calculations,
              slidesData: slideData,
              slideCount: slideData.length,
              status: "generated"
            });
          }
        } catch (e) {
          console.error("Auto-generate failed:", e);
        }
      }
      return { id };
    }),
    calculate: publicProcedure.input(z2.object({ proposalId: z2.number() })).mutation(async ({ ctx, input }) => {
      const proposal = await getProposalById(input.proposalId);
      if (!proposal) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Proposal not found" });
      }
      const customer = await getCustomerById(proposal.customerId);
      if (!customer) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Customer not found" });
      }
      if (!proposal.electricityBillId) {
        throw new TRPCError3({ code: "BAD_REQUEST", message: "Electricity bill required for calculations" });
      }
      const electricityBill = await getBillById(proposal.electricityBillId);
      if (!electricityBill) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Electricity bill not found" });
      }
      let gasBill = null;
      if (proposal.gasBillId) {
        gasBill = await getBillById(proposal.gasBillId);
      }
      const vppProviders2 = await getVppProvidersByState(customer.state);
      const rebates = await getRebatesByState(customer.state);
      await updateProposal(input.proposalId, { status: "calculating" });
      try {
        const calculations = generateFullCalculations(
          customer,
          electricityBill,
          gasBill ?? null,
          vppProviders2,
          rebates
        );
        await updateProposal(input.proposalId, {
          calculations,
          status: "draft"
        });
        return { success: true, calculations };
      } catch (error) {
        await updateProposal(input.proposalId, { status: "draft" });
        throw new TRPCError3({
          code: "INTERNAL_SERVER_ERROR",
          message: `Calculation failed: ${error instanceof Error ? error.message : "Unknown error"}`
        });
      }
    }),
    generate: publicProcedure.input(z2.object({ proposalId: z2.number() })).mutation(async ({ ctx, input }) => {
      let proposal = await getProposalById(input.proposalId);
      if (!proposal) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Proposal not found" });
      }
      const customer = await getCustomerById(proposal.customerId);
      if (!customer) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Customer not found" });
      }
      if (!proposal.calculations) {
        if (!proposal.electricityBillId) {
          throw new TRPCError3({ code: "BAD_REQUEST", message: "Electricity bill required for calculations" });
        }
        const electricityBill = await getBillById(proposal.electricityBillId);
        if (!electricityBill) {
          throw new TRPCError3({ code: "NOT_FOUND", message: "Electricity bill not found" });
        }
        let gasBill = null;
        if (proposal.gasBillId) {
          gasBill = await getBillById(proposal.gasBillId);
        }
        const vppProviders2 = await getVppProvidersByState(customer.state);
        const rebates = await getRebatesByState(customer.state);
        const calculations = generateFullCalculations(customer, electricityBill, gasBill ?? null, vppProviders2, rebates);
        await updateProposal(input.proposalId, { calculations, status: "draft" });
        proposal = await getProposalById(input.proposalId);
        if (!proposal) {
          throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Failed to reload proposal after calculation" });
        }
      }
      const slidesData = generateSlidesData(customer, proposal.calculations, proposal.gasBillId !== null);
      await updateProposal(input.proposalId, {
        slidesData,
        slideCount: slidesData.filter((s) => s.isIncluded).length,
        status: "generated"
      });
      return { success: true, slideCount: slidesData.filter((s) => s.isIncluded).length };
    }),
    update: publicProcedure.input(z2.object({
      id: z2.number(),
      title: z2.string().optional(),
      status: z2.enum(["draft", "calculating", "generated", "exported", "archived"]).optional(),
      electricityBillId: z2.number().optional(),
      gasBillId: z2.number().optional()
    })).mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await updateProposal(id, data);
      return { success: true };
    }),
    delete: publicProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      await softDeleteProposal(input.id);
      return { success: true };
    }),
    // Bin endpoints
    getBinItems: publicProcedure.query(async ({ ctx }) => {
      return getDeletedProposals(1);
    }),
    restore: publicProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      await restoreProposal(input.id);
      return { success: true };
    }),
    permanentDelete: publicProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      await permanentlyDeleteProposal(input.id);
      return { success: true };
    }),
    emptyBin: publicProcedure.mutation(async ({ ctx }) => {
      const deleted = await getDeletedProposals(1);
      for (const item of deleted) {
        await permanentlyDeleteProposal(item.id);
      }
      return { success: true, count: deleted.length };
    }),
    getSlideHtml: publicProcedure.input(z2.object({
      proposalId: z2.number(),
      slideIndex: z2.number().optional()
    })).query(async ({ ctx, input }) => {
      let proposal = await getProposalById(input.proposalId);
      if (!proposal) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Proposal not found" });
      }
      const customer = await getCustomerById(proposal.customerId);
      if (!customer) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Customer not found" });
      }
      if (!proposal.calculations) {
        if (!proposal.electricityBillId) {
          throw new TRPCError3({ code: "BAD_REQUEST", message: "Electricity bill required for calculations" });
        }
        const electricityBill = await getBillById(proposal.electricityBillId);
        if (!electricityBill) {
          throw new TRPCError3({ code: "NOT_FOUND", message: "Electricity bill not found" });
        }
        let gasBill = null;
        if (proposal.gasBillId) {
          gasBill = await getBillById(proposal.gasBillId);
        }
        const vppProviders2 = await getVppProvidersByState(customer.state);
        const rebates = await getRebatesByState(customer.state);
        const calculations = generateFullCalculations(customer, electricityBill, gasBill ?? null, vppProviders2, rebates);
        await updateProposal(input.proposalId, { calculations, status: "draft" });
        proposal = await getProposalById(input.proposalId);
        if (!proposal) {
          throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Failed to reload proposal after calculation" });
        }
      }
      const calc = proposal.calculations;
      const proposalData = buildProposalData(customer, calc, !!proposal.gasBillId);
      const slides = generateSlides(proposalData);
      if (input.slideIndex !== void 0) {
        const slide = slides[input.slideIndex];
        if (!slide) {
          throw new TRPCError3({ code: "NOT_FOUND", message: "Slide not found" });
        }
        return {
          html: generateSlideHTML(slide),
          slide,
          totalSlides: slides.length
        };
      }
      return {
        slides: slides.map((s) => ({
          ...s,
          html: generateSlideHTML(s)
        })),
        totalSlides: slides.length
      };
    }),
    export: publicProcedure.input(z2.object({
      proposalId: z2.number(),
      format: z2.enum(["html", "json"])
    })).mutation(async ({ ctx, input }) => {
      const proposal = await getProposalById(input.proposalId);
      if (!proposal) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Proposal not found" });
      }
      const customer = await getCustomerById(proposal.customerId);
      if (!customer) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Customer not found" });
      }
      const slidesData = proposal.slidesData;
      if (!slidesData || slidesData.length === 0) {
        throw new TRPCError3({ code: "BAD_REQUEST", message: "Proposal has no slides generated" });
      }
      if (input.format === "json") {
        return {
          success: true,
          data: {
            customer: {
              name: customer.fullName,
              address: customer.address,
              state: customer.state
            },
            slides: slidesData,
            calculations: proposal.calculations
          }
        };
      }
      const { generateFullPresentationHtml: generateFullPresentationHtml2 } = await Promise.resolve().then(() => (init_proposalExport(), proposalExport_exports));
      const html = generateFullPresentationHtml2(slidesData, {
        format: "pdf",
        includeConditionalSlides: false,
        customerName: customer.fullName,
        customerAddress: customer.address || ""
      });
      const fileName = `proposal-${proposal.id}-${Date.now()}.html`;
      const { url } = await storagePut(`exports/${fileName}`, html, "text/html");
      await updateProposal(input.proposalId, { status: "exported" });
      return {
        success: true,
        fileUrl: url,
        fileName
      };
    }),
    exportPdf: publicProcedure.input(z2.object({
      proposalId: z2.number()
    })).mutation(async ({ ctx, input }) => {
      let proposal = await getProposalById(input.proposalId);
      if (!proposal) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Proposal not found" });
      }
      const customer = await getCustomerById(proposal.customerId);
      if (!customer) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Customer not found" });
      }
      if (!proposal.calculations) {
        if (!proposal.electricityBillId) {
          throw new TRPCError3({ code: "BAD_REQUEST", message: "Electricity bill required for calculations" });
        }
        const electricityBill = await getBillById(proposal.electricityBillId);
        if (!electricityBill) {
          throw new TRPCError3({ code: "NOT_FOUND", message: "Electricity bill not found" });
        }
        let gasBill = null;
        if (proposal.gasBillId) {
          gasBill = await getBillById(proposal.gasBillId);
        }
        const vppProviders2 = await getVppProvidersByState(customer.state);
        const rebates = await getRebatesByState(customer.state);
        const calculations = generateFullCalculations(customer, electricityBill, gasBill ?? null, vppProviders2, rebates);
        await updateProposal(input.proposalId, { calculations, status: "draft" });
        proposal = await getProposalById(input.proposalId);
        if (!proposal) {
          throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Failed to reload proposal after calculation" });
        }
      }
      const calc = proposal.calculations;
      const proposalData = buildProposalData(customer, calc, !!proposal.gasBillId);
      const slides = generateSlides(proposalData);
      const { generateProposalPdf: generateProposalPdf2 } = await Promise.resolve().then(() => (init_pdfExport(), pdfExport_exports));
      const pdfBuffer = await generateProposalPdf2(
        slides.map((s) => ({
          title: s.title,
          subtitle: s.subtitle,
          content: generateSlideHTML(s),
          type: s.type
        })),
        customer.fullName,
        proposal.title || "Electrification Proposal"
      );
      const fileName = `proposal-${proposal.id}-${customer.fullName.replace(/\s+/g, "_")}-${Date.now()}.pdf`;
      const { url } = await storagePut(`exports/${fileName}`, pdfBuffer, "application/pdf");
      await updateProposal(input.proposalId, { status: "exported" });
      return {
        success: true,
        fileUrl: url,
        fileName
      };
    }),
    // Export as native PowerPoint (.pptx) with embedded brand fonts
    exportPptx: publicProcedure.input(z2.object({
      proposalId: z2.number()
    })).mutation(async ({ ctx, input }) => {
      let proposal = await getProposalById(input.proposalId);
      if (!proposal) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Proposal not found" });
      }
      const customer = await getCustomerById(proposal.customerId);
      if (!customer) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Customer not found" });
      }
      if (!proposal.calculations) {
        if (!proposal.electricityBillId) {
          throw new TRPCError3({ code: "BAD_REQUEST", message: "Electricity bill required for calculations" });
        }
        const electricityBill = await getBillById(proposal.electricityBillId);
        if (!electricityBill) {
          throw new TRPCError3({ code: "NOT_FOUND", message: "Electricity bill not found" });
        }
        let gasBill = null;
        if (proposal.gasBillId) {
          gasBill = await getBillById(proposal.gasBillId);
        }
        const vppProviders2 = await getVppProvidersByState(customer.state);
        const rebates = await getRebatesByState(customer.state);
        const calculations = generateFullCalculations(customer, electricityBill, gasBill ?? null, vppProviders2, rebates);
        await updateProposal(input.proposalId, { calculations, status: "draft" });
        proposal = await getProposalById(input.proposalId);
        if (!proposal) {
          throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Failed to reload proposal after calculation" });
        }
      }
      const calc = proposal.calculations;
      const proposalData = buildProposalData(customer, calc, !!proposal.gasBillId);
      const pptxBuffer = await generatePptx(proposalData);
      const fileName = `proposal-${proposal.id}-${customer.fullName.replace(/\s+/g, "_")}-${Date.now()}.pptx`;
      const { url } = await storagePut(`exports/${fileName}`, pptxBuffer, "application/vnd.openxmlformats-officedocument.presentationml.presentation");
      await updateProposal(input.proposalId, { status: "exported" });
      return {
        success: true,
        fileUrl: url,
        fileName
      };
    }),
    // Export as native PDF with embedded brand fonts (no HTML/Puppeteer)
    exportNativePdf: publicProcedure.input(z2.object({
      proposalId: z2.number()
    })).mutation(async ({ ctx, input }) => {
      let proposal = await getProposalById(input.proposalId);
      if (!proposal) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Proposal not found" });
      }
      const customer = await getCustomerById(proposal.customerId);
      if (!customer) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Customer not found" });
      }
      if (!proposal.calculations) {
        if (!proposal.electricityBillId) {
          throw new TRPCError3({ code: "BAD_REQUEST", message: "Electricity bill required for calculations" });
        }
        const electricityBill = await getBillById(proposal.electricityBillId);
        if (!electricityBill) {
          throw new TRPCError3({ code: "NOT_FOUND", message: "Electricity bill not found" });
        }
        let gasBill = null;
        if (proposal.gasBillId) {
          gasBill = await getBillById(proposal.gasBillId);
        }
        const vppProviders2 = await getVppProvidersByState(customer.state);
        const rebates = await getRebatesByState(customer.state);
        const calculations = generateFullCalculations(customer, electricityBill, gasBill ?? null, vppProviders2, rebates);
        await updateProposal(input.proposalId, { calculations, status: "draft" });
        proposal = await getProposalById(input.proposalId);
        if (!proposal) {
          throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Failed to reload proposal after calculation" });
        }
      }
      const calc = proposal.calculations;
      const proposalData = buildProposalData(customer, calc, !!proposal.gasBillId);
      const pdfBuffer = await generatePdf(proposalData);
      const fileName = `proposal-${proposal.id}-${customer.fullName.replace(/\s+/g, "_")}-${Date.now()}.pdf`;
      const { url } = await storagePut(`exports/${fileName}`, pdfBuffer, "application/pdf");
      await updateProposal(input.proposalId, { status: "exported" });
      return {
        success: true,
        fileUrl: url,
        fileName
      };
    }),
    generateSlideContent: publicProcedure.input(z2.object({
      proposalId: z2.number()
    })).mutation(async ({ ctx, input }) => {
      let proposal = await getProposalById(input.proposalId);
      if (!proposal) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Proposal not found" });
      }
      const customer = await getCustomerById(proposal.customerId);
      if (!customer) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Customer not found" });
      }
      if (!proposal.calculations) {
        if (!proposal.electricityBillId) {
          throw new TRPCError3({ code: "BAD_REQUEST", message: "Electricity bill required for calculations" });
        }
        const electricityBill = await getBillById(proposal.electricityBillId);
        if (!electricityBill) {
          throw new TRPCError3({ code: "NOT_FOUND", message: "Electricity bill not found" });
        }
        let gasBill = null;
        if (proposal.gasBillId) {
          gasBill = await getBillById(proposal.gasBillId);
        }
        const vppProviders2 = await getVppProvidersByState(customer.state);
        const rebates = await getRebatesByState(customer.state);
        const calculations = generateFullCalculations(customer, electricityBill, gasBill ?? null, vppProviders2, rebates);
        await updateProposal(input.proposalId, { calculations, status: "draft" });
        proposal = await getProposalById(input.proposalId);
        if (!proposal) {
          throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Failed to reload proposal after calculation" });
        }
      }
      const calc = proposal.calculations;
      const { generateSlideContentMarkdown: generateSlideContentMarkdown2 } = await Promise.resolve().then(() => (init_slideContentGenerator(), slideContentGenerator_exports));
      const markdown = generateSlideContentMarkdown2({
        customer,
        calculations: calc,
        proposalTitle: proposal.title || void 0
      });
      const fileName = `slide-content-${proposal.id}-${customer.fullName.replace(/\s+/g, "_")}-${Date.now()}.md`;
      const { url } = await storagePut(`slide-content/${fileName}`, Buffer.from(markdown, "utf-8"), "text/markdown");
      return {
        success: true,
        markdown,
        fileUrl: url,
        fileName,
        slideCount: (markdown.match(/^# Slide \d+:/gm) || []).length
      };
    })
  }),
  // ============================================
  // VPP PROVIDER ROUTES
  // ============================================
  vppProviders: router({
    list: publicProcedure.query(async () => {
      return getAllVppProviders();
    }),
    listByState: publicProcedure.input(z2.object({ state: z2.string() })).query(async ({ input }) => {
      return getVppProvidersByState(input.state);
    })
  }),
  // ============================================
  // REBATES ROUTES
  // ============================================
  rebates: router({
    listByState: publicProcedure.input(z2.object({ state: z2.string() })).query(async ({ input }) => {
      return getRebatesByState(input.state);
    })
  }),
  // ============================================
  // CUSTOMER DOCUMENTS ROUTES
  // ============================================
  documents: router({
    list: publicProcedure.input(z2.object({ customerId: z2.number() })).query(async ({ input }) => {
      return getDocumentsByCustomerId(input.customerId);
    }),
    listByType: publicProcedure.input(z2.object({
      customerId: z2.number(),
      documentType: z2.enum([
        "switchboard_photo",
        "meter_photo",
        "roof_photo",
        "property_photo",
        "solar_proposal_pdf",
        "other"
      ])
    })).query(async ({ input }) => {
      return getDocumentsByType(input.customerId, input.documentType);
    }),
    get: publicProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
      return getDocumentById(input.id);
    }),
    upload: publicProcedure.input(z2.object({
      customerId: z2.number(),
      documentType: z2.enum([
        "switchboard_photo",
        "meter_photo",
        "roof_photo",
        "property_photo",
        "solar_proposal_pdf",
        "other"
      ]),
      fileData: z2.string(),
      // Base64 encoded file data
      fileName: z2.string(),
      mimeType: z2.string(),
      description: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const buffer = Buffer.from(input.fileData, "base64");
      const fileKey = `documents/${input.customerId}/${nanoid()}-${input.fileName}`;
      const { url } = await storagePut(fileKey, buffer, input.mimeType);
      const docId = await createCustomerDocument({
        customerId: input.customerId,
        userId: 1,
        documentType: input.documentType,
        fileUrl: url,
        fileKey,
        fileName: input.fileName,
        fileSize: buffer.length,
        mimeType: input.mimeType,
        description: input.description
      });
      return {
        success: true,
        documentId: docId,
        fileUrl: url
      };
    }),
    update: publicProcedure.input(z2.object({
      id: z2.number(),
      description: z2.string().optional(),
      extractedData: z2.any().optional()
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateCustomerDocument(id, data);
      return { success: true };
    }),
    delete: publicProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      await deleteCustomerDocument(input.id);
      return { success: true };
    }),
    analyzeSwitchboard: publicProcedure.input(z2.object({ documentId: z2.number() })).mutation(async ({ input }) => {
      const doc = await getDocumentById(input.documentId);
      if (!doc) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Document not found" });
      }
      if (doc.documentType !== "switchboard_photo") {
        throw new TRPCError3({ code: "BAD_REQUEST", message: "Document is not a switchboard photo" });
      }
      const { analyzeSwitchboardPhoto: analyzeSwitchboardPhoto2, generateSwitchboardReport: generateSwitchboardReport2 } = await Promise.resolve().then(() => (init_switchboardAnalysis(), switchboardAnalysis_exports));
      const analysis = await analyzeSwitchboardPhoto2(doc.fileUrl);
      const report = generateSwitchboardReport2(analysis);
      await updateCustomerDocument(input.documentId, {
        extractedData: JSON.stringify(analysis),
        description: report
      });
      return {
        success: true,
        analysis,
        report
      };
    })
  }),
  // ============================================
  // ADMIN ROUTES
  // ============================================
  admin: router({
    seedVppProviders: adminProcedure2.mutation(async () => {
      const providers = [
        { name: "ENGIE", programName: "VPP Advantage", availableStates: ["VIC", "NSW", "SA", "QLD"], hasGasBundle: true, dailyCredit: 0.5, eventPayment: 10, estimatedEventsPerYear: 12, bundleDiscount: 100 },
        { name: "Origin", programName: "Loop VPP", availableStates: ["VIC", "NSW", "SA", "QLD", "ACT"], hasGasBundle: true, dailyCredit: 0.4, eventPayment: 8, estimatedEventsPerYear: 15, bundleDiscount: 80 },
        { name: "AGL", programName: "Night Saver", availableStates: ["VIC", "NSW", "SA", "QLD"], hasGasBundle: true, dailyCredit: 0.45, eventPayment: 12, estimatedEventsPerYear: 10, bundleDiscount: 120 },
        { name: "Amber Electric", programName: "SmartShift", availableStates: ["VIC", "NSW", "SA", "QLD", "ACT"], hasGasBundle: false, dailyCredit: 0.6, eventPayment: 15, estimatedEventsPerYear: 8, bundleDiscount: 0 },
        { name: "Simply Energy", programName: "VPP Access", availableStates: ["VIC", "SA"], hasGasBundle: true, dailyCredit: 0.35, eventPayment: 8, estimatedEventsPerYear: 12, bundleDiscount: 90 },
        { name: "Energy Locals", programName: "Community VPP", availableStates: ["VIC", "NSW", "SA", "QLD"], hasGasBundle: false, dailyCredit: 0.55, eventPayment: 10, estimatedEventsPerYear: 10, bundleDiscount: 0 },
        { name: "Powershop", programName: "Powerbank", availableStates: ["VIC", "NSW", "SA", "QLD"], hasGasBundle: false, dailyCredit: 0.45, eventPayment: 9, estimatedEventsPerYear: 12, bundleDiscount: 0 },
        { name: "Red Energy", programName: "VPP Program", availableStates: ["VIC", "NSW", "SA", "QLD"], hasGasBundle: true, dailyCredit: 0.4, eventPayment: 10, estimatedEventsPerYear: 10, bundleDiscount: 75 },
        { name: "Momentum Energy", programName: "Battery Saver", availableStates: ["VIC", "SA"], hasGasBundle: true, dailyCredit: 0.38, eventPayment: 8, estimatedEventsPerYear: 12, bundleDiscount: 60 },
        { name: "Lumo Energy", programName: "VPP Rewards", availableStates: ["VIC", "NSW", "SA", "QLD"], hasGasBundle: true, dailyCredit: 0.42, eventPayment: 9, estimatedEventsPerYear: 11, bundleDiscount: 70 },
        { name: "Alinta Energy", programName: "Home Battery", availableStates: ["VIC", "NSW", "SA", "QLD", "WA"], hasGasBundle: true, dailyCredit: 0.48, eventPayment: 11, estimatedEventsPerYear: 10, bundleDiscount: 85 },
        { name: "Tango Energy", programName: "VPP Connect", availableStates: ["VIC"], hasGasBundle: true, dailyCredit: 0.52, eventPayment: 12, estimatedEventsPerYear: 10, bundleDiscount: 95 },
        { name: "GloBird Energy", programName: "Battery Boost", availableStates: ["VIC", "NSW", "SA", "QLD"], hasGasBundle: false, dailyCredit: 0.58, eventPayment: 14, estimatedEventsPerYear: 8, bundleDiscount: 0 }
      ];
      for (const provider of providers) {
        await upsertVppProvider({
          ...provider,
          dailyCredit: provider.dailyCredit.toString(),
          eventPayment: provider.eventPayment.toString(),
          bundleDiscount: provider.bundleDiscount.toString()
        });
      }
      return { success: true, count: providers.length };
    }),
    seedRebates: adminProcedure2.mutation(async () => {
      const rebates = [
        // Victoria
        { state: "VIC", rebateType: "solar", name: "Solar Homes Program", amount: 1400, isPercentage: false },
        { state: "VIC", rebateType: "battery", name: "Solar Battery Rebate", amount: 2950, isPercentage: false },
        { state: "VIC", rebateType: "heat_pump_hw", name: "Hot Water Rebate", amount: 1e3, isPercentage: false },
        { state: "VIC", rebateType: "heat_pump_ac", name: "VEU Certificates", amount: 1200, isPercentage: false },
        // NSW
        { state: "NSW", rebateType: "battery", name: "Empowering Homes", amount: 2400, isPercentage: false },
        { state: "NSW", rebateType: "heat_pump_hw", name: "Energy Savings Scheme", amount: 800, isPercentage: false },
        // SA
        { state: "SA", rebateType: "battery", name: "Home Battery Scheme", amount: 2e3, isPercentage: false },
        { state: "SA", rebateType: "heat_pump_hw", name: "REPS Hot Water", amount: 700, isPercentage: false },
        // QLD
        { state: "QLD", rebateType: "battery", name: "Battery Booster", amount: 3e3, isPercentage: false },
        { state: "QLD", rebateType: "heat_pump_hw", name: "Climate Smart Homes", amount: 1e3, isPercentage: false }
      ];
      for (const rebate of rebates) {
        await upsertStateRebate({
          ...rebate,
          amount: rebate.amount.toString(),
          isActive: true
        });
      }
      return { success: true, count: rebates.length };
    })
  })
});
function buildProposalData(customer, calc, hasGas, hasSolarNew, hasSolarOld) {
  const vppName = typeof calc.selectedVppProvider === "object" ? calc.selectedVppProvider?.name || "ENGIE" : calc.selectedVppProvider || "ENGIE";
  const vppProgram = typeof calc.selectedVppProvider === "object" ? calc.selectedVppProvider?.programName || "VPP Advantage" : "VPP Advantage";
  return {
    customerName: customer.fullName,
    address: customer.address || "",
    state: customer.state,
    retailer: calc.billRetailer || "Current Retailer",
    dailyUsageKwh: calc.dailyAverageKwh || 0,
    annualUsageKwh: calc.yearlyUsageKwh || 0,
    supplyChargeCentsPerDay: (calc.billDailySupplyCharge || 1.2) * 100,
    usageRateCentsPerKwh: calc.billPeakRateCents || 30,
    feedInTariffCentsPerKwh: calc.billFeedInTariffCents || 5,
    controlledLoadRateCentsPerKwh: calc.billOffPeakRateCents,
    annualCost: calc.projectedAnnualCost || 0,
    billPeriodStart: calc.billPeriodStart,
    billPeriodEnd: calc.billPeriodEnd,
    billDays: calc.billDays,
    billTotalAmount: calc.billTotalAmount,
    billTotalUsageKwh: calc.billTotalUsageKwh,
    billPeakUsageKwh: calc.billPeakUsageKwh,
    billOffPeakUsageKwh: calc.billOffPeakUsageKwh,
    billShoulderUsageKwh: calc.billShoulderUsageKwh,
    billSolarExportsKwh: calc.billSolarExportsKwh,
    billPeakRateCents: calc.billPeakRateCents,
    billOffPeakRateCents: calc.billOffPeakRateCents,
    billShoulderRateCents: calc.billShoulderRateCents,
    dailyAverageCost: calc.dailyAverageCost,
    annualSupplyCharge: calc.annualSupplyCharge,
    annualUsageCharge: calc.annualUsageCharge,
    annualSolarCredit: calc.annualSolarCredit,
    monthlyUsageKwh: calc.monthlyUsageKwh,
    hasGas,
    hasSolarNew,
    hasSolarOld,
    gasAnnualMJ: calc.gasBillUsageMj ? calc.gasBillUsageMj / (calc.gasBillDays || 90) * 365 : void 0,
    gasAnnualCost: calc.gasAnnualCost,
    gasDailySupplyCharge: calc.gasBillDailySupplyCharge,
    gasUsageRate: calc.gasBillRateCentsMj,
    gasCO2Emissions: calc.gasCo2Emissions,
    gasBillRetailer: calc.gasBillRetailer,
    gasBillPeriodStart: calc.gasBillPeriodStart,
    gasBillPeriodEnd: calc.gasBillPeriodEnd,
    gasBillDays: calc.gasBillDays,
    gasBillTotalAmount: calc.gasBillTotalAmount,
    gasBillUsageMj: calc.gasBillUsageMj,
    gasBillRateCentsMj: calc.gasBillRateCentsMj,
    gasDailyGasCost: calc.gasDailyGasCost,
    gasAnnualSupplyCharge: calc.gasAnnualSupplyCharge,
    gasKwhEquivalent: calc.gasKwhEquivalent,
    gasAppliances: customer.gasAppliances,
    solarSizeKw: calc.recommendedSolarKw || 10,
    panelCount: calc.solarPanelCount || 20,
    panelWattage: 500,
    panelBrand: "AIKO Neostar",
    batterySizeKwh: calc.recommendedBatteryKwh || 15,
    batteryBrand: "Sigenergy SigenStor",
    inverterSizeKw: 8,
    inverterBrand: "Sigenergy",
    systemCost: calc.totalInvestment || 25e3,
    rebateAmount: calc.totalRebates || 3e3,
    netInvestment: calc.netInvestment || 22e3,
    annualSavings: calc.totalAnnualSavings || 3e3,
    paybackYears: calc.paybackYears || 7,
    tenYearSavings: calc.tenYearSavings || (calc.totalAnnualSavings || 3e3) * 10,
    twentyFiveYearSavings: calc.twentyFiveYearSavings,
    vppProvider: vppName,
    vppProgram,
    vppAnnualValue: calc.vppAnnualValue || 300,
    hasGasBundle: true,
    vppDailyCreditAnnual: calc.vppDailyCreditAnnual,
    vppEventPaymentsAnnual: calc.vppEventPaymentsAnnual,
    vppBundleDiscount: calc.vppBundleDiscount,
    hasEV: customer.hasEV ?? false,
    evAnnualKm: calc.evKmPerYear || 1e4,
    evAnnualSavings: calc.evAnnualSavings,
    evPetrolCost: calc.evPetrolCost,
    evGridChargeCost: calc.evGridChargeCost,
    evSolarChargeCost: calc.evSolarChargeCost,
    evConsumptionPer100km: calc.evConsumptionPer100km,
    evPetrolPricePerLitre: calc.evPetrolPricePerLitre,
    hasPoolPump: customer.hasPool ?? false,
    poolPumpSavings: calc.poolHeatPumpSavings,
    poolRecommendedKw: calc.poolRecommendedKw,
    poolAnnualOperatingCost: calc.poolAnnualOperatingCost,
    hasHeatPump: hasGas,
    heatPumpSavings: calc.hotWaterSavings,
    hotWaterCurrentGasCost: calc.hotWaterCurrentGasCost,
    hotWaterHeatPumpCost: calc.hotWaterHeatPumpCost,
    hotWaterDailySupplySaved: calc.hotWaterDailySupplySaved,
    heatingCoolingSavings: calc.heatingCoolingSavings,
    heatingCurrentGasCost: calc.heatingCurrentGasCost,
    heatingRcAcCost: calc.heatingRcAcCost,
    inductionSavings: calc.cookingSavings,
    cookingCurrentGasCost: calc.cookingCurrentGasCost,
    cookingInductionCost: calc.cookingInductionCost,
    investmentSolar: calc.investmentSolar,
    investmentBattery: calc.investmentBattery,
    investmentHeatPumpHw: calc.investmentHeatPumpHw,
    investmentRcAc: calc.investmentRcAc,
    investmentInduction: calc.investmentInduction,
    investmentEvCharger: calc.investmentEvCharger,
    investmentPoolHeatPump: calc.investmentPoolHeatPump,
    solarRebateAmount: calc.solarRebateAmount,
    batteryRebateAmount: calc.batteryRebateAmount,
    heatPumpHwRebateAmount: calc.heatPumpHwRebateAmount,
    heatPumpAcRebateAmount: calc.heatPumpAcRebateAmount,
    electrificationTotalCost: calc.totalInvestment,
    electrificationTotalRebates: calc.totalRebates,
    electrificationNetCost: calc.netInvestment,
    co2ReductionTonnes: calc.co2ReductionTonnes || 5,
    co2CurrentTonnes: calc.co2CurrentTonnes,
    co2ProjectedTonnes: calc.co2ProjectedTonnes,
    co2ReductionPercent: calc.co2ReductionPercent
  };
}
function generateSlidesData(customer, calculations, hasGasBill) {
  const c = calculations;
  const slides = [
    // Slide 1: Cover Page
    {
      slideNumber: 1,
      slideType: "cover",
      title: "Cover Page",
      isConditional: false,
      isIncluded: true,
      content: {
        customerName: customer.fullName,
        customerAddress: customer.address,
        date: (/* @__PURE__ */ new Date()).toLocaleDateString("en-AU", { year: "numeric", month: "long", day: "numeric" })
      }
    },
    // Slide 2: Executive Summary
    {
      slideNumber: 2,
      slideType: "executive_summary",
      title: "Executive Summary",
      isConditional: false,
      isIncluded: true,
      content: {
        currentAnnualCost: c.projectedAnnualCost,
        gasAnnualCost: c.gasAnnualCost,
        totalAnnualSavings: c.totalAnnualSavings,
        paybackYears: c.paybackYears,
        netInvestment: c.netInvestment,
        totalInvestment: c.totalInvestment,
        totalRebates: c.totalRebates,
        co2ReductionTonnes: c.co2ReductionTonnes,
        twentyFiveYearSavings: c.twentyFiveYearSavings,
        hasGas: hasGasBill,
        hasSolarNew: customer.hasSolarNew ?? false,
        hasSolarOld: customer.hasSolarOld ?? false
      }
    },
    // Slide 3: Current Bill Analysis
    {
      slideNumber: 3,
      slideType: "bill_analysis",
      title: "Current Bill Analysis",
      isConditional: false,
      isIncluded: true,
      content: {
        retailer: c.billRetailer,
        periodStart: c.billPeriodStart,
        periodEnd: c.billPeriodEnd,
        billingDays: c.billDays,
        totalAmount: c.billTotalAmount,
        dailySupplyCharge: c.billDailySupplyCharge,
        totalUsageKwh: c.billTotalUsageKwh,
        peakUsageKwh: c.billPeakUsageKwh,
        offPeakUsageKwh: c.billOffPeakUsageKwh,
        shoulderUsageKwh: c.billShoulderUsageKwh,
        solarExportsKwh: c.billSolarExportsKwh,
        peakRateCents: c.billPeakRateCents,
        offPeakRateCents: c.billOffPeakRateCents,
        shoulderRateCents: c.billShoulderRateCents,
        feedInTariffCents: c.billFeedInTariffCents,
        dailyAverageKwh: c.dailyAverageKwh,
        dailyAverageCost: c.dailyAverageCost
      }
    },
    // Slide 4: Monthly Usage Analysis
    {
      slideNumber: 4,
      slideType: "monthly_usage",
      title: "Monthly Usage Analysis",
      isConditional: false,
      isIncluded: true,
      content: {
        dailyAverageKwh: c.dailyAverageKwh,
        monthlyUsageKwh: c.monthlyUsageKwh,
        yearlyUsageKwh: c.yearlyUsageKwh,
        peakUsageKwh: c.billPeakUsageKwh,
        offPeakUsageKwh: c.billOffPeakUsageKwh,
        shoulderUsageKwh: c.billShoulderUsageKwh,
        billingDays: c.billDays
      }
    },
    // Slide 5: Yearly Cost Projection
    {
      slideNumber: 5,
      slideType: "yearly_projection",
      title: "Yearly Cost Projection",
      isConditional: false,
      isIncluded: true,
      content: {
        yearlyUsageKwh: c.yearlyUsageKwh,
        projectedAnnualCost: c.projectedAnnualCost,
        annualSupplyCharge: c.annualSupplyCharge,
        annualUsageCharge: c.annualUsageCharge,
        annualSolarCredit: c.annualSolarCredit,
        dailyAverageCost: c.dailyAverageCost,
        peakRateCents: c.billPeakRateCents,
        offPeakRateCents: c.billOffPeakRateCents,
        shoulderRateCents: c.billShoulderRateCents,
        feedInTariffCents: c.billFeedInTariffCents,
        dailySupplyCharge: c.billDailySupplyCharge,
        gasAnnualCost: c.gasAnnualCost
      }
    },
    // Slide 6: Current Gas Footprint (Conditional)
    {
      slideNumber: 6,
      slideType: "gas_footprint",
      title: "Current Gas Footprint",
      isConditional: true,
      isIncluded: hasGasBill,
      content: {
        gasBillRetailer: c.gasBillRetailer,
        gasBillPeriodStart: c.gasBillPeriodStart,
        gasBillPeriodEnd: c.gasBillPeriodEnd,
        gasBillDays: c.gasBillDays,
        gasBillTotalAmount: c.gasBillTotalAmount,
        gasBillDailySupplyCharge: c.gasBillDailySupplyCharge,
        gasBillUsageMj: c.gasBillUsageMj,
        gasBillRateCentsMj: c.gasBillRateCentsMj,
        gasAnnualCost: c.gasAnnualCost,
        gasKwhEquivalent: c.gasKwhEquivalent,
        gasCo2Emissions: c.gasCo2Emissions,
        gasDailyGasCost: c.gasDailyGasCost,
        gasAnnualSupplyCharge: c.gasAnnualSupplyCharge
      }
    },
    // Slide 7: Gas Appliance Inventory (Conditional)
    {
      slideNumber: 7,
      slideType: "gas_appliances",
      title: "Gas Appliance Inventory",
      isConditional: true,
      isIncluded: hasGasBill && (customer.gasAppliances?.length ?? 0) > 0,
      content: {
        appliances: customer.gasAppliances,
        gasAnnualCost: c.gasAnnualCost,
        gasKwhEquivalent: c.gasKwhEquivalent
      }
    },
    // Slide 8: Strategic Assessment
    {
      slideNumber: 8,
      slideType: "strategic_assessment",
      title: "Strategic Assessment",
      isConditional: false,
      isIncluded: true,
      content: {
        totalAnnualSavings: c.totalAnnualSavings,
        paybackYears: c.paybackYears,
        netInvestment: c.netInvestment,
        co2ReductionTonnes: c.co2ReductionTonnes,
        hasGas: hasGasBill,
        hasSolarNew: customer.hasSolarNew ?? false,
        hasSolarOld: customer.hasSolarOld ?? false,
        hasEV: customer.hasEV,
        hasPool: customer.hasPool,
        hasExistingSolar: customer.hasExistingSolar
      }
    },
    // Slide 9: Recommended Battery Size
    {
      slideNumber: 9,
      slideType: "battery_recommendation",
      title: "Recommended Battery Size",
      isConditional: false,
      isIncluded: true,
      content: {
        recommendedBatteryKwh: c.recommendedBatteryKwh,
        batteryProduct: c.batteryProduct,
        batteryEstimatedCost: c.batteryEstimatedCost,
        dailyAverageKwh: c.dailyAverageKwh,
        hasEV: customer.hasEV
      }
    },
    // Slide 10: Proposed Solar PV System (Conditional)
    {
      slideNumber: 10,
      slideType: "solar_recommendation",
      title: "Proposed Solar PV System",
      isConditional: true,
      isIncluded: !customer.hasExistingSolar,
      content: {
        recommendedSolarKw: c.recommendedSolarKw,
        solarPanelCount: c.solarPanelCount,
        solarAnnualGeneration: c.solarAnnualGeneration,
        solarEstimatedCost: c.solarEstimatedCost,
        yearlyUsageKwh: c.yearlyUsageKwh
      }
    },
    // Slide 11: VPP Provider Comparison
    {
      slideNumber: 11,
      slideType: "vpp_comparison",
      title: "VPP Provider Comparison",
      isConditional: false,
      isIncluded: true,
      content: {
        providers: c.vppProviderComparison,
        state: customer.state,
        hasGas: hasGasBill,
        hasSolarNew: customer.hasSolarNew ?? false,
        hasSolarOld: customer.hasSolarOld ?? false
      }
    },
    // Slide 12: VPP Recommendation
    {
      slideNumber: 12,
      slideType: "vpp_recommendation",
      title: "VPP Recommendation",
      isConditional: false,
      isIncluded: true,
      content: {
        selectedVppProvider: c.selectedVppProvider,
        vppAnnualValue: c.vppAnnualValue,
        vppDailyCreditAnnual: c.vppDailyCreditAnnual,
        vppEventPaymentsAnnual: c.vppEventPaymentsAnnual,
        vppBundleDiscount: c.vppBundleDiscount,
        recommendedBatteryKwh: c.recommendedBatteryKwh
      }
    },
    // Slide 13: Hot Water Electrification (Conditional)
    {
      slideNumber: 13,
      slideType: "hot_water",
      title: "Hot Water Electrification",
      isConditional: true,
      isIncluded: hasGasBill,
      content: {
        hotWaterSavings: c.hotWaterSavings,
        hotWaterCurrentGasCost: c.hotWaterCurrentGasCost,
        hotWaterHeatPumpCost: c.hotWaterHeatPumpCost,
        hotWaterDailySupplySaved: c.hotWaterDailySupplySaved,
        investmentHeatPumpHw: c.investmentHeatPumpHw,
        heatPumpHwRebateAmount: c.heatPumpHwRebateAmount
      }
    },
    // Slide 14: Heating & Cooling Upgrade (Conditional)
    {
      slideNumber: 14,
      slideType: "heating_cooling",
      title: "Heating & Cooling Upgrade",
      isConditional: true,
      isIncluded: hasGasBill,
      content: {
        heatingCoolingSavings: c.heatingCoolingSavings,
        heatingCurrentGasCost: c.heatingCurrentGasCost,
        heatingRcAcCost: c.heatingRcAcCost,
        investmentRcAc: c.investmentRcAc,
        heatPumpAcRebateAmount: c.heatPumpAcRebateAmount
      }
    },
    // Slide 15: Induction Cooking Upgrade (Conditional)
    {
      slideNumber: 15,
      slideType: "induction_cooking",
      title: "Induction Cooking Upgrade",
      isConditional: true,
      isIncluded: hasGasBill,
      content: {
        cookingSavings: c.cookingSavings,
        cookingCurrentGasCost: c.cookingCurrentGasCost,
        cookingInductionCost: c.cookingInductionCost,
        investmentInduction: c.investmentInduction
      }
    },
    // Slide 16: EV Analysis
    {
      slideNumber: 16,
      slideType: "ev_analysis",
      title: "EV Analysis - Low KM Vehicle",
      isConditional: false,
      isIncluded: true,
      content: {
        evPetrolCost: c.evPetrolCost,
        evGridChargeCost: c.evGridChargeCost,
        evSolarChargeCost: c.evSolarChargeCost,
        evAnnualSavings: c.evAnnualSavings,
        evKmPerYear: c.evKmPerYear,
        evConsumptionPer100km: c.evConsumptionPer100km,
        evPetrolPricePerLitre: c.evPetrolPricePerLitre,
        peakRateCents: c.billPeakRateCents
      }
    },
    // Slide 17: EV Charger Recommendation
    {
      slideNumber: 17,
      slideType: "ev_charger",
      title: "EV Charger Recommendation",
      isConditional: false,
      isIncluded: (customer.hasEV ?? false) || customer.evInterest === "interested" || customer.evInterest === "owns",
      content: {
        hasEV: customer.hasEV,
        evInterest: customer.evInterest,
        investmentEvCharger: c.investmentEvCharger,
        evAnnualSavings: c.evAnnualSavings
      }
    },
    // Slide 18: Pool Heat Pump (Conditional)
    {
      slideNumber: 18,
      slideType: "pool_heat_pump",
      title: "Pool Heat Pump",
      isConditional: true,
      isIncluded: customer.hasPool ?? false,
      content: {
        poolVolume: customer.poolVolume,
        poolHeatPumpSavings: c.poolHeatPumpSavings,
        poolRecommendedKw: c.poolRecommendedKw,
        poolAnnualOperatingCost: c.poolAnnualOperatingCost,
        investmentPoolHeatPump: c.investmentPoolHeatPump
      }
    },
    // Slide 19: Full Electrification Investment (Conditional)
    {
      slideNumber: 19,
      slideType: "electrification_investment",
      title: "Full Electrification Investment",
      isConditional: true,
      isIncluded: hasGasBill,
      content: {
        totalInvestment: c.totalInvestment,
        totalRebates: c.totalRebates,
        netInvestment: c.netInvestment,
        investmentSolar: c.investmentSolar,
        investmentBattery: c.investmentBattery,
        investmentHeatPumpHw: c.investmentHeatPumpHw,
        investmentRcAc: c.investmentRcAc,
        investmentInduction: c.investmentInduction,
        investmentEvCharger: c.investmentEvCharger,
        investmentPoolHeatPump: c.investmentPoolHeatPump,
        solarRebateAmount: c.solarRebateAmount,
        batteryRebateAmount: c.batteryRebateAmount,
        heatPumpHwRebateAmount: c.heatPumpHwRebateAmount,
        heatPumpAcRebateAmount: c.heatPumpAcRebateAmount
      }
    },
    // Slide 20: Total Savings Summary
    {
      slideNumber: 20,
      slideType: "savings_summary",
      title: "Total Savings Summary",
      isConditional: false,
      isIncluded: true,
      content: {
        totalAnnualSavings: c.totalAnnualSavings,
        projectedAnnualCost: c.projectedAnnualCost,
        gasAnnualCost: c.gasAnnualCost,
        hotWaterSavings: c.hotWaterSavings,
        heatingCoolingSavings: c.heatingCoolingSavings,
        cookingSavings: c.cookingSavings,
        evAnnualSavings: c.evAnnualSavings,
        vppAnnualValue: c.vppAnnualValue,
        poolHeatPumpSavings: c.poolHeatPumpSavings
      }
    },
    // Slide 21: Financial Summary & Payback
    {
      slideNumber: 21,
      slideType: "financial_summary",
      title: "Financial Summary & Payback",
      isConditional: false,
      isIncluded: true,
      content: {
        totalInvestment: c.totalInvestment,
        totalRebates: c.totalRebates,
        netInvestment: c.netInvestment,
        totalAnnualSavings: c.totalAnnualSavings,
        paybackYears: c.paybackYears,
        tenYearSavings: c.tenYearSavings,
        twentyFiveYearSavings: c.twentyFiveYearSavings
      }
    },
    // Slide 22: Environmental Impact
    {
      slideNumber: 22,
      slideType: "environmental_impact",
      title: "Environmental Impact",
      isConditional: false,
      isIncluded: true,
      content: {
        co2ReductionTonnes: c.co2ReductionTonnes,
        co2CurrentTonnes: c.co2CurrentTonnes,
        co2ProjectedTonnes: c.co2ProjectedTonnes,
        co2ReductionPercent: c.co2ReductionPercent
      }
    },
    // Slide 23: Recommended Roadmap
    {
      slideNumber: 23,
      slideType: "roadmap",
      title: "Recommended Roadmap",
      isConditional: false,
      isIncluded: true,
      content: {
        milestones: [
          { phase: 1, title: "Solar & Battery Installation", timeline: "Month 1-2" },
          { phase: 2, title: "VPP Enrollment", timeline: "Month 2" },
          ...hasGasBill ? [
            { phase: 3, title: "Hot Water Upgrade", timeline: "Month 3-4" },
            { phase: 4, title: "HVAC Upgrade", timeline: "Month 4-6" }
          ] : [],
          ...customer.hasEV || customer.evInterest === "interested" ? [
            { phase: hasGasBill ? 5 : 3, title: "EV Charger Installation", timeline: hasGasBill ? "Month 6" : "Month 3" }
          ] : []
        ],
        totalAnnualSavings: c.totalAnnualSavings,
        paybackYears: c.paybackYears
      }
    },
    // Slide 24: Conclusion
    {
      slideNumber: 24,
      slideType: "conclusion",
      title: "Conclusion",
      isConditional: false,
      isIncluded: true,
      content: {
        totalAnnualSavings: c.totalAnnualSavings,
        paybackYears: c.paybackYears,
        co2ReductionTonnes: c.co2ReductionTonnes,
        twentyFiveYearSavings: c.twentyFiveYearSavings,
        netInvestment: c.netInvestment
      }
    },
    // Slide 25: Contact Slide
    {
      slideNumber: 25,
      slideType: "contact",
      title: "Contact",
      isConditional: false,
      isIncluded: true,
      content: {
        preparedBy: "[Consultant Name]",
        title: "Energy Solutions Consultant",
        company: "Elite Smart Energy Solutions",
        address: "South Australia",
        phone: "",
        email: "george.f@elitesmartenergy.com.au",
        website: "www.elitesmartenergy.com.au"
      }
    }
  ];
  return slides;
}

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs5 from "fs";
import { nanoid as nanoid2 } from "nanoid";
import path5 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs4 from "node:fs";
import path4 from "node:path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var PROJECT_ROOT = import.meta.dirname;
var LOG_DIR = path4.join(PROJECT_ROOT, ".manus-logs");
var MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
var TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);
function ensureLogDir() {
  if (!fs4.existsSync(LOG_DIR)) {
    fs4.mkdirSync(LOG_DIR, { recursive: true });
  }
}
function trimLogFile(logPath, maxSize) {
  try {
    if (!fs4.existsSync(logPath) || fs4.statSync(logPath).size <= maxSize) {
      return;
    }
    const lines = fs4.readFileSync(logPath, "utf-8").split("\n");
    const keptLines = [];
    let keptBytes = 0;
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}
`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }
    fs4.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
  }
}
function writeToLogFile(source, entries) {
  if (entries.length === 0) return;
  ensureLogDir();
  const logPath = path4.join(LOG_DIR, `${source}.log`);
  const lines = entries.map((entry) => {
    const ts = (/* @__PURE__ */ new Date()).toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });
  fs4.appendFileSync(logPath, `${lines.join("\n")}
`, "utf-8");
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}
function vitePluginManusDebugCollector() {
  return {
    name: "manus-debug-collector",
    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true
            },
            injectTo: "head"
          }
        ]
      };
    },
    configureServer(server) {
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }
        const handlePayload = (payload) => {
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };
        const reqBody = req.body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    }
  };
}
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), vitePluginManusDebugCollector()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path4.resolve(import.meta.dirname, "client", "src"),
      "@shared": path4.resolve(import.meta.dirname, "shared"),
      "@assets": path4.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path4.resolve(import.meta.dirname),
  root: path4.resolve(import.meta.dirname, "client"),
  publicDir: path4.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path4.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path5.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs5.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid2()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path5.resolve(import.meta.dirname, "../..", "dist", "public") : path5.resolve(import.meta.dirname, "public");
  if (!fs5.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path5.resolve(distPath, "index.html"));
  });
}

// server/migrate.ts
import { drizzle as drizzle2 } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";
import path6 from "path";
async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.log("[Migrate] No DATABASE_URL set \u2014 skipping migrations.");
    return;
  }
  console.log("[Migrate] Connecting to database...");
  let connection = null;
  try {
    connection = await mysql.createConnection(databaseUrl);
    const db = drizzle2(connection);
    const migrationsFolder = path6.resolve(process.cwd(), "drizzle");
    console.log("[Migrate] Running migrations from:", migrationsFolder);
    await migrate(db, { migrationsFolder });
    console.log("[Migrate] \u2705 All migrations applied successfully.");
  } catch (error) {
    console.error("[Migrate] \u274C Migration failed:", error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  await runMigrations();
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  const uploadDir = path7.resolve(process.cwd(), "uploads");
  if (!fs6.existsSync(uploadDir)) {
    fs6.mkdirSync(uploadDir, { recursive: true });
  }
  app.use("/uploads", express2.static(uploadDir));
  registerOAuthRoutes(app);
  registerPdfUploadRoute(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
