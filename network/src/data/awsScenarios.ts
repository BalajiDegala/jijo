import { awsDocs } from "./awsResources";
import type { ResourceKind } from "../engine/types";

export interface AwsLearningStep {
  id: string;
  title: string;
  purpose: string;
  instruction: string;
  console: string[];
  mistake: string;
  docs: string;
  condition: string;
  addKind?: ResourceKind;
}
export const twoSubnetScenario = {
  id: "two-subnet-ec2" as const,
  title: "Connect Two EC2 Instances Across Two Subnets in an AWS VPC",
  objectives: [
    "Separate placement, routing and security",
    "Use private IPv4 and local VPC routing",
    "Diagnose policy and host-configuration failures",
    "Reproduce your model manually in AWS",
  ],
  steps: [
    {
      id: "vpc",
      title: "Create a VPC",
      purpose:
        "A VPC is your isolated regional address space. Subnets allocate smaller ranges from it.",
      instruction:
        "Click Add VPC. Start with 10.0.0.0/16. The model creates the main route table and default ACL that AWS supplies with a VPC.",
      console: [
        "Open Amazon VPC → Your VPCs → Create VPC.",
        "Choose VPC only, enter a name and IPv4 CIDR, then create it in the selected Region.",
      ],
      mistake:
        "A VPC spans Availability Zones; it is not confined to one zone.",
      docs: awsDocs.vpc,
      condition: "vpc",
      addKind: "vpc",
    },
    {
      id: "subnet-a",
      title: "Create Subnet-A",
      purpose:
        "A subnet is a non-overlapping address range in exactly one Availability Zone.",
      instruction:
        "Click Add Subnet, choose the VPC and an Availability Zone. Use 10.0.1.0/24 and keep the subnet private.",
      console: [
        "VPC → Subnets → Create subnet.",
        "Choose the VPC, name, Availability Zone and subnet IPv4 CIDR.",
      ],
      mistake:
        "The subnet range must fit inside its VPC; AWS reserves the first four and final IPv4 addresses.",
      docs: awsDocs.subnet,
      condition: "subnet-a",
      addKind: "subnet",
    },
    {
      id: "subnet-b",
      title: "Create Subnet-B",
      purpose:
        "Another subnet can communicate through the VPC's local route, even in a different zone.",
      instruction:
        "Add another subnet in the same VPC, using 10.0.2.0/24. Choose either the same or a different Availability Zone.",
      console: [
        "Create the second subnet under the same VPC.",
        "Choose its zone and a CIDR that does not overlap Subnet-A.",
      ],
      mistake:
        "Private communication between these subnets does not require an Internet Gateway or NAT Gateway.",
      docs: awsDocs.routing,
      condition: "subnet-b",
      addKind: "subnet",
    },
    {
      id: "ec2-a",
      title: "Launch EC2-A",
      purpose:
        "The selected subnet determines the instance's placement and private address range. Security groups are attached policies.",
      instruction:
        "Click Add EC2 Instance, select Subnet-A, and create a security group. Inspect the default 10.0.1.10 address and Linux settings.",
      console: [
        "EC2 → Instances → Launch instances: choose the name, AMI and instance type.",
        "Under Network settings choose the VPC, Subnet-A, private IP and security group. Choose your authorized management method.",
      ],
      mistake:
        "A security group is not a router or a cable. New groups have no inbound permission.",
      docs: awsDocs.ec2,
      condition: "ec2-a",
      addKind: "ec2",
    },
    {
      id: "ec2-b",
      title: "Launch EC2-B",
      purpose:
        "The second instance lives in a different subnet but the same VPC.",
      instruction:
        "Add EC2-B in Subnet-B. Verify its private IP and select the source and destination in the test controls.",
      console: [
        "Launch a second instance in Subnet-B with its own private address.",
        "Select or create a security group in the same VPC.",
      ],
      mistake:
        "Putting both instances in Subnet-A does not complete this two-subnet scenario.",
      docs: awsDocs.ec2,
      condition: "ec2-b",
      addKind: "ec2",
    },
    {
      id: "path",
      title: "Show the logical network path",
      purpose:
        "Route tables choose forwarding targets. The VPC router provides local routing; a route table is not a physical appliance.",
      instruction:
        "Click Show Network Connectivity. The dashed diagram line shows communication intent; the five-stage path explains the placement and route relationship.",
      console: [
        "VPC → Route tables → inspect each subnet's effective table.",
        "Verify that the VPC CIDR maps to local and no more-specific route redirects the test traffic.",
      ],
      mistake: "A visible path alone does not prove reachability.",
      docs: awsDocs.routing,
      condition: "path",
    },
    {
      id: "security",
      title: "Configure Security Groups",
      purpose:
        "Allow the destination's inbound request and the source's outbound request. Security groups track the permitted response.",
      instruction:
        "Choose ICMP Echo Request or TCP 8080. Use Add recommended SG rules to add a source-group reference, or edit the rules yourself. Review host-firewall assumptions on both instances.",
      console: [
        "EC2 → Security Groups → select the destination group → Edit inbound rules.",
        "For ping choose Custom ICMP – IPv4, Echo Request. For the application choose TCP and its port. Use the source instance's security group as source.",
        "Review the source group's outbound rules.",
      ],
      mistake:
        "ICMP uses type and code, not TCP/UDP ports. Prefer the source group over unrestricted inbound access.",
      docs: awsDocs.security,
      condition: "security",
    },
    {
      id: "acl",
      title: "Review Network ACLs (advanced)",
      purpose:
        "Subnet ACLs are stateless: the request and reply need permission in the relevant directions.",
      instruction:
        "Review the modeled default ACL. A custom ACL is optional. TCP return traffic uses the client's ephemeral port (49152 in this model). Mark this explanation reviewed.",
      console: [
        "VPC → Network ACLs → inspect the ACL associated with each subnet.",
        "Check ordered inbound and outbound rules, including return traffic.",
      ],
      mistake:
        "A default ACL may have been modified in AWS; do not assume its current rules allow traffic.",
      docs: awsDocs.acl,
      condition: "acl",
    },
    {
      id: "validate",
      title: "Check your architecture",
      purpose:
        "Configuration checks explain modeled failures without contacting AWS or sending real packets.",
      instruction:
        "Set each instance's host firewall assumption explicitly, then click Check My Architecture. Fix any failed or unknown checks.",
      console: [
        "Verify instance state and actual host-firewall rules in AWS.",
        "Run the selected test from the source instance using the destination's private IP.",
      ],
      mistake:
        "A modeled pass is not an observation of actual instance state, application health, IAM or network reachability.",
      docs: awsDocs.troubleshoot,
      condition: "validate",
    },
    {
      id: "guide",
      title: "Generate your AWS implementation guide",
      purpose:
        "Translate the current diagram into a reproducible implementation sequence.",
      instruction:
        "Open the AWS implementation guide. Names, CIDRs, zones, IPs, rules and test commands come from your current model. Download it if useful.",
      console: [
        "Follow the generated sequence in the matching AWS Region.",
        "Verify real connectivity, troubleshoot failures, and clean up resources when finished.",
      ],
      mistake:
        "The app never creates AWS resources or requires credentials. Keep the guide in sync with any diagram changes.",
      docs: awsDocs.vpc,
      condition: "guide",
    },
  ] satisfies AwsLearningStep[],
};
