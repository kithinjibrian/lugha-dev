---
title: Divide whole numbers
---

In the last lesson `height * 300` had to fit a `u8`, because arithmetic works on two numbers of the same type and gives that type.
So dividing two whole numbers gives a whole number, and line 2 prints `3`.
Before you run it, decide: will `-7 / 2` on line 3 print `-3` or `-4`?
Then press Run.

It prints `-3`, so if you said `-4`, you were expecting division to round down.
Lugha drops the fraction toward zero instead, and `%` on line 4 takes its sign from the left side, giving `-1`.
The half survives only when both sides are floats, as on line 5.
