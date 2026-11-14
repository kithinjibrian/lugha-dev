---
title: panic
---

`panic` stops the program with a message.
`check_age` on line 1 panics on line 3 when it's given a negative age, and line 10 passes it `-1`.
Press Run.

The panic prints its message and where it happened, `src/main.la:3:9`, and the program exits with code 101.
Nothing in the program can stop a panic once it starts, so line 11 never prints `done`.
