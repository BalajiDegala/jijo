import test from "node:test";
import assert from "node:assert/strict";
import {
  emptyRepo,
  starterRepo,
  demoRepo,
  runCommand,
  runSequence,
  headId,
  headTree,
  statusOf,
  commitById,
  ancestors,
  resolve,
} from "../lib/git-engine.js";
import { scenarios } from "../lib/content.js";
const run = (state, cmd) => {
  const r = runCommand(state, cmd);
  assert.equal(r.error, false, `${cmd}: ${r.output}`);
  return r.state;
};
test("staging is a snapshot independent of later working edits", () => {
  const s = runSequence(
    [
      'echo "staged version" > README.md',
      "git add README.md",
      'echo "later version" > README.md',
      'git commit -m "Stage intentionally"',
    ],
    starterRepo(),
  );
  assert.equal(headTree(s)["README.md"], "staged version");
  assert.equal(s.working["README.md"], "later version");
  assert.deepEqual(statusOf(s).unstaged, ["README.md"]);
});
test("a branch creates a reference and switch restores the selected snapshot", () => {
  let s = starterRepo(),
    first = headId(s);
  s = runSequence(
    [
      "git switch -c feature/login",
      'echo "Login" > login.js',
      "git add .",
      'git commit -m "Login"',
    ],
    s,
  );
  const feature = headId(s);
  assert.equal(s.branches.main, first);
  s = run(s, "git switch main");
  assert.equal(s.working["login.js"], undefined);
  s = run(s, "git merge feature/login");
  assert.equal(headId(s), feature);
  assert.equal(s.commits.length, 2);
  assert.equal(s.working["login.js"], "Login");
});
test("diverged merge has two parents and combines both independent changes", () => {
  const before = demoRepo();
  const s = run(before, "git merge feature/login");
  assert.deepEqual(commitById(s, headId(s)).parents, [
    before.branches.main,
    before.branches["feature/login"],
  ]);
  assert.equal(s.working["login.js"], "Login form");
  assert.equal(s.working["home.js"], "Home page");
});
test("merge conflict pauses, requires resolution, and creates a two-parent commit", () => {
  const scenario = scenarios.find((s) => s.id === "conflict");
  let s = runSequence(scenario.setup);
  s = run(s, "git merge feature/title");
  assert.ok(s.merge);
  assert.deepEqual(s.conflicts, ["README.md"]);
  assert.equal(runCommand(s, "git add README.md").error, true);
  s = run(s, 'echo "Resolved" > README.md');
  s = run(s, "git add README.md");
  s = run(s, 'git commit -m "Resolve"');
  assert.equal(s.merge, null);
  assert.equal(commitById(s, headId(s)).parents.length, 2);
  assert.equal(headTree(s)["README.md"], "Resolved");
});
test("merge abort returns to the exact clean pre-merge tree and branch tip", () => {
  const initial = runSequence(scenarios.find((s) => s.id === "conflict").setup);
  let s = run(initial, "git merge feature/title");
  s = run(s, "git merge --abort");
  assert.equal(headId(s), headId(initial));
  assert.deepEqual(s.index, initial.index);
  assert.deepEqual(s.working, initial.working);
  assert.deepEqual(s.conflicts, []);
});
test("rebase replays unpublished changes with new IDs while keeping main fixed", () => {
  let s = run(demoRepo(), "git switch feature/login");
  const oldFeature = headId(s),
    main = s.branches.main;
  s = run(s, "git rebase main");
  assert.notEqual(headId(s), oldFeature);
  assert.equal(s.branches.main, main);
  assert.equal(commitById(s, headId(s)).parents[0], main);
  assert.equal(s.working["login.js"], "Login form");
  assert.equal(s.working["home.js"], "Home page");
});
test("rebase conflicts fail atomically instead of leaving a misleading partial result", () => {
  const s = runSequence(scenarios.find((s) => s.id === "conflict").setup);
  const result = runCommand(s, "git rebase feature/title");
  assert.equal(result.error, true);
  assert.deepEqual(result.state, s);
});
test("soft, mixed, and hard resets have distinct index/working semantics", () => {
  const base = runSequence(
    ['echo "new" > new.txt', "git add .", 'git commit -m "Add new"'],
    starterRepo(),
  );
  const soft = run(base, "git reset --soft HEAD~1");
  assert.equal(soft.working["new.txt"], "new");
  assert.equal(soft.index["new.txt"], "new");
  assert.equal(headTree(soft)["new.txt"], undefined);
  const mixed = run(base, "git reset --mixed HEAD~1");
  assert.equal(mixed.working["new.txt"], "new");
  assert.equal(mixed.index["new.txt"], undefined);
  assert.deepEqual(statusOf(mixed).untracked, ["new.txt"]);
  const hard = run(base, "git reset --hard HEAD~1");
  assert.equal(hard.working["new.txt"], undefined);
  assert.equal(hard.index["new.txt"], undefined);
  assert.ok(hard.reflog.some((r) => r.id === headId(base)));
});
test("revert appends an inverse commit and preserves the original ancestry", () => {
  const base = runSequence(
    ['echo "bad" > bad.txt', "git add .", 'git commit -m "Bad change"'],
    starterRepo(),
  );
  const s = run(base, "git revert HEAD");
  assert.equal(s.commits.length, 3);
  assert.ok(ancestors(s, headId(s)).has(headId(base)));
  assert.equal(s.working["bad.txt"], undefined);
});
test("restore and restore --staged affect different trees", () => {
  const s = runSequence(
    [
      'echo "changed" > README.md',
      "git add README.md",
      'echo "newest" > README.md',
    ],
    starterRepo(),
  );
  const unstaged = run(s, "git restore --staged README.md");
  assert.equal(unstaged.working["README.md"], "newest");
  assert.equal(unstaged.index["README.md"], "My first project");
  const restored = run(s, "git restore README.md");
  assert.equal(restored.working["README.md"], "changed");
});
test("amend replaces the tip and retains its parent list", () => {
  const base = runSequence(
    ['echo "new" > note.txt', "git add .", 'git commit -m "typo"'],
    starterRepo(),
  );
  const s = run(base, 'git commit --amend -m "Better message"');
  assert.notEqual(headId(s), headId(base));
  assert.deepEqual(
    commitById(s, headId(s)).parents,
    commitById(base, headId(base)).parents,
  );
  assert.equal(commitById(s, headId(s)).message, "Better message");
});
test("fetch updates tracking refs without moving local HEAD or working files", () => {
  let s = runSequence(
    [
      "git remote add origin https://example.com/repo.git",
      "git push -u origin main",
    ],
    starterRepo(),
  );
  const main = headId(s);
  s = runSequence(
    [
      "git switch -c teammate",
      'echo "remote edit" > remote.txt',
      "git add .",
      'git commit -m "Remote work"',
    ],
    s,
  );
  const remote = headId(s);
  s = run(s, "git switch main");
  s.remoteBranches.main = remote;
  s.remoteStore.branches.main = remote;
  s.remoteStore.commits = structuredClone(s.commits);
  s = run(s, "git fetch origin");
  assert.equal(s.tracking["origin/main"], remote);
  assert.equal(headId(s), main);
  assert.equal(s.working["remote.txt"], undefined);
  s = run(s, "git pull --ff-only origin main");
  assert.equal(headId(s), remote);
  assert.equal(s.working["remote.txt"], "remote edit");
});
test("push rejects overwriting remote history not in the local branch", () => {
  const base = runSequence(
    ["git remote add origin https://example.com/repo.git"],
    demoRepo(),
  );
  base.remoteBranches.main = base.branches["feature/login"];
  const r = runCommand(base, "git push origin main");
  assert.equal(r.error, true);
  assert.deepEqual(r.state, base);
});
test("stash leaves untracked files unless -u is used", () => {
  const changed = runSequence(
    ['echo "edited" > README.md', 'echo "new" > new.txt'],
    starterRepo(),
  );
  const s = run(changed, "git stash");
  assert.equal(s.working["README.md"], "My first project");
  assert.equal(s.working["new.txt"], "new");
  const all = run(changed, "git stash -u");
  assert.equal(all.working["new.txt"], undefined);
  const restored = run(all, "git stash pop");
  assert.equal(restored.working["new.txt"], "new");
  assert.equal(restored.working["README.md"], "edited");
  assert.equal(restored.stash.length, 0);
});
test("detached HEAD commits do not advance a branch and can be rescued", () => {
  let s = starterRepo();
  const main = headId(s);
  s = runSequence(
    [
      "git switch --detach HEAD",
      'echo "detached work" > work.txt',
      "git add .",
      'git commit -m "Detached work"',
    ],
    s,
  );
  assert.equal(s.branch, null);
  assert.equal(s.branches.main, main);
  const detached = headId(s);
  s = run(s, "git switch -c rescue");
  assert.equal(s.branch, "rescue");
  assert.equal(s.branches.rescue, detached);
});
test("unknown options and invalid paths do not mutate state", () => {
  const s = starterRepo();
  for (const cmd of [
    "git push --force",
    "git add nonexistent.txt",
    "git rebase -i main",
    "git switch -c bad..branch",
    "git merge nope",
  ]) {
    const r = runCommand(s, cmd);
    assert.equal(r.error, true, cmd);
    assert.deepEqual(r.state, s, cmd);
  }
});
test("diff excludes untracked files until they are staged", () => {
  const s = run(starterRepo(), 'echo "new" > other.txt');
  assert.equal(runCommand(s, "git diff").output, "No differences.");
  const staged = run(s, "git add other.txt");
  assert.match(runCommand(staged, "git diff --staged").output, /other.txt/);
});
test("tags stay fixed when the branch advances", () => {
  let s = run(starterRepo(), "git tag v1");
  const tagged = headId(s);
  s = runSequence(
    ['echo "next" > README.md', "git add .", 'git commit -m "Next"'],
    s,
  );
  assert.equal(s.tags.v1, tagged);
  assert.notEqual(headId(s), tagged);
  assert.equal(resolve(s, "HEAD~1"), tagged);
});
for (const scenario of scenarios.filter((s) => !s.localOnly))
  test(`complete guided mission: ${scenario.id}`, () => {
    let s = runSequence(scenario.setup);
    for (const step of scenario.steps) {
      assert.ok(step.command);
      s = run(s, step.command);
    }
    assert.ok(s.initialized);
    assert.equal(s.conflicts.length, 0);
  });
