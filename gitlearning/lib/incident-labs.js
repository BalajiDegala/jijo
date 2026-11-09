// Authored evidence exercises based on Q58–Q80. Outputs are labeled fixtures, not executed commands.
export const incidents = [
  [
    58,
    "Production is on release/1.2. The hotfix and release both changed timeout.js. Merge reports CONFLICT.",
    "Both branches edited the same content differently. A clean merge cannot decide the intended timeout.",
    "Resolve the intended behavior on the release branch with the hotfix author, stage the resolution, run regression tests, then complete the merge.",
    "git status\ngit diff --staged\ngit log --oneline",
    "Review the resolved timeout and run the production regression test; no unmerged paths should remain.",
    "Abort the merge and reconstruct a minimal fix on a release branch if risk is too high.",
  ],
  [
    59,
    "A credential scanner reports a live API key in an earlier public commit. Deleting .env in HEAD did not close the alert.",
    "The credential is compromised, and earlier objects and external copies may still expose it.",
    "Revoke or rotate the key first. Investigate use, coordinate history cleanup, remove copied exposures where possible, and add scanning and ignore rules.",
    "git log --all -- .env\ngit status",
    "Confirm revocation with the provider and rerun secret scanning across history. A clean current file tree alone is insufficient.",
    "A private replacement repository may help containment, but cannot revoke the leaked key. Never paste a real key into this lab.",
  ],
  [
    60,
    "Remote main was force-pushed from A-B-C to A-D. A teammate still has C in a local clone.",
    "A non-fast-forward replacement removed the remote reference to B and C; another clone may still preserve them.",
    "Pause pushes, create backup refs in surviving clones, agree on canonical history, then restore the missing changes with coordinated review.",
    "git reflog\ngit log --oneline --all",
    "Check all intended commits and tests against the agreed main tip, then enable protection.",
    "Cherry-pick specific missing changes if restoring the exact old history would discard valid new work.",
  ],
  [
    61,
    "You committed while detached at an old release. After switching to main, the new commit disappeared from git log.",
    "No branch named that detached commit. It may still be reachable from the local reflog.",
    "Locate the commit in reflog and create a recovery branch before further cleanup.",
    "git reflog\ngit branch recovered HEAD@{1}\ngit show recovered",
    "Inspect the recovered tree and commit message, then integrate it deliberately. Verify the reflog index before using it.",
    "If another clone has the commit, fetch a named recovery branch from that clone.",
  ],
  [
    62,
    "After reset --hard, a committed feature and unsaved editor changes disappeared. The reflog shows the former commit.",
    "Committed snapshots and unsaved working edits have different recovery paths. Reflog does not record every edit.",
    "Anchor the committed snapshot with a recovery branch. Check editor history or backups for unsaved content; avoid claiming guaranteed recovery.",
    "git reflog\ngit log --all --oneline",
    "Compare recovered files to the expected work. Explicitly identify content still missing.",
    "Objects previously staged may sometimes survive, but object inspection is not a guaranteed recovery mechanism.",
  ],
  [
    63,
    "A merge passed incomplete tests. Three days of later commits now depend on it, and production is broken.",
    "A shared merge introduced a regression; resetting shared main would also remove later work.",
    "Contain the incident, identify the failing change, and prepare a tested revert or forward fix. For a merge revert, select the correct mainline parent.",
    "git log --oneline --all\ngit show HEAD",
    "Test the rollback against the current tree and dependent changes; deploy the tested artifact.",
    "A forward fix may be safer when a revert would break subsequent dependencies.",
  ],
  [
    64,
    "The clone is 10 GB. Most bytes are old build archives, while a developer needs only services/api.",
    "Historical blobs dominate transfer and storage; limiting checkout alone does not erase history.",
    "Measure objects and required history. Choose shallow history for suitable CI jobs, partial clone plus sparse checkout for developer scope, and plan binary migration separately.",
    "git count-objects -vH\ngit rev-parse --is-shallow-repository",
    "Measure transferred bytes, checkout size, history-dependent tooling and build correctness separately.",
    "Use LFS for future large assets; coordinated history cleanup may be required for old blobs.",
  ],
  [
    65,
    "An unpublished feature has 50 commits. Rebasing onto main stops repeatedly in the same file.",
    "Every replayed commit can conflict; repeated historical edits amplify resolution work.",
    "Preserve a backup ref. Abort if the process is unsafe; consider merging main, or simplify unpublished commits before a carefully reviewed rebase.",
    "git status\ngit rebase --abort",
    "After integration, compare intended feature behavior and run tests. Do not skip commits just to silence conflicts.",
    "Rerere may reuse a reviewed matching resolution; a fresh branch and selective replay may be simpler.",
  ],
  [
    66,
    "A bad commit is already on main and colleagues have pulled it.",
    "The history is shared. Moving main backward would disrupt other clones.",
    "Create a tested revert commit, leaving published ancestry intact.",
    "git revert HEAD\ngit log --oneline\ngit status",
    "The inverse change should be present in a new commit and tests should pass.",
    "For an unpublished local mistake, reset may be appropriate after preserving work.",
  ],
  [
    67,
    "Release v1.0 passes a deterministic test. Current main fails; about 200 commits lie between them.",
    "A known good/bad interval and reproducible test permit binary search through history.",
    "Start bisect with those endpoints, test each checkout, mark good/bad or skip untestable revisions, and reset when finished.",
    "git bisect start\ngit bisect bad\ngit bisect good v1.0\ngit bisect reset",
    "Reproduce the failure at the identified commit and its absence at the parent; confirm the cause before fixing.",
    "Manual inspection or blame can guide investigation if the test is nondeterministic.",
  ],
  [
    68,
    "The parent repository records vendor/library at commit A, but a developer tested B without committing the parent pointer.",
    "A submodule records an exact commit, not an automatically advancing branch.",
    "Check out the tested submodule revision, then stage and commit the changed gitlink in the parent.",
    "git submodule status\ngit submodule update --init --recursive\ngit diff --submodule",
    "A fresh recursive checkout must resolve the recorded revision and pass integration tests.",
    "Use a subtree or package dependency if its update and ownership model fits better.",
  ],
  [
    69,
    "Feature CI passes, but main CI fails at git describe. Its checkout has depth 1 and no release tags.",
    "The pipeline assumes history and tags that are absent in the main checkout.",
    "Inspect the exact checkout, fetch the history/tags needed by version calculation, and test the merge result in the same environment.",
    "git rev-parse --is-shallow-repository\ngit log --oneline\ngit tag",
    "Run the versioning and build commands with the actual CI checkout configuration.",
    "Remove unnecessary history dependence by supplying a verified version from release metadata.",
  ],
  [
    70,
    "Two unpublished commits were made on main but belong on feature/login. Working tree is clean.",
    "The commits are correct; the branch reference is wrong.",
    "Create a feature and backup reference at the current tip first; then move only local main back to its intended base.",
    "git branch feature/login\ngit branch backup/main\ngit log --oneline --all",
    "Both commits remain reachable on the feature branch; main points to the intended previous base.",
    "If already shared, use reviewed revert/cherry-pick changes instead of silently resetting main.",
  ],
  [
    71,
    "A developer used branch -D on an unmerged branch. The local reflog still includes its last commit.",
    "Deleting a reference does not immediately erase the commit object.",
    "Identify the correct tip, inspect it, and create a new named recovery branch.",
    "git reflog\ngit show HEAD@{1}\ngit branch recovered HEAD@{1}",
    "Confirm the exact desired tree on recovered and preserve it before garbage collection. Reflog indices depend on your actual history.",
    "Search another clone or a published remote branch if local objects are gone.",
  ],
  [
    72,
    "An unpublished feature has 200 fixup commits. Reviewers need a few logical changes.",
    "Development history is noisy, but the final changes may be sound.",
    "Back up the feature and squash or organize unpublished commits into meaningful units; compare the final tree afterward.",
    "git branch backup/feature\ngit log --oneline\ngit diff main HEAD",
    "Compare pre/post trees, review the rewritten patch, and run tests. History IDs should change while intended content remains.",
    "Preserve development history and squash at PR integration if team policy favors it.",
  ],
  [
    73,
    "Two developers rebased a shared branch independently. Their clones show duplicate-looking commits with different IDs.",
    "Both rewrites replaced commit identities while collaborators retained different old histories.",
    "Stop further rewriting, save unpublished work, agree on a canonical branch, and transplant only missing changes after inspection.",
    "git log --oneline --all\ngit reflog",
    "Compare patches as well as IDs; ensure no valid work was dropped or applied twice.",
    "Restore the pre-rebase shared history if that preserves collaborators’ work more safely.",
  ],
  [
    74,
    "Main contains an unfinished checkout redesign. Production v1.2 needs a tiny payment fix now.",
    "Branching the hotfix from main would include unreleased features.",
    "Branch from the production tag, apply only the fix, test and release it, then integrate the fix into ongoing development.",
    "git switch -c hotfix/payment v1.2\ngit log --oneline",
    "Diff the new release against v1.2 and verify it includes only intended production changes.",
    "A release branch already tracking production can serve as the hotfix base.",
  ],
  [
    75,
    "debug.log is listed in .gitignore but continues appearing as modified in status.",
    "The file is already tracked; ignore rules do not remove index entries.",
    "Remove it from the index while preserving the working copy, then commit that removal and the ignore rule.",
    'git rm --cached debug.log\ngit add .gitignore\ngit commit -m "Stop tracking logs"\ngit status',
    "Edit debug.log again; it should no longer appear as a tracked modification.",
    "Keep a sanitized template tracked if teammates need an example configuration.",
  ],
  [
    76,
    "A merge was reverted on main. Merging the unchanged feature again reports already up to date.",
    "The original merge is still in ancestry even though a later commit undid its content.",
    "Inspect the revert and current dependencies. Either revert the revert with a tested fix, or reconstruct the intended changes as new commits.",
    "git log --oneline --all\ngit show HEAD",
    "Verify intended original functionality is restored without reintroducing the defect. Test the combined result.",
    "New feature commits can merge, but do not automatically restore the originally reverted content.",
  ],
  [
    77,
    "Deleting a large binary in the latest commit did not reduce clone size.",
    "Older reachable commits still reference the large blob.",
    "Coordinate a backed-up history rewrite with git-filter-repo or BFG, verify all relevant refs, and handle hosted retention and collaborators’ clones.",
    "git count-objects -vH\ngit log --all -- assets/video.bin",
    "Scan rewritten reachable history and measure a fresh clone; update references and release artifacts deliberately.",
    "Adopt LFS for future assets while scheduling a separate historical cleanup.",
  ],
  [
    78,
    "Local main and origin/main both advanced. Pull created a merge commit the author did not expect.",
    "Divergence plus a merge integration strategy creates a merge commit; a fast-forward would not.",
    "Inspect divergence. Use explicit pull --rebase for unpublished local work, or --ff-only to refuse automatic divergent integration.",
    "git fetch\ngit log --oneline --all\ngit pull --ff-only",
    "Check parents and references; verify the resulting tree and whether IDs changed.",
    "Use a merge when preserving shared history and its integration boundary is preferable.",
  ],
  [
    79,
    "A feature is three months old and 500 commits behind main. Whole-file comparisons include many unrelated removals.",
    "A large base gap mixes intended feature changes with changes already made on main.",
    "Save the branch, identify its intended delta from the common base, and decide between careful integration and reconstruction on a fresh branch.",
    "git log --oneline --all\ngit diff main HEAD",
    "Review every intended feature requirement and run current integration tests; avoid undoing unrelated main changes.",
    "Merge main incrementally when preserving the existing branch history is valuable.",
  ],
  [
    80,
    "A reviewed conflict resolution is needed again during a later replay of the same change.",
    "Matching conflict preimages can permit reuse of a recorded resolution.",
    "Enable rerere before resolving, record the reviewed result, and inspect reused resolutions before staging and continuing.",
    "git config rerere.enabled true\ngit rerere status\ngit diff",
    "Review the reused patch and run tests. Confirm all unresolved paths are cleared before continuing.",
    "Resolve manually if the repeated-looking conflict is semantically different.",
  ],
].map(
  ([
    number,
    evidence,
    cause,
    remediation,
    commands,
    verification,
    alternative,
  ]) => ({
    id: `incident-${number}`,
    number,
    evidence,
    cause,
    remediation,
    commands,
    verification,
    alternative,
    precaution:
      "Use an isolated reproduction. Preserve refs and uncommitted work before changing history; coordinate any changes to shared history.",
  }),
);
export const advancedLabs = {
  protected: {
    evidence:
      "main rejects direct pushes. A feature PR has one failing required check and no CODEOWNER approval.",
    cause:
      "Branch protection evaluates the integration policy, not just whether Git can fast-forward.",
    remediation:
      "Push a feature branch, fix the failing check, request the required owner review, and merge only when the policy is satisfied.",
    commands: "git switch -c feature/review\ngit push -u origin feature/review",
    verification:
      "Inspect the PR merge result, required check conclusions, and branch policy. Browser Git does not implement a real hosting review.",
    alternative:
      "Use a temporary release exception only through the organization’s explicit emergency process.",
  },
  traceability: {
    evidence:
      "A release artifact has a version string, but the team cannot identify its reviewed source commit or approving PR.",
    cause:
      "Version labels without immutable build provenance do not establish a complete audit trail.",
    remediation:
      "Connect issue, reviewed PR, commit, release tag, changelog and artifact digest. Record approvals and CI results in the hosting system.",
    commands: "git log --oneline --all\ngit show v1.0",
    verification:
      "Resolve the tag to a commit, identify its review and build, and compare the deployed artifact digest.",
    alternative:
      "Signed tags add identity evidence but do not replace review records or artifact provenance.",
  },
  "release-design": {
    evidence:
      "The service deploys daily, the mobile client releases monthly, and a long-running feature is not ready for users.",
    cause:
      "A single long-lived integration branch can mix release cadence, incomplete work and environment state.",
    remediation:
      "Choose short-lived feature branches with tested main for the service; use owned feature flags for incomplete exposure, and explicit release branches/tags for maintained client versions.",
    commands: "git branch release/1.0\ngit tag v1.0",
    verification:
      "Trace a hotfix to the released base and ongoing development. Define flag removal, review, changelog and rollback ownership.",
    alternative:
      "Git Flow, GitHub Flow, GitLab Flow and trunk-based development each have costs; document the team’s release constraints before choosing.",
  },
  gitops: {
    evidence:
      "Production was edited manually. The declared deployment in Git still points to the previous tested image digest.",
    cause:
      "Live state drifted from the versioned desired state used by the reconciler.",
    remediation:
      "Change the desired state through a reviewed commit, using an immutable tested artifact. For rollback, revert the desired-state change and observe reconciliation.",
    commands: "git log --oneline\ngit revert HEAD",
    verification:
      "Check both the Git change and the reconciler’s health/sync status. A Git commit alone does not prove deployment success.",
    alternative:
      "Emergency live intervention needs an explicit process to reconcile desired state afterward.",
  },
};
const advancedMap = {
  bisect: 67,
  rerere: 80,
  submodules: 68,
  scale: 64,
  secret: 59,
  "ci-history": 69,
};
export function evidenceFor(scenario) {
  return (
    advancedLabs[scenario.id] ||
    incidents.find((i) => i.number === advancedMap[scenario.id]) ||
    incidents.find((i) => i.id === scenario.id)
  );
}
