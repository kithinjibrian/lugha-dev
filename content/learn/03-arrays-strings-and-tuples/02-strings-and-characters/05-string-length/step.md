---
title: String length
---

A string's `.len`, like an array's, is read without parentheses, and line 3 prints it for `Zoë`.
What will it print for a name of three letters?

It prints `4`, because `.len` counts bytes and `ë` takes two of them in UTF-8.
Line 4 counts characters with `char_count()`, a method you call, so it prints `3`.
