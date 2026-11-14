---
title: Implementing an interface
start_error: E0422
---

A type meets an interface by having every one of its methods, with the same signatures.
`describe` on line 18 takes any `T: Shape`, and line 22 passes it a `Square`.
Press Run.

`lughac` gives E0422, "`Square` doesn't satisfy `Shape`", and its help names what's missing: no method `name`.
Give `Square` the method `Shape` lists:

```lugha {16}
interface Shape {
    fun area(self): f64;
    fun name(self): string;
}

struct Circle { r: f64 }
struct Square { side: f64 }

impl Circle {
    fun area(self): f64 = 3.14 * self.r * self.r;
    fun name(self): string = "circle";
}

impl Square {
    fun area(self): f64 = self.side * self.side;
    fun name(self): string = "square";
}

fun describe<T: Shape>(s: T): string = "{s.name()} of area {s.area()}";

fun main() {
    println(describe(Circle { r: 1.0 }));
    println(describe(Square { side: 2.0 }));
}
```

Add `name` to `Square`'s `impl` as line 16; Solve does it for you.
