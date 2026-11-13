---
title: Print a float
---

Numbers with a fraction are floats, and they come in two types, `f32` and `f64`.
Line 2 prints `2.0`.
Will it come out as `2` or as `2.0`?

It prints `2.0`.
If you expected `2`, you were expecting a float with nothing after its point to print like a whole number.
A float always prints with its point, so you can tell the two apart.
Line 3 is written out in full and prints as `1.0e16`, because from `1e16` up a float prints with an exponent.
Line 4 is the last kind of number-like value, a `bool`, which is `true` or `false`.
