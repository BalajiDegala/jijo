"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  Search,
  Terminal,
  Clock,
  Bookmark,
  GitBranch,
  Monitor,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import source from "@/lib/curriculum/source.json";
import { scenarios } from "@/lib/scenario-engine";
import { incidents, evidenceFor } from "@/lib/incident-labs";
import { knowledgeCheck } from "@/lib/knowledge-checks";
import { topicPractice } from "@/lib/topic-practice";
import { useProgress } from "./providers";
import { MachineLab } from "./machine-lab";
import { Workspace } from "./workspace";
import { ConceptExplainer } from "./concept-explainer";
import { LearningPaths } from "./learning-paths";
const categories = [
  "All levels",
  "Junior Core Git",
  "Mid-Level Workflows and Production",
  "Senior Advanced and Scale",
  "Tricky Scenarios",
];
function LessonChapters({ question }) {
  const sections = question.answer.split(/(?=^####? )/m).filter(Boolean);
  const [chapter, setChapter] = useState(0);
  const part = sections[chapter] || sections[0],
    title = part.match(/^#+ (.+)/)?.[1] || "The concept",
    body = part.replace(/^#+ .+\n/, "");
  return (
    <div className="lesson-chapters">
      <h2>{title}</h2>
      <SourceText text={body} />
      <div className="chapter-picker" aria-label="Lesson chapters">
        {sections.map((s, i) => (
          <button
            key={i}
            className="ide-button"
            aria-pressed={chapter === i}
            onClick={() => setChapter(i)}
          >
            {i + 1}. {s.match(/^#+ (.+)/)?.[1] || "Overview"}
          </button>
        ))}
      </div>
      <p className="source-credit">
        Chapter {chapter + 1} of {sections.length}. Read each part, then open
        the visual exercise.
      </p>
    </div>
  );
}
function Inline({ text }) {
  return text
    .split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
    .map((s, i) =>
      s.startsWith("`") ? (
        <code key={i}>{s.slice(1, -1)}</code>
      ) : s.startsWith("**") ? (
        <strong key={i}>{s.slice(2, -2)}</strong>
      ) : (
        s
      ),
    );
}
export function SourceText({ text }) {
  const blocks = text.split(/\n\s*\n/);
  return (
    <div className="source-text">
      {blocks.map((b, i) =>
        b.startsWith("```") ? (
          <pre key={i}>
            {b.replace(/^```[^\n]*\n?/, "").replace(/```$/, "")}
          </pre>
        ) : b.startsWith("|") ||
          b.includes("---") ||
          /^(git |\s{4})/m.test(b) ? (
          <pre key={i}>{b}</pre>
        ) : b.startsWith("#") ? (
          <h3 key={i}>{b.replace(/^#+\s*/, "")}</h3>
        ) : (
          <p key={i}>
            <Inline text={b} />
          </p>
        ),
      )}
    </div>
  );
}
function PageIntro({ eyebrow, title, description, children }) {
  return (
    <div className="library-intro">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
function FilterBar({ query, setQuery, category, setCategory }) {
  return (
    <div className="library-filters">
      <label>
        <Search size={16} />
        <input
          aria-label="Search learning content"
          placeholder="Search topics, commands, question numbers…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <select
        aria-label="Filter level"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        {categories.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
    </div>
  );
}
const matches = (q, query, cat) =>
  (cat === categories[0] || cat === q.category) &&
  (/^q\d+$/i.test(query.trim())
    ? q.number === Number(query.trim().slice(1))
    : `${q.id} Q${q.number} ${q.title} ${q.answer}`
        .toLowerCase()
        .includes(query.toLowerCase()));
export function LearningHub() {
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState(categories[0]),
    [notes, setNotes] = useState(false);
  const { progress } = useProgress();
  return (
    <div className="library-page">
      <PageIntro
        eyebrow="Your learning path"
        title="Git clicks when you can see it."
        description="A small idea. A visible change. A command you understand."
      >
        <Link className="ide-button primary" href="/scenarios/first-commit">
          Start your first lab
          <ArrowRight size={16} />
        </Link>
      </PageIntro>
      <LearningPaths />
      <div className="learning-banner compact-learning-banner">
        <GitBranch size={30} />
        <div>
          <strong>
            Learn → Visualize → Execute → Inspect → Practise → Verify
          </strong>
          <p>
            80 source-linked lessons · 40 practical labs · 23 production
            incidents
          </p>
        </div>
        <Link href="/playground">
          Open playground <ArrowRight size={16} />
        </Link>
      </div>
      <FilterBar {...{ query, setQuery, category, setCategory }} />
      <div className="lesson-list">
        {source.questions
          .filter((q) => matches(q, query, category))
          .map((q) => (
            <Link className="lesson-row" href={`/learn/${q.id}`} key={q.id}>
              <span
                className={`lesson-number ${progress.lessons.includes(q.id) ? "is-done" : ""}`}
              >
                {progress.lessons.includes(q.id) ? (
                  <Check size={17} />
                ) : (
                  String(q.number).padStart(2, "0")
                )}
              </span>
              <div>
                <strong>{q.title}</strong>
                <span>
                  {q.category} ·{" "}
                  {q.scenarioIds.length
                    ? "Linked practical lab"
                    : "Applied source exercise"}
                  {q.correction ? " · Editorial clarification" : ""}
                </span>
              </div>
              <ArrowRight size={16} />
            </Link>
          ))}
      </div>
      <button className="ide-button" onClick={() => setNotes((x) => !x)}>
        {notes ? "Hide" : "Read"} original git-docs.md
      </button>
      {notes && (
        <article className="lesson-reading">
          <h2>Original learning notes</h2>
          <p className="editor-note">
            Preserved source: diagrams and wording are unchanged. “git add moves
            files” should read “copies snapshots”; checkout without -b switches
            an existing branch. Pull behavior depends on flags/configuration.
            See the related lessons for corrections.
          </p>
          <SourceText text={source.notes} />
        </article>
      )}
    </div>
  );
}
export function LessonDetail({ id }) {
  const q = source.questions.find((x) => x.id === id),
    { progress, setProgress } = useProgress();
  const [tab, setTab] = useState("Learn"),
    [answer, setAnswer] = useState(null);
  const check = knowledgeCheck(q.number),
    incident = incidents.find((i) => i.number === q.number),
    related = scenarios.filter((s) => q.scenarioIds.includes(s.id));
  const correct = check?.correct || incident?.remediation,
    wrong =
      check?.wrong ||
      "Reset the shared branch immediately and assume every missing change can be recovered later.";
  const options = q.number % 2 ? [correct, wrong] : [wrong, correct];
  const mark = () =>
    setProgress((p) => ({
      ...p,
      lessons: [...new Set([...p.lessons, id])],
      checks: { ...p.checks, [id]: true },
      activity: [
        {
          id,
          title: q.title,
          type: "Knowledge check passed",
          at: new Date().toISOString(),
        },
        ...(p.activity || []),
      ].slice(0, 40),
    }));
  return (
    <div className="lesson-page">
      <Link className="back-link" href="/">
        ← Learning path
      </Link>
      <PageIntro
        eyebrow={`${q.category} · Original Q${q.number}`}
        title={q.title}
        description="Understand the idea, inspect a concrete example, then verify it yourself."
      />
      <div className="lesson-tabs" role="tablist" aria-label="Lesson sections">
        {["Learn", "Visualize", "Practise", "Verify", "Source"].map((t) => (
          <button
            role="tab"
            aria-selected={tab === t}
            key={t}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="lesson-layout">
        <article className="lesson-reading">
          {tab === "Learn" && (
            <>
              <span className="eyebrow">
                Concept · Why it matters · How it works
              </span>
              {q.correction && (
                <div className="editor-note">
                  <strong>Editorial clarification</strong>
                  <p>{q.correction}</p>
                </div>
              )}
              <LessonChapters question={q} />
              <p className="source-credit">
                Source: Git_Version_Control_Interview_Preparation_Guide.md, Q
                {q.number}, line {q.sourceLine}. Original OCR wording;
                clarifications above take precedence over unsafe or malformed
                examples.
              </p>
              <button
                className="ide-button primary"
                onClick={() => setTab("Visualize")}
              >
                See it in context
                <ArrowRight size={15} />
              </button>
            </>
          )}
          {tab === "Visualize" && (
            <>
              <h2>Predict the effect before you run it</h2>
              {related[0]?.introduction && (
                <ConceptExplainer scenario={related[0]} linked={false} />
              )}
              <div className="concept-flow">
                {[
                  "Working files",
                  "Staged snapshot",
                  "Local commit",
                  "Remote history",
                ].map((x, i) => (
                  <div key={x}>
                    <span>0{i + 1}</span>
                    <strong>{x}</strong>
                    <small>
                      {
                        [
                          "Edit without changing history",
                          "Choose exactly what to save",
                          "Record content and parents",
                          "Share through explicit transfer",
                        ][i]
                      }
                    </small>
                  </div>
                ))}
              </div>
              <p>{check?.correct || incident?.cause}</p>
              {incident && (
                <>
                  <h3>Evidence to inspect</h3>
                  <pre>{incident.evidence}</pre>
                  <p>{incident.cause}</p>
                </>
              )}
              <p>
                Ask which files, references, objects, or hosting policies are
                involved. Some concepts change repository state; others govern
                the surrounding team and deployment process.
              </p>
              <div className="inline-actions">
                {related.slice(0, 2).map((s) => (
                  <Link
                    key={s.id}
                    className="ide-button primary"
                    href={`/scenarios/${s.id}`}
                  >
                    Explore {s.title}
                    <ArrowRight size={14} />
                  </Link>
                ))}
                <Link className="ide-button" href="/branches">
                  Compare branch histories
                </Link>
              </div>
              <h3>Common mistake</h3>
              <p>{wrong}</p>
              <h3>Safer reasoning</h3>
              <p>{correct}</p>
            </>
          )}
          {tab === "Practise" && (
            <>
              {related.map((s) => (
                <div className="practice-link" key={s.id}>
                  <div>
                    <strong>{s.title}</strong>
                    <p>
                      {s.mode === "browser"
                        ? "State-verified browser commands"
                        : "Evidence and decision exercise"}{" "}
                      · {s.minutes} min
                    </p>
                  </div>
                  <Link className="ide-button" href={`/scenarios/${s.id}`}>
                    Open lab
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
              <MachineLab scenario={topicPractice(q, related[0])} />
            </>
          )}
          {tab === "Verify" && (
            <>
              <span className="eyebrow">Editorial knowledge check</span>
              <h2>
                {check?.prompt ||
                  "Which response best addresses this incident?"}
              </h2>
              {incident && <p>{incident.evidence}</p>}
              <div className="answer-options">
                {options.map((o) => (
                  <button
                    className={
                      answer === o
                        ? o === correct
                          ? "correct"
                          : "incorrect"
                        : ""
                    }
                    onClick={() => {
                      setAnswer(o);
                      if (o === correct) mark();
                      else
                        setProgress((p) => ({
                          ...p,
                          checks: { ...p.checks, [id]: false },
                        }));
                    }}
                    key={o}
                  >
                    {o}
                  </button>
                ))}
              </div>
              {answer && (
                <div role="status" className="editor-note">
                  {answer === correct
                    ? "Correct. Lesson knowledge check recorded."
                    : "Revisit the cause and affected state, then try again."}
                  <p>{correct}</p>
                </div>
              )}
              <p>
                Completion verifies this browser check only. Real-machine
                completion is reported separately.
              </p>
            </>
          )}
          {tab === "Source" && (
            <>
              <h2>Original question {q.number}</h2>
              <p className="source-credit">
                Exact title and answer from the supplied guide. Line{" "}
                {q.sourceLine}. OCR artifacts remain visible to preserve
                provenance.
              </p>
              <SourceText text={q.answer} />
              <p>
                <Link href={`/interview?q=${q.number}`}>
                  Practise this interview question →
                </Link>
              </p>
            </>
          )}
        </article>
        <aside className="lesson-outline" aria-label="Lesson navigation">
          <span className="eyebrow">Learning loop</span>
          {["Learn", "Visualize", "Practise", "Verify", "Source"].map(
            (t, i) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={tab === t ? "active" : ""}
              >
                <span>0{i + 1}</span>
                {t}
                <ChevronRight size={14} />
              </button>
            ),
          )}
          <p>
            {progress.lessons.includes(id)
              ? "✓ Knowledge check completed"
              : "Complete the knowledge check to record this lesson."}
          </p>
          <Link href={`/interview?q=${q.number}`}>
            Related interview: Q{q.number}
          </Link>
          <p>
            Prerequisite:{" "}
            {q.number === 1
              ? "None"
              : q.number < 26
                ? "Understand files, index and commits"
                : "Complete foundational Git workflows"}
            .
          </p>
        </aside>
      </div>
    </div>
  );
}
export function ScenarioCatalog() {
  const [query, setQuery] = useState(""),
    [level, setLevel] = useState("all"),
    [type, setType] = useState("practical");
  const { progress } = useProgress();
  const items =
    type === "practical"
      ? scenarios
      : incidents.map((i) => ({
          ...i,
          title: source.questions[i.number - 1].title,
          level: 5,
          mode: "decision",
          minutes: 15,
        }));
  return (
    <div className="library-page">
      <PageIntro
        eyebrow="Practice with purpose"
        title="Small labs. Real situations."
        description="Run commands in a visible repository, or work through production evidence and recovery decisions."
      />
      <div className="lesson-tabs">
        {[
          ["practical", "40 practical labs"],
          ["incidents", "23 production incidents"],
        ].map(([id, t]) => (
          <button
            key={id}
            aria-pressed={type === id}
            onClick={() => setType(id)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="library-filters">
        <label>
          <Search size={16} />
          <input
            aria-label="Search scenarios"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search scenarios…"
          />
        </label>
        <select
          aria-label="Scenario level"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        >
          <option value="all">All levels</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              Level {n}
            </option>
          ))}
        </select>
      </div>
      <div className="scenario-table">
        {items
          .filter(
            (s) =>
              (level === "all" || s.level === Number(level)) &&
              (
                s.title +
                " " +
                s.id +
                " " +
                (s.introduction?.command || "") +
                " " +
                (s.introduction?.definition || "")
              )
                .toLowerCase()
                .includes(query.toLowerCase()),
          )
          .map((s) => (
            <Link
              href={`/scenarios/${s.id}`}
              key={s.id}
              className="scenario-row"
            >
              <span className="scenario-glyph">
                {progress.scenarios.includes(s.id) ? (
                  <Check size={19} />
                ) : s.mode === "browser" ? (
                  <Terminal size={19} />
                ) : (
                  <BookOpen size={19} />
                )}
              </span>
              <div>
                <strong>{s.title}</strong>
                {s.introduction && (
                  <p className="scenario-definition">
                    {s.introduction.definition}
                  </p>
                )}
                <span>
                  {s.mode === "browser"
                    ? "Browser commands"
                    : "Evidence & decisions"}{" "}
                  · Level {s.level} · {s.minutes} min
                </span>
              </div>
              <span className="scenario-prereq topic-pill">
                {s.introduction?.command || "Production incident"}
              </span>
              <ArrowRight size={16} />
            </Link>
          ))}
      </div>
    </div>
  );
}
export function EvidenceLab({ scenario, incident }) {
  const data = incident || evidenceFor(scenario),
    id = incident?.id || scenario.id,
    title = incident
      ? source.questions[incident.number - 1].title
      : scenario.title;
  const [stage, setStage] = useState(0),
    [selected, setSelected] = useState(null),
    [mode, setMode] = useState("browser");
  const { setProgress } = useProgress();
  const steps = [
    {
      title: "Diagnose the cause",
      prompt: data.evidence,
      correct: data.cause,
      wrong:
        "The latest visible file contents alone prove that the repository and deployment are correct.",
    },
    {
      title: "Choose a remediation",
      prompt:
        "Preserve important work and choose an action that addresses the identified cause.",
      correct: data.remediation,
      wrong:
        "Apply a force push or hard reset immediately, before inspecting references or coordinating shared work.",
    },
    {
      title: "Verify the result",
      prompt: "What evidence is needed before you consider the issue resolved?",
      correct: data.verification,
      wrong:
        "A command returned without an error, so no further inspection or tests are needed.",
    },
  ];
  const current = steps[Math.min(stage, 2)],
    options =
      (incident?.number || scenario.number) % 2
        ? [current.correct, current.wrong]
        : [current.wrong, current.correct];
  function next() {
    if (stage === 2)
      setProgress((p) => ({
        ...p,
        scenarios: [...new Set([...p.scenarios, id])],
        assessments: [...new Set([...(p.assessments || []), id])],
        activity: [
          {
            id,
            title,
            type: "Evidence assessment passed",
            at: new Date().toISOString(),
          },
          ...(p.activity || []),
        ].slice(0, 40),
      }));
    setStage(stage + 1);
    setSelected(null);
  }
  const machineScenario = scenario || {
    id: incident.id,
    title,
    mode: "decision",
    verify: "git status\ngit log --oneline --all",
  };
  return (
    <div className="evidence-page">
      <PageIntro
        eyebrow="Production workshop · Evidence fixture"
        title={title}
        description={
          scenario?.introduction?.definition ||
          "Diagnose → Remediate → Verify. This exercise assesses your decisions; it does not execute the advanced Git commands."
        }
      />
      {scenario?.introduction && (
        <details className="evidence-concept">
          <summary>Understand {scenario.introduction.name}</summary>
          <ConceptExplainer scenario={scenario} />
        </details>
      )}
      <div className="lesson-tabs">
        <button
          aria-pressed={mode === "browser"}
          onClick={() => setMode("browser")}
        >
          Evidence exercise
        </button>
        <button
          aria-pressed={mode === "machine"}
          onClick={() => setMode("machine")}
        >
          Real-machine practice
        </button>
      </div>
      {mode === "machine" ? (
        <article className="lesson-reading">
          <MachineLab scenario={machineScenario} />
        </article>
      ) : (
        <div className="evidence-layout">
          <article className="lesson-reading">
            <div className="case-label">
              CASE FILE ·{" "}
              {incident
                ? "Q" + incident.number
                : scenario.questions.map((q) => "Q" + q).join(" / ")}
            </div>
            <pre className="evidence-fixture">{data.evidence}</pre>
            {stage < 3 ? (
              <>
                <span className="eyebrow">Step {stage + 1} of 3</span>
                <h2>{current.title}</h2>
                <p>{current.prompt}</p>
                <div className="answer-options">
                  {options.map((o) => (
                    <button
                      key={o}
                      className={
                        selected === o
                          ? o === current.correct
                            ? "correct"
                            : "incorrect"
                          : ""
                      }
                      onClick={() => setSelected(o)}
                    >
                      {o}
                    </button>
                  ))}
                </div>
                {selected && (
                  <p role="status">
                    {selected === current.correct
                      ? "That addresses the evidence. Continue to the next checkpoint."
                      : "That conclusion is not supported by the evidence. Inspect the affected references, files and systems first."}
                  </p>
                )}
                <button
                  className="ide-button primary"
                  disabled={selected !== current.correct}
                  onClick={next}
                >
                  {stage === 2 ? "Complete assessment" : "Next checkpoint"}
                  <ArrowRight size={14} />
                </button>
              </>
            ) : (
              <>
                <h2>Decision sequence completed.</h2>
                <p>
                  Your assessment is recorded. Reproduce the incident locally to
                  practise the actual tools.
                </p>
                <button
                  className="ide-button"
                  onClick={() => {
                    setStage(0);
                    setSelected(null);
                  }}
                >
                  Retry the case
                  <RotateCcw size={14} />
                </button>
              </>
            )}
          </article>
          <aside className="lesson-reading" aria-label="Incident reference">
            <h3>Safety & scope</h3>
            <p>
              {data.precaution ||
                "Use an isolated practice repository. Coordinate any update to shared history. Hosting and deployment actions require their own verification."}
            </p>
            <h3>Inspection / procedure reference</h3>
            <pre>{data.commands}</pre>
            <p className="source-credit">
              These are reference commands. Inspect actual refs and paths before
              executing locally. The browser has not run them.
            </p>
            <h3>Alternative</h3>
            <p>{data.alternative}</p>
            <h3>Go deeper</h3>
            {(incident ? [incident.number] : scenario.questions).map((n) => (
              <Link
                className="source-link"
                key={n}
                href={`/learn/q${String(n).padStart(2, "0")}`}
              >
                Q{n} · {source.questions[n - 1].title}
                <ArrowRight size={13} />
              </Link>
            ))}
          </aside>
        </div>
      )}
    </div>
  );
}
export function ScenarioScreen({ id }) {
  const scenario = scenarios.find((s) => s.id === id),
    incident = incidents.find((i) => i.id === id);
  if (incident || scenario?.mode === "decision")
    return <EvidenceLab scenario={scenario} incident={incident} />;
  return <Workspace scenario={scenario} />;
}
export function InterviewBank() {
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState(categories[0]),
    [reveal, setReveal] = useState({}),
    [revisionOnly, setRevisionOnly] = useState(false);
  const { progress, setProgress } = useProgress();
  useEffect(() => {
    const n = new URLSearchParams(window.location.search).get("q");
    if (n) setQuery("Q" + n);
  }, []);
  const toggle = (id) =>
    setProgress((p) => ({
      ...p,
      revision: (p.revision || []).includes(id)
        ? p.revision.filter((x) => x !== id)
        : [...(p.revision || []), id],
    }));
  return (
    <div className="library-page">
      <PageIntro
        eyebrow="Interview practice · Original question bank"
        title="Explain it with confidence."
        description="All 80 original questions, with their numbering and answers preserved. Recall first, then reveal and inspect."
      />
      <FilterBar {...{ query, setQuery, category, setCategory }} />
      <label className="check-label">
        <input
          type="checkbox"
          checked={revisionOnly}
          onChange={(e) => setRevisionOnly(e.target.checked)}
        />
        Show my revision list ({progress.revision?.length || 0})
      </label>
      <div className="interview-bank">
        {source.questions
          .filter(
            (q) =>
              matches(q, query, category) &&
              (!revisionOnly || progress.revision?.includes(q.id)),
          )
          .map((q) => (
            <article className="interview-entry" id={`q${q.number}`} key={q.id}>
              <div className="interview-heading">
                <span className="lesson-number">{q.number}</span>
                <div>
                  <small>{q.category}</small>
                  <h2>{q.title}</h2>
                </div>
                <button
                  className="icon-button"
                  aria-label={`${progress.revision?.includes(q.id) ? "Remove" : "Save"} Q${q.number} for revision`}
                  aria-pressed={progress.revision?.includes(q.id) || false}
                  onClick={() => toggle(q.id)}
                >
                  <Bookmark
                    size={17}
                    fill={
                      progress.revision?.includes(q.id)
                        ? "currentColor"
                        : "none"
                    }
                  />
                </button>
              </div>
              <div className="interview-actions">
                <button
                  className="ide-button"
                  aria-expanded={Boolean(reveal[q.id])}
                  onClick={() => setReveal((r) => ({ ...r, [q.id]: !r[q.id] }))}
                >
                  {reveal[q.id] ? "Hide answer" : "Reveal source answer"}
                </button>
                <Link href={`/learn/${q.id}`}>
                  Related lesson
                  <ArrowRight size={13} />
                </Link>
                {q.scenarioIds[0] && (
                  <Link href={`/scenarios/${q.scenarioIds[0]}`}>
                    Practise
                    <ArrowRight size={13} />
                  </Link>
                )}
              </div>
              {reveal[q.id] && (
                <div className="revealed-answer">
                  {q.correction && (
                    <div className="editor-note">
                      <strong>Editorial clarification</strong>
                      <p>{q.correction}</p>
                    </div>
                  )}
                  <SourceText text={q.answer} />
                  <p className="source-credit">
                    Supplied interview guide · Q{q.number} · line {q.sourceLine}
                    . Source OCR preserved.
                  </p>
                  <div className="inline-actions">
                    <span>Self-assessment:</span>
                    {["Revisit", "Developing", "Confident"].map((v) => (
                      <button
                        className="ide-button"
                        key={v}
                        aria-pressed={progress.selfRatings?.[q.id] === v}
                        onClick={() =>
                          setProgress((p) => ({
                            ...p,
                            selfRatings: { ...p.selfRatings, [q.id]: v },
                          }))
                        }
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </article>
          ))}
      </div>
    </div>
  );
}
export function ProgressDesk() {
  const { progress, setProgress } = useProgress();
  const [confirm, setConfirm] = useState(false);
  const verified = progress.verified || [],
    assessed = progress.assessments || [],
    manual = progress.machine || [];
  const level = verified.length >= 20 ? 3 : verified.length >= 10 ? 2 : 1;
  return (
    <div className="library-page">
      <PageIntro
        eyebrow="Your learning record · Stored in this browser"
        title="Progress you can explain."
        description="Simulator checks, knowledge checks and self-reported machine work are tracked separately."
      />
      <div className="progress-summary">
        {[
          ["Lessons checked", progress.lessons.length + "/80"],
          ["Simulator verified", verified.length + "/30"],
          ["Evidence assessments", assessed.length + "/33"],
          ["Machine self-reported", manual.length],
          ["Current practice level", level],
        ].map(([label, value]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="progress-columns">
        <article className="lesson-reading">
          <h2>Meaningful milestones</h2>
          {[
            ["First snapshot", verified.includes("first-commit")],
            [
              "Own your history",
              ["branching", "rebase", "revert"].every((x) =>
                verified.includes(x),
              ),
            ],
            [
              "Remote confidence",
              ["clone", "fetch-only", "rejected-push"].every((x) =>
                verified.includes(x),
              ),
            ],
            ["Incident responder", assessed.length >= 5],
          ].map(([label, done]) => (
            <p className="milestone" key={label}>
              <Check size={17} className={done ? "earned" : ""} />
              {label}
              <small>{done ? "Earned" : "In progress"}</small>
            </p>
          ))}
          <h3>Revision list</h3>
          {progress.revision?.length ? (
            progress.revision.map((id) => (
              <Link className="source-link" key={id} href={`/learn/${id}`}>
                {source.questions.find((q) => q.id === id)?.title || id}
              </Link>
            ))
          ) : (
            <p>Save questions from Interview Practice to revisit them here.</p>
          )}
          <h3>Knowledge checks to revisit</h3>
          {Object.entries(progress.checks || {})
            .filter(([, ok]) => !ok)
            .map(([id]) => (
              <Link key={id} className="source-link" href={`/learn/${id}`}>
                {source.questions.find((q) => q.id === id)?.title || id}
              </Link>
            ))}
        </article>
        <article className="lesson-reading">
          <h2>Recent activity</h2>
          {progress.activity?.length ? (
            progress.activity.map((a, i) => (
              <div className="activity-row" key={i}>
                <span>
                  <Clock size={14} />
                  {a.type}
                </span>
                <strong>{a.title}</strong>
                <small>{new Date(a.at).toLocaleString()}</small>
              </div>
            ))
          ) : (
            <p>
              Complete a lab or knowledge check to start your learning record.
            </p>
          )}
          <p className="source-credit">
            No practice time is estimated. Older completion records remain
            preserved but are not relabeled as simulator-verified.
          </p>
          <button className="ide-button" onClick={() => setConfirm((x) => !x)}>
            Manage saved progress
          </button>
          {confirm && (
            <div className="editor-note">
              <p>
                This clears only this browser’s learning record. Scenario resets
                do not clear it.
              </p>
              <button
                className="ide-button"
                onClick={() => {
                  setProgress({
                    lessons: [],
                    scenarios: [],
                    steps: {},
                    answers: {},
                    lastScenario: null,
                    verified: [],
                    assessments: [],
                    machine: [],
                    revision: [],
                    checks: {},
                    selfRatings: {},
                    activity: [],
                  });
                  setConfirm(false);
                }}
              >
                Clear saved learning progress
              </button>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
