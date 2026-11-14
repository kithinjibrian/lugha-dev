---
title: ? on Option
---

In a function that returns an `Option`, `?` works on an `Option` the same way: it gives the value inside a `Some`, or returns `None`.
`sum_two` parses two strings on lines 2 and 3, and either `?` returns `None` when its string isn't a number.
Line 4 adds the numbers only when both parsed.
Press Run.
