---
title: Multiple return values
---

Returning a tuple is how a function gives back more than one value.
`divmod` on line 1 gives back the quotient and the remainder together, so its return type is the tuple type `(i64, i64)`.
A tuple type lists each element's type, so a string and a number would be `(string, i64)`.
The caller gets both at once, and the next step names them.
