import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { machinePlan } from "../lib/machine-practice.js";
import { scenarios } from "../lib/scenario-engine.js";
const root = path.resolve(".local/machine-plans");
fs.mkdirSync(root, { recursive: true });
const selected = [
  "first-commit",
  "restore",
  "ignore",
  "clone",
  "publish",
  "fetch-only",
  "pull-rebase",
  "rejected-push",
  "teammate",
  "submodules",
  "secret",
  "scale",
  "traceability",
  "release-design",
  "gitops",
  "ci-history",
  "rerere",
];
for (const id of selected)
  test(`real PowerShell machine plan: ${id}`, () => {
    if (process.platform !== "win32") return;
    const scenario = scenarios.find((s) => s.id === id),
      plan = machinePlan(scenario, "windows");
    const folder = fs.mkdtempSync(path.join(root, id + "-"));
    let count = 0,
      describeCount = 0;
    const checked = (command, allowFailure = false) =>
      command
        .split("\n")
        .map((line) => {
          if (!line.startsWith("git ")) return line;
          count++;
          const conflict =
            (id === "rerere" && line === "git merge feature/title") ||
            (id === "ci-history" &&
              line === "git -C ../ci-checkout describe --tags" &&
              ++describeCount === 1);
          return (
            line +
            (!allowFailure && !conflict
              ? `\nif ($LASTEXITCODE -ne 0) { throw 'Git command ${count} failed: ${line.replaceAll("'", "''")}' }`
              : "")
          );
        })
        .join("\n");
    const script =
      "$ErrorActionPreference = 'Stop'\n" +
      checked(plan.setup) +
      "\n" +
      plan.steps
        .map((s) =>
          checked(
            s.command,
            s.expectedError ||
              (id === "rejected-push" && s.command === "git push origin main"),
          ),
        )
        .join("\n") +
      '\ngit status --porcelain\nif ($LASTEXITCODE -ne 0) { throw "Final repository inspection failed" }';
    const file = path.join(folder, "exercise.ps1");
    fs.writeFileSync(file, script, "utf8");
    const r = spawnSync(
      "powershell.exe",
      ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", file],
      {
        cwd: folder,
        encoding: "utf8",
        timeout: 90000,
        env: {
          ...process.env,
          GIT_TERMINAL_PROMPT: "0",
          GIT_MERGE_AUTOEDIT: "no",
          GIT_CONFIG_COUNT: "3",
          GIT_CONFIG_KEY_0: "core.editor",
          GIT_CONFIG_VALUE_0: "true",
          GIT_CONFIG_KEY_1: "commit.gpgsign",
          GIT_CONFIG_VALUE_1: "false",
          GIT_CONFIG_KEY_2: "tag.gpgsign",
          GIT_CONFIG_VALUE_2: "false",
        },
      },
    );
    assert.equal(r.status, 0, `${id}\n${r.stdout}\n${r.stderr}`);
  });
