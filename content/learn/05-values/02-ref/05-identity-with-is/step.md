---
title: Identity with is
start_error: E0404
---

`b` on line 3 is a copy of `a`, so the two name one box, and `c` on line 4 is a second box that also holds `1`.
Lines 5 and 6 compare them with `==`.
Press Run and read the error.

That's E0404 again, "cannot apply `==` to `Ref<i64>`", with the help from the last step.
Boxes have no `==`.
`a.is(b)` asks whether both name the same box, and `a.get() == b.get()` compares what's inside.
To see which names share a box, use `is`:

```lugha {5,6}
fun main() {
    let a = Ref.new(1);
    let b = a;
    let c = Ref.new(1);
    println(a.is(b));
    println(a.is(c));
}
```

Change both lines to use `is`, or press Solve.
