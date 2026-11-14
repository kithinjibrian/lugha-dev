---
title: Generic structs
start_error: E0418
---

A struct can take a type parameter as a function does: `Pair<T>` on line 1 holds two values of one type, `T`.
Line 6 builds a pair of numbers and line 7 a pair of strings, and `T` comes from the fields, as it came from a function's arguments.
In a type, though, a generic struct is written with its argument, as in `Pair<i64>`.
Line 3 writes a bare `Pair` twice.
Press Run.

Both of line 3's `Pair`s are E0418, "`Pair` takes 1 type argument but 0 were given".
`swap_pair` is called with both pairs, so it has to be generic itself:

```lugha {3}
struct Pair<T> { left: T, right: T }

fun swap_pair<T>(p: Pair<T>): Pair<T> = Pair { left: p.right, right: p.left };

fun main() {
    let numbers = Pair { left: 1, right: 2 };
    let words = Pair { left: "tea", right: "milk" };
    println(swap_pair(numbers));
    println(swap_pair(words));
}
```

Add `<T>` after `swap_pair` and write `Pair<T>` in both places; Solve does it for you.
