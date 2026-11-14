---
title: Option instead of null
---

A value that may be missing has the type `Option`: either `Some` with the value inside, or `None`.
There's no null in Lugha, so an `Option` is how a missing value is written.
`find` on line 1 looks for a name and gives back its position, so its return type is `Option<i64>`.
Line 4 returns `Some(i)` when the name is found, and line 7 gives `None` once the loop ends without it.
`Some` and `None` are written on their own, without `Option.` in front.
Press Run.
