"use client";

export function FocusEdges({
  focus,
  beat,
  points,
  marker,
  replay,
  paused,
  speed = 1,
}) {
  if (!focus) return null;
  const active = focus.beats[beat],
    edges = active?.edges || focus.edges;
  const old = points[focus.previous?.id],
    current = points[focus.actualHead];
  const path = (from, to) =>
    `M${from.x},${from.y} C${from.x - 80},${from.y} ${to.x + 80},${to.y} ${to.x},${to.y}`;
  const moved = (focus.changes || []).filter(
    ([, old, next]) => old && next && old !== next,
  );
  return (
    <g
      className="guided-overlays"
      data-paused={paused}
      data-animate={beat >= 0}
      style={{ "--focus-duration": `${650 / speed}ms` }}
    >
      {edges.map((edge) => {
        const from = points[edge.from],
          to = points[edge.to];
        if (!from || !to) return null;
        return (
          <g key={`${edge.from}:${edge.to}:${replay}`}>
            <path
              className="guided-parent-edge"
              data-from={edge.from}
              data-to={edge.to}
              data-parent={edge.parent}
              d={path(from, to)}
              fill="none"
              stroke="#81d9ff"
              strokeWidth="4"
              pathLength="1"
              markerEnd={`url(#${marker})`}
            />
            {edge.hop && (
              <g
                className="guided-hop"
                transform={`translate(${(from.x + to.x) / 2},${(from.y + to.y) / 2 - 12})`}
              >
                <circle r="13" />
                <text textAnchor="middle" dy="4">
                  {edge.hop}
                </text>
              </g>
            )}
          </g>
        );
      })}
      {(focus.parentChoices || [])
        .filter(() => focus.kind === "revision")
        .map((edge) => {
          const from = points[edge.from],
            to = points[edge.to];
          if (!from || !to) return null;
          const x = from.x * 0.83 + to.x * 0.17,
            y = from.y * 0.83 + to.y * 0.17;
          return (
            <g
              className="guided-parent-label"
              key={`${edge.from}:${edge.to}`}
              transform={`translate(${x},${y + (to.y < from.y ? -34 : 24)})`}
            >
              <rect x="-33" y="-11" width="66" height="21" rx="5" />
              <text textAnchor="middle" dy="3">
                parent {edge.parent}
              </text>
            </g>
          );
        })}
      {focus.kind === "checkout" &&
        old &&
        current &&
        focus.previous.id !== focus.actualHead &&
        beat >= 0 && (
          <g className="guided-previous">
            <circle
              cx={old.x}
              cy={old.y}
              r="23"
              fill="none"
              stroke="#aab8cf"
              strokeDasharray="4 4"
            />
            <text x={old.x - 47} y={old.y - 36}>
              PREVIOUS CHECKOUT
            </text>
            <path
              d={`M${old.x},${old.y - 20} Q${(old.x + current.x) / 2},${Math.min(old.y, current.y) - 85} ${current.x},${current.y - 22}`}
              fill="none"
              stroke="#c4a6ff"
              strokeWidth="2"
              strokeDasharray="5 4"
              markerEnd={`url(#${marker})`}
            />
          </g>
        )}
      {(focus.changes || [])
        .filter(([, , next]) => !next)
        .map(
          ([name, id]) =>
            points[id] && (
              <text
                key={name}
                x={points[id].x - 38}
                y={points[id].y - 48}
                className="guided-removed"
              >
                removed: {name}
              </text>
            ),
        )}
      {beat >= 0 &&
        moved.map(([name, old, next], index) => {
          const from = points[old],
            to = points[next];
          if (!from || !to) return null;
          return (
            <g className="guided-previous" key={name}>
              <text x={from.x - 28} y={from.y - 58 - index * 14}>
                previous {name}
              </text>
              <path
                d={`M${from.x},${from.y - 28} Q${(from.x + to.x) / 2},${Math.min(from.y, to.y) - 70} ${to.x},${to.y - 26}`}
                fill="none"
                stroke="#c4a6ff"
                strokeWidth="2"
                strokeDasharray="5 4"
                markerEnd={`url(#${marker})`}
              />
            </g>
          );
        })}
    </g>
  );
}
