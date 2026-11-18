import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { LayoutTemplate, Type, Image as ImageIcon, Shapes, Sparkles, Palette, Layers, Clapperboard } from 'lucide-react';
import { useUi, type ToolTab } from '../store/ui';

const TABS: { id: ToolTab; icon: typeof Type }[] = [
  { id: 'templates', icon: LayoutTemplate },
  { id: 'text', icon: Type },
  { id: 'images', icon: ImageIcon },
  { id: 'shapes', icon: Shapes },
  { id: 'layers', icon: Layers },
  { id: 'animate', icon: Clapperboard },
  { id: 'ai', icon: Sparkles },
  { id: 'brand', icon: Palette }
];

export function ToolRail() {
  const { t } = useTranslation();
  const tab = useUi((s) => s.tab);
  const setTab = useUi((s) => s.setTab);

  return (
    <motion.nav
      className="rail surface-transition"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 240, damping: 26, delay: 0.05 }}
    >
      {TABS.map(({ id, icon: Icon }, i) => (
        <motion.button
          key={id}
          className="rail-btn"
          aria-pressed={tab === id}
          onClick={() => setTab(id)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 + i * 0.05 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.93 }}
        >
          {tab === id && <motion.span layoutId="rail-pill" className="rail-pill" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
          {id === 'animate' ? (
            <motion.span animate={{ rotate: [0, -14, 0] }} transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2.5 }} style={{ display: 'grid', transformOrigin: '20% 80%' }}>
              <Icon size={21} />
            </motion.span>
          ) : id === 'ai' ? (
            <motion.span
              className="rail-ai-glow"
              animate={{ rotate: [0, 12, -8, 0], scale: [1, 1.12, 1] }}
              transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 1.4 }}
              style={{ display: 'grid' }}
            >
              <Icon size={21} />
            </motion.span>
          ) : (
            <Icon size={21} />
          )}
          <span>{id === 'layers' || id === 'animate' ? t(`rail2.${id}`) : t(`rail.${id}`)}</span>
        </motion.button>
      ))}
    </motion.nav>
  );
}
