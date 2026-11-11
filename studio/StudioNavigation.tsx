import { ArrowLeft, BookOpen, ChevronDown, Container, FileCode2, FlaskConical, FolderCode, LayoutDashboard, Library, PanelsTopLeft, Workflow } from 'lucide-react';
import { Brand } from './ModuleLibrary';

export const pages = {
  modules: 'Learning modules',
  docker: 'Docker',
  lab: 'Lab workspace',
  graph: 'Resource playground',
  dockerfile: 'Dockerfile playground',
  notes: 'Field notes',
  files: 'Project files',
};
export type Page = keyof typeof pages;

export function readPage(): Page {
  const hash = window.location.hash.slice(1);
  return Object.hasOwn(pages, hash) ? hash as Page : 'modules';
}

export function StudioNavigation({ page, open, onNavigate }: { page: Page; open: boolean; onNavigate: () => void }) {
  const link = (id: Page, Icon: typeof BookOpen, label = pages[id]) => <a href={'#' + id} aria-current={id === page ? 'page' : undefined} onClick={onNavigate}><Icon size={16}/>{label}</a>;
  return <aside className="sidebar" id="side-navigation" hidden={!open}>
    <div className="brand-row"><Brand/></div>
    <div className="side-body">
      <a className="all-modules" href="#modules" onClick={onNavigate}><ArrowLeft size={14}/>All modules</a>
      <div className="module-nav-title"><Container size={18}/>Docker</div>
      <nav aria-label="Docker module">
        {link('docker', LayoutDashboard, 'Overview')}{link('lab', FlaskConical, 'Guided lesson')}
        <details key={'tools-' + page} open={page === 'graph' || page === 'dockerfile'}><summary><PanelsTopLeft size={16}/>Playgrounds<ChevronDown size={14}/></summary>
          {link('graph', Workflow)}{link('dockerfile', FileCode2)}</details>
        <details key={'reference-' + page} open={page === 'notes' || page === 'files'}><summary><Library size={16}/>Reference<ChevronDown size={14}/></summary>
          {link('notes', BookOpen)}{link('files', FolderCode)}</details>
      </nav>
    </div>
  </aside>;
}
