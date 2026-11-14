---
title: public
start_error: E0318
---

`public` makes an item visible to other packages too, the ones that import its module.
Line 3 of `shapes.la` declares `unit` as `public`, but it returns a `Square`, which has no keyword.
Press Run.

That's E0318: another package could call `unit` but couldn't name the `Square` it returns.
A `public` declaration may mention only structs, enums and interfaces that are `public` too, so `Square` needs the keyword.
`side` still has none, so another package could hold a `Square` but not read its `side`.
The fixed `shapes.la`:

```lugha {1}
public struct Square { side: f64 }

public fun unit(): Square = Square { side: 1.0 };
```

Add `public` before `struct Square` on line 1; Solve does it for you.
