import { scenarios as legacy, baseCommands } from "./content.js";
const step = (title, command, why, expected) => ({
  title,
  command,
  why,
  expected,
});
export const machineFixtures = {
  bisect: legacy.find((s) => s.id === "bisect"),
  rerere: {
    setup: [
      ...baseCommands,
      "git config rerere.enabled true",
      "git switch -c feature/title",
      'echo "Feature title" > README.md',
      "git add .",
      'git commit -m "Feature title"',
      "git switch main",
      'echo "Main title" > README.md',
      "git add .",
      'git commit -m "Main title"',
    ],
    steps: [
      {
        ...step(
          "Create the first conflict",
          "git merge feature/title",
          "Both branches changed the same line. This command is expected to stop with a conflict.",
          "Git records the conflict preimage.",
        ),
        expectedError: true,
      },
      step(
        "Record a reviewed resolution",
        'echo "Combined title" > README.md\ngit add README.md\ngit commit -m "Resolve title"',
        "The commit records the manually resolved tree; rerere records the resolution.",
        "A clean merge commit with Combined title.",
      ),
      step(
        "Repeat in this disposable repository",
        "git reset --hard HEAD~1\ngit merge feature/title",
        "Discard only the disposable merge commit and recreate the same conflict. Rerere should reuse the recorded content; Git may still report conflict status.",
        "README.md contains the recorded resolution; inspect and stage it explicitly.",
      ),
      step(
        "Verify and complete",
        'git diff\ngit rerere status\ngit add README.md\ngit commit -m "Review reused resolution"\ngit status',
        "A reused result still needs human review and tests.",
        "No unresolved paths remain.",
      ),
    ],
  },
  submodules: {
    setup: baseCommands,
    steps: [
      step(
        "Create a local dependency",
        'git init -b main ../dependency\ngit -C ../dependency config user.name "raga-git Learner"\ngit -C ../dependency config user.email "learner@example.test"\necho "API v1" > ../dependency/api.txt\ngit -C ../dependency add .\ngit -C ../dependency commit -m "Release API v1"',
        "A separate repository owns the dependency history.",
        "The dependency has one commit.",
      ),
      step(
        "Pin it in the parent",
        'git -c protocol.file.allow=always submodule add ../dependency vendor/library\ngit add .gitmodules vendor/library\ngit commit -m "Pin dependency"',
        "The file protocol exception is scoped to this one local command. The parent records a gitlink.",
        "git submodule status shows the pinned commit.",
      ),
      step(
        "Advance the dependency independently",
        'echo "API v2" > ../dependency/api.txt\ngit -C ../dependency add .\ngit -C ../dependency commit -m "Release API v2"\ngit submodule status',
        "Changing the source repository does not move the parent gitlink.",
        "The parent still records v1.",
      ),
      step(
        "Test and record a new pin",
        'git -C vendor/library fetch origin\ngit -C vendor/library checkout origin/main\ngit diff --submodule\ngit add vendor/library\ngit commit -m "Upgrade dependency to tested revision"',
        "Choose a specific tested revision; the detached submodule checkout is normal.",
        "The parent commit records the new dependency commit.",
      ),
    ],
  },
  scale: {
    setup: [
      ...baseCommands,
      'echo "Small fixture standing in for a binary" > archive.bin',
      "git add archive.bin",
      'git commit -m "Add historical asset"',
      "git rm archive.bin",
      'git commit -m "Remove current asset"',
    ],
    steps: [
      step(
        "Find retained history",
        "git log --all -- archive.bin\ngit count-objects -vH",
        "Deleting the latest working file leaves earlier reachable blobs. This tiny fixture demonstrates retention, not a performance benchmark.",
        "The earlier asset commit still appears.",
      ),
      step(
        "Compare a shallow clone",
        "git clone --no-local --depth 1 . ../shallow\ngit -C ../shallow rev-parse --is-shallow-repository\ngit -C ../shallow log --oneline",
        "--no-local makes local clone honor the requested transfer depth.",
        "The clone is shallow and has only the tip history.",
      ),
      step(
        "Inspect ordinary object structure",
        "git cat-file -p HEAD\ngit ls-tree HEAD\ngit count-objects -vH",
        "Measure object and checkout costs separately before choosing an optimization.",
        "The commit references a tree and parent; old objects remain in the source repository.",
      ),
    ],
  },
  secret: {
    setup: [
      ...baseCommands,
      'echo "DEMO_NOT_A_REAL_CREDENTIAL" > demo.env',
      "git add demo.env",
      'git commit -m "Accidentally track demo credential"',
      "git rm demo.env",
      'git commit -m "Remove current demo file"',
    ],
    steps: [
      step(
        "Show why deletion is insufficient",
        "git log --all -- demo.env\ngit show HEAD~1:demo.env",
        "Use only the intentionally fake marker. The old snapshot still contains it.",
        "The harmless marker is readable from history.",
      ),
      step(
        "Prevent new accidental tracking",
        'echo "demo.env" > .gitignore\ngit add .gitignore\ngit commit -m "Ignore local environment file"',
        "Ignore rules help future untracked files; they do not erase old history or revoke a key.",
        "The rule is committed, but the old marker remains.",
      ),
      step(
        "Verify the remaining exposure",
        "git show HEAD~2:demo.env",
        "For a real credential, rotation and incident investigation come first; cleanup is separate.",
        "The old snapshot remains available. No real secret was entered or revoked in this exercise.",
      ),
    ],
  },
  protected: {
    setup: baseCommands,
    steps: [
      step(
        "Prepare a review branch",
        'git switch -c feature/review\necho "Reviewed change" > feature.txt\ngit add feature.txt\ngit commit -m "feat: prepare review"',
        "Keep the change separate from main.",
        "main remains at its old tip.",
      ),
      step(
        "Inspect review scope",
        "git diff main HEAD\ngit log main..HEAD",
        "Use the patch and commit list as review inputs.",
        "Exactly the proposed feature appears.",
      ),
      step(
        "Verify the integration locally",
        "git switch main\ngit merge --no-ff feature/review\ngit log --oneline --all",
        "This is a local integration rehearsal. A real hosting policy must separately enforce reviews and status checks.",
        "A merge commit exists; no hosting review has been submitted.",
      ),
    ],
  },
  traceability: {
    setup: baseCommands,
    steps: [
      step(
        "Connect change and intent",
        'git switch -c feature/issue-42\necho "Issue 42 implementation" > feature.txt\ngit add .\ngit commit -m "feat: implement issue 42"\ngit switch main\ngit merge --no-ff feature/issue-42',
        "A reference in a message supports traceability but is not a hosting approval record.",
        "The merge connects the feature to main.",
      ),
      step(
        "Name the release",
        'git tag -a v1.0 -m "Release 1.0: issue 42"\ngit show v1.0\ngit log --oneline --all',
        "An annotated tag records release metadata.",
        "The tag points to the reviewed integration candidate.",
      ),
      step(
        "Inspect the source revision",
        "git rev-parse v1.0^{}\ngit show --stat v1.0",
        "Resolve the tag to a commit and connect a real build artifact to it in your release system.",
        "A concrete source commit is identifiable; deployment is still a separate action.",
      ),
    ],
  },
  "release-design": {
    setup: [
      ...baseCommands,
      "git tag v1.0",
      'echo "Unreleased feature" > feature.txt',
      "git add .",
      'git commit -m "Add unreleased feature"',
    ],
    steps: [
      step(
        "Base the hotfix on production",
        'git switch -c hotfix/1.0.1 v1.0\necho "Minimal production fix" > fix.txt\ngit add .\ngit commit -m "fix: correct production issue"',
        "The production tag excludes the unreleased feature.",
        "The hotfix has README and fix.txt, but not feature.txt.",
      ),
      step(
        "Name and inspect the patch release",
        "git tag v1.0.1\ngit diff v1.0 v1.0.1",
        "Confirm the release contains only the intended fix.",
        "The patch adds only fix.txt.",
      ),
      step(
        "Bring the fix forward",
        "git switch main\ngit cherry-pick hotfix/1.0.1\ngit log --oneline --all",
        "Ongoing development also needs the fix.",
        "main contains both the feature and the hotfix.",
      ),
    ],
  },
  "ci-history": {
    setup: [
      ...baseCommands,
      "git tag v1.0",
      'echo "Next build" > build.txt',
      "git add .",
      'git commit -m "Build next version"',
    ],
    steps: [
      step(
        "Reproduce a shallow checkout",
        "git clone --no-local --depth 1 . ../ci-checkout\ngit -C ../ci-checkout rev-parse --is-shallow-repository",
        "A depth-one checkout lacks earlier history.",
        "The result is true.",
      ),
      step(
        "Observe the missing version context",
        "git -C ../ci-checkout describe --tags",
        "This command is expected to fail because the release tag’s history was not fetched.",
        "Git cannot find a suitable tag.",
      ),
      step(
        "Fetch required history and tags",
        "git -C ../ci-checkout fetch --unshallow --tags\ngit -C ../ci-checkout describe --tags",
        "Versioning requires sufficient history and relevant tags.",
        "The version now describes distance from v1.0.",
      ),
    ],
  },
  gitops: {
    setup: [
      ...baseCommands,
      'echo "image: demo:v1" > deployment.yaml',
      "git add .",
      'git commit -m "Deploy version one"',
      'echo "image: demo:v2" > deployment.yaml',
      "git add .",
      'git commit -m "Promote version two"',
    ],
    steps: [
      step(
        "Inspect desired-state change",
        "git diff HEAD~1 HEAD",
        "Git records the declared deployment version; it does not itself reconcile a cluster.",
        "The image declaration changes from v1 to v2.",
      ),
      step(
        "Revert desired state",
        "git revert --no-edit HEAD\ngit show HEAD:deployment.yaml",
        "A new commit restores the previous declaration.",
        "The file declares v1 again while history retains the v2 promotion.",
      ),
      step(
        "Verify what Git can prove",
        "git log --oneline\ngit status",
        "A real GitOps system also needs reconciler status and workload health checks.",
        "Repository state is clean. No cluster deployment is claimed.",
      ),
    ],
  },
};
