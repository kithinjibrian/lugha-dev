---
title: Assign in a statement of its own
start_error: E0204
---

Line 4 tries to set `a` and `b` to `0` in one go.
Press Run.

`lughac` refuses it with E0204.
If you expected it to run, you were expecting an assignment to give back the value it assigned.
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

Split line 4 into two and run again, or press Solve.
So in a block, only the last expression can give a value, and an assignment never can.
