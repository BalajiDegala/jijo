import { kindLabels } from "../engine/deviceEngine";
import { resourceDescriptions } from "./learning";
import type { ResourceKind } from "../engine/types";

export const awsDocs = {
  vpc: "https://docs.aws.amazon.com/vpc/latest/userguide/create-vpc.html",
  subnet:
    "https://docs.aws.amazon.com/vpc/latest/userguide/create-subnets.html",
  routing:
    "https://docs.aws.amazon.com/vpc/latest/userguide/subnet-route-tables.html",
  security:
    "https://docs.aws.amazon.com/vpc/latest/userguide/security-group-rules.html",
  acl: "https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html",
  ec2: "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html",
  troubleshoot:
    "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/TroubleshootingInstancesConnecting.html",
};
export type AwsCategory = "Boundaries" | "Networking" | "Compute" | "Services";
export interface AwsResourceDefinition {
  kind: ResourceKind;
  name: string;
  category: AwsCategory;
  description: string;
  parentKinds: ResourceKind[];
  next: string;
  modeled: boolean;
  docs: string;
}
const serviceDocs: Partial<Record<ResourceKind, string>> = {
  ec2: awsDocs.ec2,
  subnet: awsDocs.subnet,
  routeTable: awsDocs.routing,
  sg: awsDocs.security,
  nacl: awsDocs.acl,
  endpoint: "https://docs.aws.amazon.com/vpc/latest/privatelink/concepts.html",
  peering:
    "https://docs.aws.amazon.com/vpc/latest/peering/what-is-vpc-peering.html",
  tgw: "https://docs.aws.amazon.com/vpc/latest/tgw/what-is-transit-gateway.html",
  vgw: "https://docs.aws.amazon.com/vpn/latest/s2svpn/VPC_VPN.html",
  cgw: "https://docs.aws.amazon.com/vpn/latest/s2svpn/VPC_VPN.html",
  vpn: "https://docs.aws.amazon.com/vpn/latest/s2svpn/VPC_VPN.html",
  alb: "https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html",
  nlb: "https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html",
  s3: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html",
  route53:
    "https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/Welcome.html",
  cloudwatch:
    "https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html",
};
const rows: [ResourceKind, AwsCategory, ResourceKind[], string, boolean][] = [
  [
    "awsCloud",
    "Boundaries",
    [],
    "Add a Region to organize regional resources.",
    false,
  ],
  ["region", "Boundaries", ["awsCloud"], "Create a VPC in this Region.", false],
  [
    "vpc",
    "Boundaries",
    ["region"],
    "Create two non-overlapping subnets in this VPC.",
    true,
  ],
  [
    "az",
    "Boundaries",
    ["vpc"],
    "Place subnets in this Availability Zone. The VPC spans zones.",
    true,
  ],
  [
    "subnet",
    "Boundaries",
    ["vpc"],
    "Launch an EC2 instance in this subnet.",
    true,
  ],
  [
    "igw",
    "Networking",
    ["vpc"],
    "Associate a subnet route table and add an internet route if needed.",
    false,
  ],
  [
    "nat",
    "Networking",
    ["subnet"],
    "Public NAT requires an Elastic IP and internet-gateway routing from its subnet.",
    false,
  ],
  [
    "routeTable",
    "Networking",
    ["vpc"],
    "Associate subnets; inspect destination/target rules.",
    true,
  ],
  [
    "sg",
    "Networking",
    ["vpc"],
    "Associate this policy with an instance; configure its inbound and outbound rules.",
    true,
  ],
  [
    "nacl",
    "Networking",
    ["vpc"],
    "Associate a subnet; allow request and return traffic in both directions.",
    true,
  ],
  [
    "eip",
    "Networking",
    [],
    "Associate the address with a public NAT gateway when needed.",
    false,
  ],
  [
    "endpoint",
    "Networking",
    ["vpc"],
    "Choose gateway or interface access; service and IAM policies still apply.",
    false,
  ],
  [
    "peering",
    "Networking",
    ["vpc"],
    "Select the peer VPC. Configure routes on both sides; peering is not transitive.",
    false,
  ],
  [
    "tgw",
    "Networking",
    ["region"],
    "Add VPC attachments and configure transit gateway route tables in AWS.",
    false,
  ],
  [
    "vgw",
    "Networking",
    ["vpc"],
    "Connect a Site-to-Site VPN and configure VPC routes.",
    false,
  ],
  [
    "cgw",
    "Networking",
    [],
    "Set the public device address and ASN; connect a Site-to-Site VPN.",
    false,
  ],
  [
    "vpn",
    "Networking",
    ["vgw", "tgw"],
    "Associate a customer gateway and configure both VPN tunnels in AWS.",
    false,
  ],
  [
    "internet",
    "Networking",
    [],
    "Internet access is separate from private VPC communication.",
    false,
  ],
  [
    "ec2",
    "Compute",
    ["subnet"],
    "Choose its security groups, host firewall assumptions and application ports.",
    true,
  ],
  [
    "alb",
    "Compute",
    ["subnet"],
    "A real ALB needs subnets in at least two zones, listeners and target groups.",
    false,
  ],
  [
    "nlb",
    "Compute",
    ["subnet"],
    "Configure listeners, target groups and health checks in AWS.",
    false,
  ],
  [
    "asg",
    "Compute",
    ["vpc"],
    "Choose subnet memberships and configure a launch template in AWS.",
    false,
  ],
  [
    "rds",
    "Services",
    ["subnet"],
    "A real database uses a DB subnet group and service-specific security rules.",
    false,
  ],
  [
    "dbEndpoint",
    "Services",
    ["vpc"],
    "Record the RDS DNS name. It represents name resolution, not a network hop.",
    false,
  ],
  [
    "s3",
    "Services",
    ["region"],
    "S3 lives outside VPC subnets. Configure bucket and IAM policies.",
    false,
  ],
  [
    "route53",
    "Services",
    [],
    "Configure a hosted zone and DNS records; DNS is not a routing rule.",
    false,
  ],
  [
    "cloudwatch",
    "Services",
    ["region"],
    "Configure metrics, logs and alarms for your resources.",
    false,
  ],
];
export const awsResources: AwsResourceDefinition[] = rows.map(
  ([kind, category, parentKinds, next, modeled]) => ({
    kind,
    name: kindLabels[kind],
    description: resourceDescriptions[kind],
    category,
    parentKinds,
    next,
    modeled,
    docs: serviceDocs[kind] || awsDocs.vpc,
  }),
);
export const awsDefinition = (kind: ResourceKind) =>
  awsResources.find((definition) => definition.kind === kind);
