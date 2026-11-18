import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Download, Film, Image as ImageIcon, Wand2, X, AlertTriangle } from 'lucide-react';
import { useUi } from '../store/ui';
import { useEditorUi } from '../editor/editor';
import { platformById } from '../editor/platforms';
import { Segmented, Slider } from './controls';

type Kind = 'image' | 'animated';
type ImageFormat = 'png' | 'jpeg';
type AnimFormat = 'mp4' | 'webm' | 'gif';

function safeName(name: string): string {
  return name.trim().replace(/[\\/:*?"<>|]+/g, '-').slice(0, 80) || 'thumbnail';
}

export function downloadBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(bytes < 1024 * 1024 ? 2 : 1)} MB`;

export function ExportDialog() {
  const { t } = useTranslation();
  const open = useUi((s) => s.exportOpen);
  const setOpen = useUi((s) => s.setExportOpen);
  const editor = useUi((s) => s.editor);
  const toast = useUi((s) => s.toast);
  const platform = useEditorUi((s) => s.platform);
  const hasAnimation = useEditorUi((s) => s.hasAnimation);
  const clipLength = useEditorUi((s) => s.clipLength);
  const p = platformById(platform);

  const [kind, setKind] = useState<Kind>('image');
  const [imageFormat, setImageFormat] = useState<ImageFormat>('png');
  const [animFormat, setAnimFormat] = useState<AnimFormat>('mp4');
  const [scale, setScale] = useState<'1' | '0.5'>('1');
  const [fps, setFps] = useState<'15' | '24' | '30'>('30');
  const [length, setLength] = useState(clipLength);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    if (open) {
      setLength(clipLength);
      setError(null);
      if (hasAnimation && platform !== 'youtube') setKind('animated');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    // GIFs get big quickly: default to half size and 15 fps.
    if (animFormat === 'gif') {
      setScale('0.5');
      setFps('15');
    } else {
      setScale('1');
      setFps('30');
    }
  }, [animFormat]);

  const busy = progress !== null;
  const close = () => {
    if (busy) abort.current?.abort();
    setOpen(false);
  };

  const baseName = `${safeName(useUi.getState().projectName || t('app.untitled'))}-${p.id}`;

  const run = async () => {
    if (!editor) return;
    setError(null);
    try {
      if (kind === 'image') {
        const blob = imageFormat === 'png' ? await editor.toBlob('png') : await editor.toJpegUnder(p.maxBytes);
        const name = `${baseName}-${p.width}x${p.height}.${imageFormat === 'png' ? 'png' : 'jpg'}`;
        downloadBlob(blob, name);
        toast(`${t('export.done', { name })} · ${mb(blob.size)}`);
        setOpen(false);
        return;
      }
      abort.current = new AbortController();
      setProgress(0);
      const { exportAnimated, VideoUnsupportedError } = await import('../editor/exportAnimated');
      try {
        const s = Number(scale);
        const blob = await exportAnimated(editor, {
          format: animFormat,
          fps: Number(fps),
          length,
          scale: s,
          signal: abort.current.signal,
          onProgress: setProgress
        });
        const w = Math.round(p.width * s);
        const h = Math.round(p.height * s);
        const name = `${baseName}-${w}x${h}.${animFormat}`;
        downloadBlob(blob, name);
        toast(`${t('export.done', { name })} · ${mb(blob.size)}`);
        setOpen(false);
      } catch (e) {
        if (e instanceof VideoUnsupportedError) setError(t('exportDlg.unsupported', { format: animFormat.toUpperCase() }));
        else if ((e as Error).name !== 'AbortError') throw e;
      }
    } catch (e) {
      console.error(e);
      setError(t('export.failed'));
    } finally {
      setProgress(null);
      abort.current = null;
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} />
          <motion.section
            className="dialog"
            role="dialog"
            aria-modal="true"
            aria-label={t('exportDlg.title')}
            initial={{ opacity: 0, y: 30, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
            <div className="sheet-head">
              <h2>
                {t('exportDlg.title')} · <bdi dir="ltr">{p.width}×{p.height}</bdi>
              </h2>
              <motion.button className="icon-btn" onClick={close} aria-label={t('exportDlg.close')} whileHover={{ rotate: 90 }} whileTap={{ scale: 0.9 }}>
                <X size={18} />
              </motion.button>
            </div>
            <div className="dialog-body">
              <div className="kind-cards">
                {(
                  [
                    ['image', ImageIcon, t('exportDlg.image'), 'PNG · JPG'],
                    ['animated', Film, t('exportDlg.animated'), 'MP4 · WebM · GIF']
                  ] as const
                ).map(([k, Icon, title, sub]) => (
                  <motion.button key={k} className="kind-card" aria-pressed={kind === k} onClick={() => !busy && setKind(k)} whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
                    {kind === k && <motion.span layoutId="kind-ring" className="kind-ring" transition={{ type: 'spring', stiffness: 450, damping: 34 }} />}
                    <motion.span className="kind-icon" animate={kind === k ? { rotate: [0, -10, 10, 0], scale: [1, 1.15, 1] } : {}} transition={{ duration: 0.6 }}>
                      <Icon size={22} />
                    </motion.span>
                    <strong>{title}</strong>
                    <span className="sub-small">{sub}</span>
                  </motion.button>
                ))}
              </div>

              <AnimatePresence mode="wait" initial={false}>
                {kind === 'image' ? (
                  <motion.div key="img" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.18 }}>
                    <div className="field">
                      <span className="label">{t('exportDlg.format')}</span>
                      <Segmented
                        group="imgfmt"
                        value={imageFormat}
                        onChange={setImageFormat}
                        options={[
                          { value: 'png', label: 'PNG' },
                          { value: 'jpeg', label: 'JPG' }
                        ]}
                      />
                      <p className="hint">{imageFormat === 'png' ? t('exportDlg.pngHint') : t('exportDlg.jpgHint', { limit: '2 MB' })}</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="anim" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.18 }}>
                    {platform === 'youtube' && (
                      <p className="warn">
                        <AlertTriangle size={15} /> {t('exportDlg.youtubeStill')}
                      </p>
                    )}
                    {!hasAnimation && (
                      <div className="warn info">
                        <span>{t('exportDlg.noAnimation')}</span>
                        <motion.button className="btn" onClick={() => editor?.autoAnimate()} whileTap={{ scale: 0.95 }}>
                          <Wand2 size={15} />
                          {t('anim.auto')}
                        </motion.button>
                      </div>
                    )}
                    <div className="field">
                      <span className="label">{t('exportDlg.format')}</span>
                      <Segmented
                        group="animfmt"
                        value={animFormat}
                        onChange={setAnimFormat}
                        options={[
                          { value: 'mp4', label: 'MP4' },
                          { value: 'webm', label: 'WebM' },
                          { value: 'gif', label: 'GIF' }
                        ]}
                      />
                      <p className="hint">{animFormat === 'gif' ? t('exportDlg.gifHint') : t('exportDlg.videoHint')}</p>
                    </div>
                    <div className="field">
                      <span className="label">{t('exportDlg.size')}</span>
                      <Segmented
                        group="scale"
                        value={scale}
                        onChange={setScale}
                        options={[
                          { value: '1', label: <>{t('exportDlg.full')} <bdi dir="ltr" className="px">{p.width}×{p.height}</bdi></> },
                          { value: '0.5', label: <>{t('exportDlg.half')} <bdi dir="ltr" className="px">{Math.round(p.width / 2)}×{Math.round(p.height / 2)}</bdi></> }
                        ]}
                      />
                    </div>
                    <div className="field">
                      <span className="label">{t('exportDlg.fps')}</span>
                      <Segmented
                        group="fps"
                        value={fps}
                        onChange={setFps}
                        options={[
                          { value: '15', label: '15 fps' },
                          { value: '24', label: '24 fps' },
                          { value: '30', label: '30 fps' }
                        ]}
                      />
                    </div>
                    <Slider label={t('exportDlg.length')} value={length} min={1} max={15} step={0.5} format={(v) => t('anim.seconds', { n: v.toFixed(1) })} onInput={setLength} onCommit={setLength} />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {error && (
                  <motion.p className="warn" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: [0, -6, 6, -3, 0] }} exit={{ opacity: 0 }}>
                    <AlertTriangle size={15} /> {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            <div className="dialog-foot">
              {busy ? (
                <>
                  <div className="progress" role="progressbar" aria-valuenow={Math.round((progress ?? 0) * 100)} aria-valuemin={0} aria-valuemax={100}>
                    <motion.div className="progress-bar" animate={{ width: `${Math.round((progress ?? 0) * 100)}%` }} transition={{ ease: 'linear', duration: 0.15 }} />
                    <span>{t('exportDlg.rendering', { p: Math.round((progress ?? 0) * 100) })}</span>
                  </div>
                  <button className="btn" onClick={() => abort.current?.abort()}>
                    {t('exportDlg.cancel')}
                  </button>
                </>
              ) : (
                <motion.button className="btn btn-primary wide" onClick={() => void run()} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  <Download size={16} />
                  {t('exportDlg.start')}
                </motion.button>
              )}
            </div>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}
