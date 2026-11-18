// Strong right-to-left characters: Hebrew, Arabic (incl. Persian/Dari/Pashto/Urdu letters),
// Syriac, Thaana, NKo, and the Arabic presentation forms.
const RTL = /[֐-ࣿיִ-﷿ﹰ-﻿]/;
// Strong left-to-right characters: Latin, Greek, Cyrillic and other alphabetic scripts.
const LTR = /[A-Za-zÀ-ɏͰ-ϿЀ-ӿԀ-ԯḀ-ỿ]/;

export type TextDirection = 'ltr' | 'rtl';

/**
 * Direction of a paragraph from its first strong character (Unicode bidi rule P2/P3).
 * Digits, spaces and punctuation are neutral and skipped.
 */
export function detectDirection(text: string, fallback: TextDirection = 'ltr'): TextDirection {
  for (const ch of text) {
    if (RTL.test(ch)) return 'rtl';
    if (LTR.test(ch)) return 'ltr';
  }
  return fallback;
}
