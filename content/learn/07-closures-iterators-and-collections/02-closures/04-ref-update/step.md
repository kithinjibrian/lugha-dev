---
title: Ref.update
---

`update` takes a function, and a closure can be written right there instead of a named one like `add_one`.
Line 3 triples what's in `total` with `fun(n) = n * 3`, and `n` takes its type from `update`'s parameter, a `fun(i64): i64`, as `x` did from `apply`'s.
Press Run.
