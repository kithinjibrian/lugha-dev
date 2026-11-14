---
title: Nested patterns
---

`describe` on line 7 takes an `Option<Shape>`.
In `Some(Circle(r))` on line 9, the data inside the `Some` is matched with a pattern of its own.
The arm matches only a `Some` holding a circle, and names its radius `r`.
The arms cover each shape inside a `Some`, and then `None`.
Line 18 pops the one circle from `shapes`, and line 19 pops again from the empty array.
Press Run.
