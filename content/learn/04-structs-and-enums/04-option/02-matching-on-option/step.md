---
title: Matching on Option
---

`Option` is an enum, so a `match` gets at the value inside, as it did for `Shape`.
Line 13 matches on what `find` gives back for each name.
`Some(i)` on line 14 names the position `i`, and `None` on line 15 covers a name that isn't there.
Leaving out the `None` arm is E0417, so the program has to say what happens when a name isn't found.
Press Run.
