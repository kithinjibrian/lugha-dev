---
title: Or-patterns
---

An arm can also take more than one value.
Line 4 has two patterns joined by `|`, and the arm matches when either does.
`day` is `6`, so it prints `weekend`.
Change `6` on line 2 to `7` and it still prints `weekend`, and any other number gives `weekday`.
