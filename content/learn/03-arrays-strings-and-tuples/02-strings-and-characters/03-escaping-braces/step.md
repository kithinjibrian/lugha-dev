---
title: Escaping braces
start_error: E0301
---

Since braces interpolate, printing a brace itself takes something else.
Line 2 means to print the text `{name}`, braces and all.
Every `{` in a string starts an interpolation, so `lughac` looks for a variable called `name` and gives E0301, "cannot find `name` in this scope".
Two braces in a row make one literal brace, `{{` for `{` and `}}` for `}`:

```lugha {2}
fun main() {
    println("write {{name}} to put a value in");
}
```

Double both braces on line 2, or press Solve.
