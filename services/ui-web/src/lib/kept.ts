// Keeps what the browser remembers: each step's edits, progress, and the Playground's one project.
// All of it lives in the store; nothing is sent.
import { asProgress, startOver, type Progress } from "./progress";
import type { Project } from "./project";
import type { Store } from "./storage";

function asProject(v: unknown): Project | null {
  if (typeof v !== "object" || v === null) return null;
  const { files, args, stdin } = v as Record<string, unknown>;
  if (!Array.isArray(files) || !Array.isArray(args) || typeof stdin !== "string") return null;
  const ok =
    files.every((f) => typeof f?.path === "string" && typeof f?.text === "string") &&
    args.every((a) => typeof a === "string");
  return ok ? { files, args, stdin } : null;
}

const same = (a: Project, b: Project) => JSON.stringify(a) === JSON.stringify(b);

/** Gives the site's view of `store`: step edits, progress and the Playground's project. */
export function kept(store: Store) {
  return {
    stepCode(id: string): string | null {
      const v = store.get(`step.${id}`);
      return typeof v === "string" ? v : null;
    },
    /** Keeps a step's edits; null forgets them, as Reset does. */
    setStepCode(id: string, code: string | null) {
      if (code === null) store.remove(`step.${id}`);
      else store.set(`step.${id}`, code);
    },
    progress(): Progress {
      return asProgress(store.get("progress"));
    },
    setProgress(p: Progress) {
      store.set("progress", p);
    },
    /** Clears progress and puts every step in `steps` back to its start. */
    startOver(steps: string[]) {
      store.set("progress", startOver());
      for (const id of steps) store.remove(`step.${id}`);
    },
    playground(opening: Project): Project {
      return asProject(store.get("playground")) ?? opening;
    },
    setPlayground(p: Project) {
      store.set("playground", p);
    },
    /** Tells whether the Playground holds something other than its opening project. */
    playgroundUnsaved(opening: Project): boolean {
      const p = asProject(store.get("playground"));
      return p !== null && !same(p, opening);
    },
  };
}

/** Holds what `kept` gives back. */
export type Kept = ReturnType<typeof kept>;
