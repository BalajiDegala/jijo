import type {
  NetworkInterface,
  Resource,
  ResourceKind,
  Topology,
} from "./types";

export const kindLabels: Record<ResourceKind, string> = {
  awsCloud: "AWS Cloud",
  endpoint: "VPC Endpoint",
  peering: "VPC Peering Connection",
  tgw: "Transit Gateway",
  vgw: "Virtual Private Gateway",
  cgw: "Customer Gateway",
  vpn: "Site-to-Site VPN",
  nlb: "Network Load Balancer",
  s3: "S3 Bucket",
  route53: "Route 53",
  cloudwatch: "CloudWatch",
  computer: "Computer",
  server: "Linux server",
  switch: "L2 switch",
  router: "Router",
  firewall: "Firewall",
  internet: "Internet",
  region: "Region",
  az: "Availability zone",
  vpc: "VPC",
  subnet: "Subnet",
  ec2: "EC2 instance",
  routeTable: "Route table",
  igw: "Internet gateway",
  nat: "NAT gateway",
  eip: "Elastic IP",
  sg: "Security group",
  nacl: "Network ACL",
  alb: "Application Load Balancer",
  rds: "RDS database",
  asg: "Auto Scaling group",
  dbEndpoint: "RDS DNS endpoint",
};
export function interfacesOf(r: Resource): NetworkInterface[] {
  return (
    r.interfaces ??
    (r.ip ? [{ id: "eth0", ip: r.ip, prefix: r.prefix ?? 24 }] : [])
  );
}
export function resourceByIp(t: Topology, ip: string) {
  return t.resources.find(
    (r) =>
      r.ip === ip ||
      r.publicIp === ip ||
      r.interfaces?.some((i) => i.ip === ip),
  );
}
export function newId() {
  return crypto.randomUUID();
}
export const containerSizes = {
  region: { width: 1120, height: 780 },
  vpc: { width: 1060, height: 660 },
  az: { width: 480, height: 540 },
  subnet: { width: 420, height: 300 },
};
export function makeResource(
  kind: ResourceKind,
  index: number,
  x = 180,
  y = 150,
): Resource {
  const r: Resource = {
    id: newId(),
    kind,
    name: `${kindLabels[kind]} ${index}`,
    x,
    y,
    enabled: true,
  };
  if (["computer", "server", "ec2", "nat", "alb", "rds"].includes(kind))
    Object.assign(r, {
      ip: `192.168.1.${10 + (index % 240)}`,
      prefix: 24,
      gateway: "",
      mac: `02:00:00:00:${Math.floor(index / 256)
        .toString(16)
        .padStart(2, "0")}:${(index % 256).toString(16).padStart(2, "0")}`,
      services: [80, 443],
    });
  if (kind === "internet")
    Object.assign(r, { ip: "8.8.8.8", services: [53, 80, 443] });
  if (kind === "router" || kind === "firewall")
    Object.assign(r, {
      interfaces: [
        { id: "eth0", ip: "192.168.1.1", prefix: 24 },
        { id: "eth1", ip: "192.168.2.1", prefix: 24 },
      ],
      forwarding: true,
      routes: [],
      rules: [],
    });
  if (kind in containerSizes)
    Object.assign(r, containerSizes[kind as keyof typeof containerSizes]);
  if (kind === "vpc") r.cidr = "10.0.0.0/16";
  if (kind === "subnet") r.cidr = "10.0.1.0/24";
  if (kind === "routeTable") r.routes = [];
  if (kind === "sg" || kind === "nacl") r.rules = [];
  if (kind === "eip") r.publicIp = `203.0.113.${10 + (index % 240)}`;
  if (kind === "rds") r.role = "standby";
  return r;
}
