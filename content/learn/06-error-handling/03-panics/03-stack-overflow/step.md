---
title: Stack overflow
start_output: 
---

`sum` on line 6 is the recursive sum from Recursive enums, and lines 14 to 17 build a list of a million `1`s.
Every call to `sum` waits for the next one to finish, and a million waiting calls don't fit in the program's stack.
It panics with `stack overflow`, the one panic that can't say where it happened.
Walk a long list with a loop instead: `while let` on line 9 takes one node at a time, and line 11 moves `rest` on to the next:

```lugha {7,8,9,10,11,12,13}
enum List {
    Nil,
    Cons(i64, List),
}

fun sum(list: List): i64 {
    let mut total = 0;
    let mut rest = list;
    while let Cons(head, next) = rest {
        total += head;
        rest = next;
    }
    total
}

fun main() {
    let mut list = List.Nil;
    for _ in 0..1000000 {
        list = List.Cons(1, list);
    }
    println(sum(list));
}
```

Replace the body of `sum`, or press Solve.
