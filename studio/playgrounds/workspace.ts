import { useEffect, useSyncExternalStore } from 'react';
import { Conflict, load, openDatabase, save } from '../storage';
import { initialPlayground, readPlayground, type Playground } from './graph';

const key = 'docker-playgrounds-v1';
let state = { project: initialPlayground(), ready: false, status: 'Opening workspace', message: '', recovery: false };
let db: IDBDatabase | undefined;
let revision = 0;
let opening: Promise<void> | undefined;
let queue: Promise<void> = Promise.resolve();
let generation = 0;
const listeners = new Set<() => void>();
function publish(patch: Partial<typeof state>) {
  state = { ...state, ...patch };
  listeners.forEach(fn => fn());
}
const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
async function open() {
  try {
    db = await openDatabase();
    const stored = await load<unknown>(db, key);
    if (stored) {
      revision = stored.revision;
      try { publish({ project: readPlayground(stored.project) }); }
      catch {
        publish({ status: 'Recovery needed', recovery: true, message: 'The saved playground could not be read. You can explore the starter stack in this tab or replace the damaged save.' });
        return;
      }
    }
    publish({ status: 'Saved on this device' });
  } catch {
    db = undefined;
    publish({ status: 'Session only', message: 'Browser storage is unavailable. Download your Compose project before closing this tab.' });
  } finally { publish({ ready: true }); }
}

export function changeProject(update: (current: Playground) => Playground, replace = false) {
  if (!state.ready) return;
  const next = update(state.project);
  const blocked = state.recovery && !replace;
  publish({ project: next });
  if (!db || blocked) return;
  const epoch = generation;
  publish({ status: 'Saving…' });
  queue = queue.then(async () => {
    if (!db || epoch !== generation) return;
    try {
      revision = await save(db, revision, next, key);
      if (state.project === next) publish({ status: 'Saved on this device', recovery: false, ...(replace && { message: '' }) });
    } catch (error) {
      generation++;
      if (error instanceof Conflict) {
        publish({ ready: false });
        await openLatest();
      } else {
        db = undefined;
        publish({ status: 'Session only', message: 'Could not save the playground. The current graph and exports are available in this tab.' });
      }
    }
  });
}
async function openLatest() {
  try {
    const latest = await load<unknown>(db!, key);
    if (!latest) throw new Error('Missing record');
    revision = latest.revision;
    publish({ project: readPlayground(latest.project), ready: true, status: 'Saved on this device',
      message: 'Another tab saved first. Its workspace is open. Repeat your edit if needed.' });
  } catch {
    publish({ ready: true, recovery: true, status: 'Recovery needed', message: 'The newer workspace could not be loaded. Confirm replacement to save your version.' });
  }
}
export function usePlayground() {
  const snapshot = useSyncExternalStore(subscribe, () => state);
  useEffect(() => { opening ??= open(); }, []);
  return snapshot;
}
