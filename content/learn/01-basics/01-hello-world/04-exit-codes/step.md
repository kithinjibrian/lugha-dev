---
title: Exit codes
start_output: checking the input\n
---

`main` can also return an `i32`, which becomes the program's exit code.
Here line 3, `1`, has no `;` because it isn't a statement: the last expression in a body, written without a `;`, is the value the body gives back.
Press Run, and the program exits with code 1, which whatever ran it reads as a failure.

```lugha {3}
fun main(): i32 {
    println("checking the input");
    0
}
```

Change line 3 to `0` and run again, or press Solve.
`main` comes in only these two forms, and `lughac` refuses any other with E0304.
Return nothing and the program ends with 0, or return an `i32` and choose the code yourself.
