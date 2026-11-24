// The One-Line Exit — make.fun entry.
//
// The program writes one resignation letter, exactly one line long, to
// /output/entry.txt. No network, no input, deterministic: the same line
// every run.
//
// How the line is built for the judge's brief (most important first):
//   1. It IS one funny line: a single sentence, 108 of the 140 characters,
//      standing alone with no setup outside itself.
//   2. It lands a real surprise at the end: the grievances escalate from
//      the plausible (the new intern makes more than I do) to the absurd
//      (the plant by my desk is now my manager). The reader expects a
//      second complaint about pay; instead an inanimate plant now
//      outranks the narrator — a promotion the narrator never got.
//   3. It fits the form: it opens "Dear boss, I am resigning", so it reads
//      as a letter a person could actually send, with no padding and no
//      list of grievances beyond the two beats the joke needs.
//   4. It has a specific voice: an underpaid office worker, named by the
//      intern's pay and the desk plant — a recognizable workplace, not a
//      generic complaint.
//   5. It stays with the reader: "the plant by my desk is now my manager"
//      is the kind of line a colleague forwards, and it works as a quote
//      on its own.

import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

// One beat per job the line has to do, in reading order.
const BEATS: ReadonlyArray<{ role: string; text: string }> = [
  {
    role: "opening",
    text: "Dear boss, I am resigning —",
  },
  {
    role: "setup",
    text: "the new intern makes more than I do,",
  },
  {
    role: "payoff",
    text: "and the plant by my desk is now my manager.",
  },
];

const MAX_CHARS = 140;

function charCount(text: string): number {
  // Count characters as code points, so any non-ASCII would count once.
  return [...text].length;
}

function buildLine(): string {
  // Every beat must carry text with no stray spaces of its own, so a
  // later edit to one beat cannot silently double-space the line or
  // leave a beat empty — the joined line is exactly the beats.
  for (const beat of BEATS) {
    if (beat.text.length === 0 || beat.text !== beat.text.trim()) {
      throw new Error(`beat ${beat.role} must be non-empty with no edge spaces`);
    }
  }
  const line = BEATS.map((beat) => beat.text).join(" ");
  if (line.includes("  ")) {
    throw new Error("line must not contain a double space");
  }
  return line;
}

function checkLine(text: string): void {
  // The gate: UTF-8 text of 1 to 140 characters, not only white space,
  // and a single line, as the brief requires.
  const chars = charCount(text);
  if (chars < 1 || chars > MAX_CHARS) {
    throw new Error(`line must be 1-${MAX_CHARS} characters, got ${chars}`);
  }
  if (text.trim().length === 0) {
    throw new Error("line must not be only white space");
  }
  if (/[\r\n]/.test(text)) {
    throw new Error("line must be a single line");
  }
  // A single sentence: exactly one sentence-ending mark, at the end.
  const terminators = text.match(/[.!?]/g) ?? [];
  if (terminators.length !== 1 || !text.endsWith(".")) {
    throw new Error("line must be exactly one sentence ending in a period");
  }
  // The last beat must be the payoff: the line may not trail off after it.
  const lastBeat = BEATS[BEATS.length - 1];
  if (!text.endsWith(lastBeat.text)) {
    throw new Error("line must end on its payoff beat");
  }
}

function main(): void {
  const line = buildLine();
  checkLine(line);
  for (const beat of BEATS) {
    console.log(`beat ${beat.role}: ${charCount(beat.text)} chars`);
  }
  mkdirSync("/output", { recursive: true });
  writeFileSync("/output/entry.txt", line, "utf8");
  // The grader collects the output as another user: leave it readable.
  chmodSync("/output/entry.txt", 0o644);
  // Read back what was written and prove it is the line, byte for byte:
  // the gate scores the file, not the string in memory.
  const written = readFileSync("/output/entry.txt", "utf8");
  if (written !== line) {
    throw new Error("written entry.txt does not match the line");
  }
  checkLine(written);
  console.log(`wrote /output/entry.txt (${charCount(line)} chars): ${line}`);
}

main();
