// Finds what a rule can catch in a lesson step's wording: selling words, announcements, exclamation
// marks, emoji, headings and bullets, other languages' names, and sentences or steps that run long.
// Doesn't judge tone: that takes a person reading the step.
import { splitFront } from "./markdown";

/** The most words a sentence may have. */
const SENTENCE_WORDS = 30;
/** The most words of text a step may have, not counting code and the quiz. */
const STEP_WORDS = 120;

const SELLING = /\b(simply|just|easy|easily|effortless(?:ly)?|powerful|seamless(?:ly)?|elegant(?:ly)?|robust|blazing|magic(?:al)?|awesome|amazing|let's|let us|in this step|we'll|we will)\b/gi;

// Case matters: "Go" and "Java" are names, "go" and "java" in prose are not.
const LANGUAGES = /\b(Rust|Python|JavaScript|TypeScript|Java|Ruby|Kotlin|Swift|Haskell|Zig|Golang|Go|Elixir|Erlang|Scala|PHP|Perl|Lua|Dart|OCaml|Nim)\b|C\+\+|C#/g;

// The text sits beside the code on a wide screen and above it on a phone, so a direction is wrong on
// one of them.
const DIRECTIONS = /\b(?:on|to) the (?:right|left)\b|\b(?:right|left)-hand\b/gi;

/** Text with its inline code removed, so `!=` or `just_one` in backticks isn't read as prose. */
const words = (text: string) => text.replace(/`[^`]*`/g, "code");

function wordingProblems(text: string): string[] {
  const t = words(text);
  const found: string[] = [];
  for (const m of t.matchAll(SELLING)) found.push(`uses "${m[0]}"`);
  if (t.includes("!")) found.push("has an exclamation mark");
  if (/\p{Extended_Pictographic}/u.test(t)) found.push("has an emoji");
  for (const m of t.matchAll(LANGUAGES)) found.push(`names another language: "${m[0]}"`);
  for (const m of t.matchAll(DIRECTIONS)) found.push(`points in a direction: "${m[0]}"`);
  return found;
}

/** Each run of prose lines, outside code blocks; and the quiz's feedback lines. */
function parts(body: string): { paragraphs: string[]; quiz: string[] } {
  const paragraphs: string[] = [];
  const quiz: string[] = [];
  let current: string[] = [];
  let fence: string | null = null;
  const flush = () => {
    if (current.length > 0) paragraphs.push(current.join(" "));
    current = [];
  };
  for (const line of body.split("\n")) {
    const opens = /^```(\w*)/.exec(line);
    if (fence !== null) {
      if (line.startsWith("```")) fence = null;
      else if (fence === "quiz" && !/^\s*(options|answer)\s*=/.test(line)) quiz.push(line);
      else if (fence === "diagram" && /^\s*alt\s*=/.test(line)) quiz.push(line.replace(/^\s*alt\s*=\s*/, ""));
      continue;
    }
    if (opens) {
      flush();
      fence = opens[1];
      continue;
    }
    if (line.trim() === "") flush();
    else current.push(line.trim());
  }
  flush();
  return { paragraphs, quiz };
}

/** Lists what breaks the voice rules a rule can check, as short sentences; empty when nothing does. */
export function voiceProblems(md: string): string[] {
  const split = splitFront(md);
  const front = split.ok ? split.value.front : {};
  const body = split.ok ? split.value.body : md;
  const { paragraphs, quiz } = parts(body);
  const found: string[] = [];

  if (front.error_note) found.push(...wordingProblems(front.error_note));
  for (const p of paragraphs) found.push(...wordingProblems(p));
  for (const line of quiz) found.push(...wordingProblems(line));

  let inCode = false;
  for (const line of body.split("\n")) {
    if (line.startsWith("```")) inCode = !inCode;
    else if (!inCode && /^(#|[-*+] |\d+\. )/.test(line)) found.push(`has a heading or a bullet: ${line.trim()}`);
  }

  let total = 0;
  for (const p of paragraphs) {
    for (const sentence of p.split(/(?<=[.?])\s+/)) {
      const n = sentence.split(/\s+/).filter((w) => w !== "").length;
      total += n;
      if (n > SENTENCE_WORDS) {
        found.push(`has a sentence of ${n} words: ${sentence.split(/\s+/).slice(0, 6).join(" ")} …`);
      }
    }
  }
  if (total > STEP_WORDS) found.push(`has ${total} words of text (at most ${STEP_WORDS})`);
  return found;
}
