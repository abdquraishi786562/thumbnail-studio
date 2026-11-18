import { motion, type TargetAndTransition, type Variants } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Pause, Play, Wand2, Eraser } from 'lucide-react';
import { ENTER_TYPES, LOOP_TYPES, type EnterType, type LoopType } from '../editor/animation';
import { useEditorUi } from '../editor/editor';
import { useUi } from '../store/ui';
import { Section, Slider } from './controls';

/** Tiny demos shown on each preset tile: what the animation will do. */
const ENTER_DEMO: Record<EnterType, TargetAndTransition> = {
  none: {},
  fade: { opacity: [0, 1], transition: { duration: 0.7 } },
  fromBottom: { y: [16, 0], opacity: [0, 1], transition: { duration: 0.5 } },
  fromTop: { y: [-16, 0], opacity: [0, 1], transition: { duration: 0.5 } },
  fromLeft: { x: [-18, 0], opacity: [0, 1], transition: { duration: 0.5 } },
  fromRight: { x: [18, 0], opacity: [0, 1], transition: { duration: 0.5 } },
  pop: { scale: [0, 1.2, 1], transition: { duration: 0.5 } },
  zoom: { scale: [2.2, 1], opacity: [0, 1], transition: { duration: 0.5 } },
  bounce: { y: [-18, 0, -8, 0, -3, 0], transition: { duration: 0.8 } },
  spin: { rotate: [-360, 0], scale: [0.3, 1], transition: { duration: 0.6 } },
  typewriter: { clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'], transition: { duration: 0.8, ease: 'linear' } }
};

const loopT = (duration: number) => ({ duration, repeat: Infinity, ease: 'easeInOut' as const });
const LOOP_DEMO: Record<LoopType, TargetAndTransition> = {
  none: {},
  pulse: { scale: [1, 1.15, 1], transition: loopT(1) },
  float: { y: [0, -6, 0], transition: loopT(1.6) },
  shake: { x: [0, -3, 3, -3, 3, 0], transition: loopT(0.5) },
  wiggle: { rotate: [0, -12, 12, 0], transition: loopT(0.9) },
  spin: { rotate: [0, 360], transition: { duration: 1.6, repeat: Infinity, ease: 'linear' } },
  heartbeat: { scale: [1, 1.22, 1, 1.12, 1], transition: loopT(1.1) }
};

function PresetTile({ label, demo, selected, onClick }: { label: string; demo: TargetAndTransition; selected: boolean; onClick: () => void }) {
  const variants: Variants = { rest: { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1, clipPath: 'inset(0 0% 0 0)' }, play: demo };
  return (
    <motion.button className="preset" aria-pressed={selected} onClick={onClick} initial="rest" animate={selected ? 'play' : 'rest'} whileHover="play" whileTap={{ scale: 0.94 }}>
      <span className="preset-stage">
        <motion.span className="preset-dot" variants={variants}>
          Aa
        </motion.span>
      </span>
      <span className="preset-label">{label}</span>
    </motion.button>
  );
}

export function PlayButton({ compact }: { compact?: boolean }) {
  const { t } = useTranslation();
  const editor = useUi((s) => s.editor);
  const playing = useEditorUi((s) => s.playing);
  return (
    <motion.button
      className={compact ? 'play-btn compact' : 'btn btn-primary play-btn'}
      onClick={() => (playing ? editor?.stop() : editor?.play())}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.94 }}
      aria-label={playing ? t('anim.stop') : t('anim.play')}
    >
      <motion.span key={String(playing)} initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} style={{ display: 'grid' }}>
        {playing ? <Pause size={16} /> : <Play size={16} />}
      </motion.span>
      {!compact && <span>{playing ? t('anim.stop') : t('anim.play')}</span>}
    </motion.button>
  );
}

export function AnimatePanel() {
  const { t } = useTranslation();
  const editor = useUi((s) => s.editor);
  const sel = useEditorUi((s) => s.selection);
  const clipLength = useEditorUi((s) => s.clipLength);
  const hasAnimation = useEditorUi((s) => s.hasAnimation);
  const update = (patch: Parameters<NonNullable<typeof editor>['updateSelection']>[0], commit = true) => void editor?.updateSelection(patch, commit);
  const secs = (v: number) => t('anim.seconds', { n: v.toFixed(1) });

  return (
    <div>
      <h2>{t('anim.title')}</h2>
      <p className="hint">{t('anim.intro')}</p>

      <div className="anim-actions">
        <PlayButton />
        <motion.button className="btn" onClick={() => editor?.autoAnimate()} whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} title={t('anim.autoHint')}>
          <motion.span animate={{ rotate: [0, 18, -10, 0] }} transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1 }} style={{ display: 'grid' }}>
            <Wand2 size={16} />
          </motion.span>
          {t('anim.auto')}
        </motion.button>
      </div>

      <Slider
        label={t('anim.length')}
        value={clipLength}
        min={1}
        max={15}
        step={0.5}
        format={secs}
        onInput={(v) => editor?.setClipLength(v)}
        onCommit={(v) => editor?.setClipLength(v)}
      />

      {!sel && (
        <motion.p className="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 14 }}>
          {t('anim.select')}
        </motion.p>
      )}

      {sel && (
        <>
          <Section title={t('anim.enter')}>
            <div className="preset-grid">
              {ENTER_TYPES.filter((e) => e !== 'typewriter' || sel.kind === 'text').map((e) => (
                <PresetTile key={e} label={t(`enter.${e}`)} demo={ENTER_DEMO[e]} selected={sel.anim.enter === e} onClick={() => update({ anim: { enter: e } })} />
              ))}
            </div>
            {sel.anim.enter !== 'none' && (
              <>
                <Slider label={t('anim.delay')} value={sel.anim.delay} min={0} max={Math.max(1, clipLength - 0.5)} step={0.05} format={secs} onInput={(delay) => update({ anim: { delay } }, false)} onCommit={(delay) => update({ anim: { delay } })} />
                <Slider label={t('anim.duration')} value={sel.anim.duration} min={0.2} max={3} step={0.05} format={secs} onInput={(duration) => update({ anim: { duration } }, false)} onCommit={(duration) => update({ anim: { duration } })} />
              </>
            )}
          </Section>
          <Section title={t('anim.loop')}>
            <div className="preset-grid">
              {LOOP_TYPES.map((l) => (
                <PresetTile key={l} label={t(`loop.${l}`)} demo={LOOP_DEMO[l]} selected={sel.anim.loop === l} onClick={() => update({ anim: { loop: l } })} />
              ))}
            </div>
          </Section>
        </>
      )}

      {hasAnimation && (
        <motion.button className="btn danger" style={{ marginTop: 16 }} onClick={() => editor?.clearAnimations()} whileTap={{ scale: 0.96 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Eraser size={15} />
          {t('anim.clear')}
        </motion.button>
      )}
    </div>
  );
}
