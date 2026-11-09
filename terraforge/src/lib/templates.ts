import { Project, Resource, Value, ref } from "./model";
import { schemaFor } from "./registry";
export function makeResource(
  type: string,
  name: string,
  args: Record<string, Value> = {},
  id = name,
): Resource {
  const s = schemaFor(type)!;
  return {
    id,
    type,
    name,
    kind: s.kind ?? "resource",
    args: { ...structuredClone(s.defaults), ...args },
  };
}
export const templates = [
  {
    id: "public",
    name: "The first connection",
    label: "Custom VPC + EC2",
    description:
      "Build a complete public subnet, with explicit routing and a secure SSH rule.",
    level: "Beginner",
    resources: "8 resources",
    color: "violet",
  },
  {
    id: "default",
    name: "Hello, infrastructure",
    label: "Default VPC + EC2",
    description:
      "Read an existing network and launch your first virtual machine.",
    level: "Beginner",
    resources: "4 resources",
    color: "orange",
  },
  {
    id: "key",
    name: "Your keys, your server",
    label: "Generated SSH key",
    description: "Understand public keys, private keys, and Terraform state.",
    level: "Beginner",
    resources: "9 resources",
    color: "amber",
  },
  {
    id: "subnets",
    name: "A place for everything",
    label: "Public & private subnets",
    description:
      "One public subnet and two isolated private subnets across zones.",
    level: "Intermediate",
    resources: "10 resources",
    color: "blue",
  },
  {
    id: "count",
    name: "One block. A hundred servers.",
    label: "100 instances with count",
    description:
      "Scale a single resource block and understand index-based identity.",
    level: "Intermediate",
    resources: "100 instances",
    color: "orange",
  },
  {
    id: "foreach",
    name: "Infrastructure with identity",
    label: "Groups with for_each",
    description: "Use stable named keys for distinct application groups.",
    level: "Intermediate",
    resources: "6 instances",
    color: "violet",
  },
  {
    id: "application",
    name: "Behind the scenes",
    label: "Public & private application",
    description: "A public entry point and a private application tier.",
    level: "Intermediate",
    resources: "12 resources",
    color: "teal",
  },
  {
    id: "loadbalancer",
    name: "Share the load",
    label: "ALB + EC2 targets",
    description:
      "An application load balancer spanning two availability zones.",
    level: "Advanced",
    resources: "17 resources",
    color: "pink",
  },
  {
    id: "peering",
    name: "Better connected",
    label: "Multi-VPC peering",
    description: "Connect two non-overlapping networks with explicit routes.",
    level: "Advanced",
    resources: "15 resources",
    color: "violet",
  },
  {
    id: "three",
    name: "Built in layers",
    label: "Three-tier architecture",
    description: "Web, application, and managed database tiers in one network.",
    level: "Advanced",
    resources: "16 resources",
    color: "pink",
  },
];
export function createTemplate(id = "public"): Project {
  const r: Resource[] = [];
  const add = (
    type: string,
    name: string,
    args: Record<string, Value> = {},
  ) => {
    const x = makeResource(type, name, args);
    r.push(x);
    return x;
  };
  const p: Project = {
    version: 1,
    id: "terraforge-project",
    name: "my-first-infrastructure",
    region: "us-east-1",
    providerVersion: "~> 6.0",
    resources: r,
    updatedAt: Date.now(),
  };
  if (id === "empty") {
    p.name = "untitled-project";
    return p;
  }
  if (id === "default") {
    add("data.aws_vpc", "default");
    add("data.aws_subnet", "default");
  } else {
    add("aws_vpc", "main");
    add("aws_subnet", "public", {
      vpc_id: ref("main"),
      map_public_ip_on_launch: true,
    });
    add("aws_internet_gateway", "main_igw", { vpc_id: ref("main") });
    add("aws_route_table", "public_routes", {
      vpc_id: ref("main"),
      route: [{ cidr_block: "0.0.0.0/0", gateway_id: ref("main_igw") }],
    });
    add("aws_route_table_association", "public_assoc", {
      subnet_id: ref("public"),
      route_table_id: ref("public_routes"),
    });
  }
  add("aws_security_group", "web_sg", {
    vpc_id: ref(id === "default" ? "default" : "main"),
  });
  add("data.aws_ami", "amazon_linux");
  add("aws_key_pair", "deployer");
  add("aws_instance", "web", {
    ami: ref("amazon_linux"),
    subnet_id: ref(id === "default" ? "default_subnet" : "public"),
    vpc_security_group_ids: [ref("web_sg")],
    key_name: ref("deployer", "key_name"),
  });
  if (id === "default") {
    r.find((x) => x.type === "data.aws_subnet")!.id = "default_subnet";
    r.find((x) => x.type === "aws_instance")!.args.associate_public_ip_address =
      false;
  }
  add("output", "instance_public_ip", {
    description: "Public IPv4 address of the web instance",
    value: ref("web", "public_ip"),
  });
  if (id === "key") {
    add("tls_private_key", "ssh");
    r.find((x) => x.id === "deployer")!.args.public_key = ref(
      "ssh",
      "public_key_openssh",
    );
  }
  if (id === "count") {
    r.find((x) => x.id === "web")!.scale = {
      mode: "count",
      count: 100,
      keys: [],
    };
    p.name = "one-hundred-servers";
  }
  if (id === "foreach") {
    r.find((x) => x.id === "web")!.scale = {
      mode: "for_each",
      count: 1,
      keys: ["blue", "green", "canary"],
    };
    add("aws_instance", "worker", {
      ami: ref("amazon_linux"),
      instance_type: "t3.small",
      subnet_id: ref("public"),
      vpc_security_group_ids: [ref("web_sg")],
      key_name: ref("deployer", "key_name"),
    }).scale = {
      mode: "for_each",
      count: 1,
      keys: ["jobs", "events", "reports"],
    };
  }
  if (["subnets", "application", "three"].includes(id)) {
    add("aws_subnet", "private_a", {
      vpc_id: ref("main"),
      cidr_block: "10.0.10.0/24",
      availability_zone: "us-east-1a",
      tags: { Name: "private-a" },
    });
    add("aws_subnet", "private_b", {
      vpc_id: ref("main"),
      cidr_block: "10.0.11.0/24",
      availability_zone: "us-east-1b",
      tags: { Name: "private-b" },
    });
  }
  if (["application", "three"].includes(id)) {
    add("aws_security_group", "app_sg", {
      vpc_id: ref("main"),
      ingress: [
        {
          from_port: 8080,
          to_port: 8080,
          protocol: "tcp",
          security_groups: [ref("web_sg")],
        },
      ],
    });
    add("aws_instance", "app", {
      ami: ref("amazon_linux"),
      subnet_id: ref("private_a"),
      vpc_security_group_ids: [ref("app_sg")],
      associate_public_ip_address: false,
    });
  }
  if (id === "three") {
    add("aws_security_group", "database_sg", {
      vpc_id: ref("main"),
      ingress: [
        {
          from_port: 5432,
          to_port: 5432,
          protocol: "tcp",
          security_groups: [ref("app_sg")],
        },
      ],
    });
    add("aws_db_subnet_group", "database_subnets", {
      subnet_ids: [ref("private_a"), ref("private_b")],
    });
    add("aws_db_instance", "database", {
      db_subnet_group_name: ref("database_subnets", "name"),
      vpc_security_group_ids: [ref("database_sg")],
    });
  }
  if (id === "loadbalancer") {
    add("aws_subnet", "public_b", {
      vpc_id: ref("main"),
      cidr_block: "10.0.2.0/24",
      availability_zone: "us-east-1b",
      map_public_ip_on_launch: true,
    });
    add("aws_route_table_association", "public_b_assoc", {
      subnet_id: ref("public_b"),
      route_table_id: ref("public_routes"),
    });
    add("aws_security_group", "alb_sg", {
      vpc_id: ref("main"),
      ingress: [
        {
          from_port: 80,
          to_port: 80,
          protocol: "tcp",
          cidr_blocks: ["0.0.0.0/0"],
        },
      ],
    });
    r.find((x) => x.id === "web_sg")!.args.ingress = [
      {
        from_port: 80,
        to_port: 80,
        protocol: "tcp",
        security_groups: [ref("alb_sg")],
      },
    ];
    r.find((x) => x.id === "web")!.args.user_data =
      "#!/bin/bash\ndnf install -y nginx\nsystemctl enable --now nginx";
    add("aws_lb", "application_lb", {
      subnets: [ref("public"), ref("public_b")],
      security_groups: [ref("alb_sg")],
    });
    add("aws_lb_target_group", "web_targets", { vpc_id: ref("main") });
    add("aws_lb_listener", "http", {
      load_balancer_arn: ref("application_lb", "arn"),
      default_action: [
        { type: "forward", target_group_arn: ref("web_targets", "arn") },
      ],
    });
    add("aws_lb_target_group_attachment", "web_attachment", {
      target_group_arn: ref("web_targets", "arn"),
      target_id: ref("web"),
    });
  }
  if (id === "peering") {
    add("aws_vpc", "peer", {
      cidr_block: "10.1.0.0/16",
      tags: { Name: "peer-vpc" },
    });
    add("aws_subnet", "peer_subnet", {
      vpc_id: ref("peer"),
      cidr_block: "10.1.1.0/24",
    });
    add("aws_vpc_peering_connection", "peering", {
      vpc_id: ref("main"),
      peer_vpc_id: ref("peer"),
    });
    (r.find((x) => x.id === "public_routes")!.args.route as Value[]).push({
      cidr_block: "10.1.0.0/16",
      vpc_peering_connection_id: ref("peering"),
    });
    add("aws_route_table", "peer_routes", {
      vpc_id: ref("peer"),
      route: [
        {
          cidr_block: "10.0.0.0/16",
          vpc_peering_connection_id: ref("peering"),
        },
      ],
    });
    add("aws_route_table_association", "peer_assoc", {
      subnet_id: ref("peer_subnet"),
      route_table_id: ref("peer_routes"),
    });
  }
  return p;
}
