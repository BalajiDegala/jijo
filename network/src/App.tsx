import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Cloud,
  FolderOpen,
  GitBranch,
  GraduationCap,
  HelpCircle,
  Layers3,
  Menu,
  Network,
  Plus,
  Redo2,
  RotateCcw,
  Save,
  ShieldCheck,
  Undo2,
  Upload,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useLab } from "./store";
import type { Page } from "./store";
import { deserialize, serialize } from "./engine/persistence";
import { validateTopology } from "./engine/topologyEngine";
import { awsTemplate, emptyTemplate, localTemplate } from "./data/templates";
import { NetworkCanvas } from "./components/NetworkCanvas";
import { Inspector } from "./components/Inspector";
import { CidrPlayground } from "./components/CidrPlayground";
import { Console } from "./components/Console";
import { JourneyTimeline } from "./components/JourneyTimeline";
import { ChallengeBanner, ChallengeGallery } from "./components/Challenges";
import { GuidedBuild, LabTools } from "./components/LabTools";
import { VisualPanel } from "./components/VisualPanel";
import { PacketControls } from "./components/PacketControls";
import {
  GlossaryDialog,
  LearningToolbar,
  PageGuide,
} from "./components/LearningUI";
import { LearningHub, LessonGuide, WelcomeLesson } from "./components/Lessons";
import { useLearning } from "./learningStore";
import { threeTierTemplate } from "./data/threeTier";
import { ComponentLibrary } from "./components/ComponentLibrary";
import { AwsInspector } from "./components/AwsInspector";
import {
  AwsBuilderEntry,
  AwsBuilderToolbar,
  AwsLearningPanel,
} from "./components/AwsLearning";
import { newAwsLearningTopology } from "./engine/awsBuilder";
import { awsConfigurationIssues } from "./engine/awsValidation";

const navigation = [
  { id: "fundamentals", label: "Networking fundamentals", icon: BookOpen },
  { id: "cidr", label: "IP & CIDR playground", icon: Layers3 },
  { id: "local", label: "Local network builder", icon: Network },
  { id: "aws", label: "AWS VPC builder", icon: Cloud },
  { id: "routing", label: "Routing laboratory", icon: GitBranch },
  { id: "security", label: "Security groups & NACLs", icon: ShieldCheck },
  { id: "nat", label: "NAT gateway laboratory", icon: Activity },
  {
    id: "challenges",
    label: "Troubleshooting challenges",
    icon: GraduationCap,
  },
] as const;
export default function App() {
  const lab = useLab();
  const { topology, page, toast } = lab;
  const architecture = topology.diagram === "three-tier";
  const [templates, setTemplates] = useState(false),
    [help, setHelp] = useState(false),
    [sidebar, setSidebar] = useState(() => window.innerWidth >= 1180);
  const fileInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (page === "aws" && topology.builder) {
      window.history.replaceState(null, "", "#aws-learning");
    } else if (page === "aws" && architecture) {
      window.history.replaceState(null, "", "#aws-architecture");
    } else if (
      ["#aws-architecture", "#aws-learning"].includes(window.location.hash)
    ) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
  }, [page, architecture, !!topology.builder]);
  useEffect(() => {
    const followHash = () => {
      if (window.location.hash === "#aws-learning") {
        if (!useLab.getState().topology.builder)
          useLab.getState().replace(newAwsLearningTopology());
        useLab.setState({ page: "aws" });
      }
      if (window.location.hash === "#aws-architecture")
        useLab.getState().navigate("architecture");
    };
    window.addEventListener("hashchange", followHash);
    return () => window.removeEventListener("hashchange", followHash);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => useLab.setState({ toast: "" }), 4500);
    return () => clearTimeout(id);
  }, [toast]);
  useEffect(() => {
    function key(e: KeyboardEvent) {
      if (e.key === "Escape" && !document.querySelector(".is-expanded")) {
        setHelp(false);
        setTemplates(false);
        setSidebar(false);
      }
      if ((e.target as HTMLElement).matches("input,textarea,select")) return;
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) useLab.getState().redo();
        else useLab.getState().undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        useLab.getState().save();
      }
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  useEffect(() => {
    if (!help) return;
    const previous = document.activeElement as HTMLElement;
    const modal = document.querySelector<HTMLElement>(".modal");
    const buttons = modal?.querySelectorAll<HTMLButtonElement>("button");
    buttons?.[0]?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !buttons?.length) return;
      const first = buttons[0],
        last = buttons[buttons.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    modal?.addEventListener("keydown", trap);
    return () => {
      modal?.removeEventListener("keydown", trap);
      previous?.focus();
    };
  }, [help]);
  const go = (next: Page) => {
    lab.navigate(next);
    useLearning.getState().setPreferences({ welcomed: true });
    if (window.innerWidth < 1180) setSidebar(false);
  };
  const issues = topology.builder
    ? awsConfigurationIssues(topology)
    : validateTopology(topology);
  const selectedNav = navigation.find((n) => n.id === page)!;
  const exportProject = () => {
    const url = URL.createObjectURL(
      new Blob([serialize(topology)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `${topology.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.netverse.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const loadTemplate = (name: string) => {
    const t =
      name === "empty"
        ? emptyTemplate(topology.mode)
        : name === "three-tier"
          ? threeTierTemplate()
          : name === "aws"
            ? awsTemplate()
            : localTemplate(name === "routed");
    lab.replace(t);
    useLab.setState({ page: t.mode });
    setTemplates(false);
  };
  return (
    <div
      className={`app-shell ${sidebar ? "navigation-open" : "navigation-closed"}`}
    >
      <aside className={`sidebar ${sidebar ? "open" : ""}`}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            go("local");
          }}
        >
          <span className="brand-symbol">
            <Network size={23} />
          </span>
          <span>
            NetVerse<span className="brand-dot">.</span>
          </span>
          <span className="version-badge">LAB</span>
        </a>
        <div className="workspace-label">
          <span className="workspace-avatar">N</span>
          <div>
            <strong>Personal workspace</strong>
            <small>Let curiosity connect.</small>
          </div>
          <ChevronDown size={14} />
        </div>
        <div className="nav-label">YOUR LEARNING LAB</div>
        <nav>
          {navigation.map((n) => (
            <button
              key={n.id}
              className={page === n.id ? "active" : ""}
              onClick={() => go(n.id)}
            >
              <n.icon size={17} />
              <span>{n.label}</span>
              {page === n.id && <span className="active-dot" />}
            </button>
          ))}
        </nav>
        {(topology.builder || page !== "architecture") && (
          <ComponentLibrary
            onAdded={() => {
              if (["cidr", "fundamentals", "challenges"].includes(page))
                go(topology.mode);
            }}
          />
        )}
        <div className="sidebar-footer">
          <span>
            <i className="dot green" />
            Local simulation
          </span>
          <button
            aria-label="Help and limitations"
            onClick={() => setHelp(true)}
          >
            <HelpCircle size={17} />
          </button>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu"
              aria-label={sidebar ? "Close navigation" : "Open navigation"}
              aria-expanded={sidebar}
              onClick={() => setSidebar(!sidebar)}
            >
              <Menu size={20} />
            </button>
            <span>Workspace</span>
            <span className="slash">/</span>
            <strong>
              {page === "architecture" ? "AWS architecture" : topology.name}
            </strong>
            <span className="local-badge">
              {page === "architecture" ? "REFERENCE" : "LOCAL"}
            </span>
          </div>
          {page !== "architecture" && (
            <div className="top-actions">
              <button
                title="Load saved project"
                aria-label="Load saved project"
                onClick={lab.load}
              >
                <FolderOpen size={16} />
              </button>
              <button
                title="Import JSON"
                aria-label="Import JSON"
                onClick={() => fileInput.current?.click()}
              >
                <Upload size={16} />
              </button>
              <button
                title="Export JSON"
                aria-label="Export JSON"
                onClick={exportProject}
              >
                <ArrowDownToLine size={16} />
              </button>
              <button className="save-button" onClick={lab.save}>
                <Save size={14} />
                <span>Save project</span>
              </button>
              <span className="user-avatar">N</span>
            </div>
          )}
        </header>
        <LearningToolbar />
        <div className="work-area">
          <main className="main-area">
            {!architecture && !topology.builder && (
              <>
                <WelcomeLesson />
                <LessonGuide />
              </>
            )}
            {page === "cidr" ? (
              <CidrPlayground />
            ) : page === "challenges" ? (
              <ChallengeGallery />
            ) : page === "fundamentals" ? (
              <LearningHub />
            ) : (
              <>
                <section
                  className={`lab-heading ${topology.builder ? "aws-lab-heading" : ""}`}
                >
                  <div>
                    <div className="section-eyebrow">
                      <selectedNav.icon size={13} />
                      INTERACTIVE LABORATORY
                    </div>
                    <h1>{selectedNav.label}</h1>
                    <p>
                      {architecture
                        ? "Explore a three-tier web application across two zones. Select a node to inspect it, drag to arrange, and zoom into each tier."
                        : page === "local"
                          ? "Small networks. Big discoveries. Build a connection and see what happens."
                          : "Explore the route, follow the packet, and discover what makes a network work."}
                    </p>
                  </div>
                  <div className="template-dropdown">
                    <button
                      className="secondary"
                      onClick={() => setTemplates(!templates)}
                    >
                      <Layers3 size={15} />
                      Templates
                      <ChevronDown size={13} />
                    </button>
                    {templates && (
                      <div className="dropdown-menu">
                        <button onClick={() => loadTemplate("three-tier")}>
                          AWS · three-tier application · two AZs
                        </button>
                        <button onClick={() => loadTemplate("same")}>
                          Two hosts · same subnet
                        </button>
                        <button onClick={() => loadTemplate("routed")}>
                          Two networks · one router
                        </button>
                        <button onClick={() => loadTemplate("aws")}>
                          AWS · public & private subnets
                        </button>
                        <button onClick={() => loadTemplate("empty")}>
                          Start with a blank canvas
                        </button>
                      </div>
                    )}
                  </div>
                </section>
                {architecture && (
                  <div className="three-tier-shortcut">
                    <button
                      className="secondary"
                      onClick={() => loadTemplate("aws")}
                    >
                      Basic public/private lab
                    </button>
                    <button
                      className="secondary"
                      onClick={() => loadTemplate("empty")}
                    >
                      <Plus size={16} /> Build from scratch
                    </button>
                  </div>
                )}
                {page === "aws" && !topology.builder && <AwsBuilderEntry />}
                {topology.builder && <AwsBuilderToolbar />}
                {page === "aws" && !architecture && !topology.builder && (
                  <div className="three-tier-shortcut">
                    <button
                      className="secondary"
                      onClick={() => loadTemplate("three-tier")}
                    >
                      <Layers3 size={16} /> Load three-tier node graph
                    </button>
                  </div>
                )}
                <ChallengeBanner key={lab.challengeId} />
                {!architecture && !topology.builder && (
                  <>
                    <PageGuide page={page} />
                    <LabTools />
                    <GuidedBuild />
                  </>
                )}
                <VisualPanel
                  title="Network diagram"
                  className={`network-visual ${architecture ? "three-tier-visual" : ""}`}
                >
                  <div className="experiment-toolbar">
                    <div className="experiment-title">
                      <span className="experiment-icon">
                        <Network size={16} />
                      </span>
                      <div>
                        <strong>{topology.name}</strong>
                        <span>
                          {topology.mode === "local"
                            ? "Ethernet & IPv4"
                            : "Amazon VPC"}{" "}
                          experiment
                        </span>
                      </div>
                    </div>
                    <div className="history-actions">
                      <button
                        aria-label="Undo"
                        title="Undo (Ctrl+Z)"
                        disabled={!lab.past.length}
                        onClick={lab.undo}
                      >
                        <Undo2 size={16} />
                      </button>
                      <button
                        aria-label="Redo"
                        title="Redo (Ctrl+Shift+Z)"
                        disabled={!lab.future.length}
                        onClick={lab.redo}
                      >
                        <Redo2 size={16} />
                      </button>
                      <span className="divider" />
                      <button
                        aria-label="Reset topology"
                        title="Reset to the starter (undo available)"
                        onClick={() =>
                          topology.builder
                            ? lab.replace(newAwsLearningTopology())
                            : loadTemplate(
                                architecture
                                  ? "three-tier"
                                  : topology.mode === "aws"
                                    ? "aws"
                                    : "same",
                              )
                        }
                      >
                        <RotateCcw size={15} />
                      </button>
                    </div>
                  </div>
                  {!architecture && !topology.builder && <JourneyTimeline />}
                  <div className="network-layout">
                    <div className="network-main">
                      <NetworkCanvas
                        key={`${topology.mode}-${page}-${topology.diagram ?? "packet"}`}
                      />
                      <div className="network-activity">
                        {!architecture && !topology.builder && (
                          <PacketControls />
                        )}
                        {issues.length > 0 && (
                          <button
                            className="validation-banner"
                            onClick={() =>
                              useLab.setState({
                                selectedId: issues[0].resourceId,
                              })
                            }
                          >
                            {issues.length} configuration{" "}
                            {issues.length === 1 ? "issue" : "issues"} ·{" "}
                            {issues[0].message}
                          </button>
                        )}
                        {topology.builder ? (
                          <AwsLearningPanel />
                        ) : architecture ? (
                          <div className="three-tier-note">
                            <p>
                              <strong>Web → application → database.</strong>{" "}
                              Each zone contains all subnet layers. Both
                              application replicas use the primary; the standby
                              receives synchronous replication. ALB nodes with
                              the same service ID belong to one shared load
                              balancer.
                            </p>
                            <details>
                              <summary>About this graph</summary>
                              <p>
                                Edit nodes, draw logical connections,
                                save/export the topology, and undo changes. The
                                graph shows the architecture; load balancing and
                                RDS failover are not packet simulations. Use
                                Templates → AWS · public &amp; private subnets
                                for routing experiments.
                              </p>
                              <p>
                                Public routes use the internet gateway. Private
                                compute uses its own zone’s NAT. Database
                                subnets have local routes only. Auto Scaling
                                groups manage replicas across both zones.
                              </p>
                            </details>
                          </div>
                        ) : (
                          <Console />
                        )}
                      </div>
                    </div>
                    {topology.builder
                      ? (lab.selectedId || lab.selectedLinkId) && (
                          <AwsInspector />
                        )
                      : lab.selectedId && <Inspector />}
                  </div>
                </VisualPanel>
              </>
            )}
          </main>
        </div>
        <footer className="statusbar">
          <span>
            <i className="dot green" />
            All systems curious.
          </span>
          <span>Build networks. Break networks. Understand networks.</span>
          <button onClick={() => setHelp(true)}>
            Simulation notes <HelpCircle size={12} />
          </button>
        </footer>
      </div>
      <GlossaryDialog />
      <input
        ref={fileInput}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          try {
            const t = deserialize(await file.text());
            lab.replace(t);
            useLab.setState({ page: t.mode, toast: "Topology imported." });
          } catch (err) {
            useLab.setState({
              toast: `Import failed: ${(err as Error).message}`,
            });
          }
          e.target.value = "";
        }}
      />
      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            role="status"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Check size={16} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
      {help && (
        <div className="modal-backdrop" onClick={() => setHelp(false)}>
          <section
            className="modal panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              aria-label="Close help"
              onClick={() => setHelp(false)}
            >
              <X size={20} />
            </button>
            <span className="section-eyebrow">ABOUT THIS LAB</span>
            <h2 id="help-title">How to use your learning lab</h2>
            <p>
              Start with Networking fundamentals for guided examples. Each
              lesson explains the idea, gives you an action to try, and checks
              your understanding. Return to my experiment restores the work you
              had before starting a lesson.
            </p>
            <p>
              In a builder, select a device to edit it, use Connect nodes to add
              a connection, and choose Send packet to test communication. Read
              Packet journey one step at a time to see what happened and why.
            </p>
            <p>
              Use Fullscreen on a diagram for a larger view. Text size changes
              the interface text; the canvas zoom controls change the diagram.
              The glossary explains terms with examples.
            </p>
            <details className="explain-details">
              <summary>About the simulation and its limits</summary>
              <p>
                NetVerse is a deterministic IPv4 teaching simulator. It does not
                send real packets or create cloud resources.
              </p>
              <p>
                Ethernet links model shared broadcast domains. ARP and switch
                learning are shown as trace decisions; timing, VLANs, spanning
                tree, fragmentation, full TCP handshakes, and congestion are
                outside this MVP.
              </p>
              <p>
                TCP and UDP use a request/response exchange with a fixed client
                port of 49152. The internet is a simulated endpoint. DNS uses
                the project’s records after testing access to the simulated DNS
                service.
              </p>
              <p>
                Projects stay in your browser when you click Save. Export JSON
                to keep a portable backup. Undo and redo apply to topology
                edits.
              </p>
            </details>
            <button className="primary" onClick={() => setHelp(false)}>
              Back to the lab <ArrowRight size={15} />
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
