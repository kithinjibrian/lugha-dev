---
title: Set operations
---

`union` on line 4 gives the values in either set.
`intersect` on line 5 keeps the ones in both, and `minus` on line 6 keeps the ones in `a` that aren't in `b`.
Sets and maps keep the order values were added, and line 7 compares two sets written in different orders.
Will it print `true`?
Press Run.

It does: `==` compares the values and ignores their order, and line 8 shows the same for two maps.
