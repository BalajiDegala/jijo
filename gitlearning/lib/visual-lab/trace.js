import {
  changedFiles,
  clone,
  headId,
  headTree,
  runCommand,
} from "../git-engine.js";
import { createFixture } from "./fixtures.js";
import { commandFocus } from "./focus.js";

export function repositoryAreas(state) {
  const remoteBranch = state.branch || "main";
  const remoteId = state.remoteStore.branches[remoteBranch];
  return [
    {
      id: "working",
      title: "Working files",
      detail: "Your editable files",
      tree: state.working,
    },
    {
      id: "index",
      title: "Staging",
      detail: "The next commit's snapshot",
      tree: state.index,
    },
    {
      id: "local",
      title: "Local commit",
      detail: headId(state) || "No commit yet",
      tree: headTree(state),
    },
    {
      id: "remote",
      title: "Remote commit",
      detail: remoteId
        ? `remote/${remoteBranch} · ${remoteId}`
        : "No published commit on this branch",
      tree:
        state.remoteStore.commits.find((c) => c.id === remoteId)?.tree || {},
    },
  ];
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const freeze = (value) => {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(freeze);
  }
  return value;
};

export function traceChanges(before, after, command = "") {
  const events = [],
    unchanged = [];
  const areasBefore = repositoryAreas(before),
    areasAfter = repositoryAreas(after);
  for (const [i, area] of areasAfter.entries()) {
    const paths = changedFiles(areasBefore[i].tree, area.tree);
    if (!paths.length) unchanged.push(`${area.title} contents`);
    for (const path of paths) {
      events.push({
        type:
          area.id === "index" && command.startsWith("git add ")
            ? "copy-to-index"
            : "file-change",
        area: area.id,
        path,
        before: areasBefore[i].tree[path] ?? null,
        after: area.tree[path] ?? null,
        text: `${area.title}: ${path} ${path in area.tree ? "updated" : "removed"}`,
      });
    }
  }
  for (const commit of after.commits.filter(
    (c) => !before.commits.some((b) => b.id === c.id),
  )) {
    events.push({
      type: "create-commit",
      area: "local",
      id: commit.id,
      text: `Created commit ${commit.id} from its saved tree`,
    });
  }
  const transferred = after.remoteStore.commits.filter(
    (c) => !before.remoteStore.commits.some((b) => b.id === c.id),
  );
  if (transferred.length)
    events.push({
      type: "transfer-objects",
      area: "remote",
      text: `Transferred ${transferred.length} commit${transferred.length === 1 ? "" : "s"} to the remote`,
    });
  for (const [key, title, area] of [
    ["branches", "", "local"],
    ["tracking", "", "local"],
    ["tags", "tag:", "local"],
  ]) {
    for (const name of new Set([
      ...Object.keys(before[key]),
      ...Object.keys(after[key]),
    ])) {
      if (before[key][name] !== after[key][name])
        events.push({
          type: "move-ref",
          area,
          text: `${title}${name}: ${before[key][name] || "unborn / absent"} → ${after[key][name] || "removed"}`,
        });
    }
  }
  for (const name of new Set([
    ...Object.keys(before.remoteStore.branches),
    ...Object.keys(after.remoteStore.branches),
  ])) {
    if (before.remoteStore.branches[name] !== after.remoteStore.branches[name])
      events.push({
        type: "move-ref",
        area: "remote",
        text: `remote/${name}: ${before.remoteStore.branches[name] || "absent"} → ${after.remoteStore.branches[name] || "removed"}`,
      });
  }
  if (before.branch !== after.branch || before.detached !== after.detached)
    events.push({
      type: "move-head",
      area: "local",
      text: `HEAD now follows ${after.branch || after.detached}`,
    });
  if (!same(before.upstreams, after.upstreams))
    events.push({
      type: "configure-upstream",
      area: "local",
      text: `Upstream: ${after.upstreams[after.branch] || "none"}`,
    });
  if (before.remote !== after.remote)
    events.push({
      type: "configure-remote",
      area: "remote",
      text: `${after.remoteName || "origin"} configured; configuration alone transfers no history`,
    });
  if (!before.initialized && after.initialized)
    events.push({
      type: "initialize",
      area: "local",
      text: "Repository initialized; the branch has no commit yet",
    });
  if (!events.length)
    events.push({ type: "inspect", text: "Repository state stays unchanged." });
  return { events, unchanged };
}

// Compile once. Playback only chooses immutable command-boundary snapshots.
export function prepareLesson(lesson) {
  let state = createFixture(lesson.fixture);
  const frames = [
    {
      state,
      before: state,
      title: "Your starting point",
      why: lesson.objective,
      expect: "Inspect the four areas, then take the first step.",
      events: [],
      unchanged: [],
      output: "",
      focus: commandFocus(state, state),
      stop: false,
    },
  ];
  for (const [index, step] of lesson.steps.entries()) {
    const before = state;
    const result = step.command
      ? runCommand(before, step.command)
      : { state: clone(before), output: "", error: false };
    if (result.error !== Boolean(step.expectedError))
      throw Error(
        `${lesson.id}, step ${index + 1}: ${step.command}: ${result.output}`,
      );
    state = result.state;
    frames.push({
      ...step,
      before,
      state,
      ...traceChanges(before, state, step.command),
      output: result.output,
      error: result.error,
      focus: commandFocus(before, state, step.command, result.error),
      stop: Boolean(
        step.checkpoint ||
        step.danger ||
        result.error ||
        state.conflicts.length,
      ),
    });
  }
  return freeze(frames);
}
