---
title: Ok and Err
---

A function that can fail returns a `Result`, so its caller can tell whether it worked.
`divide` on line 1 returns a `Result<i64, string>`: an `i64` answer, or a `string` saying why there isn't one.
Line 3 returns that string in an `Err` for a zero divisor, and line 5 wraps the answer in `Ok`.
Like `Some`, `Ok` and `Err` are written without a prefix.
The type a variant doesn't name, such as the error type `string` for the `Ok` on line 5, comes from the return type.
Press Run.
