"use client";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ChevronRight, Search, X } from "lucide-react";
import { visualLessons } from "@/lib/visual-lab/curriculum";
import { levels } from "@/lib/visual-lab/schema";

export function TopicPicker({ open, onClose, onSelect, current, progress }) {
  const dialog = useRef(null),
    input = useRef(null);
  const [query, setQuery] = useState("");
  useEffect(() => {
    if (open) {
      dialog.current?.showModal();
      input.current?.focus();
    } else dialog.current?.close();
  }, [open]);
  const results = visualLessons.filter((lesson) =>
    `${lesson.id} ${lesson.title} ${lesson.objective} ${lesson.steps.map((s) => s.command || s.title).join(" ")}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <dialog
      ref={dialog}
      className="vl-topics-dialog"
      aria-label="Choose a visual lesson"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="vl-dialog-heading">
        <div>
          <span className="eyebrow">EXPLORE AT YOUR OWN PACE</span>
          <h2>Choose a visual lesson</h2>
        </div>
        <button
          className="icon-button"
          aria-label="Close topics"
          onClick={onClose}
        >
          <X size={19} />
        </button>
      </div>
      <label className="vl-topic-search">
        <Search size={18} />
        <input
          ref={input}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search staging, HEAD, tags…"
          aria-label="Search visual lessons"
        />
      </label>
      <div className="vl-topic-results">
        {results.map((lesson) => {
          const passed =
            progress?.records?.[lesson.id]?.version === lesson.version &&
            progress.records[lesson.id].passed;
          return (
            <button
              key={lesson.id}
              className={`vl-topic-option ${current === lesson.id ? "selected" : ""}`}
              onClick={() => {
                onSelect(lesson.id);
                onClose();
              }}
              aria-current={current === lesson.id ? "true" : undefined}
            >
              <span className="vl-topic-number">
                {lesson.id === "L01" ? "START" : lesson.id}
              </span>
              <span>
                <small>
                  {lesson.id === "L01"
                    ? "The complete everyday flow"
                    : `Level ${lesson.level} · ${levels[lesson.level - 1]}`}
                </small>
                <strong>{lesson.title}</strong>
                <span>
                  {lesson.steps.length} steps
                  {passed ? " · Knowledge check passed" : ""}
                </span>
              </span>
              {passed ? <CheckCircle2 size={18} /> : <ChevronRight size={18} />}
            </button>
          );
        })}
        {!results.length && (
          <p className="vl-empty">
            No matching lesson. Try “commit”, “branch” or “restore”.
          </p>
        )}
      </div>
      <p className="vl-picker-note">
        13 playable stories · No prerequisites are locked.
      </p>
    </dialog>
  );
}
