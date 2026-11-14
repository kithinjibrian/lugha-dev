---
title: collect, sum, count and find
---

Some helpers give back one answer instead of another iterator, worked out from every value they pull.
`sum()` and `count()` on lines 3 and 4 add the values up and count them.
`find` on line 5 gives the first value its closure returns `true` for, as an `Option`, since there may be none.
`min`, `max` and `position` on lines 6 to 8 give `Option`s for the same reason.
`collect()` on line 9 is one of them too, and `fold`, `any` and `all` from Array helpers work on iterators as well.
Press Run.

Every line uses the same `scores`, because a helper works on its own copy of the iterator and leaves `scores` as it was.
