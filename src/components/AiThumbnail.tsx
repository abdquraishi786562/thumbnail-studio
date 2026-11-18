import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Cpu, ImagePlus, RefreshCw, Shuffle, Sparkles, Wand2, X } from 'lucide-react';
import { useUi } from '../store/ui';
import { useSettings } from '../store/settings';
import { useEditorUi } from '../editor/editor';
import { platformById } from '../editor/platforms';
import { detectDirection } from '../editor/textDirection';
import { STYLES, contentLanguage, type StyleId } from '../ai/styles';
import type { Media } from '../ai/layouts';
import type { Copy } from '../ai/copy';
import type { Variant } from '../ai/generate';
import { generatePicture, picturePrompt, picturesEnabled, serviceName } from '../ai/pictures';
import { downloadOnDevice, onDeviceCopy, onDeviceStatus, type OnDeviceStatus } from '../ai/onDevice';
import { Toggle } from './Toggle';

const SKELETONS = 6;

export function AiThumbnail() {
  const { t } = useTranslation();
  const open = useUi((s) => s.aiOpen);
  const setOpen = useUi((s) => s.setAiOpen);
  const editor = useUi((s) => s.editor);
  const toast = useUi((s) => s.toast);
  const setSettingsOpen = useUi((s) => s.setSettingsOpen);
  const uiLang = useSettings((s) => s.language);
  const pictures = useSettings((s) => s.pictures);
  const platform = useEditorUi((s) => s.platform);

  const [idea, setIdea] = useState('');
  const [style, setStyle] = useState<StyleId>('auto');
  const [photo, setPhoto] = useState<Media | null>(null);
  const [usePicture, setUsePicture] = useState(true);
  const [picture, setPicture] = useState<Media | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [phase, setPhase] = useState<'idle' | 'drawing' | 'designing'>('idle');
  const [warn, setWarn] = useState<string | null>(null);
  const [brain, setBrain] = useState<'rules' | 'onDevice'>('rules');
  const [onDevice, setOnDevice] = useState<OnDeviceStatus>('unavailable');
  const [download, setDownload] = useState<number | null>(null);
  const [seed, setSeed] = useState(0);
  const copiesRef = useRef<{ idea: string; style: StyleId; copies: Copy[] | null } | null>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  const ideaRef = useRef<HTMLTextAreaElement>(null);

  const canPicture = picturesEnabled(pictures);
  const busy = phase !== 'idle';
  const rtl = detectDirection(idea) === 'rtl';

  useEffect(() => {
    if (!open) return;
    setTimeout(() => ideaRef.current?.focus(), 250);
    const lang = contentLanguage(idea || 'a', uiLang);
    void onDeviceStatus(lang).then(setOnDevice);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !busy && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const run = async (nextSeed: number, freshPicture: boolean) => {
    if (!idea.trim()) {
      setWarn(t('aiGen.emptyIdea'));
      ideaRef.current?.focus();
      return;
    }
    const { generateVariants, mediaFromBlob } = await import('../ai/generate');
    setWarn(null);
    setVariants([]);
    setSeed(nextSeed);
    const p = platformById(useEditorUi.getState().platform);

    // 1. Words: on-device AI when the browser has it, otherwise the built-in assistant.
    let copies: Copy[] | null = null;
    const cached = copiesRef.current;
    if (cached && cached.idea === idea && cached.style === style) copies = cached.copies;
    else {
      setPhase('designing');
      copies = await onDeviceCopy(idea, style === 'auto' ? 'bold' : style, contentLanguage(idea, uiLang));
      copiesRef.current = { idea, style, copies };
    }
    setBrain(copies ? 'onDevice' : 'rules');

    // 2. Optional AI picture (one per round, shared by every design).
    let pic = freshPicture ? null : picture;
    if (usePicture && canPicture && !pic) {
      setPhase('drawing');
      try {
        const blob = await generatePicture(pictures, picturePrompt(idea, style, rtl), p.width, p.height);
        pic = await mediaFromBlob(blob);
        setPicture(pic);
      } catch (e) {
        setWarn(t('aiGen.pictureFailed', { reason: (e as Error).message }));
      }
    }
    if (!usePicture || !canPicture) pic = null;

    // 3. Designs.
    setPhase('designing');
    try {
      await generateVariants(
        { idea, style, uiLang, width: p.width, height: p.height, photo, picture: pic, seed: nextSeed, copies },
        SKELETONS,
        (v) => setVariants((prev) => [...prev, v])
      );
    } catch (e) {
      console.error(e);
      setWarn(t('export.failed'));
    } finally {
      setPhase('idle');
    }
  };

  const use = async (v: Variant) => {
    if (!editor) return;
    await editor.loadDesign(v.snapshot, platform);
    setOpen(false);
    toast(t('aiGen.applied'));
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !busy && setOpen(false)} />
          <motion.section
            className="dialog ai-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={t('aiGen.title')}
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          >
            <div className="ai-glow" aria-hidden />
            <div className="sheet-head">
              <h2 className="ai-title">
                <motion.span animate={{ rotate: [0, 15, -10, 0], scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }} style={{ display: 'grid' }}>
                  <Sparkles size={20} />
                </motion.span>
                {t('aiGen.title')}
              </h2>
              <motion.button className="icon-btn" onClick={() => setOpen(false)} aria-label={t('settings.close')} whileHover={{ rotate: 90 }} whileTap={{ scale: 0.9 }}>
                <X size={18} />
              </motion.button>
            </div>
            <div className="dialog-body">
              <p className="hint">{t('aiGen.subtitle')}</p>
              <label className="label" htmlFor="ai-idea">
                {t('aiGen.ideaLabel')}
              </label>
              <textarea
                id="ai-idea"
                ref={ideaRef}
                className="idea-input"
                dir="auto"
                rows={2}
                maxLength={160}
                value={idea}
                placeholder={t('aiGen.ideaPlaceholder')}
                onChange={(e) => setIdea(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!busy) void run(0, true);
                  }
                }}
              />

              <div className="label" style={{ margin: '12px 0 6px' }}>
                {t('aiGen.style')}
              </div>
              <div className="chips">
                {STYLES.map((s) => (
                  <motion.button key={s} className="chip-btn" aria-pressed={style === s} onClick={() => setStyle(s)} whileTap={{ scale: 0.92 }} whileHover={{ y: -2 }}>
                    {style === s && <motion.span layoutId="style-chip" className="chip-pill" transition={{ type: 'spring', stiffness: 500, damping: 36 }} />}
                    <span>{t(`styles.${s}`)}</span>
                  </motion.button>
                ))}
              </div>

              <div className="ai-options">
                <div className="ai-option">
                  {photo ? (
                    <motion.img src={photo.url} alt="" className="photo-thumb" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} />
                  ) : (
                    <span className="photo-thumb empty">
                      <ImagePlus size={18} />
                    </span>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="t">{t('aiGen.photo')}</div>
                    <div className="d">{t('aiGen.photoHint')}</div>
                  </div>
                  {photo ? (
                    <button className="btn" onClick={() => setPhoto(null)}>
                      {t('aiGen.removePhoto')}
                    </button>
                  ) : (
                    <button className="btn" onClick={() => photoInput.current?.click()}>
                      {t('aiGen.addPhoto')}
                    </button>
                  )}
                  <input
                    ref={photoInput}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      e.target.value = '';
                      if (!f) return;
                      const { mediaFromBlob } = await import('../ai/generate');
                      setPhoto(await mediaFromBlob(f));
                    }}
                  />
                </div>
                <div className="ai-option">
                  <span className="photo-thumb empty">
                    <Wand2 size={18} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="t">{t('aiGen.aiPicture')}</div>
                    <div className="d">
                      {canPicture ? (
                        t('aiGen.aiPictureSends', { service: serviceName(pictures) })
                      ) : (
                        <button className="link-btn" onClick={() => setSettingsOpen(true)}>
                          {t('aiGen.aiPictureOff')}
                        </button>
                      )}
                    </div>
                  </div>
                  {canPicture && <Toggle checked={usePicture} onChange={setUsePicture} label={t('aiGen.aiPicture')} />}
                </div>
              </div>

              <div className="ai-run">
                <motion.button className="btn btn-primary wide ai-go" disabled={busy} onClick={() => void run(0, true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  <motion.span animate={busy ? { rotate: 360 } : { rotate: 0 }} transition={busy ? { repeat: Infinity, duration: 1.2, ease: 'linear' } : {}} style={{ display: 'grid' }}>
                    <Sparkles size={17} />
                  </motion.span>
                  {phase === 'drawing' ? t('aiGen.drawing') : phase === 'designing' ? t('aiGen.generating') : t('aiGen.generate')}
                </motion.button>
                <span className="brain">
                  <Cpu size={13} />
                  {brain === 'onDevice' ? t('aiGen.brainOnDevice') : t('aiGen.brainRules')}
                </span>
                {onDevice === 'downloadable' && (
                  <button
                    className="link-btn"
                    disabled={download !== null}
                    onClick={async () => {
                      setDownload(0);
                      const ok = await downloadOnDevice(contentLanguage(idea || 'a', uiLang), (f) => setDownload(f));
                      setDownload(null);
                      if (ok) setOnDevice('available');
                    }}
                  >
                    {download !== null ? t('aiGen.downloading', { p: Math.round(download * 100) }) : t('aiGen.enableOnDevice')}
                  </button>
                )}
              </div>

              <AnimatePresence>
                {warn && (
                  <motion.p className="warn" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <AlertTriangle size={15} /> {warn}
                  </motion.p>
                )}
              </AnimatePresence>

              {(busy || variants.length > 0) && (
                <>
                  <p className="hint" style={{ marginTop: 6 }}>
                    {t('aiGen.results')} {t('aiGen.replaceNote')}
                  </p>
                  <div className="variant-grid" style={{ ['--ratio' as string]: `${platformById(platform).width} / ${platformById(platform).height}` }}>
                    {Array.from({ length: SKELETONS }, (_, i) => {
                      const v = variants[i];
                      return (
                        <div key={i} className="variant-slot">
                          <AnimatePresence mode="popLayout">
                            {v ? (
                              <motion.button
                                key={v.key}
                                className="variant"
                                onClick={() => void use(v)}
                                initial={{ opacity: 0, scale: 0.8, rotate: i % 2 ? 3 : -3, y: 20 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ type: 'spring', stiffness: 380, damping: 24 }}
                                whileHover={{ y: -6, scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                              >
                                <img src={v.preview} alt="" />
                                <span className="variant-use">
                                  <Sparkles size={14} />
                                  {t('aiGen.use')}
                                </span>
                              </motion.button>
                            ) : (
                              <motion.div key="skeleton" className="variant skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
            {variants.length > 0 && !busy && (
              <motion.div className="dialog-foot" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <motion.button className="btn" onClick={() => void run(seed + SKELETONS, false)} whileTap={{ scale: 0.95 }} whileHover={{ y: -2 }}>
                  <Shuffle size={15} />
                  {t('aiGen.more')}
                </motion.button>
                {canPicture && usePicture && (
                  <motion.button className="btn" onClick={() => void run(seed, true)} whileTap={{ scale: 0.95 }} whileHover={{ y: -2 }}>
                    <RefreshCw size={15} />
                    {t('aiGen.newPicture')}
                  </motion.button>
                )}
              </motion.div>
            )}
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}
