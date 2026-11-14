## FEATURE: Lesson steps with several files, and steps whose tests the learner runs, for chapter 9 (Modules and tests)

Status: **approved by the owner, 2026-11-14.** From the discovery of 2026-11-14; every answer was the recommended option.

## OBJECTIVE

A learner on a chapter 9 step sees every file of a small project in the file list (`src/main.la` open first, then the other `.la` files, then `lugha.toml`), edits any of them, and presses Run as before. On a step about tests, Test sits beside Run and the Tests tab shows each test passing or failing; the step counts as done when they all pass. Solve and Reset change every file at once, and the learner's edits to every file are kept. Steps with only `main.la` work exactly as now.

## CONTEXT

- Read first: `services/ui-web/src/content/load.ts` (reads `start/src/main.la` and `solution/src/main.la` only), `services/ui-web/src/components/learn/LearnStep.svelte` (builds a one-file project with `projectOf`), `services/ui-web/src/components/workspace/Workspace.svelte` and `Files.svelte` (already show several files, and the Tests tab in Playground mode), `services/ui-web/src/lib/kept.ts` (keeps a step's edits as one string), `services/api/test/content.la` (checks every step through the sandbox, as `src/main.la` only).
- The API already takes what this needs (API-3): up to 20 files under `src/` and `test/`, and `POST /api/test` (the `test` job). Nothing in `services/api/src` or the sandbox changes.
- Decisions: WEB-4 (Learn keeps each step's edits in the browser) holds, extended to every file. No open decision is involved.

### Discovery answers (2026-11-14)

1. **Storage:** a step's `start/` and `solution/` each hold a whole small project: every `.la` file under `src/`, and under `test/` for test steps. The file list shows them all, `src/main.la` first. Solve and Reset replace every file. One-file steps are unchanged.
2. **Test steps:** a step whose files include `test/` shows Test beside Run and the Tests tab. It is done when every test passes. The content check runs the tests in the sandbox: the solution's all pass, and a fix step's start fails the way the step says.
3. **Rules and kept edits:** the build fails unless `start/` has `src/main.la`; files are only `src/*.la` and `test/*.la`; at most 20 files; a fix step's `solution/` has the same file names as its `start/`. A step is a test step exactly when it has `test/` files. The browser keeps the learner's edits for every file; Reset puts all of them back; Solve replaces all of them.

## REQUIREMENTS

### Must Do

- **Loader** (`load.ts`): a step's files are read from `start/` and `solution/` recursively, as `{ path, text }` with paths like `src/shapes.la`. New problems, each a sentence naming the folder: no `src/main.la`; a file outside `src/*.la` and `test/*.la`; more than 20 files; a fix step whose `solution/` file names differ from `start/`'s. `Step` gains `files` (the start's) and `solutionFiles` (or `null`), and `tests: boolean`; `start` and `solution` stay as `main.la`'s text so the bundle and today's code keep working.
- **Front matter:** a fix test step says how its start fails with the existing `start_error` (it doesn't compile) or a new `start_failing: name, name` (these tests fail). `start_failing` without test files is a build error.
- **Learn** (`LearnStep.svelte`): the project is the step's files plus `lugha.toml`. Kept edits store the whole project for multi-file steps (`kept.stepFiles`/`setStepFiles`), and a one-file step's stored string is still read as before, so nobody loses work.
- **Test steps:** Learn's workspace shows Test and the Tests tab when `step.tests`; the step is marked done when a Test run reports every test passing (Run alone never marks it done).
- **Content check** (`services/api/test/content.la`): runs a step with all its files. A test step's solution goes through the `test` job and must report every test passing; a fix test step's start must give its `start_error`, or fail exactly the tests in `start_failing`. One-file steps are checked as now.
- **Bundle** (`/content/v1/`): a lesson's steps carry `files`, `solutionFiles` and `tests`, so `services/ui-rk` can show them.
- **Converter** (scratchpad tool, not shipped): a draft's code blocks may be headed by a file path (`src/shapes.la:`), written to that path under `start/` or `solution/`.

### Must NOT Do

- No change to `services/api/src`, the sandbox, or the API's limits (security-sensitive; nothing here needs it).
- No new copy beyond what the Playground already uses (Test, the Tests tab and its texts).
- No change to how one-file steps look, load, keep edits or are checked.
- No new dependency.

## DESIGN

- A test step's expected output: `expected.txt` holds what Run prints, as now (the step may still have a `main`); passing tests are what mark it done.
- File order in the list: `src/main.la`, then other `src/` files by name, then `test/` files by name, then `lugha.toml` (as `Files.svelte` already groups `src/` first).
- Security: content is written by the owner or Claude and runs through the same API and sandbox as a visitor's code; files and limits are the ones API-3 already allows.

## CONTENT

No new visitor copy. The first steps that use this are chapter 9's lessons, each drafted and approved as before.

## TESTS

- [ ] `load.test.ts`: a multi-file step loads with its files in order; each new problem fails the build with its sentence (no `src/main.la`, a path outside `src/` and `test/`, 21 files, solution names differing, `start_failing` without tests); a one-file step loads exactly as before.
- [ ] `kept.test.ts`: multi-file edits round-trip; an old one-string entry still reads; Reset clears both.
- [ ] `bundle.test.ts`: `files`, `solutionFiles`, `tests` in a lesson's JSON.
- [ ] `services/api/test/content.la`: runs on every step, chapter 9's included, once they exist.
- [ ] e2e (with chapter 9's first lesson): a multi-file step shows its files, Run works across files, Solve and Reset change every file; a test step shows Test, and passing tests mark it done.

## ACCEPTANCE

- [ ] A step folder with several files under `start/src` (and `test/`) shows them all in Learn and runs.
- [ ] A test step's Test button runs its tests, and all passing marks it done.
- [ ] One-file steps are unchanged, and kept edits from before still load.
- [ ] The full suite passes, including every lesson step and example run through `lughac`.
- [ ] For the owner, by eye: chapter 9's first step on the local site, on a laptop and at phone width.
