"use client";
import { useState, useEffect } from "react";
import {
  X,
  Info,
  Trash2,
  ArrowUpRight,
  Link2,
  ChevronRight,
  BookOpen,
  Copy,
  Plus,
  Minus,
  ShieldCheck,
} from "lucide-react";
import { useStudio, dependents } from "@/lib/store";
import {
  Field,
  Resource,
  Value,
  isRef,
  isExpr,
  ref,
  expr,
  address,
  references,
} from "@/lib/model";
import { schemaFor, multiFields } from "@/lib/registry";
import { resourceHCL, renderValue } from "@/lib/hcl";
import { validate } from "@/lib/validation";
import { ResourceIcon } from "./icons";
import { Button, Modal } from "./ui";
function JsonField({
  value,
  onChange,
  label,
}: {
  value: Value | undefined;
  onChange: (v: Value) => void;
  label: string;
}) {
  const [draft, setDraft] = useState(JSON.stringify(value ?? {}, null, 2)),
    [error, setError] = useState("");
  useEffect(() => setDraft(JSON.stringify(value ?? {}, null, 2)), [value]);
  return (
    <>
      <textarea
        className="json-input"
        aria-label={label}
        spellCheck={false}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />
      <div className="json-actions">
        {error && <small role="alert">{error}</small>}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            try {
              onChange(JSON.parse(draft));
              setError("");
            } catch {
              setError("Enter valid JSON.");
            }
          }}
        >
          Apply value
        </Button>
      </div>
    </>
  );
}
function Rules({ r, field }: { r: Resource; field: string }) {
  const setArg = useStudio((s) => s.setArg);
  const rules = (Array.isArray(r.args[field]) ? r.args[field] : []) as Record<
    string,
    Value
  >[];
  const update = (i: number, key: string, value: Value) =>
    setArg(
      r.id,
      field,
      rules.map((rule, j) => (j === i ? { ...rule, [key]: value } : rule)),
    );
  return (
    <div className="rules">
      {rules.map((rule, i) => (
        <div className="rule" key={i}>
          <div className="rule-head">
            <span>
              <ShieldCheck size={12} />
              {field === "ingress" ? "Inbound" : "Outbound"} rule {i + 1}
            </span>
            <button
              aria-label={`Remove rule ${i + 1}`}
              onClick={() =>
                setArg(
                  r.id,
                  field,
                  rules.filter((_, j) => j !== i),
                )
              }
            >
              <X size={12} />
            </button>
          </div>
          <div className="rule-ports">
            <label>
              Protocol
              <select
                aria-label="Rule protocol"
                value={String(rule.protocol)}
                onChange={(e) => update(i, "protocol", e.target.value)}
              >
                <option value="tcp">TCP</option>
                <option value="udp">UDP</option>
                <option value="-1">All traffic</option>
              </select>
            </label>
            <label>
              From
              <input
                aria-label="From port"
                type="number"
                value={Number(rule.from_port)}
                onChange={(e) => update(i, "from_port", Number(e.target.value))}
              />
            </label>
            <label>
              To
              <input
                aria-label="To port"
                type="number"
                value={Number(rule.to_port)}
                onChange={(e) => update(i, "to_port", Number(e.target.value))}
              />
            </label>
          </div>
          <label>
            Source / destination CIDRs
            <input
              aria-label="Rule CIDRs"
              value={
                Array.isArray(rule.cidr_blocks)
                  ? rule.cidr_blocks.join(", ")
                  : ""
              }
              placeholder="10.0.0.0/16"
              onChange={(e) =>
                update(
                  i,
                  "cidr_blocks",
                  e.target.value
                    .split(",")
                    .map((x) => x.trim())
                    .filter(Boolean),
                )
              }
            />
          </label>
          {rule.security_groups && (
            <small>
              Security group references are also configured. Edit as JSON to
              change them.
            </small>
          )}
        </div>
      ))}
      <Button
        size="sm"
        onClick={() =>
          setArg(r.id, field, [
            ...rules,
            {
              from_port: 443,
              to_port: 443,
              protocol: "tcp",
              cidr_blocks: ["10.0.0.0/16"],
            },
          ])
        }
      >
        <Plus size={12} />
        Add rule
      </Button>
    </div>
  );
}
function Property({ r, f }: { r: Resource; f: Field }) {
  const { project, setArg, mode } = useStudio();
  const value = r.args[f.key];
  const [expanded, setExpanded] = useState(mode === "Explain");
  const reference = isRef(value) || (Array.isArray(value) && value.some(isRef));
  const referencedKind = project.resources.find(
    (x) => x.id === references(value ?? null)[0]?.ref,
  )?.kind;
  const detectedMode = reference
    ? referencedKind === "variable"
      ? "variable"
      : "reference"
    : isExpr(value)
      ? "expression"
      : "value";
  const [inputMode, setInputMode] = useState(detectedMode);
  useEffect(() => setInputMode(detectedMode), [r.id, f.key, detectedMode]);
  const targets = project.resources.filter(
    (x) =>
      x.id !== r.id &&
      (inputMode === "variable"
        ? x.kind === "variable"
        : f.target?.includes(x.type)),
  );
  const onChange = (v: Value | undefined) => setArg(r.id, f.key, v);
  const currentRef = isRef(value) ? value.ref : "";
  return (
    <div className="property">
      <div className="property-heading">
        <label htmlFor={`f-${f.key}`}>
          {f.label}
          {f.required && (
            <span className="required" aria-hidden="true">
              *
            </span>
          )}
        </label>
        <button
          aria-label={`Explain ${f.label}`}
          className={expanded ? "active" : ""}
          onClick={() => setExpanded(!expanded)}
        >
          <Info size={13} />
        </button>
      </div>
      {expanded && (
        <div className="field-explanation">
          {f.description}
          <span>
            {f.required ? "Required" : "Optional"} argument ·{" "}
            <code>{f.key}</code>
          </span>
        </div>
      )}
      {f.kind !== "boolean" && f.kind !== "json" && (
        <div className="value-modes">
          <button
            className={inputMode === "value" ? "active" : ""}
            onClick={() => setInputMode("value")}
          >
            Value
          </button>
          {f.target && (
            <button
              className={inputMode === "reference" ? "active" : ""}
              onClick={() => setInputMode("reference")}
            >
              Reference
            </button>
          )}
          <button
            className={inputMode === "variable" ? "active" : ""}
            onClick={() => setInputMode("variable")}
          >
            Variable
          </button>
          <button
            className={inputMode === "expression" ? "active" : ""}
            onClick={() => setInputMode("expression")}
          >
            Expression
          </button>
        </div>
      )}
      {f.kind === "boolean" ? (
        <label className="toggle-row">
          <span>{value === true ? "Enabled" : "Disabled"}</span>
          <button
            role="switch"
            aria-checked={value === true}
            aria-label={f.label}
            className={`switch ${value === true ? "on" : ""}`}
            onClick={() => onChange(value !== true)}
          >
            <i />
          </button>
        </label>
      ) : f.kind === "json" ? (
        r.type === "aws_security_group" &&
        ["ingress", "egress"].includes(f.key) ? (
          <Rules r={r} field={f.key} />
        ) : (
          <JsonField value={value} onChange={onChange} label={f.label} />
        )
      ) : ["reference", "variable"].includes(inputMode) ? (
        <>
          <select
            id={`f-${f.key}`}
            value={multiFields.includes(f.key) ? "" : currentRef}
            onChange={(e) => {
              if (!e.target.value) {
                onChange(undefined);
                return;
              }
              const target = project.resources.find(
                (x) => x.id === e.target.value,
              )!;
              const v = ref(
                target.id,
                target.kind === "variable" ? "" : (f.attr ?? "id"),
              );
              onChange(
                multiFields.includes(f.key)
                  ? [
                      ...(Array.isArray(value) ? value : []).filter(
                        (x) => !isRef(x) || x.ref !== target.id,
                      ),
                      v,
                    ]
                  : v,
              );
            }}
          >
            <option value="">
              {multiFields.includes(f.key)
                ? "Attach a resource…"
                : "Select a resource…"}
            </option>
            {targets.map((t) => (
              <option value={t.id} key={t.id}>
                {address(t)}
              </option>
            ))}
          </select>
          {multiFields.includes(f.key) &&
            Array.isArray(value) &&
            value.map((v, i) =>
              isRef(v) ? (
                <div className="reference-chip" key={i}>
                  <Link2 size={11} />
                  <button onClick={() => useStudio.getState().select(v.ref)}>
                    {project.resources.find((x) => x.id === v.ref)?.name ??
                      "Unresolved"}
                  </button>
                  <button
                    aria-label="Remove reference"
                    onClick={() => onChange(value.filter((_, j) => i !== j))}
                  >
                    <X size={11} />
                  </button>
                </div>
              ) : null,
            )}
          {!targets.length && (
            <small className="muted">
              Add a compatible{" "}
              {inputMode === "variable" ? "variable" : "resource"} from the
              library first.
            </small>
          )}
        </>
      ) : inputMode === "expression" ? (
        <input
          id={`f-${f.key}`}
          value={isExpr(value) ? value.expr : ""}
          placeholder="var.example"
          onChange={(e) => onChange(expr(e.target.value))}
        />
      ) : f.kind === "select" ? (
        <select
          id={`f-${f.key}`}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select…</option>
          {f.options?.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ) : (
        <input
          id={`f-${f.key}`}
          type={f.kind === "number" ? "number" : "text"}
          value={
            typeof value === "string" || typeof value === "number" ? value : ""
          }
          placeholder={f.kind === "reference" ? "Explicit ID or value…" : f.key}
          onChange={(e) =>
            onChange(
              f.kind === "number" ? Number(e.target.value) : e.target.value,
            )
          }
        />
      )}
      {expanded && value !== undefined && (
        <code className="field-hcl">
          {f.key} = {renderValue(value, project)}
        </code>
      )}
    </div>
  );
}
export function Inspector() {
  const { project, selected, select, update, setArg, remove, setView } =
    useStudio();
  const r = project.resources.find((x) => x.id === selected);
  const [tab, setTab] = useState("Basic"),
    [deleting, setDeleting] = useState(false),
    [instances, setInstances] = useState(false);
  useEffect(() => {
    setTab("Basic");
    setInstances(false);
  }, [selected]);
  if (!r) return null;
  const schema = schemaFor(r.type)!;
  const errors = validate(project).filter((i) => i.resource === r.id);
  const refs = references(r.args);
  const users = dependents(project, r.id);
  const count =
    r.scale?.mode === "count"
      ? r.scale.count
      : r.scale?.mode === "for_each"
        ? r.scale.keys.length
        : 1;
  return (
    <aside className="inspector">
      <div className="panel-heading">
        <span>
          <SettingsLocal />
          Inspector
        </span>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Close inspector"
          onClick={() => select(null)}
        >
          <X size={15} />
        </Button>
      </div>
      <div className="inspector-identity">
        <ResourceIcon type={r.type} size={24} />
        <div>
          <span>{schema.label}</span>
          <h2>{r.name}</h2>
        </div>
      </div>
      <div className="resource-address">{address(r)}</div>
      <div className="inspector-tabs">
        {["Basic", "Network", "Security", "Advanced", "Terraform"].map((t) => (
          <button
            key={t}
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="inspector-scroll">
        {tab === "Basic" && (
          <>
            <div className="resource-explanation">
              <BookOpen size={14} />
              <p>{schema.description}</p>
            </div>
            <div className="property">
              <div className="property-heading">
                <label htmlFor="resource-name">
                  Resource name{" "}
                  <span className="required" aria-hidden="true">
                    *
                  </span>
                </label>
              </div>
              <input
                id="resource-name"
                value={r.name}
                onChange={(e) => update(r.id, { name: e.target.value })}
              />
              <small className="muted">
                The local Terraform identifier, used in references.
              </small>
            </div>
          </>
        )}
        {tab !== "Terraform" &&
          schema.fields
            .filter((f) => (f.tab ?? "Basic") === tab)
            .map((f) => <Property key={`${r.id}-${f.key}`} r={r} f={f} />)}
        {tab === "Advanced" && r.kind === "resource" && (
          <div className="scaling">
            <div className="section-caption">RESOURCE MULTIPLICITY</div>
            <label>
              How many resources?
              <select
                aria-label="Scaling mode"
                value={r.scale?.mode ?? "single"}
                onChange={(e) =>
                  update(r.id, {
                    scale: {
                      mode: e.target.value as any,
                      count: r.scale?.count ?? 10,
                      keys: r.scale?.keys.length
                        ? r.scale.keys
                        : ["web", "api"],
                    },
                  })
                }
              >
                <option value="single">Individual resource</option>
                <option value="count">Use count</option>
                <option value="for_each">Use for_each</option>
              </select>
            </label>
            {r.scale?.mode === "count" && (
              <>
                <label>
                  Instance count
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={r.scale.count}
                    onChange={(e) =>
                      update(r.id, {
                        scale: { ...r.scale!, count: Number(e.target.value) },
                      })
                    }
                  />
                </label>
                <div className="count-presets">
                  {[1, 10, 100, 1000].map((n) => (
                    <button
                      key={n}
                      onClick={() =>
                        update(r.id, { scale: { ...r.scale!, count: n } })
                      }
                    >
                      {n.toLocaleString()}
                    </button>
                  ))}
                </div>
              </>
            )}
            {r.scale?.mode === "for_each" && (
              <label>
                Stable keys (comma-separated)
                <input
                  value={r.scale.keys.join(", ")}
                  onChange={(e) =>
                    update(r.id, {
                      scale: {
                        ...r.scale!,
                        keys: e.target.value
                          .split(",")
                          .map((x) => x.trim())
                          .filter(Boolean),
                      },
                    })
                  }
                />
              </label>
            )}
            <p>
              {r.scale?.mode === "count"
                ? "Count uses numeric indexes. Inserting or removing items can shift identities. Best for interchangeable instances."
                : r.scale?.mode === "for_each"
                  ? "for_each uses stable keys. Changing one key affects only that named instance. Best for distinct configurations."
                  : "Individual blocks are explicit and independent. Use separate resources when their lifecycles or configuration differ."}
            </p>
            {count > 1 && (
              <>
                <Button size="sm" onClick={() => setInstances(!instances)}>
                  {instances ? "Collapse cluster" : "Explore cluster"} · {count}
                </Button>
                {instances && (
                  <div className="instance-list">
                    {Array.from({ length: Math.min(count, 100) }, (_, i) => (
                      <code key={i}>
                        {r.name}[
                        {r.scale?.mode === "for_each"
                          ? JSON.stringify(r.scale.keys[i])
                          : i}
                        ]
                      </code>
                    ))}
                    {count > 100 && (
                      <small>
                        Showing the first 100 of {count} identical instances.
                      </small>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
        {tab === "Terraform" && (
          <>
            <div className="section-caption">GENERATED BLOCK</div>
            <pre className="block-code">{resourceHCL(r, project)}</pre>
            <div className="section-caption">DEPENDENCY TRACE</div>
            {refs.length ? (
              refs.map((v, i) => {
                const t = project.resources.find((x) => x.id === v.ref);
                return (
                  <button
                    key={i}
                    className="trace-link"
                    onClick={() => {
                      select(v.ref);
                      setView("dependencies");
                    }}
                  >
                    <Link2 size={13} />
                    <span>
                      {t ? address(t) : "Unresolved"}
                      <small>attribute: {v.attr || "entire resource"}</small>
                    </span>
                    <ChevronRight size={13} />
                  </button>
                );
              })
            ) : (
              <p className="muted">No implicit resource dependencies.</p>
            )}
            <Property
              r={r}
              f={{
                key: "depends_on",
                label: "Explicit dependencies",
                description:
                  "Use only for hidden behavioral dependencies that are not already captured by references.",
                kind: "reference",
                target: project.resources
                  .filter((x) => x.kind === "resource")
                  .map((x) => x.type),
                attr: "",
              }}
            />
          </>
        )}
        {!schema.fields.some((f) => (f.tab ?? "Basic") === tab) &&
          !["Basic", "Advanced", "Terraform"].includes(tab) && (
            <p className="inspector-empty">
              This resource has no {tab.toLowerCase()} arguments. Its
              dependencies are available in the Terraform tab.
            </p>
          )}
        {errors.map((i, index) => (
          <div key={index} className={`inspector-issue ${i.severity}`}>
            <Info size={13} />
            {i.message}
          </div>
        ))}
      </div>
      <div className="inspector-bottom">
        <span>
          {refs.length} dependencies · {users.length} dependents
        </span>
        <Button
          size="sm"
          variant="ghost"
          className="delete-resource"
          onClick={() => setDeleting(true)}
        >
          <Trash2 size={13} />
          Delete
        </Button>
      </div>
      <Modal
        open={deleting}
        onClose={() => setDeleting(false)}
        title={`Delete ${r.name}?`}
        description={
          users.length
            ? `${users.length} resource(s) reference this block. These references will remain flagged until you repair them.`
            : "This removes the configuration block. No changes are made to AWS."
        }
      >
        <div className="dialog-body">
          {users.map((x) => (
            <code className="delete-dependent" key={x.id}>
              {address(x)}
            </code>
          ))}
          <div className="dialog-actions">
            <Button onClick={() => setDeleting(false)}>Keep resource</Button>
            <Button
              variant="danger"
              onClick={() => {
                remove(r.id);
                setDeleting(false);
              }}
            >
              Delete resource
            </Button>
          </div>
        </div>
      </Modal>
    </aside>
  );
}
function SettingsLocal() {
  return <Info size={15} />;
}
