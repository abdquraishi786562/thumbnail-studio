import { FabricImage, FabricObject, Gradient, Point, StaticCanvas, Textbox } from 'fabric';
import { SERIALISE_PROPS, applyStyle, applyTextLayout, metaOf } from './model';

export interface Size {
  w: number;
  h: number;
}

/** A saved design: its size and the Fabric canvas JSON. */
export interface DesignSnapshot {
  w: number;
  h: number;
  c: Record<string, unknown>;
}

/** Pure maths for how much text should grow or shrink between sizes; exported for tests. */
export function textScale(from: Size, to: Size): number {
  const sx = to.w / from.w;
  const sy = to.h / from.h;
  // Geometric mean: a tall Shorts cover gets bigger, wrapping text; a short banner gets smaller text.
  return Math.sqrt(sx * sy);
}

/** Keep a box inside the canvas with a safe margin; boxes bigger than the area are centred. */
export function clampBox(left: number, top: number, w: number, h: number, to: Size, margin: number): { left: number; top: number } {
  const fit = (pos: number, size: number, max: number) => {
    if (size > max - 2 * margin) return (max - size) / 2;
    return Math.min(Math.max(pos, margin), max - margin - size);
  };
  return { left: fit(left, w, to.w), top: fit(top, h, to.h) };
}

function bounds(o: FabricObject) {
  const r = o.getBoundingRect();
  return { left: r.left, top: r.top, w: r.width, h: r.height };
}

function moveBoxTo(o: FabricObject, left: number, top: number): void {
  const r = bounds(o);
  o.set({ left: (o.left ?? 0) + (left - r.left), top: (o.top ?? 0) + (top - r.top) });
  o.setCoords();
}

/**
 * Re-lay out every object for a new canvas size:
 * - backgrounds stretch,
 * - full-bleed photos cover the new canvas,
 * - text keeps its share of the width, re-wraps and scales its font,
 * - everything keeps its relative position and stays inside safe margins,
 * - text blocks that would overlap are stacked.
 */
export function fitObjects(objects: FabricObject[], from: Size, to: Size): void {
  const sx = to.w / from.w;
  const sy = to.h / from.h;
  const k = textScale(from, to);
  const margin = Math.min(to.w, to.h) * 0.05;
  const texts: { obj: Textbox; origY: number }[] = [];

  for (const obj of objects) {
    const meta = metaOf(obj);
    if (!meta) continue;
    const c = obj.getCenterPoint();
    const rel = new Point(c.x / from.w, c.y / from.h);

    if (meta.kind === 'background') {
      obj.set({ left: 0, top: 0, width: to.w, height: to.h, scaleX: 1, scaleY: 1 });
      const fill = obj.fill;
      if (fill instanceof Gradient) {
        const stops = fill.colorStops;
        obj.set(
          'fill',
          new Gradient({ type: 'linear', coords: { x1: 0, y1: 0, x2: to.w, y2: to.h }, colorStops: stops.map((s) => ({ offset: s.offset, color: s.color })) })
        );
      }
      obj.setCoords();
      continue;
    }

    if (obj instanceof Textbox) {
      // Text grows or shrinks with its font, but never wider than the safe area (then it re-wraps).
      const fontSize = (obj.fontSize ?? 40) * (obj.scaleY ?? 1) * k;
      const width = Math.min((obj.width ?? 100) * (obj.scaleX ?? 1) * k, to.w - 2 * margin);
      obj.set({ fontSize, width, scaleX: 1, scaleY: 1 });
      applyTextLayout(obj);
      obj.initDimensions();
      applyStyle(obj);
      obj.setPositionByOrigin(new Point(rel.x * to.w, rel.y * to.h), 'center', 'center');
      obj.setCoords();
      const b = bounds(obj);
      const pos = clampBox(b.left, b.top, b.w, b.h, to, margin);
      moveBoxTo(obj, pos.left, pos.top);
      texts.push({ obj, origY: c.y / from.h });
      continue;
    }

    const b = bounds(obj);
    const fullBleed = b.w >= from.w * 0.9 && b.h >= from.h * 0.9;
    if (meta.kind === 'image' && fullBleed) {
      // Photo backgrounds cover the whole new canvas.
      const s = Math.max(to.w / b.w, to.h / b.h);
      obj.set({ scaleX: (obj.scaleX ?? 1) * s, scaleY: (obj.scaleY ?? 1) * s });
      obj.setPositionByOrigin(new Point(to.w / 2, to.h / 2), 'center', 'center');
      obj.setCoords();
      continue;
    }
    if (meta.kind === 'shape' && b.w >= from.w * 0.9) {
      // Full-width bars stay full width.
      obj.set({ scaleX: (obj.scaleX ?? 1) * sx, scaleY: (obj.scaleY ?? 1) * Math.min(k, sy * 1.5) });
      obj.setPositionByOrigin(new Point(to.w / 2, rel.y * to.h), 'center', 'center');
      obj.setCoords();
      continue;
    }

    let s = k;
    if (meta.kind === 'image') s = Math.min(k, (to.w * 0.9) / b.w, (to.h * 0.9) / b.h);
    obj.set({ scaleX: (obj.scaleX ?? 1) * s, scaleY: (obj.scaleY ?? 1) * s });
    obj.setPositionByOrigin(new Point(rel.x * to.w, rel.y * to.h), 'center', 'center');
    obj.setCoords();
    if (meta.kind === 'image') {
      const nb = bounds(obj);
      const pos = clampBox(nb.left, nb.top, nb.w, nb.h, to, margin);
      moveBoxTo(obj, pos.left, pos.top);
    }
    if (meta.kind === 'image' && obj instanceof FabricImage) obj.setCoords();
  }

  stackTexts(texts, to, margin);
}

/** Push overlapping text blocks apart, top to bottom, then pull the group back inside the canvas. */
function stackTexts(texts: { obj: Textbox; origY: number }[], to: Size, margin: number): void {
  if (texts.length < 2) return;
  texts.sort((a, b) => a.origY - b.origY);
  const gap = Math.min(to.w, to.h) * 0.02;
  for (let i = 1; i < texts.length; i++) {
    const cur = bounds(texts[i].obj);
    for (let j = 0; j < i; j++) {
      const prev = bounds(texts[j].obj);
      const overlapX = cur.left < prev.left + prev.w && prev.left < cur.left + cur.w;
      const overlapY = cur.top < prev.top + prev.h + gap && prev.top < cur.top + cur.h;
      if (overlapX && overlapY) {
        moveBoxTo(texts[i].obj, cur.left, prev.top + prev.h + gap);
        cur.top = prev.top + prev.h + gap;
      }
    }
  }
  const last = texts.reduce((m, t) => Math.max(m, bounds(t.obj).top + bounds(t.obj).h), 0);
  const overflow = last - (to.h - margin);
  if (overflow > 0) {
    const first = Math.min(...texts.map((t) => bounds(t.obj).top));
    const shift = Math.min(overflow, Math.max(0, first - margin));
    for (const t of texts) {
      const b = bounds(t.obj);
      moveBoxTo(t.obj, b.left, b.top - shift);
    }
  }
}

/** Load a snapshot into a hidden canvas. Callers must dispose the canvas. */
export async function loadOffscreen(snap: DesignSnapshot): Promise<StaticCanvas> {
  const el = document.createElement('canvas');
  const canvas = new StaticCanvas(el, { width: snap.w, height: snap.h, enableRetinaScaling: false });
  await canvas.loadFromJSON(snap.c);
  return canvas;
}

/** Produce a new design for another size from an existing one. */
export async function fitSnapshot(snap: DesignSnapshot, to: Size): Promise<DesignSnapshot> {
  const canvas = await loadOffscreen(snap);
  try {
    fitObjects(canvas.getObjects(), { w: snap.w, h: snap.h }, to);
    return { w: to.w, h: to.h, c: canvas.toObject(SERIALISE_PROPS) as Record<string, unknown> };
  } finally {
    void canvas.dispose();
  }
}

/** Render a snapshot to an image file at its real size. */
export async function renderSnapshot(snap: DesignSnapshot, format: 'png' | 'jpeg', quality = 0.92, multiplier = 1): Promise<Blob> {
  const canvas = await loadOffscreen(snap);
  try {
    canvas.renderAll();
    const out = canvas.toCanvasElement(multiplier);
    return await new Promise<Blob>((res, rej) => out.toBlob((b) => (b ? res(b) : rej(new Error('encode failed'))), `image/${format}`, quality));
  } finally {
    void canvas.dispose();
  }
}

/** JPEG under a byte limit, lowering quality step by step. */
export async function renderJpegUnder(snap: DesignSnapshot, maxBytes?: number): Promise<Blob> {
  let q = 0.95;
  let blob = await renderSnapshot(snap, 'jpeg', q);
  while (maxBytes && blob.size > maxBytes && q > 0.4) {
    q -= 0.08;
    blob = await renderSnapshot(snap, 'jpeg', q);
  }
  return blob;
}
