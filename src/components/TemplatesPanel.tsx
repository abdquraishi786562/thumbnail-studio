import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useUi } from '../store/ui';
import { useSettings } from '../store/settings';
import { useEditorUi } from '../editor/editor';
import { platformById } from '../editor/platforms';
import { languageByCode } from '../i18n/languages';
import type { ConcreteStyle, ContentLang } from '../ai/styles';
import type { RenderedTemplate } from '../ai/templates';

/** Rendered templates per size and language, kept while the page is open. */
const cache = new Map<string, RenderedTemplate[]>();

export function TemplatesPanel() {
  const { t, i18n } = useTranslation();
  const editor = useUi((s) => s.editor);
  const toast = useUi((s) => s.toast);
  const language = useSettings((s) => s.language);
  const platform = useEditorUi((s) => s.platform);
  const [filter, setFilter] = useState<ConcreteStyle | 'all'>('all');
  const key = `${platform}|${language}`;
  const [items, setItems] = useState<RenderedTemplate[]>(() => cache.get(key) ?? []);
  const p = platformById(platform);

  useEffect(() => {
    const cached = cache.get(key);
    if (cached) {
      setItems(cached);
      return;
    }
    let cancelled = false;
    setItems([]);
    void (async () => {
      const { TEMPLATES, renderTemplate } = await import('../ai/templates');
      const rtl = languageByCode(language).dir === 'rtl';
      // Use the chosen language directly: the app may still be switching when this runs.
      const tt = i18n.getFixedT(language);
      const done: RenderedTemplate[] = [];
      for (const def of TEMPLATES) {
        if (cancelled) return;
        const r = await renderTemplate(def, { width: p.width, height: p.height, lang: language as ContentLang, rtl, heading: tt('text.sampleHeading'), sub: tt('text.sampleSub') });
        done.push(r);
        if (!cancelled) setItems([...done]);
        await new Promise((res) => setTimeout(res, 0));
      }
      cache.set(key, done);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const styles = ['all', ...new Set(items.map((i) => i.def.style))] as (ConcreteStyle | 'all')[];
  const shown = items.filter((i) => filter === 'all' || i.def.style === filter);
  const pending = Math.max(0, 18 - items.length);

  return (
    <div>
      <h2>{t('rail.templates')}</h2>
      <p className="hint">{t('templates.hint')}</p>
      <div className="chips small" style={{ marginBottom: 12 }}>
        {styles.map((s) => (
          <motion.button key={s} className="chip-btn" aria-pressed={filter === s} onClick={() => setFilter(s)} whileTap={{ scale: 0.92 }}>
            {filter === s && <motion.span layoutId="tpl-chip" className="chip-pill" transition={{ type: 'spring', stiffness: 500, damping: 36 }} />}
            <span>{s === 'all' ? t('templates.all') : t(`styles.${s}`)}</span>
          </motion.button>
        ))}
      </div>
      <motion.div className="template-grid" layout>
        <AnimatePresence mode="popLayout">
          {shown.map((item, i) => (
            <motion.button
              key={item.def.id}
              layout
              className="template-card"
              style={{ aspectRatio: `${p.width} / ${p.height}` }}
              initial={{ opacity: 0, scale: 0.85, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28, delay: filter === 'all' ? 0 : i * 0.03 }}
              whileHover={{ scale: 1.05, zIndex: 2 }}
              whileTap={{ scale: 0.96 }}
              onClick={async () => {
                if (!editor) return;
                await editor.loadDesign(item.snapshot, platform);
                toast(t('templates.applied'));
              }}
            >
              <img src={item.preview} alt="" />
              <span className="t-label">{t(`styles.${item.def.style}`)}</span>
            </motion.button>
          ))}
          {filter === 'all' &&
            Array.from({ length: pending }, (_, i) => <motion.div key={`sk${i}`} className="template-card skeleton" style={{ aspectRatio: `${p.width} / ${p.height}` }} exit={{ opacity: 0 }} />)}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
