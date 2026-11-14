---
title: Linked structures
---

`Node` on line 1 links to the next node through `Option<Ref<Node>>`: `None` at the end, or a box holding the next node.
Line 5 links `first` to the box `second`, and line 6 replaces what's in that box.
What will line 8 see through `first`?
Press Run.

It sees `20`, because `first` holds the same box as `second`.
A plain `Option<Node>` would also compile, but `first` would then hold its own copy of the next node, and no later change to `second` would reach it.
