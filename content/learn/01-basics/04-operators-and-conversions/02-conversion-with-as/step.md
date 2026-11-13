---
title: Conversion with as
start_error: E0401
---

So to get half of `total`, which is an `i64`, line 3 divides it by `2.0`.
Press Run.

`lughac` refuses it with E0401.
The `2.0` takes its type from `total` on the other side of the `/`, as the `300` did in the last lesson, and a float can't be an `i64`.
A whole number never becomes a float on its own, which is also why `let price: f64 = 5;` is refused and `5.0` isn't.
Write `total as f64` to turn `total` into a float before dividing:

```lugha {3}
fun main() {
    let total = 7;
    let half = total as f64 / 2.0;
    println(half);
}
```

Change line 3 and run again, or press Solve.
