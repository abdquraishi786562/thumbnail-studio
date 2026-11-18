import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignStartVertical,
  ArrowDownToLine,
  ArrowUpToLine,
  Copy,
  FlipHorizontal2,
  Lock,
  MousePointerClick,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { useEditorUi, type SelectionInfo, type SelectionPatch, type Style } from '../editor/editor';
import { FONTS } from '../editor/fonts';
import { useUi } from '../store/ui';
import { Toggle } from './Toggle';
import { ColourRow, IconButton, Section, Segmented, Slider } from './controls';

const TEXT_COLOURS = ['#ffffff', '#111111', '#ffe45c', '#ff3b30', '#22c55e', '#3b82f6', '#a855f7', '#f97316'];
const EFFECT_COLOURS = ['#000000', '#ffffff', '#ffe45c', '#22d3ee', '#ff2d87', '#7c5cff'];
const HIGHLIGHTS = ['#000000', '#ffffff', '#ffe45c', '#ef4444', '#7c5cff'];

export const GRADIENTS: [string, string][] = [
  ['#ffe45c', '#ff9f1c'],
  ['#ff512f', '#f09819'],
  ['#ffffff', '#9aa5b1'],
  ['#00f5a0', '#00d9f5'],
  ['#ff6cab', '#7366ff'],
  ['#a1c4fd', '#c2e9fb']
];

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

function useUpdate() {
  const editor = useUi((s) => s.editor);
  return (patch: SelectionPatch, commit = true) => void editor?.updateSelection(patch, commit);
}

function ObjectTools({ sel }: { sel: SelectionInfo }) {
  const { t } = useTranslation();
  const editor = useUi((s) => s.editor);
  const update = useUpdate();
  if (!editor) return null;
  return (
    <>
      <div className="tool-row">
        <IconButton label={t('tools.duplicate')} onClick={() => void editor.duplicate()}>
          <Copy size={16} />
        </IconButton>
        <IconButton label={t('tools.forward')} onClick={() => editor.order('forward')}>
          <ArrowUpToLine size={16} />
        </IconButton>
        <IconButton label={t('tools.backward')} onClick={() => editor.order('backward')}>
          <ArrowDownToLine size={16} />
        </IconButton>
        <IconButton label={t('tools.flip')} onClick={() => editor.flip()}>
          <FlipHorizontal2 size={16} />
        </IconButton>
        {!sel.multiple && (
          <IconButton label={t('tools.lock')} onClick={() => editor.setLocked(sel.id, true)}>
            <Lock size={16} />
          </IconButton>
        )}
        <IconButton label={t('inspector.delete')} onClick={() => editor.deleteSelection()}>
          <Trash2 size={16} color="#ef4444" />
        </IconButton>
      </div>
      <div className="tool-row">
        <IconButton label={t('tools.alignLeft')} onClick={() => editor.align('left')}>
          <AlignStartVertical size={16} />
        </IconButton>
        <IconButton label={t('tools.alignCenter')} onClick={() => editor.align('hcenter')}>
          <AlignCenterVertical size={16} />
        </IconButton>
        <IconButton label={t('tools.alignRight')} onClick={() => editor.align('right')}>
          <AlignEndVertical size={16} />
        </IconButton>
        <IconButton label={t('tools.alignTop')} onClick={() => editor.align('top')}>
          <AlignStartHorizontal size={16} />
        </IconButton>
        <IconButton label={t('tools.alignMiddle')} onClick={() => editor.align('vcenter')}>
          <AlignCenterHorizontal size={16} />
        </IconButton>
        <IconButton label={t('tools.alignBottom')} onClick={() => editor.align('bottom')}>
          <AlignEndHorizontal size={16} />
        </IconButton>
      </div>
      <Slider
        label={t('tools.opacity')}
        value={sel.opacity}
        min={0.05}
        max={1}
        format={(v) => `${Math.round(v * 100)}%`}
        onInput={(opacity) => update({ opacity }, false)}
        onCommit={(opacity) => update({ opacity })}
      />
    </>
  );
}

function TextSection({ sel }: { sel: SelectionInfo }) {
  const { t } = useTranslation();
  const update = useUpdate();
  const font = FONTS.find((f) => f.family === sel.fontFamily);
  return (
    <Section title={t('rail.text')}>
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
      <Slider label={t('inspector.size')} value={sel.fontSize ?? 64} min={10} max={400} step={1} format={(v) => String(Math.round(v))} onInput={(fontSize) => update({ fontSize }, false)} onCommit={(fontSize) => update({ fontSize })} />
      <Slider label={t('textfx.spacing')} value={sel.charSpacing ?? 0} min={-100} max={500} step={5} format={(v) => String(Math.round(v))} onInput={(charSpacing) => update({ charSpacing }, false)} onCommit={(charSpacing) => update({ charSpacing })} />
      <Slider label={t('textfx.lineHeight')} value={sel.lineHeight ?? 1} min={0.7} max={2} step={0.05} onInput={(lineHeight) => update({ lineHeight }, false)} onCommit={(lineHeight) => update({ lineHeight })} />
      <div className="field">
        <span className="label">{t('textfx.align')}</span>
        <Segmented
          group="align"
          value={sel.align}
          onChange={(align) => update({ align })}
          options={[
            { value: 'start', label: t('textfx.start') },
            { value: 'center', label: t('textfx.center') },
            { value: 'end', label: t('textfx.end') }
          ]}
        />
      </div>
      <div className="field">
        <span className="label">{t('inspector.direction')}</span>
        <Segmented
          group="dir"
          value={sel.dirMode}
          onChange={(dirMode) => update({ dirMode })}
          options={[
            { value: 'auto', label: t('inspector.auto') },
            { value: 'ltr', label: 'LTR →', title: t('inspector.ltr') },
            { value: 'rtl', label: '← RTL', title: t('inspector.rtl') }
          ]}
        />
      </div>
    </Section>
  );
}

function FillSection({ style }: { style: Style }) {
  const { t } = useTranslation();
  const update = useUpdate();
  const set = (s: Partial<Style>) => update({ style: s });
  return (
    <Section title={t('inspector.fill')}>
      <Segmented
        group="fill"
        value={style.fillMode}
        onChange={(fillMode) => set({ fillMode })}
        options={[
          { value: 'solid', label: t('textfx.solid') },
          { value: 'gradient', label: t('textfx.gradient') }
        ]}
      />
      <div style={{ height: 10 }} />
      <ColourRow label={t('inspector.fill')} value={style.fill} colours={TEXT_COLOURS} onPick={(fill) => set({ fill })} />
      <AnimatePresence initial={false}>
        {style.fillMode === 'gradient' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
            <div style={{ height: 10 }} />
            <ColourRow label={t('textfx.gradient')} value={style.fill2} colours={TEXT_COLOURS} onPick={(fill2) => set({ fill2 })} />
            <div className="label" style={{ margin: '12px 0 6px' }}>
              {t('textfx.presets')}
            </div>
            <div className="swatches">
              {GRADIENTS.map(([a, b]) => (
                <motion.button
                  key={a + b}
                  className="swatch grad"
                  style={{ background: `linear-gradient(180deg, ${a}, ${b})` }}
                  aria-label={`${a} → ${b}`}
                  aria-pressed={style.fill === a && style.fill2 === b}
                  whileHover={{ scale: 1.15, rotate: -6 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => set({ fill: a, fill2: b })}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}

function OutlineEffectSection({ style, kind }: { style: Style; kind: SelectionInfo['kind'] }) {
  const { t } = useTranslation();
  const update = useUpdate();
  const set = (s: Partial<Style>, commit = true) => update({ style: s }, commit);
  return (
    <>
      <Section title={kind === 'image' ? t('image.border') : t('inspector.stroke')} right={<Toggle checked={style.stroke} onChange={(stroke) => set({ stroke })} label={t('inspector.stroke')} />}>
        <AnimatePresence initial={false}>
          {style.stroke && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
              <ColourRow label={t('inspector.stroke')} value={style.strokeColor} colours={EFFECT_COLOURS} onPick={(strokeColor) => set({ strokeColor })} />
              <Slider label={t('textfx.thickness')} value={style.strokeWidth} min={0.02} max={1} format={(v) => `${Math.round(v * 100)}`} onInput={(strokeWidth) => set({ strokeWidth }, false)} onCommit={(strokeWidth) => set({ strokeWidth })} />
            </motion.div>
          )}
        </AnimatePresence>
      </Section>
      <Section title={t('textfx.effect')}>
        <Segmented
          group="effect"
          value={style.effect}
          onChange={(effect) => set({ effect, effectColor: effect === 'glow' && style.effectColor === '#000000' ? '#22d3ee' : style.effectColor })}
          options={[
            { value: 'none', label: t('textfx.none') },
            { value: 'shadow', label: t('textfx.shadow') },
            { value: 'glow', label: t('textfx.glow') },
            { value: 'hard', label: t('textfx.hard') }
          ]}
        />
        {style.effect !== 'none' && (
          <div style={{ marginTop: 10 }}>
            <ColourRow label={t('textfx.effectColour')} value={style.effectColor} colours={EFFECT_COLOURS} onPick={(effectColor) => set({ effectColor })} />
          </div>
        )}
      </Section>
      {kind === 'text' && (
        <Section
          title={t('textfx.highlight')}
          defaultOpen={false}
          right={<Toggle checked={!!style.highlight} onChange={(on) => set({ highlight: on ? '#000000' : null })} label={t('textfx.highlight')} />}
        >
          {style.highlight && <ColourRow label={t('textfx.highlight')} value={style.highlight} colours={HIGHLIGHTS} onPick={(highlight) => set({ highlight })} />}
        </Section>
      )}
    </>
  );
}

function ImageSection({ sel }: { sel: SelectionInfo }) {
  const { t } = useTranslation();
  const update = useUpdate();
  const editor = useUi((s) => s.editor);
  const img = sel.image!;
  const pct = (v: number) => `${Math.round(v * 100)}%`;
  const signed = (v: number) => `${v > 0 ? '+' : ''}${Math.round(v * 100)}`;
  const adjust = (key: 'brightness' | 'contrast' | 'saturation' | 'blur', min: number, max: number) => (
    <Slider
      key={key}
      label={t(`image.${key}`)}
      value={img[key]}
      min={min}
      max={max}
      format={key === 'blur' ? pct : signed}
      onInput={(v) => update({ image: { [key]: v } }, false)}
      onCommit={(v) => update({ image: { [key]: v } })}
    />
  );
  const crop = (side: 'l' | 't' | 'r' | 'b', label: string) => (
    <Slider key={side} label={label} value={img.crop[side]} min={0} max={0.45} format={pct} onInput={(v) => update({ image: { crop: { [side]: v } } }, false)} onCommit={(v) => update({ image: { crop: { [side]: v } } })} />
  );
  return (
    <>
      <Section
        title={t('image.adjust')}
        right={
          <IconButton label={t('image.reset')} onClick={() => editor?.resetImage()}>
            <RotateCcw size={14} />
          </IconButton>
        }
      >
        {adjust('brightness', -0.6, 0.6)}
        {adjust('contrast', -0.6, 0.6)}
        {adjust('saturation', -1, 1)}
        {adjust('blur', 0, 0.6)}
      </Section>
      <Section title={t('image.crop')} defaultOpen={false}>
        {crop('l', t('image.left'))}
        {crop('r', t('image.right'))}
        {crop('t', t('image.top'))}
        {crop('b', t('image.bottom'))}
        <Slider label={t('image.corners')} value={img.radius} min={0} max={0.5} format={pct} onInput={(radius) => update({ image: { radius } }, false)} onCommit={(radius) => update({ image: { radius } })} />
      </Section>
    </>
  );
}

function SelectionEditor({ sel }: { sel: SelectionInfo }) {
  const { t } = useTranslation();
  return (
    <>
      {sel.multiple && <p className="hint">{t('tools.multiple', { n: '2+' })}</p>}
      <ObjectTools sel={sel} />
      {!sel.multiple && sel.kind === 'text' && <TextSection sel={sel} />}
      {!sel.multiple && sel.kind === 'image' && sel.image && <ImageSection sel={sel} />}
      {!sel.multiple && sel.style && sel.kind !== 'image' && <FillSection style={sel.style} />}
      {!sel.multiple && sel.style && <OutlineEffectSection style={sel.style} kind={sel.kind} />}
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
          key={sel ? `${sel.id}-${sel.multiple}` : 'none'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.16 }}
        >
          {sel ? <SelectionEditor sel={sel} /> : <BackgroundEditor />}
        </motion.div>
      </AnimatePresence>
    </motion.aside>
  );
}
