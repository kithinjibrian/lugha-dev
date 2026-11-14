---
title: Empty arrays
start_error: E0412
---

Now the list starts empty, and line 3 pushes a string into it.
Is pushing a string on line 3 enough to give `list` its type?

E0412, "cannot infer the element type of `[]`", means it can't.
`[]` has no elements to take a type from, and `lughac` doesn't look ahead to line 3 for one.
Write the type after a colon, here `string[]`:

```lugha {2}
fun main() {
    let mut list: string[] = [];
    list.push("milk");
    println(list);
}
```

Add `: string[]` on line 2.
