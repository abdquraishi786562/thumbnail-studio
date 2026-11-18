export type ThemeId =
  | 'deckDark'
  | 'cleanLight'
  | 'ivoryWhite'
  | 'eyeShield'
  | 'midnightBlue'
  | 'forest'
  | 'sunset'
  | 'ocean'
  | 'custom';

export interface ThemeTokens {
  dark: boolean;
  bg: string;
  surface: string;
  surface2: string;
  rail: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  accent2: string;
  accentText: string;
}

export const THEMES: Record<Exclude<ThemeId, 'custom'>, ThemeTokens> = {
  deckDark: {
    dark: true,
    bg: '#0d0d12',
    surface: '#15151c',
    surface2: '#1d1d26',
    rail: '#111117',
    border: '#272733',
    text: '#ececf3',
    muted: '#8d8da0',
    accent: '#7c5cff',
    accent2: '#22d3ee',
    accentText: '#ffffff'
  },
  cleanLight: {
    dark: false,
    bg: '#f4f5fa',
    surface: '#ffffff',
    surface2: '#f1f2f8',
    rail: '#ffffff',
    border: '#e3e5ef',
    text: '#161827',
    muted: '#6b6f85',
    accent: '#5b4cf0',
    accent2: '#0ea5e9',
    accentText: '#ffffff'
  },
  ivoryWhite: {
    dark: false,
    bg: '#f8f3e8',
    surface: '#fffcf5',
    surface2: '#f5eedd',
    rail: '#fbf6ea',
    border: '#e9dfc8',
    text: '#2b2418',
    muted: '#8a7d63',
    accent: '#b5651d',
    accent2: '#d4a017',
    accentText: '#ffffff'
  },
  eyeShield: {
    dark: false,
    bg: '#e8efdf',
    surface: '#f3f7ec',
    surface2: '#e4ecd8',
    rail: '#eaf1e1',
    border: '#d2ddc2',
    text: '#26301f',
    muted: '#6c7a5e',
    accent: '#5a8a4a',
    accent2: '#a3955a',
    accentText: '#ffffff'
  },
  midnightBlue: {
    dark: true,
    bg: '#0a1024',
    surface: '#111a35',
    surface2: '#18234a',
    rail: '#0d152d',
    border: '#24305a',
    text: '#e8edff',
    muted: '#8892b8',
    accent: '#3b82f6',
    accent2: '#a855f7',
    accentText: '#ffffff'
  },
  forest: {
    dark: true,
    bg: '#0b130d',
    surface: '#111c14',
    surface2: '#18261b',
    rail: '#0e1810',
    border: '#22332a',
    text: '#e6f2e8',
    muted: '#86a08b',
    accent: '#22c55e',
    accent2: '#a3e635',
    accentText: '#06210f'
  },
  sunset: {
    dark: true,
    bg: '#140c0f',
    surface: '#1e1216',
    surface2: '#2a191f',
    rail: '#180e12',
    border: '#3a242c',
    text: '#f8e9ec',
    muted: '#ab8a92',
    accent: '#f43f5e',
    accent2: '#f97316',
    accentText: '#ffffff'
  },
  ocean: {
    dark: true,
    bg: '#071820',
    surface: '#0c222c',
    surface2: '#122e3a',
    rail: '#091c25',
    border: '#1b3b48',
    text: '#e3f6fb',
    muted: '#7fa6b3',
    accent: '#06b6d4',
    accent2: '#3b82f6',
    accentText: '#03222a'
  }
};

export const THEME_ORDER: Exclude<ThemeId, 'custom'>[] = [
  'deckDark',
  'cleanLight',
  'ivoryWhite',
  'eyeShield',
  'midnightBlue',
  'forest',
  'sunset',
  'ocean'
];

export const CUSTOM_SWATCHES = [
  '#7c5cff',
  '#3b82f6',
  '#06b6d4',
  '#10b981',
  '#84cc16',
  '#f59e0b',
  '#f97316',
  '#ef4444',
  '#ec4899',
  '#a855f7'
];

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6);
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
}

/** Mix colour `a` toward colour `b` by `t` (0..1). */
export function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}

/** WCAG relative luminance. */
export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Shift hue of a colour by `deg` degrees (used for the custom gradient partner colour). */
export function shiftHue(hex: string, deg: number): string {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  h = (h + deg + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r1, g1, b1] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return rgbToHex((r1 + m) * 255, (g1 + m) * 255, (b1 + m) * 255);
}

/** Build a full theme from one accent colour. */
export function customTheme(accent: string, dark: boolean): ThemeTokens {
  const accentText = contrastRatio(accent, '#ffffff') >= 3 ? '#ffffff' : '#111111';
  const accent2 = shiftHue(accent, 40);
  if (dark) {
    return {
      dark: true,
      bg: mix('#0b0b10', accent, 0.06),
      surface: mix('#14141b', accent, 0.07),
      surface2: mix('#1c1c25', accent, 0.09),
      rail: mix('#101016', accent, 0.06),
      border: mix('#272733', accent, 0.12),
      text: '#ededf4',
      muted: mix('#8d8da0', accent, 0.15),
      accent,
      accent2,
      accentText
    };
  }
  return {
    dark: false,
    bg: mix('#f5f6fa', accent, 0.05),
    surface: '#ffffff',
    surface2: mix('#f2f3f8', accent, 0.06),
    rail: '#ffffff',
    border: mix('#e3e5ee', accent, 0.1),
    text: '#161827',
    muted: '#6b6f85',
    accent,
    accent2,
    accentText
  };
}

export function resolveTheme(id: ThemeId, customAccent: string, customDark: boolean): ThemeTokens {
  return id === 'custom' ? customTheme(customAccent, customDark) : THEMES[id];
}

export function applyTheme(tokens: ThemeTokens): void {
  const root = document.documentElement;
  const set = (k: string, v: string) => root.style.setProperty(k, v);
  set('--bg', tokens.bg);
  set('--surface', tokens.surface);
  set('--surface-2', tokens.surface2);
  set('--rail', tokens.rail);
  set('--border', tokens.border);
  set('--text', tokens.text);
  set('--muted', tokens.muted);
  set('--accent', tokens.accent);
  set('--accent-2', tokens.accent2);
  set('--accent-text', tokens.accentText);
  set('--accent-soft', tokens.accent + (tokens.dark ? '2e' : '1f'));
  root.style.colorScheme = tokens.dark ? 'dark' : 'light';
  root.dataset.dark = String(tokens.dark);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', tokens.bg);
}
