/**
 * Built-in copywriter: turns a video idea into short, punchy thumbnail text.
 * Works offline in every language. On-device AI (when available) replaces it with
 * smarter wording, using the same `Copy` shape.
 */
import { detectDirection } from '../editor/textDirection';
import { badgeFor, type ConcreteStyle, type ContentLang } from './styles';

export interface Copy {
  headline: string;
  sub: string;
  badge: string | null;
  /** A number from the idea ("10 tips" → "10"), shown huge in some layouts. */
  number: string | null;
}

const STOP = new Set(
  [
    // English
    'a', 'an', 'the', 'of', 'to', 'in', 'on', 'for', 'and', 'or', 'with', 'my', 'your', 'our', 'is', 'are', 'was', 'be', 'this', 'that',
    'these', 'those', 'i', 'we', 'you', 'it', 'from', 'at', 'by', 'about', 'into', 'video', 'episode', 'part', 'will', 'can', 'just', 'very',
    // Dari / Persian
    'و', 'در', 'به', 'از', 'که', 'این', 'آن', 'با', 'برای', 'را', 'یک', 'است', 'هست', 'می', 'شود', 'ها', 'های', 'هم', 'تا', 'ویدیو',
    // Pashto
    'او', 'په', 'د', 'له', 'چې', 'دا', 'هغه', 'سره', 'لپاره', 'یو', 'کې', 'ته', 'دی', 'ده', 'دي', 'هم', 'ویډیو',
    // Arabic
    'في', 'من', 'إلى', 'على', 'عن', 'مع', 'هذا', 'هذه', 'ذلك', 'التي', 'الذي', 'هو', 'هي', 'فيديو',
    // Urdu
    'اور', 'میں', 'کے', 'کی', 'کا', 'کو', 'سے', 'یہ', 'وہ', 'ہے', 'ہیں', 'پر', 'ویڈیو',
    // Turkish, French, Spanish, German, Russian, Uzbek (a few common ones)
    've', 'bir', 'bu', 'için', 'ile', 'le', 'la', 'les', 'de', 'des', 'du', 'et', 'un', 'une', 'pour', 'el', 'los', 'las', 'y', 'en', 'del', 'por',
    'para', 'der', 'die', 'das', 'und', 'ein', 'eine', 'mit', 'für', 'и', 'в', 'на', 'с', 'по', 'для', 'это', 'va', 'bilan', 'uchun'
  ].map((w) => w.toLowerCase())
);

/** Question words that make a good hook when they start the idea. */
const QUESTION = /^(how|why|what|when|which|who|can|should|is|are|چطور|چگونه|چرا|چی|چه|څنګه|ولې|څه|كيف|لماذا|ماذا|هل|کیسے|کیوں|کیا|nasıl|neden|comment|pourquoi|cómo|por qué|wie|warum|как|почему|qanday|nega)(?=[\s?؟]|$)/i;

const DIGITS = /[0-9۰-۹٠-٩]+/;
const NON_LATIN_CASE = /[؀-ۿ֐-׿]/;

function tidy(s: string): string {
  return s.replace(/\s+/g, ' ').replace(/^[\s\-–—:,.!?؟،]+|[\s\-–—:,]+$/g, '').trim();
}

/** Upper-case scripts that have case; leave Arabic-script text alone. Turkish needs its own dotted I. */
export function shout(text: string, lang: ContentLang): string {
  if (NON_LATIN_CASE.test(text)) return text;
  return lang === 'tr' || lang === 'uz' ? text.toLocaleUpperCase('tr') : text.toLocaleUpperCase(lang);
}

function words(text: string): string[] {
  return text.split(/[\s,.;:!?؟،()"“”'«»|/]+/).filter(Boolean);
}

/** Keep the first `max` meaningful words (stopwords dropped, order kept). */
export function keywords(text: string, max: number): string[] {
  const out: string[] = [];
  for (const w of words(text)) {
    if (STOP.has(w.toLowerCase())) continue;
    out.push(w);
    if (out.length >= max) break;
  }
  return out;
}

function limit(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const cut = text.slice(0, maxChars);
  const sp = cut.lastIndexOf(' ');
  return (sp > maxChars * 0.5 ? cut.slice(0, sp) : cut).trim() + '…';
}

/** Several wordings of the same idea, best first. */
export function writeCopy(idea: string, style: ConcreteStyle, lang: ContentLang): Copy[] {
  const clean = tidy(idea);
  if (!clean) return [];
  const rtl = detectDirection(clean) === 'rtl';
  const number = clean.match(DIGITS)?.[0] ?? null;
  const badge = badgeFor(style, lang);
  const sub = limit(clean, 48);
  const variants: Copy[] = [];
  const add = (headline: string, s: string, b: string | null, n: string | null) => {
    const h = shout(tidy(headline), lang);
    if (h && !variants.some((v) => v.headline === h)) variants.push({ headline: h, sub: s, badge: b, number: n });
  };

  const all = words(clean);
  // 1. The idea itself when short; otherwise its key words.
  if (all.length <= 5 && clean.length <= 30) add(clean, '', badge, number);
  add(keywords(clean, 3).join(' '), sub, badge, number);
  // 2. Question hook: keep the question word.
  if (QUESTION.test(clean)) {
    const q = all.slice(0, Math.min(4, all.length)).join(' ');
    add(q.endsWith('?') || q.endsWith('؟') ? q : `${q}${rtl ? '؟' : '?'}`, limit(all.slice(4).join(' '), 48), null, null);
  }
  // 3. Number-led: "10 TIPS …".
  if (number) {
    const rest = keywords(clean.replace(number, ''), 2).join(' ');
    add(`${number} ${rest}`, sub, null, number);
  }
  // 4. Two strongest words, punchier.
  add(keywords(clean, 2).join(' '), sub, badge, null);
  // 5. The last words often carry the topic ("… at home").
  const tail = keywords(clean, 8).slice(-3).join(' ');
  add(tail, sub, badge, null);
  return variants.slice(0, 4);
}
