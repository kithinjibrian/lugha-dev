// Serves the content bundle's index: every chapter, lesson and example, with the URL of each.
import type { APIRoute } from "astro";
import { index } from "../../../content/bundle";
import { site } from "../../../content/site";

export const GET: APIRoute = async () => {
  const s = await site();
  return Response.json(index(s.chapters, s.examples));
};
