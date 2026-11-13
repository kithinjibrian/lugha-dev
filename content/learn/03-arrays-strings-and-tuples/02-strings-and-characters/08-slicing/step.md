---
title: Slicing
---

`slice(from, to)` gives the part of a string between two offsets, counted in bytes like `.len`.
In `Zoë`, `Z` and `o` are bytes 0 and 1, and `ë` takes bytes 2 and 3, so line 4's `slice(2, 4)` gives `ë`.
`slice` checks only that the offsets are inside the string, so `slice(0, 3)` would give `Z`, `o` and half of `ë`, which isn't a whole character.
