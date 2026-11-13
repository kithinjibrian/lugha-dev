// Talks to the API: `call` sends a request and gives the JSON back, or why there's none; `readRun`,
// `readTest` and `readFormat` turn that JSON into outcomes for the output panel. The sentences the
// panel shows live with the panel, not here.
import { asDiagnostics, type Diagnostic } from "./diagnostics";
import type { File, Project } from "./project";
import { err, ok, type Result } from "./result";

/**
 * Waits this many milliseconds for the API: longer than Caddy's 60 s, so Caddy's own answer
 * arrives first when it can.
 */
export const TIMEOUT_MS = 65_000;

/** Names the API's routes. */
export type Route = "run" | "test" | "format";

/** Says why a request gave back no JSON to use. */
export type Failure =
  | { kind: "refused"; sentence: string }
  | { kind: "busy" }
  | { kind: "offline" };

/** Holds what `call` needs from the browser, so tests can stand in for it. */
export interface Deps {
  fetch: typeof fetch;
  online: () => boolean;
  timeoutMs: number;
}

/** Gives the browser's fetch and online state, with the default timeout. */
export function browserDeps(): Deps {
  return {
    fetch: (input, init) => globalThis.fetch(input, init),
    online: () => globalThis.navigator?.onLine ?? true,
    timeoutMs: TIMEOUT_MS,
  };
}

/**
 * Sends a project to one of the API's routes and gives back its JSON. `opt` is the optimisation
 * level, which only Run sends.
 *
 * Errors: `refused` with the API's own sentence for a 4xx or 5xx that carries one; `busy` when
 * nothing answers within `timeoutMs` or the answer isn't the API's JSON; `offline` when the browser
 * says so or the request can't be sent.
 */
export async function call(
  route: Route,
  project: Project,
  opt: 0 | 2,
  deps: Deps,
): Promise<Result<unknown, Failure>> {
  if (!deps.online()) {
    return err({ kind: "offline" });
  }
  const body =
    route === "run"
      ? { files: project.files, entry: "src/main.la", args: project.args, stdin: project.stdin, opt }
      : { files: project.files };
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), deps.timeoutMs);
  let response: Response;
  try {
    response = await deps.fetch(`/api/${route}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: abort.signal,
    });
  } catch {
    return err(abort.signal.aborted ? { kind: "busy" } : { kind: "offline" });
  } finally {
    clearTimeout(timer);
  }
  let value: unknown;
  try {
    value = await response.json();
  } catch {
    return err({ kind: "busy" });
  }
  if (response.ok) {
    return ok(value);
  }
  const sentence = (value as { error?: unknown } | null)?.error;
  return typeof sentence === "string" ? err({ kind: "refused", sentence }) : err({ kind: "busy" });
}

/** Names what the sandbox stopped a program for. */
export type Stopped = "time" | "memory";

/** Describes a Run's answer: a compile error, a compile stopped for time, or a program that ran. */
export type RunOutcome =
  | { state: "compile-error"; diagnostics: Diagnostic[] }
  | { state: "compile-stopped" }
  | {
      state: "ran";
      exit: number;
      stdout: string;
      stderr: string;
      stopped: Stopped | null;
      /** Tells whether stdout or stderr was cut at 64 KB. */
      truncated: boolean;
      warnings: Diagnostic[];
    };

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

function isResult(v: unknown, kind: Route): v is Obj {
  return isObj(v) && v.v === 1 && v.kind === kind;
}

function asStopped(v: unknown): Stopped | null | undefined {
  if (v === null || v === undefined) return null;
  return v === "time" || v === "memory" ? v : undefined;
}

/** Reads a Run's JSON; null when it isn't the API's answer to a Run. */
export function readRun(v: unknown): RunOutcome | null {
  if (!isResult(v, "run") || !isObj(v.compile)) return null;
  const compile = v.compile;
  const diagnostics = asDiagnostics(compile.diagnostics);
  if (compile.ok !== true) {
    return compile.stopped === "time" ? { state: "compile-stopped" } : { state: "compile-error", diagnostics };
  }
  const p = v.program;
  if (!isObj(p) || typeof p.exit_code !== "number" || typeof p.stdout !== "string" || typeof p.stderr !== "string") {
    return null;
  }
  const stopped = asStopped(p.stopped);
  const truncated = isObj(p.truncated) ? p.truncated.stdout === true || p.truncated.stderr === true : false;
  if (stopped === undefined) return null;
  return {
    state: "ran",
    exit: p.exit_code,
    stdout: p.stdout,
    stderr: p.stderr,
    stopped,
    truncated,
    warnings: diagnostics.filter((d) => d.severity === "warning"),
  };
}

/** Holds one test's result. */
export interface TestLine {
  name: string;
  file: string;
  line: number;
  status: "passed" | "failed" | "skipped";
  message: string;
  /** Where a failed test panicked. */
  at: { file: string; line: number; col: number } | null;
  output: string;
}

/** Counts a test run's tests by outcome, and the files that didn't compile. */
export interface Summary {
  passed: number;
  failed: number;
  skipped: number;
  uncompiled: number;
}

/** Describes a Test's answer: the tests and their summary, or lughac's text when they didn't compile. */
export type TestOutcome =
  | { state: "tested"; tests: TestLine[]; summary: Summary; stopped: Stopped | null }
  | { state: "test-compile-error"; text: string };

function asTestLine(v: unknown): TestLine | null {
  if (!isObj(v)) return null;
  const { test, file, line, status, message, output, at } = v;
  if (
    typeof test !== "string" ||
    typeof file !== "string" ||
    typeof line !== "number" ||
    (status !== "passed" && status !== "failed" && status !== "skipped")
  ) {
    return null;
  }
  return {
    name: test,
    file,
    line,
    status,
    message: typeof message === "string" ? message : "",
    at:
      isObj(at) && typeof at.file === "string" && typeof at.line === "number" && typeof at.col === "number"
        ? { file: at.file, line: at.line, col: at.col }
        : null,
    output: typeof output === "string" ? output : "",
  };
}

function asSummary(v: unknown): Summary | null {
  if (!isObj(v)) return null;
  const n = (k: string) => (typeof v[k] === "number" ? (v[k] as number) : null);
  const [passed, failed, skipped, uncompiled] = ["passed", "failed", "skipped", "uncompiled"].map(n);
  if (passed === null || failed === null || skipped === null || uncompiled === null) return null;
  return { passed, failed, skipped, uncompiled };
}

/** Reads a Test's JSON; null when it isn't the API's answer to a Test. */
export function readTest(v: unknown): TestOutcome | null {
  if (!isResult(v, "test") || !Array.isArray(v.tests)) return null;
  if (typeof v.compile_error === "string") {
    return { state: "test-compile-error", text: v.compile_error };
  }
  const tests = v.tests.map(asTestLine);
  const summary = asSummary(v.summary);
  const stopped = asStopped(v.stopped);
  if (tests.some((t) => t === null) || summary === null || stopped === undefined) return null;
  return { state: "tested", tests: tests as TestLine[], summary, stopped };
}

/** Describes a Format's answer: the formatted files, or lughac's error text. */
export type FormatOutcome =
  | { state: "formatted"; files: File[] }
  | { state: "format-error"; text: string };

/** Reads a Format's JSON; null when it isn't the API's answer to a Format. */
export function readFormat(v: unknown): FormatOutcome | null {
  if (!isResult(v, "format")) return null;
  if (typeof v.error === "string") {
    return { state: "format-error", text: v.error };
  }
  if (!Array.isArray(v.files)) return null;
  const files: File[] = [];
  for (const f of v.files) {
    if (!isObj(f) || typeof f.path !== "string" || typeof f.text !== "string") return null;
    files.push({ path: f.path, text: f.text });
  }
  return { state: "formatted", files };
}
