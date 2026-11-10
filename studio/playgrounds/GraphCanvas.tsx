import { useEffect, useMemo } from 'react';
import { Background, Controls, Handle, MarkerType, Position, ReactFlow, useNodesState, useReactFlow, ReactFlowProvider, type Node, type NodeProps } from '@xyflow/react';
import { AppWindow, Database, Globe, HardDrive, Network, Server } from 'lucide-react';
import '@xyflow/react/dist/style.css';
import { isService, labels, listener, relation, type Graph, type Resource } from './graph';

export const icons = { app: AppWindow, nginx: Globe, postgres: Database, redis: Server, network: Network, volume: HardDrive };
type Tile = Node<{ resource: Resource; current: boolean }, 'resource'>;
function TileView({ data }: NodeProps<Tile>) {
  const r = data.resource;
  const Icon = icons[r.kind];
  const detail = isService(r.kind) ? (r.host ? r.host + ' → ' + listener(r) : 'Internal · ' + listener(r)) :
    r.kind === 'network' ? 'Bridge network' : 'Named volume';
  return <div className={'pg-tile ' + r.kind + (data.current ? ' current' : '')}>
    <Handle type="target" position={Position.Left} aria-label={'Connect to ' + r.name}/>
    <div className="pg-tile-title"><span><Icon size={18}/></span><div><small>{r.recipe?.framework ?? labels[r.kind]}</small><strong>{r.name || '(unnamed)'}</strong></div></div>
    <code>{detail}</code>
    {isService(r.kind) && <Handle type="source" position={Position.Right} aria-label={'Connect from ' + r.name}/>}
  </div>;
}
const nodeTypes = { resource: TileView };
type Props = { graph: Graph; selected: string; select: (id: string) => void; connect: (a: string, b: string) => void; move: (id: string, x: number, y: number) => void };
function Canvas({ graph, selected, select, connect, move }: Props) {
  const flow = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<Tile>([]);
  useEffect(() => {
    setNodes(graph.nodes.map(r => ({ id: r.id, type: 'resource', ariaLabel: r.name + ', ' + labels[r.kind],
      position: { x: r.x, y: r.y }, data: { resource: r, current: r.id === selected } })));
  }, [graph.nodes, selected, setNodes]);
  const edges = useMemo(() => graph.links.map(e => {
    const kind = graph.nodes.find(n => n.id === e.to)!.kind;
    const color = kind === 'network' ? '#9985ca' : kind === 'volume' ? '#ccac61' : '#96bc83';
    const start = graph.nodes.find(n => n.id === e.from)!;
    const end = graph.nodes.find(n => n.id === e.to)!;
    return { id: e.from + '/' + e.to, source: e.from, target: e.to, type: 'smoothstep', label: relation(kind),
      ariaLabel: start.name + ' ' + relation(kind) + ' ' + end.name,
      style: { stroke: color, strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color },
      labelStyle: { fill: '#eef4df', fontSize: 11 }, labelBgStyle: { fill: '#233e32' } };
  }), [graph]);
  const nodeIds = graph.nodes.map(n => n.id).join(',');
  useEffect(() => {
    const timer = window.setTimeout(() => { void flow.fitView({ padding: .2, maxZoom: 1.2 }); }, 70);
    return () => clearTimeout(timer);
  }, [nodeIds, flow.fitView]);
  return <ReactFlow<Tile> nodes={nodes} edges={edges} nodeTypes={nodeTypes} minZoom={0.15} maxZoom={2.5}
    onNodesChange={onNodesChange} onNodeClick={(_, n) => select(n.id)}
    onNodeDragStop={(_, n) => move(n.id, Math.round(n.position.x), Math.round(n.position.y))}
    onConnect={({ source, target }) => connect(source, target)} deleteKeyCode={null} multiSelectionKeyCode={null}
    nodesFocusable selectionKeyCode={null} colorMode="dark" aria-label="Compose resource graph">
    <Background gap={18} size={1} color="#537365"/><Controls showInteractive={false}/>
  </ReactFlow>;
}
export function GraphCanvas(props: Props) { return <ReactFlowProvider><Canvas {...props}/></ReactFlowProvider>; }
