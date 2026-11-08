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
  startError: string | null;
  errorNote: string | null;
  seeAlso: { slug: string; title: string } | null;
  /** Its folder on GitHub. */
  editUrl: string;
}

export const stepUrl = (id: string) => `/learn/${id}`;
