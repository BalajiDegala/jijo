# TerraForge

A desktop-first, local-first visual Terraform engineering studio built with Next.js, React, TypeScript, Tailwind CSS, Radix/shadcn-style primitives, XYFlow, Monaco, Dagre, Zustand, Lucide, and Framer Motion.

## Run

Requires Node.js 22 or newer.

```sh
npm install
npm run dev
```

Open http://127.0.0.1:3000. A static production build is generated with `npm run build` in `out/`.

Browser assets for Monaco, Dagre, and the HashiCorp HCL parser are copied by `scripts/copy-assets.mjs` during installation. They are served from the same origin. No project contents are sent to public APIs.

## What works

- Canonical project model, extensible resource registry, and separate Terraform generation / graph projections.
- Nested account, region, VPC, availability-zone, subnet, and EC2 visualization.
- Separate topology, Terraform dependency, explicit route, and inventory views.
- Add resources from the library or command palette; select, drag, configure, connect compatible references, or remove them.
- Generated versions, providers, main, variables, outputs, and example tfvars files.
- Contextual inspector with literal values, variables, resource/data references, expressions, security rules, and field-level explanations.
- Compact count and for_each groups, editable keys and counts up to 1,000.
- Ten architecture templates, including multi-VPC peering, ALB targets, and a three-tier example.
- Monaco search, folding, highlighting, generated-block selection, explicit HCL drafts, and code-to-resource selection.
- Build, Explain, Reverse, Debug, Challenge, and Memory modes. Code exercise checking uses parsed HCL, not string equality.
- IndexedDB autosave, undo/redo, file-based project backups, and complete ZIP export.
- Model validation for names, required fields, references, cycles, CIDRs, cross-VPC security groups, scale settings, and explicit internet routes.
- Resizable panels, collapsed code panel, command palette, keyboard shortcuts, light/dark themes, tooltips, accessible dialogs, and reduced-motion support.

## HCL import boundaries

`@cdktf/hcl2json` uses HashiCorp HCL v2 in WebAssembly. `src/lib/import.ts` adapts its bridge to the browser and explicitly normalizes supported structures into the model. Unknown resource types, dynamic/lifecycle blocks, aliases, unsupported arguments, and nonliteral for_each collections stop import before changing the project. Comments and formatting are normalized. Provider default tags and Terraform version requirements are normalized with a notice.

This is an explicit parse-and-apply workflow, not unrestricted lossless two-way synchronization.

**Current environment limitation:** network access prevented downloading `@cdktf/hcl2json`. Its browser bridge and installation path are implemented, but the WASM asset is absent from this local checkout until `npm install` succeeds. HCL import, applying editor drafts, and Reverse/Memory answer checking report that limitation. They do not silently substitute a regex parser. Monaco and Dagre are available as locally reused browser assets; their notices are in `public/THIRD-PARTY-NOTICES.txt`.

## Validation and safety boundaries

The UI validates the canonical model. It does not run Terraform, connect to AWS, estimate live pricing, or provision resources. Route visualizations show explicitly configured paths, not verified live reachability. Existing VPC routes, network ACLs, quotas, AMI availability, IAM permissions, and module internals require separate verification.

SSH examples use the documentation-only CIDR `203.0.113.0/24`. Replace it with your actual trusted range before applying. Public subnet names never imply internet connectivity. Generated key examples register only the public key; private keys remain in Terraform state and no PEM is downloaded by the studio.

Do not enter credentials or private keys. Supply sensitive inputs separately through your Terraform environment. State must be secured outside TerraForge.

## Checks

```sh
npm run typecheck
npm test
npm run build
```

For browser checks, serve `out/` or run the development server, then:

```sh
npm run test:e2e
```

`BASE_URL` optionally changes the preview URL. `CHROMIUM_PATH` optionally selects an installed Chromium executable.

The nine AWS-only templates have also passed `terraform validate` using Terraform 1.16.5 and the locally installed AWS provider 6.71.0 in isolated scratch directories. The generated-key template passed HCL syntax/model checks; provider-backed validation of its TLS block still requires installing the TLS provider. No plans or applies were run, and the surrounding Terraform project/state were not modified.

## Vercel release

`vercel.json` specifies the Next.js static export. `.vercelignore` excludes scratch Terraform validation files, local caches, generated builds, dependencies, and unrelated hosting metadata. The production installation must run the asset copy postinstall step.

```sh
vercel --prod
```

Vercel deployment has not been completed: the session's CLI network calls were rejected with EACCES. An authenticated, permitted Vercel connection is required before a live URL can be verified.

## Source map

- `src/lib/model.ts`: typed canonical resources, literals, expressions, references, and layout.
- `src/lib/registry.ts`: resource schemas, defaults, field explanations, and nested-block metadata.
- `src/lib/hcl.ts`: pure project-to-HCL generation.
- `src/lib/validation.ts`: static model checks and configured internet-path analysis.
- `src/lib/graph.ts`: separate graph projections and Dagre adapter.
- `src/lib/store.ts`: Zustand actions, history, and IndexedDB persistence.
- `src/lib/import.ts`: real HCL parser adapter and strict normalization.
- `src/lib/templates.ts`: architecture examples.
- `src/components/`: studio shell, editor, canvas, inspector, catalog, learning panel, and UI primitives.
