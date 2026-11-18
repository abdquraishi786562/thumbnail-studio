import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';
import { PLATFORMS } from '../editor/platforms';
import { useEditorUi } from '../editor/editor';
import { useUi } from '../store/ui';

export function SizeTabs() {
  const { t } = useTranslation();
  const platform = useEditorUi((s) => s.platform);
  const editor = useUi((s) => s.editor);
  const toast = useUi((s) => s.toast);
  const [busy, setBusy] = useState(false);
  const main = editor?.main ?? 'youtube';
  const designed = new Set(editor?.designedSizes ?? []);

  const open = async (id: (typeof PLATFORMS)[number]['id']) => {
    if (!editor || busy || id === platform) return;
    setBusy(true);
    try {
      const result = await editor.resizeTo(id);
      if (result === 'fitted') toast(t('sizes2.autoFitted', { name: t(`sizes.${id}`) }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      className="sizes surface-transition"
      role="tablist"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 240, damping: 26, delay: 0.25 }}
    >
      <AnimatePresence>
        {platform !== main && (
          <motion.button
            className="refit-btn"
            title={t('sizes2.refitHint')}
            initial={{ opacity: 0, scale: 0.6, width: 0 }}
            animate={{ opacity: 1, scale: 1, width: 'auto' }}
            exit={{ opacity: 0, scale: 0.6, width: 0 }}
            whileTap={{ scale: 0.9 }}
            onClick={async () => {
              setBusy(true);
              try {
                await editor?.refitFromMain();
              } finally {
                setBusy(false);
              }
            }}
          >
            <motion.span animate={busy ? { rotate: 360 } : { rotate: 0 }} transition={busy ? { repeat: Infinity, duration: 0.8, ease: 'linear' } : {}} style={{ display: 'grid' }}>
              <RefreshCw size={14} />
            </motion.span>
            <span>{t('sizes2.refit', { name: t(`sizes.${main}`) })}</span>
          </motion.button>
        )}
      </AnimatePresence>
      {PLATFORMS.map((p, i) => {
        const r = p.width / p.height;
        const w = r >= 1 ? 18 : 18 * r;
        const h = r >= 1 ? 18 / r : 18;
        const selected = p.id === platform;
        return (
          <motion.button
            key={p.id}
            role="tab"
            aria-selected={selected}
            className="size-tab"
            onClick={() => void open(p.id)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.04 }}
            whileHover={selected ? undefined : { y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            {selected && <motion.span layoutId="size-pill" className="size-pill" transition={{ type: 'spring', stiffness: 450, damping: 36 }} />}
            <span className="ratio" style={{ width: w, height: h }} />
            <span>{t(`sizes.${p.id}`)}</span>
            <bdi className="px" dir="ltr">
              {p.width}×{p.height}
            </bdi>
            {designed.has(p.id) && !selected && <motion.span className="designed-dot" layout initial={{ scale: 0 }} animate={{ scale: 1 }} />}
          </motion.button>
        );
      })}
    </motion.div>
  );
}
