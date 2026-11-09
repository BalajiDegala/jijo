import { baseCommands } from "./content.js";
const step = (title, command, why, expected) => ({
  title,
  command,
  why,
  expected,
});
const definitions = {
  6: {
    steps: [
      step(
        "Prepare separated changes",
        'echo "Line one" > sample.txt\necho "Line two" >> sample.txt\necho "Line three" >> sample.txt\ngit add sample.txt\ngit commit -m "Add sample"',
        "Create a tracked baseline, then use your editor to change separated lines or expand this file to create distinct hunks.",
        "A baseline commit is available.",
      ),
      step(
        "Choose hunks interactively",
        "git add -p sample.txt",
        "After editing the file, review each hunk. Use y/n to stage or leave it, s when Git can split a hunk, and q to quit. This is a real interactive command, not a paste-and-run batch.",
        "Only selected changes enter the index.",
      ),
      step(
        "Inspect both snapshots",
        "git diff --staged\ngit diff",
        "Compare selected changes to those left in the working copy.",
        "Your selected logical change appears in staged diff; the remainder appears in ordinary diff.",
      ),
    ],
  },
  25: {
    steps: [
      step(
        "Define a repository-local alias",
        "git config --local alias.st status\ngit st\ngit config --local --get alias.st",
        "This alias lives only in the disposable repository.",
        "git st runs status; alias.st prints status.",
      ),
    ],
  },
  30: {
    steps: [
      step(
        "Find the hook directory",
        "git rev-parse --git-path hooks",
        "Git prints the hook location. In that directory, create a file named pre-commit with a text editor containing a POSIX shell shebang and a check that exits 1. On macOS/Linux mark it executable with chmod +x. Git for Windows runs shell hooks through its bundled shell.",
        "The hook exists without a .sample extension.",
      ),
      step(
        "Try a guarded commit",
        'echo "Guarded change" > hook-test.txt\ngit add hook-test.txt\ngit commit -m "Test hook rejection"',
        "With the test hook enabled this commit should fail; inspect status. Edit the test hook to exit 0 and repeat the commit.",
        "A failing hook prevents the commit, but staged content is preserved. Local hooks are not server policy.",
      ),
    ],
  },
  33: {
    steps: [
      step(
        "Prepare a dependency repository",
        'git init -b main ../subtree-source\ngit -C ../subtree-source config user.name "raga-git Learner"\ngit -C ../subtree-source config user.email "learner@example.test"\necho "Vendored library" > ../subtree-source/library.txt\ngit -C ../subtree-source add .\ngit -C ../subtree-source commit -m "Create library"',
        "The source is independent, but subtree will integrate its files under a directory.",
        "A dependency commit is available.",
      ),
      step(
        "Integrate a subtree",
        "git subtree add --prefix=vendor/library ../subtree-source main --squash\ngit log --oneline\ngit ls-tree HEAD vendor/library",
        "Requires the git subtree helper included with many Git distributions. This creates ordinary tracked content under the prefix.",
        "The parent contains vendor/library without a submodule gitlink.",
      ),
    ],
  },
  36: {
    setup: [
      ...baseCommands,
      "git switch -c topic/base",
      'echo "Base work" > base.txt',
      "git add .",
      'git commit -m "Base topic"',
      "git switch -c topic/child",
      'echo "Independent child" > child.txt',
      "git add .",
      'git commit -m "Child change"',
    ],
    steps: [
      step(
        "Choose the replay range and new base",
        "git branch backup/child\ngit rebase --onto main topic/base topic/child",
        "Replay commits unique to topic/child after topic/base onto main. The child change is independent in this fixture.",
        "child.txt remains; base.txt is not included in the new child history.",
      ),
      step(
        "Verify the transplant",
        "git log --oneline --all\ngit ls-tree --name-only HEAD",
        "Compare both old backup and new branch.",
        "The child commit has a new parent and a new object ID.",
      ),
    ],
  },
  38: {
    steps: [
      step(
        "Create a linked working directory",
        "git worktree add -b feature/parallel ../parallel\ngit worktree list",
        "This shares repository objects while giving the branch its own working directory and index.",
        "Two working directories appear.",
      ),
      step(
        "Commit in the linked worktree",
        'echo "Parallel work" > ../parallel/parallel.txt\ngit -C ../parallel add .\ngit -C ../parallel commit -m "Work in parallel"\ngit log --all --oneline',
        "The current directory remains on main while the parallel branch advances.",
        "main files are unchanged; the parallel commit is visible in the shared object database.",
      ),
      step(
        "Remove the clean linked worktree",
        "git worktree remove ../parallel\ngit branch",
        "Remove the working directory through Git after confirming it is clean.",
        "The feature branch remains available.",
      ),
    ],
  },
  48: {
    steps: [
      step(
        "Make a patchable change",
        'echo "Patch content" > patch.txt\ngit add .\ngit commit -m "Add portable change"\ngit format-patch -1 HEAD --output-directory ../patches',
        "format-patch preserves commit metadata and the change for a mail/patch workflow.",
        "A numbered .patch file appears in the sibling patches folder.",
      ),
      step(
        "Inspect patch scope",
        "git show --stat HEAD\ngit diff HEAD~1 HEAD",
        "Inspect the patch before applying it elsewhere with git am. Apply only trusted patches in an isolated clone.",
        "Only patch.txt is added.",
      ),
    ],
  },
  49: {
    steps: [
      step(
        "Follow commit to tree to blob",
        "git cat-file -t HEAD\ngit cat-file -p HEAD\ngit ls-tree HEAD\ngit cat-file -p HEAD:README.md",
        "A commit references a tree; a tree maps names to objects; a blob contains file content.",
        "The output distinguishes commit metadata, tree entries, and README content.",
      ),
      step(
        "Inspect annotated tag and storage",
        'git tag -a v1.0 -m "Inspect a tag object"\ngit cat-file -t v1.0\ngit cat-file -p v1.0\ngit rev-parse --show-object-format\ngit count-objects -vH',
        "Unlike a lightweight tag, an annotated tag is an object. Repositories may use different object formats.",
        "Tag metadata and the repository hash format are visible.",
      ),
    ],
  },
  50: {
    setup: [
      ...baseCommands,
      'echo "Recoverable object" > recover.txt',
      "git add .",
      'git commit -m "Save recoverable content"',
    ],
    steps: [
      step(
        "Remove the branch reference safely in the fixture",
        "git reset --hard HEAD~1\ngit reflog\ngit fsck --no-reflogs --unreachable",
        "This discards tracked fixture content; the committed object may still be protected by reflogs. Do not expire reflogs or prune while investigating recovery.",
        "The former commit is discoverable.",
      ),
      step(
        "Protect the object with a reference",
        "git branch recovered HEAD@{1}\ngit show recovered:recover.txt\ngit gc\ngit show recovered:recover.txt",
        "A named reference protects this snapshot during ordinary maintenance.",
        "The recovered content remains readable before and after gc.",
      ),
    ],
  },
  51: {
    steps: [
      step(
        "Prepare a local sparse-checkout demonstration",
        'echo "Top-level document" > notes.txt\ngit add .\ngit commit -m "Add optional working file"\ngit sparse-checkout init --no-cone\ngit sparse-checkout set --no-cone /README.md',
        "Sparse checkout limits the working tree; it does not delete committed objects.",
        "Only selected tracked paths are populated in the working directory.",
      ),
      step(
        "Verify object availability and restore full checkout",
        "git show HEAD:notes.txt\ngit sparse-checkout disable\ngit status",
        "The excluded file remains available from the commit. Partial clone is a separate transfer feature requiring a supporting server.",
        "The full working tree returns with no content changes.",
      ),
    ],
  },
  52: {
    steps: [
      step(
        "Create a bare repository",
        "git clone --bare . ../server.git\ngit --git-dir=../server.git rev-parse --is-bare-repository\ngit --git-dir=../server.git show-ref",
        "A bare repository stores Git data without a normal working tree.",
        "The first command reports true, and main points to the source commit.",
      ),
      step(
        "Rehearse remote administration locally",
        "git remote add upstream ../server.git\ngit fetch upstream\ngit remote -v",
        "Actual server authentication, authorization and server hooks are separate administration tasks; this fixture requires no credentials.",
        "upstream names the local bare repository.",
      ),
    ],
  },
  56: {
    steps: [
      step(
        "Measure before tuning",
        "git count-objects -vH\ngit status\ngit log --oneline",
        "The tiny fixture is for command inspection, not meaningful performance benchmarks.",
        "Object counts, status and history are available.",
      ),
      step(
        "Write maintenance metadata without a background service",
        "git commit-graph write --reachable\ngit commit-graph verify\ngit maintenance run --task=commit-graph",
        "This foreground task writes graph metadata and verifies it. Filesystem monitor support depends on platform and Git build; it is not enabled here.",
        "Graph verification exits successfully.",
      ),
    ],
  },
};
export function topicPractice(question, fallback) {
  const d = definitions[question.number];
  return d
    ? {
        id: `topic-${question.number}`,
        title: question.title,
        mode: "machine",
        setup: d.setup || baseCommands,
        steps: d.steps,
        verify: "git status\ngit log --oneline --all",
      }
    : fallback;
}
