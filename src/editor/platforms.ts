export type PlatformId = 'youtube' | 'shorts' | 'instagram' | 'portrait' | 'facebook' | 'x' | 'podcast';

export interface Platform {
  id: PlatformId;
  width: number;
  height: number;
  /** Upload size limit in bytes, where the platform documents one. */
  maxBytes?: number;
}

export const PLATFORMS: Platform[] = [
  { id: 'youtube', width: 1280, height: 720, maxBytes: 2 * 1024 * 1024 },
  { id: 'shorts', width: 1080, height: 1920 },
  { id: 'instagram', width: 1080, height: 1080 },
  { id: 'portrait', width: 1080, height: 1350 },
  { id: 'facebook', width: 1200, height: 630 },
  { id: 'x', width: 1600, height: 900 },
  { id: 'podcast', width: 3000, height: 3000 }
];

export function platformById(id: PlatformId): Platform {
  return PLATFORMS.find((p) => p.id === id) ?? PLATFORMS[0];
}

/** Scale that fits a `w`×`h` design inside a `boxW`×`boxH` area. */
export function fitScale(w: number, h: number, boxW: number, boxH: number): number {
  if (w <= 0 || h <= 0 || boxW <= 0 || boxH <= 0) return 1;
  return Math.min(boxW / w, boxH / h);
}
