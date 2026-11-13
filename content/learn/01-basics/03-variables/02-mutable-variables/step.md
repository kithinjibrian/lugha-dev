---
title: Mutable variables
start_error: E0501
---

Once `let` has named a value, can the name be given another?
Line 3 tries to add 1 to `count`.
Press Run.

It doesn't compile, and `lughac` reports E0501.
If you expected it to run, you were expecting `let` to declare a variable that can change.
In Lugha a variable keeps the value it was given unless it's declared `let mut`:

```lugha {2}
fun main() {
    let mut count = 0;
    count = count + 1;
    println(count);
}
```

Add `mut` on line 2 and run again.
