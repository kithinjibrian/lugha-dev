---
title: collect_map and collect_set
---

An iterator can end in a set or a map instead of an array.
`collect_set()` on line 3 keeps each name once.
`collect_map()` on line 5 needs tuples of key and value, and when a key comes twice, its later value wins, so `ann` ends up with `3`.
Press Run.
