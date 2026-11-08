// The step text's markdown (PRP-002): a strict subset, so anything else fails
// the build instead of reaching a page. Paragraphs; `code`, *em*, **strong**
// and [links](/path or https://…) inside them; ```lugha {lines}``` code,
// handed to the highlighter; and one ```quiz``` block in TOML.
import { parse as parseToml } from "smol-toml";
import { err, ok, type Result } from "../lib/result";

export interface Quiz {
  options: string[];
  /** The index of the right option. */
  answer: number;
  /** What each option says when it's chosen. */
  feedback: string[];
}

export interface Rendered {
  /** The text, up to the quiz when there is one. */
  html: string;
  quiz: Quiz | null;
  /** The text after the quiz ("" without one). */
  after: string;
}

/** Turns Lugha code and its marked lines (from 1) into HTML. */
export type Highlight = (source: string, marks: number[]) => string;

/**
 * The front matter's `key: value` lines, with one pair of quotes removed and
 * `\n` turned into a newline (as services/api/test/content.la reads them).
 */
export function splitFront(md: string): Result<{ front: Record<string, string>; body: string }, string> {
  const lines = md.split("\n");
  const end = lines.indexOf("---", 1);
  if (lines[0] !== "---" || end < 0) {
    return err("has no front matter (--- lines)");
  }
  const front: Record<string, string> = {};
  for (let i = 1; i < end; i++) {
    const m = /^([a-z_]+):\s*(.*)$/.exec(lines[i]);
    if (!m) return err(`front matter line ${i} isn't \`key: value\``);
    let v = m[2].trim();
    if (v.length >= 2 && v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    front[m[1]] = v.split("\\n").join("\n");
  }
  return ok({ front, body: lines.slice(end + 1).join("\n") });
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** One paragraph's inline markdown as HTML, or why it can't be. */
export function inline(text: string): Result<string, string> {
  let out = "";
  let rest = text;
  while (rest.length > 0) {
    let m: RegExpExecArray | null;
    if ((m = /^`([^`]+)`/.exec(rest))) {
      out += `<code>${escapeHtml(m[1])}</code>`;
    } else if ((m = /^\*\*([^*]+)\*\*/.exec(rest))) {
      out += `<strong>${escapeHtml(m[1])}</strong>`;
    } else if ((m = /^\*([^*]+)\*/.exec(rest))) {
      out += `<em>${escapeHtml(m[1])}</em>`;
    } else if ((m = /^\[([^\]]+)\]\(([^)\s]+)\)/.exec(rest))) {
      if (!/^(\/|https:\/\/)/.test(m[2])) return err(`a link goes to ${m[2]}: only /… and https://… are allowed`);
      out += `<a href="${escapeHtml(m[2])}">${escapeHtml(m[1])}</a>`;
    } else if (/^</.test(rest)) {
      return err("has HTML, which step text can't hold");
    } else {
      m = /^[^`*[<]+|^./s.exec(rest)!;
      out += escapeHtml(m[0]);
    }
    rest = rest.slice(m[0].length);
  }
  return ok(out);
}

function asQuiz(toml: string): Result<Quiz, string> {
  let v: Record<string, unknown>;
  try {
    v = parseToml(toml) as Record<string, unknown>;
  } catch {
    return err("the quiz isn't TOML");
  }
  const { options, answer, feedback, ...extra } = v;
  const strings = (a: unknown): a is string[] => Array.isArray(a) && a.every((s) => typeof s === "string");
  if (Object.keys(extra).length > 0) return err(`the quiz has unknown keys: ${Object.keys(extra).join(", ")}`);
  if (!strings(options) || options.length < 2) return err("the quiz needs at least two options");
  if (typeof answer !== "number" || !Number.isInteger(answer) || answer < 0 || answer >= options.length) {
    return err("the quiz's answer isn't one of its options");
  }
  if (!strings(feedback) || feedback.length !== options.length) return err("the quiz needs feedback for each option");
  return ok({ options, answer, feedback });
}

/** What else a text may hold: lists, and ```text blocks (lughac's explanations use both). */
export interface Allow {
  lists: boolean;
}

export function renderMarkdown(
  body: string,
  highlight: Highlight,
  allow: Allow = { lists: false },
): Result<Rendered, string> {
  const lines = body.split("\n");
  const parts: string[] = [""];
  let quiz: Quiz | null = null;
  let paragraph: string[] = [];

  const flush = (): string | null => {
    if (paragraph.length === 0) return null;
    const r = inline(paragraph.join("\n"));
    paragraph = [];
    if (!r.ok) return r.error;
    parts[parts.length - 1] += `<p>${r.value}</p>\n`;
    return null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fence = /^```(.*)$/.exec(line);
    if (fence) {
      const problem = flush();
      if (problem) return err(problem);
      const close = lines.indexOf("```", i + 1);
      if (close < 0) return err(`the code block on line ${i + 1} isn't closed`);
      const inside = lines.slice(i + 1, close);
      i = close;
      const info = fence[1].trim();
      if (info === "text" && allow.lists) {
        parts[parts.length - 1] += `<pre class="text"><code>${escapeHtml(inside.join("\n"))}</code></pre>\n`;
        continue;
      }
      if (info === "quiz") {
        if (quiz) return err("has more than one quiz");
        const q = asQuiz(inside.join("\n"));
        if (!q.ok) return q;
        quiz = q.value;
        parts.push("");
        continue;
      }
      const m = /^lugha(?:\s+\{([0-9,\s]*)\})?$/.exec(info);
      if (!m) return err(`a code block is \`${info}\`: only lugha and quiz are allowed`);
      const marks = (m[1] ?? "").split(",").map((s) => s.trim()).filter((s) => s !== "").map(Number);
      if (marks.some((n) => n < 1 || n > inside.length)) return err(`a code block marks a line it doesn't have`);
      parts[parts.length - 1] += highlight(inside.join("\n"), marks) + "\n";
      continue;
    }
    if (line.trim() === "") {
      const problem = flush();
      if (problem) return err(problem);
      continue;
    }
    if (allow.lists && /^- /.test(line)) {
      const problem = flush();
      if (problem) return err(problem);
      const items: string[] = [];
      while (i < lines.length && /^(- |  \S)/.test(lines[i])) {
        if (lines[i].startsWith("- ")) items.push(lines[i].slice(2));
        else items[items.length - 1] += "\n" + lines[i].trim();
        i++;
      }
      i--;
      const html: string[] = [];
      for (const item of items) {
        const r = inline(item);
        if (!r.ok) return r;
        html.push(`<li>${r.value}</li>\n`);
      }
      parts[parts.length - 1] += `<ul>\n${html.join("")}</ul>\n`;
      continue;
    }
    if (/^(#|>|[-*+] |\d+\. |\s{4})/.test(line)) {
      return err(`line ${i + 1} is markdown step text can't hold: ${line.trim()}`);
    }
    paragraph.push(line);
  }
  const problem = flush();
  if (problem) return err(problem);
  return ok({ html: parts[0], quiz, after: parts[1] ?? "" });
}
