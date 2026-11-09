import { module as m, step as s, concept as c } from "../schema.js";
export default [
  m(
    "V07",
    "Create, switch & build a branch",
    "history",
    [
      [3, 3],
      [90, 93],
      [414, 421],
    ],
    "branching",
    8,
    "Watch a branch name and HEAD move independently.",
    [
      s(
        "git branch feature/login",
        "A branch is a movable reference to a commit.",
        "Both names point to the same commit; HEAD still follows main.",
      ),
      s(
        "git switch feature/login",
        "Switch attaches HEAD to the named branch.",
        "No files change because both names currently select the same tree.",
      ),
      s(
        'echo "Login form" > login.js',
        "Develop the feature in the checked-out working tree.",
        "A new untracked file appears.",
      ),
      s(
        "git add login.js",
        "Select the feature for the next snapshot.",
        "login.js enters the index.",
      ),
      s(
        'git commit -m "Build login"',
        "Only the active branch moves to the new commit.",
        "feature/login advances. main remains at the previous commit.",
      ),
      s(
        "git switch main",
        "Checkout restores the target branch's tracked snapshot.",
        "login.js disappears from this checkout but remains saved on feature/login.",
      ),
      s(
        "git show HEAD~1",
        "First inspect the previous commit without checking it out.",
        "The inspection ring selects the parent. HEAD still follows main and the working files stay unchanged.",
      ),
      s(
        "git switch --detach HEAD~1",
        "Now check out that previous commit explicitly.",
        "HEAD points directly to the older commit. The working tree is restored to its snapshot; both branch tips stay fixed.",
      ),
      s(
        "git switch main",
        "Return from detached HEAD to a named branch.",
        "HEAD attaches to main again and restores main's saved contents.",
      ),
    ],
    [
      "Does git branch feature/login switch HEAD?",
      ["Yes", "No; use git switch"],
      1,
      "Creating a reference and choosing the current reference are separate actions.",
    ],
    {
      version: 2,
      mistake:
        "Creating a branch leaves HEAD where it was. show inspects a commit; switch --detach checks it out. The source's checkout feature-a example needs -b to create a branch.",
      comparisons: ["create-switch", "checkout-switch"],
    },
  ),
  m(
    "V08",
    "HEAD, parents & revision ranges",
    "merged",
    [
      [86, 114],
      [119, 125],
    ],
    "history-head",
    7,
    "Navigate a two-parent history without confusing ancestry with a file diff.",
    [
      s(
        "git show HEAD",
        "HEAD follows feature/login to a merge commit.",
        "Inspect the two parent IDs in the graph.",
      ),
      s(
        "git show HEAD~1",
        "~1 follows the first parent: the feature's previous tip.",
        "main's incoming commit is not selected.",
      ),
      s(
        "git show HEAD~2",
        "~2 follows the first-parent chain twice.",
        "It does not mean the second parent of a merge.",
      ),
      s(
        "git show HEAD^2",
        "^2 chooses the merge commit's second parent.",
        "This selects the incoming main tip.",
      ),
      s(
        "git log main..feature/login",
        "A..B selects commits reachable from B but not A.",
        "The output lists history unique to feature/login.",
      ),
      s(
        "git diff main feature/login",
        "A two-reference diff compares endpoint trees.",
        "The output describes file contents, not a list of commits.",
      ),
    ],
    [
      "How do you select the second parent of a merge?",
      ["HEAD~2", "HEAD^2"],
      1,
      "~ walks first-parent generations. ^ selects a parent number.",
    ],
    {
      mistake:
        "HEAD is usually symbolic (HEAD → branch → commit), but it can directly name a commit.",
      comparisons: ["attached-detached", "status-log-reflog"],
    },
  ),
  m(
    "V09",
    "Delete names without losing context",
    "remoteBranches",
    [[139, 150]],
    "deleted-branch",
    9,
    "Observe safe local deletion, force deletion and independent remote deletion.",
    [
      s(
        "git branch -d feature/login",
        "The feature is not merged into this checkout, and has no upstream.",
        "Safe deletion is rejected; the branch and commits remain.",
        { expectedError: true, checkpoint: true },
      ),
      s(
        "git branch -D feature/login",
        "Force deletion removes a local name even when its work is unmerged.",
        "The local label disappears; remote and tracking labels still keep the commits reachable.",
        {
          danger:
            "In a real repository, record the commit ID or create a backup reference before deleting unmerged work.",
        },
      ),
      s(
        "git push origin --delete feature/login",
        "Deleting a remote branch is an explicit separate operation.",
        "Only remote feature/login and its tracking ref are removed. main remains.",
      ),
      s(
        "git reflog",
        "Local HEAD movements can help identify a commit after a branch name is deleted.",
        "The experiment's commit can still be inspected; recovery is not guaranteed forever.",
      ),
    ],
    [
      "Does deleting a local branch also delete its remote branch?",
      ["No, deletion is separate", "Yes, both disappear"],
      0,
      "Local names and remote names belong to separate repositories.",
    ],
    {
      mistake:
        "Deleting a name does not immediately erase commit objects. Reflogs expire and unreachable objects can later be collected.",
      comparisons: ["branch-delete"],
    },
  ),
  m(
    "V10",
    "A moving branch, a fixed tag",
    "history",
    [[397, 432]],
    "release",
    23,
    "Use a tag to keep a release reference while development advances.",
    [
      s(
        "git tag v1.0.0",
        "This lightweight tag names the current commit.",
        "v1.0.0 and main initially select the same snapshot.",
      ),
      s(
        'echo "Next release" > README.md',
        "Start work after the release checkpoint.",
        "Only working contents change.",
      ),
      s(
        "git add README.md",
        "Select the new documentation.",
        "The index contains Next release.",
      ),
      s(
        'git commit -m "Start next release"',
        "The active branch advances automatically.",
        "main moves; v1.0.0 stays on the release.",
      ),
      s(
        "git show v1.0.0",
        "A release reference still selects the old saved contents.",
        "Inspect the old README.",
      ),
      s(
        "git branch feature/login",
        "A new branch starts at the current commit and can move with future commits.",
        "The tag remains fixed on its original commit.",
      ),
    ],
    [
      "Which reference advances when you commit on main?",
      ["main", "v1.0.0", "Both"],
      0,
      "Tags stay at their target unless explicitly replaced. Branch tips advance.",
    ],
    {
      mistake:
        "This demo creates lightweight tags. Annotated/signed tags and tag pushing are taught in the release machine exercise.",
      comparisons: ["branch-tag"],
    },
  ),
  m(
    "V11",
    "Checkout, switch & restore",
    "history",
    [
      [90, 93],
      [289, 300],
      [382, 384],
    ],
    "restore",
    12,
    "Choose the command that matches branch navigation or file restoration.",
    [
      s(
        "git checkout -b feature/login",
        "Legacy checkout combines creation and switching with -b.",
        "feature/login is created and HEAD attaches to it.",
      ),
      s(
        "git switch main",
        "switch focuses on choosing a branch.",
        "HEAD returns to main.",
      ),
      s(
        'echo "Accidental edit" > README.md',
        "Create an unstaged tracked edit.",
        "The index still contains the saved version.",
      ),
      s(
        "git checkout -- README.md",
        "The -- file form restores the working path from the index.",
        "The accidental edit is discarded; history is unchanged.",
        {
          danger:
            "Both checkout -- file and restore file discard unstaged tracked contents.",
        },
      ),
      s(
        'echo "Another accidental edit" > README.md',
        "Repeat the same use case.",
        "Only the working copy changes.",
      ),
      s(
        "git restore README.md",
        "restore makes the file-restoration intent explicit.",
        "The working file again matches the index.",
      ),
    ],
    [
      "Which focused command restores an unstaged file?",
      ["git switch README.md", "git restore README.md"],
      1,
      "switch selects a branch; restore copies file contents from a chosen source.",
    ],
    {
      mistake: "checkout without -b does not create a new branch.",
      comparisons: ["checkout-switch", "checkout-restore"],
    },
  ),
  m(
    "V12",
    "Ignore generated files correctly",
    "ignore",
    [[443, 455]],
    "ignore",
    24,
    "See why ignore rules do not remove files already in history.",
    [
      s(
        'echo "*.log" > .gitignore',
        "Ignore patterns apply to untracked files.",
        "debug.log remains tracked because it is already in the index.",
      ),
      s(
        'echo "New runtime log" > runtime.log',
        "A new generated file matches the pattern.",
        "runtime.log exists in working files but is ignored.",
      ),
      s(
        'echo "Tracked log changed" > debug.log',
        "A tracked file remains tracked even if its name matches an ignore rule.",
        "Status still reports debug.log as modified.",
      ),
      s(
        "git status",
        "Check which log Git will pay attention to.",
        "debug.log is listed; runtime.log is not.",
      ),
      s(
        "git rm --cached debug.log",
        "Remove the existing index entry without deleting the local log.",
        "A tracked deletion is staged.",
      ),
      s(
        "git add .gitignore",
        "Save the rule so teammates use the same policy.",
        ".gitignore is staged, alongside the log's removal.",
      ),
      s(
        'git commit -m "Ignore generated logs"',
        "The next tree excludes debug.log.",
        "Old commits still contain the previously tracked log.",
      ),
    ],
    [
      "Does .gitignore remove a committed secret from old commits?",
      ["Yes", "No"],
      1,
      "Ignoring affects future untracked paths. Revoke exposed credentials and follow a history-cleanup incident plan.",
    ],
    {
      mistake:
        "Never use real credentials in this site. Ignoring a file is not secret removal.",
      comparisons: ["unstage-untrack"],
    },
  ),
];
