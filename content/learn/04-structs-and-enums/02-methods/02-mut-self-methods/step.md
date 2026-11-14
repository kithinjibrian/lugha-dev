---
title: mut self methods
start_error: E0501
---

`self` is read-only, like any parameter, so a method that changes the value it's called on takes `mut self` instead, as `shift` does on line 4.
Line 11 calls `shift` on `p`, and `p` has no `mut`.
Will the call go through, since `shift` already takes `mut self`?

It does: E0501, "cannot call `mut self` method `shift` on `p`: it is not mutable".
A `mut self` method changes the caller's own value, so `p` needs `let mut`, as it did for field assignment:

```lugha {10}
struct Point { x: i64, y: i64 }

impl Point {
    fun shift(mut self, dx: i64) {
        self.x += dx;
    }
}

fun main() {
    let mut p = Point { x: 3, y: 4 };
    p.shift(10);
    println(p);
}
```

Add `mut` on line 10.
