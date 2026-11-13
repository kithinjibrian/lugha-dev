---
title: Changing elements in a loop
start_error: E0501
---

Line 4 tries to add 5 to every score as the loop goes through them.
`scores` is `let mut`, so can the loop change its elements?

The loop variable is the problem: E0501, "cannot assign to `score`: it is not mutable".
A loop variable can't be assigned to.
The help suggests a copy in a `let mut`, which would change only the copy, so to change the array itself, loop over it with `of mut`:

```lugha {3}
fun main() {
    let mut scores = [70, 85, 90];
    for score of mut scores {
        score += 5;
    }
    println(scores);
}
```

Then `score` is each element itself, and adding to it adds to that element.
Add `mut` after `of` on line 3.
