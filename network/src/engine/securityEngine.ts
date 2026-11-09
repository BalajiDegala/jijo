import { contains } from "./ipMathEngine";
import type { Direction, Packet, Rule } from "./types";

export function ruleMatches(
  rule: Rule,
  packet: Packet,
  direction: Direction,
  peerSecurityGroups: string[] = [],
): boolean {
  return (
    rule.direction === direction &&
    (rule.protocol === "ALL" || rule.protocol === packet.protocol) &&
    (rule.securityGroupId !== undefined
      ? peerSecurityGroups.includes(rule.securityGroupId)
      : contains(
          rule.cidr,
          direction === "inbound" ? packet.sourceIp : packet.destinationIp,
        )) &&
    (packet.protocol !== "ICMP" ||
      rule.protocol === "ALL" ||
      ((rule.icmpType === undefined ||
        rule.icmpType === -1 ||
        rule.icmpType === (packet.reply ? 0 : 8)) &&
        (rule.icmpCode === undefined ||
          rule.icmpCode === -1 ||
          rule.icmpCode === 0))) &&
    (packet.protocol === "ICMP" ||
      rule.protocol === "ALL" ||
      (packet.destinationPort >= rule.fromPort &&
        packet.destinationPort <= rule.toPort))
  );
}
export function evaluateRules(
  rules: Rule[],
  packet: Packet,
  direction: Direction,
  kind: "sg" | "nacl" | "firewall",
  established = false,
  peerSecurityGroups: string[] = [],
) {
  if (kind === "sg" && established)
    return {
      allowed: true,
      reason:
        "Established connection: the security group permits the tracked response.",
      matched: "Connection tracking",
    };
  const ordered =
    kind === "sg"
      ? rules.filter((r) => r.action === "allow")
      : [...rules].sort((a, b) => a.priority - b.priority);
  const rule = ordered.find((r) =>
    ruleMatches(r, packet, direction, kind === "sg" ? peerSecurityGroups : []),
  );
  return {
    allowed: rule?.action === "allow",
    reason: rule
      ? `${direction} ${kind.toUpperCase()} rule ${rule.priority}: ${rule.action} ${rule.protocol} ${rule.cidr}${packet.protocol === "ICMP" ? "" : `, destination port ${packet.destinationPort}`}.`
      : `No ${direction} ${kind.toUpperCase()} rule matches; implicit deny.`,
    matched: rule ? `Rule ${rule.priority}` : "Implicit deny",
  };
}
