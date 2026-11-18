import { describe, expect, it } from 'vitest';
import { ENTER_TYPES, LOOP_TYPES, NO_ANIM, REST, animStateAt, autoAnimate, entranceEnd, hasAnimation, type AnimSpec } from '../src/editor/animation';
import { resources } from '../src/i18n/resources';

const W = 1280;
const H = 720;
const spec = (p: Partial<AnimSpec>): AnimSpec => ({ ...NO_ANIM, ...p });

describe('animation engine', () => {
  it('leaves objects untouched with no animation', () => {
    expect(animStateAt(NO_ANIM, 0, W, H)).toEqual(REST);
    expect(animStateAt(NO_ANIM, 3, W, H)).toEqual(REST);
  });

  it('every entrance ends exactly at rest', () => {
    for (const enter of ENTER_TYPES) {
      const s = animStateAt(spec({ enter, delay: 0.5, duration: 0.8 }), 1.3, W, H);
      expect(s.opacity, enter).toBeCloseTo(1, 5);
      expect(s.dx, enter).toBeCloseTo(0, 5);
      expect(s.dy, enter).toBeCloseTo(0, 5);
      expect(s.scale, enter).toBeCloseTo(1, 5);
      expect(s.rotate, enter).toBeCloseTo(0, 5);
      expect(s.reveal, enter).toBeCloseTo(1, 5);
    }
  });

  it('hides fading items before their delay', () => {
    expect(animStateAt(spec({ enter: 'fade', delay: 1 }), 0.5, W, H).opacity).toBe(0);
    expect(animStateAt(spec({ enter: 'fromLeft', delay: 1 }), 0, W, H).dx).toBeLessThan(0);
    expect(animStateAt(spec({ enter: 'fromRight', delay: 1 }), 0, W, H).dx).toBeGreaterThan(0);
    expect(animStateAt(spec({ enter: 'typewriter', duration: 1 }), 0.5, W, H).reveal).toBeCloseTo(0.5);
  });

  it('loops start smoothly from rest (no jump)', () => {
    for (const loop of LOOP_TYPES) {
      const s = animStateAt(spec({ loop }), 0, W, H);
      expect(s.scale, loop).toBeCloseTo(1, 5);
      expect(s.dx, loop).toBeCloseTo(0, 5);
      expect(s.dy, loop).toBeCloseTo(0, 5);
      expect(s.rotate, loop).toBeCloseTo(0, 5);
    }
  });

  it('loops keep moving over time', () => {
    const a = animStateAt(spec({ loop: 'float' }), 0.5, W, H);
    expect(Math.abs(a.dy)).toBeGreaterThan(0);
    const p = animStateAt(spec({ loop: 'pulse' }), 0.3, W, H);
    expect(p.scale).not.toBeCloseTo(1, 3);
  });

  it('auto-animate staggers entrances and suggests a clip length', () => {
    const specs = autoAnimate(['shape', 'text', 'text', 'image']);
    expect(specs.map((s) => s.delay)).toEqual([...specs.map((s) => s.delay)].sort((a, b) => a - b));
    expect(specs[1].enter).toBe('pop');
    expect(specs[2].enter).toBe('fromBottom');
    expect(hasAnimation(specs)).toBe(true);
    expect(entranceEnd(specs)).toBeGreaterThan(0.5);
    expect(hasAnimation([NO_ANIM])).toBe(false);
  });

  it('has a translated name for every preset in every language', () => {
    for (const [code, r] of Object.entries(resources)) {
      for (const e of ENTER_TYPES) expect(r.translation.enter[e], `${code}:enter.${e}`).toBeTruthy();
      for (const l of LOOP_TYPES) expect(r.translation.loop[l], `${code}:loop.${l}`).toBeTruthy();
    }
  });
});
