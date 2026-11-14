// Checks each kind of page with axe for accessibility violations.
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const path of ["/", "/learn/values/copies/mutable-copies/", "/learn/values/ref/ref-boxes/", "/examples/word-frequency/", "/playground"]) {
  test(`axe finds no violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.locator(".cm-content, h1").first().waitFor();
    const r = await new AxeBuilder({ page }).analyze();
    expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });
}
