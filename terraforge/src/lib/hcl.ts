import { Project, Resource, Value, isRef, isExpr, address } from "./model";
import { schemaFor } from "./registry";
export const fileNames = [
  "versions.tf",
  "providers.tf",
  "main.tf",
  "variables.tf",
  "outputs.tf",
  "terraform.tfvars.example",
] as const;
export type FileName = (typeof fileNames)[number];
export function renderValue(value: Value, project: Project, depth = 0): string {
  if (isRef(value)) {
    const target = project.resources.find((r) => r.id === value.ref);
    if (!target)
      return `unresolved.${value.ref.replace(/[^a-zA-Z0-9_]/g, "_")}.${value.attr}`;
    let base = address(target);
    if (!value.attr && value.index === undefined) return base;
    if (target.scale?.mode === "count")
      base += `[${typeof value.index === "number" ? value.index : 0}]`;
    if (target.scale?.mode === "for_each")
      base += `[${JSON.stringify(value.index ?? target.scale.keys[0] ?? "web")}]`;
    return base + (value.attr ? `.${value.attr}` : "");
  }
  if (isExpr(value)) return value.expr;
  if (typeof value === "string")
    return JSON.stringify(value)
      .replace(/\$\{/g, () => "$${")
      .replace(/%\{/g, "%%{");
  if (Array.isArray(value))
    return `[${value.map((v) => renderValue(v, project, depth + 1)).join(", ")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value);
    if (!entries.length) return "{}";
    return `{\n${entries.map(([k, v]) => `${"  ".repeat(depth + 1)}${/^[a-zA-Z_][\w-]*$/.test(k) ? k : JSON.stringify(k)} = ${renderValue(v, project, depth + 1)}`).join("\n")}\n${"  ".repeat(depth)}}`;
  }
  return String(value);
}
export function resourceHCL(r: Resource, p: Project): string {
  const schema = schemaFor(r.type);
  let header = `${r.kind} "${r.type.replace(/^data\./, "")}" "${r.name}"`;
  if (["variable", "output", "module"].includes(r.kind))
    header = `${r.kind} "${r.name}"`;
  if (r.kind === "locals")
    return `locals {\n  ${r.name} = ${renderValue(r.args.value ?? null, p, 1)}\n}`;
  const lines = [`${header} {`];
  if (r.scale?.mode === "count") lines.push(`  count = ${r.scale.count}`, "");
  if (r.scale?.mode === "for_each")
    lines.push(`  for_each = toset(${renderValue(r.scale.keys, p)})`, "");
  const keys = Object.keys(r.args);
  const width = Math.min(
    32,
    Math.max(
      0,
      ...keys.filter((k) => !schema?.blocks?.includes(k)).map((k) => k.length),
    ),
  );
  for (const [k, v] of Object.entries(r.args)) {
    if (v === undefined) continue;
    if (schema?.blocks?.includes(k) && Array.isArray(v)) {
      for (const b of v) {
        if (b && typeof b === "object" && !Array.isArray(b)) {
          lines.push(
            "",
            `  ${k} {`,
            ...Object.entries(b).map(
              ([key, val]) =>
                `    ${key.padEnd(12)} = ${renderValue(val as Value, p, 2)}`,
            ),
            "  }",
          );
        }
      }
    } else lines.push(`  ${k.padEnd(width)} = ${renderValue(v, p, 1)}`);
  }
  lines.push("}");
  return lines.join("\n");
}
export function generate(p: Project): Record<FileName, string> {
  const tls = p.resources.some((r) => r.type.startsWith("tls_"));
  const versions = `terraform {\n  required_version = ">= 1.5.0, < 2.0.0"\n\n  required_providers {\n    aws = {\n      source  = "hashicorp/aws"\n      version = "${p.providerVersion}"\n    }${tls ? '\n    tls = {\n      source  = "hashicorp/tls"\n      version = "~> 4.0"\n    }' : ""}\n  }\n}\n`;
  const needsKey =
    p.resources.some((r) =>
      JSON.stringify(r.args).includes("var.ssh_public_key"),
    ) &&
    !p.resources.some(
      (r) => r.kind === "variable" && r.name === "ssh_public_key",
    );
  return {
    "versions.tf": versions,
    "providers.tf": `provider "aws" {\n  region = ${JSON.stringify(p.region)}\n\n  default_tags {\n    tags = {\n      Project   = ${renderValue(p.name, p)}\n      ManagedBy = "TerraForge"\n    }\n  }\n}\n`,
    "main.tf":
      `# ${p.name}\n# Model-generated infrastructure. Review before applying.\n\n` +
      p.resources
        .filter((r) => !["variable", "output"].includes(r.kind))
        .map((r) => resourceHCL(r, p))
        .join("\n\n") +
      "\n",
    "variables.tf":
      p.resources
        .filter((r) => r.kind === "variable")
        .map((r) => resourceHCL(r, p))
        .join("\n\n") +
      (needsKey
        ? '\nvariable "ssh_public_key" {\n  description = "Your OpenSSH public key. Never use a private key."\n  type        = string\n  validation {\n    condition     = can(regex("^(ssh-rsa|ssh-ed25519|ecdsa-sha2-)", var.ssh_public_key))\n    error_message = "Supply an OpenSSH public key."\n  }\n}\n'
        : "\n"),
    "outputs.tf":
      p.resources
        .filter((r) => r.kind === "output")
        .map((r) => resourceHCL(r, p))
        .join("\n\n") + "\n",
    "terraform.tfvars.example":
      `# Copy to terraform.tfvars and fill in required inputs.\n# Never commit secrets or private keys.\n` +
      (needsKey
        ? 'ssh_public_key = "REPLACE_WITH_YOUR_OPENSSH_PUBLIC_KEY"\n'
        : "") +
      p.resources
        .filter((r) => r.kind === "variable" && !r.args.sensitive)
        .map(
          (r) =>
            `${r.name} = ${renderValue(r.args.default ?? "REPLACE_ME", p)}`,
        )
        .join("\n") +
      "\n",
  };
}
