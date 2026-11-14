---
title: Laziness
---

On an array, `map` runs its closure at once and makes a new array, as in Array helpers.
On an iterator, line 2 only wraps `iter()` with a closure that prints each number it doubles.
Will any `doubling` line come before `made the iterator`?
Press Run.

None does: `map` on an iterator runs nothing yet.
The closure runs only when line 7 pulls values, and `take(2)` pulls two, so `3` is never doubled.
That's why line 8 can start from a range up to a billion, because `take(3)` stops pulling once it has three.
