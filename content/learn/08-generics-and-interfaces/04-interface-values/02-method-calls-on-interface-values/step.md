---
title: Method calls on interface values
---

`s.area()` on a `Shape` runs the `area` of the type inside it.
The loop on lines 19 to 21 adds up `s.area()` for a circle and a square, each with its own `area`.
A `Shape` has only its methods, though: `shapes[0].r` would be E0410, "no field `r` on `Shape`".
Press Run.
