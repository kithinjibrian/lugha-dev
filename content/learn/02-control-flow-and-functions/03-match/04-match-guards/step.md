---
title: Match guards
start_error: E0417
---

An arm can have a condition, written after the pattern with `if`, as on lines 5 and 6.
The arm matches only when the pattern matches and the condition is true.
Between them, `0`, below zero and above zero cover every number, so will `lughac` accept this `match` when every `_` has a condition?

It gives E0417 again.
When `lughac` checks that every value is covered, it counts only the arms without a condition.
So the last case has to be an arm without one:

```lugha {6}
fun main() {
    let temperature = -4;
    let advice = match temperature {
        0 => "exactly zero",
        _ if temperature < 0 => "below zero",
        _ => "above zero",
    };
    println(advice);
}
```

Take `if temperature > 0` off line 6 and run again, or press Solve.
