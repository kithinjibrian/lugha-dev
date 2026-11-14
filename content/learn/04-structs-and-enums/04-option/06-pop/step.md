---
title: pop
---

`pop` removes the last element of an array and returns it as `Some`, or `None` when the array is empty.
`stack` on line 2 holds two numbers, and lines 3 to 5 pop three times.
What will the third `pop` print?
Press Run.

It prints `None`: popping an empty array isn't an error, and line 6 goes on to print the array, empty now.
Like `push`, `pop` changes the array, so `stack` needs `let mut`.
