// Share links (PRP-002, WEB-5): /playground#v1.<data>, where <data> is the
// project as JSON, compressed (deflate-raw) and base64url-encoded. The link is
// never sent to a server: it only lives after the #.
import type { File, Project } from "./project";
import { err, ok, type Result } from "./result";

/** The most compressed bytes a link may carry. */
export const SHARE_LIMIT = 16 * 1024;

const PREFIX = "v1.";

interface Wire {
  files: File[];
  args?: string[];
  stdin?: string;
}

export async function encodeShare(project: Project): Promise<Result<string, "too-big">> {
  const wire: Wire = { files: project.files };
  if (project.args.length > 0) wire.args = project.args;
  if (project.stdin !== "") wire.stdin = project.stdin;
  const bytes = await squeeze(new TextEncoder().encode(JSON.stringify(wire)), "compress");
  if (bytes.length > SHARE_LIMIT) {
    return err("too-big");
  }
  return ok(PREFIX + toBase64url(bytes));
}

export async function decodeShare(
  link: string,
): Promise<Result<Project, "unknown-version" | "corrupt">> {
  const body = link.startsWith("#") ? link.slice(1) : link;
  if (!body.startsWith(PREFIX)) {
    return err("unknown-version");
  }
  try {
    const bytes = fromBase64url(body.slice(PREFIX.length));
    if (bytes.length === 0 || bytes.length > SHARE_LIMIT) {
      return err("corrupt");
    }
    const text = new TextDecoder("utf-8", { fatal: true }).decode(
      await squeeze(bytes, "decompress"),
    );
    const project = asProject(JSON.parse(text));
    return project ? ok(project) : err("corrupt");
  } catch {
    return err("corrupt");
  }
}

function asProject(v: unknown): Project | null {
  if (typeof v !== "object" || v === null) return null;
  const w = v as Record<string, unknown>;
  if (!Array.isArray(w.files)) return null;
  const files: File[] = [];
  for (const f of w.files) {
    if (typeof f !== "object" || f === null) return null;
    const { path, text } = f as Record<string, unknown>;
    if (typeof path !== "string" || typeof text !== "string") return null;
    files.push({ path, text });
  }
  const args = w.args ?? [];
  if (!Array.isArray(args) || !args.every((a) => typeof a === "string")) return null;
  const stdin = w.stdin ?? "";
  if (typeof stdin !== "string") return null;
  return { files, args, stdin };
}

async function squeeze(bytes: Uint8Array, way: "compress" | "decompress"): Promise<Uint8Array> {
  const stream =
    way === "compress"
      ? new CompressionStream("deflate-raw")
      : new DecompressionStream("deflate-raw");
  const out = new Blob([bytes as BlobPart]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

function toBase64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Throws on characters outside base64url; decodeShare catches it. */
function fromBase64url(text: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]*$/.test(text)) {
    throw new Error("not base64url");
  }
  const b64 = text.replace(/-/g, "+").replace(/_/g, "/");
  const s = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
}
