---
title: Combine comparisons
start_error: E0203
---

Comparisons give a `bool`, and line 4 checks that `age` is between 18 and 65 in one go.
Press Run.

If you expected it to run, you were expecting `18 <= age < 65` to mean two comparisons at once.
In Lugha comparisons don't chain, so `lughac` stops at E0203, and the two halves are joined with `&&`:

```lugha {4}
fun main() {
    let age = 30;
    let member = false;
    println(18 <= age && age < 65);
    println(!member || age > 60);
}
```

Rewrite line 4 as two comparisons and run it again.
Line 5 uses `!` for not and `||` for or, and `&&` and `||` stop as soon as the answer is known.
So in `zero != 0 && 10 / zero > 1`, the kind of division that panicked in the last step never runs when `zero` is 0.
