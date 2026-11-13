// Shapes the content bundle at /content/v1/: what services/ui-rk
// will read. `v1` is in the path so the shape can change without breaking it.
import type { Chapter, Example, Lesson } from "./load";

/**
 * Gives the bundle's index: every chapter, lesson, step and example, with the URL of each lesson's
 * and example's JSON.
 */
export function index(chapters: Chapter[], examples: Example[]) {
  return {
    v: 1,
    chapters: chapters.map((c) => ({
      slug: c.slug,
      title: c.title,
      lessons: c.lessons.map((l) => ({
        slug: l.slug,
        title: l.title,
        url: `/content/v1/lessons/${c.slug}/${l.slug}.json`,
        steps: l.steps.map((s) => ({ id: s.id, title: s.title, kind: s.kind })),
      })),
    })),
    examples: examples.map((e) => ({
      slug: e.slug,
      title: e.title,
      group: e.group,
      intro: e.intro,
      tags: e.tags,
      url: `/content/v1/examples/${e.slug}.json`,
    })),
    explanations: "/content/v1/explanations.json",
  };
}

/** Gives one lesson's JSON, without its steps' folders in content/. */
export function lesson(chapter: Chapter, l: Lesson) {
  return {
    v: 1,
    chapter: { slug: chapter.slug, title: chapter.title },
    slug: l.slug,
    title: l.title,
    steps: l.steps.map(({ path: _path, ...s }) => s),
  };
}

/** Gives one example's JSON. */
export function example(e: Example) {
  return { v: 1, ...e };
}
