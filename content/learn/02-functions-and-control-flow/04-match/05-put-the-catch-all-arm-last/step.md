---
title: Put the catch-all arm last
start_output: another day\n
---

The arms from step 1 are here, with `_` moved to the top, and `day` is still `3`.
It now prints `another day`, and `lughac` warns with W0102, "unreachable match arm", for lines 5, 6 and 7.
Arms are tried from the top, and `_` matches every number, so no value ever reaches the arms after it.
Move it back to the end:

```lugha {7}
fun main() {
    let day = 3;
    let name = match day {
        1 => "Monday",
        2 => "Tuesday",
        3 => "Wednesday",
        _ => "another day",
    };
    println(name);
}
```
