<script lang="ts">
  // The course's horizon: walked in sun colour up to the
  // sun, which is where you are. At 100% the sun sits behind the baobab and
  // makes the logo.
  interface Props {
    /** Done steps out of all steps, 0 to 1. */
    position: number;
  }
  let { position }: Props = $props();
  const done = $derived(position >= 1);
  const pct = $derived(`${(Math.min(1, Math.max(0, position)) * 100).toFixed(1)}%`);
</script>

<div class="horizon" aria-hidden="true">
  <div class="line"></div>
  <div class="walked" style:width={pct}></div>
  <div class="sun" class:behind={done} style:left="calc({pct} - 9px)"></div>
  <svg class="tree" width="18" height="18" viewBox="0 0 128 128">
    <g transform="translate(12 24) scale(1.625)" style:--c={done ? "var(--tree)" : "var(--tree-far)"}>
      <g stroke="var(--c)" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <path d="M31 27 L24 17 L18 15" /><path d="M32 26 L33 11" /><path d="M33 11 L30 6" />
        <path d="M33 11 L37 7" /><path d="M33 27 L44 18 L50 17" /><path d="M30 31 L18 27 L12 28" />
      </g>
      <path d="M21 64 C19.5 47 24 34 30 25.5 H34 C40 34 44.5 47 43 64 Z" fill="var(--c)" />
    </g>
  </svg>
</div>

<style>
  .horizon {
    position: absolute;
    left: 0;
    right: 24px;
    bottom: -8px;
    height: 18px;
    z-index: 2;
    pointer-events: none;
  }
  .line {
    position: absolute;
    left: 0;
    right: -24px;
    top: 8px;
    height: 2px;
    background: var(--line-strong);
  }
  .walked {
    position: absolute;
    left: 0;
    top: 8px;
    height: 2px;
    background: var(--sun);
    transition: width 0.6s ease;
  }
  .sun {
    position: absolute;
    top: 0;
    width: 18px;
    height: 18px;
    border-radius: var(--radius-pill);
    background: var(--sun-gradient);
    z-index: 2;
    transition: left 0.6s ease;
  }
  .sun.behind {
    z-index: 0;
  }
  .tree {
    position: absolute;
    left: calc(100% - 9px);
    top: 0;
    z-index: 1;
  }
  @media (prefers-reduced-motion: reduce) {
    .walked,
    .sun {
      transition: none;
    }
  }
</style>
