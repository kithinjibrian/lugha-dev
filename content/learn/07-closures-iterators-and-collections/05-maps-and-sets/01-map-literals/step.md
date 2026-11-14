---
title: Map literals
---

A map holds values under keys, written `#{key: value}`.
The `#` tells a map from a block, which `{` alone starts.
`ages` on line 2 is a `Map<string, i64>`.
`ages["ann"]` on line 3 reads a value, and line 4 adds a key by assigning to it.
Line 5 changes a value where it is, with `+=`.
An empty `#{}` takes its type from where it's used, as `[]` does, and line 7 writes it out.
Press Run.
