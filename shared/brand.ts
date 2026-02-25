// Elite Smart Energy Solutions — Brand Assets

export const BRAND = {
  // Logo
  logo: {
    aqua: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/HjYyMQuvAHbASIiI.jpg',
  },

  // Cover page background image (set to empty — no LE-specific cover bg)
  coverBg: '',

  // Colors
  colors: {
    aqua: '#00EAD3',      // Primary accent
    orange: '#f36710',    // Secondary accent — costs, alerts, accent borders
    white: '#FFFFFF',     // Body text
    ash: '#808285',       // Secondary text, labels
    black: '#0F172A',     // Background — Midnight Navy
    navy: '#1B2E4B',      // Elite navy (from logo)
    green: '#4CAF50',     // Elite green (from logo leaf)
  },

  // Fonts
  fonts: {
    heading: 'NextSphere',      // Main headings (ALL CAPS, bold) — HEADINGS ONLY
    label: 'Urbanist',          // Section labels, subtitles (ALL CAPS, letter-spaced)
    body: 'GeneralSans',        // Body text, numbers, all other content
  },

  // Font CDN URLs
  fontUrls: {
    nextSphere: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/kMqxsAvtbLaduJLn.ttf',
    generalSans: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/vrzfchblYdJojJyn.otf',
    urbanist: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/eYiOkjJCeeZuKAcI.ttf',
    urbanistItalic: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/FXkHnZytykxslQaU.ttf',
  },

  // Contact Info — Elite Smart Energy Solutions (SA)
  contact: {
    name: '',
    title: 'Energy Solutions Consultant',
    company: 'Elite Smart Energy Solutions',
    address: 'South Australia',
    phone: '',
    email: '',
    website: 'www.elitesmartenergy.com.au',
    copyright: '© Elite Smart Energy Solutions',
  },
} as const;

export type BrandColors = typeof BRAND.colors;
export type BrandFonts = typeof BRAND.fonts;
