---
title: Passing by value
start_output: [5, 6]\n
---

Function arguments follow the same rule.
`add_one` can't change its parameter, so line 2 copies `xs` into `ys`, and it pushes onto that and returns it.
Line 9 calls `add_one` but throws away what it returns, so line 10 prints `xs` as it was, `[5, 6]`.

Make line 10 print `[5, 6, 1]` by keeping the result:

```lugha {9}
fun add_one(xs: i64[]): i64[] {
    let mut ys = xs;
    ys.push(1);
    ys
}

fun main() {
    let mut xs = [5, 6];
    xs = add_one(xs);
    println(xs);
}
```

Change line 9 and run again, or press Solve.
A function can't reach back and change its caller's values.
It returns its results, and the caller decides what to keep.
