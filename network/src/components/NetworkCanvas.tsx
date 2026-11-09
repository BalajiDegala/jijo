import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import {
  Background,
  BackgroundVariant,
  BaseEdge,
  Controls,
  getBezierPath,
  getSmoothStepPath,
  Handle,
  MiniMap,
  MarkerType,
  NodeResizer,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import type { Edge, EdgeProps, Node, NodeProps } from "@xyflow/react";
import { Eye, EyeOff, Maximize, MousePointer2 } from "lucide-react";
import { useLab } from "../store";
import { containerKinds } from "../engine/types";
import type { Link, Resource, ResourceKind } from "../engine/types";
import { kindLabels } from "../engine/deviceEngine";
import { subnetExposure } from "../engine/awsEngine";
import { ResourceIcon } from "./Icons";
import { ConnectionTools } from "./ConnectionTools";
import { useExpandedVisual } from "./VisualPanel";
import {
  awsRelationships,
  removeAwsRelationship,
} from "../engine/awsRelationships";
type LabNode = Node<{
  resource: Resource;
  active: boolean;
  dropped: boolean;
  details: boolean;
  architecture: boolean;
  online: boolean;
}>;
function ResourceNode({ data, selected }: NodeProps<LabNode>) {
  const r = data.resource,
    group = containerKinds.includes(r.kind);
  const update = useLab((s) => s.update);
  const topology = useLab((s) => s.topology);
  return (
    <div
      className={`resource-node ${r.kind} ${group ? "container-node" : ""} ${selected ? "is-selected" : ""} ${data.active ? (data.dropped ? "is-dropped" : "is-active") : ""} ${!data.online ? "is-offline" : ""}`}
    >
      {group ? (
        <>
          {topology.builder && (
            <>
              <Handle
                type="target"
                position={Position.Left}
                title={`Configure ${r.name}`}
              />
              <Handle
                type="source"
                position={Position.Right}
                title={`Create relationship from ${r.name}`}
              />
            </>
          )}
          <NodeResizer
            minWidth={300}
            minHeight={220}
            isVisible={selected}
            onResizeEnd={(_, p) =>
              update(r.id, { width: p.width, height: p.height, x: p.x, y: p.y })
            }
          />
          <div className="container-label">
            <ResourceIcon kind={r.kind} size={15} />
            <strong>{r.name}</strong>
            <span>
              {r.cidr ?? kindLabels[r.kind]}
              {data.architecture && r.kind === "subnet"
                ? ` · ${subnetExposure(topology, r)}`
                : ""}
            </span>
          </div>
          {r.kind === "subnet" && (
            <span className={`subnet-exposure ${subnetExposure(topology, r)}`}>
              {topology.builder && subnetExposure(topology, r) === "isolated"
                ? "Private · local routes only"
                : `${subnetExposure(topology, r)} subnet`}
            </span>
          )}
        </>
      ) : (
        <>
          <Handle
            type="target"
            id={data.architecture ? "in-left" : undefined}
            position={Position.Left}
            title={`Connect to ${r.name}`}
          />
          {data.architecture && (
            <Handle
              type="target"
              id="in-top"
              position={Position.Top}
              title={`Connect to ${r.name}`}
            />
          )}
          <div className="node-top">
            <span className={`resource-symbol ${r.kind}`}>
              <ResourceIcon kind={r.kind} size={21} />
            </span>
            <span className={`node-status ${data.online ? "" : "offline"}`} />
          </div>
          <strong title={r.name}>{r.name}</strong>
          {data.details && (
            <>
              <span className="node-address">
                {r.ip ??
                  r.cidr ??
                  r.publicIp ??
                  (r.kind === "router"
                    ? `${r.interfaces?.length ?? 0} interfaces`
                    : kindLabels[r.kind])}
              </span>
              <span className="node-kind">
                {r.role ??
                  (data.architecture && r.serviceId
                    ? r.serviceId
                    : kindLabels[r.kind])}
              </span>
            </>
          )}
          <Handle
            type="source"
            id={data.architecture ? "out-right" : undefined}
            position={Position.Right}
            title={`Start a connection from ${r.name}`}
          />
          {data.architecture && (
            <Handle
              type="source"
              id="out-bottom"
              position={Position.Bottom}
              title={`Start a connection from ${r.name}`}
            />
          )}
        </>
      )}
    </div>
  );
}
function PacketEdge(props: EdgeProps) {
  const reducedMotion = useReducedMotion();
  const [path, centerX, centerY] = props.data?.architecture
    ? getSmoothStepPath({ ...props, borderRadius: 16, offset: 28 })
    : getBezierPath(props);
  const active = !!props.data?.active,
    reverse = !!props.data?.reverse,
    playing = !!props.data?.playing;
  return (
    <>
      <BaseEdge
        path={path}
        markerEnd={props.markerEnd}
        label={props.data?.showLabel ? props.label : undefined}
        labelX={centerX}
        labelY={centerY}
        labelStyle={{
          fill: "#d9e7f4",
          fontSize: props.data?.builder ? 13 : 20,
          fontWeight: 500,
        }}
        labelBgStyle={{ fill: "#0d1b2b", fillOpacity: 0.95 }}
        labelBgPadding={[7, 5]}
        labelBgBorderRadius={5}
        style={{
          stroke: active
            ? "#4fa7ff"
            : ((props.data?.color as string) ?? "#314b69"),
          strokeWidth: active || props.data?.architecture ? 2.5 : 1.5,
          strokeDasharray: props.data?.logical ? "5 5" : undefined,
        }}
      />
      {active && (
        <circle
          r="5"
          cx={reducedMotion ? centerX : 0}
          cy={reducedMotion ? centerY : 0}
          fill="#a9dcff"
          className="packet-orb"
        >
          {!reducedMotion && (
            <animateMotion
              key={`${props.id}-${String(props.data?.step)}-${playing}`}
              dur={
                playing ? `${1 / Number(props.data?.speed ?? 1)}s` : "0.001s"
              }
              repeatCount={playing ? "indefinite" : "1"}
              path={path}
              keyPoints={!playing ? "0.5;0.5" : reverse ? "1;0" : "0;1"}
              keyTimes="0;1"
              calcMode="linear"
              fill="freeze"
            />
          )}
        </circle>
      )}
    </>
  );
}
const nodeTypes = { resource: ResourceNode };
const edgeTypes = { packet: PacketEdge };
const cloudFitPadding = { top: "80px", bottom: "48px", x: "24px" } as const;
function CanvasInner() {
  const {
    topology,
    selectedId,
    update,
    connect,
    add,
    result,
    step,
    details,
    playing,
    speed,
  } = useLab();
  const flow = useReactFlow();
  const architecture = topology.diagram === "three-tier";
  const [layer, setLayer] = useState("request");
  const [crossZone, setCrossZone] = useState(false);
  const [edgeLabels, setEdgeLabels] = useState(false);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const fit = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        void flow.fitView({ padding: cloudFitPadding, duration: 200 });
      }, 100);
    };
    window.addEventListener("aws-fit-diagram", fit);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("aws-fit-diagram", fit);
    };
  }, [flow]);
  const belongsTo = (r: Resource, id: string): boolean => {
    if (r.id === id) return true;
    const parent = topology.resources.find((p) => p.id === r.parentId);
    return parent ? belongsTo(parent, id) : false;
  };
  const visible = (r: Resource) => {
    if (!architecture || r.id === selectedId) return true;
    if (["routeTable", "eip", "sg", "nacl"].includes(r.kind))
      return layer === "routing";
    if (r.kind === "asg") return layer === "scaling";
    if (r.kind === "dbEndpoint") return layer === "request";
    return true;
  };
  const canvas = useRef<HTMLDivElement>(null);
  const expanded = useExpandedVisual();
  const fitPadding = topology.mode === "aws" ? cloudFitPadding : 0.15;
  const previousView = useRef<ReturnType<typeof flow.getViewport> | undefined>(
    undefined,
  );
  useEffect(() => {
    if (expanded) {
      previousView.current = flow.getViewport();
      return;
    }
    if (previousView.current) {
      const view = previousView.current;
      previousView.current = undefined;
      const frame = requestAnimationFrame(() => {
        void flow.setViewport(view, { duration: 0 });
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [expanded, flow]);
  useEffect(() => {
    if (!expanded || !canvas.current) return;
    // Fit after React Flow has measured the space left by the playback controls.
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        void flow.fitView({ padding: fitPadding, duration: 0 });
      });
    });
    observer.observe(canvas.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [expanded, flow, fitPadding]);
  const [selectedEdge, setSelectedEdge] = useState<string>();
  useEffect(() => {
    const timer = setTimeout(
      () => flow.fitView({ padding: fitPadding, duration: 250 }),
      150,
    );
    return () => clearTimeout(timer);
  }, [flow, topology.name, topology.resources.length, fitPadding, layer]);
  const event = result?.events[step];
  const { nodes, edgeZIndex } = useMemo(() => {
    const depth = (r: Resource): number => {
      const parent = topology.resources.find((p) => p.id === r.parentId);
      return parent ? depth(parent) + 1 : 0;
    };
    const online = (r: Resource): boolean => {
      const parent = topology.resources.find((p) => p.id === r.parentId);
      return r.enabled && (!parent || online(parent));
    };
    // Unparented gateways and policies can sit over nested containers too.
    // Keep connections above boundaries and cards above both, even on resize.
    const edgeZIndex = Math.max(0, ...topology.resources.map(depth)) + 1;
    const nodes: LabNode[] = [...topology.resources]
      .filter(visible)
      .sort((a, b) => depth(a) - depth(b))
      .map((r) => ({
        id: r.id,
        type: "resource",
        parentId: r.parentId,
        extent: r.parentId ? ("parent" as const) : undefined,
        position: { x: r.x, y: r.y },
        selected: r.id === selectedId,
        zIndex: containerKinds.includes(r.kind) ? depth(r) : edgeZIndex + 1,
        style: containerKinds.includes(r.kind)
          ? { width: r.width ?? 700, height: r.height ?? 400 }
          : undefined,
        data: {
          resource: r,
          active: event?.resourceId === r.id,
          dropped: event?.type === "drop",
          details,
          architecture,
          online: online(r),
        },
      }));
    return { nodes, edgeZIndex };
  }, [topology.resources, selectedId, event, details, architecture, layer]);
  const links: Link[] = topology.builder
    ? awsRelationships(topology)
    : topology.links.filter(
        (l) =>
          !architecture ||
          (layer === "request" &&
            (l.kind === "request" ||
              l.kind === "replication" ||
              l.kind === "association" ||
              (l.kind === "cross-zone" && crossZone))) ||
          (layer === "scaling" && l.kind === "membership"),
      );
  if (
    !topology.builder &&
    topology.mode === "aws" &&
    (!architecture || layer === "routing")
  ) {
    const addLink = (source: string, target?: string) => {
      if (
        target &&
        topology.resources.some((r) => r.id === target) &&
        !links.some((l) => l.source === source && l.target === target)
      )
        links.push({
          id: `logical-${source}-${target}`,
          source,
          target,
          ...(architecture
            ? {
                sourceHandle: "out-right",
                targetHandle: "in-left",
                label: "Route / association",
                kind: "egress" as const,
              }
            : {}),
        });
    };
    for (const r of topology.resources) {
      if (r.kind === "ec2") addLink(r.id, r.sgId);
      if (r.kind === "nat") addLink(r.id, r.eipId);
      if (["ec2", "alb", "rds"].includes(r.kind))
        addLink(
          r.id,
          topology.resources.find((x) => x.id === r.subnetId)?.routeTableId,
        );
      if (r.kind === "routeTable")
        for (const route of r.routes ?? [])
          if (route.target !== "local") addLink(r.id, route.target);
      if (r.kind === "nat") {
        const subnet = topology.resources.find((x) => x.id === r.subnetId);
        const table = topology.resources.find(
          (x) => x.id === subnet?.routeTableId,
        );
        for (const route of table?.routes ?? [])
          if (
            topology.resources.find((x) => x.id === route.target)?.kind ===
            "igw"
          )
            addLink(r.id, route.target);
      }
      if (r.kind === "igw")
        addLink(
          r.id,
          topology.resources.find((x) => x.kind === "internet")?.id,
        );
    }
  }
  const edges: Edge[] = links
    .filter(
      (l) =>
        nodes.some((n) => n.id === l.source) &&
        nodes.some((n) => n.id === l.target),
    )
    .map((l) => ({
      ...l,
      type: "packet",
      zIndex: edgeZIndex,
      selected: l.id === selectedEdge,
      deletable:
        !!topology.builder ||
        topology.mode === "local" ||
        (architecture && !l.id.startsWith("logical-")),
      markerEnd:
        architecture || topology.builder
          ? {
              type: MarkerType.ArrowClosed,
              color:
                l.kind === "replication"
                  ? "#e1b86a"
                  : l.kind === "membership"
                    ? "#b399e4"
                    : "#6dbbdc",
              width: 18,
              height: 18,
            }
          : undefined,
      data: {
        architecture: architecture || !!topology.builder,
        builder: !!topology.builder,
        showLabel:
          (architecture || !!topology.builder) &&
          (edgeLabels ||
            l.kind === "replication" ||
            l.id === selectedEdge ||
            l.id === "builder-test-path"),
        color: architecture
          ? l.kind === "replication"
            ? "#e1b86a"
            : l.kind === "membership"
              ? "#b399e4"
              : "#6dbbdc"
          : undefined,
        logical: architecture ? l.kind !== "request" : topology.mode === "aws",
        active:
          event?.type === "forward" &&
          ((event.resourceId === l.source &&
            event.nextResourceId === l.target) ||
            (event.resourceId === l.target &&
              event.nextResourceId === l.source)),
        reverse: event?.resourceId === l.target,
        playing,
        speed,
        step,
      },
    }));
  if (
    event?.nextResourceId &&
    event.type === "forward" &&
    !links.some(
      (l) =>
        (l.source === event.resourceId && l.target === event.nextResourceId) ||
        (l.target === event.resourceId && l.source === event.nextResourceId),
    )
  )
    edges.push({
      id: "trace-hop",
      source: event.resourceId,
      target: event.nextResourceId,
      type: "packet",
      zIndex: edgeZIndex,
      data: { active: true, logical: true, playing, speed, step },
    });
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const kind = e.dataTransfer.getData(
        "application/netverse",
      ) as ResourceKind;
      if (kind in kindLabels) {
        const position = flow.screenToFlowPosition({
          x: e.clientX,
          y: e.clientY,
        });
        if (topology.builder)
          window.dispatchEvent(
            new CustomEvent("aws-add-resource", { detail: { kind, position } }),
          );
        else add(kind, position);
      }
    },
    [add, flow, topology.builder],
  );
  return (
    <>
      {topology.builder && (
        <div className="aws-canvas-options">
          <label>
            <input
              type="checkbox"
              checked={edgeLabels}
              onChange={(e) => setEdgeLabels(e.target.checked)}
            />
            Relationship labels
          </label>
          <button
            className="secondary"
            disabled={!selectedId}
            onClick={() =>
              flow.fitView({
                nodes: [{ id: selectedId! }],
                padding: 0.25,
                maxZoom: 1.3,
                duration: 200,
              })
            }
          >
            Focus selected resource
          </button>
          <span>
            Boundaries show placement. Dashed arrows show configuration or
            intent.
          </span>
        </div>
      )}
      {architecture && (
        <div className="graph-controls">
          <label>
            Connections
            <select
              aria-label="Architecture connections"
              value={layer}
              onChange={(e) => {
                setLayer(e.target.value);
                useLab.setState({ selectedId: undefined });
              }}
            >
              <option value="request">Request flow</option>
              <option value="routing">Routing &amp; NAT</option>
              <option value="scaling">Auto Scaling groups</option>
            </select>
          </label>
          <label className="graph-checkbox">
            <input
              type="checkbox"
              checked={edgeLabels}
              onChange={(e) => setEdgeLabels(e.target.checked)}
            />{" "}
            Link labels
          </label>
          {layer === "request" && (
            <label className="graph-checkbox">
              <input
                type="checkbox"
                checked={crossZone}
                onChange={(e) => setCrossZone(e.target.checked)}
              />{" "}
              Cross-zone paths
            </label>
          )}
          <div
            className="graph-focus"
            role="group"
            aria-label="Focus an availability zone"
          >
            {["a", "b"].map((z) => (
              <button
                className="secondary"
                key={z}
                onClick={() => {
                  void flow
                    .fitView({
                      nodes: topology.resources
                        .filter((r) => visible(r) && belongsTo(r, `az-${z}`))
                        .map((r) => ({ id: r.id })),
                      padding: 0.08,
                      duration: 250,
                    })
                    .then(() => {
                      if (!expanded)
                        canvas.current?.scrollIntoView({
                          block: "center",
                          behavior: "auto",
                        });
                    });
                }}
              >
                Focus AZ {z.toUpperCase()}
              </button>
            ))}
          </div>
          <label>
            Inspect a resource
            <select
              aria-label="Inspect architecture resource"
              value={selectedId ?? ""}
              onChange={(e) =>
                useLab.setState({ selectedId: e.target.value || undefined })
              }
            >
              <option value="">Select a node…</option>
              {topology.resources.filter(visible).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
      <div
        ref={canvas}
        className={`canvas-wrap ${topology.builder ? "aws-builder-canvas" : ""} ${topology.mode === "aws" ? "cloud-canvas" : ""} ${architecture ? "three-tier-canvas" : ""}`}
        onDrop={onDrop}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        }}
      >
        <div className="canvas-topline">
          <span>
            <i className="dot green" />
            {architecture
              ? "Three-tier node graph"
              : topology.mode === "aws"
                ? "Cloud network"
                : "Local network"}
            <b>/</b>
            {
              topology.resources.filter((r) => !containerKinds.includes(r.kind))
                .length
            }{" "}
            resources
          </span>
          <div>
            <button
              title="Toggle network details"
              aria-label="Toggle network details"
              onClick={() => useLab.setState({ details: !details })}
            >
              {details ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
            <button
              title="Fit diagram inside this view"
              aria-label="Fit diagram"
              onClick={() =>
                flow.fitView({ padding: fitPadding, duration: 300 })
              }
            >
              <Maximize size={16} />
              <span>Fit diagram</span>
            </button>
          </div>
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          zIndexMode="manual"
          fitView
          fitViewOptions={{ padding: fitPadding }}
          minZoom={architecture || topology.builder ? 0.04 : 0.15}
          maxZoom={2}
          colorMode="dark"
          onNodeClick={(_, node) => {
            useLab.setState({ selectedId: node.id, selectedLinkId: undefined });
            setSelectedEdge(undefined);
          }}
          onPaneClick={() => {
            useLab.setState({
              selectedId: undefined,
              selectedLinkId: undefined,
            });
            setSelectedEdge(undefined);
          }}
          onEdgeClick={(_, edge) => {
            setSelectedEdge(edge.id);
            useLab.setState({
              selectedId: undefined,
              selectedLinkId: topology.builder ? edge.id : undefined,
            });
          }}
          onNodeDrag={(_, node) =>
            useLab.setState((s) => ({
              topology: {
                ...s.topology,
                resources: s.topology.resources.map((r) =>
                  r.id === node.id
                    ? { ...r, x: node.position.x, y: node.position.y }
                    : r,
                ),
              },
            }))
          }
          onNodeDragStart={() =>
            useLab.setState((s) => ({
              past: [...s.past.slice(-39), structuredClone(s.topology)],
              future: [],
            }))
          }
          onNodeDragStop={(_, node) => {
            useLab.setState((s) => ({
              topology: {
                ...s.topology,
                resources: s.topology.resources.map((r) =>
                  r.id === node.id
                    ? { ...r, x: node.position.x, y: node.position.y }
                    : r,
                ),
              },
            }));
          }}
          onConnect={(c) => {
            if (c.source && c.target) connect(c.source, c.target);
          }}
          onEdgesDelete={(es) =>
            useLab.getState().edit((t) => {
              if (t.builder) {
                es.forEach((e) => removeAwsRelationship(t, e.id));
                return;
              }
              t.links = t.links.filter((l) => !es.some((e) => e.id === l.id));
            })
          }
          onNodesDelete={(ns) =>
            ns.forEach((n) => useLab.getState().remove(n.id))
          }
          deleteKeyCode={["Backspace", "Delete"]}
          onNodesChange={(changes) => {
            for (const c of changes)
              if (
                c.type === "dimensions" &&
                c.resizing === false &&
                c.dimensions
              ) {
                const r = topology.resources.find((r) => r.id === c.id);
                if (
                  r &&
                  containerKinds.includes(r.kind) &&
                  (r.width !== c.dimensions.width ||
                    r.height !== c.dimensions.height)
                )
                  update(r.id, {
                    width: c.dimensions.width,
                    height: c.dimensions.height,
                  });
              }
          }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={22}
            size={1}
            color="#263348"
          />
          <Controls
            showInteractive={false}
            fitViewOptions={{ padding: fitPadding }}
          />
          <MiniMap
            pannable
            zoomable
            nodeColor={(n) =>
              containerKinds.includes((n.data as LabNode["data"]).resource.kind)
                ? "#17283a"
                : "#3b6d89"
            }
            maskColor="#0b101bcc"
          />
        </ReactFlow>
        {topology.resources.length === 0 && (
          <div className="canvas-empty">
            <ResourceIcon kind="vpc" size={36} />
            <h3>A network starts with one connection.</h3>
            <p>Drag a component from the library, or click to add it.</p>
          </div>
        )}
        <div className="canvas-hint">
          <MousePointer2 size={12} /> Drag to move · Scroll to zoom · Use
          Connect nodes above
        </div>
      </div>
    </>
  );
}
export function NetworkCanvas() {
  return (
    <ReactFlowProvider>
      <ConnectionTools />
      <CanvasInner />
    </ReactFlowProvider>
  );
}
