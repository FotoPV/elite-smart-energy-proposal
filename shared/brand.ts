// Lightning Energy Brand Assets
// All assets uploaded to permanent S3 CDN — FIXATED Feb 10 2026
// These URLs are permanent and will not expire.

export const BRAND = {
  // Logo — Aqua starburst icon (transparent PNG)
  logo: {
    aqua: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/UpIyfevGqUVmUwSM.png',
  },
  
  // Cover page background image
  coverBg: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/efFUlWSUSNJuclEL.png',
  
  // Colors (exact hex values from brand palette guide)
  colors: {
    aqua: '#00EAD3',      // Primary accent - Pantone 3265C — USE SPARINGLY (logo + graph bars only)
    orange: '#f36710',    // Burnt Orange - costs, alerts, accent borders (MINIMAL usage)
    white: '#FFFFFF',     // Body text - Pantone White
    ash: '#808285',       // Secondary text, labels - Pantone 443C
    black: '#000000',     // Background - DARKEST BLACK always
  },
  
  // Fonts
  fonts: {
    heading: 'NextSphere',      // Main headings (ALL CAPS, bold) - HEADINGS ONLY
    label: 'Urbanist',          // Section labels, subtitles (ALL CAPS, letter-spaced)
    body: 'GeneralSans',        // Body text, numbers, all other content
  },
  
  // Font CDN URLs — PERMANENT S3 uploads (Feb 10 2026)
  fontUrls: {
    nextSphere: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/jmxTHISRcyijUzGl.ttf',
    generalSans: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/JAbOMTUQjuZZbAXv.otf',
    generalSansEot: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/kjkHiNqiZOvWVAjc.eot',
    urbanist: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/gqxvhforGGNrTmlD.ttf',
    urbanistItalic: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/CVAUXsQZHITdJIew.ttf',
  },

  // Same-origin font paths (served from /fonts/ — no CORS issues for PDF capture)
  localFontPaths: {
    nextSphere: '/fonts/NextSphere-ExtraBold.ttf',
    generalSans: '/fonts/GeneralSans-Regular.otf',
    urbanist: '/fonts/Urbanist-SemiBold.ttf',
    urbanistItalic: '/fonts/Urbanist-SemiBoldItalic.ttf',
    logoAqua: '/fonts/LightningEnergy_Logo_Icon_Aqua.png',
    coverBg: '/fonts/cover-bg.jpg',
  },
  
  // Contact Info (as per Lightning Energy specifications)
  contact: {
    name: 'George Fotopoulos',
    title: 'Director, Lightning Energy',
    company: 'Lightning Energy',
    address: 'Showroom 1, Waverley Road, Malvern East VIC 3145',
    phone: '0450 095 645',
    email: 'george@lightningenergy.com.au',
    website: 'www.lightningenergy.com.au',
    copyright: '© Lightning Energy — Architect George Fotopoulos',
  },
} as const;

export type BrandColors = typeof BRAND.colors;
export type BrandFonts = typeof BRAND.fonts;
