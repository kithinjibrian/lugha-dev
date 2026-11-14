---
title: Enum declaration
start_error: E0207
---

An enum is a type whose value is one of a list of variants.
`Shape` on lines 1 to 5 is a circle with a radius, a rectangle with a width and a height, or empty.
Each variant lists the types of the data it carries, if any.
Line 8 builds a circle with `Shape::Circle(2.0)`.

`lughac` stops at E0207, "`::` is not Lugha syntax".
A variant is built through its enum's name and a dot, as `Shape.Rect` is on line 9, and `Shape.Empty` on line 12 needs no parentheses:

```lugha {8}
enum Shape {
    Circle(f64),
    Rect(f64, f64),
    Empty,
}

fun main() {
    let wheel = Shape.Circle(2.0);
    let door = Shape.Rect(1.0, 2.0);
    println(wheel);
    println(door);
    println(Shape.Empty);
}
```

Change `::` to `.` on line 8, or press Solve.
