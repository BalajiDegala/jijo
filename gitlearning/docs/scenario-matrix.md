# Scenario and curriculum coverage matrix

Generated from the two supplied Markdown files. Source wording is preserved in `lib/curriculum/source.json`; editorial corrections are separate. Browser command labs, evidence-based decision labs, and manual machine exercises are explicitly distinguished. A mapping is an inventory, not a claim that every command has a browser implementation.

## Required practical set

| # | Scenario | Prerequisites | Source questions |
|---|---|---|---|
| 1 | first-commit: Create your first repository | None | Q1, Q2, Q3, Q4 |
| 2 | staging: Stage one file, leave another unstaged | first-commit | Q2, Q5, Q6 |
| 3 | amend: Correct a mistaken commit message | first-commit | Q4, Q28 |
| 4 | restore: Modify, inspect, and restore safely | first-commit | Q5, Q13, Q22 |
| 5 | index-snapshot: Working tree versus staging snapshot | first-commit | Q2, Q6 |
| 6 | atomic-commits: Commit logical changes separately | first-commit | Q4, Q28 |
| 7 | history-head: Explore history and HEAD | first-commit | Q16, Q17, Q25 |
| 8 | add-remove: Add and remove files | first-commit | Q4, Q14, Q22 |
| 9 | ignore: Configure .gitignore | first-commit | Q14, Q75 |
| 10 | undo-compare: Compare restore, reset, and revert | first-commit | Q18, Q19, Q22 |
| 11 | branching: Build login on a feature branch | branching | Q7, Q26 |
| 12 | merge-feature: Merge a feature into main | branching | Q8, Q29 |
| 13 | conflict: Resolve a conflict between developers | branching | Q8, Q58 |
| 14 | update-feature: Update a feature after main changes | branching | Q8, Q10, Q79 |
| 15 | rebase: Compare merge and rebase visually | branching | Q9, Q10, Q36 |
| 16 | move-commit: Move a commit to another branch | branching | Q20, Q70 |
| 17 | wrong-branch: Recover a commit on the wrong branch | branching | Q18, Q37, Q70 |
| 18 | deleted-branch: Recover a deleted branch | branching | Q7, Q37, Q71 |
| 19 | clean-history: Squash development commits | branching | Q9, Q72 |
| 20 | detached: Save work from detached HEAD | branching | Q17, Q37, Q61 |
| 21 | clone: Clone a remote repository | merge-feature | Q3, Q11, Q23 |
| 22 | publish: Push a local commit | merge-feature | Q11, Q23 |
| 23 | fetch-only: Fetch without integrating | merge-feature | Q11, Q12 |
| 24 | pull-rebase: Pull a diverged branch with rebase | merge-feature | Q10, Q12, Q78 |
| 25 | rejected-push: Recover from a rejected push | merge-feature | Q11, Q12, Q60 |
| 26 | hotfix: Apply a hotfix with cherry-pick | merge-feature | Q20, Q74 |
| 27 | teammate: Integrate another developer’s change | merge-feature | Q8, Q12, Q45 |
| 28 | release: Create and inspect a release tag | merge-feature | Q15, Q39, Q43 |
| 29 | protected: Use a protected branch workflow | merge-feature | Q24, Q30, Q31, Q42 |
| 30 | traceability: Trace issue to review to release | merge-feature | Q24, Q28, Q43, Q54 |
| 31 | reflog-recovery: Recover commits with reflog | publish | Q37, Q50, Q62 |
| 32 | revert: Revert a production commit safely | publish | Q19, Q63, Q66, Q76 |
| 33 | bisect: Find a regression with bisect | publish | Q21, Q67 |
| 34 | rerere: Reuse a conflict resolution | publish | Q47, Q65, Q80 |
| 35 | submodules: Repair a pinned submodule revision | publish | Q32, Q33, Q68 |
| 36 | scale: Investigate a slow, oversized repository | publish | Q34, Q35, Q44, Q49, Q51, Q55, Q56, Q64, Q77 |
| 37 | secret: Respond to a committed secret | publish | Q23, Q39, Q40, Q59 |
| 38 | release-design: Design a release workflow | publish | Q26, Q27, Q29, Q38, Q43, Q46, Q48, Q52, Q53, Q73 |
| 39 | ci-history: Diagnose a CI history failure | publish | Q30, Q41, Q44, Q69 |
| 40 | gitops: Deploy and roll back with GitOps | publish | Q27, Q41, Q54, Q57 |

## Complete source question and lesson inventory

Each question has a corresponding lesson with the same ID. All original answers remain available.

| Source | Topic / lesson | Practice |
|---|---|---|
| Q1, line 101 | q01: What is version control? Centralized vs distributed | first-commit |
| Q2, line 115 | q02: Git architecture - working directory, staging, local, remote | first-commit, staging, index-snapshot |
| Q3, line 131 | q03: Git init, clone, config - setup | first-commit, clone |
| Q4, line 145 | q04: Git add, commit, status, log - basic workflow | first-commit, amend, atomic-commits, add-remove |
| Q5, line 161 | q05: Git diff - comparing changes | staging, restore |
| Q6, line 169 | q06: Interactive staging (git add -p) | staging, index-snapshot |
| Q7, line 179 | q07: Branches - create, switch, list, delete | branching, deleted-branch |
| Q8, line 193 | q08: Git merge - fast-forward, 3-way, merge commits | merge-feature, conflict, update-feature, teammate |
| Q9, line 207 | q09: Git rebase - linear history, interactive, squashing | rebase, clean-history |
| Q10, line 225 | q10: Rebase vs merge - when to use, golden rule | update-feature, rebase, pull-rebase |
| Q11, line 239 | q11: Git remote - origin, upstream, fetch, push | clone, publish, fetch-only, rejected-push |
| Q12, line 251 | q12: Git pull vs fetch - pull --rebase | fetch-only, pull-rebase, rejected-push, teammate |
| Q13, line 263 | q13: Git stash - save, apply, pop, list | restore |
| Q14, line 275 | q14: .gitignore - patterns, already-tracked files | add-remove, ignore |
| Q15, line 293 | q15: Git tags - lightweight, annotated, semver | release |
| Q16, line 305 | q16: Git log - formatting, filtering | history-head |
| Q17, line 311 | q17: HEAD, detached HEAD | history-head, detached |
| Q18, line 325 | q18: Git reset - soft, mixed, hard | undo-compare, wrong-branch |
| Q19, line 339 | q19: Git revert - safe undo | undo-compare, revert |
| Q20, line 351 | q20: Git cherry-pick | move-commit, hotfix |
| Q21, line 365 | q21: Git blame and bisect git blame | bisect |
| Q22, line 373 | q22: Git clean and restore | restore, add-remove, undo-compare |
| Q23, line 383 | q23: SSH keys and HTTPS - authentication SSH | clone, publish, secret |
| Q24, line 393 | q24: Pull requests / merge requests - code review | protected, traceability |
| Q25, line 407 | q25: Git aliases and configuration | history-head |
| Q26, line 419 | q26: Branching strategies - Git Flow, GitHub Flow, trunk-based Git Flow | branching, release-design |
| Q27, line 437 | q27: Trunk-based development - feature flags | release-design, gitops |
| Q28, line 453 | q28: Conventional commits - standards | amend, atomic-commits, traceability |
| Q29, line 463 | q29: Merge strategies - merge commit, squash, rebase merge | merge-feature, release-design |
| Q30, line 479 | q30: Git hooks - pre-commit, commit-msg, pre-push | protected, ci-history |
| Q31, line 493 | q31: Branch protection - reviews, status checks | protected |
| Q32, line 505 | q32: Git submodules | submodules |
| Q33, line 519 | q33: Git subtree - alternative to submodules | submodules |
| Q34, line 535 | q34: Monorepo vs polyrepo | scale |
| Q35, line 549 | q35: Git LFS - large file storage | scale |
| Q36, line 563 | q36: Git rebase --onto | rebase |
| Q37, line 569 | q37: Git reflog - recovering lost commits | wrong-branch, deleted-branch, detached, reflog-recovery |
| Q38, line 581 | q38: Git worktree | release-design |
| Q39, line 591 | q39: Signed commits and tags | release, secret |
| Q40, line 605 | q40: Git secrets and security | secret |
| Q41, line 615 | q41: GitHub Actions / GitLab CI integration | ci-history, gitops |
| Q42, line 629 | q42: Code owners | protected |
| Q43, line 635 | q43: Release management - tagging, changelogs | release, traceability, release-design |
| Q44, line 645 | q44: Git in CI/CD - shallow clone, sparse checkout, performance | scale, ci-history |
| Q45, line 659 | q45: Forking workflow | teammate |
| Q46, line 669 | q46: GitHub vs GitLab vs Bitbucket | release-design |
| Q47, line 675 | q47: Git rerere - reuse recorded resolution | rerere |
| Q48, line 685 | q48: Git patch and format-patch | release-design |
| Q49, line 699 | q49: Git internals - objects, SHA-1, packfiles | scale |
| Q50, line 727 | q50: Garbage collection - gc, prune, dangling objects | reflog-recovery |
| Q51, line 741 | q51: Monorepo at scale - sparse checkout, partial clone | scale |
| Q52, line 763 | q52: Git server administration - bare repos, hooks, access | release-design |
| Q53, line 779 | q53: Platform migration - SVN to Git, GitHub to GitLab SVN to Git | release-design |
| Q54, line 791 | q54: Git and compliance - audit trails, traceability | traceability, gitops |
| Q55, line 805 | q55: Rewriting history - filter-repo, BFG | scale |
| Q56, line 825 | q56: Performance at scale - fsmonitor, maintenance | scale |
| Q57, line 847 | q57: GitOps - Git as source of truth | gitops |
| Q58, line 867 | q58: Merge conflict in production hotfix | conflict; incident-58 → conflict |
| Q59, line 881 | q59: Accidentally committed secrets to repo | secret; incident-59 → secret |
| Q60, line 895 | q60: Force push overwrote teammate's commits | rejected-push; incident-60 → rejected-push |
| Q61, line 913 | q61: Detached HEAD - commits lost | detached; incident-61 → detached |
| Q62, line 931 | q62: git reset --hard lost uncommitted work The Harsh Reality | reflog-recovery; incident-62 → reflog-recovery |
| Q63, line 945 | q63: Merge produced broken build - unnoticed 3 days | revert; incident-63 → revert |
| Q64, line 963 | q64: Repo is 10GB - clone takes 30 minutes | scale; incident-64 → scale |
| Q65, line 975 | q65: Rebase conflict hell - 50 conflicts | rerere; incident-65 → rerere |
| Q66, line 995 | q66: Wrong commit on main - revert vs reset | revert; incident-66 → revert |
| Q67, line 1005 | q67: Git bisect finds bug 200 commits ago | bisect; incident-67 → bisect |
| Q68, line 1019 | q68: Submodule stuck on wrong commit | submodules; incident-68 → submodules |
| Q69, line 1033 | q69: CI fails only on main - works on feature branches | ci-history; incident-69 → ci-history |
| Q70, line 1043 | q70: Committed to wrong branch | move-commit, wrong-branch; incident-70 → wrong-branch |
| Q71, line 1053 | q71: Deleted branch with unmerged work | deleted-branch; incident-71 → deleted-branch |
| Q72, line 1063 | q72: 200 tiny commits - clean before merge | clean-history; incident-72 → clean-history |
| Q73, line 1075 | q73: Two devs rebased same branch - duplicate commits | release-design; incident-73 → release-design |
| Q74, line 1089 | q74: Hotfix needed but main has unreleased features | hotfix; incident-74 → hotfix |
| Q75, line 1103 | q75: .gitignore not working - file already tracked | ignore; incident-75 → ignore |
| Q76, line 1117 | q76: Reverted merge commit, can't re-merge | revert; incident-76 → revert |
| Q77, line 1135 | q77: Large binary committed - repo bloated | scale; incident-77 → scale |
| Q78, line 1149 | q78: Git pull creates unexpected merge commits | pull-rebase; incident-78 → pull-rebase |
| Q79, line 1167 | q79: Feature branch 3 months old, 500 behind main | update-feature; incident-79 → update-feature |
| Q80, line 1183 | q80: Same conflict appearing repeatedly | rerere; incident-80 → rerere |

## git-docs.md topic inventory

| Notes topic | Lessons | Practice |
|---|---|---|
| Git / GitHub, centralized / distributed | q01, q46 | first-commit |
| Three areas plus remote, init / config / clone | q02, q03 | first-commit, clone, index-snapshot |
| status / add / commit / log / amend | q04, q16 | staging, atomic-commits, amend |
| diff / staged diff / ref comparisons | q05, q06 | index-snapshot, history-head |
| Branches / checkout / switch / deletion | q07 | branching, deleted-branch |
| HEAD / parent refs / detached HEAD | q17 | history-head, detached |
| merge / conflict / rebase | q08, q09, q10, q58 | merge-feature, conflict, rebase |
| origin / upstream / tracking / remote CRUD | q11, q45 | clone, publish, fetch-only |
| fetch / pull / push / remote deletion | q11, q12, q78 | fetch-only, pull-rebase, rejected-push |
| restore / reset / revert / reflog | q18, q19, q22, q37 | undo-compare, reflog-recovery, revert |
| stash | q13 | q13 evidence exercise and machine practice |
| cherry-pick / hotfix | q20, q74 | hotfix |
| tags / releases | q15, q43 | release |
| ignore / tracked files / rm --cached | q14, q75 | ignore, add-remove |
| Feature branches / reviews / GitHub Flow / trunk | q24, q26, q27 | protected, release-design |
| Jenkins / triggers / Git in CI/CD | q41, q44, q69 | ci-history |
| Merge/rebase, reset/revert, fetch/pull diagrams | q08, q10, q12, q18, q19 | Branch Visualizer, workspace graph |

## Review flags

The interview guide is OCR-derived. Original text is retained verbatim; examples shown as runnable commands are authored, corrected, and tested separately. Malformed spaces/options, `Ifs`/`lIfs`, and duplicated heading fragments must not be copied blindly.

- Q1: A normal full clone contains reachable history, but shallow and partial clones deliberately omit data. Hosting settings, issues, and permissions are separate. The adoption percentage in the source is not verified.
- Q2: Staging copies a file snapshot into the index; it does not move the file out of the working directory. Ignored and untracked are distinct states.
- Q4: A commit is a snapshot, not an eternal backup. Unreachable objects may eventually be pruned. Object identifiers depend on the repository object format.
- Q7: A branch is a reference, not necessarily a loose file of a fixed size. git checkout feature-a switches to an existing branch; -b creates it.
- Q12: Pull fetches and then integrates according to flags and configuration. A merge-based pull can fast-forward without creating a merge commit.
- Q15: Tags conventionally stay fixed, but can be explicitly replaced. Ordinary branch pushes do not automatically publish all tags.
- Q18: Hard reset replaces tracked index and working-tree content. It does not generally delete unrelated untracked files. Uncommitted content may be unrecoverable; committed objects may remain in reflogs.
- Q23: Prefer an OS credential manager or SSH agent. credential.helper store keeps credentials in plaintext. Never paste tokens, passwords, or private keys into this site.
- Q24: Review sizes and required reviewer counts are team policy examples, not Git requirements.
- Q26: Workflow selection depends on release and team constraints. No branching model eliminates conflicts. GitLab Flow can connect short-lived feature branches to environment or release branches.
- Q27: Feature flags separate deployment from exposure but require ownership, tests, access controls, and removal of obsolete flags.
- Q37: Reflog retention is configurable and local. Recovery is not guaranteed after expiration or garbage collection. Prefer creating a recovery branch before moving existing refs.
- Q49: Git supports SHA-1 and SHA-256 repository object formats. Blobs store content, trees store entries, and commits reference a tree and parents.
- Q59: Revoke or rotate the credential first. Removing a file or rewriting one clone does not revoke credentials or erase copies in forks, caches, logs, and other clones.
- Q62: Reflog records reference movement, not every unsaved edit. Do not promise recovery of content that was never committed or otherwise stored.
- Q64: core.bigFileThreshold influences object handling; it does not warn contributors or prevent large files. LFS does not retroactively remove old binary objects.
- Q67: For bisect run: exit 0 is good; 1–127 is bad except 125, which skips; other exit codes abort. A deterministic test is essential.
- Q68: Fetching and checking out an existing main branch does not necessarily update it. Check out the exact tested dependency commit, then commit the new gitlink in the parent.
- Q70: Create a named backup reference before resetting a branch. Preserve uncommitted work separately before any hard reset.
- Q73: Coordinate a canonical history and save unpublished work before rebuilding a clone or branch. Do not reset a teammate’s branch blindly.
- Q75: Ignore rules only affect untracked files. Remove an already tracked file from the index with git rm --cached, then commit; its working copy remains.
- Q76: Reverting a merge undoes its changes without erasing its ancestry. New commits may merge, but the originally reverted changes remain absent. A plain rebase is not a guaranteed repair. Consider reverting the revert or deliberately reconstructing the change.
- Q77: History rewriting changes commit IDs and needs coordination. Hosted garbage collection and cached copies are outside your clone’s control. Preserve a backup and verify object removal.
- Q78: Unexpected merge commits require divergent histories and a merge integration strategy; not every pull creates a merge commit.
- Q79: A raw diff from current main to an old branch can reverse newer main changes. Identify the intended changes from the common base, reconstruct carefully, and test. Numeric conflict thresholds in the source are heuristics.
- Q80: Rerere reuses matching recorded resolutions. Review and test the result; not every repeated-looking conflict has the same preimage.

No reference screenshot was supplied in the workspace. The user’s wireframe and existing application were inspected.
