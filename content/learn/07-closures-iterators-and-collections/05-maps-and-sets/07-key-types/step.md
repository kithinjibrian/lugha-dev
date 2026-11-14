---
title: Key types
start_error: E0441
---

Keys can be integers, strings, `bool`s, `char`s and the types built from them, but never a float.
Line 2 uses cup sizes in litres as keys.
Press Run.

`lughac` stops at line 2 with E0441, "a map's keys can't hold a float".
Its help gives the reason: `NaN != NaN`, so a float key could never be found again.
Use whole millilitres instead:

```lugha {2,3}
fun main() {
    let cups = #{250: "small", 500: "large"};
    println(cups[500]);
}
```

Change the keys on lines 2 and 3 to millilitres, or press Solve.
