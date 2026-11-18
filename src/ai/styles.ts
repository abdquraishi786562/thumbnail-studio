/** Visual styles the generator can design in. */
export const STYLES = ['auto', 'bold', 'minimal', 'gaming', 'tech', 'education', 'news', 'vlog', 'food', 'travel', 'business'] as const;
export type StyleId = (typeof STYLES)[number];
export type ConcreteStyle = Exclude<StyleId, 'auto'>;

export interface Palette {
  bg1: string;
  bg2: string;
  /** Headline colour. */
  text: string;
  /** Second headline colour for gradient fills and highlights. */
  text2: string;
  accent: string;
  /** Outline / dark contrast colour. */
  ink: string;
  /** Effect (glow/shadow) colour. */
  glow: string;
}

export const PALETTES: Record<ConcreteStyle, Palette[]> = {
  bold: [
    { bg1: '#5b21b6', bg2: '#db2777', text: '#ffffff', text2: '#fde047', accent: '#fde047', ink: '#000000', glow: '#000000' },
    { bg1: '#dc2626', bg2: '#c2410c', text: '#ffffff', text2: '#fef08a', accent: '#111827', ink: '#000000', glow: '#000000' }
  ],
  minimal: [
    { bg1: '#f8fafc', bg2: '#e2e8f0', text: '#0f172a', text2: '#4f46e5', accent: '#6366f1', ink: '#ffffff', glow: '#94a3b8' },
    { bg1: '#111827', bg2: '#1f2937', text: '#f9fafb', text2: '#a5b4fc', accent: '#f9fafb', ink: '#000000', glow: '#000000' }
  ],
  gaming: [
    { bg1: '#12002b', bg2: '#6d00ff', text: '#ffffff', text2: '#00f5ff', accent: '#00f5ff', ink: '#000000', glow: '#ff2d87' },
    { bg1: '#000000', bg2: '#ff0055', text: '#ffe600', text2: '#ff7a00', accent: '#00ff9d', ink: '#000000', glow: '#ff0055' }
  ],
  tech: [
    { bg1: '#020617', bg2: '#1e3a8a', text: '#ffffff', text2: '#38bdf8', accent: '#22d3ee', ink: '#020617', glow: '#22d3ee' },
    { bg1: '#0f172a', bg2: '#334155', text: '#ffffff', text2: '#a3e635', accent: '#a3e635', ink: '#000000', glow: '#000000' }
  ],
  education: [
    { bg1: '#fef3c7', bg2: '#fde68a', text: '#111827', text2: '#dc2626', accent: '#2563eb', ink: '#ffffff', glow: '#000000' },
    { bg1: '#1d4ed8', bg2: '#0369a1', text: '#ffffff', text2: '#fde047', accent: '#fde047', ink: '#000000', glow: '#000000' }
  ],
  news: [
    { bg1: '#111827', bg2: '#7f1d1d', text: '#ffffff', text2: '#facc15', accent: '#ef4444', ink: '#000000', glow: '#000000' },
    { bg1: '#f8fafc', bg2: '#cbd5e1', text: '#111827', text2: '#b91c1c', accent: '#dc2626', ink: '#ffffff', glow: '#000000' }
  ],
  vlog: [
    { bg1: '#e11d48', bg2: '#c2410c', text: '#ffffff', text2: '#fef08a', accent: '#1e293b', ink: '#1e293b', glow: '#000000' },
    { bg1: '#0e7490', bg2: '#7e22ce', text: '#ffffff', text2: '#fde68a', accent: '#fde68a', ink: '#000000', glow: '#000000' }
  ],
  food: [
    { bg1: '#7c2d12', bg2: '#ea580c', text: '#fff7ed', text2: '#facc15', accent: '#16a34a', ink: '#000000', glow: '#000000' },
    { bg1: '#fef9c3', bg2: '#fdba74', text: '#7c2d12', text2: '#dc2626', accent: '#dc2626', ink: '#ffffff', glow: '#000000' }
  ],
  travel: [
    { bg1: '#0369a1', bg2: '#0e7490', text: '#ffffff', text2: '#fde047', accent: '#fde047', ink: '#0f172a', glow: '#0f172a' },
    { bg1: '#c2410c', bg2: '#be185d', text: '#ffffff', text2: '#fef3c7', accent: '#fef3c7', ink: '#000000', glow: '#000000' }
  ],
  business: [
    { bg1: '#0f172a', bg2: '#1e293b', text: '#ffffff', text2: '#22c55e', accent: '#22c55e', ink: '#000000', glow: '#000000' },
    { bg1: '#064e3b', bg2: '#0f766e', text: '#ffffff', text2: '#facc15', accent: '#facc15', ink: '#000000', glow: '#000000' }
  ]
};

export const EMOJI: Record<ConcreteStyle, string[]> = {
  bold: ['🔥', '⚡', '😱'],
  minimal: ['✨', '👉', '💡'],
  gaming: ['🎮', '🔥', '💥'],
  tech: ['🚀', '📱', '🤖'],
  education: ['💡', '📚', '✅'],
  news: ['📰', '⚠️', '🔴'],
  vlog: ['❤️', '😍', '🎉'],
  food: ['🍔', '😋', '🔥'],
  travel: ['✈️', '🌍', '📍'],
  business: ['💰', '📈', '💼']
};

/** Words that suggest a style, in several languages. */
const KEYWORDS: [ConcreteStyle, string[]][] = [
  ['gaming', ['game', 'gaming', 'gamer', 'minecraft', 'fortnite', 'pubg', 'gta', 'roblox', 'fifa', 'بازی', 'لوبه', 'لوبې', 'لعبة', 'گیم', 'oyun', 'jeu', 'juego', 'spiel', 'игра', 'oʻyin']],
  ['tech', ['tech', 'phone', 'iphone', 'android', 'laptop', 'computer', 'pc', 'ai', 'app', 'code', 'coding', 'software', 'gadget', 'unboxing', 'تکنالوژی', 'تکنولوژی', 'موبایل', 'کمپیوتر', 'کامپیوتر', 'هوش مصنوعی', 'ټکنالوژي', 'تقنية', 'هاتف', 'ٹیکنالوجی', 'teknoloji', 'technologie', 'tecnología', 'технолог', 'телефон']],
  ['education', ['learn', 'learning', 'how to', 'tutorial', 'lesson', 'course', 'english', 'math', 'study', 'exam', 'guide', 'school', 'آموزش', 'یاد', 'درس', 'زده', 'ښوونه', 'تعلم', 'درس', 'سیکھ', 'öğren', 'ders', 'apprendre', 'cours', 'aprende', 'curso', 'lernen', 'урок', 'учи', 'oʻrgan']],
  ['news', ['news', 'breaking', 'update', 'today', 'report', 'election', 'خبر', 'اخبار', 'خبرونه', 'أخبار', 'خبریں', 'haber', 'actualité', 'noticias', 'nachrichten', 'новости', 'yangilik']],
  ['food', ['food', 'recipe', 'cook', 'cooking', 'kitchen', 'eat', 'pizza', 'burger', 'cake', 'غذا', 'پخت', 'خوراک', 'پخلی', 'وصفة', 'طعام', 'کھانا', 'yemek', 'tarif', 'recette', 'receta', 'rezept', 'рецепт', 'еда', 'taom']],
  ['travel', ['travel', 'trip', 'tour', 'visit', 'city', 'country', 'vacation', 'hotel', 'سفر', 'سیاحت', 'ګرځند', 'رحلة', 'seyahat', 'voyage', 'viaje', 'reise', 'путешеств', 'sayohat']],
  ['business', ['money', 'business', 'earn', 'income', 'startup', 'marketing', 'invest', 'sales', 'پول', 'کسب', 'تجارت', 'پیسې', 'سوداګري', 'مال', 'أعمال', 'پیسہ', 'para', 'argent', 'dinero', 'geld', 'деньги', 'бизнес', 'pul']],
  ['vlog', ['vlog', 'day in', 'my life', 'family', 'wedding', 'routine', 'ولاگ', 'زندگی', 'ژوند', 'عروسی', 'واده', 'حياة', 'زندگی']]
];

const LATIN_WORD = /^[a-z][a-z ]*$/;

/** Latin keywords must start a word ("ai" must not match "mountains"); other scripts match anywhere. */
function mentions(text: string, word: string): boolean {
  if (!LATIN_WORD.test(word)) return text.includes(word);
  return new RegExp(`(^|[^\\p{L}])${word}`, 'u').test(text);
}

export function detectStyle(idea: string): ConcreteStyle {
  const text = ` ${idea.toLowerCase()} `;
  let best: ConcreteStyle = 'bold';
  let score = 0;
  for (const [style, words] of KEYWORDS) {
    const s = words.reduce((n, w) => n + (mentions(text, w) ? 1 : 0), 0);
    if (s > score) {
      score = s;
      best = style;
    }
  }
  return best;
}

export type ContentLang = 'en' | 'fa-AF' | 'ps' | 'fa' | 'ar' | 'ur' | 'uz' | 'tr' | 'fr' | 'es' | 'de' | 'ru';

/** Badge words, in the language of the thumbnail text. */
const BADGES: Record<ContentLang, Record<ConcreteStyle, string>> = {
  en: { bold: 'NEW', minimal: 'NEW', gaming: 'EPIC', tech: 'REVIEW', education: 'LEARN', news: 'NEWS', vlog: 'VLOG', food: 'RECIPE', travel: 'TRAVEL', business: 'TIPS' },
  'fa-AF': { bold: 'جدید', minimal: 'جدید', gaming: 'فوق‌العاده', tech: 'بررسی', education: 'آموزش', news: 'خبر', vlog: 'ولاگ', food: 'دستور پخت', travel: 'سفر', business: 'نکته‌ها' },
  ps: { bold: 'نوی', minimal: 'نوی', gaming: 'زبردست', tech: 'کتنه', education: 'زده کړه', news: 'خبر', vlog: 'ولاګ', food: 'د پخلي لارښود', travel: 'سفر', business: 'لارښوونې' },
  fa: { bold: 'جدید', minimal: 'جدید', gaming: 'حماسی', tech: 'بررسی', education: 'آموزش', news: 'خبر', vlog: 'ولاگ', food: 'دستور پخت', travel: 'سفر', business: 'ترفند' },
  ar: { bold: 'جديد', minimal: 'جديد', gaming: 'ملحمي', tech: 'مراجعة', education: 'تعلّم', news: 'أخبار', vlog: 'فلوق', food: 'وصفة', travel: 'سفر', business: 'نصائح' },
  ur: { bold: 'نیا', minimal: 'نیا', gaming: 'زبردست', tech: 'جائزہ', education: 'سیکھیں', news: 'خبریں', vlog: 'وی لاگ', food: 'ترکیب', travel: 'سفر', business: 'ٹپس' },
  uz: { bold: 'YANGI', minimal: 'YANGI', gaming: 'ZOʻR', tech: 'SHARH', education: 'OʻRGANING', news: 'YANGILIK', vlog: 'VLOG', food: 'RETSEPT', travel: 'SAYOHAT', business: 'MASLAHAT' },
  tr: { bold: 'YENİ', minimal: 'YENİ', gaming: 'EFSANE', tech: 'İNCELEME', education: 'ÖĞREN', news: 'HABER', vlog: 'VLOG', food: 'TARİF', travel: 'SEYAHAT', business: 'İPUÇLARI' },
  fr: { bold: 'NOUVEAU', minimal: 'NOUVEAU', gaming: 'ÉPIQUE', tech: 'TEST', education: 'APPRENDRE', news: 'INFO', vlog: 'VLOG', food: 'RECETTE', travel: 'VOYAGE', business: 'ASTUCES' },
  es: { bold: 'NUEVO', minimal: 'NUEVO', gaming: 'ÉPICO', tech: 'RESEÑA', education: 'APRENDE', news: 'NOTICIAS', vlog: 'VLOG', food: 'RECETA', travel: 'VIAJE', business: 'TRUCOS' },
  de: { bold: 'NEU', minimal: 'NEU', gaming: 'EPISCH', tech: 'TEST', education: 'LERNEN', news: 'NEWS', vlog: 'VLOG', food: 'REZEPT', travel: 'REISE', business: 'TIPPS' },
  ru: { bold: 'НОВОЕ', minimal: 'НОВОЕ', gaming: 'ЭПИК', tech: 'ОБЗОР', education: 'УЧИСЬ', news: 'НОВОСТИ', vlog: 'ВЛОГ', food: 'РЕЦЕПТ', travel: 'ПУТЕШЕСТВИЕ', business: 'СОВЕТЫ' }
};

export function badgeFor(style: ConcreteStyle, lang: ContentLang): string {
  return (BADGES[lang] ?? BADGES.en)[style];
}

const PASHTO_ONLY = /[ټډړښږګڼۍې]/;
const URDU_ONLY = /[ٹڈڑےںھ]/;
const ARABIC_HINT = /[ةىأإؤ]/;
const PERSIAN_LETTERS = /[پچژگ]/;
const CYRILLIC = /[Ѐ-ӿ]/;
const ARABIC_SCRIPT = /[؀-ۿ]/;

/** Which language the idea is written in, so badge words match it. Falls back to the app language. */
export function contentLanguage(idea: string, uiLang: string): ContentLang {
  if (ARABIC_SCRIPT.test(idea)) {
    if (PASHTO_ONLY.test(idea)) return 'ps';
    if (URDU_ONLY.test(idea)) return 'ur';
    if (ARABIC_HINT.test(idea) && !PERSIAN_LETTERS.test(idea)) return 'ar';
    if (uiLang === 'fa' || uiLang === 'fa-AF') return uiLang;
    if (uiLang === 'ps' || uiLang === 'ur' || uiLang === 'ar') return uiLang as ContentLang;
    return 'fa-AF';
  }
  if (CYRILLIC.test(idea)) return 'ru';
  const latin: ContentLang[] = ['en', 'uz', 'tr', 'fr', 'es', 'de'];
  return (latin as string[]).includes(uiLang) ? (uiLang as ContentLang) : 'en';
}
