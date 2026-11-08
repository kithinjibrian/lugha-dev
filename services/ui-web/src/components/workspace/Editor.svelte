<script lang="ts">
  // One file in CodeMirror 6: Lugha highlighting for .la files, line numbers,
  // undo, Ctrl/Cmd+Enter to run, and the lines the last run's errors are on.
  import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
  import { indentUnit } from "@codemirror/language";
  import { EditorState, StateEffect, StateField, type Extension } from "@codemirror/state";
  import { Decoration, EditorView, keymap, lineNumbers, type DecorationSet } from "@codemirror/view";
  import { onMount } from "svelte";
  import { editorTheme, lughaEditor } from "../../editor/theme";

  interface Props {
    /** The file's text; replaced from outside (Reset, Solve, Format) when it changes. */
    text: string;
    path: string;
    errorLines?: number[];
    label: string;
    onchange: (text: string) => void;
    onrun?: () => void;
  }
  let { text, path, errorLines = [], label, onchange, onrun }: Props = $props();

  let host: HTMLDivElement;
  let view: EditorView | null = null;

  const setErrors = StateEffect.define<number[]>();
  const errors = StateField.define<DecorationSet>({
    create: () => Decoration.none,
    update(marks, tr) {
      marks = marks.map(tr.changes);
      for (const e of tr.effects) {
        if (e.is(setErrors)) {
          const doc = tr.state.doc;
          const line = Decoration.line({ class: "cm-error-line" });
          marks = Decoration.set(
            e.value.filter((n) => n >= 1 && n <= doc.lines).map((n) => line.range(doc.line(n).from)),
          );
        }
      }
      if (tr.docChanged) marks = Decoration.none;
      return marks;
    },
    provide: (f) => EditorView.decorations.from(f),
  });

  function extensions(): Extension[] {
    return [
      lineNumbers(),
      history(),
      indentUnit.of("    "),
      EditorState.tabSize.of(4),
      keymap.of([
        { key: "Mod-Enter", run: () => (onrun?.(), true) },
        indentWithTab,
        ...defaultKeymap,
        ...historyKeymap,
      ]),
      path.endsWith(".la") ? lughaEditor : editorTheme,
      errors,
      EditorView.contentAttributes.of({ "aria-label": label }),
      EditorView.updateListener.of((u) => {
        if (u.docChanged) onchange(u.state.doc.toString());
      }),
    ];
  }

  onMount(() => {
    view = new EditorView({ parent: host, state: EditorState.create({ doc: text, extensions: extensions() }) });
    return () => view?.destroy();
  });

  // A new file, or text changed from outside: start the editor over with it.
  let shownPath = path;
  $effect(() => {
    const t = text;
    const p = path;
    if (!view) return;
    if (p !== shownPath) {
      shownPath = p;
      view.setState(EditorState.create({ doc: t, extensions: extensions() }));
    } else if (view.state.doc.toString() !== t) {
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: t } });
    }
  });

  $effect(() => {
    const lines = errorLines;
    view?.dispatch({ effects: setErrors.of(lines) });
  });
</script>

<div class="editor" bind:this={host}></div>

<style>
  .editor {
    flex: 1;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    background: var(--editor);
  }
  .editor :global(.cm-editor) {
    height: 100%;
  }
  .editor :global(.cm-scroller) {
    padding: 10px 0;
  }
  .editor :global(.cm-lineNumbers .cm-gutterElement) {
    min-width: 40px;
    padding-right: 18px;
  }
</style>
