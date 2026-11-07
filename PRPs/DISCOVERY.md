# Discovery Interview Protocol

Use when a feature request arrives without a PRP.

## When to Run a Discovery Interview

Any time a feature is described in one or two sentences without specifying:
- What the visitor does and what appears on the page
- What data it needs, and where that data comes from (`api/`, content files, the browser)
- What the error and edge-case behaviour should be
- Which existing files it touches
- What it must not touch
- Which open decisions in DECISIONS.md are relevant

## Question Sequence

Ask one question at a time. Do not batch questions. Attach a recommended answer to every question. Wait for the answer before continuing.

Cover in order:
1. What does it do: what the visitor does, and what appears on the page
2. What data it needs, and what changes it
3. What happens when it fails: what the visitor sees on each failure path
4. Edge cases: empty states, invalid input, slow or failed requests, rapid repeated actions, very long code or output, phone width
5. Which existing files it reads from or writes to
6. What it must never modify
7. Which open entries in DECISIONS.md it depends on
8. Security: submitted code, external input, secrets, new dependencies
9. The copy: every sentence a visitor reads, for the owner to write or approve
10. How success is verified: tests, Lugha content run through `lughac`, and what the owner should check by eye

## After the Interview

Write the completed PRP to `PRPs/prp-{NNN}-{feature_name}.md` using the template.
Present it to the owner.
Wait for explicit approval before writing any code.
