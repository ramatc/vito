import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { usePreferencesStore } from '../../stores/preferencesStore'
import { setRepositories } from '../../stores/repositories'
import { createFakeRepositories } from '../../test/fakeRepositories'
import { useTranslate } from '../useTranslate'

/**
 * The hook is three lines, and all three exist for the last test in this file:
 * switching language in Settings has to repaint the app, not wait for a reload.
 * Reading the locale through a store subscription is what buys that, and a hook
 * that resolved the locale once at mount would pass every other case here while
 * failing the only one that matters.
 */

async function speaking(locale: 'en' | 'es') {
  setRepositories(createFakeRepositories({ preferences: { locale } }).repos)
  await usePreferencesStore.getState().load()
}

beforeEach(() => {
  setRepositories(createFakeRepositories().repos)
})

describe('useTranslate', () => {
  it('resolves in the language the store is holding', async () => {
    await speaking('es')

    const { result } = renderHook(() => useTranslate())

    expect(result.current('nav.settings')).toBe('Ajustes')
  })

  it('resolves the same key differently in the other language', async () => {
    await speaking('en')

    const { result } = renderHook(() => useTranslate())

    expect(result.current('nav.settings')).toBe('Settings')
  })

  it('passes params through to the interpolation', async () => {
    await speaking('es')

    const { result } = renderHook(() => useTranslate())

    expect(result.current('habits.today.progress', { completed: 2, scheduled: 5 })).toBe(
      '2 de 5 hechos hoy',
    )
  })

  it('repaints in the new language the moment Settings switches it', async () => {
    await speaking('en')
    const { result } = renderHook(() => useTranslate())
    expect(result.current('nav.closet')).toBe('Closet')

    await act(async () => {
      await usePreferencesStore.getState().setLocale('es')
    })

    expect(result.current('nav.closet')).toBe('Ropero')
  })
})
