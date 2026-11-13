---
title: Share a box
---

`Ref.new(1)` on line 2 makes a box holding `1`, and line 3 copies `a` into `b`.
Line 4 sets the box to `5` through `b`.
Before you run it, decide what line 5 prints.
Then press Run.

It prints `5`.
Copying a `Ref` copies a handle to the box, never the box itself, so `a` and `b` name the same box.
Every other value you copy is still your own copy, as in the last lesson.
