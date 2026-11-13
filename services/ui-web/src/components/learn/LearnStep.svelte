<script lang="ts">
  // One Learn step: the steps bar with the horizon, the lesson text on the
  // left, the workspace on the right. Edits and progress stay in this browser:
  // nothing about a learner is sent anywhere.
  import { onMount, untrack } from "svelte";
  import { copy } from "../../lib/copy";
  import { kept as makeKept } from "../../lib/kept";
  import { doneBy, markDone, sunPosition, type Event, type Progress } from "../../lib/progress";
  import { projectOf, type Project } from "../../lib/project";
  import { browserStore } from "../../lib/storage";
  import Workspace from "../workspace/Workspace.svelte";
  import Horizon from "./Horizon.svelte";
  import Outline from "./Outline.svelte";
  import Quiz from "./Quiz.svelte";
  import { stepUrl, type CourseChapter, type StepData } from "./course";

  interface Props {
    course: CourseChapter[];
    step: StepData;
    chapterTitle: string;
    lessonTitle: string;
    playgroundOpening: string;
  }
  let { course, step, chapterTitle, lessonTitle, playgroundOpening }: Props = $props();

  const all = $derived(course.flatMap((c) => c.lessons.flatMap((l) => l.steps)));
  const index = $derived(all.findIndex((s) => s.id === step.id));
  const prev = $derived(index > 0 ? all[index - 1] : null);
  const next = $derived(index < all.length - 1 ? all[index + 1] : null);
  const lessonSteps = $derived(course.flatMap((c) => c.lessons).find((l) => l.steps.some((s) => s.id === step.id))?.steps ?? []);
  const inLesson = $derived(lessonSteps.findIndex((s) => s.id === step.id));

  // Until the page is in a browser, show the start and nothing done.
  let kept: ReturnType<typeof makeKept> | null = null;
  let code = $state(untrack(() => step.start));
  let progress = $state<Progress>({ done: [] });
  let workspace: Workspace;
  let outline: Outline;

  onMount(() => {
    kept = makeKept(browserStore());
    code = kept.stepCode(step.id) ?? step.start;
    progress = kept.progress();
  });

  const project = $derived<Project>(projectOf(code));
  const edited = $derived(code !== step.start);
  const showsSolution = $derived(step.solution !== null && code === step.solution);

  function change(p: Project) {
    const main = p.files.find((f) => f.path === "src/main.la")?.text ?? code;
    if (main === code) return;
    code = main;
    kept?.setStepCode(step.id, code === step.start ? null : code);
  }

  function happened(e: Event) {
    if (!doneBy(step.kind, e)) return;
    progress = markDone(progress, step.id);
    kept?.setProgress(progress);
  }

  function solveOrReset() {
    code = edited ? step.start : (step.solution ?? step.start);
    kept?.setStepCode(step.id, code === step.start ? null : code);
    workspace.clear();
  }

  function startOver() {
    kept?.startOver(all.map((s) => s.id));
    progress = { done: [] };
    code = step.start;
    workspace.clear();
  }

  function openInPlayground() {
    const k = kept ?? makeKept(browserStore());
    const opening = projectOf(playgroundOpening);
    if (k.playgroundUnsaved(opening) && !confirm(copy.openInPlaygroundAsk)) return;
    k.setPlayground(project);
    location.href = "/playground";
  }
</script>

<div class="bar">
  <button type="button" class="icon" aria-label={copy.outline} onclick={() => outline.show()}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
  </button>
  {#if prev}<a class="icon" href={stepUrl(prev.id)} aria-label={copy.previous}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg></a>{/if}
  {#if next}<a class="icon" href={stepUrl(next.id)} aria-label={copy.next}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></a>{/if}
  <div class="crumbs"><span class="dim">{chapterTitle}</span><span class="sep">/</span><span class="dim">{lessonTitle}</span><span class="sep">/</span><span>{step.title}</span></div>
  <div class="grow"></div>
  <ol class="dots">
    {#each lessonSteps as s, i (s.id)}
      <li>
        <a href={stepUrl(s.id)} aria-label={s.title} aria-current={s.id === step.id ? "step" : undefined} class:done={progress.done.includes(s.id)} class:passed={i < inLesson}><span></span></a>
      </li>
    {/each}
  </ol>
  {#if step.solution !== null || edited}
    <button type="button" class="quiet" onclick={solveOrReset}>{edited ? copy.reset : copy.solve}</button>
  {/if}
  <Horizon position={sunPosition(progress, all.map((s) => s.id))} />
</div>

<div class="split">
  <article class="prose">
    <div class="count">{copy.stepOf(inLesson + 1, lessonSteps.length)}</div>
    <h1>{step.title}</h1>
    {@html step.html}
    {#if step.quiz}<Quiz quiz={step.quiz} onanswer={(correct) => happened({ kind: "answer", correct })} />{/if}
    {@html step.after}
    {#if step.seeAlso}
      <a class="see" href="/examples/{step.seeAlso.slug}">{copy.seeAlso(step.seeAlso.title)}<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></a>
    {/if}
    <div class="grow"></div>
    {#if inLesson === lessonSteps.length - 1}
      <a class="edit" href={step.editUrl}>{copy.editOnGitHub}</a>
    {/if}
    <nav class="pager">
      {#if prev}<a href={stepUrl(prev.id)}><span class="label">{copy.previous}</span><span class="title">{prev.title}</span></a>{:else}<span></span>{/if}
      {#if next}<a class="next" href={stepUrl(next.id)}><span class="label">{copy.next}</span><span class="title">{next.title}</span></a>{/if}
    </nav>
  </article>

  <div class="work">
    <Workspace
      bind:this={workspace}
      mode="learn"
      {project}
      onchange={change}
      onran={(r) => happened({ kind: "run", ...r })}
      note={step.startError && step.errorNote && !showsSolution ? { code: step.startError, html: step.errorNote } : null}
      onopen={openInPlayground}
    />
  </div>
</div>

<Outline bind:this={outline} {course} {progress} current={step.id} onstartover={startOver} />

<style>
  .bar {
    flex-shrink: 0;
    position: relative;
    min-height: 56px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--bar);
  }
  .icon {
    width: var(--target);
    height: var(--target);
    border-radius: 10px;
    border: 0;
    background: transparent;
    color: var(--sand-2);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .crumbs {
    font-size: 17px;
    display: flex;
    gap: 8px;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
  }
  .dim {
    color: var(--dust);
  }
  .sep {
    color: var(--faint);
  }
  .grow {
    flex: 1;
  }
  .dots {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0 12px 0 0;
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
  .dots a.passed span {
    border-color: var(--sun);
  }
  .dots a.done span {
    background: var(--sun);
    border-color: var(--sun);
  }
  .dots a[aria-current="step"] span {
    width: 14px;
    height: 14px;
    border-color: var(--sun);
    background: var(--sun-gradient);
  }
  .split {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-wrap: wrap;
  }
  article {
    flex: 1 1 380px;
    max-width: 560px;
    height: 100%;
    overflow-y: auto;
    box-sizing: border-box;
    padding: 36px 40px 24px;
    border-right: 1px solid var(--line);
    font: var(--prose-size) / var(--prose-leading) var(--font-prose);
    color: var(--sand-2);
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  article :global(p) {
    margin: 0;
  }
  article :global(pre.shiki) {
    border: 1px solid var(--line);
    border-radius: 10px;
  }
  .count {
    font: 14px var(--font-ui);
    color: var(--dust);
  }
  h1 {
    margin: 0;
    font: 800 40px / 1.05 var(--font-ui);
    letter-spacing: -0.035em;
    color: var(--sand);
  }
  .see {
    font: 600 16px var(--font-ui);
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    border: 1px solid var(--line-strong);
    border-radius: 12px;
    padding: 12px 16px;
    min-height: var(--target);
    box-sizing: border-box;
  }
  .edit {
    font: 15px var(--font-ui);
    min-height: var(--target);
    display: flex;
    align-items: center;
  }
  .pager {
    border-top: 1px solid var(--line);
    padding-top: 14px;
    display: flex;
    justify-content: space-between;
    gap: 16px;
    font-family: var(--font-ui);
  }
  .pager a {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-height: var(--target);
    text-decoration: none;
  }
  .pager .next {
    align-items: flex-end;
    text-align: right;
  }
  .pager .label {
    font-size: 13px;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--dust);
  }
  .pager .title {
    font-size: 17px;
    color: var(--sand-2);
  }
  .pager .next .title {
    font-weight: 800;
    color: var(--link);
  }
  .work {
    flex: 999 1 560px;
    min-width: 0;
    height: 100%;
    display: flex;
  }
  @media (max-width: 960px) {
    .split {
      overflow-y: auto;
    }
    article {
      max-width: none;
      height: auto;
      border-right: 0;
      padding: 28px var(--gutter);
    }
    .work {
      height: 80vh;
    }
    .crumbs .dim,
    .crumbs .sep {
      display: none;
    }
  }
</style>
