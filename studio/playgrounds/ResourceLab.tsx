import { useMemo, useState } from 'react';
import { Cable, CheckCircle2, Code2, Download, FolderDown, GitFork, Plus, Trash2, TriangleAlert, X } from 'lucide-react';
import { download } from '../download';
import { archive } from '../lab/artifacts';
import { GraphCanvas, icons } from './GraphCanvas';
import { compileGraph, connect, imageFor, isService, kinds, labels, listener, makeNode, maxNodes, relation, removeNode, stackFiles, type Graph, type Kind, type Resource } from './graph';
import { changeProject } from './workspace';

type Props = { graph: Graph; selected: string; select: (id: string) => void; editRecipe: (r: Resource) => void };
export function ResourceLab({ graph, selected, select, editRecipe }: Props) {
  const [mode, setMode] = useState<'canvas' | 'yaml'>('canvas');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('');
  const result = useMemo(() => compileGraph(graph), [graph]);
  const node = graph.nodes.find(n => n.id === selected) ?? graph.nodes[0];
  const update = (next: Graph) => changeProject(p => ({ ...p, graph: next }));
  const patch = (id: string, fields: Partial<Resource>) => update({ ...graph, nodes: graph.nodes.map(n => n.id === id ? { ...n, ...fields } : n) });
  function pick(id: string) { select(id); setTarget(''); }
  function add(kind: Kind) {
    if (graph.nodes.length >= maxNodes) { setMessage('The canvas supports 32 resources. Remove one before adding another.'); return; }
    const added = makeNode(graph, kind);
    update({ ...graph, nodes: [...graph.nodes, added] }); pick(added.id); setMode('canvas'); setMessage('Added ' + added.name + '.');
  }
  function wire(a: string, b: string) {
    try { update(connect(graph, a, b)); setTarget(''); setMessage('Connection added.'); }
    catch (e) { setMessage((e as Error).message); }
  }
  async function saveFile(bundle: boolean) {
    try {
      if (result.issues.length) return;
      download(bundle ? archive(stackFiles(result)) : new Blob([result.yaml], { type: 'application/yaml' }), bundle ? 'jijo-stack.zip' : 'compose.yaml');
    } catch (e) { setMessage((e as Error).message); }
  }
  const targets = graph.nodes.filter(n => n.id !== node?.id && !graph.links.some(e => e.from === node?.id && e.to === n.id));
  const outgoing = graph.links.filter(e => e.from === node?.id);
  return <>
    <div className="pg-palette"><strong>Add resource</strong><div>{kinds.map(k => {
      const Icon = icons[k]; return <button key={k} className={'pg-add ' + k} onClick={() => add(k)} aria-label={'Add ' + labels[k]}><Icon size={15}/>{labels[k]}<Plus size={12}/></button>;
    })}</div></div>
    <div className="pg-layout">
      <section className="pg-board"><header className="pg-board-head"><div className="pg-mode"><button aria-pressed={mode === 'canvas'} onClick={() => setMode('canvas')}><GitFork size={15}/>Canvas</button><button aria-pressed={mode === 'yaml'} onClick={() => setMode('yaml')}><Code2 size={15}/>Compose YAML</button></div><small>{graph.nodes.length} resources</small></header>
        {mode === 'canvas' ? <div className="pg-canvas"><GraphCanvas graph={graph} selected={node?.id ?? ''} select={pick} connect={wire} move={(id, x, y) => patch(id, { x, y })}/>
          {!graph.nodes.length && <p className="pg-empty">Choose a resource above to start a stack.</p>}</div> :
          <pre aria-label="Generated Compose YAML" className="pg-yaml">{result.yaml}</pre>}
        <div className="pg-canvas-help">{mode === 'canvas' ? 'Drag nodes to arrange. Connect a right handle to a left handle, or use the inspector.' : 'Generated from the current graph. Changes to resources and connections update this file.'}</div>
      </section>
      <section className="card pg-inspector"><div className="micro"><GitFork size={14}/>Inspector</div>
        {node ? <><label>Selected resource<select value={node.id} onChange={e => pick(e.target.value)}>{graph.nodes.map(r => <option key={r.id} value={r.id}>{r.name || '(unnamed)'} · {labels[r.kind]}</option>)}</select></label>
          <label>Resource name<input maxLength={48} value={node.name} onChange={e => patch(node.id, { name: e.target.value })}/></label>
          {isService(node.kind) && <><div className="pg-fact"><span>{node.recipe ? 'Framework' : 'Image'}</span><code>{node.recipe?.framework ?? imageFor[node.kind as keyof typeof imageFor]}</code></div>
            <div className="pg-ports"><label>Host port<input value={node.host} maxLength={5} inputMode="numeric" placeholder="Internal" onChange={e => patch(node.id, { host: e.target.value })}/></label>
              <div className="pg-port-readout">Container port<code>{listener(node)}</code></div></div>
            {node.recipe && <button className="inline" onClick={() => editRecipe(node)}>Edit service Dockerfile</button>}
            <div className="pg-wiring"><label>Connect to<select value={target} onChange={e => setTarget(e.target.value)}><option value="">Choose a resource</option>{targets.map(t => <option key={t.id} value={t.id}>{t.name} · {relation(t.kind)}</option>)}</select></label>
            <button className="secondary" disabled={!target} onClick={() => wire(node.id, target)}><Cable size={14}/>Connect</button></div>
          </>}
          {outgoing.map(e => {
            const other = graph.nodes.find(n => n.id === e.to)!;
            return <div className="pg-link" key={e.to}><div><span>{relation(other.kind)} <b>{other.name}</b></span>
              <button aria-label={'Disconnect ' + other.name} onClick={() => update({ ...graph, links: graph.links.filter(l => l !== e) })}><X size={14}/></button></div>
              {other.kind === 'volume' && <label>Mount path<input maxLength={100} value={e.mount ?? ''} onChange={event => update({ ...graph, links: graph.links.map(l => l === e ? { ...l, mount: event.target.value } : l) })}/></label>}</div>;
          })}
          <button className="quiet pg-remove" onClick={() => { update(removeNode(graph, node.id)); pick(''); setMessage('Removed ' + node.name + ' and its connections.'); }}><Trash2 size={14}/>Remove resource</button>
        </> : <p>Select a resource to configure its ports and connections.</p>}
      </section>
    </div>
    {message && <p className="pg-message" role="status">{message}</p>}
    <section className="card pg-validation"><div><div className="micro">Stack validation</div><h2>{result.issues.length ? <><TriangleAlert size={20}/>{result.issues.length} {result.issues.length === 1 ? 'issue' : 'issues'} to resolve</> : <><CheckCircle2 size={20}/>Ready to export</>}</h2>
      {result.issues.length ? <ul>{result.issues.map(i => <li key={i}>{i}</li>)}</ul> : <p>Compose structure, port bindings, dependencies and supplied build contexts passed the workspace checks.</p>}
      {graph.nodes.some(n => n.kind === 'postgres') && <small>Set POSTGRES_PASSWORD in your local environment before running Compose.</small>}</div>
      <div className="actions"><button className="secondary" disabled={!!result.issues.length} onClick={() => void saveFile(false)}><Download size={15}/>Compose file</button>
      <button className="primary" disabled={!!result.issues.length} onClick={() => void saveFile(true)}><FolderDown size={15}/>Project ZIP</button></div>
    </section>
  </>;
}
