import { useEffect, useMemo, useRef, useState } from 'react';
import { append, emptyProject, replay, restore } from './lab/journey';
import type { Event, Project } from './lab/journey';
import { Conflict, load, openDatabase, save } from './storage';

export function useProject() {
  const [project, setProject] = useState(emptyProject);
  const [status, setStatus] = useState('Opening project');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(true);
  const locked = useRef(true);
  const db = useRef<IDBDatabase | undefined>(undefined);
  const revision = useRef(0);
  const needsReplacement = useRef(false);
  const session = useMemo(() => replay(project), [project]);

  useEffect(() => {
    let active = true;
    let connection: IDBDatabase | undefined;
    async function open() {
      try {
        connection = await openDatabase();
        if (!active) { connection.close(); return; }
        const stored = await load(connection);
        if (!active) return;
        db.current = connection;
        if (stored) {
          revision.current = stored.revision;
          try {
            setProject(restore(stored.project));
          } catch {
            needsReplacement.current = true;
            setStatus('Recovery needed');
            setNotice('This saved project could not be read. Open Project files to import a backup or start again. Until then, changes stay in this tab.');
            return;
          }
        }
        setStatus('Saved on this device');
      } catch {
        if (!active) return;
        setStatus('Session only');
        setNotice('Local progress could not be opened. You can continue here and download a backup from Project files.');
      } finally {
        if (active) { locked.current = false; setBusy(false); }
      }
    }
    void open();
    return () => { active = false; connection?.close(); };
  }, []);

  async function update(next: Project, replace = false) {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    try {
      replay(next);
      if (db.current && (!needsReplacement.current || replace)) {
        try {
          revision.current = await save(db.current, revision.current, next);
          if (needsReplacement.current) {
            needsReplacement.current = false;
            setStatus('Saved on this device');
            setNotice('');
          }
        } catch (error) {
          if (error instanceof Conflict) {
            const latest = await load(db.current);
            if (latest) { setProject(restore(latest.project)); revision.current = latest.revision; }
            setNotice('Another tab saved first. Its latest progress is open. Repeat your action if needed.');
            return;
          }
          db.current = undefined;
          setStatus('Session only');
          setNotice('The browser could not save this change. Download a project backup before closing this tab.');
        }
      }
      setProject(next);
    } catch (error) { setNotice((error as Error).message); }
    finally { locked.current = false; setBusy(false); }
  }
  function act(event: Event) {
    try { void update(append(project, event)); }
    catch (error) { setNotice((error as Error).message); }
  }
  return { project, session, act, update, status, busy, notice, setNotice };
}
