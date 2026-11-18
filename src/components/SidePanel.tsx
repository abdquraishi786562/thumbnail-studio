import { useRef } from 'react';
import { AnimatePresence, motion, type Variants } from 'motion/react';
import { useTranslation } from 'react-i18next';
import {
  Upload,
  Square,
  Circle,
  RectangleHorizontal,
  Scissors,
  ScanFace,
  Pipette,
  Layers,
  ZoomIn,
  Smartphone,
  Hourglass,
  LayoutTemplate,
  Palette
} from 'lucide-react';
import { useUi, type ToolTab } from '../store/ui';
import { useSettings } from '../store/settings';
import { resolveTheme } from '../theme/themes';

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } }
};

const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 380, damping: 28 } }
};

function useAccent() {
  const { theme, customAccent, customDark } = useSettings();
  return resolveTheme(theme, customAccent, customDark).accent;
}

function TextPanel() {
  const { t } = useTranslation();
  const editor = useUi((s) => s.editor);
  return (
    <motion.div variants={list} initial="hidden" animate="show">
      <motion.h2 variants={item}>{t('rail.text')}</motion.h2>
      <motion.p variants={item} className="hint">
        {t('text.rtlHint')}
      </motion.p>
      {(
        [
          ['heading', 'h', t('text.addHeading'), t('text.sampleHeading')],
          ['sub', 's', t('text.addSubheading'), t('text.sampleSub')],
          ['body', 'b', t('text.addBody'), t('text.sampleBody')]
        ] as const
      ).map(([kind, cls, label, sample]) => (
        <motion.button
          key={kind}
          variants={item}
          className="text-preset"
          whileHover={{ y: -3, boxShadow: '0 12px 24px -16px rgba(0,0,0,.4)' }}
          whileTap={{ scale: 0.97 }}
          onClick={() => void editor?.addText(kind, sample)}
        >
          <div className={cls}>{label}</div>
        </motion.button>
      ))}
    </motion.div>
  );
}

function ImagesPanel() {
  const { t } = useTranslation();
  const editor = useUi((s) => s.editor);
  const input = useRef<HTMLInputElement>(null);
  return (
    <motion.div variants={list} initial="hidden" animate="show">
      <motion.h2 variants={item}>{t('rail.images')}</motion.h2>
      <motion.p variants={item} className="hint">
        {t('images.dropHint')}
      </motion.p>
      <motion.button variants={item} className="upload-zone" onClick={() => input.current?.click()} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <motion.span animate={{ y: [0, -5, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }} style={{ display: 'grid' }}>
          <Upload size={28} />
        </motion.span>
        <strong>{t('images.upload')}</strong>
      </motion.button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void editor?.addImage(file);
          e.target.value = '';
        }}
      />
    </motion.div>
  );
}

function ShapesPanel() {
  const { t } = useTranslation();
  const editor = useUi((s) => s.editor);
  const accent = useAccent();
  const shapes = [
    ['rect', Square, t('shapes.rect')],
    ['circle', Circle, t('shapes.circle')],
    ['badge', RectangleHorizontal, t('shapes.badge')]
  ] as const;
  return (
    <motion.div variants={list} initial="hidden" animate="show">
      <motion.h2 variants={item} style={{ marginBottom: 14 }}>
        {t('rail.shapes')}
      </motion.h2>
      <div className="shape-grid">
        {shapes.map(([kind, Icon, label]) => (
          <motion.button
            key={kind}
            variants={item}
            className="shape-btn"
            whileHover={{ y: -3, rotate: kind === 'circle' ? 0 : -2 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => editor?.addShape(kind, accent)}
          >
            <Icon size={26} />
            <span>{label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function AiPanel() {
  const { t } = useTranslation();
  const tools = [
    ['bgRemove', Scissors],
    ['faces', ScanFace],
    ['palette', Pipette],
    ['depth', Layers],
    ['upscale', ZoomIn],
    ['readability', Smartphone]
  ] as const;
  return (
    <motion.div variants={list} initial="hidden" animate="show">
      <motion.h2 variants={item}>{t('rail.ai')}</motion.h2>
      <motion.p variants={item} className="hint">
        {t('ai.intro')}
      </motion.p>
      {tools.map(([key, Icon], i) => (
        <motion.div key={key} variants={item} className="ai-card" whileHover={{ y: -2 }}>
          <motion.div
            className="ai-icon"
            animate={{ rotate: [0, -6, 6, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 + i * 0.4 }}
          >
            <Icon size={19} />
          </motion.div>
          <div>
            <h3>{t(`ai.${key}`)}</h3>
            <p>{t(`ai.${key}Hint`)}</p>
            <span className="chip">{t('ai.free')}</span>{' '}
            <span className="chip muted">{t('panel.comingSoon')}</span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function ComingSoon({ tab }: { tab: ToolTab }) {
  const { t } = useTranslation();
  const Icon = tab === 'templates' ? LayoutTemplate : tab === 'brand' ? Palette : Hourglass;
  return (
    <motion.div variants={list} initial="hidden" animate="show">
      <motion.h2 variants={item}>{t(`rail.${tab}`)}</motion.h2>
      <motion.div variants={item} className="soon">
        <motion.span animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.08, 1] }} transition={{ duration: 2.4, repeat: Infinity }} style={{ display: 'grid', color: 'var(--accent)' }}>
          <Icon size={40} />
        </motion.span>
        <strong>{t('panel.comingSoon')}</strong>
        <span style={{ fontSize: 12.5 }}>{t('panel.comingSoonHint')}</span>
      </motion.div>
    </motion.div>
  );
}

export function SidePanel() {
  const tab = useUi((s) => s.tab);
  const rtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl';
  const dx = rtl ? -16 : 16;
  return (
    <motion.aside
      className="panel surface-transition"
      initial={{ opacity: 0, x: -dx }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 240, damping: 28, delay: 0.1 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={tab} initial={{ opacity: 0, x: dx }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -dx }} transition={{ duration: 0.18 }}>
          {tab === 'text' && <TextPanel />}
          {tab === 'images' && <ImagesPanel />}
          {tab === 'shapes' && <ShapesPanel />}
          {tab === 'ai' && <AiPanel />}
          {(tab === 'templates' || tab === 'brand') && <ComingSoon tab={tab} />}
        </motion.div>
      </AnimatePresence>
    </motion.aside>
  );
}
