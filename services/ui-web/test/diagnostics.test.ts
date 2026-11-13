import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { asDiagnostics, errorLines, text } from "../src/lib/diagnostics";

// lughac's own output for content step 2 (captured at m154, unchanged at m159) (lughac build --diagnostics json).
const e0501: unknown = JSON.parse(readFileSync(new URL("fixtures/e0501.json", import.meta.url), "utf8"));

describe("asDiagnostics", () => {
  it("reads lughac's JSON diagnostics", () => {
    const [d] = asDiagnostics([e0501]);
    expect(d).toMatchObject({
      severity: "error",
      code: "E0501",
      file: "src/main.la",
      line: 6,
      col: 5,
      help: "make it mutable: `let mut b`",
      rendered: null,
    });
  });

  it("skips anything that isn't a diagnostic", () => {
    expect(asDiagnostics([null, 3, { code: "E1" }, e0501])).toHaveLength(1);
    expect(asDiagnostics("nope")).toEqual([]);
  });
});

describe("text", () => {
  it("shows lughac's rendered text unchanged when it's there", () => {
    const rendered = "error[E0501]: cannot assign to `b`: it is not mutable\n  --> src/main.la:6:5\n";
    const [d] = asDiagnostics([{ ...(e0501 as object), rendered }]);
    expect(text(d)).toBe(rendered);
  });

  it("otherwise gives the header, location and help from the JSON", () => {
    const [d] = asDiagnostics([e0501]);
    expect(text(d)).toBe(
      "error[E0501]: cannot assign to `b`: it is not mutable\n" +
        "  --> src/main.la:6:5\n" +
        "  = help: make it mutable: `let mut b`\n",
    );
  });

  it("leaves out help when there is none, and says warning for a warning", () => {
    const [d] = asDiagnostics([{ ...(e0501 as object), severity: "warning", code: "W0101", help: null }]);
    expect(text(d)).toBe("warning[W0101]: cannot assign to `b`: it is not mutable\n  --> src/main.la:6:5\n");
  });
});

describe("errorLines", () => {
  it("gives the lines of errors in one file, once each, not warnings", () => {
    const ds = asDiagnostics([
      e0501,
      e0501,
      { ...(e0501 as object), severity: "warning" },
      { ...(e0501 as object), file: "src/other.la" },
    ]);
    expect(errorLines(ds, "src/main.la")).toEqual([6]);
    expect(errorLines(ds, "src/other.la")).toEqual([6]);
    expect(errorLines(ds, "lugha.toml")).toEqual([]);
  });
});
