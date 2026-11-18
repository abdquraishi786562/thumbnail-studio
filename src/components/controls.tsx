import { useId, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';

export function Section({ title, children, defaultOpen = true, right }: { title: string; children: ReactNode; defaultOpen?: boolean; right?: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="section">
      <div className="section-head">
        <button className="section-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          <motion.span animate={{ rotate: open ? 0 : -90 }} style={{ display: 'grid' }}>
            <ChevronDown size={15} />
          </motion.span>
          {title}
        </button>
        {right}
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="section-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 36 }}
          >
            <div className="section-inner">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  format?: (v: number) => string;
  /** Called while dragging. */
  onInput: (v: number) => void;
  /** Called when the drag ends. */
  onCommit: (v: number) => void;
}

export function Slider({ label, value, min, max, step = 0.01, format, onInput, onCommit }: SliderProps) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="slider">
      <div className="slider-top">
        <label htmlFor={id}>{label}</label>
        <motion.span key={Math.round(value * 100)} className="slider-val" initial={{ y: -3, opacity: 0.4 }} animate={{ y: 0, opacity: 1 }}>
          <bdi dir="ltr">{format ? format(value) : value.toFixed(2)}</bdi>
        </motion.span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ ['--pct' as string]: `${pct}%` }}
        onChange={(e) => onInput(Number(e.target.value))}
        onPointerUp={(e) => onCommit(Number((e.target as HTMLInputElement).value))}
        onKeyUp={(e) => onCommit(Number((e.target as HTMLInputElement).value))}
      />
    </div>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  group,
  cols
}: {
  options: { value: T; label: ReactNode; title?: string }[];
  value: T | undefined;
  onChange: (v: T) => void;
  group: string;
  cols?: number;
}) {
  return (
    <div className="segmented" style={{ gridTemplateColumns: `repeat(${cols ?? options.length}, 1fr)` }}>
      {options.map((o) => (
        <button key={o.value} aria-pressed={value === o.value} title={o.title} onClick={() => onChange(o.value)}>
          {value === o.value && <motion.span layoutId={`seg-${group}`} className="seg-pill" transition={{ type: 'spring', stiffness: 500, damping: 36 }} />}
          <span>{o.label}</span>
        </button>
      ))}
    </div>
  );
}

export function ColourRow({ value, colours, onPick, label }: { value: string; colours: string[]; onPick: (c: string) => void; label: string }) {
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
      <label className="swatch picker" title={label} aria-label={label} style={{ background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)' }}>
        <input type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#ffffff'} onChange={(e) => onPick(e.target.value)} />
      </label>
    </div>
  );
}

export function IconButton({ label, onClick, children, active }: { label: string; onClick: () => void; children: ReactNode; active?: boolean }) {
  return (
    <motion.button className="tool-btn" aria-label={label} title={label} aria-pressed={active} onClick={onClick} whileHover={{ y: -2 }} whileTap={{ scale: 0.88 }}>
      {children}
    </motion.button>
  );
}
