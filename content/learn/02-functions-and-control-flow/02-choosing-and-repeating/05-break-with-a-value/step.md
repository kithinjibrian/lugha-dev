---
title: Break with a value
start_error: E0403
---

`loop` on line 3 repeats until a `break` stops it.
Here it should stop at the first `n` whose square is over 50.
Press Run.

Line 3 says `found` is an `i64`, but a plain `break` gives the loop no value, which the error calls `()`.
`break n;` gives the loop the value of `n`, the way a body's last expression gives a function its value.
Change line 5 to `break n;`, or press Solve.
