import { useEffect, useState } from "react";
import {
  BookOpen,
  Check,
  Download,
  LayoutGrid,
  Plus,
  RotateCcw,
} from "lucide-react";
import { useLab } from "../store";
import { twoSubnetScenario } from "../data/awsScenarios";
import type { AwsLearningStep } from "../data/awsScenarios";
import {
  addRecommendedAwsRules,
  arrangeAws,
  newAwsLearningTopology,
  suggestedAwsAction,
} from "../engine/awsBuilder";
import { validateAwsConnectivity } from "../engine/awsValidation";
import { awsGuideMarkdown, generateAwsGuide } from "../engine/awsGuide";
import { AWS_DRAFT_KEY, deserialize, serialize } from "../engine/persistence";
import { overlaps, subnetWithin } from "../engine/ipMathEngine";
import type { Resource, ResourceKind, Topology } from "../engine/types";

const draftKey = AWS_DRAFT_KEY;
export function AwsBuilderEntry() {
  const [draft, setDraft] = useState(false);
  useEffect(() => {
    try {
      setDraft(!!localStorage.getItem(draftKey));
    } catch {
      /* Saving still works through JSON export. */
    }
  }, []);
  return (
    <section className="aws-builder-entry">
      <div>
        <strong>Build an AWS network step by step</strong>
        <p>
          Connect two private EC2 instances across two subnets, then turn your
          diagram into an AWS guide.
        </p>
      </div>
      <div className="aws-actions">
        <button
          className="primary"
          onClick={() => {
            useLab.getState().replace(newAwsLearningTopology());
            useLab.setState({ page: "aws" });
          }}
        >
          Start two-subnet lab
        </button>
        {draft && (
          <button
            className="secondary"
            onClick={() => {
              try {
                const t = deserialize(localStorage.getItem(draftKey) || "");
                if (!t.builder) throw new Error("No AWS learning draft found.");
                useLab.getState().replace(t);
                useLab.setState({ page: "aws" });
              } catch (e) {
                useLab.setState({
                  toast: `Could not restore AWS draft: ${(e as Error).message}`,
                });
              }
            }}
          >
            Resume saved AWS lab
          </button>
        )}
      </div>
    </section>
  );
}
function setProgress(patch: Partial<NonNullable<Topology["builder"]>>) {
  useLab.getState().edit((t) => {
    if (t.builder) Object.assign(t.builder, patch);
  });
}
function completion(t: Topology): boolean[] {
  const count = (kind: ResourceKind) =>
    t.resources.filter((r) => r.kind === kind).length;
  const result = validateAwsConnectivity(t);
  const ok = (id: string) =>
    result.checks.find((c) => c.id === id)?.status === "pass";
  const subnets = t.resources.filter((r) => r.kind === "subnet");
  const validPair = subnets.some((a, i) =>
    subnets.slice(i + 1).some((b) => {
      const vpc = t.resources.find((r) => r.id === a.vpcId && r.kind === "vpc");
      try {
        return (
          !!vpc &&
          a.vpcId === b.vpcId &&
          subnetWithin(a.cidr!, vpc.cidr!) &&
          subnetWithin(b.cidr!, vpc.cidr!) &&
          !overlaps(a.cidr!, b.cidr!)
        );
      } catch {
        return false;
      }
    }),
  );
  const conditions: Record<string, boolean> = {
    vpc: count("vpc") > 0,
    "subnet-a": count("subnet") > 0,
    "subnet-b": validPair,
    "ec2-a": count("ec2") > 0,
    "ec2-b": count("ec2") > 1 && ok("placement"),
    path: !!t.builder?.showPath,
    security: ok("security"),
    acl: !!t.builder?.reviewedAcl,
    validate: result.passed,
    guide: result.passed && !!t.builder?.guideGenerated,
  };
  return twoSubnetScenario.steps.map(
    (step) => conditions[step.condition] || false,
  );
}
export function AwsBuilderToolbar() {
  const { topology, edit } = useLab();
  const [saved, setSaved] = useState("Saving draft…");
  useEffect(() => {
    if (!topology.builder) return;
    setSaved("Saving draft…");
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, serialize(topology));
        setSaved("Draft saved on this device");
      } catch {
        setSaved(
          "Draft storage unavailable. Use Export JSON to keep your work.",
        );
      }
    }, 300);
    const flushDraft = () => {
      try {
        const current = useLab.getState().topology;
        if (current.builder) localStorage.setItem(draftKey, serialize(current));
      } catch {
        /* The visible storage status and JSON export remain available. */
      }
    };
    window.addEventListener("pagehide", flushDraft);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("pagehide", flushDraft);
    };
  }, [topology]);
  const b = topology.builder;
  if (!b) return null;
  const step = twoSubnetScenario.steps[b.step],
    complete = completion(topology);
  const addKind = (step as AwsLearningStep).addKind;
  return (
    <section
      className="aws-learning-toolbar"
      aria-label="AWS learning scenario"
    >
      <div className="aws-section-heading">
        <div>
          <h2>{twoSubnetScenario.title}</h2>
          <small>{saved}</small>
        </div>
        <label>
          Builder mode
          <select
            aria-label="Builder mode"
            value={b.mode}
            onChange={(e) =>
              setProgress({ mode: e.target.value as "guided" | "free" })
            }
          >
            <option value="guided">Guided Learning</option>
            <option value="free">Free Build</option>
          </select>
        </label>
      </div>
      {b.mode === "free" && (
        <p className="aws-next-action">{suggestedAwsAction(topology)}</p>
      )}
      <div className="aws-actions">
        <button
          className="secondary"
          onClick={() => {
            edit(arrangeAws);
            window.dispatchEvent(new Event("aws-fit-diagram"));
          }}
        >
          <LayoutGrid size={15} />
          Auto arrange
        </button>
        <button
          className="secondary"
          onClick={() => useLab.getState().replace(newAwsLearningTopology())}
        >
          <RotateCcw size={15} />
          Reset scenario
        </button>
        <label className="aws-resource-picker">
          Inspect resource
          <select
            aria-label="Inspect AWS resource"
            value={useLab.getState().selectedId || ""}
            onChange={(e) =>
              useLab.setState({
                selectedId: e.target.value || undefined,
                selectedLinkId: undefined,
              })
            }
          >
            <option value="">Select a resource</option>
            {topology.resources.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      {b.mode === "guided" && (
        <>
          <nav className="aws-step-list" aria-label="Scenario steps">
            {twoSubnetScenario.steps.map((s, i) => (
              <button
                key={s.id}
                aria-label={`Step ${i + 1}: ${s.title}`}
                aria-current={i === b.step ? "step" : undefined}
                className={i === b.step ? "active" : ""}
                onClick={() => setProgress({ step: i })}
              >
                {complete[i] ? <Check size={13} /> : i + 1}
                <span>{s.title}</span>
              </button>
            ))}
          </nav>
          <progress
            aria-label="Scenario progress"
            value={complete.filter(Boolean).length}
            max={10}
          />
          <div className="aws-current-step">
            <div className="aws-section-heading">
              <h3>{step.title}</h3>
              <div className="aws-actions">
                {addKind && (
                  <button
                    className="primary"
                    onClick={() =>
                      window.dispatchEvent(
                        new CustomEvent("aws-add-resource", {
                          detail: addKind,
                        }),
                      )
                    }
                  >
                    <Plus size={14} />
                    {addKind === "vpc"
                      ? "Add VPC"
                      : addKind === "subnet"
                        ? "Add Subnet"
                        : "Add EC2 Instance"}
                  </button>
                )}
                {b.step === 7 && (
                  <button
                    className="secondary"
                    onClick={() => setProgress({ reviewedAcl: true })}
                  >
                    I reviewed Network ACL behavior
                  </button>
                )}
                <button
                  className="secondary"
                  disabled={b.step === 0}
                  onClick={() => setProgress({ step: b.step - 1 })}
                >
                  Previous step
                </button>
                <button
                  className="secondary"
                  disabled={b.step === 9}
                  onClick={() => setProgress({ step: b.step + 1 })}
                >
                  Next step
                </button>
              </div>
            </div>
            <p>{step.purpose}</p>
            <details>
              <summary>AWS Console instructions and common mistakes</summary>
              <p>{step.instruction}</p>
              <ol>
                {step.console.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <p>{step.mistake}</p>
              <a href={step.docs} target="_blank" rel="noreferrer">
                Official AWS documentation
              </a>
            </details>
          </div>
        </>
      )}
    </section>
  );
}

export function AwsLearningPanel() {
  const { topology, update, edit } = useLab();
  const [checked, setChecked] = useState(false),
    [guideOpen, setGuideOpen] = useState(false);
  const b = topology.builder;
  if (!b) return null;
  const instances = topology.resources.filter((r) => r.kind === "ec2");
  const source = instances.find((r) => r.id === b.sourceId),
    target = instances.find((r) => r.id === b.targetId);
  const validation = validateAwsConnectivity(topology);
  const guide = guideOpen ? generateAwsGuide(topology) : [];
  const host = (label: string, resource?: Resource) => (
    <label>
      {label}
      <select
        aria-label={label}
        value={resource?.osFirewall || "unknown"}
        disabled={!resource}
        onChange={(e) =>
          resource &&
          update(resource.id, {
            osFirewall: e.target.value as Resource["osFirewall"],
          })
        }
      >
        <option value="unknown">Unknown — verify separately</option>
        <option value="allow">Model as allowing test traffic</option>
        <option value="deny">Model as blocking test traffic</option>
      </select>
    </label>
  );
  return (
    <section
      className="aws-learning-panel"
      aria-label="AWS architecture checks"
    >
      <div className="aws-section-heading">
        <h3>Model a connectivity test</h3>
        <span className="aws-model-badge">
          Local configuration checks · no AWS access
        </span>
      </div>
      <div className="aws-test-controls">
        <label>
          Source instance
          <select
            aria-label="Test source instance"
            value={source?.id || ""}
            onChange={(e) => setProgress({ sourceId: e.target.value })}
          >
            <option value="">Choose EC2 source</option>
            {instances.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} · {r.ip}
              </option>
            ))}
          </select>
        </label>
        <label>
          Destination instance
          <select
            aria-label="Test destination instance"
            value={target?.id || ""}
            onChange={(e) => setProgress({ targetId: e.target.value })}
          >
            <option value="">Choose EC2 destination</option>
            {instances.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} · {r.ip}
              </option>
            ))}
          </select>
        </label>
        <label>
          Test protocol
          <select
            aria-label="AWS test protocol"
            value={b.protocol}
            onChange={(e) =>
              setProgress({ protocol: e.target.value as "ICMP" | "TCP" })
            }
          >
            <option value="ICMP">ICMP Echo Request (ping)</option>
            <option value="TCP">TCP application</option>
          </select>
        </label>
        {b.protocol !== "ICMP" && (
          <label>
            Destination port
            <input
              aria-label="AWS destination port"
              type="number"
              min={1}
              max={65535}
              value={b.port}
              onChange={(e) => setProgress({ port: Number(e.target.value) })}
            />
          </label>
        )}
        {host("Source host firewall", source)}
        {host("Destination host firewall", target)}
      </div>
      <p className="note">
        Host firewall selections are assumptions for this test, not observations
        of real instances. ICMP uses type 8/code 0; it has no TCP/UDP port. TCP
        return traffic targets client port 49152 in this model.
      </p>
      <div className="aws-actions">
        <button
          className="secondary"
          disabled={!source || !target || source.id === target.id}
          onClick={() => setProgress({ showPath: !b.showPath })}
        >
          {b.showPath
            ? "Hide Network Connectivity"
            : "Show Network Connectivity"}
        </button>
        <button
          className="secondary"
          disabled={!source || !target || source.id === target.id}
          onClick={() => {
            try {
              edit(addRecommendedAwsRules);
              useLab.setState({
                toast:
                  "Added source outbound and destination inbound rules using Security Group references. Review host assumptions separately.",
              });
            } catch (e) {
              useLab.setState({ toast: (e as Error).message });
            }
          }}
        >
          Add recommended SG rules
        </button>
        <button className="primary" onClick={() => setChecked(true)}>
          Check My Architecture
        </button>
        <button
          className="secondary"
          aria-expanded={guideOpen}
          onClick={() => {
            setGuideOpen(!guideOpen);
            if (!guideOpen) setProgress({ guideGenerated: true });
          }}
        >
          <BookOpen size={15} />
          AWS implementation guide
        </button>
      </div>
      {b.showPath && source && target && (
        <div className="aws-logical-path">
          <strong>Logical path · reachability depends on configuration</strong>
          <ol>
            {[
              source.name,
              topology.resources.find((r) => r.id === source.subnetId)?.name ||
                "Missing subnet",
              "VPC local routing",
              topology.resources.find((r) => r.id === target.subnetId)?.name ||
                "Missing subnet",
              target.name,
            ].map((name, i) => (
              <li key={i}>{name}</li>
            ))}
          </ol>
          <p>
            A route table chooses a target; it is not a physical appliance.{" "}
            {validation.checks.find((c) => c.id === "routing")?.status ===
            "pass"
              ? "The local routing check passes; security and host checks are separate."
              : "This is the intended path; the local routing check does not currently pass."}
          </p>
        </div>
      )}
      {checked && (
        <div className="aws-validation" aria-live="polite">
          <p className={validation.passed ? "aws-pass" : "aws-error"}>
            {validation.message}
          </p>
          <ul>
            {validation.checks.map((check) => (
              <li
                key={check.id}
                data-check={check.id}
                data-status={check.status}
              >
                <strong>
                  {check.status === "pass"
                    ? "✓"
                    : check.status === "unknown"
                      ? "?"
                      : "!"}{" "}
                  {check.label}
                </strong>
                <p>{check.explanation}</p>
                {check.status !== "pass" && (
                  <p>
                    <b>Suggested fix:</b> {check.fix}
                  </p>
                )}
                {check.resourceId && check.status !== "pass" && (
                  <button
                    className="secondary"
                    onClick={() =>
                      useLab.setState({ selectedId: check.resourceId })
                    }
                  >
                    Inspect affected resource
                  </button>
                )}
              </li>
            ))}
          </ul>
          <small>
            Checks update when you change the diagram. Extended services such as
            Transit Gateway, VPN, load balancers, endpoints and IAM are not
            simulated by this two-instance validator.
          </small>
        </div>
      )}
      {guideOpen && (
        <div className="aws-implementation-guide">
          <div className="aws-section-heading">
            <h3>AWS implementation guide</h3>
            <button
              className="secondary"
              onClick={() => {
                const url = URL.createObjectURL(
                  new Blob([awsGuideMarkdown(topology)], {
                    type: "text/markdown",
                  }),
                );
                const a = document.createElement("a");
                a.href = url;
                a.download = "aws-network-implementation.md";
                a.click();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
              }}
            >
              <Download size={14} />
              Download guide
            </button>
          </div>
          <p>Generated from your current diagram. {validation.message}</p>
          {guide.map((step, i) => (
            <details key={`${i}-${step.title}`}>
              <summary>
                {i + 1}. {step.title}
              </summary>
              <p>{step.purpose}</p>
              <ol>
                {step.instructions.map((instruction, j) => (
                  <li key={j}>{instruction}</li>
                ))}
              </ol>
              <ul>
                {step.values.map((value, j) => (
                  <li key={j}>{value}</li>
                ))}
              </ul>
              <p>
                <b>Expected result:</b> {step.expected}
              </p>
              <p>
                <b>Common mistakes:</b> {step.mistakes}
              </p>
              <a href={step.docs} target="_blank" rel="noreferrer">
                Official AWS documentation
              </a>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}
