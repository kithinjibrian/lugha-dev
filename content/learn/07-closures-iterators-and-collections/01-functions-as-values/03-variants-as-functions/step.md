---
title: Variants as functions
---

A variant that carries data is a function value too: `Shape.Circle` is a `fun(f64): Shape`.
Lines 15 and 16 pass `Shape.Circle` and `Shape.Square` to `apply_all` without calling them, and line 9 calls each one on a size.
`Some`, `Ok` and `Err` are values the same way, once their type is known, as `wrap`'s is on line 17.
A struct's associated function, such as `Point.new` from Methods, is a value too.
Press Run.
