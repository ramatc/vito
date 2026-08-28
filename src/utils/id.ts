/**
 * Identifier generation, isolated so the whole app has one source of ids and
 * one place to change if `crypto.randomUUID` ever needs a fallback (it is
 * unavailable on insecure origins that are not localhost).
 */
export function newId(): string {
  return crypto.randomUUID()
}
