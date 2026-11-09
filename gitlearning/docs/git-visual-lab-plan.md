# raga-git: Git Visual Lab plan

Status: the first lesson-player milestone is implemented. `/branches` now opens Git Visual Lab with V01–V12 and an additional complete files→staging→commit→push story (L01). See [the player implementation notes](git-visual-lab-update.md). The remaining modules and animated comparisons below are still planned.

Primary source: [git-docs.md](git-docs.md), all 534 lines. Detailed coverage and proposed animation sequences: [visual curriculum matrix](git-visual-curriculum.md).

## 1. The product change

Expand `/branches` into a **Git Visual Lab**: a guided, animated explanation of the complete Git lifecycle, with a comparison mode and exercises at increasing difficulty.

The experience should answer five questions at every step:

1. What are we trying to accomplish?
2. Which command or action do we choose, and why?
3. Which file contents, objects, or references change?
4. What stays unchanged?
5. How do we prove the result?

Use the existing beginner lessons, simulator, interview questions and machine exercises as connected resources. The new lab supplies the missing visual explanation between reading an idea and independently executing it.

The proposed curriculum contains **36 visual modules across six levels**. These are an authored organization of the supplied notes, not a claim that the source has 36 sections. Each module has several individually inspectable steps. All source topics are mapped, including the topics only named in the opening outline.

## 2. Audit of the current implementation

Reviewed `components/lessons.js` (`Branches`), `history-graph.js`, the command engine, progress storage, curriculum and source notes.

- `/branches` currently offers a merge/rebase demonstration and a reset/revert demonstration, with brief HEAD and fast-forward explanations.
- A button calculates the result immediately. The learner does not see the common ancestor being selected, individual commits being replayed, or index and working-tree effects unfolding.
- The merge example runs on **main**, while the rebase example runs on **feature/login**. Both operations are meaningful, but they do not form a controlled comparison of two ways to update the same branch.
- The graph animates node appearance; it does not yet have an operation timeline, explanation frames, playback controls or state checkpoints.
- Undo examples display file counts, but not enough content detail to explain *which version* survives in each repository area.
- Clicking the merge/rebase demonstration immediately records a lesson completion. Viewing an animation should be distinct from demonstrating understanding.
- The recently implemented camera, fullscreen, keyboard and touch controls work and should be retained.
- Most foundational Git operations already have a tested engine. Remote deletion, rebase conflict continuation and some checkout forms need additional support or an explicit conceptual-only treatment.

The public page could not be retrieved by the web-reading tool during this planning audit. Findings above come from the local implementation that was deployed in the preceding release; this plan does not claim a fresh live browser audit.

## 3. Curriculum progression

| Level | Learner outcome | Modules |
| --- | --- | --- |
| 1. Files become history | Explain working files, index snapshots, commits and inspection | V01–V06 |
| 2. Navigate safely | Explain branches, HEAD, ancestry, tags, switching and ignored files | V07–V12 |
| 3. Share and synchronize | Explain local, remote and remote-tracking state independently | V13–V18 |
| 4. Combine changes | Choose merge, rebase, conflict resolution, cherry-pick or amend | V19–V24 |
| 5. Undo and recover | Choose the correct target for undo and preserve recoverable work | V25–V30 |
| 6. Complete the team lifecycle | Connect feature work, reviews, integration, CI and release decisions | V31–V36 |

Within each module offer three depths:

- **Understand:** guided playback, plain-language captions, one small example.
- **Compare:** alternate operations from equivalent starting conditions, plus an explanation of the differences.
- **Practise:** predict an outcome, execute a supported command or choose a justified workflow action, inspect the result, then verify.

Do not lock experienced learners behind completion gates. Show suggested prerequisites and allow direct entry.

## 4. The lesson player

### Screen

Retain the compact application rail. Keep `/branches` working and propose the navigation label **Git Visual Lab**. Use a compact searchable topic selector instead of another permanent large sidebar.

```text
┌────┬───────────────────────────────────────────────────────────────┐
│rail│ Git Visual Lab · Level 3 · Fetch vs pull     Topic ▾  Compare │
│    ├───────────────────────────────────────────────────────────────┤
│    │ Objective · Step 3 of 7 · command / workflow action           │
│    ├─────────────────────────────────────────┬─────────────────────┤
│    │ Working · Staging · Local · Remote      │ Why this step       │
│    │                                         │ What changes        │
│    │ Animated graph / file / workflow scene  │ What stays the same │
│    │                                         │ Inspect / predict   │
│    ├─────────────────────────────────────────┴─────────────────────┤
│    │ Previous · Play/Pause · Next · timeline · speed · Replay      │
│    │ Inspect snapshot · Try this step · On my computer             │
└────┴───────────────────────────────────────────────────────────────┘
```

The central visual changes to suit the topic:

- Files and content snapshots for staging, diff, restore and ignore.
- Commit history and reference arrows for branches, merge, rebase and recovery.
- Separate local and remote lanes for cloning, fetching and pushing.
- Review/check/build nodes for hosting and CI workflows, clearly labeled as conceptual simulations.

Keep the four repository areas visible as a compact state band for Git-state lessons. Expand the affected area instead of shrinking every piece of text. A hosting-policy scene can use an appropriate workflow view with a repository-state inspector.

Desktop target: 1920×1080, with 1366×768 and 1280×720 acceptance. Use a viewport-constrained grid, internal panel scrolling and a pinned playback bar. At narrow widths, switch between **Animation / Explanation / Files**, preserving the current step. Comparison uses A/B tabs on mobile, with the same checkpoint and a persistent summary of differences.

### Playback

- Previous/Next moves one explanatory step.
- Play/Pause controls automatic playback; default is paused at the initial state.
- Replay current command, restart module, and seek to a completed or previewable chapter.
- Speed options: 0.5×, 1×, 1.5×, 2×.
- Arrow keys move steps when the player owns focus; graph-focused arrows retain panning. Space toggles playback outside text inputs and buttons.
- Selecting a file or commit pauses playback and exposes the relevant snapshot/diff.
- Reduced motion uses immediate state changes, explicit arrows, labels and a text transcript with the same information.
- Auto-play stops at prediction questions, conflicts, unsafe choices and module completion. It pauses when the document becomes hidden.
- “Previous” rewinds the explanation. It is never represented as executing a Git undo command.

Motion should take roughly 350–800 ms per semantic transition, subject to usability review. Reading time is controlled by the learner. No continuous decorative animation or forced timed waiting.

## 5. The anatomy of every lesson

Each visual module must supply:

1. Source anchors and any editorial correction.
2. A real situation, prerequisites and a learning objective.
3. Exact initial repository fixture and visible content.
4. Ordered actions with commands, explanation, before/after state and verification.
5. Animated events tied to actual state differences.
6. At least one prediction checkpoint with specific feedback.
7. Common mistakes and a safe recovery route.
8. A related comparison, where meaningful.
9. A browser exercise and/or explicitly labeled conceptual exercise.
10. The corresponding real-machine practice and existing interview links.
11. Completion criteria and a useful next topic.

Use recurring sample files (`README.md`, `login.js`, `settings.json`) and one fictional product so the learner follows a project rather than repeatedly decoding unrelated examples. Independent lessons load a named checkpoint from this project; the capstone connects the checkpoints.

## 6. Reference storyboard: working files → commit → remote

This is the first complete vertical slice to build.

| Step | Action | Animation and explanation | Verification |
| --- | --- | --- | --- |
| 0 | Introduce repository and remote | Four clearly separated areas; explain that Git is local and hosting is another system | Learner identifies where an edited file starts |
| 1 | `git init -b main` | Reveal local repository metadata and unborn main; keep the graph empty | No commit exists |
| 2 | Create `README.md` with version A | File appears only in working files, labeled untracked | `git status` reports it |
| 3 | `git add README.md` | Animate a **copy** of content A into the index; the working file remains | Index contains A; no commit yet |
| 4 | Edit the working copy to B | Working content changes to B; staged A remains visibly frozen | Predict which content a commit would save |
| 5 | `git diff` / `git diff --staged` | Highlight the two different comparison endpoints; show actual content differences | Learner distinguishes working→index from index→HEAD |
| 6 | `git commit -m "Add README"` | Build commit C1 from index A; draw its metadata and move main/HEAD | Commit contains A; B remains an unstaged working edit |
| 7 | Stage and commit B | Create C2 with C1 as parent; advance main | Both snapshots inspectable; remote still empty |
| 8 | Configure `origin` | Draw an alias/configuration link without transferring objects | `git remote -v`; remote history unchanged |
| 9 | `git push -u origin main` | Show reachability validation, object transfer, remote-main update, tracking/upstream update | Local and remote tips match; upstream recorded |
| 10 | Explain the result | Pin the timeline and let the learner inspect A vs B and local vs remote | State-based check plus machine-practice link |

The action rows describe Git outcomes. The micro-animation frames explain them; they are not a claim that a learner can externally pause the Git CLI halfway through a commit or push.

## 7. Reference storyboard: merge vs rebase

Use the **same** base, files, active branch and target on both sides.

```text
Starting checkpoint (HEAD → feature):
             C             main
            /
    A ── B
            \
             D ── E        feature
```

| Beat | Merge side: on feature, `git merge main` | Rebase side: on feature, `git rebase main` |
| --- | --- | --- |
| 1 | Highlight HEAD→feature→E | Highlight the same HEAD→feature→E |
| 2 | Identify merge base B and tips E/C | Identify base B and feature-only D/E |
| 3 | Compare the three file snapshots | Extract D's change relative to its parent |
| 4 | Compose the combined snapshot | Apply that change after C, creating D′ |
| 5 | Create M with parents E and C | Apply E's change after D′, creating E′ |
| 6 | Move feature to M; retain original IDs | Move feature to E′; show old→new IDs |
| 7 | Inspect parents, history and files | Inspect parents, history and files |

For this deliberately nonconflicting fixture, both outcomes contain the same final files but different ancestry. Do not imply this holds for every possible merge/rebase, especially conflicts or complex histories.

Keep original D/E visible as a dimmed historical overlay during the explanation, labeled “old commits, no longer on this branch.” They are not instantly deleted from object storage. A separate fast-forward example shows why merging does not always create M.

End with “Which would you choose for an unpublished feature? What changes if colleagues already pulled it?” Link the learner to the executable scenario.

## 8. Required animated comparisons

| Comparison | What must be visible |
| --- | --- |
| Git vs GitHub | Local version-control operations versus remote hosting/review services |
| `init` vs `clone` | Empty local history versus copied history plus configured remote |
| `status` vs `diff` | Classification badges versus changed content; both are read-only |
| `diff` vs `diff --staged` / `--cached` | The precise source and destination snapshots |
| `add` vs `commit` vs `push` | Index copy, local snapshot creation, remote transfer |
| `restore --staged` vs `rm --cached` | Index reset to HEAD versus removing a path from the index while retaining the working file |
| Branch creation vs switching | New reference versus HEAD/checked-out snapshot change |
| `checkout` vs `switch` / `restore` | Branch and file use cases separated explicitly |
| Local branch vs tracking reference vs remote branch | Three independent reference values |
| `push` vs `push -u` | Same transfer; extra upstream configuration |
| `branch -d` vs `branch -D` vs remote deletion | Merge-safety check, forced local-name removal, and removal in the separate remote |
| `clone` vs `fetch` | Different initial conditions labeled explicitly; new workspace versus update to an existing one |
| `fetch` vs `pull` | Fetch checkpoint where files stay unchanged; explicit integration step for pull |
| Merge pull vs rebase pull vs `--ff-only` | Joined ancestry, replayed commits, or divergence rejection |
| Fast-forward vs three-way merge | Pointer-only move versus a commit with two parents |
| Merge vs rebase | Same starting branch; preserved versus rewritten ancestry |
| Merge vs cherry-pick | Reachable history integration versus one selected commit's patch |
| New commit vs amend | Append a child versus replace the tip with a new object |
| Restore vs reset vs revert | File contents, branch/index/working state, or an appended inverse commit |
| Soft vs mixed vs hard reset | Content versions in all three local areas, not only file counts |
| Commit vs stash | Branch history versus saved unfinished changes |
| Stash apply vs pop | Saved entry retained versus removed only after successful application |
| Status vs log vs reflog | Current files, reachable commits, and local reference movements |
| Attached vs detached HEAD | HEAD→branch→commit versus HEAD→commit |
| Branch vs tag | Movable development reference versus stable release label |
| GitHub Flow vs trunk-based development | Branch lifetime, integration cadence, checks and release boundaries |

A comparison shares one initial checkpoint unless its purpose requires different initial conditions (`init`/`clone`, `clone`/`fetch`). Label such differences rather than presenting them as a controlled identical-input comparison.

## 9. Source corrections to carry into the animations

Preserve the source file. Add visible editorial clarifications beside the relevant lesson.

| Source wording / location | Required explanation |
| --- | --- |
| “git add moves” at line 24 | It copies selected contents into the index; the working file remains. [Git add](https://git-scm.com/docs/git-add) |
| `rm --cached` / `restore --staged`, lines 26–28 | These are optional branches in the lifecycle, not mandatory commands between every add and commit. Removing an index entry differs from restoring it from HEAD. [Git rm](https://git-scm.com/docs/git-rm), [Git restore](https://git-scm.com/docs/git-restore) |
| “checkout feature-a to create,” line 92 | That form switches an existing branch; `-b` creates it. [Git checkout](https://git-scm.com/docs/git-checkout) |
| HEAD shorthand, lines 100–114 | HEAD is usually symbolic; `~n` follows first-parent ancestry, while `^2` selects the second parent. Diagram the merge case explicitly. |
| “hard = remove changes completely,” line 205 | Explain branch, index and tracked-file replacement. Do not depict every object being erased or promise recovery of unstaged work. [Git reset](https://git-scm.com/docs/git-reset) |
| “pull = fetch + merge,” lines 235–251 | Show the chosen strategy explicitly. Pull can use merge, rebase or fast-forward-only behavior. [Git pull](https://git-scm.com/docs/git-pull) |
| Stash pop, line 263 | The entry is removed after successful application; a conflict is not a successful completed pop. |
| “clone downloads full history,” lines 305–309 | Describe the ordinary full-clone example; do not generalize it to shallow/partial clones. |
| “.gitignore ... should not track,” line 443 | Ignore rules primarily apply to untracked paths; already tracked files and historic secrets remain. [Git ignore](https://git-scm.com/docs/gitignore) |
| “permanent” commit vs temporary stash, lines 37 and 258–259 | Explain intentional history versus unfinished work; unreachable objects are not guaranteed permanent backups. |

GitHub Flow, trunk-based development and Jenkins/CI are named at lines 9–10 but not developed in the body. Their detailed scenes are **authored extensions** with official GitHub/Jenkins references to verify during implementation. Do not present invented pipeline policies as quotations from the notes.

## 10. Architecture and reuse

Keep Next.js, React, JavaScript, the existing CSS, Lucide, Framer Motion and custom SVG. No video-only lessons, new graph library, backend shell or paid service is necessary.

Proposed modules:

```text
lib/visual-lab/
  curriculum.js           module IDs, levels, prerequisites and source anchors
  fixtures.js             reproducible repository and workflow checkpoints
  lessons/*.js            structured actions, narration and expected results
  comparisons.js          paired experiments and comparison assertions
  trace.js                typed semantic events from actual operations
  playback.js             deterministic cursor, pause, seek and replay reducer
  verify.js               checkpoint and outcome checks
components/visual-lab/
  visual-lab.js           viewport shell and mode selection
  topic-picker.js         searchable module navigation
  lesson-player.js        orchestration and player controls
  repository-scene.js     file snapshots and repository areas
  history-scene.js        transition overlays using existing graph geometry
  workflow-scene.js       explicit hosting/CI teaching model
  comparison-stage.js    paired states and synchronized semantic checkpoints
  step-inspector.js       why, diff, unchanged state, safety and prediction
```

Definitions should include `id`, `version`, `level`, `sourceAnchors`, `prerequisites`, `fixtureId`, `mode`, `steps`, `comparisons`, `checks`, `scenarioIds`, `lessonIds` and machine-practice references. Each step has an action, explanation, semantic events, expected state, unchanged-state assertions and optional checkpoint.

### State and animation boundary

The existing engine remains the authority for Git state. Add structured transition information without breaking its `state/output/error` interface.

```text
initial fixture
    → existing command handler
    → verified result + semantic trace
    → prepared visual frames
    → learner-controlled playback
```

Events include `copy-to-index`, `create-commit`, `move-ref`, `checkout-tree`, `transfer-objects`, `update-tracking`, `replay-commit`, `conflict-detected`, and `record-recovery-ref`.

Derive simple events from before/after state. Add explicit trace emission to operations where a diff cannot explain causality, particularly rebase's old→new mapping and pull's fetch/integration phases. Never invent that mapping by comparing commit messages.

Cache validated command-boundary snapshots. Seeking and replaying select these snapshots; they do not execute commands again, create duplicate commits or award duplicate progress. Label intermediate animation frames as an explanation of the operation, not independent durable repository states.

Use a single playback clock, cancel stale transitions on reset/topic change, and pause before entering free practice. Manual commands create a separate practice branch of the lesson session; returning to the demonstration restores its named checkpoint.

Keep graph layout stable during a transition. Base edges on commit parents and use stable node IDs. Do not move existing nodes simply because a commit was appended. Camera movement remains user-controlled, with an optional “Follow the action” toggle.

### Engine work required

| Requirement | Current state | Implementation gate |
| --- | --- | --- |
| Basic files, staging, commits, refs, tags, undo, clean merge/rebase/pick | Modeled | Reuse, add semantic traces and content assertions |
| `HEAD~n`, `HEAD^n`, `HEAD@{n}`, `log A..B` | Modeled | Add focused visual/reference fixtures and real-Git comparisons |
| Clone, fetch, push, pull, upstream and rejected push | Modeled | Trace independent local/tracking/remote changes; preserve fetch if pull integration fails |
| `git push origin --delete feature` | Not modeled | Add validated deletion semantics, preserving local branch and unrelated refs, before presenting it as executable |
| File checkout `git checkout -- file` | Not modeled | Implement the specific legacy alias or use a labeled explanation linked to executable restore; do not fake CLI success |
| Rebase/cherry-pick conflict continuation | Not modeled | Add a tested resumable operation state if executable continuation is included; until then show an explicitly conceptual walkthrough and machine exercise |
| Line-based automatic merge | Whole-file model | Use valid same-file conflict fixtures; explain the limit. Do not promise line-level automatic merging without implementing it |
| PRs, approvals, Jenkins and CI events | No external integrations | Separate conceptual workflow model; checks/reviews are simulated, not real hosting activity |
| Ignored files | Basic matching | Use supported source patterns; introduce advanced patterns only with verified handling |

## 11. Progress, practice and engagement

Store separate visual-lab records for:

- Last module, lesson version and checkpoint.
- Demonstrations viewed.
- Prediction checks passed and topics needing revision.
- Simulator exercises verified.
- Real-machine completion reported by the learner.

Migrate storage defensively without losing existing lesson/scenario progress. Remove automatic “mastery” from playing a demonstration. No time-based completion, streak penalties, artificial countdowns or rewards for leaving an animation running.

Each ending provides a recap of what moved, one useful comparison and a next exercise based on prerequisites. Keep modules short enough to understand in one sitting; the lifecycle capstone is chaptered and resumable. This is a hypothesis for improving learning and return visits, not a claim of measured retention improvement.

Machine practice reuses OS-specific safe workspaces and local bare remotes. Copies, predictions and checkboxes never count as remotely verified real commands.

## 12. Build sequence and acceptance gates

### A. Player and one complete lifecycle

- Define the content schema, fixtures, transition traces and playback reducer.
- Build the viewport shell, inspector, timeline and accessible controls.
- Finish V02–V06 plus the push portion of V15 as one complete story.
- Gate: staged A remains different from working B; commit saves A; remote changes only after push; replay/back/seek remains deterministic.

### B. Controlled comparison engine

- Implement merge/rebase from the same feature checkpoint.
- Implement reset modes and reset/revert with visible file contents.
- Implement fetch/pull with explicit remote/tracking separation.
- Gate: comparison assertions pass; all three demos explain intermediate steps rather than jumping to a result.

### C. Complete file, branch and remote curriculum

- Finish all remaining Level 1–3 modules and the remote-deletion engine requirement.
- Add HEAD parent navigation, tags, ignore, upstream and two-contributor branches.
- Gate: every source command in these levels is either executable or explicitly marked conceptual with accurate local instructions.

### D. Integration and recovery

- Complete Level 4–5, including conflict choices, selected-commit picking, amend, stash and recovery.
- Decide the bounded implementation of resumable conflicts before advertising executable continuation.
- Gate: no animation changes IDs or files inconsistently with its operation; recovery never promises unstaged-data restoration.

### E. Team lifecycle

- Build the full feature→review→CI→merge story and GitHub Flow/trunk comparison.
- Add Jenkins/CI authored expansions, hotfix capstone and explanation checkpoints.
- Link original source lessons and interview entries.
- Gate: hosting actions remain visibly distinct from Git commands; all 36 modules have complete source mapping and learning checks.

### F. Release

- Run relevant unit, real-Git, curriculum and browser checks.
- Review screenshots and playback at desktop/laptop/mobile sizes.
- Verify reduced motion, keyboard controls, focus, overflow, scene reset and storage migration.
- Build and deploy to the existing Vercel project; verify both production addresses.

The first three comparison demos are implementation milestones, not the final scope. Full delivery requires the entire inventory in the companion matrix.

## 13. Tests and definition of done

**Correctness:** compare command-boundary fixtures against real Git in isolated directories; assert parent relationships, snapshot contents, ref movement, remote separation, rejected operations and recovery references.

**Playback:** pause midway; replay repeatedly; seek backward then forward; change topic while playing; resize or enter fullscreen during playback; switch comparison mode; hide the tab; return to practice. No stale callback, duplicate execution or incorrect completion.

**Curriculum:** all source sections and commands mapped; all 36 definitions have objectives, ordered scenes, expected outcomes, safety notes and a check. Existing 80 original interview questions remain intact. Authored extensions and corrections are identified.

**Comparison:** identical fixtures where promised; same active branch for merge/rebase; equal final file trees only when the specific fixture warrants it; correct soft/mixed/hard matrix; fetch never silently updates the working tree; pop failure retains the stash.

**Usability:** complete scene, command, explanation and playback controls visible without global vertical scrolling at supported desktop sizes. Graph labels readable at the default view. Wide histories can zoom/pan; compare views never require unreadable text. Touch, keyboard and screen-reader equivalents work.

**Release gate:** no dead buttons, fake external operations, missing topic definitions or unverified “complete” badges. Report any conceptual-only operation explicitly rather than implying full Git CLI emulation.
