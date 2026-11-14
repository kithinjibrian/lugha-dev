// Browser tests for Learn steps with several files and steps whose tests the learner runs.
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const content = (p: string) => readFileSync(new URL(`../../../../content/${p}`, import.meta.url), "utf8");
const chapter = "learn/09-modules-and-tests";
const current = '.bar .dots a[aria-current="step"]';

test("a step with several files lists them all and runs across them", async ({ page }) => {
  await page.goto("/learn/modules-and-tests/modules/multiple-files/");
  const files = page.getByRole("navigation", { name: "Files" });
  await expect(files.getByRole("button", { name: "main.la" })).toHaveAttribute("aria-current", "true");
  await files.getByRole("button", { name: "shapes.la" }).click();
  await expect(page.locator(".cm-content")).toContainText("struct Square { side: f64 }");
  await page.getByRole("button", { name: "Run" }).click();
  await expect(page.locator(".stdout")).toHaveText(content(`${chapter}/01-modules/01-multiple-files/expected.txt`));
  await expect(page.locator(current)).toHaveClass(/done/);
});

test("Solve and Reset change every file, and edits to each file are kept", async ({ page }) => {
  await page.goto("/learn/modules-and-tests/visibility/public/");
  const files = page.getByRole("navigation", { name: "Files" });
  await page.getByRole("button", { name: "Run" }).click();
  await expect(page.locator(".diagnostics")).toContainText("error[E0318]");

  await page.getByRole("button", { name: "Solve" }).click();
  await files.getByRole("button", { name: "shapes.la" }).click();
  await expect(page.locator(".cm-content")).toContainText("public struct Square");
  await page.getByRole("button", { name: "Run" }).click();
  await expect(page.locator(".stdout")).toHaveText(content(`${chapter}/02-visibility/03-public/expected.txt`));
  await expect(page.locator(current)).toHaveClass(/done/);

  await page.getByRole("button", { name: "Reset" }).click();
  await files.getByRole("button", { name: "shapes.la" }).click();
  await expect(page.locator(".cm-content")).not.toContainText("public struct Square");

  // An edit to a file other than main.la survives a reload.
  await page.locator(".cm-content").click();
  await page.keyboard.press("ControlOrMeta+End");
  await page.keyboard.type("\n// mine");
  await page.reload();
  await files.getByRole("button", { name: "shapes.la" }).click();
  await expect(page.locator(".cm-content")).toContainText("// mine");
});

test("a test step: Test shows each test, and only all of them passing marks it done", async ({ page }) => {
  await page.goto("/learn/modules-and-tests/tests/running-tests/");
  const tests = page.getByRole("button", { name: "Test", exact: true });
  await tests.click();
  await expect(page.locator(".body pre")).toContainText("test test.shapes_test.largest_of_none ... FAILED");
  await expect(page.locator(".body pre")).toContainText("2 tests: 1 passed, 1 failed");
  await expect(page.locator(current)).not.toHaveClass(/done/);

  // Run alone never marks a test step done.
  await page.getByRole("button", { name: "Solve" }).click();
  await page.getByRole("button", { name: "Run" }).click();
  await expect(page.locator(".stdout")).toHaveText(content(`${chapter}/03-tests/03-running-tests/expected.txt`));
  await expect(page.locator(current)).not.toHaveClass(/done/);

  await tests.click();
  await expect(page.locator(".body pre")).toContainText("2 tests: 2 passed, 0 failed");
  await expect(page.locator(current)).toHaveClass(/done/);
});
