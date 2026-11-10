import type { Project } from './lab/journey';

const store = 'projects';
const key = 'container-path';
export interface Stored { revision: number; project: Project }
export class Conflict extends Error {}

export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('jijo-studio', 1);
    request.onupgradeneeded = () => request.result.createObjectStore(store);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Close other JIJO tabs and reload to enable storage.'));
  });
}

export function load(db: IDBDatabase): Promise<Stored | undefined> {
  return new Promise((resolve, reject) => {
    const request = db.transaction(store).objectStore(store).get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function save(db: IDBDatabase, expected: number, project: Project): Promise<number> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const table = tx.objectStore(store);
    const request = table.get(key);
    let conflict = false;
    request.onsuccess = () => {
      if ((request.result?.revision ?? 0) !== expected) {
        conflict = true;
        tx.abort();
        return;
      }
      table.put({ revision: expected + 1, project }, key);
    };
    tx.oncomplete = () => resolve(expected + 1);
    tx.onabort = () => reject(conflict ? new Conflict() : tx.error);
    tx.onerror = () => reject(tx.error);
  });
}
