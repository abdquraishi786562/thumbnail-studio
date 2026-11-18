/**
 * Optional AI pictures through any OpenAI-compatible image API, using the user's own key.
 * Nothing is sent anywhere unless the user has chosen a service and entered a key.
 */

export type PictureService = 'none' | 'pollinations' | 'openai' | 'custom';

export interface PictureConfig {
  service: PictureService;
  baseUrl: string;
  apiKey: string;
  model: string;
}

export const PICTURE_PRESETS: Record<Exclude<PictureService, 'none'>, { baseUrl: string; model: string; name: string; keysUrl: string }> = {
  pollinations: { baseUrl: 'https://gen.pollinations.ai/v1', model: 'black-forest-labs/flux.1-schnell', name: 'Pollinations', keysUrl: 'https://enter.pollinations.ai/keys' },
  openai: { baseUrl: 'https://api.openai.com/v1', model: 'gpt-image-1-mini', name: 'OpenAI', keysUrl: 'https://platform.openai.com/api-keys' },
  custom: { baseUrl: '', model: '', name: 'Custom', keysUrl: '' }
};

export const NO_PICTURES: PictureConfig = { service: 'none', baseUrl: '', apiKey: '', model: '' };

export function picturesEnabled(cfg: PictureConfig): boolean {
  return cfg.service !== 'none' && !!cfg.apiKey.trim() && !!cfg.baseUrl.trim() && !!cfg.model.trim();
}

export function serviceName(cfg: PictureConfig): string {
  if (cfg.service === 'none') return '';
  if (cfg.service === 'custom') {
    try {
      return new URL(cfg.baseUrl).host;
    } catch {
      return cfg.baseUrl;
    }
  }
  return PICTURE_PRESETS[cfg.service].name;
}

/** Sizes every OpenAI-style image model accepts. */
function sizeFor(w: number, h: number): string {
  const r = w / h;
  if (r > 1.15) return '1536x1024';
  if (r < 0.87) return '1024x1536';
  return '1024x1024';
}

/** Describe the picture we want: a background with room for the title and no lettering. */
export function picturePrompt(idea: string, style: string, rtl: boolean): string {
  return (
    `${idea}. Eye-catching ${style === 'auto' ? '' : style + ' '}YouTube thumbnail background picture, bold composition, vibrant colours, ` +
    `high contrast, dramatic lighting, clear subject on the ${rtl ? 'left' : 'right'} with empty space on the ${rtl ? 'right' : 'left'} for a title. ` +
    'No text, no letters, no logos, no watermark.'
  );
}

export class PictureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PictureError';
  }
}

export async function generatePicture(cfg: PictureConfig, prompt: string, w: number, h: number, signal?: AbortSignal): Promise<Blob> {
  if (!picturesEnabled(cfg)) throw new PictureError('not configured');
  const base = cfg.baseUrl.replace(/\/+$/, '');
  let res: Response;
  try {
    res = await fetch(`${base}/images/generations`, {
      method: 'POST',
      signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.apiKey.trim()}` },
      body: JSON.stringify({ model: cfg.model.trim(), prompt, n: 1, size: sizeFor(w, h) })
    });
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e;
    throw new PictureError('network error');
  }
  if (!res.ok) {
    let detail = `${res.status}`;
    try {
      const body = (await res.json()) as { error?: { message?: string } | string };
      const msg = typeof body.error === 'string' ? body.error : body.error?.message;
      if (msg) detail = `${res.status} ${msg}`.slice(0, 160);
    } catch {
      /* not JSON */
    }
    throw new PictureError(detail);
  }
  const body = (await res.json()) as { data?: { b64_json?: string; url?: string }[] };
  const item = body.data?.[0];
  if (item?.b64_json) {
    const bin = atob(item.b64_json);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: 'image/png' });
  }
  if (item?.url) {
    const img = await fetch(item.url, { signal });
    if (!img.ok) throw new PictureError(`picture download ${img.status}`);
    return img.blob();
  }
  throw new PictureError('no picture in the answer');
}
