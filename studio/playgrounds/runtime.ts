import { useEffect, useSyncExternalStore } from 'react';
import { Workspace } from '../../dockerlab/src/store/workspace';
import { SCENARIOS } from '../../dockerlab/src/engine/ScenarioEngine';
import { interviewCases, runtimeTemplates } from '../lab/content';
import { Conflict, load, openDatabase, save } from '../storage';

export interface RuntimeProject {
  id: string;
  kind: 'free' | 'template' | 'scenario';
  source: string;
  name: string;
  commands: string[];
  positions: Record<string,{x:number;y:number}>;
  verified: boolean;
}
interface RuntimeBook { version: 1; active: string; caseId?: string; projects: RuntimeProject[] }
const home: RuntimeProject = { id:'home', kind:'free', source:'', name:'My playground', commands:[], positions:{}, verified:false };
const key = 'docker-terminal-v1';
let state = { book: { version:1, active:home.id, projects:[home] } as RuntimeBook, ready:false, busy:false, message:'', local:false };
let db: IDBDatabase | undefined;
let revision = 0;
let opening: Promise<void> | undefined;
const listeners = new Set<() => void>();
function publish(patch: Partial<typeof state>) {
  state = {...state,...patch};
  listeners.forEach(fn => fn());
}
const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
function readBook(book: RuntimeBook) {
  if (book?.version !== 1 || !Array.isArray(book.projects) || !book.projects.length || book.projects.length > 100 ||
    !book.projects.some(p => p.id === book.active) || !book.projects.some(p => p.id === home.id) ||
    book.projects.some(p => typeof p.id !== 'string' || typeof p.name !== 'string' || !p.positions ||
      !Array.isArray(p.commands) || p.commands.length > 1000 || p.commands.some(c => typeof c !== 'string' || c.length > 600) ||
      !(p.kind === 'free' || (p.kind === 'template' && runtimeTemplates.some(t => t.id === p.source)) ||
        (p.kind === 'scenario' && interviewCases.some(s => s.id === p.source))))) throw new Error('Unreadable terminal workspace');
  return book;
}
async function open() {
  try {
    db = await openDatabase();
    const row = await load<RuntimeBook>(db,key);
    if (row) { const book = readBook(row.project); revision = row.revision; publish({book}); }
  } catch {
    db = undefined; publish({local:true,message:'Saved projects could not be opened. This session stays in this tab.'});
  } finally { publish({ready:true}); }
}
export function useRuntimeBook() {
  const value = useSyncExternalStore(subscribe, () => state);
  useEffect(() => { opening ??= open(); }, []);
  return value;
}
async function change(update: (book: RuntimeBook) => RuntimeBook) {
  if (!state.ready || state.busy) return false;
  publish({busy:true});
  try {
    const book = update(state.book);
    if (db) {
      try { revision = await save(db,revision,book,key); }
      catch (error) {
        if (error instanceof Conflict) {
          const latest = await load<RuntimeBook>(db,key);
          if (!latest) throw new Error('Could not reopen the latest project.');
          revision = latest.revision;
          publish({book:readBook(latest.project),message:'Another tab saved first. Its latest project is open. Repeat your action.'});
          return false;
        }
        db = undefined;
        publish({local:true});
      }
    }
    publish({book,message:db ? '' : 'Session only. Browser storage is unavailable.'});
    return true;
  } catch (err) { publish({message:(err as Error).message}); return false; }
  finally { publish({busy:false}); }
}
export function setActive(id: string) {
  return change(book => ({...book,active:id}));
}
export function startRuntime(kind: 'template'|'scenario', source: string, title: string) {
  return change(book => {
    const previous = kind === 'scenario' && book.projects.find(p => p.kind === kind && p.source === source);
    if (previous) return {...book,caseId:previous.id};
    if (book.projects.length >= 100) throw new Error('Project limit reached. Remove an unused template copy to continue.');
    const count = book.projects.filter(p => p.kind === kind && p.source === source).length;
    const project: RuntimeProject = {...home,kind,source,name:title + (count ? ' · ' + (count+1) : ''),id:crypto.randomUUID(),commands:[],positions:{}};
    return {...book,...(kind==='scenario'?{caseId:project.id}:{active:project.id}),projects:[...book.projects,project]};
  });
}
export function updateRuntime(id: string, update: (p: RuntimeProject) => RuntimeProject) {
  return change(book => ({...book,projects:book.projects.map(p => p.id === id ? update(p) : p)}));
}
export function removeCopy(id: string) {
  return change(book => ({...book,active:home.id,projects:book.projects.filter(p => p.id !== id || p.kind !== 'template')}));
}
export function runtimeSession(project: RuntimeProject) {
  const ws = new Workspace(false,true);
  if (project.kind === 'template') {
    const template = runtimeTemplates.find(t => t.id === project.source)!;
    ws.update({compose:template.example.yaml});
    const up = ws.run('docker compose up -d');
    if (!up.success) throw new Error(up.output);
  } else if (project.kind === 'scenario') {
    const scenario = SCENARIOS.find(s => s.id === project.source)!;
    scenario.setup(ws.engine);
  }
  for (const command of project.commands) ws.run(command);
  return ws;
}
