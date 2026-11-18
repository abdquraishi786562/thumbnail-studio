// Fonts bundled with the app (all SIL Open Font License), so they work offline.
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/vazirmatn/400.css';
import '@fontsource/vazirmatn/500.css';
import '@fontsource/vazirmatn/700.css';
import '@fontsource/vazirmatn/900.css';
import '@fontsource/anton/400.css';
import '@fontsource/bebas-neue/400.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';
import '@fontsource/bangers/400.css';
import '@fontsource/noto-sans-arabic/700.css';
import '@fontsource/noto-sans-arabic/900.css';
import '@fontsource/noto-naskh-arabic/700.css';
import '@fontsource/lalezar/400.css';

export type Script = 'latin' | 'arabic';

export interface FontOption {
  family: string;
  weight: number;
  /** Scripts this font fully covers. */
  scripts: Script[];
  /** Covers every Pashto letter (checked against the font's character map). */
  pashto: boolean;
}

export const FONTS: FontOption[] = [
  { family: 'Anton', weight: 400, scripts: ['latin'], pashto: false },
  { family: 'Bebas Neue', weight: 400, scripts: ['latin'], pashto: false },
  { family: 'Montserrat', weight: 900, scripts: ['latin'], pashto: false },
  { family: 'Poppins', weight: 800, scripts: ['latin'], pashto: false },
  { family: 'Bangers', weight: 400, scripts: ['latin'], pashto: false },
  { family: 'Inter', weight: 700, scripts: ['latin'], pashto: false },
  // Vazirmatn lacks only U+0682 (a rare archaic letter); Noto Sans Arabic is its fallback.
  { family: 'Vazirmatn', weight: 900, scripts: ['latin', 'arabic'], pashto: true },
  { family: 'Noto Sans Arabic', weight: 900, scripts: ['arabic'], pashto: true },
  { family: 'Noto Naskh Arabic', weight: 700, scripts: ['arabic'], pashto: true },
  // Lalezar has no Pashto-specific letters: offered for Dari/Persian/Arabic text only.
  { family: 'Lalezar', weight: 400, scripts: ['latin', 'arabic'], pashto: false }
];

/** CSS font stack: the chosen family, then full-coverage fallbacks for mixed-script text. */
export function fontStack(family: string): string {
  return `"${family}", "Vazirmatn", "Noto Sans Arabic", sans-serif`;
}

export function fontWeight(family: string): number {
  return FONTS.find((f) => f.family === family)?.weight ?? 700;
}

/** Wait until the browser has the font ready, so the canvas never draws a fallback. */
export async function ensureFont(family: string, sample = 'Aa آب ټ'): Promise<void> {
  try {
    await document.fonts.load(`${fontWeight(family)} 64px "${family}"`, sample);
    await document.fonts.load(`700 64px "Noto Sans Arabic"`, sample);
  } catch {
    /* font loading API unavailable: canvas falls back gracefully */
  }
}

/** Keep the chosen font if it covers the text's script; otherwise use Vazirmatn (Latin + Persian/Dari/Pashto). */
export function fontForText(preferred: string, rtl: boolean): string {
  const f = FONTS.find((x) => x.family === preferred);
  if (!rtl || f?.scripts.includes('arabic')) return preferred;
  return 'Vazirmatn';
}
