import { baseCommands } from "./content.js";
import { evidenceFor } from "./incident-labs.js";
import { machineFixtures } from "./machine-fixtures.js";
import { scenarios, incidentLinks } from "./scenario-engine.js";
const identity = [
  'git config user.name "raga-git Learner"',
  'git config user.email "learner@example.test"',
];
export function shellCommand(command, os) {
  command = command.replace(
    /\b[\w./-]+(?:@\{\d+\}|\^\{\})/g,
    (ref) => "'" + ref + "'",
  );
  if (os !== "windows") return command;
  const e = command.match(/^echo "(.*)" (>>|>) (.+)$/);
  if (e)
    return `${e[2] === ">" ? "Set-Content" : "Add-Content"} -LiteralPath '${e[3]}' -Value '${e[1].replaceAll("'", "''")}'`;
  if (command.startsWith("touch "))
    return `New-Item -ItemType File -Path '${command.slice(6)}'`;
  if (command.startsWith("cat "))
    return `Get-Content -LiteralPath '${command.slice(4)}'`;
  return command;
}
export function machinePlan(scenario, os) {
  const original = scenario;
  const incidentNumber = Number(scenario?.id?.replace("incident-", ""));
  const related =
    incidentNumber >= 58 && incidentNumber <= 80
      ? scenarios.find((s) => s.id === incidentLinks[incidentNumber - 58])
      : null;
  const fixture = machineFixtures[scenario?.id] || machineFixtures[related?.id];
  if (fixture) scenario = { ...scenario, ...fixture };
  else if (related) scenario = { ...related, id: original.id };
  const id = scenario?.id || "playground",
    unique =
      os === "windows"
        ? `$practiceName = 'raga-git-${id}-' + [DateTime]::Now.ToString('yyyyMMdd-HHmmss-fff')\nNew-Item -ItemType Directory -Path $practiceName\nSet-Location -LiteralPath $practiceName`
        : `practice_name="raga-git-${id}-$(date +%Y%m%d-%H%M%S)"\nmkdir "$practice_name"\ncd "$practice_name"`;
  const mkdir =
    os === "windows"
      ? "New-Item -ItemType Directory -Path learner\nSet-Location learner"
      : "mkdir learner\ncd learner";
  const cd = (path) =>
    os === "windows" ? `Set-Location ${path}` : `cd ${path}`;
  const remote = ["clone", "behind", "diverged"].includes(scenario?.start);
  let setup = [],
    steps = [];
  if (remote) {
    setup = [
      "git init --bare -b main remote.git",
      "git init -b main seed",
      cd("seed"),
      ...identity,
      ...baseCommands.slice(1),
      ...(scenario.start === "clone"
        ? [
            'echo "Stable app" > app.js',
            "git add app.js",
            'git commit -m "Build app"',
          ]
        : []),
      "git remote add origin ../remote.git",
      "git push -u origin main",
      cd(".."),
    ];
    if (scenario.start === "clone")
      steps = [
        {
          title: "Clone your isolated bare remote",
          command:
            "git clone remote.git learner\n" +
            cd("learner") +
            "\n" +
            identity.join("\n"),
          why: "This is real Git between local folders; no hosting account or credentials are needed.",
          expected:
            "learner contains the initial history and tracks origin/main.",
        },
        ...(scenario.steps || []).slice(1),
      ];
    else {
      setup.push("git clone remote.git learner", cd("learner"), ...identity);
      if (scenario.start === "diverged")
        setup.push(
          'echo "My unpublished change" > local.txt',
          "git add local.txt",
          'git commit -m "Add local work"',
        );
      setup.push(
        cd(".."),
        "git clone remote.git teammate",
        cd("teammate"),
        ...identity,
        'echo "A teammate shipped an update" > team.txt',
        "git add team.txt",
        'git commit -m "Add teammate update"',
        "git push",
        cd("../learner"),
      );
      steps = scenario.steps;
    }
  } else {
    setup = [
      ...(scenario?.id === "publish"
        ? ["git init --bare -b main remote.git"]
        : []),
      mkdir,
    ];
    const source = scenario?.setup || [];
    if (source.length) {
      for (const c of source) {
        setup.push(c);
        if (c.startsWith("git init")) setup.push(...identity);
      }
    } else if (scenario?.id !== "first-commit")
      setup.push(
        ...baseCommands.slice(0, 1),
        ...identity,
        ...baseCommands.slice(1),
      );
    steps = scenario?.steps || [
      {
        title: "Inspect the repository",
        command: "git status",
        why: "Verify the selected practice repository.",
        expected: "A clean working tree.",
      },
    ];
    steps = steps.map((step) => ({
      ...step,
      command: step.command.startsWith("git init")
        ? step.command + "\n" + identity.join("\n")
        : step.command.startsWith("git remote add origin")
          ? "git remote add origin ../remote.git"
          : step.command,
    }));
  }
  const evidence = original && evidenceFor(original);
  return {
    setup:
      unique +
      "\n" +
      setup
        .map((c) =>
          c
            .split("\n")
            .map((l) => shellCommand(l, os))
            .join("\n"),
        )
        .join("\n"),
    steps: steps.map((s) => ({
      ...s,
      command: s.command
        .split("\n")
        .map((c) => shellCommand(c, os))
        .join("\n"),
    })),
    procedure: evidence,
    verification: scenario?.verify || "git status\ngit log --oneline",
    cleanup: `${cd("..")}\n${os === "windows" ? "Get-Location\nGet-ChildItem" : "pwd\nls"}`,
  };
}
