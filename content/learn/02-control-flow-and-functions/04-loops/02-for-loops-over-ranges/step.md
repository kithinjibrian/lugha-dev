---
title: for loops over ranges
---

`for` does the counting for you: `for i in 1..4` runs its block once for each number in the range `1..4`, with `i` set to that number.
Will the last one printed be `4`?
Press Run.

It prints `1`, `2` and `3`.
A range includes its first number and stops before its second, so `1..4` holds three numbers.
A range whose first number isn't smaller than its last, such as `4..4`, is empty, and the block doesn't run at all.
