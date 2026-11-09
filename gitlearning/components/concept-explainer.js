"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Lightbulb, RotateCcw } from "lucide-react";

export function CherryPickPicture({ applied = false }) {
  return (
    <svg
      className="cherry-picture"
      viewBox="0 0 560 175"
      role="img"
      aria-label={
        applied
          ? "The fix is copied to a new commit on main. The original release fix stays in place."
          : "Main has unfinished work. The production branch has a focused fix."
      }
    >
      <path
        d="M80 60 H300 M80 60 Q145 60 170 132 H245"
        fill="none"
        stroke="#6e6389"
        strokeWidth="2"
      />
      <text x="28" y="27" fill="#b1bcd2">
        main · development
      </text>
      <text x="170" y="164" fill="#8cdbcf">
        production · v1.0.1
      </text>
      <circle cx="80" cy="60" r="8" fill="#9a84cb" />
      <text x="51" y="91">
        release
      </text>
      <circle cx="300" cy="60" r="8" fill="#af90fb" />
      <text x="244" y="91">
        unfinished feature
      </text>
      <circle cx="245" cy="132" r="8" fill="#5fd1bc" />
      <text x="263" y="138">
        fix H
      </text>
      {applied && (
        <g className="concept-result">
          <path d="M300 60 H470" stroke="#b899ff" strokeWidth="2" />
          <path
            d="M255 127 Q385 160 463 70"
            fill="none"
            stroke="#67d6c2"
            strokeDasharray="5 5"
            strokeWidth="2"
          />
          <circle cx="470" cy="60" r="13" fill="none" stroke="#b899ff" />
          <circle cx="470" cy="60" r="7" fill="#b899ff" />
          <text x="424" y="91">
            new fix H′
          </text>
          <text x="344" y="145" fill="#8cdbcf">
            same change, new parent
          </text>
        </g>
      )}
    </svg>
  );
}

export function ConceptExplainer({ scenario, linked = true }) {
  const [after, setAfter] = useState(false);
  const intro = scenario?.introduction;
  if (!intro) return null;
  return (
    <section
      className="concept-explainer"
      aria-label={`Understand ${intro.name}`}
    >
      <div className="concept-heading">
        <span className="eyebrow">
          <Lightbulb size={14} /> The idea behind the command
        </span>
        <code>{intro.command}</code>
      </div>
      <h2>{intro.name}</h2>
      <p>{intro.definition}</p>
      {scenario.id === "hotfix" && <CherryPickPicture applied={after} />}
      <div className="concept-comparison" aria-live="polite">
        <div>
          <span>01 · Before</span>
          <p>{intro.before}</p>
        </div>
        <ArrowRight size={19} aria-hidden="true" />
        <div className={after ? "concept-result" : "concept-hidden"}>
          <span>02 · After</span>
          <p>
            {after
              ? intro.after
              : "Pause and predict what changes. Then reveal the result."}
          </p>
        </div>
      </div>
      <button className="ide-button teal" onClick={() => setAfter((v) => !v)}>
        {after ? <RotateCcw size={14} /> : <ArrowRight size={14} />}
        {after ? "Try the prediction again" : "Reveal what changes"}
      </button>
      <p className="concept-watch">
        <strong>Watch for this</strong>
        {intro.watch}
      </p>
      <small className="source-credit">
        Concept illustration · Your simulator repository has not changed.
      </small>
      {linked && (
        <div className="concept-links">
          {["rebase", "pull-rebase", "undo-compare"].includes(scenario.id) && (
            <Link href="/branches">
              Compare both operations visually <ArrowRight size={12} />
            </Link>
          )}
          {scenario.lessonIds.map((id) => (
            <Link key={id} href={`/learn/${id}`}>
              Read lesson {id.toUpperCase()} <ArrowRight size={12} />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
