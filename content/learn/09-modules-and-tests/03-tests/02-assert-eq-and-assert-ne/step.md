---
title: assert_eq and assert_ne
start_failing: area_of_three
---

`assert` only says "assertion failed", so line 6 of `test/shapes_test.la` uses `assert_eq(a, b)` instead, which fails unless `a` and `b` are equal.
`assert_ne` on line 13 fails if they are equal.
When they fail, `assert_eq` prints both values, the first as left, and `assert_ne` the one they share.
Press Test.

`area_of_three` fails with "assert_eq failed: left 6.0, right 9.0": `area` gave 6.0, and the test expects 9.0.
Line 3 of `shapes.la` multiplies the side by 2.0 instead of by itself.
The fixed `shapes.la`:

```lugha {3}
struct Square { side: f64 }

fun area(s: Square): f64 = s.side * s.side;
```

Change `2.0` to `s.side` on line 3, or press Solve, and press Test again.
