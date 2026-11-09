import type { Topology } from "./types";

/** Finds an Ethernet path; hosts and routers never act as transparent switches. */
export function layer2Path(
  t: Topology,
  source: string,
  destination: string,
): string[] | undefined {
  const queue = [[source]],
    seen = new Set([source]);
  while (queue.length) {
    const path = queue.shift()!;
    const id = path[path.length - 1];
    if (id === destination) return path;
    for (const link of t.links.filter(
      (l) => l.source === id || l.target === id,
    )) {
      const next = link.source === id ? link.target : link.source;
      const resource = t.resources.find((r) => r.id === next);
      if (!resource?.enabled || seen.has(next)) continue;
      if (next !== destination && resource.kind !== "switch") continue;
      seen.add(next);
      queue.push([...path, next]);
    }
  }
}
