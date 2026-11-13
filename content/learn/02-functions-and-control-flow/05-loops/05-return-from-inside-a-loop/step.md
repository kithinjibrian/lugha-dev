---
title: Return from inside a loop
start_error: E0503
---

`first_over` doubles `n` until it passes `limit`, and returns it from inside a `while true` loop.
The condition is always true, so the loop can only end at the `return`.
Will `lughac` accept that the function always gives back an `i64`?

It gives E0503, "`first_over` may end without returning a value of type i64", because `lughac` never counts a `while` loop as returning, even `while true`.
A `loop` with no `break` in it does count, since the only way out is the `return`.
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
