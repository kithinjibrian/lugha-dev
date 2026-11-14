---
title: Named imports
---

An import can also list items after the module's name, and those are written without the module's name in front.
Line 1 lists `Square`, so line 4 builds one as plain `Square`.
`area as square_area` brings in `area` under the name `square_area`, which line 5 calls.
`shapes.describe` on line 6 still works, since the import binds `shapes` as well.
Press Run.
