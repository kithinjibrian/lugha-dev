---
title: Error types
start_error: E0424
---

`?` returns a failure as the function's own, so it has to fit the function's return type.
On a `Result`, the error types must be the same, and `map_err` can change one first.
`total` on line 1 returns a `Result<i64, string>`, and line 3 uses `?` on the `Option` that `parse_i64` gives.
A `None` has no error in it to return, and `lughac` stops at line 3 with E0424, "`?` can't return here".
Its help suggests a `match`, but `ok_or("not a number")` is shorter.
It turns the `Option` into a `Result`, with that string as its error, and then `?` works:

```lugha {3}
fun total(path: string): Result<i64, string> {
    let text = read_file(path)?;
    let n = parse_i64(text.trim()).ok_or("not a number")?;
    Ok(n * 2)
}

fun main() {
    println(write_file("n.txt", "21\n"));
    println(total("n.txt"));
}
```

Add `.ok_or("not a number")` before the `?` on line 3, or press Solve.
