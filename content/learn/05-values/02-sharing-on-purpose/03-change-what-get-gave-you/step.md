---
title: Change what get gave you
---

Line 5 gets the `Point` from the box with `get`, and line 6 changes `p.x`.
Before you run it, decide what line 7 prints.
Then press Run.

It prints `Point { x: 1, y: 2 }`.
`get` gives a copy of what's in the box, so changing `p` never reaches the box.
To change the box, put a value back with `set`.
