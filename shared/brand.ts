// ============================================================
// ELITE SMART ENERGY SOLUTIONS — BRAND SYSTEM
// ============================================================

export const BRAND = {
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
    aqua: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/HjYyMQuvAHbASIiI.jpg",
  },

  // Cover page background image — Electrification Specialists backdrop
  coverBg: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/RcCbZwZNUIzvPlwn.jpg",

  // ── PRIMARY COLOUR PALETTE ─────────────────────────────────
  colors: {
    // Core brand colours
    eliteNavy:    "#1B3A5C",   // Primary navy — headings, sidebar, backgrounds
    solarGreen:   "#46B446",   // Solar green — CTAs, highlights, accents, graph bars
    pureWhite:    "#FFFFFF",   // Pure white — text on dark backgrounds

    // Secondary support colours
    skyMist:      "#E8F0F7",   // Light blue-grey — page backgrounds, light cards
    steelBlue:    "#4A6B8A",   // Mid-tone blue — borders, secondary text
    charcoal:     "#2C3E50",   // Dark charcoal — dark UI surfaces
    lightGrey:    "#F5F7FA",   // Near-white grey — subtle backgrounds

    // Dashboard & slide backgrounds
    midnightNavy: "#0F172A",   // Darkest navy — slide/dashboard backgrounds
    slideCard:    "#2C3E50",   // Slide card surface
    slideBorder:  "#1B3A5C",   // Slide border / divider

    // Legacy aliases (keep for backward compatibility)
    aqua:   "#46B446",         // Maps to Solar Green
    orange: "#1B3A5C",         // Maps to Elite Navy
    white:  "#FFFFFF",
    ash:    "#4A6B8A",         // Maps to Steel Blue
    black:  "#0F172A",         // Maps to Midnight Navy
    navy:   "#1B3A5C",
    green:  "#46B446",
  },

  // ── TYPOGRAPHY ─────────────────────────────────────────────
  fonts: {
    // Primary typeface — ExtraBold, Bold, SemiBold, Regular
    primary:   "Montserrat",
    // Secondary typeface — SemiBold, Regular, Light
    secondary: "Open Sans",
    // Google Fonts import URL
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Open+Sans:wght@300;400;600&display=swap",

    // Legacy aliases
    heading: "Montserrat",
    label:   "Montserrat",
    body:    "Open Sans",
  },

  // Legacy font CDN URLs (kept for backward compatibility)
  fontUrls: {
    nextSphere:     "https://fonts.googleapis.com/css2?family=Montserrat:wght@800&display=swap",
    generalSans:    "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400&display=swap",
    urbanist:       "https://fonts.googleapis.com/css2?family=Montserrat:wght@600&display=swap",
    urbanistItalic: "https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@1,600&display=swap",
  },

  // ── SLIDE / PDF DEFAULTS ───────────────────────────────────
  slide: {
    bgColor:      "#0F172A",
    cardColor:    "#2C3E50",
    borderColor:  "#1B3A5C",
    accentColor:  "#46B446",
    headingColor: "#FFFFFF",
    bodyColor:    "#CBD5E1",
    mutedColor:   "#94A3B8",
  },

  // ── CONTACT INFO ───────────────────────────────────────────
  contact: {
    name:      "",
    title:     "Energy Solutions Consultant",
    company:   "Elite Smart Energy Solutions",
    address:   "South Australia",
    phone:     "",
    email:     "",
    website:   "www.elitesmartenergy.com.au",
    copyright: "© Elite Smart Energy Solutions",
  },
} as const;

export type BrandColors = typeof BRAND.colors;
export type BrandFonts = typeof BRAND.fonts;
