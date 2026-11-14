---
title: any and all
---

`any` and `all` take the same kind of closure as `filter`, but give back one `bool`.
`any` on line 3 is `true` because one age, `17`, is under 18, and it stops looking there.
`all` on line 4 is `false` because of that same age, and on line 5 it's `true`, since every age is above `0`.
