---
title: Custom equality: eq and hash
start_error: E0454
---

A type can decide what equal means for itself with a method `eq`.
`eq` on line 4 counts two users as equal when their `id`s are, whatever their names.
Line 10 compares two of them, and line 11 puts both in a set.
Press Run.

`lughac` gives E0454 on lines 10 and 11: `User` has its own `eq` but no `hash`, and equal values must hash equal.
`==` and sets both rely on the pair, so a type that writes `eq` writes `hash` too.
`h` is the hash so far, and `hash` folds `id` into it, the one field `eq` compares:

```lugha {5}
struct User { id: i64, name: string }

impl User {
    fun eq(self, other: User): bool = self.id == other.id;
    fun hash(self, h: u64): u64 = self.id.hash(h);
}

fun main() {
    let a = User { id: 7, name: "Ann" };
    let b = User { id: 7, name: "Ann B." };
    println(a == b);
    println(#{a, b}.len);
}
```

Add `hash` as line 5; Solve does it for you.
