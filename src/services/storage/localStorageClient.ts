/**
 * The only place in the app that touches `localStorage`.
 *
 * This module is PRIVATE to `services/storage`. Nothing outside this directory
 * imports it — stores and components go through the repository interfaces in
 * `repositories.ts`, which is what makes swapping in a real backend a one-file
 * change.
 *
 * The contract that matters here: reading and writing saved data must never
 * throw into a store action. Browsers reject writes in private mode and when
 * the origin is out of quota, and saved JSON can be corrupted by a half-written
 * value or by a user editing devtools. None of those should take the app down,
 * so every access is wrapped and every failure degrades to the caller's
 * fallback while being reported through `setStorageErrorHandler`.
 */

/** Bumped only when a persisted shape changes incompatibly. */
export const SCHEMA_VERSION = 1

/**
 * Every key the app owns, in one place. `resetAll` clears exactly this list, so
 * adding a key here is the single step needed to keep reset complete — and keys
 * belonging to other apps on the same origin are never touched.
 */
export const STORAGE_KEYS = {
  habits: 'vito:v1:habits',
  completions: 'vito:v1:completions',
  progress: 'vito:v1:progress',
  vito: 'vito:v1:vito',
  preferences: 'vito:v1:preferences',
  schema: 'vito:v1:schema',
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]

/**
 * Keys `resetAll` deliberately spares.
 *
 * Language and theme are chrome, not progress: "start over" offered to clear
 * the habits and everything Vito earned, and clearing them is all it should do.
 * Wiping the language would drop someone back into a tongue they may not read,
 * from a button that never mentioned it.
 *
 * Written as a named exemption rather than by leaving `preferences` out of
 * `STORAGE_KEYS`, because that inventory is also what guarantees the app only
 * ever touches keys it owns. A key must be listed there to be owned, and listed
 * here to be spared — two separate facts, kept separate.
 */
const RESET_PRESERVED_KEYS: readonly StorageKey[] = [STORAGE_KEYS.preferences]

export interface StorageFailure {
  operation: 'read' | 'write' | 'remove' | 'schema'
  key: string
  message: string
}

export type StorageErrorHandler = (failure: StorageFailure) => void

/**
 * The reporting port. `bootstrap.ts` wires this to `uiStore` so a storage
 * problem can surface in the UI.
 *
 * It is a handler injected from the outside rather than a direct `uiStore`
 * import because the dependency has to point inward: `services/storage` sits
 * below `stores/`, and importing upward would make this layer untestable in
 * isolation and impossible to reuse behind a different UI.
 */
let reportFailure: StorageErrorHandler | null = null

export function setStorageErrorHandler(handler: StorageErrorHandler | null): void {
  reportFailure = handler
}

function report(
  operation: StorageFailure['operation'],
  key: string,
  cause: unknown,
): void {
  reportFailure?.({
    operation,
    key,
    message: cause instanceof Error ? cause.message : String(cause),
  })
}

/**
 * Reads and parses a key, returning `fallback` for anything that is not usable.
 *
 * `parse` is what separates "no data yet" from "data we cannot trust": it
 * validates the decoded value and returns `null` to reject it. A save that
 * fails validation is reported, because silently resetting someone's progress
 * with no trace is exactly the kind of bug that never gets diagnosed.
 */
export function read<T>(
  key: StorageKey,
  parse: (raw: unknown) => T | null,
  fallback: T,
): T {
  let stored: string | null

  try {
    stored = localStorage.getItem(key)
  } catch (cause) {
    report('read', key, cause)

    return fallback
  }

  if (stored === null) {
    return fallback
  }

  try {
    const parsed = parse(JSON.parse(stored))

    if (parsed === null) {
      report('read', key, 'Stored value did not match the expected shape')

      return fallback
    }

    return parsed
  } catch (cause) {
    report('read', key, cause)

    return fallback
  }
}

/**
 * Writes a value, swallowing quota and private-mode failures.
 *
 * A failed write leaves the previously stored value intact rather than
 * corrupting it, so the app keeps running on the last good save.
 */
export function write(key: StorageKey, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (cause) {
    report('write', key, cause)
  }
}

/** A plain object — arrays and `null` are excluded, both of which `typeof` calls 'object'. */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Accepts a decoded array whose entries all look like persisted records.
 *
 * The `id` check is deliberately shallow. It rejects the shapes that actually
 * occur — a stored object, a list of numbers, a half-written file — without
 * growing into a validation framework the MVP has no use for.
 */
export function parseIdentifiedList<T>(raw: unknown): T[] | null {
  if (!Array.isArray(raw)) {
    return null
  }

  const valid = raw.every((entry) => isRecord(entry) && typeof entry.id === 'string')

  return valid ? (raw as T[]) : null
}

export function remove(key: StorageKey): void {
  try {
    localStorage.removeItem(key)
  } catch (cause) {
    report('remove', key, cause)
  }
}

/**
 * Clears every key in `STORAGE_KEYS` except the preserved ones, then re-stamps
 * the current schema version.
 */
export function clearAll(): void {
  for (const key of Object.values(STORAGE_KEYS)) {
    if (RESET_PRESERVED_KEYS.includes(key)) {
      continue
    }

    remove(key)
  }

  write(STORAGE_KEYS.schema, SCHEMA_VERSION)
}

/**
 * The stored marker, or `null` when it is absent or unreadable.
 *
 * Written by hand rather than through `read` because "no usable value" is the
 * expected first-run answer here, not a fallback worth reporting.
 */
function readSchemaVersion(): number | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.schema)

    if (stored === null) {
      return null
    }

    const parsed: unknown = JSON.parse(stored)

    return typeof parsed === 'number' ? parsed : null
  } catch {
    return null
  }
}

/**
 * Reconciles the stored schema marker with this build.
 *
 * The MVP deliberately has no migration engine (design §11): a mismatch
 * reinitialises to defaults and reports it. The marker exists so the first real
 * breaking change has somewhere to hang a migration.
 *
 * An absent or unreadable marker is treated as first run and the data is KEPT.
 * Losing someone's progress because one marker byte went bad would be a far
 * worse failure than reading a save whose shape each repository validates anyway.
 */
export function ensureSchemaVersion(): void {
  const stored = readSchemaVersion()

  if (stored === SCHEMA_VERSION) {
    return
  }

  if (stored !== null) {
    report(
      'schema',
      STORAGE_KEYS.schema,
      `Saved data uses schema v${stored}, this build expects v${SCHEMA_VERSION}. Starting fresh.`,
    )
    clearAll()

    return
  }

  write(STORAGE_KEYS.schema, SCHEMA_VERSION)
}
