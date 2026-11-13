// The unit tests: every test/**/*.test.ts. The browser tests are Playwright's.
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { include: ["test/**/*.test.ts"] },
});
