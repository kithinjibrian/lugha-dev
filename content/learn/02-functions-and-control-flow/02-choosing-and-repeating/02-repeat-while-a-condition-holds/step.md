---
title: Repeat while a condition holds
start_error: E0403
---

Line 3 means to repeat while `n` isn't zero, and writes `while n`.
Before you run it, decide whether `lughac` accepts a number as a condition.
Then press Run.

It doesn't.
A condition must be a `bool`, and a number is never read as one.
Write the comparison on line 3, `while n > 0`, or press Solve.
