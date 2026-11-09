import type { EventType, TraceEvent } from "./types";

const explanations: Record<
  EventType,
  { title: string; meaning: string; next: string }
> = {
  send: {
    title: "Starting the request",
    meaning:
      "The sender prepares a packet addressed to the destination. The next decisions determine whether it can leave and where it goes.",
    next: "Step forward to see the first route or security check.",
  },
  arp: {
    title: "Finding the next device nearby",
    meaning:
      "ARP finds the Ethernet address of a reachable local device, such as the destination or the next router.",
    next: "Look at which IP address was resolved, then follow the next connection.",
  },
  switch: {
    title: "The switch learns and forwards",
    meaning:
      "A switch learns where a source hardware address is connected and uses its forwarding information to deliver frames locally.",
    next: "Inspect the switch to see its learned MAC addresses.",
  },
  route: {
    title: "Choosing the next direction",
    meaning:
      "The destination IP is compared with route ranges. The most specific matching range takes priority over broader matches.",
    next: "Compare the selected range with the destination IP. A /0 route is the fallback.",
  },
  security: {
    title: "Checking whether traffic is allowed",
    meaning:
      "This security boundary checks the packet's addresses, direction, protocol, and, where applicable, service port. The diagnostic records the actual decision.",
    next: "Check the matched rule and whether this is the request or its reply.",
  },
  nat: {
    title: "Translating an address",
    meaning:
      "This step changes an address or port so the packet can use the configured path. A matching reverse translation directs replies back.",
    next: "Compare the packet's addresses with the previous step, or open NAT table.",
  },
  forward: {
    title: "Moving to the next device",
    meaning:
      "The packet is passed to the next resource shown in the trace. Later routing or security checks can still stop it.",
    next: "Follow the highlighted connection and read the next decision.",
  },
  receive: {
    title: "The destination receives data",
    meaning:
      "The request or response has reached this endpoint. A received request may still need a service to accept it and a working path for its reply.",
    next: "Continue to see whether a response is generated and reaches the sender.",
  },
  reply: {
    title: "Sending the response back",
    meaning:
      "The receiver becomes the sender of the reply. The return path is checked too, including any translation and security rules.",
    next: "Watch the source and destination addresses swap and follow the return journey.",
  },
  drop: {
    title: "The packet stopped here",
    meaning:
      "The experiment could not continue through this decision. Read the diagnostic below, inspect the affected device, and change one setting before testing again.",
    next: "Inspect this device's addresses, routes, connections, or rules as indicated by the diagnostic. Undo can reverse an edit.",
  },
  delivered: {
    title: "The exchange is complete",
    meaning:
      "The request reached its destination and the response returned successfully in this experiment.",
    next: "Try changing one connection or setting, predict the result, then send again.",
  },
};
export function explainTraceEvent(event: TraceEvent) {
  return {
    ...explanations[event.type],
    direction: event.packet.reply ? "Reply" : "Request",
  };
}
