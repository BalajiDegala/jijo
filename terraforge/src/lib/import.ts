import { Project, Resource, Value, address, ref, expr } from "./model";
import { schemaFor } from "./registry";
import { createTemplate } from "./templates";
type Bridge = {
  parse: (
    filename: string,
    source: string,
    callback: (error: string | null, json: string) => void,
  ) => void;
};
let ready: Promise<Bridge> | undefined;
export function loadParser(): Promise<Bridge> {
  return (ready ??= new Promise(async (resolve, reject) => {
    try {
      const w = window as unknown as Record<string, any>;
      w.global = w;
      w.__parse_terraform_config_wasm__ = {};
      await new Promise<void>((res, rej) => {
        const script = document.createElement("script");
        script.src = "/hcl/bridge_wasm_exec.js";
        script.onload = () => res();
        script.onerror = () =>
          rej(
            new Error(
              "HCL parser assets are unavailable. Install dependencies and run the asset setup script.",
            ),
          );
        document.head.append(script);
      });
      const response = await fetch("/hcl/main.wasm");
      if (!response.ok)
        throw new Error("HCL WebAssembly parser is unavailable.");
      const go = new w.Go();
      const wasm = await WebAssembly.instantiate(
        await response.arrayBuffer(),
        go.importObject,
      );
      void go.run(wasm.instance);
      const bridge = w.__parse_terraform_config_wasm__;
      if (!bridge.parse) throw new Error("HCL parser failed to initialize.");
      resolve(bridge);
    } catch (e) {
      ready = undefined;
      reject(e);
    }
  }));
}
export async function parseHCL(source: string): Promise<Record<string, any>> {
  if (source.length > 2_000_000) throw new Error("Import is limited to 2 MB.");
  const bridge = await loadParser();
  return new Promise((resolve, reject) =>
    bridge.parse("import.tf", source, (error, json) =>
      error ? reject(new Error(error)) : resolve(JSON.parse(json)),
    ),
  );
}
export function normalizeHCL(
  parsed: Record<string, any>,
  base?: Project,
): { project: Project; warnings: string[] } {
  const project = structuredClone(base ?? createTemplate("empty"));
  project.resources = [];
  const warnings: string[] = [];
  const unsupported: string[] = [];
  for (const key of Object.keys(parsed))
    if (
      ![
        "resource",
        "data",
        "variable",
        "output",
        "locals",
        "module",
        "terraform",
        "provider",
      ].includes(key)
    )
      unsupported.push(`Top-level ${key} blocks`);
  const add = (
    kind: Resource["kind"],
    type: string,
    name: string,
    raw: any,
  ) => {
    const schema = schemaFor(type);
    if (!schema) {
      unsupported.push(`${kind} ${type}.${name}`);
      return;
    }
    const body = Array.isArray(raw) ? raw[0] : raw;
    if (Array.isArray(raw) && raw.length !== 1) {
      unsupported.push(`Duplicate block ${type}.${name}`);
      return;
    }
    const args: Record<string, Value> = {};
    const r: Resource = {
      id: `import-${kind}-${type}-${name}`,
      kind,
      type,
      name,
      args,
    };
    for (const [key, value] of Object.entries(body)) {
      if (key === "count" && typeof value === "number") {
        r.scale = { mode: "count", count: value, keys: [] };
        continue;
      }
      if (key === "for_each") {
        const m =
          typeof value === "string" &&
          value.match(/^\$\{toset\((\[.*\])\)\}$/s);
        if (m) {
          try {
            const keys = JSON.parse(m[1]);
            if (
              Array.isArray(keys) &&
              keys.every((x) => typeof x === "string")
            ) {
              r.scale = { mode: "for_each", count: 1, keys };
              continue;
            }
          } catch {}
        }
        unsupported.push(
          `${name}: for_each must be a literal toset([...]) in the visual model`,
        );
        continue;
      }
      if (
        !schema.fields.some((f) => f.key === key) &&
        !["depends_on"].includes(key)
      ) {
        unsupported.push(`${name}.${key}`);
        continue;
      }
      args[key] = value as Value;
    }
    project.resources.push(r);
  };
  for (const kind of ["resource", "data"] as const)
    for (const [type, entries] of Object.entries(parsed[kind] ?? {}))
      for (const [name, body] of Object.entries(entries as object))
        add(kind, kind === "data" ? `data.${type}` : type, name, body);
  for (const kind of ["variable", "output", "module"] as const)
    for (const [name, body] of Object.entries(parsed[kind] ?? {}))
      add(kind, kind, name, body);
  for (const block of Array.isArray(parsed.locals)
    ? parsed.locals
    : parsed.locals
      ? [parsed.locals]
      : [])
    for (const [name, value] of Object.entries(block))
      add("locals", "locals", name, { value });
  const provider = parsed.provider?.aws;
  const providers = Array.isArray(provider)
    ? provider
    : provider
      ? [provider]
      : [];
  if (providers.length > 1 || providers.some((p: any) => p.alias))
    unsupported.push("Multiple or aliased providers");
  if (providers[0]) {
    for (const k of Object.keys(providers[0]))
      if (!["region", "default_tags"].includes(k))
        unsupported.push(`provider.aws.${k}`);
    if (
      typeof providers[0].region === "string" &&
      !providers[0].region.includes("${")
    )
      project.region = providers[0].region;
    else if (providers[0].region)
      unsupported.push("Provider region expressions");
  }
  const terraform = Array.isArray(parsed.terraform)
    ? parsed.terraform[0]
    : parsed.terraform;
  if (terraform) {
    for (const key of Object.keys(terraform))
      if (!["required_version", "required_providers"].includes(key))
        unsupported.push(`terraform.${key}`);
    const required = Array.isArray(terraform.required_providers)
      ? terraform.required_providers[0]
      : terraform.required_providers;
    for (const key of Object.keys(required ?? {}))
      if (!["aws", "tls"].includes(key)) unsupported.push(`Provider ${key}`);
    if (required?.aws?.version) project.providerVersion = required.aws.version;
  }
  const transform = (v: any): Value => {
    if (typeof v === "string") {
      if (v.startsWith("${") && v.endsWith("}")) {
        const e = v.slice(2, -1);
        for (const r of project.resources) {
          const a = address(r);
          if (e === a) return ref(r.id, "");
          if (e.startsWith(a + ".") && /^[\w]+$/.test(e.slice(a.length + 1)))
            return ref(r.id, e.slice(a.length + 1));
        }
        return expr(e);
      }
      if (v.includes("${") || v.includes("%{")) return expr(JSON.stringify(v));
      return v;
    }
    if (Array.isArray(v)) return v.map(transform);
    if (v && typeof v === "object")
      return Object.fromEntries(
        Object.entries(v).map(([k, x]) => [k, transform(x)]),
      );
    return v;
  };
  project.resources.forEach((r) => {
    r.args = transform(r.args) as Record<string, Value>;
  });
  if (
    terraform?.required_version &&
    terraform.required_version !== ">= 1.5.0, < 2.0.0"
  )
    warnings.push(
      "The Terraform version constraint is normalized to >= 1.5.0, < 2.0.0.",
    );
  if (unsupported.length)
    throw new Error(
      "Import stopped to avoid losing configuration. Unsupported: " +
        unsupported.join("; "),
    );
  warnings.push(
    "Comments, formatting, and block order are normalized. Provider default tags use this project’s settings.",
  );
  return { project, warnings };
}
export async function importHCL(source: string, base?: Project) {
  return normalizeHCL(await parseHCL(source), base);
}
