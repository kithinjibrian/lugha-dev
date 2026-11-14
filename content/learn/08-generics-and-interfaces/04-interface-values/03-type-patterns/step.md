---
title: Type patterns
start_error: E0417
---

To reach the value inside a `Shape`, `match` on its type.
`c: Circle` on line 18 matches when `s` holds a `Circle`, and names it `c`, a `Circle` with its fields.
`_: Square` on line 19 matches a square without naming it, since its arm doesn't need it.
Press Run.

`lughac` stops at line 17 with E0417, "non-exhaustive match: `_` not covered".
Any type that meets `Shape` could be inside, even one written later, so the `match` needs a `_` arm even with an arm for each type here:

```lugha {20}
interface Shape {
    fun area(self): f64;
}

struct Circle { r: f64 }
struct Square { side: f64 }

impl Circle {
    fun area(self): f64 = 3.0 * self.r * self.r;
}

impl Square {
    fun area(self): f64 = self.side * self.side;
}

fun kind(s: Shape): string {
    match s {
        c: Circle => "a circle of radius {c.r}",
        _: Square => "a square",
        _ => "something else",
    }
}

fun main() {
    println(kind(Circle { r: 2.0 }));
    println(kind(Square { side: 1.0 }));
}
```

Add the `_` arm as line 20; Solve does it for you.
