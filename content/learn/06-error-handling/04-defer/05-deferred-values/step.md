---
title: Deferred values
start_error: E0456
---

Line 2 defers a `write_file`, which gives back a `Result`.
That's E0456: a deferred statement must have type `()`, so a deferred call's `Result` can't be dropped without the code saying so.
Write the call in a block, with a `;` after it, to discard the `Result` on purpose:

```lugha {2}
fun main() {
    defer { write_file("log.txt", "done"); }
    println("working");
}
```

Wrap line 2's call in braces with a `;` after it, or press Solve.
