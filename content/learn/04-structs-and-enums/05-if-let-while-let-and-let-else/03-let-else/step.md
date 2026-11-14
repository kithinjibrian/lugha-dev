---
title: let else
start_error: E0429
---

`let … else` keeps its bindings in scope for the rest of the block, not only inside a block of their own.
Its `else` runs when the pattern doesn't match.
Line 2 names the number `n`, and the `println` after the `else` uses it.

As written, it's E0429, "the `else` of a `let … else` must not finish".
If the `else` block ended normally, that `println` would run with no `n` to read.
So the block has to leave, here with `return;`, which ends `report` without a value:

```lugha {4}
fun report(typed: string) {
    let Some(n) = parse_i64(typed) else {
        println("{typed} isn't a number");
        return;
    };
    println("{n} doubled is {n * 2}");
}

fun main() {
    report("12");
    report("twelve");
}
```

Add `return;` as line 4, or press Solve.
