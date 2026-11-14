---
title: Arithmetic operators
start_error: E0404
---

An operator on a struct of your own calls a method of the first value's type.
`+` calls `add`, `-` calls `sub`, `*` calls `mul`, `/` calls `div`, `%` calls `rem`, and a leading `-` calls `neg`.
Line 6 adds two `Vec2`s, and `Vec2` has no `add` yet.
Press Run.

`lughac` gives E0404, "cannot apply `+` to Vec2", on line 6, and the same for line 7's `+=`.
An `add` with a plain `self`, one parameter and a result makes `+` work.
`b += a` on line 7 is then `b = b.add(a)`, and `-=` and the others go through their methods the same way:

```lugha {3,4,5}
struct Vec2 { x: f64, y: f64 }

impl Vec2 {
    fun add(self, other: Vec2): Vec2 = Vec2 { x: self.x + other.x, y: self.y + other.y };
}

fun main() {
    let a = Vec2 { x: 1.0, y: 2.0 };
    let mut b = Vec2 { x: 3.0, y: 4.0 };
    println(a + b);
    b += a;
    println(b);
}
```

Add the `impl` with `add`; Solve does it for you.
