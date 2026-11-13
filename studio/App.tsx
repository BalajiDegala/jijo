import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowRight, Box, Check, CheckCheck, ChevronRight, Circle, CircleDot, HardDrive, PanelLeftClose, PanelLeftOpen, Route, SquareTerminal, Workflow, FileCode2, X } from 'lucide-react';
import { Activity } from './Activity';
import { Topology } from './Topology';
import { FieldNotes, ProjectFiles } from './Resources';
import { Brand, ModuleLibrary } from './ModuleLibrary';
import { pages, readPage, StudioNavigation, type Page } from './StudioNavigation';
import { milestones } from './lab/content';
import type { Stage } from './lab/journey';
import { useProject } from './useProject';

const Playgrounds = lazy(() => import('./playgrounds/Playgrounds'));
const DockerStudio = lazy(() => import('./playgrounds/DockerStudio'));
const finished: Record<Stage, number> = { predict: 0, repair: 1, explain: 2, transfer: 3, complete: 4 };
const objectives = ['Record a prediction', 'Get a verified HTTP response', 'Connect the evidence', 'Repair a different service'];
const sidebarPreference = 'jijo.sidebar';
function readPreference() {
  try {
    const saved = localStorage.getItem(sidebarPreference);
    return saved === 'open' ? true : saved === 'closed' ? false : null;
  } catch { return null; }
}

export default function App() {
  const workspace = useProject();
  const { session, act, busy, status, notice, setNotice } = workspace;
  const [page, setPage] = useState<Page>(readPage);
  const [preference, setPreference] = useState(readPreference);
  const [mobile, setMobile] = useState(() => matchMedia('(max-width: 650px)').matches);
  const [mobileOpen, setMobileOpen] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const playground = page === 'graph' || page === 'dockerfile';
  const runtime = page === 'docker' || page === 'templates' || page === 'scenarios' || page === 'investigation';
  const library = page === 'modules';
  const open = !library && (mobile ? mobileOpen : (preference ?? !playground));
  const title = page === 'lab' ? 'The unreachable container' : pages[page];

  useEffect(() => {
    const navigate = () => {
      setPage(readPage());
      setMobileOpen(false);
      requestAnimationFrame(() => { window.scrollTo(0, 0); heading.current?.focus({ preventScroll: true }); });
    };
    const media = matchMedia('(max-width: 650px)');
    const resize = () => { setMobile(media.matches); setMobileOpen(false); };
    window.addEventListener('hashchange', navigate);
    media.addEventListener('change', resize);
    return () => { window.removeEventListener('hashchange', navigate); media.removeEventListener('change', resize); };
  }, []);
  useEffect(() => { document.title = title + ' · JIJO Learning Studio'; }, [title]);
  useEffect(() => {
    if (!mobile || !mobileOpen) return;
    const escape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setMobileOpen(false); menuButton.current?.focus(); }
    };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [mobile, mobileOpen]);
  function toggleSidebar() {
    if (mobile) {
      setMobileOpen(!open);
      if (!open) requestAnimationFrame(() => document.querySelector<HTMLAnchorElement>('#side-navigation .all-modules')?.focus());
    } else {
      setPreference(!open);
      try { localStorage.setItem(sidebarPreference, open ? 'closed' : 'open'); } catch { /* The toggle still works for this session. */ }
    }
  }
  const nextPage = (id: Page) => { window.location.hash = id; };
  const count = finished[session.stage];
  const intro = page === 'lab' ? 'Trace a browser request to a Flask service and find where the connection breaks.' :
    page === 'notes' ? 'Container networking concepts and evidence from your investigation.' :
    page === 'files' ? 'Inspect the sample application, export a verified build and manage your guest project.' :
    '';
  return <div className={'shell' + (open ? '' : ' nav-closed') + (library ? ' library-shell' : '')}>
    <a href="#main" className="skip" onClick={e => { e.preventDefault(); heading.current?.focus(); }}>Skip to workspace</a>
    {!library && <StudioNavigation page={page} open={open} onNavigate={() => { setMobileOpen(false); if (mobile) menuButton.current?.focus(); }}/>}
    <div className="workspace">
      {library ? <header className="directory-bar"><Brand/><span>Learning studio</span></header> :
        <header className="topbar"><div>
          <button ref={menuButton} type="button" className="sidebar-toggle" aria-label={mobile ? 'Toggle navigation' : open ? 'Close sidebar' : 'Open sidebar'}
            title={open ? 'Close sidebar' : 'Open sidebar'} aria-expanded={open} aria-controls="side-navigation" onClick={toggleSidebar}>
            {open ? <PanelLeftClose size={19}/> : <PanelLeftOpen size={19}/>}
          </button>
          {!open && <img className="crumb-mark" src="/jijo.svg" alt=""/>}<a href="#modules">Modules</a><ChevronRight size={12}/>
          {page === 'docker' ? <b>Docker</b> : <><a href="#docker">Docker</a><ChevronRight size={12}/><b>{pages[page]}</b></>}
        </div>{!playground && <span className="storage"><HardDrive size={14}/>{status}</span>}</header>}
      <main id="main" className={library ? 'library-main' : playground || runtime ? 'playground-main' : ''}>
        <div className="intro">{playground && <span className={'page-icon ' + page} aria-hidden="true">{page === 'graph' ? <Workflow size={20}/> : <FileCode2 size={20}/>}</span>}<h1 ref={heading} tabIndex={-1}>{title}</h1>{intro && <p>{intro}</p>}</div>
        {notice && !playground && !library && <div className="notice" role="alert"><span>{notice}</span><button className="quiet" onClick={() => setNotice('')} aria-label="Dismiss message"><X size={15}/></button></div>}
    {library ? <ModuleLibrary/> : runtime ? <Suspense fallback={<p role="status">Opening Docker workspace…</p>}><DockerStudio page={page} completed={count}/></Suspense> : page === 'lab' ? <div className="lab-layout"><div className="work-column">
      <Topology session={session} act={act} busy={busy} key={session.lab.name}/>
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
    </aside></div> : playground ? <Suspense fallback={<p role="status">Opening playground…</p>}><Playgrounds page={page}/></Suspense> :
      page === 'notes' ? <FieldNotes project={workspace.project}/> : <ProjectFiles workspace={workspace} goLab={() => nextPage('lab')}/>}
    {!library && <footer><span>JIJO Learning Studio</span><span><CheckCheck size={14}/>Browser-based simulation</span></footer>}</main></div>
  </div>;
}
