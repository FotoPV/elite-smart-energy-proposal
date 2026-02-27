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
  logo: {
    full: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/HjYyMQuvAHbASIiI.jpg",
    iconTransparent: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/vkYTXfpVJByJjaGo.png",
    iconNavy: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/NDYOCRwnFOhisDUR.png",
    iconWhite: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/OOvYOULsnTCxOyIC.png",
    aqua: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/GJRgQViiKCZlLYpq.png",
  },
  coverBg: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/nrpNEXOsUzYPUqQn.png",
  colors: {
    eliteNavy:    "#1B3A5C",
    solarGreen:   "#46B446",
    pureWhite:    "#FFFFFF",
    skyMist:      "#E8F0F7",
    steelBlue:    "#4A6B8A",
    charcoal:     "#2C3E50",
    lightGrey:    "#F5F7FA",
    midnightNavy: "#0F172A",
    slideCard:    "#2C3E50",
    slideBorder:  "#1B3A5C",
    aqua:   "#46B446",
    orange: "#1B3A5C",
    white:  "#FFFFFF",
    ash:    "#4A6B8A",
    black:  "#0F172A",
    navy:   "#1B3A5C",
    green:  "#46B446",
  },
  fonts: {
    primary:   "Montserrat",
    secondary: "Open Sans",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Open+Sans:wght@300;400;600&display=swap",
    heading: "Montserrat",
    label:   "Montserrat",
    body:    "Open Sans",
  },
  fontUrls: {
    nextSphere:     "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/XLvCZoRXlaNhuTRv.ttf",
    generalSans:    "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/lpXejyRuPwRXRmiM.otf",
    generalSansEot: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/lpXejyRuPwRXRmiM.otf",
    urbanist:       "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/vvMzinSFcwhDxjjZ.ttf",
    urbanistItalic: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/vvMzinSFcwhDxjjZ.ttf",
  },
  localFontPaths: {
    nextSphere:   '/fonts/NextSphere-ExtraBold.ttf',
    generalSans:  '/fonts/GeneralSans-Regular.otf',
    urbanist:     '/fonts/Urbanist-SemiBold.ttf',
    urbanistItalic: '/fonts/Urbanist-SemiBoldItalic.ttf',
    logoAqua:     '/fonts/LightningEnergy_Logo_Icon_Aqua.png',
    coverBg:      '/fonts/cover-bg.jpg',
  },
  slide: {
    bgColor:      "#1B3A5C",
    cardColor:    "#2C3E50",
    borderColor:  "#4A6B8A",
    accentColor:  "#46B446",
    headingColor: "#FFFFFF",
    bodyColor:    "#CBD5E1",
    mutedColor:   "#94A3B8",
  },
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
