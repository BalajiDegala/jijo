import { Trace } from "./packetEngine";
import { contains, ipToNumber, parseCidr } from "./ipMathEngine";
import { longestPrefixMatch } from "./routingEngine";
import { evaluateRules } from "./securityEngine";
import { createTranslation, matchesReturn } from "./natEngine";
import type {
  Direction,
  NatTranslation,
  Packet,
  Resource,
  Route,
  SendRequest,
  SimulationResult,
  Topology,
} from "./types";

export function effectiveRoutes(t: Topology, table: Resource): Route[] {
  const vpc = t.resources.find((r) => r.id === table.vpcId && r.kind === "vpc");
  const routes = [...(table.routes ?? [])];
  if (
    vpc?.cidr &&
    !routes.some(
      (r) =>
        parseCidr(r.destination).canonical === parseCidr(vpc.cidr!).canonical,
    )
  )
    routes.unshift({
      id: `local-${vpc.id}`,
      destination: parseCidr(vpc.cidr).canonical,
      target: "local",
      enabled: true,
    });
  return routes;
}
export function subnetExposure(
  t: Topology,
  subnet: Resource,
): "public" | "private" | "isolated" {
  const table = t.resources.find((r) => r.id === subnet.routeTableId);
  if (!table) return "isolated";
  const targets = (table.routes ?? [])
    .filter((r) => r.enabled)
    .map((r) => t.resources.find((x) => x.id === r.target));
  return targets.some((r) => r?.kind === "igw" && r.vpcId === subnet.vpcId)
    ? "public"
    : targets.some((r) => r?.kind === "nat")
      ? "private"
      : "isolated";
}
interface Context {
  subnet: Resource;
  vpc: Resource;
  table: Resource;
}
interface Egress {
  context: Context;
  gateway: Resource;
  nat?: Resource;
  natContext?: Context;
  translation?: NatTranslation;
  publicPacket: Packet;
}
export function simulateAws(
  t: Topology,
  request: SendRequest,
  trace = new Trace(),
): SimulationResult {
  const find = (id?: string) => t.resources.find((r) => r.id === id);
  const source = find(request.sourceId);
  const byId = find(request.destination);
  const rawIp = t.dns[request.destination] ?? request.destination;
  // Internet clients must address an instance's public IP, not its private IP.
  const destIp = byId
    ? source?.kind === "internet"
      ? (byId.publicIp ?? byId.ip ?? "")
      : (byId.ip ?? byId.publicIp ?? "")
    : rawIp;
  const destination =
    byId ??
    t.resources.find(
      (r) =>
        ["ec2", "internet", "nat", "eip"].includes(r.kind) &&
        (r.ip === destIp || r.publicIp === destIp),
    );
  const packet: Packet = {
    sourceIp: source?.ip ?? "",
    destinationIp: destIp,
    sourcePort: request.protocol === "ICMP" ? 0 : 49152,
    destinationPort: request.protocol === "ICMP" ? 0 : request.port,
    protocol: request.protocol,
    reply: false,
  };
  const fail = (r: Resource | string, message: string, p = packet) =>
    trace.drop(r, p, message);
  const hop = (from: Resource, to: Resource, p: Packet) =>
    trace.emit(
      "forward",
      from,
      p,
      `${p.reply ? "Response" : "Request"} forwarded from ${from.name} to ${to.name}.`,
      to.id,
    );
  const context = (r: Resource, p: Packet): Context | undefined => {
    const subnet = find(r.subnetId),
      vpc = find(subnet?.vpcId),
      table = find(subnet?.routeTableId);
    if (
      !subnet?.enabled ||
      subnet.kind !== "subnet" ||
      !vpc?.enabled ||
      vpc.kind !== "vpc"
    ) {
      fail(r, "Resource needs an active subnet and parent VPC.", p);
      return;
    }
    if (
      !table?.enabled ||
      table.kind !== "routeTable" ||
      table.vpcId !== vpc.id
    ) {
      fail(
        r,
        "Subnet needs an active route table associated with the same VPC.",
        p,
      );
      return;
    }
    return { subnet, vpc, table };
  };
  const security = (
    r: Resource,
    p: Packet,
    direction: Direction,
    established: boolean,
  ): boolean => {
    const sg = find(r.sgId),
      subnet = find(r.subnetId);
    if (!sg?.enabled || sg.kind !== "sg" || sg.vpcId !== subnet?.vpcId)
      return fail(r, "Assign an active security group in the same VPC.", p);
    const result = evaluateRules(
      sg.rules ?? [],
      p,
      direction,
      "sg",
      established,
    );
    if (!result.allowed) return fail(r, `${sg.name}: ${result.reason}`, p);
    trace.emit(
      "security",
      r,
      p,
      `${sg.name}: ${result.reason}`,
      undefined,
      result.matched,
    );
    return true;
  };
  const acl = (ctx: Context, p: Packet, direction: Direction): boolean => {
    if (!ctx.subnet.naclId) {
      trace.emit(
        "security",
        ctx.table,
        p,
        "Default network ACL: allow all traffic.",
        undefined,
        "Default ACL",
      );
      return true;
    }
    const nacl = find(ctx.subnet.naclId);
    if (!nacl?.enabled || nacl.kind !== "nacl" || nacl.vpcId !== ctx.vpc.id)
      return fail(ctx.table, "Subnet needs an active NACL in the same VPC.", p);
    const result = evaluateRules(nacl.rules ?? [], p, direction, "nacl");
    if (!result.allowed)
      return fail(
        ctx.table,
        `${nacl.name}: ${result.reason}${p.reply && p.protocol !== "ICMP" ? " Return traffic needs destination ephemeral port " + p.destinationPort + "." : ""}`,
        p,
      );
    trace.emit(
      "security",
      ctx.table,
      p,
      `${nacl.name}: ${result.reason}`,
      undefined,
      result.matched,
    );
    return true;
  };
  const route = (ctx: Context, p: Packet): Route | undefined => {
    const routes = effectiveRoutes(t, ctx.table),
      matches = routes.filter((r) => contains(r.destination, p.destinationIp));
    const selected = longestPrefixMatch(routes, p.destinationIp);
    if (!selected) {
      fail(
        ctx.table,
        `No route matches ${p.destinationIp}. Add a route to the appropriate gateway.`,
        p,
      );
      return;
    }
    trace.emit(
      "route",
      ctx.table,
      p,
      `${matches.length} matching route${matches.length === 1 ? "" : "s"}. Longest-prefix match: ${selected.destination} → ${find(selected.target)?.name ?? selected.target}.`,
      undefined,
      selected.id,
    );
    if (!selected.enabled) {
      fail(
        ctx.table,
        `Route ${selected.destination} is a blackhole (disabled).`,
        p,
      );
      return;
    }
    return selected;
  };
  const checkGateway = (
    gateway: Resource | undefined,
    ctx: Context,
    p: Packet,
  ): gateway is Resource => {
    if (
      !gateway?.enabled ||
      gateway.kind !== "igw" ||
      gateway.vpcId !== ctx.vpc.id
    ) {
      fail(
        ctx.table,
        "Internet gateway is missing, offline, or attached to another VPC.",
        p,
      );
      return false;
    }
    return true;
  };
  const outbound = (
    instance: Resource,
    internet: Resource,
    p: Packet,
    established = false,
    allowNat = true,
  ): Egress | undefined => {
    const ctx = context(instance, p);
    if (!ctx) return;
    if (!security(instance, p, "outbound", established)) return;
    hop(instance, ctx.table, p);
    const selected = route(ctx, p);
    if (!selected) return;
    const target = find(selected.target);
    if (target?.kind === "igw") {
      if (!acl(ctx, p, "outbound")) return;
      if (!checkGateway(target, ctx, p)) return;
      if (!instance.publicIp) {
        fail(
          instance,
          "An internet-gateway route requires a public IPv4 address on this instance.",
          p,
        );
        return;
      }
      hop(ctx.table, target, p);
      const translated = { ...p, sourceIp: instance.publicIp };
      trace.emit(
        "nat",
        target,
        translated,
        `Internet gateway maps ${p.sourceIp} to public IPv4 ${instance.publicIp} (one-to-one mapping).`,
      );
      hop(target, internet, translated);
      return { context: ctx, gateway: target, publicPacket: translated };
    }
    if (target?.kind === "nat") {
      if (!allowNat) {
        fail(
          ctx.table,
          "An inbound public connection must return through its internet gateway; a NAT route would create an asymmetric response.",
          p,
        );
        return;
      }
      if (!target.enabled) {
        fail(ctx.table, "NAT gateway is offline.", p);
        return;
      }
      const natCtx = context(target, p);
      if (!natCtx) return;
      if (natCtx.vpc.id !== ctx.vpc.id) {
        fail(target, "NAT gateway must be in the same VPC in this lab.", p);
        return;
      }
      if (ctx.subnet.id !== natCtx.subnet.id && !acl(ctx, p, "outbound"))
        return;
      const eip = find(target.eipId);
      if (!eip?.enabled || eip.kind !== "eip" || !eip.publicIp) {
        fail(target, "Public NAT gateway requires an active Elastic IP.", p);
        return;
      }
      hop(ctx.table, target, p);
      if (ctx.subnet.id !== natCtx.subnet.id && !acl(natCtx, p, "inbound"))
        return;
      const binding = createTranslation(target, eip.publicIp, p);
      const privateNatPacket = {
        ...p,
        sourceIp: target.ip!,
        sourcePort: binding.publicPort,
      };
      trace.emit(
        "nat",
        target,
        privateNatPacket,
        `NAT maps ${p.sourceIp}:${p.sourcePort} → ${target.ip}:${binding.publicPort}. Internet gateway will map the NAT IP to ${eip.publicIp}.`,
      );
      if (!acl(natCtx, privateNatPacket, "outbound")) return;
      const natRoute = route(natCtx, privateNatPacket);
      if (!natRoute) return;
      const gateway = find(natRoute.target);
      if (!checkGateway(gateway, natCtx, privateNatPacket)) return;
      trace.result.translations.push(binding);
      hop(target, gateway, privateNatPacket);
      const publicPacket = { ...privateNatPacket, sourceIp: eip.publicIp };
      trace.emit(
        "nat",
        gateway,
        publicPacket,
        `Internet gateway maps NAT private IP ${target.ip} to Elastic IP ${eip.publicIp}.`,
      );
      hop(gateway, internet, publicPacket);
      return {
        context: ctx,
        gateway,
        nat: target,
        natContext: natCtx,
        translation: binding,
        publicPacket,
      };
    }
    fail(
      ctx.table,
      selected.target === "local"
        ? "The local VPC route cannot reach the internet. Add a gateway route."
        : "Route target is missing or unsupported.",
      p,
    );
  };
  const internal = (
    from: Resource,
    to: Resource,
    p: Packet,
    established: boolean,
  ): boolean => {
    const a = context(from, p),
      b = context(to, p);
    if (!a || !b) return false;
    if (a.vpc.id !== b.vpc.id)
      return fail(
        from,
        "These instances are in different VPCs. VPC peering is outside this lab.",
        p,
      );
    if (!security(from, p, "outbound", established)) return false;
    const crossing = a.subnet.id !== b.subnet.id;
    if (crossing && !acl(a, p, "outbound")) return false;
    hop(from, a.table, p);
    const selected = route(a, p);
    if (!selected) return false;
    if (selected.target !== "local")
      return fail(
        a.table,
        "VPC instance traffic must use a local route in this lab. A more-specific route diverted this packet.",
        p,
      );
    if (crossing && !acl(b, p, "inbound")) return false;
    if (!security(to, p, "inbound", established)) return false;
    hop(a.table, to, p);
    return true;
  };
  const received = (r: Resource, p: Packet) =>
    trace.emit(
      "receive",
      r,
      p,
      `${r.name} received the ${p.reply ? "response" : "request"}.`,
    );
  const service = (r: Resource, p: Packet) =>
    p.protocol === "ICMP" ||
    r.services?.includes(p.destinationPort) ||
    fail(
      r,
      `Connection refused: no ${p.protocol} service on port ${p.destinationPort}.`,
      p,
    );
  const reply = (p: Packet): Packet => ({
    ...p,
    sourceIp: p.destinationIp,
    destinationIp: p.sourceIp,
    sourcePort: p.destinationPort,
    destinationPort: p.sourcePort,
    reply: true,
  });
  if (!source?.enabled || !source.ip) {
    fail(
      source ?? request.sourceId,
      "Select an active source endpoint with an IP.",
    );
    return trace.result;
  }
  trace.emit(
    "send",
    source,
    packet,
    `Send ${packet.protocol} from ${packet.sourceIp} to ${packet.destinationIp}.`,
  );
  try {
    ipToNumber(destIp);
  } catch {
    fail(
      source,
      "Destination must be a known device, project DNS record, or valid IPv4 address.",
    );
    return trace.result;
  }
  if (!destination?.enabled) {
    fail(
      source,
      "Destination is unavailable or not present in this simulated network.",
    );
    return trace.result;
  }
  if (source.kind === "ec2" && destination.kind === "ec2") {
    if (packet.destinationIp !== destination.ip) {
      fail(
        source,
        "Use private addresses for local VPC communication in this lab.",
      );
      return trace.result;
    }
    if (!internal(source, destination, packet, false)) return trace.result;
    received(destination, packet);
    if (!service(destination, packet)) return trace.result;
    const response = reply(packet);
    trace.emit(
      "reply",
      destination,
      response,
      "Validate the return route; security groups recognize the established flow.",
    );
    if (!internal(destination, source, response, true)) return trace.result;
    received(source, response);
  } else if (source.kind === "ec2" && destination.kind === "internet") {
    const path = outbound(source, destination, packet);
    if (!path) return trace.result;
    received(destination, path.publicPacket);
    if (!service(destination, path.publicPacket)) return trace.result;
    let response = reply(path.publicPacket);
    trace.emit(
      "reply",
      destination,
      response,
      "The internet endpoint responds to the translated source address.",
    );
    hop(destination, path.gateway, response);
    if (path.nat && path.translation && path.natContext) {
      if (!matchesReturn(path.translation, response)) {
        fail(
          path.gateway,
          "No NAT connection mapping for this response.",
          response,
        );
        return trace.result;
      }
      response = { ...response, destinationIp: path.nat.ip! };
      trace.emit(
        "nat",
        path.gateway,
        response,
        "Internet gateway translates the Elastic IP back to the NAT gateway private address.",
      );
      if (!acl(path.natContext, response, "inbound")) return trace.result;
      hop(path.gateway, path.nat, response);
      response = {
        ...response,
        destinationIp: source.ip,
        destinationPort: path.translation.privatePort,
      };
      trace.emit(
        "nat",
        path.nat,
        response,
        `Matched connection: restore destination ${source.ip}:${response.destinationPort}.`,
      );
      const reverse = route(path.natContext, response);
      if (!reverse || reverse.target !== "local") {
        if (reverse)
          fail(
            path.nat,
            "NAT return traffic needs the local VPC route.",
            response,
          );
        return trace.result;
      }
      if (
        path.context.subnet.id !== path.natContext.subnet.id &&
        !acl(path.natContext, response, "outbound")
      )
        return trace.result;
      if (
        path.context.subnet.id !== path.natContext.subnet.id &&
        !acl(path.context, response, "inbound")
      )
        return trace.result;
      if (!security(source, response, "inbound", true)) return trace.result;
      hop(path.nat, source, response);
    } else {
      response = { ...response, destinationIp: source.ip };
      trace.emit(
        "nat",
        path.gateway,
        response,
        `Reverse public IPv4 mapping restores destination ${source.ip}.`,
      );
      if (
        !acl(path.context, response, "inbound") ||
        !security(source, response, "inbound", true)
      )
        return trace.result;
      hop(path.gateway, source, response);
    }
    received(source, response);
  } else if (source.kind === "internet") {
    if (["nat", "eip"].includes(destination.kind)) {
      fail(
        destination,
        "Unsolicited inbound connections are rejected: public NAT has no established translation for this flow.",
      );
      return trace.result;
    }
    if (
      destination.kind !== "ec2" ||
      !destination.publicIp ||
      destIp !== destination.publicIp
    ) {
      fail(
        source,
        "The internet cannot reach a private IPv4 address. Use an instance public IPv4 address; NAT does not allow unsolicited inbound connections.",
      );
      return trace.result;
    }
    const ctx = context(destination, packet);
    if (!ctx) return trace.result;
    const gateway = t.resources.find(
      (r) => r.kind === "igw" && r.vpcId === ctx.vpc.id && r.enabled,
    );
    if (!checkGateway(gateway, ctx, packet)) return trace.result;
    hop(source, gateway, packet);
    const incoming = { ...packet, destinationIp: destination.ip! };
    trace.emit(
      "nat",
      gateway,
      incoming,
      `Internet gateway maps ${destination.publicIp} to private address ${destination.ip}.`,
    );
    if (
      !acl(ctx, incoming, "inbound") ||
      !security(destination, incoming, "inbound", false)
    )
      return trace.result;
    hop(gateway, destination, incoming);
    received(destination, incoming);
    if (!service(destination, incoming)) return trace.result;
    const response = reply(incoming);
    trace.emit(
      "reply",
      destination,
      response,
      "Check the reverse route and stateless NACL rules. The security group tracks this response.",
    );
    const path = outbound(destination, source, response, true, false);
    if (!path) return trace.result;
    received(source, path.publicPacket);
  } else {
    fail(
      source,
      "Choose an EC2 instance or internet endpoint for this VPC experiment.",
    );
    return trace.result;
  }
  trace.result.success = true;
  trace.result.reason = "Request delivered and response returned successfully.";
  const last = trace.result.events.at(-1)!;
  trace.emit("delivered", source, last.packet, trace.result.reason);
  return trace.result;
}
