"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Folder,
  Layers,
  Database,
  Cloud,
  FileCode2,
  Plus,
  RotateCcw,
  ArrowRight,
  Info,
  Terminal,
  GitBranch,
  Check,
  Users,
  X,
  Monitor,
  ChevronRight,
  Trash2,
} from "lucide-react";
import {
  runCommand,
  statusOf,
  headId,
  headTree,
  clone,
  withRemote,
  demoRepo,
  teammateCommit,
  remoteSummary,
  isIgnored,
} from "@/lib/git-engine";
import { loadScenario, expectedSteps, verifyStep } from "@/lib/scenario-engine";
import { HistoryGraph } from "./history-graph";
import { useProgress } from "./providers";
import { MachineLab } from "./machine-lab";
import { ConceptExplainer } from "./concept-explainer";
import { nextScenarioId } from "@/lib/scenario-concepts";
import { commandHelp } from "@/lib/command-help";
const suggestions = [
  "git status",
  "git add .",
  "git add README.md",
  'git commit -m "Save changes"',
  "git diff",
  "git diff --staged",
  "git log --oneline --all",
  "git branch",
  "git switch -c feature/idea",
  "git merge origin/main",
  "git fetch origin",
  "git push origin main",
  "git pull --rebase origin main",
  "git stash -u",
  "git reflog",
  "git --help",
  "git help reflog",
  "git cherry-pick",
  "git show HEAD",
  "git restore README.md",
  "git tag v1.0",
  "help",
];
function freeRepo() {
  const s = withRemote(demoRepo());
  s.working["README.md"] = "raga-git: learn by doing";
  s.working["notes.txt"] = "My next idea";
  return s;
}
export function Workspace({ scenario }) {
  const initial = useMemo(
    () => (scenario ? loadScenario(scenario) : freeRepo()),
    [scenario],
  );
  const expectations = useMemo(
    () => (scenario ? expectedSteps(scenario) : []),
    [scenario],
  );
  const [state, setState] = useState(() => clone(initial)),
    [step, setStep] = useState(0),
    [input, setInput] = useState(""),
    [logs, setLogs] = useState([
      {
        output:
          "Browser simulation · No shell or network access.\nSupported commands update the repository above. Try git --help or git help reflog.",
        kind: "info",
      },
    ]),
    [history, setHistory] = useState([]),
    [cursor, setCursor] = useState(-1),
    [modal, setModal] = useState(null),
    [panel, setPanel] = useState("areas"),
    [size, setSize] = useState(48),
    [event, setEvent] = useState(""),
    [tick, setTick] = useState(0),
    [filename, setFilename] = useState(""),
    [content, setContent] = useState(""),
    [readOnly, setReadOnly] = useState(false),
    [fileError, setFileError] = useState("");
  const inputRef = useRef(null),
    output = useRef(null),
    dialog = useRef(null);
  const { setProgress } = useProgress();
  const status = statusOf(state),
    summary = remoteSummary(state),
    current = expectations[step],
    done = Boolean(scenario) && step === expectations.length;
  useEffect(() => {
    if (output.current) output.current.scrollTop = output.current.scrollHeight;
  }, [logs]);
  useEffect(() => {
    modal ? dialog.current?.showModal() : dialog.current?.close();
  }, [modal]);
  const complete = () =>
    setProgress((p) => ({
      ...p,
      scenarios: [...new Set([...p.scenarios, scenario.id])],
      verified: [...new Set([...(p.verified || []), scenario.id])],
      lastScenario: scenario.id,
      activity: [
        {
          type: "Simulator verified",
          id: scenario.id,
          title: scenario.title,
          at: new Date().toISOString(),
        },
        ...(p.activity || []),
      ].slice(0, 40),
    }));
  function execute(command = input) {
    if (!command.trim()) return;
    if (command.trim() === "clear") {
      setLogs([]);
      setInput("");
      return;
    }
    const result = runCommand(state, command);
    setState(result.state);
    setInput("");
    setCursor(-1);
    setHistory((h) => [command, ...h].slice(0, 100));
    setEvent(command.split(" ")[1] || "edit");
    setTick((t) => t + 1);
    let verified = false;
    if (current && verifyStep(current, result, command)) {
      verified = true;
      setStep(step + 1);
      if (step + 1 === expectations.length) complete();
    }
    setLogs((l) => [
      ...l.slice(-199),
      {
        command: /ghp_|github_pat_|PRIVATE KEY|https?:\/\/[^/\s]+@/i.test(
          command,
        )
          ? "[credential-like input redacted]"
          : command,
        output:
          result.output +
          (verified ? "\n✓ Step verified against repository state." : ""),
        kind: result.error ? "error" : "success",
      },
    ]);
  }
  function reset() {
    setState(clone(initial));
    setStep(0);
    setLogs([
      {
        output: "Scenario reset. Overall learning progress is preserved.",
        kind: "info",
      },
    ]);
    setInput("");
    setHistory([]);
    setCursor(-1);
    setEvent("");
    setModal(null);
  }
  function inspectFile(f, area) {
    setFilename(f);
    setContent(
      (area === "index"
        ? state.index
        : area === "local"
          ? headTree(state)
          : area === "remote"
            ? state.remoteStore.commits.find(
                (c) => c.id === state.remoteStore.branches.main,
              )?.tree
            : state.working)?.[f] ?? "(deleted from this snapshot)",
    );
    setReadOnly(area !== "working");
    setFileError("");
    setModal("file");
  }
  function newFile() {
    setFilename("notes.txt");
    setContent("");
    setReadOnly(false);
    setFileError("");
    setModal("file");
  }
  function save(e) {
    e.preventDefault();
    if (
      !/^[\w.][\w./-]*$/.test(filename) ||
      filename.includes("..") ||
      filename.startsWith(".git/")
    ) {
      setFileError("Use a relative filename such as app.js or .gitignore.");
      return;
    }
    setState((s) => ({ ...s, working: { ...s.working, [filename]: content } }));
    setLogs((l) => [
      ...l,
      {
        output: `Edited ${filename}. The index and commits are unchanged.`,
        kind: "info",
      },
    ]);
    setModal(null);
  }
  function teammate() {
    try {
      const s = teammateCommit(
        state,
        "team.txt",
        `Teammate update ${state.remoteStore.nextId}`,
      );
      setState(s);
      setLogs((l) => [
        ...l,
        {
          output:
            "Alex committed and pushed to the simulated remote. Your local main and origin/main have not changed. Run git fetch to discover the update.",
          kind: "info",
        },
      ]);
    } catch (e) {
      setLogs((l) => [...l, { output: e.message, kind: "error" }]);
    }
  }
  const remoteTree =
    state.remoteStore.commits.find(
      (c) => c.id === state.remoteStore.branches.main,
    )?.tree || {};
  const areas = [
    {
      id: "working",
      title: "Working directory",
      Icon: Folder,
      caption: "Editable files on your machine",
      files: Object.keys(state.working),
      footer: `${status.unstaged.length} modified · ${status.untracked.length} untracked`,
    },
    {
      id: "index",
      title: "Staging area",
      Icon: Layers,
      caption: "Snapshot selected for the next commit",
      files: status.staged,
      footer: `${status.staged.length} staged changes`,
    },
    {
      id: "local",
      title: "Local repository",
      Icon: Database,
      caption: `HEAD → ${state.branch || "detached"} · ${headId(state) || "no commits"}`,
      files: Object.keys(headTree(state)),
      footer: `${state.commits.length} local objects · ${summary.ahead} ahead`,
    },
    {
      id: "remote",
      title: "Remote repository",
      Icon: Cloud,
      caption: `Simulated ${state.remoteName || "origin"} / main`,
      files: Object.keys(remoteTree),
      footer: `${state.remoteStore.commits.length} remote objects · ${summary.behind} incoming`,
    },
  ];
  const allSuggestions = [
    ...new Set([
      ...(current ? [current.command] : []),
      ...suggestions,
      ...Object.keys(commandHelp).map((c) => `git ${c}`),
    ]),
  ];
  const completions =
    input.length > 2
      ? allSuggestions
          .filter((c) => c.startsWith(input) && c !== input)
          .slice(0, 5)
      : [];
  return (
    <div
      className="workbench"
      data-panel={panel}
      style={{ "--graph-width": size + "%" }}
    >
      <section className="objective-strip">
        <div className="objective-copy">
          <span className="eyebrow">
            {scenario
              ? `Guided lab · ${done ? "Complete" : `Step ${step + 1} of ${expectations.length}`}`
              : "Playground · Browser simulation"}
          </span>
          <h1>{scenario?.title || "See what every command changes."}</h1>
          {scenario?.introduction && (
            <p className="objective-concept">
              {scenario.introduction.definition}
            </p>
          )}
          <p>
            {done
              ? "All steps verified. Try the challenge or repeat this on your computer."
              : current
                ? `${current.title} — ${current.expected}`
                : "Edit → stage → commit → share. Your local work stays local until you push."}
          </p>
        </div>
        <div className="objective-actions">
          <button className="ide-button" onClick={() => setModal("guide")}>
            <Info size={14} />
            {scenario ? "Understand this topic" : "Guide"}
          </button>
          <button className="ide-button" onClick={() => setModal("machine")}>
            <Monitor size={14} />
            On my computer
          </button>
          <button
            className="ide-button"
            onClick={reset}
            aria-label="Reset scenario"
          >
            <RotateCcw size={14} />
          </button>
          {current && (
            <button
              className="ide-button primary"
              onClick={() => {
                setInput(current.command);
                setPanel("terminal");
                inputRef.current?.focus();
              }}
            >
              Load step
              <ChevronRight size={14} />
            </button>
          )}
          {done && (
            <Link
              className="ide-button teal"
              href={`/scenarios/${nextScenarioId(scenario.id)}`}
            >
              <Check size={14} />
              Next lab
            </Link>
          )}
        </div>
        {scenario && (
          <div
            className="lab-step-progress"
            role="progressbar"
            aria-label="Verified lab steps"
            aria-valuemin={0}
            aria-valuemax={expectations.length}
            aria-valuenow={step}
          >
            <span style={{ width: `${(100 * step) / expectations.length}%` }} />
          </div>
        )}
      </section>
      <div
        className="mobile-panels"
        role="tablist"
        aria-label="Workspace panels"
      >
        {[
          ["areas", "Repository areas"],
          ["graph", "Commit graph"],
          ["terminal", "Terminal"],
        ].map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={panel === id}
            onClick={() => setPanel(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="state-grid" data-event={event} key="repository-areas">
        {areas.map(({ id, title, Icon, caption, files, footer }) => (
          <section
            key={
              id +
              ({
                add: "index",
                commit: "local",
                push: "remote",
                fetch: "local",
              }[event] === id
                ? tick
                : "")
            }
            className="repo-pane"
            aria-label={title}
          >
            <div className="panel-heading">
              <span>
                <Icon size={15} className={`state-icon-${id}`} />
                {title}
              </span>
              {id === "working" ? (
                <button
                  className="icon-button"
                  aria-label="Create file"
                  title="Create file"
                  onClick={newFile}
                >
                  <Plus size={15} />
                </button>
              ) : (
                <span className="count">{files.length}</span>
              )}
            </div>
            <div className="pane-caption">{caption}</div>
            <div className="pane-scroll">
              {files.map((f) => (
                <button
                  className="file-row"
                  key={f}
                  onClick={() => inspectFile(f, id)}
                >
                  <FileCode2 size={14} />
                  <span>{f}</span>
                  <small
                    className={
                      status.unstaged.includes(f) ? "status-modified" : ""
                    }
                  >
                    {id === "working"
                      ? state.conflicts.includes(f)
                        ? "conflict"
                        : isIgnored(state, f)
                          ? "ignored"
                          : status.untracked.includes(f)
                            ? "U"
                            : status.unstaged.includes(f)
                              ? "M"
                              : ""
                      : id === "index"
                        ? f in state.index
                          ? "staged"
                          : "deleted"
                        : ""}
                  </small>
                </button>
              ))}
              {!files.length && (
                <div className="pane-empty">
                  {id === "index"
                    ? "No staged changes. Choose a file with git add."
                    : id === "remote"
                      ? "No remote snapshot yet. Clone or push to begin."
                      : "No files in this snapshot."}
                </div>
              )}
            </div>
            <div className="pane-footer">
              <span>{footer}</span>
              {id === "remote" && (
                <button
                  className="icon-button"
                  title="Simulate teammate push"
                  aria-label="Simulate teammate push"
                  onClick={teammate}
                >
                  <Users size={13} />
                </button>
              )}
            </div>
          </section>
        ))}
      </div>
      <div className="lower-grid">
        <HistoryGraph state={state} />
        <section className="terminal-pane" aria-label="Interactive terminal">
          <div className="panel-heading">
            <span className="terminal-tabs">
              <Terminal size={15} /> Terminal <small>SIMULATED</small>
            </span>
            <div className="inline-actions">
              <small>{state.branch || "detached HEAD"}</small>
              <button
                className="icon-button"
                aria-label="Clear terminal"
                onClick={() => setLogs([])}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          <div
            className="terminal-output"
            ref={output}
            role="log"
            aria-label="Command output"
            aria-live="polite"
          >
            {logs.map((l, i) => (
              <div key={i} className={`terminal-entry ${l.kind}`}>
                {l.command && (
                  <div className="command-line">
                    <span className="prompt-symbol">❯</span>
                    {l.command}
                  </div>
                )}
                <pre>{l.output}</pre>
              </div>
            ))}
          </div>
          {completions.length > 0 && (
            <div
              className="terminal-completions"
              aria-label="Command suggestions"
            >
              {completions.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setInput(c);
                    inputRef.current?.focus();
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
          <form
            className="terminal-input-wrap"
            onSubmit={(e) => {
              e.preventDefault();
              execute();
            }}
          >
            <span className="prompt-symbol">❯</span>
            <input
              ref={inputRef}
              aria-label="Git command"
              autoComplete="off"
              spellCheck={false}
              placeholder="Type a command… Tab to complete"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  const n = Math.min(cursor + 1, history.length - 1);
                  setCursor(n);
                  setInput(history[n] || "");
                }
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  const n = Math.max(cursor - 1, -1);
                  setCursor(n);
                  setInput(history[n] || "");
                }
                if (e.key === "Tab" && completions.length) {
                  e.preventDefault();
                  setInput(completions[0]);
                }
              }}
            />
            <button type="submit" aria-label="Run command">
              <ArrowRight size={16} />
            </button>
          </form>
        </section>
      </div>
      <div className="workbench-status">
        <span>
          <GitBranch size={12} />
          {state.branch || "detached"} <span>·</span>
          {state.conflicts.length
            ? `${state.conflicts.length} conflicts`
            : status.staged.length +
                status.unstaged.length +
                status.untracked.length
              ? "Uncommitted changes"
              : "Working tree clean"}
        </span>
        <label>
          Graph width
          <input
            type="range"
            min="30"
            max="65"
            aria-label="Graph width"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          />
        </label>
        <span>
          Local-only simulation · Whole-file merge model ·{" "}
          <Link href="/learn/q02">How it works</Link>
        </span>
      </div>
      <dialog
        ref={dialog}
        className="workspace-dialog"
        aria-label={
          modal === "file"
            ? "File inspector"
            : modal === "machine"
              ? "Real-machine practice"
              : "Scenario guide"
        }
        onCancel={() => setModal(null)}
      >
        <div className="panel-heading">
          <strong>
            {modal === "file"
              ? readOnly
                ? "Inspect snapshot"
                : "Edit working file"
              : modal === "machine"
                ? "Practise on your computer"
                : scenario?.introduction?.name || "Your next step"}
          </strong>
          <button
            className="icon-button"
            aria-label="Close panel"
            onClick={() => setModal(null)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="dialog-body">
          {modal === "file" ? (
            <form onSubmit={save}>
              <label>
                Filename
                <input
                  value={filename}
                  readOnly={readOnly}
                  onChange={(e) => setFilename(e.target.value)}
                />
              </label>
              <label>
                Contents
                <textarea
                  value={content}
                  readOnly={readOnly}
                  onChange={(e) => setContent(e.target.value)}
                />
              </label>
              {fileError && <p role="alert">{fileError}</p>}
              {!readOnly && (
                <div className="inline-actions">
                  <button
                    type="button"
                    className="ide-button"
                    onClick={() => {
                      setState((s) => {
                        const next = clone(s);
                        delete next.working[filename];
                        return next;
                      });
                      setModal(null);
                    }}
                  >
                    Delete working file
                  </button>
                  <button className="ide-button primary" type="submit">
                    Save working file
                  </button>
                </div>
              )}
            </form>
          ) : modal === "machine" ? (
            <MachineLab scenario={scenario} />
          ) : (
            <>
              <ConceptExplainer scenario={scenario} />
              <span className="eyebrow">
                {done
                  ? "Verified completion"
                  : `Learn → Visualize → Execute → Inspect`}
              </span>
              <h3>
                {current?.title || scenario?.title || "Experiment safely"}
              </h3>
              <p>
                {current?.why ||
                  scenario?.context ||
                  "The terminal changes an in-memory repository. File edits, staging, commits and remote transfers are separate operations. Select a file or graph node to inspect its actual snapshot."}
              </p>
              {current && (
                <>
                  <pre>{current.command}</pre>
                  <p>
                    <strong>Expected:</strong> {current.expected}
                  </p>
                  <button
                    className="ide-button primary"
                    onClick={() => {
                      setInput(current.command);
                      setModal(null);
                      setPanel("terminal");
                    }}
                  >
                    Load into terminal
                  </button>
                </>
              )}
              <h3>Common mistakes & recovery</h3>
              <p>
                {scenario?.commonMistakes ||
                  "Staging saves a copy at that moment. Later edits do not automatically update the index. Commit and push are separate operations."}
              </p>
              <p>
                {scenario?.recovery ||
                  "Reset reloads the practice state without changing your learning progress. Unknown operations are rejected with an explanation."}
              </p>
              {scenario && (
                <>
                  <h3>Verify & challenge</h3>
                  <pre>{scenario.verify}</pre>
                  <p>{scenario.challenge}</p>
                  <h3>Related lessons</h3>
                  <div className="inline-actions">
                    {scenario.lessonIds.map((id) => (
                      <Link
                        className="ide-button"
                        key={id}
                        href={`/learn/${id}`}
                      >
                        {id.toUpperCase()}
                      </Link>
                    ))}
                  </div>
                </>
              )}
              <h3>Simulator boundaries</h3>
              <p>
                Whole-file merge conflicts, clean linear rebase, one
                configurable remote, lightweight tags. Interactive rebase,
                conflict continuation for rebase/cherry-pick, advanced tools,
                hosting reviews and real authentication belong to the evidence
                labs and machine practice. Teaching IDs are deterministic, not
                real Git object hashes.
              </p>
            </>
          )}
        </div>
      </dialog>
    </div>
  );
}
