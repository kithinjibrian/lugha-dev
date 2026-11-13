// Keeps comments free of history and document pointers across the repository: a comment says why
// the code is right now, and names no PRP, decision id, milestone, version tag, person or file.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = resolve(__dirname, "../../..");

const SOURCE = /\.(ts|mjs|js|svelte|astro|css|la|sh|ya?ml|env)$|(^|\/)(Dockerfile|Caddyfile|cleanup|content|hostile|docker-compose\.yml)$/;
const SKIP = /(^|\/)(node_modules|dist|generated|fixtures|grammar)\/|comments\.test\.ts$/;

const BANNED: [RegExp, string][] = [
  [/\bPRP-?\d+/, "a PRP"],
  [/\b(API|WEB)-\d+\b/, "a decision id"],
  [/\bO\d{1,2}\b/, "an open decision's id"],
  [/\bDECISIONS\b/, "the decision log"],
  [/[\w./-]+\.md\b/, "a document"],
  [/\bowner\b/i, "a person"],
  [/\bmilestones?\b/i, "a milestone"],
  [/\bm\d{3}\b/, "a lughac version tag"],
];

/** The comment text on one line, or null for a line without a comment. */
function commentOf(line: string, file: string): string | null {
  const t = line.trim();
  if (/^(\/\/|\/\*|\*|<!--)/.test(t)) return t;
  if (/^#/.test(t) && !/\.(ts|mjs|js|svelte|astro|css|la)$/.test(file)) return t;
  const trailing = /\s\/\/\s(.*)$/.exec(line);
  if (trailing && /\.(ts|mjs|js|svelte|astro|la)$/.test(file) && !/https?:\/\/\S*$/.test(line)) return trailing[1];
  const hash = /\s#\s(.*)$/.exec(line);
  if (hash && !/\.(ts|mjs|js|svelte|astro|css|la)$/.test(file)) return hash[1];
  return null;
}

const files = execFileSync("git", ["ls-files"], { cwd: ROOT, encoding: "utf8" })
  .split("\n")
  .filter((f) => SOURCE.test(f) && !SKIP.test(f));

describe("comments", () => {
  it("finds the repository's source files", () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it("name no history and point at no document", () => {
    const problems: string[] = [];
    for (const file of files) {
      readFileSync(resolve(ROOT, file), "utf8")
        .split("\n")
        .forEach((line, i) => {
          const comment = commentOf(line, file);
          if (comment === null) return;
          for (const [pattern, what] of BANNED) {
            if (pattern.test(comment)) problems.push(`${file}:${i + 1} names ${what}: ${comment}`);
          }
        });
    }
    expect(problems).toEqual([]);
  });
});
