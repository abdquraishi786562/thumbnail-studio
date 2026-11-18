import en from './locales/en';
import faAF from './locales/fa-AF';
import ps from './locales/ps';
import fa from './locales/fa';
import ar from './locales/ar';
import ur from './locales/ur';
import uz from './locales/uz';
import tr from './locales/tr';
import fr from './locales/fr';
import es from './locales/es';
import de from './locales/de';
import ru from './locales/ru';
import en2 from './locales/step2/en';
import faAF2 from './locales/step2/fa-AF';
import ps2 from './locales/step2/ps';
import fa2 from './locales/step2/fa';
import ar2 from './locales/step2/ar';
import ur2 from './locales/step2/ur';
import uz2 from './locales/step2/uz';
import tr2 from './locales/step2/tr';
import fr2 from './locales/step2/fr';
import es2 from './locales/step2/es';
import de2 from './locales/step2/de';
import ru2 from './locales/step2/ru';

// Each build step adds its own top-level sections; they never overlap.
export const resources = {
  en: { translation: { ...en, ...en2 } },
  'fa-AF': { translation: { ...faAF, ...faAF2 } },
  ps: { translation: { ...ps, ...ps2 } },
  fa: { translation: { ...fa, ...fa2 } },
  ar: { translation: { ...ar, ...ar2 } },
  ur: { translation: { ...ur, ...ur2 } },
  uz: { translation: { ...uz, ...uz2 } },
  tr: { translation: { ...tr, ...tr2 } },
  fr: { translation: { ...fr, ...fr2 } },
  es: { translation: { ...es, ...es2 } },
  de: { translation: { ...de, ...de2 } },
  ru: { translation: { ...ru, ...ru2 } }
} as const;
