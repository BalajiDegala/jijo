"use client";
import { useState } from "react";
import {
  BookOpen,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  CheckCircle2,
  Bug,
  Target,
  Brain,
  Code2,
  Play,
  RotateCcw,
  Lightbulb,
} from "lucide-react";
import { useStudio } from "@/lib/store";
import { validate, internetPath } from "@/lib/validation";
import { parseHCL, normalizeHCL } from "@/lib/import";
import { ref, isMap, Value } from "@/lib/model";
import { Button } from "./ui";
export function LearningPanel() {
  const { mode, notice, project, selected, change, select } = useStudio();
  const [open, setOpen] = useState(true);
  const [draft, setDraft] = useState("");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState(1);
  const r =
    project.resources.find((x) => x.id === selected) ??
    project.resources.find((x) => x.type === "aws_instance");
  const check = async () => {
    setBusy(true);
    try {
      if (mode === "Debug") {
        const errors = validate(project).filter((i) => i.severity !== "info");
        setResult(
          errors.length
            ? `${errors.length} issue(s) remain. Open Validate to inspect the affected resources.`
            : "All studio checks pass. You repaired the configuration.",
        );
      } else if (mode === "Challenge") {
        const vpcs = project.resources.filter((r) => r.type === "aws_vpc");
        const subnets = project.resources.filter(
          (r) => r.type === "aws_subnet",
        );
        const instances = project.resources.filter(
          (r) => r.type === "aws_instance",
        );
        const count = instances.reduce(
          (a, r) =>
            a +
            (r.scale?.mode === "count"
              ? r.scale.count
              : r.scale?.mode === "for_each"
                ? r.scale.keys.length
                : 1),
          0,
        );
        const scoped = project.resources
          .filter((r) => r.type === "aws_security_group")
          .some(
            (r) =>
              Array.isArray(r.args.ingress) &&
              r.args.ingress.some(
                (v) =>
                  isMap(v) &&
                  (v as any).from_port === 22 &&
                  (v as any).to_port === 22 &&
                  Array.isArray((v as any).cidr_blocks) &&
                  (v as any).cidr_blocks.length === 1 &&
                  (v as any).cidr_blocks[0] === "203.0.113.0/24",
              ),
          );
        const issues = validate(project);
        const checks = [
          vpcs.length === 1,
          subnets.length === 2,
          count === 4,
          scoped,
          instances.every((i) => internetPath(project, i).reachable),
          !issues.some((i) => i.severity === "error"),
        ];
        setResult(
          checks.every(Boolean)
            ? "Challenge complete! Your architecture meets all six checks."
            : `${checks.filter(Boolean).length}/6 checks pass. ${!checks[0] ? "Use one VPC. " : ""}${!checks[1] ? "Create two subnets. " : ""}${!checks[2] ? "Create four EC2 instances. " : ""}${!checks[3] ? "Restrict SSH to the specified CIDR. " : ""}${!checks[4] ? "Give every instance an explicit internet route and public IP. " : ""}${!checks[5] ? "Resolve validation errors." : ""}`,
        );
      } else {
        if (!r) {
          setResult("Add or select a resource first.");
          return;
        }
        const actual = await parseHCL(draft);
        const { resourceHCL } = await import("@/lib/hcl");
        const expected = await parseHCL(resourceHCL(r, project));
        const sort = (v: any): any =>
          Array.isArray(v)
            ? v.map(sort)
            : v && typeof v === "object"
              ? Object.fromEntries(
                  Object.keys(v)
                    .sort()
                    .map((k) => [k, sort(v[k])]),
                )
              : v;
        const matches =
          JSON.stringify(sort(actual)) === JSON.stringify(sort(expected));
        setResult(
          matches
            ? "Correct. Every argument and reference matches the selected resource."
            : "The HCL parses, but the block does not match yet. Check the name, arguments, and references.",
        );
        if (matches && mode === "Memory") setStage(Math.min(3, stage + 1));
      }
    } catch (e) {
      setResult((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const inject = () => {
    const instance = project.resources.find((r) => r.type === "aws_instance");
    if (!instance) {
      setResult("Add an EC2 instance before starting this debugging exercise.");
      return;
    }
    change((p) => {
      p.resources.find((r) => r.id === instance.id)!.args.subnet_id =
        ref("missing_subnet");
    }, "Debug exercise: one subnet reference is broken. Find and repair it.");
    select(instance.id);
    setResult(
      "Find the invalid subnet reference. Use the Network inspector to connect the correct subnet.",
    );
  };
  const icons = {
    Build: Lightbulb,
    Explain: BookOpen,
    Reverse: Code2,
    Debug: Bug,
    Challenge: Target,
    Memory: Brain,
  };
  const Icon = icons[mode];
  return (
    <section
      className={`learning-panel ${mode !== "Build" && mode !== "Explain" ? "exercise-mode" : ""}`}
    >
      <button className="learning-heading" onClick={() => setOpen(!open)}>
        <span className="learning-symbol">
          <Icon size={16} />
        </span>
        <strong>
          {mode === "Build" ? "Learn as you build" : `${mode} mode`}
        </strong>
        <span className="learning-tag">
          {mode === "Build" ? "ONE CONNECTION AT A TIME" : "INTERACTIVE LAB"}
        </span>
        {open ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>
      {open && (
        <div className="learning-body">
          {["Build", "Explain"].includes(mode) ? (
            <>
              <p>{notice}</p>
              <span className="learning-tip">
                <span className="key-word">Did you know?</span> A reference
                tells Terraform what to create first. You rarely need{" "}
                <code>depends_on</code>.
              </span>
            </>
          ) : (
            <>
              <p>
                {mode === "Reverse"
                  ? `Write the Terraform block for ${r?.name ?? "a selected resource"}. The canvas is your reference.`
                  : mode === "Debug"
                    ? "Practice with a real configuration mistake. Trace the dependency and repair it in the inspector."
                    : mode === "Challenge"
                      ? "Create one VPC, two public subnets, and four EC2 instances. Allow SSH only from 203.0.113.0/24. Configure explicit routes and public IPs."
                      : `Recall level ${stage}/3. Reproduce ${r?.name ?? "a resource"} without looking at generated code.`}
              </p>
              {["Reverse", "Memory"].includes(mode) && (
                <textarea
                  aria-label="Learning exercise code"
                  spellCheck={false}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={
                    mode === "Memory" && stage > 1
                      ? "Write from memory…"
                      : 'resource "aws_instance" "web" {\n  # Your configuration\n}'
                  }
                />
              )}
              <div className="exercise-actions">
                {mode === "Debug" && (
                  <Button size="sm" onClick={inject}>
                    <Bug size={12} />
                    Introduce a mistake
                  </Button>
                )}
                <Button
                  variant="default"
                  size="sm"
                  disabled={busy}
                  onClick={check}
                >
                  <CheckCircle2 size={13} />
                  {busy
                    ? "Checking…"
                    : mode === "Challenge"
                      ? "Evaluate architecture"
                      : "Check my work"}
                </Button>
                {result && <span role="status">{result}</span>}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
