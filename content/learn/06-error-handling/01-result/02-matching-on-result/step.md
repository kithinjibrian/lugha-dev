---
title: Matching on Result
---

Line 9 tries both divisors, and line 10 matches on each `Result`.
`Ok(q)` on line 11 names the answer, and `Err(e)` on line 12 names the message.
Leave out the `Err` arm and the `match` is E0417, "`Err` not covered".
Press Run.
