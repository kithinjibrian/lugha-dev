---
title: Give a block a value
---

In the first lesson, `main`'s last line, written without a `;`, was the value it gave back.
Any block in braces works the same way, and lines 2 to 6 are one, with its value going into `total`.
Will line 2 compile, with a whole block after its `=`?
Press Run.

It does, and line 7 prints `46`.
If you expected an error, you were expecting braces to hold only statements.
A block's value is its last expression, written without a `;`, here `price + tax` on line 5.
