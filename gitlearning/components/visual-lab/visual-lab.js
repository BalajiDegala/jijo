"use client";
import { useEffect, useState } from "react";
import { ChevronDown, GitBranch } from "lucide-react";
import { lessonById, lifecycle } from "@/lib/visual-lab/curriculum";
import { useProgress } from "../providers";
import { Branches } from "../lessons";
import { LessonPlayer } from "./lesson-player";
import { TopicPicker } from "./topic-picker";

export function VisualLab() {
  const { progress, ready } = useProgress();
  const [selected, setSelected] = useState(null),
    [picker, setPicker] = useState(false);
  const [mode, setMode] = useState("learn");
  useEffect(() => {
    if (ready && selected === null) {
      const linked = window.location.hash.slice(1);
      setSelected(
        (lessonById(linked) || lessonById(progress.visualLab.last) || lifecycle)
          .id,
      );
    }
  }, [ready, selected, progress.visualLab.last]);
  useEffect(() => {
    function openLinkedLesson() {
      const linked = lessonById(window.location.hash.slice(1));
      if (!linked) return;
      setSelected(linked.id);
      setMode("learn");
      setPicker(false);
    }
    window.addEventListener("hashchange", openLinkedLesson);
    return () => window.removeEventListener("hashchange", openLinkedLesson);
  }, []);
  const lesson = lessonById(selected) || lifecycle;
  function select(id) {
    setSelected(id);
    setMode("learn");
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}#${id}`,
    );
  }
  return (
    <div className="vl-lab">
      <header className="vl-header">
        <div className="vl-brand">
          <GitBranch size={21} />
          <h1>Git Visual Lab</h1>
          <span>SEE WHAT CHANGES</span>
        </div>
        <div className="vl-mode" role="group" aria-label="Visual lab mode">
          <button
            aria-pressed={mode === "learn"}
            onClick={() => setMode("learn")}
          >
            Guided lessons
          </button>
          <button
            aria-pressed={mode === "compare"}
            onClick={() => setMode("compare")}
          >
            Compare operations
          </button>
        </div>
        <button
          className="ide-button vl-topic-trigger"
          onClick={() => setPicker(true)}
          aria-haspopup="dialog"
        >
          <span>Choose topic</span>
          <ChevronDown size={15} />
        </button>
      </header>
      {mode === "compare" ? (
        <div className="vl-comparison-scroll">
          <Branches />
        </div>
      ) : ready && selected ? (
        <LessonPlayer
          key={lesson.id}
          lesson={lesson}
          saved={progress.visualLab.records[lesson.id]}
          onSelect={select}
          suspended={picker}
        />
      ) : (
        <div className="loading-state">Opening your visual lesson…</div>
      )}
      <TopicPicker
        open={picker}
        onClose={() => setPicker(false)}
        onSelect={select}
        current={lesson.id}
        progress={progress.visualLab}
      />
    </div>
  );
}
