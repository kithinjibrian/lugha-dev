---
title: Tuple patterns
---

A `match` can look inside a tuple too, and line 2 puts `x` and `y` into one so that a single `match` checks both.
Each arm's pattern is a tuple of patterns, and `_` inside one matches anything in that position.
`(0, _)` on line 4 matches any point whose `x` is `0`, the origin included.
Arms are tried from the top, so `(0, 0)` has to come before it.
As in any `match`, the arms must cover every case, which the `_` on line 6 does.
