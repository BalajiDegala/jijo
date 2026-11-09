// Authored checks, distinct from the preserved original interview questions.
const checks = [
  [
    "A hosting service is unavailable. What remains possible in a full local Git clone?",
    "Create branches and commits locally.",
    "All Git operations require the hosting server.",
  ],
  [
    "You stage a file, then edit it again. What does the next commit contain?",
    "The staged snapshot, unless you stage again.",
    "The latest working-tree contents automatically.",
  ],
  [
    "When should you clone instead of init?",
    "When copying an existing repository and its history.",
    "Whenever you create a new unrelated project.",
  ],
  [
    "What is recorded by a normal commit?",
    "The index snapshot and commit metadata.",
    "Every file on your computer.",
  ],
  [
    "What does git diff --staged compare?",
    "The index with HEAD.",
    "The remote server with your editor.",
  ],
  [
    "Why use git add -p on a real machine?",
    "Select individual change hunks for a focused commit.",
    "Automatically push all files.",
  ],
  [
    "Creating a branch without switching does what?",
    "Adds a reference while leaving HEAD on the current branch.",
    "Copies all repository objects to a new directory.",
  ],
  [
    "When can a merge fast-forward?",
    "When the current tip is an ancestor of the incoming tip.",
    "Whenever both branches have different commits.",
  ],
  [
    "Why do rebased commits normally have new IDs?",
    "Their ancestry or other commit content changed.",
    "Rebase changes only a visual label.",
  ],
  [
    "Before rebasing shared work, what matters?",
    "Coordinate with collaborators because IDs and ancestry may change.",
    "Assume everyone’s clones update automatically.",
  ],
  [
    "What does origin/main represent locally?",
    "Your last fetched or updated remote-tracking reference.",
    "A live connection that always equals the server.",
  ],
  [
    "Which operation fetches without integrating?",
    "git fetch.",
    "git pull always leaves the current branch untouched.",
  ],
  [
    "Which stash action keeps the entry after applying it?",
    "git stash apply.",
    "git stash pop always keeps the entry.",
  ],
  [
    "Why can an ignored file still be modified in status?",
    "It is already tracked in the index.",
    "Ignore patterns force a clean working tree.",
  ],
  [
    "How does a release tag normally differ from a branch?",
    "It stays at the selected release commit by convention.",
    "It advances whenever any branch commits.",
  ],
  [
    "What does ordinary git log follow?",
    "Commits reachable from the selected starting reference.",
    "Every object that ever existed on every server.",
  ],
  [
    "How do you preserve new detached-HEAD work?",
    "Create a branch referencing the new commit.",
    "Leave the commit unnamed and assume it is permanent.",
  ],
  [
    "Which reset keeps the index and working tree unchanged?",
    "git reset --soft.",
    "git reset --hard.",
  ],
  [
    "Why often choose revert for a published mistake?",
    "It appends an inverse commit without removing existing ancestry.",
    "It erases the original commit from every clone.",
  ],
  [
    "What does cherry-pick apply?",
    "The change introduced by the selected commit.",
    "Every commit on every branch.",
  ],
  [
    "What makes bisect useful?",
    "Known good/bad endpoints and a repeatable test.",
    "Guessing a commit without testing.",
  ],
  [
    "What precaution belongs before discarding local edits?",
    "Inspect status and preserve any work you need.",
    "Assume reflog saves all uncommitted content.",
  ],
  [
    "Where should credentials be handled?",
    "An appropriate credential manager or SSH agent on your machine.",
    "In this website’s simulated terminal.",
  ],
  [
    "What is a pull request?",
    "A hosting-platform review and integration workflow.",
    "A Git object stored in every clone.",
  ],
  [
    "Why prefer local config for a disposable exercise?",
    "It changes only that practice repository’s settings.",
    "It changes every teammate’s global settings.",
  ],
  [
    "How should a team choose a branching workflow?",
    "Fit release cadence, review needs and operational constraints.",
    "Assume one named workflow is universally best.",
  ],
  [
    "What do feature flags separate?",
    "Code deployment from feature exposure.",
    "Commits from their parent history.",
  ],
  [
    "What is the purpose of conventional commits?",
    "Give commit messages a consistent meaning for people and tooling.",
    "Cryptographically sign every commit automatically.",
  ],
  [
    "What should a squash integration preserve?",
    "The intended combined change, even though commit structure changes.",
    "Every original commit identity in the new squashed commit.",
  ],
  [
    "Can a client hook replace server enforcement?",
    "No; local hooks can be bypassed and are not sufficient enforcement.",
    "Yes; every clone must obey every local hook.",
  ],
  [
    "What does branch protection add?",
    "Hosting policies for permitted updates and required checks.",
    "A guarantee that application code contains no bugs.",
  ],
  [
    "What does a submodule gitlink record?",
    "A specific commit in another repository.",
    "Always the newest remote main commit.",
  ],
  [
    "How does a subtree differ from a submodule?",
    "It integrates files/history under a directory in the parent repository.",
    "It is only a remote-tracking branch name.",
  ],
  [
    "What is a monorepo tradeoff?",
    "Atomic cross-project changes versus scaling and access/tooling complexity.",
    "Unlimited scale without build or ownership design.",
  ],
  [
    "What does LFS normally store in Git?",
    "Pointer files referring to externally stored large content.",
    "A guarantee that all old binary history is erased.",
  ],
  [
    "What does rebase --onto let you choose?",
    "A new base and the range of commits to transplant.",
    "The server’s access control policy.",
  ],
  [
    "What does reflog help inspect?",
    "Local reference movements within retention limits.",
    "Every unsaved editor change forever.",
  ],
  [
    "What is a linked worktree useful for?",
    "Checking out another branch in a separate working directory sharing repository data.",
    "Automatically merging all branches.",
  ],
  [
    "What does a valid signature establish?",
    "Evidence of signing identity and integrity under your trust model.",
    "Proof that the signed code is secure.",
  ],
  [
    "What is the first response to a leaked active credential?",
    "Revoke or rotate it and investigate use.",
    "Only delete the file in the newest commit.",
  ],
  [
    "Why test the merged result in CI?",
    "The integration can differ from either feature branch alone.",
    "A feature branch pass proves every future integration passes.",
  ],
  [
    "What makes CODEOWNERS useful?",
    "Routing review to owners when supported and enforced by hosting policy.",
    "Replacing tests and access controls entirely.",
  ],
  [
    "What makes a release reproducible?",
    "A traceable source revision and build/artifact provenance.",
    "A mutable version label without its source commit.",
  ],
  [
    "Why can a shallow CI checkout break tooling?",
    "Versioning or merge-base logic may require missing history or tags.",
    "Shallow checkout changes the contents of every existing commit.",
  ],
  [
    "In a fork workflow, what often differs between origin and upstream?",
    "origin points to your fork; upstream names the source project.",
    "Those names have fixed meanings enforced by Git.",
  ],
  [
    "What do GitHub, GitLab and Bitbucket add around Git?",
    "Hosting, collaboration, permissions and automation with differing capabilities.",
    "Different definitions of what a Git commit snapshot is.",
  ],
  [
    "How should you treat a rerere resolution?",
    "Review and test it before completing integration.",
    "Assume every reused resolution is semantically correct.",
  ],
  [
    "What is format-patch useful for?",
    "Transferring commit changes as patches for review/application workflows.",
    "Copying the hosting service’s permissions and secrets.",
  ],
  [
    "Which object links a snapshot to its parents?",
    "A commit object referencing a tree and parent commit IDs.",
    "A blob containing branch permissions.",
  ],
  [
    "Why can unreachable commits disappear eventually?",
    "Retention and garbage collection can prune objects no longer protected.",
    "Every commit is guaranteed to remain forever.",
  ],
  [
    "How do sparse checkout and partial clone differ?",
    "Sparse selects working paths; partial clone can defer object transfer.",
    "Both necessarily delete remote history.",
  ],
  [
    "Why is a bare repository suited to a shared remote?",
    "It stores repository data without a normal checked-out working tree.",
    "It has no commits or references.",
  ],
  [
    "What must a repository migration inventory include?",
    "Refs, authorship, tags and the separately managed hosting metadata/policies.",
    "Only the latest visible files.",
  ],
  [
    "What strengthens an audit trail?",
    "Traceable reviews, changes, builds, access events and retention policies.",
    "An editable commit message alone.",
  ],
  [
    "What is a major cost of history filtering?",
    "Changed IDs require coordinated ref updates and collaborator recovery.",
    "It silently revokes leaked credentials everywhere.",
  ],
  [
    "How should repository performance work begin?",
    "Measure transfer, object processing, checkout and status separately.",
    "Run arbitrary tuning commands without identifying the bottleneck.",
  ],
  [
    "What is a GitOps rollback?",
    "A reviewed desired-state change plus verified reconciler convergence.",
    "Proof that deployment succeeded as soon as git commit returns.",
  ],
];
export function knowledgeCheck(number) {
  const c = checks[number - 1];
  return c ? { prompt: c[0], correct: c[1], wrong: c[2] } : null;
}
