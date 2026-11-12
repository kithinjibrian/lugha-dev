import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const path of ["/", "/learn/values/everything-is-a-value/your-copy-needs-mut/", "/examples/word-frequency/", "/playground"]) {
  test(`axe finds no violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.locator(".cm-content, h1").first().waitFor();
    const r = await new AxeBuilder({ page }).analyze();
    expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });
}
