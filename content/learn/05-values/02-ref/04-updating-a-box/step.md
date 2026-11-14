---
title: Updating a box
start_error: E0404
---

Line 3 tries to add `1` to `count` and put the result back.
Press Run and read the error.

E0404 calls `count` a `Ref<i64>`, a box holding an `i64`, and `+` works on the number, not the box.
The help under the error is about comparing boxes, which line 3 doesn't do.
Get the number first, add to it, and set the result:

```lugha {3}
fun main() {
    let count = Ref.new(0);
    count.set(count.get() + 1);
    println(count.get());
}
```

Write `count.get() + 1` on line 3, or press Solve.
