---
title: See where a variable ends
start_error: E0301
---

`price` is declared inside the block, on line 3, and line 6 tries to print it after the block's `}`.
Press Run.

`lughac` refuses it with E0301, "cannot find `price` in this scope".
A variable declared in a block ends at the `}` that closes it, so by line 6 `price` doesn't exist.
What's left of the block is its value, in `total`:

```lugha {6}
fun main() {
    let total = {
        let price = 40;
        price + 6
    };
    println(total);
}
```

Print `total` on line 6 and run again.
