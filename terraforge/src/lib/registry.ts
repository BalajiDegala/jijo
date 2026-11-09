import { Schema, Field } from "./model";
const field = (
  key: string,
  label: string,
  description: string,
  extra: Partial<Field> = {},
): Field => ({ key, label, description, ...extra });
const vpc = field(
  "vpc_id",
  "VPC",
  "The network this resource belongs to. Terraform waits for this VPC before creating the resource.",
  {
    required: true,
    kind: "reference",
    target: ["aws_vpc", "data.aws_vpc"],
    tab: "Network",
  },
);
const subnet = field(
  "subnet_id",
  "Subnet",
  "Places the instance in one subnet and its availability zone.",
  {
    required: true,
    kind: "reference",
    target: ["aws_subnet", "data.aws_subnet"],
    tab: "Network",
  },
);
const tags = field(
  "tags",
  "Tags",
  "A map of labels used to identify and organize AWS resources.",
  { kind: "json", tab: "Advanced" },
);
export const registry: Schema[] = [
  {
    type: "aws_vpc",
    label: "VPC",
    category: "Networking",
    color: "violet",
    icon: "network",
    description: "An isolated virtual network for your AWS infrastructure.",
    defaults: {
      cidr_block: "10.0.0.0/16",
      enable_dns_support: true,
      enable_dns_hostnames: true,
      tags: { Name: "main-vpc" },
    },
    fields: [
      field(
        "cidr_block",
        "IPv4 CIDR",
        "The private address range available to your network.",
        { required: true },
      ),
      field(
        "enable_dns_support",
        "DNS resolution",
        "Enables the Amazon DNS resolver.",
        { kind: "boolean", tab: "Network" },
      ),
      field(
        "enable_dns_hostnames",
        "DNS hostnames",
        "Assigns DNS hostnames to instances.",
        { kind: "boolean", tab: "Network" },
      ),
      tags,
    ],
  },
  {
    type: "data.aws_vpc",
    label: "Existing VPC",
    category: "Data Sources",
    color: "violet",
    icon: "search",
    kind: "data",
    description: "Read the existing default VPC. No new VPC is created.",
    defaults: { default: true },
    fields: [
      field(
        "default",
        "Default VPC",
        "Read the default VPC in the selected region.",
        { kind: "boolean" },
      ),
    ],
  },
  {
    type: "aws_subnet",
    label: "Subnet",
    category: "Networking",
    color: "blue",
    icon: "layers",
    description:
      "A range of addresses within a VPC, located in one availability zone.",
    defaults: {
      cidr_block: "10.0.1.0/24",
      availability_zone: "us-east-1a",
      map_public_ip_on_launch: false,
      tags: { Name: "public-subnet" },
    },
    fields: [
      vpc,
      field(
        "cidr_block",
        "IPv4 CIDR",
        "Must fit inside the VPC range and not overlap another subnet.",
        { required: true },
      ),
      field(
        "availability_zone",
        "Availability zone",
        "One isolated location within the selected AWS region.",
        { tab: "Network" },
      ),
      field(
        "map_public_ip_on_launch",
        "Assign public IP",
        "Assign public IPv4 addresses at launch. A route to an internet gateway is also required.",
        { kind: "boolean", tab: "Network" },
      ),
      tags,
    ],
  },
  {
    type: "data.aws_subnet",
    label: "Existing subnet",
    category: "Data Sources",
    color: "blue",
    icon: "search",
    kind: "data",
    description: "Look up a default subnet in an availability zone.",
    defaults: { default_for_az: true, availability_zone: "us-east-1a" },
    fields: [
      field(
        "default_for_az",
        "Default for AZ",
        "Select the default subnet in this availability zone.",
        { kind: "boolean" },
      ),
      field(
        "availability_zone",
        "Availability zone",
        "The existing subnet availability zone.",
        { required: true },
      ),
    ],
  },
  {
    type: "aws_internet_gateway",
    label: "Internet gateway",
    category: "Networking",
    color: "teal",
    icon: "globe",
    description:
      "Connect a VPC to the internet. Subnets need an explicit route to use it.",
    defaults: { tags: { Name: "main-igw" } },
    fields: [vpc, tags],
  },
  {
    type: "aws_route_table",
    label: "Route table",
    category: "Networking",
    color: "teal",
    icon: "route",
    description: "Selects the next hop for traffic leaving a subnet.",
    defaults: { route: [] },
    blocks: ["route"],
    fields: [
      vpc,
      field(
        "route",
        "Routes",
        "Each route includes cidr_block and gateway_id or nat_gateway_id.",
        { kind: "json", tab: "Network" },
      ),
      tags,
    ],
  },
  {
    type: "aws_route_table_association",
    label: "Route association",
    category: "Networking",
    color: "teal",
    icon: "link",
    description: "Explicitly attaches a route table to a subnet.",
    defaults: {},
    fields: [
      subnet,
      field(
        "route_table_id",
        "Route table",
        "The routing rules used by this subnet.",
        {
          kind: "reference",
          target: ["aws_route_table"],
          required: true,
          tab: "Network",
        },
      ),
    ],
  },
  {
    type: "aws_security_group",
    label: "Security group",
    category: "Security",
    color: "green",
    icon: "shield",
    description:
      "A stateful firewall attached to network interfaces, within a VPC.",
    defaults: {
      description: "Managed by TerraForge",
      ingress: [
        {
          description: "SSH from trusted network",
          from_port: 22,
          to_port: 22,
          protocol: "tcp",
          cidr_blocks: ["203.0.113.0/24"],
        },
      ],
      egress: [
        {
          from_port: 0,
          to_port: 0,
          protocol: "-1",
          cidr_blocks: ["0.0.0.0/0"],
        },
      ],
      tags: { Name: "web-sg" },
    },
    blocks: ["ingress", "egress"],
    fields: [
      vpc,
      field(
        "description",
        "Description",
        "Describe the purpose of the firewall.",
      ),
      field(
        "ingress",
        "Inbound rules",
        "Allowed incoming traffic. Use your real trusted CIDR before applying; the example range is documentation-only.",
        { kind: "json", tab: "Security" },
      ),
      field(
        "egress",
        "Outbound rules",
        "Allowed outgoing traffic. Return traffic is tracked automatically.",
        { kind: "json", tab: "Security" },
      ),
      tags,
    ],
  },
  {
    type: "aws_key_pair",
    label: "SSH key pair",
    category: "Security",
    color: "amber",
    icon: "key",
    description:
      "Register an SSH public key. The private key stays on your machine.",
    defaults: {
      key_name: "terraforge-key",
      public_key: { expr: "var.ssh_public_key" },
    },
    fields: [
      field("key_name", "Key name", "The key pair name registered with EC2.", {
        required: true,
      }),
      field(
        "public_key",
        "Public key",
        "An OpenSSH PUBLIC key only. Never paste a private key.",
        { required: true },
      ),
      tags,
    ],
  },
  {
    type: "tls_private_key",
    label: "Generate SSH key",
    category: "Security",
    color: "amber",
    icon: "key",
    description:
      "Terraform generates a key. Its private material is stored in Terraform state; secure your state backend.",
    defaults: { algorithm: "ED25519" },
    fields: [
      field("algorithm", "Algorithm", "The public-key algorithm.", {
        kind: "select",
        options: ["ED25519", "RSA"],
        required: true,
      }),
    ],
  },
  {
    type: "data.aws_ami",
    label: "AMI lookup",
    category: "Data Sources",
    color: "orange",
    icon: "search",
    kind: "data",
    description:
      "Select the latest Amazon Linux 2023 x86_64 machine image in this region.",
    defaults: {
      most_recent: true,
      owners: ["amazon"],
      filter: [
        { name: "name", values: ["al2023-ami-2023.*-x86_64"] },
        { name: "virtualization-type", values: ["hvm"] },
      ],
    },
    blocks: ["filter"],
    fields: [
      field(
        "most_recent",
        "Latest image",
        "Select the most recent matching image. Pin an ID for repeatable deployments.",
        { kind: "boolean" },
      ),
      field("owners", "Image owners", "Trusted AMI owners.", {
        kind: "json",
        required: true,
      }),
      field(
        "filter",
        "Filters",
        "AWS AMI filters applied before selecting an image.",
        { kind: "json" },
      ),
    ],
  },
  {
    type: "aws_instance",
    label: "EC2 instance",
    category: "Compute",
    color: "orange",
    icon: "cpu",
    description: "A virtual server launched from an AMI, inside a subnet.",
    defaults: {
      instance_type: "t3.micro",
      associate_public_ip_address: true,
      tags: { Name: "web-server" },
    },
    fields: [
      field(
        "ami",
        "Machine image (AMI)",
        "The operating system image. Use a region-specific AMI ID or an AMI data source.",
        { required: true, kind: "reference", target: ["data.aws_ami"] },
      ),
      field(
        "instance_type",
        "Instance type",
        "CPU and memory capacity. Availability and price depend on region.",
        {
          required: true,
          kind: "select",
          options: [
            "t3.micro",
            "t3.small",
            "t3.medium",
            "t3.large",
            "m5.large",
          ],
        },
      ),
      subnet,
      field(
        "vpc_security_group_ids",
        "Security groups",
        "Firewall groups attached to this instance. They must belong to the same VPC.",
        {
          required: true,
          kind: "reference",
          target: ["aws_security_group"],
          tab: "Security",
        },
      ),
      field(
        "key_name",
        "SSH key pair",
        "The registered public key for SSH authentication.",
        {
          kind: "reference",
          target: ["aws_key_pair"],
          attr: "key_name",
          tab: "Security",
        },
      ),
      field(
        "associate_public_ip_address",
        "Public IPv4 address",
        "Internet access also requires an internet gateway route and firewall rules.",
        { kind: "boolean", tab: "Network" },
      ),
      field(
        "user_data",
        "User data",
        "A startup shell script; never include secrets.",
        { tab: "Advanced" },
      ),
      tags,
    ],
  },
  {
    type: "aws_s3_bucket",
    label: "S3 bucket",
    category: "Storage",
    color: "green",
    icon: "database",
    description: "Object storage with a globally unique bucket name.",
    defaults: {},
    fields: [
      field(
        "bucket_prefix",
        "Bucket prefix",
        "AWS appends a unique suffix to avoid global name collisions.",
        { default: "terraforge-" },
      ),
      tags,
    ],
  },
  {
    type: "aws_db_subnet_group",
    label: "DB subnet group",
    category: "Databases",
    color: "pink",
    icon: "database",
    description: "Subnets across at least two availability zones for RDS.",
    defaults: { name: "terraforge-db" },
    fields: [
      field("name", "Name", "Database subnet group name."),
      field(
        "subnet_ids",
        "Subnets",
        "Choose at least two subnets in different availability zones.",
        {
          kind: "reference",
          target: ["aws_subnet"],
          required: true,
          tab: "Network",
        },
      ),
      tags,
    ],
  },
  {
    type: "aws_db_instance",
    label: "RDS database",
    category: "Databases",
    color: "pink",
    icon: "database",
    description:
      "A managed PostgreSQL database. Passwords are managed in AWS Secrets Manager.",
    defaults: {
      identifier: "terraforge-db",
      allocated_storage: 20,
      engine: "postgres",
      instance_class: "db.t3.micro",
      username: "tfadmin",
      manage_master_user_password: true,
      skip_final_snapshot: false,
      final_snapshot_identifier: "terraforge-final",
      publicly_accessible: false,
    },
    fields: [
      field("identifier", "Identifier", "The unique name of this database."),
      field("engine", "Engine", "The database engine.", { required: true }),
      field(
        "instance_class",
        "Instance class",
        "Compute and memory allocated to the database.",
        { required: true },
      ),
      field(
        "allocated_storage",
        "Storage (GB)",
        "Allocated database storage.",
        { kind: "number", required: true },
      ),
      field("username", "Administrator", "Master username.", {
        required: true,
      }),
      field(
        "manage_master_user_password",
        "Manage password",
        "Store the generated master password in Secrets Manager.",
        { kind: "boolean", tab: "Security" },
      ),
      field(
        "db_subnet_group_name",
        "Subnet group",
        "Subnets in multiple availability zones.",
        {
          kind: "reference",
          target: ["aws_db_subnet_group"],
          attr: "name",
          required: true,
          tab: "Network",
        },
      ),
      field("vpc_security_group_ids", "Security groups", "Database firewall.", {
        kind: "reference",
        target: ["aws_security_group"],
        tab: "Security",
      }),
      field(
        "publicly_accessible",
        "Publicly accessible",
        "Keep disabled for private databases.",
        { kind: "boolean", tab: "Network" },
      ),
      field(
        "skip_final_snapshot",
        "Skip final snapshot",
        "Whether to skip the final snapshot on destroy.",
        { kind: "boolean", tab: "Advanced" },
      ),
      field(
        "final_snapshot_identifier",
        "Final snapshot name",
        "Required when keeping a final snapshot.",
        { tab: "Advanced" },
      ),
    ],
  },
  {
    type: "aws_lb",
    label: "Load balancer",
    category: "Load Balancing",
    color: "pink",
    icon: "split",
    description:
      "Distribute requests across targets in multiple availability zones.",
    defaults: {
      name: "terraforge-alb",
      internal: false,
      load_balancer_type: "application",
    },
    fields: [
      field("name", "Name", "Load balancer name."),
      field("internal", "Internal", "Make this load balancer private.", {
        kind: "boolean",
      }),
      field("load_balancer_type", "Type", "AWS load balancer type.", {
        kind: "select",
        options: ["application", "network"],
      }),
      field(
        "subnets",
        "Subnets",
        "At least two subnets in distinct availability zones for an ALB.",
        {
          kind: "reference",
          target: ["aws_subnet"],
          required: true,
          tab: "Network",
        },
      ),
      field("security_groups", "Security groups", "Load balancer firewall.", {
        kind: "reference",
        target: ["aws_security_group"],
        tab: "Security",
      }),
    ],
  },
  {
    type: "aws_lb_target_group",
    label: "Target group",
    category: "Load Balancing",
    color: "pink",
    icon: "split",
    description: "Defines the protocol, port, and VPC of backend targets.",
    defaults: { port: 80, protocol: "HTTP" },
    fields: [
      vpc,
      field("port", "Port", "The application port.", {
        kind: "number",
        required: true,
      }),
      field("protocol", "Protocol", "Backend protocol.", { required: true }),
    ],
  },
  {
    type: "aws_lb_listener",
    label: "Listener",
    category: "Load Balancing",
    color: "pink",
    icon: "route",
    description: "Receives requests and forwards to a target group.",
    defaults: { port: 80, protocol: "HTTP", default_action: [] },
    blocks: ["default_action"],
    fields: [
      field(
        "load_balancer_arn",
        "Load balancer",
        "The load balancer receiving requests.",
        { kind: "reference", target: ["aws_lb"], attr: "arn", required: true },
      ),
      field("port", "Port", "Listener port.", {
        kind: "number",
        required: true,
      }),
      field(
        "protocol",
        "Protocol",
        "Use HTTPS with a certificate in production.",
        { required: true },
      ),
      field(
        "default_action",
        "Forwarding action",
        "A forward action references a target group ARN.",
        { kind: "json", required: true },
      ),
    ],
  },
  {
    type: "aws_lb_target_group_attachment",
    label: "Target attachment",
    category: "Load Balancing",
    color: "pink",
    icon: "link",
    description: "Registers an EC2 instance with a target group.",
    defaults: { port: 80 },
    fields: [
      field(
        "target_group_arn",
        "Target group",
        "Group to register the instance with.",
        {
          kind: "reference",
          target: ["aws_lb_target_group"],
          attr: "arn",
          required: true,
        },
      ),
      field("target_id", "EC2 target", "An individual EC2 instance ID.", {
        kind: "reference",
        target: ["aws_instance"],
        required: true,
      }),
      field("port", "Port", "Backend port.", { kind: "number" }),
    ],
  },
  {
    type: "aws_vpc_peering_connection",
    label: "VPC peering",
    category: "Networking",
    color: "violet",
    icon: "link",
    description:
      "A connection between two non-overlapping VPCs. Both sides also need routes.",
    defaults: { auto_accept: true },
    fields: [
      vpc,
      field("peer_vpc_id", "Peer VPC", "The other VPC.", {
        kind: "reference",
        target: ["aws_vpc"],
        required: true,
      }),
      field(
        "auto_accept",
        "Auto accept",
        "For same-account, same-region connections.",
        { kind: "boolean" },
      ),
    ],
  },
  {
    type: "aws_iam_role",
    label: "IAM role",
    category: "IAM",
    color: "amber",
    icon: "shield",
    description:
      "An AWS identity with a trust policy. Attach permissions separately.",
    defaults: {
      name: "terraforge-ec2-role",
      assume_role_policy: {
        expr: 'jsonencode({ Version = "2012-10-17", Statement = [{ Action = "sts:AssumeRole", Effect = "Allow", Principal = { Service = "ec2.amazonaws.com" } }] })',
      },
    },
    fields: [
      field("name", "Role name", "The role name."),
      field(
        "assume_role_policy",
        "Trust policy",
        "JSON policy specifying who may assume this role.",
        { required: true },
      ),
    ],
  },
  {
    type: "output",
    label: "Output",
    category: "Terraform Language",
    color: "blue",
    icon: "arrow",
    kind: "output",
    description:
      "Expose a useful value after Terraform applies the configuration.",
    defaults: { description: "A value from this infrastructure" },
    fields: [
      field("description", "Description", "Explain this output."),
      field(
        "value",
        "Value",
        "An expression or resource attribute to expose.",
        {
          kind: "reference",
          target: ["aws_instance", "aws_vpc", "aws_lb", "aws_s3_bucket"],
          required: true,
        },
      ),
      field(
        "sensitive",
        "Sensitive",
        "Hide the value in CLI output; the value still exists in state.",
        { kind: "boolean" },
      ),
    ],
  },
  {
    type: "variable",
    label: "Variable",
    category: "Terraform Language",
    color: "violet",
    icon: "braces",
    kind: "variable",
    blocks: ["validation"],
    description: "A reusable input for this Terraform project.",
    defaults: {
      type: { expr: "string" },
      description: "Project input",
      default: "example",
    },
    fields: [
      field("description", "Description", "What the input controls."),
      field("type", "Type", "A Terraform type constraint.", { required: true }),
      field(
        "default",
        "Default value",
        "Omit to require callers to supply a value.",
      ),
      field(
        "sensitive",
        "Sensitive",
        "Redacts CLI output. State can still contain this value.",
        { kind: "boolean" },
      ),
      field(
        "validation",
        "Validation rules",
        "Conditions and error messages for this input.",
        { kind: "json", tab: "Advanced" },
      ),
    ],
  },
  {
    type: "locals",
    label: "Local value",
    category: "Terraform Language",
    color: "violet",
    icon: "braces",
    kind: "locals",
    description: "Name a reusable expression without adding an input.",
    defaults: { value: "development" },
    fields: [
      field("value", "Value", "A literal or Terraform expression.", {
        required: true,
      }),
    ],
  },
  {
    type: "module",
    label: "Module",
    category: "Terraform Language",
    color: "violet",
    icon: "box",
    kind: "module",
    description:
      "A reusable Terraform configuration. Module inputs require its own documented schema.",
    defaults: {
      source: "terraform-aws-modules/vpc/aws",
      version: "~> 5.0",
      name: "module-vpc",
      cidr: "10.20.0.0/16",
    },
    fields: [
      field("source", "Source", "A registry or local module source.", {
        required: true,
      }),
      field("version", "Version", "Pin a compatible module version."),
      field("name", "VPC name", "Input supported by the default VPC module."),
      field("cidr", "VPC CIDR", "Input supported by the default VPC module."),
    ],
  },
];
export const schemaFor = (type: string) =>
  registry.find((x) => x.type === type);
export const multiFields = [
  "vpc_security_group_ids",
  "subnet_ids",
  "subnets",
  "security_groups",
  "depends_on",
];
