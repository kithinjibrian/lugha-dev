// Tests that the site's default lugha.toml matches the API's, so both start a project the same way,
// and that a step's own lugha.toml takes its place.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DEFAULT_TOML, projectOfFiles } from "../src/lib/project";

describe("the default lugha.toml", () => {
  it("is the API's own default, word for word", () => {
    const api = readFileSync(new URL("../../api/src/checks/manifest.la", import.meta.url), "utf8");
    const m = /const DEFAULT: string = "((?:[^"\\]|\\.)*)";/.exec(api);
    expect(m).not.toBeNull();
    expect(DEFAULT_TOML).toBe(JSON.parse(`"${m![1]}"`));
  });
});

describe("projectOfFiles", () => {
  const main = { path: "src/main.la", text: "fun main() {}\n" };

  it("adds the default lugha.toml when the step has none", () => {
    expect(projectOfFiles([main]).files).toEqual([main, { path: "lugha.toml", text: DEFAULT_TOML }]);
  });

  it("keeps a step's own lugha.toml instead of adding the default", () => {
    const own = { path: "lugha.toml", text: '[package]\nname = "shapes"\n' };
    expect(projectOfFiles([main, own]).files).toEqual([main, own]);
  });
});

