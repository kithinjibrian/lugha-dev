// Browser tests for Learn: running a step, explanations, Solve, quizzes and kept edits.
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const content = (p: string) => readFileSync(new URL(`../../../../content/${p}`, import.meta.url), "utf8");
const lesson = "learn/05-values/01-copies";

test("a step: Run shows the output, the step counts as done and the sun moves", async ({ page }) => {
  await page.goto("/learn/values/copies/copies/");
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
  await page.goto("/learn/values/copies/mutable-copies/");
  await page.getByRole("button", { name: "Run" }).click();
  await expect(page.locator(".diagnostics")).toContainText("error[E0501]: cannot assign to `b`: it is not mutable");
  await expect(page.locator(".diagnostics")).toContainText("--> src/main.la:6:5");
  await expect(page.locator(".explain")).toContainText("isn't mutable");
  await expect(page.locator(".cm-error-line")).toHaveCount(1);
  await page.getByRole("button", { name: "More about E0501" }).click();
  await expect(page.locator(".explain .rest")).toBeVisible();

  await page.getByRole("button", { name: "Solve" }).click();
  await expect(page.getByRole("button", { name: "Reset" })).toBeVisible();
  await expect(page.getByText("Press Run.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Run" }).click();
  await expect(page.locator(".stdout")).toHaveText(content(`${lesson}/02-mutable-copies/expected.txt`));
  await expect(page.locator('.bar .dots a[aria-current="step"]')).toHaveClass(/done/);

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.locator(".cm-content")).toContainText("let b = a;");
});

test("a quiz: the right answer finishes the step", async ({ page }) => {
  await page.goto("/learn/values/copies/quiz/");
  await page.getByRole("button", { name: "[5, 6, 1]" }).click();
  await expect(page.locator(".feedback")).toHaveText(/^Not quite/);
  await expect(page.locator('.bar .dots a[aria-current="step"]')).not.toHaveClass(/done/);
  await page.getByRole("button", { name: "[5, 6]", exact: true }).click();
  await expect(page.locator(".feedback")).toHaveText(/^Right\./);
  await expect(page.locator('.bar .dots a[aria-current="step"]')).toHaveClass(/done/);
});

test("edits are kept, and Reset returns to the start", async ({ page }) => {
  await page.goto("/learn/values/copies/copies/");
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
  await expect(page).toHaveURL(/\/learn\/basics\/hello-world\/the-main-function/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("The main function");
});

test("a fix step whose start already runs is done only once it's fixed", async ({ page }) => {
  await page.goto("/learn/values/copies/passing-by-value/");
  const current = page.locator('.bar .dots a[aria-current="step"]');
  await page.getByRole("button", { name: "Run" }).click();
  await expect(page.getByText("Exited with code 0")).toBeVisible();
  await expect(current).not.toHaveClass(/done/);
  await page.getByRole("button", { name: "Solve" }).click();
  await page.getByRole("button", { name: "Run" }).click();
  await expect(page.locator(".stdout")).toHaveText(content(`${lesson}/04-passing-by-value/expected.txt`));
  await expect(current).toHaveClass(/done/);
});

test("a step's diagram shows in the text, named for screen readers", async ({ page }) => {
  await page.goto("/learn/values/ref/ref-boxes/");
  const figure = page.locator("article figure.diagram");
  await expect(figure).toBeVisible();
  await expect(page.getByRole("img", { name: "a and b both point at one box, which holds 5" })).toBeVisible();
  // It comes after the answer, so the picture doesn't give the question away.
  const order = await page.locator("article").evaluate((a) => {
    const text = a.textContent ?? "";
    return [text.indexOf("Does a still see 1?"), text.indexOf("It prints 5.")];
  });
  expect(order[0]).toBeLessThan(order[1]);
  const box = await figure.boundingBox();
  const prints = await page.getByText("It prints 5.").boundingBox();
  expect(box!.y).toBeGreaterThan(prints!.y);
});
