---
title: Sorting
start_error: E0419
---

`sort` gives back a new array in ascending order, for numbers and for strings, as lines 4 and 5 show.
Line 7 sorts people, and there's no order for two `Person`s to follow.

That's E0419, "`Person` doesn't satisfy `Ord`".
Its help suggests giving `Person` an order of its own, which comes in chapter 8.
`sort_by` takes the rule as a closure instead, one that says whether `a` comes before `b`.
It gives back a new array too, and people of the same age keep their order:

```lugha {7}
struct Person { name: string, age: i64 }

fun main() {
    println([3, 1, 2].sort());
    println(["pear", "fig", "apple"].sort());
    let people = [Person { name: "Ann", age: 31 }, Person { name: "Ben", age: 25 }];
    println(people.sort_by(fun(a, b) = a.age < b.age));
}
```

Sort the people by age on line 7, or press Solve.
