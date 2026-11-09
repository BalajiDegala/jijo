import type { Node, Edge } from "@xyflow/react";
import { Project, Resource, references, isRef } from "./model";
import { schemaFor } from "./registry";
import { internetPath, validate, target } from "./validation";
import type { View } from "./store";
export function graph(
  p: Project,
  view: View,
  selected: string | null,
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [],
    edges: Edge[] = [];
  const issues = validate(p);
  const data = (r: Resource) => ({
    resource: r,
    label: r.name,
    color: schemaFor(r.type)?.color,
    issues: issues.filter((i) => i.resource === r.id),
    selected: r.id === selected,
    dependencies: references(r.args).length,
  });
  const node = (r: Resource, x: number, y: number, parentId?: string) =>
    nodes.push({
      id: r.id,
      type: "resource",
      position: r.layouts?.[view] ?? { x, y },
      data: data(r),
      parentId,
      extent: parentId ? "parent" : undefined,
      selected: r.id === selected,
      style: { width: 220 },
      zIndex: 5,
    });
  const group = (
    id: string,
    label: string,
    subtitle: string,
    color: string,
    x: number,
    y: number,
    width: number,
    height: number,
    parentId?: string,
    r?: Resource,
  ) =>
    nodes.push({
      id,
      type: "container",
      position: { x, y },
      parentId,
      extent: parentId ? "parent" : undefined,
      draggable: false,
      selectable: !!r,
      data: {
        label,
        subtitle,
        color,
        resource: r,
        selected: r?.id === selected,
      },
      style: { width, height },
      zIndex: 0,
    });
  const edge = (
    source: string,
    targetId: string,
    label: string,
    color = "#62748a",
    animated = false,
  ) => {
    if (
      nodes.some((n) => n.id === source) &&
      nodes.some((n) => n.id === targetId)
    )
      edges.push({
        id: `${source}-${targetId}-${label}`,
        source,
        target: targetId,
        label,
        type: "smoothstep",
        animated,
        style: {
          stroke: color,
          strokeWidth: 1.4,
          opacity:
            selected && selected !== source && selected !== targetId
              ? 0.3
              : 0.8,
        },
        labelStyle: { fill: "#94a3b8", fontSize: 10 },
        labelBgStyle: { fill: "#101822" },
        zIndex: 0,
      });
  };
  if (view === "dependencies") {
    p.resources.forEach((r, i) =>
      node(r, (i % 4) * 280, Math.floor(i / 4) * 210),
    );
    p.resources.forEach((r) =>
      references(r.args).forEach((v) =>
        edge(r.id, v.ref, v.attr || "depends_on", "#8281e9", selected === r.id),
      ),
    );
    return { nodes, edges };
  }
  if (view === "network") {
    const instances = p.resources.filter((r) => r.type === "aws_instance");
    const placed = new Set<string>();
    instances.forEach((r, j) => {
      const path = internetPath(p, r);
      path.steps.forEach((step, i) => {
        if (!placed.has(step.id)) {
          node(step, i * 290, j * 220);
          placed.add(step.id);
        }
        if (i > 0 && path.reachable)
          edge(path.steps[i - 1].id, step.id, "route", "#31c9ab", true);
      });
    });
    return { nodes, edges };
  }
  const vpcs = p.resources.filter(
    (r) => r.type === "aws_vpc" || r.type === "data.aws_vpc",
  );
  const heights = vpcs.map((v) =>
    Math.max(
      490,
      210 +
        p.resources.filter(
          (s) =>
            ["aws_subnet", "data.aws_subnet"].includes(s.type) &&
            (isRef(s.args.vpc_id)
              ? s.args.vpc_id.ref === v.id
              : v.kind === "data"),
        ).length *
          280,
    ),
  );
  const total = heights.reduce((a, b) => a + b + 30, 0);
  const accountHeight = Math.max(740, total + 180);
  group(
    "account",
    "AWS ACCOUNT",
    "LOCAL WORKSPACE",
    "gray",
    0,
    0,
    930,
    accountHeight,
  );
  group(
    "region",
    p.region,
    "AWS REGION",
    "blue",
    22,
    54,
    886,
    accountHeight - 76,
    "account",
  );
  let vy = 65;
  const placed = new Set<string>();
  vpcs.forEach((v, vi) => {
    const h = heights[vi];
    group(
      v.id,
      v.name,
      String(v.args.cidr_block ?? "Default VPC · read existing"),
      "violet",
      20,
      vy,
      580,
      h,
      "region",
      v,
    );
    placed.add(v.id);
    const subnets = p.resources.filter(
      (s) =>
        ["aws_subnet", "data.aws_subnet"].includes(s.type) &&
        (isRef(s.args.vpc_id) ? s.args.vpc_id.ref === v.id : v.kind === "data"),
    );
    subnets.forEach((s, si) => {
      const az = String(s.args.availability_zone ?? p.region + "a");
      const azid = `az-${s.id}`;
      group(
        azid,
        az,
        "AVAILABILITY ZONE",
        "gray",
        18,
        175 + si * 280,
        274,
        260,
        v.id,
      );
      group(
        s.id,
        s.name,
        String(s.args.cidr_block ?? "Existing subnet"),
        "blue",
        12,
        39,
        250,
        205,
        azid,
        s,
      );
      placed.add(s.id);
      const instances = p.resources.filter(
        (r) =>
          isRef(r.args.subnet_id) &&
          r.args.subnet_id.ref === s.id &&
          r.type === "aws_instance",
      );
      instances.forEach((r, ri) => {
        node(r, 15, 54 + ri * 150, s.id);
        placed.add(r.id);
      });
      if (instances.length > 1) {
        const subnode = nodes.find((n) => n.id === s.id)!;
        subnode.style = {
          width: 250,
          height: Math.max(205, 60 + instances.length * 150),
        };
        const aznode = nodes.find((n) => n.id === azid)!;
        aznode.style = {
          width: 274,
          height: Math.max(260, 110 + instances.length * 150),
        };
        const vn = nodes.find((n) => n.id === v.id)!;
        vn.style = {
          width: 580,
          height: Math.max(h, 285 + instances.length * 150),
        };
      }
    });
    let sgIndex = 0;
    const attached = p.resources.filter(
      (r) =>
        isRef(r.args.vpc_id) &&
        r.args.vpc_id.ref === v.id &&
        !placed.has(r.id) &&
        r.type !== "aws_vpc_peering_connection",
    );
    attached.forEach((r) => {
      const igw = r.type === "aws_internet_gateway";
      node(r, igw ? 30 : 325, igw ? 45 : 50 + sgIndex++ * 165, v.id);
      placed.add(r.id);
    });
    vy += h + 30;
  });
  let outer = 0;
  p.resources
    .filter(
      (r) => !placed.has(r.id) && r.type !== "aws_route_table_association",
    )
    .forEach((r) => {
      node(r, 635, 65 + outer++ * 166, "region");
      placed.add(r.id);
    });
  const region = nodes.find((n) => n.id === "region")!;
  region.style = {
    ...region.style,
    height: Math.max(Number(region.style?.height), outer * 166 + 110),
  };
  nodes[0].style = {
    ...nodes[0].style,
    height: Number(region.style?.height) + 76,
  };
  p.resources
    .filter((r) => r.type === "aws_instance")
    .forEach((r) => {
      for (const v of references(r.args.vpc_security_group_ids ?? []))
        edge(v.ref, r.id, "firewall attachment", "#4daa87");
    });
  return { nodes, edges };
}
export async function dagreLayout(
  nodes: Node[],
  edges: Edge[],
): Promise<Node[]> {
  const w = window as unknown as { dagre?: any };
  if (!w.dagre)
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "/dagre/dagre.min.js";
      s.onload = () => resolve();
      s.onerror = () =>
        reject(
          new Error(
            "Dagre assets are missing. Run npm install to enable automatic dependency layout.",
          ),
        );
      document.head.append(s);
    });
  const g = new w.dagre.graphlib.Graph();
  g.setGraph({ rankdir: "LR", nodesep: 60, ranksep: 100 });
  g.setDefaultEdgeLabel(() => ({}));
  nodes.forEach((n) => g.setNode(n.id, { width: 220, height: 145 }));
  edges.forEach((e) => g.setEdge(e.source, e.target));
  w.dagre.layout(g);
  return nodes.map((n) => ({
    ...n,
    position: { x: g.node(n.id).x - 110, y: g.node(n.id).y - 72 },
  }));
}
