import { StaticCanvas } from 'fabric';
import { SERIALISE_PROPS } from '../editor/model';
import type { DesignSnapshot } from '../editor/autofit';
import { detectDirection } from '../editor/textDirection';
import { ensureFont } from '../editor/fonts';
import { writeCopy, type Copy } from './copy';
import { LAYOUTS, type Media } from './layouts';
import { EMOJI, PALETTES, contentLanguage, detectStyle, type ConcreteStyle, type StyleId } from './styles';

export interface GenerateOptions {
  idea: string;
  style: StyleId;
  uiLang: string;
  width: number;
  height: number;
  photo?: Media | null;
  picture?: Media | null;
  /** Changes which layouts, colours and wordings are combined. */
  seed: number;
  /** Wording from an AI model; the built-in copywriter is used when missing. */
  copies?: Copy[] | null;
}

export interface Variant {
  key: string;
  snapshot: DesignSnapshot;
  preview: string;
  style: ConcreteStyle;
}

const LATIN_FONTS: Record<ConcreteStyle, string[]> = {
  bold: ['Anton', 'Montserrat', 'Bebas Neue'],
  minimal: ['Montserrat', 'Poppins', 'Inter'],
  gaming: ['Bangers', 'Anton', 'Bebas Neue'],
  tech: ['Montserrat', 'Anton', 'Bebas Neue'],
  education: ['Poppins', 'Montserrat', 'Anton'],
  news: ['Anton', 'Bebas Neue', 'Montserrat'],
  vlog: ['Poppins', 'Bangers', 'Montserrat'],
  food: ['Bangers', 'Poppins', 'Anton'],
  travel: ['Bebas Neue', 'Montserrat', 'Anton'],
  business: ['Montserrat', 'Anton', 'Poppins']
};

const PASHTO_LETTERS = /[ټډړښږګڼۍې]/;

function fontsFor(style: ConcreteStyle, rtl: boolean, text: string): string[] {
  if (!rtl) return LATIN_FONTS[style];
  // Lalezar has no Pashto letters, so only offer it for other Arabic-script text.
  return PASHTO_LETTERS.test(text) ? ['Vazirmatn', 'Noto Sans Arabic'] : ['Vazirmatn', 'Lalezar', 'Noto Sans Arabic'];
}

/** Read an image file's size and give it a URL the canvas can use (kept for the session). */
export async function mediaFromBlob(blob: Blob, maxSide = 2400): Promise<Media> {
  const bitmap = await createImageBitmap(blob);
  const s = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * s);
  const h = Math.round(bitmap.height * s);
  let out = blob;
  if (s < 1) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    c.getContext('2d')!.drawImage(bitmap, 0, 0, w, h);
    out = await new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('resize failed'))), 'image/webp', 0.93));
  }
  bitmap.close();
  return { url: URL.createObjectURL(out), w, h };
}

export function resolveStyle(style: StyleId, idea: string): ConcreteStyle {
  return style === 'auto' ? detectStyle(idea) : style;
}

/** Make `count` different finished designs from one idea. */
export async function generateVariants(opts: GenerateOptions, count = 6, onEach?: (v: Variant) => void): Promise<Variant[]> {
  const style = resolveStyle(opts.style, opts.idea);
  const lang = contentLanguage(opts.idea, opts.uiLang);
  const copies = opts.copies?.length ? opts.copies : writeCopy(opts.idea, style, lang);
  if (!copies.length) return [];
  const rtl = detectDirection(opts.idea) === 'rtl';
  const allText = copies.map((c) => `${c.headline} ${c.sub} ${c.badge ?? ''}`).join(' ');
  const fonts = fontsFor(style, rtl, allText);
  const subFont = rtl ? 'Vazirmatn' : 'Poppins';
  await Promise.all([...fonts, subFont, 'Anton', 'Vazirmatn', 'Noto Sans Arabic'].map((f) => ensureFont(f, allText)));

  const palettes = PALETTES[style];
  const results: Variant[] = [];
  for (let i = 0; i < count; i++) {
    const k = i + opts.seed;
    const layout = LAYOUTS[k % LAYOUTS.length];
    const el = document.createElement('canvas');
    const canvas = new StaticCanvas(el, { width: opts.width, height: opts.height, enableRetinaScaling: false });
    try {
      const objects = await layout({
        W: opts.width,
        H: opts.height,
        palette: palettes[Math.floor(k / LAYOUTS.length + i) % palettes.length],
        font: fonts[k % fonts.length],
        subFont,
        copy: copies[k % copies.length],
        rtl,
        emoji: EMOJI[style][k % EMOJI[style].length],
        photo: opts.photo ?? undefined,
        picture: opts.picture ?? undefined
      });
      canvas.add(...objects);
      canvas.renderAll();
      const previewScale = Math.min(1, 480 / opts.width);
      const preview = canvas.toCanvasElement(previewScale).toDataURL('image/jpeg', 0.85);
      const variant: Variant = {
        key: `${opts.seed}-${i}`,
        snapshot: { w: opts.width, h: opts.height, c: canvas.toObject(SERIALISE_PROPS) as Record<string, unknown> },
        preview,
        style
      };
      results.push(variant);
      onEach?.(variant);
    } finally {
      void canvas.dispose();
    }
    // let the page breathe (and the cards animate in one by one)
    await new Promise((r) => setTimeout(r, 0));
  }
  return results;
}
