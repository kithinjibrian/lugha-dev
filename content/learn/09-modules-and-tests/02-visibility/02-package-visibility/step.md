---
title: Package visibility
---

Without `private`, an item is visible in every module of its package, not only its own.
`lugha.toml`, in the file list, names this package `geometry`, and both `.la` files belong to it.
A program without a `lugha.toml` is one package too.
So `main.la` can build a `shapes.Square` on line 4, read its `side` field on line 5 and call `shapes.area` on line 6.
Press Run.
