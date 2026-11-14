---
title: Generic impl blocks
---

Methods for a generic type go in an `impl` block that names its parameter, as `impl Stack<T>` on line 3 does.
There `T` stands for the element type, and `Self` for `Stack<T>`.
Line 23's `Stack<i64>` fills in `T` for `Stack.new()`, as `: string[]` did for `empty`.
A second block can add a bound: `total`, in `impl Stack<T: Num>` on line 18, exists only for stacks of numbers.
Its `0` is a `T`, as `Num` allows.
Calling it on `words` would be E0419, "`string` doesn't satisfy `Num`".
Press Run.
