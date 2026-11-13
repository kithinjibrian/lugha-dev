---
title: Remove the semicolon
start_error: E0503
---

Line 2 now ends with a semicolon.
Before you run it, decide whether `area` still gives back `21`.
Then press Run.

A semicolon turns the last line into a statement, and the value of a statement is thrown away.
So `area` ends without a value, though line 1 says it gives back an `i64`.
The error points at the semicolon on line 2.
Remove it, or press Solve.
