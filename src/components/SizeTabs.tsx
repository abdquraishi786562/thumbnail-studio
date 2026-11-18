import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { PLATFORMS } from '../editor/platforms';
import { useEditorUi } from '../editor/editor';
import { useUi } from '../store/ui';

export function SizeTabs() {
  const { t } = useTranslation();
  const platform = useEditorUi((s) => s.platform);
  const editor = useUi((s) => s.editor);

  return (
    <motion.div
      className="sizes surface-transition"
      role="tablist"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 240, damping: 26, delay: 0.25 }}
    >
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
            onClick={() => !selected && editor?.resizeTo(p.id)}
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
          </motion.button>
        );
      })}
    </motion.div>
  );
}
