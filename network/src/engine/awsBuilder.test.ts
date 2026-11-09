import { beforeEach, describe, expect, it } from "vitest";
import {
  addAwsResource,
  addRecommendedAwsRules,
  arrangeAws,
  groupsOf,
  newAwsLearningTopology,
  updateAwsResource,
} from "./awsBuilder";
import {
  awsConfigurationIssues,
  effectiveAcl,
  effectiveTable,
  validateAwsConnectivity,
} from "./awsValidation";
import { awsGuideMarkdown, generateAwsGuide } from "./awsGuide";
import {
  awsRelationships,
  builderConnection,
  connectAwsResources,
  removeAwsRelationship,
} from "./awsRelationships";
import { deserialize, serialize } from "./persistence";
import { useLab } from "../store";
import { containerKinds } from "./types";
import type { Resource, Topology } from "./types";

function scenario() {
  const t = newAwsLearningTopology();
  const vpc = addAwsResource(t, "vpc");
  const subnetA = addAwsResource(t, "subnet", {
    parentId: vpc.id,
    zone: "us-east-1a",
  });
  const subnetB = addAwsResource(t, "subnet", {
    parentId: vpc.id,
    zone: "us-east-1b",
  });
  const a = addAwsResource(t, "ec2", { parentId: subnetA.id });
  const b = addAwsResource(t, "ec2", { parentId: subnetB.id });
  return { t, vpc, subnetA, subnetB, a, b };
}
function ready() {
  const s = scenario();
  addRecommendedAwsRules(s.t);
  s.a.osFirewall = "allow";
  s.b.osFirewall = "allow";
  return s;
}
const status = (t: Topology, id: string) =>
  validateAwsConnectivity(t).checks.find((c) => c.id === id)?.status;

describe("AWS two-subnet model", () => {
  it("keeps regional placement and generated instructions consistent after a Region edit", () => {
    const { t, vpc, subnetA } = scenario();
    updateAwsResource(t, vpc.parentId!, { regionName: "eu-west-1" });
    expect(vpc.regionName).toBe("eu-west-1");
    expect(subnetA.zoneName).toBe("eu-west-1a");
    const guide = generateAwsGuide(t)
      .flatMap((step) => step.values)
      .join("\n");
    expect(guide).toContain("Region: eu-west-1");
    expect(guide).toContain("Availability Zone: eu-west-1a");
  });
  it("builds nested placement, implicit AWS defaults and two private IPs without internet gateways", () => {
    const { t, vpc, subnetA, subnetB, a, b } = scenario();
    expect([subnetA.cidr, subnetB.cidr]).toEqual([
      "10.0.1.0/24",
      "10.0.2.0/24",
    ]);
    expect([a.ip, b.ip]).toEqual(["10.0.1.10", "10.0.2.10"]);
    expect(a.parentId).toBe(subnetA.id);
    expect(b.parentId).toBe(subnetB.id);
    expect(subnetA.vpcId).toBe(vpc.id);
    expect(subnetB.vpcId).toBe(vpc.id);
    expect(effectiveTable(t, subnetA)?.routes?.[0]).toMatchObject({
      destination: vpc.cidr,
      target: "local",
    });
    expect(effectiveAcl(t, subnetA)?.rules).toHaveLength(2);
    expect(awsConfigurationIssues(t)).toEqual([]);
    expect(status(t, "routing")).toBe("pass");
    expect(status(t, "security")).toBe("fail");
    expect(status(t, "host")).toBe("unknown");
    expect(t.resources.some((r) => ["igw", "nat"].includes(r.kind))).toBe(
      false,
    );
  });
  it("does not confuse a line with reachability and permits a correctly configured private ping", () => {
    const { t, a, b } = scenario();
    connectAwsResources(t, a.id, b.id);
    t.builder!.showPath = true;
    expect(validateAwsConnectivity(t).passed).toBe(false);
    addRecommendedAwsRules(t);
    a.osFirewall = "allow";
    b.osFirewall = "allow";
    expect(validateAwsConnectivity(t).passed).toBe(true);
    expect(validateAwsConnectivity(t).message).toContain(
      "Actual connectivity must still be verified in AWS",
    );
    expect(groupsOf(a)).toHaveLength(1);
  });
  it("rejects overlapping and outside subnet CIDRs and missing parents", () => {
    const { t, vpc } = scenario();
    expect(() =>
      addAwsResource(t, "subnet", { parentId: vpc.id, cidr: "10.0.1.0/24" }),
    ).toThrow(/overlaps/);
    expect(() =>
      addAwsResource(t, "subnet", { parentId: vpc.id, cidr: "192.168.0.0/24" }),
    ).toThrow(/fit inside/);
    expect(() => addAwsResource(t, "ec2")).toThrow(/Choose a Subnet/);
  });
  it("detects invalid edits, reserved or duplicate IPs and wrong-VPC placement", () => {
    const { t, a, b, subnetB, vpc } = ready();
    updateAwsResource(t, subnetB.id, { cidr: "10.0.1.0/24" });
    expect(status(t, "cidrs")).toBe("fail");
    updateAwsResource(t, subnetB.id, { cidr: "10.0.2.0/24" });
    b.ip = "10.0.2.3";
    expect(validateAwsConnectivity(t).passed).toBe(false);
    b.ip = a.ip;
    expect(
      awsConfigurationIssues(t).some((i) => i.message.includes("already used")),
    ).toBe(true);
    const other = addAwsResource(t, "vpc");
    updateAwsResource(t, subnetB.id, { vpcId: other.id });
    expect(subnetB.vpcId).not.toBe(vpc.id);
    expect(status(t, "vpc")).toBe("fail");
  });
  it("checks local routes both ways and respects a disabled or overriding route", () => {
    const { t, subnetA, subnetB } = ready();
    const table = effectiveTable(t, subnetA)!;
    table.routes![0].enabled = false;
    expect(status(t, "routing")).toBe("fail");
    table.routes![0].enabled = true;
    table.routes!.push({
      id: "override",
      destination: subnetB.cidr!,
      target: "missing-gateway",
      enabled: true,
    });
    expect(status(t, "routing")).toBe("fail");
    table.routes!.pop();
    subnetB.routeTableId = "missing";
    expect(status(t, "routing")).toBe("fail");
    subnetB.routeTableId = undefined;
    expect(status(t, "routing")).toBe("pass");
  });
  it("requires source outbound and destination inbound, supports SG unions and stateful replies", () => {
    const { t, a, b, vpc } = ready();
    const source = t.resources.find((r) => r.id === a.sgId)!;
    const target = t.resources.find((r) => r.id === b.sgId)!;
    target.rules = target.rules!.filter((r) => r.direction === "inbound");
    expect(status(t, "security")).toBe("pass"); // SG replies do not need new outbound rules.
    source.rules = [];
    expect(status(t, "security")).toBe("fail");
    const extra = addAwsResource(t, "sg", { parentId: vpc.id });
    a.sgIds!.push(extra.id);
    expect(status(t, "security")).toBe("pass");
    target.rules![0].securityGroupId = "";
    expect(status(t, "security")).toBe("fail"); // Empty references must never become allow-all.
    expect(
      awsConfigurationIssues(t).some((i) => i.message.includes("references")),
    ).toBe(true);
  });
  it("matches ICMP type/code without interpreting port numbers", () => {
    const { t, b } = ready();
    const rule = t.resources
      .find((r) => r.id === b.sgId)!
      .rules!.find((r) => r.direction === "inbound")!;
    rule.fromPort = 500;
    rule.toPort = 600;
    expect(status(t, "security")).toBe("pass");
    rule.icmpType = 0;
    expect(status(t, "security")).toBe("fail");
    rule.icmpType = 8;
    rule.icmpCode = 3;
    expect(status(t, "security")).toBe("fail");
  });
  it("checks stateless ACL ordering and TCP return ephemeral ports", () => {
    const { t, a, b, subnetA, vpc } = ready();
    t.builder!.protocol = "TCP";
    addRecommendedAwsRules(t);
    expect(validateAwsConnectivity(t).passed).toBe(true);
    const acl = addAwsResource(t, "nacl", { parentId: vpc.id });
    subnetA.naclId = acl.id;
    acl.rules = [
      {
        id: "out",
        priority: 100,
        direction: "outbound",
        protocol: "TCP",
        fromPort: 8080,
        toPort: 8080,
        cidr: `${b.ip}/32`,
        action: "allow",
      },
      {
        id: "in",
        priority: 100,
        direction: "inbound",
        protocol: "TCP",
        fromPort: 8080,
        toPort: 8080,
        cidr: `${b.ip}/32`,
        action: "allow",
      },
    ];
    expect(status(t, "acl")).toBe("fail");
    acl.rules[1].fromPort = 49152;
    acl.rules[1].toPort = 65535;
    expect(status(t, "acl")).toBe("pass");
    acl.rules.push({
      ...acl.rules[1],
      id: "deny",
      priority: 90,
      action: "deny",
    });
    expect(status(t, "acl")).toBe("fail");
    b.services = [80];
    expect(status(t, "runtime")).toBe("fail");
    a.enabled = false;
    expect(status(t, "runtime")).toBe("fail");
  });
  it("does not assume that host firewalls allow traffic", () => {
    const { t, a, b } = ready();
    a.osFirewall = "unknown";
    expect(status(t, "host")).toBe("unknown");
    expect(validateAwsConnectivity(t).passed).toBe(false);
    b.osFirewall = "deny";
    expect(status(t, "host")).toBe("fail");
  });
  it("models relationship changes, deletion fallback and disallows invalid pairs", () => {
    const { t, a, subnetA, vpc } = ready();
    const table = addAwsResource(t, "routeTable", { parentId: vpc.id });
    connectAwsResources(t, table.id, subnetA.id);
    expect(subnetA.routeTableId).toBe(table.id);
    const relationship = awsRelationships(t).find(
      (r) => r.source === subnetA.id && r.target === table.id,
    )!;
    removeAwsRelationship(t, relationship.id);
    expect(effectiveTable(t, subnetA)?.main).toBe(true);
    const other = addAwsResource(t, "vpc");
    const sg = addAwsResource(t, "sg", { parentId: other.id });
    expect(builderConnection(t, a.id, sg.id).allowed).toBe(false);
    expect(builderConnection(t, a.id, vpc.id).allowed).toBe(false);
  });
  it("arranges all siblings without overlap and retains nested containment", () => {
    const { t } = scenario();
    arrangeAws(t);
    const size = (r: Resource) =>
      containerKinds.includes(r.kind)
        ? { w: r.width!, h: r.height! }
        : {
            w: 210,
            h: ["sg", "nacl", "routeTable"].includes(r.kind) ? 120 : 180,
          };
    for (const r of t.resources) {
      const parent = t.resources.find((p) => p.id === r.parentId);
      if (parent) {
        expect(r.x + size(r).w).toBeLessThan(parent.width!);
        expect(r.y + size(r).h).toBeLessThan(parent.height!);
      }
      for (const other of t.resources.filter(
        (p) => p.id !== r.id && p.parentId === r.parentId,
      ))
        expect(
          r.x + size(r).w <= other.x ||
            other.x + size(other).w <= r.x ||
            r.y + size(r).h <= other.y ||
            other.y + size(other).h <= r.y,
        ).toBe(true);
    }
  });
  it("persists progress, modes, references and all new resources while rejecting malformed metadata", () => {
    const { t, vpc, subnetA } = ready();
    for (const kind of ["endpoint", "peering", "vgw"] as const)
      addAwsResource(t, kind, { parentId: vpc.id });
    addAwsResource(t, "nlb", { parentId: subnetA.id });
    t.builder!.mode = "free";
    t.builder!.step = 7;
    t.builder!.showPath = true;
    expect(deserialize(serialize(t))).toEqual(t);
    const bad = structuredClone(t);
    bad.builder!.step = 100;
    expect(() => deserialize(serialize(bad))).toThrow(/progress/);
    const malformed = structuredClone(t);
    malformed.resources[0].relatedIds = [1 as unknown as string];
    expect(() => deserialize(serialize(malformed))).toThrow(/relatedIds/);
  });
  it("generates guide values from the edited diagram and selected protocol", () => {
    const { t, vpc, a, b } = ready();
    updateAwsResource(t, vpc.id, { name: "Research VPC" });
    a.name = "Analysis client";
    b.name = "Metrics API";
    b.ip = "10.0.2.42";
    t.builder!.protocol = "TCP";
    t.builder!.port = 9000;
    const markdown = awsGuideMarkdown(t);
    expect(markdown).toContain("Research VPC");
    expect(markdown).toContain("Analysis client");
    expect(markdown).toContain("nc -vz 10.0.2.42 9000");
    expect(generateAwsGuide(t)).toHaveLength(10);
    expect(markdown).toContain("https://docs.aws.amazon.com/");
  });
});

describe("builder history integration", () => {
  beforeEach(() =>
    useLab.setState({
      topology: newAwsLearningTopology(),
      past: [],
      future: [],
      selectedId: undefined,
    }),
  );
  it("undoes and redoes resource dependencies atomically and preserves mode switches", () => {
    useLab.getState().edit((t) => {
      addAwsResource(t, "vpc");
    });
    const created = structuredClone(useLab.getState().topology);
    expect(created.resources).toHaveLength(5);
    useLab.getState().undo();
    expect(useLab.getState().topology.resources).toHaveLength(0);
    useLab.getState().redo();
    expect(useLab.getState().topology).toEqual(created);
    useLab.getState().edit((t) => {
      t.builder!.mode = "free";
    });
    expect(useLab.getState().topology.resources).toEqual(created.resources);
  });
  it("does not commit partially created resources after an invalid add", () => {
    expect(() =>
      useLab.getState().edit((t) => {
        addAwsResource(t, "vpc", { cidr: "broken" });
      }),
    ).toThrow();
    expect(useLab.getState().topology.resources).toEqual([]);
    expect(useLab.getState().past).toEqual([]);
  });
});
