---
title: Private fields
start_error: E0313
---

A field can be `private` too, and then only its own module can set or read it.
`Range` in `range.la` keeps `lo` no larger than `hi`: its `new` swaps them when needed.
Line 4 of `main.la` writes a `Range` literal with `lo` above `hi`.
Press Run.

It's E0313 again, this time for a field: "`hi` is private to module `range`".
Outside its module, a struct literal needs every field visible, so a `Range` has to be built with `new`.
The fixed `main.la`:

```lugha {4}
import range;

fun main() {
    let r = range.Range.new(5, 1);
    println(r.size());
}
```

Change line 4 to `range.Range.new(5, 1)`, or press Solve.

Only `range.la` can set `lo` and `hi`, so every `Range` built anywhere else has come through `new`, with `lo` no larger than `hi`.
