---
title: Default methods
---

An interface can give a method a body, which is then its default.
`describe` on line 3 has one, and it calls `area` on `self`.
`Circle` has no `describe`, so line 19 uses the default.
Line 20 calls `Square`'s own, from line 15.
Press Run.
