// The value every lib module returns for a failure that comes from outside, so nothing throws
// across a component.

/** Holds either a value or the reason there's none. */
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

/** Wraps a value as a success. */
export const ok = <T>(value: T): { ok: true; value: T } => ({ ok: true, value });
/** Wraps an error as a failure. */
export const err = <E>(error: E): { ok: false; error: E } => ({ ok: false, error });
