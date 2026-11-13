---
title: Shadow a parameter to change it
start_error: E0501
---

`with_tax` adds a tenth to `price` on line 2.
Can a function change its own parameter?

It can't: the output shows E0501 for line 2, because a parameter is like a `let` without `mut`.
The help in the output gives the fix, which is shadowing, from Variables.
`let mut price = price;` makes a copy you can change, and from the next line on, `price` means the copy:

```lugha {2}
fun with_tax(price: i64): i64 {
    let mut price = price;
    price = price + price / 10;
    price
}

fun main() {
    println(with_tax(200));
}
```

Add it as a new line 2.
