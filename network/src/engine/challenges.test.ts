import { describe, expect, it } from "vitest";
import { challenges, verifyChallenge } from "./challengeEngine";
import { makeResource } from "./deviceEngine";
import type { Topology } from "./types";

const resource = (t: Topology, id: string) =>
  t.resources.find((r) => r.id === id)!;
describe("Troubleshooting challenge verification", () => {
  it.each(challenges.map((c) => [c.id, c.title] as const))(
    "challenge %i starts broken: %s",
    (id) => {
      const c = challenges.find((c) => c.id === id)!;
      expect(verifyChallenge(id, c.create()).complete).toBe(false);
    },
  );
  it("verifies adding a router and gateways for distinct subnets", () => {
    const t = challenges[0].create();
    const r = makeResource("router", 4);
    t.resources.push(r);
    t.links.push({ id: "to-router", source: "sw1", target: r.id });
    resource(t, "pc1").gateway = "192.168.1.1";
    resource(t, "pc2").gateway = "192.168.2.1";
    expect(verifyChallenge(1, t).complete).toBe(true);
  });
  it("does not complete the routing objective just by changing a host IP", () => {
    const t = challenges[0].create();
    resource(t, "pc2").ip = "192.168.1.20";
    expect(verifyChallenge(1, t).complete).toBe(false);
  });
  it("verifies the corrected gateway", () => {
    const t = challenges[1].create();
    resource(t, "pc1").gateway = "192.168.1.1";
    expect(verifyChallenge(2, t).complete).toBe(true);
  });
  it("verifies restoring an IGW route", () => {
    const t = challenges[2].create();
    resource(t, "rt-public").routes!.push({
      id: "fix",
      destination: "0.0.0.0/0",
      target: "igw",
      enabled: true,
    });
    expect(verifyChallenge(3, t).complete).toBe(true);
  });
  it("verifies restoring a NAT route", () => {
    const t = challenges[3].create();
    resource(t, "rt-private").routes!.push({
      id: "fix",
      destination: "0.0.0.0/0",
      target: "nat",
      enabled: true,
    });
    expect(verifyChallenge(4, t).complete).toBe(true);
  });
  it("verifies an inbound HTTP allow rule", () => {
    const t = challenges[4].create();
    resource(t, "sg-web").rules!.push({
      id: "fix",
      direction: "inbound",
      protocol: "TCP",
      fromPort: 80,
      toPort: 80,
      cidr: "0.0.0.0/0",
      action: "allow",
      priority: 100,
    });
    expect(verifyChallenge(5, t).complete).toBe(true);
  });
});
