---
title: Convert a number with as
start_error: E0401
error_note: "`total` is an `i64` and `2.0` is an `f64`."
---

So how do you get half of `total` as an `f64`?
Line 3 tries dividing it by `2.0`.
Press Run and read the error.

`lughac` found a float literal, `2.0`, where it expected an `i64`.
Both sides of `/` must have the same type, and `lughac` never turns `total` into an `f64` on its own, so you convert it yourself with `as`:

```lugha {2}
    let total = 7;
    let half = total as f64 / 2.0;
```

That change goes on line 3, and Solve makes the same edit.
A number never changes type without an `as`, so each one in your code marks a place where it does.
