---
title: match expressions
---

Like an `if`, a `match` is an expression: it gives the value after `=>` in the first arm whose pattern matches.
Here `day` is `3`, so the arm on line 6 matches and `name` becomes `"Wednesday"`.
The `_` on line 7 matches anything, so it catches every number the other arms don't.
Press Run, then change `3` on line 2 to see the other arms.

Every arm must give the same type, so a number in place of `"Tuesday"` would be E0401.
