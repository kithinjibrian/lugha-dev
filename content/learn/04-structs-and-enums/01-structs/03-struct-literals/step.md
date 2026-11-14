---
title: Struct literals
start_error: E0413
---

`Point { x: 3, y: 4 }` is a struct literal, and line 4 now writes one with only `x`.
Will `y` start at `0`?

There's no default: `lughac` gives E0413, "missing field `y` in `Point`".
A struct literal gives every field a value, once, in any order:

```lugha {4}
struct Point { x: i64, y: i64 }

fun main() {
    let p = Point { x: 3, y: 0 };
    println(p);
}
```

Add `y: 0` on line 4.
