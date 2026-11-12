import { describe, expect, it } from "vitest";
import { renderMarkdown, splitFront } from "../src/content/markdown";

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

  it("refuses what the subset doesn't have", () => {
    for (const md of ["# Heading\n", "- item\n", "1. item\n", "<b>x</b>\n", "```js\nx\n```\n", "```lugha {9}\nx\n```\n", "```lugha\nx\n", "> quote\n", "a [link](javascript:alert(1))\n"]) {
      const r = renderMarkdown(md, code);
      expect(r.ok, md).toBe(false);
    }
  });
});
