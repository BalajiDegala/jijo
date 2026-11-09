import { describe, expect, it } from "vitest";
import { threeTierTemplate } from "../data/threeTier";
import { localTemplate } from "../data/templates";
import { validateTopology } from "./topologyEngine";
import { subnetExposure } from "./awsEngine";
import { deserialize, serialize } from "./persistence";
import { planConnection } from "./connectionEngine";
import { simulate } from "./simulationEngine";
import { useLab } from "../store";

describe("three-tier architecture graph", () => {
  it("places matching subnet roles in both zones with valid addresses and same-zone egress", () => {
    const t = threeTierTemplate();
    expect(validateTopology(t)).toEqual([]);
    expect(t.resources.filter((r) => r.kind === "subnet")).toHaveLength(8);
    for (const zone of ["a", "b"]) {
      for (const tier of ["public", "web", "app", "db"]) {
        const subnet = t.resources.find((r) => r.id === `${tier}-${zone}`)!;
        expect(subnet.azId).toBe(`az-${zone}`);
        expect(subnetExposure(t, subnet)).toBe(
          tier === "public" ? "public" : tier === "db" ? "isolated" : "private",
        );
        const routes = t.resources.find(
          (r) => r.id === subnet.routeTableId,
        )!.routes!;
        expect(routes.find((r) => r.destination === "0.0.0.0/0")?.target).toBe(
          tier === "public" ? "igw" : tier === "db" ? undefined : `nat-${zone}`,
        );
      }
    }
  });

  it("models shared load balancers, both active compute tiers, and a standby without application traffic", () => {
    const t = threeTierTemplate();
    for (const service of ["public-alb", "internal-alb"])
      expect(
        t.resources.filter((r) => r.kind === "alb" && r.serviceId === service),
      ).toHaveLength(2);
    for (const group of ["web-asg", "app-asg"])
      expect(
        t.links.filter((l) => l.kind === "membership" && l.source === group),
      ).toHaveLength(2);
    expect(
      t.links
        .filter((l) => l.kind === "request" && l.target === "db-a-instance")
        .map((l) => l.source)
        .sort(),
    ).toEqual(["app-server-a", "app-server-b"]);
    expect(
      t.links.filter(
        (l) => l.kind === "request" && l.target === "db-b-instance",
      ),
    ).toHaveLength(0);
    expect(t.links.find((l) => l.kind === "replication")).toMatchObject({
      source: "db-a-instance",
      target: "db-b-instance",
    });
    expect(t.dns["app-db.netverse"]).toBe(
      t.resources.find((r) => r.id === "db-a-instance")!.ip,
    );
  });

  it("round-trips graph nodes, typed connections, and edits while rejecting malformed metadata", () => {
    const t = threeTierTemplate();
    t.resources.find((r) => r.id === "web-server-a")!.x = 72;
    expect(deserialize(serialize(t))).toEqual(t);
    expect(() =>
      deserialize(JSON.stringify({ ...t, diagram: "unknown" })),
    ).toThrow("diagram type");
    t.links[0].kind = "invalid" as never;
    expect(() => deserialize(serialize(t))).toThrow("connection type");
  });

  it("makes diagram links distinct from packet simulation and retains real route associations", () => {
    const t = threeTierTemplate();
    expect(planConnection(t, "web-server-a", "app-server-a").kind).toBe(
      "diagram",
    );
    expect(planConnection(t, "rt-a", "nat-b").kind).toBe("route");
    expect(planConnection(t, "public-alb-a", "web-server-a").kind).toBe(
      "blocked",
    );
    const result = simulate(t, {
      sourceId: "web-server-a",
      destination: "app-server-a",
      protocol: "TCP",
      port: 443,
    });
    expect(result.success).toBe(false);
    expect(result.reason).toContain("not simulated");
  });

  it("opens the node graph in the AWS builder and clears diagram mode for packet labs", () => {
    useLab.setState({
      topology: localTemplate(),
      past: [],
      future: [],
      page: "local",
    });
    useLab.getState().navigate("aws");
    expect(useLab.getState().topology.diagram).toBe("three-tier");
    useLab.getState().update("web-server-a", { name: "Frontend A" });
    useLab.getState().undo();
    expect(
      useLab.getState().topology.resources.find((r) => r.id === "web-server-a")!
        .name,
    ).toBe("Web replica A");
    useLab.getState().navigate("nat");
    expect(useLab.getState().topology.diagram).toBeUndefined();
    expect(
      useLab.getState().topology.resources.some((r) => r.id === "app"),
    ).toBe(true);
    useLab.getState().navigate("architecture");
    expect(useLab.getState().page).toBe("aws");
    expect(useLab.getState().topology.diagram).toBe("three-tier");
  });
});
