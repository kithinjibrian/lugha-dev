---
title: Closures
start_error: E0412
---

A closure is a function written in place, without a name: `fun(x) = x * 2` on line 4 doubles its argument.
Line 4 passes it to `apply`, so `x` takes its type from `apply`'s parameter, a `fun(i64): i64`.
Line 5 stores one in `add_ten`, where nothing says what `x` is.

That's E0412, "can't infer the type of parameter `x`".
Write the parameter's type, as a named function has it; the return type can be written too.
A longer body goes in braces, as in `fun(n: i64): string { … }`, and a closure that uses `return` needs its return type written.

```lugha {5}
fun apply(f: fun(i64): i64, x: i64): i64 = f(x);

fun main() {
    println(apply(fun(x) = x * 2, 21));
    let add_ten = fun(x: i64): i64 = x + 10;
    println(add_ten(5));
}
```

Add the types on line 5, or press Solve.
