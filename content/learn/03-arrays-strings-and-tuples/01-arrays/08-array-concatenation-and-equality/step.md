---
title: Array concatenation and equality
---

`+` on line 4 joins two arrays of the same type into a new one.
Line 6 compares the result with `==`.
Will `==` compare the elements, or ask whether both sides are the same array?

It prints `true`, because `==` compares arrays element by element, in order.
