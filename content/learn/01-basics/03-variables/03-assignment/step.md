---
title: Assignment
start_error: E0204
---

Both `a` and `b` are `let mut` this time, and line 4 tries to set both to `0` in one go, with `a = b = 0`.
Will that work?

`lughac` refuses it with E0204, "assignment is a statement, not an expression".
An assignment is only ever a statement, with no value at all, so `b = 0` has nothing for `a` to take:

```lugha {4,5}
fun main() {
    let mut a = 1;
    let mut b = 2;
    a = 0;
    b = 0;
    println(a + b);
}
```

Split line 4 into two assignments, one per line.
