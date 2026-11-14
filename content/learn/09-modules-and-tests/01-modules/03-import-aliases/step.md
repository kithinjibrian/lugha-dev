---
title: Import aliases
start_error: E0305
---

The name an import binds can be changed: `import shapes as geo;` on line 1 binds the module as `geo`, which is shorter to write.
Line 4 still writes `shapes.Square`.
Press Run.

That's E0305: with `as geo`, only `geo` is bound in this file, and `shapes` isn't.
The fixed `main.la`:

```lugha {4}
import shapes as geo;

fun main() {
    let s = geo.Square { side: 3.0 };
    println(geo.area(s));
}
```

Change `shapes.Square` to `geo.Square` on line 4, or press Solve.
