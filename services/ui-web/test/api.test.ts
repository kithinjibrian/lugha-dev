import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { call, readFormat, readRun, readTest, TIMEOUT_MS, type Deps } from "../src/lib/api";

const e0501: unknown = JSON.parse(readFileSync(new URL("fixtures/e0501.json", import.meta.url), "utf8"));
const project = { files: [{ path: "src/main.la", text: "fun main() {}\n" }], args: [], stdin: "" };

function deps(respond: (url: string, init: RequestInit) => Promise<Response>, online = true): Deps {
  return { fetch: respond as typeof fetch, online: () => online, timeoutMs: 50 };
}

const json = (status: number, body: unknown) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } }));

describe("call", () => {
  it("posts the project to the route as PRP-001's request", async () => {
    let seen: { url: string; init: RequestInit } | null = null;
    const r = await call("run", { ...project, args: ["a"], stdin: "x\n" }, 2, deps((url, init) => {
      seen = { url, init };
      return json(200, { v: 1 });
    }));
    expect(r).toEqual({ ok: true, value: { v: 1 } });
    expect(seen!.url).toBe("/api/run");
    expect(seen!.init.method).toBe("POST");
    expect(JSON.parse(seen!.init.body as string)).toEqual({
      files: project.files,
      entry: "src/main.la",
      args: ["a"],
      stdin: "x\n",
      opt: 2,
    });
  });

  it("sends only the files for test and format", async () => {
    let body: unknown = null;
    await call("format", project, 0, deps((_, init) => {
      body = JSON.parse(init.body as string);
      return json(200, {});
    }));
    expect(body).toEqual({ files: project.files });
  });

  it("gives the API's sentence for a refusal, as sent", async () => {
    for (const status of [400, 429, 503]) {
      const r = await call("run", project, 0, deps(() => json(status, { error: `Sentence ${status}.` })));
      expect(r).toEqual({ ok: false, error: { kind: "refused", sentence: `Sentence ${status}.` } });
    }
  });

  it("is busy when nothing answers in time", async () => {
    const never = (_: string, init: RequestInit) =>
      new Promise<Response>((_, reject) => {
        init.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
      });
    expect(await call("run", project, 0, deps(never))).toEqual({ ok: false, error: { kind: "busy" } });
    expect(TIMEOUT_MS).toBe(65_000);
  });

  it("is busy for an answer that isn't the API's JSON (Caddy's 502 or 504)", async () => {
    const html = () => Promise.resolve(new Response("<html>Bad Gateway</html>", { status: 502 }));
    expect(await call("run", project, 0, deps(html))).toEqual({ ok: false, error: { kind: "busy" } });
    expect(await call("run", project, 0, deps(() => json(504, {})))).toEqual({ ok: false, error: { kind: "busy" } });
  });

  it("is offline when the browser says so, without sending anything", async () => {
    let sent = false;
    const r = await call("run", project, 0, deps(() => {
      sent = true;
      return json(200, {});
    }, false));
    expect(r).toEqual({ ok: false, error: { kind: "offline" } });
    expect(sent).toBe(false);
  });

  it("is offline when the request fails to go out", async () => {
    const fail = () => Promise.reject(new TypeError("Failed to fetch"));
    expect(await call("run", project, 0, deps(fail))).toEqual({ ok: false, error: { kind: "offline" } });
  });
});

describe("readRun", () => {
  it("reads a compile error", () => {
    const r = readRun({ v: 1, kind: "run", compile: { ok: false, stopped: null, diagnostics: [e0501] }, program: null });
    expect(r).toMatchObject({ state: "compile-error", diagnostics: [{ code: "E0501", line: 6 }] });
  });

  it("reads a compile that ran out of time", () => {
    const r = readRun({ v: 1, kind: "run", compile: { ok: false, stopped: "time", diagnostics: [] }, program: null });
    expect(r).toEqual({ state: "compile-stopped" });
  });

  it("reads a program that ran, with its warnings", () => {
    const warning = { ...(e0501 as object), severity: "warning", code: "W0101" };
    const r = readRun({
      v: 1,
      kind: "run",
      compile: { ok: true, stopped: null, diagnostics: [warning] },
      program: { exit_code: 3, stdout: "hi\n", stderr: "oops\n", stopped: null, truncated: { stdout: false, stderr: true } },
    });
    expect(r).toMatchObject({
      state: "ran",
      exit: 3,
      stdout: "hi\n",
      stderr: "oops\n",
      stopped: null,
      truncated: true,
      warnings: [{ code: "W0101" }],
    });
  });

  it("reads a program stopped for time or memory", () => {
    for (const why of ["time", "memory"] as const) {
      const r = readRun({
        v: 1,
        kind: "run",
        compile: { ok: true, stopped: null, diagnostics: [] },
        program: { exit_code: 124, stdout: "so far\n", stderr: "", stopped: why, truncated: { stdout: false, stderr: false } },
      });
      expect(r).toMatchObject({ state: "ran", stopped: why, stdout: "so far\n" });
    }
  });

  it("gives null for anything else", () => {
    for (const v of [null, {}, { v: 2, kind: "run" }, { v: 1, kind: "test" }, { v: 1, kind: "run", compile: { ok: true }, program: {} }]) {
      expect(readRun(v)).toBeNull();
    }
  });
});

describe("readTest", () => {
  const tests = [
    { test: "src.main.b", file: "src/main.la", line: 4, status: "skipped", message: "later", output: "", ms: 5 },
    { test: "src.main.a", file: "src/main.la", line: 2, status: "failed", message: "assert_eq failed: left 1, right 2", at: { file: "main.la", line: 2, col: 11 }, output: "", ms: 5 },
  ];

  it("reads lughac's test lines and summary", () => {
    const r = readTest({ v: 1, kind: "test", tests, summary: { passed: 0, failed: 1, skipped: 1, uncompiled: 0 }, compile_error: null, stopped: null });
    expect(r).toEqual({
      state: "tested",
      tests: [
        { name: "src.main.b", file: "src/main.la", line: 4, status: "skipped", message: "later", at: null, output: "" },
        { name: "src.main.a", file: "src/main.la", line: 2, status: "failed", message: "assert_eq failed: left 1, right 2", at: { file: "main.la", line: 2, col: 11 }, output: "" },
      ],
      summary: { passed: 0, failed: 1, skipped: 1, uncompiled: 0 },
      stopped: null,
    });
  });

  it("reads tests that didn't compile, with lughac's text", () => {
    const r = readTest({ v: 1, kind: "test", tests: [], summary: { passed: 0, failed: 0, skipped: 0, uncompiled: 1 }, compile_error: "error[E0501]: …\n", stopped: null });
    expect(r).toEqual({ state: "test-compile-error", text: "error[E0501]: …\n" });
  });

  it("gives null for anything else", () => {
    expect(readTest({ v: 1, kind: "run" })).toBeNull();
    expect(readTest({ v: 1, kind: "test", tests: "x", summary: null })).toBeNull();
  });
});

describe("readFormat", () => {
  it("reads the files that changed", () => {
    const files = [{ path: "src/main.la", text: "fun main() {}\n" }];
    expect(readFormat({ v: 1, kind: "format", files })).toEqual({ state: "formatted", files });
  });

  it("reads lughac fmt's error text", () => {
    expect(readFormat({ v: 1, kind: "format", error: "error: …\n", stopped: null })).toEqual({ state: "format-error", text: "error: …\n" });
  });

  it("gives null for anything else", () => {
    expect(readFormat({ v: 1, kind: "format", files: [{ path: 1 }] })).toBeNull();
  });
});
