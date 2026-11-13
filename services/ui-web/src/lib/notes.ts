// Splits the notes shown beside example code from the code. An example's main.la carries its
// notes as `//:` lines at the start of a line. Each run of them starts a new
// piece of code and is that piece's note. The site shows the code without them;
// the file runs as written.

/** Holds one piece: its note ("" for code before the first note) and its lines in the shown code, from 1. */
export interface Piece {
  note: string;
  first: number;
  /** Less than `first` when the note has no code after it. */
  last: number;
}

/** Holds an example's shown code and its pieces. */
export interface Split {
  /** The source without its note lines. */
  code: string;
  pieces: Piece[];
}

const MARK = "//:";

/** Splits an example's source into the code shown and its pieces, each with its note. */
export function splitNotes(source: string): Split {
  if (source === "") {
    return { code: "", pieces: [] };
  }
  const ends = source.endsWith("\n");
  const lines = (ends ? source.slice(0, -1) : source).split("\n");
  const kept: string[] = [];
  const pieces: Piece[] = [];
  let current: Piece | null = null;
  let inNote = false;

  for (const line of lines) {
    if (line.startsWith(MARK)) {
      const text = line.slice(MARK.length).trim();
      if (inNote && current) {
        current.note = current.note === "" ? text : `${current.note} ${text}`;
      } else {
        current = { note: text, first: kept.length + 1, last: kept.length };
        pieces.push(current);
      }
      inNote = true;
      continue;
    }
    inNote = false;
    if (!current) {
      current = { note: "", first: 1, last: 0 };
      pieces.push(current);
    }
    kept.push(line);
    current.last = kept.length;
  }

  const code = kept.join("\n") + (ends && kept.length > 0 ? "\n" : "");
  return { code, pieces };
}
