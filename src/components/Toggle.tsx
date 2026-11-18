import { motion } from 'motion/react';

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export function Toggle({ checked, onChange, label }: Props) {
  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className="toggle"
      onClick={() => onChange(!checked)}
      whileTap={{ scale: 0.92 }}
    >
      <motion.span className="toggle-knob" layout transition={{ type: 'spring', stiffness: 700, damping: 32 }} />
    </motion.button>
  );
}
