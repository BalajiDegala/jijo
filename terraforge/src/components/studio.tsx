"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowRight,
  Box,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Cloud,
  Code2,
  Command,
  ExternalLink,
  FileCode2,
  FolderOpen,
  GitBranch,
  Grid2X2,
  Layers3,
  LayoutTemplate,
  LoaderCircle,
  Maximize,
  Moon,
  Network,
  PanelLeftOpen,
  Plus,
  Redo2,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Sun,
  Terminal,
  Undo2,
  X,
  AlertTriangle,
  BookOpen,
  Activity,
  Bug,
  Brain,
  Target,
  MousePointer2,
  Copy,
} from "lucide-react";
import { useStudio, saveProject, Mode, View } from "@/lib/store";
import { readProjectFile } from "@/lib/project-file";
import { Project, address, uid } from "@/lib/model";
import { createTemplate, templates } from "@/lib/templates";
import { registry } from "@/lib/registry";
import { validate } from "@/lib/validation";
import { generate } from "@/lib/hcl";
import { importHCL } from "@/lib/import";
import { Logo, ResourceIcon } from "./icons";
import { Button, Modal, Tip } from "./ui";
import { CodePanel, download } from "./code-panel";
import { InfrastructureCanvas, Inventory } from "./canvas";
import { Library } from "./library";
import { Inspector } from "./inspector";
import { LearningPanel } from "./learning";
const modes: Mode[] = [
  "Build",
  "Explain",
  "Reverse",
  "Debug",
  "Challenge",
  "Memory",
];
const modeIcons = {
  Build: MousePointer2,
  Explain: BookOpen,
  Reverse: Code2,
  Debug: Bug,
  Challenge: Target,
  Memory: Brain,
};
const regions = [
  ["us-east-1", "N. Virginia"],
  ["us-east-2", "Ohio"],
  ["us-west-2", "Oregon"],
  ["eu-west-1", "Ireland"],
  ["eu-central-1", "Frankfurt"],
  ["ap-south-1", "Mumbai"],
  ["ap-southeast-1", "Singapore"],
  ["ap-northeast-1", "Tokyo"],
];
export default function Studio() {
  const {
    project,
    selected,
    view,
    mode,
    past,
    future,
    saveState,
    notice,
    hydrated,
    hydrate,
    change,
    replace,
    setView,
    setMode,
    select,
    undo,
    redo,
    notify,
    setSaved,
  } = useStudio();
  const [dialog, setDialog] = useState<string | null>(null);
  const [codeOpen, setCodeOpen] = useState(true);
  const [codeWidth, setCodeWidth] = useState(320);
  const [rightWidth, setRightWidth] = useState(292);
  const [theme, setTheme] = useState("dark");
  const [command, setCommand] = useState("");
  const [modeOpen, setModeOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [validationRan, setValidationRan] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const issues = useMemo(() => validate(project), [project]);
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  const resourceCount = project.resources.filter(
    (r) => r.kind === "resource",
  ).length;
  const instanceCount = project.resources
    .filter((r) => r.type === "aws_instance")
    .reduce(
      (n, r) =>
        n +
        (r.scale?.mode === "count"
          ? r.scale.count
          : r.scale?.mode === "for_each"
            ? r.scale.keys.length
            : 1),
      0,
    );
  useEffect(() => {
    hydrate();
    const stored = localStorage.getItem("terraforge-theme");
    if (stored) setTheme(stored);
  }, [hydrate]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("terraforge-theme", theme);
  }, [theme]);
  useEffect(() => {
    if (!hydrated) return;
    const timer = setTimeout(() => {
      saveProject(project)
        .then(() => setSaved("Saved locally"))
        .catch(() => setSaved("Save failed"));
    }, 650);
    return () => clearTimeout(timer);
  }, [project, hydrated, setSaved]);
  useEffect(() => {
    if (!hydrated) return;
    setToast(notice);
    const t = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(t);
  }, [notice, hydrated]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isInput = (e.target as HTMLElement).closest(
        "input,textarea,select,[contenteditable=true]",
      );
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setDialog((d) => (d === "command" ? null : "command"));
        setCommand("");
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveProject(useStudio.getState().project)
          .then(() => notify("Project saved to this browser."))
          .catch(() =>
            notify(
              "Local storage unavailable. Export your project to keep a copy.",
            ),
          );
      }
      if (isInput) return;
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      }
      if (e.key === "a" && !e.ctrlKey && !e.metaKey) {
        select(null);
      }
      if (e.key === "?") setDialog("help");
      if (e.key === "Escape") {
        setModeOpen(false);
        setProjectOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo, notify, select]);
  const resize = (side: "left" | "right", event: React.PointerEvent) => {
    event.preventDefault();
    const start = event.clientX,
      initial = side === "left" ? codeWidth : rightWidth;
    const move = (e: PointerEvent) => {
      const value = initial + (e.clientX - start) * (side === "left" ? 1 : -1);
      side === "left"
        ? setCodeWidth(Math.max(250, Math.min(600, value)))
        : setRightWidth(Math.max(260, Math.min(480, value)));
    };
    const up = () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      document.body.style.cursor = "";
    };
    document.body.style.cursor = "col-resize";
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
  };
  const exportZip = async () => {
    setBusy(true);
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      Object.entries(generate(project)).forEach(([name, content]) =>
        zip.file(name, content),
      );
      zip.file("terraforge.project.json", JSON.stringify(project, null, 2));
      zip.file(
        ".gitignore",
        ".terraform/\n*.tfstate\n*.tfstate.*\n*.tfvars\n*.pem\ncrash.log\n",
      );
      zip.file(
        "README.md",
        `# ${project.name}\n\nGenerated with TerraForge. Review all configuration before running Terraform.\n\n1. Install Terraform >= 1.5 and configure AWS credentials locally.\n2. Review the region, AMI, trusted SSH CIDR, cost, and resource names.\n3. Copy terraform.tfvars.example to terraform.tfvars and provide required inputs.\n4. Run terraform init, terraform fmt, terraform validate, and terraform plan.\n5. Apply only after reviewing the plan.\n\nThe studio does not provision AWS resources. Its checks are not provider-backed validation.\nExisting VPC routing, AMI availability, quotas, NACLs, and account permissions require AWS verification.\nNever commit private keys, credentials, or Terraform state. Generated TLS keys live in state.\n\nStudio findings:\n${issues.map((i) => "- " + i.severity + ": " + i.message).join("\n") || "- No model issues found."}\n`,
      );
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = project.name.replace(/[^\w-]/g, "-") + ".zip";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setDialog(null);
      notify(
        "Terraform project exported. Run terraform init and validate locally before planning.",
      );
    } catch (e) {
      notify("Export failed: " + (e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const importSource = async () => {
    setBusy(true);
    setImportError("");
    try {
      if (importText.trim().startsWith("{")) {
        const p = readProjectFile(importText);
        replace(p);
      } else {
        const result = await importHCL(importText, project);
        replace(result.project, result.warnings.join(" "));
      }
      setDialog(null);
      setImportText("");
    } catch (e) {
      setImportError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const newTemplate = (id: string) => {
    const p = createTemplate(id);
    p.id = uid();
    replace(
      p,
      id === "empty"
        ? "A fresh canvas. Start with a provider and VPC."
        : "Template loaded. Select a resource to explore its Terraform.",
    );
    setDialog(null);
    setView("topology");
  };
  const validateNow = () => {
    setValidationRan(true);
    setDialog("validation");
  };
  const ModeIcon = modeIcons[mode];
  const commandItems = [
    ...registry.map((s) => ({
      id: s.type,
      label: `Add ${s.label}`,
      description: s.type,
      icon: <ResourceIcon type={s.type} size={16} />,
      run: () => useStudio.getState().add(s.type),
    })),
    {
      id: "templates",
      label: "Explore project templates",
      description: "10 real architectures",
      icon: <LayoutTemplate size={16} />,
      run: () => setDialog("templates"),
    },
    {
      id: "validate",
      label: "Validate configuration",
      description: "Check references and network rules",
      icon: <ShieldCheck size={16} />,
      run: validateNow,
    },
    {
      id: "new",
      label: "New empty project",
      description: "Start building",
      icon: <Plus size={16} />,
      run: () => newTemplate("empty"),
    },
    ...project.resources.map((r) => ({
      id: r.id,
      label: `Go to ${r.name}`,
      description: address(r),
      icon: <ResourceIcon type={r.type} size={16} />,
      run: () => select(r.id),
    })),
  ].filter((x) =>
    (x.label + " " + x.description)
      .toLowerCase()
      .includes(command.toLowerCase()),
  );
  return (
    <div className="studio">
      <header className="topbar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setDialog("about");
          }}
        >
          <Logo />
          <span>
            Terra<span>Forge</span>
          </span>
          <b>STUDIO</b>
        </a>
        <div className="top-separator" />
        <div className="project-switcher">
          <button
            className="project-button"
            onClick={() => setProjectOpen(!projectOpen)}
          >
            <FolderOpen size={14} />
            {project.name}
            <ChevronDown size={12} />
          </button>
          {projectOpen && (
            <div className="dropdown project-menu">
              <button
                onClick={() => {
                  setProjectOpen(false);
                  setDialog("templates");
                }}
              >
                <LayoutTemplate size={14} />
                Project templates
              </button>
              <button
                onClick={() => {
                  setProjectOpen(false);
                  newTemplate("empty");
                }}
              >
                <Plus size={14} />
                New project
              </button>
              <button
                onClick={() => {
                  setProjectOpen(false);
                  setDialog("import");
                }}
              >
                <FolderOpen size={14} />
                Open / import project
              </button>
              <button
                onClick={() =>
                  download(
                    project.name + ".terraforge.json",
                    JSON.stringify(project, null, 2),
                    "application/json",
                  )
                }
              >
                <Save size={14} />
                Download project backup
              </button>
            </div>
          )}
        </div>
        <span
          className={`save-state ${saveState === "Save failed" ? "error" : ""}`}
        >
          <span className="status-dot" />
          {saveState}
        </span>
        <div className="topbar-spacer" />
        <button
          className="command-trigger"
          onClick={() => {
            setDialog("command");
            setCommand("");
          }}
        >
          <Search size={14} />
          <span>Search anything</span>
          <kbd>Ctrl K</kbd>
        </button>
        <Tip label="Undo (Ctrl+Z)">
          <Button
            size="icon"
            variant="ghost"
            aria-label="Undo"
            disabled={!past.length}
            onClick={undo}
          >
            <Undo2 size={16} />
          </Button>
        </Tip>
        <Tip label="Redo (Ctrl+Shift+Z)">
          <Button
            size="icon"
            variant="ghost"
            aria-label="Redo"
            disabled={!future.length}
            onClick={redo}
          >
            <Redo2 size={16} />
          </Button>
        </Tip>
        <div className="top-separator" />
        <Button size="sm" className="validate-button" onClick={validateNow}>
          <ShieldCheck size={14} />
          <span>Validate</span>
          {errorCount > 0 && <b>{errorCount}</b>}
        </Button>
        <Button size="sm" variant="default" onClick={() => setDialog("export")}>
          <ArrowDownToLine size={14} />
          Export <ChevronDown size={11} />
        </Button>
        <Tip label="Project settings">
          <Button
            size="icon"
            variant="ghost"
            aria-label="Project settings"
            onClick={() => setDialog("settings")}
          >
            <Settings2 size={17} />
          </Button>
        </Tip>
        <button
          className="avatar"
          onClick={() => setDialog("about")}
          aria-label="About this workspace"
        >
          TF
        </button>
      </header>
      <div className="workspace">
        <nav className="activity-rail" aria-label="Workspace navigation">
          <div>
            <Tip label="Infrastructure canvas">
              <button
                className={view !== "inventory" ? "active" : ""}
                aria-label="Infrastructure canvas"
                onClick={() => setView("topology")}
              >
                <Layers3 size={20} />
              </button>
            </Tip>
            <Tip label="Resource inventory">
              <button
                className={view === "inventory" ? "active" : ""}
                aria-label="Resource inventory"
                onClick={() => setView("inventory")}
              >
                <Box size={20} />
              </button>
            </Tip>
            <Tip label="Project templates">
              <button
                aria-label="Project templates"
                onClick={() => setDialog("templates")}
              >
                <LayoutTemplate size={20} />
              </button>
            </Tip>
            <Tip label="Learning modes">
              <button
                aria-label="Learning modes"
                onClick={() => setModeOpen(!modeOpen)}
              >
                <BookOpen size={20} />
                <i />
              </button>
            </Tip>
            <Tip label="Import Terraform">
              <button
                aria-label="Import Terraform"
                onClick={() => setDialog("import")}
              >
                <ArrowUpFromLine size={19} />
              </button>
            </Tip>
          </div>
          <div>
            <Tip label="Toggle theme">
              <button
                aria-label="Toggle theme"
                onClick={() =>
                  setTheme((t) => (t === "dark" ? "light" : "dark"))
                }
              >
                {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
              </button>
            </Tip>
            <Tip label="Help and shortcuts">
              <button
                aria-label="Help and shortcuts"
                onClick={() => setDialog("help")}
              >
                <CircleHelp size={20} />
              </button>
            </Tip>
          </div>
        </nav>
        <main className="workbench">
          <div className="workbench-toolbar">
            <div className="breadcrumbs">
              <span className="aws-wordmark">aws</span>
              <ChevronRight size={11} />
              <span>My workspace</span>
              <ChevronRight size={11} />
              <strong>
                {selected
                  ? project.resources.find((r) => r.id === selected)?.name
                  : "Infrastructure"}
              </strong>
            </div>
            <div className="environment">
              <span className="env-dot" />
              Development
              <span className="toolbar-divider" />
              <Cloud size={13} />
              <select
                aria-label="AWS region"
                value={project.region}
                onChange={(e) =>
                  change((p) => {
                    const old = p.region;
                    p.region = e.target.value;
                    p.resources.forEach((r) => {
                      if (
                        typeof r.args.availability_zone === "string" &&
                        r.args.availability_zone.startsWith(old)
                      )
                        r.args.availability_zone =
                          p.region + r.args.availability_zone.slice(old.length);
                    });
                  }, "AWS region updated. Availability zones now follow the selected region.")
                }
              >
                {regions.map(([id]) => (
                  <option key={id}>{id}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="studio-panels">
            {codeOpen && (
              <div className="code-column" style={{ width: codeWidth }}>
                <CodePanel onCollapse={() => setCodeOpen(false)} />
              </div>
            )}
            {codeOpen && (
              <div
                className="panel-resize"
                role="separator"
                aria-label="Resize code panel"
                aria-orientation="vertical"
                tabIndex={0}
                onPointerDown={(e) => resize("left", e)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight")
                    setCodeWidth((w) => Math.min(w + 20, 600));
                  if (e.key === "ArrowLeft")
                    setCodeWidth((w) => Math.max(w - 20, 250));
                }}
              />
            )}
            <div className="center-column">
              <div className="canvas-tabbar">
                {!codeOpen && (
                  <Tip label="Show Terraform editor">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Show Terraform editor"
                      onClick={() => setCodeOpen(true)}
                    >
                      <PanelLeftOpen size={15} />
                    </Button>
                  </Tip>
                )}
                <div className="view-tabs">
                  {(
                    [
                      { id: "topology", label: "Topology", icon: Network },
                      {
                        id: "dependencies",
                        label: "Dependencies",
                        icon: GitBranch,
                      },
                      { id: "network", label: "Packet flow", icon: Activity },
                      { id: "inventory", label: "Inventory", icon: Grid2X2 },
                    ] as const
                  ).map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      className={view === id ? "active" : ""}
                      onClick={() => setView(id)}
                    >
                      <Icon size={13} />
                      {label}
                    </button>
                  ))}
                </div>
                <div className="mode-picker">
                  <button
                    className="mode-button"
                    onClick={() => setModeOpen(!modeOpen)}
                  >
                    <ModeIcon size={13} />
                    {mode} mode
                    <ChevronDown size={10} />
                  </button>
                  {modeOpen && (
                    <div className="dropdown mode-menu">
                      {modes.map((m) => {
                        const Icon = modeIcons[m];
                        return (
                          <button
                            key={m}
                            className={mode === m ? "active" : ""}
                            onClick={() => {
                              setMode(m);
                              setModeOpen(false);
                            }}
                          >
                            <Icon size={15} />
                            <span>{m} mode</span>
                            {mode === m && <Check size={12} />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              {view === "inventory" ? (
                <Inventory />
              ) : (
                <InfrastructureCanvas onAdd={() => select(null)} />
              )}
              <LearningPanel />
            </div>
            <div
              className="panel-resize"
              role="separator"
              aria-label="Resize inspector"
              aria-orientation="vertical"
              tabIndex={0}
              onPointerDown={(e) => resize("right", e)}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft")
                  setRightWidth((w) => Math.min(w + 20, 480));
                if (e.key === "ArrowRight")
                  setRightWidth((w) => Math.max(w - 20, 260));
              }}
            />
            <div className="right-column" style={{ width: rightWidth }}>
              {selected && project.resources.some((r) => r.id === selected) ? (
                <Inspector />
              ) : (
                <Library
                  onTemplates={() => setDialog("templates")}
                  onSettings={() => setDialog("settings")}
                />
              )}
            </div>
          </div>
        </main>
      </div>
      <footer className="statusbar">
        <span className="status-brand">
          <Logo />
          TerraForge
        </span>
        <span className="branch">
          <GitBranch size={11} />
          local workspace
        </span>
        <button onClick={validateNow}>
          {errorCount ? (
            <AlertTriangle size={12} />
          ) : (
            <CheckCircle2 size={12} />
          )}
          <b>{errorCount}</b> errors
          <span className="warning-count">{warningCount} warnings</span>
        </button>
        <div />
        <span>
          <Box size={11} />
          {resourceCount} resources
        </span>
        <span>
          {instanceCount} EC2 instance{instanceCount !== 1 ? "s" : ""}
        </span>
        <span className="local-only">
          <span className="status-dot" />
          Local only · No AWS connection
        </span>
        <button onClick={() => setDialog("help")}>
          <Command size={11} />
          Shortcuts
        </button>
      </footer>
      <AnimatePresence>
        {toast && hydrated && (
          <motion.div
            className="toast"
            role="status"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
          >
            <CheckCircle2 size={16} />
            <span>{toast}</span>
            <button
              onClick={() => setToast("")}
              aria-label="Dismiss notification"
            >
              <X size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <Modal
        open={dialog === "templates"}
        onClose={() => setDialog(null)}
        title="A starting point for every idea."
        description="Real architecture. Readable Terraform. Choose a template and make it yours."
        wide
      >
        <div className="templates-intro">
          <span>
            <Sparkles size={14} />
            THE TERRAFORGE COLLECTION
          </span>
          <Button size="sm" onClick={() => newTemplate("empty")}>
            <Plus size={13} />
            Blank project
          </Button>
        </div>
        <div className="template-grid">
          {templates.map((t, i) => (
            <button
              className={`template-card ${t.color}`}
              key={t.id}
              onClick={() => newTemplate(t.id)}
            >
              <div className="template-art">
                <span className="template-node">
                  <Cloud size={20} />
                </span>
                <i />
                <span className="template-node">
                  <Layers3 size={20} />
                </span>
                <i />
                <span className="template-node">
                  <Box size={20} />
                </span>
                <b>{String(i + 1).padStart(2, "0")}</b>
              </div>
              <div className="template-card-body">
                <small>
                  {t.level}
                  <span>{t.label}</span>
                </small>
                <h3>{t.name}</h3>
                <p>{t.description}</p>
                <span className="template-action">
                  Open architecture
                  <ArrowRight size={14} />
                </span>
              </div>
            </button>
          ))}
        </div>
      </Modal>
      <Modal
        open={dialog === "settings"}
        onClose={() => setDialog(null)}
        title="Project settings"
        description="Your workspace, configured your way."
      >
        <div className="dialog-body settings-form">
          <label>
            Project name
            <input
              value={project.name}
              onChange={(e) =>
                change((p) => {
                  p.name = e.target.value;
                })
              }
            />
          </label>
          <label>
            Cloud provider
            <select value="aws" onChange={() => {}}>
              <option value="aws">Amazon Web Services (AWS)</option>
            </select>
          </label>
          <label>
            AWS region
            <select
              value={project.region}
              onChange={(e) =>
                change((p) => {
                  const old = p.region;
                  p.region = e.target.value;
                  p.resources.forEach((r) => {
                    if (
                      typeof r.args.availability_zone === "string" &&
                      r.args.availability_zone.startsWith(old)
                    )
                      r.args.availability_zone =
                        p.region + r.args.availability_zone.slice(old.length);
                  });
                })
              }
            >
              {regions.map(([id, name]) => (
                <option value={id} key={id}>
                  {name} · {id}
                </option>
              ))}
            </select>
          </label>
          <label>
            AWS provider constraint
            <input
              value={project.providerVersion}
              onChange={(e) =>
                change((p) => {
                  p.providerVersion = e.target.value;
                })
              }
            />
          </label>
          <p className="muted">
            AWS credentials are configured outside TerraForge, on the machine
            where you run Terraform.
          </p>
          <div className="settings-theme">
            <span>Appearance</span>
            <Button
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            >
              {theme === "dark" ? <Moon size={14} /> : <Sun size={14} />}{" "}
              {theme === "dark" ? "Dark" : "Light"} theme
            </Button>
          </div>
          <div className="dialog-actions">
            <Button variant="default" onClick={() => setDialog(null)}>
              Done
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
        open={dialog === "validation"}
        onClose={() => setDialog(null)}
        title={
          errorCount
            ? "Let’s connect the missing pieces."
            : "Your configuration is looking good."
        }
        description="Studio model checks · not a Terraform provider validation"
      >
        <div className="dialog-body">
          <div
            className={`validation-summary ${errorCount ? "has-errors" : ""}`}
          >
            <ShieldCheck size={28} />
            <div>
              <strong>
                {errorCount
                  ? `${errorCount} error${errorCount !== 1 ? "s" : ""} to resolve`
                  : "All model checks passed"}
              </strong>
              <span>
                {project.resources.length} blocks checked · {warningCount}{" "}
                warnings
              </span>
            </div>
          </div>
          <div className="validation-checks">
            {[
              "Resource names and required fields",
              "Resource references and dependency cycles",
              "CIDR containment and subnet overlap",
              "Security group VPC compatibility",
              "Explicit public IPv4 routes",
            ].map((t) => (
              <span key={t}>
                <Check size={12} />
                {t}
              </span>
            ))}
          </div>
          <div className="issue-list">
            {issues.map((i, n) => (
              <button
                className={`issue ${i.severity}`}
                key={n}
                onClick={() => {
                  if (i.resource) {
                    select(i.resource);
                    setDialog(null);
                  }
                }}
              >
                <AlertTriangle size={15} />
                <span>
                  <strong>
                    {i.resource
                      ? project.resources.find((r) => r.id === i.resource)?.name
                      : "Project"}
                  </strong>
                  {i.message}
                </span>
                {i.resource && <ChevronRight size={13} />}
              </button>
            ))}
          </div>
          <p className="validation-disclaimer">
            Export and run <code>terraform init</code> and{" "}
            <code>terraform validate</code> for provider-backed validation. This
            studio does not inspect your AWS account or deploy resources.
          </p>
        </div>
      </Modal>
      <Modal
        open={dialog === "export"}
        onClose={() => setDialog(null)}
        title="Your infrastructure. Ready to take with you."
        description="Export a complete Terraform project and a reopenable TerraForge model."
      >
        <div className="dialog-body">
          <div className="export-files">
            {Object.keys(generate(project)).map((f) => (
              <span key={f}>
                <FileCode2 size={15} />
                {f}
                <Check size={13} />
              </span>
            ))}
            <span>
              <Box size={15} />
              terraforge.project.json
              <Check size={13} />
            </span>
          </div>
          {errorCount > 0 ? (
            <div className="inline-error">
              Resolve {errorCount} configuration errors before exporting
              Terraform.
            </div>
          ) : (
            <div className="export-note">
              <ShieldCheck size={16} />
              <p>
                Review your AWS region, trusted CIDRs, required variables, and
                potential costs before applying.
                {warningCount > 0 &&
                  ` There are ${warningCount} warnings included in the README.`}
              </p>
            </div>
          )}
          <div className="dialog-actions">
            <Button
              onClick={() =>
                download(
                  project.name + ".terraforge.json",
                  JSON.stringify(project, null, 2),
                  "application/json",
                )
              }
            >
              Save model only
            </Button>
            <Button
              variant="default"
              disabled={busy || errorCount > 0}
              onClick={exportZip}
            >
              {busy ? (
                <LoaderCircle size={14} />
              ) : (
                <ArrowDownToLine size={14} />
              )}
              Download .zip
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
        open={dialog === "import"}
        onClose={() => setDialog(null)}
        title="Bring your infrastructure into focus."
        description="Open a TerraForge project or parse existing Terraform HCL locally."
        wide
      >
        <div className="dialog-body">
          <input
            type="file"
            accept=".tf,.json"
            multiple
            ref={fileInput}
            className="hidden"
            onChange={async (e) => {
              const files = Array.from(e.target.files ?? []);
              if (files.some((f) => f.size > 2_000_000)) {
                setImportError("Files must be smaller than 2 MB.");
                return;
              }
              setImportText(
                (await Promise.all(files.map((f) => f.text()))).join("\n"),
              );
              e.target.value = "";
            }}
          />
          <Button onClick={() => fileInput.current?.click()}>
            <FolderOpen size={14} />
            Choose .tf files or project JSON
          </Button>
          <textarea
            className="import-textarea"
            aria-label="Import Terraform or project JSON"
            spellCheck={false}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder={
              'resource "aws_vpc" "main" {\n  cidr_block = "10.0.0.0/16"\n}'
            }
          />
          <p className="muted">
            HCL is parsed using HashiCorp’s parser in WebAssembly. Supported
            constructs are normalized; unsupported blocks stop the import with a
            specific explanation. Comments and formatting are not preserved.
            Existing work remains available through Undo.
          </p>
          {importError && (
            <div className="inline-error" role="alert">
              {importError}
            </div>
          )}
          <div className="dialog-actions">
            <Button onClick={() => setDialog(null)}>Cancel</Button>
            <Button
              variant="default"
              onClick={importSource}
              disabled={busy || !importText.trim()}
            >
              {busy ? "Parsing…" : "Open in TerraForge"}
              <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
        open={dialog === "command"}
        onClose={() => setDialog(null)}
        title="Where do you want to go?"
        description="Add a resource, find a block, or run a workspace command."
      >
        <div className="command-input">
          <Search size={19} />
          <input
            aria-label="Command palette"
            placeholder="Type a command or resource…"
            autoFocus
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && commandItems[0]) {
                setDialog(null);
                commandItems[0].run();
              }
            }}
          />
          <kbd>ESC</kbd>
        </div>
        <div className="command-list">
          {commandItems.slice(0, 14).map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setDialog(null);
                item.run();
              }}
            >
              {item.icon}
              <span>
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </span>
              <ArrowRight size={13} />
            </button>
          ))}
          {!commandItems.length && (
            <p>No commands found. Try “VPC”, “template”, or a resource name.</p>
          )}
        </div>
      </Modal>
      <Modal
        open={dialog === "help"}
        onClose={() => setDialog(null)}
        title="A few shortcuts to keep you in flow."
        description="Explore, connect, and understand your infrastructure."
      >
        <div className="dialog-body">
          <div className="shortcut-list">
            {[
              ["Command palette", "Ctrl K"],
              ["Save project locally", "Ctrl S"],
              ["Undo", "Ctrl Z"],
              ["Redo", "Ctrl Shift Z"],
              ["Open resource library", "A"],
              ["Search editor", "Ctrl F"],
              ["Help", "?"],
              ["Pan canvas", "Middle drag"],
              ["Zoom canvas", "Scroll"],
            ].map(([a, b]) => (
              <div key={a}>
                <span>{a}</span>
                <kbd>{b}</kbd>
              </div>
            ))}
          </div>
          <p className="muted">
            Drag compatible resource handles to create a reference. Select any
            block to inspect its arguments. Use the dependency view to follow
            references without confusing them with network traffic.
          </p>
          <a
            className="docs-link"
            href="https://developer.hashicorp.com/terraform/language"
            target="_blank"
            rel="noreferrer"
          >
            Terraform language documentation
            <ExternalLink size={13} />
          </a>
        </div>
      </Modal>
      <Modal
        open={dialog === "about"}
        onClose={() => setDialog(null)}
        title="Build it. See it. Understand it."
        description="TerraForge — the visual Terraform engineering studio."
      >
        <div className="dialog-body about">
          <Logo />
          <p>
            A workspace for learning how infrastructure connects. Your project
            is saved in this browser using IndexedDB, and you can export a
            portable backup at any time.
          </p>
          <p>
            TerraForge generates configuration and checks its model. AWS
            deployment and provider-backed validation take place separately in
            your own environment.
          </p>
          <Button
            variant="default"
            onClick={() => {
              setDialog("templates");
            }}
          >
            Find your next architecture
            <ArrowRight size={14} />
          </Button>
        </div>
      </Modal>
    </div>
  );
}
