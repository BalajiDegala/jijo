export type ResourceKind =
  | "computer"
  | "server"
  | "switch"
  | "router"
  | "firewall"
  | "internet"
  | "region"
  | "az"
  | "vpc"
  | "subnet"
  | "ec2"
  | "routeTable"
  | "igw"
  | "nat"
  | "eip"
  | "sg"
  | "nacl"
  | "alb"
  | "rds"
  | "asg"
  | "dbEndpoint"
  | "awsCloud"
  | "endpoint"
  | "peering"
  | "tgw"
  | "vgw"
  | "cgw"
  | "vpn"
  | "nlb"
  | "s3"
  | "route53"
  | "cloudwatch";
export type Protocol = "ICMP" | "TCP" | "UDP";
export type Direction = "inbound" | "outbound";
export interface Route {
  id: string;
  destination: string;
  target: string;
  enabled: boolean;
}
export interface Rule {
  id: string;
  direction: Direction;
  protocol: Protocol | "ALL";
  fromPort: number;
  toPort: number;
  cidr: string;
  action: "allow" | "deny";
  priority: number;
  securityGroupId?: string;
  icmpType?: number;
  icmpCode?: number;
}
export interface NetworkInterface {
  id: string;
  ip: string;
  prefix: number;
}
export interface Resource {
  id: string;
  kind: ResourceKind;
  name: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  parentId?: string;
  ip?: string;
  prefix?: number;
  gateway?: string;
  mac?: string;
  cidr?: string;
  publicIp?: string;
  vpcId?: string;
  subnetId?: string;
  azId?: string;
  routeTableId?: string;
  sgId?: string;
  naclId?: string;
  eipId?: string;
  interfaces?: NetworkInterface[];
  routes?: Route[];
  rules?: Rule[];
  forwarding?: boolean;
  enabled: boolean;
  services?: number[];
  description?: string;
  serviceId?: string;
  tier?: "web" | "app";
  role?: "primary" | "standby";
  regionName?: string;
  zoneName?: string;
  subnetType?: "private" | "public";
  instanceType?: string;
  os?: "Linux" | "Windows";
  osFirewall?: "unknown" | "allow" | "deny";
  publicIpAuto?: boolean;
  sgIds?: string[];
  natType?: "public" | "private";
  main?: boolean;
  defaultAcl?: boolean;
  peerVpcId?: string;
  relatedIds?: string[];
  serviceName?: string;
  endpointType?: "gateway" | "interface";
  asn?: number;
  remoteCidr?: string;
}
export interface Link {
  id: string;
  source: string;
  target: string;
  label?: string;
  kind?:
    | "request"
    | "cross-zone"
    | "replication"
    | "membership"
    | "association"
    | "egress";
  sourceHandle?: string;
  targetHandle?: string;
}
export interface Topology {
  version: 1;
  name: string;
  mode: "local" | "aws";
  resources: Resource[];
  links: Link[];
  dns: Record<string, string>;
  diagram?: "three-tier";
  builder?: {
    scenarioId: "two-subnet-ec2";
    mode: "guided" | "free";
    step: number;
    sourceId: string;
    targetId: string;
    protocol: "ICMP" | "TCP";
    port: number;
    showPath: boolean;
    reviewedAcl: boolean;
    guideGenerated?: boolean;
  };
}
export interface Packet {
  sourceIp: string;
  destinationIp: string;
  sourcePort: number;
  destinationPort: number;
  protocol: Protocol;
  reply: boolean;
}
export type EventType =
  | "send"
  | "arp"
  | "switch"
  | "route"
  | "security"
  | "nat"
  | "forward"
  | "receive"
  | "reply"
  | "drop"
  | "delivered";
export interface TraceEvent {
  id: number;
  type: EventType;
  resourceId: string;
  nextResourceId?: string;
  packet: Packet;
  decision: "allow" | "deny" | "info";
  explanation: string;
  matched?: string;
}
export interface NatTranslation {
  gatewayId: string;
  privateIp: string;
  privatePort: number;
  publicIp: string;
  publicPort: number;
  destinationIp: string;
  destinationPort: number;
  protocol: Protocol;
}
export interface SimulationResult {
  success: boolean;
  reason: string;
  events: TraceEvent[];
  translations: NatTranslation[];
  macTables: Record<string, Record<string, string>>;
}
export interface SendRequest {
  sourceId: string;
  destination: string;
  protocol: Protocol;
  port: number;
}
export const containerKinds: ResourceKind[] = [
  "awsCloud",
  "region",
  "az",
  "vpc",
  "subnet",
];
export const endpointKinds: ResourceKind[] = [
  "computer",
  "server",
  "ec2",
  "internet",
];
