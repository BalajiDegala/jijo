import { useEffect, useRef, useState } from 'react';
import { ArrowRight, BookOpen, Box, Check, CheckCheck, ChevronRight, Circle, CircleDot, Container, FlaskConical, FolderCode, HardDrive, Layers3, Menu, Route, SquareTerminal, UserRound, X } from 'lucide-react';
import { Activity } from './Activity';
import { Topology } from './Topology';
import { FieldNotes, ProjectFiles } from './Resources';
import { milestones } from './lab/content';
import type { Stage } from './lab/journey';
import { useProject } from './useProject';

const pages = [
  { id: 'lab', name: 'Lab workspace', icon: FlaskConical },
  { id: 'notes', name: 'Field notes', icon: BookOpen },
  { id: 'files', name: 'Project files', icon: FolderCode },
] as const;
type Page = (typeof pages)[number]['id'];
const readPage = (): Page => pages.find(p => p.id === window.location.hash.slice(1))?.id ?? 'lab';
const finished: Record<Stage, number> = { predict: 0, repair: 1, explain: 2, transfer: 3, complete: 4 };
const objectives = ['Record a prediction', 'Get a verified HTTP response', 'Connect the evidence', 'Repair a different service'];

export default function App() {
  const workspace = useProject();
  const { session, act, busy, status, notice, setNotice } = workspace;
  const [page, setPage] = useState<Page>(readPage);
  const [menu, setMenu] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const navigate = () => { setPage(readPage()); setMenu(false); requestAnimationFrame(() => heading.current?.focus()); };
    window.addEventListener('hashchange', navigate);
    return () => window.removeEventListener('hashchange', navigate);
  }, []);
  useEffect(() => {
    if (!menu) return;
    const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMenu(false); menuButton.current?.focus(); } };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [menu]);
  const nextPage = (id: Page) => { window.location.hash = id; };
  const count = finished[session.stage];
  const currentPage = pages.find(p => p.id === page)!;
  const title = page === 'lab' ? 'The unreachable container' : currentPage.name;
  const intro = page === 'lab' ? 'A Flask service is running inside Docker. Trace a request from your browser to the application and find out where the connection breaks.' :
    page === 'notes' ? 'Container networking concepts and the evidence from your investigation.' : 'Inspect the sample application, export a verified build, and manage your guest project.';
  return <div className="shell">
    <a href="#main" className="skip" onClick={e => { e.preventDefault(); heading.current?.focus(); }}>Skip to workspace</a>
    <aside className={'sidebar ' + (menu ? 'open' : '')}>
      <div className="brand-row"><a className="brand" href="#lab" aria-label="JIJO lab workspace"><img alt="" src="/jijo.svg"/>JIJO<span className="brand-period">.</span></a>
        <button ref={menuButton} className="mobile-toggle" aria-expanded={menu} aria-controls="side-navigation" aria-label="Toggle navigation" onClick={() => setMenu(!menu)}>{menu ? <X/> : <Menu/>}</button></div>
      <div className="side-body" id="side-navigation">
        <div className="nav-caption">Learning studio</div>
        <nav aria-label="Workspace">{pages.map(p => <a key={p.id} aria-current={page === p.id ? 'page' : undefined} href={'#' + p.id} onClick={() => setMenu(false)}><p.icon size={18}/>{p.name}{page === p.id && <ChevronRight className="nav-arrow" size={14}/>}</a>)}</nav>
        <div className="side-bottom"><div className="profile"><span><UserRound size={17}/></span><div><b>Guest workspace</b><small>Local session</small></div></div></div>
      </div>
    </aside>
    <div className="workspace"><header className="topbar"><div><Layers3 size={16}/>Studio<ChevronRight size={12}/><b>{currentPage.name}</b></div><span className="storage"><HardDrive size={14}/>{status}</span></header>
    <main id="main"><div className="intro"><div className="micro"><Container size={16}/>Docker networking</div>
      <h1 ref={heading} tabIndex={-1}>{title}</h1><p>{intro}</p>
    </div>
    {notice && <div className="notice" role="alert"><span>{notice}</span><button className="quiet" onClick={() => setNotice('')} aria-label="Dismiss message"><X size={15}/></button></div>}
    {page === 'lab' ? <div className="lab-layout"><div className="work-column">
      <Topology session={session} key={session.lab.name}/>
      <Activity session={session} act={act} busy={busy} key={session.stage} showFiles={() => nextPage('files')}/>
    </div><aside className="right-column">
      <section className="card journey"><div className="section-heading"><span className="icon-tile"><Route size={18}/></span><h2>Lab journey</h2></div>
        <div className="meter-label"><span>Your progress</span><b>{count} / 4</b></div><div className="meter" aria-hidden="true">{milestones.map((m, i) => <i className={i < count ? 'done' : ''} key={m}/>)}</div>
        <ol>{milestones.map((m, i) => <li className={i === count ? 'current' : i < count ? 'done' : ''} key={m} aria-current={i === count ? 'step' : undefined}>
          <span className="step-icon">{i < count ? <Check size={12}/> : i === count ? <CircleDot size={18}/> : <Circle size={13}/>}</span><div><strong>{m}</strong><small>{objectives[i]}</small></div></li>)}</ol>
      </section>
      <section className="brief card"><div className="micro"><Box size={15}/>Lab brief</div><p>Make <code>localhost:{session.lab.host}</code> reach the <strong>{session.lab.name}</strong> service through a published TCP port.</p>
        <a href="#notes">Open field notes<ArrowRight size={15}/></a></section>
      <div className="engine-note"><SquareTerminal size={14}/>Powered by DockerLab</div>
    </aside></div> : page === 'notes' ? <FieldNotes project={workspace.project}/> : <ProjectFiles workspace={workspace} goLab={() => nextPage('lab')}/>}
    <footer><span>JIJO Learning Studio</span><span><CheckCheck size={14}/>Browser-based simulation</span></footer></main></div>
  </div>;
}
