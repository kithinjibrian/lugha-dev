---
title: Memory safety
---

In a Lugha program, a name always reaches a value that's still there, unless the program calls C code.
`numbers` on line 1 builds an array on line 2 and returns it, and line 7 keeps it in `kept` after `numbers` has finished.
The array stays as long as `kept` holds it, so line 8 prints it whole.
The same goes for two checks you've met: there's no null, as Option showed, and reading past the end of an array stops the program, as in Bounds checking.
Press Run.
