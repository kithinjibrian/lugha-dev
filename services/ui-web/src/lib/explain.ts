// lughac's explanations in the browser: /content/v1/explanations.json,
// fetched the first time an error needs one, then kept for the page.
import type { Explanation } from "../content/explanations";

let loading: Promise<Record<string, Explanation>> | null = null;

export function explanations(): Promise<Record<string, Explanation>> {
  loading ??= fetch("/content/v1/explanations.json")
    .then((r) => (r.ok ? (r.json() as Promise<Record<string, Explanation>>) : {}))
    .catch(() => {
      loading = null;
      return {};
    });
  return loading;
}
