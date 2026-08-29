import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { MOMENTUM } from '../../domain/progression/momentum'
import { useHabitStore } from '../../stores/habitStore'
import { useProgressStore } from '../../stores/progressStore'
import { setRepositories } from '../../stores/repositories'
import { useUiStore } from '../../stores/uiStore'
import { useVitoStore } from '../../stores/vitoStore'
import type { FakeRepositories, FakeSeed } from '../../test/fakeRepositories'
import { createFakeRepositories } from '../../test/fakeRepositories'
import type { Habit } from '../../types/models'
import App from '../App'

/**
 * The closet and the settings screen, driven through the real `<App />`, the
 * real router and the real stores against an in-memory `Repositories`.
 *
 * Both screens are wiring rather than logic — the rules they lean on are
 * already pinned by the domain and store suites — so what is worth asserting
 * here is exactly the two "done when" criteria the task list names: equipping
 * one slot must not disturb another, and cancelling a reset must change
 * nothing while confirming one must wipe all four aggregates.
 */

const HABIT: Habit = {
  id: 'habit-read',
  name: 'Read',
  icon: 'book',
  category: 'Mind',
  frequency: { type: 'daily' },
  difficulty: 'normal',
  createdAt: '2026-01-01T08:00:00.000Z',
}

async function boot(seed: FakeSeed = {}): Promise<FakeRepositories> {
  const fake = createFakeRepositories({ habits: [HABIT], ...seed })
  setRepositories(fake.repos)

  await Promise.all([
    useHabitStore.getState().load(),
    useProgressStore.getState().load(),
    useVitoStore.getState().load(),
  ])

  return fake
}

/** Both navigations are always in the DOM; either link goes to the same route. */
async function goTo(label: string) {
  await userEvent.click(screen.getAllByRole('link', { name: label })[0])
}

beforeEach(() => {
  useUiStore.setState({ reaction: null, toasts: [], storageError: null })
  window.history.pushState({}, '', '/')
})

describe('Closet', () => {
  const partlyEarned: FakeSeed = {
    // The aura needs 2000 XP and stays locked, so the locked branch is real.
    vito: {
      unlockedItemIds: ['hat-sprout', 'backpack-explorer'],
      equippedItems: { backpack: 'backpack-explorer' },
    },
  }

  it('equips a hat without disturbing the backpack', async () => {
    await boot(partlyEarned)
    render(<App />)

    await goTo('Closet')
    await userEvent.click(screen.getByRole('button', { name: /Sprout Cap/ }))

    await waitFor(() => {
      expect(useVitoStore.getState().vito.equippedItems).toEqual({
        backpack: 'backpack-explorer',
        hat: 'hat-sprout',
      })
    })
  })

  it('takes the hat off again without disturbing the backpack', async () => {
    await boot({
      vito: {
        unlockedItemIds: ['hat-sprout', 'backpack-explorer'],
        equippedItems: { backpack: 'backpack-explorer', hat: 'hat-sprout' },
      },
    })
    render(<App />)

    await goTo('Closet')
    await userEvent.click(screen.getByRole('button', { name: /Sprout Cap/ }))

    await waitFor(() => {
      expect(useVitoStore.getState().vito.equippedItems).toEqual({
        backpack: 'backpack-explorer',
      })
    })
  })

  it('persists what was equipped', async () => {
    const fake = await boot(partlyEarned)
    render(<App />)

    await goTo('Closet')
    await userEvent.click(screen.getByRole('button', { name: /Sprout Cap/ }))

    await waitFor(() => {
      expect(fake.data.vito.equippedItems.hat).toBe('hat-sprout')
    })
  })

  it('shows a locked item with its requirement, and offers no way to wear it', async () => {
    await boot(partlyEarned)
    render(<App />)

    await goTo('Closet')
    await userEvent.click(screen.getByRole('button', { name: 'Auras' }))

    expect(screen.getByText('Warm Glow')).toBeInTheDocument()
    expect(screen.getByText('Unlocks at 2000 XP')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Warm Glow/ })).not.toBeInTheDocument()
  })

  it('says what Vito is wearing across every slot, not just the open one', async () => {
    await boot(partlyEarned)
    render(<App />)

    await goTo('Closet')

    expect(screen.getByText("Vito is wearing Explorer's Pack.")).toBeInTheDocument()
  })

  it('puts the equipped cosmetics on Vito himself', async () => {
    await boot(partlyEarned)
    render(<App />)

    // Home is the only screen with the avatar; the accessible name is the one
    // place the layer stack is observable without a real browser.
    expect(
      screen.getByRole('img', { name: /wearing Explorer's Pack/ }),
    ).toBeInTheDocument()
  })
})

describe('Settings — reset progress', () => {
  const lived: FakeSeed = {
    completions: [
      {
        id: 'completion-1',
        habitId: 'habit-read',
        date: '2026-03-09',
        xpAwarded: 20,
        completedAt: '2026-03-09T08:00:00.000Z',
      },
    ],
    progress: { totalXp: 900, currentStreak: 4, longestStreak: 9 },
    vito: { unlockedItemIds: ['hat-sprout'], equippedItems: { hat: 'hat-sprout' } },
  }

  it('changes nothing when the confirmation is cancelled', async () => {
    const fake = await boot(lived)
    render(<App />)

    await goTo('Settings')
    await userEvent.click(screen.getByRole('button', { name: 'Reset progress' }))
    await userEvent.click(screen.getByRole('button', { name: 'Keep my progress' }))

    expect(useProgressStore.getState().progress.totalXp).toBe(900)
    expect(useHabitStore.getState().habits).toHaveLength(1)
    expect(useVitoStore.getState().vito.unlockedItemIds).toEqual(['hat-sprout'])
    expect(fake.data.completions).toHaveLength(1)
  })

  it('wipes all four aggregates back to first-run defaults when confirmed', async () => {
    const fake = await boot(lived)
    render(<App />)

    await goTo('Settings')
    await userEvent.click(screen.getByRole('button', { name: 'Reset progress' }))
    await userEvent.click(screen.getByRole('button', { name: 'Start over' }))

    await waitFor(() => {
      expect(useProgressStore.getState().progress.totalXp).toBe(0)
    })
    expect(useProgressStore.getState().progress.momentum).toBe(MOMENTUM.START)
    expect(useProgressStore.getState().progress.longestStreak).toBe(0)
    expect(useHabitStore.getState().habits).toEqual([])
    expect(useHabitStore.getState().completions).toEqual([])
    expect(useVitoStore.getState().vito).toEqual({
      equippedItems: {},
      unlockedItemIds: [],
    })
    expect(fake.data.habits).toEqual([])
    expect(fake.data.completions).toEqual([])
  })

  it('confirms the reset happened instead of leaving the screen silent', async () => {
    await boot(lived)
    render(<App />)

    await goTo('Settings')
    await userEvent.click(screen.getByRole('button', { name: 'Reset progress' }))
    await userEvent.click(screen.getByRole('button', { name: 'Start over' }))

    await waitFor(() => {
      expect(screen.getByText('Everything is back to day one.')).toBeInTheDocument()
    })
  })
})

/**
 * Task 8.6: the quietest state the app can reach still has to read as a nap,
 * never as a dead or broken companion.
 */
describe('the worst state Vito can be in', () => {
  it('renders a resting companion, not a failure', async () => {
    await boot({
      progress: {
        momentum: MOMENTUM.MIN,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: '2026-01-01',
      },
    })
    render(<App />)

    expect(screen.getByText('Vito is resting')).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: /resting with his eyes closed/ }),
    ).toBeInTheDocument()
    expect(screen.getByText('Today can be day one')).toBeInTheDocument()
    expect(screen.getByText(`${String(MOMENTUM.MIN)} / 100`)).toBeInTheDocument()
  })
})
