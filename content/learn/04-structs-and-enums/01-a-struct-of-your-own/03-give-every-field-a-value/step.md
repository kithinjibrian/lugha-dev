---
title: Give every field a value
start_error: E0413
---

Line 4 builds a `Point` with only `x`.
Before you run it, decide whether `y` starts at 0.
Then press Run.

It doesn't compile, and the output shows E0413, missing field `y` in `Point`.
A struct is built with a value for every field, and `y` has none here.
Add `y: 0` on line 4, or press Solve.
