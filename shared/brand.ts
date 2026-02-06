// Lightning Energy Brand Assets
// All assets uploaded to CDN for consistent access

export const BRAND = {
  // Logo
  logo: {
    aqua: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/CEecvotbhlfqjFdS.png',
  },
  
  // Cover page background image
  coverBg: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/efFUlWSUSNJuclEL.png',
  
  // Colors (exact hex values from brand guide)
  colors: {
    aqua: '#00EAD3',      // Primary accent - Pantone 3265C
    orange: '#f36710',    // Burnt Orange - costs, alerts, accent borders (minimal usage)
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
  
  // Font CDN URLs (freshly uploaded)
  fontUrls: {
    nextSphere: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/kMqxsAvtbLaduJLn.ttf',
    generalSans: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/vrzfchblYdJojJyn.otf',
    urbanist: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/eYiOkjJCeeZuKAcI.ttf',
    urbanistItalic: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/FXkHnZytykxslQaU.ttf',
  },
  
  // Contact Info (as per Lightning Energy specifications)
  contact: {
    name: 'George Fotopoulos',
    title: 'Renewables Strategist & Designer',
    company: 'Lightning Energy',
    address: 'Showroom 1, Waverley Road, Malvern East VIC 3145',
    phone: '0419 574 520',
    email: 'george.f@lightning-energy.com.au',
    website: 'www.lightning-energy.com.au',
    copyright: '© Lightning Energy - Architect George Fotopoulos',
  },
} as const;

export type BrandColors = typeof BRAND.colors;
export type BrandFonts = typeof BRAND.fonts;
