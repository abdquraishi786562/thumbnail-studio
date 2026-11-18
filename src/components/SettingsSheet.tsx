import { useEffect } from 'react';
import { AnimatePresence, motion, type Variants } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Droplet, X } from 'lucide-react';
import { useUi } from '../store/ui';
import { useSettings } from '../store/settings';
import { CUSTOM_SWATCHES, THEME_ORDER, THEMES, customTheme, type ThemeId, type ThemeTokens } from '../theme/themes';
import { LANGUAGES } from '../i18n/languages';
import { Toggle } from './Toggle';
import { withTransition } from './reveal';
import { useChangeLanguage } from './TopBar';
import { PictureSettings } from './PictureSettings';

const cards: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.12 } } };
const card: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 320, damping: 28 } }
};
const tiles: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.035 } } };
const tile: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.94 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 420, damping: 26 } }
};

/** Mini picture of the app in a theme, like the theme picker in the reference design. */
function ThemeThumb({ tk }: { tk: ThemeTokens }) {
  const line = tk.dark ? 'rgba(255,255,255,.18)' : 'rgba(0,0,0,.14)';
  return (
    <div className="theme-thumb" style={{ background: tk.bg }}>
      <div className="thumb-rail" style={{ background: tk.rail }}>
        <div className="thumb-logo" style={{ background: tk.accent }} />
        <div className="thumb-line" style={{ background: tk.accent }} />
        <div className="thumb-line" style={{ background: line }} />
        <div className="thumb-line" style={{ background: line }} />
        <div className="thumb-line" style={{ background: line }} />
      </div>
      <div className="thumb-main">
        <div className="thumb-tiles">
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ background: tk.surface, border: `1px solid ${tk.border}` }} />
          ))}
        </div>
        <div className="thumb-panel" style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
          <div className="thumb-bar" style={{ height: 4, width: '55%', background: tk.dark ? 'rgba(255,255,255,.6)' : 'rgba(0,0,0,.55)' }} />
          <div className="thumb-bar" style={{ height: 3, width: '80%', background: line }} />
        </div>
        <div className="thumb-bar" style={{ background: `linear-gradient(90deg, ${tk.accent}, ${tk.accent2})` }} />
      </div>
    </div>
  );
}

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35, ease: 'easeOut' }} />
    </svg>
  );
}

export function SettingsSheet() {
  const { t } = useTranslation();
  const open = useUi((s) => s.settingsOpen);
  const setOpen = useUi((s) => s.setSettingsOpen);
  const { theme, customAccent, customDark, reduceMotion, language, setTheme, setCustomAccent, setCustomDark, setReduceMotion } = useSettings();
  const changeLanguage = useChangeLanguage();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  const pickTheme = (id: ThemeId, e: React.MouseEvent) => withTransition(() => setTheme(id), reduceMotion, { x: e.clientX, y: e.clientY });
  const pickAccent = (c: string, e?: React.MouseEvent) =>
    withTransition(() => setCustomAccent(c), reduceMotion, e ? { x: e.clientX, y: e.clientY } : undefined);
  const rtl = document.documentElement.dir === 'rtl';

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
          <motion.section
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-label={t('settings.title')}
            initial={{ x: rtl ? -80 : 80, opacity: 0, scale: 0.98 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: rtl ? -60 : 60, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
          >
            <div className="sheet-head">
              <h2>{t('settings.title')}</h2>
              <motion.button className="icon-btn" onClick={() => setOpen(false)} aria-label={t('settings.close')} whileHover={{ rotate: 90 }} whileTap={{ scale: 0.9 }}>
                <X size={18} />
              </motion.button>
            </div>
            <motion.div className="sheet-body" variants={cards} initial="hidden" animate="show">
              <motion.div className="card" variants={card}>
                <p className="eyebrow">{t('settings.themes')}</p>
                <motion.div className="theme-grid" variants={tiles}>
                  {THEME_ORDER.map((id) => {
                    const selected = theme === id;
                    return (
                      <motion.button
                        key={id}
                        className="theme-card"
                        variants={tile}
                        aria-pressed={selected}
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={(e) => pickTheme(id, e)}
                      >
                        <div style={{ position: 'relative' }}>
                          <ThemeThumb tk={THEMES[id]} />
                          {selected && <motion.div layoutId="theme-ring" className="theme-ring" transition={{ type: 'spring', stiffness: 420, damping: 32 }} />}
                        </div>
                        <span className="theme-label">
                          {t(`theme.${id}`)}
                          {selected && <Check />}
                        </span>
                      </motion.button>
                    );
                  })}
                  <motion.button
                    className="theme-card"
                    variants={tile}
                    aria-pressed={theme === 'custom'}
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={(e) => pickTheme('custom', e)}
                  >
                    <div style={{ position: 'relative' }}>
                      <ThemeThumb tk={customTheme(customAccent, customDark)} />
                      {theme === 'custom' && <motion.div layoutId="theme-ring" className="theme-ring" />}
                    </div>
                    <span className="theme-label">
                      {t('theme.custom')}
                      {theme === 'custom' && <Check />}
                    </span>
                  </motion.button>
                </motion.div>
              </motion.div>

              <motion.div className="card" variants={card}>
                <p className="eyebrow">{t('settings.customColour')}</p>
                <h3>{t('settings.yourOwnColour')}</h3>
                <p className="sub">{t('settings.customHint')}</p>
                <motion.div className="custom-swatches" variants={tiles}>
                  {CUSTOM_SWATCHES.map((c) => {
                    const on = theme === 'custom' && customAccent.toLowerCase() === c;
                    return (
                      <motion.button
                        key={c}
                        variants={tile}
                        className="swatch"
                        style={{ background: c, boxShadow: on ? `0 0 0 3px var(--surface), 0 0 0 5px ${c}` : undefined }}
                        aria-label={c}
                        aria-pressed={on}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.85 }}
                        onClick={(e) => pickAccent(c, e)}
                      />
                    );
                  })}
                  <motion.label className="any-colour" variants={tile} whileHover={{ y: -2 }}>
                    <Droplet size={16} />
                    {t('settings.anyColour')}
                    <input type="color" value={customAccent} onChange={(e) => pickAccent(e.target.value)} aria-label={t('settings.anyColour')} />
                  </motion.label>
                </motion.div>
                <div className="setting-row">
                  <span>{t('settings.darkCustom')}</span>
                  <Toggle
                    checked={customDark}
                    label={t('settings.darkCustom')}
                    onChange={(v) =>
                      withTransition(() => {
                        setCustomDark(v);
                        setTheme('custom');
                      }, reduceMotion)
                    }
                  />
                </div>
              </motion.div>

              <motion.div className="card" variants={card}>
                <p className="eyebrow">{t('settings.motion')}</p>
                <div className="setting-row">
                  <div>
                    <div className="t">{t('settings.reduceMotion')}</div>
                    <div className="d">{t('settings.reduceMotionHint')}</div>
                  </div>
                  <Toggle checked={reduceMotion} onChange={setReduceMotion} label={t('settings.reduceMotion')} />
                </div>
              </motion.div>

              <PictureSettings variants={card} />

              <motion.div className="card" variants={card}>
                <p className="eyebrow">{t('settings.languageSection')}</p>
                <p className="sub">{t('settings.languageHint')}</p>
                <motion.div className="lang-grid" variants={tiles}>
                  {LANGUAGES.map((l) => (
                    <motion.button
                      key={l.code}
                      variants={tile}
                      className="lang-btn"
                      aria-pressed={language === l.code}
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => changeLanguage(l.code)}
                    >
                      <span className="n" lang={l.code} dir={l.dir}>
                        {l.native}
                      </span>
                      <span className="e">{l.english}</span>
                      {l.dir === 'rtl' && <span className="dir">RTL</span>}
                    </motion.button>
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}
