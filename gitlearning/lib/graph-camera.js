export function fitCamera(viewport, bounds) {
  const zoom = Math.min(
    1.15,
    Math.max(1, viewport.width - 48) / bounds.width,
    Math.max(1, viewport.height - 48) / bounds.height,
  );
  return {
    zoom,
    x: (viewport.width - bounds.width * zoom) / 2,
    y: (viewport.height - bounds.height * zoom) / 2,
  };
}
export function zoomCamera(camera, nextZoom, point) {
  const zoom = Math.max(0.02, Math.min(3, nextZoom));
  const scale = zoom / camera.zoom;
  return {
    zoom,
    x: point.x - (point.x - camera.x) * scale,
    y: point.y - (point.y - camera.y) * scale,
  };
}

// Focus a relevant group, including room for labels above/below each commit.
export function focusCamera(viewport, points, ids, maxZoom = 1.25) {
  const selected = [...new Set(ids)].map((id) => points[id]).filter(Boolean);
  if (!selected.length || !viewport.width || !viewport.height) return null;
  const left = Math.min(...selected.map((point) => point.x)) - 70;
  const right = Math.max(...selected.map((point) => point.x)) + 145;
  const top = Math.min(...selected.map((point) => point.y)) - 62;
  const bottom = Math.max(
    ...selected.map((point) => point.y + (point.bottom || 86)),
  );
  const zoom = Math.max(
    0.02,
    Math.min(
      maxZoom,
      (viewport.width - 28) / (right - left),
      (viewport.height - 28) / (bottom - top),
    ),
  );
  return {
    zoom,
    x: viewport.width / 2 - ((left + right) / 2) * zoom,
    y: viewport.height / 2 - ((top + bottom) / 2) * zoom,
  };
}
