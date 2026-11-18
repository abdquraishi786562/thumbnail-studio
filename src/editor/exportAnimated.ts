import {
  BufferTarget,
  CanvasSource,
  Mp4OutputFormat,
  Output,
  QUALITY_HIGH,
  WebMOutputFormat,
  getFirstEncodableVideoCodec
} from 'mediabunny';
import { GIFEncoder, applyPalette, quantize } from 'gifenc';
import type { Editor } from './editor';

export type AnimatedFormat = 'mp4' | 'webm' | 'gif';

export interface AnimatedOptions {
  format: AnimatedFormat;
  fps: number;
  length: number;
  /** 1 = full design size, 0.5 = half. */
  scale: number;
  signal?: AbortSignal;
  onProgress?: (fraction: number) => void;
}

export class VideoUnsupportedError extends Error {
  constructor(format: string) {
    super(`This browser cannot encode ${format} video`);
    this.name = 'VideoUnsupportedError';
  }
}

/** Video encoders need even frame sizes. */
const even = (n: number) => Math.max(2, Math.round(n / 2) * 2);

const nextTick = () => new Promise<void>((r) => setTimeout(r, 0));

export async function exportAnimated(editor: Editor, opts: AnimatedOptions): Promise<Blob> {
  const { width, height } = editor.size;
  const w = even(width * opts.scale);
  const h = even(height * opts.scale);
  const frameCanvas = document.createElement('canvas');
  frameCanvas.width = w;
  frameCanvas.height = h;
  const ctx = frameCanvas.getContext('2d', { willReadFrequently: opts.format === 'gif' })!;
  const draw = (frame: HTMLCanvasElement) => {
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(frame, 0, 0, w, h);
  };

  if (opts.format === 'gif') {
    const gif = GIFEncoder();
    // GIF delays are whole hundredths of a second; spread the rounding so the total length stays exact.
    const delayAt = (i: number) => (Math.round(((i + 1) * 100) / opts.fps) - Math.round((i * 100) / opts.fps)) * 10;
    await editor.renderFrames({ fps: opts.fps, length: opts.length, scale: opts.scale, signal: opts.signal }, async (frame, i, total) => {
      draw(frame);
      const { data } = ctx.getImageData(0, 0, w, h);
      const palette = quantize(data, 256);
      const index = applyPalette(data, palette);
      gif.writeFrame(index, w, h, { palette, delay: delayAt(i), repeat: 0 });
      opts.onProgress?.((i + 1) / total);
      await nextTick(); // keep the page responsive
    });
    gif.finish();
    return new Blob([gif.bytes()], { type: 'image/gif' });
  }

  const format = opts.format === 'mp4' ? new Mp4OutputFormat({ fastStart: 'in-memory' }) : new WebMOutputFormat();
  const codec = await getFirstEncodableVideoCodec(format.getSupportedVideoCodecs(), { width: w, height: h });
  if (!codec) throw new VideoUnsupportedError(opts.format.toUpperCase());
  const output = new Output({ format, target: new BufferTarget() });
  const source = new CanvasSource(frameCanvas, { codec, quality: QUALITY_HIGH });
  output.addVideoTrack(source, { frameRate: opts.fps });
  await output.start();
  try {
    await editor.renderFrames({ fps: opts.fps, length: opts.length, scale: opts.scale, signal: opts.signal }, async (frame, i, total) => {
      draw(frame);
      await source.add(i / opts.fps, 1 / opts.fps);
      opts.onProgress?.((i + 1) / total);
    });
    await output.finalize();
  } catch (e) {
    await output.cancel().catch(() => undefined);
    throw e;
  }
  const buffer = output.target.buffer;
  if (!buffer) throw new Error('Video encoding produced no data');
  return new Blob([buffer], { type: opts.format === 'mp4' ? 'video/mp4' : 'video/webm' });
}
