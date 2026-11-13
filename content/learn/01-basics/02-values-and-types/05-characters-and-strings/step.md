---
title: Characters and strings
start_error: E0102
---

That leaves text, which has two types.
A `char` in single quotes is one character, as on line 2.
A `string` in double quotes is any text, with escapes such as `\t` for a tab on line 3.
The string on line 4 runs on to line 5.
Press Run.

`lughac` reports E0102 twice, once for each line, because a string ends on the line it starts.
A line break inside a string is written `\n`:

```lugha {4}
fun main() {
    println('a');
    println("tab:\tend");
    println("first line\nsecond line");
}
```

Join lines 4 and 5 with `\n` and run again.
