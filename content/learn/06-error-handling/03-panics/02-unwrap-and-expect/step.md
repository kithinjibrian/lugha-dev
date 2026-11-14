---
title: unwrap and expect
---

`unwrap` takes the value out of a `Some` or an `Ok`, and panics when there isn't one.
Line 2 unwraps `parse_i64("42")`, which is `Some(42)`, so `n` is `42`.
`parse_i64("forty")` is `None`, so `expect` on line 4 panics, with the message you gave it.
`unwrap` would have panicked there too, with `unwrap on None`, and on an `Err` its message includes the error.
Press Run.
