---
title: Arrays are copied too
---

Arrays follow the same rule. `ys` starts as a copy of `xs`, and line 4 pushes onto `ys`.

Before you run it, decide: what will line 5, `println(xs)`, print? Then press Run.

If you said `[5, 6]`, you've got it. If you expected `[5, 6, 1]`, you were expecting `ys = xs` to give one array a second name.

Isn't copying slow? No: a copy shares the original's memory until one side writes to it, and only then is it really copied.
