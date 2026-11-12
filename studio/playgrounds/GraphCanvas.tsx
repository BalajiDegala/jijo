
import { useLayoutEffect, useMemo } from 'react';
import { Background, BaseEdge, Controls, getBezierPath, Handle, MarkerType, Position, ReactFlow, ReactFlowProvider, useNodesState, useReactFlow, type Edge, type EdgeProps, type Node, type NodeProps } from '@xyflow/react';
import { AppWindow, Database, Globe, HardDrive, MoreHorizontal, Network, Server, type LucideIcon } from 'lucide-react';
import '@xyflow/react/dist/style.css';

export const icons = { app: AppWindow, nginx: Globe, postgres: Database, redis: Server, network: Network, volume: HardDrive };
export interface CanvasItem {
  id: string; name: string; kind: string; detail: string; icon: LucideIcon; color: string;
  x: number; y: number; source: boolean; reverse?: boolean;
}
export const wireColors = { dependency: '#4ddded', network: '#b899ff', mount: '#ffc17a', sequence: '#64e8c4' } as const;
export interface CanvasLink { from: string; to: string; label: string; kind: keyof typeof wireColors }
export type ShowMenu = (id: string, x: number, y: number) => void;
type Tile = Node<{ item: CanvasItem; current: boolean; signal: string; menu: ShowMenu }, 'tile'>;
function TileView({ data }: NodeProps<Tile>) {
  const { item, signal } = data;
  return <div className={'pg-tile ' + item.color + (data.current ? ' current' : '') + (signal ? ' wire-' + signal : '')}>
    <Handle id="vertical-in" type="target" position={Position.Top} className="vertical-port" aria-label={'Top input on ' + item.name}/>
    <Handle id="in" type="target" position={item.reverse ? Position.Right : Position.Left} aria-label={'Connect to ' + item.name}/>
    <div className="pg-tile-title"><span><item.icon size={18}/></span><div><small>{item.kind}</small><strong>{item.name || '(unnamed)'}</strong></div>
      {!signal && <button className="node-actions nodrag nopan" aria-label={'Actions for ' + item.name} onClick={e => {
        e.stopPropagation(); const box = e.currentTarget.getBoundingClientRect(); data.menu(item.id, box.left, box.bottom);
      }}><MoreHorizontal size={14}/></button>}
    </div>
    <code>{item.detail}</code>
    {(signal === 'source' || signal === 'target') && <span className="wire-label">{signal === 'source' ? 'Connecting…' : 'Connect here'}</span>}
    {item.source && <><Handle id="out" type="source" position={item.reverse ? Position.Left : Position.Right} aria-label={'Connect from ' + item.name}/>
      <Handle id="vertical-out" type="source" position={Position.Bottom} className="vertical-port" aria-label={'Bottom output on ' + item.name}/></>}
  </div>;
}
const nodeTypes = { tile: TileView };
type Wire = Edge<{ kind: CanvasLink['kind']; focus: string }, 'wire'>;
function WireView({ id, data, label, markerEnd, selected, ...points }: EdgeProps<Wire>) {
  const [path, x, y] = getBezierPath({ ...points, curvature: .35 });
  const color = wireColors[data!.kind];
  const active = !!data!.focus || selected;
  return <g className={'graph-wire' + (active ? ' highlighted' : '')} style={{ color }}>
    <path className="wire-aura" d={path} aria-hidden="true"/>
    <BaseEdge id={id} path={path} markerEnd={markerEnd} style={{ stroke: color, strokeWidth: active ? 2.4 : 1.7 }} interactionWidth={18}/>
    {active && <path key={data!.focus} className="wire-trace" d={path} pathLength={100} aria-hidden="true"/>}
    <g className="wire-caption" transform={'translate(' + x + ',' + y + ')'} aria-hidden="true">
      <rect x={-String(label).length * 3.1 - 6} y={-8} width={String(label).length * 6.2 + 12} height={16} rx={5}/>
      <text textAnchor="middle" dy="3.4">{label}</text>
    </g>
  </g>;
}
const edgeTypes = { wire: WireView };
interface Props {
  title: string; items: CanvasItem[]; links: CanvasLink[]; selected: string; source: string; targets: ReadonlySet<string>;
  select: (id: string) => void; menu: ShowMenu; connect: (from: string, to: string) => void;
  valid: (from: string, to: string) => boolean; move?: (id: string, x: number, y: number) => void;
}
function Canvas({ title, items, links, selected, source, targets, select, menu, connect, valid, move }: Props) {
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<Tile>([]);
  useLayoutEffect(() => {
    setNodes(items.map(item => ({ id: item.id, type: 'tile', ariaLabel: item.name + ', ' + item.kind,
      position: { x: item.x, y: item.y }, data: { item, current: item.id === selected, menu,
        signal: source ? item.id === source ? 'source' : targets.has(item.id) ? 'target' : 'unavailable' : '' } })));
  }, [items, selected, source, targets, menu, setNodes]);
  const signature = JSON.stringify(items.map(n => n.id));
  useLayoutEffect(() => { if (signature !== '[]') void fitView({ padding: .18, maxZoom: 1.32 }); }, [signature, fitView]);
  const edges = useMemo<Wire[]>(() => {
    const byId = new Map(items.map(n => [n.id,n]));
    return links.map(e => {
      const from = byId.get(e.from)!, to = byId.get(e.to)!;
      const vertical = to.y - from.y > 100 && (e.kind !== 'dependency' || Math.abs(to.x - from.x) < 150);
      const color = wireColors[e.kind];
      return { id: JSON.stringify([e.from,e.to]), source: e.from, target: e.to, type: 'wire', label: e.label,
        sourceHandle: vertical ? 'vertical-out' : 'out', targetHandle: vertical ? 'vertical-in' : 'in',
        ariaLabel: from.name + ' ' + e.label + ' ' + to.name,
        markerEnd: { type: MarkerType.ArrowClosed, color, width: 13, height: 13 },
        data: { kind: e.kind, focus: selected === e.from || selected === e.to ? selected : '' } };
    });
  }, [items, links, selected]);
  return <ReactFlow<Tile, Wire> nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes}
    connectionLineStyle={{ stroke: '#80f6f3', strokeWidth: 2.5, filter: 'drop-shadow(0 0 3px #44cfdc)' }} minZoom={.10} maxZoom={2.5}
    onNodesChange={onNodesChange} onNodeClick={(_, n) => select(n.id)} nodesDraggable={!!move && !source}
    onNodeContextMenu={(e,n) => { e.preventDefault(); menu(n.id,e.clientX,e.clientY); }}
    onNodeDragStop={(_,n) => move?.(n.id,Math.round(n.position.x),Math.round(n.position.y))}
    onConnect={({ source: a, target: b }) => connect(a,b)} isValidConnection={e => valid(e.source,e.target)}
    nodesConnectable={!source} deleteKeyCode={null} multiSelectionKeyCode={null}
    nodesFocusable selectionKeyCode={null} colorMode="dark" aria-label={title}>
    <Background gap={20} size={1} color="#35445f"/><Controls showInteractive={false}/>
  </ReactFlow>;
}
export function GraphCanvas(props: Props) { return <ReactFlowProvider><Canvas {...props}/></ReactFlowProvider>; }
