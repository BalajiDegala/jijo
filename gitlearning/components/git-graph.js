"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { GitCommitHorizontal, GitBranch, MousePointer2 } from "lucide-react";
import { headId, ancestors } from "@/lib/git-engine";
const colors = ["#a890ff", "#55cdb3", "#61b0f7", "#e7b86c", "#f18baa"];
export function GitGraph({ state, compact = false }) {
  const [selected, setSelected] = useState(null);
  const visible = new Set(
    [
      ...Object.values(state.branches),
      ...Object.values(state.tracking),
      ...Object.values(state.tags),
      headId(state),
    ].flatMap((id) => [...ancestors(state, id)]),
  );
  const commits = state.commits.filter((c) => visible.has(c.id));
  const lanes = [...new Set(["main", ...commits.map((c) => c.branch)])];
  const width = Math.max(compact ? 460 : 640, commits.length * 106 + 150),
    height = Math.max(190, lanes.length * 72 + 105);
  const positions = Object.fromEntries(
    commits.map((c, i) => [
      c.id,
      { x: 74 + i * 106, y: 65 + Math.max(0, lanes.indexOf(c.branch)) * 72 },
    ]),
  );
  const active = state.commits.find((c) => c.id === selected);
  return (
    <div className={`git-graph ${compact ? "compact" : ""}`}>
      <div className="graph-label">
        <span>
          <GitBranch size={14} /> COMMIT HISTORY
        </span>
        <span className="graph-live">
          <span className="online-dot" /> {state.branch || "detached HEAD"}
        </span>
      </div>
      {!commits.length ? (
        <div className="graph-empty">
          <GitCommitHorizontal size={36} />
          <strong>Your story starts here.</strong>
          <span>Make a commit to see your first snapshot.</span>
        </div>
      ) : (
        <div className="graph-scroll">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            width={width}
            height={height}
            style={{ minWidth: compact ? "100%" : Math.min(width, 700) }}
            role="group"
            aria-label={`Git history with ${commits.length} commits. HEAD at ${headId(state)}. Branches: ${Object.entries(
              state.branches,
            )
              .map(([b, id]) => `${b} at ${id}`)
              .join(", ")}`}
          >
            {lanes.map((lane, i) => (
              <g key={lane}>
                <path
                  d={`M 30 ${65 + i * 72} H ${width - 30}`}
                  stroke="#ffffff09"
                  strokeDasharray="3 7"
                />
                <text
                  x="28"
                  y={65 + i * 72 - 25}
                  className="graph-lane"
                  fill={colors[i % colors.length]}
                >
                  {lane}
                </text>
              </g>
            ))}
            {commits.map((c) =>
              c.parents.map((parent) => {
                const from = positions[parent],
                  to = positions[c.id];
                if (!from) return null;
                const color = colors[lanes.indexOf(c.branch) % colors.length];
                return (
                  <motion.path
                    key={`${parent}-${c.id}`}
                    d={`M ${from.x} ${from.y} C ${from.x + 55} ${from.y}, ${to.x - 55} ${to.y}, ${to.x} ${to.y}`}
                    fill="none"
                    stroke={color}
                    strokeWidth="2.5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.8 }}
                    transition={{ duration: 0.65 }}
                  />
                );
              }),
            )}
            {commits.map((c) => {
              const pos = positions[c.id],
                color = colors[lanes.indexOf(c.branch) % colors.length],
                isHead = headId(state) === c.id,
                refs = Object.entries(state.branches)
                  .filter(([, id]) => id === c.id)
                  .map(([b]) => b);
              return (
                <g
                  key={c.id}
                  className="commit-node"
                  role="button"
                  tabIndex={0}
                  aria-label={`Inspect commit ${c.id}${isHead ? "HEAD" : ""}: ${c.message}`}
                  onClick={() => setSelected(c.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelected(c.id);
                    }
                  }}
                >
                  <rect x={pos.x - 35} y={pos.y - 40} width="85" height="80" fill="transparent" pointerEvents="all" />
                  {isHead && (
                    <motion.circle
                      cx={pos.x}
                      cy={pos.y}
                      r="19"
                      fill={color}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 0.13, scale: 1 }}
                    />
                  )}
                  <motion.circle
                    cx={pos.x}
                    cy={pos.y}
                    r="8"
                    fill="#151725"
                    stroke={color}
                    strokeWidth="3"
                    initial={{ opacity: 0, r: 0 }}
                    animate={{ opacity: 1, r: 8 }}
                    transition={{ duration: 0.4 }}
                  />
                  <circle cx={pos.x} cy={pos.y} r="2.5" fill={color} />
                  <text
                    x={pos.x}
                    y={pos.y + 28}
                    textAnchor="middle"
                    className="graph-hash"
                  >
                    {c.id}
                  </text>
                  {isHead && (
                    <g>
                      <rect
                        x={pos.x - 26}
                        y={pos.y - 37}
                        width="52"
                        height="20"
                        rx="5"
                        fill={color}
                      />
                      <text
                        x={pos.x}
                        y={pos.y - 23}
                        textAnchor="middle"
                        className="graph-head"
                      >
                        HEAD
                      </text>
                    </g>
                  )}
                  <title>{`${c.message}${refs.length ? ` (${refs.join(", ")})` : ""}`}</title>
                </g>
              );
            })}
          </svg>
        </div>
      )}
      {active && !compact ? (
        <div className="commit-details">
          <code>{active.id}</code>
          <strong>{active.message}</strong>
          <span>
            {active.parents.length} parent
            {active.parents.length === 1 ? "" : "s"} ·{" "}
            {Object.keys(active.tree).length} file
            {Object.keys(active.tree).length === 1 ? "" : "s"}
          </span>
          <button
            onClick={() => setSelected(null)}
            aria-label="Close commit details"
          >
            ×
          </button>
        </div>
      ) : (
        !compact && (
          <div className="graph-caption">
            <MousePointer2 size={12} /> Select a commit to inspect its snapshot.
            Lines connect parents to children.
          </div>
        )
      )}
    </div>
  );
}
