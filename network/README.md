# NetVerse

**Build Networks. Break Networks. Understand Networks.**

A browser-local networking laboratory built from the specification in [`mvp`](./mvp). No backend, login, cloud account, paid API, or real packet transmission is required.

## Run locally

Use Node.js 22+ and npm. Dependencies and the lockfile are included in the project setup.

```powershell
cd F:\network
npm install
npm run dev
```

Open the URL printed by Vite, normally **http://127.0.0.1:5173**.

```powershell
npm test              # Deterministic engine and integration tests
npm run build         # TypeScript checks and production bundle
npm run preview       # Serve the production bundle
npm run test:e2e       # Playwright browser workflows
```

On a machine without a Playwright browser, run `npx playwright install chromium` before browser tests. The runtime application has no external network dependency. `dist/` can be served by any static web server.

## First experiment

For the interactive AWS builder, open **http://127.0.0.1:5173/#aws-learning** or choose **Start two-subnet lab** on the AWS page. Build a VPC, two subnets and two EC2 instances, configure security policies, check the modeled connectivity and download a guide matching your diagram. Guided/free modes, nested editing, undo/redo, auto-arrangement and local autosave are included. See [AWS builder implementation and limits](./docs/AWS_BUILDER_IMPLEMENTATION.md).

New to networking? Choose **Start learning** for an eight-lesson path. Each lesson opens an explicit practice example, explains the current action, and ends with an understanding check. **Return to my experiment** restores the previous topology, selection, packet trace, and CIDR practice state during the current session. Lesson progress and text preferences are saved locally when browser storage is available; reloading offers a fresh lesson example at the saved reading step.

Use **Text size** for larger interface text, **Networking glossary** for definitions and examples, and the navigation toggle to make more room. Select a device to open its settings and field explanations. **Fullscreen** enlarges the network diagram, address grid, overlap comparison, or subnet division while preserving the current experiment. **Fit diagram** and the canvas zoom buttons control the diagram's scale. Escape or **Exit fullscreen** returns to the normal view.

In **IP & CIDR**, load the eight-address example, select a square, and choose **Mark as used** or **Release address**. Reserved addresses explain their purpose. The overlap tool shows both complete ranges, the shared addresses, and examples of separate or identical networks. Allocations are an independent practice exercise.

1. The local lab opens with a workstation and Linux server connected to a switch.
2. Click **Send packet**, then watch ARP, switching, delivery, and the reply.
3. Use the playback controls to pause, step, replay, change speed, or skip to the result.
4. Open **Templates → Two networks · one router**.
5. Select Workstation and change its gateway to `192.168.1.254`. Commit a text field with Tab, Enter, or by clicking elsewhere.
6. Send again. The ARP failure explains why the packet stops. Undo restores the route.

The **Packet flow** slider and numbered step cards follow the current stage automatically. Drag the slider, use its arrow keys, or scroll the cards with the side arrows to inspect any stage. On laptop fullscreen, this flow stays across the bottom while the diagram and current explanation remain above it. The diagram refits when the flow first appears; exiting fullscreen restores your previous zoom and position.

Drag resources from the library or click to add them. To connect devices manually, open **Connect nodes** above the canvas, choose **First node** and **Second node**, then click **Add cable**. Selecting a device before opening the form fills the first choice. The explanation shows what the connection does; **Send packet** tests it, and **Undo** reverses it. Duplicate cables and connections to the same node are prevented. You can also drag from the dot on the right of a card to the dot on the left of another card. Select and delete a link to disconnect devices. Select a resource to edit or delete it. Container deletion also deletes its nested contents; undo restores the edit.

## Build the cloud acceptance scenario

1. Open **AWS VPC builder**. The two-tier template is ready to explore.
2. Choose **Build from scratch**, then expand **Guided build**.
3. Follow the ten steps to create the region, `10.0.0.0/16` VPC, two AZs, `/24` subnets, instances, routes, internet gateway, public IPv4, NAT, and Elastic IP.
4. At step 5, **Test local VPC traffic** verifies private communication between the instances.
5. After step 8, **Test public internet** verifies the public instance path.
6. After step 10, **Test private HTTPS** verifies the NAT path and response. Open **NAT table** to see `10.0.2.10:49152 → 203.0.113.50:55000`.
7. Open **Security groups & NACLs**, select **Application security**, and delete its outbound allow rule. Retest private HTTPS to see the denial.
8. Undo the rule change, send again, and replay the successful trace.
9. Click **Save project**, or export portable topology JSON with the download button.

The guide writes ordinary editable resources into the shared model. Its test buttons call the same simulation engine as the terminal and packet bar.

AWS links are derived from configuration. Use **Connect nodes** and **Apply connection**, or drag between card handles, to set a route table's default route to an internet/NAT gateway, assign an EC2 instance to a security group, or associate NAT with an Elastic IP. You can choose either resource first. The form explains changes and replacements before applying them, shows unsupported combinations, and prevents these route/security associations across different VPCs. Security-group and Elastic IP associations also appear as dashed lines. Other associations are edited in the inspector. Dropping an instance inside a subnet assigns that subnet and an available IP. Moving an existing card changes its visual position; use its Subnet field to change network membership.

When building AWS resources manually, regions, VPCs, availability zones, and subnets start with different sizes and space for each level's heading. New containers avoid sibling boundaries, and enclosing containers grow when more room is needed. Select a region before adding a VPC to place it there. Container resizing preserves room for existing contents, and Undo/Redo restores both the placement and enclosing sizes.

## Three-tier AWS node graph

Open **AWS VPC builder** or follow `/#aws-architecture`. The three-tier architecture uses the same editable React Flow node canvas and inspector as the other laboratories. Both zones contain public, private web/application, and isolated database subnets. Select and drag resources, draw logical connections, zoom/pan, focus a zone, and use fullscreen. Switch **Connections** between request flow, routing/NAT, and Auto Scaling groups; cross-zone paths and link labels are optional. Save/load, JSON export/import, and Undo/Redo include the graph.

The [three-tier architecture plan](docs/AWS_THREE_TIER_PLAN.md) describes the design. ALB, RDS, Auto Scaling, and DNS endpoint nodes are typed resources with inspectable roles and service IDs. Graph connections describe service relationships; ALB requests, scaling, and database failover are not simulated. Choose **Basic public/private lab** for the original packet exercises, or **Build from scratch** for the guided builder. NAT and security laboratories open their original packet template. Switching templates remains undoable.

The earlier printable reference is retained as [SVG](docs/assets/aws-three-tier-architecture.svg), [PNG](docs/assets/aws-three-tier-architecture.png), or [PDF](docs/assets/aws-three-tier-architecture.pdf).

## Included laboratories

| Laboratory | Behavior |
| --- | --- |
| Networking fundamentals | Short, linked experiments introducing addresses, switching, routing, and cloud networks |
| IP & CIDR | `/0`–`/32` arithmetic, binary bits, masks, ranges, AWS reservations, paged address allocation, `/24` subdivision, overlap checking, host sizing |
| Local networks | Computers, servers, switches, routers, firewalls, links, ARP, switch MAC learning, connected/static routes, gateways, forwarding, reverse paths |
| AWS VPC | Nested region/VPC/AZ/subnet groups, EC2, route tables, IGW, public IPv4, public NAT, EIP, associations, subnet validation |
| Routing | Matching entries, longest-prefix selection, blackhole routes, next-hop explanations |
| Security | Stateful SG allow rules, ordered stateless NACL allow/deny rules, port/CIDR matching, ephemeral response-port checks |
| NAT | Private/public addresses and ports, connection mappings, return translation, gateway failure experiments, unsolicited inbound rejection |
| Challenges | Five broken networks, progressive hints, editable fixes, and connectivity-based verification |

## Terminal

The terminal runs from the selected packet source. It does not execute operating-system commands.

New results scroll into view automatically, and focus returns to the command box after running a command. Open **Command examples and help** below the output to fill a sample command. You can scroll back through earlier results or use `clear` to empty the terminal.

```text
ping 192.168.1.20
traceroute 192.168.2.10
ip addr
ip route
curl http://192.168.1.20
curl https://example.net
nslookup server.netverse
help
clear
```

`ping`, `traceroute`, and `curl` use simulated routes and security checks. `ip` reads actual model configuration. `nslookup` first tests UDP/53 access to a modeled resolver and then queries the project’s DNS records. The local server and cloud internet fixture expose port 53. `traceroute` displays the engine’s forwarding decisions; it does not emulate separate TTL-expiry probes.

## Persistence and controls

- **Save project / Load saved project:** one explicit save slot in localStorage (`netverse.project.v1`). Storage errors are shown; export is the fallback.
- **Import / Export:** versioned JSON; malformed data and invalid nesting are rejected. Validly structured but broken network settings remain editable and show validation issues.
- **Undo / Redo:** up to 40 topology snapshots, including changes made by templates and the guided build. Keyboard shortcuts are Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z.
- **Save shortcut:** Ctrl/Cmd+S outside form controls.
- **Fit / zoom / pan:** controls on the canvas. Click resource boundaries to resize containers.
- **Text fields:** commit on blur or Enter. Selects and toggles update immediately. Edits invalidate old packet traces.

Changing between the local and cloud labs loads the corresponding template when the current topology has a different mode. That replacement is undoable. Save or export before changing experiments. Challenge completion badges last for the current browser session; saved projects contain topology, not lesson progress or trace history.

## Architecture

```text
src/
  engine/
    types.ts             Shared typed resources, packet requests, events
    ipMathEngine.ts      Unsigned IPv4 arithmetic and subnet operations
    deviceEngine.ts      Resource defaults and interface helpers
    topologyEngine.ts    Validation and hierarchy coordinates
    arpEngine.ts         Layer 2 reachability
    routingEngine.ts     Connected/static routes and longest-prefix match
    securityEngine.ts    SG and ordered NACL/firewall evaluation
    natEngine.ts         Deterministic connection translation
    packetEngine.ts      Local forwarding, ARP, MAC learning, reverse path
    awsEngine.ts         VPC routing, SG/NACL boundaries, IGW and NAT
    simulationEngine.ts  Validated entry point shared by every UI
    challengeEngine.ts   Challenge fixtures and verification
    persistence.ts       Versioned serialization and storage
  components/            Canvas, inspector, terminal, CIDR, guides
  data/templates.ts      Local and cloud starting topologies
  store.ts               Zustand topology, history, selection, playback
```

The engines are independent of React. Every packet animation and explanation consumes a typed engine trace. Availability zones and VPC containers are placement boundaries, not forwarding nodes. Route tables appear in the trace to explain decisions, rather than claiming to be physical appliances.

## Deliberate model limits

- IPv4 only; one primary address and one SG per instance, one NACL and explicitly associated route table per subnet. The model has one IPv4 CIDR per VPC.
- Ethernet links represent shared broadcast domains; router interface IPs determine on-link reachability. Interfaces are not separately bound to individual physical router ports. No VLANs, spanning tree, link bandwidth, MTU, or packet fragmentation.
- ARP resolution and switch MAC learning occur per experiment. There are no cache aging timers or persistent forwarding databases.
- TCP/UDP are deterministic request/response exchanges. Client port is 49152 and public NAT port is 55000. Listener ports apply to both transport protocols. No full TCP handshake, retransmission, congestion, or connection lifetime emulation.
- SG and NAT connection tracking lasts one trace. NACLs independently check both directions, including the NAT subnet. Unassigned NACLs use the modeled default allow-all ACL.
- Only public NAT is modeled. No peering, transit gateways, VPNs, private NAT, gateway ingress routing, or middlebox routes. VPC-to-VPC and unsupported route paths fail explicitly.
- A live internet resource is a simulated endpoint; arbitrary real internet IPs are not contacted. Public example addresses use documentation ranges. DNS records are project-local.
- Templates intentionally allow broad traffic for experimentation. They are teaching fixtures, not production security recommendations.
- The address-grid allocation experiment is separate from topology IP allocation. Large networks are paged to avoid rendering billions of cells.

## Reference behavior

The implementation follows AWS’s documented [IPv4 subnet sizing and reservations](https://docs.aws.amazon.com/vpc/latest/userguide/subnet-sizing.html), [internet-gateway requirements](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Internet_Gateway.html), [public NAT behavior](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html), [stateful security groups](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html), and [NACL ephemeral-port behavior](https://docs.aws.amazon.com/vpc/latest/userguide/custom-network-acl.html), within the limits above.

See [`docs/PROGRESS.md`](./docs/PROGRESS.md) for milestone validation.

Verified on 2026-10-25: **75 engine tests and 35 browser workflows passed**. Browser checks cover both fullscreen modes, lesson restoration, glossary, allocations, overlap, readable layouts, keyboard interaction, reduced motion, template and manual cloud boundaries, terminal output scrolling, and navigation through every packet stage. Comprehension still needs validation with people new to networking.

## Vercel deployment

Live site: **[roopa-net.vercel.app](https://roopa-net.vercel.app)**, updated on 2026-10-26 in the **roopa-net** project.

The [AWS architecture reference](https://roopa-net.vercel.app/#aws-architecture) is deployed, including the chart, zoom/fullscreen controls, downloads, subnet table, and routing/security/failover explanations. Release: `roopa-mer6usw0t-balaji-degalas-projects.vercel.app`. The production build and all 75 engine tests passed. Local browser checks passed for desktop/mobile, extra-large text, direct links and reloads, downloads, zoom/fullscreen, preserved experiments, and local/NAT packet delivery. The live HTML, SVG, PDF, and Markdown plan returned HTTP 200. Live browser automation remains restricted by the workspace network policy.

`vercel.json` configures a Vite build with `npm ci`, `npm run build`, and `dist` output. The site runs its simulations locally in the browser and requires no backend environment variables. Development artifacts are excluded using `.vercelignore`.

The production build succeeded and the public HTML, JavaScript, and CSS returned HTTP 200. Direct browser automation against the live domain remains blocked by this workspace's network restrictions; interactive workflows were verified locally. Laptop fullscreen places the flow slider along the bottom and the current explanation beside the canvas. Both fullscreen paths preserve the experiment and restore the prior diagram view.
