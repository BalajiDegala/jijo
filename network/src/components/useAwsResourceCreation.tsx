import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useLab } from "../store";
import { awsDefinition } from "../data/awsResources";
import { addAwsResource, vpcOf } from "../engine/awsBuilder";
import type { ResourceKind } from "../engine/types";
import { absolutePosition } from "../engine/topologyEngine";
import { placeContainer } from "../engine/layoutEngine";
import { containerKinds } from "../engine/types";

type Position = { x: number; y: number };
export function useAwsResourceCreation() {
  const { topology, selectedId, edit } = useLab();
  const [kind, setKind] = useState<ResourceKind>();
  const dropPosition = useRef<Position | undefined>(undefined);
  const [parentId, setParent] = useState("");
  const [error, setError] = useState("");
  const opener = useRef<HTMLElement | null>(null);
  const close = () => {
    setKind(undefined);
    requestAnimationFrame(() => {
      if (opener.current?.isConnected) opener.current.focus();
    });
  };
  const definition = kind ? awsDefinition(kind) : undefined;
  const parents = topology.resources.filter((r) =>
    definition?.parentKinds.includes(r.kind),
  );
  const parent = parents.find((r) => r.id === parentId);
  const actionName = (kind: ResourceKind, label: string) =>
    kind === "ec2" ? "Add EC2 Instance" : `Add ${label}`;
  function open(resourceKind: ResourceKind, position?: Position) {
    if (!topology.builder) return;
    dropPosition.current = position;
    opener.current = document.activeElement as HTMLElement;
    const def = awsDefinition(resourceKind)!;
    let selected = topology.resources.find((r) => r.id === selectedId);
    if (position) {
      const depth = (id: string): number => {
        let count = 0,
          r = topology.resources.find((x) => x.id === id);
        const visited = new Set<string>();
        while (r?.parentId && !visited.has(r.id)) {
          visited.add(r.id);
          count++;
          r = topology.resources.find((x) => x.id === r!.parentId);
        }
        return count;
      };
      selected = topology.resources
        .filter((r) => {
          if (!containerKinds.includes(r.kind)) return false;
          const p = absolutePosition(r, topology.resources);
          return (
            position.x >= p.x &&
            position.x <= p.x + (r.width || 0) &&
            position.y >= p.y &&
            position.y <= p.y + (r.height || 0)
          );
        })
        .sort((a, b) => depth(b.id) - depth(a.id))[0];
    }
    const visited = new Set<string>();
    while (
      selected &&
      !def.parentKinds.includes(selected.kind) &&
      !visited.has(selected.id)
    ) {
      visited.add(selected.id);
      const ancestor = topology.resources.find(
        (r) => r.id === selected?.parentId,
      );
      if (!ancestor) break;
      selected = ancestor;
    }
    const preferred =
      selected && def.parentKinds.includes(selected.kind)
        ? selected
        : def.parentKinds.includes("vpc")
          ? vpcOf(topology, selected)
          : undefined;
    const candidates = topology.resources.filter((r) =>
      def.parentKinds.includes(r.kind),
    );
    const chosen =
      preferred?.id || (candidates.length === 1 ? candidates[0].id : "");
    if (
      chosen ||
      !def.parentKinds.length ||
      (["vpc", "region"].includes(resourceKind) && !candidates.length)
    ) {
      create(resourceKind, chosen);
      return;
    }
    setKind(resourceKind);
    setParent("");
    setError("");
  }
  function create(resourceKind: ResourceKind, placement: string) {
    try {
      let id = "";
      edit((t) => {
        const resource = addAwsResource(t, resourceKind, {
          parentId: placement || undefined,
        });
        id = resource.id;
        if (dropPosition.current) {
          const parent = t.resources.find((r) => r.id === resource.parentId);
          const origin = parent
            ? absolutePosition(parent, t.resources)
            : { x: 0, y: 0 };
          const preferred = {
            x: dropPosition.current.x - origin.x,
            y: dropPosition.current.y - origin.y,
          };
          placeContainer(resource, t.resources, preferred);
        }
      });
      useLab.setState({
        selectedId: id,
        selectedLinkId: undefined,
        toast: awsDefinition(resourceKind)!.next,
      });
      close();
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      useLab.setState({ toast: message });
    }
  }

  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (
        event as CustomEvent<
          ResourceKind | { kind: ResourceKind; position: Position }
        >
      ).detail;
      if (typeof detail === "string") open(detail);
      else open(detail.kind, detail.position);
    };
    window.addEventListener("aws-add-resource", listener);
    return () => window.removeEventListener("aws-add-resource", listener);
  }, [topology.resources, selectedId]);
  return {
    add: open,
    dialog:
      kind && definition
        ? createPortal(
            <div
              className="aws-add-backdrop"
              onKeyDown={(e) => {
                if (e.key === "Escape") close();
              }}
            >
              <section
                className="aws-add-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="aws-add-title"
                onKeyDown={(event) => {
                  if (event.key !== "Tab") return;
                  const focusable = [
                    ...event.currentTarget.querySelectorAll<HTMLElement>(
                      "button:not(:disabled), input, select",
                    ),
                  ];
                  const first = focusable[0],
                    last = focusable[focusable.length - 1];
                  if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last?.focus();
                  } else if (
                    !event.shiftKey &&
                    document.activeElement === last
                  ) {
                    event.preventDefault();
                    first?.focus();
                  }
                }}
              >
                <div className="aws-section-heading">
                  <h2 id="aws-add-title">
                    {actionName(kind, definition.name)}
                  </h2>
                  <button aria-label="Cancel adding resource" onClick={close}>
                    <X size={18} />
                  </button>
                </div>
                <p>{definition.description}</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    create(kind, parentId);
                  }}
                >
                  {definition.parentKinds.length > 0 && (
                    <label>
                      Parent resource
                      <select
                        autoFocus
                        aria-label="Parent resource"
                        value={parentId}
                        onChange={(e) => {
                          setParent(e.target.value);
                        }}
                        required={!["vpc", "region"].includes(kind)}
                      >
                        <option value="">
                          {["vpc", "region"].includes(kind)
                            ? "Use or create a default Region / Cloud"
                            : "Choose a parent"}
                        </option>
                        {parents.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                            {r.cidr ? ` (${r.cidr})` : ""}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  {definition.parentKinds.length > 0 &&
                    !parents.length &&
                    !["vpc", "region"].includes(kind) && (
                      <p role="status">
                        Create a{" "}
                        {definition.parentKinds
                          .map((k) => awsDefinition(k)?.name)
                          .join(" or ")}{" "}
                        first.
                      </p>
                    )}
                  {error && (
                    <p className="aws-error" role="alert">
                      {error}
                    </p>
                  )}
                  <div className="aws-actions">
                    <button
                      className="primary"
                      type="submit"
                      disabled={
                        definition.parentKinds.length > 0 &&
                        !parent &&
                        !["vpc", "region"].includes(kind)
                      }
                    >
                      Create resource
                    </button>
                    <button className="secondary" type="button" onClick={close}>
                      Cancel
                    </button>
                  </div>
                </form>
              </section>
            </div>,
            document.body,
          )
        : null,
  };
}
