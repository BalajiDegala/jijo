import {
  ancestors,
  changedFiles,
  commitById,
  headId,
  headTree,
  resolve,
} from "../git-engine.js";

const unique = (ids) => [...new Set(ids.filter(Boolean))];
const attachment = (state) =>
  state.branch
    ? `HEAD → ${state.branch} → ${headId(state) || "unborn"}`
    : `HEAD → ${headId(state)} (detached)`;
const edgesWithin = (state, ids) => {
  const selected = new Set(ids);
  return state.commits.flatMap((commit) =>
    selected.has(commit.id)
      ? commit.parents.flatMap((id, index) =>
          selected.has(id)
            ? [{ from: commit.id, to: id, parent: index + 1 }]
            : [],
        )
      : [],
  );
};
const beat = (caption, ids, edges = []) => ({
  caption,
  ids: unique(ids),
  edges,
});
function finish(state, value) {
  return {
    kind: "inspect",
    title: "Inspect history",
    caption: "",
    targets: [],
    context: [],
    edges: [],
    refs: [],
    areas: [],
    excluded: [],
    beats: [],
    actualHead: headId(state),
    attachment: attachment(state),
    ...value,
  };
}

export function inspectCommit(state, id) {
  const commit =
    commitById(state, id) || state.remoteStore.commits.find((c) => c.id === id);
  return finish(state, {
    kind: "manual",
    title: `Inspecting ${id}`,
    caption:
      "You are inspecting this saved commit. Your checkout has not moved.",
    targets: commit ? [id] : [],
    context: commit ? [id, ...commit.parents] : [],
  });
}

export function revisionWalk(state, ref) {
  const match = ref.match(/^(.*?)(?:~(\d+)|\^(\d*))?$/);
  const source = resolve(state, match?.[1] || ref);
  const target = resolve(state, ref),
    edges = [];
  let cursor = source;
  const hops =
    match?.[2] !== undefined
      ? Number(match[2])
      : match?.[3] !== undefined
        ? 1
        : 0;
  for (let index = 0; index < hops && cursor; index++) {
    const parent = match?.[3] !== undefined ? Number(match[3] || 1) : 1;
    const to = commitById(state, cursor)?.parents[parent - 1];
    if (!to) break;
    edges.push({ from: cursor, to, parent, hop: index + 1 });
    cursor = to;
  }
  return { source, target, edges };
}

// Visual meaning is derived from command arguments and actual snapshots, never output text.
export function commandFocus(before, after, command = "", error = false) {
  if (error)
    return finish(after, {
      kind: "rejected",
      title: "Command rejected",
      caption:
        "The requested operation did not complete. Inspect the command output before continuing.",
    });
  const tokens = command.trim().match(/"[^"]*"|'[^']*'|\S+/g) || [];
  const cmd = tokens[0] === "git" ? tokens[1] : tokens[0];
  const args = tokens.slice(tokens[0] === "git" ? 2 : 1);
  const refs = args.filter((arg) => !arg.startsWith("-"));
  const current = headId(after);
  if (cmd === "show") {
    const ref = refs[0] || "HEAD",
      { source, target, edges } = revisionWalk(after, ref);
    if (!target) return finish(after, { title: "Reference unavailable" });
    const parents = commitById(after, target)?.parents || [];
    const context = unique([
      source,
      target,
      ...edges.flatMap((edge) => [edge.from, edge.to]),
      ...(!edges.length ? parents : []),
    ]);
    const caption = edges.length
      ? `${ref} resolves to ${target}. ${edges.length} ${edges.length === 1 ? "hop" : "hops"}${ref.includes("^") ? ` via parent ${edges[0].parent}` : " along the first-parent chain"}. HEAD stays at ${current}.`
      : `${ref} resolves to ${target}${parents.length === 2 ? ", a commit with two parents" : ""}. Inspection leaves HEAD unchanged.`;
    return finish(after, {
      kind: "revision",
      title: `Inspecting ${ref}`,
      ref,
      targets: [target],
      context,
      edges,
      parentChoices: (commitById(after, source)?.parents || []).map(
        (id, index) => ({ from: source, to: id, parent: index + 1 }),
      ),
      refs: [ref === "HEAD" ? after.branch : ref].filter(Boolean),
      caption,
      beats: [
        beat(`Start at ${ref.match(/^[^~^]+/)?.[0] || ref}: ${source}`, [
          source,
          ...(commitById(after, source)?.parents || []),
        ]),
        ...edges.map((edge, index) =>
          beat(
            `Hop ${index + 1}: follow parent ${edge.parent} to ${edge.to}`,
            unique([
              source,
              ...edges
                .slice(0, index + 1)
                .flatMap((item) => [item.from, item.to]),
            ]),
            edges.slice(0, index + 1),
          ),
        ),
        beat(caption, context, edges),
      ],
    });
  }
  if (cmd === "log" || cmd === "reflog") {
    const ref = refs[0] || "HEAD";
    const range =
      ref.includes("..") && !ref.includes("...") ? ref.split("..") : null;
    const excluded = range
      ? [...ancestors(after, resolve(after, range[0]))]
      : [];
    const tip = resolve(after, range ? range[1] : ref);
    const reachable =
      cmd === "reflog"
        ? unique(after.reflog.map((entry) => entry.id))
        : args.includes("--all")
          ? unique(
              [
                ...Object.values(after.branches),
                ...Object.values(after.tracking),
              ].flatMap((id) => [...ancestors(after, id)]),
            )
          : [...ancestors(after, tip)];
    const targets = reachable.filter((id) => !excluded.includes(id));
    const endpoints = range ? range.map((name) => resolve(after, name)) : [tip];
    const edges = edgesWithin(after, targets);
    const caption = range
      ? `${targets.length} commits reachable from ${range[1]} but not ${range[0]}. Shared ancestry is excluded.`
      : cmd === "reflog"
        ? "These commits were recorded in local HEAD movements. Reading the reflog does not check them out."
        : `${targets.length} reachable commits in this log. Reading history leaves HEAD unchanged.`;
    return finish(after, {
      kind: range ? "range" : "history",
      title: range
        ? `History in ${ref}`
        : cmd === "reflog"
          ? "Local HEAD movements"
          : `History from ${ref}`,
      targets,
      context: unique([...endpoints, ...targets]),
      edges,
      excluded,
      refs: range || [after.branch].filter(Boolean),
      caption,
      beats: [
        beat("Locate the reference tips", endpoints),
        beat(caption, unique([...endpoints, ...targets]), edges),
      ],
    });
  }
  if (cmd === "diff") {
    const staged = args.includes("--staged") || args.includes("--cached");
    let from = staged ? headTree(after) : after.index;
    let to = staged
      ? after.index
      : Object.fromEntries(
          Object.entries(after.working).filter(([path]) => path in after.index),
        );
    let fromLabel = staged ? "HEAD" : "Staging",
      toLabel = staged ? "Staging" : "Working files";
    const targets = [],
      areas = staged ? ["local", "index"] : ["index", "working"];
    if (refs[0]) {
      const id = resolve(after, refs[0]);
      from = commitById(after, id)?.tree || {};
      fromLabel = refs[0];
      targets.push(id);
    }
    if (refs[1]) {
      const id = resolve(after, refs[1]);
      to = commitById(after, id)?.tree || {};
      toLabel = refs[1];
      targets.push(id);
    }
    const paths = changedFiles(from, to);
    const caption = `Compare A: ${fromLabel} with B: ${toLabel}. ${paths.length ? `${paths.length} changed ${paths.length === 1 ? "file" : "files"}` : "The contents are identical"}. HEAD stays unchanged.`;
    return finish(after, {
      kind: "diff",
      title: "Compare saved contents",
      targets: unique(targets),
      context: unique(targets),
      refs,
      areas: refs.length === 2 ? [] : areas,
      comparison: { from, to, fromLabel, toLabel, paths },
      caption,
      beats: targets.length
        ? [
            beat(`Endpoint A: ${fromLabel}`, [targets[0]]),
            beat(caption, targets),
          ]
        : [],
    });
  }
  const isSwitch = ["switch", "checkout"].includes(cmd) && args[0] !== "--";
  if (isSwitch) {
    const previous = headId(before),
      targets = current ? [current] : [];
    const history = [...ancestors(after, current)],
      edges = edgesWithin(after, history);
    const caption = !after.branch
      ? `HEAD now points directly to ${current}. Branch tips stay where they were.`
      : previous === current
        ? `HEAD now follows ${after.branch}. Both branches select the same commit, so the file contents stay unchanged.`
        : `HEAD now follows ${after.branch} at ${current}. Its saved tree is checked out; the other branch keeps its history.`;
    return finish(after, {
      kind: "checkout",
      title: after.branch ? `Switch to ${after.branch}` : "Detached checkout",
      targets,
      context: unique([previous, current]),
      edges,
      history,
      refs: [after.branch].filter(Boolean),
      previous: {
        id: previous,
        branch: before.branch,
        attachment: attachment(before),
      },
      caption,
      beats: [
        beat(`Previous checkout: ${attachment(before)}`, [previous, current]),
        beat(caption, [current]),
        beat(
          "Highlighted paths show the destination's reachable history, including shared ancestors.",
          previous === current ? [current] : history,
          edges,
        ),
      ],
    });
  }
  const changedRefs = (previous, current, prefix = "") =>
    Object.keys({ ...previous, ...current }).flatMap((name) =>
      previous[name] === current[name]
        ? []
        : [[prefix + name, previous[name], current[name]]],
    );
  const names = [
    ...changedRefs(before.branches, after.branches),
    ...changedRefs(before.tags, after.tags, "tag:"),
    ...changedRefs(before.tracking, after.tracking),
    ...changedRefs(
      before.remoteStore.branches,
      after.remoteStore.branches,
      "remote/",
    ),
  ];
  if (names.length) {
    const targets = unique(names.map(([, old, next]) => next || old));
    const created = after.commits.filter(
      (commit) => !before.commits.some((item) => item.id === commit.id),
    );
    const title =
      cmd === "push"
        ? "Publish committed history"
        : created.length
          ? "Save a new commit"
          : cmd === "tag"
            ? "Create a fixed tag"
            : names.some(([, , next]) => !next)
              ? "Remove a reference"
              : "Create a branch reference";
    const caption = names
      .map(
        ([name, old, next]) =>
          `${name}: ${old || "absent"} → ${next || "removed"}`,
      )
      .join(" · ");
    return finish(after, {
      kind: "references",
      title,
      targets,
      context: unique([...targets, ...created.flatMap((c) => c.parents)]),
      refs: names.map(([name]) => name),
      changes: names,
      edges: created.flatMap((commit) =>
        commit.parents.map((id, index) => ({
          from: commit.id,
          to: id,
          parent: index + 1,
        })),
      ),
      caption: `${caption}. ${current === headId(before) ? "HEAD's commit stays unchanged." : "The active branch and HEAD advance."}`,
      beats: [
        beat(title, unique(names.flatMap(([, old, next]) => [old, next]))),
        beat(caption, targets),
      ],
    });
  }
  return finish(after, {
    kind: "files",
    title:
      cmd === "add" ? "Copy contents into staging" : "Inspect repository state",
    areas: cmd === "add" ? ["working", "index"] : [],
    caption:
      "The graph retains the actual checkout. Inspect the file areas and command explanation.",
  });
}

export function lessonLayout(frames) {
  const commits = new Map();
  for (const frame of frames)
    for (const commit of [
      ...frame.state.commits,
      ...frame.state.remoteStore.commits,
    ])
      if (!commits.has(commit.id)) commits.set(commit.id, commit);
  const lanes = [
    "main",
    ...new Set(
      [...commits.values()]
        .map((commit) => commit.branch)
        .filter((branch) => branch !== "main"),
    ),
  ];
  return Object.fromEntries(
    [...commits.values()].map((commit, index) => [
      commit.id,
      { x: 75 + index * 190, y: 85 + lanes.indexOf(commit.branch) * 90 },
    ]),
  );
}
