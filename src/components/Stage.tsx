import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useAnimate } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { ImagePlus } from 'lucide-react';
import { Editor, useEditorUi } from '../editor/editor';
import { useUi } from '../store/ui';
import { useSettings } from '../store/settings';
import { resolveTheme } from '../theme/themes';
import { PlayButton } from './AnimatePanel';
import { flushSave, lastProjectId, openProject, refreshList, scheduleSave } from '../projects/projects';

export function Stage() {
  const { t } = useTranslation();
  const box = useRef<HTMLDivElement>(null);
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const [frame, animateFrame] = useAnimate<HTMLDivElement>();
  const setEditor = useUi((s) => s.setEditor);
  const editor = useUi((s) => s.editor);
  const platform = useEditorUi((s) => s.platform);
  const [dragging, setDragging] = useState(false);
  const playing = useEditorUi((s) => s.playing);
  const hasAnimation = useEditorUi((s) => s.hasAnimation);
  const playTime = useEditorUi((s) => s.playTime);
  const clipLength = useEditorUi((s) => s.clipLength);
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
    const starter = () => ed.loadStarter({ heading: t('text.sampleHeading'), sub: t('text.sampleSub') }, theme.accent, theme.accent2);
    // Reopen the last project; otherwise start fresh.
    void (async () => {
      const last = lastProjectId();
      try {
        const rec = last ? await openProject(ed, last) : null;
        if (rec) useUi.getState().setProjectName(rec.name);
        else await starter();
      } catch (e) {
        console.error('could not reopen project', e);
        await starter();
      }
      void refreshList();
      ed.onChange = () => scheduleSave(ed, () => useUi.getState().projectName);
    })();
    // Save straight away when the tab is hidden or closed.
    const flush = () => {
      if (document.visibilityState === 'hidden') flushSave(ed, useUi.getState().projectName);
    };
    document.addEventListener('visibilitychange', flush);
    return () => {
      document.removeEventListener('visibilitychange', flush);
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
      const key = e.key.toLowerCase();
      const hasSel = !!editor.canvas.getActiveObject();
      if (mod && key === 'z') {
        e.preventDefault();
        void (e.shiftKey ? editor.redo() : editor.undo());
      } else if (mod && key === 'y') {
        e.preventDefault();
        void editor.redo();
      } else if (mod && key === 'd' && hasSel) {
        e.preventDefault();
        void editor.duplicate();
      } else if (mod && key === 'c' && hasSel) {
        void editor.copy();
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && hasSel) {
        e.preventDefault();
        editor.deleteSelection();
      } else if (e.key.startsWith('Arrow') && hasSel) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        editor.nudge(dx, dy);
      } else if (e.key === ']' && hasSel) {
        editor.order(mod ? 'front' : 'forward');
      } else if (e.key === '[' && hasSel) {
        editor.order(mod ? 'back' : 'backward');
      } else if (e.key === 'Escape') {
        if (editor.isPlaying) editor.stop();
        editor.canvas.discardActiveObject();
        editor.canvas.requestRenderAll();
      } else if (e.key === ' ' && useEditorUi.getState().hasAnimation) {
        e.preventDefault();
        if (editor.isPlaying) editor.stop();
        else editor.play();
      }
    };
    // Paste: images from the clipboard (e.g. a screenshot), otherwise our own copied objects.
    const onPaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.closest?.('input, textarea, [contenteditable]')) return;
      const active = editor.canvas.getActiveObject() as { isEditing?: boolean } | undefined;
      if (active?.isEditing) return;
      const file = Array.from(e.clipboardData?.files ?? []).find((f) => f.type.startsWith('image/'));
      e.preventDefault();
      if (file) void editor.addImage(file);
      else void editor.paste();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('paste', onPaste);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('paste', onPaste);
    };
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
        <div className={playing ? 'canvas-frame playing' : 'canvas-frame'} ref={frame}>
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
      <AnimatePresence>
        {(hasAnimation || playing) && (
          <motion.div className="playbar" initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }} transition={{ type: 'spring', stiffness: 420, damping: 30 }}>
            <PlayButton compact />
            <div className="playbar-track">
              <div className="playbar-fill" style={{ width: `${playing ? (playTime / clipLength) * 100 : 0}%` }} />
            </div>
            <bdi dir="ltr" className="playbar-time">
              {(playing ? playTime : 0).toFixed(1)} / {clipLength.toFixed(1)} s
            </bdi>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
