// The Tests tab's text: lughac test's own line shapes (src/driver/test.rs and
// test_json.rs at m154), from the JSON lines the API passes on. Tests are in
// file order, as lughac prints them. A failure shows its panic, its place and
// its output: what the JSON carries.
import type { Summary, TestLine, TestOutcome } from "./api";

function line(t: TestLine): string {
  if (t.status === "passed") return `test ${t.name} ... ok\n`;
  if (t.status === "skipped") return `test ${t.name} ... skipped (${t.message})\n`;
  let out = `test ${t.name} ... FAILED\n`;
  if (t.message !== "") {
    const at = t.at ? ` at ${t.at.file}:${t.at.line}:${t.at.col}` : "";
    out += `    panic: ${t.message}${at}\n`;
  }
  if (t.output !== "") {
    out += "    --- output ---\n";
    for (const l of t.output.replace(/\n$/, "").split("\n")) out += `    ${l}\n`;
  }
  return out;
}

export function summaryText(s: Summary): string {
  let extra = s.skipped > 0 ? `, ${s.skipped} skipped` : "";
  if (s.uncompiled === 1) extra += ", 1 file didn't compile";
  if (s.uncompiled > 1) extra += `, ${s.uncompiled} files didn't compile`;
  const n = s.passed + s.failed + s.skipped;
  if (n === 0) return `0 tests${extra}\n`;
  return `\n${n} ${n === 1 ? "test" : "tests"}: ${s.passed} passed, ${s.failed} failed${extra}\n`;
}

export function testText(r: Extract<TestOutcome, { state: "tested" }>): string {
  const sorted = [...r.tests].sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
  return sorted.map(line).join("") + summaryText(r.summary);
}
