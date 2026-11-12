// Download (PRP-002): the project as a .zip, stored without compression.
// The files go inside one folder, so unzipping makes a project.
import type { File } from "./project";

const TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

export function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (const b of bytes) c = TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

export function makeZip(files: File[], folder: string): Uint8Array<ArrayBuffer> {
  const enc = new TextEncoder();
  const parts: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  for (const f of files) {
    const name = enc.encode(`${folder}/${f.path}`);
    const data = enc.encode(f.text);
    const crc = crc32(data);
    // Version 20, flag 0x0800 (names are UTF-8), stored, no time.
    const local = header(30, name, [[0, 0x04034b50, 4], [4, 20, 2], [6, 0x0800, 2], [14, crc, 4], [18, data.length, 4], [22, data.length, 4], [26, name.length, 2]]);
    central.push(
      header(46, name, [[0, 0x02014b50, 4], [4, 20, 2], [6, 20, 2], [8, 0x0800, 2], [16, crc, 4], [20, data.length, 4], [24, data.length, 4], [28, name.length, 2], [42, offset, 4]]),
    );
    parts.push(local, data);
    offset += local.length + data.length;
  }
  const size = central.reduce((n, c) => n + c.length, 0);
  const end = header(22, new Uint8Array(), [[0, 0x06054b50, 4], [8, files.length, 2], [10, files.length, 2], [12, size, 4], [16, offset, 4]]);
  const all = [...parts, ...central, end];
  const out = new Uint8Array(all.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of all) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

/** A record of `size` bytes with `fields` ([offset, value, width]) set, then `name`. */
function header(size: number, name: Uint8Array, fields: [number, number, 2 | 4][]): Uint8Array {
  const b = new Uint8Array(size + name.length);
  const v = new DataView(b.buffer);
  for (const [at, value, width] of fields) {
    if (width === 2) v.setUint16(at, value, true);
    else v.setUint32(at, value, true);
  }
  b.set(name, size);
  return b;
}
