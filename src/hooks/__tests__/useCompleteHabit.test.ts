import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { xpRewardFor } from '../../domain/habit/xpReward'
import type { FakeSeed } from '../../test/fakeRepositories'
import { createFakeRepositories } from '../../test/fakeRepositories'
import { useHabitStore } from '../../stores/habitStore'
import { useProgressStore } from '../../stores/progressStore'
import { setRepositories } from '../../stores/repositories'
import { useUiStore } from '../../stores/uiStore'
import { useVitoStore } from '../../stores/vitoStore'
import type { Habit } from '../../types/models'
import { useCompleteHabit } from '../useCompleteHabit'

/**
 * Reaction, toast and `lastGain` are all display consequences of a completion,
 * layered on top of the real `completeHabit` transaction rather than mocked —
 * same integration style as `stores/__tests__/completeHabit.test.ts`, so a
 * change to what `completeHabit` returns cannot silently desync this from it.
 */

const TODAY = '2026-03-10' // a Tuesday
const NORMAL_XP = xpRewardFor('normal')

function habit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'habit-read',
    name: 'Read',
    icon: 'book',
    category: 'Mind',
    frequency: { type: 'daily' },
    difficulty: 'normal',
    createdAt: '2026-01-01T08:00:00.000Z',
    ...overrides,
  }
}

async function boot(seed: FakeSeed = {}) {
  const fake = createFakeRepositories(seed)
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
  useUiStore.setState({ reaction: null, toasts: [] })
})

describe('useCompleteHabit — the plain case', () => {
  it('emits a celebrate reaction, skips the toast, and reports lastGain', async () => {
    await boot({ habits: [habit(), habit({ id: 'habit-stretch', name: 'Stretch' })] })

    const { result } = renderHook(() => useCompleteHabit(TODAY))

    await act(async () => {
      await result.current.complete('habit-read')
    })

    expect(useUiStore.getState().reaction).toMatchObject({ type: 'celebrate' })
    expect(useUiStore.getState().toasts).toHaveLength(0)

    await waitFor(() => {
      expect(result.current.lastGain).toMatchObject({
        habitId: 'habit-read',
        xp: NORMAL_XP,
      })
    })
  })
})

describe('useCompleteHabit — finishing every scheduled habit', () => {
  it('emits allDone instead of celebrate', async () => {
    await boot({ habits: [habit()] })

    const { result } = renderHook(() => useCompleteHabit(TODAY))

    await act(async () => {
      await result.current.complete('habit-read')
    })

    expect(useUiStore.getState().reaction).toMatchObject({ type: 'allDone' })
  })

  it('still emits plain celebrate when other scheduled habits remain open', async () => {
    await boot({ habits: [habit(), habit({ id: 'habit-stretch', name: 'Stretch' })] })

    const { result } = renderHook(() => useCompleteHabit(TODAY))

    await act(async () => {
      await result.current.complete('habit-read')
    })

    expect(useUiStore.getState().reaction).toMatchObject({ type: 'celebrate' })
  })
})

describe('useCompleteHabit — undo', () => {
  it('emits no reaction, no toast celebration and no lastGain on undo', async () => {
    await boot({ habits: [habit()] })

    const { result } = renderHook(() => useCompleteHabit(TODAY))

    await act(async () => {
      await result.current.complete('habit-read')
    })

    useUiStore.setState({ reaction: null })

    await act(async () => {
      await result.current.undo('habit-read')
    })

    expect(useUiStore.getState().reaction).toBeNull()
    expect(useUiStore.getState().toasts.at(-1)).toMatchObject({ tone: 'info' })
  })
})
