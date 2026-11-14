---
title: Multiple files
---

A program can be split across several files, and each file is a module named by its path from `main.la`'s folder, without `.la`.
`src/shapes.la`, in the file list, is the module `shapes`: it declares `Square` and two functions.
Line 1 of `main.la`, `import shapes;`, loads it, and the rest of `main` uses what `shapes.la` declares.
Press Run.
