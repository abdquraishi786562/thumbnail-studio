/**
 * Designs reference images by temporary `blob:` URLs that die when the page closes.
 * Packing swaps them for `asset:<sha256>` references (and stores each file once);
 * unpacking turns them back into fresh object URLs.
 */
import type { DesignSnapshot } from '../editor/autofit';

export const ASSET_PREFIX = 'asset:';

type Json = Record<string, unknown>;

/** Visit every `src` string in a Fabric JSON tree (objects, groups, clip paths). */
export function mapImageSources(node: unknown, fn: (src: string) => string): void {
  if (Array.isArray(node)) {
    node.forEach((n) => mapImageSources(n, fn));
    return;
  }
  if (!node || typeof node !== 'object') return;
  const obj = node as Json;
  if (typeof obj.src === 'string' && typeof obj.type === 'string' && obj.type.toLowerCase() === 'image') obj.src = fn(obj.src);
  for (const key of ['objects', 'clipPath']) if (obj[key]) mapImageSources(obj[key], fn);
}

export function imageSources(snaps: DesignSnapshot[]): string[] {
  const out = new Set<string>();
  for (const s of snaps)
    mapImageSources(s.c, (src) => {
      out.add(src);
      return src;
    });
  return [...out];
}

export async function sha256(blob: Blob): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer());
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

/**
 * Replace blob/data URLs with asset references. `save` stores each new file and
 * the returned ids are what the project uses.
 */
export async function packSnapshots<K extends string>(
  designs: Partial<Record<K, DesignSnapshot>>,
  save: (id: string, blob: Blob) => Promise<void>,
  known: Map<string, string>
): Promise<{ designs: Partial<Record<K, DesignSnapshot>>; assets: string[] }> {
  const copy = clone(designs);
  const snaps = Object.values(copy) as DesignSnapshot[];
  const ids = new Map<string, string>();
  for (const src of imageSources(snaps)) {
    if (src.startsWith(ASSET_PREFIX)) {
      ids.set(src, src.slice(ASSET_PREFIX.length));
      continue;
    }
    const cached = known.get(src);
    if (cached) {
      ids.set(src, cached);
      continue;
    }
    const blob = await (await fetch(src)).blob();
    const id = await sha256(blob);
    await save(id, blob);
    known.set(src, id);
    ids.set(src, id);
  }
  for (const s of snaps) mapImageSources(s.c, (src) => (ids.has(src) ? ASSET_PREFIX + ids.get(src) : src));
  return { designs: copy, assets: [...new Set(ids.values())] };
}

/** Turn asset references back into object URLs (loading each file once). */
export async function unpackSnapshots<K extends string>(
  designs: Partial<Record<K, DesignSnapshot>>,
  load: (id: string) => Promise<Blob | undefined>,
  known: Map<string, string>
): Promise<Partial<Record<K, DesignSnapshot>>> {
  const copy = clone(designs);
  const snaps = Object.values(copy) as DesignSnapshot[];
  const urls = new Map<string, string>();
  for (const src of imageSources(snaps)) {
    if (!src.startsWith(ASSET_PREFIX)) continue;
    const id = src.slice(ASSET_PREFIX.length);
    const blob = await load(id);
    if (!blob) continue; // missing file: the image will simply not appear
    const url = URL.createObjectURL(blob);
    known.set(url, id);
    urls.set(src, url);
  }
  for (const s of snaps) mapImageSources(s.c, (src) => urls.get(src) ?? src);
  return copy;
}
