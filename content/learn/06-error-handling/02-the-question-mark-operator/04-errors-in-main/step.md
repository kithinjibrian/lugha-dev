---
title: Errors in main
start_error: E0424
---

`main` returns nothing, so `?` has no `Err` to return from it.
Line 2 uses `?` there anyway, and `lughac` stops at line 2 with E0424, whose help says to handle the error with `match`.
So `main` matches on the `Result` itself and decides what to print:

```lugha {2,3,4,5}
fun main() {
    match read_file("notes.txt") {
        Ok(text) => println(text),
        Err(e) => println("can't read notes.txt: {e}"),
    }
}
```

Replace lines 2 and 3 with the `match`, or press Solve.
