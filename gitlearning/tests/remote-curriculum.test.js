import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  withRemote,
  starterRepo,
  teammateCommit,
  headId,
  runCommand,
  runSequence,
  clone,
  isIgnored,
} from "../lib/git-engine.js";
import {
  scenarios,
  expectedSteps,
  loadScenario,
  verifyStep,
} from "../lib/scenario-engine.js";
import { incidents, evidenceFor } from "../lib/incident-labs.js";
import { machinePlan } from "../lib/machine-practice.js";
const source = JSON.parse(
  fs.readFileSync("lib/curriculum/source.json", "utf8"),
);
const run = (s, c) => {
  const r = runCommand(s, c);
  assert.equal(r.error, false, r.output);
  return r.state;
};
test("teammate commits remain remote until fetch; fetch preserves dirty files and HEAD", () => {
  let s = withRemote(starterRepo());
  const head = headId(s);
  s = teammateCommit(s);
  const incoming = s.remoteStore.branches.main;
  assert.equal(
    s.commits.some((c) => c.id === incoming),
    false,
  );
  assert.equal(s.tracking["origin/main"], head);
  s.working["notes.txt"] = "Keep draft";
  const working = clone(s.working),
    index = clone(s.index);
  s = run(s, "git fetch");
  assert.equal(headId(s), head);
  assert.deepEqual(s.working, working);
  assert.deepEqual(s.index, index);
  assert.equal(s.tracking["origin/main"], incoming);
  assert.ok(s.commits.some((c) => c.id === incoming));
});
test("local commits never mutate remote; rejected push is atomic; merge then push", () => {
  let s = withRemote(starterRepo());
  s = runSequence(
    ['echo "Local" > local.txt', "git add .", 'git commit -m "Local work"'],
    s,
  );
  const local = headId(s);
  assert.equal(
    s.remoteStore.commits.some((c) => c.id === local),
    false,
  );
  s = teammateCommit(s);
  const before = clone(s);
  const r = runCommand(s, "git push");
  assert.ok(r.error);
  assert.deepEqual(r.state, before);
  s = run(s, "git fetch");
  s = run(s, "git merge origin/main");
  assert.equal(s.commits.at(-1).parents.length, 2);
  s = run(s, "git push");
  assert.equal(s.remoteStore.branches.main, headId(s));
  assert.equal(
    s.remoteStore.commits.at(-1).tree["team.txt"],
    "A teammate shipped an update",
  );
});
test("clone preserves history and upstream without aliasing remote snapshots", () => {
  const initial = loadScenario(scenarios.find((s) => s.id === "clone"));
  const s = run(initial, "git clone https://example.com/team/gitquest.git");
  assert.equal(s.commits.length, 2);
  assert.equal(s.upstreams.main, "origin/main");
  s.working["app.js"] = "changed";
  assert.notEqual(s.remoteStore.commits.at(-1).tree["app.js"], "changed");
});
test("pull rebase replays local work onto the remote without pushing", () => {
  let s = loadScenario(scenarios.find((s) => s.id === "pull-rebase"));
  const old = headId(s),
    remote = s.remoteStore.branches.main;
  s = run(s, "git pull --rebase");
  assert.notEqual(headId(s), old);
  assert.equal(s.commits.find((c) => c.id === headId(s)).parents[0], remote);
  assert.equal(s.remoteStore.branches.main, remote);
  assert.ok(s.working["local.txt"] && s.working["team.txt"]);
});
test("two-developer conflict resolves to a two-parent commit and pushes", () => {
  let s = withRemote(starterRepo());
  s = runSequence(
    ['echo "Our change" > README.md', "git add .", 'git commit -m "Ours"'],
    s,
  );
  s = teammateCommit(s, "README.md", "Their change");
  s = run(s, "git pull");
  assert.deepEqual(s.conflicts, ["README.md"]);
  s = runSequence(
    [
      'echo "Combined resolution" > README.md',
      "git add README.md",
      'git commit -m "Resolve together"',
      "git push",
    ],
    s,
  );
  assert.equal(s.remoteStore.commits.at(-1).parents.length, 2);
  assert.equal(
    s.remoteStore.commits.at(-1).tree["README.md"],
    "Combined resolution",
  );
});
test("protection rejects main and permits feature publication", () => {
  let s = withRemote(starterRepo());
  s.remoteStore.protected = ["main"];
  assert.ok(runCommand(s, "git push").error);
  s = run(s, "git switch -c feature/review");
  s = run(s, "git push -u origin feature/review");
  assert.equal(s.upstreams["feature/review"], "origin/feature/review");
});
test("default push needs upstream and unsupported arguments fail without mutation", () => {
  let s = withRemote(starterRepo());
  s = run(s, "git switch -c feature/new");
  assert.match(runCommand(s, "git push").output, /No upstream/);
  for (const c of [
    "git init another-folder",
    "git status nonsense",
    "git reset HEAD main",
    "git merge main extra",
    "git stash drop stash@{2}",
  ]) {
    const r = runCommand(s, c);
    assert.ok(r.error, c);
    assert.deepEqual(r.state, s);
  }
  s = run(s, "git push -u origin feature/new");
  assert.equal(s.upstreams["feature/new"], "origin/feature/new");
});
test("failed ff-only integration preserves the completed fetch", () => {
  let s = loadScenario(scenarios.find((s) => s.id === "rejected-push"));
  const head = headId(s),
    r = runCommand(s, "git pull --ff-only");
  assert.ok(r.error);
  assert.equal(headId(r.state), head);
  assert.equal(r.state.tracking["origin/main"], s.remoteStore.branches.main);
});
test("ignore wildcard and literal-dot patterns are accurate", () => {
  let s = starterRepo();
  s.working[".gitignore"] = "*.log\n.env";
  s.working["debug.log"] = "log";
  s.working.xlog = "keep";
  assert.ok(isIgnored(s, "debug.log"));
  assert.ok(!isIgnored(s, "xlog"));
  assert.ok(!isIgnored(s, "xenv"));
  s = run(s, "git add .");
  assert.equal(s.index["debug.log"], undefined);
  assert.equal(s.index.xlog, "keep");
});
test("all 80 source titles and original answers remain intact and mapped", () => {
  const text = fs.readFileSync(
    "docs/Git_Version_Control_Interview_Preparation_Guide.md",
    "utf8",
  );
  assert.equal(source.questions.length, 80);
  for (const [i, q] of source.questions.entries()) {
    assert.equal(q.number, i + 1);
    assert.ok(text.includes(`### Q${q.number}: ${q.title}`));
    assert.ok(q.answer.length > 100);
    assert.ok(q.scenarioIds.length, `Unmapped Q${q.number}`);
    assert.ok(text.includes(q.answer));
  }
});
test("40 scenarios and 23 incidents have complete fields and valid links", () => {
  assert.equal(scenarios.length, 40);
  assert.equal(incidents.length, 23);
  for (const s of scenarios) {
    for (const key of [
      "objectives",
      "context",
      "commonMistakes",
      "recovery",
      "verify",
      "challenge",
      "cleanup",
      "lessonIds",
      "interviewIds",
      "completionCriteria",
    ])
      assert.ok(s[key]?.length, `${s.id}.${key}`);
    for (const p of s.prerequisites)
      assert.ok(scenarios.some((x) => x.id === p));
    if (s.mode === "decision") assert.ok(evidenceFor(s));
  }
  for (const i of incidents)
    for (const k of [
      "evidence",
      "cause",
      "remediation",
      "verification",
      "alternative",
      "commands",
    ])
      assert.ok(i[k].length > 20, `${i.id}.${k}`);
});
for (const s of scenarios.filter((s) => s.mode === "browser"))
  test(`verified scenario: ${s.id}`, () => {
    let state = loadScenario(s);
    for (const step of expectedSteps(s)) {
      const result = runCommand(state, step.command);
      assert.ok(verifyStep(step, result, step.command), step.command);
      state = result.state;
    }
    assert.deepEqual(loadScenario(s), loadScenario(s));
  });
test("OS-specific machine instructions isolate all labs and label advanced procedures", () => {
  for (const s of scenarios)
    for (const os of ["windows", "mac", "linux"]) {
      const p = machinePlan(s, os);
      assert.ok(p.setup.includes("raga-git-" + s.id));
      assert.ok(!p.setup.includes("https://github.com"));
      assert.ok(p.steps.length);
      if (s.mode === "decision") assert.ok(p.procedure);
    }
});
