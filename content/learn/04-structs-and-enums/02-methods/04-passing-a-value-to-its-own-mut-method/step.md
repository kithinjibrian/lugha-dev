---
title: Passing a value to its own mut method
start_error: E0508
---

`add` on line 4 adds another point to `self`, and line 12 tries to add `p` to itself.

`lughac` refuses it with E0508, "cannot pass `p` to a `mut self` method called on `p`".
A `mut self` method works on `p` in place, and during the call `other` would be read from that same `p`.
`add` could then change `other` while it's still reading it, so `lughac` doesn't allow it.
`let copy = p;` makes a separate copy, and passing that is fine:

```lugha {12,13}
struct Point { x: i64, y: i64 }

impl Point {
    fun add(mut self, other: Point) {
        self.x += other.x;
        self.y += other.y;
    }
}

fun main() {
    let mut p = Point { x: 3, y: 4 };
    let copy = p;
    p.add(copy);
    println(p);
}
```

Split line 12 into the copy and the call, or press Solve.
