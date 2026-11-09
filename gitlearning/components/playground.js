"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  ArrowRight,
  Folder,
  Layers,
  Database,
  FileCode2,
  Plus,
  RotateCcw,
  Play,
  GitBranch,
  Info,
  Check,
  X,
  ChevronDown,
  Cloud,
} from "lucide-react";
import {
  emptyRepo,
  starterRepo,
  demoRepo,
  runCommand,
  statusOf,
  headId,
  headTree,
  clone,
} from "@/lib/git-engine";
import { GitGraph } from "./git-graph";
import { SectionHeading, Badge } from "./ui";
export function Sandbox({
  initialState,
  guideCommand,
  onCommand,
  onReset,
  embedded = false,
}) {
  const [state, setState] = useState(() => initialState || starterRepo()),
    [input, setInput] = useState(""),
    [logs, setLogs] = useState([
      {
        output:
          "Welcome to your Git sandbox. Try a command below, or type help.",
        kind: "welcome",
      },
    ]),
    [history, setHistory] = useState([]),
    [cursor, setCursor] = useState(-1),
    [editing, setEditing] = useState(null),
    [filename, setFilename] = useState(""),
    [content, setContent] = useState(""),
    [fileError, setFileError] = useState("");
  const terminalInput = useRef(null),
    logBox = useRef(null),
    fileDialog = useRef(null);
  const status = statusOf(state);
  useEffect(() => {
    if (logBox.current) logBox.current.scrollTop = logBox.current.scrollHeight;
  }, [logs]);
  useEffect(() => {
    if (guideCommand) {
      setInput(
        typeof guideCommand === "string" ? guideCommand : guideCommand.text,
      );
      terminalInput.current?.focus({ preventScroll: true });
    }
  }, [guideCommand]);
  useEffect(() => {
    if (editing !== null) fileDialog.current?.showModal();
    else fileDialog.current?.close();
  }, [editing]);
  function execute(e) {
    e?.preventDefault();
    if (!input.trim()) return;
    if (input.trim() === "clear") {
      setLogs([]);
      setInput("");
      return;
    }
    const result = runCommand(state, input);
    setState(result.state);
    setLogs((l) => [
      ...l.slice(-79),
      {
        command: input,
        output: result.output,
        kind: result.error ? "error" : "success",
      },
    ]);
    setHistory((h) => [input, ...h]);
    setCursor(-1);
    setInput("");
    onCommand?.(input, result);
  }
  function reset() {
    setState(clone(initialState || starterRepo()));
    setLogs([
      {
        output: "Sandbox restarted. Your learning progress is still saved.",
        kind: "welcome",
      },
    ]);
    setInput("");
    onReset?.();
  }
  function edit(file = null) {
    setEditing(file || "new");
    setFilename(file || "notes.txt");
    setContent(file ? state.working[file] : "");
    setFileError("");
  }
  function saveFile(e) {
    e.preventDefault();
    if (!/^[\w][\w./-]*$/.test(filename) || filename.includes("..")) {
      setFileError("Use a simple filename, like notes.txt or src/app.js.");
      return;
    }
    setState((s) => ({ ...s, working: { ...s.working, [filename]: content } }));
    setEditing(null);
    setLogs((l) => [
      ...l,
      {
        output: `Edited ${filename} in the working directory. Use git add ${filename} to stage it.`,
        kind: "welcome",
      },
    ]);
  }
  const suggestions = [
    "git status",
    "git add .",
    'git commit -m "Save my changes"',
    "git switch -c feature/idea",
    "git log --oneline --all",
    "git stash -u",
  ];
  const columns = [
    {
      title: "Working directory",
      subtitle: "Your edits live here",
      icon: Folder,
      files: Object.keys(state.working),
      type: "working",
      color: "blue",
    },
    {
      title: "Staging area",
      subtitle: "Selected for the next commit",
      icon: Layers,
      files: status.staged,
      type: "staged",
      color: "purple",
    },
    {
      title: "Local repository",
      subtitle: "Your last saved snapshot",
      icon: Database,
      files: Object.keys(headTree(state)),
      type: "committed",
      color: "cyan",
    },
  ];
  return (
    <div className={`sandbox ${embedded ? "embedded" : ""}`}>
      <div className="sandbox-toolbar">
        <div>
          <span className="online-dot" />
          <strong>Browser simulation</strong>
          <span className="toolbar-separator" />
          <code>
            {state.initialized ? "raga-git-practice" : "uninitialized folder"}
          </code>
        </div>
        <button className="quiet-button" onClick={reset}>
          <RotateCcw size={14} /> Restart lab
        </button>
      </div>
      <div className="repository-areas">
        {columns.map((col, i) => (
          <div key={col.type} className={`repository-area ${col.color}`}>
            <div className="area-heading">
              <col.icon size={17} />
              <strong>{col.title}</strong>
              <span>{col.files.length}</span>
            </div>
            <p>{col.subtitle}</p>
            <div className="file-list">
              <AnimatePresence mode="popLayout">
                {col.files.map((file) => (
                  <motion.button
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={file}
                    className={`file-chip ${status.conflicts.includes(file) ? "conflicted" : ""}`}
                    disabled={col.type !== "working"}
                    onClick={() => edit(file)}
                    title={
                      col.type === "working"
                        ? "Edit this file"
                        : col.type === "staged"
                          ? `Staged content: ${state.index[file] ?? "(deleted)"}`
                          : `Committed content: ${headTree(state)[file]}`
                    }
                  >
                    <FileCode2 size={14} />
                    <span>{file}</span>
                    <b>
                      {col.type === "working" ? (
                        status.conflicts.includes(file) ? (
                          "!"
                        ) : status.untracked.includes(file) ? (
                          "U"
                        ) : status.unstaged.includes(file) ? (
                          "M"
                        ) : (
                          ""
                        )
                      ) : (
                        <Check size={12} />
                      )}
                    </b>
                  </motion.button>
                ))}
              </AnimatePresence>
              {!col.files.length && (
                <div className="empty-files">
                  {col.type === "staged"
                    ? "No changes staged"
                    : col.type === "committed"
                      ? "No commits yet"
                      : "Your folder is empty"}
                </div>
              )}
            </div>
            {col.type === "working" ? (
              <button className="add-file" onClick={() => edit()}>
                <Plus size={13} />
                Create / edit a file
              </button>
            ) : (
              <code className="area-command">
                {col.type === "staged"
                  ? "git add <file>"
                  : 'git commit -m "message"'}
              </code>
            )}
          </div>
        ))}
      </div>
      <GitGraph state={state} />
      {state.conflicts.length > 0 && (
        <div className="notice warning">
          <Info size={17} />
          <span>
            Merge paused. Edit <strong>{state.conflicts.join(", ")}</strong> to
            remove conflict markers, then stage and commit the resolution.
          </span>
        </div>
      )}
      <div className="terminal-panel">
        <div className="terminal-header">
          <span>
            <Terminal size={14} /> Terminal{" "}
            <Badge color="green">SIMULATED</Badge>
          </span>
          <span>
            <GitBranch size={13} />
            {state.branch || "detached HEAD"}
          </span>
        </div>
        <div
          ref={logBox}
          className="terminal-output"
          role="log"
          aria-live="polite"
          aria-label="Simulated terminal output"
        >
          {logs.map((line, i) => (
            <div key={i} className={`terminal-entry ${line.kind}`}>
              {line.command && (
                <div className="terminal-command">
                  <span>❯</span> {line.command}
                </div>
              )}
              <pre>{line.output}</pre>
            </div>
          ))}
        </div>
        <form onSubmit={execute} className="terminal-input-row">
          <span>❯</span>
          <input
            ref={terminalInput}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label="Git command"
            autoComplete="off"
            spellCheck="false"
            placeholder='Try: echo "Hello Git" > notes.txt'
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") {
                e.preventDefault();
                const next = Math.min(cursor + 1, history.length - 1);
                setCursor(next);
                setInput(history[next] || "");
              }
              if (e.key === "ArrowDown") {
                e.preventDefault();
                const next = Math.max(cursor - 1, -1);
                setCursor(next);
                setInput(history[next] || "");
              }
            }}
          />
          <button type="submit" aria-label="Run command">
            <ArrowRight size={17} />
            <span>Run</span>
          </button>
        </form>
      </div>
      <div className="command-suggestions">
        <span>TRY A COMMAND</span>
        {suggestions.map((cmd) => (
          <button
            key={cmd}
            onClick={() => {
              setInput(cmd);
              terminalInput.current?.focus({ preventScroll: true });
            }}
          >
            <code>{cmd}</code>
          </button>
        ))}
      </div>
      <p className="simulator-note">
        <Info size={13} /> Everything runs in browser memory. No real files or
        remotes are changed. This teaching model merges whole files; real Git
        can merge separate lines. Type <code>help</code> for supported commands.
      </p>
      <dialog
        ref={fileDialog}
        className="file-dialog"
        onCancel={() => setEditing(null)}
        aria-labelledby="editor-title"
      >
        <form onSubmit={saveFile}>
          <div className="dialog-title">
            <h2 id="editor-title">
              {editing === "new" ? "Create a file" : "Edit working file"}
            </h2>
            <button
              type="button"
              className="icon-button"
              onClick={() => setEditing(null)}
              aria-label="Close file editor"
            >
              <X size={20} />
            </button>
          </div>
          <label>
            Filename
            <input
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              readOnly={editing !== "new"}
              required
            />
          </label>
          <label>
            File contents
            <textarea
              autoFocus
              rows={9}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              spellCheck="false"
            />
          </label>
          {fileError && (
            <p className="error-text" role="alert">
              {fileError}
            </p>
          )}
          <div className="dialog-footer">
            <span>This changes the working file. Stage it separately.</span>
            <button className="button primary" type="submit">
              Save file
              <Check size={16} />
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
export function Playground() {
  const [preset, setPreset] = useState("ready");
  const presets = { ready: starterRepo, empty: emptyRepo, branches: demoRepo };
  return (
    <>
      <SectionHeading
        eyebrow="YOUR SAFE SPACE TO EXPERIMENT"
        title="Make a change. See what happens."
        description="A terminal you can play with, and a Git history you can actually see."
      >
        <Badge color="green">
          <span className="online-dot" /> No setup required
        </Badge>
      </SectionHeading>
      <div className="playground-intro">
        <span>
          <Terminal size={18} /> Your sandbox, your rules.
        </span>
        <label>
          Start with{" "}
          <select
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
            aria-label="Sandbox starting state"
          >
            <option value="ready">A first commit</option>
            <option value="empty">An empty folder</option>
            <option value="branches">Two diverged branches</option>
          </select>
        </label>
      </div>
      <Sandbox key={preset} initialState={presets[preset]()} />
      <div className="tip-card">
        <SparkIcon />
        <div>
          <strong>Try this little experiment</strong>
          <p>
            Create a file, stage it, then edit it again. Run{" "}
            <code>git diff</code> and <code>git diff --staged</code>. The
            difference is the whole idea behind staging.
          </p>
        </div>
      </div>
    </>
  );
}
function SparkIcon() {
  return <span className="tip-star">✦</span>;
}
