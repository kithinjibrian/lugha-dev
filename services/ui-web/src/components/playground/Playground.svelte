<script lang="ts">
  // The Playground: any code, one project kept in this browser (WEB-4).
  // A #v1.… link opens a shared project (WEB-5), replacing the kept one only
  // after asking when there's work to lose.
  import { onMount, untrack } from "svelte";
  import { copy } from "../../lib/copy";
  import { kept as makeKept } from "../../lib/kept";
  import { projectOf, type Project } from "../../lib/project";
  import { decodeShare, encodeShare } from "../../lib/share";
  import { browserStore } from "../../lib/storage";
  import { makeZip } from "../../lib/zip";
  import Workspace from "../workspace/Workspace.svelte";

  interface Props {
    opening: string;
  }
  let { opening }: Props = $props();
  const first = untrack(() => projectOf(opening));

  let kept: ReturnType<typeof makeKept> | null = null;
  let project = $state<Project>(first);
  let opt = $state<0 | 2>(0);
  let busy = $state(false);
  let notice = $state("");
  let workspace: Workspace;

  onMount(async () => {
    kept = makeKept(browserStore());
    project = kept.playground(first);
    if (location.hash.startsWith("#v1.") || location.hash.startsWith("#v")) {
      const shared = await decodeShare(location.hash);
      history.replaceState(null, "", location.pathname);
      if (shared.ok && (!kept.playgroundUnsaved(first) || confirm(copy.openInPlaygroundAsk))) {
        project = shared.value;
        kept.setPlayground(project);
        say(copy.openedFromLink);
      }
    }
  });

  function change(p: Project) {
    project = p;
    kept?.setPlayground(p);
  }

  let timer: ReturnType<typeof setTimeout> | undefined;
  function say(text: string) {
    notice = text;
    clearTimeout(timer);
    timer = setTimeout(() => (notice = ""), 4000);
  }

  async function share() {
    const link = await encodeShare(project);
    if (!link.ok) {
      say(copy.tooBigToShare);
      return;
    }
    const url = `${location.origin}/playground#${link.value}`;
    try {
      await navigator.clipboard.writeText(url);
      say(copy.linkCopied);
    } catch {
      history.replaceState(null, "", `#${link.value}`);
    }
  }

  function download() {
    const blob = new Blob([makeZip(project.files, "playground")], { type: "application/zip" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "playground.zip";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function fresh() {
    if (!confirm(copy.newProjectAsk)) return;
    change(first);
    workspace.clear();
  }
</script>

<h1 class="sr-only">{copy.nav.playground}</h1>
<div class="toolbar">
  <button type="button" class="quiet" onclick={fresh}>{copy.newProject}</button>
  <div class="grow"></div>
  <div class="opt" role="group">
    <button type="button" aria-pressed={opt === 0} onclick={() => (opt = 0)}>-O 0</button>
    <button type="button" aria-pressed={opt === 2} onclick={() => (opt = 2)}>-O 2</button>
  </div>
  <button type="button" class="quiet" onclick={() => workspace.format()} disabled={busy}>{copy.format}</button>
  <button type="button" class="quiet" onclick={() => workspace.test()} disabled={busy}>{copy.test}</button>
  <button type="button" class="quiet" onclick={share}>{copy.share}</button>
  <button type="button" class="quiet square" aria-label={copy.download} onclick={download}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>
  </button>
  <button type="button" class="pill sun" onclick={() => workspace.run()} disabled={busy}>
    {#if busy}<span class="dot" aria-hidden="true"></span>{copy.running}{:else}<svg width="11" height="11" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 1.5 L12 7 L3 12.5 Z" fill="currentColor" /></svg>{copy.run}{/if}
  </button>
</div>

<div class="area">
  <Workspace bind:this={workspace} bind:busy mode="playground" {project} {opt} onchange={change} />
  <div class="notice" role="status">{#if notice}<span class="sun-dot" aria-hidden="true"></span>{notice}{/if}</div>
</div>

<style>
  .toolbar {
    flex-shrink: 0;
    min-height: 56px;
    padding: 6px 16px;
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 10px;
    background: var(--bar);
    border-bottom: 1px solid var(--line);
  }
  .grow {
    flex: 1;
  }
  .opt {
    display: flex;
    background: var(--raised);
    border: 1px solid var(--line-strong);
    border-radius: 8px;
    padding: 3px;
  }
  .opt button {
    font: 700 13px var(--font-code);
    background: transparent;
    color: var(--dust);
    border: 0;
    border-radius: 6px;
    padding: 0 10px;
    min-height: 36px;
    min-width: var(--target);
  }
  .opt button[aria-pressed="true"] {
    background: var(--line-strong);
    color: var(--sand);
  }
  .square {
    width: var(--target);
    padding: 0;
  }
  .pill {
    padding: 0 20px;
  }
  .dot,
  .sun-dot {
    width: 12px;
    height: 12px;
    flex-shrink: 0;
    border-radius: var(--radius-pill);
    background: var(--sun-gradient);
  }
  .area {
    flex: 1;
    min-height: 0;
    display: flex;
    position: relative;
  }
  .notice {
    position: absolute;
    right: 16px;
    bottom: 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
  }
  .notice:not(:empty) {
    background: var(--raised);
    border: 1px solid var(--line-strong);
    border-radius: 10px;
    padding: 10px 14px;
  }
</style>
