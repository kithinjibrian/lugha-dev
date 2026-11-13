---
title: Destructuring with let
start_error: E0201
---

Instead of `.0` and `.1`, a `let` can give each element a name of its own.
Line 4 names both parts of `divmod(17, 7)` with `let mut (weeks, days)`, because line 5 adds a day.
Will one `mut` cover both names?

`lughac` gives E0201, "expected variable name, found `(`": `mut` can't go before the parentheses.
It goes inside them, before each name that will change, and here only `days` does:

```lugha {4}
fun divmod(a: i64, b: i64): (i64, i64) = (a / b, a % b);

fun main() {
    let (weeks, mut days) = divmod(17, 7);
    days += 1;
    println("{weeks} weeks and {days} days");
}
```

Move `mut` inside the parentheses on line 4, or press Solve.
