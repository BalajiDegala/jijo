import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useLab } from "../store";
import { kindLabels } from "../engine/deviceEngine";
import type { ResourceKind } from "../engine/types";
import { awsDefinition, awsResources } from "../data/awsResources";
import { ResourceIcon } from "./Icons";
import { useAwsResourceCreation } from "./useAwsResourceCreation";

const localKinds: ResourceKind[] = [
  "computer",
  "server",
  "switch",
  "router",
  "firewall",
  "internet",
];
const awsKinds: ResourceKind[] = [
  "region",
  "vpc",
  "az",
  "subnet",
  "ec2",
  "alb",
  "rds",
  "asg",
  "dbEndpoint",
  "routeTable",
  "igw",
  "nat",
  "eip",
  "sg",
  "nacl",
  "internet",
];

/** One library presentation for the existing labs and guided scenarios. */
export function ComponentLibrary({ onAdded }: { onAdded: () => void }) {
  const { topology, add } = useLab();
  const [search, setSearch] = useState("");
  const creation = useAwsResourceCreation();
  const kinds =
    topology.mode === "aws"
      ? [
          ...awsKinds,
          ...(topology.builder
            ? awsResources
                .map((r) => r.kind)
                .filter((k) => !awsKinds.includes(k))
            : []),
        ]
      : localKinds;
  return (
    <div className="component-library">
      <div className="library-heading">
        <span>COMPONENT LIBRARY</span>
        <span>{topology.mode === "aws" ? "AWS" : "LOCAL"}</span>
      </div>
      <label className="search-field">
        <Search size={14} />
        <input
          aria-label="Search components"
          placeholder="Find a component…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      <div className="component-list">
        {kinds
          .filter((kind) =>
            kindLabels[kind].toLowerCase().includes(search.toLowerCase()),
          )
          .map((kind) => (
            <button
              draggable
              key={kind}
              title={
                topology.mode === "aws"
                  ? awsDefinition(kind)?.description
                  : undefined
              }
              onDragStart={(e) => {
                e.dataTransfer.setData("application/netverse", kind);
                e.dataTransfer.effectAllowed = "move";
              }}
              onClick={() => {
                if (topology.builder) creation.add(kind);
                else add(kind);
                onAdded();
              }}
            >
              <span className={`library-icon ${kind}`}>
                <ResourceIcon kind={kind} size={17} />
              </span>
              <span>{kindLabels[kind]}</span>
              <Plus size={13} />
            </button>
          ))}
      </div>
      <p className="library-hint">Drag onto canvas or click to add</p>
      {creation.dialog}
    </div>
  );
}
