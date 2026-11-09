import { simulateLocal, Trace } from "./packetEngine";
import { simulateAws } from "./awsEngine";
import { validateTopology } from "./topologyEngine";
import type { SendRequest, Topology } from "./types";

export function simulate(t: Topology, request: SendRequest) {
  const trace = new Trace(),
    issues = validateTopology(t);
  if (t.diagram === "three-tier") {
    trace.drop(
      request.sourceId,
      {
        sourceIp: "",
        destinationIp: request.destination,
        sourcePort: 49152,
        destinationPort: request.port,
        protocol: request.protocol,
        reply: false,
      },
      "This editable architecture graph describes service relationships. Load the basic public/private template for packet simulation; ALB requests and RDS failover are not simulated here.",
    );
    return trace.result;
  }
  if (issues.length) {
    trace.drop(
      issues[0].resourceId,
      {
        sourceIp: t.resources.find((r) => r.id === request.sourceId)?.ip ?? "",
        destinationIp: request.destination,
        sourcePort: 49152,
        destinationPort: request.port,
        protocol: request.protocol,
        reply: false,
      },
      `Configuration error: ${issues[0].message}`,
    );
    return trace.result;
  }
  if (
    request.protocol !== "ICMP" &&
    (!Number.isInteger(request.port) ||
      request.port < 1 ||
      request.port > 65535)
  ) {
    trace.drop(
      request.sourceId,
      {
        sourceIp: "",
        destinationIp: request.destination,
        sourcePort: 49152,
        destinationPort: request.port,
        protocol: request.protocol,
        reply: false,
      },
      "Destination port must be between 1 and 65535.",
    );
    return trace.result;
  }
  return t.mode === "aws"
    ? simulateAws(t, request, trace)
    : simulateLocal(t, request, trace);
}
