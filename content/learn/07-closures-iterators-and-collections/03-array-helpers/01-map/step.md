---
title: map
---

Arrays have their own `map`, like the one on `Option` in the last lesson, and it takes a closure too.
It calls the closure on each element and gives back a new array of the results.
Line 3 doubles each price, and line 4 turns each one into a string, so `labels` is a `string[]`.
Neither changes `prices`, which line 7 prints as it was.
Press Run.
