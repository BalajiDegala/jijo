import {
  ipToNumber,
  isAssignable,
  overlaps,
  parseCidr,
  subnetWithin,
} from "./ipMathEngine";
import { interfacesOf } from "./deviceEngine";
import type { Resource, ResourceKind, Topology } from "./types";

export interface ValidationIssue {
  resourceId: string;
  message: string;
}
export function validateTopology(t: Topology): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const add = (r: Resource, message: string) =>
    issues.push({ resourceId: r.id, message: `${r.name}: ${message}` });
  for (const r of t.resources) {
    try {
      if (r.cidr) parseCidr(r.cidr);
      if (r.ip) ipToNumber(r.ip);
      if (r.publicIp) ipToNumber(r.publicIp);
      if (r.gateway) ipToNumber(r.gateway);
      if (r.kind === "vpc") {
        if (!r.cidr) add(r, "Enter a VPC CIDR.");
        else {
          const c = parseCidr(r.cidr);
          if (c.prefix < 16 || c.prefix > 28)
            add(r, "AWS IPv4 VPCs require /16 through /28 in this lab.");
        }
      }
      for (const i of interfacesOf(r)) {
        parseCidr(`${i.ip}/${i.prefix}`);
        if (!isAssignable(i.ip, `${i.ip}/${i.prefix}`))
          add(r, `${i.ip} is a reserved network or broadcast address.`);
      }
      for (const route of r.routes ?? []) parseCidr(route.destination);
      for (const rule of r.rules ?? []) {
        if (!rule.securityGroupId) parseCidr(rule.cidr);
        if (
          !Number.isInteger(rule.fromPort) ||
          !Number.isInteger(rule.toPort) ||
          rule.fromPort < 0 ||
          rule.toPort > 65535 ||
          rule.fromPort > rule.toPort
        )
          add(r, "Port range must be between 0 and 65535, in ascending order.");
        if (
          !Number.isInteger(rule.priority) ||
          rule.priority < 1 ||
          rule.priority > 32766
        )
          add(r, "Rule numbers must be whole numbers from 1 to 32766.");
      }
      if (r.kind === "subnet") {
        if (!r.cidr) {
          add(r, "Choose a subnet CIDR.");
          continue;
        }
        const c = parseCidr(r.cidr);
        if (c.prefix < 16 || c.prefix > 28)
          add(r, "AWS IPv4 subnets require /16 through /28.");
        const vpc = t.resources.find(
          (v) => v.id === r.vpcId && v.kind === "vpc",
        );
        if (!vpc?.cidr || !subnetWithin(r.cidr, vpc.cidr))
          add(r, "Subnet must belong to and fit inside a VPC.");
        const az = t.resources.find((x) => x.id === r.azId);
        if (az && az.vpcId !== r.vpcId)
          add(r, "Availability zone placement must belong to the same VPC.");
        for (const other of t.resources.filter(
          (x) =>
            x.kind === "subnet" && x.id < r.id && x.vpcId === r.vpcId && x.cidr,
        ))
          if (overlaps(r.cidr, other.cidr!))
            add(r, `CIDR overlaps ${other.name}.`);
      }
      if (["ec2", "nat", "alb", "rds"].includes(r.kind)) {
        const subnet = t.resources.find(
          (s) => s.id === r.subnetId && s.kind === "subnet",
        );
        if (!subnet?.cidr || !r.ip || !isAssignable(r.ip, subnet.cidr, true))
          add(
            r,
            "Assign an available private IP inside a valid subnet (AWS reserves the first four and last addresses).",
          );
      }
      if (
        r.kind === "nacl" &&
        new Set(r.rules?.map((rule) => `${rule.direction}-${rule.priority}`))
          .size !== (r.rules?.length ?? 0)
      )
        add(r, "NACL rule numbers must be unique in each direction.");
      const referenceKinds: Record<string, ResourceKind> = {
        vpcId: "vpc",
        subnetId: "subnet",
        azId: "az",
        routeTableId: "routeTable",
        sgId: "sg",
        naclId: "nacl",
        eipId: "eip",
      };
      for (const key of [
        "vpcId",
        "subnetId",
        "azId",
        "routeTableId",
        "sgId",
        "naclId",
        "eipId",
      ] as const)
        if (
          r[key] &&
          !t.resources.some(
            (x) => x.id === r[key] && x.kind === referenceKinds[key],
          )
        )
          add(
            r,
            `The ${key.replace("Id", "")} association points to a missing or incompatible resource.`,
          );
    } catch (e) {
      add(r, (e as Error).message);
    }
  }
  const seen = new Map<string, Resource>();
  const publicIps = new Map<string, Resource>();
  for (const r of t.resources)
    if (r.publicIp) {
      if (publicIps.has(r.publicIp))
        add(
          r,
          `Public IPv4 ${r.publicIp} is already assigned to ${publicIps.get(r.publicIp)!.name}.`,
        );
      else publicIps.set(r.publicIp, r);
    }
  for (const r of t.resources)
    for (const i of interfacesOf(r)) {
      const key = `${t.mode === "aws" ? (t.resources.find((x) => x.id === r.subnetId)?.vpcId ?? r.vpcId ?? "") : ""}:${i.ip}`;
      if (seen.has(key))
        add(r, `${i.ip} is already used by ${seen.get(key)!.name}.`);
      else seen.set(key, r);
    }
  return issues;
}
export function absolutePosition(
  r: Resource,
  resources: Resource[],
): { x: number; y: number } {
  const p = resources.find((x) => x.id === r.parentId);
  if (!p) return { x: r.x, y: r.y };
  const pos = absolutePosition(p, resources);
  return { x: pos.x + r.x, y: pos.y + r.y };
}
