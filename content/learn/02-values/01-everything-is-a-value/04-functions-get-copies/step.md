---
title: Functions get copies
start_output: "[5, 6]\n"
---

A function gets its own copy of every argument, too.
`add_one` pushes onto its copy and returns it.

Run it.
`xs` is still `[5, 6]`: line 9 calls `add_one` but throws away what it returns.

Make line 10 print `[5, 6, 1]` by keeping the result:

```lugha {2}
    let mut xs = [5, 6];
    xs = add_one(xs);
    println(xs);
```

A function can't reach back and change its caller's values.
It returns its results, and the caller decides what to keep.
