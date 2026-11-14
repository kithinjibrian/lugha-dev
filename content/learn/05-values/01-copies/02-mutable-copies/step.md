---
title: Mutable copies
start_error: E0501
---

This time `a` is declared `let mut`, and its copy `b` on line 5 has no `mut`.
Does `b` take its `mut` from `a`?
Press Run.

It doesn't, and E0501 says `b` is not mutable.
Your copy is its own value, so it needs its own `mut`, whatever `a` has:

```lugha {5}
struct Point { x: i64, y: i64 }

fun main() {
    let mut a = Point { x: 1, y: 2 };
    let mut b = a;
    b.x = 9;
    println(a);
    println(b);
}
```

Add `mut` on line 5 and run again, or press Solve.
