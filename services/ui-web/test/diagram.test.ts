// Tests the check every step diagram passes before it goes inline in a page.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { checkDiagram } from "../src/content/diagram";

const NS = 'xmlns="http://www.w3.org/2000/svg"';
const svg = (inside: string, attrs = "") => `<svg ${NS} viewBox="0 0 100 50"${attrs}>${inside}</svg>`;
const fails = (s: string) => {
  const r = checkDiagram(s);
  return r.ok ? null : r.error;
};

describe("checkDiagram", () => {
  it("passes a drawing of allowed shapes, classes and text, and gives it back as read", () => {
    const s = svg(
      '<defs><marker id="head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path class="d-head" d="M0 0 L10 5 L0 10 z"/></marker></defs>' +
        '<text class="d-name" x="10" y="20" text-anchor="middle">a &amp; b</text>' +
        '<path class="d-arrow" d="M20 20 C40 20, 50 30, 60 30" marker-end="url(#head)"/>' +
        '<rect class="d-box" x="60" y="10" width="30" height="30" rx="4"/>' +
        '<g transform="translate(1, 2) scale(2)"><line class="d-line" x1="0" y1="0" x2="5" y2="5"/></g>',
    );
    const r = checkDiagram(s);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value).toContain('<text class="d-name" x="10" y="20" text-anchor="middle">a &amp; b</text>');
      expect(r.value).toContain('<rect class="d-box" x="60" y="10" width="30" height="30" rx="4"/>');
      expect(r.value.startsWith(`<svg ${NS} viewBox="0 0 100 50">`)).toBe(true);
    }
  });

  it("passes the first diagram in the course", () => {
    const file = join(import.meta.dirname, "../../../content/learn/05-values/02-ref/01-ref-boxes/diagram.svg");
    expect(checkDiagram(readFileSync(file, "utf8")).ok).toBe(true);
  });

  const refused: [string, string, string][] = [
    ["a script", svg("<script>alert(1)</script>"), "the diagram uses the element `script`"],
    ["foreignObject", svg("<foreignObject></foreignObject>"), "the diagram uses the element `foreignObject`"],
    ["an image", svg('<image x="0" y="0"/>'), "the diagram uses the element `image`"],
    ["an event attribute", svg('<rect class="d-box" onload="x()"/>'), "the diagram uses the attribute `onload`"],
    ["a link", svg('<rect class="d-box" href="https://x.org"/>'), "the diagram uses the attribute `href`"],
    ["a style", svg('<rect class="d-box" style="fill:red"/>'), "the diagram uses the attribute `style`: colours and fonts come from the `d-` classes"],
    ["a fill", svg('<rect class="d-box" fill="#f80"/>'), "the diagram uses the attribute `fill`: colours and fonts come from the `d-` classes"],
    ["a font", svg('<text class="d-name" font-size="9">a</text>'), "the diagram uses the attribute `font-size`: colours and fonts come from the `d-` classes"],
    ["an unknown class", svg('<rect class="d-box loud"/>'), "the diagram uses the class `loud`"],
    ["an outside url in a marker", svg('<path class="d-arrow" d="M0 0" marker-end="url(https://x.org/a.svg#m)"/>'), "the diagram's `marker-end` isn't a local url(#id)"],
    ["width on a path", svg('<path class="d-arrow" d="M0 0" width="5"/>'), "the diagram uses the attribute `width` on `path`"],
    ["another transform", svg('<g transform="matrix(1 0 0 1 0 0)"></g>'), "the diagram's `transform` uses something other than translate, rotate and scale"],
    ["a comment", svg("<!-- note -->"), "the diagram has a comment"],
    ["an entity", svg('<text class="d-name">&nbsp;</text>'), "the diagram uses the entity `&nbsp;`"],
    ["text outside text", svg("<g>loose</g>"), "the diagram has text outside text, tspan, title and desc"],
    ["a doctype", '<!DOCTYPE svg>' + svg(""), "the diagram has a declaration (<!…> or <?…>)"],
    ["single quotes", `<svg ${NS} viewBox='0 0 1 1'></svg>`, "the diagram isn't well-formed SVG: attributes take double quotes"],
    ["an unclosed element", svg('<g><rect class="d-box"/>'), "the diagram isn't well-formed SVG: `g` isn't closed"],
    ["another root", '<g></g>', "the diagram's outer element is `g`, not `svg`"],
    ["another namespace", '<svg xmlns="http://example.org" viewBox="0 0 1 1"></svg>', "the diagram's `xmlns` isn't the SVG namespace"],
  ];
  for (const [what, s, problem] of refused) {
    it(`refuses ${what}`, () => expect(fails(s)).toBe(problem));
  }
});
