import { useRef, useState } from "react";
import { ChevronDown, ChevronUp, Link2 } from "lucide-react";
import { useLab } from "../store";
import { containerKinds } from "../engine/types";
import { kindLabels } from "../engine/deviceEngine";
import { planConnection } from "../engine/connectionEngine";

export function ConnectionTools() {
  const { topology, selectedId, connect } = useLab();
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState("");
  const [target, setTarget] = useState("");
  const toggle = useRef<HTMLButtonElement>(null);
  const nodes = topology.resources.filter(
    (r) => topology.builder || !containerKinds.includes(r.kind),
  );
  const sourceValue = nodes.some((r) => r.id === source) ? source : "";
  const targetValue = nodes.some((r) => r.id === target) ? target : "";
  const plan = planConnection(topology, sourceValue, targetValue);
  const cloud = topology.mode === "aws";

  return (
    <section
      className="connection-tools"
      aria-label="Manual connections"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          toggle.current?.focus();
        }
      }}
    >
      <div className="connection-heading">
        <button
          ref={toggle}
          type="button"
          className="secondary"
          aria-expanded={open}
          aria-controls="connection-form"
          onClick={() => {
            if (!open) {
              setSource(
                nodes.some((r) => r.id === selectedId) ? selectedId! : "",
              );
              setTarget("");
            }
            setOpen(!open);
          }}
        >
          <Link2 size={16} /> Connect nodes
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        <span>
          Choose two nodes to {cloud ? "set up an association" : "add a cable"}.
        </span>
      </div>
      {open && (
        <form
          id="connection-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (plan.kind !== "blocked") connect(sourceValue, targetValue);
          }}
        >
          <p className="connection-instructions">
            {topology.diagram
              ? "Connect service nodes to describe the architecture. Route table/gateway and NAT/Elastic IP pairs still update their actual associations."
              : cloud
                ? "Cloud connections update routing or resource settings. Choose a route table and gateway, an instance and security group, or a NAT gateway and Elastic IP, in either order."
                : "Pick two devices below, then add a cable. You can also drag from the dot on the right of one card to the dot on the left of another."}
          </p>
          {nodes.length < 2 && (
            <p className="connection-instructions">
              Add at least two devices from the component library to get
              started.
            </p>
          )}
          <div className="connection-fields">
            <label>
              <span id="connection-source-label">First node</span>
              <select
                value={sourceValue}
                aria-labelledby="connection-source-label"
                aria-describedby="connection-feedback"
                onChange={(event) => setSource(event.target.value)}
              >
                <option value="">Choose a node</option>
                {nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.name} — {kindLabels[node.kind]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span id="connection-target-label">Second node</span>
              <select
                value={targetValue}
                aria-labelledby="connection-target-label"
                aria-describedby="connection-feedback"
                onChange={(event) => setTarget(event.target.value)}
              >
                <option value="">Choose another node</option>
                {nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.name} — {kindLabels[node.kind]}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="primary"
              disabled={plan.kind === "blocked"}
            >
              <Link2 size={16} /> {cloud ? "Apply connection" : "Add cable"}
            </button>
          </div>
          <p
            id="connection-feedback"
            className="connection-feedback"
            aria-live="polite"
          >
            {plan.message}
          </p>
          <p className="connection-instructions">
            Use Undo above to reverse a connection change.{" "}
            {topology.diagram
              ? "Logical links describe service relationships."
              : "Use Send packet below to test communication."}
          </p>
        </form>
      )}
    </section>
  );
}
