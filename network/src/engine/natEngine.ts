import type { NatTranslation, Packet, Resource } from "./types";

export function createTranslation(
  gateway: Resource,
  publicIp: string,
  packet: Packet,
): NatTranslation {
  return {
    gatewayId: gateway.id,
    privateIp: packet.sourceIp,
    privatePort: packet.sourcePort,
    publicIp,
    publicPort: packet.protocol === "ICMP" ? 0 : 55000,
    destinationIp: packet.destinationIp,
    destinationPort: packet.destinationPort,
    protocol: packet.protocol,
  };
}
export function matchesReturn(binding: NatTranslation, packet: Packet) {
  return (
    packet.protocol === binding.protocol &&
    packet.sourceIp === binding.destinationIp &&
    packet.sourcePort === binding.destinationPort &&
    packet.destinationIp === binding.publicIp &&
    packet.destinationPort === binding.publicPort
  );
}
