// Checks a lesson step's diagram before it goes inline in a page. The SVG may hold only
// plain shapes and text from an allow-list, coloured through the `d-` classes the step styles give
// the design tokens. It's read with a small tokeniser of its own and written back from what was
// read, so nothing unchecked reaches the page.
import { err, ok, type Result } from "../lib/result";

const SVG_NS = "http://www.w3.org/2000/svg";

const ELEMENTS = new Set([
  "svg", "g", "defs", "marker", "title", "desc",
  "rect", "circle", "ellipse", "line", "polyline", "polygon", "path", "text", "tspan",
]);
/** Where text may appear. */
const HOLDS_TEXT = new Set(["text", "tspan", "title", "desc"]);
/** The classes the step styles colour with the design tokens. */
const CLASSES = new Set(["d-name", "d-value", "d-note", "d-box", "d-line", "d-arrow", "d-head"]);

const NUMBER = /^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/;
const NUMBERS = /^[-+0-9.eE,\s]+$/;
const ID = /^[A-Za-z][\w-]*$/;

/** Each allowed attribute, with the values it may take. */
const ATTRIBUTES: Record<string, (v: string) => boolean> = {
  viewBox: (v) => NUMBERS.test(v),
  x: (v) => NUMBER.test(v), y: (v) => NUMBER.test(v),
  x1: (v) => NUMBER.test(v), y1: (v) => NUMBER.test(v), x2: (v) => NUMBER.test(v), y2: (v) => NUMBER.test(v),
  cx: (v) => NUMBER.test(v), cy: (v) => NUMBER.test(v), r: (v) => NUMBER.test(v),
  rx: (v) => NUMBER.test(v), ry: (v) => NUMBER.test(v),
  width: (v) => NUMBER.test(v), height: (v) => NUMBER.test(v),
  d: (v) => /^[MmLlHhVvCcSsQqTtAaZz0-9.,eE\s+-]+$/.test(v),
  points: (v) => NUMBERS.test(v),
  "text-anchor": (v) => ["start", "middle", "end"].includes(v),
  "dominant-baseline": (v) => ["auto", "middle", "central", "hanging", "alphabetic"].includes(v),
  id: (v) => ID.test(v),
  refX: (v) => NUMBER.test(v), refY: (v) => NUMBER.test(v),
  markerWidth: (v) => NUMBER.test(v), markerHeight: (v) => NUMBER.test(v),
  orient: (v) => v === "auto" || v === "auto-start-reverse" || NUMBER.test(v),
};
/** Attributes only some elements may have. */
const ONLY_ON: Record<string, Set<string>> = {
  width: new Set(["rect", "marker"]),
  height: new Set(["rect", "marker"]),
};
const ENTITIES = new Set(["&amp;", "&lt;", "&gt;", "&quot;", "&apos;"]);

/** Looks at one attribute; a sentence when it isn't allowed. */
function attributeProblem(element: string, name: string, value: string): string | null {
  if (name === "xmlns") return value === SVG_NS ? null : "the diagram's `xmlns` isn't the SVG namespace";
  if (name === "class") {
    const unknown = value.split(/\s+/).find((c) => c !== "" && !CLASSES.has(c));
    return unknown === undefined ? null : `the diagram uses the class \`${unknown}\``;
  }
  if (name === "marker-start" || name === "marker-end") {
    return /^url\(#[A-Za-z][\w-]*\)$/.test(value) ? null : `the diagram's \`${name}\` isn't a local url(#id)`;
  }
  if (name === "transform") {
    return /^(\s*(translate|rotate|scale)\([-+0-9.eE,\s]*\)\s*)+$/.test(value)
      ? null
      : "the diagram's `transform` uses something other than translate, rotate and scale";
  }
  if (/^(fill|stroke|style|color|opacity|font|font-.*|stroke-.*|fill-.*)$/.test(name)) {
    return `the diagram uses the attribute \`${name}\`: colours and fonts come from the \`d-\` classes`;
  }
  const check = ATTRIBUTES[name];
  if (!check) return `the diagram uses the attribute \`${name}\``;
  if (ONLY_ON[name] && !ONLY_ON[name].has(element)) return `the diagram uses the attribute \`${name}\` on \`${element}\``;
  return check(value) ? null : `the diagram's \`${name}\` has a value it can't hold: ${value}`;
}

/** Checks text between tags: only the five XML entities. */
function textProblem(text: string): string | null {
  for (const m of text.matchAll(/&[^;\s]*;?/g)) {
    if (!ENTITIES.has(m[0])) return `the diagram uses the entity \`${m[0]}\``;
  }
  return null;
}

/**
 * Checks a diagram's SVG against the allow-list and writes it back from what was read.
 *
 * Errors: a sentence naming the first element, attribute, class, entity or construct that isn't
 * allowed, or what makes the file not well-formed.
 */
export function checkDiagram(source: string): Result<string, string> {
  const notWellFormed = (why: string) => err(`the diagram isn't well-formed SVG: ${why}`);
  let out = "";
  const open: string[] = [];
  let rootSeen = false;
  let rest = source.trim();

  while (rest.length > 0) {
    if (rest.startsWith("<!--")) return err("the diagram has a comment");
    if (rest.startsWith("<!") || rest.startsWith("<?")) return err("the diagram has a declaration (<!…> or <?…>)");

    if (rest.startsWith("</")) {
      const m = /^<\/([A-Za-z][\w-]*)\s*>/.exec(rest);
      if (!m) return notWellFormed("a closing tag is broken");
      if (open.at(-1) !== m[1]) {
        return notWellFormed(open.includes(m[1]) ? `\`${open.at(-1)}\` isn't closed` : `\`${m[1]}\` is closed without being open`);
      }
      open.pop();
      out += `</${m[1]}>`;
      rest = rest.slice(m[0].length);
      if (open.length === 0) rest = rest.trim();
      continue;
    }

    if (rest.startsWith("<")) {
      const name = /^<([A-Za-z][\w-]*)/.exec(rest);
      if (!name) return notWellFormed("a tag is broken");
      const element = name[1];
      if (open.length === 0) {
        if (rootSeen) return notWellFormed("there's more than one outer element");
        if (element !== "svg") return err(`the diagram's outer element is \`${element}\`, not \`svg\``);
        rootSeen = true;
      }
      if (!ELEMENTS.has(element)) return err(`the diagram uses the element \`${element}\``);
      rest = rest.slice(name[0].length);
      let tag = `<${element}`;
      for (;;) {
        const space = /^\s*/.exec(rest)![0];
        rest = rest.slice(space.length);
        if (rest.startsWith("/>") || rest.startsWith(">")) break;
        if (space === "") return notWellFormed("attributes need a space between them");
        const attr = /^([A-Za-z][\w:-]*)\s*=\s*"([^"<]*)"/.exec(rest);
        if (!attr) return notWellFormed(/^[A-Za-z][\w:-]*\s*=\s*'/.test(rest) ? "attributes take double quotes" : "an attribute is broken");
        const [, attrName, value] = attr;
        const problem = attributeProblem(element, attrName, value) ?? textProblem(value);
        if (problem) return err(problem);
        tag += ` ${attrName}="${value}"`;
        rest = rest.slice(attr[0].length);
      }
      if (rest.startsWith("/>")) {
        out += tag + "/>";
        rest = rest.slice(2);
        if (open.length === 0) rest = rest.trim();
      } else {
        out += tag + ">";
        open.push(element);
        rest = rest.slice(1);
      }
      continue;
    }

    const text = /^[^<]+/.exec(rest)![0];
    if (open.length === 0) return notWellFormed("there's text outside the outer element");
    if (text.trim() !== "" && !HOLDS_TEXT.has(open.at(-1)!)) return err("the diagram has text outside text, tspan, title and desc");
    const problem = textProblem(text);
    if (problem) return err(problem);
    out += text;
    rest = rest.slice(text.length);
    if (open.length === 0) rest = rest.trim();
  }

  if (open.length > 0) return notWellFormed(`\`${open.at(-1)}\` isn't closed`);
  if (!rootSeen) return notWellFormed("it has no `svg` element");
  return ok(out);
}
