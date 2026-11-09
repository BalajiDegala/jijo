# NetVerse: make networking understandable

Status: implemented and checked automatically, 2026-10-25. Sessions with new learners remain a follow-up; no human usability study has been conducted.

Implementation now includes scalable text preferences, collapsible navigation, device details on selection, fullscreen network/address/subnet/overlap views, explicit address allocation, exact overlap visualization, eight guided lessons with saved progress and experiment restoration, a searchable glossary, contextual field help, packet narration, terminal examples, and guidance for the cloud/security/routing/NAT/challenge labs. Native fullscreen and an in-page fallback preserve the working experiment.

Validation: 69 engine/integration tests, 24 browser workflows, and the production build passed. Browser checks include 1366, 1280, 1024, and 390 px widths, enlarged text, keyboard operation, reduced motion, and both fullscreen paths. The remaining sections document the design and acceptance criteria that guided the implementation.

## Outcome

A person with no networking background should understand what a tool does, know what to try, see what changed, and explain the result in their own words. A small laptop must provide a comfortable reading and diagram experience.

Assumptions: English explanations, complete beginners as the default audience, and the existing browser-local simulation as the source of truth. People can switch between **Learn with guidance** and **Explore freely**, with their current experiment preserved.

## Findings from the current project

Reviewed the current components, styles, existing browser workflows, README, and saved desktop screenshot. This is a planning review; the proposed behavior has not been implemented or tested with learners.

| Current behavior | Learning problem | Planned response |
| --- | --- | --- |
| The app opens directly into the local builder. | A first-time visitor has no introduction to devices or packets. | Offer a first-visit starting lesson and a clearly visible free-exploration entry. |
| Fundamentals links describe ARP, interfaces, and prefixes in short technical paragraphs. | The introduction depends on concepts the learner has not learned yet. | Teach one concept through a small, guided experiment before adding terminology. |
| The address grid says to click an address to allocate it. | It does not explain the purpose of an address, allocation, or reservations. | Explain each cell, show its address and status, and provide explicit actions. |
| Overlap compares the main CIDR with a field called “Compare with.” | The two networks and the reason for the answer are not visible together. | Show Network A, Network B, their ranges, and their intersection. |
| Canvas controls provide zoom and fit-to-view. | The maximize-shaped icon can suggest fullscreen, but only fits the graph in the panel. | Give Fit diagram and Fullscreen separate, labeled controls. |
| Small-screen CSS reduces some labels to 7–10 px; side panels compete with the canvas. | A smaller screen makes the content harder to read. | Reflow and collapse panels while preserving readable typography. |
| Packet playback already has steps, explanations, speed, and replay. | Event names and explanations still assume networking knowledge. | Add a plain-language story synchronized with those same events. |
| General help emphasizes simulation limitations. | It does not answer “What should I do here?” | Put page-specific help beside each activity and retain model details under deeper help. |

## 1. A consistent teaching pattern

Each major tool should answer these questions in this order:

1. **What is this?** A short definition, with a concrete example.
2. **Why would I use it?** A recognizable task, such as choosing addresses for office computers.
3. **What should I do?** One clear action and a button to load a prepared example.
4. **What happened?** A visible change linked to the actual experiment state.
5. **Why did that happen?** A short explanation using the current values.
6. **What can I try next?** One suggested variation or prediction question.

Keep the short definition and next action visible. Put longer explanations behind **Explain this** and **Show technical details**. Introduce a plain term followed by its technical name, for example “A small piece of data (packet).” Essential instructions must work by click, touch, and keyboard rather than depending on hover.

Add a searchable glossary with links from labels such as IP address, subnet, CIDR, gateway, route, port, ARP, NAT, security group, and NACL. Each entry needs a definition, an example, and a link back to a relevant experiment. Everyday comparisons should be followed by the actual networking meaning so they do not teach a misleading model.

## 2. A beginner learning route

The first visit offers **Start learning** and **Explore the tools**. Guidance can be skipped, restarted, and resumed. Existing experiments should survive entering help or changing guidance preferences. Loading a lesson example must be explicit and provide a way to return to the previous experiment.

| Lesson | Question it answers | First activity |
| --- | --- | --- |
| Devices and addresses | How does one computer identify another? | Select two named computers and inspect their IP addresses. |
| Sending data | What happens when computers communicate? | Send a prepared message and step through its journey and reply. |
| Subnets and CIDR | Which addresses belong together, and how many are available? | Change a small network's size and allocate a practice address. |
| Switches and routers | How does data reach a device nearby or in another network? | Compare a local path with a path through a router. |
| Routes and gateways | How is the next destination chosen? | Inspect the chosen route, break the gateway, then repair it. |
| Cloud networks | How are devices and networks organized in AWS? | Build a small VPC with the existing guide, explaining each added resource. |
| Security and NAT | What is allowed through, and why do addresses change? | Change one rule or disable NAT, then compare the resulting traces. |
| Troubleshooting | How can I find the reason a connection failed? | Solve an existing challenge with progressive hints and a post-fix explanation. |

Each lesson introduces a small number of controls at a time. Provide **Show all controls** for free exploration. Record learning progress and display preferences locally, separately from saved network projects.

## 3. Redesign “Explore the address space”

Proposed title: **Which IP addresses can I use?**

Opening explanation:

> Each square represents one IP address in this network. A device uses an IP address to send and receive data. Some addresses are reserved for network purposes; the others can be assigned to devices. Here you can practice marking an address as used.

Start the guided example in traditional IPv4 mode with `192.168.1.0/29`: eight total addresses, two reserved, and six available before any practice allocations. A small example makes every square legible. Keep the normal playground's existing values until the learner chooses **Load example**.

Interaction:

1. Show the complete range, total addresses, reserved addresses, practice allocations, and remaining available addresses.
2. Selecting a square opens an adjacent detail card containing the full IP address, its status, and an explanation.
3. Use an explicit **Mark as used** or **Release address** action. Selection alone should not silently toggle allocation.
4. Explain reserved addresses individually. In this traditional `/29`, `.0` identifies the network and `.7` is the broadcast address.
5. After marking `.1` as used, show “192.168.1.1 is marked as used in this practice grid. Five addresses remain available.” Highlight the changed count.
6. State that this is an allocation exercise; it does not create a device in the network builder.
7. Provide **Reset practice allocations**, a clearly labeled page range for large networks, and a readable list alternative to the grid.

Every status needs a text label or distinguishable symbol as well as color. Keyboard navigation should avoid hundreds of separate Tab stops. Fullscreen should enlarge cells and retain the detail card, counts, legend, and controls.

Explain AWS reservations when AWS mode is chosen. Introduce the traditional `/31` and `/32` exceptions in contextual detail. Use valid AWS examples and distinguish usable capacity from addresses marked as used in this exercise.

## 4. Redesign “Will these networks overlap?”

Proposed title: **Do these networks share any IP addresses?**

Opening explanation:

> A network describes a range of IP addresses. Two networks overlap when at least one address belongs to both ranges. This matters when planning separate subnets or connecting networks, because shared ranges can cause addressing and routing conflicts.

Display both inputs together. Label Network A as the network currently selected in the playground, and Network B as the comparison. Changes to A must stay synchronized with the main playground.

Example result:

| Network | CIDR | Full address range |
| --- | --- | --- |
| A | `192.168.1.0/24` | `192.168.1.0` to `192.168.1.255` |
| B | `192.168.1.128/25` | `192.168.1.128` to `192.168.1.255` |

Show two aligned bars on a shared address scale, with the common portion highlighted and exact endpoints printed alongside it.

> These networks share 128 addresses, from 192.168.1.128 to 192.168.1.255. Network B is entirely inside Network A.

Provide **Try an overlapping example**, **Try separate networks**, and **Try identical networks**. Changing B to `192.168.2.0/24` should show that these ranges have no addresses in common. Explain that lack of overlap alone does not establish connectivity; routes and security settings also matter.

Add **Show how we checked**: compare the two starting addresses and the two ending addresses; the shared interval exists if the later start does not come after the earlier end. If an entered address is normalized to a network boundary, show the resulting network explicitly.

Overlap concerns the full ranges, including reserved addresses. It is not automatically a configuration error: a subnet sitting inside its parent network is expected. Explain the practical consequence for the current scenario instead of showing a universal red warning. For distant or very unequal ranges, retain exact textual results and label any visual scale adjustment.

## 5. Readability and larger views

Provide three clearly named controls with different purposes:

| Control | Behavior |
| --- | --- |
| Zoom in / Zoom out | Enlarge or shrink the diagram's contents. |
| Fit diagram | Adjust the view to include the current diagram. |
| Fullscreen | Open the visual and its essential teaching controls across the available screen. |

Add fullscreen to the topology canvas, address grid, subnet division visual, and new overlap visual. Include a visible Exit fullscreen button and Escape support. Use native browser fullscreen where supported and an expanded in-page view as a fallback. Preserve experiment values, allocation state, selection, playback position, and the prior diagram view when entering and leaving.

In a fullscreen network view, retain a compact source/destination bar, playback controls, current explanation, and access to selected-device details. Keep these controls inside the fullscreen container. The learner should be able to understand and operate the experiment without leaving fullscreen.

The default small-laptop layout should prioritize the current activity. Navigation and the component library can collapse; device details open on demand; explanations can sit below the visual. Also account for short viewport heights so a large header does not push all useful controls below the screen.

Typography proposal: approximately 16 px body text and 14 px supporting labels, with comfortable line spacing and a **Text size: Standard / Large / Extra large** preference. These are design targets, not claimed accessibility minimums. Use relative sizing and stop reducing essential text to fit columns. Diagram zoom and interface text size must have separate controls.

Validate at 1366×768, 1280×720, and 1024×768, plus browser zoom and a narrow mobile view. Text must support enlargement to 200% without losing content or functionality, following [W3C Resize Text guidance](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html). Surrounding instructions and forms should reflow; two-dimensional diagrams can retain pan and zoom, consistent with [W3C Reflow guidance](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html). Browser fullscreen requires capability checks and fallback handling; see the [MDN Fullscreen API reference](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API).

## 6. Explain what is happening in every lab

Use the existing simulation events to drive an explanation of **what happened**, **why**, and **what to try next**. The highlighted device, packet animation, explanation, and step counter must refer to the same event. Guidance must reflect the actual result, including failures and changed configurations.

| Area | Added guidance |
| --- | --- |
| Packet journey | Explain source, destination, request, and reply. Use plain step titles such as “Finding the next device” alongside optional ARP details. Offer Next step, Back, Replay, and slower playback. |
| Device details | Explain what the selected resource does. For each important field, give its purpose, an example, and the effect of changing it. Show when an edited value has been applied. |
| Routing | Show the destination, matching ranges, chosen route, and why that route is more specific. Link a failed lookup to the relevant route settings. |
| Security | Show which boundary checked the packet, the matching rule or absence of an allow rule, direction, and result. Explain the request and reply separately. |
| NAT | Display the private source and translated public source side by side, followed by the return translation. Define a port when it first appears. |
| Terminal | Provide clickable sample commands, identify the device running the command, and explain the output in plain language. |
| Challenges | Explain the symptom, provide progressive hints, and show why the learner's repair restored connectivity. |

For example, replace a standalone “ARP unanswered” with an explanation tied to the actual failure: “Your computer tried to reach its gateway at 192.168.1.254, but received no reply. Check that the gateway address belongs to a reachable router.” Offer **Inspect gateway setting** and **Run again**; use trace evidence before suggesting a specific fix.

Animations should direct attention to the current action. Allow pause, manual stepping, and reduced motion. Narration and status must remain useful when animation is disabled. Avoid presenting all advanced fields and every trace event as equally prominent.

## 7. Implementation sequence

| Phase | Deliverable | Completion condition |
| --- | --- | --- |
| 1. Make the core experience readable | Typography and layout improvements; collapsible panels; reusable fullscreen container; clear Fit and Fullscreen labels. | A small-laptop user can read, enlarge, operate, and exit the main visual while preserving state. |
| 2. Complete one teaching flow | Shared explanation pattern; address-grid redesign; overlap inputs, ranges, visual, and worked examples; CIDR field help. | A beginner can explain available/reserved addresses and demonstrate why two ranges overlap. |
| 3. Introduce guided learning | First-visit entry; foundational lessons; glossary; resumable guidance; beginner explanations for device fields and packet playback. | A new learner can complete the first network experiment and explain its result with no external instructions. |
| 4. Apply the pattern across the labs | Routing, AWS, security, NAT, terminal, and challenge explanations and guided variations. | Every major tool answers what it does, how to use it, and what its current result means. |
| 5. Validate and refine | Beginner sessions, small-screen review, accessibility checks, and relevant regression tests. | Observed confusion is resolved and existing network behavior still passes required checks. |

The first reviewable milestone is phases 1 and 2: it addresses the two examples raised and establishes the visual and explanation patterns for later lessons. Review comprehension throughout implementation, rather than waiting until the final phase.

Implementation mapping:

- `src/App.tsx`: entry experience, navigation, help, and layout controls.
- `src/styles.css`: readable sizing, responsive layout, fullscreen styling, and reduced motion.
- `src/components/NetworkCanvas.tsx`: fit/zoom/fullscreen controls and active-step emphasis.
- `src/components/CidrPlayground.tsx`: address details, explicit allocation actions, overlap visualization, and worked examples.
- `src/components/Fields.tsx` and `Inspector.tsx`: shared field explanations and commit feedback.
- `src/components/Console.tsx`: synchronized plain-language playback and result guidance.
- `src/components/LabTools.tsx` and `Challenges.tsx`: contextual lessons and explanations of failures and repairs.
- `src/store.ts`: shared display preferences and guide progress with clear persistence boundaries.
- Shared additions: reusable visual container, explanation panel, glossary, and structured lesson content.

Reuse arithmetic and simulation results for displayed values. Add structured decision metadata only where current events cannot support an accurate explanation; avoid a separate teaching simulation or interpreting free-text error messages as logic. Preserve a single state source when expanding panels so opening fullscreen never creates a second experiment.

## 8. Acceptance checks

User checks with 3–5 people unfamiliar with networking:

1. Identify where to start and send the first prepared message without coaching.
2. Explain what an address square represents, select an available address, mark it as used, and release it.
3. Explain why a reserved address cannot be used in the selected example.
4. Compare two networks, identify their shared range, and load a non-overlapping example.
5. Enlarge a diagram, read its explanation, change zoom, and return without losing work.
6. Explain one successful packet journey and find the setting associated with a failed journey.

Success is demonstrated understanding and task completion. Record where people hesitate, misinterpret a label, or need help, then revise those parts. Proposed target: at least four out of five participants complete the address and overlap tasks without coaching and can explain the outcome.

Implementation checks should cover:

- Fullscreen entry/exit, unsupported API fallback, focus restoration, keyboard operation, and state preservation.
- Small and short laptop layouts; 200% text enlargement; narrow reflow; visible labels and controls.
- Address reservations, allocation counts, page navigation, and reset behavior across IPv4 and AWS modes.
- Disjoint, adjacent, contained, identical, and invalid comparison ranges; correct endpoints and intersection counts.
- Playback explanations matching the current trace, including reverse traffic, failure, replay, and reduced motion.
- Guidance resumption, explicit example loading, and restoration of the previous experiment.
- Existing engine and browser workflows plus the production build after the relevant implementation changes.

## Follow-up: manual node connections

The original planning pass made no application changes. The subsequent request to check manual connections is implemented separately:

- Existing handle connections remain available: drag from the right dot on one card to the left dot on another.
- A visible **Connect nodes** form now supports choosing two named nodes without precise dragging, with a description before applying the connection.
- Local mode adds a bidirectional cable; cloud mode applies supported route-table/gateway, instance/security-group, and NAT/Elastic-IP associations in either selection order.
- Duplicate, same-node, missing-node, unsupported cloud, and cross-VPC route/security connections receive explanations instead of silent failure.
- Undo/redo applies to these changes. New security-group and Elastic IP association lines make the configured relationships visible.
- Form controls use readable text, stack on small screens, support keyboard navigation, and can be closed with Escape.

The broader teaching and fullscreen improvements above are now implemented. Real learner sessions are still needed to assess comprehension against the proposed user-study target.
