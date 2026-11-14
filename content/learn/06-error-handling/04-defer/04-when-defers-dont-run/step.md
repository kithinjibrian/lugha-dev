---
title: When defers don't run
---

A panic ends the program at once, so pending defers don't run.
Line 4 reads past the end of `ages`, so the program panics, and `cleaning up` from line 2 never prints.
`exit`, which ends the program with the code you give it, skips them too.
Press Run.
