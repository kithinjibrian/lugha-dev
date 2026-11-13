// Loads everything the pages need from content/ and lughac, once per build.
// Any problem fails the build, listing every one.
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseExplanations, type Explanation } from "./explanations";
import { highlighter } from "./highlight";
import { loadContent, type Content } from "./load";

/** Holds the content, lughac's version and explanations, and a highlighter. */
export interface Site extends Content {
  /** The sandbox image's `lughac --version`: "lughac 0.1.0". */
  version: string;
  explanations: Record<string, Explanation>;
  /** Highlights Lugha for a page (Home's card). */
  highlight: (source: string, marks?: number[]) => string;
}

const CONTENT_DIR = resolve(process.env.CONTENT_DIR ?? "../../content");
const EXPLANATIONS = resolve("generated/explanations.txt");

let loaded: Promise<Site> | null = null;

async function load(): Promise<Site> {
  const highlight = await highlighter();
  const content = await loadContent(CONTENT_DIR, highlight);
  if (!existsSync(EXPLANATIONS)) {
    throw new Error(`${EXPLANATIONS} is missing: run scripts/explanations.sh (needs the sandbox image).`);
  }
  const explanations = parseExplanations(readFileSync(EXPLANATIONS, "utf8"), highlight);
  const problems = [...(content.ok ? [] : content.error), ...(explanations.ok ? [] : explanations.error)];
  if (!content.ok || !explanations.ok) {
    throw new Error(`content/ has problems:\n${problems.map((p) => `  ${p}`).join("\n")}`);
  }
  return {
    ...content.value,
    version: explanations.value.version,
    explanations: explanations.value.explanations,
    highlight: (source, marks = []) => highlight(source, marks),
  };
}

/**
 * Gives the site's content, loading it on the first call; throws when anything is wrong, which
 * fails the build.
 */
export function site(): Promise<Site> {
  loaded ??= load();
  return loaded;
}

/**
 * Gives where Learn and Examples begin: the first step and the first example, or Home when there
 * are none. Links go straight there, so a visitor never waits on a redirect page.
 */
export function entries(s: Site): { learn: string; examples: string } {
  const step = s.chapters[0]?.lessons[0]?.steps[0];
  const example = s.examples[0];
  return {
    learn: step ? `/learn/${step.id}` : "/",
    examples: example ? `/examples/${example.slug}` : "/",
  };
}
