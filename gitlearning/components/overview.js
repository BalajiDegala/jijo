"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Play,
  Check,
  Clock,
  Terminal,
  GitBranch,
  GitMerge,
  Layers,
  FolderGit2,
  Sparkles,
  ArrowUpRight,
  BookOpen,
  Target,
  Code2,
  ChevronRight,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { useProgress } from "./providers";
import { scenarios } from "@/lib/content";
import { demoRepo, runCommand } from "@/lib/git-engine";
import { GitGraph } from "./git-graph";
import { Badge } from "./ui";
const icons = { FolderGit2, Layers, GitBranch, GitMerge };
export function ScenarioCard({ scenario, index }) {
  const { progress } = useProgress();
  const Icon = icons[scenario.icon] || Target;
  const done = progress.scenarios.includes(scenario.id);
  return (
    <Link
      href={`/scenarios/${scenario.id}`}
      className={`scenario-card accent-${scenario.color}`}
    >
      <div className="scenario-card-top">
        <span className={`card-icon ${scenario.color}`}>
          <Icon size={22} />
        </span>
        <span className="scenario-number">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <div className="card-meta">
        <Badge
          color={
            scenario.level === 1
              ? "green"
              : scenario.level === 2
                ? "purple"
                : "blue"
          }
        >
          {done ? (
            <>
              <Check size={11} /> Completed
            </>
          ) : (
            ["", "Beginner", "Intermediate", "Intermediate", "Advanced"][
              scenario.level
            ]
          )}
        </Badge>
        <span>
          <Clock size={12} />
          {scenario.minutes} min
        </span>
      </div>
      <h3>{scenario.title}</h3>
      <p>{scenario.subtitle}</p>
      <div className="card-bottom">
        <div>
          {scenario.tags.slice(0, 3).map((tag) => (
            <code key={tag}>{tag}</code>
          ))}
        </div>
        <ArrowUpRight size={19} />
      </div>
    </Link>
  );
}
export function Overview() {
  const { progress } = useProgress();
  const [repo, setRepo] = useState(demoRepo),
    [merged, setMerged] = useState(false);
  const resume =
    scenarios.find(
      (s) =>
        s.id === progress.lastScenario && !progress.scenarios.includes(s.id),
    ) ||
    scenarios.find((s) => !progress.scenarios.includes(s.id)) ||
    scenarios[0];
  const demonstrated = () => {
    if (merged) {
      setRepo(demoRepo());
      setMerged(false);
    } else {
      setRepo(runCommand(repo, "git merge feature/login").state);
      setMerged(true);
    }
  };
  return (
    <>
      <div className="welcome-row">
        <span>
          <span className="online-dot" /> LESS READING. MORE AHA MOMENTS.
        </span>
        <span className="version-pill">
          YOUR HANDS-ON GIT LAB <span>v1.0</span>
        </span>
      </div>
      <section className="hero">
        <div className="hero-copy">
          <div className="hero-eyebrow">
            <span className="small-spark">
              <Sparkles size={13} />
            </span>{" "}
            A better way to learn version control
          </div>
          <h1>
            Git, finally
            <br />
            <span>clicks.</span>
            <span className="hero-cursor">_</span>
          </h1>
          <p>
            Watch your changes come to life. Make a mess.
            <br className="desktop-break" /> Fix it. Learn Git by actually doing
            it.
          </p>
          <div className="hero-buttons">
            <Link className="button primary" href={`/scenarios/${resume.id}`}>
              {progress.lastScenario
                ? "Continue learning"
                : "Start learning Git"}
              <ArrowRight size={17} />
            </Link>
            <Link className="button secondary" href="/playground">
              <Terminal size={16} />
              Open playground
            </Link>
          </div>
          <div className="hero-promises">
            <span>
              <Check size={13} />
              No setup needed
            </span>
            <span>
              <Check size={13} />
              Learn at your pace
            </span>
            <span>
              <Check size={13} />
              Mistakes welcome
            </span>
          </div>
        </div>
        <div className="hero-demo">
          <div className="demo-window">
            <div className="window-title">
              <div className="window-dots">
                <i />
                <i />
                <i />
              </div>
              <span>your-next-aha-moment.git</span>
              <span className="live-label">LIVE DEMO</span>
            </div>
            <GitGraph state={repo} compact />
            <div className="demo-terminal">
              <div>
                <span className="terminal-dollar">$</span>
                <code>
                  {merged
                    ? "# both histories, together"
                    : "git merge feature/login"}
                </code>
              </div>
              <button
                onClick={demonstrated}
                aria-label={merged ? "Reset merge demo" : "Run merge demo"}
              >
                {merged ? (
                  <RotateIcon />
                ) : (
                  <Play size={14} fill="currentColor" />
                )}
              </button>
            </div>
          </div>
          <div className="demo-note">
            <span className="note-spark">✦</span>
            <div>
              <strong>
                {merged
                  ? "Two paths. One shared history."
                  : "Don’t just read the command."}
              </strong>
              <span>
                {merged
                  ? "That new node is a merge commit. It has two parents."
                  : "Hit play. Watch the branches come together."}
              </span>
            </div>
          </div>
          <div className="floating-code">
            {merged ? "2 parents → 1 merge" : "HEAD → main"}
          </div>
        </div>
      </section>
      <div className="stat-strip">
        <div>
          <span className="stat-icon purple">
            <BookOpen size={18} />
          </span>
          <strong>12</strong>
          <span>concepts, made simple</span>
        </div>
        <div>
          <span className="stat-icon blue">
            <Target size={18} />
          </span>
          <strong>16</strong>
          <span>real-world scenarios</span>
        </div>
        <div>
          <span className="stat-icon cyan">
            <Terminal size={18} />
          </span>
          <strong>1</strong>
          <span>safe place to experiment</span>
        </div>
        <div>
          <span className="stat-icon amber">
            <Zap size={18} />
          </span>
          <strong>100%</strong>
          <span>learning by doing</span>
        </div>
      </div>
      <section className="learning-section">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">A LITTLE PROGRESS, EVERY DAY</span>
            <h2>Your path to Git confidence</h2>
            <p>Start small. Connect the dots. Build real skills.</p>
          </div>
          <Link className="text-link" href="/scenarios">
            Explore the full path <ArrowRight size={15} />
          </Link>
        </div>
        <div className="learning-path">
          {[
            {
              title: "Get the basics",
              desc: "Files, staging & your first commit",
              icon: Layers,
              href: "/fundamentals",
            },
            {
              title: "Branch out",
              desc: "Branches, merges & conflicts",
              icon: GitBranch,
              href: "/branches",
            },
            {
              title: "Work together",
              desc: "Remotes, pull requests & teams",
              icon: GitMerge,
              href: "/collaboration",
            },
            {
              title: "Own your workflow",
              desc: "Recovery, releases & real problems",
              icon: Zap,
              href: "/scenarios?level=4",
            },
          ].map((item, i) => (
            <Link
              key={item.title}
              href={item.href}
              className={`path-step ${i === 0 ? "current" : ""}`}
            >
              <div className="path-node">
                <item.icon size={19} />
              </div>
              <div>
                <span className="path-level">LEVEL 0{i + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
              <ChevronRight className="path-chevron" size={16} />
            </Link>
          ))}
        </div>
      </section>
      <section className="learning-section">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">
              SMALL CHALLENGES. REAL UNDERSTANDING.
            </span>
            <h2>Learn it by living it</h2>
            <p>
              The situations every developer runs into. Your turn to solve them.
            </p>
          </div>
          <Link className="text-link" href="/scenarios">
            All scenarios <ArrowRight size={15} />
          </Link>
        </div>
        <div className="scenario-grid home-scenarios">
          {[scenarios[0], scenarios[4], scenarios[5]].map((s) => (
            <ScenarioCard
              key={s.id}
              scenario={s}
              index={scenarios.indexOf(s)}
            />
          ))}
        </div>
      </section>
      <section className="bottom-banner">
        <div className="banner-icon">
          <Code2 size={28} />
        </div>
        <div>
          <span className="eyebrow">FROM “I THINK” TO “I KNOW”</span>
          <h3>Interview coming up?</h3>
          <p>
            Test your instincts with practical questions from your Git notes.
          </p>
        </div>
        <Link href="/interview" className="button secondary">
          Practice a question
          <ArrowRight size={16} />
        </Link>
        <div className="banner-decoration">{"{ }"}</div>
      </section>
    </>
  );
}
function RotateIcon() {
  return <span style={{ fontSize: 21, lineHeight: 1 }}>↺</span>;
}
