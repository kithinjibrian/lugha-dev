---
title: Interface values
start_error: E0403
---

With `T: Shape`, an array holds one type that meets `Shape`.
An interface is also a type, and a `Shape` value can hold a value of any type that meets it.
Line 17 puts a circle and a square in one array.
Press Run.

`lughac` stops at line 17 with E0403, "expected Circle, found Square": the array takes its type from its first element.
A value becomes a `Shape` only where a `Shape` is expected, so write the array's type:

```lugha {17}
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

fun main() {
    let shapes: Shape[] = [Circle { r: 1.0 }, Square { side: 2.0 }];
    println(shapes);
}
```

Add `: Shape[]` after `shapes` on line 17; Solve does it for you.
