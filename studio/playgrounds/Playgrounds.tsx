import { useState } from 'react';
import { HardDrive } from 'lucide-react';
import type { Framework } from '../lab/content';
import { makeNode, maxNodes, type Resource } from './graph';
import { recipeFiles } from './recipes';
import { changeProject, usePlayground } from './workspace';
import { ResourceLab } from './ResourceLab';
import { DockerfileLab } from './DockerfileLab';
import './playgrounds.css';

export default function Playgrounds({ page }: { page: 'graph' | 'dockerfile' }) {
  const state = usePlayground();
  const [selected, setSelected] = useState('');
  const [editing, setEditing] = useState<{ id: string; source: string } | null>(null);
  const [issue, setIssue] = useState('');
  const { graph, active, drafts } = state.project;
  const service = editing && graph.nodes.find(n => n.id === editing.id && n.recipe?.framework === active);
  const source = service && editing ? editing.source : drafts[active] ?? recipeFiles(active).Dockerfile;
  function select(name: Framework) { setEditing(null); setIssue(''); changeProject(p => ({ ...p, active: name })); }
  function edit(text: string) {
    if (service && editing) setEditing({ ...editing, source: text });
    else changeProject(p => ({ ...p, drafts: { ...p.drafts, [p.active]: text } }));
  }
  function editService(node: Resource) {
    if (!node.recipe) return;
    setIssue(''); setEditing({ id: node.id, source: node.recipe.source });
    changeProject(p => ({ ...p, active: node.recipe!.framework }));
    window.location.hash = 'dockerfile';
  }
  function apply() {
    if (!service && graph.nodes.length >= maxNodes) { setIssue('The graph is full. Remove a resource before adding this service.'); return; }
    const node = service ? { ...service, recipe: { framework: active, source } } : makeNode(graph, 'app', active, source);
    const nodes = service ? graph.nodes.map(n => n.id === node.id ? node : n) : [...graph.nodes, node];
    changeProject(p => ({ ...p, graph: { ...p.graph, nodes } }));
    setSelected(node.id); setEditing(null); setIssue(''); window.location.hash = 'graph';
  }
  return <div className="pg"><div className="pg-status"><span>Design &amp; simulation</span><small><HardDrive size={13}/>{state.status}</small></div>
    {state.message && <p className="notice" role="status">{state.message}{state.recovery && <button className="secondary" onClick={() => changeProject(p => p, true)}>Replace damaged save</button>}</p>}
    {issue && <p className="notice" role="alert">{issue}</p>}
    {state.ready ? page === 'graph' ? <ResourceLab graph={graph} selected={selected} select={setSelected} editRecipe={editService}/> :
      <DockerfileLab key={active + (service?.id ?? '')} name={active} source={source} serviceName={service?.name} select={select} edit={edit} useRecipe={apply}/> :
      <p role="status">Opening playground…</p>}
  </div>;
}
