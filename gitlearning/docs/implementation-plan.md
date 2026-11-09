# GitQuest Lab implementation plan

## 1. Goals and journeys

Learn → Visualize → Execute → Inspect → Practise → Verify. A beginner opens a source-linked lesson, sees a concrete repository, runs a guided command, inspects its effect, repeats it in an isolated real repository, and answers a knowledge check. An experienced developer starts from an incident, diagnoses evidence, chooses a recovery strategy, verifies it, and revisits the corresponding original interview answer. Progress remains local and distinguishes simulator verification, decision assessment, and self-reported machine practice.

## 2. Inspection and architecture

Existing Next.js App Router / React JavaScript app, custom CSS, Framer Motion, Lucide, custom SVG graph, node:test and Playwright. Retain these dependencies and the tested pure local Git engine. No language migration. Existing 16 exercises and 20 supplemental quiz questions are retained where appropriate. Replace the tall playground and permanent sidebar. Existing remote pointers share local storage; replace with a distinct remote object database before claiming remote coverage.

Modules: compact Shell; Workspace; repository panels; graph inspector; terminal; pure command engine; remote transfer/collaboration model; structured scenario loader and state verifier; imported source curriculum and authored manifests; lessons and incident evidence labs; OS-specific machine instructions; storage adapter; unit/integration/browser tests. Source documents remain unchanged. No reference screenshot exists in supplied files; use the user's diagram and inspect existing app.

## 3. Layout and responsive behavior

100dvh shell with a 60px default rail, 52px header and minmax(0,1fr) content. Playground: compact objective strip, four equal-width repository areas in one row, then graph and terminal in two columns. Every grid child uses min-width:0/min-height:0. Long file lists, history and terminal output scroll inside their own panes. User-controlled graph/terminal proportions and expandable instructions. At laptop widths retain four state areas. Below 900px use accessible Workspace / Graph / Terminal selection; instructions open as a dialog. Other destinations scroll inside the main content region. Navigation expansion persists. No viewport-wide scroll or footer in the workspace.

## 4. Complete curriculum inventory

Both `git-docs.md` and `Git_Version_Control_Interview_Preparation_Guide.md` are available. Parse all 80 body headings, preserving numbering, full source answers, source line numbers and categories (1–25, 26–48, 49–57, 58–80). The generated `scenario-matrix.md` inventories every question and every topic in git-docs, including diagrams and commands. Original notes are also available in-app. Authored corrections are labeled separately from source text. OCR formatting, misleading recovery guarantees, credential storage, bigFileThreshold, merge-revert ancestry and outdated absolute claims are flagged for review.

## 5. Scenarios and prerequisites

40 required practical scenarios in `lib/curriculum-manifest.js`; 23 dedicated incident exercises trace Q58–80 to related command labs. Each executable definition contains context/objectives, setup state, ordered commands, expected state, explanations, mistakes/recovery, verification, challenge and cleanup. A common loader constructs deterministic start states and command-derived expected snapshots. Advanced tools beyond the command model use substantive evidence/decision exercises and real-machine instructions, explicitly labeled as such. They do not return fake command success.

## 6. Coverage matrix

See `docs/scenario-matrix.md`: all 80 source questions, 40 initial scenarios, 23 incident mappings, plus all git-docs topic groups. Each source question is also a lesson and interview entry with related practice links. Tests enforce numbering, inventory, prerequisites and internal references. Coverage means accessible substantive material and an exercise; it does not imply every advanced Git tool is simulated.

## 7. Local and remote model

Local commits/index/working tree/branches/HEAD/tags are independent of remote commits and remote branches. Tracking refs are a local snapshot of remote state. Clone copies reachable objects and configures origin/main upstream. Fetch copies missing objects and updates tracking refs only. Push validates ancestry and protection before transferring reachable commits. Pull performs fetch then merge/rebase. Teammate actions commit into the remote database independently; they never silently update local refs. Rejections leave remote history intact. Graph membership derives from both databases, not a decorative cloud state.

## 8. Commands and state

Pure deterministic transitions return state, output, error and a concise explanation. Parser accepts explicit supported flags and rejects unknown options. No eval, arbitrary shell or network. Existing local commands remain; add config, rm, ignore, clone, remote management/upstream. Whole-file conflict granularity remains disclosed. Rebase supports clean linear replay; unsupported conflict continuation/interactive editor commands route to machine practice. Hashes are deterministic teaching IDs, not real Git cryptographic object IDs. Scenario completion compares observable state and required read-command completion, not only command spelling. Reset reloads state and session steps while preserving overall progress.

## 9. Real-machine practice

Explicit separate mode. OS/shell selection, installation links, unique practice folder, repo-local author configuration, copy individual/all, expected state, verification checklist and manual completion badge. Commands run only on learner's machine. Windows PowerShell and macOS/Linux shell differences handled in setup/file operations. Local bare remotes reproduce two-developer exercises without credentials. Destructive history operations explain impact, backup refs and isolation first. Cleanup requires navigating out and checking the named practice directory. Advanced incident procedures include decision checkpoints; do not provide blind production mutation scripts. No tokens or private keys accepted.

## 10. Tests and acceptance

Unit tests: immutable failure, init/edit/stage/commit, snapshots/parents, refs and detached HEAD, merge/conflict, rebase, reset/revert/stash, local/remote separation, clone/fetch/push/pull/rebase/rejection/protection/teammate, scenario reset and progress migration. Content tests: 80 exact source IDs/answers, 40 practical+23 incidents, complete schemas and links. Real-Git tests validate runnable isolated instruction sequences. Playwright: 1920×1080 and 1366×768 core viewport without page scrolling; all four panels horizontally aligned; graph/terminal visible; long outputs/history internal; rail, mobile panel selection, keyboard, reduced motion, persistence, file/commit inspection, command feedback, remote flows, console errors and accessibility. Production build and live Vercel smoke test.

## 11. Roadmap and implementation checklist

- [x] A: Inspect repository, guides, current implementation and local Next docs; create plan and inventory.
- [x] B: Full-screen shell, collapsed rail, four state panels, graph and terminal; viewport acceptance.
- [x] C: Strengthen local command engine and state-driven scenario verification.
- [x] D: Independent remote store, clone/fetch/push/pull/divergence and teammate workflow.
- [x] E: 40 structured practical scenarios and 23 source incident exercises.
- [x] F: Full source-linked curriculum, original 80-question bank, revision and search.
- [x] G: OS-specific machine practice and honest persistence.
- [x] H: Engine/content/real-Git/browser checks, production build, deploy and document limitations.

Completion requires measured outcomes, not a rendered homepage. Update this checklist after implementation and record any remaining limitations in `docs/simulator-scope.md` and README.

Release verification: see `docs/validation-report.md`. Production is deployed at https://gitquest-lab.vercel.app. The advanced browser/machine boundary remains explicit in the scope document; this checklist does not claim full Git CLI emulation or real hosting/deployment integration.
