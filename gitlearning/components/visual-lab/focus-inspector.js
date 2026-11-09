"use client";
import { commitById } from "@/lib/git-engine";

export function FocusInspector({ focus, state, onInspect, onReturn }) {
  if (!focus || focus.kind === "files") return null;
  const selected = focus.targets
    .map(
      (id) =>
        commitById(state, id) ||
        state.remoteStore.commits.find((commit) => commit.id === id),
    )
    .filter(Boolean);
  return (
    <section className="vl-focus-inspector" aria-label="Command selection">
      <span className="eyebrow">
        {focus.kind === "checkout"
          ? "YOUR CHECKOUT"
          : focus.kind === "manual"
            ? "MANUAL INSPECTION"
            : "COMMAND FOCUS"}
      </span>
      <h3>{focus.title}</h3>
      <p>{focus.caption}</p>
      {focus.kind === "manual" && (
        <button className="vl-text-button" onClick={onReturn}>
          Return to command focus
        </button>
      )}
      {selected.length > 0 && (
        <div className="vl-focus-commits">
          {selected.map((commit, index) => (
            <button
              key={commit.id}
              onClick={() => onInspect(commit.id)}
              data-selected-commit={commit.id}
            >
              <span>
                {focus.kind === "diff" ? `${index === 0 ? "A" : "B"} · ` : ""}
                {commit.id}
              </span>
              <strong>{commit.message}</strong>
            </button>
          ))}
        </div>
      )}
      {selected.length === 1 && !focus.comparison && (
        <details className="vl-selected-snapshot">
          <summary>Inspect selected snapshot</summary>
          <p>Parents: {selected[0].parents.join(", ") || "Root commit"}</p>
          {Object.entries(selected[0].tree).map(([file, value]) => (
            <div key={file}>
              <strong>{file}</strong>
              <pre>{value}</pre>
            </div>
          ))}
          <small>
            This is the selected commit's saved tree. The working files and
            index are shown separately.
          </small>
        </details>
      )}
      {focus.comparison && (
        <div className="vl-endpoint-diff" aria-label="Selected tree comparison">
          <div>
            <b>A · {focus.comparison.fromLabel}</b>
            <b>B · {focus.comparison.toLabel}</b>
          </div>
          {focus.comparison.paths.length ? (
            focus.comparison.paths.map((path) => (
              <section key={path}>
                <strong>{path}</strong>
                <div>
                  <pre>{focus.comparison.from[path] ?? "(absent)"}</pre>
                  <pre>{focus.comparison.to[path] ?? "(absent)"}</pre>
                </div>
              </section>
            ))
          ) : (
            <p>No file contents differ between these endpoints.</p>
          )}
        </div>
      )}
    </section>
  );
}
