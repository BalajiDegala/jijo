import fs from "node:fs";
import {
  practicalInventory,
  incidentLinks,
  corrections,
} from "../lib/curriculum-manifest.js";
const guide = fs.readFileSync(
  "docs/Git_Version_Control_Interview_Preparation_Guide.md",
  "utf8",
);
const notes = fs.readFileSync("docs/git-docs.md", "utf8");
const matches = [...guide.matchAll(/^### Q(\d+): (.+)$/gm)];
if (matches.length !== 80)
  throw Error(`Expected 80 questions; found ${matches.length}`);
const questions = matches.map((m, i) => {
  const number = Number(m[1]);
  const end = matches[i + 1]?.index ?? guide.indexOf("\n## ", m.index + 1);
  let answer = guide
    .slice(m.index + m[0].length, end < 0 ? undefined : end)
    .trim()
    .replace(/\n## [\s\S]*$/, "")
    .trim();
  const title = m[2].trim();
  return {
    id: `q${String(number).padStart(2, "0")}`,
    number,
    title,
    answer,
    sourceLine: guide.slice(0, m.index).split("\n").length,
    category:
      number <= 25
        ? "Junior Core Git"
        : number <= 48
          ? "Mid-Level Workflows and Production"
          : number <= 57
            ? "Senior Advanced and Scale"
            : "Tricky Scenarios",
    level: number <= 25 ? 1 : number <= 48 ? 3 : number <= 57 ? 4 : 5,
    correction: corrections[number] || null,
    scenarioIds: practicalInventory
      .filter((s) => s.questions.includes(number))
      .map((s) => s.id),
    commands: [
      ...new Set(
        (answer.match(/git [a-z][^\n`]* /g) || []).map((x) => x.trim()),
      ),
    ],
  };
});
fs.mkdirSync("lib/curriculum", { recursive: true });
fs.writeFileSync(
  "lib/curriculum/source.json",
  JSON.stringify({ questions, notes }, null, 2) + "\n",
);
const matrix = [
  "# Scenario and curriculum coverage matrix",
  "",
  "Generated from the two supplied Markdown files. Source wording is preserved in `lib/curriculum/source.json`; editorial corrections are separate. Browser command labs, evidence-based decision labs, and manual machine exercises are explicitly distinguished. A mapping is an inventory, not a claim that every command has a browser implementation.",
  "",
  "## Required practical set",
  "",
  "| # | Scenario | Prerequisites | Source questions |",
  "|---|---|---|---|",
  ...practicalInventory.map(
    (s) =>
      `| ${s.number} | ${s.id}: ${s.title} | ${s.prerequisites.join(", ") || "None"} | ${s.questions.map((q) => "Q" + q).join(", ")} |`,
  ),
  "",
  "## Complete source question and lesson inventory",
  "",
  "Each question has a corresponding lesson with the same ID. All original answers remain available.",
  "",
  "| Source | Topic / lesson | Practice |",
  "|---|---|---|",
  ...questions.map(
    (q) =>
      `| Q${q.number}, line ${q.sourceLine} | ${q.id}: ${q.title} | ${q.scenarioIds.join(", ") || "Source-linked evidence exercise"}${q.number >= 58 ? `; incident-${q.number} → ${incidentLinks[q.number - 58]}` : ""} |`,
  ),
  "",
  "## git-docs.md topic inventory",
  "",
  "| Notes topic | Lessons | Practice |",
  "|---|---|---|",
  ...[
    ["Git / GitHub, centralized / distributed", "q01, q46", "first-commit"],
    [
      "Three areas plus remote, init / config / clone",
      "q02, q03",
      "first-commit, clone, index-snapshot",
    ],
    [
      "status / add / commit / log / amend",
      "q04, q16",
      "staging, atomic-commits, amend",
    ],
    [
      "diff / staged diff / ref comparisons",
      "q05, q06",
      "index-snapshot, history-head",
    ],
    [
      "Branches / checkout / switch / deletion",
      "q07",
      "branching, deleted-branch",
    ],
    ["HEAD / parent refs / detached HEAD", "q17", "history-head, detached"],
    [
      "merge / conflict / rebase",
      "q08, q09, q10, q58",
      "merge-feature, conflict, rebase",
    ],
    [
      "origin / upstream / tracking / remote CRUD",
      "q11, q45",
      "clone, publish, fetch-only",
    ],
    [
      "fetch / pull / push / remote deletion",
      "q11, q12, q78",
      "fetch-only, pull-rebase, rejected-push",
    ],
    [
      "restore / reset / revert / reflog",
      "q18, q19, q22, q37",
      "undo-compare, reflog-recovery, revert",
    ],
    ["stash", "q13", "q13 evidence exercise and machine practice"],
    ["cherry-pick / hotfix", "q20, q74", "hotfix"],
    ["tags / releases", "q15, q43", "release"],
    ["ignore / tracked files / rm --cached", "q14, q75", "ignore, add-remove"],
    [
      "Feature branches / reviews / GitHub Flow / trunk",
      "q24, q26, q27",
      "protected, release-design",
    ],
    ["Jenkins / triggers / Git in CI/CD", "q41, q44, q69", "ci-history"],
    [
      "Merge/rebase, reset/revert, fetch/pull diagrams",
      "q08, q10, q12, q18, q19",
      "Branch Visualizer, workspace graph",
    ],
  ].map((r) => "| " + r.join(" | ") + " |"),
  "",
  "## Review flags",
  "",
  "The interview guide is OCR-derived. Original text is retained verbatim; examples shown as runnable commands are authored, corrected, and tested separately. Malformed spaces/options, `Ifs`/`lIfs`, and duplicated heading fragments must not be copied blindly.",
  "",
  "" +
    Object.entries(corrections)
      .map(([n, c]) => `- Q${n}: ${c}`)
      .join("\n"),
  "",
  "No reference screenshot was supplied in the workspace. The user’s wireframe and existing application were inspected.",
];
fs.writeFileSync("docs/scenario-matrix.md", matrix.join("\n") + "\n");
console.log(
  `Imported ${questions.length} original questions; inventoried ${practicalInventory.length} practical labs and 23 incidents.`,
);
