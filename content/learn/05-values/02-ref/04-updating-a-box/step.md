---
title: Updating a box
start_error: E0404
---

Line 5 tries to add `1` to `count` and put the result back.
Press Run and read the error.

E0404 calls `count` a `Ref<i64>`, a box holding an `i64`, and `+` needs the `i64` inside it.
The help under the error is about comparing boxes, which line 5 doesn't do.
`update` takes a function that gets an `i64` and returns one, calls it with what's in the box, and puts back what it returns.
`count.set(count.get() + 1)` does the same with two calls.
`add_one` on line 1 is such a function, and line 5 passes it by name: `add_one(0)` would call it, but `add_one` alone hands over the function:

```lugha {5}
fun add_one(n: i64): i64 = n + 1;

fun main() {
    let count = Ref.new(0);
    count.update(add_one);
    println(count.get());
}
```

Write `count.update(add_one)` on line 5, or press Solve.
