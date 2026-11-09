# AWS learning builder

Extend the existing React/TypeScript, Zustand and React Flow implementation. Keep the current local labs, three-tier graph, simulations and visual system. No new dependency or backend is needed.

The new builder uses the existing topology and save/export format, with optional scenario metadata. Resource definitions, dependency-aware creation, relationships, validation, scenario content and guide generation live in separate modules. Existing projects remain loadable. The builder is available from the AWS page and #aws-learning.

Incremental delivery: model and catalog; creation and layout; relationship/property editors; modeled checks and complete two-subnet scenario; dynamic AWS guide; unit and browser regression tests. Advanced resource types support architectural modeling, with explicit limits on simulation. The first complete validation scenario is private IPv4 EC2-to-EC2 communication in one VPC.

## Launch and use

Run `npm install` then `npm run dev`, and open `http://127.0.0.1:5173/#aws-learning`. The existing AWS page also offers **Start two-subnet lab**. Follow Add VPC, two subnets and one EC2 in each. Configure Security Groups, explicitly review host-firewall assumptions, and use **Check My Architecture**. ICMP Echo Request and TCP application tests are supported. View or download the guide after configuring the diagram.

Guided and free modes share the same topology. The resource picker selects nested resources even when zoomed out; canvas selection, drag, connection handles and the connection form also work. Undo/redo covers model edits. Auto-arrange groups boundaries and policy resources. Autosave uses `netverse.aws-builder.v1`; existing JSON save/import remains available. Reset is undoable.

Creation follows the original click-to-add interaction: select a parent and click Add to create with a suggested name and defaults, then edit properties afterward. The selected resource's enclosing parent is also recognized. A placement-only chooser appears when a required parent is ambiguous or missing. Adding does not run auto-arrange; use the explicit Auto arrange control when desired.

The existing labs and guided scenario render the same `ComponentLibrary` sidebar, with the original heading, search, component labels and drag/click controls. Starting a scenario retains the search and the common component ordering. Guided AWS resources use dependency-aware creation, including when dragged onto a nested boundary; the original labs retain their existing creation behavior.

## Implementation inventory

- `src/data/awsResources.ts`: categorized catalog, dependencies, descriptions and documentation links.
- `src/data/awsScenarios.ts`: structured ten-step scenario and completion conditions.
- `src/engine/awsBuilder.ts`: resource defaults, placement, arrangement, property changes and suggested rules.
- `src/engine/awsRelationships.ts`: typed relationships derived from actual assignments and routes; edits change those assignments.
- `src/engine/awsValidation.ts`: configuration errors and modeled connectivity checklist.
- `src/engine/awsGuide.ts`: diagram-specific Console steps, values, mistakes, commands and Markdown export.
- `src/components/ComponentLibrary.tsx`: shared library for existing labs and guided scenarios; replaces the separate AWS resource panel. `useAwsResourceCreation.tsx` supplies dependency-aware creation and optional placement selection. `AwsInspector.tsx` and `AwsLearning.tsx` provide property/policy/route editors, guided progress, validation and guide UI.
- `src/awsBuilder.css`: responsive builder styling using the existing visual identity.
- Existing `App.tsx`, `NetworkCanvas.tsx`, `ConnectionTools.tsx`, `Icons.tsx`, `main.tsx`, `store.ts`, engine types, persistence, connection/security/topology engines and learning definitions integrate the builder while retaining previous labs.
- `src/engine/awsBuilder.test.ts` and `e2e/aws-learning.spec.ts`: engine and browser regression coverage. `e2e/node-selection.spec.ts` protects selection through nested layers.

## Model and accuracy

Placement IDs encode Cloud → Region → VPC → Availability Zone → Subnet → EC2. Route-table, ACL and Security Group assignments are separate from placement. Route tables contain destination/target rules, and policy resources contain direction/protocol/peer rules. Visual intent lines never grant reachability.

The validator checks CIDR containment/overlap, usable private IPs, placement, effective local routing in both directions, source outbound and destination inbound Security Groups (including references and multiple groups), stateless ACL request/return directions, running-state assumptions and host/application configuration. ICMP uses type/code, not TCP ports. Security Groups are stateful. TCP return-ACL modeling uses client port 49152, clearly identified in the guide. Default main routing and default ACL behavior are modeled without requiring an internet or NAT gateway for same-VPC communication.

## Verification and limits

Run `npm test`, `npm run build`, and `npm run test:e2e`. Verification on 2026-11-02: 96 engine tests and all 45 browser cases passed, including the five AWS builder workflows, shared-library continuity and drag placement, existing labs, fullscreen, mobile, persistence and nested node selection.

This is local configuration validation, not live AWS connectivity testing. No AWS credentials, API calls or infrastructure changes are performed. Host firewall and runtime/application state remain user-provided assumptions. The completed scenario covers IPv4 ICMP/TCP between two EC2 instances in one VPC. Advanced catalog resources support architecture and relationship modeling; their complete service behavior, cross-VPC routing, IPv6, internet connectivity and additional guided scenarios are not validated by this scenario. Browser storage is local to the browser; export JSON for a portable copy.
