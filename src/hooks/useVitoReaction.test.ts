import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useUiStore } from '../stores/uiStore'
import {
  REACTION_STALE_MS,
  REACTION_TIMEOUT_MS,
  useVitoReaction,
} from './useVitoReaction'

/**
 * `useVitoReaction` is the state machine behind "Vito reacts": it releases a
 * reaction on the nonce that emitted it, runs a safety-net timer for whatever
 * cannot resolve it itself, and — since Deviation "Fix 1" — discards a
 * reaction old enough to predate the current mount instead of replaying it
 * out of context. None of that was under test before this file.
 */

beforeEach(() => {
  useUiStore.setState({ reaction: null })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useVitoReaction — nonce-guarded release', () => {
  it('ignores endReaction for a nonce that has already been replaced', () => {
    const { result } = renderHook(() => useVitoReaction())

    act(() => {
      useUiStore.getState().emitReaction('celebrate')
    })
    const staleNonce = result.current.reaction!.nonce

    act(() => {
      useUiStore.getState().emitReaction('levelUp')
    })

    act(() => {
      result.current.endReaction(staleNonce)
    })

    expect(useUiStore.getState().reaction?.type).toBe('levelUp')
  })
})

describe('useVitoReaction — the 2500ms safety net', () => {
  it('clears the reaction once the timeout elapses', () => {
    vi.useFakeTimers()
    renderHook(() => useVitoReaction())

    act(() => {
      useUiStore.getState().emitReaction('celebrate')
    })
    act(() => {
      vi.advanceTimersByTime(REACTION_TIMEOUT_MS)
    })

    expect(useUiStore.getState().reaction).toBeNull()
  })

  it('does not let the old timer clobber a reaction that replaced it mid-timeout', () => {
    vi.useFakeTimers()
    renderHook(() => useVitoReaction())

    act(() => {
      useUiStore.getState().emitReaction('celebrate')
    })
    act(() => {
      vi.advanceTimersByTime(REACTION_TIMEOUT_MS - 500)
    })
    act(() => {
      useUiStore.getState().emitReaction('levelUp')
    })
    // If the first reaction's timer were not cleaned up, it would fire here.
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(useUiStore.getState().reaction?.type).toBe('levelUp')
  })
})

describe('useVitoReaction — stale-reaction discard', () => {
  it('discards a reaction emitted long before mount, without ever exposing it', () => {
    vi.useFakeTimers()

    act(() => {
      useUiStore.getState().emitReaction('celebrate')
    })
    act(() => {
      vi.advanceTimersByTime(REACTION_STALE_MS + 1)
    })

    const { result } = renderHook(() => useVitoReaction())

    expect(result.current.reaction).toBeNull()
    expect(useUiStore.getState().reaction).toBeNull()
  })

  it('still exposes and plays a fresh reaction normally', () => {
    const { result } = renderHook(() => useVitoReaction())

    act(() => {
      useUiStore.getState().emitReaction('celebrate')
    })

    expect(result.current.reaction?.type).toBe('celebrate')
  })
})
