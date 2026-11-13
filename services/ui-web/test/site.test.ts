// Checks where the header's Learn and Examples links lead.
import { describe, expect, it } from "vitest";
import { entries, type Site } from "../src/content/site";

const siteWith = (chapters: unknown[], examples: unknown[]) => ({ chapters, examples }) as unknown as Site;

describe("entries", () => {
  it("gives the first step and the first example", () => {
    const s = siteWith([{ lessons: [{ steps: [{ id: "values/a/b" }, { id: "values/a/c" }] }] }], [{ slug: "hello-world" }, { slug: "fib" }]);
    expect(entries(s)).toEqual({ learn: "/learn/values/a/b", examples: "/examples/hello-world" });
  });

  it("gives Home when there's nothing to open", () => {
    expect(entries(siteWith([], []))).toEqual({ learn: "/", examples: "/" });
  });
});
