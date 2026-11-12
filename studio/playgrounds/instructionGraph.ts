export interface Instruction { prefix: string[]; text: string; verb: string }
export function readInstructions(source: string) {
  const newline = source.includes('\r\n') ? '\r\n' : '\n';
  const lines = source.split(/\r?\n/);
  const steps: Instruction[] = [];
  let prefix: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.trimStart().startsWith('#')) { prefix.push(line); continue; }
    let text = line;
    while (text.endsWith('\\') && i + 1 < lines.length) text += newline + lines[++i];
    steps.push({ prefix, text, verb: text.trimStart().split(/\s+/,1)[0].toUpperCase() });
    prefix = [];
  }
  return { steps, tail: prefix, newline };
}
export function writeInstructions(doc: ReturnType<typeof readInstructions>, steps: Instruction[]) {
  return [...steps.flatMap(s => [...s.prefix,s.text]), ...doc.tail].join(doc.newline);
}
export function canSequence(steps: Instruction[], before: number, after: number) {
  return Number.isInteger(before) && Number.isInteger(after) && before >= 0 && after > before + 1 &&
    after < steps.length && steps[after].verb !== 'FROM' && steps[before].verb !== 'CMD' && steps[after].verb !== 'CMD';
}
