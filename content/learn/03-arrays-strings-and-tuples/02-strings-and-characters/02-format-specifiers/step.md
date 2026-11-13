---
title: Format specifiers
---

A `:` after the expression starts a specifier, which changes how the value is written.
Line 4 adds `:.2` to `share`, which asks for two decimals.
Will `.2` round `0.666…` or cut it off?

It rounds, to `0.67`, and a precision like `.2` works only on floats.
Lines 5 and 6 ask for a width of 6: `>` puts `42` at the end of its six characters and `<` at the start.
A `0` before the width pads with zeros, as on line 7, and on line 8 `x` writes the number in hex and `#` puts `0x` in front.
