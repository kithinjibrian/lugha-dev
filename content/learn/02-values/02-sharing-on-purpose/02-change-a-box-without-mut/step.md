---
title: Change a box without mut
---

`count` on line 2 is a plain `let`, and line 3 calls `count.set(3)`.
Before you run it, decide whether that compiles.
Then press Run.

It does.
`set` changes the box, and `count` still names the same box.
You'd need `let mut count` only to point `count` at another box.
