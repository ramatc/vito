import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { createFakeRepositories } from '../test/fakeRepositories'
import { useHabitStore } from '../stores/habitStore'
import { useProgressStore } from '../stores/progressStore'
import { setRepositories } from '../stores/repositories'
import { useVitoStore } from '../stores/vitoStore'
import { useVito } from './useVito'

/**
 * The two guards in `useVito` that never had a test: the divide-by-zero on a
 * day with nothing scheduled, and the null `lastActivityDate` for a profile
 * that has never completed anything. Both fall back to a neutral 0 rather
 * than `NaN` or a false "just returned" reading.
 */

const TODAY = '2026-03-10'

async function boot() {
  const fake = createFakeRepositories() // no habits, lastActivityDate: null
  setRepositories(fake.repos)

  await Promise.all([
    useHabitStore.getState().load(),
    useProgressStore.getState().load(),
    useVitoStore.getState().load(),
  ])

  return fake
}

beforeEach(() => {
  setRepositories(createFakeRepositories().repos)
})

describe('useVito — todayCompletionRatio divide-by-zero guard', () => {
  it('reads 0 instead of NaN when nothing is scheduled today', async () => {
    await boot()

    const { result } = renderHook(() => useVito(TODAY))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.todayCompletionRatio).toBe(0)
    expect(Number.isNaN(result.current.todayCompletionRatio)).toBe(false)
  })
})

describe('useVito — daysSinceLastActivity null guard', () => {
  it('reads 0 for a profile that has never completed anything', async () => {
    await boot()

    const { result } = renderHook(() => useVito(TODAY))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.daysSinceLastActivity).toBe(0)
  })
})
