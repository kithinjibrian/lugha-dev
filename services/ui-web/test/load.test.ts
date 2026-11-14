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
    expect(r.value.chapters.map((c) => c.slug)).toEqual(["basics", "control-flow-and-functions", "arrays-strings-and-tuples", "structs-and-enums", "values", "error-handling", "closures-iterators-and-collections", "generics-and-interfaces"]);
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
    ["a fix step saying nothing about its start", { "learn/01-values/01-copies-lesson/02-fix/step.md": "---\ntitle: Fix\n---\n" }, "learn/01-values/01-copies-lesson/02-fix/step.md: a step with a solution needs start_error, start_output or start_failing"],
    ["start_error without a solution", { [`${step}/step.md`]: "---\ntitle: C\nstart_error: E0501\n---\n" }, `${step}/step.md: start_error, start_output, start_failing and error_note need a solution`],
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

describe("loadContent, steps with several files", () => {
  const lesson = "learn/01-values/01-copies-lesson";
  const multi = `${lesson}/04-modules`;
  const withFiles: Record<string, string> = {
    ...good,
    [`${multi}/step.md`]: "---\ntitle: Modules\nstart_error: E0301\n---\n\nImport it.\n",
    [`${multi}/expected.txt`]: "4\n",
    [`${multi}/start/src/main.la`]: MAIN,
    [`${multi}/start/src/shapes.la`]: "pub fun area(): i64 = 4;\n",
    [`${multi}/start/src/a.la`]: "fun a() {}\n",
    [`${multi}/solution/src/main.la`]: "fun main() { }\n",
    [`${multi}/solution/src/shapes.la`]: "pub fun area(): i64 = 4;\n",
    [`${multi}/solution/src/a.la`]: "fun a() {}\n",
  };
  const tested = `${lesson}/05-tests`;
  const withTests: Record<string, string> = {
    ...good,
    [`${tested}/step.md`]: "---\ntitle: Tests\nstart_failing: area_works, other\n---\n\nPress Test.\n",
    [`${tested}/expected.txt`]: "",
    [`${tested}/start/src/main.la`]: MAIN,
    [`${tested}/start/test/area.la`]: "@test fun area_works() {}\n",
    [`${tested}/solution/src/main.la`]: MAIN,
    [`${tested}/solution/test/area.la`]: "@test fun area_works() {}\n",
  };

  it("reads every file, src/main.la first, then src/ and test/ by name", async () => {
    const r = await loadContent(tree(withFiles), code);
    if (!r.ok) throw new Error(r.error.join("\n"));
    const step = r.value.chapters[0].lessons[0].steps[3];
    expect(step.files.map((f) => f.path)).toEqual(["src/main.la", "src/a.la", "src/shapes.la"]);
    expect(step.solutionFiles?.map((f) => f.path)).toEqual(["src/main.la", "src/a.la", "src/shapes.la"]);
    expect(step).toMatchObject({ start: MAIN, solution: "fun main() { }\n", tests: false, startFailing: null });
  });

  it("makes a step with test/ files a test step, with the tests its start fails", async () => {
    const r = await loadContent(tree(withTests), code);
    if (!r.ok) throw new Error(r.error.join("\n"));
    const step = r.value.chapters[0].lessons[0].steps[3];
    expect(step.files.map((f) => f.path)).toEqual(["src/main.la", "test/area.la"]);
    expect(step).toMatchObject({ tests: true, startFailing: ["area_works", "other"], kind: "fix" });
  });

  it("gives a one-file step its one file", async () => {
    const r = await loadContent(tree(good), code);
    if (!r.ok) throw new Error(r.error.join("\n"));
    const step = r.value.chapters[0].lessons[0].steps[0];
    expect(step).toMatchObject({ files: [{ path: "src/main.la", text: MAIN }], solutionFiles: null, tests: false });
  });

  const broken: [string, Record<string, string | null>, Record<string, string>, string][] = [
    ["a file outside src/ and test/", { [`${multi}/start/lib/x.la`]: "x" }, withFiles, `${multi}/start: lib/x.la isn't a .la file under src/ or test/`],
    ["a file that isn't .la", { [`${multi}/start/src/notes.txt`]: "x" }, withFiles, `${multi}/start: src/notes.txt isn't a .la file under src/ or test/`],
    ["solution files differing from start's", { [`${multi}/solution/src/a.la`]: null }, withFiles, `${multi}/solution: its files aren't the same as start's`],
    ["start_failing without tests", { [`${multi}/step.md`]: "---\ntitle: M\nstart_failing: x\n---\n" }, withFiles, `${multi}/step.md: start_failing needs test/ files`],
  ];
  for (const [what, change, base, problem] of broken) {
    it(`fails on ${what}`, async () => {
      const files = { ...base };
      for (const [k, v] of Object.entries(change)) {
        if (v === null) delete files[k];
        else files[k] = v;
      }
      const r = await loadContent(tree(files), code);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error).toContain(problem);
    });
  }

  it("fails on more than 20 files", async () => {
    const files = { ...withFiles };
    for (let i = 0; i < 20; i++) files[`${multi}/start/src/f${String(i).padStart(2, "0")}.la`] = "x";
    const r = await loadContent(tree(files), code);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain(`${multi}/start: 23 files (at most 20)`);
  });
});

