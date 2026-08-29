import { act, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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
