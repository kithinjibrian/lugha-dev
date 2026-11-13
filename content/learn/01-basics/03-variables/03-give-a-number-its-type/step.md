---
title: Give a number its type
start_error: E0402
---

A whole number takes its type from what's around it.
Line 2 asks for nothing, so its `7` is an `i64`, the type a whole number gets when nothing decides, and a number with a `.` gets `f64`.
Line 3 asks for a `u8`, a whole number from 0 to 255, and line 4 multiplies `height` by `300`.
Press Run.

`lughac` refuses line 4 with E0402.
The `300` takes its type from `height` on the other side of the `*`, and `300` doesn't fit in a `u8`:

```lugha {4}
fun main() {
    let width = 7;
    let height: u8 = 7;
    let doubled = height * 30;
    println(width);
    println(doubled);
}
```

Change `300` to `30` and run again, or press Solve.
A whole number never turns into a float, though, so a float is always written with its `.`, as in `5.0`.
