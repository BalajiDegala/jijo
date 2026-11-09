# raga-git

Live: [raga-git.vercel.app](https://raga-git.vercel.app). The previous GitQuest address remains available. Browser progress is saved separately for each address.

The latest update adds command-driven graph explanations to Git Visual Lab at `/branches`: persistent commit selections, numbered parent paths, range and diff highlights, and a camera that follows the action. Start with V08 for HEAD and ancestry or V07 for branch switching and detached checkout. The lab includes 13 guided stories with snapshot playback, file inspection, prediction questions, transcripts and saved checkpoints. See [the graph focus update](docs/git-visual-focus-plan.md), [the player implementation notes](docs/git-visual-lab-update.md) and [the earlier experience audit](docs/experience-update.md).

A full-screen Git learning workspace built with Next.js App Router, React, JavaScript, custom CSS, Lucide, Framer Motion and custom SVG. No database, credentials or environment variables are required for Vercel deployment.

## Run

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. Use Node 22 or newer. For production, run `npm run build` then `npm start`.

## Included

- Collapsible navigation rail and a viewport-constrained Playground with four repository panes, interactive graph and terminal. Desktop checked at 1920×1080, 1366×768 and 1280×720; mobile uses panel selection.
- Pure Git model with files/index/commits/refs, conflicts, branches, HEAD, recovery, stash, lightweight tags and explicit unsupported-command errors.
- Independent remote commit storage, clone/fetch/push/pull, divergence, rejected pushes, upstream tracking and teammate actions.
- Forty practical labs: thirty browser command exercises with repository-state verification and ten evidence workshops. Twenty-three additional incident exercises correspond to Q58–Q80.
- All eighty original interview questions and source answers, chapter-based lessons, editorial corrections, knowledge checks, filters, source locations, self-assessment and revision lists. Original notes and diagrams remain accessible.
- Windows PowerShell, macOS and Linux practice instructions, copy controls, isolated local/bare repositories, expected outcomes, precautions and manual verification. Additional topic exercises cover patch staging, subtrees, worktrees, objects, maintenance and other advanced tools.
- Local persistence separating verified simulation, knowledge checks, evidence assessments and self-reported machine practice. No guessed practice-time statistics.
- Meaningful state highlights and commit graph transitions, graph pan/zoom/fit, file and commit inspection, keyboard command history/autocomplete, native dialogs and reduced-motion support.
- Git Visual Lab: V01–V12 plus a complete everyday lifecycle, searchable topics, previous/next/play/pause/replay/seek, four playback speeds, separate viewing and knowledge-check records, and the existing comparison demos.

## Validate

```sh
npm test
npm run build
```

With `npm start` running in another terminal:

```sh
npx playwright install chromium
npm run e2e
```

Tests exercise simulator semantics and invariants, all thirty executable scenarios, remote separation and conflicts, source numbering/mappings, progress serialization, actual Git instructions in disposable repositories, and real PowerShell machine plans on Windows. Browser tests cover viewport geometry, long history/output, guided workflows, rail/mobile navigation, original question coverage, assessment and revision persistence, file editing, graph controls, all lesson/scenario routes and axe accessibility. QA fixtures/screenshots remain under ignored `.local/`; failure traces use `test-results/`.

## Deploy

The project is linked locally to Vercel project `gitquest-lab`. `vercel.json` uses the Next.js preset with `npm ci` and `npm run build`.

```sh
vercel --prod
```

No simulator operation contacts GitHub or runs a shell on Vercel or on a visitor's computer. Read [the supported scope](docs/simulator-scope.md) for exact boundaries, particularly whole-file conflicts, clean linear rebase, single-remote scope and advanced real-machine-only operations. Real-machine checkboxes are learner reports, not remote verification. Uncached navigation still needs a network connection; this is not a service-worker offline app.

## Content and architecture

| Path                                                                  | Responsibility                                                               |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `components/shell.js`, `workspace.js`                                 | Compact application shell and viewport workspace                             |
| `components/history-graph.js`                                         | Actual commit/ref visualization and inspection                               |
| `lib/git-engine.js`                                                   | Pure deterministic command/state model, including remote store               |
| `lib/scenario-engine.js`                                              | Scenario loading, expected states and step verification                      |
| `lib/scenario-concepts.js`, `components/concept-explainer.js`           | Topic introductions, before/after illustrations and learning paths           |
| `lib/command-help.js`, `lib/graph-camera.js`                            | Command help/typo suggestions and testable graph camera geometry               |
| `lib/visual-lab/`, `components/visual-lab/`                            | Authored visual lessons, immutable snapshots, playback, file inspection and checkpoints |
| `lib/curriculum-manifest.js`                                          | Required forty-lab inventory, source mappings, editorial corrections         |
| `lib/curriculum/source.json`                                          | Preserved source questions/answers and notes                                 |
| `lib/incident-labs.js`                                                | Q58–Q80 incident evidence and advanced workshop definitions                  |
| `lib/machine-practice.js`, `machine-fixtures.js`, `topic-practice.js` | OS instructions, reproducible real-Git fixtures and advanced topic exercises |
| `components/curriculum.js`                                            | Lessons, scenario library, evidence labs, interview and progress             |
| `lib/progress.js`                                                     | Defensive local storage adapter with backward-compatible records             |
| `docs/implementation-plan.md`                                         | Architecture, acceptance and phased checklist                                |
| `docs/scenario-matrix.md`                                             | Complete source and scenario traceability matrix                             |

After editing the source mapping, run `node scripts/import-curriculum.mjs` and content tests. Original guides remain unchanged. Existing local progress is preserved under `gitquest-progress-v1`; new typed completion fields avoid treating legacy manual records as verified. Future server storage can replace the adapter without putting credentials or command execution into the client.
