---
title: Type bounds
start_error: E0404
---

`first` only passed its `T` along, which any type allows, but `count_of` compares two `T`s with `==` on line 4.
Press Run.

`lughac` stops at line 4 with E0404, "cannot apply `==` to T", and its help gives the fix: declare `T: Eq`.
A bound says what `T` must support, `Eq` for `==` and `Ord` for `<`, so this one needs `T: Eq`:

```lugha {1}
fun count_of<T: Eq>(xs: T[], wanted: T): i64 {
    let mut n = 0;
    for x of xs {
        if x == wanted {
            n += 1;
        }
    }
    n
}

fun main() {
    println(count_of([1, 2, 1], 1));
    println(count_of(["a", "b"], "c"));
}
```

Add `: Eq` after `T` on line 1, or press Solve.
`Ord` doesn't bring `==` with it, so a function that uses both declares `T: Ord + Eq`.
