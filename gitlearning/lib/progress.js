import {
  blankVisualProgress,
  readVisualProgress,
} from "./visual-lab/progress.js";
export const STORAGE_KEY = "gitquest-progress-v1";
export const blankProgress = () => ({
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
  visualLab: blankVisualProgress(),
});
export function readProgress(storage) {
  try {
    const p = JSON.parse(storage.getItem(STORAGE_KEY));
    if (!p || typeof p !== "object") return blankProgress();
    return {
      visualLab: readVisualProgress(p.visualLab),
      lessons: Array.isArray(p.lessons)
        ? p.lessons.filter((x) => typeof x === "string")
        : [],
      scenarios: Array.isArray(p.scenarios)
        ? p.scenarios.filter((x) => typeof x === "string")
        : [],
      steps:
        p.steps && typeof p.steps === "object" && !Array.isArray(p.steps)
          ? p.steps
          : {},
      answers:
        p.answers && typeof p.answers === "object" && !Array.isArray(p.answers)
          ? p.answers
          : {},
      lastScenario: typeof p.lastScenario === "string" ? p.lastScenario : null,
      ...Object.fromEntries(
        ["verified", "assessments", "machine", "revision"].map((k) => [
          k,
          Array.isArray(p[k]) ? p[k].filter((x) => typeof x === "string") : [],
        ]),
      ),
      checks:
        p.checks && typeof p.checks === "object" && !Array.isArray(p.checks)
          ? p.checks
          : {},
      selfRatings:
        p.selfRatings &&
        typeof p.selfRatings === "object" &&
        !Array.isArray(p.selfRatings)
          ? p.selfRatings
          : {},
      activity: Array.isArray(p.activity)
        ? p.activity
            .filter(
              (a) =>
                a && typeof a.title === "string" && typeof a.at === "string",
            )
            .slice(0, 40)
        : [],
    };
  } catch {
    return blankProgress();
  }
}
export function writeProgress(storage, progress) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}
