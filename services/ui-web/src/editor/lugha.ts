// The editor's tokenizer (PRP-002, WEB-9): a small CodeMirror stream parser
// following grammar/lugha.tmLanguage.json (copied at tag m159). A test checks
// its word lists against the grammar. Words that are keywords only in context
// (`after`, `default`, `out`, `ptr`, `union`, loop labels) stay plain here.
import type { StreamParser, StringStream } from "@codemirror/language";

export const KEYWORDS = new Set([
  // keyword.control
  "if", "else", "while", "for", "in", "of", "match", "return", "break", "continue",
  "spawn", "select", "defer", "loop",
  // keyword.other
  "fun", "extern", "struct", "enum", "impl", "interface", "let", "import", "actor", "const",
  // storage.modifier, keyword.operator.as, variable.language.self
  "mut", "private", "public", "as", "self",
]);

export const PRIMITIVES = new Set([
  "i8", "i16", "i32", "i64", "u8", "u16", "u32", "u64", "f32", "f64", "bool", "string", "char",
]);

export const BOOLEANS = new Set(["true", "false"]);

export const CONSTANTS = new Set(["Some", "None", "Ok", "Err"]);

/** A string being read, or an interpolation inside one with its open braces. */
type Frame = { kind: "string" } | { kind: "interpolation"; braces: number };

export interface State {
  /** How deep inside nested block comments. */
  comment: number;
  frames: Frame[];
}

const NUMBER = [
  /^0x[0-9a-fA-F](?:_?[0-9a-fA-F])*\b/,
  /^0b[01](?:_?[01])*\b/,
  /^0o[0-7](?:_?[0-7])*\b/,
  /^[0-9]+\.[0-9]+(?:[eE][+-]?[0-9]+)?\b/,
  /^[0-9](?:_?[0-9])*\b/,
];

const ESCAPE = /^\\[ntr0\\"']/;
const IDENT = /^[A-Za-z_][A-Za-z0-9_]*/;

function blockComment(stream: StringStream, state: State): string {
  while (!stream.eol()) {
    if (stream.match("/*")) {
      state.comment += 1;
    } else if (stream.match("*/")) {
      state.comment -= 1;
      if (state.comment === 0) break;
    } else {
      stream.next();
    }
  }
  return "comment";
}

function inString(stream: StringStream, state: State): string {
  if (stream.match(ESCAPE) || stream.match("{{") || stream.match("}}")) return "escape";
  if (stream.match('"')) {
    state.frames.pop();
    return "string";
  }
  if (stream.match("{")) {
    state.frames.push({ kind: "interpolation", braces: 0 });
    return "interpolation";
  }
  if (!stream.match(/^[^\\"{}]+/)) stream.next();
  return "string";
}

function inCode(stream: StringStream, state: State): string | null {
  const top = state.frames[state.frames.length - 1];
  if (top?.kind === "interpolation") {
    if (top.braces === 0 && stream.match(/^:[^{}"]*(?=\})/)) return "escape";
    if (stream.match("{")) {
      top.braces += 1;
      return null;
    }
    if (stream.match("}")) {
      if (top.braces === 0) {
        state.frames.pop();
        return "interpolation";
      }
      top.braces -= 1;
      return null;
    }
  }
  if (stream.match("//")) {
    stream.skipToEnd();
    return "comment";
  }
  if (stream.match("/*")) {
    state.comment = 1;
    return blockComment(stream, state);
  }
  if (stream.match('"')) {
    state.frames.push({ kind: "string" });
    return "string";
  }
  if (stream.match(/^'(?:\\u\{[0-9a-fA-F]{1,6}\}|\\.|[^'\\])'?/)) return "string";
  if (stream.match(/^@[A-Za-z_][A-Za-z0-9_]*/)) return "attribute";
  for (const n of NUMBER) {
    if (stream.match(n)) return "number";
  }
  const word = stream.match(IDENT) as RegExpMatchArray | null;
  if (word) {
    const w = word[0];
    if (KEYWORDS.has(w)) return "keyword";
    if (PRIMITIVES.has(w)) return "type";
    if (BOOLEANS.has(w)) return "bool";
    if (CONSTANTS.has(w)) return "constant";
    return /^[A-Z]/.test(w) ? "type" : null;
  }
  stream.next();
  return null;
}

export const lugha: StreamParser<State> = {
  name: "lugha",
  startState: () => ({ comment: 0, frames: [] }),
  copyState: (s) => ({ comment: s.comment, frames: s.frames.map((f) => ({ ...f })) }),
  token(stream, state) {
    // A string, and anything interpolated in it, ends with its line (as in the grammar).
    if (stream.sol()) state.frames = [];
    if (state.comment > 0) return blockComment(stream, state);
    const top = state.frames[state.frames.length - 1];
    return top?.kind === "string" ? inString(stream, state) : inCode(stream, state);
  },
  languageData: { commentTokens: { line: "//", block: { open: "/*", close: "*/" } } },
};
