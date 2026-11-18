import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useAnimate } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { ImagePlus } from 'lucide-react';
import { Editor, useEditorUi } from '../editor/editor';
import { useUi } from '../store/ui';
import { useSettings } from '../store/settings';
import { resolveTheme } from '../theme/themes';

export function Stage() {
  const { t } = useTranslation();
  const box = useRef<HTMLDivElement>(null);
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const [frame, animateFrame] = useAnimate<HTMLDivElement>();
  const setEditor = useUi((s) => s.setEditor);
  const editor = useUi((s) => s.editor);
  const platform = useEditorUi((s) => s.platform);
  const [dragging, setDragging] = useState(false);
  const reduceRef = useRef(useSettings.getState().reduceMotion);
  const reduceMotion = useSettings((s) => s.reduceMotion);
  reduceRef.current = reduceMotion;

  // Create the editor once.
  useEffect(() => {
    if (!canvasEl.current) return;
    const s = useSettings.getState();
    const theme = resolveTheme(s.theme, s.customAccent, s.customDark);
    const ed = new Editor(canvasEl.current, useEditorUi.getState().platform, () => !reduceRef.current);
    setEditor(ed);
    void ed.loadStarter({ heading: t('text.sampleHeading'), sub: t('text.sampleSub') }, theme.accent, theme.accent2);
    return () => {
      setEditor(null);
      ed.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the canvas fitted to the available space.
  useEffect(() => {
    if (!editor || !box.current) return;
    const el = box.current;
    const fit = () => editor.fit(el.clientWidth, el.clientHeight);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [editor, platform]);

  // A little "morph" when switching platform size.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduceMotion || !frame.current) return;
    void animateFrame(frame.current, { scale: [0.9, 1.015, 1], opacity: [0.4, 1, 1], rotate: [-1.5, 0.3, 0] }, { duration: 0.55, ease: 'easeOut' });
  }, [platform, animateFrame, frame, reduceMotion]);

  // Keyboard shortcuts.
  useEffect(() => {
    if (!editor) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, select, [contenteditable]')) return;
      const active = editor.canvas.getActiveObject() as { isEditing?: boolean } | undefined;
      if (active?.isEditing) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        void (e.shiftKey ? editor.redo() : editor.undo());
      } else if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        void editor.redo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (editor.canvas.getActiveObject()) {
          e.preventDefault();
          editor.deleteSelection();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editor]);

  return (
    <motion.main
      className="stage"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 24, delay: 0.15 }}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes('Files')) {
          e.preventDefault();
          setDragging(true);
        }
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith('image/'));
        if (file) void editor?.addImage(file);
      }}
    >
      <div className="aurora" />
      <div className="stage-box" ref={box}>
        <div className="canvas-frame" ref={frame}>
          <canvas ref={canvasEl} />
          <AnimatePresence>
            {dragging && (
              <motion.div className="drop-overlay" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 1.2 }} style={{ display: 'grid', placeItems: 'center', gap: 8 }}>
                  <ImagePlus size={40} />
                  {t('images.upload')}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.main>
  );
}
