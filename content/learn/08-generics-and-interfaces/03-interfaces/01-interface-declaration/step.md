---
title: Interface declaration
---

A bound such as `Num` says what a type must support, and an interface is a bound you write yourself.
`Shape` on lines 1 to 4 lists two methods, with their signatures and no bodies.
`Circle` on line 8 has both methods, and line 15 calls them.
An interface's methods can use `Self` for the type that meets it, as in `fun bigger(self, other: Self): bool`.
The `next` method in Custom iterators matches one the prelude declares, in an interface named `Iter<T>`.
Press Run.
