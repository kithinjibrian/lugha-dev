// Serves one lesson and its steps as /content/v1/lessons/<chapter>/<lesson>.json.
import type { APIRoute, GetStaticPaths } from "astro";
import { lesson } from "../../../../../content/bundle";
import type { Chapter, Lesson } from "../../../../../content/load";
import { site } from "../../../../../content/site";

export const getStaticPaths: GetStaticPaths = async () =>
  (await site()).chapters.flatMap((chapter) =>
    chapter.lessons.map((l) => ({ params: { chapter: chapter.slug, lesson: l.slug }, props: { chapter, l } })),
  );

export const GET: APIRoute = ({ props }) => {
  const { chapter, l } = props as { chapter: Chapter; l: Lesson };
  return Response.json(lesson(chapter, l));
};
