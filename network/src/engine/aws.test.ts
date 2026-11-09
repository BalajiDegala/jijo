import { describe, expect, it } from "vitest";
import { awsTemplate, allowAll } from "../data/templates";
import { simulate } from "./simulationEngine";
import { subnetExposure } from "./awsEngine";
import { validateTopology } from "./topologyEngine";
import { evaluateRules } from "./securityEngine";
import type { Packet, SendRequest, Topology } from "./types";

const resource = (t: Topology, id: string) =>
  t.resources.find((r) => r.id === id)!;
const outbound: SendRequest = {
  sourceId: "web",
  destination: "internet",
  protocol: "TCP",
  port: 443,
};
describe("AWS VPC routing and public IPv4", () => {
  it("validates the complete template", () =>
    expect(validateTopology(awsTemplate())).toEqual([]));
  it("routes traffic between VPC subnets through local routes", () => {
    const r = simulate(awsTemplate(), { ...outbound, destination: "app" });
    expect(r.success).toBe(true);
    expect(r.events.filter((e) => e.type === "route")).toHaveLength(2);
    expect(
      r.events.some(
        (e) =>
          ["az-a", "az-b", "vpc"].includes(e.resourceId) &&
          e.type === "forward",
      ),
    ).toBe(false);
  });
  it("requires reverse local routing", () => {
    const t = awsTemplate();
    resource(t, "rt-private").routes![0].enabled = false;
    expect(simulate(t, { ...outbound, destination: "app" }).reason).toContain(
      "blackhole",
    );
  });
  it("delivers public outbound traffic with the public address visible on the internet", () => {
    const r = simulate(awsTemplate(), outbound);
    expect(r.success).toBe(true);
    expect(
      r.events.find((e) => e.type === "receive" && e.resourceId === "internet")
        ?.packet.sourceIp,
    ).toBe("203.0.113.10");
  });
  it("requires a public address for the internet gateway", () => {
    const t = awsTemplate();
    resource(t, "web").publicIp = "";
    expect(simulate(t, outbound).reason).toContain("requires a public IPv4");
  });
  it("requires a matching route and live gateway", () => {
    const t = awsTemplate();
    resource(t, "rt-public").routes!.pop();
    expect(simulate(t, outbound).reason).toContain("No route matches");
    const off = awsTemplate();
    resource(off, "igw").enabled = false;
    expect(simulate(off, outbound).reason).toContain(
      "Internet gateway is missing",
    );
  });
  it("derives public status from routes, never subnet names", () => {
    const t = awsTemplate();
    resource(t, "public").name = "Private";
    expect(subnetExposure(t, resource(t, "public"))).toBe("public");
    resource(t, "rt-public").routes!.pop();
    expect(subnetExposure(t, resource(t, "public"))).toBe("isolated");
  });
  it("rejects overlapping and out-of-VPC subnets", () => {
    const t = awsTemplate();
    resource(t, "private").cidr = "10.0.1.0/24";
    expect(
      validateTopology(t).some((e) => e.message.includes("overlaps")),
    ).toBe(true);
    resource(t, "private").cidr = "172.16.1.0/24";
    expect(
      validateTopology(t).some((e) => e.message.includes("fit inside")),
    ).toBe(true);
  });
  it("rejects AWS-reserved private addresses", () => {
    const t = awsTemplate();
    resource(t, "app").ip = "10.0.2.3";
    expect(simulate(t, { ...outbound, sourceId: "app" }).reason).toContain(
      "AWS reserves",
    );
  });
  it("evaluates inbound public requests and the outbound response route", () => {
    const t = awsTemplate();
    expect(
      simulate(t, {
        ...outbound,
        sourceId: "internet",
        destination: "203.0.113.10",
        port: 80,
      }).success,
    ).toBe(true);
    resource(t, "rt-public").routes!.pop();
    const r = simulate(t, {
      ...outbound,
      sourceId: "internet",
      destination: "203.0.113.10",
      port: 80,
    });
    expect(r.success).toBe(false);
    expect(r.events.at(-1)?.packet.reply).toBe(true);
  });
  it("rejects internet traffic addressed to a private IP", () => {
    expect(
      simulate(awsTemplate(), {
        ...outbound,
        sourceId: "internet",
        destination: "10.0.1.10",
      }).reason,
    ).toContain("cannot reach a private IPv4");
  });
});
describe("Public NAT", () => {
  const req = { ...outbound, sourceId: "app" };
  it("translates addresses and ports, then reverses the mapping", () => {
    const r = simulate(awsTemplate(), req);
    expect(r.success).toBe(true);
    expect(r.translations[0]).toMatchObject({
      privateIp: "10.0.2.10",
      privatePort: 49152,
      publicIp: "203.0.113.50",
      publicPort: 55000,
    });
    expect(
      r.events.find((e) => e.type === "receive" && e.resourceId === "internet")
        ?.packet.sourceIp,
    ).toBe("203.0.113.50");
    expect(r.events.at(-1)?.packet.destinationIp).toBe("10.0.2.10");
  });
  it("requires a private default route", () => {
    const t = awsTemplate();
    resource(t, "rt-private").routes!.pop();
    expect(simulate(t, req).reason).toContain("No route matches");
  });
  it("requires an enabled NAT gateway and Elastic IP", () => {
    const t = awsTemplate();
    resource(t, "nat").enabled = false;
    expect(simulate(t, req).reason).toContain("NAT gateway is offline");
    resource(t, "nat").enabled = true;
    resource(t, "nat").eipId = undefined;
    expect(simulate(t, req).reason).toContain("requires an active Elastic IP");
  });
  it("requires the NAT subnet to route through an internet gateway", () => {
    const t = awsTemplate();
    resource(t, "rt-public").routes![1].target = "nat";
    expect(simulate(t, req).reason).toContain("Internet gateway is missing");
  });
  it("rejects moving NAT into a private subnet without an IGW route", () => {
    const t = awsTemplate();
    resource(t, "nat").subnetId = "private";
    resource(t, "nat").ip = "10.0.2.5";
    expect(simulate(t, req).success).toBe(false);
  });
  it("requires a return route from NAT to the private instance", () => {
    const t = awsTemplate();
    resource(t, "rt-public").routes![0].enabled = false;
    const r = simulate(t, req);
    expect(r.success).toBe(false);
    expect(r.events.at(-1)?.packet.reply).toBe(true);
  });
  it("rejects unsolicited inbound traffic to the NAT Elastic IP", () => {
    const r = simulate(awsTemplate(), {
      ...outbound,
      sourceId: "internet",
      destination: "203.0.113.50",
    });
    expect(r.success).toBe(false);
    expect(r.reason).toContain("Unsolicited inbound");
  });
});
describe("Security groups and network ACLs", () => {
  const packet: Packet = {
    sourceIp: "8.8.8.8",
    destinationIp: "10.0.1.10",
    sourcePort: 49152,
    destinationPort: 80,
    protocol: "TCP",
    reply: false,
  };
  it("allows only matching security-group rules", () => {
    expect(evaluateRules([], packet, "inbound", "sg").allowed).toBe(false);
    expect(
      evaluateRules(
        [{ ...allowAll()[0], protocol: "TCP", fromPort: 80, toPort: 80 }],
        packet,
        "inbound",
        "sg",
      ).allowed,
    ).toBe(true);
    expect(
      evaluateRules(
        [{ ...allowAll()[0], protocol: "TCP", fromPort: 443, toPort: 443 }],
        packet,
        "inbound",
        "sg",
      ).allowed,
    ).toBe(false);
  });
  it("tracks SG responses while rejecting new inbound flows", () => {
    const t = awsTemplate();
    resource(t, "sg-web").rules = allowAll().filter(
      (r) => r.direction === "outbound",
    );
    expect(simulate(t, outbound).success).toBe(true);
    expect(
      simulate(t, {
        ...outbound,
        sourceId: "internet",
        destination: "web",
        port: 80,
      }).reason,
    ).toContain("implicit deny");
  });
  it("permits outbound responses to allowed inbound connections without an outbound SG rule", () => {
    const t = awsTemplate();
    resource(t, "sg-web").rules = [
      { ...allowAll()[0], protocol: "TCP", fromPort: 80, toPort: 80 },
    ];
    expect(
      simulate(t, {
        ...outbound,
        sourceId: "internet",
        destination: "web",
        port: 80,
      }).success,
    ).toBe(true);
  });
  it("honors NACL first match by rule number, regardless of array order", () => {
    const rules = [
      { ...allowAll()[0], priority: 200 },
      { ...allowAll()[0], id: "deny", priority: 50, action: "deny" as const },
    ];
    expect(evaluateRules(rules, packet, "inbound", "nacl").allowed).toBe(false);
    expect(
      evaluateRules(rules.reverse(), packet, "inbound", "nacl").allowed,
    ).toBe(false);
  });
  it("blocks return traffic if ephemeral destination ports are not allowed", () => {
    const t = awsTemplate();
    resource(t, "acl").rules = [
      { ...allowAll()[0], protocol: "TCP", fromPort: 80, toPort: 80 },
      { ...allowAll()[1], protocol: "TCP", fromPort: 80, toPort: 80 },
    ];
    const r = simulate(t, {
      ...outbound,
      sourceId: "internet",
      destination: "web",
      port: 80,
    });
    expect(r.success).toBe(false);
    expect(r.events.at(-1)?.packet.destinationPort).toBe(49152);
    expect(r.reason).toContain("ephemeral");
  });
  it("permits the response when ephemeral ports are opened", () => {
    const t = awsTemplate();
    resource(t, "acl").rules = [
      { ...allowAll()[0], protocol: "TCP", fromPort: 80, toPort: 80 },
      { ...allowAll()[1], protocol: "TCP", fromPort: 49152, toPort: 65535 },
    ];
    expect(
      simulate(t, {
        ...outbound,
        sourceId: "internet",
        destination: "web",
        port: 80,
      }).success,
    ).toBe(true);
  });
  it("does not apply subnet NACLs to same-subnet instance traffic", () => {
    const t = awsTemplate();
    resource(t, "app").subnetId = "public";
    resource(t, "app").ip = "10.0.1.20";
    resource(t, "acl").rules = [];
    expect(simulate(t, { ...outbound, destination: "app" }).success).toBe(true);
  });
  it("applies NACLs at the public NAT subnet too", () => {
    const t = awsTemplate();
    t.resources.push({
      id: "nat-acl",
      kind: "nacl",
      name: "NAT ACL",
      x: 0,
      y: 0,
      enabled: true,
      vpcId: "vpc",
      rules: [],
    });
    resource(t, "public").naclId = "nat-acl";
    expect(simulate(t, { ...outbound, sourceId: "app" }).reason).toContain(
      "NAT ACL",
    );
  });
  it("blocks NAT traffic when the source SG disallows egress", () => {
    const t = awsTemplate();
    resource(t, "sg-app").rules = [];
    expect(simulate(t, { ...outbound, sourceId: "app" }).reason).toContain(
      "outbound SG",
    );
  });
});
