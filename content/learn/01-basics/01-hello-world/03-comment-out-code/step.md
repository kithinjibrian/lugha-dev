---
title: Comment out code
---

`//` turns the rest of a line into a comment, as on line 2, and `/* … */` can cover several lines.
In Lugha a `/*` comment can hold another one: line 3 opens a comment, and line 4 opens a second inside it.
Which of `two`, `three`, `four` and `five` will print?
Run it and see.

Only `five`.
Block comments nest, so the `*/` on line 4 closes only the inner comment, and the outer one runs on to line 5.
If you expected `four`, or an error at the `*/` on line 5, you were expecting the first `*/` to close everything before it.
So you can comment out code that already has a comment in it.
