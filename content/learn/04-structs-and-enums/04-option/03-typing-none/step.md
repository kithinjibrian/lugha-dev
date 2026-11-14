---
title: Typing None
start_error: E0412
---

`first_big` on line 2 will hold the first number over 6, if the loop finds one, so it starts as `None`.
Line 5 sets it to `Some(n)` once it does.

`lughac` stops at line 2 with E0412, "cannot infer the type of `None`".
As with an empty array, the type has to be known where `None` is written, and `lughac` doesn't look ahead to line 5 for it.
Write the type after a colon:

```lugha {2}
fun main() {
    let mut first_big: Option<i64> = None;
    for n of [3, 8, 5, 12] {
        if n > 6 {
            first_big = Some(n);
            break;
        }
    }
    println(first_big);
}
```

Add `: Option<i64>` on line 2, or press Solve.
