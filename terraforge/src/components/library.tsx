"use client";
import { useState } from "react";
import {
  Search,
  Plus,
  ChevronDown,
  ArrowRight,
  BookOpen,
  Sparkles,
  GripVertical,
  X,
  ChevronRight,
  Settings2,
} from "lucide-react";
import { registry } from "@/lib/registry";
import { useStudio } from "@/lib/store";
import { ResourceIcon } from "./icons";
import { Button } from "./ui";
export function Library({
  onTemplates,
  onSettings,
}: {
  onTemplates: () => void;
  onSettings: () => void;
}) {
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<string[]>([
    "Storage",
    "Databases",
    "Load Balancing",
    "IAM",
    "Terraform Language",
  ]);
  const add = useStudio((x) => x.add);
  const categories = [
    "Providers",
    "Data Sources",
    "Networking",
    "Compute",
    "Security",
    "Storage",
    "Databases",
    "Load Balancing",
    "IAM",
    "Terraform Language",
  ];
  return (
    <aside className="library">
      <div className="panel-heading">
        <span>
          <BoxLocal />
          Resource library
        </span>
        <span className="tiny-count">{registry.length}</span>
      </div>
      <div className="library-intro">
        Small building blocks.
        <br />
        <strong>Real infrastructure.</strong>
      </div>
      <div className="search-input">
        <Search size={14} />
        <input
          aria-label="Search resources"
          placeholder="Search resources…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <kbd>/</kbd>
      </div>
      <div className="library-scroll">
        {categories.map((category) => {
          const resources = registry.filter(
            (s) =>
              s.category === category &&
              (s.label + " " + s.type + " " + s.description)
                .toLowerCase()
                .includes(search.toLowerCase()),
          );
          if (!resources.length && category !== "Providers") return null;
          if (search && category === "Providers") return null;
          const closed = !search && collapsed.includes(category);
          return (
            <section className="library-category" key={category}>
              <button
                className="category-label"
                onClick={() =>
                  setCollapsed((c) =>
                    c.includes(category)
                      ? c.filter((x) => x !== category)
                      : [...c, category],
                  )
                }
              >
                <ChevronDown
                  size={12}
                  style={{ transform: closed ? "rotate(-90deg)" : undefined }}
                />
                {category}
                <span>{category === "Providers" ? 1 : resources.length}</span>
              </button>
              {!closed &&
                (category === "Providers" ? (
                  <button
                    className="library-resource provider-resource"
                    onClick={onSettings}
                  >
                    <span className="aws-icon">aws</span>
                    <span>
                      <strong>Amazon Web Services</strong>
                      <small>Provider · hashicorp/aws</small>
                    </span>
                    <Settings2 size={13} />
                  </button>
                ) : (
                  resources.map((s) => (
                    <button
                      key={s.type}
                      className="library-resource"
                      draggable
                      onDragStart={(e) =>
                        e.dataTransfer.setData("application/terraforge", s.type)
                      }
                      onClick={() => add(s.type)}
                      title={s.description}
                    >
                      <ResourceIcon type={s.type} />
                      <span>
                        <strong>{s.label}</strong>
                        <small>{s.type}</small>
                      </span>
                      <Plus size={14} />
                    </button>
                  ))
                ))}
            </section>
          );
        })}
        {search &&
          !registry.some((s) =>
            (s.label + " " + s.type + " " + s.description)
              .toLowerCase()
              .includes(search.toLowerCase()),
          ) && (
            <div className="no-results">
              No matching resources.
              <button onClick={() => setSearch("")}>Clear search</button>
            </div>
          )}
      </div>
      <div className="library-bottom">
        <div className="template-prompt">
          <span className="small-spark">
            <Sparkles size={16} />
          </span>
          <div>
            <strong>Skip the blank canvas</strong>
            <p>Start with a real-world architecture.</p>
          </div>
        </div>
        <Button onClick={onTemplates}>
          Explore templates <ArrowRight size={13} />
        </Button>
        <span className="library-help">
          <GripVertical size={11} />
          Drag to canvas or click to add
        </span>
      </div>
    </aside>
  );
}
function BoxLocal() {
  return <Plus size={15} />;
}
