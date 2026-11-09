"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Cloud,
  Database,
  FileText,
  Folder,
  Layers,
  X,
} from "lucide-react";
import { headId, isIgnored, statusOf } from "@/lib/git-engine";
import { repositoryAreas } from "@/lib/visual-lab/trace";
import { HistoryGraph } from "../history-graph";

const icons = [Folder, Layers, Database, Cloud];
function fileLabel(state, area, path) {
  const status = statusOf(state);
  if (area === "working") {
    if (isIgnored(state, path) && !(path in state.index)) return "ignored";
    if (status.untracked.includes(path)) return "untracked";
    if (status.unstaged.includes(path)) return "modified";
    return "matches index";
  }
  if (area === "index")
    return status.staged.includes(path) ? "staged change" : "matches HEAD";
  return "saved snapshot";
}

export function RepositoryScene({
  frame,
  replay,
  onInspect,
  pause,
  focus,
  layout,
  beat,
  speed,
  graphPrimary,
  motionPaused,
  explaining,
  onResume,
  onCommitInspect,
}) {
  const reduced = useReducedMotion();
  const [filesView, setFilesView] = useState(null);
  const expanded =
    filesView?.frame === frame
      ? filesView.expanded
      : graphPrimary && focus.kind === "files" && Boolean(frame.command);
  const areas = repositoryAreas(frame.state);
  return (
    <div
      className={`vl-repository ${graphPrimary ? "vl-graph-primary" : ""} ${expanded ? "vl-files-expanded" : ""}`}
    >
      <div className="vl-state-label">
        <span>
          <span className="online-dot" /> Repository at this step
        </span>
        <code className="vl-head-attachment">{focus.attachment}</code>
        {graphPrimary && (
          <button
            className="vl-text-button"
            onClick={() => {
              pause();
              setFilesView({ frame, expanded: !expanded });
            }}
            aria-expanded={expanded}
          >
            {expanded ? "Compact files" : "Expand files"}
          </button>
        )}
      </div>
      <div className="vl-areas">
        {areas.map((area, index) => {
          const Icon = icons[index],
            affected = frame.events.some((event) => event.area === area.id);
          const paths = Object.keys(area.tree);
          return (
            <section
              className={`vl-area ${affected ? "vl-affected" : ""} ${focus.areas.includes(area.id) ? "vl-compared" : ""}`}
              data-area={area.id}
              key={area.id}
              aria-label={area.title}
            >
              <div className="vl-area-heading">
                <Icon size={16} />
                <h3>{area.title}</h3>
                <span>{paths.length}</span>
              </div>
              <small>{area.detail}</small>
              <div className="vl-file-list">
                {paths.map((path) => (
                  <motion.button
                    className="vl-file"
                    key={`${path}:${area.tree[path]}:${replay}`}
                    initial={reduced ? false : { opacity: 0.35, y: 7 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    onClick={() => onInspect(path)}
                    title={`Inspect ${path} in ${area.title}`}
                  >
                    <span>
                      <FileText size={13} />
                      <b>{path}</b>
                    </span>
                    <code>{area.tree[path]}</code>
                    <em>{fileLabel(frame.state, area.id, path)}</em>
                  </motion.button>
                ))}
                {!paths.length && (
                  <p className="vl-empty">
                    {index < 2
                      ? "No files here yet"
                      : index === 2
                        ? "No saved snapshot"
                        : "Nothing published here"}
                  </p>
                )}
              </div>
              {index < 3 && (
                <ArrowRight
                  className="vl-area-arrow"
                  size={15}
                  aria-hidden="true"
                />
              )}
            </section>
          );
        })}
      </div>
      {graphPrimary && focus.kind !== "files" && (
        <div className="vl-focus-caption" role="status">
          <div>
            <strong>{focus.title}</strong>
            <p>{focus.beats[beat]?.caption || focus.caption}</p>
          </div>
          {beat >= 0 && (
            <button
              className="vl-text-button"
              onClick={explaining ? pause : onResume}
            >
              {explaining ? "Pause animation" : "Resume animation"}
            </button>
          )}
          <span className="vl-focus-legend">
            <i />
            Selected <i />
            Parent path <i />
            Actual HEAD
          </span>
        </div>
      )}
      <div
        className="vl-transfer"
        key={`${frame.command || frame.title}:${replay}`}
      >
        <span className="vl-event-dot" />
        {frame.events.some((e) => e.type === "copy-to-index")
          ? "Copy into staging · the working file stays in place"
          : frame.events.find((e) => e.type === "transfer-objects")?.text ||
            frame.events.find((e) => e.type === "create-commit")?.text ||
            frame.expect}
      </div>
      <div
        className="vl-history"
        onPointerDownCapture={pause}
        onKeyDownCapture={pause}
      >
        <HistoryGraph
          state={frame.state}
          label="Visual lesson commit graph"
          focus={focus}
          layout={layout}
          beat={beat}
          speed={speed}
          replay={replay}
          motionPaused={motionPaused}
          onInspect={onCommitInspect}
        />
      </div>
    </div>
  );
}

export function FileInspector({ file, frame, onClose }) {
  const dialog = useRef(null);
  useEffect(() => {
    if (file) dialog.current?.showModal();
    else dialog.current?.close();
  }, [file]);
  const before = repositoryAreas(frame.before),
    after = repositoryAreas(frame.state);
  return (
    <dialog
      ref={dialog}
      className="vl-file-dialog"
      aria-label={`File snapshots: ${file || "file"}`}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="vl-dialog-heading">
        <div>
          <span className="eyebrow">INSPECT CONTENTS · PLAYBACK PAUSED</span>
          <h2>{file}</h2>
        </div>
        <button
          className="icon-button"
          aria-label="Close file inspector"
          onClick={onClose}
        >
          <X size={19} />
        </button>
      </div>
      <p>
        Before and after this step. “Absent” means this snapshot does not
        contain the path.
      </p>
      <div className="vl-file-snapshots">
        {after.map((area, index) => (
          <section key={area.id}>
            <h3>{area.title}</h3>
            <span>Before</span>
            <pre>{before[index].tree[file] ?? "(absent)"}</pre>
            <span>After</span>
            <pre
              className={
                before[index].tree[file] !== area.tree[file]
                  ? "vl-changed-content"
                  : ""
              }
            >
              {area.tree[file] ?? "(absent)"}
            </pre>
          </section>
        ))}
      </div>
      <button className="ide-button" onClick={onClose}>
        Return to the lesson
      </button>
    </dialog>
  );
}
