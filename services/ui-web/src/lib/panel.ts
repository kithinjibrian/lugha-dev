// Decides what the output panel shows for a Run, from the API client's result. It writes no
// sentence of its own: they all come from `copy`.
import { readRun, type Failure } from "./api";
import { copy } from "./copy";
import type { Diagnostic } from "./diagnostics";
import type { Result } from "./result";

/** Lists the states the output panel can show. */
export type Panel =
  | { kind: "idle" }
  | { kind: "running" }
  | { kind: "compile-error"; diagnostics: Diagnostic[] }
  | { kind: "ran"; stdout: string; stderr: string; exit: number; notes: string[]; warnings: Diagnostic[] }
  | { kind: "message"; sentence: string }
  /** lughac's own text, as it printed it (Format's and Test's errors). */
  | { kind: "text"; text: string };

/** Gives the sentence the panel shows when a request got no answer it could use. */
export function failureSentence(f: Failure): string {
  switch (f.kind) {
    case "refused":
      return f.sentence;
    case "busy":
      return copy.busy;
    case "offline":
      return copy.offline;
  }
}

/** Turns a Run's result into the panel's state; an answer that isn't the API's shows the service sentence. */
export function runPanel(r: Result<unknown, Failure>): Panel {
  if (!r.ok) return { kind: "message", sentence: failureSentence(r.error) };
  const o = readRun(r.value);
  if (o === null) return { kind: "message", sentence: copy.service };
  switch (o.state) {
    case "compile-error":
      return { kind: "compile-error", diagnostics: o.diagnostics };
    case "compile-stopped":
      // A compile stopped for time has no sentence of its own yet, so it shows the service sentence.
      return { kind: "message", sentence: copy.service };
    case "ran": {
      const notes: string[] = [];
      if (o.stopped === "time") notes.push(copy.stoppedTime);
      if (o.stopped === "memory") notes.push(copy.stoppedMemory);
      if (o.truncated) notes.push(copy.outputCut);
      return { kind: "ran", stdout: o.stdout, stderr: o.stderr, exit: o.exit, notes, warnings: o.warnings };
    }
  }
}
