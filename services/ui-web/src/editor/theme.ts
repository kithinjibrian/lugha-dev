// Gives the editor its language and colours: `lugha`'s tokens, coloured with the design's code
// tokens (the CSS variables in styles/tokens.css).
import { HighlightStyle, StreamLanguage, syntaxHighlighting } from "@codemirror/language";
import { EditorView } from "@codemirror/view";
import { tags, Tag } from "@lezer/highlight";
import { lugha } from "./lugha";

const interpolation = Tag.define();
const attribute = Tag.define();

/** Maps each token name `lugha` returns to the tag it's highlighted as. */
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

/** Gives CodeMirror the Lugha tokenizer as a language. */
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
    ".cm-gutters": { backgroundColor: "var(--editor)", color: "var(--dust)", border: "none" },
    ".cm-activeLine, .cm-activeLineGutter": { backgroundColor: "transparent" },
    "&.cm-focused": { outline: "none" },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
      backgroundColor: "var(--raised)",
    },
    ".cm-error-line": { backgroundColor: "var(--code-error)" },
  },
  { dark: true },
);

/** Styles the editor, for any file. */
export const editorTheme = [syntaxHighlighting(highlight), base];

/** Adds Lugha's highlighting to the editor's look, for .la files. */
export const lughaEditor = [lughaLanguage, ...editorTheme];
