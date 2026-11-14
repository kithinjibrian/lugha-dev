---
title: Interfaces as bounds
---

With `T: Shape`, a generic function can call the interface's methods on a `T`.
`total` on line 11 adds up the areas in an array of any one type that is a `Shape`.
Only methods a bound declares can be called: `s.perimeter()` in `total` would be E0421, "no bound of `T` declares `perimeter`".
Press Run.
