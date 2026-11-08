<script lang="ts">
  // A step's quiz: pick an option, see what it means. The right one finishes the step.
  import type { Quiz } from "../../content/markdown";

  interface Props {
    quiz: Quiz;
    onanswer: (correct: boolean) => void;
  }
  let { quiz, onanswer }: Props = $props();
  let picked = $state<number | null>(null);

  function pick(i: number) {
    picked = i;
    onanswer(i === quiz.answer);
  }
  /** Code-like options are shown as code. */
  const looksLikeCode = (s: string) => /^[[\d"'(]/.test(s);
</script>

<div class="quiz">
  <div class="options" role="group">
    {#each quiz.options as o, i (i)}
      <button
        type="button"
        class:code={looksLikeCode(o)}
        class:right={picked === i && i === quiz.answer}
        class:wrong={picked === i && i !== quiz.answer}
        aria-pressed={picked === i}
        onclick={() => pick(i)}>{o}</button
      >
    {/each}
  </div>
  <p class="feedback" class:wrong={picked !== null && picked !== quiz.answer} aria-live="polite">
    {picked === null ? "" : quiz.feedback[picked]}
  </p>
</div>

<style>
  .quiz {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .options {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  button {
    font: 600 15px var(--font-ui);
    color: var(--sand);
    background: transparent;
    border: 1.5px solid var(--line-strong);
    border-radius: var(--radius-pill);
    padding: 0 16px;
    min-height: var(--target);
  }
  button.code {
    font-family: var(--font-code);
  }
  button.right {
    background: var(--code-changed);
    border-color: var(--sun);
  }
  button.wrong {
    background: var(--code-error);
    border-color: var(--error);
  }
  .feedback {
    margin: 0;
    min-height: 1.5em;
    font-size: 17px;
    color: var(--link);
  }
  .feedback.wrong {
    color: var(--error);
  }
</style>
