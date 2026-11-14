---
title: Variants and bindings
start_output: an empty shape\n
---

Line 17 describes a circle, but the program prints `an empty shape`.
`Emtpy` on line 9 is misspelled, and a name inside a pattern that isn't a variant becomes a binding.
A binding matches any shape in a `Some`, and line 9 comes first, so every shape stops there.
`lughac` warns about it with W0103, "unused binding `Emtpy`", and marks lines 10 and 11 unreachable with W0102.
At the top of a `match` on `Shape`, a misspelled name can only be a variant, and so can one with data after it, as in `Cirle(r)`.
Either way it's E0415, "no variant … on `Shape`".

```lugha {9}
enum Shape {
    Circle(f64),
    Rect(f64, f64),
    Empty,
}

fun describe(s: Option<Shape>): string {
    match s {
        Some(Empty) => "an empty shape",
        Some(Circle(r)) => "a circle of radius {r}",
        Some(Rect(w, h)) => "a {w} by {h} rectangle",
        None => "nothing",
    }
}

fun main() {
    println(describe(Some(Shape.Circle(1.5))));
}
```

Change `Emtpy` to `Empty` on line 9, or press Solve.
