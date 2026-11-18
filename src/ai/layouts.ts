import { Circle, FabricImage, FabricObject, Gradient, Polygon, Rect, Textbox } from 'fabric';
import { DEFAULT_IMAGE, applyImage, applyStyle, applyTextLayout, clone, newId, setMeta, shapeStyle, type ShapeKind, type Style } from '../editor/model';
import { NO_ANIM } from '../editor/animation';
import { fontStack, fontWeight } from '../editor/fonts';
import { contrastRatio } from '../theme/themes';
import type { Copy } from './copy';
import type { Palette } from './styles';

export interface Media {
  url: string;
  w: number;
  h: number;
}

export interface DesignInput {
  W: number;
  H: number;
  palette: Palette;
  font: string;
  subFont: string;
  copy: Copy;
  rtl: boolean;
  emoji: string;
  /** The user's own photo (a face or product). */
  photo?: Media;
  /** An AI-generated background picture. */
  picture?: Media;
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type Layout = (d: DesignInput) => Promise<FabricObject[]>;

const EMOJI_FONT = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';

function textOn(bg: string, preferred: string, alt: string): string {
  return contrastRatio(preferred, bg) >= 3 ? preferred : alt;
}

/** Split the canvas into a text area and a media area, side by side or stacked, mirrored for RTL. */
function regions(d: DesignInput, textShare: number): { text: Box; media: Box; stacked: boolean } {
  const { W, H, rtl } = d;
  const m = Math.min(W, H) * 0.06;
  if (W / H >= 1.15) {
    const tw = W * textShare;
    const text = { x: rtl ? W - tw + m * 0.5 : m, y: m, w: tw - m * 1.5, h: H - 2 * m };
    const media = { x: rtl ? m : tw, y: m, w: W - tw - m, h: H - 2 * m };
    return { text, media, stacked: false };
  }
  const mh = H * (1 - textShare);
  return { media: { x: m, y: m, w: W - 2 * m, h: mh - m }, text: { x: m, y: mh, w: W - 2 * m, h: H - mh - m }, stacked: true };
}

function background(d: DesignInput): FabricObject {
  const bg = new Rect({ left: 0, top: 0, width: d.W, height: d.H, selectable: false, evented: false, hoverCursor: 'default' });
  setMeta(bg, { id: 'background', kind: 'background' });
  bg.set('fill', d.palette.bg1);
  return bg;
}

async function gradientBackground(d: DesignInput): Promise<FabricObject> {
  const bg = background(d);
  bg.set(
    'fill',
    new Gradient({
      type: 'linear',
      coords: { x1: 0, y1: 0, x2: d.W, y2: d.H },
      colorStops: [
        { offset: 0, color: d.palette.bg1 },
        { offset: 1, color: d.palette.bg2 }
      ]
    })
  );
  return bg;
}

function shape(obj: FabricObject, fill: string, extra: Partial<Style> = {}, kind?: ShapeKind): FabricObject {
  const guess: ShapeKind = obj instanceof Circle ? 'circle' : obj instanceof Polygon ? 'star' : 'rect';
  setMeta(obj, { id: newId(), kind: 'shape', shape: kind ?? guess, style: { ...shapeStyle(fill), ...extra }, anim: { ...NO_ANIM } });
  applyStyle(obj);
  return obj;
}

async function image(media: Media, opts: { radius: number; border: boolean; shadow: boolean; square?: boolean }): Promise<FabricImage> {
  const img = await FabricImage.fromURL(media.url);
  const crop = { l: 0, t: 0, r: 0, b: 0 };
  if (opts.square) {
    // centre square crop, so a 50% radius makes a circle
    if (media.w > media.h) {
      const cut = (1 - media.h / media.w) / 2;
      crop.l = cut;
      crop.r = cut;
    } else if (media.h > media.w) {
      const cut = (1 - media.w / media.h) / 2;
      crop.t = cut * 0.6; // faces sit in the upper part of most photos
      crop.b = cut * 1.4;
    }
  }
  setMeta(img, {
    id: newId(),
    kind: 'image',
    style: { ...shapeStyle('#ffffff'), stroke: opts.border, strokeColor: '#ffffff', strokeWidth: 0.3, effect: opts.shadow ? 'shadow' : 'none', effectColor: '#000000' },
    image: { ...clone(DEFAULT_IMAGE), crop, radius: opts.radius, natural: { w: media.w, h: media.h } },
    anim: { ...NO_ANIM }
  });
  applyImage(img);
  applyStyle(img);
  return img;
}

/** Scale and centre an object inside a box (contain). */
function placeIn(obj: FabricObject, box: Box, fill = 1): void {
  const w = obj.width ?? 1;
  const h = obj.height ?? 1;
  const s = Math.min((box.w * fill) / w, (box.h * fill) / h);
  obj.set({ scaleX: s, scaleY: s });
  obj.set({ left: box.x + (box.w - w * s) / 2, top: box.y + (box.h - h * s) / 2 });
  obj.setCoords();
}

async function cover(media: Media, d: DesignInput, darken: number): Promise<FabricObject[]> {
  const img = await image(media, { radius: 0, border: false, shadow: false });
  const s = Math.max(d.W / media.w, d.H / media.h);
  img.set({ scaleX: s, scaleY: s, left: (d.W - media.w * s) / 2, top: (d.H - media.h * s) / 2 });
  img.setCoords();
  const shade = shape(new Rect({ left: 0, top: 0, width: d.W, height: d.H }), '#000000');
  shade.set('opacity', darken);
  return [img, shade];
}

interface TextOpts {
  fill: string;
  fill2?: string;
  stroke?: string | null;
  effect?: Style['effect'];
  effectColor?: string;
  highlight?: string | null;
  align?: 'start' | 'center';
  font: string;
  maxSize: number;
}

function text(content: string, box: Box, _d: DesignInput, o: TextOpts): Textbox {
  const t = new Textbox(content, { fontFamily: fontStack(o.font), fontWeight: fontWeight(o.font), fontSize: o.maxSize, lineHeight: 1.0, width: box.w, left: box.x, top: box.y });
  setMeta(t, {
    id: newId(),
    kind: 'text',
    dirMode: 'auto',
    align: o.align ?? 'start',
    fontFamily: o.font,
    style: {
      fillMode: o.fill2 ? 'gradient' : 'solid',
      fill: o.fill,
      fill2: o.fill2 ?? o.fill,
      stroke: !!o.stroke,
      strokeColor: o.stroke ?? '#000000',
      strokeWidth: 0.4,
      effect: o.effect ?? 'none',
      effectColor: o.effectColor ?? '#000000',
      highlight: o.highlight ?? null
    },
    anim: { ...NO_ANIM }
  });
  applyTextLayout(t);
  // shrink until it fits the box (a long word can make a textbox wider than asked)
  let size = o.maxSize;
  for (let i = 0; i < 45; i++) {
    t.set({ fontSize: size, width: box.w });
    t.initDimensions();
    if ((t.width ?? 0) <= box.w + 1 && (t.height ?? 0) <= box.h) break;
    size *= 0.93;
  }
  applyStyle(t);
  t.set({ left: box.x, top: box.y + (box.h - (t.height ?? 0)) / 2 });
  t.setCoords();
  return t;
}

/** A badge is one text object with a coloured background, so it never comes apart when resized. */
function badge(label: string, at: { x: number; y: number; rtl: boolean }, d: DesignInput, fill: string): FabricObject[] {
  const size = Math.min(d.W, d.H) * 0.055;
  const ink = textOn(fill, '#ffffff', '#111111');
  const content = `\u00a0${label}\u00a0`;
  const t = new Textbox(content, { fontFamily: fontStack(d.subFont), fontWeight: 900, fontSize: size, width: size * 20, lineHeight: 1.15 });
  setMeta(t, {
    id: newId(),
    kind: 'text',
    dirMode: 'auto',
    align: 'start',
    fontFamily: d.subFont,
    style: { ...shapeStyle(ink), stroke: false, effect: 'shadow', effectColor: '#000000', highlight: fill },
    anim: { ...NO_ANIM }
  });
  applyStyle(t);
  applyTextLayout(t);
  t.initDimensions();
  const lineW = Math.max(size * 2, ...((t as unknown as { __lineWidths?: number[] }).__lineWidths ?? [size * 4]));
  t.set({ width: Math.ceil(lineW * 1.08 + size * 0.4) });
  t.initDimensions();
  const w = t.width ?? 0;
  t.set({ left: at.rtl ? at.x - w : at.x, top: at.y });
  t.setCoords();
  return [t];
}

function emojiText(e: string, size: number, x: number, y: number, angle: number): FabricObject {
  const t = new Textbox(e, { fontFamily: EMOJI_FONT, fontSize: size, width: size * 1.4, left: x, top: y, angle });
  setMeta(t, { id: newId(), kind: 'text', dirMode: 'ltr', align: 'center', fontFamily: 'Emoji', style: { ...shapeStyle('#000000'), effect: 'shadow', effectColor: '#000000' }, anim: { ...NO_ANIM } });
  applyStyle(t);
  applyTextLayout(t);
  return t;
}

async function mediaOrEmoji(d: DesignInput, box: Box, opts: { circle?: boolean; tilt?: number }): Promise<FabricObject[]> {
  if (d.photo) {
    const img = await image(d.photo, { radius: opts.circle ? 0.5 : 0.07, border: true, shadow: true, square: opts.circle });
    placeIn(img, box, 0.95);
    if (opts.tilt) img.rotate(opts.tilt);
    return [img];
  }
  const size = Math.min(box.w, box.h) * 0.62;
  return [emojiText(d.emoji, size, box.x + (box.w - size * 1.4) / 2, box.y + (box.h - size * 1.2) / 2, opts.tilt ?? -8)];
}

function star(cx: number, cy: number, r: number, fill: string, opacity: number): FabricObject {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? r : r * 0.45;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push({ x: rr * Math.cos(a), y: rr * Math.sin(a) });
  }
  const s = shape(new Polygon(pts), fill, {}, 'star');
  s.set({ left: cx - r, top: cy - r, opacity });
  s.setCoords();
  return s;
}

async function base(d: DesignInput, darken = 0.35): Promise<FabricObject[]> {
  if (d.picture) return [await gradientBackground(d), ...(await cover(d.picture, d, darken))];
  return [await gradientBackground(d)];
}

// ---------------------------------------------------------------- layouts

/** Big title on one side, photo (or a giant emoji) on the other. */
const heroSide: Layout = async (d) => {
  const r = regions(d, 0.56);
  const out = await base(d);
  if (!d.picture) {
    const c = Math.min(r.media.w, r.media.h);
    out.push(shape(new Circle({ radius: c * 0.55, left: r.media.x + r.media.w / 2 - c * 0.55, top: r.media.y + r.media.h / 2 - c * 0.55 }), '#ffffff'));
    out[out.length - 1].set('opacity', 0.12);
  }
  out.push(...(await mediaOrEmoji(d, r.media, { tilt: d.photo ? 0 : -8 })));
  const badgeH = Math.min(d.W, d.H) * 0.11;
  if (d.copy.badge) out.push(...badge(d.copy.badge, { x: d.rtl ? r.text.x + r.text.w : r.text.x, y: r.text.y, rtl: d.rtl }, d, d.palette.accent));
  const hasSub = !!d.copy.sub;
  const headBox = { ...r.text, y: r.text.y + badgeH, h: r.text.h * (hasSub ? 0.62 : 0.8) - badgeH * 0.5 };
  out.push(text(d.copy.headline, headBox, d, { fill: d.palette.text, stroke: d.palette.ink, effect: 'shadow', effectColor: d.palette.glow, font: d.font, maxSize: d.H * 0.22 }));
  if (hasSub) out.push(text(d.copy.sub, { ...r.text, y: headBox.y + headBox.h + d.H * 0.02, h: r.text.h * 0.2 }, d, { fill: d.palette.text2, effect: 'shadow', effectColor: '#000000', font: d.subFont, maxSize: d.H * 0.075 }));
  return out;
};

/** Everything centred; title with a gradient fill and glow. */
const centerStack: Layout = async (d) => {
  const out: FabricObject[] = [];
  if (!d.picture && d.photo) out.push(await gradientBackground(d), ...(await cover(d.photo, d, 0.5)));
  else out.push(...(await base(d, 0.45)));
  const m = Math.min(d.W, d.H) * 0.07;
  if (!d.picture && !d.photo) {
    out.push(star(d.W * 0.12, d.H * 0.2, d.H * 0.08, d.palette.text2, 0.5), star(d.W * 0.88, d.H * 0.78, d.H * 0.1, d.palette.text2, 0.4));
    out.push(emojiText(d.emoji, d.H * 0.16, d.W * 0.8, d.H * 0.08, 12));
  }
  const bh = Math.min(d.W, d.H) * 0.12;
  if (d.copy.badge) {
    const items = badge(d.copy.badge, { x: d.W / 2, y: m, rtl: false }, d, d.palette.accent);
    // centre the badge horizontally
    const w = items[0].width ?? 0;
    items.forEach((o) => {
      o.set({ left: (o.left ?? 0) - w / 2 });
      o.setCoords();
    });
    out.push(...items);
  }
  const hasSub = !!d.copy.sub;
  const head = { x: m * 1.5, y: m + bh, w: d.W - m * 3, h: (d.H - m * 2 - bh) * (hasSub ? 0.72 : 0.9) };
  out.push(text(d.copy.headline, head, d, { fill: d.palette.text, fill2: d.palette.text2, stroke: d.palette.ink, effect: 'glow', effectColor: d.palette.glow === '#000000' ? d.palette.accent : d.palette.glow, align: 'center', font: d.font, maxSize: d.H * 0.26 }));
  if (hasSub) out.push(text(d.copy.sub, { x: m * 2, y: head.y + head.h, w: d.W - m * 4, h: (d.H - m * 2 - bh) * 0.24 }, d, { fill: '#ffffff', effect: 'shadow', align: 'center', font: d.subFont, maxSize: d.H * 0.075 }));
  return out;
};

/** A tilted colour panel behind the title, photo on the other side. */
const splitPanel: Layout = async (d) => {
  const r = regions(d, 0.55);
  const out = await base(d);
  const panelFill = d.palette.accent;
  const pad = Math.min(d.W, d.H) * 0.08;
  const panel = shape(new Rect({ left: r.text.x - pad * 2, top: r.text.y - pad * 3, width: r.text.w + pad * 4, height: r.text.h + pad * 6 }), panelFill, { effect: 'shadow', effectColor: '#000000' });
  panel.rotate(r.stacked ? -2 : d.rtl ? 4 : -4);
  out.push(panel);
  out.push(...(await mediaOrEmoji(d, r.media, { circle: !!d.photo })));
  const ink = textOn(panelFill, '#111111', '#ffffff');
  const hasSub = !!d.copy.sub;
  const head = { ...r.text, h: r.text.h * (hasSub ? 0.72 : 0.9) };
  out.push(text(d.copy.headline, head, d, { fill: ink, effect: 'none', font: d.font, maxSize: d.H * 0.22 }));
  if (hasSub) out.push(text(d.copy.sub, { ...r.text, y: r.text.y + head.h, h: r.text.h * 0.26 }, d, { fill: ink, font: d.subFont, maxSize: d.H * 0.07 }));
  return out;
};

/** Full picture with a dark caption bar along the bottom. */
const bottomBar: Layout = async (d) => {
  const out: FabricObject[] = [];
  if (d.picture) out.push(...(await base(d, 0.1)));
  else if (d.photo) out.push(await gradientBackground(d), ...(await cover(d.photo, d, 0.1)));
  else {
    out.push(await gradientBackground(d));
    const size = d.H * 0.42;
    out.push(emojiText(d.emoji, size, d.W / 2 - size * 0.7, d.H * 0.08, -6));
  }
  const barH = d.H * (d.W / d.H >= 1.15 ? 0.36 : 0.3);
  out.push(shape(new Rect({ left: 0, top: d.H - barH, width: d.W, height: barH }), '#000000'));
  out[out.length - 1].set('opacity', 0.78);
  const accentLine = shape(new Rect({ left: 0, top: d.H - barH - d.H * 0.012, width: d.W, height: d.H * 0.012 }), d.palette.accent);
  out.push(accentLine);
  const m = Math.min(d.W, d.H) * 0.05;
  if (d.copy.badge) out.push(...badge(d.copy.badge, { x: d.rtl ? d.W - m : m, y: m, rtl: d.rtl }, d, d.palette.accent === '#000000' ? '#ef4444' : d.palette.accent));
  out.push(text(d.copy.headline, { x: m, y: d.H - barH + m * 0.6, w: d.W - m * 2, h: barH - m * 1.2 }, d, { fill: '#ffffff', fill2: undefined, stroke: null, effect: 'none', font: d.font, maxSize: d.H * 0.2 }));
  return out;
};

/** A giant number (or emoji) next to the title. */
const bigNumber: Layout = async (d) => {
  const r = regions(d, 0.58);
  const out = await base(d);
  if (d.copy.number) {
    out.push(
      text(d.copy.number, r.media, d, { fill: d.palette.accent, fill2: d.palette.text2, stroke: d.palette.ink, effect: 'hard', effectColor: '#000000', align: 'center', font: 'Anton', maxSize: d.H * 0.75 })
    );
  } else {
    out.push(...(await mediaOrEmoji(d, r.media, { circle: true })));
  }
  out.push(text(d.copy.headline, r.text, d, { fill: d.palette.text, stroke: d.palette.ink, effect: 'shadow', effectColor: d.palette.glow, font: d.font, maxSize: d.H * 0.2 }));
  return out;
};

/** Title on a highlighter strip with an arrow pointing at the photo. */
const sticker: Layout = async (d) => {
  const r = regions(d, 0.55);
  const out = await base(d);
  out.push(...(await mediaOrEmoji(d, r.media, { tilt: d.rtl ? -4 : 4 })));
  const hl = d.palette.accent;
  const ink = textOn(hl, '#111111', '#ffffff');
  const head = text(d.copy.headline, { ...r.text, h: r.text.h * 0.7 }, d, { fill: ink, highlight: hl, effect: 'hard', effectColor: '#000000', font: d.font, maxSize: d.H * 0.18 });
  head.rotate(d.rtl ? 3 : -3);
  out.push(head);
  if (!r.stacked) {
    const a = Math.min(d.W, d.H) * 0.2;
    const ax = d.rtl ? r.media.x + r.media.w - a * 0.6 : r.media.x - a * 0.4;
    const arrow = shape(
      new Polygon([
        { x: 0, y: a * 0.3 },
        { x: a * 0.9, y: a * 0.3 },
        { x: a * 0.9, y: 0 },
        { x: a * 1.5, y: a * 0.5 },
        { x: a * 0.9, y: a },
        { x: a * 0.9, y: a * 0.7 },
        { x: 0, y: a * 0.7 }
      ]),
      d.palette.text2,
      { stroke: true, strokeColor: '#000000', strokeWidth: 0.15, effect: 'shadow' },
      'arrow'
    );
    arrow.set({ left: ax, top: d.H * 0.62, flipX: d.rtl, angle: d.rtl ? 15 : -15 });
    arrow.setCoords();
    out.push(arrow);
  }
  if (d.copy.sub) out.push(text(d.copy.sub, { ...r.text, y: r.text.y + r.text.h * 0.72, h: r.text.h * 0.25 }, d, { fill: '#ffffff', effect: 'shadow', font: d.subFont, maxSize: d.H * 0.07 }));
  return out;
};

export const LAYOUTS: Layout[] = [heroSide, centerStack, splitPanel, bottomBar, bigNumber, sticker];
