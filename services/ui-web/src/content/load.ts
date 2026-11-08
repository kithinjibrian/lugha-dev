// Loading content/ at build time (PRP-002, WEB-2): the course and the
// examples, checked. Every problem is collected as "path: problem", and the
// build fails on any of them (src/content/site.ts). Whether the code prints
// what it says is checked separately, against the sandbox (scripts/content).
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { parse as parseToml } from "smol-toml";
import type { StepKind } from "../lib/progress";
import { splitNotes } from "../lib/notes";
import { err, ok, type Result } from "../lib/result";
import { inline, renderMarkdown, splitFront, type Highlight, type Quiz } from "./markdown";

export interface Step {
  /** "chapter/lesson/step", without the numbers: the URL under /learn/ and the progress key. */
  id: string;
  slug: string;
  /** Its folder in content/, for "Edit this lesson on GitHub". */
  path: string;
  title: string;
  kind: StepKind;
  html: string;
  quiz: Quiz | null;
  /** The text after the quiz. */
  after: string;
  start: string;
  solution: string | null;
  expected: string;
  startError: string | null;
  startOutput: string | null;
  /** The step's own words for its start error, as HTML. */
  errorNote: string | null;
  seeAlso: string | null;
}

export interface Lesson {
  slug: string;
  title: string;
  steps: Step[];
}

export interface Chapter {
  slug: string;
  title: string;
  lessons: Lesson[];
}

export interface ExamplePiece {
  note: string;
  first: number;
  last: number;
  html: string;
}

export interface Example {
  slug: string;
  title: string;
  group: string;
  order: number;
  intro: string;
  tags: string[];
  stdin: string;
  /** main.la as written, notes and all: what Run, Copy and Open in Playground use. */
  source: string;
  /** main.la without its notes. */
  code: string;
  pieces: ExamplePiece[];
  expected: string;
}

/** A program shown on its own: Home's card, and the Playground's first project. */
export interface Program {
  source: string;
  expected: string;
}

export interface Content {
  chapters: Chapter[];
  examples: Example[];
  home: Program;
  playground: Program;
}

const FRONT_KEYS = ["title", "start_error", "start_output", "error_note", "see_also"];

/** Reads files under `root`, noting what's missing. */
class Reader {
  problems: string[] = [];
  constructor(readonly root: string) {}

  text(path: string): string | null {
    const full = join(this.root, path);
    if (!existsSync(full)) {
      this.problems.push(`${path}: missing`);
      return null;
    }
    return readFileSync(full, "utf8");
  }

  maybe(path: string): string | null {
    const full = join(this.root, path);
    return existsSync(full) ? readFileSync(full, "utf8") : null;
  }

  toml(path: string): Record<string, unknown> | null {
    const t = this.text(path);
    if (t === null) return null;
    try {
      return parseToml(t) as Record<string, unknown>;
    } catch {
      this.problems.push(`${path}: isn't TOML`);
      return null;
    }
  }

  /** The numbered folders in `path` ("01-values"), sorted, with their slugs ("values"). */
  numbered(path: string): { name: string; slug: string }[] {
    const full = join(this.root, path);
    if (!existsSync(full)) return [];
    const out: { name: string; slug: string }[] = [];
    for (const name of readdirSync(full).sort()) {
      if (!statSync(join(full, name)).isDirectory()) continue;
      const m = /^\d\d-([a-z0-9-]+)$/.exec(name);
      if (!m) {
        this.problems.push(`${path}/${name}: a folder's name starts with two digits and a dash`);
        continue;
      }
      out.push({ name, slug: m[1] });
    }
    return out;
  }

  title(path: string): string {
    const t = this.toml(path)?.title;
    if (typeof t !== "string" || t === "") {
      if (this.maybe(path) !== null) this.problems.push(`${path}: needs a title`);
      return "";
    }
    return t;
  }
}

function loadStep(r: Reader, dir: string, id: string, slug: string, highlight: Highlight): Step | null {
  const md = r.text(`${dir}/step.md`);
  const start = r.text(`${dir}/start/src/main.la`);
  const expected = r.text(`${dir}/expected.txt`);
  const solution = r.maybe(`${dir}/solution/src/main.la`);
  if (md === null || start === null || expected === null) return null;
  const where = `${dir}/step.md`;
  const split = splitFront(md);
  if (!split.ok) {
    r.problems.push(`${where}: ${split.error}`);
    return null;
  }
  const { front, body } = split.value;
  const unknown = Object.keys(front).filter((k) => !FRONT_KEYS.includes(k));
  if (unknown.length > 0) r.problems.push(`${where}: unknown front matter: ${unknown.join(", ")}`);
  if (!front.title) r.problems.push(`${where}: needs a title`);
  const rendered = renderMarkdown(body, highlight);
  if (!rendered.ok) {
    r.problems.push(`${where}: ${rendered.error}`);
    return null;
  }
  const aboutStart = front.start_error ?? front.start_output ?? front.error_note;
  if (solution !== null && front.start_error === undefined && front.start_output === undefined) {
    r.problems.push(`${where}: a step with a solution needs start_error or start_output`);
  }
  if (solution === null && aboutStart !== undefined) {
    r.problems.push(`${where}: start_error, start_output and error_note need a solution`);
  }
  let errorNote: string | null = null;
  if (front.error_note !== undefined) {
    const note = inline(front.error_note);
    if (note.ok) errorNote = `<p>${note.value}</p>\n`;
    else r.problems.push(`${where}: error_note ${note.error}`);
  }
  const { quiz, html, after } = rendered.value;
  return {
    id,
    slug,
    path: dir,
    title: front.title ?? "",
    kind: quiz ? "quiz" : solution !== null ? "fix" : "read",
    html,
    quiz,
    after,
    start,
    solution,
    expected,
    startError: front.start_error ?? null,
    startOutput: front.start_output ?? null,
    errorNote,
    seeAlso: front.see_also ?? null,
  };
}

function loadCourse(r: Reader, highlight: Highlight): Chapter[] {
  return r.numbered("learn").map((c) => ({
    slug: c.slug,
    title: r.title(`learn/${c.name}/chapter.toml`),
    lessons: r.numbered(`learn/${c.name}`).map((l) => {
      const dir = `learn/${c.name}/${l.name}`;
      const steps = r.numbered(dir).flatMap((s) => {
        const step = loadStep(r, `${dir}/${s.name}`, `${c.slug}/${l.slug}/${s.slug}`, s.slug, highlight);
        return step ? [step] : [];
      });
      return { slug: l.slug, title: r.title(`${dir}/lesson.toml`), steps };
    }),
  }));
}

const EXAMPLE_KEYS = ["title", "group", "order", "intro", "tags", "stdin"];

function loadExample(r: Reader, slug: string, groups: string[], highlight: Highlight): Example | null {
  const where = `examples/${slug}/example.toml`;
  const meta = r.toml(where);
  const source = r.text(`examples/${slug}/src/main.la`);
  const expected = r.text(`examples/${slug}/expected.txt`);
  if (meta === null || source === null || expected === null) return null;
  const { title, group, order, intro, tags, stdin = "" } = meta;
  const unknown = Object.keys(meta).filter((k) => !EXAMPLE_KEYS.includes(k));
  if (unknown.length > 0) r.problems.push(`${where}: unknown keys: ${unknown.join(", ")}`);
  const missing = [
    typeof title === "string" ? null : "title",
    typeof group === "string" ? null : "group",
    typeof order === "number" ? null : "order",
    typeof intro === "string" ? null : "intro",
    Array.isArray(tags) && tags.every((t) => typeof t === "string") ? null : "tags",
    typeof stdin === "string" ? null : "stdin",
  ].filter((m) => m !== null);
  if (missing.length > 0) {
    r.problems.push(`${where}: needs ${missing.join(", ")}`);
    return null;
  }
  if (!groups.includes(group as string)) {
    r.problems.push(`${where}: its group isn't in examples/groups.toml: ${group}`);
  }
  const { code, pieces } = splitNotes(source);
  const lines = code.split("\n");
  return {
    slug,
    title: title as string,
    group: group as string,
    order: order as number,
    intro: intro as string,
    tags: tags as string[],
    stdin: stdin as string,
    source,
    code,
    pieces: pieces.map((p) => {
      const note = p.note === "" ? ok("") : inline(p.note);
      if (!note.ok) r.problems.push(`examples/${slug}/src/main.la: a note ${note.error}`);
      return {
        ...p,
        note: note.ok && note.value !== "" ? `<p>${note.value}</p>\n` : "",
        html: p.last >= p.first ? highlight(lines.slice(p.first - 1, p.last).join("\n"), []) : "",
      };
    }),
    expected,
  };
}

function loadExamples(r: Reader, highlight: Highlight): Example[] {
  const g = r.toml("examples/groups.toml")?.groups;
  const groups = Array.isArray(g) ? g.filter((x): x is string => typeof x === "string") : [];
  const dir = join(r.root, "examples");
  const slugs = existsSync(dir)
    ? readdirSync(dir).filter((n) => statSync(join(dir, n)).isDirectory()).sort()
    : [];
  return slugs
    .flatMap((slug) => {
      const e = loadExample(r, slug, groups, highlight);
      return e ? [e] : [];
    })
    .sort((a, b) => groups.indexOf(a.group) - groups.indexOf(b.group) || a.order - b.order);
}

function loadProgram(r: Reader, name: string): Program {
  return {
    source: r.text(`${name}/src/main.la`) ?? "",
    expected: r.text(`${name}/expected.txt`) ?? "",
  };
}

export async function loadContent(root: string, highlight: Highlight): Promise<Result<Content, string[]>> {
  const r = new Reader(root);
  const chapters = loadCourse(r, highlight);
  const examples = loadExamples(r, highlight);
  const home = loadProgram(r, "home");
  const playground = loadProgram(r, "playground");
  const slugs = examples.map((e) => e.slug);
  for (const c of chapters) {
    for (const l of c.lessons) {
      for (const s of l.steps) {
        if (s.seeAlso !== null && !slugs.includes(s.seeAlso)) {
          r.problems.push(`${s.path}/step.md: see_also names no example: ${s.seeAlso}`);
        }
      }
    }
  }
  return r.problems.length > 0 ? err(r.problems) : ok({ chapters, examples, home, playground });
}
