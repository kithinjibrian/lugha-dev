---
title: Matching on enums
start_error: E0417
---

To use a variant's data, `match` on the value.
In an arm, a variant is written without the enum's name.
Names in its parentheses take its data, so `Circle(r)` on line 9 gives the radius the name `r`.
`main` never passes an empty shape to `area`, and the `match` has no arm for `Empty`.

`lughac` refuses it with E0417, "non-exhaustive match: `Empty` not covered".
A `match` on an enum must cover every variant, whatever the program happens to pass it:

```lugha {11}
enum Shape {
    Circle(f64),
    Rect(f64, f64),
    Empty,
}

fun area(s: Shape): f64 {
    match s {
        Circle(r) => 3.14 * r * r,
        Rect(w, h) => w * h,
        Empty => 0.0,
    }
}

fun main() {
    println(area(Shape.Circle(2.0)));
    println(area(Shape.Rect(1.0, 2.0)));
}
```

Add the `Empty` arm as line 11.
