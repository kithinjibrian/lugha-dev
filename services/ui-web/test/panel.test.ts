import { describe, expect, it } from "vitest";
import { asDiagnostics } from "../src/lib/diagnostics";
import { runPanel } from "../src/lib/panel";
import { copy } from "../src/lib/copy";
import { err, ok } from "../src/lib/result";
import { readFileSync } from "node:fs";

const e0501 = asDiagnostics([JSON.parse(readFileSync(new URL("fixtures/e0501.json", import.meta.url), "utf8"))]);
const ran = (program: object) => ok({ v: 1, kind: "run", compile: { ok: true, stopped: null, diagnostics: [] }, program });
const base = { exit_code: 0, stdout: "hi\n", stderr: "", stopped: null, truncated: { stdout: false, stderr: false } };

describe("runPanel", () => {
  it("shows a program's output and exit code", () => {
    expect(runPanel(ran(base))).toEqual({ kind: "ran", stdout: "hi\n", stderr: "", exit: 0, notes: [], warnings: [] });
  });

  it("adds the sentence for a stopped or cut program after its output", () => {
    expect(runPanel(ran({ ...base, exit_code: 124, stopped: "time" }))).toMatchObject({ kind: "ran", stdout: "hi\n", notes: [copy.stoppedTime] });
    expect(runPanel(ran({ ...base, exit_code: 101, stopped: "memory" }))).toMatchObject({ notes: [copy.stoppedMemory] });
    expect(runPanel(ran({ ...base, truncated: { stdout: true, stderr: false } }))).toMatchObject({ notes: [copy.outputCut] });
  });

  it("shows compile errors", () => {
    const r = ok({ v: 1, kind: "run", compile: { ok: false, stopped: null, diagnostics: [JSON.parse(readFileSync(new URL("fixtures/e0501.json", import.meta.url), "utf8"))] }, program: null });
    expect(runPanel(r)).toEqual({ kind: "compile-error", diagnostics: e0501 });
  });

  it("gives the API's sentence, as sent", () => {
    expect(runPanel(err({ kind: "refused", sentence: "Too fast." }))).toEqual({ kind: "message", sentence: "Too fast." });
  });

  it("says busy, offline, or the service sentence for an answer it can't read", () => {
    expect(runPanel(err({ kind: "busy" }))).toEqual({ kind: "message", sentence: copy.busy });
    expect(runPanel(err({ kind: "offline" }))).toEqual({ kind: "message", sentence: copy.offline });
    expect(runPanel(ok({ nonsense: true }))).toEqual({ kind: "message", sentence: copy.service });
  });
});
