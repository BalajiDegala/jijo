import { containerKinds } from "./types";
import type { Resource, Topology } from "./types";
import { builderConnection } from "./awsRelationships";

type ConnectionKind =
  "cable" | "route" | "security" | "eip" | "diagram" | "builder";
export type ConnectionPlan =
  | { kind: "blocked"; message: string }
  | {
      kind: ConnectionKind;
      source: Resource;
      target: Resource;
      message: string;
    };

/** Used by both the connection form and the canvas handles. */
export function planConnection(
  topology: Topology,
  source: string,
  target: string,
): ConnectionPlan {
  if (topology.builder) {
    const plan = builderConnection(topology, source, target);
    return plan.allowed && plan.source && plan.target
      ? {
          kind: "builder",
          source: plan.source,
          target: plan.target,
          message: plan.message,
        }
      : { kind: "blocked", message: plan.message };
  }
  const a = topology.resources.find((r) => r.id === source);
  const b = topology.resources.find((r) => r.id === target);
  const blocked = (message: string): ConnectionPlan => ({
    kind: "blocked",
    message,
  });
  if (!a || !b) return blocked("Choose two nodes that are on the canvas.");
  if (a.id === b.id)
    return blocked(
      "Choose two different nodes. A node cannot connect to itself.",
    );
  if (containerKinds.includes(a.kind) || containerKinds.includes(b.kind))
    return blocked(
      "Regions, VPCs, availability zones, and subnets group resources. Use their settings to change membership and associations.",
    );

  if (topology.mode === "local") {
    if (
      topology.links.some(
        (link) =>
          (link.source === source && link.target === target) ||
          (link.source === target && link.target === source),
      )
    )
      return blocked(
        `${a.name} and ${b.name} already have a cable. Use Send packet to test the connection.`,
      );
    return {
      kind: "cable",
      source: a,
      target: b,
      message: `Add a cable between ${a.name} and ${b.name}. It carries traffic in both directions; IP addresses, routes, and security settings still determine whether data arrives.`,
    };
  }

  // Associations have a direction, but users can choose the pair in either order.
  const pair = [a, b];
  const table = pair.find((r) => r.kind === "routeTable");
  const gateway = pair.find((r) => r.kind === "igw" || r.kind === "nat");
  const instance = pair.find((r) => r.kind === "ec2");
  const security = pair.find((r) => r.kind === "sg");
  const nat = pair.find((r) => r.kind === "nat");
  const eip = pair.find((r) => r.kind === "eip");
  const vpcOf = (resource: Resource) =>
    resource.vpcId ??
    topology.resources.find((r) => r.id === resource.subnetId)?.vpcId;
  if ((table && gateway) || (instance && security)) {
    if (vpcOf(a) && vpcOf(b) && vpcOf(a) !== vpcOf(b))
      return blocked(
        "These resources belong to different VPCs. Choose resources in the same VPC for this association.",
      );
  }
  if (table && gateway) {
    const defaults = (table.routes ?? []).filter(
      (r) => r.destination === "0.0.0.0/0",
    );
    if (
      defaults.length === 1 &&
      defaults[0].target === gateway.id &&
      defaults[0].enabled
    )
      return blocked(
        `${table.name} already uses ${gateway.name} for its default route.`,
      );
    return {
      kind: "route",
      source: table,
      target: gateway,
      message: `Set the default route (0.0.0.0/0) in ${table.name} to ${gateway.name}. Destinations without a more specific route use this gateway.${defaults.length ? " This replaces the current default route." : ""}`,
    };
  }
  if (instance && security) {
    if (instance.sgId === security.id)
      return blocked(`${instance.name} already uses ${security.name}.`);
    return {
      kind: "security",
      source: instance,
      target: security,
      message: `Assign ${security.name} to ${instance.name}. Its rules control allowed traffic.${instance.sgId ? " This replaces the instance's current security group in this lab." : ""}`,
    };
  }
  if (nat && eip) {
    if (nat.eipId === eip.id)
      return blocked(`${nat.name} already uses ${eip.name}.`);
    return {
      kind: "eip",
      source: nat,
      target: eip,
      message: `Assign ${eip.name} to ${nat.name} as its public address.${nat.eipId ? " This replaces its current Elastic IP association." : ""}`,
    };
  }
  if (topology.diagram === "three-tier") {
    if (vpcOf(a) && vpcOf(b) && vpcOf(a) !== vpcOf(b))
      return blocked(
        "Choose resources in the same VPC for an architecture connection.",
      );
    if (topology.links.some((l) => l.source === source && l.target === target))
      return blocked(
        "These nodes already have a connection in this direction.",
      );
    return {
      kind: "diagram",
      source: a,
      target: b,
      message: `Draw a logical connection from ${a.name} to ${b.name}. This describes the architecture; it does not configure a load balancer or simulate a request.`,
    };
  }
  return blocked(
    "This cloud pair cannot be joined directly. Choose a route table and gateway, an EC2 instance and security group, or a NAT gateway and Elastic IP. Use the resource settings for other associations.",
  );
}
