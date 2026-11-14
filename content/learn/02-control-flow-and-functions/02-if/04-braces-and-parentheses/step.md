---
title: Braces and parentheses
start_error: E0201
---

Line 3 puts the condition in parentheses and leaves out the braces.
Which of the two is the problem?

The braces: it gives E0201, "expected `{`, found identifier `println`".
Parentheses around a condition are optional, so `if (unread > 0)` means the same as `if unread > 0`.
The code after the condition is always a block in braces, even when it holds one line, and so is the code after `else`, unless it's another `if`:

```lugha {3,4,5}
fun main() {
    let unread = 3;
    if (unread > 0) {
        println("you have mail");
    }
}
```

Put line 3's `println` in braces.
