---
title: Mixed operands
---

`mul` can be written more than once, each time for another type of second operand.
The one on line 4 takes an `f64`, so `v * 2.0` scales the vector.
The one on line 5 takes a `Vec2`, so `v * v` gives a number.
The second operand picks one by its exact type, so `v * 2` would be E0401: `2` is an integer.
For a number before `*`, the `impl f64` on line 8, with a `mul` that takes a `Vec2`, makes `2.0 * v` work too.
The methods can be called by name as well, and `v.mul(2.0)` on line 17 picks the same one `v * 2.0` does.
Press Run.
