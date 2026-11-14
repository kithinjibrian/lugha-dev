---
title: Garbage collection
---

Step 1's array outlived `numbers`, so something has to give its memory back once nothing needs it.
Line 4 makes a new array of 100 numbers on every pass, a hundred thousand in all, and the program never gives one back.
A garbage collector, linked into every program, takes back memory once it can tell nothing holds it.
It's cautious, so it can hold on to some memory nothing uses, though that never makes the program behave wrongly.
Press Run.

It prints `10000000`, and the program never had to say which arrays it was done with.
