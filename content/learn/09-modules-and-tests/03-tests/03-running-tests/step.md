---
title: Running tests
start_failing: largest_of_none
---

`largest` in `shapes.la` should give the largest of an array of squares, or `None` for an empty one, and the test file checks both.
Press Test.

`largest_of_none` fails with a panic, "index out of bounds", but each test runs as its own process, so `largest_of_two` still passes after it.
The last line, "2 tests: 1 passed, 1 failed", counts the whole run.
Line 6 of `shapes.la` reads `squares[0]` before checking that there is one.
Run builds the program without its tests, so only Test runs them.
The fixed `shapes.la`:

```lugha {6,7,8}
struct Square { side: f64 }

fun area(s: Square): f64 = s.side * s.side;

fun largest(squares: Square[]): Option<Square> {
    if squares.len == 0 {
        return None;
    }
    let mut best = squares[0];
    for s of squares {
        if s.side > best.side {
            best = s;
        }
    }
    return Some(best);
}
```

Add the check for `squares.len == 0` at the top of `largest` and press Test again; Solve does the same.
