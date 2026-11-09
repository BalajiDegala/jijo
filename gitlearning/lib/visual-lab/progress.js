export const blankVisualProgress = () => ({ last: "L01", records: {} });
export function readVisualProgress(value) {
  const validId = (id) => typeof id === "string" && /^(?:L01|V\d{2})$/.test(id);
  const records = {};
  if (
    value?.records &&
    typeof value.records === "object" &&
    !Array.isArray(value.records)
  ) {
    for (const [id, record] of Object.entries(value.records)) {
      if (!validId(id) || !record || typeof record !== "object") continue;
      records[id] = {
        version:
          Number.isInteger(record.version) && record.version > 0
            ? record.version
            : 1,
        cursor:
          Number.isInteger(record.cursor) &&
          record.cursor >= 0 &&
          record.cursor <= 500
            ? record.cursor
            : 0,
        viewed: record.viewed === true,
        passed: record.passed === true,
      };
    }
  }
  return { last: validId(value?.last) ? value.last : "L01", records };
}
export function recordVisualStep(progress, lesson, cursor, passed = false) {
  const visual = readVisualProgress(progress.visualLab);
  const previous =
    visual.records[lesson.id]?.version === lesson.version
      ? visual.records[lesson.id]
      : {};
  const record = {
    version: lesson.version,
    cursor: Math.max(0, Math.min(lesson.steps.length, cursor)),
    viewed: previous.viewed === true || cursor === lesson.steps.length,
    passed: previous.passed === true || passed,
  };
  return {
    ...progress,
    visualLab: {
      last: lesson.id,
      records: { ...visual.records, [lesson.id]: record },
    },
  };
}
