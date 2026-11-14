---
title: Counters with Ref
start_error: E0511
---

A closure never changes the variables it copies.
`tick` on line 3 tries to add `1` to `count`.

Line 3 is E0511, "can't change `count`: closures capture by copy".
Its help says to return a new value instead.
To share a count, make it a `Ref`: the closure copies the handle, and both reach the same box, as in the Ref lesson:

```lugha {2,3,6}
fun main() {
    let count = Ref.new(0);
    let tick = fun() { count.set(count.get() + 1); };
    tick();
    tick();
    println(count.get());
}
```

Make `count` a `Ref` on lines 2, 3 and 6, or press Solve.
