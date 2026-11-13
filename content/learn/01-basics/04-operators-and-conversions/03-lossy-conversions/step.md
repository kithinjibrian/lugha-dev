---
title: Lossy conversions
---

`as` never fails, so a value that doesn't fit its new type comes out changed.
Line 2 turns `3.99` into an `i64`.
Will you get `3` or `4`?

It's `3`, and if you said `4`, you were expecting `as` to round.
A float becomes an integer by dropping its fraction, as line 3 shows for a negative too.
Line 4 narrows `300` into a `u8` by keeping only its lowest 8 bits, so it wraps around to `44`.
Line 5 is a float too big for an `i64`, and a float doesn't wrap: it stops at the largest `i64`.
