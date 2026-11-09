import files from "./lessons/files.js";
import navigation from "./lessons/navigation.js";
import { step } from "./schema.js";

export const lifecycle = {
  id: "L01",
  version: 1,
  level: 1,
  title: "One file, all the way to a remote",
  objective:
    "Follow two versions of README.md. See what staging freezes, what a commit saves, and what a push shares.",
  fixture: "empty",
  source: [
    [18, 68],
    [127, 137],
  ],
  scenario: "index-snapshot",
  interview: "q04",
  prerequisites: [],
  mistake:
    "Staging copies contents. A commit reads that staged snapshot. Neither action uploads your work.",
  steps: [
    step(
      "git init -b main",
      "Start a local repository before saving history.",
      "HEAD names main, but there are no commits yet.",
    ),
    step(
      'echo "Version A" > README.md',
      "Create the first version of your project notes.",
      "A exists only in working files. It is untracked.",
    ),
    step(
      "git add README.md",
      "Choose the contents for the next commit.",
      "A is copied into staging. Your working file stays in place.",
    ),
    step(
      'echo "Version B" > README.md',
      "Keep writing after you staged the file.",
      "Working files contain B; staging still contains A.",
      { checkpoint: true },
    ),
    step(
      "git diff",
      "Compare the working file with its staged version.",
      "The output shows the difference from staged A to working B.",
    ),
    step(
      "git diff --staged",
      "Inspect what your next commit will save.",
      "The staged snapshot contains A. B is not staged.",
    ),
    step(
      'git commit -m "Save version A"',
      "Save the index as a local snapshot.",
      "The first commit contains A. Working B remains an unstaged edit.",
    ),
    step(
      "git add README.md",
      "Choose the newer version for a second commit.",
      "Staging now contains B. The first commit still contains A.",
    ),
    step(
      'git commit -m "Save version B"',
      "Save a second snapshot with the first commit as its parent.",
      "main advances to B. Both versions remain inspectable in history.",
    ),
    step(
      "git remote add origin https://example.com/team/project.git",
      "Give the example remote a local name.",
      "origin is configured. No objects have been transferred.",
    ),
    step(
      "git push -u origin main",
      "Share the committed history and remember the upstream.",
      "The remote receives both commits. main, origin/main and remote/main now agree.",
    ),
    step(
      "git status",
      "Verify the local working state after sharing.",
      "The working tree is clean. Inspect the graph to verify the separate remote reference.",
    ),
  ],
  check: {
    prompt:
      "You staged A, edited the working file to B, then committed. Which version did that commit save?",
    options: [
      "Version A — the staged snapshot",
      "Version B — the latest working file",
    ],
    correct: 0,
    explanation:
      "A commit reads the index. B remains an unstaged edit until you stage it again.",
  },
};

export const visualLessons = [lifecycle, ...files, ...navigation];
export const lessonById = (id) =>
  visualLessons.find((lesson) => lesson.id === id);
