---
title: private
start_error: E0313
---

`private` in front of an item keeps it inside its own module.
In `shapes.la`, line 7 declares `square` as `private`, and `area` on line 3 uses it there.
Line 6 of `main.la` calls `shapes.square`.
Press Run.

That's E0313, "`square` is private to module `shapes`".
`main.la` is another module, so it can't reach `square`, but it can call `area`, which calls `square` from inside `shapes`.
The fixed `main.la`:

```lugha {6}
import shapes;

fun main() {
    let s = shapes.Square { side: 3.0 };
    println(shapes.describe(s));
    println(shapes.area(s));
}
```

Change line 6 to call `shapes.area(s)`, or press Solve.
