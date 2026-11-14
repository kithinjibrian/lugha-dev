---
title: Arrays of functions
---

Functions can sit in an array like any other value.
`steps` on line 6 holds three of them.
Its type, `(fun(i64): i64)[]`, needs the parentheses, because `fun(i64): i64[]` is a function that returns an array.
Line 9 calls each element as `step(n)`, in the array's order, and keeps the result in `n`.
Press Run.
