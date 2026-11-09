"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  ArrowLeft,
  ArrowRight,
  Clock,
  Monitor,
  Terminal,
  Lightbulb,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  Info,
  RotateCcw,
  Trophy,
  Target,
  BookOpen,
} from "lucide-react";
import { scenarios, levels, baseCommands } from "@/lib/content";
import { emptyRepo, runSequence } from "@/lib/git-engine";
import { ScenarioCard } from "./overview";
import { Sandbox } from "./playground";
import { useProgress } from "./providers";
import { Badge, SectionHeading, CodeBlock, CopyButton } from "./ui";
export function ScenarioLibrary() {
  const params = useSearchParams();
  const [level, setLevel] = useState(Number(params.get("level")) || 0),
    [query, setQuery] = useState("");
  const { progress } = useProgress();
  const filtered = scenarios.filter(
    (s) =>
      (!level || s.level === level) &&
      `${s.title} ${s.tags.join(" ")} ${s.subtitle}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <SectionHeading
        eyebrow="LEARN IT BY LIVING IT"
        title="Real problems. Real confidence."
        description="Short, guided missions for the moments every developer runs into."
      >
        <div className="completion-count">
          <CheckCircle2 size={19} />
          <strong>{progress.scenarios.length}</strong> / 16 complete
        </div>
      </SectionHeading>
      <div className="scenario-filters">
        <div
          className="filter-tabs"
          role="group"
          aria-label="Scenario difficulty"
        >
          {levels.map((name, i) => (
            <button
              key={name}
              className={level === i ? "selected" : ""}
              onClick={() => setLevel(i)}
              aria-pressed={level === i}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="inline-search">
          <Search size={16} />
          <input
            aria-label="Filter scenarios"
            placeholder="Find a scenario..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="scenario-grid">
        {filtered.map((s) => (
          <ScenarioCard key={s.id} scenario={s} index={scenarios.indexOf(s)} />
        ))}
      </div>
      {!filtered.length && (
        <div className="empty-state">
          <Search size={32} />
          <h2>No scenarios found</h2>
          <p>Try a command like “merge” or choose another level.</p>
          <button
            className="button secondary"
            onClick={() => {
              setLevel(0);
              setQuery("");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
      <div className="notice">
        <Info size={18} />
        <span>
          Start anywhere. Progress is saved in this browser, and every scenario
          includes a guide for practicing on your own machine.
        </span>
      </div>
    </>
  );
}
export function ScenarioLesson({ id }) {
  const scenario = scenarios.find((s) => s.id === id);
  const { progress, markStep, setProgress } = useProgress();
  const [mode, setMode] = useState(scenario.localOnly ? "machine" : "browser"),
    [active, setActive] = useState(0),
    [hint, setHint] = useState(false),
    [guide, setGuide] = useState(""),
    [attempt, setAttempt] = useState(0),
    [feedback, setFeedback] = useState("");
  const current = scenario.steps[active],
    complete = active >= scenario.steps.length;
  const done = Array.isArray(progress.steps[id]) ? progress.steps[id] : [];
  const initial = () => runSequence(scenario.setup, emptyRepo());
  function received(command, result) {
    if (!current) return;
    if (result.error) {
      setFeedback(
        "Check the terminal feedback, then try again. Your progress is safe.",
      );
      return;
    }
    const normal = (x) => x.trim().replace(/'/g, '"').replace(/\s+/g, " ");
    if (normal(command) === normal(current.command)) {
      markStep(id, active, true, scenario.steps.length);
      setActive((i) => i + 1);
      setHint(false);
      setGuide("");
      setFeedback("Nice. You can see the result in the repository above.");
    } else
      setFeedback(
        "Command ran. Follow this step’s suggested command to advance the guided mission.",
      );
  }
  const next = scenarios[scenarios.indexOf(scenario) + 1];
  return (
    <>
      <Link className="back-link" href="/scenarios">
        <ArrowLeft size={15} />
        All scenarios
      </Link>
      <SectionHeading
        eyebrow={`MISSION ${String(scenarios.indexOf(scenario) + 1).padStart(2, "0")} / 16`}
        title={scenario.title}
        description={scenario.subtitle}
      >
        <div className="lesson-meta">
          <Badge color={scenario.color}>Level {scenario.level}</Badge>
          <span>
            <Clock size={14} />
            {scenario.minutes} min
          </span>
        </div>
      </SectionHeading>
      <div className="lesson-topline">
        <div className="mode-tabs" role="group" aria-label="Practice mode">
          {!scenario.localOnly && (
            <button
              className={mode === "browser" ? "selected" : ""}
              onClick={() => setMode("browser")}
            >
              <Terminal size={16} />
              Try in the browser
            </button>
          )}
          <button
            className={mode === "machine" ? "selected" : ""}
            onClick={() => setMode("machine")}
          >
            <Monitor size={16} />
            Practice on your machine
          </button>
        </div>
        <span className="lesson-progress-label">
          {done.length} / {scenario.steps.length} steps saved
        </span>
      </div>
      <div className="progress-track lesson-progress">
        <span
          style={{ width: `${(done.length / scenario.steps.length) * 100}%` }}
        />
      </div>
      {!scenario.localOnly && (
        <div className="lesson-layout" hidden={mode !== "browser"}>
          <aside className="mission-panel">
            <div className="eyebrow">YOUR MISSION</div>
            <p className="mission-concept">{scenario.concept}</p>
            <ol className="mission-steps">
              {scenario.steps.map((step, i) => (
                <li
                  key={step.title}
                  className={`${i === active ? "active" : ""} ${i < active ? "done" : ""}`}
                >
                  <span className="step-number">
                    {i < active ? <Check size={13} /> : i + 1}
                  </span>
                  <span>{step.title}</span>
                </li>
              ))}
            </ol>
            <div className="mission-hint">
              <Lightbulb size={18} />
              <span>
                Every command changes the picture. Take a moment to notice what
                moved.
              </span>
            </div>
          </aside>
          <div className="lesson-workspace">
            <Sandbox
              key={`${id}-${attempt}`}
              initialState={initial()}
              guideCommand={guide}
              onCommand={received}
              onReset={() => {
                setActive(0);
                setHint(false);
                setGuide("");
                setFeedback("");
              }}
              embedded
            />
            {!complete ? (
              <div className="active-instruction">
                <div className="active-step-label">
                  STEP {active + 1} OF {scenario.steps.length}
                </div>
                <h2>{current.title}</h2>
                <p>{current.why}</p>
                <div className="expected-result">
                  <CheckCircle2 size={16} />
                  <span>
                    <strong>Look for:</strong> {current.expected}
                  </span>
                </div>
                <div className="instruction-actions">
                  <button
                    className="quiet-button"
                    onClick={() => setHint(!hint)}
                  >
                    <Lightbulb size={15} />
                    {hint ? "Hide hint" : "Need a hint?"}
                  </button>
                  <button
                    className="button primary"
                    onClick={() => {
                      setGuide({ text: current.command });
                      setHint(true);
                    }}
                  >
                    Load command
                    <ArrowRight size={15} />
                  </button>
                </div>
                {hint && (
                  <>
                    <CodeBlock command={current.command} />
                    <p className="small-muted">{current.hint}</p>
                  </>
                )}
                {feedback && (
                  <p className="step-feedback" role="status">
                    {feedback}
                  </p>
                )}
              </div>
            ) : (
              <div className="success-card">
                <Trophy size={36} />
                <Badge color="green">MISSION COMPLETE</Badge>
                <h2>That’s another thing that clicks.</h2>
                <p>{scenario.takeaway}</p>
                <div className="challenge-box">
                  <strong>Your bonus challenge</strong>
                  <p>{scenario.challenge}</p>
                </div>
                <div className="hero-buttons">
                  <button
                    className="button secondary"
                    onClick={() => setMode("machine")}
                  >
                    <Monitor size={16} />
                    Try it on your machine
                  </button>
                  {next && (
                    <Link
                      className="button primary"
                      href={`/scenarios/${next.id}`}
                    >
                      Next mission
                      <ArrowRight size={16} />
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <div hidden={mode !== "machine"}>
        <MachinePractice
          scenario={scenario}
          done={done}
          mark={(index, checked) =>
            markStep(id, index, checked, scenario.steps.length)
          }
        />
      </div>
    </>
  );
}
function MachinePractice({ scenario, done, mark }) {
  const [platform, setPlatform] = useState("windows");
  const folder = `raga-git-${scenario.id}`;
  const remoteScenario = ["fetch-pull", "pull-request"].includes(scenario.id);
  const bootstrap = remoteScenario
    ? []
    : [
        `mkdir ${folder}`,
        `cd ${folder}`,
        "git init -b main",
        'git config user.name "Git Learner"',
        'git config user.email "learner@example.com"',
        ...scenario.setup.filter((c) => !c.startsWith("git init")),
      ];
  const commands = [
    ...bootstrap,
    ...scenario.steps.map((s) => s.command).filter(Boolean),
  ];
  const completed = done.length === scenario.steps.length;
  return (
    <div className="machine-layout">
      <div className="machine-main">
        <div className="practice-intro panel">
          <div className="panel-heading">
            <div>
              <Monitor size={20} />
              <h2>Your terminal. Your real repository.</h2>
            </div>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              aria-label="Operating system"
            >
              <option value="windows">Windows · PowerShell</option>
              <option value="mac">macOS · Terminal</option>
              <option value="linux">Linux · Terminal</option>
            </select>
          </div>
          <p>
            {platform === "windows"
              ? "Open PowerShell or VS Code → Terminal → New Terminal."
              : platform === "mac"
                ? "Open Terminal from Applications → Utilities, or VS Code’s integrated terminal."
                : "Open your terminal app, or VS Code’s integrated terminal."}{" "}
            Run <code>git --version</code> first.{" "}
            {scenario.prerequisites ||
              "You need Git installed and a fresh, disposable practice folder."}
          </p>
          <div className="notice">
            <Info size={17} />
            <span>
              Commands run only when you paste them into your own terminal.
              Check results yourself, then tick each step. This website cannot
              inspect your machine.
            </span>
          </div>
          {scenario.warning && (
            <div className="notice warning">
              <Info size={17} />
              <span>{scenario.warning}</span>
            </div>
          )}
          {scenario.preparation && (
            <p className="preparation">
              <strong>Before you start:</strong> {scenario.preparation}
            </p>
          )}
          {bootstrap.length > 0 && (
            <details className="setup-details">
              <summary>
                Prepare an isolated practice repository{" "}
                <ChevronDown size={16} />
              </summary>
              <p>
                Run these once in a parent folder where you want the exercise.
                The name and email apply only to this practice repository. If
                this folder already exists, choose a fresh name.
              </p>
              <CodeBlock command={bootstrap.join("\n")} />
            </details>
          )}
          <p className="small-muted">
            These Git and echo commands work in{" "}
            {platform === "windows" ? "PowerShell" : "your shell"}. Use a new
            practice repository for each attempt.
          </p>
          <p className="editor-note">
            If Git opens an editor for a merge or revert message, keep the
            proposed message, save, and close it. In Vim: press Esc, type
            <code> :wq</code>, then Enter. You can add <code>--no-edit</code> to
            a merge or revert command to accept its default message directly.
          </p>
          <CopyButton text={commands.join("\n")} label="Copy all commands" />
        </div>
        {scenario.steps.map((step, i) => (
          <article
            className={`machine-step panel ${done.includes(i) ? "checked" : ""}`}
            key={step.title}
          >
            <div className="machine-step-title">
              <label className="step-checkbox">
                <input
                  type="checkbox"
                  checked={done.includes(i)}
                  onChange={(e) => mark(i, e.target.checked)}
                  aria-label={`Mark step ${i + 1} complete`}
                />
                <span>
                  {done.includes(i) ? (
                    <Check size={15} />
                  ) : (
                    String(i + 1).padStart(2, "0")
                  )}
                </span>
              </label>
              <h3>{step.title}</h3>
            </div>
            <p>{step.why}</p>
            {step.command && <CodeBlock command={step.command} />}
            <div className="expected-result">
              <CheckCircle2 size={16} />
              <span>
                <strong>Expected result:</strong> {step.expected}
              </span>
            </div>
            <details className="troubleshooting">
              <summary>Something looks different?</summary>
              <p>{step.hint}</p>
            </details>
          </article>
        ))}
        {completed && (
          <div className="success-card">
            <Trophy size={35} />
            <h2>Practice complete.</h2>
            <p>{scenario.takeaway}</p>
            <Link className="button primary" href="/scenarios">
              Choose your next mission
              <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </div>
      <aside className="practice-sidebar">
        <div className="panel">
          <Badge color="purple">THE BIG IDEA</Badge>
          <h3>{scenario.concept}</h3>
          <p>{scenario.takeaway}</p>
        </div>
        <div className="panel">
          <div className="eyebrow">VERIFY IT YOURSELF</div>
          <h3>Look at the result</h3>
          <CodeBlock command={scenario.verify} />
          <p>
            Compare the output with the expected results above. Hashes and
            timestamps will differ.
          </p>
        </div>
        <div className="panel">
          <div className="eyebrow">GO ONE STEP FURTHER</div>
          <h3>Try it without a guide</h3>
          <p>{scenario.challenge}</p>
        </div>
        <div className="panel">
          <div className="eyebrow">RESET & CLEANUP</div>
          <h3>Keep practice separate</h3>
          <p>
            {remoteScenario
              ? "Use only your personal practice repository. Close any practice PRs when finished. Keep useful commits, or archive the practice repository from its settings."
              : "To restart, leave this folder with cd .. and repeat in a new folder with a different name. When finished, close any terminal or editor using the old folder, verify its contents and exact path, then remove only that disposable practice folder in your file manager."}
          </p>
          <p>
            If a merge is paused, <code>git merge --abort</code> returns to the
            starting point. For bisect, use <code>git bisect reset</code>.
          </p>
        </div>
      </aside>
    </div>
  );
}
