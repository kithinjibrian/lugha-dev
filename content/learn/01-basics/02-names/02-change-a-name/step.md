---
title: Give a name a new value
start_error: E0501
error_note: Line 2 declared `count` with `let`, so line 3 can't assign to it.
---

Line 3 tries to add 1 to `count`, which line 2 made with a plain `let`.
Press Run.

A name made with `let` keeps the value it was given, so `count` needs `mut` before line 3 can change it:

```lugha {1}
    let mut count = 0;
    count = count + 1;
```

Add `mut` on line 2 and run again, or press Solve.
