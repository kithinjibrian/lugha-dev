// The site (PRP-002, WEB-1): static pages with Svelte islands.
// In development, /api goes to the local stack (docker compose up -d).
import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";

export default defineConfig({
  output: "static",
  integrations: [svelte()],
  vite: {
    server: {
      proxy: { "/api": "http://127.0.0.1:8080" },
    },
  },
});
