import test from "node:test";
import assert from "node:assert/strict";
import {
  emptyRepo,
  starterRepo,
  runCommand,
  headId,
  headTree,
} from "../lib/git-engine.js";
import { commandHelp, suggestCommand } from "../lib/command-help.js";
import {
  scenarios,
  loadScenario,
  expectedSteps,
} from "../lib/scenario-engine.js";
import {
  scenarioConcepts,
  learningPaths,
  nextScenarioId,
} from "../lib/scenario-concepts.js";
import { fitCamera, zoomCamera } from "../lib/graph-camera.js";

test("standard help works before init and never mutates a repository", () => {
  for (const state of [emptyRepo(), starterRepo()]) {
    for (const command of [
      "help",
      "git",
      "git --help ",
      "git -h",
      "git help",
      ...Object.keys(commandHelp).flatMap((c) => [
        `git help ${c}`,
        `git ${c} --help`,
        `git ${c} -h`,
      ]),
    ]) {
      const result = runCommand(state, command);
      assert.equal(result.error, false, command);
      assert.match(result.output, /help/i);
      assert.deepEqual(result.state, state, command);
    }
  }
});
test("typos offer a correction without executing an operation", () => {
  assert.equal(suggestCommand("refrog"), "reflog");
  assert.equal(suggestCommand("comit"), "commit");
  assert.equal(suggestCommand("cherry-pic"), "cherry-pick");
  assert.equal(suggestCommand("nonexistent-command"), null);
  const state = starterRepo();
  for (const command of [
    "git refrog",
    "git help refrog",
    "git refrog --help",
  ]) {
    const r = runCommand(state, command);
    assert.equal(r.error, true);
    assert.match(r.output, /Did you mean git reflog/);
    assert.deepEqual(r.state, state);
  }
});
test("help explains reflog limits and real unsupported flags remain errors", () => {
  const state = starterRepo();
  assert.match(
    runCommand(state, "git help reflog").output,
    /not permanent backups/,
  );
  assert.match(
    runCommand(state, "git cherry-pick --help").output,
    /source branch does not move/,
  );
  assert.equal(runCommand(state, "git push --force").error, true);
  assert.equal(runCommand(state, "git status --invented").error, true);
});
test("every practical lab has an introduction with a distinct before and after", () => {
  assert.equal(Object.keys(scenarioConcepts).length, 40);
  for (const s of scenarios) {
    for (const key of [
      "name",
      "command",
      "definition",
      "before",
      "after",
      "watch",
    ])
      assert.ok(s.introduction[key]?.length >= 6, s.id + "." + key);
    assert.notEqual(s.introduction.before, s.introduction.after);
    assert.ok(s.lessonIds.length);
    for (const step of s.steps || [])
      assert.ok(!step.why.includes("Apply this operation to the selected"));
    assert.ok(scenarios.some((x) => x.id === nextScenarioId(s.id)));
    assert.notEqual(nextScenarioId(s.id), s.id);
  }
  for (const path of learningPaths)
    for (const id of path.ids) assert.ok(scenarios.some((s) => s.id === id));
});
test("the hotfix lab cherry-picks one change and keeps the production snapshot isolated", () => {
  const s = scenarios.find((s) => s.id === "hotfix");
  let state = loadScenario(s);
  const steps = expectedSteps(s);
  assert.ok(steps.some((x) => x.command === "git cherry-pick hotfix/checkout"));
  for (const step of steps) state = runCommand(state, step.command).state;
  const patch = state.commits.find((c) => c.id === state.tags["v1.0.1"]);
  const main = state.commits.find((c) => c.id === headId(state));
  assert.equal(patch.tree["future.js"], undefined);
  assert.equal(patch.tree["checkout.js"], "Checkout fixed");
  assert.equal(main.parents.length, 1);
  assert.notEqual(main.id, patch.id);
  assert.equal(state.branches["hotfix/checkout"], patch.id);
  assert.equal(headTree(state)["future.js"], "Unreleased feature");
  assert.equal(headTree(state)["checkout.js"], patch.tree["checkout.js"]);
});
test("camera fit contains wide and tall histories; zoom preserves its focal point", () => {
  for (const bounds of [
    { width: 6000, height: 350 },
    { width: 600, height: 2000 },
    { width: 250, height: 200 },
  ]) {
    const view = { width: 800, height: 400 },
      c = fitCamera(view, bounds);
    assert.ok(c.x >= 23 && c.y >= 23);
    assert.ok(c.x + bounds.width * c.zoom <= view.width - 23);
    assert.ok(c.y + bounds.height * c.zoom <= view.height - 23);
    const point = { x: 300, y: 210 };
    const world = { x: (point.x - c.x) / c.zoom, y: (point.y - c.y) / c.zoom };
    const z = zoomCamera(c, c.zoom * 1.8, point);
    assert.ok(Math.abs(z.x + world.x * z.zoom - point.x) < 1e-8);
    assert.ok(Math.abs(z.y + world.y * z.zoom - point.y) < 1e-8);
  }
});
