---
title: Custom ordering: cmp
start_error: E0419
---

`sort` on line 5 needs an order for `Version`, and `Version` has none yet.
Press Run.

It's E0419 again, as in Array helpers, and its help says what to do: give `Version` a `cmp` method.
`cmp` returns an `Ordering`, one of `Ordering.Less`, `Ordering.Equal` and `Ordering.Greater`, here comparing `major` first and `minor` after it.
Then `sort` uses it, as do `<`, `<=`, `>` and `>=`, though `==` still compares the fields:

```lugha {3,4,5,6,7,8,9,10,11,12,13,14,15,16,21}
struct Version { major: i64, minor: i64 }

impl Version {
    fun cmp(self, other: Version): Ordering {
        if self.major != other.major {
            return if self.major < other.major { Ordering.Less } else { Ordering.Greater };
        }
        if self.minor < other.minor {
            Ordering.Less
        } else if self.minor > other.minor {
            Ordering.Greater
        } else {
            Ordering.Equal
        }
    }
}

fun main() {
    let versions = [Version { major: 2, minor: 0 }, Version { major: 1, minor: 9 }, Version { major: 1, minor: 10 }];
    println(versions.sort());
    println(versions[1] < versions[0]);
}
```

Add the `impl` with `cmp`, and line 21; Solve does it for you.
