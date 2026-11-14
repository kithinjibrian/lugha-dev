// Tests front matter and the small Markdown the lessons are written in, quizzes included.
import { describe, expect, it } from "vitest";
import { renderMarkdown, splitFront } from "../src/content/markdown";
import { err, ok } from "../src/lib/result";

const code = (source: string, marks: number[]) => `<pre data-marks="${marks.join(",")}">${source}</pre>`;

describe("splitFront", () => {
  it("reads the front matter's keys, without quotes, and the body after it", () => {
    const r = splitFront('---\ntitle: Copies\nstart_output: "[5, 6]\\n"\n---\n\nBody.\n');
    expect(r).toEqual({ ok: true, value: { front: { title: "Copies", start_output: "[5, 6]\n" }, body: "\nBody.\n" } });
  });

  it("refuses a file without front matter, or with a line that isn't key: value", () => {
    expect(splitFront("Body.\n")).toEqual({ ok: false, error: "has no front matter (--- lines)" });
    expect(splitFront("---\ntitle Copies\n---\n")).toEqual({ ok: false, error: "front matter line 1 isn't `key: value`" });
    expect(splitFront("---\ntitle: x\n")).toEqual({ ok: false, error: "has no front matter (--- lines)" });
  });
});

describe("renderMarkdown", () => {
  it("makes paragraphs, inline code, emphasis and links, escaping HTML", () => {
    const r = renderMarkdown("One *two* **three** `a < b`.\nSame paragraph.\n\nSee [Word frequency](/examples/word-frequency) & more.\n", code);
    expect(r).toEqual({
      ok: true,
      value: {
        html:
          "<p>One <em>two</em> <strong>three</strong> <code>a &lt; b</code>.\nSame paragraph.</p>\n" +
          '<p>See <a href="/examples/word-frequency">Word frequency</a> &amp; more.</p>\n',
        quiz: null,
        after: "",
      },
    });
  });

  it("hands lugha code, with its marked lines, to the highlighter", () => {
    const r = renderMarkdown("Look:\n\n```lugha {2}\nlet a = 1;\nlet mut b = a;\n```\n\nDone.\n", code);
    expect(r.ok && r.value.html).toBe('<p>Look:</p>\n<pre data-marks="2">let a = 1;\nlet mut b = a;</pre>\n<p>Done.</p>\n');
    const plain = renderMarkdown("```lugha\nx\n```\n", code);
    expect(plain.ok && plain.value.html).toBe('<pre data-marks="">x</pre>\n');
  });

  it("takes the quiz out of the text", () => {
    const md = 'Ask.\n\n```quiz\noptions = ["a", "b"]\nanswer = 1\nfeedback = ["no", "yes"]\n```\n\nThen run.\n';
    const r = renderMarkdown(md, code);
    expect(r).toEqual({
      ok: true,
      value: {
        html: "<p>Ask.</p>\n",
        quiz: { options: ["a", "b"], answer: 1, feedback: ["no", "yes"] },
        after: "<p>Then run.</p>\n",
      },
    });
  });

  it("refuses a quiz that doesn't hold together", () => {
    const quiz = (toml: string) => renderMarkdown("```quiz\n" + toml + "\n```\n", code);
    expect(quiz('options = ["a"]\nanswer = 0\nfeedback = ["x"]').ok).toBe(false);
    expect(quiz('options = ["a", "b"]\nanswer = 2\nfeedback = ["x", "y"]').ok).toBe(false);
    expect(quiz('options = ["a", "b"]\nanswer = 0\nfeedback = ["x"]').ok).toBe(false);
    expect(quiz("options = [").ok).toBe(false);
    expect(quiz('options = ["a", "b"]\nanswer = 0\nfeedback = ["x", "y"]\nextra = 1').ok).toBe(false);
  });

  describe("a diagram", () => {
    const drawn = (file: string) => (file === "diagram.svg" ? ok('<svg xmlns="http://www.w3.org/2000/svg"><rect class="d-box"/></svg>') : err(`the diagram file ${file} is missing`));
    const block = (toml: string) => "```diagram\n" + toml + "\n```\n";
    const good = 'file = "diagram.svg"\nalt = "a and b share one box"';

    it("becomes a figure where its block is, labelled with its alt text", () => {
      const r = renderMarkdown("Look:\n\n" + block(good) + "\nDone.\n", code, { lists: false }, drawn);
      expect(r.ok && r.value.html).toBe(
        '<p>Look:</p>\n<figure class="diagram"><svg role="img" aria-label="a and b share one box" xmlns="http://www.w3.org/2000/svg"><rect class="d-box"/></svg></figure>\n<p>Done.</p>\n',
      );
    });

    it("lands after a quiz when it comes after one", () => {
      const md = '```quiz\noptions = ["a", "b"]\nanswer = 1\nfeedback = ["no", "yes"]\n```\n\n' + block(good);
      const r = renderMarkdown(md, code, { lists: false }, drawn);
      expect(r.ok && r.value.after).toContain('<figure class="diagram">');
    });

    const refused: [string, string, string][] = [
      ["no alt", 'file = "diagram.svg"', "the diagram needs alt text"],
      ["an empty alt", 'file = "diagram.svg"\nalt = " "', "the diagram needs alt text"],
      ["an extra key", good + "\nsize = 2", "the diagram block has unknown keys: size"],
      ["bad TOML", "file = ", "the diagram block isn't TOML"],
      ["a path", 'file = "../x.svg"\nalt = "x"', "the diagram's file is a name ending in .svg, in the step's folder"],
      ["a missing file", 'file = "other.svg"\nalt = "x"', "the diagram file other.svg is missing"],
    ];
    for (const [what, toml, problem] of refused) {
      it(`refuses ${what}`, () => expect(renderMarkdown(block(toml), code, { lists: false }, drawn)).toEqual(err(problem)));
    }

    it("refuses a second diagram", () => {
      expect(renderMarkdown(block(good) + "\n" + block(good), code, { lists: false }, drawn)).toEqual(err("has more than one diagram"));
    });

    it("is refused where diagrams can't go", () => {
      expect(renderMarkdown(block(good), code)).toEqual(err("a code block is `diagram`: diagrams go only in lesson steps"));
    });
  });

  it("refuses what the subset doesn't have", () => {
    for (const md of ["# Heading\n", "- item\n", "1. item\n", "<b>x</b>\n", "```js\nx\n```\n", "```lugha {9}\nx\n```\n", "```lugha\nx\n", "> quote\n", "a [link](javascript:alert(1))\n"]) {
      const r = renderMarkdown(md, code);
      expect(r.ok, md).toBe(false);
    }
  });
});
