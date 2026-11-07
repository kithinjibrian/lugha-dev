# Target UI (v1)

The design `services/ui-web/` is built to match: the source of the canvas at https://claude.ai/artifact/M6vsrSiDskXzH4sFSQkD3n, copied 2026-11-07.

| File | Page |
|---|---|
| `Main.dc.html` | Home (the hero only: core decision 8, open decision O7) |
| `Learn.dc.html` | Learn: one lesson, "Everything is a value", in five steps |
| `Examples.dc.html` | Examples: the index and five examples |
| `Playground.dc.html` | Playground |
| `canvas.json` | The canvas's layout of the four pages |

These are design files, not the site. Each page is a Design Component: HTML with `{{holes}}`, `<sc-for>` and `<sc-if>`, and a `Component` class holding its state. They render only inside the canvas, which supplies `support.js`; opened directly in a browser they won't work. Read them for structure, copy and behaviour; take colours, fonts and sizes from `docs/DESIGN.md`.

What the design shows but `services/ui-web/` must make real:
- Run, Test and Format show output recorded from `lughac`; the real site gets it from `services/api/` (CLAUDE.md, architecture rule 3).
- The editor is a picture of code; the real one is an editor (open decision O1).
- "Open in Playground" only links to the page; the real one carries the code over.
- The course-outline button and the examples marked "soon" do nothing yet.

If the canvas changes, copy it here again and note the date.
