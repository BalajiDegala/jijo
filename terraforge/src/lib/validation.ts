import {
  Project,
  Resource,
  Value,
  Issue,
  isRef,
  isExpr,
  references,
  address,
  isMap,
} from "./model";
import { schemaFor } from "./registry";
export function cidrRange(cidr: string): [number, number] | null {
  const m = cidr.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)\/(\d+)$/);
  if (!m) return null;
  const a = m.slice(1).map(Number);
  if (a.slice(0, 4).some((n) => n > 255) || a[4] > 32) return null;
  const ip = a[0] * 16777216 + a[1] * 65536 + a[2] * 256 + a[3];
  const size = 2 ** (32 - a[4]);
  if (ip % size !== 0) return null;
  return [ip, ip + size - 1];
}
export const target = (p: Project, v: Value | undefined) =>
  isRef(v) ? p.resources.find((r) => r.id === v.ref) : undefined;
export function internetPath(
  p: Project,
  instance: Resource,
): { reachable: boolean; steps: Resource[]; reason: string } {
  const subnet = target(p, instance.args.subnet_id);
  if (!subnet)
    return {
      reachable: false,
      steps: [],
      reason: "Subnet reference is unresolved.",
    };
  const publicIp =
    instance.args.associate_public_ip_address === true ||
    (instance.args.associate_public_ip_address === undefined &&
      subnet.args.map_public_ip_on_launch === true);
  if (!publicIp)
    return {
      reachable: false,
      steps: [subnet, instance],
      reason: "This instance has no requested public IPv4 address.",
    };
  const assoc = p.resources.find(
    (r) =>
      r.type === "aws_route_table_association" &&
      isRef(r.args.subnet_id) &&
      r.args.subnet_id.ref === subnet.id,
  );
  const rt = target(p, assoc?.args.route_table_id);
  const routes = rt?.args.route;
  const route = Array.isArray(routes)
    ? routes.find(
        (v) =>
          isMap(v) && (v as Record<string, Value>).cidr_block === "0.0.0.0/0",
      )
    : undefined;
  const gateway = isMap(route)
    ? target(p, (route as Record<string, Value>).gateway_id as Value)
    : undefined;
  if (
    !gateway ||
    gateway.type !== "aws_internet_gateway" ||
    !isRef(subnet.args.vpc_id) ||
    !isRef(gateway.args.vpc_id) ||
    gateway.args.vpc_id.ref !== subnet.args.vpc_id.ref
  )
    return {
      reachable: false,
      steps: [subnet, instance],
      reason:
        subnet.kind === "data"
          ? "Existing routing cannot be verified offline."
          : "No explicit default route to an internet gateway in this VPC.",
    };
  return {
    reachable: true,
    steps: [gateway, rt!, subnet, instance],
    reason:
      "Public IPv4 + associated default route + attached internet gateway. Security groups and NACLs still control permitted traffic.",
  };
}
export function validate(p: Project): Issue[] {
  const out: Issue[] = [];
  const seen = new Set<string>();
  const push = (
    r: Resource,
    severity: Issue["severity"],
    message: string,
    field?: string,
  ) => out.push({ resource: r.id, severity, message, field });
  if (!/^[a-z]{2}(-[a-z]+)+-\d$/.test(p.region))
    out.push({ severity: "error", message: "Select a valid AWS region." });
  if (
    !/^[~><=!, .\d]+$/.test(p.providerVersion) ||
    !/[0-9]/.test(p.providerVersion)
  )
    out.push({
      severity: "error",
      message: "Invalid AWS provider version constraint.",
    });
  for (const r of p.resources) {
    const schema = schemaFor(r.type);
    if (!schema) {
      push(r, "error", `Unsupported resource type: ${r.type}`);
      continue;
    }
    if (!/^[A-Za-z_][A-Za-z0-9_-]*$/.test(r.name))
      push(
        r,
        "error",
        "Terraform names must start with a letter or underscore and contain only letters, digits, underscores, or hyphens.",
      );
    const a = address(r);
    if (seen.has(a)) push(r, "error", `Duplicate Terraform address ${a}.`);
    seen.add(a);
    for (const key of Object.keys(r.args)) {
      if (!schema.fields.some((f) => f.key === key) && key !== "depends_on")
        push(r, "error", `Unsupported argument ${key} for ${r.type}.`, key);
    }
    for (const f of schema.fields) {
      const v = r.args[f.key];
      if (
        f.required &&
        (v === undefined || v === "" || (Array.isArray(v) && !v.length))
      )
        push(r, "error", `${f.label} is required.`, f.key);
      if (
        v !== undefined &&
        f.kind === "number" &&
        typeof v !== "number" &&
        !isRef(v) &&
        !isExpr(v)
      )
        push(r, "error", `${f.label} must be a number.`, f.key);
      if (isRef(v) && f.target) {
        const t = target(p, v);
        if (t && !f.target.includes(t.type) && t.kind !== "variable")
          push(
            r,
            "error",
            `${f.label} references an incompatible ${t.type}.`,
            f.key,
          );
      }
    }
    for (const reference of references(r.args)) {
      const t = p.resources.find((x) => x.id === reference.ref);
      if (!t) push(r, "error", `Unresolved reference: ${reference.ref}.`);
      else if (t.id === r.id)
        push(r, "error", "A resource cannot depend on itself.");
    }
    for (const [k, v] of Object.entries(r.args)) {
      if (typeof v === "string" && /-----BEGIN .*PRIVATE KEY-----/.test(v))
        push(
          r,
          "error",
          "Private key content is not allowed in this project.",
          k,
        );
      if (k === "cidr_block" && typeof v === "string") {
        if (!cidrRange(v))
          push(
            r,
            "error",
            "Use a canonical IPv4 CIDR, such as 10.0.1.0/24.",
            k,
          );
        else if (
          ["aws_vpc", "aws_subnet"].includes(r.type) &&
          (Number(v.split("/")[1]) < 16 || Number(v.split("/")[1]) > 28)
        )
          push(
            r,
            "error",
            "AWS VPC and subnet IPv4 prefixes must be between /16 and /28.",
            k,
          );
      }
      if (isExpr(v) && !v.expr.trim())
        push(r, "error", "Terraform expressions cannot be empty.", k);
    }
    const expressionText = JSON.stringify(r.args);
    if (/-----BEGIN .*PRIVATE KEY-----/.test(expressionText))
      push(
        r,
        "error",
        "Private key material is not allowed in project arguments.",
      );
    if (
      r.kind === "variable" &&
      r.args.sensitive === true &&
      r.args.default !== undefined
    )
      push(
        r,
        "warning",
        "Sensitive variable defaults are stored in project files and Terraform state. Supply secrets outside this studio.",
      );
    if (
      r.kind === "output" &&
      expressionText.includes("private_key") &&
      r.args.sensitive !== true
    )
      push(
        r,
        "error",
        "Private key outputs must be marked sensitive. They still exist in Terraform state.",
      );
    for (const match of expressionText.matchAll(
      /\b((?:data\.)?aws_\w+\.\w+)\./g,
    )) {
      if (!p.resources.some((x) => address(x) === match[1]))
        push(r, "error", `Expression references unknown resource ${match[1]}.`);
    }
    if (r.type === "aws_subnet") {
      const vpc = target(p, r.args.vpc_id);
      const sub =
        typeof r.args.cidr_block === "string"
          ? cidrRange(r.args.cidr_block)
          : null;
      const parent =
        vpc && typeof vpc.args.cidr_block === "string"
          ? cidrRange(vpc.args.cidr_block)
          : null;
      if (sub && parent && (sub[0] < parent[0] || sub[1] > parent[1]))
        push(
          r,
          "error",
          "Subnet CIDR must be contained within its VPC.",
          "cidr_block",
        );
      if (
        typeof r.args.availability_zone === "string" &&
        !r.args.availability_zone.startsWith(p.region)
      )
        push(
          r,
          "error",
          "Availability zone does not match the provider region.",
          "availability_zone",
        );
      for (const other of p.resources.filter(
        (x) => x.type === "aws_subnet" && x.id < r.id,
      )) {
        if (
          isRef(r.args.vpc_id) &&
          isRef(other.args.vpc_id) &&
          r.args.vpc_id.ref === other.args.vpc_id.ref
        ) {
          const range =
            typeof other.args.cidr_block === "string"
              ? cidrRange(other.args.cidr_block)
              : null;
          if (sub && range && sub[0] <= range[1] && range[0] <= sub[1])
            push(r, "error", `CIDR overlaps subnet ${other.name}.`);
        }
      }
    }
    if (r.type === "aws_security_group" && Array.isArray(r.args.ingress)) {
      for (const rule of r.args.ingress) {
        if (isMap(rule)) {
          const cidrs = (rule as Record<string, Value>).cidr_blocks;
          if (
            Array.isArray(cidrs) &&
            cidrs.includes("0.0.0.0/0") &&
            ((rule as Record<string, Value>).protocol === "-1" ||
              (Number((rule as Record<string, Value>).from_port) <= 22 &&
                Number((rule as Record<string, Value>).to_port) >= 22))
          )
            push(
              r,
              "warning",
              "SSH is open to the entire internet. Restrict its source CIDR.",
              "ingress",
            );
          if (
            Array.isArray(cidrs) &&
            cidrs.some((c) => typeof c === "string" && !cidrRange(c))
          )
            push(
              r,
              "error",
              "A security group rule contains an invalid CIDR.",
              "ingress",
            );
        }
      }
    }
    if (r.type === "aws_instance") {
      const subnet = target(p, r.args.subnet_id);
      const groups = Array.isArray(r.args.vpc_security_group_ids)
        ? r.args.vpc_security_group_ids
        : [];
      for (const g of groups) {
        const sg = target(p, g);
        if (
          sg &&
          subnet &&
          isRef(sg.args.vpc_id) &&
          isRef(subnet.args.vpc_id) &&
          sg.args.vpc_id.ref !== subnet.args.vpc_id.ref
        )
          push(
            r,
            "error",
            `Security group ${sg.name} belongs to a different VPC.`,
          );
      }
      if (
        r.args.associate_public_ip_address === true &&
        !internetPath(p, r).reachable
      )
        push(r, "warning", internetPath(p, r).reason);
    }
    if (r.type === "tls_private_key")
      push(
        r,
        "warning",
        "Generated private keys are stored in Terraform state. Encrypt and restrict access to state.",
      );
    if (r.type === "aws_lb" || r.type === "aws_db_subnet_group") {
      const list = r.args[r.type === "aws_lb" ? "subnets" : "subnet_ids"];
      const azs = new Set(
        (Array.isArray(list) ? list : []).map(
          (v) => target(p, v)?.args.availability_zone,
        ),
      );
      if (azs.size < 2)
        push(
          r,
          "error",
          "This resource requires subnets in at least two availability zones.",
        );
    }
    if (
      r.scale?.mode === "count" &&
      (!Number.isInteger(r.scale.count) ||
        r.scale.count < 1 ||
        r.scale.count > 1000)
    )
      push(r, "error", "Count must be an integer from 1 to 1,000.");
    if (
      r.scale?.mode === "for_each" &&
      (!r.scale.keys.length ||
        new Set(r.scale.keys).size !== r.scale.keys.length)
    )
      push(r, "error", "for_each keys must be unique and nonempty.");
    if (r.kind === "module")
      push(
        r,
        "info",
        "Module input schemas and internal resources require Terraform init and validate outside this studio.",
      );
  }
  const visiting = new Set<string>(),
    visited = new Set<string>();
  const walk = (r: Resource) => {
    if (visiting.has(r.id)) {
      push(r, "error", "Dependency cycle detected.");
      return;
    }
    if (visited.has(r.id)) return;
    visiting.add(r.id);
    for (const v of references(r.args)) {
      const t = p.resources.find((x) => x.id === v.ref);
      if (t) walk(t);
    }
    visiting.delete(r.id);
    visited.add(r.id);
  };
  p.resources.forEach(walk);
  return out;
}
