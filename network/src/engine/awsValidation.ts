import { effectiveRoutes } from "./awsEngine";
import { groupsOf, vpcOf } from "./awsBuilder";
import { contains, overlaps, parseCidr, subnetWithin } from "./ipMathEngine";
import { longestPrefixMatch } from "./routingEngine";
import { evaluateRules } from "./securityEngine";
import { validateTopology } from "./topologyEngine";
import type { Packet, Resource, Topology } from "./types";

export interface AwsCheck {
  id: string;
  label: string;
  status: "pass" | "fail" | "unknown";
  explanation: string;
  fix: string;
  resourceId?: string;
}
export function effectiveTable(t: Topology, subnet?: Resource) {
  return t.resources.find(
    (r) =>
      r.kind === "routeTable" &&
      (subnet?.routeTableId
        ? r.id === subnet.routeTableId
        : r.vpcId === subnet?.vpcId && r.main),
  );
}
export function effectiveAcl(t: Topology, subnet?: Resource) {
  return t.resources.find(
    (r) =>
      r.kind === "nacl" &&
      (subnet?.naclId
        ? r.id === subnet.naclId
        : r.vpcId === subnet?.vpcId && r.defaultAcl),
  );
}
export function awsConfigurationIssues(t: Topology) {
  const issues = validateTopology(t);
  const add = (r: Resource, message: string) =>
    issues.push({ resourceId: r.id, message: `${r.name}: ${message}` });
  for (const r of t.resources) {
    const vpc = vpcOf(t, r);
    if (["sg", "nacl", "routeTable", "igw", "vgw", "endpoint", "asg", "az"].includes(r.kind) && (!vpc || vpc.kind !== "vpc")) add(r, "Choose a valid parent VPC / attachment.");
    if (r.kind === "routeTable") {
      const destinations = new Set<string>();
      for (const route of r.routes || []) {
        try {
          const destination = parseCidr(route.destination).canonical;
          if (destinations.has(destination)) add(r, `Duplicate route destination ${destination}.`);
          destinations.add(destination);
          if (route.target === "local" && destination !== parseCidr(vpc?.cidr || "").canonical) add(r, "The local route destination must match the VPC CIDR in this model.");
        } catch { /* CIDR issues are reported by the shared validator. */ }
        if (route.target !== "local") {
          const gateway = t.resources.find((x) => x.id === route.target);
          if (!gateway || !["igw", "nat", "peering", "tgw", "vgw", "endpoint"].includes(gateway.kind)) add(r, "Select an existing supported route target.");
          else if (gateway.kind !== "tgw" && vpcOf(t, gateway)?.id !== r.vpcId && !(gateway.kind === "peering" && gateway.peerVpcId === r.vpcId)) add(r, "The route target is not attached to this VPC.");
        }
      }
    }
    for (const id of r.relatedIds || []) if (!t.resources.some((x) => x.id === id)) add(r, "A service relationship references a deleted resource.");
    if (r.kind === "ec2") {
      if (
        r.services?.some(
          (port) => !Number.isInteger(port) || port < 1 || port > 65535,
        )
      )
        add(r, "Listening ports must be integers between 1 and 65535.");
      if (r.parentId !== r.subnetId)
        add(r, "Visual placement must agree with its subnet assignment.");
      if (!groupsOf(r).length) add(r, "Select at least one security group.");
    }
    for (const id of groupsOf(r)) {
      const sg = t.resources.find((x) => x.id === id && x.kind === "sg");
      if (!sg || sg.vpcId !== vpc?.id) add(r, "Assign security groups from this resource's VPC.");
    }
    if (r.kind === "subnet") {
      const zone = t.resources.find((x) => x.id === r.azId && x.kind === "az");
      if (!zone || zone.vpcId !== r.vpcId || r.parentId !== zone.id)
        add(r, "Select an Availability Zone in the subnet's VPC.");
      for (const [policy, label] of [
        [effectiveTable(t, r), "route table"],
        [effectiveAcl(t, r), "network ACL"],
      ] as const)
        if (!policy || policy.vpcId !== r.vpcId)
          add(r, `Associate a ${label} in this VPC.`);
    }
    for (const rule of r.rules ?? []) {
      if (
        rule.securityGroupId !== undefined &&
        (r.kind !== "sg" ||
          !t.resources.some(
            (x) =>
              x.id === rule.securityGroupId &&
              x.kind === "sg" &&
              x.vpcId === r.vpcId,
          ))
      )
        add(
          r,
          "Security group references must identify a group in the same VPC in this lab.",
        );
      if (r.kind === "sg" && rule.action !== "allow")
        add(r, "Security groups support allow rules only.");
      if (
        rule.protocol === "ICMP" &&
        [rule.icmpType, rule.icmpCode].some(
          (n) => n !== undefined && (!Number.isInteger(n) || n < -1 || n > 255),
        )
      )
        add(r, "ICMP type/code must be -1 (any) or 0–255; they are not ports.");
    }
    if (r.kind === "peering") {
      const peer = t.resources.find(
        (x) => x.id === r.peerVpcId && x.kind === "vpc",
      );
      if (!peer || peer.id === r.vpcId)
        add(
          r,
          "Choose a different peer VPC; routes and acceptance are still required.",
        );
      else
        try {
          if (overlaps(peer.cidr!, vpc!.cidr!))
            add(r, "Peered VPC CIDRs must not overlap.");
        } catch {
          add(r, "Both peered VPCs need valid CIDRs.");
        }
    }
  }
  return issues;
}

export function validateAwsConnectivity(t: Topology): {
  checks: AwsCheck[];
  passed: boolean;
  message: string;
} {
  const state = t.builder;
  const source = t.resources.find(
    (r) => r.id === state?.sourceId && r.kind === "ec2",
  );
  const target = t.resources.find(
    (r) => r.id === state?.targetId && r.kind === "ec2",
  );
  const subA = t.resources.find(
    (r) => r.id === source?.subnetId && r.kind === "subnet",
  );
  const subB = t.resources.find(
    (r) => r.id === target?.subnetId && r.kind === "subnet",
  );
  const vpcA = vpcOf(t, subA),
    vpcB = vpcOf(t, subB);
  const sameVpc = !!vpcA && vpcA.id === vpcB?.id;
  const checks: AwsCheck[] = [];
  const check = (
    id: string,
    label: string,
    ok: boolean,
    explanation: string,
    fix: string,
    resourceId?: string,
  ) =>
    checks.push({
      id,
      label,
      status: ok ? "pass" : "fail",
      explanation,
      fix,
      resourceId,
    });
  const ready = !!(
    source &&
    target &&
    subA &&
    subB &&
    sameVpc &&
    source.id !== target.id
  );
  check(
    "vpc",
    "Both subnets belong to the same VPC",
    sameVpc,
    sameVpc
      ? `Both subnets use ${vpcA.name}.`
      : "Select two EC2 instances in subnets of one VPC.",
    "Choose the intended source and destination, then check their VPC associations.",
  );
  let cidrs = false;
  try {
    cidrs =
      ready &&
      subA!.id !== subB!.id &&
      subnetWithin(subA!.cidr!, vpcA!.cidr!) &&
      subnetWithin(subB!.cidr!, vpcA!.cidr!) &&
      !overlaps(subA!.cidr!, subB!.cidr!);
  } catch {
    /* Explained by the check below. */
  }
  check(
    "cidrs",
    "Subnet CIDR ranges do not overlap",
    cidrs,
    cidrs
      ? `${subA!.cidr} and ${subB!.cidr} are distinct and inside the VPC.`
      : "Two distinct, non-overlapping subnets must fit inside the VPC CIDR.",
    "Edit each subnet CIDR, for example 10.0.1.0/24 and 10.0.2.0/24.",
  );
  const config = awsConfigurationIssues(t);
  const placement =
    ready &&
    source!.parentId === subA!.id &&
    target!.parentId === subB!.id &&
    !config.some((i) =>
      [source!.id, target!.id, subA!.id, subB!.id].includes(i.resourceId),
    );
  check(
    "placement",
    "Both EC2 instances are placed in the intended subnets",
    placement,
    placement
      ? `${source!.name} is in ${subA!.name}; ${target!.name} is in ${subB!.name}.`
      : config[0]?.message ||
          "Choose valid instance addresses and subnet assignments.",
    "Correct the reported properties; AWS reserves the first four and last IPv4 address of each subnet.",
  );
  let routes = false;
  try {
    routes =
      ready &&
      [
        [subA!, target!.ip!],
        [subB!, source!.ip!],
      ].every(([subnet, ip]) => {
        const table = effectiveTable(t, subnet as Resource);
        if (!table?.enabled || table.vpcId !== vpcA!.id) return false;
        const route = longestPrefixMatch(
          effectiveRoutes(t, table),
          ip as string,
        );
        return (
          route?.enabled &&
          route.target === "local" &&
          contains(vpcA!.cidr!, ip as string)
        );
      });
  } catch {
    /* Malformed routes are a failed configuration check. */
  }
  check(
    "routing",
    "VPC local routes cover destination and return IPs",
    routes,
    routes
      ? "The most specific matching route in both directions uses local VPC routing. No NAT or Internet Gateway is needed."
      : "A missing, disabled, or more-specific non-local route prevents the modeled local path.",
    "Associate the correct route tables and restore the VPC CIDR → local route on both sides.",
  );
  const request: Packet = {
    sourceIp: source?.ip || "",
    destinationIp: target?.ip || "",
    sourcePort: state?.protocol === "ICMP" ? 0 : 49152,
    destinationPort: state?.protocol === "ICMP" ? 0 : state?.port || 8080,
    protocol: state?.protocol || "ICMP",
    reply: false,
  };
  const reply: Packet = {
    ...request,
    sourceIp: request.destinationIp,
    destinationIp: request.sourceIp,
    sourcePort: request.destinationPort,
    destinationPort: request.sourcePort,
    reply: true,
  };
  const sgAllows = (
    instance: Resource,
    peer: Resource,
    direction: "inbound" | "outbound",
  ) => {
    const groups = groupsOf(instance).map((id) =>
      t.resources.find((r) => r.id === id && r.kind === "sg"),
    );
    return (
      groups.length > 0 &&
      groups.every((sg) => sg?.enabled && sg.vpcId === vpcA?.id) &&
      groups.some(
        (sg) =>
          evaluateRules(
            sg!.rules || [],
            request,
            direction,
            "sg",
            false,
            groupsOf(peer),
          ).allowed,
      )
    );
  };
  let sourceAllowed = false,
    targetAllowed = false;
  try {
    sourceAllowed = ready && sgAllows(source!, target!, "outbound");
    targetAllowed = ready && sgAllows(target!, source!, "inbound");
  } catch {
    /* Invalid rules fail closed. */
  }
  check(
    "security",
    "Security Group rules permit the intended traffic",
    sourceAllowed && targetAllowed,
    !sourceAllowed
      ? "The source Security Groups do not allow the initiating outbound traffic."
      : !targetAllowed
        ? "The destination Security Group does not permit the required inbound traffic."
        : "Source outbound and destination inbound rules allow the request. Stateful tracking permits its response.",
    `Allow ${request.protocol === "ICMP" ? "ICMP Echo Request (type 8, code 0)" : `${request.protocol} destination port ${request.destinationPort}`} inbound on the destination from the source Security Group, with compatible outbound access on the source.`,
    !sourceAllowed ? source?.id : target?.id,
  );
  const aclChecks = ready
    ? ([
        [subA!, request, "outbound"],
        [subB!, request, "inbound"],
        [subB!, reply, "outbound"],
        [subA!, reply, "inbound"],
      ] as const)
    : [];
  let aclFailure = "Choose the two test instances first.";
  const aclOk =
    ready &&
    aclChecks.every(([subnet, packet, direction]) => {
      const acl = effectiveAcl(t, subnet);
      if (!acl?.enabled || acl.vpcId !== subnet.vpcId) {
        aclFailure = `${subnet.name} needs an active network ACL in its VPC.`;
        return false;
      }
      try {
        const result = evaluateRules(
          acl.rules || [],
          packet,
          direction,
          "nacl",
        );
        if (!result.allowed)
          aclFailure = `${acl.name}, ${direction} ${packet.reply ? "return" : "request"}: ${result.reason}`;
        return result.allowed;
      } catch {
        aclFailure = "A network ACL rule is invalid.";
        return false;
      }
    });
  check(
    "acl",
    "Network ACL rules permit request and return traffic",
    aclOk,
    aclOk
      ? "The modeled ACLs permit all four subnet-boundary checks. Default ACLs are modeled explicitly and can be edited."
      : aclFailure,
    `Allow both directions. ${request.protocol === "ICMP" ? "Echo Request is type 8; Echo Reply is type 0 (code 0)." : "Return traffic targets client port 49152 in this model; actual ephemeral ranges depend on the operating system."}`,
  );
  const hostStatus =
    source?.osFirewall === "deny" || target?.osFirewall === "deny"
      ? "fail"
      : ready &&
          source?.osFirewall === "allow" &&
          target?.osFirewall === "allow"
        ? "pass"
        : "unknown";
  checks.push({
    id: "host",
    label: "Operating-system firewalls permit the traffic",
    status: hostStatus,
    explanation:
      hostStatus === "pass"
        ? "Both host firewalls are explicitly modeled as allowing this test. This is your assumption, not an AWS observation."
        : hostStatus === "fail"
          ? "At least one host firewall is modeled as blocking traffic."
          : "Host firewall behavior is unknown until you set an explicit modeling assumption.",
    fix: "Inspect each instance's OS firewall field. In AWS, verify the actual host firewall and ICMP or application settings.",
  });
  const online = (r?: Resource): boolean =>
    !!r?.enabled &&
    (!r.parentId || online(t.resources.find((p) => p.id === r.parentId)));
  const testOk =
    ready &&
    online(source) &&
    online(target) &&
    (request.protocol === "ICMP" ||
      (Number.isInteger(state?.port) &&
        state!.port > 0 &&
        state!.port <= 65535 &&
        !!target?.services?.includes(state!.port)));
  check(
    "runtime",
    "Instances are running and the test is configured",
    testOk,
    testOk
      ? "Both instances and their containers are enabled; the modeled destination service matches this test."
      : "Check instance state, container state, protocol, port and the destination's listening-service list.",
    "Enable both instances. For TCP 8080, model a listening application on EC2-B; in AWS, actually start that application.",
  );
  if (config.length)
    check(
      "configuration",
      "Diagram properties are internally consistent",
      false,
      config.map((i) => i.message).join(" "),
      "Select the affected resource and correct its configuration.",
      config[0].resourceId,
    );
  const passed = checks.every((c) => c.status === "pass");
  return {
    checks,
    passed,
    message: passed
      ? "Your diagram passes the modeled configuration checks. Actual connectivity must still be verified in AWS."
      : "The modeled configuration is incomplete or blocks the selected test. Review the checks below.",
  };
}
