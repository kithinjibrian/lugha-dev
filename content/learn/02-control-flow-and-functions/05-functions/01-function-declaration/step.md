---
title: Function declaration
---

So far `main` has been the only function, and a new one is declared the same way.
After `fun` and the name come its parameters with their types, and after the `)` a `:` and the type it gives back.
`main` calls `area` on line 6.
Press Run.

It prints `21`.
`area` comes first here, but the order of functions in a file doesn't matter, so `main` could be at the top instead.
The types are what matter: `lughac` works out a `let`'s type from its value, but never a parameter's type, and never a return type from the body.
Leave the return type off, as `main` does on line 5, and the function gives back `()`.
