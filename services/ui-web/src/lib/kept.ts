// Keeps what the browser remembers: each step's edits, progress, and the Playground's one project.
// All of it lives in the store; nothing is sent.
import { asProgress, startOver, type Progress } from "./progress";
import type { File, Project } from "./project";
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
    /**
     * Gives a step's files as the learner left them, or `start` when nothing was kept. A one-file
     * step keeps its main.la as a string (as it always has); any other keeps every file. A kept entry
     * whose paths no longer match `start` is ignored, so a changed step starts again.
     */
    stepFiles(id: string, start: File[]): File[] {
      const v = store.get(`step.${id}`);
      if (typeof v === "string") return start.map((f) => (f.path === "src/main.la" ? { ...f, text: v } : f));
      if (Array.isArray(v) && v.length === start.length && v.every((f, i) => f?.path === start[i].path && typeof f?.text === "string")) {
        return v.map((f) => ({ path: f.path, text: f.text }));
      }
      return start;
    },
    /** Keeps a step's edits; null, or files as they started, forgets them, as Reset does. */
    setStepFiles(id: string, files: File[] | null, start: File[]) {
      if (files === null || JSON.stringify(files) === JSON.stringify(start)) store.remove(`step.${id}`);
      else if (start.length === 1) store.set(`step.${id}`, files[0].text);
      else store.set(`step.${id}`, files);
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
