"use client";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  MiniMap,
  Handle,
  Position,
  useReactFlow,
  type NodeProps,
  type Node,
  type Edge,
  type Connection,
  type NodeChange,
  applyNodeChanges,
} from "@xyflow/react";
import {
  ChevronDown,
  ChevronUp,
  Check,
  AlertTriangle,
  Plus,
  Minus,
  Maximize,
  LayoutGrid,
  MousePointer2,
  Hand,
  Search,
  Cloud,
  GitBranch,
  Network,
  ArrowUpRight,
  Box,
  X,
} from "lucide-react";
import { useStudio } from "@/lib/store";
import { Resource, address, references } from "@/lib/model";
import { schemaFor } from "@/lib/registry";
import { graph, dagreLayout } from "@/lib/graph";
import { internetPath } from "@/lib/validation";
import { ResourceIcon } from "./icons";
import { Button, Tip } from "./ui";
const ResourceNode = memo(function ResourceNode({ data }: NodeProps) {
  const r = data.resource as Resource;
  const collapsed = r.collapsed;
  const s = schemaFor(r.type);
  const update = useStudio((x) => x.update);
  const error = (data.issues as any[])?.some((x) => x.severity === "error");
  const count =
    r.scale?.mode === "count"
      ? r.scale.count
      : r.scale?.mode === "for_each"
        ? r.scale.keys.length
        : 1;
  return (
    <div
      className={`infra-node ${s?.color} ${data.selected ? "is-selected" : ""}`}
    >
      <Handle type="target" position={Position.Left} />
      <div className="node-head">
        <ResourceIcon type={r.type} />
        <div>
          <span className="node-kind">
            {r.kind === "data" ? "DATA SOURCE" : s?.label.toUpperCase()}
          </span>
          <strong>{r.name}</strong>
        </div>
        <button
          className="node-collapse nodrag"
          aria-label={`Collapse ${r.name}`}
          onClick={(e) => {
            e.stopPropagation();
            update(r.id, { collapsed: !collapsed });
          }}
        >
          {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>
      {!collapsed && (
        <>
          <div className="node-detail">
            <span>
              {r.type === "aws_instance"
                ? String(r.args.instance_type)
                : r.type === "aws_security_group"
                  ? `${Array.isArray(r.args.ingress) ? r.args.ingress.length : 0} inbound rules`
                  : r.kind === "data"
                    ? "Read existing infrastructure"
                    : s?.category}
            </span>
            {count > 1 ? (
              <span className="count-badge">× {count}</span>
            ) : (
              <span className="node-type">
                {r.kind === "output" ? "value" : "AWS"}
              </span>
            )}
          </div>
          <div className="node-footer">
            <span>
              {error ? (
                <AlertTriangle size={10} />
              ) : (
                <span className="status-dot" />
              )}
              {error
                ? "Needs attention"
                : r.kind === "data"
                  ? "Data source"
                  : "Configured"}
            </span>
            <span>
              <GitBranch size={10} />
              {Number(data.dependencies)} refs
            </span>
          </div>
        </>
      )}
      {count > 1 && !collapsed && (
        <div className="cluster-detail">
          {r.scale?.mode} · {count} instances in one block
        </div>
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  );
});
const ContainerNode = memo(function ContainerNode({ data }: NodeProps) {
  const r = data.resource as Resource | undefined;
  return (
    <div
      className={`infra-container ${data.color} ${data.selected ? "is-selected" : ""}`}
    >
      <div className="container-title">
        {r ? <ResourceIcon type={r.type} size={14} /> : <Cloud size={13} />}
        <strong>{String(data.label)}</strong>
        <span>{String(data.subtitle)}</span>
      </div>
      {r && (
        <>
          <Handle type="target" position={Position.Left} />
          <Handle type="source" position={Position.Right} />
        </>
      )}
    </div>
  );
});
const nodeTypes = { resource: ResourceNode, container: ContainerNode };
function CanvasInner({ onAdd }: { onAdd: () => void }) {
  const { project, selected, view, select, connect, update, notify } =
    useStudio();
  const flow = useReactFlow();
  const model = useMemo(
    () => graph(project, view, selected),
    [project, view, selected],
  );
  const [nodes, setNodes] = useState<Node[]>(model.nodes);
  const [edges, setEdges] = useState<Edge[]>(model.edges);
  const [pan, setPan] = useState(false);
  const [search, setSearch] = useState("");
  const [context, setContext] = useState<{
    x: number;
    y: number;
    id: string;
  } | null>(null);
  const [zoom, setZoom] = useState(100);
  useEffect(() => {
    setNodes(model.nodes);
    setEdges(model.edges);
  }, [model]);
  useEffect(() => {
    const t = setTimeout(
      () => flow.fitView({ padding: 0.08, duration: 400 }),
      100,
    );
    return () => clearTimeout(t);
  }, [view, project.id, project.resources.length, flow]);
  const onConnect = useCallback(
    (c: Connection) => {
      if (c.source && c.target) connect(c.source, c.target);
    },
    [connect],
  );
  const auto = async () => {
    if (view === "dependencies") {
      try {
        const laid = await dagreLayout(nodes, edges);
        setNodes(laid);
        useStudio.getState().change(
          (p) =>
            p.resources.forEach((r) => {
              const pos = laid.find((n) => n.id === r.id)?.position;
              if (pos) r.layouts = { ...r.layouts, dependencies: pos };
            }),
          "Dependency graph arranged.",
        );
      } catch (e) {
        notify((e as Error).message);
        return;
      }
    } else {
      useStudio
        .getState()
        .change(
          (p) => p.resources.forEach((r) => delete r.layouts?.[view]),
          "Topology restored to its infrastructure hierarchy.",
        );
    }
    setTimeout(() => flow.fitView({ padding: 0.08, duration: 500 }), 60);
  };
  const results = search
    ? project.resources.filter((r) =>
        (r.name + " " + r.type).toLowerCase().includes(search.toLowerCase()),
      )
    : [];
  return (
    <div className="canvas-shell" onClick={() => context && setContext(null)}>
      <div className="canvas-heading">
        <div>
          <span className="eyebrow">
            {view === "topology"
              ? "YOUR INFRASTRUCTURE"
              : view === "dependencies"
                ? "TERRAFORM REFERENCES"
                : "NETWORK REACHABILITY"}
          </span>
          <span className="canvas-subtitle">
            {view === "topology"
              ? "Everything, connected."
              : view === "dependencies"
                ? "Follow the dependency. Understand the order."
                : "Trace explicit routes. Verify every hop."}
          </span>
        </div>
        <Tip label="Add a resource (A)">
          <Button size="sm" onClick={onAdd}>
            <Plus size={14} />
            Add resource
          </Button>
        </Tip>
      </div>
      {project.resources.length === 0 ? (
        <div className="empty-canvas">
          <div className="empty-network">
            <Network size={36} />
          </div>
          <h2>A little code. Infinite possibilities.</h2>
          <p>
            Start with a VPC. Connect your first resource.
            <br />
            Watch the Terraform come together.
          </p>
          <Button
            variant="default"
            onClick={() => useStudio.getState().add("aws_vpc")}
          >
            <Plus size={15} />
            Start building
          </Button>
          <span>Your infrastructure stays on your device.</span>
        </div>
      ) : (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={(c: NodeChange[]) =>
            setNodes((n) => applyNodeChanges(c, n))
          }
          onNodeDragStop={(_, n) =>
            update(n.id, {
              layouts: {
                ...project.resources.find((r) => r.id === n.id)?.layouts,
                [view]: n.position,
              },
            })
          }
          onConnect={onConnect}
          onNodeClick={(_, n) => {
            if (n.data.resource) select(n.id);
          }}
          onPaneClick={() => select(null)}
          onNodeContextMenu={(e, n) => {
            e.preventDefault();
            if (n.data.resource)
              setContext({ x: e.clientX, y: e.clientY, id: n.id });
          }}
          onMove={(_, v) => setZoom(Math.round(v.zoom * 100))}
          fitView
          minZoom={0.15}
          maxZoom={1.8}
          proOptions={{ hideAttribution: true }}
          panOnDrag={pan ? [0, 1, 2] : [1, 2]}
          selectionOnDrag={!pan}
          deleteKeyCode={null}
          onDrop={(e) => {
            e.preventDefault();
            const type = e.dataTransfer.getData("application/terraforge");
            if (type) useStudio.getState().add(type);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
          }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            color="#2a3445"
            gap={22}
            size={1}
          />
          <MiniMap
            maskColor="rgba(9,14,22,.7)"
            nodeColor={(n) => (n.type === "container" ? "#28384d" : "#42b99d")}
            pannable
            zoomable
          />
        </ReactFlow>
      )}
      <div className="canvas-search">
        <Search size={14} />
        <input
          aria-label="Find a resource"
          placeholder="Find a resource…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <kbd>/</kbd>
        {results.length > 0 && (
          <div className="search-results">
            {results.slice(0, 8).map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  select(r.id);
                  flow.fitView({
                    nodes: [{ id: r.id }],
                    padding: 0.8,
                    duration: 400,
                  });
                  setSearch("");
                }}
              >
                <ResourceIcon type={r.type} size={14} />
                {r.name}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="canvas-controls">
        <Tip label="Select and drag">
          <Button
            size="icon"
            variant={!pan ? "secondary" : "ghost"}
            aria-label="Selection tool"
            onClick={() => setPan(false)}
          >
            <MousePointer2 size={16} />
          </Button>
        </Tip>
        <Tip label="Pan canvas">
          <Button
            size="icon"
            variant={pan ? "secondary" : "ghost"}
            aria-label="Pan tool"
            onClick={() => setPan(true)}
          >
            <Hand size={16} />
          </Button>
        </Tip>
        <i />
        <Button
          size="icon"
          variant="ghost"
          aria-label="Zoom out"
          onClick={() => flow.zoomOut()}
        >
          <Minus size={15} />
        </Button>
        <span>{zoom}%</span>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Zoom in"
          onClick={() => flow.zoomIn()}
        >
          <Plus size={15} />
        </Button>
        <i />
        <Tip label="Fit to screen">
          <Button
            size="icon"
            variant="ghost"
            aria-label="Fit to screen"
            onClick={() => flow.fitView({ padding: 0.08, duration: 400 })}
          >
            <Maximize size={15} />
          </Button>
        </Tip>
        <Tip label="Auto-layout">
          <Button
            size="icon"
            variant="ghost"
            aria-label="Auto-layout"
            onClick={auto}
          >
            <LayoutGrid size={15} />
          </Button>
        </Tip>
      </div>
      <div className="canvas-legend">
        <span>
          <i className="legend-dot violet" />
          {view === "topology"
            ? "Container"
            : view === "dependencies"
              ? "Resource reference"
              : "Route hop"}
        </span>
        <span>
          <i className="legend-line" />
          {view === "topology"
            ? "Attachment"
            : view === "dependencies"
              ? "Depends on"
              : "Configured path"}
        </span>
      </div>
      {view === "network" && (
        <div className="network-note">
          <ShieldCheckLocal />
          Routes shown are configuration checks, not live connectivity tests.
          NACLs and AWS state are not inspected.
        </div>
      )}
      {context && (
        <div
          className="context-menu"
          style={{ left: context.x, top: context.y }}
        >
          <button onClick={() => select(context.id)}>Inspect resource</button>
          <button
            onClick={() => {
              useStudio.getState().setView("dependencies");
              select(context.id);
            }}
          >
            Trace dependencies
          </button>
          <button
            onClick={() => {
              const r = project.resources.find((x) => x.id === context.id);
              if (r) navigator.clipboard?.writeText(address(r));
            }}
          >
            Copy Terraform address
          </button>
        </div>
      )}
    </div>
  );
}
function ShieldCheckLocal() {
  return <Network size={13} />;
}
export function InfrastructureCanvas(props: { onAdd: () => void }) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
}
export function Inventory() {
  const { project, select, setView } = useStudio();
  return (
    <div className="inventory">
      <div className="inventory-title">
        <h2>Resource inventory</h2>
        <span>{project.resources.length} configuration blocks</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Resource</th>
            <th>Terraform address</th>
            <th>Instances</th>
            <th>Dependencies</th>
          </tr>
        </thead>
        <tbody>
          {project.resources.map((r) => (
            <tr
              key={r.id}
              onClick={() => select(r.id)}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && select(r.id)}
            >
              <td>
                <ResourceIcon type={r.type} size={16} />
                <strong>{r.name}</strong>
              </td>
              <td>
                <code>{address(r)}</code>
              </td>
              <td>
                {r.scale?.mode === "count"
                  ? r.scale.count
                  : r.scale?.mode === "for_each"
                    ? r.scale.keys.length
                    : 1}
              </td>
              <td>{references(r.args).length}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button onClick={() => setView("topology")}>
        <ArrowUpRight size={14} />
        Back to canvas
      </Button>
    </div>
  );
}
