import { useCallback, useEffect } from 'react'
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
  const reaction = useUiStore((state) => state.reaction)
  const prefersReducedMotion = useReducedMotion() ?? false

  const endReaction = useCallback((nonce: number) => {
    const current = useUiStore.getState().reaction

    if (current !== null && current.nonce === nonce) {
      useUiStore.getState().clearReaction()
    }
  }, [])

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
