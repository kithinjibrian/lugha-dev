// Browser tests for Learn: running a step, explanations, Solve, quizzes and kept edits.
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const content = (p: string) => readFileSync(new URL(`../../../../content/${p}`, import.meta.url), "utf8");
const lesson = "learn/02-values/01-everything-is-a-value";

test("a step: Run shows the output, the step counts as done and the sun moves", async ({ page }) => {
  await page.goto("/learn/values/everything-is-a-value/copies/");
  const walked = page.locator(".walked");
  await expect(walked).toHaveAttribute("style", /width: 0(\.0)?%/);
  await page.getByRole("button", { name: "Run" }).click();
  await expect(page.locator(".stdout")).toHaveText(content(`${lesson}/01-copies/expected.txt`));
  await expect(page.getByText("Exited with code 0")).toBeVisible();
  await expect(page.locator('.bar .dots a[aria-current="step"]')).toHaveClass(/done/);
  // How far depends on how many steps the course has, so only check that the sun moved.
  await expect(walked).not.toHaveAttribute("style", /width: 0(\.0)?%/);
  // It stays done after a reload.
  await page.reload();
  await expect(page.locator('.bar .dots a[aria-current="step"]')).toHaveClass(/done/);
});

test("step 2: Run shows E0501 and its explanation; Solve, then Run, shows the output", async ({ page }) => {
  await page.goto("/learn/values/everything-is-a-value/your-copy-needs-mut/");
  await page.getByRole("button", { name: "Run" }).click();
  await expect(page.locator(".diagnostics")).toContainText("error[E0501]: cannot assign to `b`: it is not mutable");
  await expect(page.locator(".diagnostics")).toContainText("--> src/main.la:6:5");
  await expect(page.locator(".explain")).toContainText("Only a let mut can change");
  await expect(page.locator(".explain")).toContainText("isn't mutable");
  await expect(page.locator(".cm-error-line")).toHaveCount(1);
  await page.getByRole("button", { name: "More about E0501" }).click();
  await expect(page.locator(".explain .rest")).toBeVisible();

  await page.getByRole("button", { name: "Solve" }).click();
  await expect(page.getByRole("button", { name: "Reset" })).toBeVisible();
  await expect(page.getByText("Press Run.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Run" }).click();
  await expect(page.locator(".stdout")).toHaveText(content(`${lesson}/02-your-copy-needs-mut/expected.txt`));
  await expect(page.locator('.bar .dots a[aria-current="step"]')).toHaveClass(/done/);

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.locator(".cm-content")).toContainText("let b = a;");
});

test("a quiz: the right answer finishes the step", async ({ page }) => {
  await page.goto("/learn/values/everything-is-a-value/check-yourself/");
  await page.getByRole("button", { name: "[5, 6, 1]" }).click();
  await expect(page.locator(".feedback")).toHaveText(/^Not quite/);
  await expect(page.locator('.bar .dots a[aria-current="step"]')).not.toHaveClass(/done/);
  await page.getByRole("button", { name: "[5, 6]", exact: true }).click();
  await expect(page.locator(".feedback")).toHaveText(/^Right\./);
  await expect(page.locator('.bar .dots a[aria-current="step"]')).toHaveClass(/done/);
});

test("edits are kept, and Reset returns to the start", async ({ page }) => {
  await page.goto("/learn/values/everything-is-a-value/copies/");
  await page.locator(".cm-content").click();
  await page.keyboard.press("ControlOrMeta+End");
  await page.keyboard.type("\n// mine");
  await page.reload();
  await expect(page.locator(".cm-content")).toContainText("// mine");
  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.locator(".cm-content")).not.toContainText("// mine");
});

test("Start learning opens the course's first step", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Start learning" }).click();
  await expect(page).toHaveURL(/\/learn\/basics\/hello-lugha\/run-it/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Run it");
});

test("a fix step whose start already runs is done only once it's fixed", async ({ page }) => {
  await page.goto("/learn/values/everything-is-a-value/functions-get-copies/");
  const current = page.locator('.bar .dots a[aria-current="step"]');
  await page.getByRole("button", { name: "Run" }).click();
  await expect(page.getByText("Exited with code 0")).toBeVisible();
  await expect(current).not.toHaveClass(/done/);
  await page.getByRole("button", { name: "Solve" }).click();
  await page.getByRole("button", { name: "Run" }).click();
  await expect(page.locator(".stdout")).toHaveText(content(`${lesson}/04-functions-get-copies/expected.txt`));
  await expect(current).toHaveClass(/done/);
});
