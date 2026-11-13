---
title: Divide whole numbers
---

In the first step, the `2` in `height * 2` took its type from `height`, and division works the same way.
`total` on line 2 is an `i64`, so the `2` on line 3 is an `i64` too.
What will `total / 2` print?
Decide before you press Run.

It prints `3`.
If you said `3.5`, you were expecting dividing whole numbers to give a fraction.
Both sides of `/` are `i64`, so the result is also an `i64`.
Line 4 divides two `f64`s, which is how it gets `3.5`.
