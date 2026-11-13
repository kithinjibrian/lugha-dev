---
title: Bytes
---

Indexing a string reads bytes as well, the same units `.len` counts.
Line 3 prints `word[0]`, the first byte of `"hi"`.
Will it print `h`?

It prints `104`, the number of the byte that encodes `h`, because `word[0]` is a `u8`.
A `for … of` loop over a string, as on line 4, goes through its bytes the same way.
