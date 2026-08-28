/**
 * Vito's visual growth, derived from level and never stored.
 *
 * Persisting the stage would create a second source of truth: retuning the
 * brackets below would leave every existing save on a stale sprite until
 * someone wrote a migration. Deriving it means a rebalance applies instantly.
 */
export type EvolutionStage = 1 | 2 | 3 | 4

export const EVOLUTION_BRACKETS = [
  { stage: 1, minLevel: 1, key: 'base' },
  { stage: 2, minLevel: 4, key: 'growing' },
  { stage: 3, minLevel: 8, key: 'evolved' },
  { stage: 4, minLevel: 13, key: 'advanced' },
] as const

/**
 * The last bracket whose entry level has been reached.
 *
 * Total by construction: the first bracket starts at level 1 and is the
 * fallback, so a level of 0 or below still resolves to stage 1 rather than to
 * an undefined sprite.
 */
export function getEvolutionStage(level: number): EvolutionStage {
  let stage: EvolutionStage = EVOLUTION_BRACKETS[0].stage

  for (const bracket of EVOLUTION_BRACKETS) {
    if (level >= bracket.minLevel) {
      stage = bracket.stage
    }
  }

  return stage
}
