---
title: Call a function from itself
---

`factorial` on line 1 multiplies `n` by `factorial(n - 1)`, a call to itself.
Its body is one `if` expression, so it uses the `=` form from Functions.
Press Run.

It prints `120`, which is 5 × 4 × 3 × 2 × 1.
When `n` is `1` or less, the `if` gives `1` and doesn't call `factorial` again, so the calls stop there.
