import test from "node:test";
import assert from "node:assert/strict";
import { readProgress, writeProgress, blankProgress } from "../lib/progress.js";
test("progress round-trips through browser-like storage", () => {
  let value = null;
  const storage = { getItem: () => value, setItem: (_, v) => (value = v) };
  const expected = {
    ...blankProgress(),
    scenarios: ["first-commit"],
    steps: { "first-commit": [0, 1] },
    answers: { stage: 1 },
  };
  assert.equal(writeProgress(storage, expected), true);
  assert.deepEqual(readProgress(storage), expected);
});
test("invalid and unavailable storage is handled without crashing", () => {
  assert.deepEqual(readProgress({ getItem: () => "{broken" }), blankProgress());
  assert.deepEqual(
    readProgress({
      getItem: () => {
        throw Error("blocked");
      },
    }),
    blankProgress(),
  );
  assert.equal(
    writeProgress(
      {
        setItem: () => {
          throw Error("quota");
        },
      },
      blankProgress(),
    ),
    false,
  );
});
