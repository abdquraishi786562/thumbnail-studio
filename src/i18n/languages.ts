export type LanguageCode = 'en' | 'fa-AF' | 'ps' | 'fa' | 'ar' | 'ur' | 'uz' | 'tr' | 'fr' | 'es' | 'de' | 'ru';

export interface Language {
  code: LanguageCode;
  /** Name in the language itself. */
  native: string;
  /** Name in English. */
  english: string;
  dir: 'ltr' | 'rtl';
}

export const LANGUAGES: Language[] = [
  { code: 'en', native: 'English', english: 'English', dir: 'ltr' },
  { code: 'fa-AF', native: 'دری', english: 'Dari', dir: 'rtl' },
  { code: 'ps', native: 'پښتو', english: 'Pashto', dir: 'rtl' },
  { code: 'fa', native: 'فارسی', english: 'Persian', dir: 'rtl' },
  { code: 'ar', native: 'العربية', english: 'Arabic', dir: 'rtl' },
  { code: 'ur', native: 'اردو', english: 'Urdu', dir: 'rtl' },
  { code: 'uz', native: 'Oʻzbekcha', english: 'Uzbek', dir: 'ltr' },
  { code: 'tr', native: 'Türkçe', english: 'Turkish', dir: 'ltr' },
  { code: 'fr', native: 'Français', english: 'French', dir: 'ltr' },
  { code: 'es', native: 'Español', english: 'Spanish', dir: 'ltr' },
  { code: 'de', native: 'Deutsch', english: 'German', dir: 'ltr' },
  { code: 'ru', native: 'Русский', english: 'Russian', dir: 'ltr' }
];

export function languageByCode(code: string): Language {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}
