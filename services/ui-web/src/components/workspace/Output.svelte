<script lang="ts">
  // The output panel (PRP-002, WEB-7): a program's output and exit code, or
  // lughac's errors with their explanations, or one sentence. Announced
  // politely to screen readers.
  import type { Explanation } from "../../content/explanations";
  import { copy } from "../../lib/copy";
  import { text } from "../../lib/diagnostics";
  import { explanations } from "../../lib/explain";
  import type { Panel } from "../../lib/panel";

  interface Props {
    panel: Panel;
    /** A step's own words for one error code, shown before lughac's explanation. */
    note?: { code: string; html: string } | null;
  }
  let { panel, note = null }: Props = $props();

  let explained: Record<string, Explanation> = $state({});
  let open: Record<string, boolean> = $state({});

  /** The error codes to explain, once each, in order. */
  const codes = $derived(
    panel.kind === "compile-error"
      ? [...new Set(panel.diagnostics.filter((d) => d.severity === "error").map((d) => d.code))]
      : [],
  );

  $effect(() => {
    if (codes.length > 0) explanations().then((e) => (explained = e));
    open = {};
  });
</script>

<div class="output" aria-live="polite">
  {#if panel.kind === "idle"}
    <p class="hint">{copy.pressRun}</p>
  {:else if panel.kind === "running"}
    <p class="hint">{copy.running}</p>
  {:else if panel.kind === "message"}
    <p class="sentence">{panel.sentence}</p>
  {:else if panel.kind === "compile-error"}
    <div class="errors">
      <div class="diagnostics">
        {#each panel.diagnostics as d, i (i)}
          <pre class:warning={d.severity === "warning"}>{text(d)}</pre>
        {/each}
      </div>
      {#each codes as code (code)}
        {@const e = explained[code]}
        <aside class="explain">
          {#if note && note.code === code}
            <div class="prose">{@html note.html}</div>
          {/if}
          {#if e}
            <div class="prose">{@html e.first}</div>
            {#if e.rest}
              <button type="button" class="more" aria-expanded={open[code] ?? false} onclick={() => (open[code] = !open[code])}>
                {copy.moreAbout(code)}
              </button>
              {#if open[code]}
                <div class="prose rest">{@html e.rest}</div>
              {/if}
            {/if}
          {/if}
        </aside>
      {/each}
    </div>
  {:else}
    {#each panel.warnings as w, i (i)}
      <pre class="warning">{text(w)}</pre>
    {/each}
    {#if panel.stdout}<pre class="stdout">{panel.stdout}</pre>{/if}
    {#if panel.stderr}<pre class="stderr">{panel.stderr}</pre>{/if}
    {#each panel.notes as n (n)}
      <p class="sentence">{n}</p>
    {/each}
    <p class="exit">{copy.exited(panel.exit)}</p>
  {/if}
</div>

<style>
  .output {
    font: 15px/1.65 var(--font-code);
    color: var(--sand);
  }
  pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    font: inherit;
  }
  .hint {
    margin: 0;
    color: var(--faint);
  }
  .sentence {
    margin: 12px 0 0;
    font: 15px/1.55 var(--font-ui);
    color: var(--link);
  }
  .sentence:first-child {
    margin-top: 0;
  }
  .stdout {
    color: var(--gold);
  }
  .stderr {
    color: var(--error);
  }
  .warning {
    color: var(--sand-2);
    margin-bottom: 10px;
  }
  .exit {
    margin: 14px 0 0;
    font: 14px var(--font-ui);
    color: var(--dust);
  }
  .errors {
    display: flex;
    flex-wrap: wrap;
    gap: 20px 28px;
  }
  .diagnostics {
    flex: 1 1 360px;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .diagnostics pre:not(.warning)::first-line {
    color: var(--error);
    font-weight: 700;
  }
  .explain {
    flex: 1 1 260px;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    border-left: 2px solid var(--sun);
    padding-left: 16px;
    font: 15px/1.55 var(--font-ui);
    color: var(--sand-2);
  }
  .explain :global(p) {
    margin: 0;
  }
  .explain :global(pre.shiki) {
    border-radius: 8px;
    margin: 8px 0;
  }
  .more {
    align-self: flex-start;
    min-height: var(--target);
    padding: 0;
    border: 0;
    background: transparent;
    font: 600 15px var(--font-ui);
    color: var(--link);
    text-decoration: underline;
  }
  .rest {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
</style>
