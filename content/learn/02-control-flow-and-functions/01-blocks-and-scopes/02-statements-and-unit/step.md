---
title: Statements and ()
start_output: ()\n
---

Now line 5 ends with a `;`.
Will `total` still be `46`?
Press Run.

It prints `()`, with warning W0106, which says `total` holds `()`.
If you expected `46`, you were expecting the last line to count even with a `;` after it.
A `;` turns an expression into a statement, and whatever value it had is thrown away, so the block ends with nothing.
A block like that gives `()`, the value that means nothing was given back:

```lugha {5}
fun main() {
    let total = {
        let price = 40;
        let tax = 6;
        price + tax
    };
    println(total);
}
```

Remove the `;` on line 5 and run again, or press Solve.
