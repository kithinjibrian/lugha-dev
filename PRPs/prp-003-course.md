## FEATURE: The course outline (eight chapters, 33 lessons), with chapters 1 (Basics) and 2 (Values) written

Status: **approved by the owner, 2026-11-13.** The outline below comes from the discovery of 2026-11-13; every answer was the recommended option unless noted.

## OBJECTIVE

A programmer new to Lugha opens Learn and starts at the beginning, not in the middle. They write their first program, learn the basics they need, and then reach what makes Lugha different: everything is a value, and sharing is something you ask for. Every step has real code they can run or fix, with real `lughac` output. In each chapter at least one step lets them make a real mistake and see `lughac` stop it, with the error's explanation.

The full path through the language is decided, so later chapters can be written one plan at a time without reopening the order.

## CONTEXT

- Read first: `CLAUDE.md`, `DECISIONS.md` (core decision 6, WEB-2, WEB-6, WEB-8, WEB-12, O6, O9), `PRPs/prp-002-web.md` (the content format and step kinds), and the approved lesson in `content/learn/01-values/01-everything-is-a-value/`.
- Relied on: `lughac spec` in the pinned sandbox image (`lugha-sandbox:m159`). I checked: `Ref<T>` ("the only value that copies share": `Ref.new`, `get`, `set`, `update`, `is`), `loop` with `break` values and labels, `defer`, `Map`/`Set` literals, `spawn`/`Chan`/`select`/`actor`. Every feature a step uses is checked against the spec again when the step is written.
- Changes: `content/learn/` only, plus the browser tests that name the first step. No change to `services/ui-web/src` or `services/api`.
- Decisions: this PRP resolves **O6**. It leaves **O7** (the rest of Home) and **O9** (a standard library page) open; neither blocks it.

### Discovery answers (2026-11-13)

1. **Audience:** programmers who are new to Lugha. Steps teach Lugha, not programming.
2. **Scope:** all of the core language. The standard library gets its own page later (O9). C interop, packages and networking are out: they can't run in the sandbox.
3. **Concurrency** (`spawn`, `Chan`, `select`, actors) is core, and is the last chapter.
4. **Structure:** eight chapters, ordered so that each one relies only on what came before. Types are introduced where they're first used, not in a chapter of their own.
5. **This PRP** fixes the whole outline and writes chapters 1 and 2. Each later chapter gets its own short PRP, and its lesson titles may still change then.
6. **Lessons:** the list below.
7. **Inside a lesson:** 3–5 steps, at least one of them a fix step; a quiz only where a likely misunderstanding needs checking; one idea per step, about 60–120 words of text.
8. **Writing:** Claude drafts one lesson at a time; the owner reviews it on the local site and approves it before the next is started. Nothing merges until every lesson in this PRP is approved.
9. **Voice:** the seven rules below, taken from the approved Values lesson. No added warmth or humour: plain, direct teaching.
10. **Keeping the voice:** a voice guide, an automatic check, a second reader, and the owner's edits turned into rules (all four). The guide, `docs/VOICE.md`, stays on the owner's machine and is never committed.
11. **Layout:** one sentence per line in every `step.md`.

## REQUIREMENTS

### Must Do

**The outline.** Chapter and lesson titles are as approved in the discovery. Lesson titles for chapters 3–8 may change in their own PRPs.

| # | Chapter | Lessons |
|---|---|---|
| 1 | **Basics** | Hello, Lugha · Names · Functions · Choosing and repeating · Text · A struct of your own |
| 2 | **Values** | Everything is a value · Sharing on purpose |
| 3 | Your own types | Methods · Changing a value · Enums carry data · Match · Option |
| 4 | Errors | Result · Passing errors on with `?` · Unwrap, expect and panic · Cleaning up with `defer` |
| 5 | Collections and iterators | Arrays · Maps and sets · Functions as values · Iterators |
| 6 | Generics and interfaces | Generic functions · Generic types · Interfaces · Equality and order · Operators on your own types |
| 7 | Modules and tests | A second file · Public and private · Tests |
| 8 | Concurrency | Spawn and join · Channels · Select · Actors |

**What each written lesson covers:**

- *Hello, Lugha:* `main`, `println`, pressing Run, and what an exit code is.
- *Names:* `let` and `let mut`, types the compiler works out, numbers; assigning to a `let` is the chapter's mistake that `lughac` stops (E0501).
- *Functions:* parameters and return types, a body that's one expression (`= …`), the last expression as the result.
- *Choosing and repeating:* `if` as a value, `while`, `for`, `loop` with `break` carrying a value.
- *Text:* strings, `{…}` interpolation, format widths such as `{x:.2}`.
- *A struct of your own:* declaring a struct, building one, reading its fields. This sets up chapter 2.
- *Everything is a value:* the approved five steps, unchanged.
- *Sharing on purpose:* `Ref<T>`: when two names should see one thing, `Ref.new`, `get`, `set`, and that a copy of a `Ref` shares its box.

**The voice.** Every step follows these, and each is illustrated in `docs/VOICE.md` with a quote from the approved lesson:

1. It talks to one person, as "you", in the present tense.
2. It points at real things on the screen: "On the right", "line 6", "Press Run", code in backticks.
3. It asks the learner to look or predict first, and gives the rule after they've seen it happen.
4. It gives the reason in one plain sentence.
5. It's short and plain: short paragraphs, everyday words, no exclamation marks, no headings or bullets inside a step, no announcing what's coming.
6. It answers the doubt a learner would actually have, once and honestly.
7. It never sells: no "powerful", "simply", "just", "easy", "elegant", no praise of Lugha. It shows Lugha doing something.

No warmth or humour is added: no jokes, puns, praise of the learner, or enthusiasm.

**Keeping the voice, for every lesson:**

1. Claude rereads `docs/VOICE.md` before drafting. It holds the rules, the quotes, what the owner has rejected (slogans, balanced "X. Y." lines, comparisons with other languages, humour), and every edit the owner has made, as before and after.
2. `services/ui-web/test/voice.test.ts` fails on what a rule can catch in any `step.md`: selling words, exclamation marks, emoji, headings or bullets, names of other languages, a sentence over 30 words, a step over 120 words of text.
3. A separate reviewer agent, given only `docs/VOICE.md` and the draft, flags every line that sounds machine-made or breaks a rule. Claude fixes those before the owner sees the lesson, and lists any it disagreed with.
4. When the owner changes a line, the before and after go into `docs/VOICE.md`.

**Rules for every step:**

- Every program is a real `.la` file run through `lughac` in the pinned sandbox image, with `expected.txt` holding what it printed. Never written from memory.
- A step uses only what earlier steps taught, or something a programmer can read without a lesson. A two-field struct is fine; a generic interface isn't.
- The text never compares Lugha with another language. It uses plain sentences and no slogans, and says no more than `lughac spec` does.
- A fix step's start is wrong in one way, and its solution is the smallest change that fixes it.
- `step.md` has one sentence per line; a blank line starts a paragraph. The approved lesson gets the same line breaks, with no word changed.

**Files.**

- `content/learn/01-values/` becomes `content/learn/02-values/`. Step ids drop the numbers (`values/everything-is-a-value/copies`), so URLs and saved progress don't change.
- New: `content/learn/01-basics/` with its six lessons, and `content/learn/02-values/02-sharing-on-purpose/`.

### Must NOT Do

- Change the approved lesson's text, code or ids.
- Change the site's code. Everything here is content. If a lesson needs something the site can't do (such as several files in a step), that's a separate change, raised first.
- Use a feature without checking `lughac spec`, or show output `lughac` didn't print.
- Write chapters 3–8.
- Teach the standard library beyond `println` and what the core needs. That belongs to O9.
- Commit `docs/VOICE.md`. It's ignored by git and stays on the owner's machine.
- Add warmth or humour.

## DESIGN

- **Progress:** the horizon measures all the steps in the course, so adding Basics moves the sun back for anyone who finished the Values lesson. Nothing is lost: their finished steps stay finished.
- **Where Learn starts:** Learn and "Start learning" go to the first step, which becomes `basics/hello-lugha/…`.
- **The mistake step in Basics:** in *Names*, assigning to a plain `let` gives E0501, which the site already explains from `lughac explain`. Values' step 2 shows the same error with a field. The two steps are meant to echo each other: same rule, now for a whole value.

## CONTENT

Every sentence a visitor reads is approved by the owner, one lesson at a time (discovery answer 8). Approved here: the chapter and lesson titles in the table above. Each lesson's step text, code, outputs and quiz go to the owner on the local site, and are recorded here as each one is approved.

**Approved:**

- **Hello, Lugha** (2026-11-13): Run it · Print any value · Choose the exit code, as in `content/learn/01-basics/01-hello-lugha/`. The owner retitled "Any value" to "Print any value", and asked for its prediction to be a real doubt.
- **Names** (2026-11-13): Name a value · Give a name a new value · Divide whole numbers · Convert a number with as, as in `content/learn/01-basics/02-names/`. The owner caught "On the right", which is wrong on a phone; every step now names the editor or a line instead, the approved Values lesson included (two phrases).
- **Functions** (2026-11-13): Declare a function · Remove the semicolon · Swap the braces for = · Change a parameter, as in `content/learn/01-basics/03-functions/`.

## TESTS

- [ ] `services/api/scripts/content`: every new step's `start` (and `solution`) runs in the sandbox and prints its `expected.txt`, or gives its declared `start_error`.
- [ ] `npm run build`: the content loads with no problems (titles, front matter, quizzes, marked lines).
- [ ] `npm test`: the bundle and loader tests still pass with two chapters.
- [ ] `npm test`: `voice.test.ts` passes on every step, the approved lesson included, and fails on a sample step with each thing it checks for.
- [ ] `npm run e2e`: the Learn tests (which name Values' steps) pass unchanged; a new test opens Learn from Home and lands on Basics' first step.

## ACCEPTANCE

- [ ] All 33 lesson titles are recorded in the outline; chapters 1 and 2 are written.
- [ ] Each of the eight lessons in chapters 1 and 2 has been approved by the owner, by eye, on the local site.
- [ ] At least one step in Basics lets the learner make a mistake that `lughac` stops.
- [ ] Every lesson went through the second reader before the owner saw it, and `docs/VOICE.md` holds every edit the owner made.
- [ ] O6 is moved to RESOLVED in DECISIONS.md with this outline.
- [ ] The full suite passes, including every lesson step run through `lughac`.
- [ ] For the owner, by eye: Learn from Home, all of Basics, then Values through Sharing on purpose, on a computer and on a phone.
