---
title: Return early, and give a value on every path
start_error: E0503
---

`return` ends a function and gives back the value after it, as line 3 does when `to` is smaller.
Is that enough for a function that promises an `i64`?

`lughac` gives E0503, "`distance` may end without returning a value of type i64", with the help "end the body with a value, or `return` on every path".
An `if` without an `else` never counts as returning, whatever its condition, so `lughac` sees a way to reach the `}` with nothing to give back.
An `if` with an `else` counts when both branches return.
Here a last expression for the other case is enough, and `return to - from;` would work too:

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

Add line 5 and run again, or press Solve.
