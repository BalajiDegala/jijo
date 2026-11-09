import { layer2Path } from "./arpEngine";
import { interfacesOf, resourceByIp } from "./deviceEngine";
import { contains, ipToNumber, isAssignable } from "./ipMathEngine";
import { localRoutes, longestPrefixMatch } from "./routingEngine";
import { evaluateRules } from "./securityEngine";
import type {
  Packet,
  Resource,
  SendRequest,
  SimulationResult,
  Topology,
  TraceEvent,
} from "./types";

export class Trace {
  result: SimulationResult = {
    success: false,
    reason: "",
    events: [],
    translations: [],
    macTables: {},
  };
  emit(
    type: TraceEvent["type"],
    r: Resource | string,
    packet: Packet,
    explanation: string,
    nextResourceId?: string,
    matched?: string,
  ) {
    this.result.events.push({
      id: this.result.events.length,
      type,
      resourceId: typeof r === "string" ? r : r.id,
      nextResourceId,
      packet: { ...packet },
      decision:
        type === "drop"
          ? "deny"
          : ["security", "delivered"].includes(type)
            ? "allow"
            : "info",
      explanation,
      matched,
    });
  }
  drop(r: Resource | string, packet: Packet, reason: string) {
    this.emit("drop", r, packet, reason);
    this.result.reason = reason;
    return false;
  }
}
function forwardLocal(
  t: Topology,
  start: Resource,
  end: Resource,
  packet: Packet,
  trace: Trace,
): boolean {
  let current = start;
  const visited = new Set<string>();
  while (current.id !== end.id) {
    if (visited.has(current.id))
      return trace.drop(
        current,
        packet,
        "Routing loop detected. Check next-hop addresses and static routes.",
      );
    visited.add(current.id);
    if (!current.enabled)
      return trace.drop(current, packet, `${current.name} is offline.`);
    if (current.id !== start.id && !current.forwarding)
      return trace.drop(
        current,
        packet,
        "IP forwarding is disabled on this router.",
      );
    if (current.kind === "firewall") {
      for (const direction of ["inbound", "outbound"] as const) {
        const check = evaluateRules(
          current.rules ?? [],
          packet,
          direction,
          "firewall",
        );
        if (!check.allowed) return trace.drop(current, packet, check.reason);
        trace.emit(
          "security",
          current,
          packet,
          check.reason,
          undefined,
          check.matched,
        );
      }
    }
    let routes;
    try {
      routes = localRoutes(current);
    } catch {
      return trace.drop(
        current,
        packet,
        "Invalid interface IP address or prefix.",
      );
    }
    const route = longestPrefixMatch(routes, packet.destinationIp);
    if (!route)
      return trace.drop(
        current,
        packet,
        "Destination is outside connected networks. Configure a reachable default gateway or static route.",
      );
    if (!route.enabled)
      return trace.drop(
        current,
        packet,
        `Route ${route.destination} is a blackhole (disabled).`,
      );
    const nextIp =
      route.target === "connected" ? packet.destinationIp : route.target;
    trace.emit(
      "route",
      current,
      packet,
      `Longest-prefix match: ${route.destination} → ${route.target}.`,
      undefined,
      route.id,
    );
    if (
      !interfacesOf(current).some((i) =>
        contains(`${i.ip}/${i.prefix}`, nextIp),
      )
    )
      return trace.drop(
        current,
        packet,
        `Next hop ${nextIp} is not on a connected subnet. Correct the gateway.`,
      );
    const next = resourceByIp(t, nextIp);
    if (!next || !next.enabled)
      return trace.drop(
        current,
        packet,
        `ARP unanswered: ${current.name} tried to reach ${nextIp}, but no active device answered. Check that this is the address of a reachable destination or gateway, and check its cables.`,
      );
    const path = layer2Path(t, current.id, next.id);
    if (!path)
      return trace.drop(
        current,
        packet,
        `ARP cannot reach ${nextIp}. Connect these devices directly or through switches so they share a local Ethernet path (Layer 2).`,
      );
    trace.emit(
      "arp",
      current,
      packet,
      `ARP: who has ${nextIp}? ${next.name} replies ${next.mac ?? "with its interface MAC"}.`,
      next.id,
    );
    for (let i = 1; i < path.length; i++) {
      const prev = t.resources.find((r) => r.id === path[i - 1])!;
      const target = t.resources.find((r) => r.id === path[i])!;
      trace.emit(
        "forward",
        prev,
        packet,
        `Ethernet frame forwarded from ${prev.name} to ${target.name}.`,
        target.id,
      );
      if (target.kind === "switch") {
        trace.result.macTables[target.id] ??= {};
        trace.result.macTables[target.id][current.mac ?? current.id] = prev.id;
        trace.emit(
          "switch",
          target,
          packet,
          `Learns ${current.mac ?? current.name} on the port toward ${prev.name}; forwards within the broadcast domain.`,
        );
      }
    }
    if (next.id !== end.id && !["router", "firewall"].includes(next.kind))
      return trace.drop(
        next,
        packet,
        "The next-hop device is not a router and cannot forward this packet.",
      );
    current = next;
  }
  trace.emit(
    "receive",
    end,
    packet,
    `${end.name} received the ${packet.reply ? "response" : "request"}.`,
  );
  return true;
}
export function simulateLocal(
  t: Topology,
  request: SendRequest,
  trace = new Trace(),
): SimulationResult {
  const source = t.resources.find((r) => r.id === request.sourceId);
  const destinationIp =
    t.dns[request.destination] ??
    resourceByIp(t, request.destination)?.ip ??
    t.resources.find((r) => r.id === request.destination)?.ip ??
    request.destination;
  const end = resourceByIp(t, destinationIp);
  const packet: Packet = {
    sourceIp: source?.ip ?? "",
    destinationIp,
    sourcePort: request.protocol === "ICMP" ? 0 : 49152,
    destinationPort: request.protocol === "ICMP" ? 0 : request.port,
    protocol: request.protocol,
    reply: false,
  };
  if (!source?.ip) {
    trace.drop(
      request.sourceId,
      packet,
      "Select a source device with an IPv4 address.",
    );
    return trace.result;
  }
  trace.emit(
    "send",
    source,
    packet,
    `Send ${request.protocol} from ${source.ip} to ${destinationIp}.`,
  );
  try {
    ipToNumber(destinationIp);
    for (const r of [source, end].filter(Boolean) as Resource[]) {
      if (!r.enabled) throw new Error(`${r.name} is offline.`);
      if (!isAssignable(r.ip!, `${r.ip}/${r.prefix ?? 24}`))
        throw new Error(
          `${r.name} uses a reserved network or broadcast address.`,
        );
    }
  } catch (e) {
    trace.drop(source, packet, (e as Error).message);
    return trace.result;
  }
  if (!end) {
    trace.drop(
      source,
      packet,
      "Destination is not present in this simulated network.",
    );
    return trace.result;
  }
  if (!forwardLocal(t, source, end, packet, trace)) return trace.result;
  if (request.protocol !== "ICMP" && !end.services?.includes(request.port)) {
    trace.drop(
      end,
      packet,
      `Connection refused: ${end.name} has no simulated service on port ${request.port}.`,
    );
    return trace.result;
  }
  const reply: Packet = {
    ...packet,
    sourceIp: destinationIp,
    destinationIp: source.ip,
    sourcePort: packet.destinationPort,
    destinationPort: packet.sourcePort,
    reply: true,
  };
  trace.emit(
    "reply",
    end,
    reply,
    "Generate the response; validate the reverse route independently.",
  );
  if (!forwardLocal(t, end, source, reply, trace)) return trace.result;
  trace.result.success = true;
  trace.result.reason = "Request delivered and response returned successfully.";
  trace.emit("delivered", source, reply, trace.result.reason);
  return trace.result;
}
