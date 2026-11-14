---
title: Deep equality
---

`==` reaches into a value's parts, so line 4 compares two structs field by field, as in Structs.
Arrays compare element by element, as on lines 5 and 6, and `Some(a)` equals `Some(b)` when `a` equals `b`.
A float that isn't a number, `NaN`, is equal to nothing, itself included, so line 8 prints `false`.
As in Ref and Function types, a `Ref` box and a function have no `==`, and neither has an interface value or anything holding one of these.
Press Run.
