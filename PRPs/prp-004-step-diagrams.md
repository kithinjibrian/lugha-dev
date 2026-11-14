## FEATURE: A diagram in a lesson step, drawn as SVG, first used in 5.2 step 1 to show what a `Ref` box is

Status: **approved by the owner, 2026-11-14** (with 5.2 and the title "Updating a box" kept). From the discovery of 2026-11-14; every answer was the recommended option.

## OBJECTIVE

A learner reading 5.2 Ref, step 1, sees what a box is: after the run, a picture shows `a` and `b` pointing at one box that holds `5`. The owner found the words alone didn't explain it (2026-11-14). Any later step can carry one picture the same way, and a picture that breaks the rules stops the build before it reaches the site.

## CONTEXT

- Read first: `services/ui-web/src/content/markdown.ts` (the step markdown subset: text, ```lugha, one ```quiz), `services/ui-web/src/content/load.ts` (reads each step folder), `services/ui-web/src/components/learn/LearnStep.svelte` (shows `step.html`, the quiz, `step.after`), `services/ui-web/src/styles/tokens.css` and `docs/DESIGN.md` (the colours), `services/ui-web/src/content/bundle.ts` (what `/content/v1/` hands `services/ui-rk`).
- Decisions: none open that this depends on (O7 and O9 are unrelated). Core decision 5 (dark only) and architecture 1 (content is data) apply.
- Changes: `markdown.ts`, `load.ts`, a new `services/ui-web/src/content/diagram.ts` (the SVG check), `LearnStep.svelte` or its CSS (the diagram's look), their tests, and the first diagram's step folder. No change to `services/api` or the sandbox.

### Discovery answers (2026-11-14)

1. **How it's made:** a hand-drawn `diagram.svg` in the step's folder, placed in `step.md` with a ```diagram block that names the file and carries its alt text.
2. **Where and what the learner does:** lesson steps only, at most one per step, at the spot the block sits, as wide as the text column (up to a set width) and shrinking at phone width. Nothing to click: a picture with alt text.
3. **When it's wrong:** the build fails, like every other content error, with a sentence naming the step.
4. **Checking the SVG:** our own allow-list in `diagram.ts`, no new dependency. The SVG goes inline in the page so its colours follow the tokens.

## REQUIREMENTS

### Must Do

- **The block.** In `step.md`:

  ```diagram
  file = "diagram.svg"
  alt = "a and b both point at one box, which holds 5"
  ```

  TOML like the quiz block, with exactly these two keys. `file` names a file in the same step folder (a plain name ending in `.svg`, no `/` or `..`). `alt` is a non-empty sentence, checked by the voice check like other step text.
- **Placement.** The diagram renders where its block is, in `step.html` or `step.after` (before or after a quiz), as `<figure class="diagram">` holding the inline SVG with `role="img"` and `aria-label` set to the alt text.
- **The allow-list.** The SVG may contain only these elements: `svg`, `g`, `defs`, `marker`, `title`, `desc`, `rect`, `circle`, `ellipse`, `line`, `polyline`, `polygon`, `path`, `text`, `tspan`. Only these attributes: `xmlns` (the SVG namespace only), `viewBox`, `x`, `y`, `x1`, `y1`, `x2`, `y2`, `cx`, `cy`, `r`, `rx`, `ry`, `width`, `height` (on `rect` and `marker` only), `d`, `points`, `transform` (`translate`, `rotate`, `scale` only), `text-anchor`, `dominant-baseline`, `class`, `id`, `refX`, `refY`, `markerWidth`, `markerHeight`, `orient`, `marker-start`, `marker-end` (a local `url(#id)` only). Text content only inside `text`, `tspan`, `title` and `desc`. No comments, processing instructions, entities other than the five XML ones, or CDATA.
- **Colours come from the tokens through classes.** No `fill`, `stroke`, `style` or `font-*` attribute is allowed; each shape takes a class from a fixed set styled in CSS with DESIGN.md tokens:

  | Class | Look |
  | --- | --- |
  | `d-name` | a variable's name: code font, `--sand` |
  | `d-value` | a value: code font, `--code-literal` |
  | `d-note` | a short label: UI font, `--dust` |
  | `d-box` | a box: `--raised` fill, `--sun` outline |
  | `d-line` | a plain line: `--line-strong` |
  | `d-arrow` | an arrow's line: `--dust`, no fill |
  | `d-head` | an arrow's head: `--dust` fill |

  Any other class fails. Adding a class later is a change to this table and the CSS.
- **Errors, each a sentence naming the step** (`learn/…/step.md: …`): the diagram file is missing; `alt` is missing or empty; the block has another key or isn't TOML; a second diagram; and for the SVG, the first element, attribute, class or construct outside the allow-list, named (e.g. "the diagram uses the attribute `fill`: colours come from the `d-` classes").
- **Content is data.** The rendered step HTML (with the SVG inline) is what the bundle at `/content/v1/` already carries, so `services/ui-rk` gets the picture with no new field.
- **Phone width.** The figure is `width: 100%` up to 420px, `height: auto`, centred in the text column, with no horizontal scroll at 320px.

### Must NOT Do

- No diagram in examples, the Playground or Home (discovery answer 2).
- No new npm dependency (answer 4).
- No raster images, fonts, scripts, links, `foreignObject` or anything loaded from outside the page.
- No colour, font or size written in the SVG itself (anti-pattern 5: tokens only).
- No change to the rest of the markdown subset: HTML in step text is still rejected.

## DESIGN

- `diagram.ts` exports `checkDiagram(svg: string): Result<string, string>`: it tokenises the restricted XML itself (start tags, end tags, self-closing tags, attributes in double quotes, text), checks each against the allow-list, and returns the SVG re-serialised from what it read, so nothing unchecked passes through. Errors return the first problem as a sentence.
- `markdown.ts` gains a ```diagram fence beside ```quiz. `renderMarkdown` gets a callback that, given the block's TOML, returns the checked SVG or an error; `load.ts` supplies it, reading the file from the step folder.
- The figure's CSS (the `d-` classes above) lives with the learn step styles and uses only tokens.
- Security: the SVG is written by the owner or Claude, never by a visitor, and is checked at build time; nothing runs in the browser. Still, the allow-list is exact so a mistake can't put a script or an outside request on the page.

## CONTENT

For the owner to approve word for word.

**5.2 step 1, Ref boxes** (the text, with the diagram after the answer):

> A `Ref` is a box: a place that holds one value, read with `get` and replaced with `set`.
> `Ref.new(1)` on line 2 makes a box holding `1`, and `a` names it.
> Line 3 copies `a` into `b`, line 4 sets the box to `5` through `b`, and line 5 reads it through `a`.
> Does `a` still see `1`?
> Press Run.
>
> It prints `5`.
> Copying a `Ref` copies only a handle to the box, so `a` and `b` name the same box:
>
> *(the diagram)*
>
> Every other value you copy is still your own copy, as in the last lesson.

**The diagram:** `a` and `b` on the left, an arrow from each to one box holding `5`, and under the box the label "one box". Alt text: "a and b both point at one box, which holds 5". The draft is `docs/content/05-value-semantics/5.2-ref-boxes.svg`, with a preview at `/tmp/claude-1000/-home-kithinji-Documents-kithinji-lugha-dev/d40bdf19-eb08-4908-8e00-91f930630031/scratchpad/diagram-preview.html`.

The program is unchanged from the step (run in the sandbox, m159, prints `5`).

## TESTS

- [ ] `diagram.test.ts`: the 5.2 diagram passes and comes back unchanged in meaning; one failing case each for a script element, an event attribute (`onload`), `href`, `style`, `fill`, an unknown class, an outside `url(…)` in `marker-end`, a comment, an entity, `foreignObject`, `image`, a `transform` other than the three allowed, and text outside `text`/`tspan`/`title`/`desc`.
- [ ] `markdown.test.ts`: a step with a diagram renders a `figure` with `role="img"` and the alt text as its label; a missing `alt`, an empty `alt`, an extra key, bad TOML and a second diagram each fail with their sentence; a diagram after a quiz lands in `after`.
- [ ] `load.test.ts`: a step folder whose block names a missing file fails; a `file` with `/` or `..` fails.
- [ ] `voice.test.ts`: the alt text goes through the wording checks.
- [ ] e2e: 5.2 step 1 shows the figure after Run's answer text, it has its accessible name, axe passes, and at 320px wide the page has no horizontal scroll.

## ACCEPTANCE

- [ ] 5.2 step 1 shows the diagram where the text above puts it, in the site's colours.
- [ ] Every rule above that fails the build has a test that shows it failing.
- [ ] The full suite passes, including every lesson step and example run through `lughac`.
- [ ] For the owner, by eye: open 5.2 step 1 on the local site, on a laptop and at phone width, and read the step with the picture.
