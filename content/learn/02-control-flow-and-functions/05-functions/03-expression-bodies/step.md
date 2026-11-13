---
title: Expression bodies
---

A body that is a single expression can drop its braces too, with `=` standing in for them, as on line 1.
Run it, and it prints `21` again, because `= width * height;` means exactly the braces with `width * height` inside.

Its final `;` ends the declaration, so it doesn't throw the value away the way the `;` in step 2 did.
The return type is still written in this form, so you can see what `area` gives back without reading its body.
