import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DEFAULT_TOML } from "../src/lib/project";

describe("the default lugha.toml", () => {
  it("is the API's own default, word for word", () => {
    const api = readFileSync(new URL("../../api/src/checks/manifest.la", import.meta.url), "utf8");
    const m = /const DEFAULT: string = "((?:[^"\\]|\\.)*)";/.exec(api);
    expect(m).not.toBeNull();
    expect(DEFAULT_TOML).toBe(JSON.parse(`"${m![1]}"`));
  });
});
