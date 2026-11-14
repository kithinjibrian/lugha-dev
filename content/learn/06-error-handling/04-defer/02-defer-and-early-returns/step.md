---
title: defer and early returns
---

A defer runs on every way out of its block, a `return` or a `?` included.
`first_line` defers `closing {path}` on line 3, before line 4 reads the file with `?`.
For `other.txt` the `?` returns the `Err` at once, and `closing other.txt` still prints right before it does.
So cleanup written as a `defer` near the top of a function also runs when a later `?` returns early.
Press Run.
