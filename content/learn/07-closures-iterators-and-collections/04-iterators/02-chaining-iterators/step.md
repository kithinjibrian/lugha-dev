---
title: Chaining iterators
---

Iterators have `map` and `filter` too, and each gives back another iterator, so they line up one after another.
Line 2 takes the numbers from 1 to 9, keeps the multiples of 3 and squares them.
`collect()` at the end puts the results in an array.
`chain` on line 4 gives one iterator's values, then another's.
Press Run.
