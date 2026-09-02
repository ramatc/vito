import { describe, expect, it } from 'vitest'
import { EN } from '../en'
import { ES } from '../es'
import { t, tCount, tDynamic } from '../translate'

/**
 * The whole i18n ring is these three functions plus two object literals, which
 * is the argument for hand-rolling it instead of taking a dependency. What has
 * to hold: a key resolves in the active locale, a placeholder is filled by name
 * rather than by position, and nothing ever renders as `undefined` — a blank
 * label is the one failure mode a user cannot report usefully.
 */

describe('t', () => {
  it('resolves a key in the active locale', () => {
    expect(t('es', 'nav.settings')).toBe('Ajustes')
    expect(t('en', 'nav.settings')).toBe('Settings')
  })

  it('returns different strings per locale for the same key, so nothing is hardcoded through', () => {
    expect(t('es', 'nav.closet')).not.toBe(t('en', 'nav.closet'))
  })

  it('fills named placeholders from the params', () => {
    expect(t('en', 'habits.today.progress', { completed: 2, scheduled: 5 })).toBe(
      '2 of 5 done today',
    )
  })

  it('fills the same params into a sentence the translator reordered', () => {
    expect(t('es', 'habits.today.progress', { completed: 2, scheduled: 5 })).toBe(
      '2 de 5 hechos hoy',
    )
  })

  it('interpolates strings as well as numbers', () => {
    expect(t('en', 'progress.streak.best.other', { count: 'twelve' })).toBe(
      'Best so far: twelve days',
    )
  })

  it('leaves a placeholder in place when no param was supplied, rather than blanking it', () => {
    expect(t('en', 'habits.today.progress', { completed: 2 })).toBe(
      '2 of {scheduled} done today',
    )
  })

  it('ignores params a template does not use', () => {
    expect(t('en', 'nav.today', { completed: 9 })).toBe('Today')
  })

  it('leaves a template with no placeholders untouched when params are omitted', () => {
    expect(t('es', 'home.description')).toBe('De a uno. Vito crece con cada uno.')
  })
})

describe('tDynamic', () => {
  it('resolves a runtime-built key exactly as the static one would', () => {
    const theme: string = 'dark'
    const key = `settings.theme.${theme}`

    expect(tDynamic('es', key)).toBe('Oscuro')
    expect(tDynamic('en', key)).toBe('Dark')
  })

  it('returns the key itself for an id that has no entry, never undefined', () => {
    expect(tDynamic('es', 'cosmetic.hatFromAnOlderSave.name')).toBe(
      'cosmetic.hatFromAnOlderSave.name',
    )
  })

  it('still interpolates a fallback-free key', () => {
    expect(tDynamic('en', 'progress.streak.best.one', { count: 1 })).toBe(
      'Best so far: 1 day',
    )
  })
})

describe('tCount', () => {
  const BEST = {
    one: 'progress.streak.best.one',
    other: 'progress.streak.best.other',
  } as const

  it('picks the singular form at exactly one', () => {
    expect(tCount('en', BEST, 1)).toBe('Best so far: 1 day')
    expect(tCount('es', BEST, 1)).toBe('Tu mejor marca: 1 día')
  })

  it('picks the plural form above one', () => {
    expect(tCount('en', BEST, 12)).toBe('Best so far: 12 days')
    expect(tCount('es', BEST, 12)).toBe('Tu mejor marca: 12 días')
  })

  it('picks the plural form at zero, which both languages treat as other', () => {
    expect(tCount('en', BEST, 0)).toBe('Best so far: 0 days')
    expect(tCount('es', BEST, 0)).toBe('Tu mejor marca: 0 días')
  })

  it('supplies count as a placeholder without the caller repeating it', () => {
    expect(tCount('en', BEST, 3)).toContain('3')
  })
})

/**
 * Parity is a compile-time guarantee (`Dictionary` is total over
 * `TranslationKey`), so this is not a parity test — it pins that the guarantee
 * is actually wired up, and that neither dictionary shipped an empty string,
 * which the type system cannot see.
 */
describe('the dictionaries themselves', () => {
  it('covers every English key in Spanish with a non-empty string', () => {
    const keys = Object.keys(EN)

    expect(keys.length).toBeGreaterThan(0)
    expect(keys.filter((key) => (ES[key as keyof typeof EN] ?? '').length === 0)).toEqual(
      [],
    )
  })
})
