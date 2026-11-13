// Keeps values as JSON in the browser's localStorage, under "lugha.".
// When storage fails (a private window, a full quota) nothing is kept and
// nothing is said: every call still returns.

/** Covers the part of the Storage interface the site uses. */
export interface Backing {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Gets, sets and removes values; none of its calls throw. */
export interface Store {
  get(key: string): unknown;
  /** Keeps a value and tells whether it was kept. */
  set(key: string, value: unknown): boolean;
  remove(key: string): void;
}

const PREFIX = "lugha.";

/** Makes a store over `backing`; with null, a store that keeps nothing. */
export function makeStore(backing: Backing | null): Store {
  return {
    get(key) {
      try {
        const text = backing?.getItem(PREFIX + key) ?? null;
        return text === null ? null : (JSON.parse(text) as unknown);
      } catch {
        return null;
      }
    },
    set(key, value) {
      if (!backing) return false;
      try {
        backing.setItem(PREFIX + key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },
    remove(key) {
      try {
        backing?.removeItem(PREFIX + key);
      } catch {
        // Nothing was kept, so there's nothing to remove.
      }
    },
  };
}

/** Gives a store over the browser's localStorage, or one that keeps nothing when it can't be reached. */
export function browserStore(): Store {
  try {
    return makeStore(globalThis.localStorage ?? null);
  } catch {
    return makeStore(null);
  }
}
