import { awsTemplate, localTemplate } from "../data/templates";
import { simulate } from "./simulationEngine";
import type { SendRequest, Topology } from "./types";

export interface Challenge {
  id: number;
  title: string;
  description: string;
  objective: string;
  hints: string[];
  explanation: string;
  request: SendRequest;
  create: () => Topology;
  difficulty: string;
  minutes: number;
}
export const challenges: Challenge[] = [
  {
    id: 1,
    title: "So close, yet so far",
    description: "Two hosts share a switch, but their packets never arrive.",
    objective:
      "Connect 192.168.1.10 and 192.168.2.10 using a router with interfaces in both networks.",
    hints: [
      "Compare the two IP addresses and /24 prefixes. A switch cannot route between subnets.",
      "Add a router from the library. Its default interfaces are 192.168.1.1/24 and 192.168.2.1/24. Connect its handle to the switch.",
      "Set Workstation’s gateway to 192.168.1.1 and Linux server’s gateway to 192.168.2.1. Keep forwarding enabled.",
    ],
    explanation:
      "The switch resolves local MAC addresses. Each host sends remote traffic to its gateway, and the router forwards it using connected routes. Both hosts need a return path.",
    request: { sourceId: "pc1", destination: "pc2", protocol: "ICMP", port: 0 },
    difficulty: "Beginner",
    minutes: 5,
    create: () => {
      const t = localTemplate();
      t.name = "Challenge 01 · Different neighborhoods";
      t.resources[2].ip = "192.168.2.10";
      t.dns["server.netverse"] = "192.168.2.10";
      return t;
    },
  },
  {
    id: 2,
    title: "The gateway to nowhere",
    description:
      "The router is ready. One host is asking the wrong neighbor for directions.",
    objective:
      "Restore round-trip connectivity between the workstation and the Linux server.",
    hints: [
      "Send a packet and inspect the first dropped event.",
      "The workstation’s default gateway should belong to a router interface on its own subnet.",
      "Change Workstation’s gateway from 192.168.1.254 to 192.168.1.1.",
    ],
    explanation:
      "A default gateway must be reachable on a connected subnet and must actually belong to a forwarding device. ARP cannot resolve a nonexistent gateway.",
    request: { sourceId: "pc1", destination: "pc2", protocol: "ICMP", port: 0 },
    difficulty: "Beginner",
    minutes: 3,
    create: () => {
      const t = localTemplate(true);
      t.name = "Challenge 02 · A wrong turn";
      t.resources[0].gateway = "192.168.1.254";
      return t;
    },
  },
  {
    id: 3,
    title: "A public address, a missing path",
    description:
      "Your web server has a public IP, but the internet is still out of reach.",
    objective: "Give Web server a working outbound HTTPS route to Internet.",
    hints: [
      "Inspect Public routes. What matches the destination 8.8.8.8?",
      "A public IP alone is not enough. The subnet route table must point to the attached internet gateway.",
      "Add 0.0.0.0/0 → Internet gateway to Public routes.",
    ],
    explanation:
      "Internet access requires a public IPv4 address, an attached internet gateway, an effective route, and permitted security rules. A subnet’s name does not grant access.",
    request: {
      sourceId: "web",
      destination: "internet",
      protocol: "TCP",
      port: 443,
    },
    difficulty: "Intermediate",
    minutes: 4,
    create: () => {
      const t = awsTemplate();
      t.name = "Challenge 03 · No way out";
      t.resources.find((r) => r.id === "rt-public")!.routes!.pop();
      return t;
    },
  },
  {
    id: 4,
    title: "Private, but not stranded",
    description:
      "A NAT gateway is waiting. The application server never sends traffic to it.",
    objective: "Restore outbound HTTPS from Application server through NAT.",
    hints: [
      "Inspect the route table associated with Application subnet.",
      "Private instances send internet-bound requests to a NAT gateway in a public subnet.",
      "Add 0.0.0.0/0 → NAT gateway to Private routes, then verify the fix.",
    ],
    explanation:
      "The private default route selects NAT. NAT tracks the connection and translates the source port; the internet gateway maps its private IP to the Elastic IP. Replies follow the recorded translation back.",
    request: {
      sourceId: "app",
      destination: "internet",
      protocol: "TCP",
      port: 443,
    },
    difficulty: "Intermediate",
    minutes: 5,
    create: () => {
      const t = awsTemplate();
      t.name = "Challenge 04 · Find the NAT";
      t.resources.find((r) => r.id === "rt-private")!.routes!.pop();
      return t;
    },
  },
  {
    id: 5,
    title: "The website behind the wall",
    description:
      "Routing works. A security rule is keeping your web server quiet.",
    objective:
      "Allow an HTTP request from Internet to Web server on TCP port 80.",
    hints: [
      "Select Web server and follow its security group association.",
      "Security groups implicitly deny requests that do not match an allow rule.",
      "Select Web security and add an inbound TCP rule for port 80 from 0.0.0.0/0.",
    ],
    explanation:
      "The inbound rule permits a new HTTP connection. The security group then permits the tracked response automatically; the stateless subnet NACL must also allow that response.",
    request: {
      sourceId: "internet",
      destination: "web",
      protocol: "TCP",
      port: 80,
    },
    difficulty: "Intermediate",
    minutes: 5,
    create: () => {
      const t = awsTemplate();
      t.name = "Challenge 05 · Open for visitors";
      t.resources.find((r) => r.id === "sg-web")!.rules = t.resources
        .find((r) => r.id === "sg-web")!
        .rules!.filter((r) => r.direction === "outbound");
      return t;
    },
  },
];
export function verifyChallenge(id: number, t: Topology) {
  const challenge = challenges.find((c) => c.id === id);
  if (!challenge) throw new Error("Unknown challenge.");
  const result = simulate(t, challenge.request);
  // Challenge 1 teaches routing; moving a host into the other subnet is not that solution.
  const originalAddresses =
    id !== 1 ||
    (t.resources.find((r) => r.id === "pc1")?.ip === "192.168.1.10" &&
      t.resources.find((r) => r.id === "pc2")?.ip === "192.168.2.10");
  return {
    complete: result.success && originalAddresses,
    result,
    explanation: originalAddresses
      ? result.reason
      : "Keep the original host addresses and connect the networks through a router.",
  };
}
