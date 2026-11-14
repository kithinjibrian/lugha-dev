---
title: Missing keys
---

`get` on line 3 gives an `Option`: `Some` with the value, or `None` when the key isn't there, as on line 4.
`has` on line 5 only asks whether the key is there.
Line 6 reads a missing key with `[…]`, which panics with `no key "dee" in the map`.
When a key may be missing, use `get` or `has`.
Press Run.
