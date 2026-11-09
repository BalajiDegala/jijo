"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import { blankProgress, readProgress, writeProgress } from "@/lib/progress";
const Context = createContext(null);
export function Providers({ children }) {
  const [progress, setProgress] = useState(blankProgress),
    [ready, setReady] = useState(false),
    [storageError, setStorageError] = useState(false);
  useEffect(() => {
    try {
      setProgress(readProgress(window.localStorage));
    } catch {
      setStorageError(true);
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        setStorageError(!writeProgress(window.localStorage, progress));
      } catch {
        setStorageError(true);
      }
    }
  }, [progress, ready]);
  const completeLesson = (id) =>
    setProgress((p) => ({ ...p, lessons: [...new Set([...p.lessons, id])] }));
  const markStep = (id, index, checked, total) =>
    setProgress((p) => {
      const previous = Array.isArray(p.steps[id]) ? p.steps[id] : [];
      const steps = checked
        ? [...new Set([...previous, index])]
        : previous.filter((x) => x !== index);
      return {
        ...p,
        lastScenario: id,
        steps: { ...p.steps, [id]: steps },
        scenarios:
          steps.length === total
            ? [...new Set([...p.scenarios, id])]
            : p.scenarios.filter((x) => x !== id),
      };
    });
  return (
    <MotionConfig reducedMotion="user">
      <Context.Provider
        value={{
          progress,
          setProgress,
          completeLesson,
          markStep,
          ready,
          storageError,
        }}
      >
        {children}
      </Context.Provider>
    </MotionConfig>
  );
}
export const useProgress = () => useContext(Context);
