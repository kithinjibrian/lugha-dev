---
title: Give every branch the same type
start_error: E0403
---

This `if` has two branches, and the `else` on line 6 gives `0`, a number, where line 4 gives a string.
`lughac` refuses it with E0403, "`if` and `else` have different types", and its notes say "this is string" for line 4 and "this is i64" for line 6.
`advice` gets the type of the `if`, and an `if` has one type, so every branch has to give a value of it:

```lugha {6}
fun main() {
    let temperature = 31;
    let advice = if temperature > 30 {
        "stay inside"
    } else {
        "go out"
    };
    println(advice);
}
```

Change line 6 to a string and run again, or press Solve.
