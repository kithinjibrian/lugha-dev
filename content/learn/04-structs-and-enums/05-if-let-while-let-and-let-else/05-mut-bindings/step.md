---
title: mut bindings
start_error: E0501
---

Names in a pattern are read-only, like parameters.
Line 5 adds 1 to `n`, the number inside `count`.
That's E0501, "cannot assign to `n`: it is not mutable", and its help suggests copying `n` into a `let mut`.
`mut` before the name in the pattern does that in one place, giving the arm its own copy to change, and `count` itself stays `Some(4)`, as line 10 shows:

```lugha {4}
fun main() {
    let count: Option<i64> = Some(4);
    match count {
        Some(mut n) => {
            n += 1;
            println(n);
        }
        None => println("no count"),
    }
    println(count);
}
```

Change line 4 to `Some(mut n) => {`, or press Solve.
