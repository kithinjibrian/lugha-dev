---
title: Returning from a loop
start_error: E0503
---

A loop can hide the same problem.
`first_over` doubles `n` until it passes `limit`, and returns it from inside a `while true` loop.
The condition is always true, so the loop can only end at the `return`.

`lughac` still gives E0503, "`first_over` may end without returning a value of type i64", because it never counts a `while` loop as returning, even `while true`.
As with the two `if`s in step 2, `lughac` doesn't look at the condition.
A `loop` that no `break` leaves does count, since the only way out is the `return`.
Write `loop` on line 3:

```lugha {3}
fun first_over(limit: i64): i64 {
    let mut n = 1;
    loop {
        n = n * 2;
        if n > limit {
            return n;
        }
    }
}

fun main() {
    println(first_over(100));
}
```
