// Serves every error code's explanation from the pinned sandbox image as /content/v1/explanations.json.
import type { APIRoute } from "astro";
import { site } from "../../../content/site";

export const GET: APIRoute = async () => Response.json({ v: 1, ...(await site()).explanations });
