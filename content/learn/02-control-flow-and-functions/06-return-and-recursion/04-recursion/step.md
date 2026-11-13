---
title: Recursion
---

A function can also call itself, as long as one path gives a value without calling it again.
`factorial` on line 1 multiplies `n` by `factorial(n - 1)`, a call to itself.
Its body is one `if` expression, so it uses the `=` form from Functions.

Run it and it prints `120`, which is 5 × 4 × 3 × 2 × 1.
When `n` is `1` or less, the `if` gives `1` and doesn't call `factorial` again, so the calls stop there.
