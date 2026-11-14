---
title: Capture by copy
---

A closure can use the variables around it.
`scale` on line 3 uses `rate`, which is `2` at that point, and line 4 changes `rate` to `7` afterwards.
What will `scale(5)` on line 5 print?
Press Run.

It prints `10`: `scale` copied `rate` when line 3 made it, so line 4's change doesn't reach it, though line 6 shows `rate` is `7` now.
