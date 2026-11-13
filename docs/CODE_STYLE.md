# Code Style — lugha-dev

How lugha-dev's code is written and commented: TypeScript, Svelte and Astro in `services/ui-web`,
Lugha in `services/api`, and the shell, Docker, compose, Caddy and workflow files around them.
Read this before writing any function, type, component or script.

Formatting follows the file's neighbours. `npm run check` must pass with no errors or warnings, and
`services/ui-web/test/comments.test.ts` fails on any comment that names history or a document.

---

## What a comment is for

A comment says what the code can't: what an item is for, and why a line is the way it is. It is
read long after the conversation that produced it, by someone who has only the code. So it stands
on its own:

- **No history.** Never name a PRP, a decision id (`API-7`, `WEB-4`, `O8`), a milestone, a session
  or who asked for something ("the owner"). DECISIONS.md and git record how the code got here; the
  comment says why it is right now.
- **No documents.** Never point at a `.md` file. If a rule from a spec or DESIGN.md matters here,
  state the rule. Documents may point at code; code never points at documents.
- **No pinned versions in prose.** A comment doesn't say "copied at m159" or "lughac m154's
  output": the version lives in one place (`LUGHAC_REF`) and a comment that repeats it goes stale.
- **Full sentences.** Plain words, nothing dropped to save space.
- **Delete rather than repeat.** A comment that says what the next line says is removed, not
  reworded.

---

## Doc comments (what this is)

`/** … */` in TypeScript and Lugha, a leading `#` block in shell, YAML and Dockerfiles. Every
exported function, type and constant gets one; private helpers only when their purpose isn't
obvious.

Start with one sentence saying what the item is or does, from the caller's side, starting with a
verb: "Runs", "Reads", "Gives". Add more only for what a caller needs:

- **Units**, every time: milliseconds, bytes, characters.
- **Errors:** for a `Result`, every error kind and when it comes back.
- **Surprises:** anything the name and type don't suggest.

```ts
/**
 * Sends a project to one of the API's routes and gives back its JSON.
 *
 * Errors: `refused` with the API's own sentence for a 4xx or 5xx that carries one; `busy` when
 * nothing answers within `timeoutMs` or the answer isn't the API's JSON; `offline` when the browser
 * says so or the request can't be sent.
 */
```

---

## Inline comments (why this is)

Inline comments explain decisions, not code. Put the comment above the line it explains, never
trailing.

Comment when:
- a number appears whose value isn't self-explanatory,
- a library is used in a way that isn't obvious,
- a guard prevents a bug that isn't obvious,
- the code works around something missing upstream.

A workaround names what's missing and where: `` // `lughac` has no X yet, so … ``. That is how it's
found and removed once the gap is fixed.

**Good:**

```ts
// Longer than Caddy's 60 s, so Caddy's own answer arrives first when it can.
export const TIMEOUT_MS = 65_000;
```

**Bad:**

```ts
// 65 s timeout (PRP-002, WEB-7)
export const TIMEOUT_MS = 65_000;
```

The bad one says what the line does and where it was decided; it never says why.

---

## File headers

Every file starts with a comment saying what it is responsible for, and what it isn't. In a Svelte
or Astro component it is the first comment in the script block.

```ts
// Turns the API's JSON into the output panel's states. Doesn't send anything: that's `api`.
```

Don't list imports or importers: the imports and a search already say that, and a list goes stale.

---

## Pointing at other code

A comment may name another module, function or component when that's where the rest of the story
lives, in backticks as code names it: `` `lib/api` ``, `` `server.sandbox` ``, `` `Workspace` ``.
Configuration files may name the file that uses them (`deploy/update.sh`), since that is how
they're found. Never use pointers to list who calls what.

---

## Errors

Expected failures are values; bugs throw.

- **`Result`** (`lib/result` in TypeScript, `Result` in Lugha) for anything that comes from outside
  or depends on the data: the API's answers, stored data, content files, submitted code. Nothing
  throws across a component.
- **Throw or panic** for a broken invariant and for build-time failures such as bad content. These
  are bugs and fail loudly.
- **Third-party exceptions** are caught where the library is called and become a `Result`.

---

## Size

Files stay at or under 500 lines, tests included. At the limit, propose a split by responsibility
and wait for approval.

---

## TODOs

Don't leave them. Work that isn't done goes in the Deferred section of DECISIONS.md.

---

## Anti-patterns

1. **Describing the code.** The code is the description.
2. **History.** PRPs, decision ids, milestones, sessions, "the owner".
3. **References to documents.** Any `.md` file.
4. **Stale comments.** Change the comment in the same edit as the code.
5. **Over-documenting.** Obvious helpers need no comment; most items need one sentence.
6. **Under-documenting the error contract.** Every `Result` names its error kinds.
