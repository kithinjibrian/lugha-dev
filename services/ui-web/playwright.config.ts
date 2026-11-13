// The browser tests, against the running stack:
// docker compose up -d, then npm run e2e. E2E_URL names another one.
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "test/e2e",
  timeout: 90_000,
  expect: { timeout: 60_000 },
  workers: 1,
  use: { baseURL: process.env.E2E_URL ?? "http://127.0.0.1:8080", browserName: "chromium" },
});
