## FEATURE: The website — Home, Learn, Examples and Playground, built from content files, with runnable code through the API

Status: **approved by the owner, 2026-11-08**, CONTENT included: the three rewrites without comparisons are approved as written, and the "If you know another language" notes are dropped.

## OBJECTIVE

A visitor opens the site, reads Lugha's line on Home, and can:
- **Learn:** work through a lesson in short steps, with the explanation on the left and real, editable code on the right that they Run, fix and Solve; their edits and progress are kept in their browser, and a sun moving along a horizon shows how far they are.
- **Examples:** read real programs explained piece by piece, run them, copy them, or open them in the Playground.
- **Playground:** write any Lugha, Run, Test and Format it, give it arguments and input, and share it as a link that carries the code.

Every program on the site is real, and every output came from `lughac`. Code runs through PRP-001's API; nothing compiles in the browser. The same content is published as a JSON bundle the Rapidkoi app can read later.

## CONTEXT

- Read first: `CLAUDE.md`, `DECISIONS.md` (core decisions 1–9), `docs/DESIGN.md`, `docs/ui/target/` (the target design, especially `Learn.dc.html`, `Examples.dc.html`, `Playground.dc.html`, `Main.dc.html`), `PRPs/prp-001-api.md` (the API's requests, responses and sentences).
- Creates `services/ui-web/` and `content/`; changes `docker-compose.yml` (Caddy built from the site's Dockerfile) and `deploy/Caddyfile` (serving `/content/v1/`).
- Relied on: the API's `/api/run`, `/api/test`, `/api/format`, `/api/version` (merged, PRP-001); `lughac explain` in `lugha-sandbox:m154`; the TextMate grammar `editors/vscode/syntaxes/lugha.tmLanguage.json` at lugha tag `m154`.
- Decisions: WEB-1 to WEB-12 below, recorded in DECISIONS.md with this PRP; they resolve O1. O6 (the course outline) and O7 (the rest of Home) stay open and don't block this PRP.

## REQUIREMENTS

### Must Do

**Stack (WEB-1).** Astro, generating static pages; the interactive parts are Svelte islands; the editor is CodeMirror 6; TypeScript throughout. Node 22, pinned, with a lockfile. Fonts (Bricolage Grotesque, Source Serif 4, JetBrains Mono) are self-hosted from the site, so no page asks a third party for anything.

**Pages.**

| Path | Page |
|---|---|
| `/` | Home: the headline, Start learning / Examples / Playground, and the `fib.la` card that really runs |
| `/learn` | Goes to the visitor's current step (or the first) |
| `/learn/<chapter>/<lesson>/<step>` | A step: text left; files, editor and output right; steps dots, Solve, Previous/Next, the horizon sun |
| `/examples` | Goes to the first example |
| `/examples/<slug>` | An example: index (with filter) left; title, intro, tags, code with notes beside it, run panel (stdin when the example has it), Copy code, Open in Playground |
| `/playground` | The playground; `#v1.…` opens a shared project |

Header on every page: the logo (to Home), Learn, Examples, Playground, GitHub. Dark only (core decision 5). Every page works at phone width.

**Content (WEB-2, WEB-3).** `content/` at the repository root is the single source:

```
content/
  learn/<NN-chapter>/chapter.toml                 title
  learn/<NN-chapter>/<NN-lesson>/lesson.toml      title
  learn/…/<NN-lesson>/<NN-step>/step.md           the step's text (and optional quiz)
  learn/…/<NN-step>/start/src/main.la             the code it opens with
  learn/…/<NN-step>/solution/src/main.la          after Solve, on steps with something to fix
  learn/…/<NN-step>/expected.txt                  what Run prints (of the solution when there is one)
  examples/<slug>/example.toml                    title, group, intro, tags, stdin
  examples/<slug>/src/main.la                     the program, notes as //: comments
  examples/<slug>/expected.txt
```

- A `.la` file is real, unchanged Lugha; `lugha.toml` is added as the API adds it.
- **Notes beside example code are `//:` comment lines** in the example's own `main.la` (WEB-3): each run of `//:` lines starts a new piece of code and is its note. The site removes them from the code it shows; the file runs as written.
- A step's quiz is a fenced block in `step.md` (question, options, the right one, a sentence per answer).
- The build checks content and fails on: a missing file, a step without code, an example without notes, `//:` notes with no code after them, an unknown key in a `.toml`.

**Content bundle (WEB-2).** The build also writes `/content/v1/index.json` (chapters, lessons, steps, examples), one JSON file per lesson and per example, and `/content/v1/explanations.json`. `v1` is in the path so the shape can change without breaking older readers (the Rapidkoi app).

**The workspace (one Svelte component, used by Learn and Playground).**
- Files (`src/main.la`, `lugha.toml`, and in the Playground, new files under `src/` and `test/`), the CodeMirror editor, Run (and in the Playground, `-O 0`/`-O 2`, Format, Test, Share, Download), and the output panel.
- Output panel tabs in the Playground: Output, Tests, Input (arguments for `args()`, stdin for `read_line()`).
- Every request goes to the API with exactly PRP-001's request shape.

**What's kept (WEB-4).** In the browser (`localStorage`) only: Learn keeps each step's edits (Reset returns to the start; Solve shows the solution; Reset undoes it); the Playground keeps one current project; Open in Playground copies code over, asking first if the Playground has unsaved work. Nothing is sent anywhere except the files of a Run, Test or Format.

**Share links (WEB-5).** `/playground#v1.<data>`: the project's files (with arguments and stdin when set) as JSON, compressed with the browser's `CompressionStream` (deflate-raw) and base64url-encoded. Never sent to a server. Above about 16 KB compressed, Share says "This project is too big to share as a link; use Download instead." Opening a link shows the code with "Opened from a link" and replaces the current project only after asking.

**Progress (WEB-6).** In the browser only. A step is done when the visitor has done what it asks: a fix step when its code compiles and exits 0; a reading step when they've Run it; a quiz step when they've chosen the right answer. The sun's position is done steps out of all steps; at 100% it sits behind the baobab and forms the logo. Nothing is locked. The course outline shows lessons with their step dots and "Start over" (after asking).

**Output panel (WEB-7).**

| Situation | Shows |
|---|---|
| Waiting | the Run button becomes a small sun with "Running…", disabled |
| Doesn't compile | the diagnostics, rebuilt from the API's JSON as `lughac` prints them (code, place, marked span, help), then the explanation |
| Stopped (time, memory) | the output so far, then the API's sentence |
| Output cut | "Its output was cut off at 64 KB." |
| 400 / 429 / 503 | the API's sentence, as sent |
| No answer in 60 s | "The server is busy. Try again in a moment." |
| Offline | "You're offline. Your code is saved here; run it when you're back." |

The code is never lost, and Run is available again at once.

**Explanations (WEB-8).** At build time, `lughac explain` runs for every code inside `lugha-sandbox:m154`; the texts go into the bundle. Under an error the panel shows the explanation's first paragraph and "More about E0501", which expands the full text in place. A step may give its own words for an error (in `step.md`); they show first.

**Highlighting (WEB-9).** Static code (lesson text, examples, Home): Shiki with the TextMate grammar copied at tag `m154` into `services/ui-web/grammar/`. The editor: a small CodeMirror tokenizer (keywords, types, numbers, strings with `{…}` interpolation, comments, attributes), whose keyword list a test checks against the grammar. Both use `docs/DESIGN.md`'s code colours.

**Build and serve (WEB-10).** `services/ui-web/Dockerfile`, built from the repository root:
1. `FROM lugha-sandbox:m154`: write every code's `lughac explain` text to JSON.
2. `FROM node:22`: `npm ci`, `astro build` (reads `content/`, the explanations and the grammar), giving `dist/` with the pages and `/content/v1/`.
3. `FROM caddy:2.8.4`: `dist/` and the Caddyfile copied in.

Compose's `caddy` service is built from it (no bind mount). Locally, `npm run dev` runs Astro's dev server with `/api/*` sent to `http://127.0.0.1:8080`.

**Scope of content (WEB-12).** Home's hero; the one lesson "Everything is a value" (five steps), numbered as chapter 1 until the outline (O6) exists; the five examples Hello world, Fibonacci, Word frequency, Green threads, An actor counter; the Playground opening with the shapes program. No "soon" entries anywhere.

### Must NOT Do
- Never compile or run Lugha in the browser, or show output that didn't come from `lughac` (the content checks enforce it).
- Never send code anywhere but the API on Run, Test or Format; never put code in a URL's path or query (only after `#`).
- No accounts, cookies, analytics or third-party requests (fonts and scripts are self-hosted).
- No text a visitor reads that isn't in CONTENT below, approved.
- No comparisons with other languages (CLAUDE.md, WRITING).
- No light mode, search, errors index or docs pages (core decision 5).
- No hardcoded colours, fonts or sizes: `docs/DESIGN.md`'s tokens, as CSS variables.

## DESIGN

**Layout** (every file ≤ 500 lines):

```
services/ui-web/
  package.json, package-lock.json, astro.config.mjs, tsconfig.json, Dockerfile
  grammar/lugha.tmLanguage.json    copied at lugha tag m154
  scripts/explanations.sh          stage 1: lughac explain → JSON
  src/
    pages/                         index, learn/[...step], examples/[slug], playground, content/v1/*
    layouts/Site.astro             header, fonts, tokens
    styles/tokens.css              docs/DESIGN.md as CSS variables
    content/                       loading and checking content/ (Astro content collections)
    lib/                           share.ts, progress.ts, diagnostics.ts, notes.ts (//:), api.ts, storage.ts
    editor/                        lugha.ts (the CodeMirror tokenizer), theme.ts
    components/                    Header, Horizon (the sun), Steps, Workspace/*.svelte, Output, Quiz, ExampleCode
  test/                            Vitest unit tests; e2e/ Playwright
content/                           at the repository root (above)
services/api/scripts/content       the content checks (below), beside scripts/hostile
```

**API client.** `lib/api.ts` sends PRP-001's requests and turns every response into one of the panel's states (WEB-7): a timeout of 65 s on the browser side (beyond Caddy's 60 s), `navigator.onLine` and a failed fetch for offline.

**Errors.** Each `lib` module returns typed results; nothing throws across a component. A failed `localStorage` (private windows) degrades to not keeping anything, with no message.

**Accessibility.** Real buttons and links, labels on every icon button, visible focus (the sun colour), the output panel announced politely (`aria-live`), text at 4.5:1, every target at least 44 px.

## CONTENT

Every sentence a visitor can read, for the owner to approve word for word. Code shown is real and has been run (2026-11-07). Items marked **[comparison]** mention other languages and need an explicit yes or a rewrite.

**Header and Home:** "lugha" · Learn · Examples · Playground · GitHub. Headline: "A language that doesn't get in your way, but still has your back." Buttons: Start learning · Examples · Playground. The card: `fib.la`, Run, "Press Run.", `$ lughac run fib.la`. Footer line: "lughac 0.1.0 · Lugha v17 · Free software, GPL-3.0" (version from `/api/version`).

**Learn, chapter 1 "Values", lesson "Everything is a value":**
1. *Copies.* "In Lugha, assigning a struct, an array or an enum gives you your own copy." / "On the right, `b` starts as a copy of `a`, and line 6 changes `b.x`. Press Run and look at what `a` prints." / "`a` still has `x: 1`. Changing `b` never touched it: they are two separate values."
2. *Your copy needs mut.* "This time `b` is declared without `mut`. Press Run." / "It doesn't compile. A `let` can't change unless it's declared `let mut`, and that includes changing one of its fields. Your copy is its own value, so it needs its own `mut`:" (snippet) / "Add `mut` on line 5 and run again, or press Solve." Its own words for E0501: "Only a `let mut` can change, even one field of it. Line 5 made `b` without `mut`, and line 6 changes it."
3. *Arrays are copied too.* "Arrays follow the same rule. `ys` starts as a copy of `xs`, and line 4 pushes onto `ys`." / "Before you run it, decide: what will line 5, `println(xs)`, print? Then press Run." / "If you said `[5, 6]`, you've got it. If you expected `[5, 6, 1]`, you were expecting `ys = xs` to give one array a second name." **[rewritten without the comparison; the prototype named JavaScript and Python]** / "Isn't copying slow? No: a copy shares the original's memory until one side writes to it, and only then is it really copied."
4. *Functions get copies.* "A function gets its own copy of every argument, too. `add_one` pushes onto its copy and returns it." / "Run it. `xs` is still `[5, 6]`: line 9 calls `add_one` but throws away what it returns." / "Make line 10 print `[5, 6, 1]` by keeping the result:" (snippet) / "A function can't reach back and change its caller's values. It returns its results, and the caller decides what to keep."
5. *Check yourself.* "One more, without running it first. On the right, `add_one` gets a copy of `xs`. What does line 10, `println(xs)`, print?" Options `[5, 6]` · `[5, 6, 1]` · "It doesn't compile". Answers: "Right. add_one changed its own copy and returned it as zs; xs is still [5, 6]." / "Not quite. add_one only changed its copy, which came back as zs." **[rewritten; the prototype said "That's what JavaScript or Python would print"]** / "Not quite. It compiles: add_one copies xs into a let mut before changing it." Then "Then press Run to check." and "See it in a real program: Word frequency".

**Examples** (intro, then the notes in order):
- *Hello, world* (Basics): "The smallest Lugha program: one function, one line of output." Notes: "Every program starts at `main`. Without a return type, it exits with code 0 when it ends." / "`println` prints a value and a newline."
- *Fibonacci* (Basics): "The classic recursive Fibonacci: the same function Lugha's own benchmarks time." **[rewritten; the prototype named C, Rust and Go]** Notes: "A function whose body is one expression can use `=`. `if` is an expression too, so its branches give the result directly." / "`main` can return an `i32`: the program's exit code. Its last expression, `0`, is the value it returns."
- *Word frequency* (Text): "Read text from standard input, count every word, and print the five most common. A map, a sort and some format specifiers do all the work." Notes: the six in `docs/ui/target/Examples.dc.html`, unchanged.
- *Green threads* (Concurrency): "Run two calls at the same time and add up their results, with no async and no await." Notes: "An ordinary function. Nothing marks it as concurrent." / "`spawn` starts a call on its own green thread and hands back a handle straight away." / "`join` waits for a thread and gives back its result. Every function stays an ordinary function."
- *An actor counter* (Concurrency): "State that one green thread owns. Other code talks to it by calling its methods, which become messages." Notes: the three in the target design, unchanged.

**Interface:** Run · Running… · Reset · Solve · Previous · Next · Step N of M · Course outline · Start over ("Start the course over? Your progress will be cleared.") · Files · Output · Tests · Input · Arguments ("Passed after `--`; read them with `args()`.") · Standard input ("What `read_line()` reads, one line at a time.") · Format · Test · Share · Download · New ("Start a new project? The current one will be replaced.") · Copy code / Copied · Open in Playground ("Replace your Playground project with this code?") · Filter examples · "Press Run." · "Exited with code N" · "More about EXXXX" · "Opened from a link" · "Link copied." · "This project is too big to share as a link; use Download instead." · "Edit this lesson on GitHub".

**Output panel:** the API's sentences (PRP-001, approved); "The server is busy. Try again in a moment." (approved); "You're offline. Your code is saved here; run it when you're back." (approved in discovery).

## TESTS

In three layers (WEB-11). Unit (Vitest):
- [ ] Share links: round trip of files, args and stdin; `v1.` prefix; an unknown version refused; the 16 KB limit; a corrupt link refused with no crash.
- [ ] Progress: each kind of step's "done" rule; the sun's position; Start over.
- [ ] Content: reading each file kind; `//:` notes split from code (several lines, none, notes with no code after); every build-failure check.
- [ ] Diagnostics: the E0501 JSON rebuilt exactly as `lughac` prints it.
- [ ] The tokenizer: keywords, types, numbers, strings with interpolation, comments, `@test`; its keywords equal the grammar's.
- [ ] The API client: each response and failure maps to its panel state.

Content (`services/api/scripts/content`, one at a time, against the real sandbox):
- [ ] Every step's start code, and its solution where there is one, prints exactly its `expected.txt` (for a fix step, the start code gives its expected error code instead).
- [ ] Every example (with its stdin) prints exactly its `expected.txt`.

Browser (Playwright, against the running stack):
- [ ] A Learn step: Run shows the output; the step counts as done; the sun moves.
- [ ] Step 2: Run shows E0501 and its explanation; Solve, Run shows the output.
- [ ] Share: the link opens the same code in a fresh browser.
- [ ] With the API stopped, Run shows the service sentence and the code is still there.
- [ ] axe finds no violations on Home, a step, an example and the Playground.

## ACCEPTANCE
- [ ] `npm test`, `npm run build` and `npm run check` (types) pass in `services/ui-web`; the content checks and Playwright pass against the stack.
- [ ] `docker compose --profile sandbox build` builds the site into Caddy; `docker compose up -d` serves it at `http://127.0.0.1:8080` with `/content/v1/index.json`.
- [x] Every sentence in CONTENT is approved by the owner (2026-11-08).
- [ ] For the owner, by eye: Home, the five steps (fix step 2 by hand and with Solve; see the sun move), an example's notes beside its code, the Playground's Share link in another browser, and all of it at phone width.
