// What the output panel shows for a Run (PRP-002, WEB-7), from the API
// client's result. The sentences are copy.ts's, as approved.
import { readRun, type Failure } from "./api";
import { copy } from "./copy";
import type { Diagnostic } from "./diagnostics";
import type { Result } from "./result";

export type Panel =
  | { kind: "idle" }
  | { kind: "running" }
  | { kind: "compile-error"; diagnostics: Diagnostic[] }
  | { kind: "ran"; stdout: string; stderr: string; exit: number; notes: string[]; warnings: Diagnostic[] }
  | { kind: "message"; sentence: string };

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

export function runPanel(r: Result<unknown, Failure>): Panel {
  if (!r.ok) return { kind: "message", sentence: failureSentence(r.error) };
  const o = readRun(r.value);
  if (o === null) return { kind: "message", sentence: copy.service };
  switch (o.state) {
    case "compile-error":
      return { kind: "compile-error", diagnostics: o.diagnostics };
    case "compile-stopped":
      // No sentence of its own is approved yet; the service sentence until one is.
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
