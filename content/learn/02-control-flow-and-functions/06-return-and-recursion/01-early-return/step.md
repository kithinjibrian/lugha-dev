---
title: Early return
---

So far a function's value has been its last expression, but `return` ends a function straight away and gives back the value after it.
In `distance`, line 3 returns `from - to` when `to` is smaller, and the rest of the body is skipped.
Otherwise the function goes on to line 5, its last expression.
Press Run.

It prints `7` twice, once from each path.
`return to - from;` on line 5 would work too, but a function that reaches its end gives back its last expression without one.
