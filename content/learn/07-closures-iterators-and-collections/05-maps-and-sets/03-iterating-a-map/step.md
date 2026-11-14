---
title: Iterating a map
start_error: E0442
---

A map can be looped over like an array: each entry is a tuple of key and value, in the order the keys were added.
Line 3 loops with `mut`, meaning to double each price where it is.
Press Run.

`lughac` stops at line 3 with E0442: `for … of mut` can't change a map in place, and the E0501 on line 4 follows from it.
Loop over `prices.keys()` instead, and assign each `prices[item]`.
Then a plain `for (item, price) of prices` on line 6 reads the entries, and `values()` on line 9 gives the values in the same order.

```lugha {3,4,6,7,8,9}
fun main() {
    let mut prices = #{"tea": 3, "milk": 2};
    for item of prices.keys() {
        prices[item] *= 2;
    }
    for (item, price) of prices {
        println("{item}: {price}");
    }
    println(prices.values());
}
```

Change lines 3 and 4, or press Solve.
