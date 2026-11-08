import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const content = (p: string) => readFileSync(new URL(`../../../../content/${p}`, import.meta.url), "utf8");

test("the Playground runs its opening program, and Test runs its test", async ({ page }) => {
  await page.goto("/playground");
  await page.locator(".toolbar").getByRole("button", { name: "Run" }).click();
  await expect(page.locator(".stdout")).toHaveText(content("playground/expected.txt"));
  await page.getByRole("button", { name: "Test", exact: true }).click();
  await expect(page.getByRole("tabpanel")).toContainText("test playground.main.square_area ... ok");
  await expect(page.getByRole("tabpanel")).toContainText("1 test: 1 passed, 0 failed");
});

test("Share: the link opens the same code in a fresh browser", async ({ page, browser, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/playground");
  await page.locator(".cm-content").click();
  await page.keyboard.press("ControlOrMeta+End");
  await page.keyboard.type("\n// shared from a test");
  await page.getByRole("button", { name: "Share" }).click();
  await expect(page.getByRole("status")).toHaveText("Link copied.");
  const link = await page.evaluate(() => navigator.clipboard.readText());
  expect(link).toMatch(/\/playground#v1\.[A-Za-z0-9_-]+$/);

  const fresh = await browser.newContext();
  const other = await fresh.newPage();
  await other.goto(link);
  await expect(other.locator(".cm-content")).toContainText("// shared from a test");
  await expect(other.getByRole("status")).toHaveText("Opened from a link");
  await fresh.close();
});

test("with the API unreachable, Run says so and the code is still there", async ({ page, context }) => {
  await page.goto("/playground");
  await page.locator(".cm-content").click();
  await page.keyboard.press("ControlOrMeta+End");
  await page.keyboard.type("\n// still here");

  await page.route("/api/**", (r) => r.fulfill({ status: 502, body: "Bad Gateway" }));
  await page.locator(".toolbar").getByRole("button", { name: "Run" }).click();
  await expect(page.locator(".sentence")).toHaveText("The server is busy. Try again in a moment.");
  await expect(page.locator(".cm-content")).toContainText("// still here");

  await context.setOffline(true);
  await page.locator(".toolbar").getByRole("button", { name: "Run" }).click();
  await expect(page.locator(".sentence")).toHaveText("You're offline. Your code is saved here; run it when you're back.");
  await context.setOffline(false);
  await expect(page.locator(".cm-content")).toContainText("// still here");
});

test("an example opens in the Playground", async ({ page }) => {
  await page.goto("/examples/word-frequency/");
  await page.getByRole("button", { name: "Run" }).click();
  await expect(page.locator(".stdout")).toHaveText(content("examples/word-frequency/expected.txt"));
  await page.getByRole("button", { name: "Open in Playground" }).click();
  await expect(page).toHaveURL(/\/playground$/);
  await expect(page.locator(".cm-content")).toContainText("counts");
});
