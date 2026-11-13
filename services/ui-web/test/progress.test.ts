// Tests when a step counts as done, and where the sun sits on the horizon.
import { describe, expect, it } from "vitest";
import { asProgress, doneBy, markDone, startOver, sunPosition, type Progress } from "../src/lib/progress";

describe("a step's done rule", () => {
  const ran = (stdout: string, exit = 0) => ({ kind: "run", compiled: true, exit, stdout }) as const;

  it("a fix step: it compiles, exits 0 and prints what the solution prints", () => {
    expect(doneBy("fix", ran("[5, 6, 1]\n"), "[5, 6, 1]\n")).toBe(true);
    expect(doneBy("fix", { kind: "run", compiled: false, exit: 1, stdout: "" }, "1\n")).toBe(false);
    expect(doneBy("fix", ran("1\n", 101), "1\n")).toBe(false);
  });

  it("a fix step whose start already runs isn't done until its output changes", () => {
    expect(doneBy("fix", ran("[5, 6]\n"), "[5, 6, 1]\n")).toBe(false);
    expect(doneBy("fix", ran("checking the input\n", 1), "checking the input\n")).toBe(false);
  });

  it("a reading step: any Run that came back", () => {
    expect(doneBy("read", ran("hot\n"), "")).toBe(true);
    expect(doneBy("read", { kind: "run", compiled: false, exit: 1, stdout: "" }, "")).toBe(true);
  });

  it("a quiz step: the right answer, and only an answer", () => {
    expect(doneBy("quiz", { kind: "answer", correct: true }, "")).toBe(true);
    expect(doneBy("quiz", { kind: "answer", correct: false }, "")).toBe(false);
    expect(doneBy("quiz", ran(""), "")).toBe(false);
  });

  it("an answer never finishes a fix or reading step", () => {
    expect(doneBy("fix", { kind: "answer", correct: true }, "")).toBe(false);
    expect(doneBy("read", { kind: "answer", correct: true }, "")).toBe(false);
  });
});

describe("progress", () => {
  const steps = ["1/1/1", "1/1/2", "1/1/3", "1/1/4"];

  it("marks a step done once, without changing the old progress", () => {
    const p0: Progress = { done: [] };
    const p1 = markDone(p0, "1/1/2");
    expect(p0.done).toEqual([]);
    expect(p1.done).toEqual(["1/1/2"]);
    expect(markDone(p1, "1/1/2")).toBe(p1);
  });

  it("puts the sun at done steps out of all steps", () => {
    expect(sunPosition({ done: [] }, steps)).toBe(0);
    expect(sunPosition({ done: ["1/1/1"] }, steps)).toBe(0.25);
    expect(sunPosition({ done: steps }, steps)).toBe(1);
  });

  it("ignores done steps the course no longer has", () => {
    expect(sunPosition({ done: ["1/1/1", "9/9/9"] }, steps)).toBe(0.25);
    expect(sunPosition({ done: ["1/1/1"] }, [])).toBe(0);
  });

  it("starts over with nothing done", () => {
    expect(startOver()).toEqual({ done: [] });
  });
});

describe("progress read back from storage", () => {
  it("keeps a well-formed value", () => {
    expect(asProgress({ done: ["1/1/1"] })).toEqual({ done: ["1/1/1"] });
  });

  it("starts with nothing done when the value is missing or malformed", () => {
    for (const v of [null, 3, "x", {}, { done: "1/1/1" }, { done: [1] }]) {
      expect(asProgress(v)).toEqual({ done: [] });
    }
  });
});
