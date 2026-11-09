import { Project, Resource } from "./model";
import { schemaFor } from "./registry";
/** Validate the portable envelope before it can enter the application store. */
export function readProjectFile(source: string): Project {
  if (source.length > 2_000_000)
    throw new Error("Project files must be smaller than 2 MB.");
  if (/-----BEGIN .*PRIVATE KEY-----/.test(source))
    throw new Error("Private key material is not allowed.");
  const p: unknown = JSON.parse(source);
  if (!p || typeof p !== "object")
    throw new Error("Expected a TerraForge project object.");
  const v = p as Project;
  if (
    v.version !== 1 ||
    typeof v.id !== "string" ||
    typeof v.name !== "string" ||
    typeof v.region !== "string" ||
    typeof v.providerVersion !== "string" ||
    !Array.isArray(v.resources)
  )
    throw new Error("This is not a valid TerraForge v1 project.");
  if (v.resources.length > 5000)
    throw new Error(
      "Use count or for_each for projects above 5,000 individual blocks.",
    );
  const ids = new Set<string>();
  for (const r of v.resources) {
    const schema = r && schemaFor(r.type);
    if (
      !schema ||
      typeof r.id !== "string" ||
      typeof r.name !== "string" ||
      r.kind !== (schema.kind ?? "resource") ||
      !r.args ||
      typeof r.args !== "object" ||
      Array.isArray(r.args)
    )
      throw new Error("A resource has an unsupported or malformed schema.");
    if (ids.has(r.id)) throw new Error("Resource IDs must be unique.");
    ids.add(r.id);
    if (
      r.scale &&
      (!["single", "count", "for_each"].includes(r.scale.mode) ||
        typeof r.scale.count !== "number" ||
        !Array.isArray(r.scale.keys) ||
        !r.scale.keys.every((k) => typeof k === "string"))
    )
      throw new Error(`Malformed scaling settings for ${r.name}.`);
    for (const pos of Object.values(r.layouts ?? {}))
      if (!pos || !Number.isFinite(pos.x) || !Number.isFinite(pos.y))
        throw new Error("Layout coordinates must be finite numbers.");
  }
  v.updatedAt = Date.now();
  return v;
}
