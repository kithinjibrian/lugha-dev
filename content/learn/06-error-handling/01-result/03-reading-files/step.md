---
title: Reading files
start_output: can't read notes.txt: No such file or directory\n
---

`read_file` reads a whole file into a string, and since that can fail, it gives a `Result<string, string>`.
Line 2 matches on it: `Ok` holds the file's text, and `Err` the system's message.
Each run starts with no files, so there's no `notes.txt` yet, and the program prints the error.

Write the file first, on a new line 2, with `write_file`.
It gives a `Result` too, `Ok` with the number of bytes written, and line 2 prints it:

```lugha {2}
fun main() {
    println(write_file("notes.txt", "milk\neggs\n"));
    match read_file("notes.txt") {
        Ok(text) => print(text),
        Err(e) => println("can't read notes.txt: {e}"),
    }
}
```

Add line 2, or press Solve.
