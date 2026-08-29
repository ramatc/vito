import { useCallback, useEffect, useLayoutEffect } from 'react'
import { useReducedMotion } from 'framer-motion'
import type { Reaction } from '../stores/uiStore'
import { useUiStore } from '../stores/uiStore'

/**
 * The bridge between "something happened" and "Vito moves".
 *
 * `uiStore` is a broadcast channel: `useCompleteHabit` emits a reaction, this
 * hook picks it up wherever the avatar happens to be mounted, and the avatar
 * decides what that looks like. No prop drilling, no callback handed down
 * through three components, and the game engine still knows nothing about
 * animation.
 *
 * The nonce is the whole reason `uiStore.reaction` is an object rather than a
 * string: two `celebrate`s in a row would otherwise be reference-equal state and
 * the second one would silently never play. Every release below is keyed on it.
 *
 * There is deliberately no local copy of the reaction. The store IS the state;
 * mirroring it here would mean a `setState` inside an effect, an extra render,
 * and two places that can disagree about what is playing.
 */

/**
 * Longest a reaction may stay latched before the avatar returns to its idle
 * loop, whatever the animation did.
 *
 * The consumer normally releases it when the animation resolves. This is the
 * safety net for the cases where it cannot — reduced motion, a hidden tab, an
 * animation cancelled mid-flight — because the failure mode without it is a
 * companion frozen on one frame forever, which is exactly the "never renders
 * dead" rule the product is built around.
 */
export const REACTION_TIMEOUT_MS = 2500

/**
 * How old a reaction can be and still be considered "just happened".
 *
 * `uiStore.reaction` is a broadcast channel with no consumer on `/habits` —
 * completing a habit there latches a reaction with nothing mounted to clear
 * it. If the user then navigates to Home, a fresh `VitoAvatar` would
 * otherwise pick up that stale reaction and play a desynced animation for an
 * event that may have happened minutes ago. Same order of magnitude as
 * `REACTION_TIMEOUT_MS`: anything older than this predates the current mount
 * and is discarded rather than replayed out of context.
 */
export const REACTION_STALE_MS = 3000

export interface VitoReaction {
  /** The reaction playing right now, or `null` while Vito is just idling. */
  reaction: Reaction | null
  /** True when the user has asked the OS for less motion. */
  prefersReducedMotion: boolean
  /**
   * Releases the reaction once it has been played. Takes the nonce it is
   * releasing so a slow animation cannot cancel the reaction that replaced it.
   */
  endReaction(nonce: number): void
}

export function useVitoReaction(): VitoReaction {
  const storeReaction = useUiStore((state) => state.reaction)
  const prefersReducedMotion = useReducedMotion() ?? false

  const endReaction = useCallback((nonce: number) => {
    const current = useUiStore.getState().reaction

    if (current !== null && current.nonce === nonce) {
      useUiStore.getState().clearReaction()
    }
  }, [])

  // Discards a reaction that is too old to be "still current" instead of
  // replaying it out of context — synchronously before paint, not in a plain
  // effect, or the caller below would render the stale reaction for one
  // frame. `Date.now()` cannot be called during render (React purity), so
  // the check lives here; it clears the *store*, not local component state,
  // so it does not reintroduce the mirrored-state pattern this hook
  // deliberately avoids (see module doc above).
  useLayoutEffect(() => {
    if (
      storeReaction !== null &&
      Date.now() - storeReaction.emittedAt > REACTION_STALE_MS
    ) {
      endReaction(storeReaction.nonce)
    }
  }, [storeReaction, endReaction])

  const reaction = storeReaction

  useEffect(() => {
    if (reaction === null) {
      return
    }

    const { nonce } = reaction
    const timer = window.setTimeout(() => {
      endReaction(nonce)
    }, REACTION_TIMEOUT_MS)

    return () => {
      window.clearTimeout(timer)
    }
  }, [reaction, endReaction])

  return { reaction, prefersReducedMotion, endReaction }
}
