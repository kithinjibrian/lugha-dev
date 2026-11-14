import type { File } from "../../lib/project";
// What a Learn page's island gets about the course and its step.
import type { Quiz } from "../../content/markdown";
import type { StepKind } from "../../lib/progress";

export interface CourseChapter {
  title: string;
  lessons: { title: string; steps: { id: string; title: string }[] }[];
}

export interface StepData {
  id: string;
  title: string;
  kind: StepKind;
  html: string;
  quiz: Quiz | null;
  after: string;
  start: string;
  solution: string | null;
  /** Every file of the start and of the solution, src/main.la first. */
  files: File[];
  solutionFiles: File[] | null;
  /** Whether Test runs the step's tests, and passing them marks it done. */
  tests: boolean;
  /** What the step's solution (or, without one, its start) prints. */
  expected: string;
  startError: string | null;
  errorNote: string | null;
  seeAlso: { slug: string; title: string } | null;
  /** Its folder on GitHub. */
  editUrl: string;
}

export const stepUrl = (id: string) => `/learn/${id}`;
