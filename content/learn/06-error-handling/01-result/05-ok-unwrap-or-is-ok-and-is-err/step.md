---
title: ok, unwrap_or, is_ok and is_err
---

Line 2 writes `notes.txt`, so line 3's read works, and line 4's, of a file that isn't there, fails.
`ok()` on lines 5 and 6 turns a `Result` into an `Option`, dropping the error.
`unwrap_or` on lines 7 and 8 gives the file's text, or `(no notes)` when the read failed.
`is_ok()` and `is_err()` on lines 9 and 10 tell whether a read worked or failed.
Press Run.
