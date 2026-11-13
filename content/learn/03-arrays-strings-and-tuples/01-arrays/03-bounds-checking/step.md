---
title: Bounds checking
start_output: 70\n
---

Every index is checked as the program runs.
Line 4 tries to print the last score with `scores[scores.len]`.
After `70`, the program panics with "index out of bounds: the length is 3 but the index is 3" and exits with code 101.
With indexes counting from `0`, the last one is `.len - 1`:

```lugha {4}
fun main() {
    let scores = [70, 85, 90];
    println(scores[0]);
    println(scores[scores.len - 1]);
}
```

Change line 4's index to `scores.len - 1`.
