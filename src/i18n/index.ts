import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from './resources';
import { languageByCode, type LanguageCode } from './languages';
import { useSettings } from '../store/settings';

const saved = languageByCode(useSettings.getState().language);
document.documentElement.lang = saved.code;
document.documentElement.dir = saved.dir;

void i18n.use(initReactI18next).init({
  resources,
  lng: saved.code,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false
});

/** Switch language and flip the document direction for right-to-left languages. */
export function applyLanguage(code: LanguageCode): void {
  const lang = languageByCode(code);
  void i18n.changeLanguage(lang.code);
  document.documentElement.lang = lang.code;
  document.documentElement.dir = lang.dir;
}

export default i18n;
