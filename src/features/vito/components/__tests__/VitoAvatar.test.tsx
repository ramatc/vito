import { act, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { EvolutionStage } from '../../../../domain/vito/evolution'
import { usePreferencesStore } from '../../../../stores/preferencesStore'
import { useUiStore } from '../../../../stores/uiStore'
import { VitoAvatar } from '../VitoAvatar'

/**
 * Fix 2 (WARNING, judgment-day review): `controls.start(...)` had no
 * `.catch()`. A rejection was an unhandled promise rejection with zero
 * observability, and a synchronous throw would have escaped the effect and
 * hit the app-wide `ErrorBoundary` — blanking the whole app over a purely
 * cosmetic animation failure. `useAnimationControls` is mocked here because
 * that is the only seam that can make `start()` fail on demand.
 */

const startMock = vi.hoisted(() =>
  vi.fn<(...args: unknown[]) => Promise<void>>(() => Promise.resolve()),
)

vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>()

  return {
    ...actual,
    // Only `start` is swapped for a controllable mock; the rest of the real
    // `AnimationControls` object (subscribe, mount, ...) is kept intact so
    // `<motion.div animate={controls}>` still wires up correctly.
    useAnimationControls: () => {
      const controls = actual.useAnimationControls()
      controls.start = startMock

      return controls
    },
  }
})

describe('VitoAvatar — animation failure handling', () => {
  beforeEach(() => {
    useUiStore.setState({ reaction: null })
    startMock.mockReset()
    startMock.mockResolvedValueOnce(undefined) // the initial idle-loop call on mount
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('clears the reaction and logs, without throwing, when controls.start rejects', async () => {
    startMock.mockRejectedValueOnce(new Error('animation rejected'))
    render(<VitoAvatar stage={1} mood="content" />)

    act(() => {
      useUiStore.getState().emitReaction('celebrate')
    })

    await waitFor(() => {
      expect(useUiStore.getState().reaction).toBeNull()
    })
    expect(console.error).toHaveBeenCalled()
    // The component is still alive — the app-wide ErrorBoundary never fired.
    expect(screen.getByRole('img', { name: /Vito/ })).toBeInTheDocument()
  })

  it('clears the reaction and logs, without throwing, when controls.start throws synchronously', async () => {
    startMock.mockImplementationOnce(() => {
      throw new Error('animation threw synchronously')
    })
    render(<VitoAvatar stage={1} mood="content" />)

    act(() => {
      useUiStore.getState().emitReaction('celebrate')
    })

    await waitFor(() => {
      expect(useUiStore.getState().reaction).toBeNull()
    })
    expect(console.error).toHaveBeenCalled()
    expect(screen.getByRole('img', { name: /Vito/ })).toBeInTheDocument()
  })
})

/**
 * The stage description is the only word this component chooses for itself.
 *
 * The mood half of the same accessible name comes from `copy/moodMessages.ts`,
 * which this change leaves in English on purpose — so the label is expected to
 * be mixed, and what is asserted here is strictly the segment the dictionary now
 * owns. All four stages are driven directly rather than through an XP total,
 * because a lookup that happened to resolve stage 1 and nothing else would pass
 * every test that only ever boots a fresh profile.
 */
describe('VitoAvatar — the stage description in the active language', () => {
  const STAGES: readonly { stage: EvolutionStage; en: string; es: string }[] = [
    { stage: 1, en: 'a small sprout', es: 'un brote pequeño' },
    { stage: 2, en: 'a growing sprout', es: 'un brote que crece' },
    { stage: 3, en: 'a leafy companion', es: 'un compañero frondoso' },
    { stage: 4, en: 'a fully grown companion', es: 'un compañero ya crecido' },
  ]

  beforeEach(() => {
    useUiStore.setState({ reaction: null })
    usePreferencesStore.setState({ preferences: { locale: 'en', theme: 'light' } })
    startMock.mockReset()
    startMock.mockResolvedValue(undefined)
  })

  it.each(STAGES)('describes stage $stage in English', ({ stage, en }) => {
    render(<VitoAvatar stage={stage} mood="content" />)

    expect(
      screen.getByRole('img', { name: new RegExp(`^Vito, ${en},`) }),
    ).toBeInTheDocument()
  })

  it.each(STAGES)('describes stage $stage in Spanish', ({ stage, es }) => {
    usePreferencesStore.setState({ preferences: { locale: 'es', theme: 'light' } })

    render(<VitoAvatar stage={stage} mood="content" />)

    expect(
      screen.getByRole('img', { name: new RegExp(`^Vito, ${es},`) }),
    ).toBeInTheDocument()
  })
})
