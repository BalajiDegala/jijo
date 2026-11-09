# Command-driven visual explanations

Status: published and verified, 2026-10-26, at [raga-git](https://raga-git.vercel.app/branches#V08) and the existing GitQuest address. This milestone prioritizes visual clarity in the existing lessons before expanding the curriculum.

## Outcome

Every graph-related command should visibly answer: where did we start, which reference or path did the command follow, what did it select or change, and where are we now?

Start with **V08: HEAD, parents & revision ranges** and **V07: Create, switch & build a branch**. These provide the acceptance examples for the shared visual behavior.

## Gap addressed

- The scene previously passed only repository state to the graph.
- Transition events described mutations, so read-only commands such as `show`, `log` and `diff` normally received the generic unchanged-state event.
- The graph displayed actual HEAD, references and ancestry without command-selected targets, traversal paths or range membership. The camera fitted the whole graph or manually focused HEAD.
- Consequently, `git show HEAD~1` and `git show HEAD^2` had different output but almost identical pictures.

The new explanation layer is independent of repository mutations. Inspection is visually meaningful even when the repository remains unchanged.

## Visual language

Use explicit labels and shapes, with color as reinforcement:

| Meaning | Treatment |
| --- | --- |
| Actual checkout | Persistent HEAD badge and connector: `HEAD → branch → commit`, or `HEAD → commit` when detached |
| Inspected commit | A separate outlined selection ring, with `Inspecting HEAD~1` or the selected reference and commit ID |
| Ancestry traversal | Draw the relevant parent edges in order, with arrows pointing toward ancestors; label `parent 1` and `parent 2` when explaining a merge |
| Active branch history | Emphasize the branch reference and its reachable ancestry; keep shared ancestors identifiable |
| Changed references | Animate the reference that actually moved; briefly retain the old position as an explicitly labeled before-state outline |
| Other history | Reduce emphasis while keeping context readable and interactive |

Keep existing local/remote commit-fill meanings. Add selection and traversal treatments outside those fills so that inspecting a commit does not appear to change its storage location.

The selection and path remain visible after their brief entrance animation. A one-off flash is insufficient for reading and understanding.

## V08 storyboard

Use the existing merge fixture, with HEAD attached to feature/login. Resolve actual IDs from the fixture instead of hardcoding screen positions or IDs.

| Command | Sequence on the graph | Explanation held on screen |
| --- | --- | --- |
| `git show HEAD` | Emphasize HEAD, follow its connector through feature/login to the merge commit, then frame that commit with both parents visible. | This is the currently checked-out commit. Display its two parent IDs and selected snapshot. |
| `git show HEAD~1` | Start at actual HEAD, draw one first-parent edge, and select its destination. | One first-parent hop. Actual HEAD remains on the merge commit. |
| `git show HEAD~2` | Start at actual HEAD again. Draw the first-parent route in two successive hops, numbered 1 and 2. | Two generations along the first-parent chain. Keep the complete route visible. |
| `git show HEAD^2` | Start at the same merge commit, reveal its parent-1/parent-2 labels, and follow the second-parent edge directly. | Select parent number 2. This is one edge, unlike the two-hop `~2` route. |
| `git log main..feature/login` | Mark both branch tips; highlight commits reachable from feature/login and exclude those also reachable from main. Link highlighted output rows to graph nodes. | A history selection: show the selected commit count and IDs. Common ancestry is excluded. |
| `git diff main feature/login` | Mark the two endpoints A and B, frame both, and show their file comparison. | A comparison of saved file trees. Explain which files/content differ, including when the comparison is empty. |

For all six commands, keep actual HEAD in its true position. If it is outside the close-up, retain a compact status strip identifying it. Do not replace the working/index/HEAD snapshots with the inspected commit's contents; use a separately labeled inspection panel.

## Branch switching and commit navigation

1. **Create a branch:** reveal a new reference label at the existing commit. HEAD stays attached to the original branch.
2. **Switch branches:** emphasize the destination branch, animate HEAD's attachment from the old branch label to the new label, and highlight the destination's reachable history. The branch tips themselves stay fixed.
3. **Switch between branches at the same commit:** show the changed attachment even though no commit or file changes. Avoid an unnecessary camera move.
4. **Switch back after development:** follow the destination, show the checked-out tree changes, and label the other branch's work as still saved in its history.
5. **Inspect a particular commit:** select and frame it without moving HEAD. Clicking a graph node is also inspection.
6. **Check out a particular commit:** use an explicitly supported detached-HEAD command. Show HEAD attaching directly to the commit, branch references staying put, and the restored tracked snapshot.

Add a short, clearly labeled detached-checkout example to the navigation lessons so inspection and checkout can be compared directly. Increment the affected lesson version if its steps or assessment change.

Compute highlighted branch ancestry from parent links. A commit's creation-lane label does not establish exclusive branch ownership, particularly after merges.

## Camera and layout

- Add **Follow the action**, on by default for guided lessons. First frame the relevant source/path, then move closer to the destination where that helps understanding.
- Frame both parents for a parent-choice explanation and both endpoints for a diff. A close-up must retain enough context to explain the relationship.
- Use short, smooth transitions, initially about 400–700 ms per meaningful motion, adjusted after browser review. Avoid repeated zooming when the target already has a readable position.
- Keep **Overview**, **Focus selection** and the existing fullscreen controls available. Manual pan/zoom suspends automatic following until the learner re-enables it.
- Use stable commit coordinates across a lesson. Precompute positions from its fixture and prepared frames, but render only commits/references that exist in the displayed state. Future commits must not appear early.
- Make the graph the primary scene for ancestry and branch lessons. Keep repository areas as a compact state band with expandable file details so the graph has room for readable paths and labels.
- On mobile, retain the current command and HEAD/inspection summary above the graph. Put detailed explanations and files in the existing panels. The selected target must survive panel and fullscreen changes.
- Reduced motion performs immediate framing and uses persistent paths, numbered hops and text instead of travel animation.

## Playback behavior

A command can have three explanatory beats: **identify the reference → trace the relationship → inspect the result**. These beats explain a command; they are not extra Git operations.

Use the existing playback controller as the single timing authority. Play waits for a command's explanation to settle before advancing. Pause freezes the explanation, and Replay reruns that explanation without executing the command again. Seeking/back selects the corresponding repository snapshot and its final visual emphasis. Changing topics or modes cancels pending motion and clears stale selections.

Keep actual repository state, command-selected inspection, and a user's manual inspection distinct. A manual selection pauses playback and explains that it is being inspected. Replay or the next command restores that command's intended focus.

Invalid/rejected commands show the reason and retain the real state; they must not animate a checkout or reference movement that did not happen.

## Implementation sequence

1. **Describe what each command selects.** Add a pure resolver alongside the existing trace code for target IDs, traversed parent edges, selected/excluded commits, comparison endpoints and before/after reference attachments. Reuse the engine's reference resolution and ancestry helpers. Derive values from actual state, never terminal-output parsing or guessed IDs.
2. **Render the explanation.** Extend the shared graph with optional selection, path and reference overlays plus stable layout coordinates. Keep existing uses of the graph working when no explanation is supplied.
3. **Add focus and playback.** Implement bounded camera focus and the explanatory beat sequence, including manual control, replay, reduced motion and cancellation.
4. **Complete V08 and V07 as the pilot.** Author captions, connect output rows to graph nodes, add the detached-checkout contrast, and review desktop/mobile screenshots and interaction.
5. **Apply the same behavior to existing lessons.** Cover tag inspection, branch deletion, file-diff endpoints, staging, commit and push. Feed the later merge/rebase/reset comparisons into this same explanation layer rather than building unrelated effects.

Likely changes: a new selection/focus resolver in `lib/visual-lab/`, optional explanation fields in prepared frames, graph-camera helpers, `HistoryGraph`, `RepositoryScene`, playback orchestration and lesson annotations. The simulator remains the authority for Git outcomes.

## Acceptance checks

- Every V08 command produces its correct persistent selection/path/comparison, even when before and after repository state are identical.
- `HEAD~2` traces two first-parent edges; `HEAD^2` traces one second-parent edge. Both resolve to the same IDs that the command engine inspects.
- `show`, `log`, `diff` and clicking a commit never move actual HEAD.
- Creating a branch leaves HEAD unchanged. Switching changes its attachment, including when both branches point to the same commit. Detached checkout does not move a branch tip.
- Range highlights match the actual ancestry set, including shared ancestors and merges. Diff highlights identify endpoint trees.
- Camera tests assert focus bounds and readable targets at 1920×1080, 1366×768, 1280×720 and mobile sizes. Manual navigation remains respected.
- Rapid Next/Previous, seek, replay, topic changes, fullscreen and hidden tabs leave no stale highlight, camera jump or duplicate command execution.
- Keyboard and reduced-motion users receive the same selections, parent numbering and explanations. Existing graph dragging, inspection and fullscreen checks still pass.

The pilot is ready when a learner can explain the difference between `HEAD~2`, `HEAD^2`, inspecting a commit and switching to it by following the graph itself.

## Release verification — 2026-10-26

- All 133 engine, lesson, progress, real-Git and PowerShell checks passed. The local production build and Vercel build passed.
- The complete 51-test browser regression run passed. Live verification then exposed a lesson-link bug: changing the URL fragment in an already-open tab left the previous lesson selected. The player now responds to valid fragment changes, returns to guided mode and closes the topic picker. A regression test confirmed the original failure and now passes, including Back/Forward and saved checkpoint restoration.
- All 21 visual-player and graph-focus browser checks passed after that fix, covering 52 distinct browser checks across the regression and corrective runs. Desktop sizes were 1920×1080, 1366×768 and 1280×720; mobile was 390×844. Accessibility, keyboard, playback cancellation, reduced motion and fullscreen checks passed.
- Live verification passed on both public addresses: all HEAD parent selections, fixed checkout during inspection, revision ranges, endpoint tree differences, same-commit branch switching, detached checkout, fullscreen context and mobile controls. No page errors were recorded.

Production deployment: `gitquest-4lxdy86lv-balaji-degalas-projects.vercel.app`, aliased to `raga-git.vercel.app` and `gitquest-lab.vercel.app`. Verification script: `.local/verify-visual-focus-release.mjs`; report: `.local/visual-focus-live-report.json`; screenshots: `.local/visual-focus-live-desktop.png` and `.local/visual-focus-live-mobile.png`.

The comparison timelines and additional curriculum modules listed in [the player update](git-visual-lab-update.md#remaining-work) remain future milestones.
