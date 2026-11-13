// Serves one example as /content/v1/examples/<slug>.json.
import type { APIRoute, GetStaticPaths } from "astro";
import { example } from "../../../../content/bundle";
import type { Example } from "../../../../content/load";
import { site } from "../../../../content/site";

export const getStaticPaths: GetStaticPaths = async () =>
  (await site()).examples.map((e) => ({ params: { slug: e.slug }, props: { e } }));

export const GET: APIRoute = ({ props }) => Response.json(example((props as { e: Example }).e));
