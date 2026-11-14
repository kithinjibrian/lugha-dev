---
title: Struct update syntax
---

Another way to get a changed point is to build a new one from the old.
Line 5 writes `x` and ends with `..p`, which takes every field not written, here `y`, from `p`, the one way to leave fields unwritten.
Does that change `p`?

It doesn't: line 6 prints the new point, and line 7 prints `p` as it was.
`..p` has to come last, after the fields you write.
