import { beforeEach, describe, expect, it } from "vitest";
import { awsTemplate, localTemplate } from "../data/templates";
import { useLab } from "../store";
import { planConnection } from "./connectionEngine";
import { simulate } from "./simulationEngine";

const request = {
  sourceId: "pc1",
  destination: "pc2",
  protocol: "ICMP" as const,
  port: 80,
};

beforeEach(() => {
  useLab.setState({
    topology: localTemplate(),
    past: [],
    future: [],
    toast: "",
    result: undefined,
  });
});

describe("manual connections", () => {
  it("creates a working cable in either direction, with undo and redo", () => {
    useLab.setState({ topology: { ...localTemplate(), links: [] } });
    expect(simulate(useLab.getState().topology, request).success).toBe(false);
    useLab.getState().connect("pc2", "pc1");
    expect(simulate(useLab.getState().topology, request).success).toBe(true);
    useLab.getState().undo();
    expect(simulate(useLab.getState().topology, request).success).toBe(false);
    useLab.getState().redo();
    expect(simulate(useLab.getState().topology, request).success).toBe(true);
  });

  it("rejects duplicate, self, and missing-node links without changing history", () => {
    const original = useLab.getState().topology;
    for (const [a, b] of [
      ["sw1", "pc1"],
      ["pc1", "pc1"],
      ["missing", "pc1"],
    ]) {
      useLab.getState().connect(a, b);
      expect(useLab.getState().topology).toBe(original);
      expect(useLab.getState().past).toHaveLength(0);
      expect(useLab.getState().toast).not.toBe("");
    }
  });

  it("sets a cloud default route from a reversed pair and undo restores the prior route", () => {
    useLab.setState({ topology: awsTemplate() });
    useLab.getState().connect("igw", "rt-private");
    const table = () =>
      useLab.getState().topology.resources.find((r) => r.id === "rt-private")!;
    expect(
      table().routes?.find((r) => r.destination === "0.0.0.0/0")?.target,
    ).toBe("igw");
    expect(table().routes?.find((r) => r.target === "local")).toBeDefined();
    useLab.getState().undo();
    expect(
      table().routes?.find((r) => r.destination === "0.0.0.0/0")?.target,
    ).toBe("nat");
  });

  it("assigns security and NAT address associations with either selection order", () => {
    const topology = awsTemplate();
    topology.resources.find((r) => r.id === "nat")!.eipId = undefined;
    useLab.setState({ topology });
    useLab.getState().connect("sg-app", "web");
    useLab.getState().connect("eip", "nat");
    expect(
      useLab.getState().topology.resources.find((r) => r.id === "web")?.sgId,
    ).toBe("sg-app");
    expect(
      useLab.getState().topology.resources.find((r) => r.id === "nat")?.eipId,
    ).toBe("eip");
    expect(useLab.getState().topology.links).toEqual([]);
    useLab.getState().connect("nat", "eip");
    expect(useLab.getState().past).toHaveLength(2);
    expect(useLab.getState().toast).toContain("already uses");
  });

  it("explains unsupported cloud connections and rejects cross-VPC associations", () => {
    const topology = awsTemplate();
    useLab.setState({ topology });
    useLab.getState().connect("web", "app");
    expect(useLab.getState().toast).toContain("cannot be joined directly");
    useLab.getState().connect("vpc", "web");
    expect(useLab.getState().toast).toContain("group resources");
    expect(useLab.getState().past).toHaveLength(0);
    topology.resources.find((r) => r.id === "sg-app")!.vpcId = "another-vpc";
    expect(planConnection(topology, "web", "sg-app")).toMatchObject({
      kind: "blocked",
      message: expect.stringContaining("different VPCs"),
    });
  });
});
