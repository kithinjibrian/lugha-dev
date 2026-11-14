// Tests what the browser keeps: a step's edits, progress and the Playground's project.
import { describe, expect, it } from "vitest";
import { makeStore } from "../src/lib/storage";
import { kept } from "../src/lib/kept";
import { projectOf } from "../src/lib/project";

function memory() {
  const data = new Map<string, string>();
  return makeStore({ getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) });
}

describe("what the browser keeps", () => {
  const one = [{ path: "src/main.la", text: "fun main() {}\n" }];
  const two = [
    { path: "src/main.la", text: "fun main() {}\n" },
    { path: "src/shapes.la", text: "pub fun a() {}\n" },
  ];

  it("keeps a one-file step's edits as its main.la, and forgets them on Reset", () => {
    const store = memory();
    const k = kept(store);
    expect(k.stepFiles("a/b/c", one)).toEqual(one);
    k.setStepFiles("a/b/c", [{ path: "src/main.la", text: "x" }], one);
    expect(store.get("step.a/b/c")).toBe("x");
    expect(k.stepFiles("a/b/c", one)).toEqual([{ path: "src/main.la", text: "x" }]);
    k.setStepFiles("a/b/c", null, one);
    expect(k.stepFiles("a/b/c", one)).toEqual(one);
  });

  it("keeps every file of a multi-file step, and nothing when they're as they started", () => {
    const store = memory();
    const k = kept(store);
    const edited = [two[0], { path: "src/shapes.la", text: "pub fun b() {}\n" }];
    k.setStepFiles("a/b/d", edited, two);
    expect(k.stepFiles("a/b/d", two)).toEqual(edited);
    k.setStepFiles("a/b/d", two, two);
    expect(store.get("step.a/b/d")).toBeNull();
  });

  it("reads an older one-string entry as main.la, and ignores files that no longer fit the step", () => {
    const store = memory();
    const k = kept(store);
    store.set("step.a/b/d", "old main");
    expect(k.stepFiles("a/b/d", two)).toEqual([{ path: "src/main.la", text: "old main" }, two[1]]);
    store.set("step.a/b/d", [{ path: "src/other.la", text: "?" }]);
    expect(k.stepFiles("a/b/d", two)).toEqual(two);
  });

  it("keeps progress, and clears it on Start over with every step's edits", () => {
    const k = kept(memory());
    expect(k.progress()).toEqual({ done: [] });
    k.setProgress({ done: ["a/b/c"] });
    k.setStepFiles("a/b/c", [{ path: "src/main.la", text: "x" }], one);
    expect(k.progress()).toEqual({ done: ["a/b/c"] });
    k.startOver(["a/b/c"]);
    expect(k.progress()).toEqual({ done: [] });
    expect(k.stepFiles("a/b/c", one)).toEqual(one);
  });

  it("gives the Playground's project, or the opening one", () => {
    const k = kept(memory());
    const opening = projectOf("fun main() {}\n");
    expect(k.playground(opening)).toEqual(opening);
    const mine = projectOf("fun main() { println(1); }\n");
    k.setPlayground(mine);
    expect(k.playground(opening)).toEqual(mine);
  });

  it("knows when the Playground has work that replacing would lose", () => {
    const k = kept(memory());
    const opening = projectOf("fun main() {}\n");
    expect(k.playgroundUnsaved(opening)).toBe(false);
    k.setPlayground(opening);
    expect(k.playgroundUnsaved(opening)).toBe(false);
    k.setPlayground({ ...opening, stdin: "x" });
    expect(k.playgroundUnsaved(opening)).toBe(true);
  });

  it("ignores a kept project that isn't one", () => {
    const store = memory();
    store.set("playground", { files: "nope" });
    const opening = projectOf("fun main() {}\n");
    expect(kept(store).playground(opening)).toEqual(opening);
    expect(kept(store).playgroundUnsaved(opening)).toBe(false);
  });
});
