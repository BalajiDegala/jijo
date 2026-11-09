# Git Visual Lab: topic and storyboard matrix

Companion to [the implementation plan](git-visual-lab-plan.md). All entries below are **planned**, not currently implemented animation lessons.

Source coordinates refer to [git-docs.md](git-docs.md), as inspected for this plan. Preserve the original document. Repeated concepts are grouped into reusable modules; every source topic remains traceable.

Modes:

- **Engine:** outcomes come from the existing Git state engine.
- **Extend:** additional tested command behavior is needed for the complete executable lesson.
- **Concept:** explicit hosting/process illustration, with real-machine guidance where relevant.

## Level 1 — Files become history

| ID / topic | Source lines | Ordered animation beats | Check / related lab | Mode |
| --- | --- | --- | --- | --- |
| V01 — Git, GitHub and the repository | 1, 12–15, 48–68 | Introduce project folder → reveal `.git` metadata → separate file contents from history/refs/configuration → place hosting in another repository area → edit locally with remote unchanged | Identify what works without GitHub; `first-commit` | Engine + concept |
| V02 — Start with init | 18–22 | Empty folder → initialize → show unborn main/HEAD → create README → classify as untracked → inspect status | Explain why init creates no commit; `first-commit` | Engine |
| V03 — File states, status and diff | 20–35, 59–60, 315–320 | Show tracked and untracked files → modify tracked content → highlight status categories → reveal changed lines → stage one change → distinguish both diffs | Choose the command for “which files?” versus “which contents?”; `restore`, `index-snapshot` | Engine |
| V04 — Staging is a snapshot | 24, 30–37 | Working A → copy A into index → edit working B → freeze staged A → inspect both snapshots → predict the next commit | Commit must contain A; `index-snapshot`, `staging` | Engine |
| V05 — Unstage versus stop tracking | 26–28 | Start with a tracked file and a staged edit → fork the checkpoint → restore index from HEAD on one side → remove index path on the other → retain working content → compare next-commit results | Identify staged deletion versus unstaged modification; `ignore`, `undo-compare` | Engine |
| V06 — Commit, log and snapshot inspection | 37–46, 322–325 | Select index → create commit with metadata → connect parent → move active branch/HEAD → leave later working edits untouched → inspect log/show and older snapshot | Identify exactly what was saved; `atomic-commits`, `history-head` | Engine |

## Level 2 — Navigate safely

| ID / topic | Source lines | Ordered animation beats | Check / related lab | Mode |
| --- | --- | --- | --- | --- |
| V07 — Create and switch branches | 3, 90–93, 414–421 | Duplicate a reference at current commit → keep HEAD on original branch → switch HEAD to feature → update working snapshot → make a feature commit → switch back to unchanged main | Creating a name is not switching; `branching` | Engine |
| V08 — HEAD, parents and ranges | 86–114, 119–125 | Trace HEAD→branch→commit → walk `~1` and `~2` → introduce merge parents → select `^1`/`^2` → show a commit → highlight commits in `main..origin/main` and compare trees | Select the right parent; distinguish log range from tree diff; `history-head` | Engine |
| V09 — Delete a local or remote branch | 139–150 | Show unmerged feature → reject safe deletion in a no-upstream fixture → explain reachability → force-delete local name → retain commit objects → independently delete remote branch and inspect remaining refs | Which name disappeared, and where can the work still be reached? `deleted-branch` | Extend remote deletion |
| V10 — Branch versus tag | 397–432 | Tag C → add commit D on main → move main only → inspect tag snapshot C → create feature at D → compare purpose and movement | Predict which reference advances; `release` | Engine |
| V11 — Checkout versus switch and restore | 90–93, 289–300, 382–384 | Choose branch use case → compare checkout/switch → choose new-branch use case → compare `-b`/`-c` → choose file-restoration use case → compare legacy checkout-file with restore | Select a focused command for each task; `branching`, `restore`, `detached` | Engine; extend legacy file alias or label conceptual |
| V12 — Ignore generated files correctly | 443–455 | Add logs/dependency files → introduce matching ignore patterns → keep untracked generated content out of index → show already-tracked log still tracked → use rm --cached → commit ignore policy | Explain why ignore does not remove an old secret; `ignore`, `secret` | Engine |

## Level 3 — Share and synchronize

| ID / topic | Source lines | Ordered animation beats | Check / related lab | Mode |
| --- | --- | --- | --- | --- |
| V13 — Clone versus init and fetch | 75–84, 305–309 | Begin with populated remote and empty local area → copy history → establish origin/tracking → check out main → compare with empty init → add remote update → fetch into existing clone | Identify which operation creates a local repository; `clone`, `fetch-only` | Engine |
| V14 — Origin, URLs and upstream | 81–84, 123–137, 460–469 | Reveal alias→URL config → list remotes → rename alias → preserve history → change URL/configuration → compare push with/without -u → remove config without deleting remote repository | Distinguish remote alias, tracking ref and upstream setting; `publish` | Engine |
| V15 — Publish a branch | 39–43, 129–137, 508 | Local-only commit → select local/remote branch → validate ancestry → transfer reachable objects → advance remote ref and tracking → optionally save upstream | Local commit alone must not appear remotely; `publish` | Engine |
| V16 — Fetch and inspect incoming changes | 119–125, 226–233 | Teammate advances actual remote → local main and origin/main stay behind → fetch objects → move origin/main only → inspect log range → compare trees → explicitly merge | Point to the first operation that changes working files; `fetch-only` | Engine |
| V17 — Pull strategies | 235–251 | Start from divergence → fetch checkpoint → fork into merge/rebase/ff-only → join histories, replay local commits or reject integration → compare IDs, parents and files | Explain how fetch can succeed while integration stops; `pull-rebase`, `rejected-push` | Engine |
| V18 — Two contributors and a rejected push | 4, 119–137, 498–508; authored scenario expansion | You commit locally → teammate pushes separately → push rejection leaves remote intact → fetch → inspect divergence → integrate → retry successfully | Choose preservation over force-pushing; `rejected-push`, `teammate` | Engine |

## Level 4 — Combine changes

| ID / topic | Source lines | Ordered animation beats | Check / related lab | Mode |
| --- | --- | --- | --- | --- |
| V19 — Fast-forward and three-way merge | 3, 154–167; fast-forward is an editorial clarification | Highlight ancestor relationship → fast-forward a pointer without a commit → load divergent fixture → identify common ancestor → combine snapshots → create two-parent commit | Recognize when an extra commit is needed; `merge-feature`, `update-feature` | Engine |
| V20 — Rebase one commit at a time | 169–185 | Choose new base → identify unique feature commits → extract first patch → replay as new object → repeat next patch → move feature → inspect rewritten ancestry and unchanged main | Map old IDs to new IDs; `rebase` | Engine for clean linear rebase |
| V21 — Merge versus rebase | 156–185 | Load identical feature checkpoints side by side → highlight same base/tips → merge while the other side replays → synchronize at semantic milestones → compare final trees, parents and references → choose based on sharing | Explain why equal file contents can have different histories; `rebase`, `update-feature` | Engine |
| V22 — Conflict, resolution and continuation | 5, 438 | Two developers edit conflicting content → inspect base/ours/theirs → pause merge → read markers → edit final content → stage resolution → finish merge or abort → introduce rebase-conflict differences | Neither “ours” nor “theirs” is automatically the correct answer; `conflict`, incident-58 | Engine for merge; extend or explicitly conceptualize rebase continuation |
| V23 — Cherry-pick one chosen change | 270–284 | Show feature commits D/E/F → select E → inspect E's patch relative to its parent → switch destination → apply only that patch → create E′ → keep source refs unchanged | Verify unrelated D/F changes are absent; `move-commit`, `hotfix` | Engine for clean pick |
| V24 — Amend the latest commit | 473–479 | Commit incomplete/message-poor snapshot → stage missing file → compare normal new commit versus amend → create replacement tip → preserve previous parent(s) → update branch and reflog | Explain why the old ID changes and shared use matters; `amend` | Engine with explicit message; editor behavior explained |

## Level 5 — Undo and recover

| ID / topic | Source lines | Ordered animation beats | Check / related lab | Mode |
| --- | --- | --- | --- | --- |
| V25 — Restore the correct layer | 6, 28, 293–297 | Show HEAD A / index B / working C → inspect differences → restore working from index B → rewind lesson → restore index from HEAD A → preserve working C | Name the source and destination snapshot; `restore`, `undo-compare` | Engine |
| V26 — Soft, mixed and hard reset | 190–205 | Start from identical committed/dirty state → select earlier commit → move branch → keep or replace index according to mode → keep or replace tracked working content → inspect retained objects and lost unstaged edits | Fill the three-area state table; `undo-compare`, `clean-history` | Engine |
| V27 — Reset versus revert | 190–220 | Choose bad commit → fork checkpoint → move branch on reset side → append inverse commit on revert side → compare history and final files → choose for shared/unshared work | Revert keeps the original history reachable; `revert`, `undo-compare` | Engine |
| V28 — Stash, apply, pop and drop | 7, 256–265 | Modify tracked file → save unfinished work → restore clean checkout → inspect stash list → compare apply/pop from same saved entry → retain/remove entry appropriately → drop explicitly → contrast with commit | Predict stash-list size and whether branch history changed; `restore` | Engine for clean application; conflicts explicitly scoped |
| V29 — Status, log, reflog and recovery | 315–369 | Observe current files → inspect reachable log → move branch back → keep old object in storage → find prior reference movement → inspect old commit → create recovery branch → switch | Explain why reflog can recover a commit but not arbitrary unsaved text; `reflog-recovery`, `deleted-branch` | Engine |
| V30 — Detached HEAD and rescue | 374–393 | HEAD→main→D → select older C → change to HEAD→C → commit experiment E with main still at D → create rescue branch → attach HEAD → safely leave/return | Preserve the experimental commit before switching away; `detached` | Engine |

## Level 6 — Complete the team lifecycle

| ID / topic | Source lines | Ordered animation beats | Check / related lab | Mode |
| --- | --- | --- | --- | --- |
| V31 — Complete feature-to-review lifecycle | 483–534 | Clone → branch → edit → status/diff → stage → commit → fetch → choose merge/rebase → push -u → create simulated PR → review/change request → update branch → checks → merge → sync local main | Execute Git steps and justify review/integration choices; `branching`, `publish`, `protected`, `traceability` | Engine + explicitly simulated hosting |
| V32 — GitHub Flow | 9, 483–534; detailed policy is authored expansion | Updated main → short feature branch → small commits → PR/checks → review → merge → independently verify deployment event when configured → close branch | Separate a Git merge from proof of deployment; `protected`, `traceability` | Engine + concept |
| V33 — Trunk-based development comparison | 9; details are authored expansion | Shared trunk → small change/short-lived branch → fast automated checks → frequent integration → hide unfinished behavior with a feature flag → compare branch lifetime and release cadence with GitHub Flow | Explain that trunk-based work can still use short branches and review; `release-design` | Concept + Git fixtures |
| V34 — Git, Jenkins and CI/CD triggers | 10; details are authored expansion | Push or PR event → simulated webhook → pipeline checkout of a recorded commit → build/test → pass/fail decision → review policy result → optional configured deployment → inspect deployed version/health | Failed checks block the configured workflow; a commit/tag does not automatically deploy; `ci-history`, `traceability` | Concept; real setup guidance |
| V35 — Production hotfix through release | 270–284, 397–432; combined authored capstone | Start at production tag → branch fix → edit/test/commit → mark patch release → carry selected fix to development → compare release/development trees → model rollout verification | Production snapshot excludes unreleased features; `hotfix`, `release` | Engine + concept |
| V36 — Explain and verify the lifecycle | 10, 534; authored assessment | Present an unfamiliar checkpoint → learner predicts next action → runs supported steps → explains which refs changed → inspects evidence → answers linked original interview question → selects revision topic | Score checks and repository outcomes; never mark mastery from playback alone | Engine + assessment |

## Shared animation vocabulary

| Visual event | Meaning | Must not imply |
| --- | --- | --- |
| Content copy travels to index | Selected working contents become the staged snapshot | File moved out of working tree |
| Commit object appears with parent edge | New immutable snapshot and ancestry | A remote upload happened |
| A named label moves | A reference changes target | Old commit objects are immediately deleted |
| HEAD arrow reattaches | Current branch or detached position changes | Every branch moved |
| Dashed patch arrow and a new ID | A change is replayed with different ancestry | The original commit object was edited in place |
| Objects appear in the other repository | Explicit simulated transfer succeeded | Real GitHub network access |
| Tracking label advances | Local knowledge of remote state changed | Working files necessarily changed |
| Conflict markers and pause | The operation requires a resolution | A successful merge already happened |
| Dimmed old node | Object retained but no longer in current branch ancestry | Guaranteed indefinite recovery |
| Pipeline/check/review badge | A declared simulated hosting/process event | An actual Jenkins build or approval |

## Mapping of the source's opening outline

| Source overview | Planned coverage |
| --- | --- |
| 1. Git basics | V01–V08 |
| 2. Daily commands | V02–V06, V13, V16 |
| 3. Branches | V07–V11, V19–V22 |
| 4. Remote Git | V13–V18 |
| 5. Merge conflicts | V22 |
| 6. Undo mistakes | V25–V27, V29–V30 |
| 7. Stash | V28 |
| 8. Rebase | V20–V21, V17 |
| 9. Workflows, PRs, GitHub Flow, trunk | V31–V33 |
| 10. Jenkins, CI/CD and interview scenarios | V34, V36, existing interview bank |

The body's additional topics—cherry-pick, tags, ignore, amend, HEAD ancestry and remote configuration—are mapped explicitly above. Lifecycle commands are not taught as one mandatory linear script: unstage, untrack, undo and stash are branches in the journey.

## Definition-level coverage gates

- Every V01–V36 entry must have a structured definition and valid source anchor.
- Every engine-mode step must produce the stated content/ref result in automated tests.
- Every extension must either be implemented and tested or visibly labeled conceptual; there must be no fabricated terminal success.
- Every comparison must identify its initial conditions and state exactly what differs.
- Every lesson needs a specific check; “clicked Play” is not completion.
- Every scene has a readable reduced-motion equivalent and backward/forward playback.
- Topic, lesson, scenario and interview links must resolve. Existing source numbering stays intact.
