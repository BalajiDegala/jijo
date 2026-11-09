import { create } from "zustand";
import type { Page } from "./store";
import type { SendRequest, SimulationResult, Topology } from "./engine/types";

export interface ExperimentSnapshot {
  topology: Topology;
  past: Topology[];
  future: Topology[];
  page: Page;
  request: SendRequest;
  selectedId?: string;
  result?: SimulationResult;
  step: number;
  challengeId?: number;
}
interface Preferences {
  textSize: "standard" | "large" | "extra";
  guided: boolean;
  welcomed: boolean;
  lessonId: string | null;
  lessonStep: number;
  completed: string[];
}
const defaults: Preferences = {
  textSize: "standard",
  guided: true,
  welcomed: false,
  lessonId: null,
  lessonStep: 0,
  completed: [],
};
function readPreferences(): Preferences {
  try {
    const saved = JSON.parse(
      localStorage.getItem("netverse.learning.v1") ?? "{}",
    );
    return {
      textSize: ["standard", "large", "extra"].includes(saved.textSize)
        ? saved.textSize
        : "standard",
      guided: typeof saved.guided === "boolean" ? saved.guided : true,
      welcomed: saved.welcomed === true,
      lessonId: typeof saved.lessonId === "string" ? saved.lessonId : null,
      lessonStep:
        Number.isInteger(saved.lessonStep) && saved.lessonStep >= 0
          ? saved.lessonStep
          : 0,
      completed: Array.isArray(saved.completed)
        ? saved.completed.filter((x: unknown) => typeof x === "string")
        : [],
    };
  } catch {
    return defaults;
  }
}
interface LearningState extends Preferences {
  glossary: string | null;
  previousExperiment?: ExperimentSnapshot;
  lessonLoaded: boolean;
  storageUnavailable: boolean;
  setPreferences: (patch: Partial<Preferences>) => void;
}
export const useLearning = create<LearningState>((set, get) => ({
  ...readPreferences(),
  glossary: null,
  lessonLoaded: false,
  storageUnavailable: false,
  setPreferences: (patch) => {
    set(patch);
    const { textSize, guided, welcomed, lessonId, lessonStep, completed } =
      get();
    try {
      localStorage.setItem(
        "netverse.learning.v1",
        JSON.stringify({
          textSize,
          guided,
          welcomed,
          lessonId,
          lessonStep,
          completed,
        }),
      );
    } catch {
      set({ storageUnavailable: true });
    }
  },
}));
