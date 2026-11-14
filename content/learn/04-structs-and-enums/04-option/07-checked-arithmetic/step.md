---
title: Checked arithmetic
start_output: 255\n
---

This is the program from Integer overflow, where `level + 10` stopped the program because 260 doesn't fit in a `u8`.
`checked_add` does the same addition and gives an `Option`: `Some` with the sum, or `None` where `+` would panic.

With `checked_add` in both places, an overflow gives a `None` the program can check, instead of stopping it:

```lugha {3,4}
fun main() {
    let level: u8 = 250;
    println(level.checked_add(5));
    println(level.checked_add(10));
}
```

Change lines 3 and 4, or press Solve.
