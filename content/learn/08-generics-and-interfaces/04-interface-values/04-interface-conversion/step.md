---
title: Interface conversion
start_error: E0403
---

The conversion in the first step happens to a value, never to an array or an `Option` around it.
`total` on line 16 takes a `Shape[]`, and line 20 passes `circles`, a `Circle[]`.
Press Run.

The call on line 20 is E0403, "expected Shape[], found Circle[]".
An array's type is fixed where it's built, so make `circles` a `Shape[]` there:

```lugha {19}
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

fun total(shapes: Shape[]): f64 = shapes.fold(0.0, fun(sum, s) = sum + s.area());

fun main() {
    let circles: Shape[] = [Circle { r: 1.0 }, Circle { r: 2.0 }];
    println(total(circles));
}
```

Add `: Shape[]` on line 19; Solve does it for you.
The bounded `total<T: Shape>` from Interfaces would take `circles` as it is, since its `T` can be `Circle`.
