"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  Minus,
  Plus,
  Maximize2,
  Minimize2,
  Scan,
  LocateFixed,
  X,
  GitCommitHorizontal,
} from "lucide-react";
import { headId, changedFiles, ancestors } from "@/lib/git-engine";
import { fitCamera, zoomCamera, focusCamera } from "@/lib/graph-camera";
import { FocusEdges } from "./visual-lab/graph-focus";

export function HistoryGraph({
  state,
  label = "Interactive commit graph",
  focus,
  layout,
  beat = -1,
  replay = 0,
  motionPaused = false,
  speed = 1,
  onInspect,
}) {
  const [camera, setCamera] = useState({ x: 20, y: 20, zoom: 1 });
  const [selected, setSelected] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [following, setFollowing] = useState(true);
  const reduced = useReducedMotion();
  const marker = useId().replace(/:/g, "_");
  const cameraFrame = useRef(null),
    cameraValue = useRef(camera);
  cameraValue.current = camera;
  const focusRef = useRef(null);
  const followingRef = useRef(following);
  followingRef.current = following;
  const surface = useRef(null),
    drag = useRef(null),
    dialog = useRef(null),
    expandButton = useRef(null);
  const dragged = useRef(false),
    autoFit = useRef(true),
    boundsRef = useRef(null);
  const local = new Set(state.commits.map((c) => c.id));
  const remote = new Set(state.remoteStore.commits.map((c) => c.id));
  const commits = useMemo(() => {
    const all = [
      ...state.commits,
      ...state.remoteStore.commits.filter(
        (c) => !state.commits.some((x) => x.id === c.id),
      ),
    ];
    const visible = new Set(
      [
        ...Object.values(state.branches),
        ...Object.values(state.tags),
        ...Object.values(state.tracking),
        ...Object.values(state.remoteStore.branches),
        headId(state),
        ...(focus?.context || []),
        ...(focus?.targets || []),
      ].flatMap((id) => [...ancestors({ commits: all }, id)]),
    );
    return all.filter((c) => visible.has(c.id));
  }, [state, focus]);
  const lanes = [
    "main",
    ...new Set(commits.map((c) => c.branch).filter((b) => b !== "main")),
  ];
  const points =
    layout ||
    Object.fromEntries(
      commits.map((c, i) => [
        c.id,
        { x: 62 + i * 190, y: 50 + lanes.indexOf(c.branch) * 165 },
      ]),
    );
  const refs = (id) => [
    ...Object.entries(state.branches)
      .filter(([, v]) => v === id)
      .map(([b]) => b),
    ...Object.entries(state.tracking)
      .filter(([, v]) => v === id)
      .map(([b]) => b),
    ...Object.entries(state.remoteStore.branches)
      .filter(([, v]) => v === id)
      .map(([b]) => "remote/" + b),
    ...Object.entries(state.tags)
      .filter(([, v]) => v === id)
      .map(([b]) => "tag:" + b),
  ];
  const bounds = {
    width: Math.max(300, ...commits.map((c) => points[c.id].x + 160)),
    height: Math.max(
      150,
      ...commits.map((c) => points[c.id].y + 65 + refs(c.id).length * 16),
    ),
  };
  boundsRef.current = bounds;
  const activeBeat = focus?.beats[beat];
  const focusIds =
    activeBeat?.ids ||
    (focus?.context.length ? focus.context : focus?.targets) ||
    [];
  focusRef.current = {
    ids: focusIds,
    points: Object.fromEntries(
      Object.entries(points).map(([id, point]) => [
        id,
        { ...point, bottom: Math.max(86, 65 + refs(id).length * 20) },
      ]),
    ),
  };
  const targetIds = new Set(focus?.targets || []);
  const attention = new Set([
    ...(activeBeat?.ids || focus?.history || focus?.context || []),
    ...targetIds,
  ]);
  const highlightedEdges = activeBeat?.edges || focus?.edges || [];
  function cancelCamera() {
    cancelAnimationFrame(cameraFrame.current);
    cameraFrame.current = null;
  }
  function manualCamera() {
    cancelCamera();
    autoFit.current = false;
    if (focus) setFollowing(false);
  }
  function moveCamera(next, animate = true) {
    if (!next) return;
    cancelCamera();
    if (!animate || reduced || motionPaused) {
      setCamera(next);
      return;
    }
    const previous = cameraValue.current,
      start = performance.now();
    const step = (now) => {
      const time = Math.min(1, (now - start) / (520 / speed)),
        eased = 1 - (1 - time) ** 3;
      setCamera({
        x: previous.x + (next.x - previous.x) * eased,
        y: previous.y + (next.y - previous.y) * eased,
        zoom: previous.zoom + (next.zoom - previous.zoom) * eased,
      });
      if (time < 1) cameraFrame.current = requestAnimationFrame(step);
    };
    cameraFrame.current = requestAnimationFrame(step);
  }
  function focusSelection(animate = true) {
    if (!surface.current) return;
    const viewport = {
      width: surface.current.clientWidth,
      height: surface.current.clientHeight,
    };
    const selected = focusCamera(
      viewport,
      focusRef.current.points,
      focusRef.current.ids,
    );
    moveCamera(selected || fitCamera(viewport, boundsRef.current), animate);
  }
  function inspect(id) {
    if (onInspect) onInspect(id);
    else setSelected(id);
  }
  function fit() {
    if (!surface.current?.clientWidth) return;
    autoFit.current = true;
    setCamera(
      fitCamera(
        {
          width: surface.current.clientWidth,
          height: surface.current.clientHeight,
        },
        boundsRef.current,
      ),
    );
  }
  useEffect(() => {
    if (fullscreen) dialog.current?.showModal();
    else dialog.current?.close();
    autoFit.current = true;
    const frame = requestAnimationFrame(() => {
      if (focus) {
        if (followingRef.current) focusSelection(false);
      } else fit();
    });
    const observer = new ResizeObserver(() => {
      if (focus) {
        if (followingRef.current) focusSelection(false);
      } else if (autoFit.current) fit();
    });
    if (surface.current) observer.observe(surface.current);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [fullscreen]);
  // Keep automatic framing until the learner deliberately moves the camera.
  useEffect(() => {
    if (!focus && autoFit.current) fit();
  }, [bounds.width, bounds.height]);
  useEffect(() => {
    if (!focus || motionPaused) return;
    if (following || focus.kind === "manual") focusSelection();
    return cancelCamera;
  }, [focus, beat, replay, following, motionPaused, speed]);
  useEffect(() => {
    if (motionPaused) cancelCamera();
    return cancelCamera;
  }, [motionPaused]);
  useEffect(() => {
    const el = surface.current;
    const wheel = (e) => {
      e.preventDefault();
      manualCamera();
      if (e.ctrlKey || e.metaKey) {
        const rect = el.getBoundingClientRect();
        setCamera((c) =>
          zoomCamera(c, c.zoom * Math.exp(-e.deltaY * 0.008), {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          }),
        );
      } else
        setCamera((c) => ({
          ...c,
          x: c.x - (e.shiftKey ? e.deltaY : e.deltaX),
          y: c.y - (e.shiftKey ? e.deltaX : e.deltaY),
        }));
    };
    el?.addEventListener("wheel", wheel, { passive: false });
    return () => el?.removeEventListener("wheel", wheel);
  }, [fullscreen]);
  function zoom(factor) {
    manualCamera();
    const el = surface.current;
    setCamera((c) =>
      zoomCamera(c, c.zoom * factor, {
        x: el.clientWidth / 2,
        y: el.clientHeight / 2,
      }),
    );
  }
  function focusHead() {
    const point = points[headId(state)];
    if (!point || !surface.current) return;
    manualCamera();
    setCamera({
      zoom: 1,
      x: surface.current.clientWidth / 2 - point.x,
      y: surface.current.clientHeight / 2 - point.y - 30,
    });
  }
  function exitFullscreen() {
    setFullscreen(false);
    requestAnimationFrame(() => expandButton.current?.focus());
  }
  function finishDrag(e) {
    if (drag.current?.id !== e.pointerId) return;
    if (!dragged.current && drag.current.commit) inspect(drag.current.commit);
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
  }
  const commit = commits.find((c) => c.id === selected);
  const parent = commits.find((c) => c.id === commit?.parents[0]);
  const content = (
    <>
      <div className={focus ? "guided-tools" : "graph-tools"}>
        <div className="panel-heading graph-toolbar">
          <span>
            <GitCommitHorizontal size={16} />{" "}
            <span className="graph-title">Commit graph</span>
            <small>{commits.length}</small>
          </span>
          <div className="inline-actions">
            <button
              className="icon-button"
              title="Zoom out"
              aria-label="Zoom out"
              onClick={() => zoom(1 / 1.2)}
            >
              <Minus size={15} />
            </button>
            <span className="zoom-value">{Math.round(camera.zoom * 100)}%</span>
            <button
              className="icon-button"
              title="Zoom in"
              aria-label="Zoom in"
              onClick={() => zoom(1.2)}
            >
              <Plus size={15} />
            </button>
            <button
              className="icon-button"
              title="Focus HEAD"
              aria-label="Focus HEAD"
              onClick={focusHead}
              disabled={!commits.length}
            >
              <LocateFixed size={15} />
            </button>
            <button
              className="icon-button"
              title="Fit graph (F)"
              aria-label="Fit graph"
              onClick={() => {
                manualCamera();
                fit();
              }}
            >
              <Scan size={15} />
            </button>
            <button
              className="icon-button"
              ref={fullscreen ? undefined : expandButton}
              title={fullscreen ? "Exit fullscreen (Esc)" : "Fullscreen graph"}
              aria-label={
                fullscreen ? "Exit fullscreen graph" : "Fullscreen graph"
              }
              onClick={() =>
                fullscreen ? exitFullscreen() : setFullscreen(true)
              }
            >
              {fullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </div>
        </div>
        {focus && (
          <div className="guided-camera-toolbar">
            <button
              aria-pressed={following}
              onClick={() => {
                cancelCamera();
                setFollowing((value) => !value);
              }}
            >
              Follow the action
            </button>
            <button onClick={() => focusSelection()}>Focus selection</button>
            <button
              onClick={() => {
                manualCamera();
                fit();
              }}
            >
              Overview
            </button>
            <span>
              {following ? "Camera follows the command" : "Manual camera"}
            </span>
          </div>
        )}
      </div>
      {focus && fullscreen && (
        <div className="guided-fullscreen-caption" role="status">
          <strong>{focus.title}</strong>
          <code>{focus.attachment}</code>
          <p>{activeBeat?.caption || focus.caption}</p>
        </div>
      )}
      <div
        className="graph-surface"
        ref={surface}
        tabIndex={0}
        role="group"
        aria-label="Graph canvas. Drag or use arrow keys to pan; plus and minus to zoom; F to fit."
        data-camera-x={camera.x}
        data-camera-y={camera.y}
        data-camera-zoom={camera.zoom}
        data-focus-kind={focus?.kind}
        data-focus-targets={focus?.targets.join(",")}
        data-actual-head={headId(state)}
        data-beat={beat}
        onPointerDown={(e) => {
          if (e.button !== 0 || !e.isPrimary) return;
          cancelCamera();
          dragged.current = false;
          drag.current = {
            id: e.pointerId,
            x: e.clientX,
            y: e.clientY,
            camera,
            commit: e.target.closest("[data-commit]")?.dataset.commit,
          };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const start = drag.current;
          if (!start || start.id !== e.pointerId) return;
          const dx = e.clientX - start.x,
            dy = e.clientY - start.y;
          if (Math.hypot(dx, dy) > 4) dragged.current = true;
          if (dragged.current) {
            manualCamera();
            setCamera({
              ...start.camera,
              x: start.camera.x + dx,
              y: start.camera.y + dy,
            });
          }
        }}
        onPointerUp={finishDrag}
        onPointerCancel={() => {
          drag.current = null;
          dragged.current = false;
        }}
        onLostPointerCapture={() => {
          drag.current = null;
        }}
        onKeyDown={(e) => {
          const movement = {
            ArrowLeft: [40, 0],
            ArrowRight: [-40, 0],
            ArrowUp: [0, 40],
            ArrowDown: [0, -40],
          }[e.key];
          if (movement) {
            e.preventDefault();
            manualCamera();
            setCamera((c) => ({
              ...c,
              x: c.x + movement[0],
              y: c.y + movement[1],
            }));
          }
          if (e.key.toLowerCase() === "f") {
            e.preventDefault();
            manualCamera();
            fit();
          }
          if (["+", "="].includes(e.key)) {
            e.preventDefault();
            zoom(1.2);
          }
          if (e.key === "-") {
            e.preventDefault();
            zoom(1 / 1.2);
          }
        }}
      >
        <svg
          width="100%"
          height="100%"
          role="group"
          aria-label="Commit history. Select a commit to inspect it."
        >
          <title>Local and simulated remote history</title>
          {focus && (
            <defs>
              <marker
                id={marker}
                markerWidth="5"
                markerHeight="5"
                refX="7"
                refY="2.5"
                orient="auto"
              >
                <path d="M0,0 L5,2.5 L0,5" fill="#81d9ff" />
              </marker>
            </defs>
          )}
          <g
            className="graph-camera"
            transform={`translate(${camera.x} ${camera.y}) scale(${camera.zoom})`}
          >
            {commits.flatMap((c) =>
              c.parents.map((p) => {
                const a = points[p],
                  b = points[c.id];
                return (
                  a && (
                    <path
                      className="history-edge"
                      key={c.id + p}
                      d={`M${a.x},${a.y} C${a.x + 85},${a.y} ${b.x - 85},${b.y} ${b.x},${b.y}`}
                      fill="none"
                      stroke={c.branch === "main" ? "#a68afa" : "#52c8bd"}
                      strokeWidth="2"
                      opacity={
                        focus &&
                        attention.size &&
                        !highlightedEdges.some(
                          (edge) => edge.from === c.id && edge.to === p,
                        )
                          ? 0.25
                          : 1
                      }
                    />
                  )
                );
              }),
            )}
            <FocusEdges
              focus={focus}
              beat={beat}
              points={points}
              marker={marker}
              replay={replay}
              paused={motionPaused}
              speed={speed}
            />
            {commits.map((c) => {
              const { x, y } = points[c.id],
                both = local.has(c.id) && remote.has(c.id),
                isHead = headId(state) === c.id;
              return (
                <g
                  className={`history-node ${focus ? "guided-node" : ""} ${targetIds.has(c.id) ? "guided-selected" : ""}`}
                  key={c.id}
                  data-commit={c.id}
                  data-head={isHead}
                  data-selected={targetIds.has(c.id)}
                  opacity={
                    focus && attention.size && !attention.has(c.id) && !isHead
                      ? 0.38
                      : 1
                  }
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    if (e.detail === 0) inspect(c.id);
                  }}
                  onFocus={() => {
                    const el = surface.current;
                    if (!el) return;
                    if (
                      x * camera.zoom + camera.x < 20 ||
                      x * camera.zoom + camera.x > el.clientWidth - 150 ||
                      y * camera.zoom + camera.y < 30 ||
                      y * camera.zoom + camera.y > el.clientHeight - 120
                    ) {
                      manualCamera();
                      setCamera((v) => ({
                        ...v,
                        x: el.clientWidth / 2 - x * v.zoom,
                        y: el.clientHeight / 2 - y * v.zoom - 30,
                      }));
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      inspect(c.id);
                    }
                  }}
                >
                  <rect
                    x={x - 30}
                    y={y - 32}
                    width="174"
                    height={110 + refs(c.id).length * 16}
                    fill="transparent"
                    pointerEvents="all"
                  />
                  {isHead && (
                    <circle
                      cx={x}
                      cy={y}
                      r={focus ? "23" : "17"}
                      fill="none"
                      stroke="#ab8cff"
                      strokeWidth="2"
                      opacity=".6"
                    />
                  )}
                  {targetIds.has(c.id) && (
                    <circle
                      className="guided-selection-ring"
                      cx={x}
                      cy={y}
                      r="16"
                      fill="none"
                      stroke="#ffd18a"
                      strokeWidth="3"
                    />
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r="8"
                    fill={
                      both ? "#52c8bd" : local.has(c.id) ? "#ab8cff" : "#f5be70"
                    }
                    stroke="#141724"
                    strokeWidth="3"
                  />
                  <text x={x - 24} y={y + 30} className="hash-text">
                    {c.id}
                  </text>
                  <text x={x - 24} y={y + 49} className="message-text">
                    {c.message.length > 24
                      ? c.message.slice(0, 23) + "…"
                      : c.message}
                  </text>
                  {isHead && (
                    <text
                      x={x - 18}
                      y={y - (focus ? 35 : 25)}
                      className="head-text"
                    >
                      HEAD
                    </text>
                  )}
                  {targetIds.has(c.id) && (
                    <text
                      className="guided-selection-label"
                      x={x - 35}
                      y={y - (isHead ? 55 : 35)}
                    >
                      {focus?.kind === "diff"
                        ? focus.targets.indexOf(c.id) === 0
                          ? "ENDPOINT A"
                          : "ENDPOINT B"
                        : focus?.kind === "range"
                          ? "IN RANGE"
                          : focus?.kind === "checkout"
                            ? "CHECKED OUT"
                            : "SELECTED"}
                    </text>
                  )}
                  {refs(c.id).map((r, i) =>
                    focus ? (
                      <g
                        key={`${r}:${r === state.branch}:${focus.refs.includes(r) ? replay : 0}`}
                        className="guided-ref"
                        data-reference={r}
                        data-active={r === state.branch}
                        data-emphasis={focus.refs.includes(r)}
                        transform={`translate(${x - 32},${y + 58 + i * 20})`}
                      >
                        <rect
                          rx="4"
                          width={Math.max(
                            75,
                            (r.length + (r === state.branch ? 7 : 0)) * 6.1 +
                              14,
                          )}
                          height="19"
                        />
                        <text x="7" y="13">
                          {r === state.branch ? `HEAD → ${r}` : r}
                        </text>
                      </g>
                    ) : (
                      <text
                        key={r}
                        x={x - 24}
                        y={y + 69 + i * 16}
                        className="ref-text"
                      >
                        {r}
                      </text>
                    ),
                  )}
                </g>
              );
            })}
          </g>
        </svg>
        {!commits.length && (
          <div className="graph-empty">
            <GitCommitHorizontal size={30} />
            <p>Your story starts with a commit.</p>
            <small>Stage a file, then run git commit.</small>
          </div>
        )}
      </div>
      {commit && (
        <div className="commit-inspector">
          <div className="panel-heading">
            <strong>
              {commit.id} · {commit.message}
            </strong>
            <button
              className="icon-button"
              aria-label="Close commit details"
              onClick={() => setSelected(null)}
            >
              <X size={16} />
            </button>
          </div>
          <p>
            {commit.author || "You"} · {commit.timestamp || "Teaching snapshot"}{" "}
            ·{" "}
            {local.has(commit.id) && remote.has(commit.id)
              ? "Local + remote"
              : local.has(commit.id)
                ? "Local only"
                : "Remote only"}
          </p>
          <p>
            Parents: {commit.parents.join(", ") || "Root"} ·{" "}
            {refs(commit.id).join(" · ") || "No named reference"}
          </p>
          <pre>
            {changedFiles(parent?.tree || {}, commit.tree)
              .map(
                (f) =>
                  `${f} ${!(f in commit.tree) ? "[deleted]" : !(f in (parent?.tree || {})) ? "[added]" : "[modified]"}\n− ${parent?.tree[f] ?? "∅"}\n+ ${commit.tree[f] ?? "∅"}`,
              )
              .join("\n\n") || "No file changes"}
          </pre>
        </div>
      )}
      <div className="graph-legend">
        <span className="legend-local">● Local only</span>
        <span className="legend-sync">● Synchronized</span>
        <span className="legend-remote">● Remote only</span>
        <span>Drag to pan · Ctrl + scroll to zoom · F to fit</span>
      </div>
    </>
  );
  return (
    <section className="history-pane" aria-label={label}>
      {!fullscreen && content}
      {fullscreen && (
        <div className="pane-empty">Graph is open fullscreen.</div>
      )}
      <dialog
        ref={dialog}
        className="graph-fullscreen"
        aria-label="Commit graph fullscreen"
        onCancel={(e) => {
          e.preventDefault();
          exitFullscreen();
        }}
      >
        {fullscreen && content}
      </dialog>
    </section>
  );
}
