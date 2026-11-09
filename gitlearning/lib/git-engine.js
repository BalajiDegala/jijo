// A deterministic, in-memory teaching model. No shell, filesystem, or network access.
// Merge granularity is a whole file; real Git can merge independent lines in one file.
import { commandHelp, topicHelp, suggestCommand } from "./command-help.js";
export const clone = (value) => JSON.parse(JSON.stringify(value));
const equal = (a, b) =>
  JSON.stringify(Object.entries(a).sort()) ===
  JSON.stringify(Object.entries(b).sort());
export function emptyRepo() {
  return {
    initialized: false,
    working: {},
    index: {},
    commits: [],
    branches: { main: null },
    branch: "main",
    detached: null,
    nextId: 1,
    remote: null,
    remoteBranches: {},
    remoteStore: {
      commits: [],
      branches: {},
      tags: {},
      protected: [],
      nextId: 1,
    },
    upstreams: {},
    config: { "pull.rebase": "false" },
    tracking: {},
    tags: {},
    stash: [],
    reflog: [],
    merge: null,
    conflicts: [],
  };
}
export const headId = (s) => (s.branch ? s.branches[s.branch] : s.detached);
export const commitById = (s, id) => s.commits.find((c) => c.id === id);
export const headTree = (s) => commitById(s, headId(s))?.tree || {};
export const changedFiles = (a, b) =>
  [...new Set([...Object.keys(a), ...Object.keys(b)])].filter(
    (f) => a[f] !== b[f],
  );
export function statusOf(s) {
  return {
    staged: changedFiles(headTree(s), s.index),
    unstaged: changedFiles(s.index, s.working).filter((f) => f in s.index),
    untracked: Object.keys(s.working).filter(
      (f) => !(f in s.index) && !isIgnored(s, f),
    ),
    conflicts: s.conflicts,
  };
}
export function resolve(s, ref = "HEAD") {
  const reflog = ref.match(/^HEAD@\{(\d+)\}$/);
  if (reflog) return s.reflog[Number(reflog[1])]?.id || null;
  const match = ref.match(/^(.*?)(?:~(\d+)|\^(\d*))?$/);
  const base = match?.[1] || ref;
  let id =
    base === "HEAD"
      ? headId(s)
      : (s.branches[base] ??
        s.tags[base] ??
        s.tracking[base] ??
        s.commits.find((c) => c.id.startsWith(base))?.id);
  if (match?.[2])
    for (let i = 0; i < Number(match[2]); i++)
      id = commitById(s, id)?.parents[0];
  if (match?.[3] !== undefined)
    id = commitById(s, id)?.parents[Number(match[3] || 1) - 1];
  return id || null;
}
export function ancestors(s, id) {
  const seen = new Set();
  const visit = (x) => {
    if (!x || seen.has(x)) return;
    seen.add(x);
    commitById(s, x)?.parents.forEach(visit);
  };
  visit(id);
  return seen;
}
const dirty = (s) => {
  const st = statusOf(s);
  return Boolean(st.staged.length + st.unstaged.length + st.untracked.length);
};
function moveHead(s, id, reason) {
  if (s.branch) s.branches[s.branch] = id;
  else s.detached = id;
  s.reflog.unshift({ id, message: reason });
}
function addCommit(s, message, parents = [headId(s)].filter(Boolean)) {
  const id = (0xa10b000 + s.nextId++ * 137).toString(16);
  s.commits.push({
    id,
    message,
    parents,
    tree: clone(s.index),
    branch: s.branch || "detached",
    author: s.config?.["user.name"] || "You",
    timestamp: new Date(Date.UTC(2026, 0, 1, 9, 0, s.nextId)).toISOString(),
  });
  moveHead(s, id, `commit: ${message}`);
  return id;
}
function threeWay(base, ours, theirs) {
  const tree = clone(ours),
    conflicts = [];
  for (const f of new Set([
    ...Object.keys(base),
    ...Object.keys(theirs),
    ...Object.keys(ours),
  ])) {
    if (theirs[f] === base[f] || ours[f] === theirs[f]) continue;
    if (ours[f] === base[f]) {
      if (theirs[f] === undefined) delete tree[f];
      else tree[f] = theirs[f];
    } else {
      conflicts.push(f);
      tree[f] =
        `<<<<<<< HEAD\n${ours[f] || ""}\n=======\n${theirs[f] || ""}\n>>>>>>> incoming`;
    }
  }
  return { tree, conflicts };
}
function mergeInto(s, target, noff = false) {
  if (!target)
    throw Error(
      "Choose a branch to merge, for example: git merge feature/login.",
    );
  const theirs = resolve(s, target),
    ours = headId(s);
  if (!theirs)
    throw Error(`Unknown ref: ${target}. Use git branch to see your branches.`);
  if (s.merge)
    throw Error("Finish the current merge first, or run git merge --abort.");
  if (dirty(s))
    throw Error("Commit or stash your changes before merging in this lab.");
  if (ancestors(s, ours).has(theirs))
    return "Already up to date. Your branch already contains those commits.";
  if (!noff && (!ours || ancestors(s, theirs).has(ours))) {
    moveHead(s, theirs, `merge ${target}: fast-forward`);
    s.index = clone(headTree(s));
    s.working = clone(s.index);
    return `Fast-forward → ${theirs}. Only the branch pointer moved; no merge commit was needed.`;
  }
  const oursAnc = ancestors(s, ours);
  const base = [...ancestors(s, theirs)].find((id) => oursAnc.has(id));
  const result = threeWay(
    commitById(s, base)?.tree || {},
    headTree(s),
    commitById(s, theirs).tree,
  );
  s.working = clone(result.tree);
  s.index = clone(result.tree);
  if (result.conflicts.length) {
    s.merge = { ours, theirs, target };
    s.conflicts = result.conflicts;
    return `CONFLICT in ${result.conflicts.join(", ")}. Edit the file to the final content, git add it, then git commit. The merge is paused.`;
  }
  const id = addCommit(s, `Merge branch '${target}'`, [ours, theirs]);
  return `Merged as ${id}. This commit has two parents and keeps both histories.`;
}
export const supportedCommands =
  'git init [-b], clone, config [--local / --get], status, add, rm [--cached], commit [-m / --amend / --no-edit], diff [--staged / refs], log [--all / --oneline / ref], show, branch [-d / -D / -a], switch [-c / --detach], merge [--abort / --no-ff], rebase, reset [--soft / --mixed / --hard], restore [--staged], revert, cherry-pick, stash [-u / list / pop / apply / drop], reflog, tag, remote [-v / add / rename / set-url / remove], fetch, push [-u], pull [--rebase / --no-rebase / --ff-only]. Files: echo "text" > file, touch file, cat file. Whole-file staging only; use machine practice for add -p.';
export function runCommand(input, command) {
  const s = clone(input);
  const text = command.trim();
  const trace = [];
  const ok = (output) => ({ state: s, output, error: false, trace });
  try {
    if (
      /ghp_|github_pat_|-----BEGIN .*PRIVATE KEY|https?:\/\/[^/\s]+@/i.test(
        text,
      )
    )
      throw Error(
        "Do not enter credentials here. Use a credential-free example URL.",
      );
    if (!text) return ok("");
    if (/^(help|git(?:\s+(?:--help|-h|help))?)$/.test(text))
      return ok(
        `raga-git · Browser simulator help\n\n${supportedCommands}\n\nTry git help reflog or git cherry-pick --help for a command explanation and examples.\nThis browser lab models Git in memory. It does not execute commands on your machine. Unsupported options are rejected. Merges compare whole files; conflict rebases and interactive editors are taught in local practice.`,
      );
    const helpTopic =
      text.match(/^git\s+help\s+([\w-]+)$/)?.[1] ||
      text.match(/^git\s+([\w-]+)\s+(?:--help|-h)$/)?.[1];
    if (helpTopic)
      return {
        state: s,
        output: topicHelp(helpTopic),
        error: !Object.hasOwn(commandHelp, helpTopic),
      };
    const echo = text.match(/^echo\s+([\s\S]+?)\s*(>>?)\s*([\w./-]+)$/);
    if (echo) {
      let value = echo[1];
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      )
        value = value.slice(1, -1);
      s.working[echo[3]] =
        echo[2] === ">>" && s.working[echo[3]]
          ? `${s.working[echo[3]]}\n${value}`
          : value;
      return ok(
        `Updated ${echo[3]} in your working directory. Stage it when you are ready.`,
      );
    }
    const args = (text.match(/"[^"\n]*"|'[^'\n]*'|\S+/g) || []).map((a) =>
      /^['"]/.test(a) ? a.slice(1, -1) : a,
    );
    if (args[0] === "touch" && args.length === 2) {
      s.working[args[1]] ??= "";
      return ok(`Created ${args[1]}.`);
    }
    if (args[0] === "cat" && args.length === 2) {
      if (!(args[1] in s.working)) throw Error("File not found.");
      return ok(s.working[args[1]]);
    }
    if (args[0] !== "git")
      throw Error(
        'This is a Git learning terminal. Try help, or echo "Hello" > README.md.',
      );
    const cmd = args[1],
      a = args.slice(2);
    const options = {
      init: ["-b"],
      clone: [],
      config: ["--local", "--get"],
      rm: ["--cached"],
      status: ["--short", "-s"],
      add: ["-A", "--all"],
      commit: ["-m", "--amend", "--no-edit"],
      diff: ["--staged", "--cached"],
      log: ["--oneline", "--graph", "--all"],
      show: [],
      branch: ["-d", "-D", "-a"],
      switch: ["-c", "--detach"],
      checkout: ["-b", "--"],
      merge: ["--abort", "--no-ff"],
      rebase: [],
      reset: ["--soft", "--mixed", "--hard"],
      restore: ["--staged"],
      revert: [],
      "cherry-pick": [],
      stash: ["-u", "--include-untracked"],
      reflog: [],
      tag: [],
      remote: ["-v"],
      fetch: [],
      push: ["-u", "--set-upstream", "--delete"],
      pull: ["--rebase", "--ff-only", "--no-rebase"],
    };
    if (!(cmd in options))
      throw Error(
        `git ${cmd || ""} is not modeled here.${suggestCommand(cmd) ? ` Did you mean git ${suggestCommand(cmd)}?` : ""}\nNothing was executed. Try git --help for supported commands or git help ${suggestCommand(cmd) || "status"} for examples.`,
      );
    const unknown = a.find(
      (t) => t.startsWith("-") && !options[cmd].includes(t),
    );
    if (unknown)
      throw Error(
        `Option ${unknown} is not modeled for git ${cmd}. Type help for supported options.`,
      );
    const limits = {
      status: 0,
      show: 1,
      diff: 2,
      log: 1,
      reflog: 0,
      reset: 1,
      rebase: 1,
      revert: 1,
      "cherry-pick": 1,
      tag: 2,
    };
    if (
      cmd in limits &&
      a.filter((x) => !x.startsWith("-")).length > limits[cmd]
    )
      throw Error("Extra arguments are not supported for git " + cmd + ".");
    if (cmd === "stash" && a.filter((x) => !x.startsWith("-")).length > 1)
      throw Error(
        "Only the latest stash is modeled. Use stash list, pop, apply, or drop without a ref.",
      );
    if (
      cmd === "init" &&
      !(
        a.length === 0 ||
        (a.length === 2 && a[0] === "-b" && validBranch(a[1]))
      )
    )
      throw Error(
        "Supported initialization: git init or git init -b branch. Directory arguments are not modeled.",
      );
    if (
      cmd === "branch" &&
      a.filter((x) => !x.startsWith("-")).length >
        (a.some((x) => ["-d", "-D"].includes(x)) ? 1 : a.includes("-a") ? 0 : 2)
    )
      throw Error("Unsupported branch arguments.");
    if (
      ["switch", "checkout"].includes(cmd) &&
      a.filter((x) => !x.startsWith("-")).length >
        (a.some((x) => ["-c", "-b"].includes(x)) ? 2 : 1)
    )
      throw Error("Unsupported switch/checkout arguments.");
    if (
      cmd === "merge" &&
      a.filter((x) => !x.startsWith("-")).length >
        (a.includes("--abort") ? 0 : 1)
    )
      throw Error("Only one merge target is supported.");
    if (
      ["status", "add"].includes(cmd) &&
      (s.working[".gitignore"] || "")
        .split(/\r?\n/)
        .some((p) => p.startsWith("!") || p.includes("**") || p.includes("["))
    )
      throw Error(
        "This .gitignore uses a pattern outside the simulator scope. Use exact paths, directory prefixes or single-star wildcards here; practise advanced rules on your machine.",
      );
    if (cmd === "clone") {
      if (a.some((x) => x.startsWith("-")))
        throw Error("Clone options are not simulated.");
      if (s.initialized || Object.keys(s.working).length)
        throw Error(
          "Clone requires an empty local workspace. Load the clone scenario.",
        );
      if (a.length !== 1 || !a[0])
        throw Error("Use git clone https://example.com/team/project.git");
      if (!s.remoteStore?.branches.main)
        throw Error("This scenario has no remote repository to clone.");
      s.initialized = true;
      s.remote = a[0];
      s.commits = clone(s.remoteStore.commits);
      s.nextId = Math.max(
        1,
        ...s.commits
          .map((c) => parseInt(c.id, 16) - 0xa10b000)
          .filter((n) => n >= 0 && n < 100000)
          .map((n) => Math.floor(n / 137) + 1),
      );
      s.branches = { main: s.remoteStore.branches.main };
      s.branch = "main";
      s.detached = null;
      s.remoteBranches = clone(s.remoteStore.branches);
      s.tags = clone(s.remoteStore.tags);
      s.tracking = Object.fromEntries(
        Object.entries(s.remoteBranches).map(([b, id]) => ["origin/" + b, id]),
      );
      s.upstreams = { main: "origin/main" };
      s.index = clone(headTree(s));
      s.working = clone(s.index);
      s.reflog = [{ id: headId(s), message: "clone: origin" }];
      return ok(
        "Cloned the simulated remote history. main tracks origin/main. No real network operation occurred.",
      );
    }
    if (cmd === "init") {
      if (s.initialized)
        return ok("Reinitialized existing simulated Git repository.");
      const branch = a.includes("-b") ? a[a.indexOf("-b") + 1] : "main";
      if (!branch) throw Error("Provide a branch name after -b.");
      s.initialized = true;
      s.branch = branch;
      s.branches = { [branch]: null };
      return ok(
        `Initialized an empty Git repository on ${branch}. Your files are unchanged.`,
      );
    }
    if (!s.initialized)
      throw Error("Not a Git repository yet. Start with git init.");
    if (cmd === "config") {
      const p = a.filter((x) => !x.startsWith("-"));
      if (
        !["user.name", "user.email", "pull.rebase", "rerere.enabled"].includes(
          p[0],
        )
      )
        throw Error(
          "Modeled config keys: user.name, user.email, pull.rebase. rerere.enabled is stored only; rerere execution uses machine practice.",
        );
      if (p.length > 2) throw Error('Use git config --local key "value".');
      if (p.length === 1) return ok(s.config?.[p[0]] || "(not set)");
      s.config = { ...s.config, [p[0]]: p[1] };
      return ok(`Set repository-local ${p[0]}.`);
    }
    if (cmd === "rm") {
      const files = a.filter((x) => !x.startsWith("-"));
      if (!files.length) throw Error("Choose a tracked file.");
      for (const f of files) {
        if (!(f in s.index)) throw Error(`Path ${f} is not tracked.`);
        if (
          (s.index[f] !== headTree(s)[f] &&
            (!a.includes("--cached") || s.index[f] !== s.working[f])) ||
          (!a.includes("--cached") && s.working[f] !== s.index[f])
        )
          throw Error("Preserve modified content before removing it.");
        delete s.index[f];
        if (!a.includes("--cached")) delete s.working[f];
      }
      return ok(
        a.includes("--cached")
          ? "Removed from index; working copy remains. Commit this removal."
          : "Staged file removal from the next snapshot.",
      );
    }
    if (cmd === "status") {
      const st = statusOf(s);
      return ok(
        [
          s.branch ? `On branch ${s.branch}` : `HEAD detached at ${headId(s)}`,
          ...[
            ["Unmerged paths", st.conflicts],
            ["Changes staged for commit", st.staged],
            ["Changes not staged", st.unstaged],
            ["Untracked files", st.untracked],
          ]
            .filter(([, f]) => f.length)
            .map(([title, f]) => `${title}:\n  ${f.join("\n  ")}`),
          !dirty(s) && "Nothing to commit, working tree clean.",
        ]
          .filter(Boolean)
          .join("\n"),
      );
    }
    if (cmd === "add") {
      if (!a.length)
        throw Error("Choose a file: git add README.md, or git add .");
      const files = a.some((f) => [".", "-A", "--all"].includes(f))
        ? [...new Set([...Object.keys(s.working), ...Object.keys(s.index)])]
        : a;
      for (const f of files) {
        if (!(f in s.index) && isIgnored(s, f)) {
          if (a.some((x) => [".", "-A", "--all"].includes(x))) continue;
          throw Error(
            `${f} is ignored. Edit .gitignore before staging it in this lab.`,
          );
        }
        if (!(f in s.working) && !(f in s.index))
          throw Error(`Path ${f} did not match any files.`);
        if (
          s.conflicts.includes(f) &&
          /^(<<<<<<<|=======|>>>>>>>)/m.test(s.working[f])
        )
          throw Error(
            `Resolve conflict markers in ${f} first. Use the file editor or echo "Resolved content" > ${f}.`,
          );
        if (f in s.working) s.index[f] = s.working[f];
        else delete s.index[f];
        s.conflicts = s.conflicts.filter((x) => x !== f);
      }
      return ok(
        `Staged ${files.length} file${files.length === 1 ? "" : "s"}. Git copied the current content into the index; your working files are still there.`,
      );
    }
    if (cmd === "commit") {
      if (s.conflicts.length)
        throw Error(
          "Unresolved conflicts. Edit and stage each conflicted file first.",
        );
      const amend = a.includes("--amend");
      const previous = commitById(s, headId(s));
      if (amend && !previous) throw Error("There is no commit to amend yet.");
      const m = a.indexOf("-m");
      const message =
        m >= 0
          ? a[m + 1]
          : amend && a.includes("--no-edit")
            ? previous.message
            : null;
      if (!message)
        throw Error(
          'Provide a message, for example: git commit -m "Add README".',
        );
      if (!amend && !s.merge && equal(s.index, headTree(s)))
        throw Error(
          "Nothing staged to commit. Make a change, then use git add.",
        );
      const parents = s.merge
        ? [s.merge.ours, s.merge.theirs]
        : amend
          ? previous.parents
          : undefined;
      const id = addCommit(s, message, parents);
      s.merge = null;
      return ok(
        `[${s.branch || "detached HEAD"} ${id}] ${message}\n${amend ? "Replaced the tip with a new commit ID. Amend only your unpublished work." : "Saved a snapshot of the staging area to local history. It is not pushed yet."}`,
      );
    }
    if (cmd === "diff") {
      const staged = a.includes("--staged") || a.includes("--cached");
      const refs = a.filter((x) => !x.startsWith("-"));
      let before = staged ? headTree(s) : s.index,
        after = staged
          ? s.index
          : Object.fromEntries(
              Object.entries(s.working).filter(([f]) => f in s.index),
            );
      if (refs.length) {
        const id = resolve(s, refs[0]);
        if (!id) throw Error("Unknown ref for diff.");
        before = commitById(s, id).tree;
        if (refs[1]) {
          const to = resolve(s, refs[1]);
          if (!to) throw Error("Unknown second ref.");
          after = commitById(s, to).tree;
        }
      }
      return ok(
        changedFiles(before, after)
          .map(
            (f) =>
              `diff -- ${f}\n- ${before[f] ?? "(new file)"}\n+ ${after[f] ?? "(deleted)"}`,
          )
          .join("\n\n") || "No differences.",
      );
    }
    if (cmd === "log") {
      const ref = a.find((x) => !x.startsWith("-"));
      let selected = ref ? resolve(s, ref) : headId(s),
        excluded = new Set();
      if (ref?.includes("..")) {
        const [from, to] = ref.split("..");
        selected = resolve(s, to);
        const base = resolve(s, from);
        if (!base || !selected) throw Error("Unknown range reference.");
        excluded = ancestors(s, base);
      } else if (ref && !selected) throw Error("Unknown log reference.");
      const reachable = a.includes("--all")
        ? new Set(
            Object.values(s.branches)
              .flatMap((id) => [...ancestors(s, id)])
              .concat(
                Object.values(s.tracking).flatMap((id) => [
                  ...ancestors(s, id),
                ]),
              ),
          )
        : ancestors(s, selected);
      return ok(
        s.commits
          .filter((c) => reachable.has(c.id) && !excluded.has(c.id))
          .reverse()
          .map(
            (c) => `${c.id} ${c.message}${c.id === headId(s) ? " ← HEAD" : ""}`,
          )
          .join("\n") || "No commits yet.",
      );
    }
    if (cmd === "show") {
      const c = commitById(s, resolve(s, a[0]));
      if (!c) throw Error("Unknown commit.");
      return ok(
        `${c.id} ${c.message}\n${Object.entries(c.tree)
          .map(([f, v]) => `${f}: ${v}`)
          .join("\n")}`,
      );
    }
    if (cmd === "branch") {
      if (!a.length || a[0] === "-a")
        return ok(
          Object.entries(s.branches)
            .map(
              ([b, id]) =>
                `${b === s.branch ? "*" : " "} ${b} ${id || "(no commits)"}`,
            )
            .concat(
              a[0] === "-a"
                ? Object.entries(s.tracking).map(([b, id]) => `  ${b} ${id}`)
                : [],
            )
            .join("\n"),
        );
      if (a[0] === "-d" || a[0] === "-D") {
        const b = a[1];
        if (!(b in s.branches)) throw Error("Branch not found.");
        if (b === s.branch)
          throw Error("Switch away from this branch before deleting it.");
        if (a[0] === "-d" && !ancestors(s, headId(s)).has(s.branches[b]))
          throw Error(
            "Branch is not fully merged. Keep it, or use -D only if you intend to discard its branch pointer.",
          );
        delete s.branches[b];
        return ok(`Deleted branch ${b}.`);
      }
      const id = resolve(s, a[1]);
      if (!id) throw Error("Make a first commit before creating a branch.");
      if (a[0] in s.branches) throw Error("That branch already exists.");
      if (!validBranch(a[0]))
        throw Error("Use a branch name such as feature/login.");
      s.branches[a[0]] = id;
      return ok(
        `Created ${a[0]}. You are still on ${s.branch}. Use git switch ${a[0]} to move there.`,
      );
    }
    if (cmd === "checkout" && a[0] === "--") {
      if (a.length !== 2)
        throw Error("Supported file checkout: git checkout -- file.");
      return runCommand(s, `git restore ${a[1]}`);
    }
    if (cmd === "switch" || cmd === "checkout") {
      if (dirty(s) || s.merge)
        throw Error(
          "Commit or stash your changes before switching in this lab.",
        );
      const create = a[0] === "-c" || a[0] === "-b",
        detach = a[0] === "--detach";
      const name = a[create || detach ? 1 : 0];
      if (!name) throw Error("Choose a branch or commit.");
      if (create) {
        const id = resolve(s, a[2]);
        if (!id)
          throw Error(
            "Make a commit first, or choose an existing start point.",
          );
        if (name in s.branches) throw Error("That branch already exists.");
        if (!validBranch(name)) throw Error("Invalid branch name.");
        s.branches[name] = id;
      }
      if (!detach && name in s.branches) {
        s.branch = name;
        s.detached = null;
      } else if (detach || cmd === "checkout") {
        const id = resolve(s, name);
        if (!id) throw Error("Unknown commit or branch.");
        s.branch = null;
        s.detached = id;
      } else
        throw Error(
          `Branch ${name} does not exist. Create it with git switch -c ${name}.`,
        );
      s.index = clone(headTree(s));
      s.working = clone(s.index);
      s.reflog.unshift({ id: headId(s), message: `switch: ${name}` });
      return ok(
        s.branch
          ? `Switched to ${name}. HEAD now follows this branch.`
          : `Detached HEAD at ${headId(s)}. Create a branch to keep any new commits.`,
      );
    }
    if (cmd === "merge") {
      if (a[0] === "--abort") {
        if (!s.merge) throw Error("No merge to abort.");
        s.working = clone(headTree(s));
        s.index = clone(s.working);
        s.merge = null;
        s.conflicts = [];
        return ok("Merge aborted. Restored the pre-merge snapshot.");
      }
      return ok(
        mergeInto(
          s,
          a.find((x) => !x.startsWith("-")),
          a.includes("--no-ff"),
        ),
      );
    }
    if (cmd === "reset") {
      if (s.merge)
        throw Error("Use git merge --abort before resetting in this lab.");
      const mode = a.find((x) => x.startsWith("--")) || "--mixed";
      const ref = a.find((x) => !x.startsWith("-")) || "HEAD";
      const id = resolve(s, ref);
      if (!id) throw Error("Unknown reset target.");
      const untracked = Object.fromEntries(
        Object.entries(s.working).filter(
          ([f]) => !(f in s.index) && !(f in headTree(s)),
        ),
      );
      moveHead(s, id, `reset: ${ref}`);
      if (mode !== "--soft") s.index = clone(headTree(s));
      if (mode === "--hard") s.working = { ...untracked, ...clone(s.index) };
      return ok(
        `${mode}: moved HEAD to ${id}. ${mode === "--soft" ? "Staging and working files are unchanged." : mode === "--mixed" ? "Working files are unchanged; staging now matches the target commit." : "Tracked edits were discarded in this simulation. On your machine, --hard can permanently lose uncommitted work."}`,
      );
    }
    if (cmd === "restore") {
      if (s.merge)
        throw Error(
          "Resolve the merge in the file editor, or use git merge --abort.",
        );
      const staged = a.includes("--staged"),
        files = a.filter((x) => !x.startsWith("-"));
      if (!files.length) throw Error("Specify a file to restore.");
      const source = staged ? headTree(s) : s.index,
        target = staged ? s.index : s.working;
      const selected = files.includes(".")
        ? [...new Set([...Object.keys(source), ...Object.keys(s.index)])]
        : files;
      for (const f of selected) {
        if (!(f in source) && !(f in s.index))
          throw Error(`Untracked path: ${f}.`);
        if (f in source) target[f] = source[f];
        else delete target[f];
      }
      return ok(
        staged
          ? "Unstaged the selected changes. Your working files are preserved."
          : "Restored working files from staging. Unstaged edits were discarded.",
      );
    }
    if (cmd === "revert" || cmd === "cherry-pick") {
      if (dirty(s) || s.merge) throw Error("Start with a clean working tree.");
      const c = commitById(s, resolve(s, a[0]));
      if (!c) throw Error("Unknown commit.");
      if (c.parents.length > 1)
        throw Error(
          "Merge-commit reverts need a mainline selection; use the local practice guide.",
        );
      const parent = commitById(s, c.parents[0])?.tree || {};
      const result = threeWay(
        cmd === "revert" ? c.tree : parent,
        headTree(s),
        cmd === "revert" ? parent : c.tree,
      );
      if (result.conflicts.length)
        throw Error(
          "This change conflicts with current files. Conflict reverts/cherry-picks are outside this lab; use local practice. Nothing changed.",
        );
      if (equal(result.tree, headTree(s)))
        throw Error("This change is empty on the current branch.");
      s.working = clone(result.tree);
      s.index = clone(result.tree);
      const id = addCommit(
        s,
        cmd === "revert" ? `Revert "${c.message}"` : c.message,
      );
      return ok(
        `Created ${id}. ${cmd === "revert" ? "A new undo commit preserves the original history." : "Applied this commit’s changes with a new commit ID."}`,
      );
    }
    if (cmd === "rebase") {
      if (dirty(s) || s.merge) throw Error("Start with a clean working tree.");
      const target = resolve(s, a[0]);
      if (!target) throw Error("Choose a valid upstream branch.");
      const current = headId(s),
        upstream = ancestors(s, target);
      if (upstream.has(current)) {
        moveHead(s, target, "rebase: fast-forward");
        s.index = clone(headTree(s));
        s.working = clone(s.index);
        return ok("Fast-forwarded to upstream. No commits to replay.");
      }
      if (ancestors(s, current).has(target))
        return ok(
          "Already up to date. Your branch is already based on that upstream.",
        );
      const replay = [];
      let cursor = current;
      while (cursor && !upstream.has(cursor)) {
        const c = commitById(s, cursor);
        if (c.parents.length > 1)
          throw Error(
            "Rebasing merge histories is outside this introductory lab.",
          );
        replay.unshift(c);
        cursor = c.parents[0];
      }
      if (!cursor) throw Error("These histories have no common ancestor.");
      let tree = clone(commitById(s, target).tree);
      const planned = [];
      for (const c of replay) {
        const r = threeWay(
          commitById(s, c.parents[0])?.tree || {},
          tree,
          c.tree,
        );
        if (r.conflicts.length)
          throw Error(
            "Rebase would conflict. Nothing changed. Use merge to practice conflict resolution, or the local rebase lesson.",
          );
        tree = r.tree;
        planned.push({ original: c.id, message: c.message, tree: clone(tree) });
      }
      moveHead(s, target, "rebase: start");
      for (const c of planned) {
        s.index = c.tree;
        const id = addCommit(s, c.message);
        trace.push({ type: "replay-commit", from: c.original, to: id });
      }
      s.working = clone(s.index);
      return ok(
        `Replayed ${planned.length} commit(s) on ${a[0]} with new IDs. Rebase only unpublished work unless your team coordinates it.`,
      );
    }
    if (cmd === "stash") {
      if (s.merge) throw Error("Resolve or abort the merge before stashing.");
      const action = a[0] || "push";
      if (action === "list")
        return ok(
          s.stash.map((_, i) => `stash@{${i}}: WIP`).join("\n") ||
            "No stashes.",
        );
      if (action === "drop") {
        if (!s.stash.length) throw Error("No stash to drop.");
        s.stash.shift();
        return ok("Dropped the latest stash.");
      }
      if (action === "pop" || action === "apply") {
        if (!s.stash.length) throw Error("No stash to restore.");
        if (dirty(s))
          throw Error(
            "Start with a clean tree to restore a stash in this lab.",
          );
        const saved = s.stash[0];
        const result = threeWay(saved.base, headTree(s), saved.working);
        if (result.conflicts.length)
          throw Error(
            "Stash conflicts are outside this lab. The stash is preserved.",
          );
        s.working = result.tree;
        if (action === "pop") s.stash.shift();
        return ok(
          `Restored changes as unstaged edits. ${action === "pop" ? "Removed the stash entry." : "Kept the stash entry."}`,
        );
      }
      if (!["push", "-u", "--include-untracked"].includes(action))
        throw Error(
          "Use git stash, stash -u, stash list, stash pop, stash apply, or stash drop.",
        );
      const include = a.includes("-u") || a.includes("--include-untracked");
      const tracked = Object.keys(s.index);
      const saved = include
        ? clone(s.working)
        : Object.fromEntries(
            Object.entries(s.working).filter(([f]) => tracked.includes(f)),
          );
      if (equal(saved, headTree(s)))
        return ok(
          "No tracked changes to save. Use git stash -u to include untracked files.",
        );
      s.stash.unshift({ base: clone(headTree(s)), working: saved });
      const untracked = Object.fromEntries(
        Object.entries(s.working).filter(([f]) => !tracked.includes(f)),
      );
      s.working = { ...clone(headTree(s)), ...(include ? {} : untracked) };
      s.index = clone(headTree(s));
      return ok(
        "Saved unfinished work to a stash. Your branch history is unchanged.",
      );
    }
    if (cmd === "reflog")
      return ok(
        s.reflog
          .map((r, i) => `${r.id} HEAD@{${i}}: ${r.message}`)
          .join("\n") || "No HEAD movements yet.",
      );
    if (cmd === "tag") {
      if (!a.length)
        return ok(Object.keys(s.tags).join("\n") || "No tags yet.");
      if (a[0] in s.tags) throw Error("That tag already exists.");
      const id = resolve(s, a[1]);
      if (!id) throw Error("Unknown commit.");
      s.tags[a[0]] = id;
      return ok(
        `Tagged ${id} as ${a[0]}. The tag stays here as the branch moves.`,
      );
    }
    if (cmd === "remote") {
      const name = s.remoteName || "origin";
      if (!a.length || a[0] === "-v")
        return ok(
          s.remote ? name + " " + s.remote + " (simulated)" : "No remotes.",
        );
      if (a[0] === "add" && a.length === 3) {
        if (s.remote)
          throw Error(
            "This browser model supports one remote. Use real-machine practice for multiple remotes.",
          );
        if (!/^[a-zA-Z][\w-]*$/.test(a[1])) throw Error("Invalid remote name.");
        if (/@.*:|token|password|ghp_|github_pat_/i.test(a[2]))
          throw Error("Use an example URL without credentials.");
        s.remoteName = a[1];
        s.remote = a[2];
        return ok("Added simulated " + a[1] + ". No network connection.");
      }
      if (!s.remote || a[1] !== name)
        throw Error("Unknown remote. Use git remote -v.");
      if (a[0] === "set-url" && a.length === 3) {
        s.remote = a[2];
        return ok("Updated example remote URL.");
      }
      if (a[0] === "rename" && a.length === 3) {
        s.remoteName = a[2];
        s.tracking = Object.fromEntries(
          Object.entries(s.tracking).map(([r, id]) => [
            r.replace(name + "/", a[2] + "/"),
            id,
          ]),
        );
        s.upstreams = Object.fromEntries(
          Object.entries(s.upstreams || {}).map(([b, r]) => [
            b,
            r.replace(name + "/", a[2] + "/"),
          ]),
        );
        return ok("Renamed remote alias; repository history is unchanged.");
      }
      if (a[0] === "remove" && a.length === 2) {
        s.remote = null;
        s.tracking = {};
        s.upstreams = {};
        return ok(
          "Removed remote configuration. Remote repository remains intact.",
        );
      }
      throw Error("Supported: remote -v, add, rename, set-url, remove.");
    }
    if (["push", "fetch", "pull"].includes(cmd)) {
      if (!s.remote)
        throw Error("No remote configured. Add a simulated remote first.");
      const name = s.remoteName || "origin";
      const p = a.filter((x) => !x.startsWith("-"));
      if (p[0] && p[0] !== name) throw Error("Unknown remote: " + p[0]);
      if (p.length > 2)
        throw Error(
          "Refspecs and extra arguments are outside this simulator scope.",
        );
      if (cmd === "push" && a.includes("--delete")) {
        if (p.length !== 2 || a.some((x) => ["-u", "--set-upstream"].includes(x)))
          throw Error("Use git push origin --delete branch, without -u.");
        const branch = p[1];
        if (!Object.hasOwn(s.remoteStore.branches, branch))
          throw Error("Remote branch not found; nothing deleted.");
        if (s.remoteStore.protected.includes(branch))
          throw Error("Deletion rejected by simulated branch protection.");
        delete s.remoteStore.branches[branch];
        delete s.remoteBranches[branch];
        delete s.tracking[name + "/" + branch];
        return ok(`Deleted simulated remote branch ${branch}. Local branches and commit objects remain. An upstream setting may now point to a missing branch.`);
      }
      // Compatibility for saved v1 exercises. New repositories always use a distinct store.
      if (
        !Object.keys(s.remoteStore.branches).length &&
        Object.keys(s.remoteBranches).length
      ) {
        s.remoteStore.branches = clone(s.remoteBranches);
        s.remoteStore.commits = clone(
          s.commits.filter((c) =>
            Object.values(s.remoteBranches).some((id) =>
              ancestors(s, id).has(c.id),
            ),
          ),
        );
      }
      if (cmd === "fetch" || cmd === "pull") {
        const selected = p[1] ? [p[1]] : Object.keys(s.remoteStore.branches);
        if (p[1] && !s.remoteStore.branches[p[1]])
          throw Error("Remote branch not found.");
        for (const b of selected) {
          const id = s.remoteStore.branches[b];
          transfer(s.remoteStore, s, id);
          s.tracking[name + "/" + b] = id;
        }
        s.remoteBranches = clone(s.remoteStore.branches);
        trace.push({ type: "fetch-complete", state: clone(s) });
        if (cmd === "fetch")
          return ok(
            "Fetched remote objects and tracking refs. Local branch, index, and working tree are unchanged.",
          );
        if (!p[1] && !s.upstreams?.[s.branch])
          return {
            state: s,
            error: true,
            output:
              "Fetched remote updates. No upstream configured for this branch; specify git pull " +
              name +
              " main, or publish with git push -u.",
          };
        const target = p[1] ? name + "/" + p[1] : s.upstreams[s.branch];
        if (!resolve(s, target))
          throw Error(
            "No upstream branch available. Specify a remote and branch.",
          );
        if (
          a.includes("--rebase") ||
          (!a.includes("--no-rebase") && s.config?.["pull.rebase"] === "true")
        ) {
          const r = runCommand(s, "git rebase " + target);
          return r.error
            ? {
                ...r,
                state: s,
                trace,
                output: "Fetch completed; integration stopped. " + r.output,
              }
            : { ...r, trace: [...trace, ...(r.trace || [])] };
        }
        if (
          a.includes("--ff-only") &&
          !ancestors(s, resolve(s, target)).has(headId(s))
        )
          return {
            state: s,
            error: true,
            trace,
            output:
              "Fetched successfully. Integration rejected: not a fast-forward. Inspect and choose merge or rebase.",
          };
        try {
          return ok(mergeInto(s, target));
        } catch (e) {
          return {
            state: s,
            error: true,
            output: "Fetch completed; integration stopped. " + e.message,
          };
        }
      }
      const branch = p[1] || s.branch;
      if (!p.length && !s.upstreams?.[branch])
        throw Error(
          "No upstream configured. Use git push -u " +
            name +
            " " +
            branch +
            " to publish and remember it.",
        );
      if (!branch || !s.branches[branch])
        throw Error("Choose an existing local branch with a commit.");
      if (s.remoteStore.protected.includes(branch))
        throw Error(
          "Push rejected by simulated branch protection. Push a feature branch and complete the review exercise.",
        );
      const id = s.branches[branch],
        remote = s.remoteStore.branches[branch];
      if (remote && !ancestors(s, id).has(remote))
        throw Error(
          "Push rejected (non-fast-forward): another developer pushed work you do not contain. Fetch, inspect, integrate, then push.",
        );
      transfer(s, s.remoteStore, id);
      s.remoteStore.branches[branch] = id;
      s.remoteBranches = clone(s.remoteStore.branches);
      s.tracking[name + "/" + branch] = id;
      if (a.includes("-u") || a.includes("--set-upstream"))
        s.upstreams = { ...s.upstreams, [branch]: name + "/" + branch };
      return ok(
        "Pushed " +
          branch +
          " to simulated " +
          name +
          ". Remote history now contains these commits. No real repository was contacted.",
      );
    }
    throw Error("Command not modeled. Type help.");
  } catch (error) {
    return { state: input, output: error.message, error: true };
  }
}
function validBranch(name) {
  return (
    /^[a-zA-Z0-9][\w./-]*$/.test(name) &&
    !name.includes("//") &&
    !name.includes("..") &&
    !name.endsWith("/") &&
    !name.endsWith(".") &&
    name
      .split("/")
      .every((part) => !part.startsWith(".") && !part.endsWith(".lock"))
  );
}
export function runSequence(commands, initial = emptyRepo()) {
  return commands.reduce((s, c) => {
    const r = runCommand(s, c);
    if (r.error) throw Error(`${c}: ${r.output}`);
    return r.state;
  }, initial);
}
export function starterRepo() {
  return runSequence([
    "git init",
    'echo "My first project" > README.md',
    "git add README.md",
    'git commit -m "Initial commit"',
  ]);
}
export function demoRepo() {
  return runSequence(
    [
      "git switch -c feature/login",
      'echo "Login form" > login.js',
      "git add login.js",
      'git commit -m "Build login form"',
      "git switch main",
      'echo "Home page" > home.js',
      "git add home.js",
      'git commit -m "Update homepage"',
    ],
    starterRepo(),
  );
}

export function isIgnored(s, file) {
  if (file in s.index) return false;
  return (s.working[".gitignore"] || "").split(/\r?\n/).some((line) => {
    const p = line.trim();
    if (!p || p.startsWith("#")) return false;
    if (p.startsWith("!") || p.includes("[") || p.includes("**")) return false;
    if (p.endsWith("/")) return file.startsWith(p) || file.includes("/" + p);
    const pattern = p
      .split("*")
      .map((part) =>
        [...part]
          .map((c) => (".+?^$(){}|[]\\".includes(c) ? "\\" + c : c))
          .join(""),
      )
      .join(".*");
    return new RegExp("(^|/)" + pattern + "$").test(file);
  });
}
function transfer(from, to, id) {
  const refs = ancestors(from, id);
  for (const c of from.commits)
    if (refs.has(c.id) && !to.commits.some((x) => x.id === c.id))
      to.commits.push(clone(c));
}
export function withRemote(local = starterRepo()) {
  const s = clone(local);
  s.remote = "https://example.com/team/raga-git.git";
  s.remoteName = "origin";
  s.remoteStore = {
    commits: clone(s.commits),
    branches: clone(s.branches),
    tags: clone(s.tags),
    protected: [],
    nextId: 1,
  };
  s.remoteBranches = clone(s.branches);
  s.tracking = Object.fromEntries(
    Object.entries(s.branches).map(([b, id]) => ["origin/" + b, id]),
  );
  s.upstreams = { [s.branch]: "origin/" + s.branch };
  return s;
}
export function teammateCommit(
  input,
  file = "team.txt",
  content = "A teammate shipped an update",
  message = "Add teammate update",
) {
  const s = clone(input);
  if (!s.remoteStore?.branches.main)
    throw Error("Push or clone main before simulating a teammate.");
  const r = s.remoteStore,
    parent = r.branches.main,
    id = (0xb200000 + r.nextId++ * 173).toString(16);
  const tree = {
    ...clone(r.commits.find((c) => c.id === parent).tree),
    [file]: content,
  };
  r.commits.push({
    id,
    tree,
    parents: [parent],
    message,
    branch: "teammate",
    author: "Alex",
    timestamp: new Date(Date.UTC(2026, 0, 1, 10, 0, r.nextId)).toISOString(),
  });
  r.branches.main = id;
  // Do not update local objects or tracking refs: the learner must fetch.
  return s;
}
export function remoteSummary(s) {
  const local = ancestors(s, headId(s));
  const remote = ancestors(
    s.remoteStore || { commits: [] },
    s.remoteStore?.branches[s.branch || "main"],
  );
  return {
    ahead: [...local].filter((id) => !remote.has(id)).length,
    behind: [...remote].filter((id) => !local.has(id)).length,
  };
}
