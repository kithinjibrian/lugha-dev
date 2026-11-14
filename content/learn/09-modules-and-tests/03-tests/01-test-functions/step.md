---
title: Test functions
---

A test is a function with `@test` on the line before it, as on line 3 of `test/shapes_test.la`.
It takes no parameters and returns nothing; a test that does either is E0434.
`assert` on line 6 panics unless what it's given is true, and a panic fails the test.
`lugha.toml` names the package `geometry`, so line 1 imports `shapes` as `geometry.shapes`.
Press Test.
The Tests tab names each test by its file's path and its own name, `test.shapes_test.area_of_three`.
