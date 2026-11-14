---
title: Recursive enums
---

A variant's data can be the enum itself.
`List` on lines 1 to 4 is either `Nil`, the end, or `Cons`, a number followed by the rest of the list.
`Cons` on line 3 names `List` as its second type, with nothing else written to make that work.
Line 14 builds `1`, `2`, `3` by nesting: the innermost value is `List.Nil`, and each `Cons` puts one number in front of it.
`sum` adds each number to the sum of the rest, calling itself until it reaches `Nil`.
Press Run.
