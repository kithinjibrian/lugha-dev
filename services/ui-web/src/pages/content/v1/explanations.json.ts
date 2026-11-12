import type { APIRoute } from "astro";
import { site } from "../../../content/site";

export const GET: APIRoute = async () => Response.json({ v: 1, ...(await site()).explanations });
