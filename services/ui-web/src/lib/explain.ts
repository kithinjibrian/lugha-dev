// Fetches lughac's explanations in the browser from /content/v1/explanations.json the first time
// an error needs one, then keeps them for the page.
import type { Explanation } from "../content/explanations";

let loading: Promise<Record<string, Explanation>> | null = null;

/**
 * Gives every explanation by code, or none when they can't be fetched; a network failure is tried
 * again on the next call.
 */
export function explanations(): Promise<Record<string, Explanation>> {
  loading ??= fetch("/content/v1/explanations.json")
    .then((r) => (r.ok ? (r.json() as Promise<Record<string, Explanation>>) : {}))
    .catch(() => {
      loading = null;
      return {};
    });
  return loading;
}
