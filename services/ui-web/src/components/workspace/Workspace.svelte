<script lang="ts">
  // The workspace (architecture rule 2): files, editor, Run and the output,
  // used by Learn and the Playground alike. The Playground adds the Tests and
  // Input tabs, and drives Run, Test and Format from its own toolbar through
  // the functions this component exports.
  import { browserDeps, call, readFormat, readTest } from "../../lib/api";
  import { copy } from "../../lib/copy";
  import { errorLines } from "../../lib/diagnostics";
  import { failureSentence, runPanel, type Panel } from "../../lib/panel";
  import type { Project } from "../../lib/project";
  import { testText } from "../../lib/testtext";
  import Editor from "./Editor.svelte";
  import Files from "./Files.svelte";
  import Output from "./Output.svelte";

  interface Props {
    mode: "learn" | "playground";
    project: Project;
    onchange: (p: Project) => void;
    /** After every Run that came back with a program result or compile errors. */
    onran?: (r: { compiled: boolean; exit: number }) => void;
    /** A step's own words for one error code. */
    note?: { code: string; html: string } | null;
    opt?: 0 | 2;
    onopen?: () => void;
    busy?: boolean;
  }
  let { mode, project, onchange, onran, note = null, opt = 0, onopen, busy = $bindable(false) }: Props = $props();

  let current = $state("src/main.la");
  let panel = $state<Panel>({ kind: "idle" });
  let tests = $state<Panel>({ kind: "idle" });
  let tab = $state<"output" | "tests" | "input">("output");

  const file = $derived(project.files.find((f) => f.path === current) ?? project.files[0]);
  const marks = $derived(panel.kind === "compile-error" ? errorLines(panel.diagnostics, file.path) : []);

  function edit(text: string) {
    if (text === file.text) return;
    onchange({ ...project, files: project.files.map((f) => (f.path === file.path ? { ...f, text } : f)) });
  }

  export async function run() {
    if (busy) return;
    busy = true;
    tab = "output";
    panel = { kind: "running" };
    const r = await call("run", project, opt, browserDeps());
    panel = runPanel(r);
    busy = false;
    if (panel.kind === "ran") onran?.({ compiled: true, exit: panel.exit });
    if (panel.kind === "compile-error") onran?.({ compiled: false, exit: 1 });
  }

  export async function test() {
    if (busy) return;
    busy = true;
    tab = "tests";
    tests = { kind: "running" };
    const r = await call("test", project, opt, browserDeps());
    if (!r.ok) tests = { kind: "message", sentence: failureSentence(r.error) };
    else {
      const o = readTest(r.value);
      if (o === null) tests = { kind: "message", sentence: copy.service };
      else if (o.state === "test-compile-error") tests = { kind: "text", text: o.text };
      else tests = { kind: "text", text: testText(o) };
    }
    busy = false;
  }

  export async function format() {
    if (busy) return;
    busy = true;
    const r = await call("format", project, opt, browserDeps());
    busy = false;
    tab = "output";
    if (!r.ok) {
      panel = { kind: "message", sentence: failureSentence(r.error) };
      return;
    }
    const o = readFormat(r.value);
    if (o === null) panel = { kind: "message", sentence: copy.service };
    else if (o.state === "format-error") panel = { kind: "text", text: o.text };
    else if (o.files.length > 0) {
      const changed = new Map(o.files.map((f) => [f.path, f.text]));
      onchange({ ...project, files: project.files.map((f) => ({ ...f, text: changed.get(f.path) ?? f.text })) });
    }
  }

  /** Back to "Press Run." (a new step, Reset, Solve). */
  export function clear() {
    panel = { kind: "idle" };
    tests = { kind: "idle" };
    current = "src/main.la";
  }

  const tabs = [
    { id: "output", label: copy.output },
    { id: "tests", label: copy.tests },
    { id: "input", label: copy.input },
  ] as const;
</script>

<div class="workspace {mode}">
  <div class="code">
    <Files files={project.files} {current} heading={mode === "playground"} onpick={(p) => (current = p)} />
    <Editor text={file.text} path={file.path} errorLines={marks} label={file.path} onchange={edit} onrun={run} />
  </div>

  <section class="out" aria-label={copy.output}>
    {#if mode === "learn"}
      <div class="bar">
        <button type="button" class="pill sun" onclick={run} disabled={busy}>
          {#if busy}<span class="sun-dot" aria-hidden="true"></span>{copy.running}{:else}<svg width="11" height="11" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 1.5 L12 7 L3 12.5 Z" fill="currentColor" /></svg>{copy.run}{/if}
        </button>
        <div class="command">$ lughac run src/main.la</div>
        {#if onopen}<button type="button" class="quiet" onclick={onopen}>{copy.openInPlayground}</button>{/if}
      </div>
    {:else}
      <div class="tabs" role="tablist">
        {#each tabs as t (t.id)}
          <button type="button" role="tab" id="tab-{t.id}" aria-controls="panel-{t.id}" aria-selected={tab === t.id} onclick={() => (tab = t.id)}>{t.label}</button>
        {/each}
      </div>
    {/if}

    <div class="body" role={mode === "playground" ? "tabpanel" : undefined} id="panel-{tab}" aria-labelledby={mode === "playground" ? `tab-${tab}` : undefined}>
      {#if tab === "output"}
        {#if mode === "playground"}<div class="command">$ lughac run{opt === 2 ? " -O 2" : ""} src/main.la</div>{/if}
        <Output {panel} {note} />
      {:else if tab === "tests"}
        <div class="command">$ lughac test</div>
        <Output panel={tests} />
      {:else}
        <label class="field">
          <span class="name">{copy.arguments}</span>
          <span class="help">{copy.argumentsHelp[0]}<code>{copy.argumentsHelp[1]}</code>{copy.argumentsHelp[2]}<code>{copy.argumentsHelp[3]}</code>{copy.argumentsHelp[4]}</span>
          <input type="text" value={project.args.join(" ")} oninput={(e) => onchange({ ...project, args: e.currentTarget.value.split(/\s+/).filter((a) => a !== "") })} />
        </label>
        <label class="field">
          <span class="name">{copy.stdin}</span>
          <span class="help">{copy.stdinHelp[0]}<code>{copy.stdinHelp[1]}</code>{copy.stdinHelp[2]}</span>
          <textarea rows="6" value={project.stdin} oninput={(e) => onchange({ ...project, stdin: e.currentTarget.value })}></textarea>
        </label>
      {/if}
    </div>
  </section>
</div>

<style>
  .workspace {
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
  }
  .workspace.learn {
    flex-direction: column;
  }
  .workspace.playground {
    flex-wrap: wrap;
  }
  .code {
    display: flex;
    min-height: 0;
    min-width: 0;
  }
  .learn .code {
    flex: 3 1 0;
  }
  .playground .code {
    flex: 999 1 560px;
    height: 100%;
  }
  .out {
    display: flex;
    flex-direction: column;
    min-height: 0;
    min-width: 0;
    background: var(--ground);
  }
  .learn .out {
    flex: 2 1 0;
    border-top: 1px solid var(--line);
  }
  .playground .out {
    flex: 1 1 400px;
    height: 100%;
    border-left: 1px solid var(--line);
  }
  .bar {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--line);
  }
  .bar .pill {
    padding: 0 18px;
  }
  .bar .command {
    flex: 1;
    min-width: 0;
    height: 40px;
    border-radius: 8px;
    background: var(--editor);
    display: flex;
    align-items: center;
    padding: 0 12px;
    overflow: hidden;
    white-space: nowrap;
    margin: 0;
  }
  .command {
    font: 14px var(--font-code);
    color: var(--dust);
    margin-bottom: 10px;
  }
  .sun-dot {
    width: 12px;
    height: 12px;
    border-radius: var(--radius-pill);
    background: var(--sun-gradient);
    box-shadow: 0 0 0 2px var(--night);
  }
  .tabs {
    flex-shrink: 0;
    display: flex;
    gap: 4px;
    padding: 0 12px;
    border-bottom: 1px solid var(--line);
  }
  .tabs button {
    font: 600 15px var(--font-ui);
    background: transparent;
    color: var(--dust);
    border: 0;
    border-bottom: 2px solid transparent;
    padding: 0 12px;
    min-height: 48px;
  }
  .tabs button[aria-selected="true"] {
    color: var(--sand);
    border-bottom-color: var(--sun);
  }
  .body {
    flex: 1;
    overflow: auto;
    padding: 16px 20px;
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 18px;
  }
  .field .name {
    font-size: 15px;
    font-weight: 600;
  }
  .field .help {
    font-size: 13px;
    color: var(--dust);
  }
  .field input,
  .field textarea {
    box-sizing: border-box;
    min-height: var(--target);
    background: var(--editor);
    border: 1px solid var(--line-strong);
    border-radius: 8px;
    padding: 10px 12px;
    color: var(--sand);
    font: 15px/1.6 var(--font-code);
    resize: vertical;
  }
  @media (max-width: 720px) {
    .learn .code {
      min-height: 320px;
    }
  }
</style>
