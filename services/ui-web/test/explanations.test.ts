import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseExplanations } from "../src/content/explanations";

const code = (source: string, marks: number[]) => `<pre data-marks="${marks.join(",")}">${source}</pre>`;

const two = [
  "%%% version",
  "lughac 0.1.0",
  "%%% E0501",
  "# E0501: Assignment to an immutable binding",
  "",
  "A value was assigned to a binding",
  "that isn't mutable.",
  "",
  "```lugha",
  "let x = 1;",
  "```",
  "",
  "- one `a`",
  "  carried on;",
  "- two.",
  "",
  "```text",
  "a < b",
  "```",
  "%%% W0101",
  "# W0101: Unused",
  "",
  "Only this.",
  "",
].join("\n");

describe("parseExplanations", () => {
  it("splits each code's title, first paragraph and the rest", () => {
    const r = parseExplanations(two, code);
    expect(r).toEqual({
      ok: true,
      value: {
        version: "lughac 0.1.0",
        explanations: {
        E0501: {
          title: "Assignment to an immutable binding",
          first: "<p>A value was assigned to a binding\nthat isn't mutable.</p>\n",
          rest:
            '<pre data-marks="">let x = 1;</pre>\n' +
            "<ul>\n<li>one <code>a</code>\ncarried on;</li>\n<li>two.</li>\n</ul>\n" +
            '<pre class="text"><code>a &lt; b</code></pre>\n',
        },
        W0101: { title: "Unused", first: "<p>Only this.</p>\n", rest: "" },
        },
      },
    });
  });

  it("refuses text it can't place", () => {
    const v = "%%% version\nlughac 0.1.0\n";
    expect(parseExplanations("", code).ok).toBe(false);
    expect(parseExplanations(v, code).ok).toBe(false);
    expect(parseExplanations("%%% E0501\n# E0501: T\n\nx\n", code).ok).toBe(false);
    expect(parseExplanations(v + "%%% E0501\nno title\n", code).ok).toBe(false);
    expect(parseExplanations(v + "%%% E0501\n# E0502: Wrong\n\nx\n", code).ok).toBe(false);
    expect(parseExplanations(v + "%%% E0501\n# E0501: T\n\n## Sub\n", code).ok).toBe(false);
  });

  it("reads every explanation lughac m154 gives, when they've been generated", () => {
    let text: string;
    try {
      text = readFileSync(new URL("../generated/explanations.txt", import.meta.url), "utf8");
    } catch {
      return; // scripts/explanations.sh hasn't been run; the build will say so.
    }
    const r = parseExplanations(text, code);
    if (!r.ok) throw new Error(r.error.join("\n"));
    expect(r.value.version).toMatch(/^lughac \d/);
    expect(Object.keys(r.value.explanations).length).toBeGreaterThan(100);
    expect(r.value.explanations.E0501.first).toContain("isn't mutable");
  });
});
