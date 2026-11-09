import { create } from "zustand";
import { awsTemplate, localTemplate } from "./data/templates";
import { threeTierTemplate } from "./data/threeTier";
import { makeResource, newId } from "./engine/deviceEngine";
import { loadAwsDraft, loadProject, saveProject } from "./engine/persistence";
import { simulate } from "./engine/simulationEngine";
import { absolutePosition } from "./engine/topologyEngine";
import { numberToIp, parseCidr } from "./engine/ipMathEngine";
import { planConnection } from "./engine/connectionEngine";
import { placeContainer } from "./engine/layoutEngine";
import { connectAwsResources } from "./engine/awsRelationships";
import { newAwsLearningTopology, updateAwsResource } from "./engine/awsBuilder";
import { containerKinds } from "./engine/types";
import type {
  Resource,
  ResourceKind,
  SendRequest,
  SimulationResult,
  Topology,
} from "./engine/types";

export type Page =
  | "fundamentals"
  | "cidr"
  | "local"
  | "architecture"
  | "aws"
  | "routing"
  | "security"
  | "nat"
  | "challenges";
interface LabState {
  topology: Topology;
  past: Topology[];
  future: Topology[];
  selectedId?: string;
  selectedLinkId?: string;
  page: Page;
  result?: SimulationResult;
  step: number;
  playing: boolean;
  speed: number;
  toast: string;
  details: boolean;
  request: SendRequest;
  challengeId?: number;
  completed: number[];
  edit: (fn: (t: Topology) => void) => void;
  update: (id: string, patch: Partial<Resource>) => void;
  add: (kind: ResourceKind, position?: { x: number; y: number }) => void;
  remove: (id: string) => void;
  duplicate: (id: string) => void;
  connect: (source: string, target: string) => void;
  replace: (t: Topology) => void;
  undo: () => void;
  redo: () => void;
  navigate: (page: Page) => void;
  save: () => void;
  load: () => void;
  run: (request?: SendRequest) => SimulationResult;
}
const architectureLink =
  typeof window !== "undefined" && window.location.hash === "#aws-architecture";
const learningLink =
  typeof window !== "undefined" && window.location.hash === "#aws-learning";
function initialLearningTopology() {
  try {
    return loadAwsDraft(localStorage) || newAwsLearningTopology();
  } catch {
    return newAwsLearningTopology();
  }
}
const initial = learningLink
  ? initialLearningTopology()
  : architectureLink
    ? threeTierTemplate()
    : localTemplate();
export const useLab = create<LabState>((set, get) => ({
  topology: initial,
  past: [],
  future: [],
  page: architectureLink || learningLink ? "aws" : "local",
  step: 0,
  playing: false,
  speed: 1,
  toast: "",
  details: true,
  completed: [],
  request: { sourceId: "pc1", destination: "pc2", protocol: "ICMP", port: 80 },
  edit: (fn) => {
    const old = get().topology,
      next = structuredClone(old);
    fn(next);
    set({
      topology: next,
      past: [...get().past.slice(-39), old],
      future: [],
      result: undefined,
      playing: false,
      step: 0,
    });
  },
  update: (id, patch) =>
    get().edit((t) => {
      if (t.builder) {
        updateAwsResource(t, id, patch);
        return;
      }
      const r = t.resources.find((x) => x.id === id);
      if (!r) return;
      const oldPos = absolutePosition(r, t.resources);
      Object.assign(r, patch);
      const parentId =
        patch.subnetId ??
        (r.kind === "subnet" ? (patch.azId ?? patch.vpcId) : undefined);
      if (parentId) {
        r.parentId = parentId;
        r.x = 25;
        r.y = get().topology.diagram ? 90 : 65;
      }
      if (patch.parentId !== undefined && !parentId) {
        const p = t.resources.find((x) => x.id === patch.parentId);
        const pos = p ? absolutePosition(p, t.resources) : { x: 0, y: 0 };
        r.x = Math.max(20, oldPos.x - pos.x);
        r.y = Math.max(50, oldPos.y - pos.y);
      }
      if (
        t.mode === "aws" &&
        containerKinds.includes(r.kind) &&
        ["parentId", "azId", "vpcId", "width", "height"].some(
          (key) => key in patch,
        )
      )
        placeContainer(r, t.resources, { x: r.x, y: r.y });
    }),
  add: (kind, position) => {
    const t = get().topology;
    const r = makeResource(
      kind,
      t.resources.length + 1,
      position?.x ?? 130 + (t.resources.length % 4) * 200,
      position?.y ?? 120 + Math.floor(t.resources.length / 4) * 140,
    );
    if (t.mode === "aws") {
      const droppedOn = position
        ? [...t.resources].reverse().find((x) => {
            if (!["subnet", "az", "vpc", "region"].includes(x.kind))
              return false;
            const p = absolutePosition(x, t.resources);
            return (
              position.x >= p.x &&
              position.x <= p.x + (x.width ?? 0) &&
              position.y >= p.y &&
              position.y <= p.y + (x.height ?? 0)
            );
          })
        : undefined;
      const selected =
        droppedOn ?? t.resources.find((x) => x.id === get().selectedId);
      const selectedSubnet =
        selected?.kind === "subnet"
          ? selected
          : t.resources.find((x) => x.id === selected?.subnetId);
      const vpc =
        selected?.kind === "vpc"
          ? selected
          : (t.resources.find(
              (x) => x.id === (selected?.vpcId ?? selectedSubnet?.vpcId),
            ) ??
            t.resources.find(
              (x) =>
                x.kind === "vpc" &&
                (selected?.kind !== "region" || x.parentId === selected.id),
            ));
      const region =
        selected?.kind === "region"
          ? selected
          : (t.resources.find(
              (x) => x.kind === "region" && x.id === vpc?.parentId,
            ) ?? t.resources.find((x) => x.kind === "region"));
      const subnet =
        selected?.kind === "subnet"
          ? selected
          : (t.resources.find((x) => x.id === selected?.subnetId) ??
            t.resources.find((x) => x.kind === "subnet"));
      const az =
        selected?.kind === "az"
          ? selected
          : t.resources.find((x) => x.kind === "az" && x.vpcId === vpc?.id);
      if (
        [
          "subnet",
          "az",
          "igw",
          "routeTable",
          "sg",
          "nacl",
          "asg",
          "dbEndpoint",
        ].includes(kind)
      )
        r.vpcId = vpc?.id;
      if (["asg", "dbEndpoint"].includes(kind)) r.parentId = vpc?.id;
      if (["ec2", "nat", "alb", "rds"].includes(kind) && subnet) {
        r.subnetId = subnet.id;
        r.parentId = subnet.id;
        r.x = 25;
        r.y = t.diagram ? 90 : 65;
        try {
          const c = parseCidr(subnet.cidr!);
          let n = c.start + 4;
          while (t.resources.some((x) => x.ip === numberToIp(n)) && n < c.end)
            n++;
          r.ip = numberToIp(n);
          r.prefix = c.prefix;
        } catch {
          /* inspector exposes invalid CIDR */
        }
        if (kind === "ec2")
          r.sgId = t.resources.find(
            (x) => x.kind === "sg" && x.vpcId === subnet.vpcId,
          )?.id;
      }
      if (kind === "subnet") {
        r.azId = az?.id;
        r.parentId = az?.id ?? vpc?.id;
        r.x = 20;
        r.y = 60;
        r.routeTableId = t.resources.find(
          (x) => x.kind === "routeTable" && x.vpcId === vpc?.id,
        )?.id;
        try {
          const c = parseCidr(vpc?.cidr ?? "10.0.0.0/16"),
            count = t.resources.filter(
              (x) => x.kind === "subnet" && x.vpcId === vpc?.id,
            ).length;
          r.cidr = `${numberToIp(c.start + (count + 1) * 256)}/24`;
        } catch {
          /* validated in inspector */
        }
      }
      if (kind === "az") {
        r.parentId = vpc?.id;
      }
      if (kind === "vpc") {
        r.parentId = region?.id;
      }
      if (kind === "sg")
        r.rules = [
          {
            id: newId(),
            direction: "outbound",
            protocol: "ALL",
            fromPort: 0,
            toPort: 65535,
            cidr: "0.0.0.0/0",
            action: "allow",
            priority: 100,
          },
        ];
      if (kind === "routeTable" && vpc?.cidr)
        r.routes = [
          {
            id: newId(),
            destination: vpc.cidr,
            target: "local",
            enabled: true,
          },
        ];
      if (position && r.parentId) {
        const parent = t.resources.find((x) => x.id === r.parentId);
        if (parent) {
          const p = absolutePosition(parent, t.resources);
          r.x = containerKinds.includes(kind)
            ? position.x - p.x
            : Math.max(
                15,
                Math.min(
                  position.x - p.x,
                  (parent.width ?? 400) - (t.diagram ? 250 : 175),
                ),
              );
          r.y = containerKinds.includes(kind)
            ? position.y - p.y
            : Math.max(
                50,
                Math.min(position.y - p.y, (parent.height ?? 300) - 150),
              );
        }
      }
    }
    get().edit((next) => {
      next.resources.push(r);
      if (next.mode === "aws" && containerKinds.includes(kind))
        placeContainer(
          r,
          next.resources,
          position ? { x: r.x, y: r.y } : undefined,
        );
    });
    set({ selectedId: r.id });
  },
  remove: (id) =>
    get().edit((t) => {
      const ids = new Set([id]);
      let changed = true;
      while (changed) {
        changed = false;
        for (const r of t.resources)
          if (r.parentId && ids.has(r.parentId) && !ids.has(r.id)) {
            ids.add(r.id);
            changed = true;
          }
      }
      t.resources = t.resources.filter((r) => !ids.has(r.id));
      t.links = t.links.filter((l) => !ids.has(l.source) && !ids.has(l.target));
    }),
  duplicate: (id) => {
    const original = get().topology.resources.find((r) => r.id === id);
    if (!original) return;
    const copy = {
      ...structuredClone(original),
      id: newId(),
      name: `${original.name} copy`,
      x: original.x + 50,
      y: original.y + 100,
    };
    if (copy.ip) {
      const parts = copy.ip.split(".");
      parts[3] = String(Math.min(254, Number(parts[3]) + 1));
      copy.ip = parts.join(".");
    }
    get().edit((t) => t.resources.push(copy));
    set({ selectedId: copy.id });
  },
  connect: (source, target) => {
    const plan = planConnection(get().topology, source, target);
    if (plan.kind === "blocked") {
      set({ toast: plan.message });
      return;
    }
    const a = plan.source,
      b = plan.target;
    switch (plan.kind) {
      case "builder":
        get().edit((t) => connectAwsResources(t, source, target));
        break;
      case "route":
        get().update(a.id, {
          routes: [
            ...(a.routes ?? []).filter((r) => r.destination !== "0.0.0.0/0"),
            {
              id: newId(),
              destination: "0.0.0.0/0",
              target: b.id,
              enabled: true,
            },
          ],
        });
        break;
      case "eip":
        get().update(a.id, { eipId: b.id });
        break;
      case "security":
        get().update(a.id, { sgId: b.id });
        break;
      case "cable":
        get().edit((t) =>
          t.links.push({ id: newId(), source: a.id, target: b.id }),
        );
        break;
      case "diagram":
        get().edit((t) =>
          t.links.push({
            id: newId(),
            source: a.id,
            target: b.id,
            kind: "association",
            label: "Logical connection",
            sourceHandle: "out-bottom",
            targetHandle: "in-top",
          }),
        );
        break;
    }
    set({
      toast: `Connected ${a.name} and ${b.name}. ${get().topology.diagram ? "Diagram updated." : "Use Send packet to test communication."} Undo is available.`,
    });
  },
  replace: (t) => {
    get().edit((next) =>
      Object.assign(
        next,
        { diagram: undefined, builder: undefined },
        structuredClone(t),
      ),
    );
    const endpoints = t.resources.filter((r) =>
      ["computer", "server", "ec2", "internet"].includes(r.kind),
    );
    set({
      selectedId: undefined,
      selectedLinkId: undefined,
      challengeId: undefined,
      request: {
        sourceId: endpoints[0]?.id ?? "",
        destination: endpoints[1]?.id ?? "",
        protocol: "ICMP",
        port: 80,
      },
    });
  },
  navigate: (page) => {
    if (page === "architecture") {
      if (!get().topology.diagram) get().replace(threeTierTemplate());
      set({ page: "aws" });
      return;
    }
    if (page === "aws" && get().topology.mode !== "aws")
      get().replace(threeTierTemplate());
    if (
      ["nat", "security"].includes(page) &&
      (get().topology.mode !== "aws" ||
        get().topology.diagram ||
        get().topology.builder)
    )
      get().replace(awsTemplate());
    if (page === "local" && get().topology.mode !== "local")
      get().replace(localTemplate());
    if (
      page === "routing" &&
      get().topology.mode === "local" &&
      get().topology.name === "My first network"
    )
      get().replace(localTemplate(true));
    set({ page });
  },
  undo: () => {
    const { past, topology, future } = get();
    if (past.length)
      set({
        topology: past[past.length - 1],
        past: past.slice(0, -1),
        future: [topology, ...future],
        result: undefined,
        playing: false,
      });
  },
  redo: () => {
    const { past, topology, future } = get();
    if (future.length)
      set({
        topology: future[0],
        past: [...past, topology],
        future: future.slice(1),
        result: undefined,
        playing: false,
      });
  },
  save: () => {
    try {
      saveProject(get().topology, localStorage);
      set({ toast: "Project saved on this device." });
    } catch {
      set({
        toast: "Storage is unavailable or full. Export your project as JSON.",
      });
    }
  },
  load: () => {
    try {
      const t = loadProject(localStorage);
      if (t) {
        get().replace(t);
        set({ page: t.mode, toast: "Saved project loaded." });
      } else set({ toast: "No saved project on this device yet." });
    } catch (e) {
      set({ toast: `Could not load project: ${(e as Error).message}` });
    }
  },
  run: (request) => {
    const req = request ?? get().request;
    const result = simulate(get().topology, req);
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    set({ request: req, result, step: 0, playing: !reducedMotion });
    return result;
  },
}));
