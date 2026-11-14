---
title: filter
---

`filter` also takes a closure, one that returns a `bool`, and keeps the elements for which it's `true`, in order, in a new array.
Line 3 keeps the even numbers.
`filter` and `map` both give back arrays, so one can follow the other: line 5 keeps the evens, then squares them.
