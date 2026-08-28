import type { DateKey, Weekday } from '../../types/models'

/**
 * Calendar arithmetic over local-time `YYYY-MM-DD` keys.
 *
 * Two rules make the whole game engine deterministically testable:
 *
 * 1. `todayKey()` is the ONLY function here that reads the clock. Every domain
 *    function takes `today` as a parameter instead of calling it.
 * 2. All arithmetic runs in UTC. A `DateKey` names a whole calendar day, so it
 *    has no time zone of its own; doing the maths in local time would make a
 *    DST spring-forward day 23 hours long and silently drop or duplicate days
 *    in streak and rollover calculations.
 */

const MS_PER_DAY = 86_400_000

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

/**
 * Parses a `DateKey` into a UTC-midnight epoch value.
 *
 * Throws rather than returning `NaN`: a malformed key silently poisoning
 * momentum or streak arithmetic is far more expensive to diagnose than a loud
 * failure at the boundary.
 */
function toUtcMs(key: DateKey): number {
  if (!DATE_KEY_PATTERN.test(key)) {
    throw new RangeError(`Invalid DateKey: expected YYYY-MM-DD, received "${key}"`)
  }

  const year = Number(key.slice(0, 4))
  const month = Number(key.slice(5, 7))
  const day = Number(key.slice(8, 10))
  const utcMs = Date.UTC(year, month - 1, day)

  // Date.UTC happily rolls 2026-02-30 over into March. Round-tripping catches
  // that, so an impossible calendar date is rejected instead of drifting.
  if (formatUtc(utcMs) !== key) {
    throw new RangeError(`Invalid DateKey: "${key}" is not a real calendar date`)
  }

  return utcMs
}

function formatUtc(utcMs: number): DateKey {
  const date = new Date(utcMs)

  return format(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())
}

function format(year: number, month: number, day: number): DateKey {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** The current LOCAL calendar day. The single clock-reading function in `domain/`. */
export function todayKey(): DateKey {
  const now = new Date()

  return format(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

/** Day of the week for a key, using JS numbering: 0 = Sunday .. 6 = Saturday. */
export function weekdayOf(key: DateKey): Weekday {
  return new Date(toUtcMs(key)).getUTCDay() as Weekday
}

/** The key `offset` days after `key`. Negative offsets move backwards. */
export function addDays(key: DateKey, offset: number): DateKey {
  return formatUtc(toUtcMs(key) + offset * MS_PER_DAY)
}

/** Whole days from `from` to `to`. Negative when `to` is the earlier day. */
export function daysBetween(from: DateKey, to: DateKey): number {
  return (toUtcMs(to) - toUtcMs(from)) / MS_PER_DAY
}

/** Every day from `from` to `to`, both endpoints included. Empty if inverted. */
export function eachDay(from: DateKey, to: DateKey): DateKey[] {
  const days: DateKey[] = []

  for (let utcMs = toUtcMs(from); utcMs <= toUtcMs(to); utcMs += MS_PER_DAY) {
    days.push(formatUtc(utcMs))
  }

  return days
}
