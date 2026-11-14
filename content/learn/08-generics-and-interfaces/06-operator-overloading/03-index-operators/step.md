---
title: Index operators
---

`[ ]` is an operator too.
`set_index` makes `grid[1, 0] = 5` on line 17 write a value, and `index` makes line 19 read it back.
`set_index` takes `mut self`, so `grid` needs `let mut`, as an array does.
Several indexes, as in `grid[1, 0]`, arrive as one tuple, which lines 5 and 10 take apart, and a single index is a plain parameter, such as `at: i64`.
They're ordinary methods too: lines 20 and 21 call `set_index` and `index` by name, with the tuple written out.
Press Run.
