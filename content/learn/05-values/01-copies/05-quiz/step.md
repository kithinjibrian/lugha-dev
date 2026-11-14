---
title: Quiz
see_also: word-frequency
---

One more, without running it first.
In the editor, `add_one` gets a copy of `xs`.
What does line 10, `println(xs)`, print?

```quiz
options = ["[5, 6]", "[5, 6, 1]", "It doesn't compile"]
answer = 0
feedback = [
  "Right. add_one changed its own copy and returned it as zs; xs is still [5, 6].",
  "Not quite. add_one only changed its copy, which came back as zs.",
  "Not quite. It compiles: add_one copies xs into a let mut before changing it.",
]
```

Then press Run to check.
