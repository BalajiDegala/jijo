// Authored simulator help. These describe the explicitly supported teaching scope.
export const commandHelp = {
  init: [
    "git init [-b branch]",
    "Create an empty repository. Files are not committed automatically.",
  ],
  clone: [
    "git clone URL",
    "Copy the supplied simulated remote history, check out main, and configure origin/main tracking. No real network request is made.",
  ],
  config: [
    'git config [--local] user.name "Your Name"\ngit config --get user.name',
    "Set or read repository-local settings. Do not enter credentials.",
  ],
  status: [
    "git status [--short]",
    "Compare working files, the index and HEAD. This inspection changes nothing.",
  ],
  add: [
    "git add file\ngit add .",
    "Copy current file contents into the staging area. Later edits do not update this staged snapshot. Interactive add -p belongs to machine practice.",
  ],
  rm: [
    "git rm [--cached] file",
    "Stage a deletion. With --cached, keep the working file while removing it from the index.",
  ],
  commit: [
    'git commit -m "Message"\ngit commit --amend -m "New message"\ngit commit --amend --no-edit',
    "Record the staged snapshot and advance the current branch. Amend replaces the tip with a new commit; avoid rewriting shared history.",
  ],
  diff: [
    "git diff\ngit diff --staged\ngit diff main origin/main",
    "Without flags, compare working files to the index. --staged compares index to HEAD. Two references compare committed snapshots.",
  ],
  log: [
    "git log [--oneline] [--graph] [--all] [ref]",
    "Inspect reachable commit history without moving HEAD.",
  ],
  show: [
    "git show [ref]",
    "Inspect a commit and its snapshot. HEAD names the current commit; HEAD~1 follows its first parent.",
  ],
  branch: [
    "git branch\ngit branch name [ref]\ngit branch -a\ngit branch -d name",
    "List, create or delete branch references. Creating a branch does not switch to it. -D bypasses the unmerged-work check; preserve a recovery reference first.",
  ],
  switch: [
    "git switch branch\ngit switch -c name [ref]\ngit switch --detach ref",
    "Change the active branch and checked-out snapshot. --detach points HEAD directly at a commit; create a branch to retain new work.",
  ],
  checkout: [
    "git checkout branch\ngit checkout -b name [ref]",
    "The supported branch-oriented alias. Prefer git switch for clarity; file checkout is outside this simulator's scope.",
  ],
  merge: [
    "git merge [--no-ff] branch\ngit merge --abort",
    "Integrate another history into your current branch. Fast-forward when possible; otherwise create a two-parent commit. For whole-file conflicts, edit, add, then commit.",
  ],
  rebase: [
    "git rebase branch",
    "Replay your unique commits on another base, producing new IDs. This simulator supports clean linear rebase; conflict continuation and interactive rebase use machine practice.",
  ],
  reset: [
    "git reset [--soft|--mixed|--hard] ref",
    "Move the current branch. --soft keeps index and files; --mixed resets the index; --hard also resets tracked working files. Hard reset can destroy uncommitted changes.",
  ],
  restore: [
    "git restore file\ngit restore --staged file",
    "Restore working content from the index, discarding unstaged edits. --staged restores the index from HEAD and keeps the working file.",
  ],
  revert: [
    "git revert ref",
    "Append a new commit reversing the selected single-parent commit. Existing history stays intact. Merge-commit revert belongs to machine practice.",
  ],
  "cherry-pick": [
    "git cherry-pick ref",
    "Apply the change introduced by one selected commit onto your current branch, recording a new commit. The source branch does not move. Clean picks are supported; conflict continuation uses machine practice.",
  ],
  stash: [
    "git stash [-u]\ngit stash list\ngit stash pop\ngit stash apply\ngit stash drop",
    "Temporarily save unfinished work. -u includes untracked files. pop restores and removes the latest stash after success; apply keeps it.",
  ],
  reflog: [
    "git reflog\ngit show HEAD@{1}\ngit branch recovery HEAD@{1}",
    "Inspect the local record of reference movements. Find a lost commit, inspect it, then anchor it with a recovery branch. Reflogs do not recover arbitrary never-committed files and are not permanent backups.",
  ],
  tag: [
    "git tag\ngit tag name [ref]",
    "Create or list lightweight snapshot labels. A tag stays at its commit and does not deploy or push anything.",
  ],
  remote: [
    "git remote -v\ngit remote add origin URL\ngit remote rename origin upstream\ngit remote set-url origin URL\ngit remote remove origin",
    "Manage the simulator's single remote alias. Remote configuration does not transfer any commits.",
  ],
  fetch: [
    "git fetch [origin]",
    "Import remote objects and update remote-tracking references. Your current branch, index and working tree stay unchanged.",
  ],
  push: [
    "git push [-u] origin main\ngit push",
    "Transfer reachable commits to the simulated remote. Non-fast-forward pushes are rejected. -u records upstream tracking; bare push needs an upstream.",
  ],
  pull: [
    "git pull [--no-rebase|--rebase|--ff-only] [origin main]",
    "Fetch, then integrate. --rebase replays unpublished work; --no-rebase merges; --ff-only rejects divergence. Bare pull needs upstream configuration.",
  ],
};

export function suggestCommand(word) {
  if (!word || word.startsWith("-")) return null;
  const distance = (a, b) => {
    let row = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const next = [i];
      for (let j = 1; j <= b.length; j++)
        next[j] = Math.min(
          next[j - 1] + 1,
          row[j] + 1,
          row[j - 1] + (a[i - 1] !== b[j - 1]),
        );
      row = next;
    }
    return row[b.length];
  };
  const candidates = Object.keys(commandHelp)
    .map((name) => [name, distance(word, name)])
    .sort((a, b) => a[1] - b[1]);
  return candidates[0][1] <= (word.length > 4 ? 2 : 1) &&
    candidates[0][1] < candidates[1][1]
    ? candidates[0][0]
    : null;
}

export function topicHelp(topic) {
  const entry = Object.hasOwn(commandHelp, topic) ? commandHelp[topic] : null;
  if (entry)
    return `Browser simulator help: git ${topic}\n\nUsage:\n${entry[0]}\n\n${entry[1]}\n\nRead-only help: your repository has not changed.`;
  const suggestion = suggestCommand(topic);
  return `No simulator help for "${topic}".${suggestion ? ` Did you mean git ${suggestion}? Try git help ${suggestion}.` : " Run git --help for supported commands."}`;
}

export function explainStep(command) {
  if (command.startsWith("echo "))
    return {
      why: "Write this content to the working file. Its staged and committed versions remain unchanged.",
      expected:
        "The working-directory panel shows the edit; inspect it before staging.",
    };
  const name = command.split(/\s+/)[1];
  const entry = commandHelp[name];
  return {
    why:
      entry?.[1] || "Inspect this file before choosing the next Git operation.",
    expected:
      {
        add: "The selected working snapshot is now staged. Inspect it in the staging area.",
        commit:
          "HEAD advances to a commit containing the index. The remote stays unchanged.",
        status:
          "The terminal reports staged, unstaged and untracked changes without modifying them.",
        log: "The terminal lists the commit history reachable from the requested references.",
        show: "Inspect the requested committed snapshot without changing files or references.",
        switch:
          "HEAD names the selected branch and the working files show its snapshot.",
      }[name] ||
      "Inspect the output and affected references before the next step.",
  };
}
