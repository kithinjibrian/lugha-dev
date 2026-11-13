---
title: Divide whole numbers
---

`width * height` worked in the first step because both sides were `i64`, and division follows the same rule.
Line 3 divides `total`, another `i64`, by 2.
What will it print?
Decide before you press Run.

It prints `3`.
If you said `3.5`, you were expecting dividing whole numbers to give a fraction.
Both sides of `/` are `i64`, so the result is an `i64` too.
Line 4 divides two `f64`s, which is how it gets `3.5`.
