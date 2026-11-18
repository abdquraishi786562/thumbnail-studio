import { useLayoutEffect } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';
import { TopBar } from './components/TopBar';
import { ToolRail } from './components/ToolRail';
import { SidePanel } from './components/SidePanel';
import { Stage } from './components/Stage';
import { SizeTabs } from './components/SizeTabs';
import { Inspector } from './components/Inspector';
import { SettingsSheet } from './components/SettingsSheet';
import { useSettings } from './store/settings';
import { useUi } from './store/ui';
import { applyTheme, resolveTheme } from './theme/themes';
import { applyLanguage } from './i18n';
import { useEditorUi } from './editor/editor';
import { platformById } from './editor/platforms';

function Toasts() {
  const toasts = useUi((s) => s.toasts);
  return (
    <div className="toasts" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            className="toast"
            layout
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <CheckCircle2 size={16} />
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function safeName(name: string): string {
  return name.trim().replace(/[\\/:*?"<>|]+/g, '-').slice(0, 80) || 'thumbnail';
}

export default function App() {
  const { t } = useTranslation();
  const { theme, customAccent, customDark, reduceMotion, language } = useSettings();
  const editor = useUi((s) => s.editor);
  const toast = useUi((s) => s.toast);

  useLayoutEffect(() => {
    applyTheme(resolveTheme(theme, customAccent, customDark));
  }, [theme, customAccent, customDark]);

  useLayoutEffect(() => {
    applyLanguage(language);
  }, [language]);

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduceMotion);
  }, [reduceMotion]);

  const exportPng = async () => {
    if (!editor) return;
    try {
      const p = platformById(useEditorUi.getState().platform);
      const blob = await editor.toBlob('png');
      const name = `${safeName(useUi.getState().projectName || t('app.untitled'))}-${p.id}-${p.width}x${p.height}.png`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      toast(t('export.done', { name }));
    } catch {
      toast(t('export.failed'));
    }
  };

  return (
    <MotionConfig reducedMotion={reduceMotion ? 'always' : 'never'}>
      <div className="app">
        <TopBar onExport={exportPng} />
        <ToolRail />
        <SidePanel />
        <Stage />
        <SizeTabs />
        <Inspector />
      </div>
      <SettingsSheet />
      <Toasts />
    </MotionConfig>
  );
}
