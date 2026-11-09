"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Code2,
  Copy,
  Download,
  PanelLeftClose,
  FileCode2,
  Check,
  Pencil,
  X,
  Search,
} from "lucide-react";
import { generate, fileNames, FileName } from "@/lib/hcl";
import { useStudio } from "@/lib/store";
import { importHCL } from "@/lib/import";
import { address } from "@/lib/model";
import { Button, Tip } from "./ui";
export function download(name: string, text: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function Highlight({ line }: { line: string }) {
  const tokens = line.split(
    /("(?:[^"\\]|\\.)*"|#.*$|\b(?:resource|data|provider|terraform|variable|output|locals|module|true|false|count|for_each)\b|\b\d+\b)/g,
  );
  return (
    <>
      {tokens.map((t, i) => (
        <span
          key={i}
          className={
            t.startsWith("#")
              ? "token-comment"
              : t.startsWith('"')
                ? "token-string"
                : /^(resource|data|provider|terraform|variable|output|locals|module|count|for_each)$/.test(
                      t,
                    )
                  ? "token-keyword"
                  : /^(true|false|\d+)$/.test(t)
                    ? "token-number"
                    : ""
          }
        >
          {t}
        </span>
      ))}
    </>
  );
}
export function CodePanel({ onCollapse }: { onCollapse: () => void }) {
  const { project, selected, select, revision, notify, mode } = useStudio();
  const files = useMemo(() => generate(project), [project]);
  const [active, setActive] = useState<FileName>("main.tf");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [monacoReady, setMonacoReady] = useState(false);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [flash, setFlash] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  const editor = useRef<any>(null);
  const monaco = useRef<any>(null);
  const current = useRef({ project, select });
  current.current = { project, select };
  useEffect(() => {
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 1200);
    return () => clearTimeout(t);
  }, [revision]);
  useEffect(() => {
    let cancelled = false;
    const w = window as any;
    const script = document.createElement("script");
    script.src = "/monaco/vs/loader.js";
    script.onload = () => {
      if (cancelled) return;
      w.require.config({ paths: { vs: "/monaco/vs" } });
      w.require(["vs/editor/editor.main"], () => {
        if (cancelled || !host.current) return;
        const m = w.monaco;
        monaco.current = m;
        m.languages.register({ id: "terraform" });
        m.languages.setMonarchTokensProvider("terraform", {
          tokenizer: {
            root: [
              [/#.*/, "comment"],
              [/"([^"\\]|\\.)*"/, "string"],
              [
                /\b(resource|data|provider|terraform|variable|output|locals|module|count|for_each)\b/,
                "keyword",
              ],
              [/\b(true|false|\d+)\b/, "number"],
            ],
          },
        });
        m.editor.defineTheme("terraforge", {
          base: "vs-dark",
          inherit: true,
          rules: [
            { token: "keyword", foreground: "C3A0EE" },
            { token: "string", foreground: "A5CF96" },
            { token: "comment", foreground: "58667B" },
            { token: "number", foreground: "E9B97F" },
          ],
          colors: {
            "editor.background": "#0d131e",
            "editor.foreground": "#b7c2d3",
            "editorLineNumber.foreground": "#3f4c60",
            "editor.selectionBackground": "#294439",
            "editor.lineHighlightBackground": "#121c29",
          },
        });
        editor.current = m.editor.create(host.current, {
          value: "",
          language: "terraform",
          theme: "terraforge",
          fontSize: 12,
          fontFamily: "Consolas, monospace",
          lineHeight: 23,
          minimap: { enabled: false },
          readOnly: true,
          automaticLayout: true,
          scrollBeyondLastLine: false,
          folding: true,
          wordWrap: "off",
          padding: { top: 18 },
          lineNumbersMinChars: 3,
          renderLineHighlight: "none",
          overviewRulerLanes: 0,
          contextmenu: true,
        });
        editor.current.onMouseDown((e: any) => {
          const line = e.target.position?.lineNumber;
          if (!line) return;
          const model = editor.current.getModel();
          const text = model.getValueInRange({
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: line,
            endColumn: 1000,
          });
          selectFromText(text);
        });
        setMonacoReady(true);
      });
    };
    script.onerror = () => {};
    document.head.append(script);
    return () => {
      cancelled = true;
      editor.current?.dispose();
      script.remove();
    };
  }, []);
  function selectFromText(text: string) {
    const last = text.split("\n").at(-1) ?? "";
    const referenced = current.current.project.resources.find((r) =>
      last.includes(address(r) + "."),
    );
    if (referenced) {
      current.current.select(referenced.id);
      return;
    }
    const blocks = [
      ...text.matchAll(/(?:resource|data)\s+"([^"]+)"\s+"([^"]+)"/g),
    ];
    const block = blocks.at(-1);
    if (block) {
      const r = current.current.project.resources.find(
        (r) =>
          r.type.replace(/^data\./, "") === block[1] && r.name === block[2],
      );
      if (r) current.current.select(r.id);
    }
  }
  useEffect(() => {
    if (
      editor.current &&
      !editing &&
      editor.current.getValue() !== files[active]
    ) {
      const old = editor.current.getModel();
      const next = monaco.current.editor.createModel(
        files[active],
        "terraform",
      );
      editor.current.setModel(next);
      old?.dispose();
    }
  }, [files, active, monacoReady, editing]);
  useEffect(() => {
    if (!editor.current || !selected) return;
    const r = project.resources.find((r) => r.id === selected);
    if (!r) return;
    const matches = editor.current
      .getModel()
      .findMatches(`"${r.name}"`, false, false, false, null, true);
    if (matches[0]) {
      editor.current.revealLineInCenterIfOutsideViewport(
        matches[0].range.startLineNumber,
      );
      editor.current.createDecorationsCollection([
        {
          range: matches[0].range,
          options: { isWholeLine: true, className: "generated-line" },
        },
      ]);
    }
  }, [selected, project]);
  const apply = async () => {
    setBusy(true);
    setError("");
    try {
      const combined = fileNames
        .filter((f) => f.endsWith(".tf"))
        .map((f) => (f === active ? draft : files[f]))
        .join("\n");
      const result = await importHCL(combined, project);
      useStudio
        .getState()
        .replace(
          result.project,
          "HCL parsed and normalized into the visual model.",
        );
      setEditing(false);
      notify(result.warnings.join(" "));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const hidden = mode === "Memory";
  const code = files[active];
  return (
    <aside className={`code-panel ${flash ? "code-updated" : ""}`}>
      <div className="panel-heading">
        <span>
          <Code2 size={15} />
          Terraform
        </span>
        <div>
          <Tip label="Search code (Ctrl+F)">
            <Button
              size="icon"
              variant="ghost"
              aria-label="Search code"
              onClick={() => {
                if (editor.current)
                  editor.current.getAction("actions.find").run();
                else setSearchOpen(!searchOpen);
              }}
            >
              <Search size={14} />
            </Button>
          </Tip>
          <Tip label="Collapse editor">
            <Button
              size="icon"
              variant="ghost"
              aria-label="Collapse code editor"
              onClick={onCollapse}
            >
              <PanelLeftClose size={15} />
            </Button>
          </Tip>
        </div>
      </div>
      <div className="file-tabs">
        {fileNames.map((f) => (
          <button
            key={f}
            className={active === f ? "active" : ""}
            onClick={() => {
              if (editing && draft !== files[active]) {
                setError("Apply or cancel your draft before changing files.");
                return;
              }
              setActive(f);
              setEditing(false);
            }}
          >
            <FileCode2 size={12} />
            {f}
            {f === "main.tf" && <span className="file-dot" />}
          </button>
        ))}
      </div>
      <div className="code-file-path">
        <span>
          terraform <b>/</b> {active}
        </span>
        <div>
          <Tip label="Copy file">
            <Button
              size="icon"
              variant="ghost"
              aria-label="Copy file"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(code);
                  notify(`${active} copied to clipboard.`);
                } catch {
                  notify("Clipboard unavailable. Use Download file.");
                }
              }}
            >
              <Copy size={12} />
            </Button>
          </Tip>
          <Tip label="Download file">
            <Button
              size="icon"
              variant="ghost"
              aria-label="Download file"
              onClick={() => download(active, code)}
            >
              <Download size={12} />
            </Button>
          </Tip>
        </div>
      </div>
      {searchOpen && (
        <div className="code-find">
          <Search size={13} />
          <input
            autoFocus
            aria-label="Find in code"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find in file…"
          />
          <button onClick={() => setSearchOpen(false)}>
            <X size={13} />
          </button>
        </div>
      )}
      {editing ? (
        <div className="draft-editor">
          <div className="draft-label">
            Draft · apply explicitly to update the graph
          </div>
          <textarea
            spellCheck={false}
            aria-label="Terraform draft"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          {error && (
            <div role="alert" className="inline-error">
              {error}
            </div>
          )}
          <div className="draft-actions">
            <Button
              size="sm"
              onClick={() => {
                setEditing(false);
                setError("");
              }}
            >
              Cancel
            </Button>
            <Button size="sm" variant="default" disabled={busy} onClick={apply}>
              {busy ? "Parsing…" : "Apply HCL"}
            </Button>
          </div>
        </div>
      ) : (
        <div className={`editor-content ${hidden ? "memory-blur" : ""}`}>
          <div
            ref={host}
            className="monaco-host"
            style={{ display: monacoReady ? "block" : "none" }}
          />
          {!monacoReady && (
            <div
              className="code-fallback"
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "f") {
                  e.preventDefault();
                  setSearchOpen(true);
                }
              }}
              tabIndex={0}
            >
              {code.split("\n").map((line, i) => (
                <div
                  className={`code-line ${search && line.toLowerCase().includes(search.toLowerCase()) ? "search-match" : ""} ${selected && line.includes(`"${project.resources.find((r) => r.id === selected)?.name}"`) ? "selected-line" : ""}`}
                  key={i}
                  onClick={() =>
                    selectFromText(
                      code
                        .split("\n")
                        .slice(0, i + 1)
                        .join("\n"),
                    )
                  }
                >
                  <span className="line-number">{i + 1}</span>
                  <code>
                    <Highlight line={line} />
                  </code>
                </div>
              ))}
            </div>
          )}
          {hidden && (
            <div className="memory-overlay">
              <Code2 size={24} />
              <strong>Recall before you reveal.</strong>
              <p>Write a resource block from memory in the lesson panel.</p>
            </div>
          )}
        </div>
      )}
      {!editing && (
        <div className="code-bottom">
          <span>
            <span className="status-dot" />
            Generated from your canvas
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setDraft(code);
              setEditing(true);
              setError("");
            }}
            disabled={!active.endsWith(".tf")}
          >
            <Pencil size={11} />
            Edit HCL
          </Button>
        </div>
      )}
      <div className="editor-status">
        <span>HCL</span>
        <span>UTF-8</span>
        <span>{code.split("\n").length} lines</span>
        <span className="sync-label">
          <Check size={10} />
          In sync
        </span>
      </div>
    </aside>
  );
}
