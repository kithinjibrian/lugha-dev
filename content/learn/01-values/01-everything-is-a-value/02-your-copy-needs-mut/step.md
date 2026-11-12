---
title: Your copy needs mut
start_error: E0501
error_note: Only a `let mut` can change, even one field of it. Line 5 made `b` without `mut`, and line 6 changes it.
---

This time `b` is declared without `mut`. Press Run.

It doesn't compile. A `let` can't change unless it's declared `let mut`, and that includes changing one of its fields. Your copy is its own value, so it needs its own `mut`:

```lugha {2}
    let a = Point { x: 1, y: 2 };
    let mut b = a;
    b.x = 9;
```

Add `mut` on line 5 and run again, or press Solve.
