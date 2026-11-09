import {
  Monitor,
  Server,
  Network,
  Router,
  Shield,
  Globe2,
  Cloud,
  MapPin,
  Box,
  Layers3,
  GitBranch,
  DoorOpen,
  ArrowLeftRight,
  Fingerprint,
  ShieldCheck,
  ListFilter,
  Database,
  Scale,
  Waypoints,
} from "lucide-react";
import type { ResourceKind } from "../engine/types";
export const resourceIcons = {
  awsCloud: Cloud,
  endpoint: DoorOpen,
  peering: ArrowLeftRight,
  tgw: Network,
  vgw: Router,
  cgw: Router,
  vpn: Shield,
  nlb: Waypoints,
  s3: Database,
  route53: Globe2,
  cloudwatch: Layers3,
  computer: Monitor,
  server: Server,
  switch: Network,
  router: Router,
  firewall: Shield,
  internet: Globe2,
  region: Globe2,
  az: MapPin,
  vpc: Cloud,
  subnet: Box,
  ec2: Server,
  routeTable: GitBranch,
  igw: DoorOpen,
  nat: ArrowLeftRight,
  eip: Fingerprint,
  sg: ShieldCheck,
  nacl: ListFilter,
  alb: Waypoints,
  rds: Database,
  asg: Scale,
  dbEndpoint: Database,
};
export function ResourceIcon({
  kind,
  size = 20,
}: {
  kind: ResourceKind;
  size?: number;
}) {
  const Icon = resourceIcons[kind] ?? Layers3;
  return <Icon size={size} />;
}
