import { describe, expect, it } from "vitest";
import {
  calculateCidr,
  contains,
  ipToNumber,
  numberToIp,
  overlaps,
  parseCidr,
  prefixForHosts,
  subnetWithin,
} from "./ipMathEngine";
import { allowAll, localTemplate } from "../data/templates";
import { simulateLocal } from "./packetEngine";
import { longestPrefixMatch } from "./routingEngine";
import {
  deserialize,
  loadProject,
  saveProject,
  serialize,
} from "./persistence";

describe("IPv4 and subnet arithmetic", () => {
  it("round-trips IPv4 boundaries without signed integer overflow", () => {
    for (const ip of ["0.0.0.0", "128.0.0.1", "255.255.255.255"])
      expect(numberToIp(ipToNumber(ip))).toBe(ip);
  });
  it("normalizes host bits and computes /24 boundaries", () => {
    expect(calculateCidr("192.168.1.154/24")).toMatchObject({
      network: "192.168.1.0",
      broadcast: "192.168.1.255",
      mask: "255.255.255.0",
      total: 256,
      usable: 254,
      first: "192.168.1.1",
      last: "192.168.1.254",
    });
  });
  it("handles /0, /31, and /32", () => {
    expect(calculateCidr("1.2.3.4/0").total).toBe(4294967296);
    expect(calculateCidr("10.0.0.10/31")).toMatchObject({
      usable: 2,
      first: "10.0.0.10",
      last: "10.0.0.11",
    });
    expect(calculateCidr("10.0.0.10/32")).toMatchObject({
      usable: 1,
      first: "10.0.0.10",
      last: "10.0.0.10",
    });
  });
  it("applies AWS reservations and validates limits", () => {
    expect(calculateCidr("10.0.1.0/24", true)).toMatchObject({
      usable: 251,
      first: "10.0.1.4",
      last: "10.0.1.254",
      awsValid: true,
    });
    expect(calculateCidr("10.0.1.0/29", true)).toMatchObject({
      usable: 0,
      awsValid: false,
    });
  });
  it("rejects malformed IPs and prefixes", () => {
    for (const ip of ["256.0.0.1", "1.2.3", "01.2.3.4", "1.2.3.-1"])
      expect(() => ipToNumber(ip)).toThrow();
    for (const cidr of ["10.0.0.0/33", "10.0.0.0/-1", "10.0.0.0/"])
      expect(() => parseCidr(cidr)).toThrow();
  });
  it("compares network boundaries exactly", () => {
    expect(contains("192.168.1.0/26", "192.168.1.63")).toBe(true);
    expect(contains("192.168.1.0/26", "192.168.1.64")).toBe(false);
    expect(overlaps("10.0.0.0/24", "10.0.0.128/25")).toBe(true);
    expect(overlaps("10.0.0.0/25", "10.0.0.128/25")).toBe(false);
    expect(subnetWithin("10.0.2.0/24", "10.0.0.0/16")).toBe(true);
  });
  it("sizes subnets from required host counts", () => {
    expect(prefixForHosts(50)).toBe(26);
    expect(prefixForHosts(252, true)).toBe(23);
    expect(prefixForHosts(1)).toBe(32);
    expect(() => prefixForHosts(0)).toThrow();
  });
});
describe("Local connectivity", () => {
  const req = {
    sourceId: "pc1",
    destination: "pc2",
    protocol: "ICMP" as const,
    port: 0,
  };
  it("resolves ARP, learns MACs, and returns a same-subnet reply", () => {
    const result = simulateLocal(localTemplate(), req);
    expect(result.success).toBe(true);
    expect(result.events.some((e) => e.type === "arp")).toBe(true);
    expect(Object.keys(result.macTables.sw1)).toHaveLength(2);
    expect(result.events.some((e) => e.packet.reply)).toBe(true);
  });
  it("does not cross disconnected Ethernet segments", () => {
    const t = localTemplate();
    t.links.pop();
    const result = simulateLocal(t, req);
    expect(result.success).toBe(false);
    expect(result.reason).toContain("ARP cannot reach");
    expect(result.events.filter((e) => e.type === "forward")).toHaveLength(0);
  });
  it("requires a router for different subnets", () => {
    const t = localTemplate();
    t.resources[2].ip = "192.168.2.10";
    expect(simulateLocal(t, req).reason).toContain("default gateway");
  });
  it("routes across two subnets with forwarding enabled", () => {
    expect(simulateLocal(localTemplate(true), req).success).toBe(true);
  });
  it("rejects a missing or incorrect gateway", () => {
    const t = localTemplate(true);
    t.resources[0].gateway = "192.168.1.254";
    expect(simulateLocal(t, req).reason).toContain("ARP unanswered");
    t.resources[0].gateway = "192.168.9.1";
    expect(simulateLocal(t, req).reason).toContain("not on a connected subnet");
  });
  it("checks the reverse route independently", () => {
    const t = localTemplate(true);
    t.resources[2].gateway = "";
    const res = simulateLocal(t, req);
    expect(res.success).toBe(false);
    expect(res.events.at(-1)?.packet.reply).toBe(true);
  });
  it("checks router forwarding", () => {
    const t = localTemplate(true);
    t.resources.find((r) => r.id === "r1")!.forwarding = false;
    expect(simulateLocal(t, req).reason).toContain("forwarding is disabled");
  });
  it("chooses the longest matching route and keeps blackholes", () => {
    const routes = [
      { id: "default", destination: "0.0.0.0/0", target: "a", enabled: true },
      { id: "local", destination: "10.0.0.0/16", target: "b", enabled: true },
      {
        id: "specific",
        destination: "10.0.1.0/24",
        target: "c",
        enabled: false,
      },
    ];
    expect(longestPrefixMatch(routes, "10.0.1.5")?.id).toBe("specific");
    expect(longestPrefixMatch(routes, "10.0.2.5")?.id).toBe("local");
  });
  it("rejects requests to closed services", () => {
    expect(
      simulateLocal(localTemplate(), { ...req, protocol: "TCP", port: 1234 })
        .reason,
    ).toContain("Connection refused");
  });
});
describe("Project persistence", () => {
  it("rejects malformed forwarding state and non-container parents", () => {
    const t = localTemplate(true);
    (
      t.resources.find((r) => r.id === "r1") as unknown as {
        forwarding: string;
      }
    ).forwarding = "false";
    expect(() => deserialize(serialize(t))).toThrow("forwarding");
    const nested = localTemplate();
    nested.resources[0].parentId = "pc2";
    expect(() => deserialize(serialize(nested))).toThrow("containers");
  });
  it("round-trips through local storage", () => {
    const data = new Map<string, string>();
    const storage = {
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => {
        data.set(k, v);
      },
    };
    const t = localTemplate(true);
    saveProject(t, storage);
    expect(loadProject(storage)).toEqual(t);
  });
  it("rejects malformed and cyclic imports", () => {
    expect(() => deserialize("{}")).toThrow();
    const t = localTemplate();
    t.resources[0].parentId = "pc1";
    expect(() => deserialize(serialize(t))).toThrow(/cyclic/);
  });
});

describe("Additional routing diagnostics", () => {
  const request = {
    sourceId: "pc1",
    destination: "pc2",
    protocol: "ICMP" as const,
    port: 0,
  };
  it("applies both inbound and outbound local firewall policies", () => {
    const t = localTemplate(true);
    const router = t.resources.find((r) => r.id === "r1")!;
    router.kind = "firewall";
    router.rules = allowAll();
    expect(simulateLocal(t, request).success).toBe(true);
    router.rules = router.rules.filter((r) => r.direction === "outbound");
    expect(simulateLocal(t, request).reason).toContain("inbound FIREWALL");
  });
  it("uses static routes when no default gateway is present", () => {
    const t = localTemplate(true);
    t.resources[0].gateway = "";
    t.resources[0].routes = [
      {
        id: "static",
        destination: "192.168.2.0/24",
        target: "192.168.1.1",
        enabled: true,
      },
    ];
    expect(simulateLocal(t, request).success).toBe(true);
  });
});
