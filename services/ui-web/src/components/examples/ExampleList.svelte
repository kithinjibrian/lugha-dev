<script lang="ts">
  // Every example by group, with a filter on titles and tags.
  import { copy } from "../../lib/copy";

  interface Props {
    groups: { name: string; items: { slug: string; title: string; tags: string[] }[] }[];
    current: string;
  }
  let { groups, current }: Props = $props();
  let filter = $state("");
  const q = $derived(filter.trim().toLowerCase());
  const shown = $derived(
    groups
      .map((g) => ({ ...g, items: g.items.filter((i) => q === "" || [i.title, ...i.tags].some((t) => t.toLowerCase().includes(q))) }))
      .filter((g) => g.items.length > 0),
  );
</script>

<label class="filter">
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20 L16 16" /></svg>
  <input type="search" bind:value={filter} placeholder={copy.filterExamples} aria-label={copy.filterExamples} />
</label>
<div class="list">
  {#each shown as g (g.name)}
    <div class="group">
      <h2>{g.name}</h2>
      {#each g.items as it (it.slug)}
        <a href="/examples/{it.slug}" aria-current={it.slug === current ? "page" : undefined}>{it.title}</a>
      {/each}
    </div>
  {/each}
</div>

<style>
  .filter {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: var(--target);
    padding: 0 14px;
    border-radius: 12px;
    background: var(--raised);
    border: 1px solid var(--line-strong);
    color: var(--dust);
  }
  input {
    flex: 1;
    min-width: 0;
    background: transparent;
    border: 0;
    color: var(--sand);
    font: 15px var(--font-ui);
    outline: none;
  }
  input::placeholder {
    color: var(--dust);
  }
  .list {
    display: flex;
    flex-direction: column;
    gap: 22px;
  }
  .group {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  h2 {
    margin: 0;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--dust);
    padding: 0 10px 6px;
  }
  a {
    font: 16px var(--font-ui);
    color: var(--sand-2);
    text-decoration: none;
    border-radius: 10px;
    padding: 8px 10px;
    min-height: var(--target);
    box-sizing: border-box;
    display: flex;
    align-items: center;
  }
  a:hover {
    color: var(--sand);
  }
  a[aria-current="page"] {
    font-weight: 800;
    color: var(--link);
    background: var(--raised);
  }
  /* On a phone the examples are one row of chips that scrolls sideways, so the example itself
     starts near the top instead of below the whole list. */
  @media (max-width: 720px) {
    .filter,
    h2 {
      display: none;
    }
    .list {
      flex-direction: row;
      gap: 8px;
      overflow-x: auto;
      margin: 0 calc(-1 * var(--gutter));
      padding: 0 var(--gutter) 4px;
    }
    .group {
      display: contents;
    }
    a {
      white-space: nowrap;
      border: 1px solid var(--line-strong);
      border-radius: var(--radius-pill);
      padding: 8px 14px;
    }
  }
</style>
