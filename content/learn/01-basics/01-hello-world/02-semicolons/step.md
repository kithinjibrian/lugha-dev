---
title: Semicolons
start_error: E0201
---

Now there are two `println` lines, and line 2 has no semicolon.
Will the line break after it do instead?
Decide, then press Run.

If you said no, you've got it.
If you expected it to run, you were expecting a line break to end a statement.
Lugha reads a line break the same as a space, so a statement ends at its `;`, not at the end of a line:

```lugha {2}
fun main() {
    println("one");
    println("two");
}
```

Add the `;` on line 2 and run again.
It's also why two statements can share one line, as long as each has its `;`.
