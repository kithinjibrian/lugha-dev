// Checks the pages at a phone's width: nothing runs off the side, the page scrolls as a whole, and
// a Learn step's Run works from there.
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 390, height: 664 }, isMobile: true, hasTouch: true });

const PAGES = ["/", "/learn/values/everything-is-a-value/your-copy-needs-mut/", "/examples/word-frequency/", "/playground"];

for (const path of PAGES) {
  test(`${path} fits a phone's width`, async ({ page }) => {
    await page.goto(path);
    await page.locator(".cm-content, h1").first().waitFor();
    const { scroll, client } = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    expect(scroll).toBe(client);
    const r = await new AxeBuilder({ page }).analyze();
    expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });
}

test("a Learn step scrolls as a page and runs on a phone", async ({ page }) => {
  await page.goto(PAGES[1]);
  expect(await page.evaluate(() => document.documentElement.scrollHeight > innerHeight)).toBe(true);
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.getByText("error[E0501]")).toBeVisible({ timeout: 30_000 });
});

test("the header's GitHub link keeps its name on a phone", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "GitHub" })).toBeVisible();
});

test("Learn and Examples link straight to their first page", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Main" });
  await expect(nav.getByRole("link", { name: "Learn" })).toHaveAttribute("href", /^\/learn\/.+/);
  await expect(nav.getByRole("link", { name: "Examples" })).toHaveAttribute("href", /^\/examples\/.+/);
});
