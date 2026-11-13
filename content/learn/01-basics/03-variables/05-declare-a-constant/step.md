---
title: Declare a constant
---

A value the whole program shares is a constant, declared with `const` outside any function, as on line 1.
Its type must be written, and leaving it out is an error.
Press Run.

Line 5 reads `MAX_SCORE` like a variable, but nothing can assign to it, and trying is E0501.
`let` is refused outside a function, so a value the whole program shares is always a `const`, and its value is fixed for the whole run.
