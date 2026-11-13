---
title: for … of loops
start_error: E0201
---

Line 3 loops over `scores` with `for score in scores`.
`for … in` counted over a range in Loops, so will it go through an array too?

It doesn't: after `in`, `lughac` wants a range such as `0..3`, so it gives E0201, "expected `..`, found `{`".
`of` goes through an array, giving each element in turn:

```lugha {3}
fun main() {
    let scores = [70, 85, 90];
    for score of scores {
        println(score);
    }
}
```

Change `in` to `of` on line 3, or press Solve.
