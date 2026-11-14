---
title: Closures and recursion
start_error: E0301
---

A closure has no name of its own, so it can't call itself.
`fact` on line 2 is only the variable that will hold the closure, so the `fact(n - 1)` inside it refers to nothing.

`lughac` reports E0301, "cannot find `fact` in this scope".
A named function can call itself, so write `fact` as one:

```lugha {1}
fun fact(n: i64): i64 = if n <= 1 { 1 } else { n * fact(n - 1) };

fun main() {
    println(fact(5));
}
```

Turn the closure into a named function, or press Solve.
