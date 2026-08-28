import type { Frequency, Weekday } from '../../types/models'

/**
 * The weekday selector's data, plus the one place a runtime array of weekdays
 * becomes a persisted `Frequency`.
 */

export interface WeekdayOption {
  /** JS weekday numbering: 0 = Sunday .. 6 = Saturday. */
  value: Weekday
  /** Single letter for the compact selector. */
  short: string
  label: string
}

/** Monday first — how people read a week — while the values stay JS-native. */
export const WEEKDAY_OPTIONS: readonly WeekdayOption[] = [
  { value: 1, short: 'M', label: 'Monday' },
  { value: 2, short: 'T', label: 'Tuesday' },
  { value: 3, short: 'W', label: 'Wednesday' },
  { value: 4, short: 'T', label: 'Thursday' },
  { value: 5, short: 'F', label: 'Friday' },
  { value: 6, short: 'S', label: 'Saturday' },
  { value: 0, short: 'S', label: 'Sunday' },
]

const SHORT_NAMES: Record<Weekday, string> = {
  0: 'Sun',
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
}

/**
 * Narrows a plain array to a non-empty tuple.
 *
 * `Frequency['days']` is `[Weekday, ...Weekday[]]` precisely so a weekday habit
 * with no day selected cannot exist. That guarantee is only real if nothing
 * casts its way past it, so this is a genuine length check whose runtime
 * behaviour matches exactly what the predicate claims.
 */
function isNonEmpty<T>(values: readonly T[]): values is readonly [T, ...T[]] {
  return values.length > 0
}

/**
 * Builds the persisted frequency from the form's selection, or `null` when the
 * selection is not one the product has: `weekdays` with nothing selected is
 * never due, so it is refused here rather than saved and puzzled over later.
 */
export function buildFrequency(
  type: Frequency['type'],
  days: readonly Weekday[],
): Frequency | null {
  if (type === 'daily') {
    return { type: 'daily' }
  }

  if (!isNonEmpty(days)) {
    return null
  }

  // Spreading the narrowed tuple keeps the non-empty shape without a cast, and
  // copies the array so the form's state cannot be mutated through the habit.
  return { type: 'weekdays', days: [...days] }
}

/** Human-readable schedule, e.g. "Every day" or "Mon, Wed, Fri". */
export function describeFrequency(frequency: Frequency): string {
  if (frequency.type === 'daily') {
    return 'Every day'
  }

  const selected = new Set<Weekday>(frequency.days)

  return WEEKDAY_OPTIONS.filter((option) => selected.has(option.value))
    .map((option) => SHORT_NAMES[option.value])
    .join(', ')
}
