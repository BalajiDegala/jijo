import { containerSizes } from "./deviceEngine";
import type { Resource } from "./types";

const gap = 30;
const headingSpace = 90;

function size(resource: Resource) {
  const defaults = containerSizes[resource.kind as keyof typeof containerSizes];
  return {
    width: resource.width ?? defaults?.width ?? 190,
    height: resource.height ?? defaults?.height ?? 220,
  };
}

function clearSiblings(resource: Resource, resources: Resource[]) {
  const bounds = size(resource);
  const siblings = resources.filter(
    (other) => other.id !== resource.id && other.parentId === resource.parentId,
  );
  // Move only the container being placed or grown; keep existing sibling layouts.
  let collision: Resource | undefined;
  while (
    (collision = siblings.find((other) => {
      const otherSize = size(other);
      return (
        resource.x < other.x + otherSize.width + gap &&
        resource.x + bounds.width + gap > other.x &&
        resource.y < other.y + otherSize.height + gap &&
        resource.y + bounds.height + gap > other.y
      );
    }))
  )
    resource.x = collision.x + size(collision).width + gap;
}

/** Place manual containers below their parent's heading, preserving nested content. */
export function placeContainer(
  resource: Resource,
  resources: Resource[],
  preferred?: { x: number; y: number },
) {
  const parent = resources.find((other) => other.id === resource.parentId);
  const bounds = size(resource);
  const children = resources.filter((other) => other.parentId === resource.id);
  resource.width = Math.max(
    bounds.width,
    ...children.map((child) => child.x + size(child).width + gap),
  );
  resource.height = Math.max(
    bounds.height,
    ...children.map((child) => child.y + size(child).height + gap),
  );
  resource.x = preferred?.x ?? (parent ? gap : resource.x);
  resource.y = preferred?.y ?? (parent ? headingSpace : resource.y);
  if (parent) {
    // A drop near an edge uses the full container size, rather than a device-card size.
    resource.x = Math.max(
      gap,
      Math.min(resource.x, size(parent).width - resource.width - gap),
    );
    resource.y = Math.max(
      headingSpace,
      Math.min(resource.y, size(parent).height - resource.height - gap),
    );
  }
  clearSiblings(resource, resources);

  let child = resource;
  const visited = new Set([child.id]);
  let outer = parent;
  while (outer && !visited.has(outer.id)) {
    visited.add(outer.id);
    const previous = size(outer);
    outer.width = Math.max(previous.width, child.x + size(child).width + gap);
    outer.height = Math.max(
      previous.height,
      child.y + size(child).height + gap,
    );
    if (outer.width !== previous.width || outer.height !== previous.height)
      clearSiblings(outer, resources);
    child = outer;
    outer = resources.find((other) => other.id === child.parentId);
  }
}
