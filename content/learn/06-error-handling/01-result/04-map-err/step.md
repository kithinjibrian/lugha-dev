---
title: map_err
---

`map_err` changes the error inside an `Err`, and leaves an `Ok` as it is.
It takes a function from the old error to the new one, here `explain` on line 1, passed by name as `update` took `add_one`.
This run starts with no `notes.txt` too, so line 5 prints the failed read as it is.
Line 6 prints it again with the file's name added to the message.
Press Run.
