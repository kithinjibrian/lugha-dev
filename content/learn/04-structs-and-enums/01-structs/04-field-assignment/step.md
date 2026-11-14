---
title: Field assignment
start_error: E0501
---

Line 5 changes one field, `p.x = 5`.
`p` was declared with plain `let`, but can its fields still change?

E0501 names `p` itself: "cannot assign to `p`: it is not mutable".
A field has no `mut` of its own, so changing one changes the struct, and the variable that holds it needs `let mut`:

```lugha {4}
struct Point { x: i64, y: i64 }

fun main() {
    let mut p = Point { x: 3, y: 4 };
    p.x = 5;
    println(p);
}
```

Add `mut` on line 4.
