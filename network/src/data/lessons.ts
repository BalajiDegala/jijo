import type { Page } from "../store";

export type LessonAction =
  | "inspect"
  | "send"
  | "broken-gateway"
  | "restore-gateway"
  | "disable-nat"
  | "restore-nat"
  | "block-web"
  | "restore-web";
export interface Lesson {
  id: string;
  title: string;
  question: string;
  page: Page;
  template: "local" | "routed" | "aws" | "cidr" | "challenges";
  steps: {
    title: string;
    body: string;
    action?: LessonAction;
    button?: string;
  }[];
  quiz: {
    question: string;
    options: string[];
    correct: number;
    explanation: string;
  };
}
export const lessons: Lesson[] = [
  {
    id: "addresses",
    title: "Devices and addresses",
    question: "How does one computer identify another?",
    page: "local",
    template: "local",
    steps: [
      {
        title: "Meet your first computer",
        body: "The Workstation is a simulated computer. Select it to see its private IP address: 192.168.1.10. The Linux server uses 192.168.1.20.",
        action: "inspect",
        button: "Inspect the workstation",
      },
      {
        title: "Send to an address",
        body: "The two computers share a local network. Send a request from the workstation to the server. Use Next step in Packet journey to follow each decision.",
        action: "send",
        button: "Send the example request",
      },
      {
        title: "Read the reply",
        body: "Use Skip to result in Packet journey. Delivered means the request arrived and its reply returned. Each endpoint has its own address.",
      },
    ],
    quiz: {
      question: "What is the IP address used for here?",
      options: [
        "Identifying a network interface so data can reach it",
        "Changing the computer's screen size",
        "Setting the cable's color",
      ],
      correct: 0,
      explanation:
        "An IP address identifies an interface for communication. Devices in the same network need distinct addresses.",
    },
  },
  {
    id: "packets",
    title: "Sending data",
    question: "What happens between Send and Delivered?",
    page: "local",
    template: "local",
    steps: [
      {
        title: "Start the journey",
        body: "A packet is a small unit of data. This example sends a request and, if it arrives, a reply travels back.",
        action: "send",
        button: "Send a practice packet",
      },
      {
        title: "Watch one decision at a time",
        body: "Pause playback. Use Next step to watch the current device, source and destination, and explanation change together. ARP finds a local hardware address; the switch forwards the frame.",
      },
      {
        title: "Follow the return trip",
        body: "Look for the Reply badge. Source and destination swap when the response travels back. A working outward path alone is not a complete exchange.",
      },
    ],
    quiz: {
      question: "What must work for this experiment to show Delivered?",
      options: [
        "Only the request leaving the workstation",
        "The request and the response path",
        "Only the switch being visible",
      ],
      correct: 1,
      explanation:
        "The simulator checks both the request and the reply. Either direction can fail.",
    },
  },
  {
    id: "subnets",
    title: "Subnets and CIDR",
    question: "Which addresses belong together?",
    page: "cidr",
    template: "cidr",
    steps: [
      {
        title: "Explore eight addresses",
        body: "The loaded /29 example contains eight addresses. Two are reserved under traditional IPv4 rules, leaving six for devices. Select a reserved square to find out why.",
      },
      {
        title: "Use one address",
        body: "Select 192.168.1.1 and click Mark as used. The available count falls to five. Release address makes it available again. This is a practice allocation, separate from the builder.",
      },
      {
        title: "Compare two ranges",
        body: "In the overlap tool, select Try overlapping networks. Read the 128 shared addresses and the striped part of both bars. Try separate networks to see the difference.",
      },
    ],
    quiz: {
      question: "When do two address ranges overlap?",
      options: [
        "When their names sound similar",
        "When both have the same number of devices",
        "When at least one address belongs to both ranges",
      ],
      correct: 2,
      explanation:
        "Overlap means shared addresses. The two ranges can have different sizes; one can fit entirely inside the other.",
    },
  },
  {
    id: "switches",
    title: "Switches and routers",
    question: "How does data travel to another network?",
    page: "local",
    template: "routed",
    steps: [
      {
        title: "Find the different networks",
        body: "The workstation uses 192.168.1.10/24 and the server uses 192.168.2.10/24. The router has an interface in each network.",
        action: "inspect",
        button: "Inspect the workstation",
      },
      {
        title: "Cross the router",
        body: "Send a packet. The switch connects local devices, while the router chooses the path into the other IP network.",
        action: "send",
        button: "Send across two networks",
      },
      {
        title: "Read the route decision",
        body: "Select a route step in Packet journey. The router uses the destination IP and its routing table to choose a next hop. Look at the highlighted resource.",
      },
    ],
    quiz: {
      question: "Which device chooses routes between IP networks?",
      options: [
        "The router",
        "The label on the canvas",
        "An address-grid square",
      ],
      correct: 0,
      explanation:
        "The router forwards packets between IP networks. The switch connects devices within the local Ethernet network.",
    },
  },
  {
    id: "routes",
    title: "Routes and gateways",
    question: "Why can a wrong gateway stop a connection?",
    page: "routing",
    template: "routed",
    steps: [
      {
        title: "Try the working route",
        body: "The workstation's gateway is 192.168.1.1. It is a reachable router. Send to the server in the other network.",
        action: "send",
        button: "Test the working route",
      },
      {
        title: "Change one setting",
        body: "Set the gateway to 192.168.1.254 and test again. The workstation cannot reach a router at that address. Read the failure in Packet journey.",
        action: "broken-gateway",
        button: "Try an unreachable gateway",
      },
      {
        title: "Repair and retest",
        body: "Restore the gateway to 192.168.1.1. The route can now use the actual router. Compare the result with the failed attempt.",
        action: "restore-gateway",
        button: "Restore the gateway and test",
      },
    ],
    quiz: {
      question: "Why did the changed gateway cause a failure?",
      options: [
        "The computer's name was too long",
        "No reachable gateway answered at the configured address",
        "A /24 cannot send any packets",
      ],
      correct: 1,
      explanation:
        "The gateway must be a reachable router. A syntactically valid address alone does not make a working next hop.",
    },
  },
  {
    id: "cloud",
    title: "Your first cloud network",
    question: "How do VPCs, subnets, and instances fit together?",
    page: "aws",
    template: "aws",
    steps: [
      {
        title: "Read the boundaries",
        body: "The largest network boundary is the VPC. Subnets divide its address range. Availability zones organize placement. The EC2 instances are virtual computers.",
      },
      {
        title: "Test private communication",
        body: "Use Test local VPC traffic to send between the web and application instances. Routes and security rules work together to allow the request and reply.",
      },
      {
        title: "Build it yourself",
        body: "Choose Build from scratch, then expand Guided build. Each step explains the resource to add. Test traffic at the checkpoints as the network grows.",
      },
    ],
    quiz: {
      question:
        "Which settings decide whether a cloud instance can communicate?",
      options: [
        "Only its position on the drawing",
        "Only its availability zone's name",
        "Its addresses, routes, gateways, and security rules together",
      ],
      correct: 2,
      explanation:
        "Placement organizes resources. Actual communication is determined by the network configuration and security checks.",
    },
  },
  {
    id: "security",
    title: "Security rules",
    question: "Why can connected devices still be blocked?",
    page: "security",
    template: "aws",
    steps: [
      {
        title: "Test the website",
        body: "Send an HTTP request from the internet to the web server. Look for the security checks on the request and reply.",
        action: "send",
        button: "Test the example website",
      },
      {
        title: "Remove permission",
        body: "Remove the web security group's inbound allow rules and repeat the request. A route still exists, but the new connection is blocked.",
        action: "block-web",
        button: "Block incoming web traffic",
      },
      {
        title: "Restore permission",
        body: "Restore the example's allow rules and retest. Security groups recognize responses; network ACLs still check both directions independently.",
        action: "restore-web",
        button: "Restore example rules and test",
      },
    ],
    quiz: {
      question: "Does a working route guarantee that a packet is allowed?",
      options: [
        "Yes, every routed packet is allowed",
        "No, security rules can still block it",
        "Only if the line is green",
      ],
      correct: 1,
      explanation:
        "Routes choose paths. Security rules decide whether traffic is permitted on those paths.",
    },
  },
  {
    id: "nat",
    title: "NAT and troubleshooting",
    question: "How does a private device use a public address?",
    page: "nat",
    template: "aws",
    steps: [
      {
        title: "Observe an address change",
        body: "Send private HTTPS traffic. Open NAT table to compare the private source with the public source. The mapping also tells the gateway where to send the reply.",
        action: "send",
        button: "Send through NAT",
      },
      {
        title: "Locate a failure",
        body: "Disable NAT and send the same request. Read the first failure and inspect the highlighted resource.",
        action: "disable-nat",
        button: "Disable NAT and test",
      },
      {
        title: "Repair, then try a challenge",
        body: "Restore NAT and retest. Next, open Troubleshooting challenges to practice finding failures yourself with progressive hints.",
        action: "restore-nat",
        button: "Restore NAT and test",
      },
    ],
    quiz: {
      question: "What does the NAT mapping help the gateway do?",
      options: [
        "Return replies to the original private device",
        "Make every inbound request allowed",
        "Remove the need for routes",
      ],
      correct: 0,
      explanation:
        "NAT tracks the translated address and port so a matching reply can return to the private device. Routes and security checks still apply.",
    },
  },
];
