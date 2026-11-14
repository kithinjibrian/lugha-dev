---
title: Parsing numbers
start_error: E0404
---

`parse_i64` reads a whole number from a string, with an optional `-` in front.
Its result is an `Option<i64>`: `Some` with the number, or `None` for text such as `"4.5"` or `"nine"`.
Line 4 adds `1` to what it gave back.

That's E0404, "cannot apply `+` to `Option<i64>` and `i64`", because the number is still inside the `Option`.
`unwrap_or(0)` on line 3 takes it out, with `0` standing in when the text isn't a number:

```lugha {3}
fun main() {
    let typed = "41";
    let n = parse_i64(typed).unwrap_or(0);
    println(n + 1);
}
```

Add `.unwrap_or(0)` on line 3, or press Solve.
