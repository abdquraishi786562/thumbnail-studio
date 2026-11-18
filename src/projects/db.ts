/**
 * Tiny IndexedDB wrapper: projects (design data + preview) and assets (image files).
 * Everything stays on this device.
 */

const DB_NAME = 'thumbnail-studio';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('projects')) db.createObjectStore('projects', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('assets')) db.createObjectStore('assets');
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => {
        dbPromise = null;
        reject(req.error);
      };
    });
  }
  return dbPromise;
}

function done<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function store(name: 'projects' | 'assets', mode: IDBTransactionMode): Promise<IDBObjectStore> {
  const db = await open();
  return db.transaction(name, mode).objectStore(name);
}

export async function dbGet<T>(name: 'projects' | 'assets', key: string): Promise<T | undefined> {
  return done((await store(name, 'readonly')).get(key)) as Promise<T | undefined>;
}

export async function dbPut(name: 'projects', value: unknown): Promise<void>;
export async function dbPut(name: 'assets', value: Blob, key: string): Promise<void>;
export async function dbPut(name: 'projects' | 'assets', value: unknown, key?: string): Promise<void> {
  const s = await store(name, 'readwrite');
  await done(key === undefined ? s.put(value) : s.put(value, key));
}

export async function dbDelete(name: 'projects' | 'assets', key: string): Promise<void> {
  await done((await store(name, 'readwrite')).delete(key));
}

export async function dbAll<T>(name: 'projects'): Promise<T[]> {
  return done((await store(name, 'readonly')).getAll()) as Promise<T[]>;
}

export async function dbKeys(name: 'assets'): Promise<string[]> {
  return (await done((await store(name, 'readonly')).getAllKeys())).map(String);
}

/** Ask the browser not to clear our data when space runs low. */
export async function persistStorage(): Promise<void> {
  try {
    if (navigator.storage?.persisted && !(await navigator.storage.persisted())) await navigator.storage.persist();
  } catch {
    /* not supported */
  }
}

export async function storageUsed(): Promise<number | null> {
  try {
    return (await navigator.storage.estimate()).usage ?? null;
  } catch {
    return null;
  }
}
