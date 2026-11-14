---
title: Defer order
---

When a block has several defers, they run last first, so line 3's runs before line 2's.
A defer inside a loop belongs to the loop's block, so line 5's runs at the end of each pass, not at the end of `main`.
Press Run.
