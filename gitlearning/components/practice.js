"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  X,
  Lightbulb,
  Trophy,
  Target,
  BookOpen,
  GitBranch,
  ShieldCheck,
  Terminal,
  RotateCcw,
  Download,
  Upload,
  Info,
  Star,
  Code2,
  Clock,
  ExternalLink,
} from "lucide-react";
import { questions, scenarios } from "@/lib/content";
import { useProgress } from "./providers";
import { SectionHeading, Badge, CodeBlock, ButtonLink } from "./ui";
const categories = ["All topics", ...new Set(questions.map((q) => q.category))];
export function Interview() {
  const { progress, setProgress } = useProgress();
  const [category, setCategory] = useState("All topics"),
    [index, setIndex] = useState(0),
    [selected, setSelected] = useState(null),
    [submitted, setSubmitted] = useState(false),
    [retry, setRetry] = useState(false);
  const pool = questions.filter(
      (q) => category === "All topics" || q.category === category,
    ),
    q = pool[index];
  const stored = progress.answers[q.id];
  const answered = !retry && stored !== undefined;
  const revealed = submitted || answered;
  const choice = submitted ? selected : answered ? stored : selected;
  const correct = choice === q.answer;
  const score = questions.filter(
      (q) => progress.answers[q.id] === q.answer,
    ).length,
    attempted = questions.filter(
      (q) => progress.answers[q.id] !== undefined,
    ).length;
  function resetQuestion() {
    setSelected(null);
    setSubmitted(false);
    setRetry(false);
  }
  function submit() {
    if (selected === null) return;
    setSubmitted(true);
    setRetry(false);
    setProgress((p) => ({ ...p, answers: { ...p.answers, [q.id]: selected } }));
  }
  function change(i) {
    setIndex(i);
    resetQuestion();
  }
  return (
    <>
      <SectionHeading
        eyebrow="FROM “I THINK” TO “I KNOW”"
        title="Trust your Git instincts."
        description="Practical questions. A little thinking. An explanation that makes it stick."
      >
        <div className="quiz-score">
          <Trophy size={19} />
          <strong>{score}</strong>
          <span>/ {questions.length} correct</span>
        </div>
      </SectionHeading>
      <div
        className="filter-tabs interview-tabs"
        role="group"
        aria-label="Interview topic"
      >
        {categories.map((c) => (
          <button
            className={category === c ? "selected" : ""}
            key={c}
            onClick={() => {
              setCategory(c);
              setIndex(0);
              resetQuestion();
            }}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="interview-layout">
        <section className="panel question-panel">
          <div className="question-top">
            <Badge color="purple">{q.category}</Badge>
            <span>
              QUESTION {index + 1} OF {pool.length}
            </span>
          </div>
          <div className="question-dots">
            {pool.map((item, i) => (
              <button
                aria-label={`Go to question ${i + 1}`}
                className={`${i === index ? "active" : ""} ${progress.answers[item.id] === item.answer ? "correct" : ""}`}
                onClick={() => change(i)}
                key={item.id}
              />
            ))}
          </div>
          <h2>{q.question}</h2>
          <p className="question-instruction">
            Choose the best answer. No timer, no pressure.
          </p>
          <div className="quiz-options">
            {q.options.map((option, i) => (
              <button
                disabled={revealed}
                key={option}
                className={`${choice === i ? "chosen" : ""} ${revealed && i === q.answer ? "correct" : ""} ${revealed && choice === i && i !== q.answer ? "incorrect" : ""}`}
                onClick={() => setSelected(i)}
                aria-pressed={choice === i}
              >
                <span className="option-letter">
                  {String.fromCharCode(65 + i)}
                </span>
                <span>{option}</span>
                {revealed && i === q.answer ? (
                  <CheckCircle2 size={19} />
                ) : (
                  <span className="option-radio" />
                )}
              </button>
            ))}
          </div>
          {!revealed ? (
            <button
              className="button primary answer-button"
              onClick={submit}
              disabled={selected === null}
            >
              Check my answer
              <ArrowRight size={16} />
            </button>
          ) : (
            <div
              className={`quiz-explanation ${correct ? "is-correct" : ""}`}
              role="status"
            >
              <div>
                <Lightbulb size={22} />
                <h3>
                  {correct
                    ? "That’s it. Here’s why."
                    : "A useful thing to learn."}
                </h3>
              </div>
              <p>{q.explanation}</p>
              {q.command && <CodeBlock command={q.command} />}
              <button
                className="quiet-button"
                onClick={() => {
                  setRetry(true);
                  setSubmitted(false);
                  setSelected(null);
                }}
              >
                <RotateCcw size={13} />
                Try this question again
              </button>
            </div>
          )}
          <div className="question-navigation">
            <button
              className="quiet-button"
              disabled={index === 0}
              onClick={() => change(index - 1)}
            >
              <ArrowLeft size={15} />
              Previous
            </button>
            <span>
              {Object.keys(progress.answers).length} answers saved in this
              browser
            </span>
            <button
              className="quiet-button"
              disabled={index === pool.length - 1}
              onClick={() => change(index + 1)}
            >
              Next question
              <ArrowRight size={15} />
            </button>
          </div>
        </section>
        <aside>
          <div className="panel interview-tip">
            <span className="tip-star">✦</span>
            <h3>Think out loud.</h3>
            <p>
              Before you choose, explain what you expect to happen to three
              things:
            </p>
            <ol>
              <li>Your working files</li>
              <li>Your staging area</li>
              <li>Your commit history</li>
            </ol>
            <p>That habit is more valuable than memorizing a command.</p>
          </div>
          <div className="panel">
            <h3>Your practice snapshot</h3>
            <div className="practice-stat">
              <span>Attempted</span>
              <strong>
                {attempted} / {questions.length}
              </strong>
            </div>
            <div className="practice-stat">
              <span>Correct answers</span>
              <strong>{score}</strong>
            </div>
            <div className="progress-track">
              <span style={{ width: `${(score / questions.length) * 100}%` }} />
            </div>
            <p>Revisit any question. Your latest answer is saved.</p>
          </div>
          <div className="panel">
            <Badge color="blue">FROM YOUR NOTES</Badge>
            <h3>The concepts, made practical.</h3>
            <p>
              These 20 questions adapt the foundations and real-world problems
              in your interview preparation guide.
            </p>
            <Link className="text-link" href="/scenarios">
              Practice the situations
              <ArrowRight size={14} />
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
export function Progress() {
  const { progress, setProgress, storageError } = useProgress();
  const [resetting, setResetting] = useState(false);
  const completed = progress.scenarios.length;
  const score = questions.filter(
    (q) => progress.answers[q.id] === q.answer,
  ).length;
  const badges = [
    {
      name: "First snapshot",
      desc: "Complete your first repository mission.",
      icon: DatabaseIcon,
      earned: progress.scenarios.includes("first-commit"),
    },
    {
      name: "Branch explorer",
      desc: "Finish the branching mission.",
      icon: GitBranch,
      earned: progress.scenarios.includes("branching"),
    },
    {
      name: "Conflict calmer",
      desc: "Resolve both developers’ changes.",
      icon: ShieldCheck,
      earned: progress.scenarios.includes("conflict"),
    },
    {
      name: "Team player",
      desc: "Complete the team workflow decisions.",
      icon: Target,
      earned: progress.lessons.includes("collaboration"),
    },
    {
      name: "Git instincts",
      desc: "Answer 10 interview questions correctly.",
      icon: Lightbulb,
      earned: score >= 10,
    },
    {
      name: "Quest complete",
      desc: "Finish all 16 scenarios.",
      icon: Trophy,
      earned: completed === scenarios.length,
    },
  ];
  const resume =
    scenarios.find(
      (s) =>
        s.id === progress.lastScenario && !progress.scenarios.includes(s.id),
    ) || scenarios.find((s) => !progress.scenarios.includes(s.id));
  return (
    <>
      <SectionHeading
        eyebrow="EVERY SMALL STEP COUNTS"
        title="Look how far you’re getting."
        description="Your learning journey, saved on this device. Keep going at your own pace."
      >
        <Badge color="cyan">
          {completed < 4
            ? "Getting started"
            : completed < 12
              ? "Building confidence"
              : "Taking command"}
        </Badge>
      </SectionHeading>
      <div className="progress-summary">
        <div className="panel">
          <span className="card-icon purple">
            <Target size={23} />
          </span>
          <strong>
            {completed}
            <small> / 16</small>
          </strong>
          <span>Scenarios completed</span>
          <div className="progress-track">
            <span style={{ width: `${(completed / 16) * 100}%` }} />
          </div>
        </div>
        <div className="panel">
          <span className="card-icon blue">
            <BookOpen size={23} />
          </span>
          <strong>
            {progress.lessons.length}
            <small> / 3</small>
          </strong>
          <span>Visual lessons explored</span>
          <div className="progress-track">
            <span
              style={{
                width: `${Math.min((progress.lessons.length / 3) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
        <div className="panel">
          <span className="card-icon cyan">
            <Code2 size={23} />
          </span>
          <strong>
            {score}
            <small> / 20</small>
          </strong>
          <span>Interview answers correct</span>
          <div className="progress-track">
            <span style={{ width: `${(score / 20) * 100}%` }} />
          </div>
        </div>
      </div>
      {resume && (
        <div className="resume-panel">
          <div>
            <Badge color="purple">YOUR NEXT STEP</Badge>
            <h2>{resume.title}</h2>
            <p>{resume.subtitle}</p>
          </div>
          <ButtonLink href={`/scenarios/${resume.id}`}>
            Continue your journey
          </ButtonLink>
        </div>
      )}
      <div className="section-title-row">
        <div>
          <span className="eyebrow">EARNED BY DOING</span>
          <h2>Little wins. Lasting skills.</h2>
        </div>
        <span className="small-muted">
          {badges.filter((b) => b.earned).length} / {badges.length} achievements
          earned
        </span>
      </div>
      <div className="achievement-grid">
        {badges.map((b) => (
          <div
            className={`achievement ${b.earned ? "earned" : ""}`}
            key={b.name}
          >
            <span className="achievement-icon">
              <b.icon size={27} />
            </span>
            <h3>{b.name}</h3>
            <p>{b.desc}</p>
            <span className="achievement-status">
              {b.earned ? (
                <>
                  <CheckCircle2 size={13} />
                  Earned
                </>
              ) : (
                "Keep exploring"
              )}
            </span>
          </div>
        ))}
      </div>
      <section className="learning-section">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">YOUR MISSION LOG</span>
            <h2>One scenario at a time.</h2>
          </div>
        </div>
        <div className="mission-log">
          {scenarios.map((s, i) => {
            const done = progress.scenarios.includes(s.id);
            const count = Array.isArray(progress.steps[s.id])
              ? progress.steps[s.id].length
              : 0;
            return (
              <Link href={`/scenarios/${s.id}`} key={s.id}>
                <span className={`log-number ${done ? "done" : ""}`}>
                  {done ? <Check size={15} /> : String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <strong>{s.title}</strong>
                  <span>{s.tags.join(" · ")}</span>
                </div>
                <span className="log-progress">
                  {done
                    ? "Completed"
                    : count
                      ? `${count} / ${s.steps.length} steps`
                      : "Ready to start"}
                </span>
                <ArrowRight size={16} />
              </Link>
            );
          })}
        </div>
      </section>
      <div className="storage-panel panel">
        <Info size={22} />
        <div>
          <h3>Your progress stays with this browser.</h3>
          <p>
            No account is needed. Clearing browser storage or switching devices
            will not carry this progress over.{" "}
            {storageError
              ? "Storage is currently unavailable; changes last only for this visit."
              : ""}
          </p>
          {!resetting ? (
            <button
              className="quiet-button danger"
              onClick={() => setResetting(true)}
            >
              Reset my learning progress
            </button>
          ) : (
            <div className="reset-confirm">
              <span>
                Clear your saved checklists, lessons, and answers on this
                device?
              </span>
              <button
                className="button secondary"
                onClick={() => setResetting(false)}
              >
                Keep progress
              </button>
              <button
                className="button danger-button"
                onClick={() => {
                  setProgress({
                    lessons: [],
                    scenarios: [],
                    steps: {},
                    answers: {},
                    lastScenario: null,
                  });
                  setResetting(false);
                }}
              >
                Clear progress
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
function DatabaseIcon(props) {
  return <Terminal {...props} />;
}
