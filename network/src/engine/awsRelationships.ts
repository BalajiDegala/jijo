import { groupsOf, vpcOf } from "./awsBuilder";
import { newId } from "./deviceEngine";
import type { Link, Resource, Topology } from "./types";

export interface AwsRelationship extends Link {
  relation:
    | "security"
    | "acl"
    | "table"
    | "route"
    | "attachment"
    | "eip"
    | "peer"
    | "membership"
    | "intent";
  ownerId: string;
  memberId?: string;
  routeId?: string;
}
export function awsRelationships(t: Topology): AwsRelationship[] {
  const relations: AwsRelationship[] = [];
  const add = (
    r: Resource,
    target: string | undefined,
    relation: AwsRelationship["relation"],
    label: string,
    routeId?: string,
  ) => {
    if (target && t.resources.some((x) => x.id === target))
      relations.push({
        id: `rel:${relation}:${r.id}:${routeId || target}`,
        source: r.id,
        target,
        ownerId: r.id,
        memberId: target,
        relation,
        label,
        kind: "association",
        routeId,
      });
  };
  for (const r of t.resources) {
    if (r.kind === "subnet") {
      add(r, r.routeTableId, "table", "Route-table association");
      add(r, r.naclId, "acl", "Subnet ACL policy");
    }
    for (const id of groupsOf(r))
      add(r, id, "security", "Security policy · not a hop");
    if (r.kind === "igw" || r.kind === "vgw")
      add(r, r.vpcId, "attachment", "VPC attachment");
    if (r.kind === "nat") add(r, r.eipId, "eip", "Public address association");
    if (r.kind === "peering") {
      add(r, r.vpcId, "attachment", "Requester VPC");
      add(r, r.peerVpcId, "peer", "Peer VPC · routes required");
    }
    for (const route of r.routes || [])
      if (route.target !== "local")
        add(
          r,
          route.target,
          "route",
          `${route.destination}${route.enabled ? "" : " (disabled)"}`,
          route.id,
        );
    for (const id of r.relatedIds || [])
      add(
        r,
        id,
        "membership",
        `${r.kind === "tgw" || r.kind === "vpn" ? "Attachment" : "Service relationship"} · configuration required`,
      );
  }
  for (const link of t.links)
    relations.push({ ...link, relation: "intent", ownerId: link.id });
  if (
    t.builder?.showPath &&
    t.resources.some((r) => r.id === t.builder?.sourceId) &&
    t.resources.some((r) => r.id === t.builder?.targetId) &&
    t.builder.sourceId !== t.builder.targetId
  )
    relations.push({
      id: "builder-test-path",
      source: t.builder.sourceId,
      target: t.builder.targetId,
      ownerId: "builder-test-path",
      relation: "intent",
      kind: "request",
      label: "Logical path · routing and security checks required",
    });
  return relations;
}
export function builderConnection(t: Topology, source: string, target: string) {
  const a = t.resources.find((r) => r.id === source),
    b = t.resources.find((r) => r.id === target);
  const no = (message: string) => ({
    allowed: false,
    message,
    relation: "intent" as AwsRelationship["relation"],
    source: a,
    target: b,
  });
  if (!a || !b || a.id === b.id)
    return no("Choose two different resources on the canvas.");
  const pair = [a, b];
  const find = (kind: Resource["kind"]) => pair.find((r) => r.kind === kind);
  let owner: Resource | undefined,
    member: Resource | undefined,
    relation: AwsRelationship["relation"] = "intent",
    message = "";
  const subnet = find("subnet"),
    table = find("routeTable"),
    sg = find("sg"),
    ec2 = find("ec2"),
    secured = pair.find((r) => ["ec2", "alb", "nlb", "rds"].includes(r.kind) || (r.kind === "endpoint" && r.endpointType === "interface")),
    nacl = find("nacl"),
    nat = find("nat"),
    eip = find("eip"),
    vpc = find("vpc"),
    igw = find("igw") || find("vgw"),
    gateway =
      find("igw") || nat || find("peering") || find("tgw") || find("vgw");
  if (subnet && table) {
    owner = subnet;
    member = table;
    relation = "table";
    message =
      "Associate the subnet with this route table. A route table is a routing policy, not a physical hop.";
  } else if (subnet && nacl) {
    owner = subnet;
    member = nacl;
    relation = "acl";
    message =
      "Associate the subnet with this stateless network ACL. This replaces its previous ACL association.";
  } else if (secured && sg) {
    owner = secured;
    member = sg;
    relation = "security";
    message =
      "Attach this security group to the resource. Its allow rules are combined with the resource's other groups; no route is created.";
  } else if (table && gateway) {
    owner = table;
    member = gateway;
    relation = "route";
    message =
      "Add a default route to this gateway. Edit its destination CIDR in the route table; adding a route does not grant security access.";
  } else if (nat && eip) {
    owner = nat;
    member = eip;
    relation = "eip";
    message = "Associate this Elastic IP with the public NAT gateway.";
  } else if (vpc && igw) {
    owner = igw;
    member = vpc;
    relation = "attachment";
    message =
      "Attach the gateway to this VPC. Routes and security must still be configured.";
  } else if (find("peering") && vpc) {
    owner = find("peering");
    member = vpc;
    relation = "peer";
    message =
      "Select the peer VPC. Peering requires non-overlapping CIDRs, acceptance and routes on both sides; it is not transitive.";
  } else if (
    (find("tgw") && vpc) ||
    (find("vpn") && find("cgw")) ||
    (find("asg") && subnet) ||
    ((find("alb") || find("nlb")) && ec2) ||
    (find("endpoint") && (find("s3") || subnet)) ||
    (find("route53") && (find("alb") || find("nlb"))) ||
    find("cloudwatch")
  ) {
    owner =
      find("tgw") ||
      find("vpn") ||
      find("asg") ||
      find("endpoint") ||
      find("route53") ||
      find("cloudwatch") ||
      find("alb") ||
      find("nlb");
    member = pair.find((r) => r.id !== owner?.id);
    relation = "membership";
    message =
      "Record this service relationship. Configure the service-specific attachments, listeners, policies or monitoring in AWS; this relationship is not a tested network path.";
  } else if (a.kind === "ec2" && b.kind === "ec2") {
    owner = a;
    member = b;
    message =
      "Draw communication intent between these instances. Routing, security and host settings independently determine whether the modeled test passes.";
  }
  if (!owner || !member)
    return no(
      "This pair has no supported direct relationship. Use the properties panel for placement; policies and services are not physical cables.",
    );
  const av = vpcOf(t, owner),
    bv = vpcOf(t, member);
  if (
    ["table", "acl", "security", "route", "intent"].includes(relation) &&
    (!av || ((!bv || av.id !== bv.id) && !(relation === "route" && (member.kind === "tgw" ? member.relatedIds?.includes(av.id) : member.kind === "peering" && member.peerVpcId === av.id))))
  )
    return no(
      "This relationship requires resources in the same VPC in this lab.",
    );
  if (relation === "peer" && owner.vpcId === member.id)
    return no("Choose a different VPC for the peer.");
  if (relation === "membership" && av && bv && av.id !== bv.id) return no("This service relationship must remain in one VPC in this lab.");
  if (owner.kind === "endpoint" && member.kind === "subnet" && owner.endpointType !== "interface") return no("Gateway endpoints use route-table associations, not subnet interfaces. Choose an interface endpoint for subnet placement.");
  if (relation === "eip" && owner.natType === "private") return no("Private NAT gateways do not use Elastic IP addresses.");
  if (
    awsRelationships(t).some(
      (r) =>
        r.source === owner!.id &&
        r.target === member!.id &&
        r.relation === relation,
    )
  )
    return no(
      "This relationship already exists. Select its label to inspect or remove it.",
    );
  return { allowed: true, message, relation, source: owner, target: member };
}
export function connectAwsResources(
  t: Topology,
  source: string,
  target: string,
) {
  const plan = builderConnection(t, source, target);
  if (!plan.allowed || !plan.source || !plan.target)
    throw new Error(plan.message);
  const a = plan.source,
    b = plan.target;
  switch (plan.relation) {
    case "table":
      a.routeTableId = b.id;
      break;
    case "acl":
      a.naclId = b.id;
      break;
    case "security":
      a.sgIds = [...new Set([...groupsOf(a), b.id])];
      a.sgId = a.sgIds[0];
      break;
    case "eip":
      a.eipId = b.id;
      break;
    case "attachment":
      a.vpcId = b.id;
      break;
    case "peer":
      a.peerVpcId = b.id;
      break;
    case "membership":
      a.relatedIds = [...new Set([...(a.relatedIds || []), b.id])];
      break;
    case "route":
      a.routes = [
        ...(a.routes || []).filter((r) => r.destination !== "0.0.0.0/0"),
        { id: newId(), destination: "0.0.0.0/0", target: b.id, enabled: true },
      ];
      break;
    case "intent":
      t.links.push({
        id: newId(),
        source: a.id,
        target: b.id,
        kind: "association",
        label: "Communication intent · not verified",
      });
      break;
  }
}
export function removeAwsRelationship(t: Topology, id: string) {
  if (id === "builder-test-path" && t.builder) {
    t.builder.showPath = false;
    return;
  }
  const relation = awsRelationships(t).find((r) => r.id === id);
  const owner = t.resources.find((r) => r.id === relation?.ownerId);
  if (!relation) return;
  if (relation.relation === "intent") {
    t.links = t.links.filter((r) => r.id !== id);
    return;
  }
  if (!owner) return;
  switch (relation.relation) {
    case "table":
      owner.routeTableId = undefined;
      break;
    case "acl":
      owner.naclId = undefined;
      break;
    case "security":
      owner.sgIds = groupsOf(owner).filter((x) => x !== relation.memberId);
      owner.sgId = owner.sgIds[0];
      break;
    case "route":
      owner.routes = owner.routes?.filter((r) => r.id !== relation.routeId);
      break;
    case "attachment":
      owner.vpcId = undefined;
      break;
    case "eip":
      owner.eipId = undefined;
      break;
    case "peer":
      owner.peerVpcId = undefined;
      break;
    case "membership":
      owner.relatedIds = owner.relatedIds?.filter(
        (id) => id !== relation.memberId,
      );
      break;
  }
}
