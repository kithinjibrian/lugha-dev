// Tests printing a Test result the way plain `lughac test` prints it.
import { describe, expect, it } from "vitest";
import { readTest, type TestOutcome } from "../src/lib/api";
import { testText } from "../src/lib/testtext";

/** A Test result from `lughac test --json` lines, as the API sends it. */
function outcome(lines: string): Extract<TestOutcome, { state: "tested" }> {
  const parsed = lines.trim().split("\n").map((l) => JSON.parse(l));
  const summary = parsed.pop().summary;
  const r = readTest({ v: 1, kind: "test", tests: parsed, summary, compile_error: null, stopped: null });
  if (r?.state !== "tested") throw new Error("not a test result");
  return r;
}

// lughac's own output: the JSON lines, then what plain `lughac test` printed.
describe("testText", () => {
  it("prints passed, skipped and failed tests in file order, with the summary", () => {
    const r = outcome(`
{"test":"src.main.c","file":"src/main.la","line":6,"status":"passed","output":"","ms":5}
{"test":"src.main.b","file":"src/main.la","line":4,"status":"skipped","message":"later","output":"","ms":5}
{"test":"src.main.a","file":"src/main.la","line":2,"status":"failed","message":"assert_eq failed: left 1, right 2","at":{"file":"main.la","line":2,"col":11},"output":"","ms":5}
{"summary":{"passed":1,"failed":1,"skipped":1,"uncompiled":0}}`);
    expect(testText(r)).toBe(
      "test src.main.a ... FAILED\n" +
        "    panic: assert_eq failed: left 1, right 2 at main.la:2:11\n" +
        "test src.main.b ... skipped (later)\n" +
        "test src.main.c ... ok\n" +
        "\n" +
        "3 tests: 1 passed, 1 failed, 1 skipped\n",
    );
  });

  it("prints a failed test's output", () => {
    const r = outcome(`
{"test":"src.two.a","file":"src/two.la","line":2,"status":"failed","message":"assertion failed","at":{"file":"two.la","line":2,"col":25},"output":"x\\n","ms":5}
{"test":"src.two.b","file":"src/two.la","line":4,"status":"passed","output":"","ms":5}
{"summary":{"passed":1,"failed":1,"skipped":0,"uncompiled":0}}`);
    expect(testText(r)).toBe(
      "test src.two.a ... FAILED\n" +
        "    panic: assertion failed at two.la:2:25\n" +
        "    --- output ---\n" +
        "    x\n" +
        "test src.two.b ... ok\n" +
        "\n" +
        "2 tests: 1 passed, 1 failed\n",
    );
  });

  it("prints one test, and none", () => {
    const one = outcome(`
{"test":"src.main.t","file":"src/main.la","line":1,"status":"passed","output":"","ms":5}
{"summary":{"passed":1,"failed":0,"skipped":0,"uncompiled":0}}`);
    expect(testText(one)).toBe("test src.main.t ... ok\n\n1 test: 1 passed, 0 failed\n");
    expect(testText(outcome(`{"summary":{"passed":0,"failed":0,"skipped":0,"uncompiled":0}}`))).toBe("0 tests\n");
  });

  it("counts files that didn't compile, as lughac does", () => {
    const r = outcome(`{"summary":{"passed":0,"failed":0,"skipped":0,"uncompiled":2}}`);
    expect(testText(r)).toBe("0 tests, 2 files didn't compile\n");
  });
});
