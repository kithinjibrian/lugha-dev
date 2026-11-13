---
title: Exhaustiveness
start_error: E0417
---

This `match` is on a string, with an arm for each of the three commands, and `command` is `"stop"`.
Will it compile without a `_`?

`lughac` refuses it with E0417, "non-exhaustive match: other values of `string` are not covered".
A `match` must cover every value `command` could hold, and `command` could be any string.
Integers are the same, so a `match` on a string or an integer always needs a `_`.
A `bool` doesn't need one, since `true` and `false` cover it.
Add the arm the help asks for, on line 7:

```lugha {7}
fun main() {
    let command = "stop";
    let speed = match command {
        "go" => 10,
        "slow" => 3,
        "stop" => 0,
        _ => 0,
    };
    println(speed);
}
```
