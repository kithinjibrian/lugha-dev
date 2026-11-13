---
title: Give a float its digits
start_error: E0107
---

Back to floats: line 2 tries to write two hundred thousand as `2e5`.
Press Run.

An exponent makes a float, and a float in Lugha needs a digit on both sides of its `.`, so `lughac` refuses `2e5` with E0107:

```lugha {2}
fun main() {
    println(2.0e5);
}
```

Write `2.0e5` on line 2 and run again, or press Solve.
