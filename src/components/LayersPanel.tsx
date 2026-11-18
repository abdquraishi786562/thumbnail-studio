import { useEffect, useState } from 'react';
import { AnimatePresence, Reorder, motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, GripVertical, Image as ImageIcon, Lock, Shapes, Type, Unlock, Square } from 'lucide-react';
import { useEditorUi, type LayerInfo } from '../editor/editor';
import { useUi } from '../store/ui';

function labelOf(layer: LayerInfo, t: (k: string) => string): string {
  if (layer.kind === 'text') return layer.text?.trim() || t('rail.text');
  if (layer.kind === 'image') return t('layers.image');
  const shape = layer.shape ?? 'rect';
  return ['rect', 'circle', 'badge'].includes(shape) ? t(`shapes.${shape}`) : t(`shapes2.${shape}`);
}

export function LayersPanel() {
  const { t } = useTranslation();
  const editor = useUi((s) => s.editor);
  const layers = useEditorUi((s) => s.layers);
  const selected = useEditorUi((s) => s.selection?.id);
  const [order, setOrder] = useState(layers.map((l) => l.id));

  useEffect(() => setOrder(layers.map((l) => l.id)), [layers]);

  const byId = new Map(layers.map((l) => [l.id, l]));

  return (
    <div>
      <h2>{t('layers.title')}</h2>
      <p className="hint">{t('layers.hint')}</p>
      {layers.length === 0 && (
        <motion.div className="soon" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Shapes size={34} color="var(--accent)" />
          {t('layers.empty')}
        </motion.div>
      )}
      <Reorder.Group
        axis="y"
        values={order}
        onReorder={(ids: string[]) => {
          setOrder(ids);
          editor?.reorder(ids, false);
        }}
        className="layer-list"
      >
        <AnimatePresence initial={false}>
          {order.map((id) => {
            const layer = byId.get(id);
            if (!layer) return null;
            const Icon = layer.kind === 'text' ? Type : layer.kind === 'image' ? ImageIcon : Square;
            return (
              <Reorder.Item
                key={id}
                value={id}
                className="layer-row"
                data-selected={selected === id}
                data-hidden={!layer.visible}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12, height: 0 }}
                whileDrag={{ scale: 1.03, boxShadow: '0 16px 30px -12px rgba(0,0,0,.45)', zIndex: 5 }}
                onDragEnd={() => editor?.reorder(order, true)}
                onClick={() => editor?.selectById(id)}
              >
                <GripVertical size={15} className="grip" />
                <span className="layer-icon">
                  <Icon size={15} />
                </span>
                <span className="layer-name" dir="auto">
                  {labelOf(layer, t)}
                </span>
                <motion.button
                  className="mini-btn"
                  whileTap={{ scale: 0.8 }}
                  title={layer.visible ? t('tools.hide') : t('tools.show')}
                  aria-label={layer.visible ? t('tools.hide') : t('tools.show')}
                  onClick={(e) => {
                    e.stopPropagation();
                    editor?.setVisible(id, !layer.visible);
                  }}
                >
                  {layer.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                </motion.button>
                <motion.button
                  className="mini-btn"
                  whileTap={{ scale: 0.8 }}
                  title={layer.locked ? t('tools.unlock') : t('tools.lock')}
                  aria-label={layer.locked ? t('tools.unlock') : t('tools.lock')}
                  data-on={layer.locked}
                  onClick={(e) => {
                    e.stopPropagation();
                    editor?.setLocked(id, !layer.locked);
                  }}
                >
                  {layer.locked ? <Lock size={15} /> : <Unlock size={15} />}
                </motion.button>
              </Reorder.Item>
            );
          })}
        </AnimatePresence>
      </Reorder.Group>
      <div className="layer-row static">
        <span className="layer-icon" style={{ background: 'var(--gradient)', color: '#fff' }}>
          <Square size={13} />
        </span>
        <span className="layer-name">{t('layers.background')}</span>
        <Lock size={14} style={{ opacity: 0.5 }} />
      </div>
    </div>
  );
}
