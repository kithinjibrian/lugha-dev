---
title: Generic functions
---

Some functions do the same thing whatever type they're given.
Taking the first element works the same for an `i64[]` as for a `string[]`, so writing it twice would repeat the same body.
A generic function is written once, with a type parameter standing for the type: `T` in `first<T>` on line 1.
`T` is used wherever that type goes, so `first` takes a `T[]` and gives back an `Option<T>`.
Each call fills `T` in from its argument: line 11 uses `first` with `i64` and line 12 with `string`, and neither is written.
`empty` on line 8 takes no arguments, so line 13's `: string[]` fills `T` in, and without it the call is E0412.
Press Run.
