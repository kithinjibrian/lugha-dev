---
title: More adapters
---

A few more adapters work like `map` and `filter`.
`take_while` on line 3 takes values while its closure holds, and stops at the first that fails, the `9`.
`skip_while` on line 4 skips values until that same `9`, and gives everything from it on.
`flat_map` on line 6 turns each value into an iterator of its own and gives their values in turn, here each word's characters.
`bytes()` on line 7 is a source like `chars()` in the first step, and gives a string's bytes as `u8` numbers.
Press Run.
