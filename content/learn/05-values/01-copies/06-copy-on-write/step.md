---
title: Copy-on-write
---

Copying an array takes the same time however long it is, because at first the copy shares the original's memory.
Line 3 copies `big`, a million numbers, that way.
Line 4 writes to `copy`, so that's where it gets a million numbers of its own.
This is called copy-on-write, and no program can tell it from a full copy: line 5 still prints `0`.
Press Run.
