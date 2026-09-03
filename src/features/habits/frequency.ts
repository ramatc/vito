import { INTL_LOCALE_TAG } from '../../i18n/locale'
import { t } from '../../i18n/translate'
import type { Frequency, Locale, Weekday } from '../../types/models'

/**
 * The weekday selector's data, plus the one place a runtime array of weekdays
 * becomes a persisted `Frequency`.
 *
 * Weekday names come from `Intl`, not from the dictionary. A weekday is not
 * copy — it is a calendar fact every locale already knows, and hand-translating
 * seven names in two lengths would be fourteen dictionary entries that can drift
 * from what the user's own date picker says. `INTL_LOCALE_TAG` exists for
 * exactly this: the dictionary key names a language bucket, the tag names the
 * region whose conventions apply.
 */

export interface WeekdayOption {
  /** JS weekday numbering: 0 = Sunday .. 6 = Saturday. */
  value: Weekday
  /** Single letter for the compact selector. */
  short: string
  label: string
}

/** Monday first — how people read a week — while the values stay JS-native. */
const WEEKDAY_ORDER: readonly Weekday[] = [1, 2, 3, 4, 5, 6, 0]

/**
 * 2024-01-07 was a Sunday, so this date plus `day` whole days always lands on
 * the weekday whose JS number is `day`. Everything stays in UTC, so no machine's
 * timezone can shift the answer by one.
 */
const REFERENCE_SUNDAY_UTC = Date.UTC(2024, 0, 7)
const DAY_MS = 86_400_000

type WeekdayWidth = 'long' | 'short' | 'narrow'

/**
 * Constructing an `Intl.DateTimeFormat` is expensive and `describeFrequency`
 * runs once per row of the habit list, so the formatters are cached by the pair
 * that defines them. There are six possible entries.
 */
const FORMATTERS = new Map<string, Intl.DateTimeFormat>()

function weekdayName(locale: Locale, width: WeekdayWidth, day: Weekday): string {
  const cacheKey = `${locale}:${width}`
  let format = FORMATTERS.get(cacheKey)

  if (format === undefined) {
    format = new Intl.DateTimeFormat(INTL_LOCALE_TAG[locale], {
      weekday: width,
      timeZone: 'UTC',
    })
    FORMATTERS.set(cacheKey, format)
  }

  return format.format(new Date(REFERENCE_SUNDAY_UTC + day * DAY_MS))
}

/** The selector's seven buttons, named in the active locale. */
export function weekdayOptions(locale: Locale): readonly WeekdayOption[] {
  return WEEKDAY_ORDER.map((value) => ({
    value,
    short: weekdayName(locale, 'narrow', value),
    label: weekdayName(locale, 'long', value),
  }))
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

/**
 * Human-readable schedule in the active locale, e.g. "Every day" / "Mon, Wed,
 * Fri" in English, "Todos los días" / "lun, mié, vie" in Spanish.
 */
export function describeFrequency(locale: Locale, frequency: Frequency): string {
  if (frequency.type === 'daily') {
    return t(locale, 'habits.frequency.daily')
  }

  const selected = new Set<Weekday>(frequency.days)

  return WEEKDAY_ORDER.filter((day) => selected.has(day))
    .map((day) => weekdayName(locale, 'short', day))
    .join(', ')
}
