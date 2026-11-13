---
title: Shadow a variable
---

There's another way to give a name a new value without `mut`: declare it again.
Line 3 declares `score` a second time, from the old `score`.
Will it compile, and if so, what will line 4 print?

It compiles and prints `15`.
If you expected an error, you were expecting the second `let score` to clash with the first.
A new `let` hides the old variable once its own declaration ends, which is called shadowing, so after its `=`, `score` still means the old one.
Line 5 shadows it again with a string, which `mut` could never do: assigning changes a variable's value but never its type, while shadowing makes a new variable.
