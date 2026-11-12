import { useCallback, useMemo, useState } from 'react';
import { CheckCircle2, Download, FolderDown, Trash2, TriangleAlert, X } from 'lucide-react';
import { download } from '../download';
import { archive } from '../lab/artifacts';
import { icons } from './GraphCanvas';
import { GraphWorkbench } from './GraphWorkbench';
import { compileGraph, connect, connectionProblem, imageFor, isService, kinds, labels, listener, makeNode, maxNodes, relation, removeNode, stackFiles, type Graph, type Kind, type Resource } from './graph';
import { changeProject } from './workspace';

const descriptions: Record<Kind,string> = { app: 'Application with a Dockerfile', nginx: 'Web server', postgres: 'Relational database', redis: 'In-memory cache', network: 'Shared bridge network', volume: 'Persistent storage' };
type Props = { graph: Graph; selected: string; select: (id: string) => void; editRecipe: (r: Resource) => void };
export function ResourceLab({ graph, selected, select, editRecipe }: Props) {
  const [showCode, setShowCode] = useState(false);
  const [message, setMessage] = useState('');
  const result = useMemo(() => compileGraph(graph), [graph]);
  const node = graph.nodes.find(n => n.id === selected) ?? graph.nodes[0];
  const update = (next: Graph) => changeProject(p => ({ ...p, graph: next }));
  const patch = (id: string, fields: Partial<Resource>) => update({ ...graph, nodes: graph.nodes.map(n => n.id === id ? { ...n, ...fields } : n) });
  const valid = useCallback((a: string,b: string) => !connectionProblem(graph,a,b), [graph]);
  const items = useMemo(() => graph.nodes.map(r => ({ ...r, color: r.kind, kind: r.recipe?.framework ?? labels[r.kind], icon: icons[r.kind], source: isService(r.kind),
    detail: isService(r.kind) ? (r.host ? r.host + ' → ' + listener(r) : 'Internal · ' + listener(r)) : descriptions[r.kind] })), [graph.nodes]);
  const links = useMemo(() => graph.links.map(e => {
    const kind = graph.nodes.find(n => n.id === e.to)!.kind;
    return { ...e, label: relation(kind), color: kind === 'network' ? '#ae99d8' : kind === 'volume' ? '#ccac61' : '#96bc83' };
  }), [graph]);
  function add(id: string) {
    const kind = kinds.find(k => k === id);
    if (!kind || graph.nodes.length >= maxNodes) return;
    const added = makeNode(graph,kind);
    update({ ...graph, nodes: [...graph.nodes, added] }); select(added.id); setMessage('');
  }
  async function saveFile(bundle: boolean) {
    try {
      if (result.issues.length) return;
      download(bundle ? archive(stackFiles(result)) : new Blob([result.yaml], { type: 'application/yaml' }), bundle ? 'jijo-stack.zip' : 'compose.yaml');
    } catch (e) { setMessage((e as Error).message); }
  }

  const outgoing = graph.links.filter(e => e.from === node?.id);
  return <>
    <GraphWorkbench title="Compose resource graph" items={items} links={links} selected={node?.id ?? ''} select={select}
      palette={kinds.map(k => ({ id: k, name: labels[k], icon: icons[k], description: descriptions[k], disabled: graph.nodes.length >= maxNodes }))}
      add={add} valid={valid} connect={(a,b) => { update(connect(graph,a,b)); setMessage(''); }} move={(id,x,y) => patch(id,{ x,y })}
      showCode={showCode} setShowCode={setShowCode} message={message} alternateName="Compose YAML"
      alternate={<pre aria-label="Generated Compose YAML" className="pg-yaml">{result.yaml}</pre>}
      properties={<>
        {node ? <><label>Selected resource<select value={node.id} onChange={e => select(e.target.value)}>{graph.nodes.map(r => <option key={r.id} value={r.id}>{r.name || '(unnamed)'} · {labels[r.kind]}</option>)}</select></label>
          <label>Resource name<input maxLength={48} value={node.name} onChange={e => patch(node.id, { name: e.target.value })}/></label>
          {isService(node.kind) && <><div className="pg-fact"><span>{node.recipe ? 'Framework' : 'Image'}</span><code>{node.recipe?.framework ?? imageFor[node.kind as keyof typeof imageFor]}</code></div>
            <div className="pg-ports"><label>Host port<input value={node.host} maxLength={5} inputMode="numeric" placeholder="Internal" onChange={e => patch(node.id, { host: e.target.value })}/></label>
              <div className="pg-port-readout">Container port<code>{listener(node)}</code></div></div>
            {node.recipe && <button className="inline" onClick={() => editRecipe(node)}>Edit service Dockerfile</button>}
          </>}
          {outgoing.map(e => {
            const other = graph.nodes.find(n => n.id === e.to)!;
            return <div className="pg-link" key={e.to}><div><span>{relation(other.kind)} <b>{other.name}</b></span>
              <button aria-label={'Disconnect ' + other.name} onClick={() => update({ ...graph, links: graph.links.filter(l => l !== e) })}><X size={14}/></button></div>
              {other.kind === 'volume' && <label>Mount path<input maxLength={100} value={e.mount ?? ''} onChange={event => update({ ...graph, links: graph.links.map(l => l === e ? { ...l, mount: event.target.value } : l) })}/></label>}</div>;
          })}
          <button className="quiet pg-remove" onClick={() => { update(removeNode(graph, node.id)); select(''); setMessage('Removed ' + node.name + ' and its connections.'); }}><Trash2 size={14}/>Remove resource</button>
        </> : <p>Select a resource to configure its properties.</p>}
      </>}/>
    <section className="card pg-validation"><div><div className="micro">Stack validation</div><h2>{result.issues.length ? <><TriangleAlert size={20}/>{result.issues.length} {result.issues.length === 1 ? 'issue' : 'issues'} to resolve</> : <><CheckCircle2 size={20}/>Ready to export</>}</h2>
      {result.issues.length ? <ul>{result.issues.map(i => <li key={i}>{i}</li>)}</ul> : <p>Compose structure, port bindings, dependencies and supplied build contexts passed the workspace checks.</p>}
      {graph.nodes.some(n => n.kind === 'postgres') && <small>Set POSTGRES_PASSWORD in your local environment before running Compose.</small>}</div>
      <div className="actions"><button className="secondary" disabled={!!result.issues.length} onClick={() => void saveFile(false)}><Download size={15}/>Compose file</button>
      <button className="primary" disabled={!!result.issues.length} onClick={() => void saveFile(true)}><FolderDown size={15}/>Project ZIP</button></div>
    </section>
  </>;
}
