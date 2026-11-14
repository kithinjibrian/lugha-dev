---
title: defer
---

`defer` sets a statement aside to run when the block it's in is left.
Line 3 defers a `println` that reads `n`, and line 4 changes `n` after it.
Which `n` will the deferred line print?
Press Run.

It prints `2`.
The deferred line runs when `main` ends, after line 5, and reads `n` as it is then.
