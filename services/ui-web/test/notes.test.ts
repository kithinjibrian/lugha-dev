import { describe, expect, it } from "vitest";
import { splitNotes } from "../src/lib/notes";

describe("splitNotes", () => {
  it("splits each note from the code after it", () => {
    const src = [
      "//: First note.",
      "fun main() {",
      "//: Second note.",
      '    println("hi");',
      "}",
      "",
    ].join("\n");
    const r = splitNotes(src);
    expect(r.code).toBe('fun main() {\n    println("hi");\n}\n');
    expect(r.pieces).toEqual([
      { note: "First note.", first: 1, last: 1 },
      { note: "Second note.", first: 2, last: 3 },
    ]);
  });

  it("joins a run of note lines into one note", () => {
    const r = splitNotes("//: One\n//: two.\nlet x = 1;\n");
    expect(r.pieces).toEqual([{ note: "One two.", first: 1, last: 1 }]);
  });

  it("gives code before the first note a piece with no note", () => {
    const r = splitNotes("import std.fs;\n//: Note.\nfun main() {}\n");
    expect(r.code).toBe("import std.fs;\nfun main() {}\n");
    expect(r.pieces).toEqual([
      { note: "", first: 1, last: 1 },
      { note: "Note.", first: 2, last: 2 },
    ]);
  });

  it("leaves a file without notes as one piece", () => {
    const r = splitNotes("fun main() {}\n");
    expect(r.code).toBe("fun main() {}\n");
    expect(r.pieces).toEqual([{ note: "", first: 1, last: 1 }]);
  });

  it("keeps a note with no code after it, as an empty piece", () => {
    const r = splitNotes("fun main() {}\n//: The end.\n");
    expect(r.pieces).toEqual([
      { note: "", first: 1, last: 1 },
      { note: "The end.", first: 2, last: 1 },
    ]);
  });

  it("keeps blank lines with the piece they're in", () => {
    const r = splitNotes("//: A.\nlet a = 1;\n\n//: B.\nlet b = 2;\n");
    expect(r.code).toBe("let a = 1;\n\nlet b = 2;\n");
    expect(r.pieces).toEqual([
      { note: "A.", first: 1, last: 2 },
      { note: "B.", first: 3, last: 3 },
    ]);
  });

  it("treats only //: at the start of a line as a note", () => {
    const src = 'let s = "//: not a note";\n    //: indented, still code\n';
    const r = splitNotes(src);
    expect(r.code).toBe(src);
    expect(r.pieces).toEqual([{ note: "", first: 1, last: 2 }]);
  });

  it("gives an empty file no pieces", () => {
    expect(splitNotes("")).toEqual({ code: "", pieces: [] });
  });
});
