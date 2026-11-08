<script lang="ts">
  // Home's code card: fib.la, highlighted at build time, run through the API.
  import { browserDeps, call } from "../lib/api";
  import { copy } from "../lib/copy";
  import { runPanel, type Panel } from "../lib/panel";
  import { projectOf } from "../lib/project";
  import Output from "./workspace/Output.svelte";

  interface Props {
    source: string;
    html: string;
  }
  let { source, html }: Props = $props();

  let panel = $state<Panel>({ kind: "idle" });
  const busy = $derived(panel.kind === "running");

  async function run() {
    if (busy) return;
    panel = { kind: "running" };
    panel = runPanel(await call("run", projectOf(source), 0, browserDeps()));
  }
</script>

<div class="card">
  <div class="top">
    <span class="name">{copy.home.card}</span>
    <button type="button" class="pill sun" onclick={run} disabled={busy}>
      {#if busy}<span class="dot" aria-hidden="true"></span>{copy.running}{:else}<svg width="11" height="11" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 1.5 L12 7 L3 12.5 Z" fill="currentColor" /></svg>{copy.run}{/if}
    </button>
  </div>
  <div class="code">{@html html}</div>
  <div class="run">
    <div class="command">$ lughac run fib.la</div>
    <Output {panel} />
  </div>
</div>

<style>
  .card {
    flex: 1 1 520px;
    min-width: 0;
    background: var(--ground);
    border-radius: var(--radius-card);
    border: 1px solid var(--line);
    overflow: hidden;
  }
  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 14px 16px 6px 26px;
  }
  .name {
    font: 14px var(--font-code);
    color: var(--dust);
  }
  .top .pill {
    padding: 0 20px;
  }
  .dot {
    width: 12px;
    height: 12px;
    border-radius: var(--radius-pill);
    background: var(--sun-gradient);
    box-shadow: 0 0 0 2px var(--night);
  }
  .code :global(pre.shiki) {
    font-size: 17px;
    line-height: 1.85;
    padding: 6px 10px 18px;
  }
  .run {
    border-top: 1px dashed var(--line-strong);
    margin: 0 26px;
    padding: 14px 0 22px;
  }
  .command {
    font: 15px/1.7 var(--font-code);
    color: var(--code-comment);
  }
  @media (max-width: 640px) {
    .code :global(pre.shiki) {
      font-size: 15px;
    }
    .top {
      padding-left: 16px;
    }
    .run {
      margin: 0 16px;
    }
  }
</style>
