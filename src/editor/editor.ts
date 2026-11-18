import {
  Canvas,
  Circle,
  FabricImage,
  FabricObject,
  Gradient,
  Path,
  Point,
  Polygon,
  Rect,
  Shadow,
  Textbox,
  config,
  filters,
  util,
  type TPointerEventInfo
} from 'fabric';
import { create } from 'zustand';
import { detectDirection, type TextDirection } from './textDirection';
import { ensureFont, fontForText, fontStack, fontWeight } from './fonts';
import { PLATFORMS, platformById, type PlatformId } from './platforms';
import { NO_ANIM, animStateAt, autoAnimate, type AnimSpec } from './animation';

// Fabric 7 positions objects by their centre by default; this editor works in top-left coordinates.
FabricObject.ownDefaults.originX = 'left';
FabricObject.ownDefaults.originY = 'top';
FabricObject.ownDefaults.cornerStyle = 'circle';
FabricObject.ownDefaults.cornerColor = '#ffffff';
FabricObject.ownDefaults.cornerStrokeColor = '#5b4cf0';
FabricObject.ownDefaults.borderColor = '#5b4cf0';
FabricObject.ownDefaults.transparentCorners = false;
FabricObject.ownDefaults.cornerSize = 14;
FabricObject.ownDefaults.borderScaleFactor = 2;
// Allow image filters on large photos (we downscale uploads to at most 3000 px).
config.configure({ textureSize: 4096 });

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

const META = 'tsMeta';

export function metaOf(obj: FabricObject | undefined | null): ObjectMeta | undefined {
  return obj ? ((obj as unknown as Record<string, unknown>)[META] as ObjectMeta | undefined) : undefined;
}

function setMeta(obj: FabricObject, meta: ObjectMeta): void {
  (obj as unknown as Record<string, unknown>)[META] = meta;
}

let idCounter = 0;
function newId(): string {
  idCounter += 1;
  return `o${Date.now().toString(36)}${idCounter.toString(36)}`;
}

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

const DEFAULT_IMAGE: Omit<ImageAdjust, 'natural'> = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  blur: 0,
  crop: { l: 0, t: 0, r: 0, b: 0 },
  radius: 0
};

/** Selection snapshot that React panels read. */
export interface SelectionInfo {
  id: string;
  kind: ObjectMeta['kind'];
  shape?: ShapeKind;
  multiple: boolean;
  fontFamily?: string;
  fontSize?: number;
  charSpacing?: number;
  lineHeight?: number;
  align?: AlignKind;
  dirMode?: 'auto' | TextDirection;
  style?: Style;
  image?: ImageAdjust;
  opacity: number;
  anim: AnimSpec;
}

export interface SelectionPatch {
  fontFamily?: string;
  fontSize?: number;
  charSpacing?: number;
  lineHeight?: number;
  align?: AlignKind;
  dirMode?: 'auto' | TextDirection;
  style?: Partial<Style>;
  image?: Partial<Omit<ImageAdjust, 'crop' | 'natural'>> & { crop?: Partial<ImageAdjust['crop']> };
  opacity?: number;
  anim?: Partial<AnimSpec>;
}

export interface LayerInfo {
  id: string;
  kind: ObjectMeta['kind'];
  shape?: ShapeKind;
  text?: string;
  visible: boolean;
  locked: boolean;
}

interface EditorUiState {
  selection: SelectionInfo | null;
  layers: LayerInfo[];
  canUndo: boolean;
  canRedo: boolean;
  platform: PlatformId;
  background: string;
  /** Animated clip length in seconds. */
  clipLength: number;
  playing: boolean;
  playTime: number;
  hasAnimation: boolean;
}

export const useEditorUi = create<EditorUiState>(() => ({
  selection: null,
  layers: [],
  canUndo: false,
  canRedo: false,
  platform: 'youtube',
  background: '#5b4cf0',
  clipLength: 4,
  playing: false,
  playTime: 0,
  hasAnimation: false
}));

const HISTORY_LIMIT = 60;
const SERIALISE_PROPS = [META, 'selectable', 'evented', 'hoverCursor', 'lockMovementX', 'lockMovementY'];
const SNAP_PX = 8;

/** Resting state of an object, saved while an animation plays. */
interface BaseState {
  obj: FabricObject;
  left: number;
  top: number;
  scaleX: number;
  scaleY: number;
  angle: number;
  opacity: number;
  center: { x: number; y: number };
  text?: string;
  graphemes?: string[];
}

function graphemes(text: string): string[] {
  const Seg = (Intl as unknown as { Segmenter?: new (l?: string, o?: { granularity: string }) => { segment: (s: string) => Iterable<{ segment: string }> } }).Segmenter;
  if (Seg) return Array.from(new Seg(undefined, { granularity: 'grapheme' }).segment(text), (s) => s.segment);
  return Array.from(text);
}

function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) return hex;
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

/**
 * Owns the Fabric canvas: objects, selection, history, animation and export.
 * React talks to it through methods; it reports back through `useEditorUi`.
 */
export class Editor {
  readonly canvas: Canvas;
  private width: number;
  private height: number;
  private history: string[] = [];
  private future: string[] = [];
  private restoring = false;
  private animate: () => boolean;
  private guides: { x?: number; y?: number } = {};
  private clipboard: FabricObject[] = [];
  private playback: { raf: number; base: BaseState[] } | null = null;
  /** Object URLs for uploaded images; kept for the session so undo can bring images back. */
  private imageUrls: string[] = [];

  constructor(el: HTMLCanvasElement, platform: PlatformId, animate: () => boolean) {
    const p = platformById(platform);
    this.width = p.width;
    this.height = p.height;
    this.animate = animate;
    this.canvas = new Canvas(el, {
      width: p.width,
      height: p.height,
      preserveObjectStacking: true,
      selectionColor: 'rgba(91,76,240,0.12)',
      selectionBorderColor: '#5b4cf0',
      backgroundColor: '#111'
    });

    const sync = () => this.syncSelection();
    this.canvas.on('selection:created', sync);
    this.canvas.on('selection:updated', sync);
    this.canvas.on('selection:cleared', sync);
    this.canvas.on('object:modified', () => {
      this.guides = {};
      this.commit();
    });
    this.canvas.on('object:moving', (e) => this.snap(e.target));
    this.canvas.on('mouse:up', () => {
      if (this.guides.x !== undefined || this.guides.y !== undefined) {
        this.guides = {};
        this.canvas.requestRenderAll();
      }
    });
    this.canvas.on('after:render', (e) => this.drawGuides((e as unknown as { ctx: CanvasRenderingContext2D }).ctx));
    this.canvas.on('text:changed', (e) => {
      const target = e.target as Textbox;
      const meta = metaOf(target);
      if (meta?.fontFamily) {
        const family = fontForText(meta.fontFamily, detectDirection(target.text ?? '') === 'rtl');
        if (family !== meta.fontFamily) {
          meta.fontFamily = family;
          target.set({ fontFamily: fontStack(family), fontWeight: fontWeight(family) });
          void ensureFont(family, target.text).then(() => this.canvas.requestRenderAll());
        }
      }
      this.applyTextLayout(target);
      this.canvas.requestRenderAll();
    });
    this.canvas.on('text:editing:exited', () => this.commit());
    this.canvas.on('mouse:dblclick', (e: TPointerEventInfo) => {
      if (!e.target) this.canvas.discardActiveObject();
    });
  }

  get size() {
    return { width: this.width, height: this.height };
  }

  /** Fit the drawing into a box on screen; the design keeps its real pixel size. */
  fit(boxW: number, boxH: number): void {
    const s = Math.max(0.05, Math.min(boxW / this.width, boxH / this.height));
    this.canvas.setDimensions({ width: Math.round(this.width * s), height: Math.round(this.height * s) });
    this.canvas.setZoom(s);
    this.canvas.requestRenderAll();
  }

  private objects(): FabricObject[] {
    return this.canvas.getObjects().filter((o) => metaOf(o)?.kind !== 'background');
  }

  private byId(id: string): FabricObject | undefined {
    return this.canvas.getObjects().find((o) => metaOf(o)?.id === id);
  }

  // ---------- starter design ----------

  async loadStarter(texts: { heading: string; sub: string }, accent: string, accent2: string): Promise<void> {
    await Promise.all([ensureFont('Anton', texts.heading), ensureFont('Vazirmatn', texts.heading + texts.sub)]);
    this.canvas.clear();
    this.addBackground(accent, accent2);
    const W = this.width;
    const H = this.height;
    const blobA = new Circle({ radius: H * 0.55, left: W * 0.62, top: -H * 0.25, opacity: 0.08 });
    setMeta(blobA, { id: newId(), kind: 'shape', shape: 'circle', style: this.shapeStyle('#ffffff'), anim: { ...NO_ANIM } });
    const blobB = new Circle({ radius: H * 0.35, left: -H * 0.15, top: H * 0.6, opacity: 0.12 });
    setMeta(blobB, { id: newId(), kind: 'shape', shape: 'circle', style: this.shapeStyle('#000000'), anim: { ...NO_ANIM } });
    this.applyStyle(blobA);
    this.applyStyle(blobB);
    this.canvas.add(blobA, blobB);
    const heading = this.makeText(texts.heading, 'heading');
    heading.set({ left: W * 0.07, top: H * 0.3, width: W * 0.8, fontSize: H * 0.17 });
    this.applyStyle(heading);
    const sub = this.makeText(texts.sub, 'sub');
    sub.set({ left: W * 0.07, top: H * 0.6, width: W * 0.8 });
    this.canvas.add(heading, sub);
    this.entrance(heading, 0);
    this.entrance(sub, 120);
    this.canvas.requestRenderAll();
    this.resetHistory();
  }

  private addBackground(a: string, b: string): void {
    const bg = new Rect({
      left: 0,
      top: 0,
      width: this.width,
      height: this.height,
      selectable: false,
      evented: false,
      hoverCursor: 'default'
    });
    bg.set('fill', this.backgroundGradient(a, b));
    setMeta(bg, { id: 'background', kind: 'background' });
    this.canvas.add(bg);
    this.canvas.sendObjectToBack(bg);
    useEditorUi.setState({ background: a });
  }

  private backgroundGradient(a: string, b: string) {
    return new Gradient({
      type: 'linear',
      coords: { x1: 0, y1: 0, x2: this.width, y2: this.height },
      colorStops: [
        { offset: 0, color: a },
        { offset: 1, color: b }
      ]
    });
  }

  setBackground(a: string, b: string): void {
    const bg = this.byId('background');
    if (bg) {
      bg.set('fill', this.backgroundGradient(a, b));
      useEditorUi.setState({ background: a });
      this.canvas.requestRenderAll();
      this.commit();
    }
  }

  // ---------- styles ----------

  private textStyle(kind: 'heading' | 'sub' | 'body'): Style {
    if (kind === 'heading') {
      return { fillMode: 'solid', fill: '#ffffff', fill2: '#ffe45c', stroke: true, strokeColor: '#000000', strokeWidth: 0.36, effect: 'shadow', effectColor: '#000000', highlight: null };
    }
    if (kind === 'sub') {
      return { fillMode: 'solid', fill: '#ffe45c', fill2: '#ff9f1c', stroke: false, strokeColor: '#000000', strokeWidth: 0.2, effect: 'shadow', effectColor: '#000000', highlight: null };
    }
    return { fillMode: 'solid', fill: '#ffffff', fill2: '#cbd5e1', stroke: false, strokeColor: '#000000', strokeWidth: 0.2, effect: 'none', effectColor: '#000000', highlight: null };
  }

  private shapeStyle(fill: string): Style {
    return { fillMode: 'solid', fill, fill2: '#ffffff', stroke: false, strokeColor: '#ffffff', strokeWidth: 0.2, effect: 'none', effectColor: '#000000', highlight: null };
  }

  /** Turn an object's style settings into Fabric properties. */
  private applyStyle(obj: FabricObject): void {
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

  // ---------- adding things ----------

  private makeText(text: string, kind: 'heading' | 'sub' | 'body'): Textbox {
    const H = this.height;
    const preset = {
      heading: { family: 'Anton', size: H * 0.14 },
      sub: { family: 'Vazirmatn', size: H * 0.07 },
      body: { family: 'Vazirmatn', size: H * 0.045 }
    }[kind];
    const family = fontForText(preset.family, detectDirection(text) === 'rtl');
    const t = new Textbox(text, {
      fontFamily: fontStack(family),
      fontWeight: fontWeight(family),
      fontSize: preset.size,
      lineHeight: 1.05,
      charSpacing: 0
    });
    setMeta(t, { id: newId(), kind: 'text', dirMode: 'auto', align: 'start', fontFamily: family, style: this.textStyle(kind), anim: { ...NO_ANIM } });
    this.applyStyle(t);
    this.applyTextLayout(t);
    return t;
  }

  /** Direction and alignment: 'start' means left for LTR text and right for RTL text. */
  private applyTextLayout(t: Textbox): void {
    const meta = metaOf(t);
    const dir = meta?.dirMode && meta.dirMode !== 'auto' ? meta.dirMode : detectDirection(t.text ?? '');
    const align = meta?.align ?? 'start';
    const textAlign = align === 'center' ? 'center' : (align === 'start') === (dir === 'ltr') ? 'left' : 'right';
    t.set({ direction: dir, textAlign });
  }

  async addText(kind: 'heading' | 'sub' | 'body', text: string): Promise<void> {
    const t = this.makeText(text, kind);
    await ensureFont(metaOf(t)?.fontFamily ?? 'Vazirmatn', text);
    t.set({ width: this.width * 0.7 });
    t.initDimensions();
    this.placeCentered(t);
    this.add(t);
  }

  private shapeObject(kind: ShapeKind): FabricObject {
    const H = this.height;
    const u = H * 0.3;
    switch (kind) {
      case 'rect':
        return new Rect({ width: u * 1.6, height: u, rx: u * 0.1, ry: u * 0.1 });
      case 'circle':
        return new Circle({ radius: u * 0.55 });
      case 'badge':
        return new Rect({ width: u * 1.4, height: u * 0.44, rx: u * 0.22, ry: u * 0.22 });
      case 'triangle':
        return new Polygon([
          { x: u * 0.55, y: 0 },
          { x: u * 1.1, y: u },
          { x: 0, y: u }
        ]);
      case 'star': {
        const pts = [];
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? u * 0.6 : u * 0.26;
          const a = (Math.PI / 5) * i - Math.PI / 2;
          pts.push({ x: u * 0.6 + r * Math.cos(a), y: u * 0.6 + r * Math.sin(a) });
        }
        return new Polygon(pts);
      }
      case 'arrow':
        return new Polygon([
          { x: 0, y: u * 0.3 },
          { x: u * 0.9, y: u * 0.3 },
          { x: u * 0.9, y: 0 },
          { x: u * 1.5, y: u * 0.5 },
          { x: u * 0.9, y: u },
          { x: u * 0.9, y: u * 0.7 },
          { x: 0, y: u * 0.7 }
        ]);
      case 'line':
        return new Rect({ width: u * 1.8, height: Math.max(6, u * 0.06), rx: u * 0.03, ry: u * 0.03 });
      case 'bubble':
        return new Path(
          `M ${u * 0.15} 0 H ${u * 1.45} Q ${u * 1.6} 0 ${u * 1.6} ${u * 0.15} V ${u * 0.75} Q ${u * 1.6} ${u * 0.9} ${u * 1.45} ${u * 0.9} H ${u * 0.55} L ${u * 0.25} ${u * 1.15} L ${u * 0.32} ${u * 0.9} H ${u * 0.15} Q 0 ${u * 0.9} 0 ${u * 0.75} V ${u * 0.15} Q 0 0 ${u * 0.15} 0 Z`
        );
    }
  }

  addShape(kind: ShapeKind, accent: string): void {
    const shape = this.shapeObject(kind);
    const fill = kind === 'badge' ? '#ef4444' : kind === 'bubble' ? '#ffffff' : kind === 'arrow' || kind === 'star' ? '#ffe45c' : accent;
    setMeta(shape, { id: newId(), kind: 'shape', shape: kind, style: this.shapeStyle(fill), anim: { ...NO_ANIM } });
    this.applyStyle(shape);
    this.placeCentered(shape);
    this.add(shape);
  }

  /** Shrink very large photos so editing stays fast; keep transparency. */
  private async prepareImage(file: Blob): Promise<{ url: string; w: number; h: number }> {
    const MAX = 3000;
    const bitmap = await createImageBitmap(file);
    const s = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height));
    let blob: Blob = file;
    const w = Math.round(bitmap.width * s);
    const h = Math.round(bitmap.height * s);
    if (s < 1) {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      c.getContext('2d')!.drawImage(bitmap, 0, 0, w, h);
      blob = await new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('resize failed'))), 'image/webp', 0.95));
    }
    bitmap.close();
    const url = URL.createObjectURL(blob);
    this.imageUrls.push(url);
    return { url, w, h };
  }

  async addImage(file: Blob): Promise<void> {
    const { url, w, h } = await this.prepareImage(file);
    const img = await FabricImage.fromURL(url);
    const s = Math.min(1, (this.width * 0.6) / w, (this.height * 0.8) / h);
    img.scale(s);
    setMeta(img, {
      id: newId(),
      kind: 'image',
      style: this.shapeStyle('#ffffff'),
      image: { ...clone(DEFAULT_IMAGE), natural: { w, h } },
      anim: { ...NO_ANIM }
    });
    this.applyStyle(img);
    this.placeCentered(img);
    this.add(img);
  }

  private add(obj: FabricObject): void {
    this.canvas.add(obj);
    this.canvas.setActiveObject(obj);
    this.entrance(obj, 0);
    this.commit();
  }

  private placeCentered(obj: FabricObject): void {
    const w = obj.getScaledWidth();
    const h = obj.getScaledHeight();
    obj.set({ left: (this.width - w) / 2, top: (this.height - h) / 2 });
    obj.setCoords();
  }

  /** Small pop-in animation for new objects in the editor. */
  private entrance(obj: FabricObject, delay: number): void {
    if (!this.animate()) return;
    const finalTop = obj.top ?? 0;
    const finalScaleX = obj.scaleX ?? 1;
    const finalScaleY = obj.scaleY ?? 1;
    const finalOpacity = obj.opacity ?? 1;
    obj.set({ opacity: 0 });
    util.animate({
      startValue: 0,
      endValue: 1,
      duration: 520,
      delay,
      easing: util.ease.easeOutBack,
      onChange: (v: number) => {
        obj.set({
          opacity: Math.min(1, Math.max(0, v)) * finalOpacity,
          top: finalTop + this.height * 0.04 * (1 - v),
          scaleX: finalScaleX * (0.92 + 0.08 * v),
          scaleY: finalScaleY * (0.92 + 0.08 * v)
        });
        this.canvas.requestRenderAll();
      },
      onComplete: () => {
        obj.set({ opacity: finalOpacity, top: finalTop, scaleX: finalScaleX, scaleY: finalScaleY });
        obj.setCoords();
        this.canvas.requestRenderAll();
      }
    });
  }

  // ---------- snapping ----------

  private snap(target: FabricObject | undefined): void {
    if (!target) return;
    const zoom = this.canvas.getZoom() || 1;
    const thr = SNAP_PX / zoom;
    const W = this.width;
    const H = this.height;
    const c = target.getCenterPoint();
    const hw = target.getScaledWidth() / 2;
    const hh = target.getScaledHeight() / 2;
    const margin = Math.min(W, H) * 0.05;
    const xs: [number, number][] = [
      [W / 2, 0],
      [margin, hw],
      [W - margin, -hw],
      [0, hw],
      [W, -hw]
    ];
    const ys: [number, number][] = [
      [H / 2, 0],
      [margin, hh],
      [H - margin, -hh],
      [0, hh],
      [H, -hh]
    ];
    this.guides = {};
    let x = c.x;
    let y = c.y;
    for (const [line, off] of xs) {
      if (Math.abs(c.x - off - line) < thr) {
        x = line + off;
        this.guides.x = line;
        break;
      }
    }
    for (const [line, off] of ys) {
      if (Math.abs(c.y - off - line) < thr) {
        y = line + off;
        this.guides.y = line;
        break;
      }
    }
    if (x !== c.x || y !== c.y) {
      target.setPositionByOrigin(c.setXY(x, y), 'center', 'center');
      target.setCoords();
    }
  }

  private drawGuides(ctx: CanvasRenderingContext2D | undefined): void {
    if (!ctx || (this.guides.x === undefined && this.guides.y === undefined)) return;
    const vpt = this.canvas.viewportTransform;
    ctx.save();
    ctx.transform(vpt[0], vpt[1], vpt[2], vpt[3], vpt[4], vpt[5]);
    ctx.strokeStyle = '#ff2d87';
    ctx.lineWidth = 1.5 / (vpt[0] || 1);
    ctx.setLineDash([8 / (vpt[0] || 1), 6 / (vpt[0] || 1)]);
    ctx.beginPath();
    if (this.guides.x !== undefined) {
      ctx.moveTo(this.guides.x, 0);
      ctx.lineTo(this.guides.x, this.height);
    }
    if (this.guides.y !== undefined) {
      ctx.moveTo(0, this.guides.y);
      ctx.lineTo(this.width, this.guides.y);
    }
    ctx.stroke();
    ctx.restore();
  }

  // ---------- selection ----------

  private active(): FabricObject | undefined {
    return this.canvas.getActiveObject() ?? undefined;
  }

  private activeList(): FabricObject[] {
    return this.canvas.getActiveObjects().filter((o) => metaOf(o) && metaOf(o)!.kind !== 'background');
  }

  syncSelection(): void {
    const list = this.activeList();
    const obj = list.length === 1 ? list[0] : undefined;
    const meta = metaOf(obj);
    if (!list.length) {
      useEditorUi.setState({ selection: null });
      return;
    }
    const target = obj ?? this.active()!;
    const m = meta ?? metaOf(list[0])!;
    useEditorUi.setState({
      selection: {
        id: m.id,
        kind: m.kind,
        shape: m.shape,
        multiple: list.length > 1,
        fontFamily: m.fontFamily,
        fontSize: obj instanceof Textbox ? Math.round(obj.fontSize ?? 0) : undefined,
        charSpacing: obj instanceof Textbox ? obj.charSpacing ?? 0 : undefined,
        lineHeight: obj instanceof Textbox ? obj.lineHeight ?? 1 : undefined,
        align: m.align,
        dirMode: m.dirMode,
        style: m.style ? { ...m.style } : undefined,
        image: m.image ? clone(m.image) : undefined,
        opacity: target.opacity ?? 1,
        anim: { ...(m.anim ?? NO_ANIM) }
      }
    });
  }

  selectById(id: string): void {
    const obj = this.byId(id);
    if (!obj || metaOf(obj)?.locked || !obj.visible) return;
    this.canvas.setActiveObject(obj);
    this.canvas.requestRenderAll();
    this.syncSelection();
  }

  /** Apply a change to every selected object. `commit` false is used while a slider is being dragged. */
  async updateSelection(patch: SelectionPatch, commit = true): Promise<void> {
    const list = this.activeList();
    if (!list.length) return;
    for (const obj of list) {
      const meta = metaOf(obj)!;
      if (patch.opacity !== undefined) obj.set('opacity', patch.opacity);
      if (patch.anim) meta.anim = { ...(meta.anim ?? NO_ANIM), ...patch.anim };
      if (patch.style && meta.style) meta.style = { ...meta.style, ...patch.style };
      if (obj instanceof Textbox) {
        if (patch.fontFamily) {
          await ensureFont(patch.fontFamily, obj.text);
          obj.set({ fontFamily: fontStack(patch.fontFamily), fontWeight: fontWeight(patch.fontFamily) });
          meta.fontFamily = patch.fontFamily;
        }
        if (patch.fontSize) obj.set('fontSize', patch.fontSize);
        if (patch.charSpacing !== undefined) obj.set('charSpacing', patch.charSpacing);
        if (patch.lineHeight !== undefined) obj.set('lineHeight', patch.lineHeight);
        if (patch.dirMode) meta.dirMode = patch.dirMode;
        if (patch.align) meta.align = patch.align;
        this.applyTextLayout(obj);
        obj.initDimensions();
      }
      if (obj instanceof FabricImage && meta.image && patch.image) {
        const { crop, ...rest } = patch.image;
        meta.image = { ...meta.image, ...rest, crop: { ...meta.image.crop, ...(crop ?? {}) } };
        this.applyImage(obj);
      }
      if (patch.style || patch.fontSize) this.applyStyle(obj);
      obj.setCoords();
    }
    this.canvas.requestRenderAll();
    this.syncSelection();
    if (patch.anim) this.publishAnimation();
    if (commit) this.commit();
  }

  /** Filters, crop and rounded corners for photos. */
  private applyImage(img: FabricImage): void {
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

  resetImage(): void {
    const obj = this.active();
    const meta = metaOf(obj);
    if (!(obj instanceof FabricImage) || !meta?.image) return;
    meta.image = { ...clone(DEFAULT_IMAGE), natural: meta.image.natural };
    this.applyImage(obj);
    this.canvas.requestRenderAll();
    this.syncSelection();
    this.commit();
  }

  deleteSelection(): void {
    const objs = this.activeList();
    if (!objs.length) return;
    this.canvas.discardActiveObject();
    objs.forEach((o) => this.canvas.remove(o));
    this.canvas.requestRenderAll();
    this.syncSelection();
    this.commit();
  }

  // ---------- object tools ----------

  async duplicate(): Promise<void> {
    await this.copy();
    await this.paste();
  }

  async copy(): Promise<void> {
    this.clipboard = await Promise.all(this.activeList().map((o) => o.clone([META])));
  }

  async paste(): Promise<boolean> {
    if (!this.clipboard.length) return false;
    const offset = Math.min(this.width, this.height) * 0.03;
    const copies = await Promise.all(this.clipboard.map((o) => o.clone([META])));
    this.canvas.discardActiveObject();
    for (const c of copies) {
      const meta = clone(metaOf(c)!);
      meta.id = newId();
      meta.locked = false;
      setMeta(c, meta);
      c.set({ left: (c.left ?? 0) + offset, top: (c.top ?? 0) + offset, selectable: true, evented: true });
      this.canvas.add(c);
    }
    // next paste lands a step further
    this.clipboard.forEach((o) => o.set({ left: (o.left ?? 0) + offset, top: (o.top ?? 0) + offset }));
    if (copies.length === 1) this.canvas.setActiveObject(copies[0]);
    this.canvas.requestRenderAll();
    this.syncSelection();
    this.commit();
    return true;
  }

  nudge(dx: number, dy: number): void {
    const obj = this.active();
    if (!obj || !this.activeList().length) return;
    obj.set({ left: (obj.left ?? 0) + dx, top: (obj.top ?? 0) + dy });
    obj.setCoords();
    this.canvas.requestRenderAll();
    this.commitSoon();
  }

  private commitTimer = 0;
  private commitSoon(): void {
    window.clearTimeout(this.commitTimer);
    this.commitTimer = window.setTimeout(() => this.commit(), 400);
  }

  order(where: 'forward' | 'backward' | 'front' | 'back'): void {
    const obj = this.active();
    if (!obj || !this.activeList().length) return;
    if (where === 'forward') this.canvas.bringObjectForward(obj);
    if (where === 'backward') this.canvas.sendObjectBackwards(obj);
    if (where === 'front') this.canvas.bringObjectToFront(obj);
    if (where === 'back') this.canvas.sendObjectToBack(obj);
    this.keepBackgroundAtBack();
    this.canvas.requestRenderAll();
    this.commit();
  }

  private keepBackgroundAtBack(): void {
    const bg = this.byId('background');
    if (bg) this.canvas.sendObjectToBack(bg);
  }

  align(where: 'left' | 'hcenter' | 'right' | 'top' | 'vcenter' | 'bottom'): void {
    const obj = this.active();
    if (!obj || !this.activeList().length) return;
    const w = obj.getScaledWidth();
    const h = obj.getScaledHeight();
    const c = obj.getCenterPoint();
    const W = this.width;
    const H = this.height;
    if (where === 'left') c.x = w / 2;
    if (where === 'hcenter') c.x = W / 2;
    if (where === 'right') c.x = W - w / 2;
    if (where === 'top') c.y = h / 2;
    if (where === 'vcenter') c.y = H / 2;
    if (where === 'bottom') c.y = H - h / 2;
    obj.setPositionByOrigin(c, 'center', 'center');
    obj.setCoords();
    this.canvas.requestRenderAll();
    this.commit();
  }

  flip(): void {
    const list = this.activeList();
    list.forEach((o) => o.set('flipX', !o.flipX));
    if (list.length) {
      this.canvas.requestRenderAll();
      this.commit();
    }
  }

  // ---------- layers ----------

  private publishLayers(): void {
    const layers: LayerInfo[] = this.objects()
      .map((o) => {
        const m = metaOf(o)!;
        return {
          id: m.id,
          kind: m.kind,
          shape: m.shape,
          text: o instanceof Textbox ? (o.text ?? '').slice(0, 40) : undefined,
          visible: o.visible !== false,
          locked: !!m.locked
        };
      })
      .reverse();
    useEditorUi.setState({ layers });
  }

  setVisible(id: string, visible: boolean): void {
    const obj = this.byId(id);
    if (!obj) return;
    if (!visible && this.activeList().includes(obj)) this.canvas.discardActiveObject();
    obj.set('visible', visible);
    this.canvas.requestRenderAll();
    this.commit();
  }

  setLocked(id: string, locked: boolean): void {
    const obj = this.byId(id);
    const meta = metaOf(obj);
    if (!obj || !meta) return;
    meta.locked = locked;
    obj.set({ selectable: !locked, evented: !locked, hoverCursor: locked ? 'default' : null });
    if (locked && this.activeList().includes(obj)) this.canvas.discardActiveObject();
    this.canvas.requestRenderAll();
    this.syncSelection();
    this.commit();
  }

  /** Reorder from the layers list (top of the list = front). */
  reorder(idsTopFirst: string[], commit: boolean): void {
    const bottomFirst = [...idsTopFirst].reverse();
    bottomFirst.forEach((id, i) => {
      const obj = this.byId(id);
      if (obj) this.canvas.moveObjectTo(obj, i + 1);
    });
    this.keepBackgroundAtBack();
    this.canvas.requestRenderAll();
    if (commit) this.commit();
    else this.publishLayers();
  }

  // ---------- platform sizes ----------

  /** Move to another platform size, keeping every object's relative position. */
  resizeTo(platform: PlatformId): void {
    this.stop();
    const p = platformById(platform);
    const sx = p.width / this.width;
    const sy = p.height / this.height;
    const s = Math.min(sx, sy);
    this.canvas.discardActiveObject();
    for (const obj of this.canvas.getObjects()) {
      if (metaOf(obj)?.kind === 'background') {
        obj.set({ width: p.width, height: p.height });
        continue;
      }
      const c = obj.getCenterPoint();
      obj.set({ scaleX: (obj.scaleX ?? 1) * s, scaleY: (obj.scaleY ?? 1) * s });
      obj.setPositionByOrigin(c.setXY(c.x * sx, c.y * sy), 'center', 'center');
      obj.setCoords();
    }
    this.width = p.width;
    this.height = p.height;
    const bg = this.byId('background');
    const fill = bg?.fill;
    if (bg && fill instanceof Gradient) {
      const stops = fill.colorStops;
      bg.set('fill', this.backgroundGradient(stops[0]?.color ?? '#000', stops[stops.length - 1]?.color ?? '#000'));
    }
    useEditorUi.setState({ platform });
    this.commit();
  }

  // ---------- animation ----------

  private publishAnimation(): void {
    const specs = this.objects().map((o) => metaOf(o)?.anim ?? NO_ANIM);
    useEditorUi.setState({ hasAnimation: specs.some((a) => a.enter !== 'none' || a.loop !== 'none') });
  }

  setClipLength(seconds: number): void {
    useEditorUi.setState({ clipLength: Math.max(1, Math.min(15, seconds)) });
  }

  /** Give every object a staggered entrance. */
  autoAnimate(): void {
    const objs = this.objects().filter((o) => o.visible !== false);
    const specs = autoAnimate(objs.map((o) => metaOf(o)!.kind as 'text' | 'image' | 'shape'));
    objs.forEach((o, i) => {
      metaOf(o)!.anim = specs[i];
    });
    const end = specs.reduce((m, a) => Math.max(m, a.delay + a.duration), 0);
    if (useEditorUi.getState().clipLength < end + 1.5) this.setClipLength(Math.ceil(end + 1.5));
    this.syncSelection();
    this.publishAnimation();
    this.commit();
  }

  clearAnimations(): void {
    this.objects().forEach((o) => {
      metaOf(o)!.anim = { ...NO_ANIM };
    });
    this.syncSelection();
    this.publishAnimation();
    this.commit();
  }

  private captureBase(): BaseState[] {
    return this.objects().map((obj) => {
      const c = obj.getCenterPoint();
      const text = obj instanceof Textbox ? obj.text ?? '' : undefined;
      return {
        obj,
        left: obj.left ?? 0,
        top: obj.top ?? 0,
        scaleX: obj.scaleX ?? 1,
        scaleY: obj.scaleY ?? 1,
        angle: obj.angle ?? 0,
        opacity: obj.opacity ?? 1,
        center: { x: c.x, y: c.y },
        text,
        graphemes: text !== undefined ? graphemes(text) : undefined
      };
    });
  }

  /** Put every object where its animation says it is at time `t`. */
  private renderAt(base: BaseState[], t: number): void {
    for (const b of base) {
      const spec = metaOf(b.obj)?.anim ?? NO_ANIM;
      const s = animStateAt(spec, t, this.width, this.height);
      const obj = b.obj;
      if (obj instanceof Textbox && b.graphemes && b.text !== undefined) {
        const visible = s.reveal >= 1 ? b.text : b.graphemes.slice(0, Math.floor(b.graphemes.length * s.reveal)).join('');
        if (obj.text !== visible) {
          obj.set('text', visible);
          obj.initDimensions();
        }
      }
      obj.set({ scaleX: b.scaleX * s.scale, scaleY: b.scaleY * s.scale, angle: b.angle + s.rotate, opacity: b.opacity * s.opacity });
      if (spec.enter === 'typewriter') {
        // keep the first letter still while the text grows
        obj.set({ left: b.left + s.dx, top: b.top + s.dy });
      } else {
        obj.setPositionByOrigin(new Point(b.center.x + s.dx, b.center.y + s.dy), 'center', 'center');
      }
    }
  }

  private restoreBase(base: BaseState[]): void {
    for (const b of base) {
      if (b.obj instanceof Textbox && b.text !== undefined) {
        b.obj.set('text', b.text);
        b.obj.initDimensions();
      }
      b.obj.set({ left: b.left, top: b.top, scaleX: b.scaleX, scaleY: b.scaleY, angle: b.angle, opacity: b.opacity });
      b.obj.setCoords();
    }
  }

  get isPlaying(): boolean {
    return !!this.playback;
  }

  play(): void {
    if (this.playback) return;
    this.canvas.discardActiveObject();
    this.syncSelection();
    const base = this.captureBase();
    const start = performance.now();
    const tick = () => {
      if (!this.playback) return;
      const length = useEditorUi.getState().clipLength;
      const t = ((performance.now() - start) / 1000) % length;
      this.renderAt(base, t);
      this.canvas.renderAll();
      useEditorUi.setState({ playTime: t });
      this.playback.raf = requestAnimationFrame(tick);
    };
    this.playback = { raf: requestAnimationFrame(tick), base };
    this.canvas.selection = false;
    useEditorUi.setState({ playing: true, playTime: 0 });
  }

  stop(): void {
    if (!this.playback) return;
    cancelAnimationFrame(this.playback.raf);
    this.restoreBase(this.playback.base);
    this.playback = null;
    this.canvas.selection = true;
    this.canvas.requestRenderAll();
    useEditorUi.setState({ playing: false, playTime: 0 });
  }

  /**
   * Render the animation frame by frame at full design size and hand each frame to `onFrame`.
   * Used by the MP4/WebM/GIF exporters.
   */
  async renderFrames(
    opts: { fps: number; length: number; scale: number; signal?: AbortSignal },
    onFrame: (frame: HTMLCanvasElement, index: number, total: number) => Promise<void>
  ): Promise<void> {
    this.stop();
    const c = this.canvas;
    c.discardActiveObject();
    const screen = { width: c.getWidth(), height: c.getHeight(), zoom: c.getZoom() };
    const base = this.captureBase();
    const total = Math.max(1, Math.round(opts.length * opts.fps));
    try {
      c.setDimensions({ width: this.width, height: this.height }, { backstoreOnly: true });
      c.setZoom(1);
      for (let i = 0; i < total; i++) {
        if (opts.signal?.aborted) throw new DOMException('Export cancelled', 'AbortError');
        this.renderAt(base, i / opts.fps);
        await onFrame(c.toCanvasElement(opts.scale), i, total);
      }
    } finally {
      this.restoreBase(base);
      c.setDimensions({ width: screen.width, height: screen.height });
      c.setZoom(screen.zoom);
      c.requestRenderAll();
    }
  }

  // ---------- history ----------

  private snapshot(): string {
    return JSON.stringify({ w: this.width, h: this.height, c: this.canvas.toObject(SERIALISE_PROPS) });
  }

  private resetHistory(): void {
    this.history = [this.snapshot()];
    this.future = [];
    this.publishHistory();
  }

  commit(): void {
    if (this.restoring || this.playback) return;
    this.publishLayers();
    this.publishAnimation();
    const snap = this.snapshot();
    if (this.history[this.history.length - 1] === snap) return;
    this.history.push(snap);
    if (this.history.length > HISTORY_LIMIT) this.history.shift();
    this.future = [];
    this.publishHistory();
  }

  private publishHistory(): void {
    useEditorUi.setState({ canUndo: this.history.length > 1, canRedo: this.future.length > 0 });
    this.publishLayers();
    this.publishAnimation();
  }

  async undo(): Promise<boolean> {
    this.stop();
    if (this.history.length < 2) return false;
    const current = this.history.pop()!;
    this.future.push(current);
    await this.restore(this.history[this.history.length - 1]);
    return true;
  }

  async redo(): Promise<boolean> {
    this.stop();
    const next = this.future.pop();
    if (!next) return false;
    this.history.push(next);
    await this.restore(next);
    return true;
  }

  private async restore(snap: string): Promise<void> {
    this.restoring = true;
    try {
      const { w, h, c } = JSON.parse(snap) as { w: number; h: number; c: Record<string, unknown> };
      const sizeChanged = w !== this.width || h !== this.height;
      this.width = w;
      this.height = h;
      await this.canvas.loadFromJSON(c);
      this.canvas.discardActiveObject();
      if (sizeChanged) {
        const p = PLATFORMS.find((x) => x.width === w && x.height === h);
        if (p) useEditorUi.setState({ platform: p.id });
      }
      this.canvas.requestRenderAll();
      this.syncSelection();
    } finally {
      this.restoring = false;
      this.publishHistory();
    }
  }

  // ---------- export ----------

  /** Render the design at exactly its real pixel size (e.g. 1280×720). */
  async toBlob(format: 'png' | 'jpeg' = 'png', quality = 0.92): Promise<Blob> {
    this.stop();
    const c = this.canvas;
    const active = c.getActiveObject();
    c.discardActiveObject();
    const screen = { width: c.getWidth(), height: c.getHeight(), zoom: c.getZoom() };
    try {
      // Render at zoom 1 into an exact-size canvas so rounding can never change the output size.
      c.setDimensions({ width: this.width, height: this.height }, { backstoreOnly: true });
      c.setZoom(1);
      const out = c.toCanvasElement(1);
      return await new Promise<Blob>((resolve, reject) =>
        out.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), `image/${format}`, quality)
      );
    } finally {
      c.setDimensions({ width: screen.width, height: screen.height });
      c.setZoom(screen.zoom);
      if (active) c.setActiveObject(active);
      c.requestRenderAll();
    }
  }

  /** JPEG that fits under `maxBytes`, lowering quality step by step. */
  async toJpegUnder(maxBytes: number | undefined): Promise<Blob> {
    let q = 0.95;
    let blob = await this.toBlob('jpeg', q);
    while (maxBytes && blob.size > maxBytes && q > 0.4) {
      q -= 0.08;
      blob = await this.toBlob('jpeg', q);
    }
    return blob;
  }

  dispose(): void {
    this.stop();
    this.imageUrls.forEach((u) => URL.revokeObjectURL(u));
    void this.canvas.dispose();
  }
}
