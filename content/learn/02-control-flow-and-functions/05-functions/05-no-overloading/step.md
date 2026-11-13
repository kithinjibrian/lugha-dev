---
title: No overloading
start_error: E0302
---

Lines 1 and 3 both declare a function called `area`, one with two parameters and one with one.
Will line 7 call the one that takes a single number?

No: the output shows E0302, "`area` is defined more than once".
It also shows E0405 for line 7, which says the call gives one argument to an `area` that takes two.
Two functions can't share a name, whatever their parameters, and a parameter can't have a default value either, so each way of calling needs its own function.
Give the second one a name of its own:

```lugha {3,7}
fun area(width: i64, height: i64): i64 = width * height;

fun square_area(side: i64): i64 = side * side;

fun main() {
    println(area(7, 3));
    println(square_area(4));
}
```

Rename it on lines 3 and 7, or press Solve.
