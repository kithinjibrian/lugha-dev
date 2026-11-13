// Tests the build-time highlighting of Lugha code.
import { describe, expect, it } from "vitest";
import { highlighter } from "../src/content/highlight";

describe("static highlighting", () => {
  it("colours Lugha with the design's code tokens", async () => {
    const h = await highlighter();
    const html = h('fun main() {\n    let mut s: string = "n {1}"; // hi\n}', []);
    const coloured = (token: string, word: string) =>
      new RegExp(`<span style="color:var\\(--code-${token}\\)">\\s*${word}</span>`);
    expect(html).toMatch(coloured("keyword", "fun"));
    expect(html).toMatch(coloured("keyword", "mut"));
    expect(html).toMatch(coloured("type", "string"));
    expect(html).toMatch(coloured("literal", "1"));
    expect(html).toMatch(/color:var\(--code-comment\)[^>]*>\/\/ hi/);
    expect(html).not.toMatch(/#[0-9a-fA-F]{6}/);
  });

  it("marks the lines asked for", async () => {
    const h = await highlighter();
    const html = h("let a = 1;\nlet b = 2;\nlet c = 3;", [2]);
    const lines = html.match(/<span class="line[^"]*"/g);
    expect(lines).toEqual(['<span class="line"', '<span class="line changed"', '<span class="line"']);
  });
});
