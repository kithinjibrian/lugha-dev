// lughac's explanations (PRP-002, WEB-8), from generated/explanations.txt
// (scripts/explanations.sh, or the Dockerfile's first stage): every code's
// `lughac explain` text, each after a line "%%% CODE", after `lughac --version`
// under "%%% version". Under an error the
// panel shows the first paragraph; "More about E0501" shows the rest.
import { err, ok, type Result } from "../lib/result";
import { renderMarkdown, type Highlight } from "./markdown";

export interface Explanation {
  title: string;
  first: string;
  rest: string;
}

export interface Explained {
  /** What `lughac --version` printed: "lughac 0.1.0". */
  version: string;
  explanations: Record<string, Explanation>;
}

export function parseExplanations(text: string, highlight: Highlight): Result<Explained, string[]> {
  const out: Record<string, Explanation> = {};
  const problems: string[] = [];
  const chunks = text.split(/^%%% /m).slice(1);
  let version = "";
  for (const chunk of chunks) {
    const [code, title, ...body] = chunk.split("\n");
    if (code === "version") {
      version = (title ?? "").trim();
      continue;
    }
    const m = /^# ([EW]\d{4}): (.+)$/.exec(title ?? "");
    if (!m || m[1] !== code) {
      problems.push(`${code}: doesn't start with "# ${code}: title"`);
      continue;
    }
    const r = renderMarkdown(body.join("\n"), highlight, { lists: true });
    if (!r.ok) {
      problems.push(`${code}: ${r.error}`);
      continue;
    }
    const html = r.value.html;
    const cut = html.indexOf("</p>\n");
    const firstIsParagraph = html.startsWith("<p>") && cut >= 0;
    out[code] = {
      title: m[2],
      first: firstIsParagraph ? html.slice(0, cut + 5) : "",
      rest: firstIsParagraph ? html.slice(cut + 5) : html,
    };
  }
  if (!/^lughac \S+$/.test(version)) problems.push("the explanations don't start with lughac's version");
  if (Object.keys(out).length === 0) problems.push("the explanations are empty");
  return problems.length > 0 ? err(problems) : ok({ version, explanations: out });
}
