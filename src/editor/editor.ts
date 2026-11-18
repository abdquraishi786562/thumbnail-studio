import {
  Canvas,
  Circle,
  FabricImage,
  FabricObject,
  Gradient,
  Rect,
  Shadow,
  Textbox,
  util,
  type TPointerEventInfo
} from 'fabric';
import { create } from 'zustand';
import { detectDirection, type TextDirection } from './textDirection';
import { ensureFont, fontForText, fontStack, fontWeight } from './fonts';
import { platformById, type PlatformId } from './platforms';

/** Extra data we keep on each canvas object. */
export interface ObjectMeta {
  kind: 'background' | 'text' | 'image' | 'shape';
  /** 'auto' follows the text's first strong character. */
  dirMode?: 'auto' | TextDirection;
  fontFamily?: string;
}

const META = 'tsMeta';

export function metaOf(obj: FabricObject | undefined): ObjectMeta | undefined {
  return obj ? ((obj as unknown as Record<string, unknown>)[META] as ObjectMeta | undefined) : undefined;
}

function setMeta(obj: FabricObject, meta: ObjectMeta): void {
  (obj as unknown as Record<string, unknown>)[META] = meta;
}

/** Selection snapshot that React panels read. */
export interface SelectionInfo {
  kind: ObjectMeta['kind'];
  fill: string;
  fontFamily?: string;
  fontSize?: number;
  stroke: boolean;
  shadow: boolean;
  dirMode?: 'auto' | TextDirection;
}

interface EditorUiState {
  selection: SelectionInfo | null;
  canUndo: boolean;
  canRedo: boolean;
  platform: PlatformId;
  background: string;
}

export const useEditorUi = create<EditorUiState>(() => ({
  selection: null,
  canUndo: false,
  canRedo: false,
  platform: 'youtube',
  background: '#5b4cf0'
}));

// Fabric 7 positions objects by their centre by default; this editor works in top-left coordinates.
FabricObject.ownDefaults.originX = 'left';
FabricObject.ownDefaults.originY = 'top';

const HISTORY_LIMIT = 60;
const SERIALISE_PROPS = [META, 'selectable', 'evented', 'hoverCursor'];

/**
 * Owns the Fabric canvas: objects, selection, history and export.
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
    FabricObject.ownDefaults.cornerStyle = 'circle';
    FabricObject.ownDefaults.cornerColor = '#ffffff';
    FabricObject.ownDefaults.cornerStrokeColor = '#5b4cf0';
    FabricObject.ownDefaults.borderColor = '#5b4cf0';
    FabricObject.ownDefaults.transparentCorners = false;
    FabricObject.ownDefaults.cornerSize = 14;
    FabricObject.ownDefaults.borderScaleFactor = 2;

    const sync = () => this.syncSelection();
    this.canvas.on('selection:created', sync);
    this.canvas.on('selection:updated', sync);
    this.canvas.on('selection:cleared', sync);
    this.canvas.on('object:modified', () => this.commit());
    this.canvas.on('text:changed', (e) => {
      const target = e.target as Textbox;
      const meta = metaOf(target);
      if (meta?.fontFamily) {
        const family = fontForText(meta.fontFamily, detectDirection(target.text ?? '') === 'rtl');
        if (family !== meta.fontFamily) {
          meta.fontFamily = family;
          target.set({ fontFamily: fontStack(family), fontWeight: fontWeight(family) });
          void ensureFont(family, target.text).then(() => this.canvas.requestRenderAll());
          this.syncSelection();
        }
      }
      this.applyAutoDirection(target);
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

  // ---------- starter design ----------

  async loadStarter(texts: { heading: string; sub: string }, accent: string, accent2: string): Promise<void> {
    await Promise.all([ensureFont('Anton', texts.heading), ensureFont('Vazirmatn', texts.heading + texts.sub)]);
    this.canvas.clear();
    this.addBackground(accent, accent2);
    const W = this.width;
    const H = this.height;
    const blobA = new Circle({ radius: H * 0.55, left: W * 0.62, top: -H * 0.25, fill: '#ffffff', opacity: 0.08, selectable: true });
    setMeta(blobA, { kind: 'shape' });
    const blobB = new Circle({ radius: H * 0.35, left: -H * 0.15, top: H * 0.6, fill: '#000000', opacity: 0.12 });
    setMeta(blobB, { kind: 'shape' });
    this.canvas.add(blobA, blobB);
    const heading = this.makeText(texts.heading, { fontFamily: 'Anton', fontSize: H * 0.17, fill: '#ffffff', stroke: true, shadow: true });
    heading.set({ left: W * 0.07, top: H * 0.3, width: W * 0.8 });
    const sub = this.makeText(texts.sub, { fontFamily: 'Vazirmatn', fontSize: H * 0.065, fill: '#ffe45c', stroke: false, shadow: true });
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
    bg.set('fill', this.gradient(a, b));
    setMeta(bg, { kind: 'background' });
    this.canvas.add(bg);
    this.canvas.sendObjectToBack(bg);
    useEditorUi.setState({ background: a });
  }

  private gradient(a: string, b: string) {
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
    const bg = this.canvas.getObjects().find((o) => metaOf(o)?.kind === 'background');
    if (bg) {
      bg.set('fill', this.gradient(a, b));
      useEditorUi.setState({ background: a });
      this.canvas.requestRenderAll();
      this.commit();
    }
  }

  // ---------- adding things ----------

  private makeText(
    text: string,
    o: { fontFamily: string; fontSize: number; fill: string; stroke: boolean; shadow: boolean }
  ): Textbox {
    o = { ...o, fontFamily: fontForText(o.fontFamily, detectDirection(text) === 'rtl') };
    const t = new Textbox(text, {
      fontFamily: fontStack(o.fontFamily),
      fontWeight: fontWeight(o.fontFamily),
      fontSize: o.fontSize,
      fill: o.fill,
      lineHeight: 1.05,
      splitByGrapheme: false,
      paintFirst: 'stroke',
      strokeLineJoin: 'round'
    });
    setMeta(t, { kind: 'text', dirMode: 'auto', fontFamily: o.fontFamily });
    this.styleText(t, o.stroke, o.shadow);
    this.applyAutoDirection(t);
    return t;
  }

  private styleText(t: Textbox, stroke: boolean, shadow: boolean): void {
    const size = t.fontSize ?? 64;
    t.set({
      stroke: stroke ? '#000000' : undefined,
      strokeWidth: stroke ? Math.max(2, size * 0.09) : 0,
      shadow: shadow ? new Shadow({ color: 'rgba(0,0,0,0.55)', blur: size * 0.18, offsetX: 0, offsetY: size * 0.06 }) : null
    });
  }

  private applyAutoDirection(t: Textbox): void {
    const meta = metaOf(t);
    const dir = meta?.dirMode && meta.dirMode !== 'auto' ? meta.dirMode : detectDirection(t.text ?? '');
    t.set({ direction: dir, textAlign: dir === 'rtl' ? 'right' : 'left' });
  }

  async addText(kind: 'heading' | 'sub' | 'body', text: string): Promise<void> {
    const H = this.height;
    const presets = {
      heading: { fontFamily: 'Anton', fontSize: H * 0.14, fill: '#ffffff', stroke: true, shadow: true },
      sub: { fontFamily: 'Vazirmatn', fontSize: H * 0.07, fill: '#ffe45c', stroke: false, shadow: true },
      body: { fontFamily: 'Vazirmatn', fontSize: H * 0.045, fill: '#ffffff', stroke: false, shadow: false }
    } as const;
    const preset = presets[kind];
    await ensureFont(preset.fontFamily, text);
    const t = this.makeText(text, { ...preset });
    t.set({ width: this.width * 0.7 });
    this.placeCentered(t);
    this.canvas.add(t);
    this.canvas.setActiveObject(t);
    this.entrance(t, 0);
    this.commit();
  }

  addShape(kind: 'rect' | 'circle' | 'badge', accent: string): void {
    const H = this.height;
    let shape: FabricObject;
    if (kind === 'rect') {
      shape = new Rect({ width: H * 0.5, height: H * 0.3, rx: H * 0.03, ry: H * 0.03, fill: accent });
    } else if (kind === 'circle') {
      shape = new Circle({ radius: H * 0.16, fill: accent });
    } else {
      shape = new Rect({ width: H * 0.42, height: H * 0.13, rx: H * 0.065, ry: H * 0.065, fill: '#ef4444' });
    }
    setMeta(shape, { kind: 'shape' });
    this.placeCentered(shape);
    this.canvas.add(shape);
    this.canvas.setActiveObject(shape);
    this.entrance(shape, 0);
    this.commit();
  }

  async addImage(file: Blob): Promise<void> {
    const url = URL.createObjectURL(file);
    try {
      const img = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
      // Data URL keeps the project self-contained when saved later.
      const dataUrl = img.toDataURL({ format: 'png' });
      const stable = await FabricImage.fromURL(dataUrl);
      const maxW = this.width * 0.6;
      const maxH = this.height * 0.8;
      const s = Math.min(1, maxW / (stable.width ?? 1), maxH / (stable.height ?? 1));
      stable.scale(s);
      setMeta(stable, { kind: 'image' });
      this.placeCentered(stable);
      this.canvas.add(stable);
      this.canvas.setActiveObject(stable);
      this.entrance(stable, 0);
      this.commit();
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  private placeCentered(obj: FabricObject): void {
    obj.set({ originX: 'left', originY: 'top' });
    const w = obj.getScaledWidth();
    const h = obj.getScaledHeight();
    obj.set({ left: (this.width - w) / 2, top: (this.height - h) / 2 });
    obj.setCoords();
  }

  /** Small pop-in animation for new objects. */
  private entrance(obj: FabricObject, delay: number): void {
    if (!this.animate()) return;
    const finalTop = obj.top ?? 0;
    const finalScaleX = obj.scaleX ?? 1;
    const finalScaleY = obj.scaleY ?? 1;
    obj.set({ opacity: 0, top: finalTop + this.height * 0.04, scaleX: finalScaleX * 0.92, scaleY: finalScaleY * 0.92 });
    const finalOpacity = 1;
    util.animate({
      startValue: 0,
      endValue: 1,
      duration: 520,
      delay,
      easing: util.ease.easeOutBack,
      onChange: (v: number) => {
        obj.set({
          opacity: Math.min(1, v) * finalOpacity,
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

  // ---------- editing the selection ----------

  private active(): FabricObject | undefined {
    return this.canvas.getActiveObject() ?? undefined;
  }

  syncSelection(): void {
    const obj = this.active();
    const meta = metaOf(obj);
    if (!obj || !meta) {
      useEditorUi.setState({ selection: null });
      return;
    }
    const fill = typeof obj.fill === 'string' ? obj.fill : '#ffffff';
    useEditorUi.setState({
      selection: {
        kind: meta.kind,
        fill,
        fontFamily: meta.fontFamily,
        fontSize: obj instanceof Textbox ? Math.round(obj.fontSize ?? 0) : undefined,
        stroke: !!obj.stroke && (obj.strokeWidth ?? 0) > 0,
        shadow: !!obj.shadow,
        dirMode: meta.dirMode
      }
    });
  }

  async updateSelection(patch: Partial<SelectionInfo>): Promise<void> {
    const obj = this.active();
    const meta = metaOf(obj);
    if (!obj || !meta) return;
    if (patch.fill !== undefined) obj.set('fill', patch.fill);
    if (obj instanceof Textbox) {
      if (patch.fontFamily) {
        await ensureFont(patch.fontFamily, obj.text);
        obj.set({ fontFamily: fontStack(patch.fontFamily), fontWeight: fontWeight(patch.fontFamily) });
        meta.fontFamily = patch.fontFamily;
      }
      if (patch.fontSize) obj.set('fontSize', patch.fontSize);
      if (patch.dirMode) meta.dirMode = patch.dirMode;
      const stroke = patch.stroke ?? (!!obj.stroke && (obj.strokeWidth ?? 0) > 0);
      const shadow = patch.shadow ?? !!obj.shadow;
      this.styleText(obj, stroke, shadow);
      this.applyAutoDirection(obj);
      obj.initDimensions();
    } else {
      if (patch.shadow !== undefined) {
        obj.set('shadow', patch.shadow ? new Shadow({ color: 'rgba(0,0,0,0.5)', blur: 30, offsetY: 12 }) : null);
      }
      if (patch.stroke !== undefined) {
        obj.set({ stroke: patch.stroke ? '#ffffff' : undefined, strokeWidth: patch.stroke ? 8 : 0 });
      }
    }
    obj.setCoords();
    this.canvas.requestRenderAll();
    this.syncSelection();
    this.commit();
  }

  deleteSelection(): void {
    const objs = this.canvas.getActiveObjects().filter((o) => metaOf(o)?.kind !== 'background');
    if (!objs.length) return;
    this.canvas.discardActiveObject();
    objs.forEach((o) => this.canvas.remove(o));
    this.canvas.requestRenderAll();
    this.syncSelection();
    this.commit();
  }

  // ---------- platform sizes ----------

  /** Move to another platform size, keeping every object's relative position. */
  resizeTo(platform: PlatformId): void {
    const p = platformById(platform);
    const sx = p.width / this.width;
    const sy = p.height / this.height;
    const s = Math.min(sx, sy);
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
    const bg = this.canvas.getObjects().find((o) => metaOf(o)?.kind === 'background');
    const fill = bg?.fill;
    if (bg && fill instanceof Gradient) {
      const stops = fill.colorStops;
      bg.set('fill', this.gradient(stops[0]?.color ?? '#000', stops[stops.length - 1]?.color ?? '#000'));
    }
    useEditorUi.setState({ platform });
    this.commit();
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
    if (this.restoring) return;
    const snap = this.snapshot();
    if (this.history[this.history.length - 1] === snap) return;
    this.history.push(snap);
    if (this.history.length > HISTORY_LIMIT) this.history.shift();
    this.future = [];
    this.publishHistory();
  }

  private publishHistory(): void {
    useEditorUi.setState({ canUndo: this.history.length > 1, canRedo: this.future.length > 0 });
  }

  async undo(): Promise<boolean> {
    if (this.history.length < 2) return false;
    const current = this.history.pop()!;
    this.future.push(current);
    await this.restore(this.history[this.history.length - 1]);
    return true;
  }

  async redo(): Promise<boolean> {
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
        const id = (['youtube', 'shorts', 'instagram', 'portrait', 'facebook', 'x', 'podcast'] as PlatformId[]).find((pid) => {
          const p = platformById(pid);
          return p.width === w && p.height === h;
        });
        if (id) useEditorUi.setState({ platform: id });
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

  dispose(): void {
    void this.canvas.dispose();
  }
}
