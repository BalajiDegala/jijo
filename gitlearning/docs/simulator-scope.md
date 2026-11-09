# Supported simulator scope

The browser executes a deterministic JavaScript repository model, never a shell. No GitHub service, credential exchange, local companion or deployment agent is implemented. Real-machine checklists are self-reported. Evidence labs verify decisions, not production outcomes.

## Modeled state

Working files, full index snapshots, commit snapshots and parents, branch refs, symbolic/detached HEAD, lightweight tags, stash entries, local reflog, merge conflicts, remote object storage and remote branch refs, local tracking refs and upstream configuration. IDs are deterministic teaching identifiers, not cryptographic Git hashes. Each commit also records a teaching author and timestamp.

Remote storage is independent. A teammate action adds a remote commit without changing local objects or tracking. Fetch transfers reachable commits and updates tracking without changing local HEAD/index/files. Push checks ancestry and protection before transferring objects and moving the remote ref. Pull fetches then merges or rebases; a completed fetch is retained if integration fails. A protected remote main rejects direct pushes. Hosting reviews and policy changes are taught in evidence exercises, not fabricated API calls.

## Commands

| Operation             | Supported subset                                                                                                                             |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| init / clone / config | init [-b], clone from supplied simulated fixture; local user.name, user.email, pull.rebase; rerere.enabled stored only                       |
| status / add / rm     | status [-s/--short], add paths or . / -A, rm paths [--cached]; index snapshots independent of later edits                                    |
| commit                | -m, --amend, --no-edit with amend; explicit merge completion after resolving files                                                           |
| inspect               | diff, diff --staged/--cached, diff ref ref; log --oneline/--all/--graph (text list plus visual graph), ref or A..B; show ref; reflog         |
| branches / HEAD       | branch, -a, -d/-D, branch name [ref], switch -c/--detach, checkout -b/existing ref; HEAD~n, HEAD^n, HEAD@{n}                                 |
| integrate             | fast-forward, three-way merge, --no-ff, --abort; nonconflicting linear rebase; nonconflicting cherry-pick and single-parent revert           |
| undo                  | reset --soft/--mixed/--hard; restore paths and restore --staged                                                                              |
| stash / tags          | tracked stash, -u, list, pop, apply, drop latest; lightweight tag name [ref]                                                                 |
| remote                | one named remote, add/-v/rename/set-url/remove; clone, fetch [remote branch], push [-u remote branch], pull [--rebase/--no-rebase/--ff-only] |
| file helpers          | echo quoted content > or >> path, touch, cat; UI editor and deletion; no arbitrary shell                                                     |

`help` lists the modeled interface. Unknown operations and options return errors. Normal output is explanatory rather than byte-for-byte identical to a particular Git version.

## Deliberate boundaries

- Merges compare whole files. Real Git can combine independent line edits in one file. Supported conflicts pause until marker-free content is staged and committed.
- Rebase supports clean linear replay. Conflict continuation, interactive rebase, --onto, merge-preserving rebase and conflict cherry-pick/revert are taught on the real machine. A rejected conflicting rebase leaves the model unchanged.
- Switching/integration uses a conservative clean-tree requirement, including untracked work. Real Git permits some non-overlapping edits.
- Ignore matching covers ordinary exact names, single-star wildcards and directory prefixes. Advanced negation/glob patterns are outside the browser model.
- No interactive staging, bisect process, submodule filesystem, hook execution, LFS backend, signed object verification, pruning, partial-clone server or background maintenance runs inside the browser. These topics have original source lessons, editorial checks and local exercises or procedure checkpoints.
- Remote transfers use one configurable remote. Multiple remotes, force pushes, tag transport, remote branch deletion and general refspecs are not simulated. The source lessons explain them; unknown flags are rejected. The browser's default pull is explicitly merge-based unless rebase is configured. It does not inherit the learner's real Git configuration.
- Reflog does not expire and there is no garbage collection in the simulator. Real recovery depends on retained objects; never infer that uncommitted work is recoverable.
- Browser state is ephemeral per scenario visit. Learning progress and navigation preference persist locally. Scenario resets preserve overall completion. Old records are retained without being relabeled as verified.

## Curriculum provenance

`scripts/import-curriculum.mjs` imports all 80 original questions/answers into `lib/curriculum/source.json` and regenerates `docs/scenario-matrix.md`. Original Markdown is unchanged. Numbering and source line locations are preserved. Source answers may contain OCR mistakes; editorial notes are separate. Runnable exercise commands are authored and corrected. A source topic mapping does not imply its entire command surface is implemented in the browser.

Thirty of the required forty practical labs execute browser commands. Ten advanced practical labs and all 23 incident cases assess diagnosis, remediation and verification with source references. Machine fixtures reproduce core incidents using local Git and local bare remotes; hosting permissions, credential rotation, history-cleaning policy, compliance and deployment reconciliation require real systems and are provided as explicit procedures, never claimed as completed by the browser.

## Primary references for editorial review

- [Git pull integration and configuration](https://git-scm.com/docs/git-pull)
- [Revert and merge ancestry](https://git-scm.com/docs/git-revert)
- [Configuration, including bigFileThreshold](https://git-scm.com/docs/git-config)
- [Bisect exit status and reproducibility](https://git-scm.com/docs/git-bisect)
- [Reset behavior](https://git-scm.com/docs/git-reset)
- [Git installation](https://git-scm.com/install/)

The supplied reference screenshot was not present; the layout follows the supplied wireframe and measured desktop/mobile acceptance criteria.
# Help and graph interaction update

`help`, `git`, `git --help`, `git -h`, and `git help` display simulator help, including before initialization. Use `git help <command>`, `git <command> --help` or `git <command> -h` for supported syntax and explanations. Unknown commands stay errors; close misspellings suggest a correction without running it.

The history graph has independent fit and fullscreen actions, an unrestricted camera, mouse/touch dragging, keyboard arrows, and zoom controls. Fullscreen fills the application viewport using an accessible modal; Escape exits and restores focus.
