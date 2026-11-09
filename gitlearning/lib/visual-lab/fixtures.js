import { emptyRepo, runSequence, withRemote, teammateCommit, clone } from "../git-engine.js";

export const save = (file, content, message) => [
  `echo "${content}" > ${file}`, `git add ${file}`, `git commit -m "${message}"`,
];
export const base = () => runSequence([
  "git init", 'echo "Welcome" > README.md', 'echo "theme=dark" > settings.json',
  "git add .", 'git commit -m "Start the project"',
]);
export const history = () => runSequence(save("README.md", "Welcome to raga-git", "Explain the project"), base());
export const feature = () => runSequence([
  "git switch -c feature/login", ...save("login.js", "Login form", "Build login"),
  ...save("login.js", "Login form with validation", "Validate login"),
  "git switch main", ...save("settings.json", "theme=light", "Update theme"),
  "git switch feature/login",
], history());
export const fixtures = {
  empty: emptyRepo,
  base, history, feature,
  shared: () => withRemote(history()),
  modified: () => runSequence(['echo "Draft A" > README.md', 'echo "Scratch notes" > notes.txt'], history()),
  staged: () => runSequence(['echo "Draft A" > README.md', "git add README.md"], history()),
  three: () => runSequence(['echo "Staged B" > README.md', "git add README.md", 'echo "Working C" > README.md'], history()),
  dirtyReset: () => runSequence(['echo "Staged B" > README.md', "git add README.md", 'echo "Working C" > README.md'], history()),
  stash: () => runSequence(['echo "Unfinished login" > README.md', "git stash"], history()),
  branches: () => runSequence(["git switch main"], feature()),
  remoteBranches: () => withRemote(runSequence(["git switch main"], feature())),
  fastForward: () => runSequence(["git switch -c feature/login", ...save("login.js", "Login form", "Build login"), "git switch main"], history()),
  merged: () => runSequence(["git merge main"], feature()),
  conflict: () => runSequence([
    "git switch -c feature/login", ...save("README.md", "Sign in with email", "Describe email login"),
    "git switch main", ...save("README.md", "Sign in with username", "Describe username login"),
  ], history()),
  clone: () => { const s = emptyRepo(); s.remoteStore = clone(withRemote(history()).remoteStore); return s; },
  behind: () => teammateCommit(withRemote(history()), "team.txt", "Release checklist", "Add release checklist"),
  diverged: () => teammateCommit(runSequence(save("login.js", "Local login", "Build login"), withRemote(history())), "team.txt", "Release checklist", "Add release checklist"),
  localOnly: () => runSequence(save("login.js", "Local login", "Build login"), withRemote(history())),
  untrackedRemote: () => { const s = withRemote(history()); s.upstreams = {}; return s; },
  ignore: () => runSequence(save("debug.log", "Old tracked log", "Track a log by mistake"), history()),
  pick: () => runSequence([
    "git switch -c feature/login", ...save("login.js", "Experimental login", "D: login experiment"),
    ...save("settings.json", "theme=accessible", "E: fix contrast"),
    "git tag selected-fix", ...save("future.js", "Unreleased feature", "F: future feature"), "git switch main",
  ], history()),
  hotfix: () => runSequence([
    "git tag v1.0.0", ...save("future.js", "Unreleased feature", "Start next release"),
  ], history()),
};
export function createFixture(name) {
  if (!fixtures[name]) throw Error(`Unknown visual fixture: ${name}`);
  return fixtures[name]();
}
