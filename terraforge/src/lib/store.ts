import { create } from "zustand";
import { Project, Resource, Value, ref, isRef, references, uid } from "./model";
import { createTemplate, makeResource } from "./templates";
import { schemaFor, multiFields } from "./registry";
export type Mode =
  "Build" | "Explain" | "Reverse" | "Debug" | "Challenge" | "Memory";
export type View = "topology" | "dependencies" | "network" | "inventory";
type State = {
  project: Project;
  selected: string | null;
  view: View;
  mode: Mode;
  past: Project[];
  future: Project[];
  saveState: string;
  notice: string;
  revision: number;
  hydrated: boolean;
  select: (id: string | null) => void;
  setView: (v: View) => void;
  setMode: (m: Mode) => void;
  replace: (p: Project, message?: string) => void;
  change: (fn: (p: Project) => void, message?: string) => void;
  add: (type: string, position?: { x: number; y: number }) => void;
  update: (id: string, patch: Partial<Resource>) => void;
  setArg: (id: string, key: string, value: Value | undefined) => void;
  remove: (id: string) => void;
  undo: () => void;
  redo: () => void;
  connect: (source: string, target: string) => boolean;
  notify: (s: string) => void;
  setSaved: (s: string) => void;
  hydrate: () => Promise<void>;
};
let dbPromise: Promise<IDBDatabase> | undefined;
function db() {
  return (dbPromise ??= new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open("terraforge", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("projects");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }));
}
export async function saveProject(p: Project) {
  const d = await db();
  await new Promise<void>((resolve, reject) => {
    const tx = d.transaction("projects", "readwrite");
    tx.objectStore("projects").put(p, "current");
    tx.objectStore("projects").put(p, p.id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
export async function loadProject() {
  const d = await db();
  return new Promise<Project | undefined>((resolve, reject) => {
    const req = d
      .transaction("projects")
      .objectStore("projects")
      .get("current");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
export const useStudio = create<State>((set, get) => ({
  project: createTemplate(),
  selected: null,
  view: "topology",
  mode: "Build",
  past: [],
  future: [],
  saveState: "Loading",
  notice:
    "Your infrastructure starts with a connection. Select any resource to explore.",
  revision: 0,
  hydrated: false,
  select: (selected) => set({ selected }),
  setView: (view) => set({ view }),
  setMode: (mode) => set({ mode }),
  notify: (notice) => set({ notice }),
  setSaved: (saveState) => set({ saveState }),
  change: (fn, message) => {
    const old = get().project,
      p = structuredClone(old);
    fn(p);
    p.updatedAt = Date.now();
    set((s) => ({
      project: p,
      past: [...s.past.slice(-49), old],
      future: [],
      saveState: "Saving",
      revision: s.revision + 1,
      notice:
        message ?? "Configuration updated. Your Terraform files are in sync.",
    }));
  },
  replace: (p, message) => {
    get().change(
      (d) => Object.assign(d, structuredClone(p)),
      message ?? "Project loaded. Your canvas and Terraform are ready.",
    );
    set({ selected: null });
  },
  add: (type, position) => {
    const schema = schemaFor(type);
    if (!schema) return;
    get().change(
      (p) => {
        let base = type.replace(/^data\./, "").replace(/^aws_|^tls_/, "");
        let name = base,
          i = 1;
        while (p.resources.some((r) => r.type === type && r.name === name))
          name = `${base}_${i++}`;
        const r = makeResource(type, name, {}, uid());
        r.position = position;
        const chosen = p.resources.find((x) => x.id === get().selected);
        for (const f of schema.fields.filter((x) => x.target)) {
          const t =
            chosen && f.target?.includes(chosen.type)
              ? chosen
              : p.resources.find((x) => f.target?.includes(x.type));
          if (t)
            r.args[f.key] = multiFields.includes(f.key)
              ? [ref(t.id, f.attr ?? "id")]
              : ref(t.id, f.attr ?? "id");
        }
        if (type === "aws_subnet") {
          const n = p.resources.filter((x) => x.type === type).length + 1;
          r.args.cidr_block = `10.0.${n}.0/24`;
          r.args.availability_zone = p.region + "a";
        }
        if (type === "data.aws_subnet")
          r.args.availability_zone = p.region + "a";
        if (type === "aws_route_table") {
          const igw = p.resources.find(
            (x) => x.type === "aws_internet_gateway",
          );
          if (igw)
            r.args.route = [
              { cidr_block: "0.0.0.0/0", gateway_id: ref(igw.id) },
            ];
        }
        if (type === "output") {
          const instance = p.resources.find((x) => x.type === "aws_instance");
          if (instance) r.args.value = ref(instance.id, "public_ip");
        }
        if (type === "aws_s3_bucket") r.args.bucket_prefix = "terraforge-";
        p.resources.push(r);
        set({ selected: r.id });
      },
      `${schema.kind === "data" ? "Read" : "Added"} ${schema.label.toLowerCase()}. ${schema.description}`,
    );
  },
  update: (id, patch) =>
    get().change((p) => {
      const r = p.resources.find((x) => x.id === id);
      if (r) Object.assign(r, patch);
    }),
  setArg: (id, key, value) =>
    get().change(
      (p) => {
        const r = p.resources.find((x) => x.id === id);
        if (r) {
          if (value === undefined) delete r.args[key];
          else r.args[key] = value;
        }
      },
      `${key} updated. Terraform ${isRef(value) ? "now references another resource" : "uses your configured value"}.`,
    ),
  remove: (id) => {
    get().change((p) => {
      p.resources = p.resources.filter((r) => r.id !== id);
    }, "Resource removed. Remaining references are preserved and flagged for repair.");
    set({ selected: null });
  },
  undo: () => {
    const s = get();
    if (!s.past.length) return;
    set({
      project: s.past.at(-1)!,
      past: s.past.slice(0, -1),
      future: [s.project, ...s.future],
      saveState: "Saving",
      revision: s.revision + 1,
      notice: "Change undone.",
    });
  },
  redo: () => {
    const s = get();
    if (!s.future.length) return;
    set({
      project: s.future[0],
      past: [...s.past, s.project],
      future: s.future.slice(1),
      saveState: "Saving",
      revision: s.revision + 1,
      notice: "Change restored.",
    });
  },
  connect: (source, dest) => {
    const p = get().project,
      s = p.resources.find((r) => r.id === source),
      t = p.resources.find((r) => r.id === dest);
    if (!s || !t || s.id === t.id) return false;
    const f = schemaFor(t.type)?.fields.find((f) => f.target?.includes(s.type));
    if (!f) {
      set({
        notice:
          "These handles are incompatible. Use a matching resource reference in the inspector.",
      });
      return false;
    }
    const value = ref(s.id, f.attr ?? "id");
    get().setArg(
      t.id,
      f.key,
      multiFields.includes(f.key)
        ? [
            ...((t.args[f.key] as Value[]) ?? []).filter(
              (x) => !isRef(x) || x.ref !== s.id,
            ),
            value,
          ]
        : value,
    );
    return true;
  },
  hydrate: async () => {
    try {
      const p = await loadProject();
      if (p?.version === 1 && Array.isArray(p.resources))
        set({ project: p, saveState: "Saved locally", hydrated: true });
      else set({ saveState: "Saved locally", hydrated: true });
    } catch {
      set({ saveState: "Storage unavailable", hydrated: true });
    }
  },
}));
export function dependents(p: Project, id: string) {
  return p.resources.filter((r) =>
    references(r.args).some((v) => v.ref === id),
  );
}
