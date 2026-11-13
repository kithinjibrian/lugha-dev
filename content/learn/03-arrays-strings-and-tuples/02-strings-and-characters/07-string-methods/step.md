---
title: String methods
---

Beyond single bytes, most work on a string goes through its methods.
Line 3 takes the spaces off both ends with `trim` and cuts the result at each comma with `split`, which gives a `string[]`.
`join` on line 5 puts an array of strings back together with a separator between them.
`contains` and `starts_with` give a `bool`, and `lines` on line 8 splits at each `\n`.
None of them changes the string: `line` on line 7 still has its spaces, so it's trimmed again.
