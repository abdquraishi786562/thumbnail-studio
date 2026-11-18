import { describe, expect, it } from 'vitest';
import { keywords, shout, writeCopy } from '../src/ai/copy';
import { badgeFor, contentLanguage, detectStyle, PALETTES, STYLES } from '../src/ai/styles';
import { clampBox, textScale } from '../src/editor/autofit';
import { picturePrompt, picturesEnabled, NO_PICTURES } from '../src/ai/pictures';
import { contrastRatio } from '../src/theme/themes';

describe('built-in copywriter', () => {
  it('turns a long English idea into short, upper-case headlines', () => {
    const v = writeCopy('10 easy ways to learn English at home', 'education', 'en');
    expect(v.length).toBeGreaterThanOrEqual(2);
    for (const c of v) {
      expect(c.headline).toBe(c.headline.toUpperCase());
      expect(c.headline.split(' ').length).toBeLessThanOrEqual(5);
    }
    expect(v.some((c) => c.headline.startsWith('10 '))).toBe(true);
    expect(v.some((c) => c.number === '10')).toBe(true);
  });

  it('drops filler words', () => {
    expect(keywords('how to make the best pizza in the world', 3)).toEqual(['how', 'make', 'best']);
  });

  it('keeps question hooks', () => {
    const v = writeCopy('Why is everyone talking about electric cars', 'tech', 'en');
    expect(v.some((c) => c.headline.endsWith('?'))).toBe(true);
  });

  it('writes Dari and Pashto without changing letters, with the right question mark', () => {
    const dari = writeCopy('چطور در خانه انگلیسی یاد بگیریم', 'education', 'fa-AF');
    expect(dari.length).toBeGreaterThan(0);
    expect(dari.some((c) => c.headline.endsWith('؟'))).toBe(true);
    const pashto = writeCopy('په کور کې د انګرېزي ژبې زده کړه', 'education', 'ps');
    expect(pashto[0].headline).toMatch(/انګرېزي|ژبې|کور/);
    expect(pashto.every((c) => !/\b(په|د)\b/.test(c.headline.split(' ')[0]))).toBe(true);
  });

  it('finds Persian digits too', () => {
    const v = writeCopy('۵ نکته برای عکاسی با موبایل', 'tech', 'fa-AF');
    expect(v.some((c) => c.number === '۵')).toBe(true);
  });

  it('uses Turkish casing rules', () => {
    expect(shout('istanbul gezisi', 'tr')).toBe('İSTANBUL GEZİSİ');
  });

  it('returns nothing for an empty idea', () => {
    expect(writeCopy('   ', 'bold', 'en')).toEqual([]);
  });
});

describe('style and language detection', () => {
  it('guesses the style from the idea', () => {
    expect(detectStyle('Minecraft survival gameplay part 3')).toBe('gaming');
    expect(detectStyle('Easy chocolate cake recipe')).toBe('food');
    expect(detectStyle('سفر به بامیان')).toBe('travel');
    expect(detectStyle('something unusual')).toBe('bold');
    // short keywords must not match inside other words ("ai" in "mountains")
    expect(detectStyle('A weekend trip to the mountains')).toBe('travel');
    expect(detectStyle('Best AI tools for students')).not.toBe('travel');
  });

  it('detects the language of the idea', () => {
    expect(contentLanguage('په کور کې د انګرېزي زده کړه', 'en')).toBe('ps');
    expect(contentLanguage('سفر به بامیان', 'en')).toBe('fa-AF');
    expect(contentLanguage('سفر به بامیان', 'fa')).toBe('fa');
    expect(contentLanguage('رحلة إلى مكة المكرمة', 'en')).toBe('ar');
    expect(contentLanguage('گھر پر کھانا پکانے کی ترکیب', 'en')).toBe('ur');
    expect(contentLanguage('Путешествие в горы', 'en')).toBe('ru');
    expect(contentLanguage('Voyage à Paris', 'fr')).toBe('fr');
    expect(contentLanguage('Trip to Kabul', 'ps')).toBe('en');
  });

  it('has a badge word for every style in every language', () => {
    for (const lang of ['en', 'fa-AF', 'ps', 'fa', 'ar', 'ur', 'uz', 'tr', 'fr', 'es', 'de', 'ru'] as const) {
      for (const s of STYLES.filter((x) => x !== 'auto')) expect(badgeFor(s as never, lang), `${lang}:${s}`).toBeTruthy();
    }
  });

  it('keeps headline colours readable on every palette background', () => {
    for (const [style, list] of Object.entries(PALETTES)) {
      for (const p of list) {
        const worst = Math.min(contrastRatio(p.text, p.bg1), contrastRatio(p.text, p.bg2));
        expect(worst, `${style} ${p.bg1}`).toBeGreaterThanOrEqual(3);
      }
    }
  });
});

describe('auto-fit maths', () => {
  it('grows text for tall covers and shrinks it for wide banners', () => {
    expect(textScale({ w: 1280, h: 720 }, { w: 1080, h: 1920 })).toBeGreaterThan(1.3);
    expect(textScale({ w: 1280, h: 720 }, { w: 1200, h: 630 })).toBeLessThan(1);
    expect(textScale({ w: 1280, h: 720 }, { w: 1280, h: 720 })).toBe(1);
  });

  it('keeps boxes inside the safe margin', () => {
    expect(clampBox(-50, -50, 100, 100, { w: 1000, h: 1000 }, 50)).toEqual({ left: 50, top: 50 });
    expect(clampBox(980, 980, 100, 100, { w: 1000, h: 1000 }, 50)).toEqual({ left: 850, top: 850 });
    expect(clampBox(0, 0, 1200, 100, { w: 1000, h: 1000 }, 50).left).toBe(-100);
  });
});

describe('picture service', () => {
  it('is off until a service and key are set', () => {
    expect(picturesEnabled(NO_PICTURES)).toBe(false);
    expect(picturesEnabled({ service: 'openai', baseUrl: 'https://api.openai.com/v1', model: 'gpt-image-1-mini', apiKey: '' })).toBe(false);
    expect(picturesEnabled({ service: 'openai', baseUrl: 'https://api.openai.com/v1', model: 'gpt-image-1-mini', apiKey: 'sk-x' })).toBe(true);
  });

  it('asks for a picture with room for the title and no lettering', () => {
    const p = picturePrompt('Trip to Bamyan', 'travel', false);
    expect(p).toContain('Trip to Bamyan');
    expect(p).toContain('No text');
    expect(picturePrompt('سفر به بامیان', 'travel', true)).toContain('empty space on the right');
  });
});
