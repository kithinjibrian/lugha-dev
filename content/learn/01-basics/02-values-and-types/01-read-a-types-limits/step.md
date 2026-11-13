---
title: Read a type's limits
---

So far every value has been text or an exit code, and now for the types values come in.
Whole numbers have eight: `i8` to `i64` hold negative numbers too, and `u8` to `u64` start at zero.
The number in each name is the size in bits, and each type knows its own limits, which you read off its name as `MIN` and `MAX`.
Press Run.

Line 4 prints `255`, the largest number 8 bits can hold, and line 5 shows how far `i64` goes.
