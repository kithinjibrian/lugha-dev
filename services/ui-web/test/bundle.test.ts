import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { example, index, lesson } from "../src/content/bundle";
import { loadContent } from "../src/content/load";

const code = (source: string) => `<pre>${source}</pre>`;

describe("the content bundle", async () => {
  const r = await loadContent(join(import.meta.dirname, "../../../content"), code);
  if (!r.ok) throw new Error(r.error.join("\n"));
  const { chapters, examples } = r.value;

  it("indexes chapters, lessons, steps and examples, with their URLs", () => {
    const i = index(chapters, examples);
    expect(i.v).toBe(1);
    expect(i.chapters[0].lessons[0].url).toBe("/content/v1/lessons/values/everything-is-a-value.json");
    expect(i.chapters[0].lessons[0].steps[1]).toEqual({
      id: "values/everything-is-a-value/your-copy-needs-mut",
      title: "Your copy needs mut",
      kind: "fix",
    });
    expect(i.examples[0]).toMatchObject({ slug: "hello-world", url: "/content/v1/examples/hello-world.json" });
    expect(i.explanations).toBe("/content/v1/explanations.json");
  });

  it("gives a lesson's steps whole, without the site's own folder paths", () => {
    const l = lesson(chapters[0], chapters[0].lessons[0]);
    expect(l.chapter).toEqual({ slug: "values", title: "Values" });
    expect(l.steps[1]).toMatchObject({ startError: "E0501", solution: expect.any(String), expected: expect.any(String) });
    expect(l.steps.every((s) => !("path" in s))).toBe(true);
  });

  it("gives an example whole", () => {
    expect(example(examples[2])).toMatchObject({ v: 1, slug: "word-frequency", stdin: expect.stringContaining("the cat") });
  });
});
