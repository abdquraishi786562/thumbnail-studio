import { useLayoutEffect } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { TopBar } from './components/TopBar';
import { ToolRail } from './components/ToolRail';
import { SidePanel } from './components/SidePanel';
import { Stage } from './components/Stage';
import { SizeTabs } from './components/SizeTabs';
import { Inspector } from './components/Inspector';
import { SettingsSheet } from './components/SettingsSheet';
import { ExportDialog } from './components/ExportDialog';
import { AiThumbnail } from './components/AiThumbnail';
import { useSettings } from './store/settings';
import { useUi } from './store/ui';
import { applyTheme, resolveTheme } from './theme/themes';
import { applyLanguage } from './i18n';

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

export default function App() {
  const { theme, customAccent, customDark, reduceMotion, language } = useSettings();
  const setExportOpen = useUi((s) => s.setExportOpen);

  useLayoutEffect(() => {
    applyTheme(resolveTheme(theme, customAccent, customDark));
  }, [theme, customAccent, customDark]);

  useLayoutEffect(() => {
    applyLanguage(language);
  }, [language]);

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduceMotion);
  }, [reduceMotion]);

  return (
    <MotionConfig reducedMotion={reduceMotion ? 'always' : 'never'}>
      <div className="app">
        <TopBar onExport={() => setExportOpen(true)} />
        <ToolRail />
        <SidePanel />
        <Stage />
        <SizeTabs />
        <Inspector />
      </div>
      <SettingsSheet />
      <ExportDialog />
      <AiThumbnail />
      <Toasts />
    </MotionConfig>
  );
}
