import { FabricImage, FabricObject, Gradient, Rect, Shadow, Textbox, filters } from 'fabric';
import type { AnimSpec } from './animation';
import { detectDirection, type TextDirection } from './textDirection';

export type ShapeKind = 'rect' | 'circle' | 'badge' | 'triangle' | 'star' | 'arrow' | 'line' | 'bubble';
export type EffectKind = 'none' | 'shadow' | 'glow' | 'hard';
export type AlignKind = 'start' | 'center' | 'end';

export interface Style {
  fillMode: 'solid' | 'gradient';
  fill: string;
  fill2: string;
  stroke: boolean;
  strokeColor: string;
  /** 0..1, scaled to the object's size. */
  strokeWidth: number;
  effect: EffectKind;
  effectColor: string;
  /** Text only: colour behind the letters. */
  highlight: string | null;
}

export interface ImageAdjust {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  /** Fractions of the original image cut from each side. */
  crop: { l: number; t: number; r: number; b: number };
  /** Corner radius as a fraction of the shorter side (0..0.5). */
  radius: number;
  natural: { w: number; h: number };
}

/** Extra data we keep on each canvas object. */
export interface ObjectMeta {
  id: string;
  kind: 'background' | 'text' | 'image' | 'shape';
  shape?: ShapeKind;
  dirMode?: 'auto' | TextDirection;
  align?: AlignKind;
  fontFamily?: string;
  style?: Style;
  image?: ImageAdjust;
  anim?: AnimSpec;
  locked?: boolean;
}

export const META = 'tsMeta';

export function metaOf(obj: FabricObject | undefined | null): ObjectMeta | undefined {
  return obj ? ((obj as unknown as Record<string, unknown>)[META] as ObjectMeta | undefined) : undefined;
}

export function setMeta(obj: FabricObject, meta: ObjectMeta): void {
  (obj as unknown as Record<string, unknown>)[META] = meta;
}

let idCounter = 0;
export function newId(): string {
  idCounter += 1;
  return `o${Date.now().toString(36)}${idCounter.toString(36)}`;
}

export const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

export const DEFAULT_IMAGE: Omit<ImageAdjust, 'natural'> = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  blur: 0,
  crop: { l: 0, t: 0, r: 0, b: 0 },
  radius: 0
};


/** Properties saved with every object, besides Fabric's own. */
export const SERIALISE_PROPS = [META, 'selectable', 'evented', 'hoverCursor', 'lockMovementX', 'lockMovementY'];

export function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) return hex;
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

export function textStyle(kind: 'heading' | 'sub' | 'body'): Style {
  if (kind === 'heading') {
    return { fillMode: 'solid', fill: '#ffffff', fill2: '#ffe45c', stroke: true, strokeColor: '#000000', strokeWidth: 0.36, effect: 'shadow', effectColor: '#000000', highlight: null };
  }
  if (kind === 'sub') {
    return { fillMode: 'solid', fill: '#ffe45c', fill2: '#ff9f1c', stroke: false, strokeColor: '#000000', strokeWidth: 0.2, effect: 'shadow', effectColor: '#000000', highlight: null };
  }
  return { fillMode: 'solid', fill: '#ffffff', fill2: '#cbd5e1', stroke: false, strokeColor: '#000000', strokeWidth: 0.2, effect: 'none', effectColor: '#000000', highlight: null };
}

export function shapeStyle(fill: string): Style {
  return { fillMode: 'solid', fill, fill2: '#ffffff', stroke: false, strokeColor: '#ffffff', strokeWidth: 0.2, effect: 'none', effectColor: '#000000', highlight: null };
}

/** Turn an object's style settings into Fabric properties. */
export function applyStyle(obj: FabricObject): void {
  const meta = metaOf(obj);
  const st = meta?.style;
  if (!meta || !st) return;
  const isText = obj instanceof Textbox;
  const size = isText ? (obj.fontSize ?? 64) : Math.min(obj.width ?? 100, obj.height ?? 100) * 0.35;

  if (meta.kind !== 'image') {
    obj.set(
      'fill',
      st.fillMode === 'gradient'
        ? new Gradient({
            type: 'linear',
            gradientUnits: 'percentage',
            coords: { x1: 0, y1: 0, x2: 0, y2: 1 },
            colorStops: [
              { offset: 0, color: st.fill },
              { offset: 1, color: st.fill2 }
            ]
          })
        : st.fill
    );
  }
  const strokePx = isText ? size * 0.25 * st.strokeWidth : 40 * st.strokeWidth;
  obj.set({ stroke: st.stroke ? st.strokeColor : undefined, strokeWidth: st.stroke ? Math.max(1, strokePx) : 0 });
  if (isText) obj.set({ paintFirst: 'stroke', strokeLineJoin: 'round' });

  let shadow: Shadow | null = null;
  if (st.effect === 'shadow') shadow = new Shadow({ color: withAlpha(st.effectColor, 0.6), blur: size * 0.2, offsetX: 0, offsetY: size * 0.07 });
  if (st.effect === 'glow') shadow = new Shadow({ color: st.effectColor, blur: size * 0.5, offsetX: 0, offsetY: 0 });
  if (st.effect === 'hard') shadow = new Shadow({ color: st.effectColor, blur: 0, offsetX: size * 0.07, offsetY: size * 0.07 });
  obj.set('shadow', shadow);
  if (obj instanceof Textbox) obj.set('textBackgroundColor', st.highlight ?? '');
}

/** Direction and alignment: 'start' means left for LTR text and right for RTL text. */
export function applyTextLayout(t: Textbox): void {
  const meta = metaOf(t);
  const dir = meta?.dirMode && meta.dirMode !== 'auto' ? meta.dirMode : detectDirection(t.text ?? '');
  const align = meta?.align ?? 'start';
  const textAlign = align === 'center' ? 'center' : (align === 'start') === (dir === 'ltr') ? 'left' : 'right';
  t.set({ direction: dir, textAlign });
}

/** Filters, crop and rounded corners for photos. */
export function applyImage(img: FabricImage): void {
  const adj = metaOf(img)?.image;
  if (!adj) return;
  const list = [];
  if (adj.brightness) list.push(new filters.Brightness({ brightness: adj.brightness }));
  if (adj.contrast) list.push(new filters.Contrast({ contrast: adj.contrast }));
  if (adj.saturation) list.push(new filters.Saturation({ saturation: adj.saturation }));
  if (adj.blur) list.push(new filters.Blur({ blur: adj.blur }));
  img.filters = list;
  img.applyFilters();

  const { w, h } = adj.natural;
  const { l, t, r, b } = adj.crop;
  const center = img.getCenterPoint();
  const cw = Math.max(8, w * (1 - l - r));
  const ch = Math.max(8, h * (1 - t - b));
  img.set({ cropX: w * l, cropY: h * t, width: cw, height: ch });
  img.set(
    'clipPath',
    adj.radius > 0
      ? new Rect({ width: cw, height: ch, rx: Math.min(cw, ch) * adj.radius, ry: Math.min(cw, ch) * adj.radius, originX: 'center', originY: 'center', left: 0, top: 0 })
      : undefined
  );
  img.setPositionByOrigin(center, 'center', 'center');
  img.setCoords();
}