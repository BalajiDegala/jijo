import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Cable, Code2, GitFork, Maximize2, Minimize2, PanelRight, Plus, Search, Settings2, X, type LucideIcon } from 'lucide-react';
import { GraphCanvas, type CanvasItem, type CanvasLink, type ShowMenu } from './GraphCanvas';

export interface PaletteEntry { id: string; name: string; description: string; icon: LucideIcon; disabled?: boolean }
interface Props {
  title: string; items: CanvasItem[]; links: CanvasLink[]; selected: string; palette: PaletteEntry[];
  select: (id: string) => void; add: (type: string) => void; move?: (id: string, x: number, y: number) => void;
  valid: (from: string, to: string) => boolean; connect: (from: string, to: string) => void;
  properties: ReactNode; alternateName: string; alternate: ReactNode; showCode: boolean; setShowCode: (value: boolean) => void;
  message?: string;
}
export function GraphWorkbench(props: Props) {
  const { title, items, links, selected, palette, valid, showCode, setShowCode } = props;
  const root = useRef<HTMLDivElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const picker = useRef<HTMLDialogElement>(null);
  const contextButton = useRef<HTMLButtonElement>(null);
  const pointerNode = useRef(false);
  const fullButton = useRef<HTMLButtonElement>(null);
  const [query, setQuery] = useState('');
  const [source, setSource] = useState('');
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [full, setFull] = useState(false);
  const [properties, setProperties] = useState(() => !matchMedia('(max-width: 760px)').matches);
  const [feedback, setFeedback] = useState('');
  const sourceItem = items.find(n => n.id === source);
  const menuItem = items.find(n => n.id === menu?.id);
  const targets = useMemo(() => new Set(source ? items.filter(n => valid(source,n.id)).map(n => n.id) : []), [items, source, valid]);
  const focusCanvas = () => requestAnimationFrame(() => surface.current?.focus({ preventScroll: true }));
  const openMenu: ShowMenu = useCallback((id,x,y) => {
    if (source) return;
    const bounds = surface.current?.getBoundingClientRect();
    if (!bounds) return;
    setMenu({ id, x: Math.max(5, Math.min(x - bounds.left, bounds.width - 170)), y: Math.max(5, Math.min(y - bounds.top, bounds.height - 112)) });
  }, [source]);
  useEffect(() => { if (menu) (contextButton.current?.parentElement?.querySelector<HTMLButtonElement>('button:not(:disabled)'))?.focus(); }, [menu]);
  function choose(id: string) {
    setMenu(null);
    if (source) {
      if (valid(source,id)) {
        props.connect(source,id); props.select(source); setSource(''); setProperties(true);
        setFeedback('Connected ' + sourceItem?.name + ' to ' + items.find(n => n.id === id)?.name + '.');
      }
      return;
    }
    props.select(id); setProperties(true);
  }
  function openPicker() {
    if (!picker.current || picker.current.open) return;
    setMenu(null); setSource(''); setQuery(''); picker.current.showModal();
  }
  async function toggleFull() {
    if (!root.current) return;
    if (full) {
      setFull(false);
      if (document.fullscreenElement === root.current) await document.exitFullscreen().catch(() => {});
      fullButton.current?.focus();
    } else {
      setFull(true);
      try { await root.current.requestFullscreen?.(); } catch { /* The viewport layout also works in embedded browsers. */ }
      if (!showCode) focusCanvas();
    }
  }
  useEffect(() => {
    const sync = () => setFull(document.fullscreenElement === root.current);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);
  useEffect(() => {
    if (!full || !root.current) return;
    const hidden: HTMLElement[] = [];
    for (let el: HTMLElement | null = root.current; el && el !== document.body; el = el.parentElement) {
      for (const sibling of Array.from(el.parentElement?.children ?? [])) {
        if (sibling !== el && sibling instanceof HTMLElement && !sibling.inert) { sibling.inert = true; hidden.push(sibling); }
      }
    }
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { hidden.forEach(el => { el.inert = false; }); document.body.style.overflow = overflow; };
  }, [full]);
  useEffect(() => {
    function key(e: KeyboardEvent) {
      if (e.isComposing || e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target as HTMLElement;
      if (e.key === 'Escape') {
        if (picker.current?.open) { e.preventDefault(); picker.current.close(); }
        setMenu(null); setSource('');
        if (full) { e.preventDefault(); void toggleFull(); }
        else if (menu || source) focusCanvas();
        return;
      }
      if (picker.current?.open || el.closest('input, textarea, select, [contenteditable=true]')) return;
      if (e.key.toLowerCase() === 'f' && !e.repeat) { e.preventDefault(); void toggleFull(); return; }
      if (showCode) return;
      const tile = el.closest<HTMLElement>('.react-flow__node');
      if (tile && (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10'))) {
        const at = tile.getBoundingClientRect();
        e.preventDefault(); openMenu(tile.dataset.id!,at.left + 10,at.top + 10); return;
      }
      if (tile && el === tile && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); choose(tile.dataset.id!); return; }
      if (e.key === 'Tab' && !e.shiftKey && !source && !menu && (el === document.body || el.tagName === 'H1' || el === surface.current || (tile && pointerNode.current))) {
        e.preventDefault(); pointerNode.current = false; openPicker();
      }
    }
    document.addEventListener('keydown',key);
    return () => document.removeEventListener('keydown',key);
  });
  const filtered = palette.filter(n => (n.name + ' ' + n.description).toLowerCase().includes(query.trim().toLowerCase()));
  function changeView(code: boolean) { setSource(''); setMenu(null); setFeedback(''); setShowCode(code); }
  return <div ref={root} className={'graph-workbench' + (full ? ' expanded' : '') + (properties ? ' with-properties' : '')}
    onPointerDownCapture={e => { pointerNode.current = !!(e.target as Element).closest('.react-flow__node'); if (menu && !(e.target as Element).closest('.node-menu')) setMenu(null); }}>
    <div className="workbench-toolbar">
      <div className="workbench-tabs"><button aria-pressed={!showCode} onClick={() => changeView(false)}><GitFork size={15}/>Canvas</button>
        <button aria-pressed={showCode} onClick={() => changeView(true)}><Code2 size={15}/>{props.alternateName}</button></div>
      <div className="workbench-tools">{!showCode && <button className="picker-trigger" onClick={openPicker} aria-haspopup="dialog"><Plus size={15}/>Add node <kbd>Tab</kbd></button>}
        <button aria-label="Toggle properties" title="Properties" aria-pressed={properties} onClick={() => setProperties(!properties)}><PanelRight size={17}/></button>
        <button ref={fullButton} aria-label={full ? 'Exit full screen' : 'Full screen'} title={full ? 'Exit full screen (Esc)' : 'Full screen (F)'} onClick={() => void toggleFull()}>{full ? <Minimize2 size={16}/> : <Maximize2 size={16}/>}<kbd>{full ? 'Esc' : 'F'}</kbd></button>
      </div>
    </div>
    <div className="workbench-body">
      <section className="workbench-board" aria-label={title}>
        {showCode ? props.alternate : <div ref={surface} tabIndex={0} aria-label={title + ' canvas. Tab opens the node picker.'} className="pg-canvas" onPointerDown={e => {
          if ((e.target as Element).classList.contains('react-flow__pane')) surface.current?.focus({ preventScroll: true });
        }}>
          <GraphCanvas title={title} items={items} links={links} selected={selected} select={choose} source={source} targets={targets}
            menu={openMenu} connect={(a,b) => { if (valid(a,b)) { props.connect(a,b); props.select(a); setFeedback('Connection added.'); } }} valid={valid} move={props.move}/>
          {!items.length && <button className="empty-add" onClick={openPicker}><Plus size={16}/>Add your first node</button>}
          {menu && menuItem && <div className="node-menu" role="group" aria-label={'Actions for ' + menuItem.name} style={{ left: menu.x, top: menu.y }}>
            <strong>{menuItem.name}</strong><button ref={contextButton} disabled={!items.some(n => valid(menu.id,n.id))} onClick={() => {
              props.select(menu.id); setSource(menu.id); setFeedback(''); setMenu(null); focusCanvas();
              if (matchMedia('(max-width: 760px)').matches) setProperties(false);
            }}><Cable size={15}/>Connect</button>
            <button onClick={() => choose(menu.id)}><Settings2 size={15}/>Properties</button></div>}
          {sourceItem && <div className="connect-banner" role="status"><Cable size={15}/>Connecting from {sourceItem.name}. Select a highlighted node.
            <button aria-label="Cancel connection" onClick={() => { setSource(''); focusCanvas(); }}><X size={15}/></button></div>}
        </div>}
        <div className="workbench-status"><span>{items.length} nodes · Simulation</span>
          <span aria-live="polite">{props.message || feedback || (showCode ? props.alternateName : 'Right-click a node for actions')}</span></div>
      </section>
      {properties && <aside className="pg-inspector graph-properties" aria-label="Node properties"><div className="properties-head"><h2>Properties</h2><button aria-label="Hide properties" onClick={() => setProperties(false)}><X size={16}/></button></div>{props.properties}</aside>}
    </div>
    <dialog ref={picker} className="node-picker" aria-label="Add a node" onClose={() => root.current?.querySelector<HTMLButtonElement>('.picker-trigger')?.focus()} onClick={e => { if (e.target === picker.current) picker.current.close(); }}>
      <div className="picker-inner"><header><h2>Add a node</h2><button aria-label="Close node picker" onClick={() => picker.current?.close()}><X size={17}/></button></header>
        <label className="picker-search"><Search size={16}/><input autoFocus aria-label="Find a node" placeholder="Find a node…" value={query} onChange={e => setQuery(e.target.value)}/></label>
        <div className="picker-options">{filtered.map(n => <button key={n.id} aria-label={'Add ' + n.name} disabled={n.disabled} onClick={() => {
          props.add(n.id); setFeedback('Added ' + n.name + '.'); picker.current?.close();
        }}><n.icon size={20}/><span><strong>{n.name}</strong><small>{n.description}</small></span><Plus size={14}/></button>)}
        {!filtered.length && <p>No matching nodes.</p>}</div></div></dialog>
  </div>;
}
