---
title: Break out of the outer loop
start_output: 1 1\n1 2\n1 3\n2 1\n3 1\n3 2\n3 3\n
---

One `for` runs inside another, printing each `row` and `col` pair, and line 5 should stop everything at the first pair whose product is 4.
The `break` there ends only the inner loop, the one it's in, so row 2 prints `2 1` and stops, and row 3 runs as normal.
To leave the outer loop, give it a label, a name followed by `:`, before its `for`, and name it after `break`:

```lugha {2,5}
fun main() {
    outer: for row in 1..4 {
        for col in 1..4 {
            if row * col == 4 {
                break outer;
            }
            println("{row} {col}");
        }
    }
}
```

`continue outer;` works the same way, going on to the outer loop's next turn.
Add `outer:` on line 2 and `outer` after `break` on line 5, or press Solve.
