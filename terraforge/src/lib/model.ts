export type Literal = string | number | boolean | null;
export type Value =
  | Literal
  | { ref: string; attr: string; index?: string | number }
  | { expr: string }
  | Value[]
  | { [key: string]: Value };
export type Field = {
  key: string;
  label: string;
  description: string;
  required?: boolean;
  kind?:
    "text" | "number" | "boolean" | "select" | "reference" | "json" | "secret";
  options?: string[];
  target?: string[];
  attr?: string;
  tab?: string;
  default?: Value;
};
export type Schema = {
  type: string;
  label: string;
  category: string;
  color: string;
  icon: string;
  description: string;
  kind?: "resource" | "data" | "output" | "variable" | "locals" | "module";
  fields: Field[];
  defaults: Record<string, Value>;
  blocks?: string[];
};
export type Resource = {
  id: string;
  type: string;
  name: string;
  kind: "resource" | "data" | "output" | "variable" | "locals" | "module";
  args: Record<string, Value>;
  position?: { x: number; y: number };
  layouts?: Record<string, { x: number; y: number }>;
  collapsed?: boolean;
  scale?: {
    mode: "single" | "count" | "for_each";
    count: number;
    keys: string[];
  };
};
export type Project = {
  version: 1;
  id: string;
  name: string;
  region: string;
  providerVersion: string;
  resources: Resource[];
  updatedAt: number;
};
export type Issue = {
  severity: "error" | "warning" | "info";
  resource?: string;
  field?: string;
  message: string;
};
export const ref = (id: string, attr = "id"): Value => ({ ref: id, attr });
export const expr = (value: string): Value => ({ expr: value });
export function isRef(
  v: Value | undefined,
): v is { ref: string; attr: string; index?: string | number } {
  return (
    !!v &&
    typeof v === "object" &&
    !Array.isArray(v) &&
    "ref" in v &&
    "attr" in v &&
    typeof v.ref === "string" &&
    typeof v.attr === "string"
  );
}
export function isExpr(v: Value | undefined): v is { expr: string } {
  return (
    !!v &&
    typeof v === "object" &&
    !Array.isArray(v) &&
    "expr" in v &&
    typeof v.expr === "string"
  );
}
export const address = (r: Resource) =>
  `${r.kind === "data" ? "data." : r.kind === "output" ? "output." : r.kind === "variable" ? "var." : r.kind === "locals" ? "local." : r.kind === "module" ? "module." : ""}${["output", "variable", "locals", "module"].includes(r.kind) ? r.name : `${r.type.replace(/^data\./, "")}.${r.name}`}`;
export function references(
  v: Value | Record<string, Value>,
): { ref: string; attr: string; index?: string | number }[] {
  if (isRef(v)) return [v];
  if (v && typeof v === "object")
    return Object.values(v).flatMap((x) => references(x));
  return [];
}
export const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export function isMap(v: Value | undefined): v is Record<string, Value> {
  return (
    !!v && typeof v === "object" && !Array.isArray(v) && !isRef(v) && !isExpr(v)
  );
}
