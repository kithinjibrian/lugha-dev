---
title: Return checking
start_error: E0503
---

Now the `if`s on lines 2 and 5 each hold a `return`.
Every pair of numbers takes one of the two, so is that enough for a function that promises an `i64`?

It gives E0503, "`distance` may end without returning a value of type i64", with the help "end the body with a value, or `return` on every path".
An `if` without an `else` never counts as returning, whatever its condition, so `lughac` sees a way to reach the last `}` with nothing to give back.
An `if` with an `else` counts when both branches return, and a last expression needs no `return` at all:

```lugha {5}
fun distance(from: i64, to: i64): i64 {
    if to < from {
        return from - to;
    }
    to - from
}

fun main() {
    println(distance(3, 10));
    println(distance(10, 3));
}
```

Replace lines 5 to 7 with `to - from`, or press Solve.
