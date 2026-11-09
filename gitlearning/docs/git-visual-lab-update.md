# Git Visual Lab: first player milestone

`/branches` now opens **Git Visual Lab**. This release implements the first player milestone of [the full plan](git-visual-lab-plan.md); it does not claim completion of all 36 proposed modules.

## Available

- **L01:** one continuous story from `git init` through working A, staging A, editing B, inspecting both diffs, committing A, committing B, configuring origin and pushing both commits.
- **V01–V06:** Git versus hosting, initialization, status/diff, staging snapshots, unstaging versus untracking, and commit inspection.
- **V07–V12:** branches, HEAD and ancestry, local/remote deletion, tags, checkout/switch/restore, and ignored files.
- Previous/next, play/pause, replay, restart, seek and 0.5×/1×/1.5×/2× speed. Playback starts paused and stops at predictions, rejection/danger steps and the end.
- Topic search, a selectable transcript, actual file contents in all four repository areas, before/after file inspection, and the existing interactive commit graph.
- Opening an inspector or the topic selector pauses playback. Graph interactions pause playback. Hidden tabs pause, and topic/mode changes cancel the previous playback timer.
- Desktop panels stay inside the viewport. Laptop layouts place snapshots beside the graph. Mobile switches between Animation, Explanation and Files while keeping the same checkpoint.
- Reduced motion removes the new transitions while preserving every command, state, event description and transcript step.

## State and progress

The existing Git engine is the source of truth. `prepareLesson` validates each authored command's expected success or rejection and freezes its resulting snapshot. Seeking selects those snapshots; it never runs the command again. Replay therefore cannot create duplicate commits or push twice.

Transition descriptions derive from changes to file contents, commits, branch/tracking/tag references, remote objects, remote configuration and upstream settings. Command output comes from the engine. Whole-file merge and other existing simulator limits still apply.

`gitquest-progress-v1` retains all existing records. An additional `visualLab` field stores the last lesson and, per lesson version, its checkpoint, whether the end was reached, and whether its knowledge check was answered correctly. Playing a story never earns simulator verification or legacy lesson mastery. A changed lesson version resets only that lesson's visual record.

The existing merge/rebase and reset/revert demos remain available under **Compare operations**. Merge and rebase now use identical starting history and the same active `feature/login` branch, with `main` unchanged. These remain immediate outcome comparisons; the planned synchronized explanatory timelines are a subsequent milestone.

## Verification

Unit coverage includes every authored command, immutable deterministic snapshots, staged A versus working B, transfer only after push, independent remote/tracking references, playback boundaries, comparison ancestry, defensive storage loading and progress migration.

Browser coverage exercises complete playback, checkpoint pauses, inspection, seek/replay, all 13 topics, persistence, keyboard controls, fullscreen, hidden tabs, comparison mode and desktop/mobile accessibility. Screenshots are saved under ignored `.local/`.

Validation: the full existing unit/real-Git run passed 127 checks, followed by a passing targeted run that includes the new comparison assertion (128 total unique checks). All 40 browser checks passed across the regression and corrective runs. The corrective run fixed accessible file-button labels and a pre-existing graph test that read node geometry before the node was visible. The production build passes.

Published on 2026-10-21 to the existing Vercel project. Live browser verification passed at both `https://raga-git.vercel.app/branches` and `https://gitquest-lab.vercel.app/branches`: staging A while working B, two commits after push, mobile command visibility, topic search, and no page errors. The report and desktop/mobile screenshots are under `.local/visual-lab-live-*`.

## Remaining work

The command-driven graph clarity milestone is implemented; see [its implementation and verification record](git-visual-focus-plan.md). V07 and V08 now distinguish inspection from checkout, show parent paths and range membership, and keep command focus visible with controllable camera following. The broader curriculum work below remains a subsequent milestone.

1. Implement synchronized merge/rebase, reset and fetch/pull comparison timelines.
2. Complete V13–V18 as individual remote lessons; L01 currently teaches the first-push portion.
3. Add integration/recovery V19–V30 and team lifecycle V31–V36, including explicitly conceptual review and CI scenes.
4. Add direct free practice from an arbitrary visual checkpoint. Current links open the related existing browser/machine scenario.

The original curriculum, all 80 interview entries, existing scenarios and machine practice remain accessible.
