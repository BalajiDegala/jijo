"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder,
  Layers,
  Database,
  Cloud,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Play,
  RotateCcw,
  GitBranch,
  GitMerge,
  GitPullRequest,
  Lightbulb,
  FileText,
  Info,
  Terminal,
  Search,
  BookOpen,
  ShieldCheck,
  Workflow,
  ExternalLink,
  Trophy,
} from "lucide-react";
import {
  emptyRepo,
  starterRepo,
  demoRepo,
  runSequence,
  runCommand,
  statusOf,
  headId,
} from "@/lib/git-engine";
import { glossary, questions, scenarios } from "@/lib/content";
import { useProgress } from "./providers";
import { SectionHeading, Badge, CodeBlock, ButtonLink } from "./ui";
import { GitGraph } from "./git-graph";
import { HistoryGraph } from "./history-graph";
import { createFixture } from "@/lib/visual-lab/fixtures";
const flow = [
  {
    title: "Make a change",
    short: "Edit",
    command: 'echo "Hello Git" > notes.txt',
    explanation:
      "Your working directory is the folder you can see. Editing changes the file here. Git has not saved a snapshot yet.",
    analogy: "Think of it as the pages on your desk.",
    icon: Folder,
    color: "blue",
  },
  {
    title: "Choose what to save",
    short: "Stage",
    command: "git add notes.txt",
    explanation:
      "Staging copies this version of notes.txt into the index. The working file stays on your desk. Later edits need staging again.",
    analogy: "Pick the pages you want in the next envelope.",
    icon: Layers,
    color: "purple",
  },
  {
    title: "Save a snapshot",
    short: "Commit",
    command: 'git commit -m "Add my notes"',
    explanation:
      "A commit records the staged snapshot in your local repository. HEAD and your current branch advance to this new moment.",
    analogy: "Seal and label the envelope. You can find it again.",
    icon: Database,
    color: "cyan",
  },
  {
    title: "Share your history",
    short: "Push",
    command: "git push -u origin main",
    explanation:
      "Push transfers committed history to a remote repository. Uncommitted edits are not included. In this demo, origin is already configured.",
    analogy: "Send a copy of your saved envelopes to the team.",
    icon: Cloud,
    color: "amber",
  },
];
export function Fundamentals() {
  const [phase, setPhase] = useState(0),
    [played, setPlayed] = useState(false),
    [answer, setAnswer] = useState(null),
    [filter, setFilter] = useState("");
  const { completeLesson, progress } = useProgress();
  const current = flow[phase];
  function next() {
    if (!played) setPlayed(true);
    else if (phase < 3) {
      setPhase((p) => p + 1);
      setPlayed(false);
    }
  }
  return (
    <>
      <SectionHeading
        eyebrow="01 / GET THE BASICS"
        title="One file. Four small steps."
        description="If this clicks, most of Git starts to make sense."
      >
        <Badge color="green">Beginner friendly</Badge>
      </SectionHeading>
      <section className="fundamentals-panel panel">
        <div className="lesson-section-heading">
          <div>
            <span className="eyebrow">THE EVERYDAY GIT FLOW</span>
            <h2>From an idea to a shared snapshot.</h2>
          </div>
          <button
            className="quiet-button"
            onClick={() => {
              setPhase(0);
              setPlayed(false);
              setAnswer(null);
            }}
          >
            <RotateCcw size={14} />
            Replay
          </button>
        </div>
        <div className="flow-stages">
          {flow.map((item, i) => (
            <div
              className={`flow-stage ${i === phase ? "active" : ""} ${item.color}`}
              key={item.short}
            >
              <span className={`flow-icon ${item.color}`}>
                <item.icon size={27} />
              </span>
              <span className="flow-stage-label">
                0{i + 1} / {item.short}
              </span>
              <h3>
                {
                  [
                    "Working directory",
                    "Staging area",
                    "Local repository",
                    "Remote repository",
                  ][i]
                }
              </h3>
              <div className="flow-file-slot">
                <AnimatePresence>
                  {(i < phase || (i === phase && played)) && (
                    <motion.div
                      className="animated-file"
                      key={i}
                      initial={{ opacity: 0, y: 18, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <FileText size={16} />
                      <code>notes.txt</code>
                      <Check size={12} />
                    </motion.div>
                  )}
                </AnimatePresence>
                {i > phase && (
                  <span className="flow-waiting">
                    Waiting for your snapshot
                  </span>
                )}
                {i === phase && !played && (
                  <span className="flow-waiting">Ready when you are</span>
                )}
              </div>
              {i < 3 && <ArrowRight className="flow-arrow" size={21} />}
            </div>
          ))}
        </div>
        <div className="flow-explanation">
          <div>
            <Badge color={current.color}>STEP {phase + 1} / 4</Badge>
            <h2>{current.title}</h2>
            <p>{current.explanation}</p>
            <div className="analogy">
              <Lightbulb size={16} />
              {current.analogy}
            </div>
          </div>
          <div className="flow-action">
            <CodeBlock command={current.command} />
            <button
              className="button primary"
              onClick={next}
              disabled={phase === 3 && played}
            >
              {played ? (
                phase === 3 ? (
                  <>
                    <Check size={15} />
                    You’ve got the flow
                  </>
                ) : (
                  <>
                    Next step
                    <ArrowRight size={16} />
                  </>
                )
              ) : (
                <>
                  <Play size={15} />
                  Watch it happen
                </>
              )}
            </button>
            <span>Illustrated walkthrough · no real commands execute</span>
          </div>
        </div>
      </section>
      <section className="knowledge-check panel">
        <div className="check-label">
          <Lightbulb size={20} />
          <span>MAKE IT STICK</span>
        </div>
        <h2>You edit a file after staging it. What will Git commit?</h2>
        <div className="quick-options">
          {[
            "The staged version",
            "The newest working version",
            "Both versions",
          ].map((option, i) => (
            <button
              key={option}
              className={
                answer === i ? (i === 0 ? "correct" : "incorrect") : ""
              }
              onClick={() => {
                setAnswer(i);
                if (i === 0) completeLesson("fundamentals");
              }}
            >
              {option}
              {answer === i && i === 0 && <Check size={15} />}
            </button>
          ))}
        </div>
        {answer !== null && (
          <p
            className={`answer-feedback ${answer === 0 ? "correct-text" : ""}`}
            role="status"
          >
            {answer === 0
              ? "Exactly. Staging captured the earlier version. Run git add again to include your newer edit. Lesson complete."
              : "Not quite. Git commits the content captured by git add. The later working edit stays unstaged. Try again."}
          </p>
        )}
      </section>
      <section className="learning-section">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">YOUR MENTAL SHORTCUTS</span>
            <h2>Big words. Small explanations.</h2>
          </div>
          <div className="inline-search">
            <Search size={16} />
            <input
              aria-label="Filter Git concepts"
              placeholder="Find a concept..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>
        <div className="glossary-grid">
          {glossary
            .filter((g) =>
              g.join(" ").toLowerCase().includes(filter.toLowerCase()),
            )
            .map(([term, meaning, command], i) => (
              <div className="glossary-item" key={term}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{term}</h3>
                  <p>{meaning}</p>
                  <code>{command}</code>
                </div>
              </div>
            ))}
        </div>
        {!glossary.some((g) =>
          g.join(" ").toLowerCase().includes(filter.toLowerCase()),
        ) && (
          <p className="empty-state">
            No matching concepts. Try a shorter word.
          </p>
        )}
      </section>
      <div className="next-lesson">
        <div>
          <span className="eyebrow">READY TO TRY IT?</span>
          <h3>Your first commit is waiting.</h3>
        </div>
        <ButtonLink href="/scenarios/first-commit">
          Take the first mission
        </ButtonLink>
      </div>
    </>
  );
}
export function Branches() {
  const [state, setState] = useState(() => createFixture("feature")),
    [mode, setMode] = useState("before"),
    [undo, setUndo] = useState(null);
  const undoBase = () =>
    runSequence(
      [
        'echo "Broken feature" > bug.js',
        "git add bug.js",
        'git commit -m "Ship a bug"',
      ],
      starterRepo(),
    );
  const [undoState, setUndoState] = useState(undoBase);
  function demonstrate(action) {
    let s = createFixture("feature");
    if (action === "merge") s = runCommand(s, "git merge main").state;
    else {
      s = runCommand(s, "git rebase main").state;
    }
    setState(s);
    setMode(action);
  }
  function undoDemo(action) {
    const cmd =
      action === "revert" ? "git revert HEAD" : `git reset --${action} HEAD~1`;
    setUndoState(runCommand(undoBase(), cmd).state);
    setUndo(action);
  }
  const st = statusOf(undoState);
  return (
    <>
      <SectionHeading
        eyebrow="02 / BRANCH OUT"
        title="Follow the lines. Find the meaning."
        description="Branches are pointers. Merge and rebase tell two different stories."
      >
        <Badge color="purple">Interactive visualizer</Badge>
      </SectionHeading>
      <div className="branch-layout">
        <section className="panel branch-main">
          <div className="panel-heading">
            <div>
              <GitBranch size={20} />
              <h2>Two branches, two ways forward</h2>
            </div>
            <button
              className="quiet-button"
              onClick={() => {
                setState(createFixture("feature"));
                setMode("before");
              }}
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>
          <div className="branch-history">
            <HistoryGraph
              state={state}
              label="Merge and rebase comparison graph"
            />
          </div>
          <div className="branch-actions">
            <button
              className={`choice-button ${mode === "merge" ? "selected" : ""}`}
              onClick={() => demonstrate("merge")}
            >
              <GitMerge size={22} />
              <div>
                <strong>Merge the histories</strong>
                <code>on feature/login: git merge main</code>
              </div>
              <Play size={16} />
            </button>
            <button
              className={`choice-button ${mode === "rebase" ? "selected" : ""}`}
              onClick={() => demonstrate("rebase")}
            >
              <Workflow size={22} />
              <div>
                <strong>Replay the feature</strong>
                <code>on feature/login: git rebase main</code>
              </div>
              <Play size={16} />
            </button>
          </div>
          <div className="branch-explanation" role="status">
            <Lightbulb size={20} />
            <div>
              <h3>
                {mode === "before"
                  ? "One starting point. Two separate ideas."
                  : mode === "merge"
                    ? "A new commit joins both histories."
                    : "Your feature gets a new starting point."}
              </h3>
              <p>
                {mode === "before"
                  ? "Both choices start on feature/login with identical files and history. Compare how each brings in main."
                  : mode === "merge"
                    ? "The merge commit has two parents. Original commit IDs stay the same. feature/login moves to the merge; main stays where it was."
                    : "Your feature change is replayed after main, with a new commit ID and parent. main stays where it was. Use this for unpublished local work."}
              </p>
            </div>
          </div>
        </section>
        <aside className="branch-sidebar">
          <div className="panel">
            <Badge color="cyan">THE AHA MOMENT</Badge>
            <h3>HEAD follows you.</h3>
            <p>
              Normally, HEAD points to the branch you are on. A new commit moves
              that branch forward. Other branch names stay put.
            </p>
            <div className="head-pointer">
              <span>HEAD</span>
              <ArrowRight size={16} />
              <span>{state.branch}</span>
              <ArrowRight size={16} />
              <code>{headId(state)}</code>
            </div>
          </div>
          <div className="panel">
            <h3>What about a fast-forward?</h3>
            <p>
              If main has no new commits, merging can simply move its pointer
              forward. No extra merge commit is needed.
            </p>
            <Link className="text-link" href="/scenarios/branching">
              Try a fast-forward
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="notice warning">
            <Info size={18} />
            <span>
              Rebase rewrites commit IDs. Keep shared history stable unless your
              team coordinates a rewrite.
            </span>
          </div>
        </aside>
      </div>
      <section className="learning-section">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">THE OTHER COMMON CONFUSION</span>
            <h2>“Undo” can mean different things.</h2>
            <p>Each button starts from the same two-commit example.</p>
          </div>
        </div>
        <div className="panel undo-panel">
          <div
            className="filter-tabs undo-tabs"
            role="group"
            aria-label="Compare undo methods"
          >
            {[
              ["revert", "Revert"],
              ["soft", "Reset · soft"],
              ["mixed", "Reset · mixed"],
              ["hard", "Reset · hard"],
            ].map(([value, label]) => (
              <button
                className={undo === value ? "selected" : ""}
                key={value}
                onClick={() => undoDemo(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="branch-history">
            <HistoryGraph
              state={undoState}
              label="Reset and revert comparison graph"
            />
          </div>
          <div className="undo-stats">
            <span>
              <Folder size={16} />
              {Object.keys(undoState.working).length} working files
            </span>
            <span>
              <Layers size={16} />
              {st.staged.length} staged changes
            </span>
            <span>
              <FileText size={16} />
              {st.unstaged.length + st.untracked.length} unstaged / untracked
            </span>
          </div>
          <p
            className={`undo-explanation ${undo === "hard" ? "warning-text" : ""}`}
          >
            {!undo
              ? "The latest commit added bug.js. Choose how to undo it and compare history, staging, and files."
              : undo === "revert"
                ? "Revert adds a third commit that removes bug.js. The bad commit stays in history. This is generally the right shape for an undo on a shared branch."
                : undo === "soft"
                  ? "Soft reset moves the branch back. bug.js remains in the working directory AND staged for another commit."
                  : undo === "mixed"
                    ? "Mixed reset moves the branch back and resets the index. bug.js remains in your folder as an untracked file because it did not exist at the target commit."
                    : "Hard reset moves the branch back and resets tracked files and the index. bug.js is removed. On your machine, uncommitted tracked edits can be lost permanently."}
          </p>
        </div>
      </section>
      <div className="next-lesson">
        <div>
          <span className="eyebrow">
            WHAT IF BOTH PEOPLE EDIT THE SAME LINE?
          </span>
          <h3>A conflict is a question. You have the answer.</h3>
        </div>
        <ButtonLink href="/scenarios/conflict">Resolve a conflict</ButtonLink>
      </div>
    </>
  );
}
const teamSteps = [
  {
    title: "Start with a branch",
    description:
      "You need to add a login form to a shared project. Where should your work begin?",
    options: [
      "Commit directly to shared main",
      "Create feature/login from the updated main branch",
      "Delete main and start fresh",
    ],
    answer: 1,
    explanation:
      "A focused feature branch isolates your work and gives the team a clear diff to review.",
    command: "git switch -c feature/login",
  },
  {
    title: "Save a focused change",
    description:
      "The login form works locally. How do you create a useful snapshot?",
    options: [
      "Stage the relevant files and commit with a clear message",
      "Push every file without committing",
      "Create a release tag immediately",
    ],
    answer: 0,
    explanation:
      "Review your diff, stage relevant changes, and create a commit. A local test is useful before sharing.",
    command: 'git add login.js\ngit commit -m "Add login form"',
  },
  {
    title: "Share for review",
    description:
      "Your commit is ready. How will your teammates review the feature?",
    options: [
      "Email your .git folder",
      "Force-push your branch over main",
      "Push the feature and open a pull request",
    ],
    answer: 2,
    explanation:
      "Push makes the branch available. A pull request compares it with main and gives reviewers a place to discuss it.",
    command: "git push -u origin feature/login",
  },
  {
    title: "The build is red",
    description:
      "In this example, the PR’s automated test reports a failing login validation test. What next?",
    options: [
      "Ignore the failing check and merge",
      "Fix the test failure locally, commit, and push to the same branch",
      "Delete the pipeline",
    ],
    answer: 1,
    explanation:
      "The PR updates when you push more commits to its branch. The configured pipeline can test that exact new commit.",
    command: 'git add login.js\ngit commit -m "Fix login validation"\ngit push',
  },
  {
    title: "A reviewer has a suggestion",
    description:
      "Checks now pass in the example. Your teammate spots an edge case. What should you do?",
    options: [
      "Hide the comment",
      "Merge because checks passed",
      "Discuss it, make the agreed change, and request review again",
    ],
    answer: 2,
    explanation:
      "Automated checks and human review catch different problems. Both are part of a reliable collaboration process.",
    command: null,
  },
  {
    title: "Bring it home",
    description:
      "Required reviews and checks pass. You merge the pull request on GitHub. What should your local clone do next?",
    options: [
      "Switch to main and pull with a deliberate strategy",
      "Run git init again",
      "Keep using the old main forever",
    ],
    answer: 0,
    explanation:
      "Update local main after the remote merge. --ff-only stops for inspection if your local main has diverged.",
    command: "git switch main\ngit pull --ff-only origin main",
  },
];
export function Collaboration() {
  const [index, setIndex] = useState(0),
    [answer, setAnswer] = useState(null);
  const { completeLesson } = useProgress();
  const finished = index === teamSteps.length,
    current = teamSteps[index];
  const icons = [
    GitBranch,
    Database,
    GitPullRequest,
    Terminal,
    ShieldCheck,
    GitMerge,
  ];
  return (
    <>
      <SectionHeading
        eyebrow="03 / WORK TOGETHER"
        title="From your laptop to the whole team."
        description="Walk through a pull request. Make the decisions. See why the workflow exists."
      >
        <Badge color="blue">Guided team scenario</Badge>
      </SectionHeading>
      <div className="team-flow">
        {teamSteps.map((s, i) => {
          const Icon = icons[i];
          return (
            <div
              className={`${i === index ? "active" : ""} ${i < index ? "done" : ""}`}
              key={s.title}
            >
              <span>
                {i < index ? <Check size={21} /> : <Icon size={21} />}
              </span>
              <strong>
                {
                  [
                    "Branch",
                    "Commit",
                    "Pull request",
                    "CI checks",
                    "Review",
                    "Merge",
                  ][i]
                }
              </strong>
              {i < 5 && <ChevronArrow />}
            </div>
          );
        })}
      </div>
      <div className="team-layout">
        <section className="panel team-question">
          {!finished ? (
            <>
              <div className="eyebrow">
                ILLUSTRATED WORKFLOW · DECISION {index + 1} / 6
              </div>
              <h2>{current.title}</h2>
              <p>{current.description}</p>
              <div className="team-options">
                {current.options.map((option, i) => (
                  <button
                    disabled={answer === current.answer}
                    className={
                      answer === i
                        ? i === current.answer
                          ? "correct"
                          : "incorrect"
                        : ""
                    }
                    key={option}
                    onClick={() => setAnswer(i)}
                  >
                    <span>{String.fromCharCode(65 + i)}</span>
                    {option}
                    {answer === i && i === current.answer && (
                      <Check size={18} />
                    )}
                  </button>
                ))}
              </div>
              {answer !== null && (
                <div className="team-feedback" role="status">
                  <p>
                    {answer === current.answer
                      ? current.explanation
                      : "Think about keeping work reviewable and meeting the team’s checks. Try another action."}
                  </p>
                  {answer === current.answer && (
                    <>
                      {current.command && (
                        <CodeBlock command={current.command} />
                      )}
                      <button
                        className="button primary"
                        onClick={() => {
                          if (index === teamSteps.length - 1)
                            completeLesson("collaboration");
                          setIndex((i) => i + 1);
                          setAnswer(null);
                        }}
                      >
                        Continue
                        <ArrowRight size={16} />
                      </button>
                    </>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="success-card">
              <Trophy size={40} />
              <h2>You shipped it together.</h2>
              <p>
                A branch isolates the work. Commits tell the story. A pull
                request brings in review and checks. A merge integrates the
                result.
              </p>
              <ButtonLink href="/scenarios/pull-request">
                Try it on GitHub
              </ButtonLink>
              <button
                className="quiet-button"
                onClick={() => {
                  setIndex(0);
                  setAnswer(null);
                }}
              >
                Replay the workflow
              </button>
            </div>
          )}
        </section>
        <aside>
          <div className="panel">
            <Badge color="purple">GIT ≠ GITHUB</Badge>
            <h3>Two different jobs.</h3>
            <p>
              <strong>Git</strong> tracks versions on your machine. Commits,
              branches, and merges work locally.
            </p>
            <p>
              <strong>GitHub</strong> hosts repositories and adds collaboration
              tools, including pull requests and branch rules.
            </p>
            <div className="notice">
              <Info size={17} />
              <span>
                This walkthrough is an example. It does not connect to GitHub or
                run a real CI pipeline.
              </span>
            </div>
          </div>
          <div className="panel">
            <h3>Where Jenkins fits</h3>
            <p>
              A configured webhook or polling can trigger a pipeline after a
              push. Jenkins checks out a commit, runs your build and tests, and
              reports the result.
            </p>
            <p>
              A passing build belongs to an exact commit. A branch name can
              move.
            </p>
            <CodeBlock command="git rev-parse HEAD" />
          </div>
        </aside>
      </div>
      <div className="next-lesson">
        <div>
          <span className="eyebrow">TRY THE REMOTE SIDE</span>
          <h3>Fetch first. Understand what arrived.</h3>
        </div>
        <ButtonLink href="/scenarios/fetch-pull">Practice fetching</ButtonLink>
      </div>
    </>
  );
}
function ChevronArrow() {
  return <ArrowRight className="team-arrow" size={18} />;
}
