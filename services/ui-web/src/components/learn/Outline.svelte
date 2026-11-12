<script lang="ts">
  // The course outline: every lesson with its step dots, and Start over.
  import { copy } from "../../lib/copy";
  import type { Progress } from "../../lib/progress";
  import { stepUrl, type CourseChapter } from "./course";

  interface Props {
    course: CourseChapter[];
    progress: Progress;
    current: string;
    onstartover: () => void;
  }
  let { course, progress, current, onstartover }: Props = $props();
  let dialog: HTMLDialogElement;

  export function show() {
    dialog.showModal();
  }
  function startOver() {
    if (confirm(copy.startOverAsk)) {
      onstartover();
      dialog.close();
    }
  }
</script>

<dialog bind:this={dialog} aria-label={copy.outline} onclick={(e) => e.target === dialog && dialog.close()}>
  <div class="inner">
    {#each course as chapter, ci (ci)}
      <section>
        <h2>{chapter.title}</h2>
        {#each chapter.lessons as lesson, li (li)}
          <div class="lesson">
            <a href={stepUrl(lesson.steps[0]?.id ?? "")}>{lesson.title}</a>
            <ol class="dots">
              {#each lesson.steps as s (s.id)}
                <li>
                  <a href={stepUrl(s.id)} aria-label={s.title} aria-current={s.id === current ? "step" : undefined} class:done={progress.done.includes(s.id)}><span></span></a>
                </li>
              {/each}
            </ol>
          </div>
        {/each}
      </section>
    {/each}
    <div class="end">
      <button type="button" class="quiet" onclick={startOver}>{copy.startOver}</button>
    </div>
  </div>
</dialog>

<style>
  dialog {
    background: var(--bar);
    color: var(--sand);
    border: 1px solid var(--line-strong);
    border-radius: 16px;
    padding: 0;
    width: min(480px, calc(100vw - 32px));
  }
  dialog::backdrop {
    background: rgb(0 0 0 / 0.55);
  }
  .inner {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  h2 {
    margin: 0 0 8px;
    font-size: 13px;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--dust);
  }
  .lesson {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .lesson > a {
    font-size: 17px;
    font-weight: 600;
    color: var(--sand);
    text-decoration: none;
    min-height: var(--target);
    display: flex;
    align-items: center;
  }
  .dots {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .dots a {
    width: 28px;
    height: var(--target);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .dots span {
    width: 10px;
    height: 10px;
    border-radius: var(--radius-pill);
    border: 1.5px solid var(--faint);
    box-sizing: border-box;
  }
  .dots a.done span {
    background: var(--sun);
    border-color: var(--sun);
  }
  .dots a[aria-current="step"] span {
    width: 14px;
    height: 14px;
    border-color: var(--sun);
  }
  .end {
    display: flex;
    justify-content: space-between;
    border-top: 1px solid var(--line);
    padding-top: 16px;
  }
</style>
