// Everything the pages need from content/ and lughac, loaded once per build.
// Any problem fails the build, listing every one.
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseExplanations, type Explanation } from "./explanations";
import { highlighter } from "./highlight";
import { loadContent, type Content } from "./load";

export interface Site extends Content {
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
    explanations: explanations.value,
    highlight: (source, marks = []) => highlight(source, marks),
  };
}

export function site(): Promise<Site> {
  loaded ??= load();
  return loaded;
}
