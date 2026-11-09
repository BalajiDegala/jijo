export const levels = [
  "Files become history", "Navigate safely", "Share and synchronize",
  "Combine changes", "Recover with confidence", "The complete lifecycle",
];
export function step(command, why, expect, extra = {}) {
  return { command, why, expect, ...extra };
}
export function concept(title, why, expect, extra = {}) {
  return { title, why, expect, kind: "concept", ...extra };
}
export function module(id, title, fixture, source, scenario, question, objective, steps, check, extra = {}) {
  const number = Number(id.slice(1));
  return {
    id, title, fixture, source, scenario, interview: `q${String(question).padStart(2, "0")}`,
    level: Math.ceil(number / 6), version: 1, objective, steps,
    check: { prompt: check[0], options: check[1], correct: check[2], explanation: check[3] },
    prerequisites: number > 1 ? [`V${String(number - 1).padStart(2, "0")}`] : [],
    ...extra,
  };
}
