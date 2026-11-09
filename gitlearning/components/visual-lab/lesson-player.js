"use client";
import { useEffect, useMemo, useReducer, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  Terminal,
} from "lucide-react";
import { prepareLesson } from "@/lib/visual-lab/trace";
import { initialPlayback, playbackReducer } from "@/lib/visual-lab/playback";
import { recordVisualStep } from "@/lib/visual-lab/progress";
import { visualLessons } from "@/lib/visual-lab/curriculum";
import { inspectCommit, lessonLayout } from "@/lib/visual-lab/focus";
import { FocusInspector } from "./focus-inspector";
import { useProgress } from "../providers";
import { RepositoryScene, FileInspector } from "./repository-scene";

export function LessonPlayer({ lesson, saved, onSelect, suspended }) {
  const frames = useMemo(() => prepareLesson(lesson), [lesson]);
  const layout = useMemo(() => lessonLayout(frames), [frames]);
  const reduced = useReducedMotion();
  const last = frames.length - 1;
  const [player, dispatch] = useReducer(
    playbackReducer,
    Math.min(saved?.version === lesson.version ? saved.cursor : 0, last),
    initialPlayback,
  );
  const [file, setFile] = useState(null),
    [answer, setAnswer] = useState(null);
  const [panel, setPanel] = useState("animation"),
    [transcript, setTranscript] = useState(false);
  const [manual, setManual] = useState(null);
  const { setProgress } = useProgress();
  const frame = frames[player.cursor],
    complete = player.cursor === last;
  const action = (type, extra = {}) => {
    if (["next", "previous", "seek", "replay", "restart"].includes(type))
      setManual(null);
    dispatch({ type, last, ...extra });
  };
  const pause = () => dispatch({ type: "pause" });
  const checkVisible = frame.checkpoint || complete;
  const focus = useMemo(
    () =>
      manual?.cursor === player.cursor
        ? inspectCommit(frame.state, manual.id)
        : frame.focus,
    [frame, manual, player.cursor],
  );
  const focusBeat = focus.kind === "manual" ? -1 : player.beat;
  const inspect = (id) => {
    pause();
    setManual({ id, cursor: player.cursor });
  };
  const nextLesson =
    visualLessons[visualLessons.findIndex((item) => item.id === lesson.id) + 1];
  useEffect(() => {
    if (suspended) dispatch({ type: "pause" });
  }, [suspended]);
  useEffect(() => {
    setProgress((previous) =>
      recordVisualStep(previous, lesson, player.cursor),
    );
  }, [lesson, player.cursor, setProgress]);
  useEffect(() => {
    if (player.explaining && (reduced || !frame.focus.beats.length)) {
      dispatch({ type: "settle" });
      return;
    }
    if (!player.playing && !player.explaining) return;
    const timer = setTimeout(
      () =>
        player.explaining
          ? dispatch({ type: "beat", count: frame.focus.beats.length })
          : dispatch({
              type: "tick",
              last,
              stops: frames.flatMap((item, index) =>
                item.stop ? [index] : [],
              ),
            }),
      (player.explaining ? 850 : 4600) / player.speed,
    );
    return () => clearTimeout(timer);
  }, [
    player.playing,
    player.explaining,
    player.beat,
    player.cursor,
    player.speed,
    frames,
    frame,
    last,
    reduced,
  ]);
  useEffect(() => {
    const hidden = () => {
      if (document.hidden) dispatch({ type: "pause" });
    };
    document.addEventListener("visibilitychange", hidden);
    return () => document.removeEventListener("visibilitychange", hidden);
  }, []);
  function answerCheck(index) {
    setAnswer(index);
    pause();
    if (index === lesson.check.correct)
      setProgress((previous) =>
        recordVisualStep(previous, lesson, player.cursor, true),
      );
  }
  function keyboard(event) {
    if (
      event.target !== event.currentTarget ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    )
      return;
    if (["ArrowLeft", "ArrowRight", " "].includes(event.key)) {
      event.preventDefault();
      action(
        event.key === "ArrowLeft"
          ? "previous"
          : event.key === "ArrowRight"
            ? "next"
            : "toggle",
      );
    }
  }
  return (
    <section
      className="vl-player"
      aria-label="Visual lesson player"
      tabIndex={0}
      onKeyDown={keyboard}
      data-panel={panel}
    >
      <div className="vl-lesson-heading">
        <div>
          <span className="eyebrow">
            {lesson.id === "L01"
              ? "START HERE · THE EVERYDAY FLOW"
              : `${lesson.id} · LEVEL ${lesson.level}`}
          </span>
          <h2>{lesson.title}</h2>
          <p>{lesson.objective}</p>
        </div>
        <button
          className="vl-text-button"
          aria-pressed={transcript}
          onClick={() => {
            pause();
            setTranscript((value) => !value);
          }}
        >
          {" "}
          {transcript ? "Show animation" : "Read transcript"}
        </button>
      </div>
      <div className="vl-mobile-tabs" role="group" aria-label="Lesson panels">
        {[
          ["animation", "Animation"],
          ["explanation", "Explanation"],
          ["files", "Files"],
        ].map(([value, label]) => (
          <button
            key={value}
            aria-pressed={panel === value}
            onClick={() => {
              pause();
              setPanel(value);
            }}
          >
            {label}
            {value === "explanation" && checkVisible ? " · Check" : ""}
          </button>
        ))}
      </div>
      <div className="vl-mobile-command" aria-live="polite">
        <Terminal size={13} />
        <code>{frame.command || frame.title}</code>
      </div>
      <div className={`vl-stage ${transcript ? "vl-reading" : ""}`}>
        <div className="vl-scene">
          {transcript ? (
            <div className="vl-transcript" aria-label="Lesson transcript">
              <h3>Every step, in plain text</h3>
              <p>
                Choose any step to inspect its saved state. Going backward
                rewinds the explanation.
              </p>
              <ol>
                {frames.map((item, index) => (
                  <li
                    key={index}
                    aria-current={index === player.cursor ? "step" : undefined}
                  >
                    <button onClick={() => action("seek", { cursor: index })}>
                      <span>{index === 0 ? "Start" : `Step ${index}`}</span>
                      <code>{item.command || item.title}</code>
                    </button>
                    <p>{item.why}</p>
                    <p>
                      <strong>Result:</strong> {item.expect}
                    </p>
                    {item.danger && <p className="vl-caution">{item.danger}</p>}
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <RepositoryScene
              frame={frame}
              focus={focus}
              layout={layout}
              beat={focusBeat}
              speed={player.speed}
              graphPrimary={lesson.level === 2 && lesson.id !== "V12"}
              motionPaused={
                focus.kind !== "manual" &&
                player.beat >= 0 &&
                !player.explaining
              }
              explaining={player.explaining}
              onResume={() => action("resume-explanation")}
              onCommitInspect={inspect}
              replay={player.replay}
              pause={pause}
              onInspect={(path) => {
                pause();
                setFile(path);
              }}
            />
          )}
        </div>
        <aside className="vl-explanation" aria-label="Step explanation">
          <div className="vl-step-heading">
            <span>
              STEP {player.cursor} / {last}
            </span>
            <span>
              {player.playing
                ? "Playing"
                : complete
                  ? "Story complete"
                  : "Paused"}
            </span>
          </div>
          <div className="vl-command" aria-live="polite">
            <Terminal size={16} />
            <code>{frame.command || frame.title}</code>
          </div>
          <h3>Why this step?</h3>
          <p>{frame.why}</p>
          <FocusInspector
            focus={focus}
            state={frame.state}
            onInspect={inspect}
            onReturn={() => {
              setManual(null);
              dispatch({ type: "settle" });
            }}
          />
          <div className="vl-expect">
            <Lightbulb size={17} />
            <p>{frame.expect}</p>
          </div>
          {frame.kind === "concept" && (
            <span className="vl-small-label">
              Conceptual explanation · no Git command runs
            </span>
          )}
          {frame.events.length > 0 && (
            <details className="vl-details">
              <summary>What changed?</summary>
              <ul>
                {frame.events.map((event, index) => (
                  <li key={index}>{event.text}</li>
                ))}
              </ul>
            </details>
          )}
          {frame.unchanged.length > 0 && (
            <details className="vl-details">
              <summary>What stayed the same?</summary>
              <ul>
                {frame.unchanged.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </details>
          )}
          {frame.output && (
            <details
              className="vl-details"
              open={Boolean(
                frame.command?.match(/^git (diff|status|show|log|reflog)/),
              )}
              key={player.cursor}
            >
              <summary>
                {frame.error ? "Expected rejection" : "Command output"}
              </summary>
              <pre>{frame.output}</pre>
            </details>
          )}
          {frame.danger && <p className="vl-caution">{frame.danger}</p>}
          {checkVisible && (
            <div className="vl-check">
              <span className="eyebrow">
                {complete ? "CHECK YOUR UNDERSTANDING" : "PAUSE & PREDICT"}
              </span>
              <h3>{lesson.check.prompt}</h3>
              <div>
                {lesson.check.options.map((option, index) => (
                  <button
                    key={option}
                    aria-pressed={answer === index}
                    onClick={() => answerCheck(index)}
                    className={
                      answer === index
                        ? index === lesson.check.correct
                          ? "correct"
                          : "incorrect"
                        : ""
                    }
                  >
                    {answer === index && index === lesson.check.correct && (
                      <CheckCircle2 size={15} />
                    )}
                    {option}
                  </button>
                ))}
              </div>
              {answer !== null && (
                <p role="status">
                  {answer === lesson.check.correct
                    ? "Correct. "
                    : "Try again. "}
                  {lesson.check.explanation}
                </p>
              )}
              <small>
                Watching and passing this check are saved separately.
              </small>
            </div>
          )}
          {complete && (
            <div className="vl-finish">
              <h3>Make it yours</h3>
              <p>{lesson.mistake}</p>
              <Link
                href={`/scenarios/${lesson.scenario}`}
                className="ide-button"
                onClick={pause}
              >
                Practise in the simulator <ArrowRight size={14} />
              </Link>
              {nextLesson && (
                <button
                  className="vl-text-button"
                  onClick={() => onSelect(nextLesson.id)}
                >
                  Next: {nextLesson.title}
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          )}
          <div className="vl-related">
            <Link href={`/scenarios/${lesson.scenario}`} onClick={pause}>
              Browser & machine practice <ArrowRight size={13} />
            </Link>
            <Link href={`/learn/${lesson.interview}`} onClick={pause}>
              Related interview lesson <ArrowRight size={13} />
            </Link>
            <details>
              <summary>Source & clarification</summary>
              <p>
                git-docs.md, lines{" "}
                {lesson.source.map(([from, to]) => `${from}–${to}`).join(", ")}.
              </p>
              <p>{lesson.mistake}</p>
              <Link href="/">Open Learn to read the original git-docs.md</Link>
            </details>
          </div>
        </aside>
      </div>
      {checkVisible && panel !== "explanation" && (
        <button
          className="vl-mobile-check"
          onClick={() => {
            pause();
            setPanel("explanation");
          }}
        >
          {" "}
          {complete
            ? "Check your understanding"
            : "Pause & predict before continuing"}{" "}
          <ArrowRight size={14} />
        </button>
      )}
      <div className="vl-playback" aria-label="Playback controls">
        <div className="vl-timeline">
          <span>
            {player.cursor.toString().padStart(2, "0")} /{" "}
            {last.toString().padStart(2, "0")}
          </span>
          <input
            type="range"
            min="0"
            max={last}
            value={player.cursor}
            aria-label="Lesson timeline"
            aria-valuetext={`Step ${player.cursor} of ${last}: ${frame.command || frame.title}`}
            onChange={(event) =>
              action("seek", { cursor: Number(event.target.value) })
            }
          />
          <span>
            {complete
              ? "Ready to practise"
              : frame.checkpoint
                ? "Prediction checkpoint"
                : "Explore every step"}
          </span>
        </div>
        <div className="vl-controls">
          <button
            className="vl-control-secondary"
            onClick={() => {
              action("restart");
              setAnswer(null);
            }}
            aria-label="Restart lesson"
          >
            <SkipBack size={16} />
            <span>Restart</span>
          </button>
          <div className="vl-transport">
            <button
              className="ide-button"
              aria-label="Previous step"
              disabled={player.cursor === 0}
              onClick={() => action("previous")}
            >
              <ChevronLeft size={17} />
              <span>Previous</span>
            </button>
            <button
              className="vl-play-button"
              aria-label={player.playing ? "Pause lesson" : "Play lesson"}
              disabled={complete}
              onClick={() => action("toggle")}
            >
              {player.playing ? <Pause size={17} /> : <Play size={17} />}
              <span>{player.playing ? "Pause" : "Play"}</span>
            </button>
            <button
              className="ide-button"
              aria-label="Next step"
              disabled={complete}
              onClick={() => action("next")}
            >
              <span>Next</span>
              <ChevronRight size={17} />
            </button>
          </div>
          <div className="vl-speed">
            <button
              className="vl-control-secondary"
              aria-label="Replay step"
              onClick={() => action("replay")}
            >
              <RotateCcw size={15} />
              <span>Replay step</span>
            </button>
            <select
              aria-label="Playback speed"
              value={player.speed}
              onChange={(event) =>
                action("speed", { speed: Number(event.target.value) })
              }
            >
              {[0.5, 1, 1.5, 2].map((speed) => (
                <option value={speed} key={speed}>
                  {speed}×
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="vl-playback-note">
          <ArrowLeft size={11} />
          <ArrowRight size={11} /> Focus the player to step with arrow keys ·
          Back rewinds the explanation
        </p>
      </div>
      <FileInspector file={file} frame={frame} onClose={() => setFile(null)} />
    </section>
  );
}
