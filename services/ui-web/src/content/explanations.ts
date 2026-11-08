// lughac's explanations (PRP-002, WEB-8), from generated/explanations.txt
// (scripts/explanations.sh, or the Dockerfile's first stage): every code's
// `lughac explain` text, each after a line "%%% CODE". Under an error the
// panel shows the first paragraph; "More about E0501" shows the rest.
import { err, ok, type Result } from "../lib/result";
import { renderMarkdown, type Highlight } from "./markdown";

export interface Explanation {
  title: string;
  first: string;
  rest: string;
}

export function parseExplanations(text: string, highlight: Highlight): Result<Record<string, Explanation>, string[]> {
  const out: Record<string, Explanation> = {};
  const problems: string[] = [];
  const chunks = text.split(/^%%% /m).slice(1);
  if (chunks.length === 0) return err(["the explanations are empty"]);
  for (const chunk of chunks) {
    const [code, title, ...body] = chunk.split("\n");
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
  return problems.length > 0 ? err(problems) : ok(out);
}
