import type { Difficulty } from '../../types/models'

/**
 * The difficulty -> XP lookup. Single source of truth for completion rewards:
 * no call site may inline these numbers, so rebalancing is a one-line edit.
 *
 * Values are frozen into literal types on purpose — an accidental write to the
 * table becomes a compile error rather than a live game-balance change.
 */
export const XP_BY_DIFFICULTY = {
  easy: 10,
  normal: 20,
  hard: 30,
} as const satisfies Record<Difficulty, number>

/** Base XP granted by completing a habit of the given difficulty. */
export function xpRewardFor(difficulty: Difficulty): number {
  return XP_BY_DIFFICULTY[difficulty]
}
