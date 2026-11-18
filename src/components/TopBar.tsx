import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Download, Globe, Redo2, Settings2, Undo2, Clapperboard, Check } from 'lucide-react';
import { useUi } from '../store/ui';
import { useEditorUi } from '../editor/editor';
import { platformById } from '../editor/platforms';
import { useSettings } from '../store/settings';
import { LANGUAGES, type LanguageCode } from '../i18n/languages';
import { withTransition } from './reveal';

export function useChangeLanguage() {
  const setLanguage = useSettings((s) => s.setLanguage);
  const reduce = useSettings((s) => s.reduceMotion);
  return (code: LanguageCode) => withTransition(() => setLanguage(code), reduce);
}

function LanguageMenu() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const language = useSettings((s) => s.language);
  const change = useChangeLanguage();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <motion.button
        className="btn"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={t('top.language')}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.span animate={open ? { rotate: 180 } : { rotate: 0 }} style={{ display: 'grid' }}>
          <Globe size={16} />
        </motion.span>
        <span className="hide-sm">{LANGUAGES.find((l) => l.code === language)?.native}</span>
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="menu"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 500, damping: 34 }}
          >
            {LANGUAGES.map((l, i) => (
              <motion.button
                key={l.code}
                aria-pressed={l.code === language}
                lang={l.code}
                dir={l.dir}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => {
                  setOpen(false);
                  change(l.code);
                }}
              >
                <span>{l.native}</span>
                <span className="e">{l.code === language ? <Check size={14} /> : l.english}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function TopBar({ onExport }: { onExport: () => void }) {
  const { t } = useTranslation();
  const editor = useUi((s) => s.editor);
  const projectName = useUi((s) => s.projectName);
  const setProjectName = useUi((s) => s.setProjectName);
  const openSettings = useUi((s) => s.setSettingsOpen);
  const toast = useUi((s) => s.toast);
  const { canUndo, canRedo, platform } = useEditorUi();
  const p = platformById(platform);

  return (
    <motion.header
      className="topbar surface-transition"
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
    >
      <div className="brand">
        <motion.div
          className="brand-mark"
          whileHover={{ rotate: -12, scale: 1.08 }}
          animate={{ y: [0, -2, 0] }}
          transition={{ y: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
        >
          <Clapperboard size={17} />
        </motion.div>
        <span className="brand-name">{t('app.name')}</span>
      </div>
      <input
        className="project-name"
        value={projectName}
        placeholder={t('app.untitled')}
        onChange={(e) => setProjectName(e.target.value)}
        aria-label={t('app.untitled')}
      />
      <div className="spacer" />
      <motion.button
        className="icon-btn"
        disabled={!canUndo}
        aria-label={t('top.undo')}
        title={t('top.undo')}
        whileTap={{ scale: 0.9, rotate: -20 }}
        onClick={async () => {
          if (await editor?.undo()) toast(t('history.undone'));
        }}
      >
        <Undo2 size={17} className="flip-rtl" />
      </motion.button>
      <motion.button
        className="icon-btn"
        disabled={!canRedo}
        aria-label={t('top.redo')}
        title={t('top.redo')}
        whileTap={{ scale: 0.9, rotate: 20 }}
        onClick={async () => {
          if (await editor?.redo()) toast(t('history.redone'));
        }}
      >
        <Redo2 size={17} className="flip-rtl" />
      </motion.button>
      <LanguageMenu />
      <motion.button
        className="icon-btn"
        aria-label={t('top.settings')}
        title={t('top.settings')}
        onClick={() => openSettings(true)}
        whileHover={{ rotate: 60 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      >
        <Settings2 size={17} />
      </motion.button>
      <motion.button className="btn btn-primary" onClick={onExport} whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.96 }}>
        <Download size={16} />
        <span>{t('top.export')}</span>
        <span className="hide-sm" style={{ opacity: 0.75, fontWeight: 500 }}>
          <bdi dir="ltr">
            {p.width}×{p.height}
          </bdi>
        </span>
      </motion.button>
    </motion.header>
  );
}
