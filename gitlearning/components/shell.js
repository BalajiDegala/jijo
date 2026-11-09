"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Terminal,
  Target,
  GitBranch,
  Code2,
  Trophy,
  PanelLeftOpen,
  PanelLeftClose,
  Search,
  X,
  Menu,
  ArrowRight,
} from "lucide-react";
import source from "@/lib/curriculum/source.json";
import { practicalInventory } from "@/lib/curriculum-manifest";
import { useProgress } from "./providers";
export const nav = [
  ["/", "Learn", BookOpen],
  ["/playground", "Playground", Terminal],
  ["/scenarios", "Scenarios", Target],
  ["/branches", "Git Visual Lab", GitBranch],
  ["/interview", "Interview Practice", Code2],
  ["/progress", "Progress", Trophy],
];
export function Shell({ children }) {
  const path = usePathname(),
    { progress, storageError } = useProgress();
  const [expanded, setExpanded] = useState(false),
    [mobile, setMobile] = useState(false),
    [search, setSearch] = useState(false),
    [query, setQuery] = useState("");
  const dialog = useRef(null),
    drawer = useRef(null);
  useEffect(() => {
    try {
      setExpanded(localStorage.getItem("gitquest-rail") === "expanded");
    } catch {}
  }, []);
  useEffect(() => {
    setMobile(false);
    setSearch(false);
  }, [path]);
  useEffect(() => {
    search ? dialog.current?.showModal() : dialog.current?.close();
  }, [search]);
  useEffect(() => {
    mobile ? drawer.current?.showModal() : drawer.current?.close();
  }, [mobile]);
  useEffect(() => {
    const fn = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearch((x) => !x);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);
  const toggle = () =>
    setExpanded((x) => {
      try {
        localStorage.setItem("gitquest-rail", x ? "collapsed" : "expanded");
      } catch {}
      return !x;
    });
  const links = (full = false) =>
    nav.map(([href, label, Icon]) => (
      <Link
        key={href}
        href={href}
        aria-label={label}
        title={label}
        aria-current={
          path === href ||
          (href === "/scenarios" && path.startsWith("/scenarios/")) ||
          (href === "/" && path.startsWith("/learn"))
            ? "page"
            : undefined
        }
        className="rail-link"
      >
        <Icon size={20} />
        <span className={full ? "" : "rail-label"}>{label}</span>
        {!full && <span className="rail-tooltip">{label}</span>}
      </Link>
    ));
  const results = [
    ...source.questions.map((q) => ({
      title: `Q${q.number} · ${q.title}`,
      detail: q.answer,
      href: `/learn/${q.id}`,
    })),
    ...practicalInventory.map((s) => ({
      title: s.title,
      detail: s.id,
      href: `/scenarios/${s.id}`,
    })),
  ]
    .filter((r) =>
      (r.title + " " + r.detail).toLowerCase().includes(query.toLowerCase()),
    )
    .slice(0, 12);
  const workspace =
    path === "/playground" ||
    path === "/branches" ||
    path.startsWith("/scenarios/");
  return (
    <div className={`ide-shell ${expanded ? "rail-expanded" : ""}`}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className="ide-rail" aria-label="Navigation rail">
        <Link className="ide-logo" href="/" aria-label="raga-git">
          <GitBranch size={24} />
          <b className="rail-label">raga-git</b>
        </Link>
        <nav aria-label="Main navigation">{links()}</nav>
        <button
          className="rail-toggle"
          onClick={toggle}
          aria-label={expanded ? "Collapse navigation" : "Expand navigation"}
          aria-expanded={expanded}
        >
          {expanded ? (
            <PanelLeftClose size={20} />
          ) : (
            <PanelLeftOpen size={20} />
          )}
          <span className="rail-label">Collapse</span>
        </button>
      </aside>
      <div className="ide-main">
        <header className="ide-topbar">
          <div className="ide-breadcrumb">
            <button
              className="icon-button ide-mobile-menu"
              aria-label="Open navigation"
              onClick={() => setMobile(true)}
            >
              <Menu size={20} />
            </button>
            <strong>
              raga<span>-git</span>
            </strong>
            <span className="crumb-slash">/</span>
            <span>
              {nav.find((n) => n[0] === path)?.[1] ||
                (path.startsWith("/learn") ? "Learn" : "Scenario workspace")}
            </span>
          </div>
          <div className="ide-top-actions">
            <button
              className="ide-search"
              onClick={() => setSearch(true)}
              aria-label="Search anything Ctrl K"
            >
              <Search size={15} />
              <span>Search anything</span> <kbd aria-hidden="true">Ctrl K</kbd>
            </button>
            <Link href="/progress" className="ide-progress">
              <span className="online-dot" />
              {progress.scenarios.length} completed
            </Link>
          </div>
        </header>
        {storageError && (
          <div className="storage-notice" role="status">
            Storage is unavailable; progress lasts for this visit.
          </div>
        )}
        <main
          id="main"
          className={`ide-content ${workspace ? "workspace-route" : ""}`}
        >
          {children}
        </main>
      </div>
      <dialog
        ref={drawer}
        className="ide-drawer"
        onCancel={() => setMobile(false)}
      >
        <div className="panel-heading">
          <strong>raga-git</strong>
          <button
            className="icon-button"
            aria-label="Close navigation"
            onClick={() => setMobile(false)}
          >
            <X size={20} />
          </button>
        </div>
        <nav>{links(true)}</nav>
      </dialog>
      <dialog
        ref={dialog}
        className="search-dialog"
        onCancel={() => setSearch(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setSearch(false);
        }}
        aria-label="Search curriculum"
      >
        <div className="search-dialog-head">
          <Search size={18} />
          <input
            autoFocus
            aria-label="Search concepts commands and scenarios"
            placeholder="Try fetch, reflog, Q58…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            className="icon-button"
            aria-label="Close search"
            onClick={() => setSearch(false)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="search-results">
          {results.map((r) => (
            <Link href={r.href} key={r.href} onClick={() => setSearch(false)}>
              <strong>{r.title}</strong>
              <ArrowRight size={16} />
            </Link>
          ))}
          {!results.length && <p>No results. Try a command or topic.</p>}
        </div>
      </dialog>
    </div>
  );
}
