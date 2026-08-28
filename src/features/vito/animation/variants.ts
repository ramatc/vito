import type { TargetAndTransition } from 'framer-motion'
import type { Mood } from '../../../domain/vito/mood'
import type { ReactionType } from '../../../stores/uiStore'

/**
 * Every motion config in the app, in one file (design §8).
 *
 * No component defines an inline animation, and no store or domain module ever
 * imports framer-motion. `ReactionType` is imported rather than restated: the
 * reaction names are the store's contract, and a second copy of that union
 * would drift the first time one of them is renamed.
 */

/**
 * What the avatar can be doing.
 *
 * The five `ReactionType` values are transient — something happened, Vito
 * reacts, Vito goes back to what he was doing. `idle`, `resting` and `cheer`
 * are the loops he goes back TO, chosen from mood rather than from an event,
 * which is why they are not reactions and do not live in the store's union.
 */
export type VitoIdleState = 'idle' | 'resting' | 'cheer'
export type VitoAnimationState = ReactionType | VitoIdleState

/**
 * Typed as plain targets rather than as `Variants` so they can be handed
 * straight to `controls.start(...)`. A label-based `variants` map would need
 * the label to change to replay, and two identical consecutive reactions have
 * the same label by definition — the nonce lives in the hook for exactly that
 * reason, and passing the target directly keeps the replay honest.
 */
export const vitoVariants: Record<VitoAnimationState, TargetAndTransition> = {
  /** Default: a slow, barely-there breath so Vito never looks frozen. */
  idle: {
    y: [0, -6, 0],
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' },
  },

  /** Quiet stretch: slower and smaller, a nap rather than a flatline. */
  resting: {
    y: [0, -2, 0],
    scale: [1, 1.02, 1],
    rotate: 0,
    opacity: 1,
    transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
  },

  /** Today's list is finished: a livelier loop that keeps running. */
  cheer: {
    y: [0, -12, 0],
    scale: [1, 1.04, 1],
    rotate: [0, 3, -3, 0],
    opacity: 1,
    transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' },
  },

  /** One habit done. */
  celebrate: {
    y: [0, -18, 0],
    scale: [1, 1.12, 1],
    rotate: [0, -6, 6, 0],
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },

  /** A level boundary was crossed: the biggest move Vito makes. */
  levelUp: {
    y: [0, -30, 0, -12, 0],
    scale: [1, 1.25, 1.05, 1],
    rotate: [0, -8, 8, 0],
    opacity: 1,
    transition: { duration: 1.1, ease: 'easeOut' },
  },

  /** Something new landed in the closet: a curious wobble, not a jump. */
  unlock: {
    y: [0, -8, 0],
    scale: [1, 1.14, 1],
    rotate: [0, 12, -12, 0],
    opacity: 1,
    transition: { duration: 0.9, ease: 'easeOut' },
  },

  /** Coming back after a rest: stretch up into the day. */
  wake: {
    y: [6, -8, 0],
    scale: [0.94, 1.08, 1],
    rotate: 0,
    opacity: 1,
    transition: { duration: 0.9, ease: 'easeOut' },
  },
}

/**
 * The reduced-motion set: opacity only, no transforms, no loops.
 *
 * Non-negotiable for accessibility (design §8), and deliberately not empty —
 * someone who asked for less motion still gets to see that something happened,
 * they just do not get bounced at. Every entry resets the transform properties
 * so switching sets mid-session cannot strand the avatar mid-bounce.
 */
const still: TargetAndTransition = {
  y: 0,
  scale: 1,
  rotate: 0,
  opacity: 1,
  transition: { duration: 0 },
}

const blink: TargetAndTransition = {
  y: 0,
  scale: 1,
  rotate: 0,
  opacity: [1, 0.55, 1],
  transition: { duration: 0.5, ease: 'easeInOut' },
}

export const reducedVitoVariants: Record<VitoAnimationState, TargetAndTransition> = {
  idle: still,
  resting: { ...still, opacity: 0.85 },
  cheer: still,
  celebrate: blink,
  levelUp: blink,
  unlock: blink,
  wake: blink,
}

/**
 * The loop Vito falls back to when no reaction is playing.
 *
 * Mood is a domain value; which loop it maps to is a presentation choice, so
 * the mapping lives here next to the loops themselves. Note that the quiet
 * moods get a slower breath, never a stop: there is no state in this function
 * that stands still.
 */
export function idleStateFor(input: { mood: Mood; allDone: boolean }): VitoIdleState {
  if (input.allDone) {
    return 'cheer'
  }

  if (input.mood === 'resting' || input.mood === 'sleepy') {
    return 'resting'
  }

  return 'idle'
}
