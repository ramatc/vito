import { describe, expect, it } from 'vitest'
import { INTL_LOCALE_TAG, isLocale } from '../locale'

/**
 * `isLocale` is the only gate between an untrusted value — saved data, a query
 * string, a browser header — and the dictionary lookup. The interesting cases
 * are all rejections: a locale that slips through unrecognised would index the
 * dictionary with `undefined` and render blank labels app-wide.
 */
describe('isLocale', () => {
  it('accepts the two shipped buckets', () => {
    expect(isLocale('en')).toBe(true)
    expect(isLocale('es')).toBe(true)
  })

  it('rejects a regional tag, which is a formatting value and not a dictionary key', () => {
    expect(isLocale('en-US')).toBe(false)
    expect(isLocale('es-AR')).toBe(false)
  })

  it('rejects a language the app does not ship', () => {
    expect(isLocale('fr')).toBe(false)
    expect(isLocale('EN')).toBe(false)
  })

  it('rejects the non-string shapes corrupt saved data actually produces', () => {
    expect(isLocale(null)).toBe(false)
    expect(isLocale(undefined)).toBe(false)
    expect(isLocale(0)).toBe(false)
    expect(isLocale({ locale: 'es' })).toBe(false)
    expect(isLocale(['es'])).toBe(false)
  })
})

/**
 * The bucket names are not valid BCP 47 on their own, so anything handed to
 * `Intl` or to `<html lang>` has to come through this map. `en` widening to
 * `en-US` is the point of Decision 1.
 */
describe('INTL_LOCALE_TAG', () => {
  it('widens the English bucket to a real regional tag', () => {
    expect(INTL_LOCALE_TAG.en).toBe('en-US')
  })

  it('leaves Spanish unregioned, because this app speaks Rioplatense rather than peninsular', () => {
    expect(INTL_LOCALE_TAG.es).toBe('es')
  })

  it('formats a real date differently per bucket, which is what the map exists for', () => {
    const date = new Date('2026-03-10T12:00:00.000Z')
    const weekday = (locale: 'en' | 'es') =>
      new Intl.DateTimeFormat(INTL_LOCALE_TAG[locale], {
        weekday: 'long',
        timeZone: 'UTC',
      }).format(date)

    expect(weekday('en')).toBe('Tuesday')
    expect(weekday('es')).toBe('martes')
  })
})
