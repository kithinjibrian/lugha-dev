---
title: Convert a number with as
start_error: E0401
error_note: "`total` is an `i64` and `2.0` is an `f64`."
---

Line 3 divides `total` by `2.0`, and `lughac` refuses it.
Press Run to see the error.

Both sides of `/` must be the same type, and nothing converts `total` for you.
Write `total as f64` on line 3, or press Solve.
