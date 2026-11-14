---
title: Ref boxes
---

A `Ref` is a box: a place that holds one value, read with `get` and replaced with `set`.
`Ref.new(1)` on line 2 makes a box holding `1`, and `a` names it.
Line 3 copies `a` into `b`, line 4 sets the box to `5` through `b`, and line 5 reads it through `a`.
Does `a` still see `1`?
Press Run.

It prints `5`.
Copying a `Ref` copies only a handle to the box, so `a` and `b` name the same box:

```diagram
file = "diagram.svg"
alt = "a and b both point at one box, which holds 5"
```

Every other value you copy is still your own copy, as in the last lesson.
