import type { Topology } from "./types";
import { kindLabels } from "./deviceEngine";

export function serialize(t: Topology) {
  return JSON.stringify(t, null, 2);
}
export function deserialize(raw: string): Topology {
  if (raw.length > 2_000_000)
    throw new Error("Project exceeds the 2 MB import limit.");
  const t = JSON.parse(raw) as Topology;
  if (
    !t ||
    t.version !== 1 ||
    !["local", "aws"].includes(t.mode) ||
    typeof t.name !== "string" ||
    !Array.isArray(t.resources) ||
    !Array.isArray(t.links) ||
    typeof t.dns !== "object" ||
    t.dns === null ||
    Array.isArray(t.dns)
  )
    throw new Error("Not a NetVerse v1 project.");
  if (t.resources.length > 500 || t.links.length > 2000)
    throw new Error("Project is too large for this laboratory.");
  const ids = new Set<string>();
  if (t.builder !== undefined) {
    const b = t.builder;
    if (
      b?.guideGenerated !== undefined &&
      typeof b.guideGenerated !== "boolean"
    )
      throw new Error("Invalid guide progress.");
    if (
      !b ||
      t.mode !== "aws" ||
      t.diagram ||
      b.scenarioId !== "two-subnet-ec2" ||
      !["guided", "free"].includes(b.mode) ||
      !Number.isInteger(b.step) ||
      b.step < 0 ||
      b.step > 9 ||
      typeof b.sourceId !== "string" ||
      typeof b.targetId !== "string" ||
      !["ICMP", "TCP"].includes(b.protocol) ||
      !Number.isInteger(b.port) ||
      b.port < 1 ||
      b.port > 65535 ||
      typeof b.showPath !== "boolean" ||
      typeof b.reviewedAcl !== "boolean"
    )
      throw new Error("Invalid AWS learning progress.");
  }
  if (
    t.diagram !== undefined &&
    (t.diagram !== "three-tier" || t.mode !== "aws")
  )
    throw new Error("Invalid architecture diagram type.");
  const kinds = [
    "computer",
    "server",
    "switch",
    "router",
    "firewall",
    "internet",
    "region",
    "az",
    "vpc",
    "subnet",
    "ec2",
    "routeTable",
    "igw",
    "nat",
    "eip",
    "sg",
    "nacl",
    "alb",
    "rds",
    "asg",
    "dbEndpoint",
  ];
  for (const r of t.resources) {
    if (
      !r ||
      typeof r.id !== "string" ||
      ids.has(r.id) ||
      !(kinds.includes(r.kind) || Object.hasOwn(kindLabels, r.kind)) ||
      typeof r.name !== "string" ||
      !Number.isFinite(r.x) ||
      !Number.isFinite(r.y) ||
      typeof r.enabled !== "boolean"
    )
      throw new Error("Project contains an invalid or duplicate resource.");
    ids.add(r.id);
    if (r.forwarding !== undefined && typeof r.forwarding !== "boolean")
      throw new Error("Invalid forwarding state.");
    for (const key of [
      "ip",
      "gateway",
      "mac",
      "cidr",
      "publicIp",
      "parentId",
      "vpcId",
      "subnetId",
      "azId",
      "routeTableId",
      "sgId",
      "naclId",
      "eipId",
      "description",
      "serviceId",
      "regionName",
      "zoneName",
      "instanceType",
      "peerVpcId",
      "serviceName",
      "remoteCidr",
    ] as const)
      if (r[key] !== undefined && typeof r[key] !== "string")
        throw new Error(`Invalid ${key} on ${r.name}.`);
    for (const key of ["sgIds", "relatedIds"] as const)
      if (
        r[key] !== undefined &&
        (!Array.isArray(r[key]) ||
          r[key]!.length > 500 ||
          r[key]!.some((id) => typeof id !== "string"))
      )
        throw new Error(`Invalid ${key}.`);
    for (const key of ["main", "defaultAcl", "publicIpAuto"] as const)
      if (r[key] !== undefined && typeof r[key] !== "boolean")
        throw new Error(`Invalid ${key}.`);
    if (r.os !== undefined && !["Linux", "Windows"].includes(r.os))
      throw new Error("Invalid operating system.");
    if (
      r.osFirewall !== undefined &&
      !["unknown", "allow", "deny"].includes(r.osFirewall)
    )
      throw new Error("Invalid host firewall assumption.");
    for (const key of ["subnetType", "natType"] as const)
      if (r[key] !== undefined && !["public", "private"].includes(r[key]!))
        throw new Error(`Invalid ${key}.`);
    if (
      r.endpointType !== undefined &&
      !["gateway", "interface"].includes(r.endpointType)
    )
      throw new Error("Invalid endpoint type.");
    if (
      r.asn !== undefined &&
      (!Number.isInteger(r.asn) || r.asn < 1 || r.asn > 4294967295)
    )
      throw new Error("Invalid ASN.");
    if (r.role !== undefined && !["primary", "standby"].includes(r.role))
      throw new Error("Invalid database role.");
    if (r.tier !== undefined && !["web", "app"].includes(r.tier))
      throw new Error("Invalid application tier.");
    if (
      r.prefix !== undefined &&
      (!Number.isInteger(r.prefix) || r.prefix < 0 || r.prefix > 32)
    )
      throw new Error("Invalid interface prefix.");
    if (
      r.routes !== undefined &&
      (!Array.isArray(r.routes) ||
        r.routes.some(
          (x) =>
            !x ||
            typeof x.id !== "string" ||
            typeof x.destination !== "string" ||
            typeof x.target !== "string" ||
            typeof x.enabled !== "boolean",
        ))
    )
      throw new Error("Invalid routes.");
    if (
      r.rules !== undefined &&
      (!Array.isArray(r.rules) ||
        r.rules.some(
          (x) =>
            !x ||
            typeof x.id !== "string" ||
            !["inbound", "outbound"].includes(x.direction) ||
            !["ICMP", "TCP", "UDP", "ALL"].includes(x.protocol) ||
            !["allow", "deny"].includes(x.action) ||
            typeof x.cidr !== "string" ||
            (x.securityGroupId !== undefined &&
              typeof x.securityGroupId !== "string") ||
            [x.icmpType, x.icmpCode].some(
              (n) =>
                n !== undefined && (!Number.isInteger(n) || n < -1 || n > 255),
            ) ||
            ![x.priority, x.fromPort, x.toPort].every(Number.isInteger) ||
            x.fromPort < 0 ||
            x.toPort > 65535 ||
            x.fromPort > x.toPort,
        ))
    )
      throw new Error("Invalid security rules.");
    if (
      r.interfaces !== undefined &&
      (!Array.isArray(r.interfaces) ||
        r.interfaces.some(
          (x) =>
            !x ||
            typeof x.id !== "string" ||
            typeof x.ip !== "string" ||
            !Number.isInteger(x.prefix) ||
            x.prefix < 0 ||
            x.prefix > 32,
        ))
    )
      throw new Error("Invalid router interfaces.");
    if (
      r.services !== undefined &&
      (!Array.isArray(r.services) ||
        r.services.some((x) => !Number.isInteger(x) || x < 1 || x > 65535))
    )
      throw new Error("Invalid service ports.");
    if (
      [r.width, r.height].some(
        (x) => x !== undefined && (!Number.isFinite(x) || x < 50 || x > 10000),
      )
    )
      throw new Error("Invalid container size.");
  }
  for (const r of t.resources) {
    const seen = new Set([r.id]);
    let parent = r.parentId;
    while (parent) {
      if (seen.has(parent) || !ids.has(parent))
        throw new Error("Invalid or cyclic container nesting.");
      if (
        !["awsCloud", "region", "vpc", "az", "subnet"].includes(
          t.resources.find((x) => x.id === parent)!.kind,
        )
      )
        throw new Error("Only network containers can have children.");
      seen.add(parent);
      parent = t.resources.find((x) => x.id === parent)?.parentId;
    }
  }
  if (
    new Set(t.links.map((l) => l?.id)).size !== t.links.length ||
    t.links.some(
      (l) =>
        !l ||
        typeof l.id !== "string" ||
        !ids.has(l.source) ||
        !ids.has(l.target) ||
        l.source === l.target,
    )
  )
    throw new Error("Invalid connections.");
  if (Object.values(t.dns).some((ip) => typeof ip !== "string"))
    throw new Error("Invalid DNS records.");
  for (const link of t.links) {
    for (const field of ["label", "sourceHandle", "targetHandle"] as const)
      if (link[field] !== undefined && typeof link[field] !== "string")
        throw new Error("Invalid diagram connection label or handle.");
    if (
      link.kind !== undefined &&
      ![
        "request",
        "cross-zone",
        "replication",
        "membership",
        "association",
        "egress",
      ].includes(link.kind)
    )
      throw new Error("Invalid diagram connection type.");
  }
  return structuredClone(t);
}
export const SAVE_KEY = "netverse.project.v1";
export const AWS_DRAFT_KEY = "netverse.aws-builder.v1";
export function loadAwsDraft(
  storage: Pick<Storage, "getItem">,
): Topology | undefined {
  const raw = storage.getItem(AWS_DRAFT_KEY);
  if (!raw) return;
  const t = deserialize(raw);
  return t.builder ? t : undefined;
}
export function saveProject(t: Topology, storage: Pick<Storage, "setItem">) {
  storage.setItem(SAVE_KEY, serialize(t));
}
export function loadProject(
  storage: Pick<Storage, "getItem">,
): Topology | undefined {
  const raw = storage.getItem(SAVE_KEY);
  return raw ? deserialize(raw) : undefined;
}
