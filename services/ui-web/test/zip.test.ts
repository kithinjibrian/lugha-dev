import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { crc32, makeZip } from "../src/lib/zip";

const files = [
  { path: "src/main.la", text: 'fun main() {\n    println("héllo");\n}\n' },
  { path: "lugha.toml", text: '[package]\nname = "playground"\n' },
];

describe("makeZip", () => {
  it("computes CRC-32 as zip does", () => {
    expect(crc32(new TextEncoder().encode("hello"))).toBe(0x3610a686);
    expect(crc32(new Uint8Array())).toBe(0);
  });

  it("makes a zip that unzip reads back, inside one folder", () => {
    const dir = mkdtempSync(join(tmpdir(), "zip-"));
    try {
      writeFileSync(join(dir, "p.zip"), makeZip(files, "playground"));
      expect(execFileSync("unzip", ["-Z1", join(dir, "p.zip")], { encoding: "utf8" })).toBe(
        "playground/src/main.la\nplayground/lugha.toml\n",
      );
      expect(execFileSync("unzip", ["-tq", join(dir, "p.zip")], { encoding: "utf8" })).toContain("No errors");
      expect(execFileSync("unzip", ["-p", join(dir, "p.zip"), "playground/src/main.la"], { encoding: "utf8" })).toBe(files[0].text);
    } finally {
      rmSync(dir, { recursive: true });
    }
  });
});
