import { readFileSync } from "node:fs";
import { StringStream } from "@codemirror/language";
import { describe, expect, it } from "vitest";
import { BOOLEANS, CONSTANTS, KEYWORDS, lugha, PRIMITIVES } from "../src/editor/lugha";

/** Every non-plain token in `src`, as [text, token]. */
function tokens(src: string): [string, string][] {
  const out: [string, string][] = [];
  const state = lugha.startState!(2);
  for (const line of src.split("\n")) {
    const stream = new StringStream(line, 4, 2);
    while (!stream.eol()) {
      const style = lugha.token(stream, state);
      if (stream.pos === stream.start) throw new Error(`no progress at ${stream.pos} in ${line}`);
      if (style) out.push([stream.current(), style]);
      stream.start = stream.pos;
    }
  }
  return out;
}

describe("the tokenizer", () => {
  it("marks keywords, types and primitives", () => {
    expect(tokens("let mut p: Point = make(); fun f(x: i64): string")).toEqual([
      ["let", "keyword"],
      ["mut", "keyword"],
      ["Point", "type"],
      ["fun", "keyword"],
      ["i64", "type"],
      ["string", "type"],
    ]);
  });

  it("marks numbers, booleans and the built-in constants", () => {
    expect(tokens("0x1F 0b1_0 0o7 3.5e-2 1_000 true None Some(x) n2")).toEqual([
      ["0x1F", "number"],
      ["0b1_0", "number"],
      ["0o7", "number"],
      ["3.5e-2", "number"],
      ["1_000", "number"],
      ["true", "bool"],
      ["None", "constant"],
      ["Some", "constant"],
    ]);
  });

  it("marks strings with escapes and {…} interpolation as code", () => {
    expect(tokens('"a\\n{x + 1} {{lit}} {p.y:>3}"')).toEqual([
      ['"', "string"],
      ["a", "string"],
      ["\\n", "escape"],
      ["{", "interpolation"],
      ["1", "number"],
      ["}", "interpolation"],
      [" ", "string"],
      ["{{", "escape"],
      ["lit", "string"],
      ["}}", "escape"],
      [" ", "string"],
      ["{", "interpolation"],
      [":>3", "escape"],
      ["}", "interpolation"],
      ['"', "string"],
    ]);
  });

  it("keeps braces inside an interpolation as code", () => {
    expect(tokens('"{f(#{1: 2})}" let')).toEqual([
      ['"', "string"],
      ["{", "interpolation"],
      ["1", "number"],
      ["2", "number"],
      ["}", "interpolation"],
      ['"', "string"],
      ["let", "keyword"],
    ]);
  });

  it("ends an unclosed string at the end of the line, as the grammar does", () => {
    expect(tokens('"open\nlet')).toEqual([
      ['"', "string"],
      ["open", "string"],
      ["let", "keyword"],
    ]);
  });

  it("marks chars", () => {
    expect(tokens("'a' '\\n' '\\u{1F600}'")).toEqual([
      ["'a'", "string"],
      ["'\\n'", "string"],
      ["'\\u{1F600}'", "string"],
    ]);
  });

  it("marks line comments, and nested block comments across lines", () => {
    expect(tokens("x // let\n/* a /* b */\nlet */ let")).toEqual([
      ["// let", "comment"],
      ["/* a /* b */", "comment"],
      ["let */", "comment"],
      ["let", "keyword"],
    ]);
  });

  it("marks attributes", () => {
    expect(tokens("@test\nfun t() {}")).toEqual([
      ["@test", "attribute"],
      ["fun", "keyword"],
    ]);
  });

  it("leaves names and words that are keywords only in context plain", () => {
    expect(tokens("letter after default out data")).toEqual([]);
  });
});

describe("the tokenizer's words", () => {
  const grammar = JSON.parse(
    readFileSync(new URL("../grammar/lugha.tmLanguage.json", import.meta.url), "utf8"),
  ) as { repository: Record<string, { patterns: { name?: string; match?: string }[] }> };

  /** The words of the plain `\b(a|b|…)\b` patterns whose scope starts with one of `scopes`. */
  function words(rule: string, scopes: string[]): string[] {
    return grammar.repository[rule].patterns
      .filter((p) => p.name && scopes.some((s) => p.name!.startsWith(s)))
      .flatMap((p) => /^\\b\(?([a-z0-9_|]+)\)?\\b$/i.exec(p.match ?? "")?.[1].split("|") ?? [])
      .sort();
  }

  it("has exactly the grammar's keywords", () => {
    const expected = words("keyword", [
      "keyword.control",
      "keyword.other",
      "storage.modifier.lugha",
      "keyword.operator.as",
      "variable.language.self",
    ]);
    expect(expected.length).toBeGreaterThan(20);
    expect([...KEYWORDS].sort()).toEqual(expected);
  });

  it("has exactly the grammar's primitive types, booleans and constants", () => {
    expect([...PRIMITIVES].sort()).toEqual(words("keyword", ["storage.type.primitive"]));
    expect([...BOOLEANS].sort()).toEqual(words("keyword", ["constant.language.boolean"]));
    expect([...CONSTANTS].sort()).toEqual(words("builtin", ["support.constant"]));
  });
});

describe("the editor's colours", () => {
  it("give every token the tokenizer returns a tag", async () => {
    const { TOKEN_TAGS } = await import("../src/editor/theme");
    const returned = ["keyword", "type", "number", "bool", "constant", "string", "escape", "interpolation", "comment", "attribute"];
    expect(Object.keys(TOKEN_TAGS).sort()).toEqual(returned.sort());
  });
});
