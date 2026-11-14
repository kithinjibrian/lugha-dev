---
title: Variable initialization
start_error: E0201
---

Lugha also rules out reading a variable that was never set.
`total` on line 2 has a type but no value, and the loop adds each number to it.
What will line 6 print?
Press Run.

Nothing: `lughac` stops at line 2 with E0201, "expected `=`, found `;`".
A `let` always gives its variable a value, so no line can read one that was never set.
Give `total` its starting value:

```lugha {2}
fun main() {
    let mut total: i64 = 0;
    for n of [3, 4, 5] {
        total += n;
    }
    println(total);
}
```

Add `= 0` on line 2, or press Solve.
