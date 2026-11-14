---
title: Associated functions and Self
---

A function in an `impl` without `self` is an associated function.
It belongs to the type rather than a value, and is called on the type's name, as `Point.new(3, 4)` on line 10.
`new` here builds a `Point` from its two fields.
Inside the `impl`, `Self` stands for `Point`, both as a type and before a struct literal, as on line 4.
`origin` on line 6 calls `new` the same way, as `Self.new(0, 0)`.
