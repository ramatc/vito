import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { MOMENTUM } from '../../domain/progression/momentum'
import { useHabitStore } from '../../stores/habitStore'
import { usePreferencesStore } from '../../stores/preferencesStore'
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
  // Explicit rather than inherited: the language cases below write to this
  // store, and every English assertion in this file would otherwise depend on
  // which test ran last.
  usePreferencesStore.setState({ preferences: { locale: 'en', theme: 'light' } })
  window.history.pushState({}, '', '/')
})

/**
 * The layout ring is props-only, so the shell cannot look a string up: labels
 * are resolved in `app/` and handed down. What is worth pinning is the part a
 * type cannot — that the resolution is a live subscription, so switching the
 * language repaints the chrome instead of waiting for a reload.
 */
describe('the app shell in the active language', () => {
  it('names the navigation, the wordmark and the tabs in Spanish', async () => {
    await boot()
    usePreferencesStore.setState({ preferences: { locale: 'es', theme: 'light' } })

    render(<App />)

    const sidebar = screen.getByRole('navigation', { name: 'Barra lateral principal' })
    expect(within(sidebar).getByText('Vito')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument()

    for (const label of ['Hoy', 'Hábitos', 'Ropero', 'Ajustes']) {
      expect(screen.getAllByRole('link', { name: label })).toHaveLength(2)
    }
  })

  it('names them in English too, from the same one source', async () => {
    await boot()

    render(<App />)

    expect(
      screen.getByRole('navigation', { name: 'Primary sidebar' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()

    for (const label of ['Today', 'Habits', 'Closet', 'Settings']) {
      expect(screen.getAllByRole('link', { name: label })).toHaveLength(2)
    }
  })

  it('writes Home in the active language as well', async () => {
    await boot()
    usePreferencesStore.setState({ preferences: { locale: 'es', theme: 'light' } })

    render(<App />)

    expect(screen.getByRole('heading', { name: 'Hoy', level: 1 })).toBeInTheDocument()
    expect(screen.getByText('De a uno. Vito crece con cada uno.')).toBeInTheDocument()
  })

  it('repaints the whole shell when the language changes mid-session', async () => {
    await boot()
    render(<App />)

    expect(screen.getAllByRole('link', { name: 'Closet' })).toHaveLength(2)

    await act(async () => {
      await usePreferencesStore.getState().setLocale('es')
    })

    expect(screen.getAllByRole('link', { name: 'Ropero' })).toHaveLength(2)
    expect(screen.queryByRole('link', { name: 'Closet' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Hoy', level: 1 })).toBeInTheDocument()
  })
})

/**
 * The habits ring, driven the way a user reaches it.
 *
 * PR3 taught the chrome to speak; this is the first ring whose own copy moves,
 * so what is worth pinning is that every layer of it moves together — the
 * screen, the reference data the form is built from, the card's accessible
 * names, the schedule line that comes from `Intl` rather than the dictionary,
 * and the toast a hook pushes long after the render that started it.
 */
describe('the habits ring in the active language', () => {
  it('writes the screen, the card and the schedule in Spanish', async () => {
    await boot()
    usePreferencesStore.setState({ preferences: { locale: 'es', theme: 'light' } })
    render(<App />)

    await goTo('Hábitos')

    expect(screen.getByRole('heading', { name: 'Hábitos', level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Nuevo' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Editar Read' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Archivar Read' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Completar Read' })).toBeVisible()
    expect(screen.getByText(/Todos los días/)).toBeInTheDocument()
  })

  it('writes the same screen in English from the same source', async () => {
    await boot()
    render(<App />)

    await goTo('Habits')

    expect(screen.getByRole('heading', { name: 'Habits', level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit Read' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Complete Read' })).toBeVisible()
    expect(screen.getByText(/Every day/)).toBeInTheDocument()
  })

  it('invites a first habit in Spanish when there is nothing to list', async () => {
    await boot({ habits: [] })
    usePreferencesStore.setState({ preferences: { locale: 'es', theme: 'light' } })
    render(<App />)

    await goTo('Hábitos')

    expect(screen.getByText('Todavía no hay hábitos')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Agregá tu primer hábito' }),
    ).toBeInTheDocument()
  })

  /**
   * The form is the densest surface in the ring and the only one whose copy
   * comes from three different places at once: the dictionary, the category and
   * icon registries, and `Intl`'s weekday names.
   */
  it('writes the form, its categories, its icons and its weekdays in Spanish', async () => {
    await boot()
    usePreferencesStore.setState({ preferences: { locale: 'es', theme: 'light' } })
    render(<App />)

    await goTo('Hábitos')
    await userEvent.click(screen.getByRole('button', { name: 'Nuevo' }))

    expect(
      screen.getByRole('heading', { name: 'Hábito nuevo', level: 2 }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument()
    expect(screen.getByLabelText('Categoría')).toHaveValue('Salud')
    expect(screen.getByRole('radio', { name: 'Destellos' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Fácil, 10 XP' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Agregar hábito' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Ciertos días' }))

    expect(screen.getByRole('checkbox', { name: 'lunes' })).toBeInTheDocument()
  })

  it('counts today in Spanish and translates the toast a hook pushes later', async () => {
    await boot()
    usePreferencesStore.setState({ preferences: { locale: 'es', theme: 'light' } })
    render(<App />)

    expect(screen.getByText('0 de 1 hechos hoy')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('checkbox', { name: 'Completar Read' }))
    await userEvent.click(await screen.findByRole('checkbox', { name: 'Desmarcar Read' }))

    expect(await screen.findByText('Desmarcado por hoy.')).toBeInTheDocument()
  })

  it('counts today in English and translates that toast too', async () => {
    await boot()
    render(<App />)

    expect(screen.getByText('0 of 1 done today')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('checkbox', { name: 'Complete Read' }))
    await userEvent.click(await screen.findByRole('checkbox', { name: 'Uncheck Read' }))

    expect(await screen.findByText('Unchecked for today.')).toBeInTheDocument()
  })
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

  /**
   * The one behaviour the decoupling exists for: names come from an id-keyed
   * table outside `domain/`, so a language change repaints them without the
   * catalog moving at all.
   */
  describe('language', () => {
    it('renders the whole closet in Spanish, names included', async () => {
      await boot(partlyEarned)
      usePreferencesStore.setState({ preferences: { locale: 'es', theme: 'light' } })

      render(<App />)
      await goTo('Ropero')

      expect(
        screen.getByRole('heading', { name: 'Ropero', level: 1 }),
      ).toBeInTheDocument()
      expect(
        screen.getByText('Vito lleva puesto Mochila de Explorador.'),
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Gorras' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Gorra Brote/ })).toBeInTheDocument()
      expect(screen.getByText('Tocá para ponerlo')).toBeInTheDocument()
    })

    it('translates a locked item down to its rarity and its threshold', async () => {
      await boot(partlyEarned)
      usePreferencesStore.setState({ preferences: { locale: 'es', theme: 'light' } })

      render(<App />)
      await goTo('Ropero')
      await userEvent.click(screen.getByRole('button', { name: 'Auras' }))

      expect(screen.getByText('Brillo Cálido')).toBeInTheDocument()
      expect(screen.getByText('Se desbloquea con 2000 XP')).toBeInTheDocument()
      expect(screen.getByText('Legendaria')).toBeInTheDocument()
    })

    it('repaints the cosmetic names when the language changes mid-session', async () => {
      await boot(partlyEarned)
      render(<App />)

      await goTo('Closet')

      expect(screen.getByRole('button', { name: /Sprout Cap/ })).toBeInTheDocument()

      await act(async () => {
        await usePreferencesStore.getState().setLocale('es')
      })

      expect(screen.getByRole('button', { name: /Gorra Brote/ })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Sprout Cap/ })).not.toBeInTheDocument()
    })

    it('renames what Vito is wearing on the avatar too', async () => {
      await boot(partlyEarned)
      usePreferencesStore.setState({ preferences: { locale: 'es', theme: 'light' } })

      render(<App />)

      expect(
        screen.getByRole('img', { name: /con Mochila de Explorador puesto/ }),
      ).toBeInTheDocument()
    })
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
 * The settings ring in the other language.
 *
 * The three cases above are the English partners — they assert the same
 * surfaces from the same source and must not move. What is new here is that the
 * screen, the warning it puts in front of the only irreversible action, and the
 * toast a promise pushes afterwards all resolve through the dictionary.
 */
describe('Settings in the active language', () => {
  const lived: FakeSeed = {
    progress: { totalXp: 900, currentStreak: 4, longestStreak: 9 },
  }

  async function bootInSpanish(seed: FakeSeed = {}) {
    const fake = await boot(seed)
    usePreferencesStore.setState({ preferences: { locale: 'es', theme: 'light' } })
    return fake
  }

  it('writes the whole settings screen in Spanish', async () => {
    await bootInSpanish()
    render(<App />)

    await goTo('Ajustes')

    expect(screen.getByRole('heading', { name: 'Ajustes', level: 1 })).toBeInTheDocument()
    expect(
      screen.getByText('Tus datos se quedan en este dispositivo.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Dónde viven tus datos' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Empezar de nuevo' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Reiniciar el progreso' }),
    ).toBeInTheDocument()
  })

  /**
   * The dialog's own doc comment says the wording IS the safety mechanism. In a
   * second language that is only true if all four of its strings arrive
   * translated — including the header's close control, which PR3 left as a
   * literal on purpose.
   */
  it('asks for confirmation in Spanish, close control included', async () => {
    await bootInSpanish(lived)
    render(<App />)

    await goTo('Ajustes')
    await userEvent.click(screen.getByRole('button', { name: 'Reiniciar el progreso' }))

    expect(
      screen.getByRole('heading', { name: '¿Empezar de nuevo con Vito?' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Empezar de nuevo' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Conservar mi progreso' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument()
  })

  it('confirms in Spanish that the reset happened', async () => {
    await bootInSpanish(lived)
    render(<App />)

    await goTo('Ajustes')
    await userEvent.click(screen.getByRole('button', { name: 'Reiniciar el progreso' }))
    await userEvent.click(screen.getByRole('button', { name: 'Empezar de nuevo' }))

    await waitFor(() => {
      expect(screen.getByText('Todo volvió al día uno.')).toBeInTheDocument()
    })
  })
})

/**
 * The two strings the app ring renders itself, rather than routing to a screen.
 *
 * Both sit above the routes — the storage banner because it must survive
 * navigation, the toast viewport because a message must too — so neither is
 * reachable from any feature test. They are the last English literals `app/`
 * owned.
 */
describe('the app ring in the active language', () => {
  it('warns about broken storage in Spanish', async () => {
    await boot()
    usePreferencesStore.setState({ preferences: { locale: 'es', theme: 'light' } })
    useUiStore.setState({ storageError: 'QuotaExceededError' })

    render(<App />)

    expect(screen.getByText(/^Vito no puede guardar/)).toBeInTheDocument()
  })

  it('warns about it in English from the same one source', async () => {
    await boot()
    useUiStore.setState({ storageError: 'QuotaExceededError' })

    render(<App />)

    expect(screen.getByText(/^Vito can't save/)).toBeInTheDocument()
  })

  it('names the toast dismiss control from the dictionary', async () => {
    await boot()
    usePreferencesStore.setState({ preferences: { locale: 'es', theme: 'light' } })
    useUiStore.getState().pushToast({ message: 'Listo.', tone: 'info' })

    render(<App />)

    expect(screen.getByRole('button', { name: 'Descartar' })).toBeInTheDocument()
  })

  it('names it in English too', async () => {
    await boot()
    useUiStore.getState().pushToast({ message: 'Done.', tone: 'info' })

    render(<App />)

    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument()
  })
})

/**
 * The two controls the whole change exists for, driven the way a user reaches
 * them: navigate to Settings and click.
 *
 * These are the spec's "User switches language in Settings" and "User toggles
 * theme" scenarios end to end — the click has to move the store, repaint the
 * app, dress `<html>` and reach storage, and the last one is what makes the
 * "reload does not re-run detection" requirement true.
 */
describe('Settings — language and theme', () => {
  const html = document.documentElement

  afterEach(() => {
    html.className = ''
    html.removeAttribute('lang')
  })

  it('switches the whole app into Spanish and writes the choice down', async () => {
    const fake = await boot()
    render(<App />)

    await goTo('Settings')
    await userEvent.click(screen.getByRole('button', { name: 'Español' }))

    expect(screen.getAllByRole('link', { name: 'Ajustes' })).toHaveLength(2)
    expect(screen.getByRole('heading', { name: 'Idioma' })).toBeInTheDocument()
    expect(html.lang).toBe('es')
    await waitFor(() => {
      expect(fake.data.preferences.locale).toBe('es')
    })
  })

  it('switches back to English from the Spanish labels', async () => {
    const fake = await boot({ preferences: { locale: 'es' } })
    usePreferencesStore.setState({ preferences: { locale: 'es', theme: 'light' } })
    render(<App />)

    await goTo('Ajustes')
    await userEvent.click(screen.getByRole('button', { name: 'English' }))

    expect(screen.getAllByRole('link', { name: 'Settings' })).toHaveLength(2)
    expect(html.lang).toBe('en-US')
    await waitFor(() => {
      expect(fake.data.preferences.locale).toBe('en')
    })
  })

  it('marks the active language as the pressed one', async () => {
    await boot()
    render(<App />)

    await goTo('Settings')

    expect(screen.getByRole('button', { name: 'English', pressed: true })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Español', pressed: false })).toBeVisible()
  })

  it('turns the lights out and writes that down too', async () => {
    const fake = await boot()
    render(<App />)

    await goTo('Settings')
    await userEvent.click(screen.getByRole('button', { name: 'Dark' }))

    expect(html.classList.contains('dark')).toBe(true)
    expect(screen.getByRole('button', { name: 'Dark', pressed: true })).toBeVisible()
    await waitFor(() => {
      expect(fake.data.preferences.theme).toBe('dark')
    })
  })

  it('turns them back on again', async () => {
    const fake = await boot({ preferences: { theme: 'dark' } })
    usePreferencesStore.setState({ preferences: { locale: 'en', theme: 'dark' } })
    render(<App />)

    await goTo('Settings')
    await userEvent.click(screen.getByRole('button', { name: 'Light' }))

    expect(html.classList.contains('dark')).toBe(false)
    await waitFor(() => {
      expect(fake.data.preferences.theme).toBe('light')
    })
  })

  /**
   * Two controls, one persisted pair. Changing the language must not quietly
   * put the theme back to whatever it was detected as.
   */
  it('keeps the theme when the language moves', async () => {
    const fake = await boot()
    render(<App />)

    await goTo('Settings')
    await userEvent.click(screen.getByRole('button', { name: 'Dark' }))
    await userEvent.click(screen.getByRole('button', { name: 'Español' }))

    expect(html.classList.contains('dark')).toBe(true)
    expect(screen.getByRole('button', { name: 'Oscuro', pressed: true })).toBeVisible()
    await waitFor(() => {
      expect(fake.data.preferences).toEqual({ locale: 'es', theme: 'dark' })
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
