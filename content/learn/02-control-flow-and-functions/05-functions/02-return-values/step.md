---
title: Return values
start_error: E0503
---

`area`'s body is a block, so what it gives back is its last expression, as in Blocks and scopes.
Line 2 now ends with a `;`.
In Blocks and scopes that `;` gave a block `()` with only a warning, so what happens here?

This time it's an error, E0503, because line 1 promises an `i64` and the body no longer gives one.
The error points at the semicolon, and its help says to remove it, which gives this:

```lugha {2}
fun area(width: i64, height: i64): i64 {
    width * height
}

fun main() {
    println(area(7, 3));
}
```

Remove the `;` on line 2 and run again, or press Solve.
