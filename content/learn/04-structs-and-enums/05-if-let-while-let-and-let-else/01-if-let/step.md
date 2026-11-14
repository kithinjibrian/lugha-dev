---
title: if let
---

A `match` with only one case worth handling can be written as an `if let`.
Line 3 tests one pattern, `Some(n)`, against what `parse_i64` gives back.
When it matches, the block runs with `n` in scope, and otherwise the `else` block on line 5 runs.
There's no `None` arm to write, because an `if let` doesn't have to cover every case.
The `else` is optional, and without it nothing runs when the pattern doesn't match.
Press Run.
