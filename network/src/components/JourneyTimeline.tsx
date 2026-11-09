import { useEffect, useId, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { useLab } from "../store";
import { explainTraceEvent } from "../engine/traceTeaching";

export function JourneyTimeline() {
  const { result, step, playing, speed } = useLab();
  const strip = useRef<HTMLDivElement>(null);
  const active = useRef<HTMLButtonElement>(null);
  const stripId = useId();
  const [edges, setEdges] = useState({ start: true, end: false });
  const updateEdges = () => {
    const element = strip.current;
    if (!element) return;
    const start = element.scrollLeft <= 1;
    const end =
      element.scrollLeft + element.clientWidth >= element.scrollWidth - 1;
    setEdges((previous) =>
      previous.start === start && previous.end === end
        ? previous
        : { start, end },
    );
  };
  useEffect(() => {
    const element = strip.current;
    if (!element || !result) return;
    const revealStep = () => {
      const button = active.current;
      if (button) {
        const bounds = element.getBoundingClientRect();
        const selected = button.getBoundingClientRect();
        // Scroll only the timeline; advancing a packet must not move the page.
        if (step === 0) element.scrollLeft = 0;
        else if (step === result.events.length - 1)
          element.scrollLeft = element.scrollWidth;
        else if (selected.left < bounds.left + 8)
          element.scrollLeft += selected.left - bounds.left - 8;
        else if (selected.right > bounds.right - 8)
          element.scrollLeft += selected.right - bounds.right + 8;
      }
      updateEdges();
    };
    revealStep();
    const observer = new ResizeObserver(revealStep);
    observer.observe(element);
    return () => observer.disconnect();
  }, [step, result]);

  if (!result) return null;
  const title = explainTraceEvent(result.events[step]).title;
  const selectStep = (next: number) =>
    useLab.setState({ step: next, playing: false });
  return (
    <section className="journey-timeline" aria-label="Packet flow">
      <div className="playback">
        <strong className="flow-caption">Packet flow</strong>
        <div className="playback-controls">
          <button
            aria-label="Replay"
            onClick={() => useLab.setState({ step: 0, playing: true })}
          >
            <RotateCcw size={15} />
            <span>Replay</span>
          </button>
          <button
            aria-label="Previous hop"
            disabled={step === 0}
            onClick={() => selectStep(step - 1)}
          >
            <ChevronLeft size={17} />
            <span>Back</span>
          </button>
          <button
            aria-label={playing ? "Pause" : "Play"}
            className="play-button"
            onClick={() =>
              useLab.setState({
                playing: !playing,
                step: step === result.events.length - 1 ? 0 : step,
              })
            }
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
            <span>{playing ? "Pause" : "Play"}</span>
          </button>
          <button
            aria-label="Next hop"
            disabled={step === result.events.length - 1}
            onClick={() => selectStep(step + 1)}
          >
            <ChevronRight size={17} />
            <span>Next step</span>
          </button>
          <button
            aria-label="Skip to result"
            onClick={() => selectStep(result.events.length - 1)}
          >
            <ChevronsRight size={17} />
            <span>Result</span>
          </button>
        </div>
        <input
          aria-label="Packet journey position"
          aria-valuetext={`Step ${step + 1} of ${result.events.length}: ${title}`}
          type="range"
          min={0}
          max={result.events.length - 1}
          value={step}
          onChange={(event) => selectStep(Number(event.target.value))}
        />
        <span className="flow-count">
          Step {step + 1} of {result.events.length}
        </span>
        <select
          aria-label="Playback speed"
          value={speed}
          onChange={(event) =>
            useLab.setState({ speed: Number(event.target.value) })
          }
        >
          {[0.5, 1, 2, 4].map((value) => (
            <option value={value} key={value}>
              {value}×
            </option>
          ))}
        </select>
      </div>
      <div className="flow-steps">
        <button
          className="flow-scroll"
          aria-label="Scroll to earlier steps"
          aria-controls={stripId}
          disabled={edges.start}
          onClick={() =>
            strip.current?.scrollBy({ left: -strip.current.clientWidth * 0.8 })
          }
        >
          <ChevronLeft size={20} />
        </button>
        <div
          className="event-strip"
          id={stripId}
          ref={strip}
          onScroll={updateEdges}
        >
          {result.events.map((event, index) => (
            <button
              key={index}
              ref={index === step ? active : undefined}
              title={event.explanation}
              aria-label={`Step ${index + 1} of ${result.events.length}: ${explainTraceEvent(event).title}`}
              aria-current={index === step ? "step" : undefined}
              className={`${index === step ? "active" : ""} ${event.type === "drop" ? "failed" : ""} ${index < step ? "visited" : ""}`}
              onClick={() => selectStep(index)}
            >
              <b>{String(index + 1).padStart(2, "0")}</b>
              <span>{explainTraceEvent(event).title}</span>
            </button>
          ))}
        </div>
        <button
          className="flow-scroll"
          aria-label="Scroll to later steps"
          aria-controls={stripId}
          disabled={edges.end}
          onClick={() =>
            strip.current?.scrollBy({ left: strip.current.clientWidth * 0.8 })
          }
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}
