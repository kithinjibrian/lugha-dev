---
title: Custom iterators
start_error: E0205
---

Any type with a method `next(mut self): Option<T>` is an iterator, and `for … of` calls `next` until it gives `None`.
The `next` on lines 4 to 10 makes `Countdown` count down from `n`.
Line 14 loops over a new `Countdown`, written as a struct literal.
Press Run.

`lughac` stops at line 14 with E0205, "struct literal in a condition must be in parentheses".
A `for` header is read like an `if` condition, as in Struct literals in conditions.
Put the literal in parentheses:

```lugha {14}
struct Countdown { n: i64 }

impl Countdown {
    fun next(mut self): Option<i64> {
        if self.n == 0 {
            return None;
        }
        self.n -= 1;
        Some(self.n + 1)
    }
}

fun main() {
    for n of (Countdown { n: 3 }) {
        println(n);
    }
}
```

Wrap line 14's literal in parentheses, or press Solve.
