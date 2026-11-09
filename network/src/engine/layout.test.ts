import { beforeEach, expect, it } from "vitest";
import { emptyTemplate } from "../data/templates";
import { useLab } from "../store";
import { absolutePosition } from "./topologyEngine";
import type { Resource, ResourceKind } from "./types";

beforeEach(() =>
  useLab.setState({
    topology: emptyTemplate("aws"),
    selectedId: undefined,
    past: [],
    future: [],
  }),
);

function add(kind: ResourceKind) {
  useLab.getState().add(kind);
  return useLab.getState().selectedId!;
}
function resource(id: string) {
  return useLab.getState().topology.resources.find((item) => item.id === id)!;
}
function select(id: string) {
  useLab.setState({ selectedId: id });
}
function checkLayout() {
  const resources = useLab.getState().topology.resources;
  for (const child of resources) {
    const parent = resources.find((item) => item.id === child.parentId);
    if (parent) {
      expect(child.x).toBeGreaterThan(0);
      expect(child.y).toBeGreaterThanOrEqual(80);
      expect(child.x + child.width!).toBeLessThan(parent.width!);
      expect(child.y + child.height!).toBeLessThan(parent.height!);
    }
    for (const peer of resources.filter(
      (item) => item.id !== child.id && item.parentId === child.parentId,
    )) {
      expect(
        child.x >= peer.x + peer.width! ||
          peer.x >= child.x + child.width! ||
          child.y >= peer.y + peer.height! ||
          peer.y >= child.y + child.height!,
      ).toBe(true);
    }
  }
}

it("manually builds distinct region, VPC, zone and subnet boundaries", () => {
  const region = add("region"),
    vpc = add("vpc"),
    az = add("az"),
    subnet = add("subnet");
  expect(resource(vpc).parentId).toBe(region);
  expect(resource(az).parentId).toBe(vpc);
  expect(resource(subnet)).toMatchObject({
    parentId: az,
    azId: az,
    vpcId: vpc,
  });
  checkLayout();
});

it("grows every outer boundary for additional zones, with atomic undo and redo", () => {
  const region = add("region"),
    vpc = add("vpc");
  add("az");
  add("az");
  const before = structuredClone(useLab.getState().topology);
  add("az");
  expect(resource(vpc).width).toBeGreaterThan(
    before.resources.find((item) => item.id === vpc)!.width!,
  );
  expect(resource(region).width).toBeGreaterThan(
    before.resources.find((item) => item.id === region)!.width!,
  );
  checkLayout();
  const after = structuredClone(useLab.getState().topology);
  useLab.getState().undo();
  expect(useLab.getState().topology).toEqual(before);
  useLab.getState().redo();
  expect(useLab.getState().topology).toEqual(after);
});

it("uses the chosen region and keeps multiple VPCs and expanded regions separate", () => {
  const firstRegion = add("region"),
    firstVpc = add("vpc"),
    secondRegion = add("region"),
    secondVpc = add("vpc");
  expect(resource(secondVpc).parentId).toBe(secondRegion);
  select(firstRegion);
  const thirdVpc = add("vpc");
  expect(resource(thirdVpc).parentId).toBe(firstRegion);
  select(firstVpc);
  add("az");
  add("az");
  add("az");
  checkLayout();
});

it("fits an edge-dropped VPC using the whole container and reserves heading space", () => {
  const region = add("region"),
    bounds = resource(region);
  useLab
    .getState()
    .add("vpc", {
      x: bounds.x + bounds.width! - 1,
      y: bounds.y + bounds.height! - 1,
    });
  const vpc = resource(useLab.getState().selectedId!);
  expect(vpc.parentId).toBe(region);
  const absolute = absolutePosition(vpc, useLab.getState().topology.resources);
  expect(absolute.x).toBeGreaterThan(bounds.x);
  expect(absolute.y).toBeGreaterThan(bounds.y);
  checkLayout();
});

it("keeps existing content inside a resized VPC and expands its region", () => {
  const region = add("region"),
    vpc = add("vpc");
  add("az");
  add("az");
  useLab.getState().update(vpc, { width: 300, height: 220 });
  checkLayout();
  const oldRegionWidth = resource(region).width!;
  useLab.getState().update(vpc, { width: 1600, height: 900 });
  expect(resource(region).width).toBeGreaterThan(oldRegionWidth);
  checkLayout();
});

it("places a VPC associated to another region below its heading without overlap", () => {
  add("region");
  const firstVpc = add("vpc"),
    targetRegion = add("region");
  add("vpc");
  useLab
    .getState()
    .update(firstVpc, { parentId: targetRegion } satisfies Partial<Resource>);
  expect(resource(firstVpc).parentId).toBe(targetRegion);
  checkLayout();
});
