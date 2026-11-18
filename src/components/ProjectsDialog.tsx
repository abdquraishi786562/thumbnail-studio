import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Copy, Download, FilePlus2, FolderOpen, HardDrive, Trash2, Upload, X } from 'lucide-react';
import { useUi } from '../store/ui';
import { useSettings } from '../store/settings';
import { resolveTheme } from '../theme/themes';
import {
  BackupError,
  deleteProject,
  duplicateProject,
  exportBackup,
  importBackup,
  openProject,
  refreshList,
  saveNow,
  startNewProject,
  useProjects,
  type ProjectMeta
} from '../projects/projects';
import { storageUsed } from '../projects/db';
import { downloadBlob } from './ExportDialog';

function relative(ts: number, lang: string): string {
  const diff = (ts - Date.now()) / 1000;
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
  if (abs < 60) return rtf.format(Math.round(diff), 'second');
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
  if (abs < 86400 * 30) return rtf.format(Math.round(diff / 86400), 'day');
  return new Date(ts).toLocaleDateString(lang);
}

function size(bytes: number): string {
  return bytes > 1024 * 1024 * 1024 ? `${(bytes / 1024 ** 3).toFixed(1)} GB` : `${Math.max(0.1, bytes / 1024 ** 2).toFixed(1)} MB`;
}

export function ProjectsDialog() {
  const { t, i18n } = useTranslation();
  const open = useUi((s) => s.projectsOpen);
  const setOpen = useUi((s) => s.setProjectsOpen);
  const editor = useUi((s) => s.editor);
  const toast = useUi((s) => s.toast);
  const list = useProjects((s) => s.list);
  const currentId = useProjects((s) => s.currentId);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [used, setUsed] = useState<number | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setConfirm(null);
    void refreshList();
    void storageUsed().then(setUsed);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  const name = (p: ProjectMeta) => p.name || t('app.untitled');

  const saveCurrent = async () => {
    if (editor && useProjects.getState().currentId) await saveNow(editor, useUi.getState().projectName);
  };

  const openOne = async (p: ProjectMeta) => {
    if (!editor) return;
    if (p.id !== currentId) {
      await saveCurrent();
      const rec = await openProject(editor, p.id);
      if (rec) useUi.getState().setProjectName(rec.name);
      toast(t('projects.opened', { name: name(p) }));
    }
    setOpen(false);
  };

  const newOne = async () => {
    if (!editor) return;
    await saveCurrent();
    startNewProject();
    useUi.getState().setProjectName('');
    const s = useSettings.getState();
    const theme = resolveTheme(s.theme, s.customAccent, s.customDark);
    await editor.loadStarter({ heading: t('text.sampleHeading'), sub: t('text.sampleSub') }, theme.accent, theme.accent2);
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
          <motion.section
            className="dialog projects-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={t('projects.title')}
            initial={{ opacity: 0, y: 40, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
          >
            <div className="sheet-head">
              <h2 className="ai-title">
                <FolderOpen size={20} />
                {t('projects.title')}
              </h2>
              <motion.button className="icon-btn" onClick={() => setOpen(false)} aria-label={t('settings.close')} whileHover={{ rotate: 90 }} whileTap={{ scale: 0.9 }}>
                <X size={18} />
              </motion.button>
            </div>
            <div className="dialog-body">
              <div className="projects-actions">
                <motion.button className="btn btn-primary" onClick={() => void newOne()} whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}>
                  <FilePlus2 size={16} />
                  {t('projects.new')}
                </motion.button>
                <motion.button className="btn" onClick={() => fileInput.current?.click()} whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}>
                  <Upload size={16} />
                  {t('projects.import')}
                </motion.button>
                <input
                  ref={fileInput}
                  type="file"
                  accept=".thumbproj,application/zip"
                  hidden
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    e.target.value = '';
                    if (!f) return;
                    try {
                      const rec = await importBackup(f);
                      toast(t('projects.imported', { name: rec.name || t('app.untitled') }));
                    } catch (err) {
                      if (!(err instanceof BackupError)) console.error(err);
                      toast(t('projects.importFailed'));
                    }
                  }}
                />
                {used !== null && (
                  <span className="storage-used">
                    <HardDrive size={14} />
                    {t('projects.storage', { used: size(used) })}
                  </span>
                )}
              </div>
              <p className="hint">{t('projects.autoNote')}</p>

              {list.length === 0 && (
                <motion.div className="soon" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <motion.span animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ display: 'grid', color: 'var(--accent)' }}>
                    <FolderOpen size={40} />
                  </motion.span>
                  {t('projects.empty')}
                </motion.div>
              )}

              <motion.div className="project-grid" layout>
                <AnimatePresence>
                  {list.map((p, i) => (
                    <motion.div
                      key={p.id}
                      layout
                      className="project-card"
                      data-current={p.id === currentId}
                      initial={{ opacity: 0, y: 16, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30, delay: Math.min(i, 10) * 0.035 }}
                      whileHover={{ y: -4 }}
                    >
                      <button className="project-thumb" onClick={() => void openOne(p)} aria-label={name(p)}>
                        {p.thumb && <img src={p.thumb} alt="" />}
                        {p.id === currentId && <span className="current-badge">{t('projects.current')}</span>}
                      </button>
                      <div className="project-info">
                        <div className="project-name-row" dir="auto">
                          {name(p)}
                        </div>
                        <div className="project-date">{t('projects.edited', { when: relative(p.updatedAt, i18n.language) })}</div>
                      </div>
                      <AnimatePresence mode="wait" initial={false}>
                        {confirm === p.id ? (
                          <motion.div key="confirm" className="project-tools confirm" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                            <span>{t('projects.confirmDelete')}</span>
                            <button className="btn danger-solid" onClick={() => void deleteProject(p.id).then(() => setConfirm(null))}>
                              {t('projects.yes')}
                            </button>
                            <button className="btn" onClick={() => setConfirm(null)}>
                              {t('projects.no')}
                            </button>
                          </motion.div>
                        ) : (
                          <motion.div key="tools" className="project-tools" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <button className="mini-btn" title={t('projects.duplicate')} aria-label={t('projects.duplicate')} onClick={() => void duplicateProject(p.id, t('projects.copySuffix'))}>
                              <Copy size={15} />
                            </button>
                            <button
                              className="mini-btn"
                              title={t('projects.backup')}
                              aria-label={t('projects.backup')}
                              onClick={async () => {
                                if (p.id === currentId) await saveCurrent();
                                const { blob, name: file } = await exportBackup(p.id);
                                downloadBlob(blob, file);
                              }}
                            >
                              <Download size={15} />
                            </button>
                            <button className="mini-btn danger-icon" title={t('projects.delete')} aria-label={t('projects.delete')} onClick={() => setConfirm(p.id)}>
                              <Trash2 size={15} />
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}
