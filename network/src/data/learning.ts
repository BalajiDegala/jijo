import type { Page } from "../store";
import type { ResourceKind } from "../engine/types";

export const glossary = [
  {
    term: "IP address",
    definition:
      "A numeric address used to identify a network interface so data can be sent to it.",
    example:
      "Your workstation uses 192.168.1.10. A different device in the same network needs a different address.",
    page: "cidr",
  },
  {
    term: "Subnet",
    definition: "A smaller IP network with a defined range of addresses.",
    example:
      "192.168.1.0/24 contains addresses from 192.168.1.0 through 192.168.1.255.",
    page: "cidr",
  },
  {
    term: "CIDR",
    definition:
      "A compact way to write an IP network: an address, a slash, and the number of bits used for the network part.",
    example:
      "In /24, 24 of the 32 IPv4 bits identify the network. The remaining 8 bits allow 256 total addresses. A larger prefix number means a smaller address range.",
    page: "cidr",
  },
  {
    term: "Gateway",
    definition:
      "A router a device sends data to when the destination is outside its own local network.",
    example:
      "192.168.1.10 can use a reachable router at 192.168.1.1 to reach another subnet.",
    page: "routing",
  },
  {
    term: "Route",
    definition:
      "A rule that says where to send data for a destination IP range. The most specific matching range is chosen.",
    example:
      "A matching /24 route takes priority over a /16. The default route, 0.0.0.0/0, matches every IPv4 destination.",
    page: "routing",
  },
  {
    term: "Packet",
    definition:
      "A small unit of data with addressing information, sent through a network.",
    example:
      "Send packet runs a simulated request, followed by a reply if the request succeeds.",
    page: "local",
  },
  {
    term: "Port",
    definition:
      "A number that helps direct TCP or UDP traffic to a particular application or service on a device.",
    example:
      "An HTTPS service commonly listens on port 443. The lab's client uses port 49152 for its side of the exchange.",
    page: "security",
  },
  {
    term: "ARP",
    definition:
      "Address Resolution Protocol finds the local hardware address belonging to an IPv4 address on a reachable local network.",
    example:
      "Before sending to its gateway, a computer asks which device has the gateway's IP address.",
    page: "local",
  },
  {
    term: "MAC address",
    definition:
      "A hardware-interface address used to deliver Ethernet frames on a local network.",
    example:
      "A switch learns which connection leads toward a source MAC address and uses that information for forwarding.",
    page: "local",
  },
  {
    term: "Switch",
    definition:
      "A device that connects devices on a local Ethernet network and forwards frames using MAC addresses.",
    example:
      "The access switch joins the workstation and Linux server in the starting example.",
    page: "local",
  },
  {
    term: "Router",
    definition:
      "A device that forwards IP packets between networks using routes.",
    example:
      "A router with an interface in each of two subnets lets traffic travel between them when the configuration permits it.",
    page: "routing",
  },
  {
    term: "NAT",
    definition:
      "Network Address Translation changes addresses in packets. Public NAT lets private devices initiate connections using a public address, and tracks where replies should go.",
    example:
      "The lab can translate 10.0.2.10:49152 into 203.0.113.50:55000, then translate the reply back.",
    page: "nat",
  },
  {
    term: "VPC",
    definition:
      "A logically isolated virtual network in AWS where you define address ranges, subnets, and routing.",
    example:
      "A 10.0.0.0/16 VPC can contain 10.0.1.0/24 and 10.0.2.0/24 subnets.",
    page: "aws",
  },
  {
    term: "Security group",
    definition:
      "An AWS resource's traffic filter with allow rules. It tracks allowed connections so their response traffic can pass automatically.",
    example:
      "Allow incoming TCP port 443 to a web server. A new incoming connection needs an applicable allow rule.",
    page: "security",
  },
  {
    term: "NACL",
    definition:
      "A network access control list filters traffic at an AWS subnet boundary. Its numbered allow/deny rules are checked in order and the first match wins.",
    example:
      "It checks requests and replies separately. Allowing the request alone does not automatically allow the response.",
    page: "security",
  },
  {
    term: "Reserved address",
    definition:
      "An address kept for a specific network purpose instead of being assigned to an ordinary device.",
    example:
      "A traditional /24 reserves its network and broadcast addresses. AWS subnets reserve the first four and last addresses.",
    page: "cidr",
  },
  {
    term: "Protocol",
    definition: "The rules used for a type of communication.",
    example:
      "ICMP is used here to test reachability. TCP and UDP tests also check the selected service port.",
    page: "local",
  },
  {
    term: "Elastic IP",
    definition:
      "A public IPv4 address that can be associated with a supported AWS resource.",
    example:
      "Assign an Elastic IP to the public NAT gateway so outbound traffic can use that public address.",
    page: "nat",
  },
] satisfies { term: string; definition: string; example: string; page: Page }[];

export const resourceDescriptions: Record<ResourceKind, string> = {
  awsCloud:
    "The AWS Cloud contains Regions and regional resources. This boundary is a visual grouping, not a router.",
  endpoint:
    "Private access to a supported AWS service. Gateway endpoints use route tables; interface endpoints use network interfaces and security groups.",
  peering:
    "A connection between two VPCs. Both sides need routes and compatible security policies; peering does not provide transitive routing.",
  tgw: "A regional transit hub with attachments and its own route tables. Attachments alone do not guarantee reachability.",
  vgw: "The AWS side of a VPN connection attached to a VPC.",
  cgw: "The AWS representation of your on-premises VPN device and its public address.",
  vpn: "Encrypted tunnels between your customer gateway and an AWS gateway. Routing and tunnel configuration are still required.",
  nlb: "A transport-layer load balancer. Listeners, target groups, and health checks must be configured.",
  s3: "Regional object storage, outside your subnets. Access depends on networking, IAM, bucket policy, and endpoint policy.",
  route53:
    "DNS records translate names to endpoints. DNS resolution does not grant network access.",
  cloudwatch:
    "Metrics, logs, and alarms help you observe resources; monitoring does not create a traffic path.",
  computer:
    "A device that sends requests and receives replies. Select its IP address and gateway to control where it can communicate.",
  server:
    "A computer that offers services to other devices. Its service ports determine which simulated applications can respond.",
  switch:
    "Connects devices on a local Ethernet network. It learns which connections lead toward different MAC addresses.",
  router:
    "Moves packets between networks. Its interfaces connect to local networks; its routes choose the next destination.",
  firewall:
    "A router with traffic-filtering rules in this lab. A working route can still be blocked by a rule.",
  internet:
    "A simulated outside endpoint for testing traffic. Sending here stays inside the lab.",
  region:
    "A geographical grouping for this cloud network. It organizes resources and does not forward packets.",
  vpc: "Your cloud network's address range and boundary. Create subnets inside this range.",
  az: "An availability zone is a placement boundary inside an AWS region. It groups resources; routes determine traffic flow.",
  subnet:
    "A range of addresses inside a VPC. Its route table chooses paths, and its network ACL filters traffic at the boundary.",
  ec2: "A virtual computer in a subnet. It needs an available private IP, a security group, and the subnet's routes to communicate.",
  routeTable:
    "A set of directions for packets. A subnet uses its associated table and selects the most specific matching destination range.",
  igw: "An internet gateway connects a VPC to the simulated internet. Instances also need suitable routes, public addresses, and security rules.",
  nat: "Lets private instances initiate internet connections using a public address. It tracks the address changes needed to deliver replies.",
  eip: "A public IPv4 address that can be assigned to the NAT gateway in this lab.",
  sg: "Allows selected traffic for an instance and recognizes replies to allowed connections. An absent allow rule blocks new traffic.",
  nacl: "Checks traffic crossing a subnet boundary. Numbered rules apply in order, and requests and replies need their own permission.",
  alb: "A load balancer selects healthy targets. The A and B nodes with the same service ID belong to one ALB spanning two subnets.",
  rds: "An RDS Multi-AZ database has a primary that serves requests and a synchronous standby in another zone. The standby takes over after failover; it does not normally serve reads.",
  asg: "A shared Auto Scaling group manages replicas of one tier across both zones. Membership lines describe management, not packet forwarding.",
  dbEndpoint:
    "A stable DNS name resolves to the current RDS primary. This node represents a name, not a network appliance or another database.",
};

export const fieldHelp: Record<string, string> = {
  "Private IPv4 address":
    "The device's address inside its network, such as 192.168.1.10. It must be available and inside the selected subnet.",
  "Prefix length":
    "How many IPv4 bits identify the network. /24 gives 256 total addresses; /25 gives 128.",
  "Default gateway":
    "The IP address of a reachable router used to reach other networks. A wrong address can leave the device unable to reach its next hop.",
  "MAC address":
    "The interface's local Ethernet address, used by switches and ARP.",
  "Open service ports (comma separated)":
    "Services this simulated device accepts, such as 80 for HTTP and 443 for HTTPS. Security rules must also allow the request.",
  "CIDR block":
    "The network's address range, written like 10.0.1.0/24. A subnet must fit inside its VPC without overlapping sibling subnets.",
  "Public IPv4 address":
    "An address used for internet communication. It works only with the required route and gateway configuration.",
  "Interface IP":
    "This router interface's address on a directly connected network.",
  "Interface prefix":
    "The size of the network directly reachable through this interface.",
  "Destination CIDR":
    "The destination range this route or outbound rule applies to. 0.0.0.0/0 matches all IPv4 addresses.",
  "Source CIDR":
    "The sender address range this inbound rule matches. A narrower range allows fewer possible senders.",
  "Next-hop IPv4": "The reachable router to send matching traffic to next.",
  "Route target":
    "Where matching packets should go: within the VPC or toward the selected gateway.",
  Direction:
    "Inbound means entering this resource or subnet; outbound means leaving it.",
  Protocol:
    "Which communication rules the security entry matches: TCP, UDP, ICMP, or all.",
  "From port":
    "The first destination port in this rule's allowed or denied range.",
  "To port":
    "The last destination port in the range. Use the same number as From port for one service.",
  "Rule number":
    "Lower numbers are checked first. The first matching rule decides the result.",
  Action: "Allow permits matching traffic. Deny blocks it.",
  Subnet:
    "Assigns the device to this subnet. Check its IP address after moving it to a different address range.",
  "Security group":
    "The instance's allow rules. Changing the group changes which new connections it accepts or initiates.",
  "Route table": "The directions used by devices in this subnet.",
  "Network ACL":
    "The ordered traffic rules checked at this subnet's boundary, in both directions.",
  "Elastic IP": "The public address used by this NAT gateway.",
  VPC: "The virtual network that contains this resource.",
  "Availability zone": "The placement group for this subnet.",
  Region: "The geographical group for this cloud resource.",
};

export const pageGuides: Partial<
  Record<Page, { meaning: string; try: string; observe: string }>
> = {
  local: {
    meaning:
      "A network lets devices exchange small pieces of data called packets. The cables show local connections; IP addresses and routes decide where the data goes.",
    try: "Choose a sender and destination below, then select Send packet. Use Connect nodes to add a cable between devices.",
    observe:
      "Follow the highlighted device and read the Packet journey. A successful experiment includes both the request and its reply.",
  },
  routing: {
    meaning:
      "A route is a direction for an IP address range. When several routes match, the one covering the smallest range is chosen.",
    try: "Enter a destination in Look up a destination. Compare the matching entries, then send a packet to follow the path.",
    observe:
      "The Selected row is the most specific match. A default /0 route is used only when no more specific route matches.",
  },
  aws: {
    meaning:
      "A VPC is a virtual network. Subnets divide its addresses, EC2 instances are computers, and routes and security rules control communication.",
    try: "Test local VPC traffic in the prepared example, or choose Build from scratch and open Guided build.",
    observe:
      "Watch the request cross the relevant rules and routes. A public subnet has a route to an internet gateway; an instance also needs its own public address for that path.",
  },
  security: {
    meaning:
      "Security groups allow traffic for an instance and recognize responses. Network ACLs check traffic at a subnet boundary and examine requests and responses independently.",
    try: "Select Test inbound HTTP. Inspect the highlighted rule, change one rule, and test again. Undo restores your edit.",
    observe:
      "Read which rule matched and whether the packet is a request or reply. Permission in one direction may not be enough for a complete exchange.",
  },
  nat: {
    meaning:
      "Public NAT lets a private device initiate an internet connection using a public address. It remembers how to return the response to the original device.",
    try: "Select Test private HTTPS, then open NAT table. Disable the NAT gateway and repeat the test to see where it stops.",
    observe:
      "Compare the private and public source addresses and ports. On the return path, the translation sends the reply to the private device.",
  },
  challenges: {
    meaning:
      "Troubleshooting means locating the first decision that prevents a connection from working.",
    try: "Open a challenge, test it, and read the failure. Change one setting, then use Verify my fix. Hints are available when you need them.",
    observe:
      "A completed challenge has a working request and reply. Read the explanation of why your fix worked.",
  },
};
