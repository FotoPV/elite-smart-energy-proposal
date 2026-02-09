// Lightning Energy Brand Assets
// All assets uploaded to CDN for consistent access

export const BRAND = {
  // Logo
  logo: {
    aqua: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/ZhCrnrOHmvPlhPsR.png',
  },
  
  // Cover page background image
  coverBg: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/efFUlWSUSNJuclEL.png',
  
  // Colors (exact hex values from brand guide)
  colors: {
    aqua: '#00EAD3',      // Primary accent - Pantone 3265C — USE SPARINGLY (logo + graph bars only)
    orange: '#f36710',    // Burnt Orange - costs, alerts, accent borders (MINIMAL usage)
    white: '#FFFFFF',     // Body text - Pantone White
    ash: '#808285',       // Secondary text, labels - Pantone 443C
    black: '#000000',     // Background
  },
  
  // Fonts
  fonts: {
    heading: 'NextSphere',      // Main headings (ALL CAPS, bold) - HEADINGS ONLY
    label: 'Urbanist',          // Section labels, subtitles (ALL CAPS, letter-spaced)
    body: 'GeneralSans',        // Body text, numbers, all other content
  },
  
  // Font CDN URLs (freshly uploaded Feb 10)
  fontUrls: {
    nextSphere: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/VKaRCbkIgKENeNzZ.ttf',
    generalSans: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/cDkISnICUZBXPAzK.otf',
    urbanist: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/SgyKyTuxmnZJwdsX.ttf',
    urbanistItalic: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/KovhlDECwhCbRBpZ.ttf',
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
