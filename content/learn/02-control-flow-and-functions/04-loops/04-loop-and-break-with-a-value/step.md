---
title: loop and break with a value
---

`loop` runs its block again and again until something leaves it, usually a `break`.
Like `if` and `match`, it's an expression, and `break n;` on line 6 ends it with `n` as its value.
Here it doubles `n` until it passes 100, so it prints `128`, the first number to do so.

A `while` or `for` can't give a value like this.
`break` with a value inside one is E0514 and won't compile, because those loops can also end without reaching a `break`.
