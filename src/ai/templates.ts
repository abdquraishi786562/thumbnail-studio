import { StaticCanvas } from 'fabric';
import { SERIALISE_PROPS } from '../editor/model';
import type { DesignSnapshot } from '../editor/autofit';
import { ensureFont } from '../editor/fonts';
import { shout } from './copy';
import { fontsFor } from './generate';
import { LAYOUTS } from './layouts';
import { EMOJI, PALETTES, badgeFor, type ConcreteStyle, type ContentLang } from './styles';

/** A ready-made design: a layout, a style's colours and a font, filled with sample text. */
export interface TemplateDef {
  id: string;
  style: ConcreteStyle;
  /** Index into LAYOUTS: 0 hero, 1 centre, 2 panel, 3 caption bar, 4 big number, 5 sticker. */
  layout: number;
  palette: number;
  font: number;
}

export const TEMPLATES: TemplateDef[] = [
  { id: 'gaming-hero', style: 'gaming', layout: 0, palette: 0, font: 0 },
  { id: 'gaming-sticker', style: 'gaming', layout: 5, palette: 1, font: 1 },
  { id: 'tech-centre', style: 'tech', layout: 1, palette: 0, font: 0 },
  { id: 'tech-panel', style: 'tech', layout: 2, palette: 1, font: 1 },
  { id: 'edu-hero', style: 'education', layout: 0, palette: 1, font: 0 },
  { id: 'edu-number', style: 'education', layout: 4, palette: 0, font: 2 },
  { id: 'news-bar', style: 'news', layout: 3, palette: 0, font: 0 },
  { id: 'news-panel', style: 'news', layout: 2, palette: 1, font: 1 },
  { id: 'vlog-centre', style: 'vlog', layout: 1, palette: 0, font: 0 },
  { id: 'vlog-sticker', style: 'vlog', layout: 5, palette: 1, font: 1 },
  { id: 'food-number', style: 'food', layout: 4, palette: 0, font: 0 },
  { id: 'food-hero', style: 'food', layout: 0, palette: 1, font: 1 },
  { id: 'travel-bar', style: 'travel', layout: 3, palette: 0, font: 0 },
  { id: 'travel-centre', style: 'travel', layout: 1, palette: 1, font: 1 },
  { id: 'business-panel', style: 'business', layout: 2, palette: 0, font: 0 },
  { id: 'business-number', style: 'business', layout: 4, palette: 1, font: 1 },
  { id: 'minimal-hero', style: 'minimal', layout: 0, palette: 0, font: 0 },
  { id: 'bold-centre', style: 'bold', layout: 1, palette: 1, font: 0 }
];

export interface RenderedTemplate {
  def: TemplateDef;
  snapshot: DesignSnapshot;
  preview: string;
}

export async function renderTemplate(
  def: TemplateDef,
  opts: { width: number; height: number; lang: ContentLang; rtl: boolean; heading: string; sub: string }
): Promise<RenderedTemplate> {
  const fonts = fontsFor(def.style, opts.rtl, opts.heading + opts.sub);
  const font = fonts[def.font % fonts.length];
  const subFont = opts.rtl ? 'Vazirmatn' : 'Poppins';
  await Promise.all([font, subFont, 'Anton'].map((f) => ensureFont(f, opts.heading + opts.sub)));
  const palettes = PALETTES[def.style];
  const el = document.createElement('canvas');
  const canvas = new StaticCanvas(el, { width: opts.width, height: opts.height, enableRetinaScaling: false });
  try {
    const objects = await LAYOUTS[def.layout % LAYOUTS.length]({
      W: opts.width,
      H: opts.height,
      palette: palettes[def.palette % palettes.length],
      font,
      subFont,
      copy: { headline: shout(opts.heading, opts.lang), sub: opts.sub, badge: badgeFor(def.style, opts.lang), number: '5' },
      rtl: opts.rtl,
      emoji: EMOJI[def.style][def.palette % EMOJI[def.style].length]
    });
    canvas.add(...objects);
    canvas.renderAll();
    const preview = canvas.toCanvasElement(Math.min(1, 320 / opts.width)).toDataURL('image/jpeg', 0.82);
    return { def, preview, snapshot: { w: opts.width, h: opts.height, c: canvas.toObject(SERIALISE_PROPS) as Record<string, unknown> } };
  } finally {
    void canvas.dispose();
  }
}
