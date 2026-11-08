<script lang="ts">
  // The project's files: src/ and its .la files, then lugha.toml.
  import { copy } from "../../lib/copy";
  import type { File } from "../../lib/project";

  interface Props {
    files: File[];
    current: string;
    heading: boolean;
    onpick: (path: string) => void;
  }
  let { files, current, heading, onpick }: Props = $props();

  const sources = $derived(files.filter((f) => f.path.startsWith("src/")));
  const others = $derived(files.filter((f) => !f.path.startsWith("src/")));
</script>

<nav class="files" aria-label={copy.files}>
  {#if heading}<div class="heading">{copy.files}</div>{/if}
  <div class="folder">
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="var(--faint)" d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    </svg>
    src
  </div>
  {#each sources as f (f.path)}
    <button type="button" class="file nested" aria-current={f.path === current ? "true" : undefined} onclick={() => onpick(f.path)}>
      {f.path.slice(4)}
    </button>
  {/each}
  {#each others as f (f.path)}
    <button type="button" class="file" aria-current={f.path === current ? "true" : undefined} onclick={() => onpick(f.path)}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--faint)" stroke-width="2" stroke-linejoin="round" aria-hidden="true">
        <path d="M6 3h8l5 5v13H6Z" /><path d="M14 3v5h5" />
      </svg>
      {f.path}
    </button>
  {/each}
</nav>

<style>
  .files {
    width: 180px;
    flex-shrink: 0;
    border-right: 1px solid var(--line);
    padding: 14px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 15px;
    box-sizing: border-box;
  }
  .heading {
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--dust);
    padding: 0 2px 8px;
  }
  .folder {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--dust);
    min-height: 32px;
  }
  .file {
    font: 15px var(--font-ui);
    text-align: left;
    background: transparent;
    color: var(--sand-2);
    border: 0;
    border-radius: 6px;
    padding: 6px 8px;
    min-height: var(--target);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .file.nested {
    padding-left: 22px;
  }
  .file[aria-current="true"] {
    background: var(--raised);
    color: var(--link);
  }
  @media (max-width: 720px) {
    .files {
      width: 120px;
    }
  }
</style>
