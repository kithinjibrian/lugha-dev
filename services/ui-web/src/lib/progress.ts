// Tracks progress through the course, kept in the browser only.
// A step is done when the visitor has done what it asks. Nothing is locked.

/** Names a step's kind: `fix` has a solution, `quiz` has a quiz, and `read` is everything else. */
export type StepKind = "fix" | "read" | "quiz";

/** Describes what the visitor just did on a step: a Run, or an answer to its quiz. */
export type Event =
  | { kind: "run"; compiled: boolean; exit: number }
  | { kind: "answer"; correct: boolean };

/** Lists the ids ("chapter/lesson/step") of the steps done. */
export interface Progress {
  done: string[];
}

/** Tells whether `event` completes a step of kind `step`. */
export function doneBy(step: StepKind, event: Event): boolean {
  switch (step) {
    case "fix":
      return event.kind === "run" && event.compiled && event.exit === 0;
    case "read":
      return event.kind === "run";
    case "quiz":
      return event.kind === "answer" && event.correct;
  }
}

/** Gives the progress with `id` done; the same object when it already was. */
export function markDone(p: Progress, id: string): Progress {
  return p.done.includes(id) ? p : { done: [...p.done, id] };
}

/** Gives where the sun sits on the horizon, from 0 to 1: done steps out of all steps. */
export function sunPosition(p: Progress, steps: string[]): number {
  if (steps.length === 0) return 0;
  const done = steps.filter((s) => p.done.includes(s)).length;
  return done / steps.length;
}

/** Gives progress with nothing done. */
export function startOver(): Progress {
  return { done: [] };
}

/** Reads progress back from storage, giving nothing done when it's missing or malformed. */
export function asProgress(v: unknown): Progress {
  if (typeof v === "object" && v !== null) {
    const done = (v as { done?: unknown }).done;
    if (Array.isArray(done) && done.every((d) => typeof d === "string")) {
      return { done };
    }
  }
  return startOver();
}
