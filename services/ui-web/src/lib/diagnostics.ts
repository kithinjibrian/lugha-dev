// Reads lughac's diagnostics, which the API passes through unchanged, and gives the text shown for
// each. The text is lughac's own `rendered` field. `lughac` has no `rendered` field yet, so until it
// does the text is the header, location and help from the JSON, never a drawing of our own.

/** Holds the parts of one of lughac's diagnostics that the site shows. */
export interface Diagnostic {
  severity: "error" | "warning";
  code: string;
  message: string;
  file: string;
  line: number;
  col: number;
  help: string | null;
  rendered: string | null;
}

/** Reads the diagnostics in `v` (an array of lughac's JSON objects), skipping anything malformed. */
export function asDiagnostics(v: unknown): Diagnostic[] {
  if (!Array.isArray(v)) return [];
  return v.flatMap((item) => {
    const d = asDiagnostic(item);
    return d ? [d] : [];
  });
}

function asDiagnostic(v: unknown): Diagnostic | null {
  if (typeof v !== "object" || v === null) return null;
  const o = v as Record<string, unknown>;
  const start = (o.span as { start?: { line?: unknown; col?: unknown } } | undefined)?.start;
  if (
    (o.severity !== "error" && o.severity !== "warning") ||
    typeof o.code !== "string" ||
    typeof o.message !== "string" ||
    typeof o.file !== "string" ||
    typeof start?.line !== "number" ||
    typeof start.col !== "number"
  ) {
    return null;
  }
  return {
    severity: o.severity,
    code: o.code,
    message: o.message,
    file: o.file,
    line: start.line,
    col: start.col,
    help: typeof o.help === "string" ? o.help : null,
    rendered: typeof o.rendered === "string" ? o.rendered : null,
  };
}

/** Gives a diagnostic's text: lughac's `rendered` when it has one, otherwise one built from its fields. */
export function text(d: Diagnostic): string {
  if (d.rendered !== null) return d.rendered;
  let out = `${d.severity}[${d.code}]: ${d.message}\n  --> ${d.file}:${d.line}:${d.col}\n`;
  if (d.help !== null) out += `  = help: ${d.help}\n`;
  return out;
}

/** Gives the lines in `file` holding an error, in order, once each, for the editor to mark. */
export function errorLines(ds: Diagnostic[], file: string): number[] {
  const lines = ds.filter((d) => d.severity === "error" && d.file === file).map((d) => d.line);
  return [...new Set(lines)].sort((a, b) => a - b);
}
