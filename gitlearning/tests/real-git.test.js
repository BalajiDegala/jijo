import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import { resolve, join } from "node:path";
import { spawnSync } from "node:child_process";
import { scenarios } from "../lib/content.js";
import { runSequence, headTree } from "../lib/git-engine.js";

// Exercise the actual lesson commands against disposable repositories, never the user's repo.
const root = resolve(".local/real-git-qa");
mkdirSync(root, { recursive: true });
const git = (cwd, args) =>
  spawnSync(
    "git",
    [
      "-c",
      "user.name=GitQuest QA",
      "-c",
      "user.email=qa@example.invalid",
      "-c",
      "core.autocrlf=false",
      "-c",
      "core.editor=true",
      "-c",
      "commit.gpgsign=false",
      ...args,
    ],
    {
      cwd,
      encoding: "utf8",
      timeout: 15000,
      env: {
        ...process.env,
        GIT_TERMINAL_PROMPT: "0",
        GIT_MERGE_AUTOEDIT: "no",
      },
    },
  );
for (const scenario of scenarios.filter(
  (s) => !["publish", "fetch-pull", "pull-request"].includes(s.id),
)) {
  test(`real Git validates the practice instructions: ${scenario.id}`, () => {
    const cwd = mkdtempSync(join(root, `${scenario.id}-`));
    const commands = [
      ...scenario.setup,
      ...scenario.steps.map((s) => s.command).filter(Boolean),
    ];
    let foundRegression = false;
    for (const command of commands) {
      const echo = command.match(/^echo "(.*)" (>>?) ([\w./-]+)$/);
      if (echo) {
        const path = join(cwd, echo[3]);
        writeFileSync(path, `${echo[1]}\n`, {
          flag: echo[2] === ">>" ? "a" : "w",
        });
        continue;
      }
      if (command.startsWith("cat ")) {
        const content = readFileSync(join(cwd, command.slice(4)), "utf8");
        if (scenario.id === "bisect") assert.match(content, /broken/);
        continue;
      }
      const args = command
        .match(/"[^"\n]*"|\S+/g)
        .slice(1)
        .map((a) => (a.startsWith('"') ? a.slice(1, -1) : a));
      const result = git(cwd, args);
      const output = `${result.stdout || ""}${result.stderr || ""}`;
      if (scenario.id === "conflict" && command === "git merge feature/title") {
        assert.equal(result.status, 1, output);
        assert.match(output, /CONFLICT/);
      } else assert.equal(result.status, 0, `${command}\n${output}`);
      if (scenario.id === "bisect" && command === "git bisect bad") {
        assert.match(output, /first bad commit/);
        assert.match(output, /Introduce regression/);
        foundRegression = true;
      }
    }
    if (scenario.id === "bisect") assert.ok(foundRegression);
    else {
      const expected = headTree(runSequence(commands));
      const actual = {};
      for (const f of readdirSync(cwd).filter((f) => f !== ".git"))
        actual[f] = readFileSync(join(cwd, f), "utf8").trimEnd();
      assert.deepEqual(
        actual,
        expected,
        "Published lesson and simulator should reach matching working content.",
      );
    }
  });
}
