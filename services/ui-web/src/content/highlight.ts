// Highlights static code (lesson text, examples, Home) with Shiki and the Lugha grammar copied from
// lughac, coloured with the design's code tokens as CSS variables, like the editor.
import { createHighlighter, type LanguageRegistration, type ThemeRegistration } from "shiki";
import grammar from "../../grammar/lugha.tmLanguage.json" with { type: "json" };
import type { Highlight } from "./markdown";

const keyword = "var(--code-keyword)";

/** Colours the grammar's scopes with the code tokens. */
export const theme: ThemeRegistration = {
  name: "machweo",
  type: "dark",
  fg: "var(--code-text)",
  bg: "var(--ground)",
  settings: [
    { settings: { foreground: "var(--code-text)", background: "var(--ground)" } },
    {
      scope: [
        "keyword",
        "keyword.operator.as",
        "storage.modifier",
        "storage.type.c-marker",
        "variable.language.self",
        "entity.name.function.decorator",
        "punctuation.definition.decorator",
        "punctuation.section.interpolation",
      ],
      settings: { foreground: keyword },
    },
    { scope: ["keyword.operator", "punctuation.definition.map"], settings: { foreground: "var(--code-text)" } },
    { scope: ["entity.name.type", "storage.type.primitive", "support.type"], settings: { foreground: "var(--code-type)" } },
    { scope: ["constant", "string", "support.constant"], settings: { foreground: "var(--code-literal)" } },
    { scope: ["comment"], settings: { foreground: "var(--code-comment)", fontStyle: "italic" } },
  ],
};

let made: Promise<Highlight> | null = null;

/** Gives the highlighter, made once per build. */
export function highlighter(): Promise<Highlight> {
  made ??= createHighlighter({
    themes: [theme],
    langs: [{ ...(grammar as unknown as LanguageRegistration), name: "lugha" }],
  }).then((h) => (source: string, marks: number[]) =>
    h.codeToHtml(source, {
      lang: "lugha",
      theme: "machweo",
      transformers: [
        {
          line(node, line) {
            if (marks.includes(line)) this.addClassToHast(node, "changed");
          },
        },
      ],
    }),
  );
  return made;
}
