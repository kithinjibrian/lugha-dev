import { describe, expect, it } from "vitest";
import { makeStore } from "../src/lib/storage";
import { kept } from "../src/lib/kept";
import { projectOf } from "../src/lib/project";

function memory() {
  const data = new Map<string, string>();
  return makeStore({ getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) });
}

describe("what the browser keeps", () => {
  it("keeps a step's edits, and forgets them on Reset", () => {
    const k = kept(memory());
    expect(k.stepCode("a/b/c")).toBeNull();
    k.setStepCode("a/b/c", "fun main() {}\n");
    expect(k.stepCode("a/b/c")).toBe("fun main() {}\n");
    k.setStepCode("a/b/c", null);
    expect(k.stepCode("a/b/c")).toBeNull();
  });

  it("keeps progress, and clears it on Start over with every step's edits", () => {
    const k = kept(memory());
    expect(k.progress()).toEqual({ done: [] });
    k.setProgress({ done: ["a/b/c"] });
    k.setStepCode("a/b/c", "x");
    expect(k.progress()).toEqual({ done: ["a/b/c"] });
    k.startOver(["a/b/c"]);
    expect(k.progress()).toEqual({ done: [] });
    expect(k.stepCode("a/b/c")).toBeNull();
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
