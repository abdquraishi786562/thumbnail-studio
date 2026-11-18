import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { MousePointerClick, Trash2 } from 'lucide-react';
import { useEditorUi, type SelectionInfo } from '../editor/editor';
import { FONTS } from '../editor/fonts';
import { useUi } from '../store/ui';
import { Toggle } from './Toggle';

const TEXT_COLOURS = ['#ffffff', '#111111', '#ffe45c', '#ff3b30', '#22c55e', '#3b82f6', '#a855f7', '#f97316'];

const BACKGROUNDS: [string, string][] = [
  ['#5b4cf0', '#0ea5e9'],
  ['#f43f5e', '#f97316'],
  ['#0f172a', '#334155'],
  ['#10b981', '#84cc16'],
  ['#7c3aed', '#ec4899'],
  ['#0b1d24', '#06b6d4'],
  ['#b5651d', '#d4a017'],
  ['#111111', '#ef4444']
];

function Swatches({ value, colours, onPick }: { value: string; colours: string[]; onPick: (c: string) => void }) {
  return (
    <div className="swatches">
      {colours.map((c) => (
        <motion.button
          key={c}
          className="swatch"
          style={{ background: c }}
          aria-label={c}
          aria-pressed={value.toLowerCase() === c}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.88 }}
          onClick={() => onPick(c)}
        />
      ))}
      <input type="color" className="color-input" value={value.startsWith('#') && value.length === 7 ? value : '#ffffff'} onChange={(e) => onPick(e.target.value)} aria-label="colour" />
    </div>
  );
}

function SelectionEditor({ sel }: { sel: SelectionInfo }) {
  const { t } = useTranslation();
  const editor = useUi((s) => s.editor);
  const update = (patch: Partial<SelectionInfo>) => void editor?.updateSelection(patch);
  const font = FONTS.find((f) => f.family === sel.fontFamily);

  return (
    <>
      {sel.kind === 'text' && (
        <>
          <div className="field">
            <label htmlFor="font">{t('inspector.font')}</label>
            <select id="font" className="select" value={sel.fontFamily} onChange={(e) => update({ fontFamily: e.target.value })}>
              {FONTS.map((f) => (
                <option key={f.family} value={f.family} style={{ fontFamily: f.family }}>
                  {f.family}
                </option>
              ))}
            </select>
            {font && font.scripts.includes('arabic') && !font.pashto && <span className="note">{t('inspector.noPashto')}</span>}
          </div>
          <div className="field">
            <label htmlFor="size">{t('inspector.size')}</label>
            <input
              id="size"
              className="number"
              type="number"
              min={8}
              max={600}
              value={sel.fontSize ?? 0}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (v >= 8 && v <= 600) update({ fontSize: v });
              }}
            />
          </div>
        </>
      )}
      {sel.kind !== 'image' && (
        <div className="field">
          <span className="label">{t('inspector.fill')}</span>
          <Swatches value={sel.fill} colours={TEXT_COLOURS} onPick={(fill) => update({ fill })} />
        </div>
      )}
      <div className="field row">
        <span className="label">{t('inspector.stroke')}</span>
        <Toggle checked={sel.stroke} onChange={(stroke) => update({ stroke })} label={t('inspector.stroke')} />
      </div>
      <div className="field row">
        <span className="label">{t('inspector.shadow')}</span>
        <Toggle checked={sel.shadow} onChange={(shadow) => update({ shadow })} label={t('inspector.shadow')} />
      </div>
      {sel.kind === 'text' && (
        <div className="field">
          <span className="label">{t('inspector.direction')}</span>
          <div className="segmented">
            {(['auto', 'ltr', 'rtl'] as const).map((d) => (
              <button key={d} aria-pressed={sel.dirMode === d} onClick={() => update({ dirMode: d })} title={t(`inspector.${d}`)}>
                {sel.dirMode === d && <motion.span layoutId="dir-pill" className="seg-pill" />}
                <span>{d === 'auto' ? t('inspector.auto') : d === 'ltr' ? 'LTR →' : '← RTL'}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <motion.button className="btn danger" whileTap={{ scale: 0.96 }} whileHover={{ x: [0, -2, 2, 0] }} onClick={() => editor?.deleteSelection()}>
        <Trash2 size={15} />
        {t('inspector.delete')}
      </motion.button>
    </>
  );
}

function BackgroundEditor() {
  const { t } = useTranslation();
  const editor = useUi((s) => s.editor);
  const current = useEditorUi((s) => s.background);
  return (
    <>
      <div className="empty-state" style={{ padding: '10px 0 24px' }}>
        <motion.span animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2 }} style={{ display: 'grid', color: 'var(--accent)' }}>
          <MousePointerClick size={30} />
        </motion.span>
        {t('inspector.empty')}
      </div>
      <div className="field">
        <span className="label">{t('inspector.background')}</span>
        <div className="swatches">
          {BACKGROUNDS.map(([a, b]) => (
            <motion.button
              key={a + b}
              className="swatch"
              style={{ background: `linear-gradient(135deg, ${a}, ${b})`, width: 36, height: 36, borderRadius: 10 }}
              aria-pressed={current === a}
              aria-label={`${a} → ${b}`}
              whileHover={{ scale: 1.12, rotate: 4 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => editor?.setBackground(a, b)}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export function Inspector() {
  const { t } = useTranslation();
  const sel = useEditorUi((s) => s.selection);
  return (
    <motion.aside
      className="inspector surface-transition"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 240, damping: 28, delay: 0.2 }}
    >
      <h2>{t('inspector.title')}</h2>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={sel ? sel.kind : 'none'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {sel ? <SelectionEditor sel={sel} /> : <BackgroundEditor />}
        </motion.div>
      </AnimatePresence>
    </motion.aside>
  );
}
