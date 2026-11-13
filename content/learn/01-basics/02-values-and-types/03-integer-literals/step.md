---
title: Integer literals
---

Whole numbers print in plain decimal, however you write them.
`_` separates digits, and `0x`, `0b` and `0o` start hex, binary and octal, on lines 2 to 5.
Line 6 writes `017`.
Before you run it, decide what it prints.

It prints `17`, with warning W0107.
If you expected `15`, you were expecting a leading zero to mean octal, the way `0o` does on line 5.
In Lugha a leading zero changes nothing, so octal is always written `0o17`.
