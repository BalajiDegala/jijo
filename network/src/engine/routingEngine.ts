import { contains, parseCidr } from "./ipMathEngine";
import type { Resource, Route } from "./types";

export function longestPrefixMatch(
  routes: Route[],
  ip: string,
): Route | undefined {
  // A disabled more-specific route is a blackhole, not an invitation to use a less-specific route.
  return routes
    .filter((r) => contains(r.destination, ip))
    .sort(
      (a, b) =>
        parseCidr(b.destination).prefix - parseCidr(a.destination).prefix,
    )[0];
}
export function localRoutes(resource: Resource): Route[] {
  const interfaces =
    resource.interfaces ??
    (resource.ip
      ? [{ id: "eth0", ip: resource.ip, prefix: resource.prefix ?? 24 }]
      : []);
  return [
    ...interfaces.map((i) => ({
      id: `connected-${i.id}`,
      destination: parseCidr(`${i.ip}/${i.prefix}`).canonical,
      target: "connected",
      enabled: true,
    })),
    ...(resource.routes ?? []),
    ...(resource.gateway
      ? [
          {
            id: "default",
            destination: "0.0.0.0/0",
            target: resource.gateway,
            enabled: true,
          },
        ]
      : []),
  ];
}
