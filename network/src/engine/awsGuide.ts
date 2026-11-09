import { awsDocs, awsDefinition } from "../data/awsResources";
import { groupsOf, vpcOf } from "./awsBuilder";
import { effectiveRoutes } from "./awsEngine";
import { effectiveTable, validateAwsConnectivity } from "./awsValidation";
import type { Resource, Rule, Topology } from "./types";

export interface AwsGuideStep {
  title: string;
  purpose: string;
  instructions: string[];
  values: string[];
  expected: string;
  mistakes: string;
  docs: string;
}
export function describeAwsRule(t: Topology, rule: Rule) {
  const peer = rule.securityGroupId
    ? `SG ${t.resources.find((r) => r.id === rule.securityGroupId)?.name || "MISSING GROUP"}`
    : rule.cidr;
  return `${rule.direction} ${rule.action} ${rule.protocol}${rule.protocol === "ICMP" ? ` type ${rule.icmpType ?? "any"}, code ${rule.icmpCode ?? "any"}` : rule.protocol === "ALL" ? "" : ` ${rule.fromPort}–${rule.toPort}`} ${rule.direction === "inbound" ? "from" : "to"} ${peer}`;
}
export function generateAwsGuide(t: Topology): AwsGuideStep[] {
  const steps: AwsGuideStep[] = [];
  const name = (id?: string) =>
    t.resources.find((r) => r.id === id)?.name || "Not configured";
  const resources = (kind: Resource["kind"]) =>
    t.resources.filter((r) => r.kind === kind);
  for (const vpc of resources("vpc"))
    steps.push({
      title: `Create ${vpc.name}`,
      purpose: "Define the regional private address space.",
      instructions: [
        "Open Amazon VPC in the selected Region. Choose Your VPCs → Create VPC → VPC only.",
        "Enter the name and IPv4 CIDR, then choose Create VPC.",
      ],
      values: [
        `Name: ${vpc.name}`,
        `CIDR: ${vpc.cidr || "Not configured"}`,
        `Region: ${vpc.regionName || name(vpc.parentId)}`,
      ],
      expected:
        "A VPC with a main route table, local route and default ACL exists.",
      mistakes:
        "Do not create an overlapping address range if this VPC will later be peered. Select the intended Region.",
      docs: awsDocs.vpc,
    });
  for (const subnet of resources("subnet"))
    steps.push({
      title: `Create ${subnet.name}`,
      purpose: "Allocate one subnet within the VPC and one Availability Zone.",
      instructions: [
        "VPC → Subnets → Create subnet. Select the parent VPC.",
        "Enter the name, zone and CIDR. Review route-table and ACL associations separately.",
      ],
      values: [
        `VPC: ${name(subnet.vpcId)}`,
        `CIDR: ${subnet.cidr || "Not configured"}`,
        `Availability Zone: ${t.resources.find((r) => r.id === subnet.azId)?.zoneName || subnet.zoneName || "Not configured"}`,
        `Desired type: ${subnet.subnetType || "private"}`,
        `Route table: ${effectiveTable(t, subnet)?.name || "MISSING"}`,
      ],
      expected:
        "The subnet range fits inside its VPC and does not overlap another subnet.",
      mistakes:
        "A 'public' name or desired-type label does not create internet access. Public subnets require an Internet Gateway route; private IPv4 EC2 internet access has additional requirements.",
      docs: awsDocs.subnet,
    });
  if (resources("sg").length)
    steps.push({
      title: "Create the required Security Groups",
      purpose:
        "Create the groups before launching instances or referencing other groups.",
      instructions: [
        "EC2 → Security Groups → Create security group. Use the matching VPC for each group.",
        "Record the AWS-generated group IDs; diagram IDs are local identifiers, not AWS IDs. Configure the rules in the security step below.",
      ],
      values: resources("sg").map(
        (r) =>
          `${r.name}: VPC ${name(r.vpcId)}; ${r.description || "instance traffic policy"}`,
      ),
      expected: "All referenced groups exist in the correct VPC.",
      mistakes:
        "Do not add unrestricted inbound rules just to make a test pass. Allow rules from multiple attached groups are combined.",
      docs: awsDocs.security,
    });
  for (const ec2 of resources("ec2"))
    steps.push({
      title: `Launch ${ec2.name}`,
      purpose:
        "Place the instance in its chosen subnet with the intended address and policies.",
      instructions: [
        "EC2 → Instances → Launch instances. Set the name, AMI and instance type.",
        "Expand Network settings. Choose the VPC, subnet and existing security groups. Set the private IP in advanced network configuration and review public-IP assignment.",
        "Select an approved management method, storage and key-pair settings appropriate to your account, then launch.",
      ],
      values: [
        `Operating system: ${ec2.os || "Linux"}`,
        `Instance type: ${ec2.instanceType || "Not configured"}`,
        `VPC: ${vpcOf(t, ec2)?.name || "MISSING"}`,
        `Subnet: ${name(ec2.subnetId)}`,
        `Private IP: ${ec2.ip || "Not configured"}`,
        `Auto-assign public IPv4: ${ec2.publicIpAuto ? "enabled" : "disabled"}`,
        `Security Groups: ${groupsOf(ec2).map(name).join(", ") || "MISSING"}`,
      ],
      expected:
        "The instance reaches Running and its actual network settings match the model.",
      mistakes:
        "A private instance is not directly reachable from a laptop over the internet. Use authorized private management access, such as Systems Manager with the required IAM and endpoints/connectivity.",
      docs: awsDocs.ec2,
    });
  if (resources("routeTable").length)
    steps.push({
      title: "Verify local VPC routing and subnet associations",
      purpose:
        "Inspect forwarding policies in both directions; route tables are not appliances.",
      instructions: [
        "VPC → Route tables → select each table and inspect Routes and Subnet associations.",
        "Associate each subnet with its intended table (or the VPC main table). Confirm the most-specific matching route for both private addresses uses local for this scenario.",
      ],
      values: resources("routeTable").flatMap((r) => {
        let routes: string[];
        try {
          routes = effectiveRoutes(t, r).map(
            (route) =>
              `${route.destination} → ${route.target === "local" ? "local" : name(route.target)}${route.enabled ? "" : " (DISABLED)"}`,
          );
        } catch {
          routes = ["INVALID ROUTE CONFIGURATION — fix the diagram first"];
        }
        return [
          `${r.name}: ${routes.join("; ")}`,
          `Subnets: ${
            resources("subnet")
              .filter((s) => effectiveTable(t, s)?.id === r.id)
              .map((s) => s.name)
              .join(", ") || "none"
          }`,
        ];
      }),
      expected: "The private path uses local VPC routing in both directions.",
      mistakes:
        "Do not add NAT or Internet Gateways for same-VPC private communication. More-specific routes can override a local route.",
      docs: awsDocs.routing,
    });
  steps.push({
    title: "Configure security and host policies",
    purpose: "Permit only the intended request and its response.",
    instructions: [
      "EC2 → Security Groups → edit inbound and outbound rules to match the modeled rules below, replacing group names with their AWS IDs.",
      "VPC → Network ACLs → inspect actual subnet associations and ordered rules. Permit request and return traffic.",
      "On each instance verify the actual OS firewall. For TCP, start and verify the destination application on the configured listening port.",
    ],
    values: [
      ...resources("sg").flatMap((r) => [
        `${r.name}:`,
        ...(r.rules || []).map((rule) => describeAwsRule(t, rule)),
      ]),
      ...resources("nacl").flatMap((r) => [
        `${r.name} (stateless):`,
        ...(r.rules || []).map(
          (rule) => `#${rule.priority} ${describeAwsRule(t, rule)}`,
        ),
      ]),
      ...resources("ec2").map(
        (r) =>
          `${r.name}: host-firewall assumption ${r.osFirewall || "unknown"}; listening ports ${(r.services || []).join(", ") || "none"}`,
      ),
    ],
    expected:
      "Source outbound, destination inbound, both subnet ACL directions and actual host settings permit the test.",
    mistakes:
      "ICMP has type/code instead of ports. Stateful SG replies are automatic; stateless ACL replies are not. The model's TCP client uses port 49152; verify your OS ephemeral range.",
    docs: awsDocs.security,
  });
  const source = t.resources.find((r) => r.id === t.builder?.sourceId),
    target = t.resources.find((r) => r.id === t.builder?.targetId);
  const ip = target?.ip || "DESTINATION_PRIVATE_IP",
    protocol = t.builder?.protocol || "ICMP",
    port = t.builder?.port || 8080;
  const command =
    protocol === "ICMP"
      ? `ping ${source?.os === "Windows" ? "-n" : "-c"} 4 ${ip}`
      : source?.os === "Windows"
        ? `Test-NetConnection ${ip} -Port ${port}`
        : `nc -vz ${ip} ${port}`;
  steps.push({
    title: "Test connectivity in AWS",
    purpose: "Observe actual connectivity independently of this local model.",
    instructions: [
      `Access ${source?.name || "the source instance"} through an authorized management path. Run the test there, not on your laptop.`,
      command,
      "Compare the real result with the modeled checklist. Check the application separately after a successful TCP connection.",
    ],
    values: [
      `Source: ${source?.name || "Not selected"} (${source?.ip || "unknown"})`,
      `Destination: ${target?.name || "Not selected"} (${ip})`,
      `Protocol: ${protocol}${protocol === "ICMP" ? " Echo Request" : `, port ${port}`}`,
    ],
    expected:
      protocol === "ICMP"
        ? "Echo replies arrive from the destination private IP."
        : "The destination application accepts a TCP connection on the selected port.",
    mistakes:
      "A diagram pass does not prove runtime connectivity. DNS, IAM, host rules and application state may differ in AWS.",
    docs: awsDocs.troubleshoot,
  });
  const validation = validateAwsConnectivity(t);
  steps.push({
    title: "Troubleshoot and clean up",
    purpose:
      "Use evidence to identify failures and remove unused resources after the exercise.",
    instructions: [
      "Review CIDRs, instance placement, effective routes, source outbound and destination inbound SG rules, both ACL directions, host firewall and application state.",
      "Use VPC Reachability Analyzer for supported configuration analysis and VPC Flow Logs to investigate traffic. Verify runtime behavior from the instances.",
      "When finished, terminate lab instances and remove unused resources according to your account's cleanup policy.",
    ],
    values: validation.checks
      .filter((c) => c.status !== "pass")
      .map((c) => `${c.label}: ${c.explanation} Fix: ${c.fix}`),
    expected: validation.message,
    mistakes:
      "Changing many controls at once obscures the cause. Fix one failed requirement at a time and retest.",
    docs: awsDocs.troubleshoot,
  });
  for (const resource of t.resources.filter(
    (r) =>
      ![
        "awsCloud",
        "region",
        "az",
        "vpc",
        "subnet",
        "ec2",
        "sg",
        "nacl",
        "routeTable",
      ].includes(r.kind),
  ))
    steps.push({
      title: `Additional resource: ${resource.name}`,
      purpose:
        awsDefinition(resource.kind)?.description ||
        "Additional architecture component.",
      instructions: [
        awsDefinition(resource.kind)?.next ||
          "Configure the corresponding AWS service.",
        "This resource is architectural context; the two-instance validator does not certify its service-specific configuration.",
      ],
      values: [
        `VPC: ${name(resource.vpcId)}`,
        `Subnet: ${name(resource.subnetId)}`,
        `Service: ${resource.serviceName || "not applicable"}`,
        `Relationships: ${(resource.relatedIds || []).map(name).join(", ") || "none"}`,
      ],
      expected:
        "Follow the service's documentation and validate it separately in AWS.",
      mistakes:
        "An architectural relationship does not configure listeners, IAM, VPN tunnels, transit routes, DNS or service policies.",
      docs: awsDefinition(resource.kind)?.docs || awsDocs.vpc,
    });
  return steps;
}
export function awsGuideMarkdown(t: Topology) {
  return `# ${t.name}\n\nLocal model only. No AWS changes have been executed.\n\n${generateAwsGuide(
    t,
  )
    .map(
      (step, i) =>
        `## ${i + 1}. ${step.title}\n\n${step.purpose}\n\n${step.instructions.map((x, j) => `${j + 1}. ${x}`).join("\n")}\n\n${step.values.map((v) => `- ${v}`).join("\n")}\n\nExpected: ${step.expected}\n\nCommon mistakes: ${step.mistakes}\n\n[AWS documentation](${step.docs})`,
    )
    .join("\n\n")}`;
}
