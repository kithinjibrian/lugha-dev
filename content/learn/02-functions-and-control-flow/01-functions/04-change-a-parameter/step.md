---
title: Change a parameter
start_error: E0501
---

`with_tax` adds a tenth to `price` on line 2.
Before you run it, decide whether a function can change its own parameter.
Then press Run.

The output shows E0501 for line 2.
A parameter can't be given a new value, the same as a name made with plain `let`.
The help in the output gives the fix.
`let mut price = price;` makes a copy you can change, and from the next line on, `price` means the copy.
Add it as a new line 2, or press Solve.
