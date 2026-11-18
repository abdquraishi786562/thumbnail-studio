/**
 * Animation presets for animated thumbnails.
 * Pure functions: given a preset and a time, return how far the object is moved,
 * scaled, rotated and faded. The same code drives the live preview and the
 * frame-by-frame video/GIF export, so what you see is what you get.
 */

export const ENTER_TYPES = [
  'none',
  'fade',
  'fromBottom',
  'fromTop',
  'fromLeft',
  'fromRight',
  'pop',
  'zoom',
  'bounce',
  'spin',
  'typewriter'
] as const;
export type EnterType = (typeof ENTER_TYPES)[number];

export const LOOP_TYPES = ['none', 'pulse', 'float', 'shake', 'wiggle', 'spin', 'heartbeat'] as const;
export type LoopType = (typeof LOOP_TYPES)[number];

export interface AnimSpec {
  enter: EnterType;
  loop: LoopType;
  /** Seconds before the entrance starts. */
  delay: number;
  /** Entrance length in seconds. */
  duration: number;
}

export const NO_ANIM: AnimSpec = { enter: 'none', loop: 'none', delay: 0, duration: 0.8 };

/** Offsets applied on top of an object's resting state. */
export interface AnimState {
  opacity: number;
  /** Movement in design pixels. */
  dx: number;
  dy: number;
  /** Multiplies the resting scale. */
  scale: number;
  /** Degrees added to the resting angle. */
  rotate: number;
  /** Fraction of characters visible (typewriter), 0..1. */
  reveal: number;
}

export const REST: AnimState = { opacity: 1, dx: 0, dy: 0, scale: 1, rotate: 0, reveal: 1 };

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const easeOutCubic = (p: number) => 1 - (1 - p) ** 3;
const easeOutBack = (p: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (p - 1) ** 3 + c1 * (p - 1) ** 2;
};
const easeOutBounce = (p: number) => {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (p < 1 / d1) return n1 * p * p;
  if (p < 2 / d1) return n1 * (p -= 1.5 / d1) * p + 0.75;
  if (p < 2.5 / d1) return n1 * (p -= 2.25 / d1) * p + 0.9375;
  return n1 * (p -= 2.625 / d1) * p + 0.984375;
};

/**
 * State of an object at time `t` (seconds).
 * `w`/`h` are the design size, used so slides travel a sensible distance at every platform size.
 */
export function animStateAt(spec: AnimSpec, t: number, w: number, h: number): AnimState {
  const s: AnimState = { ...REST };
  const short = Math.min(w, h);

  // ----- entrance -----
  if (spec.enter !== 'none') {
    const dur = Math.max(0.05, spec.duration);
    const p = clamp01((t - spec.delay) / dur);
    const e = easeOutCubic(p);
    switch (spec.enter) {
      case 'fade':
        s.opacity = e;
        break;
      case 'fromBottom':
        s.opacity = clamp01(p * 3);
        s.dy = (1 - e) * short * 0.35;
        break;
      case 'fromTop':
        s.opacity = clamp01(p * 3);
        s.dy = -(1 - e) * short * 0.35;
        break;
      case 'fromLeft':
        s.opacity = clamp01(p * 3);
        s.dx = -(1 - e) * w * 0.5;
        break;
      case 'fromRight':
        s.opacity = clamp01(p * 3);
        s.dx = (1 - e) * w * 0.5;
        break;
      case 'pop':
        s.opacity = clamp01(p * 4);
        s.scale = p >= 1 ? 1 : Math.max(0.01, easeOutBack(p));
        break;
      case 'zoom':
        s.opacity = clamp01(p * 2);
        s.scale = 1 + (1 - e) * 1.6;
        break;
      case 'bounce':
        s.opacity = clamp01(p * 6);
        s.dy = -(1 - easeOutBounce(p)) * short * 0.6;
        break;
      case 'spin':
        s.opacity = clamp01(p * 2);
        s.rotate = -(1 - e) * 360;
        s.scale = 0.3 + 0.7 * e;
        break;
      case 'typewriter':
        s.reveal = p;
        break;
    }
  }

  // ----- loop (starts once the entrance has finished) -----
  if (spec.loop !== 'none') {
    const start = spec.enter === 'none' ? 0 : spec.delay + spec.duration;
    const lt = Math.max(0, t - start);
    const ramp = clamp01(lt / 0.3); // ease into the loop, no jump
    const TAU = Math.PI * 2;
    switch (spec.loop) {
      case 'pulse':
        s.scale *= 1 + 0.06 * Math.sin(lt * TAU * 0.8) * ramp;
        break;
      case 'float':
        s.dy += Math.sin(lt * TAU * 0.5) * short * 0.02 * ramp;
        break;
      case 'shake':
        s.dx += Math.sin(lt * TAU * 9) * short * 0.006 * ramp;
        break;
      case 'wiggle':
        s.rotate += Math.sin(lt * TAU * 1.2) * 4 * ramp;
        break;
      case 'spin':
        s.rotate += (lt * 90) % 360;
        break;
      case 'heartbeat': {
        const beat = lt % 1.2;
        const pulse = beat < 0.15 ? Math.sin((beat / 0.15) * Math.PI) : beat < 0.35 && beat > 0.2 ? 0.6 * Math.sin(((beat - 0.2) / 0.15) * Math.PI) : 0;
        s.scale *= 1 + 0.1 * pulse * ramp;
        break;
      }
    }
  }
  return s;
}

/** When the last entrance finishes; used to suggest a clip length. */
export function entranceEnd(specs: AnimSpec[]): number {
  return specs.reduce((m, a) => (a.enter === 'none' ? m : Math.max(m, a.delay + a.duration)), 0);
}

export function hasAnimation(specs: AnimSpec[]): boolean {
  return specs.some((a) => a.enter !== 'none' || a.loop !== 'none');
}

/** Staggered entrances for everything, in stacking order (back to front). */
export function autoAnimate(kinds: ('text' | 'image' | 'shape')[]): AnimSpec[] {
  let textIndex = 0;
  return kinds.map((kind, i) => {
    const delay = 0.15 + i * 0.22;
    if (kind === 'text') {
      const enter: EnterType = textIndex++ === 0 ? 'pop' : 'fromBottom';
      return { enter, loop: textIndex === 1 ? 'pulse' : 'none', delay, duration: 0.7 };
    }
    if (kind === 'image') return { enter: 'zoom', loop: 'float', delay, duration: 0.8 };
    return { enter: 'fade', loop: 'none', delay, duration: 0.6 };
  });
}
