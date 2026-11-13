---
title: Indexing
start_error: E0501
---

`scores[0]` on line 4 is the first element, because indexes count from `0`.
Line 3 tries to change the second, in an array declared with plain `let`.
Can one element change when the array can't?

E0501 says no: "cannot assign to `scores`: it is not mutable".
Changing one element changes the array, so the array needs `let mut`, like any variable you change:

```lugha {2}
fun main() {
    let mut scores = [70, 85, 90];
    scores[1] = 88;
    println(scores[0]);
    println(scores);
}
```

Add `mut` on line 2.
