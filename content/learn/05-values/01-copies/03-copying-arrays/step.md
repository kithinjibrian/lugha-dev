---
title: Copying arrays
---

Arrays follow the same rule.
`ys` on line 3 starts as a copy of `xs`, and line 4 pushes onto `ys`.
What will line 5, `println(xs)`, print?
Press Run.

It prints `[5, 6]`, because `ys = xs` gave `ys` an array of its own, not a second name for the one in `xs`.
