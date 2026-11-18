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
import en3 from './locales/step3/en';
import faAF3 from './locales/step3/fa-AF';
import ps3 from './locales/step3/ps';
import fa3 from './locales/step3/fa';
import ar3 from './locales/step3/ar';
import ur3 from './locales/step3/ur';
import uz3 from './locales/step3/uz';
import tr3 from './locales/step3/tr';
import fr3 from './locales/step3/fr';
import es3 from './locales/step3/es';
import de3 from './locales/step3/de';
import ru3 from './locales/step3/ru';

// Each build step adds its own top-level sections; they never overlap.
export const resources = {
  en: { translation: { ...en, ...en2, ...en3 } },
  'fa-AF': { translation: { ...faAF, ...faAF2, ...faAF3 } },
  ps: { translation: { ...ps, ...ps2, ...ps3 } },
  fa: { translation: { ...fa, ...fa2, ...fa3 } },
  ar: { translation: { ...ar, ...ar2, ...ar3 } },
  ur: { translation: { ...ur, ...ur2, ...ur3 } },
  uz: { translation: { ...uz, ...uz2, ...uz3 } },
  tr: { translation: { ...tr, ...tr2, ...tr3 } },
  fr: { translation: { ...fr, ...fr2, ...fr3 } },
  es: { translation: { ...es, ...es2, ...es3 } },
  de: { translation: { ...de, ...de2, ...de3 } },
  ru: { translation: { ...ru, ...ru2, ...ru3 } }
} as const;
