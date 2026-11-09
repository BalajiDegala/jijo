import { scenarios as legacy, baseCommands } from "./content.js";
import { practicalInventory, incidentLinks } from "./curriculum-manifest.js";
import { scenarioConcepts } from "./scenario-concepts.js";
import { explainStep } from "./command-help.js";
import {
  emptyRepo,
  starterRepo,
  demoRepo,
  runCommand,
  runSequence,
  clone,
  headId,
  headTree,
  withRemote,
  teammateCommit,
} from "./git-engine.js";
const S = (command, why, expected, title = command) => ({
  command,
  why,
  expected,
  title,
});
const save = (file, text, message) => [
  `echo "${text}" > ${file}`,
  `git add ${file}`,
  `git commit -m "${message}"`,
];
const recipe = (setup, steps) => ({
  setup,
  steps: steps.map((s) =>
    Array.isArray(s)
      ? S(...s)
      : S(s, explainStep(s).why, explainStep(s).expected),
  ),
});
const recipes = {
  restore: {
    ...legacy.find((s) => s.id === "restore"),
    steps: [
      ...legacy.find((s) => s.id === "restore").steps,
      S(
        'echo "Unfinished draft" > README.md',
        "Make a tracked edit to set aside temporarily.",
        "README.md is modified.",
      ),
      S(
        "git stash",
        "Save tracked unfinished work and restore the clean snapshot.",
        "The working tree is clean; one stash exists.",
      ),
      S(
        "git stash list",
        "Inspect saved work.",
        "The stash is listed without modifying it.",
      ),
      S(
        "git stash pop",
        "Apply the saved work and remove the successful stash entry.",
        "Unfinished draft returns as an unstaged edit.",
      ),
      S(
        "git diff",
        "Inspect the restored edit before deciding whether to keep it.",
        "The draft differs from the index.",
      ),
    ],
  },
  "index-snapshot": recipe(baseCommands, [
    [
      'echo "Version two" > README.md',
      "Edit only the working copy.",
      "README.md is modified, index still has Version one.",
    ],
    [
      "git add README.md",
      "Copy this content into the index.",
      "README.md is staged.",
    ],
    [
      'echo "Version three" > README.md',
      "Editing again does not change the staged snapshot.",
      "The same file has both staged and unstaged changes.",
    ],
    [
      "git diff --staged",
      "Compare index to HEAD.",
      "The staged version is Version two.",
    ],
    [
      "git diff",
      "Compare working tree to index.",
      "Version three differs from Version two.",
    ],
  ]),
  "atomic-commits": recipe(baseCommands, [
    ...save("login.js", "Login form", "feat: add login"),
    ...save("docs.md", "Login instructions", "docs: explain login"),
    "git log --oneline",
  ]),
  "history-head": recipe(
    [
      ...baseCommands,
      ...save("app.js", "App version two", "Build application"),
    ],
    [
      [
        "git log --oneline",
        "List commits reachable from HEAD.",
        "Two commits appear, newest first.",
      ],
      [
        "git show HEAD~1",
        "Follow the first parent.",
        "The initial snapshot contains README.md.",
      ],
      [
        "git diff HEAD~1 HEAD",
        "Compare two committed trees.",
        "app.js was added.",
      ],
    ],
  ),
  "add-remove": recipe(baseCommands, [
    ...save("scratch.txt", "Temporary note", "Add scratch note"),
    [
      "git rm scratch.txt",
      "Remove the working file and stage its deletion.",
      "scratch.txt is staged as deleted.",
    ],
    'git commit -m "Remove scratch note"',
    "git status",
  ]),
  ignore: recipe(
    [
      ...baseCommands,
      ...save("debug.log", "Old log", "Track a log by mistake"),
    ],
    [
      [
        'echo "*.log" > .gitignore',
        "Ignore patterns affect untracked paths only.",
        "The existing log is still tracked.",
      ],
      [
        "git rm --cached debug.log",
        "Remove the file from the index, preserving its working copy.",
        "debug.log remains in the folder but its deletion is staged.",
      ],
      "git add .gitignore",
      'git commit -m "Stop tracking generated logs"',
      [
        'echo "New output" > debug.log',
        "Edit the now-ignored file.",
        "The change stays out of normal status.",
      ],
      "git status",
    ],
  ),
  "undo-compare": recipe(
    [...baseCommands, ...save("app.js", "Stable app", "Add app")],
    [
      [
        'echo "Unsaved edit" > app.js',
        "Create a disposable tracked edit.",
        "Working copy differs from the index.",
      ],
      [
        "git restore app.js",
        "Restore from index; unstaged changes are discarded.",
        "app.js is Stable app again.",
      ],
      [
        "git reset --soft HEAD~1",
        "Move only the branch reference.",
        "app.js remains staged and in the working tree.",
      ],
      'git commit -m "Add app again"',
      [
        "git revert HEAD",
        "Append an inverse commit.",
        "History remains; app.js is removed by a new commit.",
      ],
    ],
  ),
  "merge-feature": recipe(
    [
      ...baseCommands,
      "git switch -c feature/login",
      ...save("login.js", "Login form", "Add login"),
      "git switch main",
    ],
    [
      [
        "git merge feature/login",
        "main is an ancestor of the feature tip, so fast-forward is sufficient.",
        "main and feature/login point to the same commit.",
      ],
      "git log --oneline",
    ],
  ),
  "update-feature": recipe(
    [
      ...baseCommands,
      "git switch -c feature/login",
      ...save("login.js", "Login form", "Add login"),
      "git switch main",
      ...save("home.js", "Homepage", "Update main"),
      "git switch feature/login",
    ],
    [
      [
        "git merge main",
        "Integrate main without rewriting feature commits.",
        "A two-parent commit combines home.js and login.js.",
      ],
      "git status",
    ],
  ),
  "move-commit": recipe(
    [
      ...baseCommands,
      "git switch -c feature/fix",
      ...save("fix.js", "Safe fix", "Fix validation"),
      "git switch main",
    ],
    [
      [
        "git cherry-pick feature/fix",
        "Apply the selected commit’s change, not the entire branch.",
        "A new commit on main adds fix.js.",
      ],
      "git show HEAD",
    ],
  ),
  "deleted-branch": recipe(
    [
      ...baseCommands,
      "git switch -c feature/saved",
      ...save("saved.txt", "Keep this work", "Save valuable work"),
      "git switch main",
    ],
    [
      [
        "git branch -D feature/saved",
        "Delete only the reference in this disposable example. The object is still present.",
        "The branch name is gone.",
      ],
      [
        "git reflog",
        "Find the commit from before switching to main.",
        "HEAD@{1} identifies the valuable work.",
      ],
      [
        "git branch recovered HEAD@{1}",
        "Anchor the existing object with a new reference.",
        "recovered points to the saved commit.",
      ],
      "git switch recovered",
      "git show HEAD",
    ],
  ),
  detached: recipe(baseCommands, [
    [
      "git switch --detach HEAD",
      "Point HEAD directly to the commit.",
      "No branch is active.",
    ],
    ...save("experiment.txt", "Useful experiment", "Try an idea"),
    [
      "git switch -c rescued",
      "Create a branch before leaving detached HEAD.",
      "rescued preserves the experimental commit.",
    ],
    "git log --oneline",
  ]),
  clone: {
    start: "clone",
    steps: [
      S(
        "git clone https://example.com/team/raga-git.git",
        "Copy the supplied simulated remote object history and configure tracking.",
        "main and origin/main match the remote main; local files are checked out.",
      ),
      S("git remote -v", "Inspect the remote alias.", "origin is configured."),
      S(
        "git log --oneline",
        "Inspect the copied history.",
        "Both source commits are available locally.",
      ),
    ],
  },
  "fetch-only": {
    start: "behind",
    steps: [
      S(
        "git fetch origin",
        "Update remote-tracking refs and transfer objects only.",
        "origin/main advances; main and working files remain unchanged.",
      ),
      S(
        "git diff main origin/main",
        "Inspect incoming changes before integrating.",
        "team.txt is present only in origin/main.",
      ),
      S(
        "git merge origin/main",
        "Explicitly integrate the fetched work.",
        "main fast-forwards and team.txt appears.",
      ),
    ],
  },
  "pull-rebase": {
    start: "diverged",
    steps: [
      S(
        "git pull --rebase origin main",
        "Fetch, then replay your unpublished commit on the new remote base.",
        "Local commit receives a new ID; history is linear.",
      ),
      S(
        "git push origin main",
        "The remote tip is now an ancestor of your local branch.",
        "Remote main advances to the replayed commit.",
      ),
    ],
  },
  "rejected-push": {
    start: "diverged",
    steps: [
      {
        ...S(
          "git push origin main",
          "The remote has an independent commit. Protect it by rejecting this push.",
          "Push is rejected; both histories stay intact.",
        ),
        expectedError: true,
      },
      S(
        "git fetch origin",
        "Fetch objects and the latest tracking reference.",
        "Graph shows both sides of divergence.",
      ),
      S(
        "git diff main origin/main",
        "Inspect both trees.",
        "Local and teammate files differ.",
      ),
      S(
        "git merge origin/main",
        "Combine independent changes with two parents.",
        "Both changes appear in the local snapshot.",
      ),
      S(
        "git push origin main",
        "Now remote main is an ancestor of local main.",
        "The push succeeds and both sides are synchronized.",
      ),
    ],
  },
  teammate: {
    start: "behind",
    steps: [
      S(
        "git fetch",
        "A teammate has pushed independently. Fetch discovers it.",
        "Tracking advances but your branch stays unchanged.",
      ),
      S(
        "git pull --ff-only",
        "With no local divergence this integration can fast-forward.",
        "Your working tree includes team.txt.",
      ),
      ...save(
        "reply.txt",
        "Reviewed teammate update",
        "Review team update",
      ).map((c) =>
        S(
          c,
          "Create and commit your own contribution.",
          "Local history advances; remote remains unchanged.",
        ),
      ),
      S(
        "git push",
        "Share the new descendant commit.",
        "Both contributors’ work is present on the simulated remote.",
      ),
    ],
  },
  "reflog-recovery": recipe(
    [
      ...baseCommands,
      ...save("valuable.txt", "Important work", "Save valuable work"),
    ],
    [
      [
        "git reset --hard HEAD~1",
        "In this isolated lab, move main back and reset tracked files.",
        "valuable.txt disappears from the working tree, but its committed object remains.",
      ],
      [
        "git reflog",
        "Inspect reference movement.",
        "HEAD@{1} refers to the saved commit.",
      ],
      [
        "git branch recovery HEAD@{1}",
        "Create a non-destructive recovery reference.",
        "recovery points to the lost commit.",
      ],
      "git switch recovery",
      "git show HEAD",
    ],
  ),
};
export const decisionIds = [
  "protected",
  "traceability",
  "bisect",
  "rerere",
  "submodules",
  "scale",
  "secret",
  "release-design",
  "ci-history",
  "gitops",
];
export const scenarios = practicalInventory.map((meta) => {
  const old = legacy.find((x) => x.id === meta.id),
    r = recipes[meta.id] || old;
  const mode = decisionIds.includes(meta.id) ? "decision" : "browser";
  return {
    ...old,
    ...r,
    ...meta,
    introduction: scenarioConcepts[meta.id],
    mode,
    minutes: old?.minutes || 12,
    context:
      old?.subtitle ||
      `You are working on a shared project. ${meta.title} while preserving an understandable and recoverable history.`,
    objectives: [
      meta.title,
      "Inspect the resulting state and explain why it changed.",
    ],
    lessonIds: meta.questions.map((n) => "q" + String(n).padStart(2, "0")),
    interviewIds: meta.questions,
    commonMistakes:
      old?.warning ||
      "Check the current branch, status, and whether history is shared before changing references.",
    recovery:
      "Reset this isolated simulator to retry. On a real machine, preserve changes and create a backup reference before a destructive operation.",
    verify: old?.verify || "git status\ngit log --oneline --all",
    challenge:
      old?.challenge ||
      "Repeat the workflow with a different file or branch and explain which references moved.",
    cleanup:
      "Exit the practice folder. Inspect its path before deleting only the disposable raga-git folder.",
    visualizations: ["Four repository areas", "Commit graph and references"],
    completionCriteria:
      mode === "browser"
        ? "Every ordered state transition is verified by the engine."
        : "Correctly diagnose the supplied evidence and choose a remediation and verification plan.",
  };
});
export function loadScenario(s) {
  if (s.start === "clone") {
    const remote = withRemote(
      runSequence(save("app.js", "Stable app", "Build app"), starterRepo()),
    );
    const state = emptyRepo();
    state.remoteStore = clone(remote.remoteStore);
    return state;
  }
  if (["behind", "diverged"].includes(s.start)) {
    let state = withRemote(starterRepo());
    if (s.start === "diverged")
      state = runSequence(
        save("local.txt", "My unpublished change", "Add local work"),
        state,
      );
    return teammateCommit(state);
  }
  return runSequence(s.setup || [], emptyRepo());
}
function observable(s) {
  const trees = (refs) =>
    Object.fromEntries(
      Object.entries(refs).map(([b, id]) => [
        b,
        s.commits.find((c) => c.id === id)?.tree || {},
      ]),
    );
  return {
    initialized: s.initialized,
    working: s.working,
    index: s.index,
    head: headTree(s),
    branch: s.branch,
    branches: trees(s.branches),
    tracking: trees(s.tracking),
    tags: trees(s.tags),
    remote: s.remote,
    remoteBranches: Object.fromEntries(
      Object.entries(s.remoteStore.branches).map(([b, id]) => [
        b,
        s.remoteStore.commits.find((c) => c.id === id)?.tree,
      ]),
    ),
    conflicts: s.conflicts,
    parents: s.commits.find((c) => c.id === headId(s))?.parents.length || 0,
    commits: s.commits.length,
  };
}
const stable = (value) =>
  JSON.stringify(value, (_, v) =>
    v && typeof v === "object" && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v).sort())
      : v,
  );
export function expectedSteps(s) {
  let state = loadScenario(s);
  return (s.steps || []).map((step) => {
    const before = stable(observable(state));
    const r = runCommand(state, step.command);
    if (Boolean(r.error) !== Boolean(step.expectedError))
      throw Error(`${s.id}: ${step.command}: ${r.output}`);
    state = r.state;
    return {
      ...step,
      state: clone(state),
      readOnly: before === stable(observable(state)),
    };
  });
}
export function verifyStep(expected, result, command) {
  if (Boolean(result.error) !== Boolean(expected.expectedError)) return false;
  if (
    expected.readOnly &&
    command.trim().split(/\s+/).slice(0, 2).join(" ") !==
      expected.command.split(/\s+/).slice(0, 2).join(" ")
  )
    return false;
  return (
    stable(observable(result.state)) === stable(observable(expected.state))
  );
}
export { incidentLinks };
