---
title: Struct literals in conditions
start_error: E0205
---

`==` compares two structs field by field.
Line 5 uses it to check whether `p` is the origin.
Since the parentheses around a condition are optional, will this `if` compile?

It doesn't: the `{` after `Point` could start the literal or the `if`'s block, so `lughac` gives E0205, "struct literal in a condition must be in parentheses".
Inside parentheses there's no doubt left:

```lugha {5}
struct Point { x: i64, y: i64 }

fun main() {
    let p = Point { x: 0, y: 0 };
    if p == (Point { x: 0, y: 0 }) {
        println("at the origin");
    }
}
```

Put the literal on line 5 in parentheses, or press Solve.
