---
title: Copies
---

In Lugha, assigning a struct, an array or an enum gives you your own copy.

On the right, `b` starts as a copy of `a`, and line 6 changes `b.x`. Press Run and look at what `a` prints.

`a` still has `x: 1`. Changing `b` never touched it: they are two separate values.
