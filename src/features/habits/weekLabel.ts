import { INTL_LOCALE_TAG } from '../../i18n/locale'
import type { DateKey, Locale } from '../../types/models'

/**
 * The week-nav range label, e.g. "Mar 9 – Mar 15" / "9 mar – 15 mar".
 *
 * Same construction as `frequency.ts`'s `weekdayName`: parse the `DateKey`s as
 * UTC dates and format with a fixed `timeZone: 'UTC'`, so the label can never
 * shift by a day relative to the `DateKey` arithmetic that produced it.
 */

const FORMATTERS = new Map<Locale, Intl.DateTimeFormat>()

function formatterFor(locale: Locale): Intl.DateTimeFormat {
  let format = FORMATTERS.get(locale)

  if (format === undefined) {
    format = new Intl.DateTimeFormat(INTL_LOCALE_TAG[locale], {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    })
    FORMATTERS.set(locale, format)
  }

  return format
}

export function formatWeekRange(locale: Locale, weekStart: DateKey, weekEnd: DateKey): string {
  const format = formatterFor(locale)
  const start = format.format(new Date(`${weekStart}T00:00:00Z`))
  const end = format.format(new Date(`${weekEnd}T00:00:00Z`))

  return `${start} – ${end}`
}
