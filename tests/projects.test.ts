import { describe, expect, it } from 'vitest';
import { ASSET_PREFIX, imageSources, mapImageSources, packSnapshots, unpackSnapshots } from '../src/projects/pack';
import type { DesignSnapshot } from '../src/editor/autofit';

// a 1×1 PNG as a data URL, standing in for an uploaded photo
const PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

function design(src: string): DesignSnapshot {
  return {
    w: 1280,
    h: 720,
    c: {
      objects: [
        { type: 'Rect', left: 0 },
        { type: 'Image', src, clipPath: { type: 'Rect' } },
        { type: 'Group', objects: [{ type: 'Image', src }] },
        { type: 'Textbox', text: 'src: not an image' }
      ]
    }
  };
}

describe('project packing', () => {
  it('finds image sources, including inside groups, and nothing else', () => {
    expect(imageSources([design('a.png')])).toEqual(['a.png']);
    const seen: string[] = [];
    mapImageSources(design('b.png').c, (s) => {
      seen.push(s);
      return s;
    });
    expect(seen).toEqual(['b.png', 'b.png']);
  });

  it('stores each picture once and replaces it with an asset reference', async () => {
    const saved = new Map<string, Blob>();
    const known = new Map<string, string>();
    const { designs, assets } = await packSnapshots({ youtube: design(PNG), shorts: design(PNG) }, async (id, blob) => void saved.set(id, blob), known);
    expect(saved.size).toBe(1);
    expect(assets).toHaveLength(1);
    expect(assets[0]).toMatch(/^[0-9a-f]{64}$/);
    const srcs = imageSources(Object.values(designs) as DesignSnapshot[]);
    expect(srcs).toEqual([ASSET_PREFIX + assets[0]]);
  });

  it('does not change the design passed in', async () => {
    const original = { youtube: design(PNG) };
    await packSnapshots(original, async () => undefined, new Map());
    expect(imageSources([original.youtube])).toEqual([PNG]);
  });

  it('restores asset references as working URLs, skipping missing files', async () => {
    const saved = new Map<string, Blob>();
    const { designs } = await packSnapshots({ youtube: design(PNG) }, async (id, blob) => void saved.set(id, blob), new Map());
    const restored = await unpackSnapshots(designs, async (id) => saved.get(id), new Map());
    const [src] = imageSources([restored.youtube!]);
    expect(src.startsWith('blob:')).toBe(true);
    const missing = await unpackSnapshots({ youtube: design(`${ASSET_PREFIX}deadbeef`) }, async () => undefined, new Map());
    expect(imageSources([missing.youtube!])).toEqual([`${ASSET_PREFIX}deadbeef`]);
  });

  it('re-packing an opened project reuses the same asset ids without re-reading files', async () => {
    const saved = new Map<string, Blob>();
    const known = new Map<string, string>();
    const first = await packSnapshots({ youtube: design(PNG) }, async (id, blob) => void saved.set(id, blob), known);
    const opened = await unpackSnapshots(first.designs, async (id) => saved.get(id), known);
    let writes = 0;
    const second = await packSnapshots(opened, async () => void writes++, known);
    expect(writes).toBe(0);
    expect(second.assets).toEqual(first.assets);
  });
});
