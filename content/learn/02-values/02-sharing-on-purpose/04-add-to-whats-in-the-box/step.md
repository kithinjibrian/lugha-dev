---
title: Add to what's in the box
start_error: E0404
---

Line 3 tries to add `1` to `count`.
Press Run and read the error.

The error calls `count` a `Ref<i64>`, a box holding an `i64`.
`+` works on the number, not the box.
The help under the error is about comparing boxes, which line 3 doesn't do.
Get the number first: write `count.get() + 1` on line 3, or press Solve.
