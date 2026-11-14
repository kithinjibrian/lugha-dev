---
title: ? on Result
---

`?` after a `Result` gives the value inside an `Ok`, or returns the `Err` from the function at once.
Line 2 reads a file with `read_file(path)?`, so `text` is the file's text, a plain `string`.
Line 3 prints the name of the file it read.
Line 8 writes `notes.txt` first, and prints the `Ok` that `write_file` gives.
Will line 3 print for `other.txt`, which isn't there?
Press Run.

It doesn't: the failed read returns its `Err` at line 2, and nothing after the `?` runs.
