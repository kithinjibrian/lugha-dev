// The editor's language and colours: lugha.ts's tokens, coloured with
// docs/DESIGN.md's code tokens (the CSS variables in styles/tokens.css).
import { HighlightStyle, StreamLanguage, syntaxHighlighting } from "@codemirror/language";
import { EditorView } from "@codemirror/view";
import { tags, Tag } from "@lezer/highlight";
import { lugha } from "./lugha";

const interpolation = Tag.define();
const attribute = Tag.define();

/** Each token name lugha.ts returns, and the tag it's highlighted as. */
export const TOKEN_TAGS: Record<string, Tag> = {
  keyword: tags.keyword,
  type: tags.typeName,
  number: tags.number,
  bool: tags.bool,
  constant: tags.atom,
  string: tags.string,
  escape: tags.escape,
  interpolation,
  comment: tags.comment,
  attribute,
};

export const lughaLanguage = StreamLanguage.define({ ...lugha, tokenTable: TOKEN_TAGS });

const highlight = HighlightStyle.define([
  { tag: [tags.keyword, attribute, interpolation], color: "var(--code-keyword)" },
  { tag: tags.typeName, color: "var(--code-type)" },
  { tag: [tags.number, tags.bool, tags.atom, tags.string, tags.escape], color: "var(--code-literal)" },
  { tag: tags.comment, color: "var(--code-comment)", fontStyle: "italic" },
]);

const base = EditorView.theme(
  {
    "&": {
      color: "var(--code-text)",
      backgroundColor: "var(--editor)",
      fontSize: "var(--code-size)",
      height: "100%",
    },
    ".cm-scroller": { fontFamily: "var(--font-code)", lineHeight: "1.6" },
    ".cm-content": { caretColor: "var(--sun)" },
    ".cm-cursor": { borderLeftColor: "var(--sun)" },
    ".cm-gutters": { backgroundColor: "var(--editor)", color: "var(--faint)", border: "none" },
    ".cm-activeLine, .cm-activeLineGutter": { backgroundColor: "transparent" },
    "&.cm-focused": { outline: "none" },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
      backgroundColor: "var(--raised)",
    },
    ".cm-error-line": { backgroundColor: "var(--code-error)" },
  },
  { dark: true },
);

export const lughaEditor = [lughaLanguage, syntaxHighlighting(highlight), base];
