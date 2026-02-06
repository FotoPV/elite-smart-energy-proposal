// Lightning Energy Brand Assets
// All assets uploaded to CDN for consistent access

export const BRAND = {
  // Logo
  logo: {
    aqua: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/xoEnSiyrnDIFkppW.png',
  },
  
  // Colors (exact hex values from brand guide)
  colors: {
    aqua: '#00EAD3',      // Primary accent - use sparingly (logo, graphs, highlights)
    orange: '#f36710',    // Secondary accent - headings, key numbers, chart bars
    white: '#FFFFFF',     // Body text
    ash: '#808285',       // Secondary text, labels
    black: '#000000',     // Background
  },
  
  // Fonts
  fonts: {
    heading: 'NextSphere',      // Main headings (ALL CAPS, bold)
    label: 'Urbanist',          // Section labels (ALL CAPS, letter-spaced)
    body: 'GeneralSans',        // Body text
  },
  
  // Font CDN URLs
  fontUrls: {
    nextSphere: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/fRacvGdPvRdejhxR.ttf',
    generalSans: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/FlnvYEaVCWLmtgQE.otf',
    urbanist: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/ifpxpyNGTnspcxRL.ttf',
    urbanistItalic: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/YGUmPLTiRKkxOqHk.ttf',
  },
  
  // Contact Info
  contact: {
    name: 'George Fotopoulos',
    company: 'Lightning Energy',
    copyright: '© Lightning Energy - Architect George Fotopoulos',
  },
} as const;

export type BrandColors = typeof BRAND.colors;
export type BrandFonts = typeof BRAND.fonts;
