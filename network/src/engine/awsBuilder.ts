import { awsDefinition } from "../data/awsResources";
import { kindLabels, makeResource, newId } from "./deviceEngine";
import {
  contains,
  isAssignable,
  numberToIp,
  overlaps,
  parseCidr,
  subnetWithin,
} from "./ipMathEngine";
import { placeContainer } from "./layoutEngine";
import { containerKinds } from "./types";
import type { Resource, ResourceKind, Rule, Topology } from "./types";

export function newAwsLearningTopology(): Topology {
  return {
    version: 1,
    name: "Two subnets · one VPC",
    mode: "aws",
    resources: [],
    links: [],
    dns: {},
    builder: {
      scenarioId: "two-subnet-ec2",
      mode: "guided",
      step: 0,
      sourceId: "",
      targetId: "",
      protocol: "ICMP",
      port: 8080,
      showPath: false,
      reviewedAcl: false,
    },
  };
}
export const groupsOf = (r?: Resource) => [
  ...new Set([...(r?.sgIds ?? []), ...(r?.sgId ? [r.sgId] : [])]),
];
export function vpcOf(t: Topology, r?: Resource): Resource | undefined {
  if (!r) return;
  if (r.kind === "vpc") return r;
  return t.resources.find(
    (x) =>
      x.id === (r.vpcId ?? t.resources.find((s) => s.id === r.subnetId)?.vpcId),
  );
}
export function defaultPolicyRule(
  direction: Rule["direction"],
  cidr = "0.0.0.0/0",
): Rule {
  return {
    id: newId(),
    direction,
    protocol: "ALL",
    fromPort: 0,
    toPort: 65535,
    cidr,
    action: "allow",
    priority: 100,
  };
}
export interface AddAwsOptions {
  parentId?: string;
  name?: string;
  cidr?: string;
  zone?: string;
  subnetType?: "private" | "public";
  sgId?: string;
}

/** Creates dependencies that AWS itself creates, and never grants inbound EC2 access. */
export function addAwsResource(
  t: Topology,
  kind: ResourceKind,
  options: AddAwsOptions = {},
): Resource {
  const definition = awsDefinition(kind);
  if (!definition)
    throw new Error("This resource is not in the AWS builder catalog.");
  let parent = t.resources.find((r) => r.id === options.parentId);
  if (kind === "vpc" && !parent) {
    parent = t.resources.find((r) => r.kind === "region");
    if (!parent) parent = addAwsResource(t, "region", { name: "us-east-1" });
  }
  if (kind === "region" && !parent) {
    parent =
      t.resources.find((r) => r.kind === "awsCloud") ??
      addAwsResource(t, "awsCloud");
  }
  if (
    definition.parentKinds.length &&
    (!parent || !definition.parentKinds.includes(parent.kind))
  )
    throw new Error(
      `Choose a ${definition.parentKinds.map((k) => kindLabels[k]).join(" or ")} before adding ${definition.name}.`,
    );
  const count = t.resources.filter((r) => r.kind === kind).length;
  const r = makeResource(kind, count + 1);
  r.name =
    options.name?.trim() ||
    (kind === "subnet"
      ? `Subnet-${String.fromCharCode(65 + count)}`
      : kind === "ec2"
        ? `EC2-${String.fromCharCode(65 + count)}`
        : kind === "awsCloud"
          ? "AWS Cloud"
          : `${kindLabels[kind]} ${count + 1}`);
  r.description = definition.description;
  if (parent && containerKinds.includes(parent.kind)) r.parentId = parent.id;
  const vpc = vpcOf(t, parent);
  if (vpc) r.vpcId = vpc.id;
  if (kind === "region") r.regionName = options.name || "us-east-1";
  if (kind === "vpc") {
    r.cidr = options.cidr || `10.${count}.0.0/16`;
    const cidr = parseCidr(r.cidr);
    if (cidr.prefix < 16 || cidr.prefix > 28)
      throw new Error("A VPC IPv4 CIDR must use /16 through /28.");
    r.cidr = cidr.canonical;
    r.regionName = parent?.regionName || "us-east-1";
  }
  if (kind === "az")
    r.zoneName =
      options.zone ||
      `${vpc?.regionName || "us-east-1"}${String.fromCharCode(97 + (count % 3))}`;
  if (kind === "subnet") {
    const block = parseCidr(vpc!.cidr!);
    const prefix = Math.max(24, block.prefix);
    const size = 2 ** (32 - prefix);
    let start = block.start + (block.prefix < 24 ? size : 0);
    while (
      start + size - 1 <= block.end &&
      t.resources.some(
        (x) =>
          x.kind === "subnet" &&
          x.vpcId === vpc!.id &&
          x.cidr &&
          overlaps(x.cidr, `${numberToIp(start)}/${prefix}`),
      )
    )
      start += size;
    r.cidr = options.cidr || `${numberToIp(start)}/${prefix}`;
    const subnet = parseCidr(r.cidr);
    if (
      subnet.prefix < 16 ||
      subnet.prefix > 28 ||
      !subnetWithin(r.cidr, vpc!.cidr!)
    )
      throw new Error(
        "The subnet CIDR must fit inside its VPC (/16 through /28).",
      );
    if (
      t.resources.some(
        (x) =>
          x.kind === "subnet" &&
          x.vpcId === vpc!.id &&
          x.cidr &&
          overlaps(x.cidr, r.cidr!),
      )
    )
      throw new Error("This subnet CIDR overlaps another subnet in the VPC.");
    r.cidr = subnet.canonical;
    const zone = options.zone || `${vpc!.regionName || "us-east-1"}a`;
    const az =
      t.resources.find(
        (x) => x.kind === "az" && x.vpcId === vpc!.id && x.zoneName === zone,
      ) ?? addAwsResource(t, "az", { parentId: vpc!.id, zone, name: zone });
    r.parentId = az.id;
    r.azId = az.id;
    r.zoneName = zone;
    r.subnetType = options.subnetType || "private";
    r.routeTableId = t.resources.find(
      (x) => x.kind === "routeTable" && x.vpcId === vpc!.id && x.main,
    )?.id;
    r.naclId = t.resources.find(
      (x) => x.kind === "nacl" && x.vpcId === vpc!.id && x.defaultAcl,
    )?.id;
  }
  if (["ec2", "nat", "alb", "nlb", "rds"].includes(kind)) {
    r.subnetId = parent!.id;
    const block = parseCidr(parent!.cidr!);
    let address = Math.min(block.start + 10, block.end - 1);
    while (
      address < block.end &&
      t.resources.some(
        (x) => vpcOf(t, x)?.id === vpc?.id && x.ip === numberToIp(address),
      )
    )
      address++;
    if (!isAssignable(numberToIp(address), parent!.cidr!, true))
      throw new Error(
        "No available address remains in this subnet. Choose another subnet.",
      );
    r.ip = numberToIp(address);
    r.prefix = block.prefix;
  }
  if (kind === "ec2") {
    r.os = "Linux";
    r.instanceType = "t3.micro";
    r.osFirewall = "unknown";
    r.publicIpAuto = false;
    r.services = [8080];
    const sg = options.sgId
      ? t.resources.find(
          (x) =>
            x.id === options.sgId && x.kind === "sg" && x.vpcId === vpc?.id,
        )
      : addAwsResource(t, "sg", { parentId: vpc!.id, name: `${r.name}-SG` });
    if (!sg) throw new Error("Choose a security group in the instance's VPC.");
    r.sgId = sg.id;
    r.sgIds = [sg.id];
  }
  if (kind === "routeTable")
    r.routes = [
      { id: newId(), destination: vpc!.cidr!, target: "local", enabled: true },
    ];
  if (kind === "sg") r.rules = [defaultPolicyRule("outbound")];
  if (kind === "nacl") r.rules = [];
  if (kind === "nat") r.natType = "public";
  if (kind === "endpoint") {
    r.endpointType = "gateway";
    r.serviceName = "s3";
  }
  if (kind === "cgw") r.asn = 65000;
  if (kind === "vpn") {
    r.relatedIds = [parent!.id];
    r.parentId = parent!.parentId;
  }
  t.resources.push(r);
  if (kind === "vpc") {
    const table = addAwsResource(t, "routeTable", {
      parentId: r.id,
      name: `${r.name} main routes`,
    });
    table.main = true;
    const acl = addAwsResource(t, "nacl", {
      parentId: r.id,
      name: `${r.name} default ACL`,
    });
    acl.defaultAcl = true;
    acl.rules = [defaultPolicyRule("inbound"), defaultPolicyRule("outbound")];
  }
  placeContainer(r, t.resources);
  if (kind === "ec2" && t.builder) {
    if (!t.builder.sourceId) t.builder.sourceId = r.id;
    else if (!t.builder.targetId) t.builder.targetId = r.id;
  }
  return r;
}

/** Explicit arrangement only; every sibling receives its own box. */
export function arrangeAws(t: Topology) {
  function layout(parentId?: string): { width: number; height: number } {
    const children = t.resources.filter((r) => r.parentId === parentId);
    let y = parentId ? 70 : 90,
      width = 320;
    // Keep subnet/zone boundaries together, with policy cards in a wider row.
    const groups = [
      children.filter((r) => containerKinds.includes(r.kind)),
      children.filter((r) => !containerKinds.includes(r.kind)),
    ].filter((group) => group.length);
    groups.forEach((group, groupIndex) => {
      let x = 30,
        rowHeight = 0;
      const columns = containerKinds.includes(group[0].kind) ? 2 : 4;
      group.forEach((r, i) => {
        const dimensions = containerKinds.includes(r.kind)
          ? layout(r.id)
          : {
              width: 230,
              height: ["sg", "nacl", "routeTable"].includes(r.kind) ? 140 : 190,
            };
        if (i > 0 && i % columns === 0) {
          x = 30;
          y += rowHeight + 35;
          rowHeight = 0;
        }
        r.x = x;
        r.y = y;
        if (containerKinds.includes(r.kind)) {
          r.width = Math.max(320, dimensions.width);
          r.height = Math.max(240, dimensions.height);
        }
        const w =
          r.width && containerKinds.includes(r.kind)
            ? r.width
            : dimensions.width;
        const h =
          r.height && containerKinds.includes(r.kind)
            ? r.height
            : dimensions.height;
        width = Math.max(width, x + w + 30);
        rowHeight = Math.max(rowHeight, h);
        x += w + 35;
      });
      y += rowHeight + (groupIndex < groups.length - 1 ? 35 : 0);
    });
    return { width, height: y + 40 };
  }
  layout();
}

export function suggestedAwsAction(t: Topology): string {
  if (!t.resources.some((r) => r.kind === "vpc"))
    return "Start with Add VPC. AWS also creates its main route table and default network ACL.";
  if (t.resources.filter((r) => r.kind === "subnet").length < 2)
    return "Next, create two non-overlapping subnets inside the same VPC.";
  const emptySubnet = t.resources.find(
    (r) =>
      r.kind === "subnet" &&
      !t.resources.some((x) => x.kind === "ec2" && x.subnetId === r.id),
  );
  if (emptySubnet)
    return `Next, launch an EC2 instance in ${emptySubnet.name}.`;
  return "Select the two test instances, review their security rules and host firewall assumptions, then check your architecture.";
}

export function updateAwsResource(
  t: Topology,
  id: string,
  patch: Partial<Resource>,
) {
  const r = t.resources.find((x) => x.id === id);
  if (!r) return;
  const oldCidr = r.cidr,
    oldParent = r.parentId;
  Object.assign(r, patch);
  if (
    r.kind === "region" ||
    (r.kind === "vpc" && patch.parentId !== undefined)
  ) {
    const vpcs =
      r.kind === "vpc"
        ? [r]
        : t.resources.filter((x) => x.kind === "vpc" && x.parentId === r.id);
    for (const vpc of vpcs) {
      const region = t.resources.find(
        (x) => x.id === vpc.parentId && x.kind === "region",
      );
      if (!region) throw new Error("Choose a valid Region.");
      vpc.regionName = region.regionName;
      for (const zone of t.resources.filter(
        (x) => x.kind === "az" && x.vpcId === vpc.id,
      )) {
        zone.zoneName = `${region.regionName || "us-east-1"}${zone.zoneName?.slice(-1) || "a"}`;
        t.resources
          .filter((x) => x.azId === zone.id)
          .forEach((x) => {
            x.zoneName = zone.zoneName;
          });
      }
    }
  }
  if (patch.sgIds) r.sgId = patch.sgIds[0];
  if (patch.subnetId !== undefined) {
    const subnet = t.resources.find(
      (x) => x.id === patch.subnetId && x.kind === "subnet",
    );
    if (!subnet) throw new Error("Choose a valid subnet.");
    r.parentId = subnet.id;
    r.vpcId = subnet.vpcId;
  }
  if (
    r.kind === "subnet" &&
    (patch.vpcId !== undefined || patch.azId !== undefined)
  ) {
    const vpc = t.resources.find((x) => x.id === r.vpcId && x.kind === "vpc");
    if (!vpc) throw new Error("Choose a valid VPC.");
    let zone = t.resources.find(
      (x) => x.id === r.azId && x.kind === "az" && x.vpcId === vpc.id,
    );
    if (!zone)
      zone =
        t.resources.find((x) => x.kind === "az" && x.vpcId === vpc.id) ??
        addAwsResource(t, "az", { parentId: vpc.id });
    r.azId = zone.id;
    r.zoneName = zone.zoneName;
    r.parentId = zone.id;
    if (patch.vpcId !== undefined) {
      r.routeTableId = t.resources.find(
        (x) => x.kind === "routeTable" && x.vpcId === vpc.id && x.main,
      )?.id;
      r.naclId = t.resources.find(
        (x) => x.kind === "nacl" && x.vpcId === vpc.id && x.defaultAcl,
      )?.id;
      t.resources
        .filter((x) => x.subnetId === r.id)
        .forEach((x) => {
          x.vpcId = vpc.id;
        });
    }
  }
  if (r.kind === "vpc" && patch.cidr !== undefined) {
    t.resources
      .filter((x) => x.kind === "routeTable" && x.vpcId === r.id)
      .forEach((table) => {
        table.routes = table.routes?.map((route) =>
          route.target === "local" && route.destination === oldCidr
            ? { ...route, destination: r.cidr! }
            : route,
        );
      });
  }
  if (r.parentId !== oldParent) {
    r.x = 30;
    r.y = 100;
    placeContainer(r, t.resources);
  } else if (
    containerKinds.includes(r.kind) &&
    (patch.width !== undefined || patch.height !== undefined)
  )
    placeContainer(r, t.resources, { x: r.x, y: r.y });
}

export function addressIsInVpc(t: Topology, r: Resource, ip: string) {
  try {
    return contains(vpcOf(t, r)?.cidr || "", ip);
  } catch {
    return false;
  }
}

export function addRecommendedAwsRules(t: Topology) {
  const b = t.builder;
  const source = t.resources.find(
    (r) => r.id === b?.sourceId && r.kind === "ec2",
  );
  const target = t.resources.find(
    (r) => r.id === b?.targetId && r.kind === "ec2",
  );
  if (
    !b ||
    !source ||
    !target ||
    source.id === target.id ||
    !vpcOf(t, source) ||
    vpcOf(t, source)?.id !== vpcOf(t, target)?.id
  )
    throw new Error("Select two instances in the same VPC first.");
  const sourceGroup = t.resources.find(
    (r) => r.id === groupsOf(source)[0] && r.kind === "sg",
  );
  const targetGroup = t.resources.find(
    (r) => r.id === groupsOf(target)[0] && r.kind === "sg",
  );
  if (!sourceGroup || !targetGroup)
    throw new Error("Assign a Security Group to both instances first.");
  if (sourceGroup.vpcId !== source.vpcId || targetGroup.vpcId !== target.vpcId)
    throw new Error("Assign Security Groups from each instance's VPC.");
  for (const [group, peer, direction] of [
    [sourceGroup, targetGroup, "outbound"],
    [targetGroup, sourceGroup, "inbound"],
  ] as const) {
    const rule: Rule = {
      id: newId(),
      direction,
      protocol: b.protocol,
      fromPort: b.protocol === "ICMP" ? 0 : b.port,
      toPort: b.protocol === "ICMP" ? 0 : b.port,
      securityGroupId: peer.id,
      cidr: "",
      icmpType: 8,
      icmpCode: 0,
      action: "allow",
      priority: 100,
    };
    if (
      !(group.rules || []).some(
        (r) =>
          r.direction === direction &&
          r.protocol === rule.protocol &&
          r.securityGroupId === peer.id &&
          r.fromPort === rule.fromPort &&
          r.toPort === rule.toPort &&
          r.icmpType === rule.icmpType &&
          r.action === "allow",
      )
    )
      group.rules = [...(group.rules || []), rule];
  }
}
