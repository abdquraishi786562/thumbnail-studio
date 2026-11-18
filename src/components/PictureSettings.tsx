import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, KeyRound } from 'lucide-react';
import { useSettings } from '../store/settings';
import { NO_PICTURES, PICTURE_PRESETS, generatePicture, type PictureService } from '../ai/pictures';
import { Segmented } from './controls';

/** Settings card for the optional picture AI (the user's own key, stored only in this browser). */
export function PictureSettings({ variants }: { variants: import('motion/react').Variants }) {
  const { t } = useTranslation();
  const cfg = useSettings((s) => s.pictures);
  const setPictures = useSettings((s) => s.setPictures);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [testing, setTesting] = useState(false);

  const pick = (service: PictureService) => {
    setStatus(null);
    if (service === 'none') return setPictures({ ...NO_PICTURES, apiKey: cfg.apiKey });
    const preset = PICTURE_PRESETS[service];
    setPictures({ service, baseUrl: service === 'custom' ? cfg.baseUrl : preset.baseUrl, model: service === cfg.service ? cfg.model : preset.model, apiKey: cfg.apiKey });
  };

  const test = async () => {
    setTesting(true);
    setStatus(null);
    try {
      await generatePicture(cfg, 'a small red circle on a white background', 1024, 1024);
      setStatus({ ok: true, text: t('pictures.ok') });
    } catch (e) {
      setStatus({ ok: false, text: t('pictures.failed', { reason: (e as Error).message }) });
    } finally {
      setTesting(false);
    }
  };

  const keysUrl = cfg.service !== 'none' ? PICTURE_PRESETS[cfg.service].keysUrl : '';

  return (
    <motion.div className="card" variants={variants}>
      <p className="eyebrow">{t('pictures.title')}</p>
      <p className="sub">{t('pictures.hint')}</p>
      <div className="field">
        <span className="label">{t('pictures.service')}</span>
        <Segmented
          group="picsvc"
          value={cfg.service}
          onChange={pick}
          cols={4}
          options={[
            { value: 'none', label: t('pictures.none') },
            { value: 'pollinations', label: 'Pollinations' },
            { value: 'openai', label: 'OpenAI' },
            { value: 'custom', label: t('pictures.custom') }
          ]}
        />
      </div>
      <AnimatePresence initial={false}>
        {cfg.service !== 'none' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
            <div className="field">
              <label className="label" htmlFor="pic-key">
                {t('pictures.key')}
              </label>
              <div className="key-row">
                <KeyRound size={16} />
                <input
                  id="pic-key"
                  className="text-input"
                  type="password"
                  autoComplete="off"
                  spellCheck={false}
                  value={cfg.apiKey}
                  onChange={(e) => setPictures({ ...cfg, apiKey: e.target.value })}
                />
                {keysUrl && (
                  <a className="link-btn" href={keysUrl} target="_blank" rel="noreferrer">
                    {t('pictures.getKey')} <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
            <div className="field">
              <label className="label" htmlFor="pic-model">
                {t('pictures.model')}
              </label>
              <input id="pic-model" className="text-input" dir="ltr" value={cfg.model} onChange={(e) => setPictures({ ...cfg, model: e.target.value })} />
            </div>
            <div className="field">
              <label className="label" htmlFor="pic-url">
                {t('pictures.baseUrl')}
              </label>
              <input id="pic-url" className="text-input" dir="ltr" value={cfg.baseUrl} placeholder="https://…/v1" onChange={(e) => setPictures({ ...cfg, baseUrl: e.target.value })} />
            </div>
            <div className="setting-row">
              <motion.button className="btn" disabled={testing || !cfg.apiKey.trim()} onClick={() => void test()} whileTap={{ scale: 0.95 }}>
                {testing ? t('pictures.testing') : t('pictures.test')}
              </motion.button>
              <AnimatePresence>
                {status && (
                  <motion.span className={status.ok ? 'status ok' : 'status bad'} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                    {status.text}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
