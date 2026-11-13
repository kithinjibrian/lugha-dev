---
title: Write the condition as a bool
start_error: E0403
---

`unread` is `3`, and line 3 uses it as the condition.
Will a number that isn't `0` count as true?

`lughac` says no, with E0403 again, the code for a value of the wrong type, this time "expected bool, found i64".
A condition must be a `bool`, and a number is never read as one, so the comparison has to be written out:

```lugha {3}
fun main() {
    let unread = 3;
    if unread > 0 {
        println("you have mail");
    }
}
```

Write it on line 3 and run again.
