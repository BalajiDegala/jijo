import test from "node:test";
import assert from "node:assert/strict";
import {
  commandFocus,
  revisionWalk,
  lessonLayout,
} from "../lib/visual-lab/focus.js";
import { prepareLesson } from "../lib/visual-lab/trace.js";
import { lessonById } from "../lib/visual-lab/curriculum.js";
import { createFixture } from "../lib/visual-lab/fixtures.js";
import { ancestors, headId, resolve, runCommand } from "../lib/git-engine.js";
import { focusCamera } from "../lib/graph-camera.js";
import {
  initialPlayback,
  playbackReducer,
} from "../lib/visual-lab/playback.js";

test("read-only revisions resolve distinct selections and exact parent edges without moving HEAD", () => {
  const state = createFixture("merged");
  for (const ref of ["HEAD", "HEAD~1", "HEAD~2", "HEAD^2"]) {
    const result = runCommand(state, `git show ${ref}`);
    const focus = commandFocus(state, result.state, `git show ${ref}`);
    assert.deepEqual(result.state, state);
    assert.deepEqual(focus.targets, [resolve(state, ref)]);
    assert.equal(focus.actualHead, headId(state));
    assert.ok(focus.caption.includes("HEAD"));
  }
  const first = revisionWalk(state, "HEAD~2"),
    second = revisionWalk(state, "HEAD^2");
  assert.equal(first.edges.length, 2);
  assert.deepEqual(
    first.edges.map((edge) => edge.parent),
    [1, 1],
  );
  assert.equal(second.edges.length, 1);
  assert.equal(second.edges[0].parent, 2);
  assert.notEqual(first.target, second.target);
  assert.equal(first.edges[0].to, first.edges[1].from);
});

test("range selection excludes all main ancestry, whereas diff selects endpoint trees", () => {
  const state = createFixture("merged");
  const range = commandFocus(state, state, "git log main..feature/login");
  assert.deepEqual(
    new Set(range.targets),
    new Set(
      [...ancestors(state, state.branches["feature/login"])].filter(
        (id) => !ancestors(state, state.branches.main).has(id),
      ),
    ),
  );
  assert.ok(range.excluded.includes(state.branches.main));
  const diff = commandFocus(state, state, "git diff main feature/login");
  assert.deepEqual(diff.targets, [
    state.branches.main,
    state.branches["feature/login"],
  ]);
  assert.deepEqual(diff.comparison.paths, ["login.js"]);
  assert.equal(diff.comparison.from["login.js"], undefined);
  assert.equal(diff.comparison.to["login.js"], "Login form with validation");
});

test("same-commit switch highlights a new attachment; detached checkout leaves branch tips fixed", () => {
  const frames = prepareLesson(lessonById("V07"));
  assert.equal(frames[1].state.branch, "main");
  assert.equal(headId(frames[1].state), headId(frames[2].state));
  assert.equal(frames[2].focus.kind, "checkout");
  assert.equal(frames[2].focus.previous.branch, "main");
  assert.ok(frames[2].focus.attachment.includes("feature/login"));
  assert.match(frames[2].focus.caption, /same commit/);
  assert.deepEqual(frames[7].state, frames[6].state, "inspection is read only");
  assert.equal(frames[8].state.branch, null);
  assert.equal(frames[8].focus.actualHead, resolve(frames[7].state, "HEAD~1"));
  assert.deepEqual(frames[8].state.branches, frames[7].state.branches);
  assert.equal(frames[9].state.branch, "main");
});

test("lesson coordinates are stable; focus framing includes target labels and both comparison endpoints", () => {
  const frames = prepareLesson(lessonById("V08")),
    points = lessonLayout(frames);
  assert.deepEqual(points, lessonLayout(frames));
  for (const width of [340, 840, 1200]) {
    const ids = frames[6].focus.targets;
    const camera = focusCamera({ width, height: 430 }, points, ids);
    assert.ok(camera.zoom > 0 && camera.zoom <= 1.25);
    for (const id of ids) {
      const x = points[id].x * camera.zoom + camera.x,
        y = points[id].y * camera.zoom + camera.y;
      assert.ok(x > 0 && x < width);
      assert.ok(y > 0 && y < 430);
    }
  }
});

test("one explanation clock can pause, resume, finish or cancel without advancing the command", () => {
  let state = playbackReducer(initialPlayback(2), { type: "replay" });
  state = playbackReducer(state, { type: "beat", count: 3 });
  assert.equal(state.beat, 1);
  state = playbackReducer(state, { type: "pause" });
  assert.equal(state.explaining, false);
  assert.equal(playbackReducer(state, { type: "beat", count: 3 }).beat, 1);
  state = playbackReducer(state, { type: "resume-explanation" });
  state = playbackReducer(state, { type: "beat", count: 3 });
  state = playbackReducer(state, { type: "beat", count: 3 });
  assert.equal(state.cursor, 2);
  assert.equal(state.beat, -1);
  state = playbackReducer(state, { type: "next", last: 6 });
  state = playbackReducer(state, { type: "seek", cursor: 1, last: 6 });
  assert.equal(state.explaining, false);
  assert.equal(state.beat, -1);
});
