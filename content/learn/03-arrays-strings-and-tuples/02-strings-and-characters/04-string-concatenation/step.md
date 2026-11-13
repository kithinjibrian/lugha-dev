---
title: String concatenation
start_error: E0404
---

Braces aren't the only way to build a string: `+` joins two strings into a new one.
Line 4 uses it to build a sentence from `name`, `" has "` and `points`.
Will `+` take the number too?

Line 4 stops at E0404, "cannot apply `+` to string and i64".
`+` only joins strings, and a number never turns into one by itself.
Put the number in braces inside the string instead:

```lugha {4}
fun main() {
    let name = "Amina";
    let points = 7;
    let line = name + " has {points}";
    println(line);
}
```

The fix is on line 4, or press Solve.
