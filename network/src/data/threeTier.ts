import type { Link, Resource, Topology } from "../engine/types";

/** Editable resources for the same canvas used by the other network laboratories. */
export function threeTierTemplate(): Topology {
  const resources: Resource[] = [];
  const links: Link[] = [];
  const node = (
    id: string,
    kind: Resource["kind"],
    name: string,
    x: number,
    y: number,
    extra: Partial<Resource> = {},
  ) => {
    resources.push({ id, kind, name, x, y, enabled: true, ...extra });
  };
  const link = (
    source: string,
    target: string,
    kind: NonNullable<Link["kind"]>,
    label: string,
    horizontal = false,
  ) => {
    links.push({
      id: `${kind}-${source}-${target}`,
      source,
      target,
      kind,
      label,
      sourceHandle: horizontal ? "out-right" : "out-bottom",
      targetHandle: horizontal ? "in-left" : "in-top",
    });
  };
  node("region", "region", "AWS · us-east-1", 0, 0, {
    width: 2080,
    height: 1700,
  });
  node("vpc", "vpc", "Three-tier VPC", 30, 210, {
    parentId: "region",
    cidr: "10.0.0.0/16",
    width: 2020,
    height: 1460,
  });
  node("internet", "internet", "Browser / internet", 630, 55, {
    parentId: "region",
    ip: "203.0.113.100",
    services: [443],
    description:
      "The browser opens HTTPS to the internet-facing ALB. DNS resolution happens before the request.",
  });
  node("igw", "igw", "Internet gateway", 600, 45, {
    parentId: "vpc",
    vpcId: "vpc",
    description:
      "Attached to the VPC. Public subnet default routes use this gateway.",
  });
  link("internet", "igw", "request", "HTTPS 443");
  for (const [zone, x, pub, web, app, db] of [
    ["a", 30, 0, 10, 20, 30],
    ["b", 750, 1, 11, 21, 31],
  ] as const) {
    const z = zone.toUpperCase();
    node(`az-${zone}`, "az", `Availability Zone ${z}`, x, 195, {
      parentId: "vpc",
      vpcId: "vpc",
      width: 680,
      height: 1235,
    });
    const subnets = [
      ["public", "Public entry", pub, 70, "rt-public"],
      ["web", "1 · Private web", web, 360, `rt-${zone}`],
      ["app", "2 · Private application", app, 650, `rt-${zone}`],
      ["db", "3 · Isolated database", db, 950, "rt-db"],
    ] as const;
    for (const [tier, title, block, y, routeTableId] of subnets) {
      node(`${tier}-${zone}`, "subnet", `${title} ${z}`, 20, y, {
        parentId: `az-${zone}`,
        azId: `az-${zone}`,
        vpcId: "vpc",
        cidr: `10.0.${block}.0/24`,
        routeTableId,
        width: 640,
        height: 260,
      });
    }
    const inSubnet = (
      id: string,
      kind: Resource["kind"],
      name: string,
      subnet: string,
      ip: string,
      x: number,
      extra: Partial<Resource> = {},
    ) => {
      node(id, kind, name, x, 90, {
        parentId: subnet,
        subnetId: subnet,
        vpcId: "vpc",
        ip,
        prefix: 24,
        ...extra,
      });
    };
    inSubnet(
      `public-alb-${zone}`,
      "alb",
      `Public ALB · ${z}`,
      `public-${zone}`,
      `10.0.${pub}.10`,
      25,
      {
        serviceId: "public-alb",
        services: [443],
        description:
          "One node of the shared internet-facing ALB. Both zones participate in the same service; healthy web targets in either zone are eligible.",
      },
    );
    inSubnet(
      `nat-${zone}`,
      "nat",
      `NAT gateway ${z}`,
      `public-${zone}`,
      `10.0.${pub}.5`,
      365,
      {
        eipId: `eip-${zone}`,
        description: `Private servers in zone ${z} use this gateway for outbound internet access. It is not on the inbound request path.`,
      },
    );
    inSubnet(
      `web-server-${zone}`,
      "ec2",
      `Web replica ${z}`,
      `web-${zone}`,
      `10.0.${web}.10`,
      25,
      {
        tier: "web",
        serviceId: "web-asg",
        services: [8080],
        description:
          "Serves frontend pages and proxies API requests to the shared internal ALB. Same application version in both zones.",
      },
    );
    inSubnet(
      `internal-alb-${zone}`,
      "alb",
      `Internal ALB · ${z}`,
      `app-${zone}`,
      `10.0.${app}.5`,
      25,
      {
        serviceId: "internal-alb",
        services: [443],
        description:
          "One node of the shared private ALB. Web replicas call this service; it selects healthy application replicas in either zone.",
      },
    );
    inSubnet(
      `app-server-${zone}`,
      "ec2",
      `Application replica ${z}`,
      `app-${zone}`,
      `10.0.${app}.10`,
      365,
      {
        tier: "app",
        serviceId: "app-asg",
        services: [8080],
        description:
          "Runs API and business logic. Connects to the stable RDS DNS name using PostgreSQL with TLS on port 5432.",
      },
    );
    inSubnet(
      `db-${zone}-instance`,
      "rds",
      zone === "a" ? "RDS primary · A" : "RDS standby · B",
      `db-${zone}`,
      `10.0.${db}.10`,
      365,
      {
        serviceId: "app-database",
        role: zone === "a" ? "primary" : "standby",
        services: [5432],
        description:
          zone === "a"
            ? "Initially serves database reads and writes. RDS synchronously replicates changes to the standby in B."
            : "Synchronous failover copy. It does not serve ordinary application traffic until promoted after primary failure.",
      },
    );
    node(
      `eip-${zone}`,
      "eip",
      `NAT public IP ${z}`,
      zone === "a" ? 1480 : 1750,
      900,
      {
        parentId: "vpc",
        vpcId: "vpc",
        publicIp: zone === "a" ? "203.0.113.50" : "203.0.113.51",
      },
    );
    link("igw", `public-alb-${zone}`, "request", "Public entry");
    link(
      `public-alb-${zone}`,
      `web-server-${zone}`,
      "request",
      "Web target · 8080",
    );
    link(
      `web-server-${zone}`,
      `internal-alb-${zone}`,
      "request",
      "API request · 443",
    );
    link(
      `internal-alb-${zone}`,
      `app-server-${zone}`,
      "request",
      "App target · 8080",
      true,
    );
    // Both app replicas use the current primary, not the standby in their own zone.
    link(
      `app-server-${zone}`,
      "db-a-instance",
      "request",
      "RDS endpoint · 5432",
    );
    link("web-asg", `web-server-${zone}`, "membership", "Web group member");
    link("app-asg", `app-server-${zone}`, "membership", "App group member");
  }
  for (const [source, target, label] of [
    ["public-alb-a", "web-server-b", "Cross-zone web target"],
    ["public-alb-b", "web-server-a", "Cross-zone web target"],
    ["web-server-a", "internal-alb-b", "Shared internal ALB"],
    ["web-server-b", "internal-alb-a", "Shared internal ALB"],
    ["internal-alb-a", "app-server-b", "Cross-zone app target"],
    ["internal-alb-b", "app-server-a", "Cross-zone app target"],
  ])
    link(source, target, "cross-zone", label);
  link(
    "db-a-instance",
    "db-b-instance",
    "replication",
    "Synchronous replication",
    true,
  );
  node("db-endpoint", "dbEndpoint", "app-db · DNS endpoint", 1570, 1135, {
    parentId: "vpc",
    vpcId: "vpc",
    serviceId: "app-database",
    description:
      "Both app replicas use this stable DNS name. It resolves to the current primary. On real RDS failover, DNS changes and clients reconnect. This is a name, not a forwarding appliance.",
  });
  link(
    "db-endpoint",
    "db-a-instance",
    "association",
    "DNS resolves to primary",
  );
  node("web-asg", "asg", "Web Auto Scaling", 1570, 430, {
    parentId: "vpc",
    vpcId: "vpc",
    description:
      "One shared group across web A and B. Initial desired capacity: 2, normally one replica per zone. Each surviving zone needs sufficient workload capacity.",
  });
  node("app-asg", "asg", "App Auto Scaling", 1570, 760, {
    parentId: "vpc",
    vpcId: "vpc",
    description:
      "One shared group across app A and B. Initial desired capacity: 2. Instance replacement and scale-out take time.",
  });
  for (const [id, name, x, y, target] of [
    ["rt-public", "Public routes", 1480, 190, "igw"],
    ["rt-db", "Database routes", 1750, 190, ""],
    ["rt-a", "Private routes A", 1480, 550, "nat-a"],
    ["rt-b", "Private routes B", 1750, 550, "nat-b"],
  ] as const)
    node(id, "routeTable", name, x, y, {
      parentId: "vpc",
      vpcId: "vpc",
      routes: [
        {
          id: `${id}-local`,
          destination: "10.0.0.0/16",
          target: "local",
          enabled: true,
        },
        ...(target
          ? [
              {
                id: `${id}-default`,
                destination: "0.0.0.0/0",
                target,
                enabled: true,
              },
            ]
          : []),
      ],
    });
  // Horizontal AZ lanes keep the four tiers readable on a landscape canvas.
  const layout: Record<string, Partial<Resource>> = {
    region: { width: 2180, height: 1160 },
    vpc: { x: 25, y: 190, width: 2130, height: 940 },
    internet: { x: 700, y: 40 },
    igw: { x: 675, y: 45 },
    "db-endpoint": { x: 1830, y: 710, name: "RDS DNS endpoint" },
    "web-asg": { x: 1830, y: 280 },
    "app-asg": { x: 1830, y: 640 },
    "rt-public": { x: 1830, y: 70 },
    "rt-a": { x: 1830, y: 280 },
    "rt-b": { x: 1830, y: 490 },
    "rt-db": { x: 1830, y: 700 },
  };
  for (const zone of ["a", "b"]) {
    const z = zone.toUpperCase();
    layout[`az-${zone}`] = {
      x: 20,
      y: zone === "a" ? 225 : 575,
      width: 1780,
      height: 330,
    };
    for (const [tier, title, x, width] of [
      ["public", "Public entry", 20, 550],
      ["web", "1 · Web", 590, 290],
      ["app", "2 · Application", 900, 550],
      ["db", "3 · Database", 1470, 290],
    ] as const)
      layout[`${tier}-${zone}`] = {
        x,
        y: 65,
        width,
        height: 245,
        name: `${title} ${z}`,
      };
    layout[`public-alb-${zone}`] = { x: 285 };
    layout[`nat-${zone}`] = { x: 25 };
    layout[`app-server-${zone}`] = { x: 285, name: `App replica ${z}` };
    layout[`db-${zone}-instance`] = { x: 25 };
    layout[`eip-${zone}`] = { x: zone === "a" ? 1300 : 1580, y: 55 };
  }
  for (const resource of resources)
    Object.assign(resource, layout[resource.id] ?? {});
  for (const edge of links) {
    const across =
      (edge.kind === "request" &&
        edge.source !== "internet" &&
        edge.source !== "igw") ||
      edge.kind === "cross-zone" ||
      edge.kind === "association";
    edge.sourceHandle = across ? "out-right" : "out-bottom";
    edge.targetHandle = across ? "in-left" : "in-top";
  }
  return {
    version: 1,
    name: "Three-tier web application · two AZs",
    mode: "aws",
    diagram: "three-tier",
    resources,
    links,
    dns: { "app-db.netverse": "10.0.30.10" },
  };
}
