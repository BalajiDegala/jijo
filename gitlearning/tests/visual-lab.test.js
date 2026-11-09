import test from "node:test";
import assert from "node:assert/strict";
import { visualLessons, lifecycle } from "../lib/visual-lab/curriculum.js";
import { prepareLesson, repositoryAreas } from "../lib/visual-lab/trace.js";
import {
  initialPlayback,
  playbackReducer,
} from "../lib/visual-lab/playback.js";
import {
  readVisualProgress,
  recordVisualStep,
} from "../lib/visual-lab/progress.js";
import { blankProgress, readProgress, writeProgress } from "../lib/progress.js";
import { headTree, headId, runCommand } from "../lib/git-engine.js";
import { createFixture } from "../lib/visual-lab/fixtures.js";

for (const lesson of visualLessons) {
  test(`${lesson.id}: all authored commands produce their expected success or rejection`, () => {
    const frames = prepareLesson(lesson);
    assert.equal(frames.length, lesson.steps.length + 1);
    assert.deepEqual(
      prepareLesson(lesson),
      frames,
      "fixtures and commands are deterministic",
    );
    assert.ok(frames.every((f) => Object.isFrozen(f.state)));
    for (const frame of frames.slice(1)) {
      assert.ok(frame.why && frame.expect);
      assert.equal(repositoryAreas(frame.state).length, 4);
      assert.equal(frame.error, Boolean(frame.expectedError));
    }
  });
}

test("comparison uses the same active feature branch, with equal files and different ancestry", () => {
  const start = createFixture("feature");
  const merge = runCommand(start, "git merge main");
  const rebase = runCommand(start, "git rebase main");
  assert.equal(merge.error, false);
  assert.equal(rebase.error, false);
  assert.equal(merge.state.branch, start.branch);
  assert.equal(rebase.state.branch, start.branch);
  assert.equal(merge.state.branches.main, start.branches.main);
  assert.equal(rebase.state.branches.main, start.branches.main);
  assert.deepEqual(headTree(merge.state), headTree(rebase.state));
  assert.equal(
    merge.state.commits.find((c) => c.id === headId(merge.state)).parents
      .length,
    2,
  );
  assert.equal(
    rebase.state.commits.find((c) => c.id === headId(rebase.state)).parents
      .length,
    1,
  );
});

test("lifecycle preserves staged A, commits A while B remains, and transfers only on push", () => {
  const frames = prepareLesson(lifecycle);
  const edited = frames[4].state;
  assert.equal(edited.working["README.md"], "Version B");
  assert.equal(edited.index["README.md"], "Version A");
  assert.equal(edited.commits.length, 0);
  const committed = frames[7].state;
  assert.equal(headTree(committed)["README.md"], "Version A");
  assert.equal(committed.working["README.md"], "Version B");
  for (const frame of frames.slice(0, 11))
    assert.equal(frame.state.remoteStore.commits.length, 0);
  const pushed = frames[11].state;
  assert.equal(pushed.remoteStore.commits.length, 2);
  assert.equal(pushed.remoteStore.branches.main, headId(pushed));
  assert.equal(pushed.tracking["origin/main"], headId(pushed));
  assert.equal(pushed.upstreams.main, "origin/main");
  assert.ok(frames[3].events.some((e) => e.type === "copy-to-index"));
  assert.ok(frames[11].events.some((e) => e.type === "transfer-objects"));
});

test("seeking and replaying never rerun commands, and autoplay stops at predictions and the end", () => {
  const frames = prepareLesson(lifecycle),
    last = frames.length - 1;
  const stops = frames.flatMap((f, i) => (f.stop ? [i] : []));
  let player = initialPlayback();
  player = playbackReducer(player, { type: "toggle", last });
  for (let i = 0; i < 6; i++)
    player = playbackReducer(player, { type: "tick", last, stops });
  assert.equal(player.cursor, 4);
  assert.equal(player.playing, false);
  const committed = frames[7].state;
  for (let i = 0; i < 20; i++) {
    player = playbackReducer(player, { type: "seek", cursor: 7, last });
    player = playbackReducer(player, { type: "replay", last });
    assert.equal(frames[player.cursor].state, committed);
    assert.equal(committed.commits.length, 1);
    player = playbackReducer(player, { type: "previous", last });
  }
  player = playbackReducer(player, { type: "seek", cursor: last - 1, last });
  player = playbackReducer(player, { type: "toggle", last });
  player = playbackReducer(player, { type: "tick", last, stops });
  assert.equal(player.cursor, last);
  assert.equal(player.playing, false);
  assert.equal(
    playbackReducer(player, { type: "toggle", last }).playing,
    false,
  );
  assert.equal(
    playbackReducer(player, { type: "seek", cursor: Infinity, last }).cursor,
    0,
  );
  assert.equal(
    playbackReducer(player, { type: "seek", cursor: 999, last }).cursor,
    last,
  );
});

test("visual progress preserves existing verification and distinguishes viewing from a correct answer", () => {
  let progress = {
    ...blankProgress(),
    lessons: ["branching"],
    verified: ["first-commit"],
  };
  progress = recordVisualStep(progress, lifecycle, lifecycle.steps.length);
  assert.equal(progress.visualLab.records.L01.viewed, true);
  assert.equal(progress.visualLab.records.L01.passed, false);
  progress = recordVisualStep(progress, lifecycle, 4, true);
  assert.equal(progress.visualLab.records.L01.passed, true);
  assert.deepEqual(progress.verified, ["first-commit"]);
  assert.deepEqual(progress.lessons, ["branching"]);
  let stored;
  const storage = {
    getItem: () => stored,
    setItem: (_, value) => {
      stored = value;
    },
  };
  writeProgress(storage, progress);
  assert.deepEqual(readProgress(storage), progress);
  const invalid = readVisualProgress({
    last: "bad",
    records: { L01: { cursor: -10, passed: "true" }, V02: null },
  });
  assert.equal(invalid.last, "L01");
  assert.equal(invalid.records.L01.cursor, 0);
  assert.equal(invalid.records.L01.passed, false);
  progress = recordVisualStep(progress, { ...lifecycle, version: 2 }, 0);
  assert.equal(
    progress.visualLab.records.L01.passed,
    false,
    "changed lessons reset their own record",
  );
});
