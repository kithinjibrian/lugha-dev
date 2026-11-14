---
title: map and and_then
---

`map` on an `Option` gives a new `Some` holding what the closure returns, and leaves a `None` as it is, as lines 2 and 3 show.
On a `Result`, `map` works on an `Ok` and leaves an `Err` as it is, on lines 6 and 7, as `map_err` did the other way.
`and_then` takes a closure that returns an `Option` or a `Result` itself, so on lines 8 and 9 it turns a success into a failure.
Line 9 writes its closure's return type, because `lughac` can't work it out there.
Press Run.
