import { describe, expect, it } from 'vitest';
import { detectDirection } from '../src/editor/textDirection';
import { PLATFORMS, fitScale } from '../src/editor/platforms';
import { contrastRatio, customTheme, THEMES, THEME_ORDER, CUSTOM_SWATCHES } from '../src/theme/themes';
import { resources } from '../src/i18n/resources';
import { LANGUAGES } from '../src/i18n/languages';

describe('text direction', () => {
  it('detects Dari, Pashto, Arabic and Urdu as right-to-left', () => {
    expect(detectDirection('عنوان بزرگ شما')).toBe('rtl');
    expect(detectDirection('ستاسو لوی سرليک ټ ډ ړ ښ')).toBe('rtl');
    expect(detectDirection('عنوانك الكبير')).toBe('rtl');
    expect(detectDirection('آپ کی بڑی سرخی')).toBe('rtl');
  });
  it('detects Latin and Cyrillic as left-to-right', () => {
    expect(detectDirection('YOUR BIG TITLE')).toBe('ltr');
    expect(detectDirection('ВАШ ЗАГОЛОВОК')).toBe('ltr');
  });
  it('uses the first strong character and skips digits and punctuation', () => {
    expect(detectDirection('2026 - سال نو! New year')).toBe('rtl');
    expect(detectDirection('10 ways: عکس')).toBe('ltr');
    expect(detectDirection('123 !!!', 'rtl')).toBe('rtl');
  });
});

describe('platform sizes', () => {
  it('has the YouTube size first at 1280x720', () => {
    expect(PLATFORMS[0]).toMatchObject({ id: 'youtube', width: 1280, height: 720 });
  });
  it('fits a design inside a box', () => {
    expect(fitScale(1280, 720, 640, 640)).toBe(0.5);
    expect(fitScale(1080, 1920, 1000, 960)).toBe(0.5);
  });
});

describe('themes', () => {
  it('keeps main text readable in every theme (WCAG AA 4.5:1)', () => {
    for (const id of THEME_ORDER) {
      const tk = THEMES[id];
      expect(contrastRatio(tk.text, tk.surface), id).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(tk.text, tk.bg), id).toBeGreaterThanOrEqual(4.5);
    }
  });
  it('keeps button text readable on accent colours', () => {
    for (const id of THEME_ORDER) {
      const tk = THEMES[id];
      expect(contrastRatio(tk.accentText, tk.accent), id).toBeGreaterThanOrEqual(2.5);
    }
  });
  it('builds readable custom themes from every swatch, light and dark', () => {
    for (const c of CUSTOM_SWATCHES) {
      for (const dark of [true, false]) {
        const tk = customTheme(c, dark);
        expect(contrastRatio(tk.text, tk.surface)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(tk.accentText, tk.accent)).toBeGreaterThanOrEqual(2.5);
      }
    }
  });
});

describe('translations', () => {
  const keys = (o: object, prefix = ''): string[] =>
    Object.entries(o).flatMap(([k, v]) => (typeof v === 'object' ? keys(v as object, `${prefix}${k}.`) : [`${prefix}${k}`]));
  const english = keys(resources.en.translation).sort();

  it('has a translation file for every language in the menu', () => {
    for (const l of LANGUAGES) expect(Object.keys(resources)).toContain(l.code);
  });
  it('translates every key, with no empty strings', () => {
    for (const [code, r] of Object.entries(resources)) {
      expect(keys(r.translation).sort(), code).toEqual(english);
      for (const k of keys(r.translation)) {
        const v = k.split('.').reduce<unknown>((o, p) => (o as Record<string, unknown>)[p], r.translation);
        expect(String(v).trim().length, `${code}:${k}`).toBeGreaterThan(0);
      }
    }
  });
  it('keeps the {{name}} placeholder in every language', () => {
    for (const [code, r] of Object.entries(resources)) expect(r.translation.export.done, code).toContain('{{name}}');
  });
});
