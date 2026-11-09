# NetVerse delivery log

## Milestone 1 — verified

Implemented React/TypeScript dashboard, XYFlow canvas, draggable device library, editable interfaces and routes, CIDR calculator, animated decision traces, save/load, import/export, and undo/redo.

Validation: production build passed; 18 engine/persistence tests passed; 2 browser tests passed (successful traffic, broken gateway, undo, saving/loading, CIDR/AWS calculation).

Model limits: deterministic Ethernet broadcast domains; no VLAN or spanning-tree model. Fixed request/response source port; no real packet transmission.

## Milestones 2 and 3 — verified

Added nested region/VPC/AZ/subnet resources, route-table associations, local VPC routes, internet gateways, public IPv4 mapping, public NAT and Elastic IPs. Added stateful SG checks, ordered stateless NACL checks (including NAT subnet boundaries), deterministic request/response connection tracking, NAT mappings, packet inspection, and simulated terminal commands.

Validation at this milestone: production build passed; 45 unit/integration tests passed, including public/private internet access, NAT rejection, independent reverse paths, and ephemeral return ports. Final browser validation also covers the NAT translation table, gateway disable/enable, and unsolicited inbound rejection.

Model limits: one primary IPv4 per instance, one SG per instance, one NACL per subnet, public NAT only. No peering, gateway ingress routing, or VPC middlebox routes. Unassigned NACLs represent the default allow-all ACL. Connection tracking and NAT mappings last one experiment.

## Milestone 4 — verified

Implemented five broken-topology challenges with progressive hints and engine-based verification; a ten-step guided VPC build; contextual routing/security/NAT explanations; subnet exposure derived from routing; actual MAC and NAT tables; responsive desktop/mobile layouts; accessible named controls; import validation; documentation and model boundaries.

Final checks (2026-10-24):

- **59 Vitest tests passed**, covering all 15 categories requested in the brief, plus firewall directions, static routing, malformed imports, and challenge-specific objectives.
- **9 Playwright browser workflows passed**: local success/failure and undo, save/load, CIDR interactions, NAT success/failure/inbound rejection, full guided build from blank, security challenge repair, mobile viewport, adding and connecting a host, terminal decisions, and JSON import/export. Some workflows cover multiple behaviors.
- **Production TypeScript/Vite build passed**, with dependency bundles split below Vite’s chunk warning threshold.
- **Production smoke check passed**: HTTP 200, local packet delivery, private NAT delivery, and zero browser runtime errors.
- Desktop and mobile screenshots were inspected. Preview artifacts are in the ignored `.local/` directory.

The final cloud acceptance flow is supported by the guide and documented in `README.md`. All simulations remain deterministic, local, and separate from the rendering layer. No real cloud resources were provisioned or packets transmitted.

Known limitations are documented in the README and the in-app Simulation notes. Saves are explicit; lesson completion and traffic history are session-only. Text inputs commit on blur or Enter. Changing lab modes loads an undoable template. No external deployment was requested or performed.

## Manual node connections — verified (2026-10-24)

Added a visible Connect nodes form with named node selections, descriptions before applying changes, duplicate/self-link feedback, and Undo/Redo support. Canvas handles remain available. Cloud association pairs work in either order, reject unsupported and cross-VPC route/security combinations, and show security-group/Elastic-IP association lines.

Validation:

- 64 engine/integration tests passed, including five new connection tests.
- All nine existing browser workflows passed, including handle connections and cloud simulations.
- Three new browser workflows passed after correcting the form's accessible labels: manual cable delivery and Undo/Redo, cloud associations, and small-screen keyboard interaction.
- Production TypeScript/Vite build passed after the label correction.
- Inspected `.local/manual-connections.png` from a 1366×768 viewport; the form uses readable labels and fits the available width. The narrow-screen workflow verified 390×844 layout without page overflow.

The wider teaching and fullscreen work is described in `LEARNING_UX_PLAN.md`.

## Learning and readability — verified (2026-10-25)

Implemented shared fullscreen panels with native/fallback handling, focus restoration, and experiment/viewport preservation; relative typography with persistent size preferences; collapsible navigation and scrollable device library; an address-grid/list exercise with explicit allocation and reservation explanations; overlap ranges, intersection counts, aligned bars, normalization, and worked examples; eight guided lessons with understanding checks and restoration of the prior experiment; a searchable glossary; contextual resource/field explanations; synchronized packet teaching, terminal examples, and lab-specific guidance. Reduced-motion settings start playback paused.

- 69 engine/integration tests passed.
- 24 Playwright workflows passed, including all previous functionality and 12 new learning/accessibility workflows.
- Native fullscreen and rejected-API fallback both preserve playback, configuration, focus, and the canvas viewport.
- Verified 1366, 1280, 1024, and 390 px layouts, extra-large text, and 200% root text sizing without page overflow in the tested CIDR flow.
- Production TypeScript/Vite build passed.
- Screenshots reviewed for the manual connection layout and enlarged CIDR lesson.

The requested Vercel project is `roopa-net`. Deployment configuration builds the Vite static app; development artifacts and local planning files are excluded from upload. Human beginner sessions have not been conducted, so comprehension targets remain unverified.

## Production deployment — published (2026-10-25)

- Public alias: https://roopa-net.vercel.app
- Vercel project: `balaji-degalas-projects/roopa-net`.
- Deployment: https://roopa-cmxlmue4p-balaji-degalas-projects.vercel.app
- Vercel production install, TypeScript checks, Vite build, and publication succeeded.
- Public HTML, main JavaScript, and stylesheet requests returned HTTP 200.
- A final fullscreen review moved the journey console beside the diagram for laptop screens. Both native and fallback fullscreen tests passed again, including simultaneous canvas/playback/explanation visibility and restoration of the prior view.
- Direct live-browser testing was attempted but stopped by `ERR_NETWORK_ACCESS_DENIED`. Local browser checks remain the evidence for interactive behavior; no successful live-browser check is claimed.
- `npm audit --omit=dev` reported zero production-dependency vulnerabilities. The existing Vitest development toolchain has three audit findings; upgrading that toolchain is a separate maintenance task.

## Cloud layer layout correction (2026-10-25)

Fixed the larger-card CSS rule overriding cloud container widths. Region, VPC, availability-zone and subnet boundaries now fill their React Flow layout boxes. Starter and guided-build layouts reserve space for wrapped headings; device labels wrap, and subnet exposure labels stay clear of cards. Cloud fit controls leave room for the diagram toolbar. Laptop fullscreen keeps at least 480 px for the diagram, with packet controls and the journey in a scrollable side panel.

- Added geometry regression checks at 1366 x 768 and 1024 x 768, with standard and extra-large text and expanded fullscreen. They check boundary sizes, nesting, sibling/header/footer overlap, toolbar clearance and packet delivery.
- Reviewed normal and expanded cloud screenshots at both laptop sizes.
- Production TypeScript/Vite build and all 69 engine tests passed.
- All 26 browser workflows passed across the full run and targeted rerun. Two tests were interrupted by the development-server reload during formatting and passed once formatting finished. Native and fallback fullscreen preservation also passed separately.
- Published to https://roopa-net.vercel.app (deployment: https://roopa-q0g4ylgxw-balaji-degalas-projects.vercel.app). Vercel's production build succeeded; the public page and newly built CSS/JavaScript assets returned HTTP 200. Interactive checks were run locally.

## Terminal output and packet flow (2026-10-25)

Resumed the interrupted terminal/journey update. Terminal output now follows new results, keeps the command input visible and focused after Enter or Run, and places optional command examples below the working console. Output is keyboard-scrollable and announced as a log. Switching tabs and clearing output retain usable command entry.

The packet flow now has an explicit step count, a keyboard-operable slider, and numbered cards with earlier/later scroll buttons. Selection and playback automatically reveal the current card. On laptop fullscreen the flow spans the bottom; the current explanation scrolls independently beside the diagram. Fullscreen spacing preserves room at enlarged text sizes, and the diagram refits after its available space changes. Leaving fullscreen restores the original viewport.

- 69 engine tests passed.
- All 32 browser workflows passed in the final full-suite run. Six new workflows cover native fullscreen at 1366 px, fallback fullscreen at 1024 px with extra-large text, and 390 px mobile: every stage of the 27-event NAT exchange, keyboard scrubbing, automatic playback, scroll-button boundaries, diagram containment, output overflow, Enter/Run, examples, tab changes, and clearing.
- Native/fallback viewport restoration and the existing cloud layout checks passed again after the resizing fix.
- Reviewed the fullscreen flow and terminal screenshots at both laptop sizes.
- Final TypeScript/Vite production build passed.
- Published to https://roopa-net.vercel.app (deployment: https://roopa-1ucfx95qq-balaji-degalas-projects.vercel.app). Vercel's production build succeeded, and the public page plus the new main JavaScript and CSS assets returned HTTP 200.
- Direct live-browser verification was attempted again and remains blocked by `ERR_NETWORK_ACCESS_DENIED`; interactive verification was local.

## Manual AWS container sizing (2026-10-25)

Manual regions and VPCs previously shared the same 960 x 600 default size. Nesting an equally sized VPC caused React Flow to clamp its inset to the region's edges, overlapping boundaries and headings. Manual containers now use distinct default dimensions and reserve a heading area and margins at every level.

New containers are placed clear of their siblings; enclosing containers grow as content is added or resized. Edge drops account for the full container dimensions, and adding a VPC respects the selected region. Moving a VPC to another region and resizing containers preserve containment. All related placement and size changes belong to the same undo/redo edit.

- 75 engine tests passed, including six manual layout tests for nested bounds, additional zones and VPCs, multiple regions, edge drops, resizing, reassociation, and undo/redo.
- All 35 browser workflows passed across the full run and targeted rerun. Two unrelated workflows reloaded during a documentation edit and passed on rerun.
- Three new browser workflows cover manual builds at 1366 and 1024 px, standard and extra-large text, fullscreen, additional VPCs, undo/redo, and a VPC dropped near a region's edge.
- Both manual-build screenshots were reviewed; all parent headings and nested boundaries are distinct.
- TypeScript/Vite production build passed.
- Published to https://roopa-net.vercel.app (deployment: https://roopa-6xusf96lu-balaji-degalas-projects.vercel.app). Vercel reported successful production publication and alias assignment; the public page returned HTTP 200. Interactive checks were local.

## Node selection across cloud layers (2026-11-02)

Fixed container boundaries intercepting resource clicks in diagrams built from scratch. The canvas now explicitly orders boundaries, connections, and resource cards, so selecting a container or showing its resize controls cannot raise it over unrelated resources.

- Added a browser regression that builds a blank cloud diagram and selects gateways, route tables, security groups, and EC2 nodes after selecting each container level.
- All 39 local browser workflows and 80 engine tests passed; the TypeScript/Vite production build passed.
- Published to https://roopa-net.vercel.app (deployment: https://roopa-14zrbws50-balaji-degalas-projects.vercel.app). Vercel's production build and alias assignment succeeded. The public page and new JavaScript/CSS assets returned HTTP 200.
- The live selection test was attempted but browser access was blocked by `ERR_NETWORK_ACCESS_DENIED`. Interactive verification was local.
