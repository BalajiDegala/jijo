
import { useLayoutEffect, useMemo } from 'react';
import { Background, Controls, Handle, MarkerType, Position, ReactFlow, ReactFlowProvider, useNodesState, useReactFlow, type Node, type NodeProps } from '@xyflow/react';
import { AppWindow, Database, Globe, HardDrive, MoreHorizontal, Network, Server, type LucideIcon } from 'lucide-react';
import '@xyflow/react/dist/style.css';

export const icons = { app: AppWindow, nginx: Globe, postgres: Database, redis: Server, network: Network, volume: HardDrive };
export interface CanvasItem {
  id: string; name: string; kind: string; detail: string; icon: LucideIcon; color: string;
  x: number; y: number; source: boolean;
}
export interface CanvasLink { from: string; to: string; label: string; color: string }
export type ShowMenu = (id: string, x: number, y: number) => void;
type Tile = Node<{ item: CanvasItem; current: boolean; signal: string; menu: ShowMenu }, 'tile'>;
function TileView({ data }: NodeProps<Tile>) {
  const { item, signal } = data;
  return <div className={'pg-tile ' + item.color + (data.current ? ' current' : '') + (signal ? ' wire-' + signal : '')}>
    <Handle type="target" position={Position.Left} aria-label={'Connect to ' + item.name}/>
    <div className="pg-tile-title"><span><item.icon size={18}/></span><div><small>{item.kind}</small><strong>{item.name || '(unnamed)'}</strong></div>
      {!signal && <button className="node-actions nodrag nopan" aria-label={'Actions for ' + item.name} onClick={e => {
        e.stopPropagation(); const box = e.currentTarget.getBoundingClientRect(); data.menu(item.id, box.left, box.bottom);
      }}><MoreHorizontal size={14}/></button>}
    </div>
    <code>{item.detail}</code>
    {(signal === 'source' || signal === 'target') && <span className="wire-label">{signal === 'source' ? 'Connecting…' : 'Connect here'}</span>}
    {item.source && <Handle type="source" position={Position.Right} aria-label={'Connect from ' + item.name}/>}
  </div>;
}
const nodeTypes = { tile: TileView };
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
  useLayoutEffect(() => { if (signature !== '[]') void fitView({ padding: .18, maxZoom: 1.15 }); }, [signature, fitView]);
  const edges = useMemo(() => {
    const names = new Map(items.map(n => [n.id, n.name]));
    return links.map(e => ({ id: JSON.stringify([e.from,e.to]), source: e.from, target: e.to, type: 'smoothstep', label: e.label,
      ariaLabel: names.get(e.from) + ' ' + e.label + ' ' + names.get(e.to),
      style: { stroke: e.color, strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: e.color },
      labelStyle: { fill: '#eef4df', fontSize: 11 }, labelBgStyle: { fill: '#233e32' } }));
  }, [items, links]);
  return <ReactFlow<Tile> nodes={nodes} edges={edges} nodeTypes={nodeTypes} minZoom={.10} maxZoom={2.5}
    onNodesChange={onNodesChange} onNodeClick={(_, n) => select(n.id)} nodesDraggable={!!move && !source}
    onNodeContextMenu={(e,n) => { e.preventDefault(); menu(n.id,e.clientX,e.clientY); }}
    onNodeDragStop={(_,n) => move?.(n.id,Math.round(n.position.x),Math.round(n.position.y))}
    onConnect={({ source: a, target: b }) => connect(a,b)} isValidConnection={e => valid(e.source,e.target)}
    nodesConnectable={!source} deleteKeyCode={null} multiSelectionKeyCode={null}
    nodesFocusable selectionKeyCode={null} colorMode="dark" aria-label={title}>
    <Background gap={18} size={1} color="#537365"/><Controls showInteractive={false}/>
  </ReactFlow>;
}
export function GraphCanvas(props: Props) { return <ReactFlowProvider><Canvas {...props}/></ReactFlowProvider>; }
