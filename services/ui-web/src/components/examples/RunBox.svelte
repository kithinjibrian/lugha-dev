<script lang="ts">
  import { untrack } from "svelte";
  // Run an example as written (with its stdin, which the visitor may change),
  // copy it, or open it in the Playground.
  import { browserDeps, call } from "../../lib/api";
  import { copy } from "../../lib/copy";
  import { kept } from "../../lib/kept";
  import { runPanel, type Panel } from "../../lib/panel";
  import { projectOf } from "../../lib/project";
  import { browserStore } from "../../lib/storage";
  import Output from "../workspace/Output.svelte";

  interface Props {
    source: string;
    stdin: string;
    playgroundOpening: string;
  }
  let { source, stdin: given, playgroundOpening }: Props = $props();
  let stdin = $state(untrack(() => given));
  let panel = $state<Panel>({ kind: "idle" });
  let copied = $state(false);
  const busy = $derived(panel.kind === "running");

  async function run() {
    if (busy) return;
    panel = { kind: "running" };
    panel = runPanel(await call("run", projectOf(source, stdin), 0, browserDeps()));
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(source);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch {
      // No clipboard (an insecure page, or refused): nothing to say.
    }
  }

  function open() {
    const k = kept(browserStore());
    const opening = projectOf(playgroundOpening);
    if (k.playgroundUnsaved(opening) && !confirm(copy.openInPlaygroundAsk)) return;
    k.setPlayground(projectOf(source, stdin));
    location.href = "/playground";
  }
</script>

<section class="box" aria-label={copy.run}>
  <div class="bar">
    <button type="button" class="pill sun" onclick={run} disabled={busy}>
      {#if busy}<span class="dot" aria-hidden="true"></span>{copy.running}{:else}<svg width="11" height="11" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 1.5 L12 7 L3 12.5 Z" fill="currentColor" /></svg>{copy.run}{/if}
    </button>
    <div class="command">$ lughac run src/main.la</div>
    <button type="button" class="quiet" onclick={copyCode}>{copied ? copy.copied : copy.copyCode}</button>
    <button type="button" class="quiet" onclick={open}>{copy.openInPlayground}</button>
  </div>
  <div class="panes">
    {#if given !== ""}
      <label class="pane stdin">
        <span class="label">{copy.stdin}</span>
        <textarea rows="4" bind:value={stdin}></textarea>
      </label>
    {/if}
    <div class="pane">
      <span class="label">{copy.output}</span>
      <Output {panel} />
    </div>
  </div>
</section>

<style>
  .box {
    background: var(--ground);
    border: 1px solid var(--line);
    border-radius: 20px;
    overflow: hidden;
  }
  .bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border-bottom: 1px solid var(--line);
  }
  .command {
    flex: 1 1 220px;
    min-height: var(--target);
    box-sizing: border-box;
    border-radius: 10px;
    background: var(--editor);
    display: flex;
    align-items: center;
    padding: 0 14px;
    font: 14px var(--font-code);
    color: var(--dust);
    overflow: hidden;
    white-space: nowrap;
  }
  .dot {
    width: 12px;
    height: 12px;
    border-radius: var(--radius-pill);
    background: var(--sun-gradient);
    box-shadow: 0 0 0 2px var(--night);
  }
  .panes {
    display: flex;
    flex-wrap: wrap;
  }
  .pane {
    flex: 1 1 300px;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px 20px 20px;
  }
  .stdin {
    border-right: 1px solid var(--line);
  }
  .label {
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--dust);
  }
  textarea {
    box-sizing: border-box;
    background: var(--editor);
    border: 1px solid var(--line-strong);
    border-radius: 10px;
    padding: 10px 12px;
    color: var(--sand);
    font: 15px/1.6 var(--font-code);
    resize: vertical;
  }
</style>
