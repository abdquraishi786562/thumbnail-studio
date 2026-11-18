import { create } from 'zustand';
import type { Editor, ProjectState } from '../editor/editor';
import { dbAll, dbDelete, dbGet, dbKeys, dbPut, persistStorage } from './db';
import { packSnapshots, unpackSnapshots } from './pack';

export interface ProjectRecord {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  /** Small JPEG preview (data URL). */
  thumb: string;
  /** Design data with images as asset references. */
  state: ProjectState;
  /** Asset ids used by this project. */
  assets: string[];
}

export type ProjectMeta = Omit<ProjectRecord, 'state'>;

type Status = 'idle' | 'saving' | 'saved' | 'error';

interface ProjectsState {
  currentId: string | null;
  list: ProjectMeta[];
  status: Status;
  setCurrent: (id: string | null) => void;
}

export const useProjects = create<ProjectsState>((set) => ({
  currentId: null,
  list: [],
  status: 'idle',
  setCurrent: (currentId) => set({ currentId })
}));

const LAST_KEY = 'thumbnail-studio:last-project';
/** blob URL → asset id, so the same picture is never hashed or stored twice. */
const known = new Map<string, string>();

function rememberLast(id: string | null): void {
  try {
    if (id) localStorage.setItem(LAST_KEY, id);
    else localStorage.removeItem(LAST_KEY);
  } catch {
    /* storage blocked */
  }
}

export function lastProjectId(): string | null {
  try {
    return localStorage.getItem(LAST_KEY);
  } catch {
    return null;
  }
}

function newId(): string {
  return typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `p${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

export async function refreshList(): Promise<void> {
  try {
    const all = await dbAll<ProjectRecord>('projects');
    const list = all.map(({ state: _state, ...meta }) => meta).sort((a, b) => b.updatedAt - a.updatedAt);
    useProjects.setState({ list });
  } catch {
    useProjects.setState({ list: [] });
  }
}

// ---------- saving ----------

let saveTimer = 0;
let pending = false;
let chain: Promise<void> = Promise.resolve();

/** Save soon (edits arrive in bursts while dragging and typing). */
export function scheduleSave(editor: Editor, name: () => string, delay = 1200): void {
  window.clearTimeout(saveTimer);
  pending = true;
  saveTimer = window.setTimeout(() => void saveNow(editor, name()), delay);
}

/** Save now if there are unsaved changes (e.g. when the tab is being hidden). */
export function flushSave(editor: Editor, name: string): void {
  if (pending) void saveNow(editor, name);
}

export function saveNow(editor: Editor, name: string): Promise<void> {
  window.clearTimeout(saveTimer);
  pending = false;
  chain = chain.then(() => doSave(editor, name)).catch(() => undefined);
  return chain;
}

async function doSave(editor: Editor, name: string): Promise<void> {
  useProjects.setState({ status: 'saving' });
  try {
    const now = Date.now();
    let id = useProjects.getState().currentId;
    const existing = id ? await dbGet<ProjectRecord>('projects', id) : undefined;
    if (!id) {
      id = newId();
      useProjects.setState({ currentId: id });
    }
    const raw = editor.exportState();
    const packed = await packSnapshots(raw.designs, (assetId, blob) => dbPut('assets', blob, assetId), known);
    const record: ProjectRecord = {
      id,
      name: name.trim(),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      thumb: editor.thumbnail(),
      state: { ...raw, designs: packed.designs },
      assets: packed.assets
    };
    await dbPut('projects', record);
    rememberLast(id);
    void persistStorage();
    useProjects.setState({ status: 'saved' });
    await refreshList();
  } catch (e) {
    console.error('save failed', e);
    useProjects.setState({ status: 'error' });
  }
}

// ---------- opening ----------

export async function openProject(editor: Editor, id: string): Promise<ProjectRecord | null> {
  const rec = await dbGet<ProjectRecord>('projects', id);
  if (!rec) return null;
  const designs = await unpackSnapshots(rec.state.designs, (a) => dbGet<Blob>('assets', a), known);
  await editor.importState({ ...rec.state, designs });
  useProjects.setState({ currentId: id, status: 'saved' });
  rememberLast(id);
  return rec;
}

/** Start an empty project; it is stored once something changes. */
export function startNewProject(): void {
  window.clearTimeout(saveTimer);
  pending = false;
  useProjects.setState({ currentId: null, status: 'idle' });
  rememberLast(null);
}

export async function duplicateProject(id: string, suffix: string): Promise<void> {
  const rec = await dbGet<ProjectRecord>('projects', id);
  if (!rec) return;
  const now = Date.now();
  await dbPut('projects', { ...rec, id: newId(), name: `${rec.name || ''} ${suffix}`.trim(), createdAt: now, updatedAt: now });
  await refreshList();
}

export async function renameProject(id: string, name: string): Promise<void> {
  const rec = await dbGet<ProjectRecord>('projects', id);
  if (!rec) return;
  await dbPut('projects', { ...rec, name: name.trim() });
  await refreshList();
}

/** Delete a project and any image files no other project uses. */
export async function deleteProject(id: string): Promise<void> {
  await dbDelete('projects', id);
  if (useProjects.getState().currentId === id) startNewProject();
  const remaining = await dbAll<ProjectRecord>('projects');
  const used = new Set(remaining.flatMap((p) => p.assets));
  for (const key of await dbKeys('assets')) if (!used.has(key)) await dbDelete('assets', key);
  await refreshList();
}

// ---------- backup files ----------

const FORMAT = 'thumbnail-studio-project';

interface BackupManifest {
  format: typeof FORMAT;
  version: 1;
  project: ProjectRecord;
  assets: { id: string; type: string }[];
}

/** A single file holding the project and its pictures (a ZIP inside). */
export async function exportBackup(id: string): Promise<{ blob: Blob; name: string }> {
  const rec = await dbGet<ProjectRecord>('projects', id);
  if (!rec) throw new Error('missing project');
  const { zipSync, strToU8 } = await import('fflate');
  const files: Record<string, Uint8Array> = {};
  const assets: BackupManifest['assets'] = [];
  for (const a of rec.assets) {
    const blob = await dbGet<Blob>('assets', a);
    if (!blob) continue;
    files[`assets/${a}`] = new Uint8Array(await blob.arrayBuffer());
    assets.push({ id: a, type: blob.type });
  }
  const manifest: BackupManifest = { format: FORMAT, version: 1, project: rec, assets };
  files['project.json'] = strToU8(JSON.stringify(manifest));
  const zip = zipSync(files, { level: 1 });
  const safe = (rec.name || 'thumbnail').replace(/[\\/:*?"<>|]+/g, '-').slice(0, 60);
  return { blob: new Blob([zip], { type: 'application/zip' }), name: `${safe}.thumbproj` };
}

export class BackupError extends Error {}

export async function importBackup(file: Blob): Promise<ProjectRecord> {
  const { unzipSync, strFromU8 } = await import('fflate');
  let files: Record<string, Uint8Array>;
  try {
    files = unzipSync(new Uint8Array(await file.arrayBuffer()));
  } catch {
    throw new BackupError('not a zip');
  }
  const raw = files['project.json'];
  if (!raw) throw new BackupError('no project.json');
  let manifest: BackupManifest;
  try {
    manifest = JSON.parse(strFromU8(raw)) as BackupManifest;
  } catch {
    throw new BackupError('bad json');
  }
  if (manifest.format !== FORMAT || !manifest.project?.state?.designs) throw new BackupError('wrong format');
  for (const a of manifest.assets ?? []) {
    const data = files[`assets/${a.id}`];
    if (data) await dbPut('assets', new Blob([new Uint8Array(data)], { type: a.type || 'image/png' }), a.id);
  }
  const now = Date.now();
  const rec: ProjectRecord = { ...manifest.project, id: newId(), updatedAt: now };
  await dbPut('projects', rec);
  await refreshList();
  return rec;
}
