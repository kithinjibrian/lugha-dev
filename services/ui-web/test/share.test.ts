import { describe, expect, it } from "vitest";
import { decodeShare, encodeShare, SHARE_LIMIT } from "../src/lib/share";
import type { Project } from "../src/lib/project";

const project: Project = {
  files: [
    { path: "src/main.la", text: 'fun main() {\n    println("héllo {1 + 1}");\n}\n' },
    { path: "lugha.toml", text: '[package]\nname = "playground"\n' },
  ],
  args: ["one", "two words"],
  stdin: "a\nb\n",
};

describe("share links", () => {
  it("round-trips files, arguments and stdin", async () => {
    const link = await encodeShare(project);
    expect(link.ok).toBe(true);
    if (!link.ok) return;
    expect(link.value.startsWith("v1.")).toBe(true);
    expect(link.value).toMatch(/^v1\.[A-Za-z0-9_-]+$/);
    expect(await decodeShare(link.value)).toEqual({ ok: true, value: project });
  });

  it("accepts the link with its #", async () => {
    const link = await encodeShare(project);
    if (!link.ok) throw new Error("encode failed");
    expect(await decodeShare(`#${link.value}`)).toEqual({ ok: true, value: project });
  });

  it("leaves out empty arguments and stdin, and gives them back empty", async () => {
    const bare = { ...project, args: [], stdin: "" };
    const link = await encodeShare(bare);
    if (!link.ok) throw new Error("encode failed");
    expect(await decodeShare(link.value)).toEqual({ ok: true, value: bare });
  });

  it("refuses a project too big to share", async () => {
    const bytes = crypto.getRandomValues(new Uint8Array(40_000));
    const noise = Array.from(bytes, (b) => String.fromCharCode(33 + (b % 90))).join("");
    const big = { ...project, files: [{ path: "src/main.la", text: noise }] };
    expect(await encodeShare(big)).toEqual({ ok: false, error: "too-big" });
    expect(SHARE_LIMIT).toBe(16 * 1024);
  });

  it("refuses an unknown version", async () => {
    const link = await encodeShare(project);
    if (!link.ok) throw new Error("encode failed");
    const v2 = link.value.replace(/^v1\./, "v2.");
    expect(await decodeShare(v2)).toEqual({ ok: false, error: "unknown-version" });
    expect(await decodeShare("")).toEqual({ ok: false, error: "unknown-version" });
  });

  it("refuses a corrupt link without throwing", async () => {
    for (const bad of ["v1.", "v1.!!!", "v1.AAAA", "v1.q1YqUlKyUlJSqgUA"]) {
      expect(await decodeShare(bad)).toEqual({ ok: false, error: "corrupt" });
    }
  });

  it("refuses data that isn't a project", async () => {
    const wrong = [
      { files: "x" },
      { files: [{ path: 1, text: "" }] },
      { files: [], args: [3] },
      { files: [], stdin: 4 },
    ];
    for (const w of wrong) {
      const data = await deflate(JSON.stringify(w));
      expect(await decodeShare(`v1.${data}`)).toEqual({ ok: false, error: "corrupt" });
    }
  });
});

async function deflate(text: string): Promise<string> {
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream("deflate-raw"));
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
