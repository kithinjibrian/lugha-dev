// Tests reading the content tree, and the build failing on content that doesn't hold together.
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadContent } from "../src/content/load";

const code = (source: string, marks: number[]) => `<pre data-marks="${marks.join(",")}">${source}</pre>`;
const MAIN = "fun main() {}\n";

let root = "";
afterEach(() => root && rmSync(root, { recursive: true, force: true }));

/** A content tree from `files` (path → text). */
function tree(files: Record<string, string>): string {
  root = mkdtempSync(join(tmpdir(), "content-"));
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  return root;
}

const step = "learn/01-values/01-copies-lesson/01-copies";
const good: Record<string, string> = {
  "learn/01-values/chapter.toml": 'title = "Values"\n',
  "learn/01-values/01-copies-lesson/lesson.toml": 'title = "Everything is a value"\n',
  [`${step}/step.md`]: "---\ntitle: Copies\n---\n\nPress Run.\n",
  [`${step}/start/src/main.la`]: MAIN,
  [`${step}/expected.txt`]: "1\n",
  "learn/01-values/01-copies-lesson/02-fix/step.md": "---\ntitle: Fix it\nstart_error: E0501\nerror_note: Add `mut`.\n---\n\nFix it.\n",
  "learn/01-values/01-copies-lesson/02-fix/start/src/main.la": MAIN,
  "learn/01-values/01-copies-lesson/02-fix/solution/src/main.la": "fun main() { }\n",
  "learn/01-values/01-copies-lesson/02-fix/expected.txt": "2\n",
  "learn/01-values/01-copies-lesson/03-quiz/step.md":
    '---\ntitle: Check\nsee_also: hello\n---\n\nWhich?\n\n```quiz\noptions = ["a", "b"]\nanswer = 0\nfeedback = ["y", "n"]\n```\n',
  "learn/01-values/01-copies-lesson/03-quiz/start/src/main.la": MAIN,
  "learn/01-values/01-copies-lesson/03-quiz/expected.txt": "3\n",
  "home/src/main.la": "fun main() { println(1); }\n",
  "home/expected.txt": "1\n",
  "playground/src/main.la": MAIN,
  "playground/expected.txt": "",
  "examples/groups.toml": 'groups = ["Basics"]\n',
  "examples/hello/example.toml": 'title = "Hello"\ngroup = "Basics"\norder = 1\nintro = "Hi."\ntags = ["println"]\n',
  "examples/hello/src/main.la": "//: Starts here.\nfun main() {}\n",
  "examples/hello/expected.txt": "Hello\n",
};

describe("loadContent", () => {
  it("reads chapters, lessons, steps and examples", async () => {
    const r = await loadContent(tree(good), code);
    if (!r.ok) throw new Error(r.error.join("\n"));
    const [chapter] = r.value.chapters;
    expect(chapter).toMatchObject({ slug: "values", title: "Values" });
    const [lesson] = chapter.lessons;
    expect(lesson).toMatchObject({ slug: "copies-lesson", title: "Everything is a value" });
    expect(lesson.steps.map((s) => [s.id, s.kind])).toEqual([
      ["values/copies-lesson/copies", "read"],
      ["values/copies-lesson/fix", "fix"],
      ["values/copies-lesson/quiz", "quiz"],
    ]);
    expect(lesson.steps[0]).toMatchObject({ title: "Copies", html: "<p>Press Run.</p>\n", start: MAIN, solution: null, expected: "1\n" });
    expect(lesson.steps[1]).toMatchObject({ startError: "E0501", errorNote: "<p>Add <code>mut</code>.</p>\n", solution: "fun main() { }\n" });
    expect(lesson.steps[2]).toMatchObject({ seeAlso: "hello", quiz: { answer: 0 } });
    expect(r.value.examples).toEqual([
      {
        slug: "hello",
        title: "Hello",
        group: "Basics",
        order: 1,
        intro: "Hi.",
        tags: ["println"],
        stdin: "",
        source: "//: Starts here.\nfun main() {}\n",
        code: "fun main() {}\n",
        pieces: [{ note: "<p>Starts here.</p>\n", first: 1, last: 1, html: '<pre data-marks="">fun main() {}</pre>' }],
        expected: "Hello\n",
      },
    ]);
    expect(r.value.home).toEqual({ source: "fun main() { println(1); }\n", expected: "1\n" });
    expect(r.value.playground).toEqual({ source: MAIN, expected: "" });
  });

  it("reads the real content/", async () => {
    const r = await loadContent(join(import.meta.dirname, "../../../content"), code);
    if (!r.ok) throw new Error(r.error.join("\n"));
    expect(r.value.chapters.map((c) => c.slug)).toEqual(["basics", "control-flow-and-functions", "arrays-strings-and-tuples", "structs-and-enums", "values", "error-handling"]);
    expect(r.value.chapters.find((c) => c.slug === "values")?.lessons[0].steps).toHaveLength(6);
    expect(r.value.home.expected).toBe("832040\n");
    expect(r.value.playground.source).toContain("enum Shape");
    expect(r.value.examples.map((e) => e.slug)).toEqual(["hello-world", "fibonacci", "word-frequency", "green-threads", "actor-counter"]);
  });

  const broken: [string, Record<string, string | null>, string][] = [
    ["a folder without its number", { "learn/values/chapter.toml": 'title = "V"\n' }, "learn/values: a folder's name starts with two digits and a dash"],
    ["a missing title", { "learn/01-values/chapter.toml": "" }, "learn/01-values/chapter.toml: needs a title"],
    ["a missing step.md", { [`${step}/step.md`]: null }, `${step}/step.md: missing`],
    ["missing start code", { [`${step}/start/src/main.la`]: null }, `${step}/start/src/main.la: missing`],
    ["a missing expected.txt", { [`${step}/expected.txt`]: null }, `${step}/expected.txt: missing`],
    ["an unknown front matter key", { [`${step}/step.md`]: "---\ntitle: C\ncolour: red\n---\n" }, `${step}/step.md: unknown front matter: colour`],
    ["a fix step saying nothing about its start", { "learn/01-values/01-copies-lesson/02-fix/step.md": "---\ntitle: Fix\n---\n" }, "learn/01-values/01-copies-lesson/02-fix/step.md: a step with a solution needs start_error or start_output"],
    ["start_error without a solution", { [`${step}/step.md`]: "---\ntitle: C\nstart_error: E0501\n---\n" }, `${step}/step.md: start_error, start_output and error_note need a solution`],
    ["see_also naming no example", { "learn/01-values/01-copies-lesson/03-quiz/step.md": "---\ntitle: Q\nsee_also: nope\n---\n" }, "learn/01-values/01-copies-lesson/03-quiz/step.md: see_also names no example: nope"],
    ["a diagram whose file is missing", { [`${step}/step.md`]: '---\ntitle: C\n---\n\n```diagram\nfile = "box.svg"\nalt = "One box."\n```\n' }, `${step}/step.md: the diagram file box.svg is missing`],
    ["a diagram that breaks the allow-list", { [`${step}/step.md`]: '---\ntitle: C\n---\n\n```diagram\nfile = "box.svg"\nalt = "One box."\n```\n', [`${step}/box.svg`]: '<svg xmlns="http://www.w3.org/2000/svg"><script/></svg>' }, `${step}/step.md: the diagram uses the element \`script\``],
    ["markdown outside the subset", { [`${step}/step.md`]: "---\ntitle: C\n---\n\n# Big\n" }, `${step}/step.md: line 2 is markdown step text can't hold: # Big`],
    ["an example missing a field", { "examples/hello/example.toml": 'title = "Hello"\n' }, "examples/hello/example.toml: needs group, order, intro, tags"],
    ["an example with an unknown field", { "examples/hello/example.toml": good["examples/hello/example.toml"] + "x = 1\n" }, "examples/hello/example.toml: unknown keys: x"],
    ["an example in no group", { "examples/hello/example.toml": good["examples/hello/example.toml"].replace("Basics", "Misc") }, "examples/hello/example.toml: its group isn't in examples/groups.toml: Misc"],
    ["a missing home program", { "home/src/main.la": null }, "home/src/main.la: missing"],
    ["a missing playground program", { "playground/expected.txt": null }, "playground/expected.txt: missing"],
    ["an example that isn't TOML", { "examples/hello/example.toml": "title = " }, "examples/hello/example.toml: isn't TOML"],
  ];

  for (const [what, change, problem] of broken) {
    it(`fails on ${what}`, async () => {
      const files = { ...good };
      for (const [k, v] of Object.entries(change)) {
        if (v === null) delete files[k];
        else files[k] = v;
      }
      const r = await loadContent(tree(files), code);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error).toContain(problem);
    });
  }
});
