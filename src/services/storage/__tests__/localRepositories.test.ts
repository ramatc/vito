import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MOMENTUM } from '../../../domain/progression/momentum'
import type { Habit, HabitCompletion } from '../../../types/models'
import {
  createDefaultPreferences,
  createDefaultUserProgress,
  createDefaultVitoState,
} from '../defaults'
import {
  SCHEMA_VERSION,
  STORAGE_KEYS,
  setStorageErrorHandler,
} from '../localStorageClient'
import { createRepositories } from '../repositories'

/**
 * These tests exist for the failure paths. A repository that throws on corrupt
 * saved data or on a full disk takes the whole app down, so the contract is
 * that every read falls back to a sane default and every write fails quietly
 * while reporting itself.
 */

function habit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'habit-1',
    name: 'Read',
    icon: 'book',
    category: 'Mind',
    frequency: { type: 'daily' },
    difficulty: 'normal',
    createdAt: '2026-01-01T08:00:00.000Z',
    ...overrides,
  }
}

function completion(overrides: Partial<HabitCompletion> = {}): HabitCompletion {
  return {
    id: 'completion-1',
    habitId: 'habit-1',
    date: '2026-01-01',
    xpAwarded: 20,
    completedAt: '2026-01-01T08:30:00.000Z',
    ...overrides,
  }
}

function failures() {
  const collected: { operation: string; key: string }[] = []

  setStorageErrorHandler((failure) => {
    collected.push({ operation: failure.operation, key: failure.key })
  })

  return collected
}

/**
 * Preference detection reads two browser facts, and jsdom supplies neither
 * usefully: `navigator.language` is pinned to `en-US`, and `matchMedia` does not
 * exist at all. Both are stubbed as own properties so deleting them afterwards
 * restores the real prototype getter rather than leaving a fake behind.
 */
function browserSpeaks(language: string): void {
  Object.defineProperty(navigator, 'language', { value: language, configurable: true })
}

function osPrefersDark(dark: boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string) => ({
      matches: dark && query.includes('prefers-color-scheme: dark'),
    }),
  })
}

beforeEach(() => {
  setStorageErrorHandler(null)
  vi.restoreAllMocks()
})

afterEach(() => {
  Reflect.deleteProperty(navigator, 'language')
  Reflect.deleteProperty(window, 'matchMedia')
})

describe('habit repository', () => {
  it('round-trips created habits through localStorage', async () => {
    const repos = createRepositories()
    await repos.habits.create(habit({ id: 'a', name: 'Read' }))
    await repos.habits.create(habit({ id: 'b', name: 'Run' }))

    const stored = await createRepositories().habits.getAll()

    expect(stored.map((entry) => entry.name)).toEqual(['Read', 'Run'])
  })

  it('applies a patch without letting the caller change the identity', async () => {
    const repos = createRepositories()
    await repos.habits.create(habit({ id: 'a', name: 'Read', difficulty: 'easy' }))

    await repos.habits.update('a', {
      name: 'Read more',
      difficulty: 'hard',
      id: 'hacked',
    })
    const [updated] = await repos.habits.getAll()

    expect(updated).toMatchObject({ id: 'a', name: 'Read more', difficulty: 'hard' })
  })

  it('stamps archivedAt instead of deleting the habit', async () => {
    const repos = createRepositories()
    await repos.habits.create(habit({ id: 'a' }))

    await repos.habits.archive('a', '2026-03-04T10:00:00.000Z')
    const stored = await repos.habits.getAll()

    expect(stored).toHaveLength(1)
    expect(stored[0].archivedAt).toBe('2026-03-04T10:00:00.000Z')
  })

  it('falls back to an empty list when the stored habits are corrupt JSON', async () => {
    const reported = failures()
    localStorage.setItem(STORAGE_KEYS.habits, '{ this is not json')

    await expect(createRepositories().habits.getAll()).resolves.toEqual([])
    expect(reported).toContainEqual({ operation: 'read', key: STORAGE_KEYS.habits })
  })

  it('falls back to an empty list when the stored habits are valid JSON of the wrong shape', async () => {
    localStorage.setItem(STORAGE_KEYS.habits, '{"habits":"all of them"}')

    await expect(createRepositories().habits.getAll()).resolves.toEqual([])
  })
})

describe('completion repository', () => {
  it('filters completions by exact date', async () => {
    const repos = createRepositories()
    await repos.completions.add(completion({ id: 'c1', date: '2026-01-01' }))
    await repos.completions.add(completion({ id: 'c2', date: '2026-01-02' }))

    const onDay = await repos.completions.listByDate('2026-01-02')

    expect(onDay.map((entry) => entry.id)).toEqual(['c2'])
  })

  it('returns an inclusive range and excludes days outside it', async () => {
    const repos = createRepositories()
    await repos.completions.add(completion({ id: 'c1', date: '2026-01-01' }))
    await repos.completions.add(completion({ id: 'c2', date: '2026-01-03' }))
    await repos.completions.add(completion({ id: 'c3', date: '2026-01-05' }))

    const range = await repos.completions.listRange('2026-01-01', '2026-01-03')

    expect(range.map((entry) => entry.id)).toEqual(['c1', 'c2'])
  })

  it('removes only the completion for that habit on that day', async () => {
    const repos = createRepositories()
    await repos.completions.add(
      completion({ id: 'c1', habitId: 'a', date: '2026-01-01' }),
    )
    await repos.completions.add(
      completion({ id: 'c2', habitId: 'b', date: '2026-01-01' }),
    )
    await repos.completions.add(
      completion({ id: 'c3', habitId: 'a', date: '2026-01-02' }),
    )

    await repos.completions.removeByHabitAndDate('a', '2026-01-01')
    const remaining = await repos.completions.listRange('2026-01-01', '2026-01-02')

    expect(remaining.map((entry) => entry.id)).toEqual(['c2', 'c3'])
  })
})

describe('progress repository', () => {
  it('round-trips a saved progress record', async () => {
    const repos = createRepositories()
    const saved = { ...createDefaultUserProgress(), totalXp: 340, currentStreak: 4 }

    await repos.progress.save(saved)

    await expect(createRepositories().progress.get()).resolves.toEqual(saved)
  })

  it('falls back to first-run defaults when the stored progress is corrupt JSON', async () => {
    const reported = failures()
    localStorage.setItem(STORAGE_KEYS.progress, 'null and void')

    const progress = await createRepositories().progress.get()

    expect(progress.totalXp).toBe(0)
    expect(progress.momentum).toBe(MOMENTUM.START)
    expect(progress.activeBoost).toBeNull()
    expect(reported).toContainEqual({ operation: 'read', key: STORAGE_KEYS.progress })
  })

  it('fills missing fields from the defaults so an older save stays usable', async () => {
    localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify({ totalXp: 500 }))

    const progress = await createRepositories().progress.get()

    expect(progress.totalXp).toBe(500)
    expect(progress.momentum).toBe(MOMENTUM.START)
    expect(progress.lastRolloverDate).toBeNull()
  })

  it('rejects a stored array and returns defaults, since progress is an object', async () => {
    localStorage.setItem(STORAGE_KEYS.progress, '[]')

    await expect(createRepositories().progress.get()).resolves.toEqual(
      createDefaultUserProgress(),
    )
  })
})

describe('vito repository', () => {
  it('round-trips equipped items and unlocks', async () => {
    const repos = createRepositories()
    const saved = {
      equippedItems: { hat: 'hat-sprout' },
      unlockedItemIds: ['hat-sprout'],
    }

    await repos.vito.save(saved)

    await expect(createRepositories().vito.get()).resolves.toEqual(saved)
  })

  it('falls back to nothing equipped when the stored state is corrupt JSON', async () => {
    localStorage.setItem(STORAGE_KEYS.vito, '<<<')

    await expect(createRepositories().vito.get()).resolves.toEqual(
      createDefaultVitoState(),
    )
  })
})

/**
 * Detection runs exactly once, on a profile that has never saved a preference.
 * Everything after that comes from storage, which is what makes a manual
 * override survive a reload — see the "not re-detected" case below.
 */
describe('createDefaultPreferences', () => {
  it('starts in Spanish when the browser reports a Spanish locale', () => {
    browserSpeaks('es-AR')

    expect(createDefaultPreferences().locale).toBe('es')
  })

  it('starts in Spanish for a bare `es`, not only for a regional variant', () => {
    browserSpeaks('es')

    expect(createDefaultPreferences().locale).toBe('es')
  })

  it('is not fooled by casing, which browsers do vary', () => {
    browserSpeaks('ES-AR')

    expect(createDefaultPreferences().locale).toBe('es')
  })

  it('starts in English for an English regional variant', () => {
    browserSpeaks('en-GB')

    expect(createDefaultPreferences().locale).toBe('en')
  })

  it('falls back to English for a language the app does not ship', () => {
    browserSpeaks('fr-FR')

    expect(createDefaultPreferences().locale).toBe('en')
  })

  it('starts dark when the OS asks for dark', () => {
    osPrefersDark(true)

    expect(createDefaultPreferences().theme).toBe('dark')
  })

  it('starts light when the OS asks for light', () => {
    osPrefersDark(false)

    expect(createDefaultPreferences().theme).toBe('light')
  })

  /**
   * The guard that matters most in this file: jsdom implements no `matchMedia`,
   * so an unguarded call here would not fail one assertion — it would throw out
   * of every store that reads first-run defaults at module scope.
   */
  it('starts light instead of throwing where matchMedia does not exist', () => {
    expect(window.matchMedia).toBeUndefined()
    expect(createDefaultPreferences()).toEqual({ locale: 'en', theme: 'light' })
  })
})

describe('preferences repository', () => {
  it('round-trips a saved language and theme', async () => {
    const repos = createRepositories()

    await repos.preferences.save({ locale: 'es', theme: 'dark' })

    await expect(createRepositories().preferences.get()).resolves.toEqual({
      locale: 'es',
      theme: 'dark',
    })
  })

  it('detects from the browser on a first run, when nothing has been saved', async () => {
    browserSpeaks('es-AR')

    await expect(createRepositories().preferences.get()).resolves.toEqual({
      locale: 'es',
      theme: 'light',
    })
  })

  it('does not re-detect once a choice has been saved', async () => {
    const repos = createRepositories()
    await repos.preferences.save({ locale: 'en', theme: 'dark' })

    // The browser now disagrees with the saved choice. The saved choice wins.
    browserSpeaks('es-AR')
    osPrefersDark(false)

    await expect(createRepositories().preferences.get()).resolves.toEqual({
      locale: 'en',
      theme: 'dark',
    })
  })

  it('falls back to the detected defaults when the stored value is corrupt JSON', async () => {
    const reported = failures()
    localStorage.setItem(STORAGE_KEYS.preferences, '{ half written')

    await expect(createRepositories().preferences.get()).resolves.toEqual({
      locale: 'en',
      theme: 'light',
    })
    expect(reported).toContainEqual({
      operation: 'read',
      key: STORAGE_KEYS.preferences,
    })
  })

  it('keeps the usable field when only the language is unrecognised', async () => {
    localStorage.setItem(
      STORAGE_KEYS.preferences,
      JSON.stringify({ locale: 'fr', theme: 'dark' }),
    )

    await expect(createRepositories().preferences.get()).resolves.toEqual({
      locale: 'en',
      theme: 'dark',
    })
  })

  it('keeps the usable field when only the theme is unrecognised', async () => {
    localStorage.setItem(
      STORAGE_KEYS.preferences,
      JSON.stringify({ locale: 'es', theme: 'neon' }),
    )

    await expect(createRepositories().preferences.get()).resolves.toEqual({
      locale: 'es',
      theme: 'light',
    })
  })

  it('rejects a stored array and returns defaults, since preferences are an object', async () => {
    localStorage.setItem(STORAGE_KEYS.preferences, '[]')

    await expect(createRepositories().preferences.get()).resolves.toEqual(
      createDefaultPreferences(),
    )
  })
})

describe('write failures', () => {
  it('does not reject when localStorage is out of quota', async () => {
    const reported = failures()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('exceeded the quota', 'QuotaExceededError')
    })

    await expect(createRepositories().habits.create(habit())).resolves.toBeUndefined()
    expect(reported).toContainEqual({ operation: 'write', key: STORAGE_KEYS.habits })
  })

  it('leaves the previously stored value readable after a failed write', async () => {
    const repos = createRepositories()
    await repos.habits.create(habit({ id: 'a', name: 'Read' }))

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('exceeded the quota', 'QuotaExceededError')
    })
    await repos.habits.create(habit({ id: 'b', name: 'Run' }))
    vi.restoreAllMocks()

    const stored = await createRepositories().habits.getAll()

    expect(stored.map((entry) => entry.name)).toEqual(['Read'])
  })
})

describe('resetAll', () => {
  it('clears every data key the app owns', async () => {
    const repos = createRepositories()
    await repos.habits.create(habit())
    await repos.completions.add(completion())
    await repos.progress.save({ ...createDefaultUserProgress(), totalXp: 900 })
    await repos.vito.save({
      equippedItems: { hat: 'hat-sprout' },
      unlockedItemIds: ['hat-sprout'],
    })

    // Everything except the schema marker, which is metadata about the build
    // rather than user data, and the preferences, which are chrome rather than
    // progress. Both outlive a reset; the preferences case is pinned below.
    const dataKeys = Object.values(STORAGE_KEYS).filter(
      (key) => key !== STORAGE_KEYS.schema && key !== STORAGE_KEYS.preferences,
    )
    expect(dataKeys.filter((key) => localStorage.getItem(key) !== null)).toEqual(dataKeys)

    await repos.resetAll()

    expect(dataKeys.filter((key) => localStorage.getItem(key) !== null)).toEqual([])
  })

  it('keeps the schema marker current so the next load is not seen as first run', async () => {
    const repos = createRepositories()
    await repos.habits.create(habit())

    await repos.resetAll()

    expect(localStorage.getItem(STORAGE_KEYS.schema)).toBe(String(SCHEMA_VERSION))
  })

  it('leaves unrelated keys from other apps alone', async () => {
    localStorage.setItem('someone-elses-key', 'keep me')
    const repos = createRepositories()
    await repos.habits.create(habit())

    await repos.resetAll()

    expect(localStorage.getItem('someone-elses-key')).toBe('keep me')
  })

  /**
   * Starting over puts Vito back at day one. It does not put the app back into
   * a language the user does not read, or into a theme that hurts to look at —
   * neither is progress, and neither is what the button offered to clear.
   */
  it('keeps the saved language and theme, which are chrome rather than progress', async () => {
    const repos = createRepositories()
    await repos.preferences.save({ locale: 'es', theme: 'dark' })
    await repos.habits.create(habit())

    await repos.resetAll()

    await expect(repos.preferences.get()).resolves.toEqual({
      locale: 'es',
      theme: 'dark',
    })
    await expect(repos.habits.getAll()).resolves.toEqual([])
  })

  it('leaves the preferences key itself in storage, not merely its values', async () => {
    const repos = createRepositories()
    await repos.preferences.save({ locale: 'es', theme: 'dark' })

    await repos.resetAll()

    expect(localStorage.getItem(STORAGE_KEYS.preferences)).not.toBeNull()
  })

  it('returns first-run defaults after a reset', async () => {
    const repos = createRepositories()
    await repos.progress.save({ ...createDefaultUserProgress(), totalXp: 900 })

    await repos.resetAll()

    await expect(repos.progress.get()).resolves.toEqual(createDefaultUserProgress())
    await expect(repos.habits.getAll()).resolves.toEqual([])
  })
})

describe('schema version marker', () => {
  it('stamps the current schema version on first run', () => {
    createRepositories()

    expect(localStorage.getItem(STORAGE_KEYS.schema)).toBe(String(SCHEMA_VERSION))
  })

  it('discards data written by an incompatible schema version', async () => {
    const reported = failures()
    localStorage.setItem(STORAGE_KEYS.schema, String(SCHEMA_VERSION + 1))
    localStorage.setItem(STORAGE_KEYS.habits, JSON.stringify([habit()]))

    const repos = createRepositories()

    await expect(repos.habits.getAll()).resolves.toEqual([])
    expect(localStorage.getItem(STORAGE_KEYS.schema)).toBe(String(SCHEMA_VERSION))
    expect(reported).toContainEqual({ operation: 'schema', key: STORAGE_KEYS.schema })
  })

  it('keeps data written by the matching schema version', async () => {
    localStorage.setItem(STORAGE_KEYS.schema, String(SCHEMA_VERSION))
    localStorage.setItem(
      STORAGE_KEYS.habits,
      JSON.stringify([habit({ name: 'Survivor' })]),
    )

    const stored = await createRepositories().habits.getAll()

    expect(stored.map((entry) => entry.name)).toEqual(['Survivor'])
  })
})
