import { beforeEach, describe, expect, it } from 'vitest'
import { createFakeRepositories } from '../../test/fakeRepositories'
import { usePreferencesStore } from '../preferencesStore'
import { setRepositories } from '../repositories'

/**
 * The store is thin on purpose — no derivation, no domain rules, just the two
 * settings and their writes. What is worth pinning is that every write reaches
 * storage and that neither setting can clobber the other: they are set from two
 * separate controls in Settings, so a `set` that replaced the whole object
 * would silently undo whichever one was touched first.
 *
 * There is no `reset()` here, and its absence is deliberate — see the store's
 * own comment. It is enforced by the type, not by a test: a caller writing
 * `usePreferencesStore.getState().reset()` does not compile.
 */

async function loaded(preferences: { locale?: 'en' | 'es'; theme?: 'light' | 'dark' }) {
  const fake = createFakeRepositories({ preferences })
  setRepositories(fake.repos)
  await usePreferencesStore.getState().load()

  return fake
}

const current = () => usePreferencesStore.getState().preferences

beforeEach(() => {
  setRepositories(createFakeRepositories().repos)
})

describe('preferencesStore.load', () => {
  it('takes both settings from the repository', async () => {
    await loaded({ locale: 'es', theme: 'dark' })

    expect(current()).toEqual({ locale: 'es', theme: 'dark' })
  })

  it('leaves the store readable rather than stuck loading', async () => {
    await loaded({ locale: 'es', theme: 'dark' })

    expect(usePreferencesStore.getState().status).toBe('ready')
  })
})

describe('preferencesStore.setLocale', () => {
  it('switches the language', async () => {
    await loaded({ locale: 'en', theme: 'light' })

    await usePreferencesStore.getState().setLocale('es')

    expect(current().locale).toBe('es')
  })

  it('persists the change, not just the in-memory copy', async () => {
    const fake = await loaded({ locale: 'en', theme: 'light' })

    await usePreferencesStore.getState().setLocale('es')

    expect(fake.data.preferences.locale).toBe('es')
  })

  it('leaves the theme exactly as it was', async () => {
    const fake = await loaded({ locale: 'en', theme: 'dark' })

    await usePreferencesStore.getState().setLocale('es')

    expect(current()).toEqual({ locale: 'es', theme: 'dark' })
    expect(fake.data.preferences.theme).toBe('dark')
  })
})

describe('preferencesStore.setTheme', () => {
  it('switches the theme', async () => {
    await loaded({ locale: 'es', theme: 'light' })

    await usePreferencesStore.getState().setTheme('dark')

    expect(current().theme).toBe('dark')
  })

  it('persists the change, not just the in-memory copy', async () => {
    const fake = await loaded({ locale: 'es', theme: 'light' })

    await usePreferencesStore.getState().setTheme('dark')

    expect(fake.data.preferences.theme).toBe('dark')
  })

  it('leaves the language exactly as it was', async () => {
    const fake = await loaded({ locale: 'es', theme: 'light' })

    await usePreferencesStore.getState().setTheme('dark')

    expect(current()).toEqual({ locale: 'es', theme: 'dark' })
    expect(fake.data.preferences.locale).toBe('es')
  })

  it('survives both settings being changed one after the other', async () => {
    const fake = await loaded({ locale: 'en', theme: 'light' })

    await usePreferencesStore.getState().setTheme('dark')
    await usePreferencesStore.getState().setLocale('es')

    expect(fake.data.preferences).toEqual({ locale: 'es', theme: 'dark' })
  })
})
