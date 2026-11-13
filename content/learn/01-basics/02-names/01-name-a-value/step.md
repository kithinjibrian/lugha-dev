---
title: Name a value
---

`let` gives a value a name.
A whole number takes its type from what's around it, so the `7` on line 2 and the `7` on line 3 are different types.
Line 2 asks for nothing, so its `7` is an `i64`, the default for a whole number.
Line 3 asks for a `u8`, a whole number from 0 to 255.
Press Run.

The `2` on line 4 becomes a `u8` as well, because `height` on the other side of the `*` is one.
So `doubled` is a `u8` holding `14`.
`lughac` refuses a whole number that doesn't fit its type, or that is asked to be an `f64`.
An `f64` takes a decimal point or an `as`.
